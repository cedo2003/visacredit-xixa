<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/** Préférences utilisateur. La PK est user_id (pas d'id auto-incrément en base). */
#[ORM\Entity]
#[ORM\Table(name: 'user_params')]
class UserParam
{
    #[ORM\Id]
    #[ORM\OneToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false)]
    private ?User $user = null;

    #[ORM\Column(name: 'frequence_retrait', length: 50, nullable: true, options: ['default' => '7 jours'])]
    private ?string $frequenceRetrait = '7 jours';

    /**
     * La boutique facture-t-elle la TVA ?
     *
     * Faux par défaut : une boutique au régime simplifié n'a pas le droit de la
     * facturer. Se tromper dans ce sens se corrige dans Paramètres ; se tromper
     * dans l'autre fait émettre des factures irrégulières.
     */
    #[ORM\Column(name: 'assujetti_tva', type: 'boolean', options: ['default' => false])]
    private bool $assujettiTva = false;

    /** Taux appliqué quand la boutique est assujettie. 18 % au Bénin. */
    #[ORM\Column(name: 'taux_tva', type: 'decimal', precision: 5, scale: 2, options: ['default' => '18.00'])]
    private string $tauxTva = '18.00';

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $u): self
    {
        $this->user = $u;

        return $this;
    }

    public function getFrequenceRetrait(): ?string
    {
        return $this->frequenceRetrait;
    }

    public function setFrequenceRetrait(?string $f): self
    {
        $this->frequenceRetrait = $f;

        return $this;
    }

    public function isAssujettiTva(): bool
    {
        return $this->assujettiTva;
    }

    public function setAssujettiTva(bool $assujetti): self
    {
        $this->assujettiTva = $assujetti;

        return $this;
    }

    public function getTauxTva(): string
    {
        return $this->tauxTva;
    }

    public function setTauxTva(string $taux): self
    {
        $this->tauxTva = $taux;

        return $this;
    }
}
