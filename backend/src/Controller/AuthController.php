<?php

namespace App\Controller;

use App\Exception\BusinessException;
use App\Service\ApiPresenter;
use App\Service\InscriptionService;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Authentification.
 *
 * La connexion elle-même (/api/auth/login) est prise en charge par le firewall
 * json_login de Symfony, qui renvoie le JWT. Ce contrôleur gère l'inscription
 * et le profil courant.
 */
#[Route('/api/auth')]
class AuthController extends AbstractApiController
{
    /**
     * Route déclarée pour que le routeur ne renvoie pas 404 : le corps n'est
     * jamais exécuté, le firewall `json_login` intercepte la requête en amont
     * et répond avec le JWT (ou 401).
     */
    #[Route('/login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        throw new BusinessException('Authentification indisponible.', 401);
    }

    #[Route('/register', methods: ['POST'])]
    public function register(
        Request $request,
        InscriptionService $inscription,
        JWTTokenManagerInterface $jwt,
        ApiPresenter $presenter,
    ): JsonResponse {
        $user = $inscription->inscrire($this->payload($request));

        // Connexion immédiate : pas de redirection vers un écran de login.
        return new JsonResponse([
            'token' => $jwt->create($user),
            'user' => $presenter->user($user),
        ], 201);
    }

    #[Route('/me', methods: ['GET'])]
    public function me(ApiPresenter $presenter): JsonResponse
    {
        return new JsonResponse($presenter->user($this->utilisateur()));
    }
}
