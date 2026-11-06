<?php

namespace App\Entity;

use App\Repository\LiaisonPartenaireRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Accord entre une boutique XIXA et une application partenaire : « ce compte,
 * chez le partenaire, est cette boutique chez nous ».
 *
 * C'est la seule chose qui permet à un partenaire d'obtenir un jeton pour une
 * boutique. Sans elle, un partenaire authentifié pourrait demander un jeton
 * pour n'importe quel numéro de téléphone ; avec elle, il n'agit que pour les
 * boutiques qu'il a lui-même ouvertes, ou que leur titulaire lui a confiées en
 * saisissant une fois son mot de passe XIXA.
 *
 * `referenceExterne` est l'identifiant du client dans le système du
 * partenaire, tel qu'il nous le transmet : on ne l'interprète pas.
 */
#[ORM\Entity(repositoryClass: LiaisonPartenaireRepository::class)]
#[ORM\Table(name: 'liaisons_partenaires')]
#[ORM\UniqueConstraint(name: 'uniq_liaison_reference', columns: ['application_id', 'reference_externe'])]
#[ORM\UniqueConstraint(name: 'uniq_liaison_user', columns: ['application_id', 'user_id'])]
#[ORM\Index(name: 'idx_liaison_user', columns: ['user_id'])]
class LiaisonPartenaire
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'application_id', nullable: false, onDelete: 'CASCADE')]
    private ApplicationPartenaire $application;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'user_id', nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\Column(name: 'reference_externe', length: 191)]
    private string $referenceExterne;

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct(ApplicationPartenaire $application, User $user, string $referenceExterne)
    {
        $this->application = $application;
        $this->user = $user;
        $this->referenceExterne = $referenceExterne;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getApplication(): ApplicationPartenaire
    {
        return $this->application;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function getReferenceExterne(): string
    {
        return $this->referenceExterne;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
