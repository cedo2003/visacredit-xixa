<?php

namespace App\Service;

use App\Controller\RetraitController;
use App\Entity\User;
use App\Entity\UserParam;
use App\Exception\BusinessException;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Ouverture d'un compte boutique.
 *
 * Deux portes y mènent : l'inscription depuis nos applications
 * (`/api/auth/register`) et la création de compte par une application
 * partenaire (`/api/partenaires/comptes`). Les règles sont les mêmes des deux
 * côtés — une boutique ouverte par un partenaire n'a pas à être moins bien
 * renseignée qu'une autre — et c'est ici seulement qu'elles sont écrites.
 */
class InscriptionService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $users,
        private readonly UserPasswordHasherInterface $hasher,
    ) {
    }

    /**
     * @param array<string, mixed> $data             champs du formulaire d'inscription
     * @param bool                 $motDePasseExige  faux pour un compte ouvert par un
     *                                               partenaire : le commerçant passe
     *                                               par l'application du partenaire et
     *                                               n'a pas forcément de mot de passe
     *                                               XIXA à choisir
     *
     * @throws BusinessException si un champ est invalide ou le numéro déjà pris
     */
    public function inscrire(array $data, bool $motDePasseExige = true): User
    {
        $nom = trim((string) ($data['nom'] ?? ''));
        $prenom = trim((string) ($data['prenom'] ?? ''));
        $telephone = preg_replace('/[^0-9]/', '', (string) ($data['telephone'] ?? ''));
        $email = trim((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');
        $nomBoutique = trim((string) ($data['nom_boutique'] ?? ''));
        $etatEts = $data['etatEts'] ?? null;

        // Demandé à l'inscription, mais accepté vide : un commerçant qui n'a pas
        // encore son numéro sous la main doit pouvoir ouvrir son compte le jour
        // même. Le bandeau « IFU manquant » prend le relais, et Paramètres, lui,
        // l'exige — c'est là que le compte se met en règle.
        $ifu = ChampsProfil::ifu($data['ifu'] ?? null, obligatoire: false);
        $dateNaissance = ChampsProfil::dateNaissance($data['date_naissance'] ?? null);
        $adresse = ChampsProfil::adresse($data['adresse'] ?? null);
        // Facultatif : une boutique en cours d'enregistrement doit pouvoir
        // ouvrir son compte. Son absence limite les retraits à « 1 jour ».
        $registreCommerce = ChampsProfil::registreCommerce($data['registre_commerce'] ?? null);

        // Mêmes règles que register.php
        if (!\in_array((string) $etatEts, ['0', '1'], true)) {
            throw new BusinessException('Veuillez choisir votre type de fournisseur (en détail ou en gros).');
        }
        if (('' !== $password || $motDePasseExige) && strlen($password) < 6) {
            throw new BusinessException('Le mot de passe doit contenir au moins 6 caractères.');
        }
        if ('' === $nom || '' === $prenom || '' === $nomBoutique) {
            throw new BusinessException('Nom, prénom et nom de boutique sont obligatoires.');
        }
        if (strlen($telephone) < 8) {
            throw new BusinessException('Numéro de téléphone invalide.');
        }
        if ($this->users->findByTelephone($telephone)) {
            throw new BusinessException('Ce numéro de téléphone est déjà utilisé.', 409);
        }

        $user = (new User())
            ->setNom($nom)
            ->setPrenom($prenom)
            ->setTelephone($telephone)
            ->setEmail($email ?: null)
            ->setIfu($ifu)
            ->setRegistreCommerce($registreCommerce)
            ->setDateNaissance($dateNaissance)
            ->setAdresse($adresse)
            ->setNomBoutique($nomBoutique)
            ->setEtatEts((int) $etatEts);

        // Sans mot de passe fourni, un secret aléatoire jamais communiqué : le
        // compte reste fermé à la connexion directe tant que le commerçant n'en
        // a pas choisi un, et la colonne `password_hash` garde sa contrainte.
        $user->setPassword($this->hasher->hashPassword(
            $user,
            '' !== $password ? $password : bin2hex(random_bytes(32))
        ));

        $this->em->persist($user);
        $this->em->flush();

        // Paramètres par défaut, comme le faisait register.php — sauf sans RCCM,
        // où la fréquence quotidienne s'impose d'entrée.
        $params = (new UserParam())
            ->setUser($user)
            ->setFrequenceRetrait($user->registreCommerceManquant()
                ? RetraitController::FREQUENCE_SANS_REGISTRE
                : '7 jours');
        $this->em->persist($params);
        $this->em->flush();

        return $user;
    }
}
