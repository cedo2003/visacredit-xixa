<?php

namespace App\Entity;

use App\Repository\ApplicationPartenaireRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Application tierce autorisée à utiliser l'API XIXA au nom de ses propres
 * clients — une autre plateforme du groupe, par exemple, qui veut offrir la
 * gestion de boutique sans faire installer XIXA.
 *
 * Elle s'authentifie par un couple identifiant / secret, délivré une fois par
 * la commande `xixa:partenaire:creer`. Seule l'empreinte SHA-256 du secret est
 * conservée : le secret est un aléa de 256 bits, pas un mot de passe choisi par
 * un humain, et un hachage lent n'y ajouterait rien sinon de la latence à
 * chaque appel.
 */
#[ORM\Entity(repositoryClass: ApplicationPartenaireRepository::class)]
#[ORM\Table(name: 'applications_partenaires')]
#[ORM\UniqueConstraint(name: 'uniq_application_client_id', columns: ['client_id'])]
class ApplicationPartenaire
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    private string $nom = '';

    #[ORM\Column(name: 'client_id', length: 40)]
    private string $clientId = '';

    #[ORM\Column(name: 'secret_hash', length: 64)]
    private string $secretHash = '';

    /**
     * Désactiver une application coupe immédiatement tous ses jetons en cours :
     * l'écouteur JwtPartenaireListener revérifie ce drapeau à chaque requête.
     */
    #[ORM\Column(options: ['default' => true])]
    private bool $actif = true;

    #[ORM\Column(name: 'created_at', type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(name: 'derniere_utilisation', type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $derniereUtilisation = null;

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

    public function getClientId(): string
    {
        return $this->clientId;
    }

    public function setClientId(string $clientId): self
    {
        $this->clientId = $clientId;

        return $this;
    }

    /** Remplace le secret ; l'ancien cesse aussitôt d'être accepté. */
    public function definirSecret(string $secret): self
    {
        $this->secretHash = hash('sha256', $secret);

        return $this;
    }

    public function secretValide(string $secret): bool
    {
        return hash_equals($this->secretHash, hash('sha256', $secret));
    }

    public function isActif(): bool
    {
        return $this->actif;
    }

    public function setActif(bool $actif): self
    {
        $this->actif = $actif;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getDerniereUtilisation(): ?\DateTimeImmutable
    {
        return $this->derniereUtilisation;
    }

    public function marquerUtilisation(): self
    {
        $this->derniereUtilisation = new \DateTimeImmutable();

        return $this;
    }
}
