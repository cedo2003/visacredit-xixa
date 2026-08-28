<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Table `users` de Visacredit XIXA.
 *
 * etatEts : 1 = grossiste (fournisseur en gros), 0 = détaillant.
 * C'est la colonne historique qui portait tout le contrôle de rôle en PHP natif
 * (getEtatEts / estGrossiste / exigerRole). On la conserve telle quelle et on
 * la traduit en rôles Symfony dans getRoles().
 */
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'users')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    public const ROLE_GROSSISTE = 'ROLE_GROSSISTE';
    public const ROLE_DETAILLANT = 'ROLE_DETAILLANT';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $nom = '';

    #[ORM\Column(length: 100)]
    private string $prenom = '';

    #[ORM\Column(length: 20, unique: true)]
    private string $telephone = '';

    #[ORM\Column(length: 150, nullable: true)]
    private ?string $email = null;

    /**
     * Identifiant Fiscal Unique.
     *
     * Nullable en base bien qu'obligatoire fonctionnellement : les comptes
     * créés avant son introduction n'en ont pas. Les rendre invalides d'un
     * coup bloquerait des boutiques en activité ; l'application les invite
     * donc à le renseigner par un bandeau, et l'exige à la première
     * modification du profil comme à toute nouvelle inscription.
     */
    #[ORM\Column(length: 30, nullable: true)]
    private ?string $ifu = null;

    /**
     * Numéro du registre du commerce (RCCM).
     *
     * Facultatif au sens de la base, mais il conditionne le rythme des retraits :
     * une boutique qui ne l'a pas déclaré est limitée à la fréquence « 1 jour »
     * (voir RetraitController). C'est le seul endroit où cette information est
     * stockée, et `registreCommerceManquant()` est le seul juge de son absence.
     */
    #[ORM\Column(name: 'registre_commerce', length: 50, nullable: true)]
    private ?string $registreCommerce = null;

    #[ORM\Column(name: 'date_naissance', type: 'date_immutable', nullable: true)]
    private ?\DateTimeImmutable $dateNaissance = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $adresse = null;

    #[ORM\Column(name: 'password_hash', length: 255)]
    private string $passwordHash = '';

    #[ORM\Column(name: 'nom_boutique', length: 150)]
    private string $nomBoutique = '';

    #[ORM\Column(name: 'etatEts', type: 'integer', options: ['default' => 0])]
    private int $etatEts = 0;

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable', options: ['default' => 'CURRENT_TIMESTAMP'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'decimal', precision: 15, scale: 2, options: ['default' => '0.00'])]
    private string $solde = '0.00';

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function setNom(string $nom): self
    {
        $this->nom = $nom;

        return $this;
    }

    public function getPrenom(): string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): self
    {
        $this->prenom = $prenom;

        return $this;
    }

    public function getTelephone(): string
    {
        return $this->telephone;
    }

    public function setTelephone(string $telephone): self
    {
        $this->telephone = $telephone;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getIfu(): ?string
    {
        return $this->ifu;
    }

    public function setIfu(?string $ifu): self
    {
        $this->ifu = $ifu;

        return $this;
    }

    /** Vrai tant que l'IFU n'a pas été renseigné — sert au bandeau de rappel. */
    public function ifuManquant(): bool
    {
        return null === $this->ifu || '' === trim($this->ifu);
    }

    public function getRegistreCommerce(): ?string
    {
        return $this->registreCommerce;
    }

    public function setRegistreCommerce(?string $registreCommerce): self
    {
        $this->registreCommerce = $registreCommerce;

        return $this;
    }

    /** Vrai tant que le registre du commerce n'a pas été déclaré. */
    public function registreCommerceManquant(): bool
    {
        return null === $this->registreCommerce || '' === trim($this->registreCommerce);
    }

    public function getDateNaissance(): ?\DateTimeImmutable
    {
        return $this->dateNaissance;
    }

    public function setDateNaissance(?\DateTimeImmutable $dateNaissance): self
    {
        $this->dateNaissance = $dateNaissance;

        return $this;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function setAdresse(?string $adresse): self
    {
        $this->adresse = $adresse;

        return $this;
    }

    public function getPassword(): string
    {
        return $this->passwordHash;
    }

    public function setPassword(string $passwordHash): self
    {
        $this->passwordHash = $passwordHash;

        return $this;
    }

    public function getNomBoutique(): string
    {
        return $this->nomBoutique;
    }

    public function setNomBoutique(string $nomBoutique): self
    {
        $this->nomBoutique = $nomBoutique;

        return $this;
    }

    public function getEtatEts(): int
    {
        return $this->etatEts;
    }

    public function setEtatEts(int $etatEts): self
    {
        $this->etatEts = $etatEts;

        return $this;
    }

    public function isGrossiste(): bool
    {
        return 1 === $this->etatEts;
    }

    public function isDetaillant(): bool
    {
        return 0 === $this->etatEts;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getSolde(): string
    {
        return $this->solde;
    }

    public function setSolde(string $solde): self
    {
        $this->solde = $solde;

        return $this;
    }

    public function getUserIdentifier(): string
    {
        return $this->telephone;
    }

    public function getRoles(): array
    {
        return ['ROLE_USER', $this->isGrossiste() ? self::ROLE_GROSSISTE : self::ROLE_DETAILLANT];
    }

    public function eraseCredentials(): void
    {
        // Aucun secret en clair conservé sur l'entité.
    }
}
