<?php

namespace App\EventListener;

use App\Repository\LiaisonPartenaireRepository;
use App\Service\AccesPartenaireService;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTDecodedEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

/**
 * Révocation immédiate des jetons émis pour une application partenaire.
 *
 * Un JWT ordinaire vaut jusqu'à son expiration, quoi qu'il arrive. Pour ceux
 * de nos applications, c'est acceptable ; pour ceux d'un tiers, non : quand une
 * boutique retire l'accès à un partenaire, ou qu'on désactive celui-ci, la
 * coupure doit être effective tout de suite, pas une heure plus tard.
 *
 * Les jetons sans revendication `partenaire` — ceux du site et de l'application
 * mobile — passent sans requête supplémentaire.
 */
#[AsEventListener(event: Events::JWT_DECODED)]
class JwtPartenaireListener
{
    public function __construct(private readonly LiaisonPartenaireRepository $liaisons)
    {
    }

    public function __invoke(JWTDecodedEvent $event): void
    {
        $payload = $event->getPayload();
        $clientId = $payload[AccesPartenaireService::REVENDICATION] ?? null;

        if (null === $clientId) {
            return;
        }

        if (!\is_string($clientId) || !$this->liaisons->accesEnVigueur($clientId, (string) ($payload['username'] ?? ''))) {
            $event->markAsInvalid();
        }
    }
}
