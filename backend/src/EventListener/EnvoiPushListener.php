<?php

namespace App\EventListener;

use App\Entity\Notification;
use App\Service\EnvoiPushService;
use App\Service\NotificationService;
use Doctrine\DBAL\ArrayParameterType;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\ConsoleEvents;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Expédie en push les notifications créées pendant la requête.
 *
 * `kernel.terminate` survient après l'envoi de la réponse : le commerçant n'en
 * attend pas la fin. `console.terminate` couvre les commandes, qui peuvent
 * elles aussi notifier.
 */
#[AsEventListener(event: KernelEvents::TERMINATE)]
#[AsEventListener(event: ConsoleEvents::TERMINATE)]
class EnvoiPushListener
{
    public function __construct(
        private readonly NotificationService $notifications,
        private readonly EnvoiPushService $push,
        private readonly EntityManagerInterface $em,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function __invoke(): void
    {
        $creees = array_filter(
            $this->notifications->extraireEnAttente(),
            static fn (Notification $n) => null !== $n->getId(),
        );

        if (!$creees) {
            return;
        }

        try {
            $this->push->envoyer($this->reellementEnregistrees($creees));
        } catch (\Throwable $e) {
            // Le push est un complément : son échec ne doit rien casser.
            $this->logger->error('Push non envoyé', ['exception' => $e]);
        }
    }

    /**
     * Ne garde que les notifications présentes en base.
     *
     * Avoir un identifiant ne suffit pas : une notification enregistrée dans
     * une transaction annulée ensuite en a reçu un, mais n'existe plus. Une
     * requête pour toutes, sur la clé primaire, l'établit à coup sûr.
     *
     * @param Notification[] $notifications
     *
     * @return Notification[]
     */
    private function reellementEnregistrees(array $notifications): array
    {
        $presents = $this->em->getConnection()->fetchFirstColumn(
            'SELECT id FROM notifications WHERE id IN (?)',
            [array_map(static fn (Notification $n) => $n->getId(), $notifications)],
            [ArrayParameterType::INTEGER],
        );
        $presents = array_flip(array_map('intval', $presents));

        return array_values(array_filter(
            $notifications,
            static fn (Notification $n) => isset($presents[$n->getId()]),
        ));
    }
}
