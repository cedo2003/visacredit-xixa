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
}
