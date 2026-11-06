<?php

namespace App\Command;

use App\Entity\LiaisonPartenaire;
use App\Repository\ApplicationPartenaireRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'xixa:partenaire:lister', description: 'Liste les applications partenaires')]
class PartenaireListerCommand extends Command
{
    public function __construct(
        private readonly ApplicationPartenaireRepository $applications,
        private readonly EntityManagerInterface $em,
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $liaisons = $this->em->getRepository(LiaisonPartenaire::class);
        $lignes = [];

        foreach ($this->applications->findBy([], ['createdAt' => 'ASC']) as $application) {
            $lignes[] = [
                $application->getNom(),
                $application->getClientId(),
                $application->isActif() ? 'active' : 'désactivée',
                $liaisons->count(['application' => $application]),
                $application->getDerniereUtilisation()?->format('d/m/Y H:i') ?? 'jamais',
            ];
        }

        if (!$lignes) {
            $io->note('Aucune application partenaire. Créez-en une avec xixa:partenaire:creer.');

            return Command::SUCCESS;
        }

        $io->table(['Nom', 'client_id', 'État', 'Boutiques liées', 'Dernier appel'], $lignes);

        return Command::SUCCESS;
    }
}
