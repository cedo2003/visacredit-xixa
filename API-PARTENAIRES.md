# API Visacredit XIXA — Guide d'intégration des applications partenaires

Ce guide s'adresse aux équipes qui veulent proposer la gestion de boutique XIXA
**dans leur propre application**, sans que leurs clients aient à installer
XIXA ni à s'y créer un compte à part.

---

## Le principe

Votre application ne reçoit jamais d'accès global à XIXA. Elle obtient, pour
chacun de vos clients, un **jeton au nom de sa boutique**. Ce jeton ouvre
exactement ce que ce commerçant verrait dans XIXA, ni plus ni moins.

Trois étapes :

1. **Vous liez** le compte d'un client chez vous à une boutique XIXA. Soit vous
   lui ouvrez une boutique (`POST /comptes`), soit il relie une seule fois sa
   boutique existante (`POST /liaisons`).
2. **Vous demandez un jeton** pour ce client, à partir de votre propre
   identifiant client (`POST /jetons`).
3. **Vous appelez l'API XIXA** avec ce jeton : produits, ventes, créances,
   commandes, tableau de bord…

```
 votre serveur ── identifiant + secret ──► /api/partenaires/jetons
       │                                          │
       │ ◄───────────── jeton de la boutique ─────┘
       │
       ├──► votre application (web ou mobile) reçoit le jeton
       │
       └──► /api/produits, /api/ventes, …   (Authorization: Bearer <jeton>)
```

Le commerçant garde la main : il voit dans XIXA les applications qui ont accès
à sa boutique, et peut leur retirer cet accès à tout moment.

---

## Avant de commencer

L'équipe XIXA vous remet deux valeurs :

| Valeur | Exemple | Où la garder |
|---|---|---|
| `client_id` | `xixa_2384e0064f2593155aa08fb9` | n'importe où, elle n'est pas secrète |
| `client_secret` | 64 caractères hexadécimaux | **uniquement sur votre serveur** |

> **Le secret ne doit jamais quitter votre serveur.** Ne le mettez ni dans une
> application mobile ni dans du code exécuté par un navigateur : n'importe qui
> pourrait l'en extraire et agir au nom de toutes les boutiques qui vous sont
> liées. Les routes `/api/partenaires/*` s'appellent de serveur à serveur ;
> seul le jeton obtenu peut être transmis à l'application de votre client.

Le secret n'est affiché qu'une fois, à sa création. S'il est perdu ou a fuité,
demandez-en un nouveau : l'ancien cesse aussitôt de fonctionner.

**Adresse de l'API** : celle que l'équipe XIXA vous communique, suivie de
`/api`. Les échanges doivent passer en **HTTPS**.

---

## Authentification de votre application

Toutes les routes `/api/partenaires/*` exigent l'authentification HTTP Basic,
avec `client_id` comme identifiant et `client_secret` comme mot de passe :

```
Authorization: Basic base64(client_id:client_secret)
```

