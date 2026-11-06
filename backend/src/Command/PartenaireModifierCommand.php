<?php

namespace App\Command;

use App\Repository\ApplicationPartenaireRepository;
use App\Service\AccesPartenaireService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Désactive, réactive une application partenaire ou remplace son secret.
 *
 * La désactivation coupe sur-le-champ tous les jetons déjà émis pour elle, et
 * le nouveau secret invalide aussitôt l'ancien : c'est la marche à suivre si un
 * secret a fuité.
 */
#[AsCommand(name: 'xixa:partenaire:modifier', description: 'Désactive, réactive une application partenaire ou remplace son secret')]
class PartenaireModifierCommand extends Command
{
    public function __construct(
        private readonly ApplicationPartenaireRepository $applications,
        private readonly EntityManagerInterface $em,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('client_id', InputArgument::REQUIRED, 'Identifiant client de l\'application')
            ->addOption('desactiver', null, InputOption::VALUE_NONE, 'Refuse tout appel et invalide les jetons en cours')
            ->addOption('reactiver', null, InputOption::VALUE_NONE, 'Rétablit l\'accès')
            ->addOption('nouveau-secret', null, InputOption::VALUE_NONE, 'Remplace le secret ; l\'ancien cesse aussitôt de fonctionner');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $application = $this->applications->findByClientId((string) $input->getArgument('client_id'));

        if (!$application) {
            $io->error('Aucune application avec cet identifiant.');

            return Command::FAILURE;
        }

        $desactiver = $input->getOption('desactiver');
        $reactiver = $input->getOption('reactiver');
        $nouveauSecret = $input->getOption('nouveau-secret');

        if ($desactiver && $reactiver) {
            $io->error('--desactiver et --reactiver s\'excluent.');

            return Command::INVALID;
        }
        if (!$desactiver && !$reactiver && !$nouveauSecret) {
            $io->error('Précisez --desactiver, --reactiver ou --nouveau-secret.');

            return Command::INVALID;
        }

        if ($desactiver || $reactiver) {
            $application->setActif((bool) $reactiver);
        }

        $secret = null;
        if ($nouveauSecret) {
            $secret = AccesPartenaireService::genererSecret();
            $application->definirSecret($secret);
        }

        $this->em->flush();

        $io->success(sprintf(
            'Application « %s » : %s.',
            $application->getNom(),
            $application->isActif() ? 'active' : 'désactivée'
        ));

        if (null !== $secret) {
            $io->definitionList(['client_secret' => $secret]);
            $io->warning('Le secret ne sera plus jamais affiché : transmettez-le maintenant, par un canal sûr.');
        }

        return Command::SUCCESS;
    }
}
