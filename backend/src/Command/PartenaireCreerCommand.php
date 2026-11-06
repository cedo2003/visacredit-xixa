<?php

namespace App\Command;

use App\Entity\ApplicationPartenaire;
use App\Service\AccesPartenaireService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Enregistre une application partenaire et affiche ses identifiants.
 *
 * Volontairement réservée à la ligne de commande : ouvrir l'API à un tiers est
 * une décision de l'équipe, pas un bouton dans l'interface d'une boutique.
 */
#[AsCommand(name: 'xixa:partenaire:creer', description: 'Enregistre une application partenaire et affiche son identifiant et son secret')]
class PartenaireCreerCommand extends Command
{
    public function __construct(private readonly EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addArgument('nom', InputArgument::REQUIRED, 'Nom de l\'application, tel que les boutiques le verront');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $secret = AccesPartenaireService::genererSecret();

        $application = (new ApplicationPartenaire())
            ->setNom(trim((string) $input->getArgument('nom')))
            ->setClientId(AccesPartenaireService::genererClientId())
            ->definirSecret($secret);

        $this->em->persist($application);
        $this->em->flush();

        $io->success(sprintf('Application « %s » enregistrée.', $application->getNom()));
        $io->definitionList(
            ['client_id' => $application->getClientId()],
            ['client_secret' => $secret],
        );
        $io->warning('Le secret ne sera plus jamais affiché : transmettez-le maintenant, par un canal sûr. '
            .'Perdu, il se remplace avec xixa:partenaire:modifier --nouveau-secret.');

        return Command::SUCCESS;
    }
}
