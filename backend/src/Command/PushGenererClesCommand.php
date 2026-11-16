<?php

namespace App\Command;

use Minishlink\WebPush\VAPID;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Génère la paire de clés VAPID qui signe les push web.
 *
 * À faire une fois par environnement, puis à ne plus toucher : changer de
 * clés invalide tous les abonnements des navigateurs, qui devront se
 * réabonner (ils le font seuls à la prochaine ouverture de l'application).
 *
 * Sous Windows (XAMPP), OpenSSL a besoin de son fichier de configuration :
 *     set OPENSSL_CONF=C:\xampp\php\extras\ssl\openssl.cnf
 */
#[AsCommand(name: 'xixa:push:generer-cles', description: 'Génère la paire de clés VAPID des notifications push web')]
class PushGenererClesCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        try {
            $cles = VAPID::createVapidKeys();
        } catch (\Throwable $e) {
            $io->error([
                'Génération impossible : '.$e->getMessage(),
                'Sous Windows, définissez OPENSSL_CONF (voir l\'aide de la commande).',
            ]);

            return Command::FAILURE;
        }

        $io->success('Clés générées. Ajoutez ces trois variables à l\'environnement du backend :');
        $output->writeln([
            'VAPID_PUBLIC_KEY='.$cles['publicKey'],
            'VAPID_PRIVATE_KEY='.$cles['privateKey'],
            'VAPID_SUBJECT=mailto:contact@visacredit.com',
            '',
        ]);
        $io->warning('La clé privée est secrète : ne la versionnez pas. En production, saisissez-la dans Dokploy.');

        return Command::SUCCESS;
    }
}
