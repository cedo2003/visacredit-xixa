<?php

namespace App\Service;

use App\Entity\ApplicationPartenaire;
use App\Entity\User;
use App\Exception\BusinessException;
use App\Repository\ApplicationPartenaireRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\RateLimiter\RateLimiterFactory;

/**
 * Accès des applications partenaires à l'API.
 *
 * Le principe : le partenaire ne reçoit jamais d'accès global. Il s'authentifie
 * auprès de `/api/partenaires/*` avec son identifiant et son secret, et obtient
 * en échange un JWT **au nom d'une boutique qui lui est liée** — le même jeton
 * que nos propres applications, valable sur toutes les routes `/api`. Le
 * partenaire voit donc exactement ce que verrait la boutique, ni plus ni moins,
 * et le reste de l'API n'a pas à savoir qui l'appelle.
 *
 * Ce jeton porte en plus la revendication `partenaire` : JwtPartenaireListener
 * s'en sert pour le refuser dès que l'application est désactivée ou que la
 * boutique lui retire l'accès, sans attendre son expiration.
 */
class AccesPartenaireService
{
    /** Revendication du JWT qui désigne l'application émettrice. */
    public const REVENDICATION = 'partenaire';

    public function __construct(
        private readonly ApplicationPartenaireRepository $applications,
        private readonly JWTTokenManagerInterface $jwt,
        private readonly RateLimiterFactory $partenaireAppelsLimiter,
        private readonly LoggerInterface $logger,
        #[Autowire('%lexik_jwt_authentication.token_ttl%')] private readonly int $dureeJeton,
    ) {
    }

    /**
     * Identifie l'application d'après l'en-tête `Authorization: Basic`, à la
     * manière de l'authentification client d'OAuth 2.
     *
     * @throws BusinessException 401 si l'application est inconnue, inactive ou
     *                           le secret faux — sans dire lequel des trois
     */
    public function authentifier(Request $request): ApplicationPartenaire
    {
        $clientId = (string) $request->getUser();
        $secret = (string) $request->getPassword();

        if ('' === $clientId || '' === $secret) {
            throw new BusinessException('Identifiants de l\'application partenaire manquants.', 401);
        }

        $application = $this->applications->findByClientId($clientId);

        if (!$application || !$application->isActif() || !$application->secretValide($secret)) {
            $this->logger->warning('Authentification partenaire refusée', ['client_id' => $clientId]);

            throw new BusinessException('Identifiants de l\'application partenaire invalides.', 401);
        }

        $this->limiter($this->partenaireAppelsLimiter, $application->getClientId());

        $application->marquerUtilisation();

        return $application;
    }

    /**
     * JWT au nom de la boutique, pour l'application qui le demande.
     *
     * @return array{token: string, expires_in: int}
     */
    public function jeton(ApplicationPartenaire $application, User $user): array
    {
        return [
            'token' => $this->jwt->createFromPayload($user, [
                self::REVENDICATION => $application->getClientId(),
            ]),
            'expires_in' => $this->dureeJeton,
        ];
    }

    /**
     * @throws TooManyRequestsHttpException 429, avec l'en-tête Retry-After
     */
    public function limiter(RateLimiterFactory $fabrique, string $cle): void
    {
        $limite = $fabrique->create($cle)->consume();

        if (!$limite->isAccepted()) {
            throw new TooManyRequestsHttpException(
                max(1, $limite->getRetryAfter()->getTimestamp() - time()),
                'Trop de requêtes. Réessayez dans quelques instants.'
            );
        }
    }

    public static function genererClientId(): string
    {
        return 'xixa_'.bin2hex(random_bytes(12));
    }

    public static function genererSecret(): string
    {
        return bin2hex(random_bytes(32));
    }
}