La plupart des clients HTTP le font pour vous (`curl -u`, l'option `auth` de
Guzzle, d'axios ou de requests…).

Pour vérifier vos identifiants :

```bash
curl -u "$CLIENT_ID:$CLIENT_SECRET" https://<adresse>/api/partenaires/moi
```

```json
{ "nom": "Votre application", "client_id": "xixa_2384e0064f2593155aa08fb9" }
```

---

## Les routes partenaires

Toutes acceptent et renvoient du JSON (`Content-Type: application/json`).

`reference_externe` est **l'identifiant de votre client dans votre système**
(son id utilisateur, par exemple). XIXA ne l'interprète pas ; il sert à
retrouver la boutique liée. Une référence ne désigne qu'une boutique, et une
boutique n'est liée qu'à une seule de vos références. 191 caractères au plus.

### Ouvrir une boutique pour un client — `POST /api/partenaires/comptes`

Pour un client qui n'a pas encore de boutique XIXA.

```json
{
  "reference_externe": "user-48213",
  "nom": "Kossou",
  "prenom": "Ama",
  "telephone": "0197000001",
  "nom_boutique": "Chez Ama",
  "etatEts": 0,
  "email": "ama@example.com",
  "ifu": "3201900000022",
  "registre_commerce": "RB/COT/24 B 1234",
  "adresse": "Marché Dantokpa, Cotonou",
  "date_naissance": "1990-04-12",
  "password": "facultatif"
}
```

| Champ | Obligatoire | Remarque |
|---|---|---|
| `reference_externe` | oui | votre identifiant du client |
| `nom`, `prenom`, `nom_boutique` | oui | |
| `telephone` | oui | 8 chiffres au moins, unique dans XIXA |
| `etatEts` | oui | `0` = détaillant, `1` = grossiste |
| `email`, `ifu`, `registre_commerce`, `adresse`, `date_naissance` | non | sans registre du commerce, les retraits sont limités à une fréquence quotidienne |
| `password` | non | 6 caractères au moins. Sans mot de passe, le client n'utilise XIXA que par votre application. |

Réponse **201** :

```json
{
  "token": "eyJ0eXAiOiJKV1Qi…",
  "expires_in": 3600,
  "reference_externe": "user-48213",
  "user": {
    "id": 4,
    "nom": "Kossou",
    "prenom": "Ama",
    "telephone": "0197000001",
    "nom_boutique": "Chez Ama",
    "role": "detaillant",
    "ifu_manquant": false,
    "registre_commerce_manquant": false,
    "…": "…"
  }
}
```

Erreurs : **409** si le téléphone a déjà un compte XIXA (proposez alors la
liaison ci-dessous) ou si la référence est déjà liée ; **422** si un champ est
invalide.

### Relier une boutique existante — `POST /api/partenaires/liaisons`

Pour un client qui a déjà une boutique XIXA. Il saisit **une seule fois**, dans
votre application, son téléphone et son mot de passe XIXA : c'est son
consentement. Ne conservez pas ce mot de passe.

```json
{
  "reference_externe": "user-48213",
  "telephone": "0190000002",
  "password": "mot de passe XIXA du commerçant"
}
```

Réponse **201** (même forme que ci-dessus), ou **200** si cette liaison
existait déjà à l'identique.

Erreurs : **401** si le téléphone ou le mot de passe est faux (la réponse ne
dit pas lequel) ; **409** si la boutique est déjà liée à une autre de vos
références, ou la référence à une autre boutique ; **429** après 5 essais
infructueux en 15 minutes sur un même numéro.

### Obtenir un jeton — `POST /api/partenaires/jetons`

L'appel courant, pour un client déjà lié. Aucun mot de passe n'est demandé.

```json
{ "reference_externe": "user-48213" }
```

Réponse **200** : même forme que ci-dessus. **404** si aucune boutique n'est
liée à cette référence, par exemple si le commerçant vous a retiré l'accès.

### Délier une boutique — `DELETE /api/partenaires/liaisons/{reference_externe}`

Quand votre client ferme son compte chez vous, ou ne veut plus de la gestion de
boutique. Réponse **204**. Les jetons déjà émis pour cette boutique cessent
aussitôt de fonctionner. La boutique XIXA, elle, n'est pas supprimée.

---

## Utiliser le jeton

Envoyez-le sur chaque appel à l'API :

```
Authorization: Bearer eyJ0eXAiOiJKV1Qi…
```

```bash
curl -H "Authorization: Bearer $JETON" https://<adresse>/api/dashboard
```

Le jeton vaut `expires_in` secondes (une heure). À son expiration, ou dès que
l'API répond **401**, redemandez-en un par `POST /api/partenaires/jetons`. Un
**401** persistant après un jeton neuf signifie que l'accès a été retiré.

Un jeton cesse de fonctionner **immédiatement**, avant même son expiration,
quand :

- le commerçant retire l'accès à votre application dans XIXA ;
- vous déliez la boutique ;
- l'équipe XIXA désactive votre application.

### Ce que le jeton ouvre

Ce sont les mêmes routes que celles qu'utilisent les applications XIXA, avec les
mêmes règles. Certaines sont réservées aux grossistes ou aux détaillants : un
appel hors rôle répond **403**.

| Domaine | Routes |
|---|---|
| Profil | `GET /api/auth/me` |
| Tableau de bord | `GET /api/dashboard` |
| Produits | `GET /api/produits`, `GET /api/produits/{id}`, `GET /api/produits/categories`, `GET /api/produits/recherche-grossistes`, `POST /api/produits`, `PUT /api/produits/{id}`, `DELETE /api/produits/{id}` |
| Clients | `GET /api/clients`, `GET /api/clients/{id}`, `POST /api/clients`, `PUT /api/clients/{id}`, `DELETE /api/clients/{id}` |
| Ventes | `GET /api/ventes`, `GET /api/ventes/{id}`, `POST /api/ventes`, `GET /api/ventes/{id}/facture.pdf` |
| Créances clients | `GET /api/creances`, `POST /api/creances/{id}/paiement` |
| Commandes B2B | `GET /api/commandes`, `GET /api/commandes/{id}`, `POST /api/commandes`, `POST /api/commandes/verifier-fournisseur`, puis le cycle de la commande : `…/{id}/marchandage`, `…/marchandage/accepter`, `…/marchandage/refuser`, `…/valider`, `…/livrer`, `…/reception`, `…/encaisser-especes`, `…/payer-especes`, `…/demander-paiement`, `PUT …/{id}/echeances`, `…/annuler` |
| Crédits fournisseurs | `GET /api/credits`, `POST /api/credits/{id}/demander-paiement`, `…/payer-especes`, `…/payer-solde` |
| Dépenses | `GET /api/depenses`, `POST /api/depenses`, `DELETE /api/depenses/{id}` |
| Retraits | `GET /api/retraits`, `POST /api/retraits` |
| Notations | `GET /api/notations`, `POST /api/notations/fournisseur/{commandeId}`, `POST /api/notations/client/{commandeId}`, `GET /api/notations/profil/{type}/{id}`, `GET /api/notations/grossiste/{id}` |
| Notifications | `GET /api/notifications`, `GET /api/notifications/non-lues`, `POST /api/notifications/{id}/lue`, `POST /api/notifications/tout-lu`, `DELETE /api/notifications/{id}`, `DELETE /api/notifications/lues`, `DELETE /api/notifications/toutes` |
| Paramètres | `GET /api/parametres`, `PUT /api/parametres`, `POST /api/parametres/mot-de-passe` |
| Paiements mobile money | `GET /api/paiements/config`, `POST /api/paiements/confirmer` |

---

## Erreurs

Toutes les erreurs répondent en JSON, avec un message en français destiné à
être affiché au commerçant :

```json
{ "error": "Stock insuffisant pour ce produit." }
```

| Code | Signification |
|---|---|
| 400 | corps JSON illisible |
| 401 | identifiants de l'application invalides, ou jeton absent, expiré ou révoqué |
| 403 | action réservée à l'autre rôle (grossiste / détaillant) |
| 404 | ressource ou référence introuvable |
| 409 | conflit : téléphone ou référence déjà utilisés |
| 422 | règle métier non respectée : champ invalide, stock ou solde insuffisant… |
| 429 | trop de requêtes ; l'en-tête `Retry-After` donne le délai en secondes |

## Limites

- Routes `/api/partenaires/*` : 300 appels par minute et par application.
- Liaison d'une boutique existante : 5 essais par quart d'heure et par numéro
  de téléphone.

Mettez le jeton d'une boutique en cache pendant sa durée de validité plutôt que
d'en redemander un à chaque appel.
