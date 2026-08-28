<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserParam;
use App\Exception\BusinessException;
use App\Repository\UserRepository;
use App\Service\ApiPresenter;
use App\Service\ChampsProfil;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Authentification.
 *
 * La connexion elle-même (/api/auth/login) est prise en charge par le firewall
 * json_login de Symfony, qui renvoie le JWT. Ce contrôleur gère l'inscription
 * et le profil courant.
 */
#[Route('/api/auth')]
class AuthController extends AbstractApiController
{
    /**
     * Route déclarée pour que le routeur ne renvoie pas 404 : le corps n'est
     * jamais exécuté, le firewall `json_login` intercepte la requête en amont
     * et répond avec le JWT (ou 401).
     */
    #[Route('/login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        throw new BusinessException('Authentification indisponible.', 401);
    }

    #[Route('/register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserRepository $users,
        UserPasswordHasherInterface $hasher,
        JWTTokenManagerInterface $jwt,
        ApiPresenter $presenter,
    ): JsonResponse {
        $data = $this->payload($request);

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
        if (strlen($password) < 6) {
            throw new BusinessException('Le mot de passe doit contenir au moins 6 caractères.');
        }
        if ('' === $nom || '' === $prenom || '' === $nomBoutique) {
            throw new BusinessException('Nom, prénom et nom de boutique sont obligatoires.');
        }
        if (strlen($telephone) < 8) {
            throw new BusinessException('Numéro de téléphone invalide.');
        }
        if ($users->findByTelephone($telephone)) {
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

        $user->setPassword($hasher->hashPassword($user, $password));

        $em->persist($user);
        $em->flush();

        // Paramètres par défaut, comme le faisait register.php — sauf sans RCCM,
        // où la fréquence quotidienne s'impose d'entrée.
        $params = (new UserParam())
            ->setUser($user)
            ->setFrequenceRetrait($user->registreCommerceManquant()
                ? RetraitController::FREQUENCE_SANS_REGISTRE
                : '7 jours');
        $em->persist($params);
        $em->flush();

        // Connexion immédiate : pas de redirection vers un écran de login.
        return new JsonResponse([
            'token' => $jwt->create($user),
            'user' => $presenter->user($user),
        ], 201);
    }

    #[Route('/me', methods: ['GET'])]
    public function me(ApiPresenter $presenter): JsonResponse
    {
        return new JsonResponse($presenter->user($this->utilisateur()));
    }
}
