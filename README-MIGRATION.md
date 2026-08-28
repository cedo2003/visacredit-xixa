# Visacredit XIXA — Symfony (API) + Next.js (frontend)

Réécriture de l'application PHP native en deux projets séparés. **La base de
données `boutiq` n'a pas été modifiée** : les entités Doctrine sont mappées sur
les 22 tables existantes, avec les mêmes noms de colonnes. L'ancien code PHP est
resté en place à la racine, rien n'a été supprimé.

```
Visacredit-XIXA/
├── backend/     API REST Symfony 7.2  (port 8000)
├── frontend/    Next.js 16 + React 19 + Tailwind 4  (port 3000)
├── boutiq.sql   dump inchangé
└── *.php        ancienne application, conservée pour référence
```

## Démarrage

Trois terminaux (ou XAMPP pour MySQL + deux terminaux) :

```bash
# 1. MySQL — via le panneau XAMPP, ou :
C:\xampp\mysql\bin\mysqld.exe

# 2. API Symfony
cd backend
php -S 127.0.0.1:8000 -t public

# 3. Frontend Next.js
cd frontend
npm run dev
```

Puis ouvrir **http://localhost:3000**.

Les comptes existants fonctionnent sans réinitialisation : les mots de passe
étaient hachés avec `password_hash(PASSWORD_DEFAULT)` (bcrypt), et Symfony est
configuré sur le même algorithme.

## Configuration

`backend/.env` — base de données, clés de paiement, URL du frontend :

```dotenv
DATABASE_URL="mysql://root:@127.0.0.1:3306/boutiq?serverVersion=10.4.32-MariaDB&charset=utf8mb4"
FRONTEND_URL=http://localhost:3000
KKIAPAY_PUBLIC_KEY=…      # widget, exposée au navigateur
KKIAPAY_PRIVATE_KEY=…     # vérification serveur, jamais exposée
FEDAPAY_PUBLIC_KEY=…
FEDAPAY_SECRET_KEY=…
```

`frontend/.env.local` — adresse de l'API :

```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Les clés JWT sont dans `backend/config/jwt/`. Pour les régénérer :

```bash
cd backend
export OPENSSL_CONF=C:/xampp/apache/conf/openssl.cnf
PASS=$(grep JWT_PASSPHRASE .env | cut -d= -f2)
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa \
  -pkeyopt rsa_keygen_bits:4096 -pass pass:$PASS
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout -passin pass:$PASS
```

## Mise à jour du 19/08/2026

Une migration Doctrine (`backend/migrations/Version20260819000000.php`) porte les
changements de schéma. **À jouer une fois sur la base existante :**

```bash
cd backend
php bin/console doctrine:migrations:migrate
```

Côté mobile, la base SQLite du téléphone se met à jour toute seule au premier
lancement (`VERSION_SCHEMA` passe à 2, voir `mobile/src/local/schema.ts`) : les
données saisies par l'utilisateur ne sont pas touchées.

Ce que la migration fait :

1. **Catalogue commun de catégories.** `categories.user_id` devient nullable ;
   les lignes à `NULL` forment le catalogue livré par la plateforme (17
   catégories). Les catégories créées à la main par les boutiques sont
   rapprochées du catalogue, par équivalence de libellé (`Épicerie` →
   `Épicerie générale`) puis par nom identique ; celles qui restent inutilisées
   sont supprimées, et les produits sans catégorie tombent dans « Divers ». La
   catégorie devient **obligatoire** à la création comme à la modification d'un
   produit, et l'endpoint `POST /api/produits/categories` a disparu.

   Le rapprochement compare les libellés **débarrassés de leurs accents**. Une
   partie des noms déjà en base est stockée doublement encodée (`C├®r├®ales`
   pour `Céréales`), séquelle d'un dump produit avec un client latin1 sur des
   tables `utf8mb3` : comparés tels quels, deux libellés identiques à l'œil ne
   correspondent pas. La migration ne répare pas ces données — voir la section
   sur les emojis plus bas, c'est le même sujet — elle s'arrange seulement pour
   qu'elles ne fassent pas échouer la reprise.

2. **Fiche client.** Ajout de `clients.telephone2` (second numéro, refusé s'il
   double le premier) et `clients.date_naissance` (sans âge minimum, à la
   différence du profil de la boutique).

3. **Registre du commerce.** Ajout de `users.registre_commerce` (RCCM),
   facultatif. Tant qu'il n'est pas renseigné, **les retraits sont limités à la
   fréquence « 1 jour »** : l'API refuse toute autre valeur, et les comptes
   existants sans RCCM sont basculés sur ce rythme par la migration. Le
   renseigner dans Paramètres débloque les autres fréquences.

4. **Marchandage des commandes.** Nouvelle table `commande_negociations`. Le
   détaillant propose un prix pour la commande entière, le grossiste accepte,
   refuse ou contre-propose ; une seule proposition est ouverte à la fois, et
   une proposition en attente **bloque la validation** de la commande. À
   l'acceptation, les prix unitaires sont ajustés au prorata, le total est
   recalculé depuis les lignes, et l'échéancier suit la même proportion — la
   dernière échéance absorbant l'arrondi.

   Routes : `POST /api/commandes/{id}/marchandage`,
   `POST /api/commandes/{id}/marchandage/{accepter,refuser}`.
   `actions_possibles` gagne `marchander`, `accepter_prix`, `refuser_prix` et
   `contre_proposer`.

Sans changement de schéma, deux évolutions d'interface accompagnent ce lot :

- **Partage paramétrable des frais de transaction.** En plus de `client`,
  `vendeur` et `50_50`, `repartition_frais` accepte `personnalise:NN` où `NN`
  est le pourcentage à la charge du vendeur. La valeur voyage dans la chaîne
  elle-même plutôt que dans une colonne de plus : `repartition_frais` est relue
  telle quelle au retour de la passerelle, et une seule donnée à transporter
  garantit que le partage confirmé est celui annoncé au moment de la vente.

  *Effet de bord assumé* : le calcul de `montant_envoye` devient uniforme
  (`montant − frais du vendeur`). L'ancien code appliquait cette formule pour
  `client` et `vendeur`, mais retranchait la part du **client** dans le cas
  `50_50` — un écart d'un franc quand les frais totaux sont impairs. C'est la
  formule cohérente qui a été retenue.

- **Planification des paiements.** L'écran de vente propose « en N fois, tous
  les X jours, à partir du … » et génère l'échéancier ; le détail reste
  modifiable ligne par ligne. L'API **refuse désormais une date d'échéance déjà
  passée** : une vente ne peut plus naître avec une créance en retard le jour
  même.

## Passerelles de paiement : configuration et webhooks

**Les clés ne vont jamais dans `backend/.env`** — ce fichier est versionné. Elles
vont dans `backend/.env.local`, couvert par `.gitignore` :

```dotenv
# backend/.env.local
FEDAPAY_PUBLIC_KEY=pk_sandbox_xxxxx
FEDAPAY_SECRET_KEY=sk_sandbox_xxxxx
FEDAPAY_SANDBOX=1
FEDAPAY_WEBHOOK_SECRET=wh_xxxxx      # donné à la création du webhook

KKIAPAY_PUBLIC_KEY=…
KKIAPAY_PRIVATE_KEY=…
KKIAPAY_WEBHOOK_SECRET=…
```

Seule la clé **publique** est transmise au navigateur (`GET /api/paiements/config`) ;
la clé secrète ne quitte pas le serveur, elle sert à revérifier chaque
transaction avant imputation.

### Signature des webhooks

`/api/paiements/webhook/{passerelle}` est la seule route ouverte sans jeton — la
passerelle n'en possède pas. Elle est donc authentifiée par signature, dans
[`SignatureWebhookService`](backend/src/Service/SignatureWebhookService.php) :

- **FedaPay** — en-tête `X-FEDAPAY-SIGNATURE` au format `t=<horodatage>,s=<condensat>`,
  le condensat étant un HMAC-SHA256 de « horodatage.corps » avec
  `FEDAPAY_WEBHOOK_SECRET`. La forme réduite (condensat seul, calculé sur le
  corps) est acceptée aussi, mais elle ne protège pas du rejeu.
- **KkiaPay** — secret partagé dans l'en-tête `X-KKIAPAY-SECRET`. *À confirmer au
  moment de déclarer le webhook : l'en-tête est configurable côté KkiaPay.*

Trois garde-fous méritent d'être connus :

1. La signature porte sur le **corps brut**. Re-sérialiser le JSON décodé
   changerait un espace ou l'ordre des clés et invaliderait le condensat.
2. Un horodatage vieux de plus de **5 minutes** est refusé : sans cette borne,
   une requête signée interceptée resterait rejouable indéfiniment.
3. **Secret absent = webhook refusé** (503), pas contourné. Un webhook non
   authentifié qu'on accepte « en attendant » est une porte qu'on oublie de
   refermer. Rien n'est perdu entre-temps : le retour navigateur reste le chemin
   principal, le webhook n'en est que le filet.

Les motifs de rejet sont journalisés côté serveur mais jamais renvoyés au
client — détailler ce qui cloche aiderait surtout celui qui cherche à forger une
requête. Aucun secret n'apparaît dans les journaux.

### Recette effectuée

Instance dédiée, secret de test, base non modifiée :

| Cas | Attendu | Obtenu |
|---|---|---|
| Signature valide `t=…,s=…` | 200 | 200 |
| Signature valide, forme réduite | 200 | 200 |
| En-tête absent | 401 | 401 |
| Condensat bidon | 401 | 401 |
| Corps modifié après signature | 401 | 401 |
| Horodatage vieux de 10 min (rejeu) | 401 | 401 |
| Secret non configuré | 503 | 503 |
| Passerelle inconnue | 400 | 400 |

## Correspondance ancien → nouveau

| Ancienne page PHP | Écran Next.js | Endpoint API |
|---|---|---|
| `login.php` | `/connexion` | `POST /api/auth/login` |
| `register.php` | `/inscription` | `POST /api/auth/register` |
| `dashboard.php` | `/tableau-de-bord` | `GET /api/dashboard` |
| `pages/clients/*` | `/clients` | `/api/clients` |
| `pages/produits/*` | `/produits` | `/api/produits` |
| `pages/ventes/create+save_vente+creances_setup+save_creances` | `/ventes/nouvelle` | `POST /api/ventes` |
| `pages/ventes/recu.php` | `/ventes/{id}` | `GET /api/ventes/{id}` |
| `pages/creances/*` | `/creances` | `/api/creances` |
| `pages/depenses/*` | `/depenses` | `/api/depenses` |
| `pages/retraits/*` | `/retraits` | `/api/retraits` |
| `pages/commandes/rechercher_produits.php` | `/recherche` | `GET /api/produits/recherche-grossistes` |
| `pages/commandes/create.php` (4 étapes) | `/commandes/nouvelle` | `POST /api/commandes` |
| `pages/commandes/show.php` + actions | `/commandes/{id}` | `/api/commandes/{id}/…` |
| `pages/commandes/recu_commande.php` | `/commandes/{id}/recu` | `GET /api/commandes/{id}` |
| `pages/commandes/selectionner_mode_paiement.php` | modale `ChoixPasserelle` | — |
| `pages/credits/credits_fournisseurs.php` | `/credits` | `/api/credits` |
| `pages/credits/payer_credit_kkiapay.php` + `callback_credit_kkiapay.php` | bouton « Demander paiement » sur `/credits` | `POST /api/credits/{id}/demander-paiement` |
| `pages/notations/mes_notations.php` | `/notations` | `GET /api/notations` |
| `pages/notations/noter_{client,fournisseur}.php` | modale `ModaleNotation` | `POST /api/notations/{type}/{commandeId}` |
| `pages/notations/afficher_notation.php` | `/notations/{type}/{id}` | `GET /api/notations/profil/{type}/{id}` |
| `pages/parametres/*` | `/parametres` | `/api/parametres` |

### Fichiers PHP non portés (code mort vérifié)

Trois fichiers n'ont pas d'équivalent parce qu'ils n'étaient appelés par personne :

- `liste_fournisseur.php` — script de débogage qui affichait un `COUNT(*)` avec
  `print_r()`. Aucun lien n'y menait.
- `pages/credits/creer_credit_depuis_commande.php` — son en-tête annonce qu'il
  est appelé par `valider.php` et `marquer_recu.php`, mais aucun `require` ne le
  charge : ces deux pages créaient les crédits en ligne, produit par produit. La
  fonction du fichier créait au contraire **un seul crédit groupé** avec un prix
  moyen — un comportement différent, jamais exécuté.
- `pages/commandes/payment_helpers.php` — jamais inclus non plus.

`includes/header.php`, `footer.php` et `sidebar.php` sont remplacés par le layout
Next.js ; `config.php`, `includes/fonctions.php` et `includes/helpers_commandes.php`
sont répartis dans les services Symfony et `src/lib/format.ts`.

## Logique métier conservée

Chaque règle de l'application PHP a été portée à l'identique :

- **Numérotation** — `BOU-YYYYMMDD-NNN` par vendeur et par jour, `CMD-YYMMDD-NNNNN`.
- **Frais des passerelles** — 1,9 % KkiaPay et 1,8 % FedaPay, réparties
  client / vendeur / moitié-moitié.
- **Solde de caisse** — `ventes payées − dépenses − retraits + versements de commandes`.
- **Validation d'une commande** — décrément du stock grossiste, entrée en stock
  détaillant avec **prix d'achat en moyenne pondérée**, création du produit avec
  marge de 20 % s'il n'existe pas, génération des crédits fournisseurs si crédit.
- **Réception** — sur plateforme, le stock a déjà bougé à la validation ; hors
  plateforme, c'est la réception qui fait entrer le stock et crée les crédits.
- **Échéanciers** — la somme doit correspondre au montant dû, avec la même
  tolérance d'un franc sur l'arrondi.
- **Crédits fournisseurs** — règlement en espèces ou sur le solde, générant dans
  les deux cas une dépense `achat_marchandises`.
- **Notations** — 1 à 5 étoiles, ouvertes seulement après réception de la commande.

## Ce qui change (et pourquoi)

**Les tunnels multi-écrans deviennent atomiques.** La vente passait par quatre
pages reliées par `$_SESSION['pending_creance']`, la commande par quatre autres
via `$_SESSION['temp_commande']`. Une session expirée au milieu laissait une
vente sans ses créances, ou une commande sans ses lignes. Tout part désormais en
une requête, donc en une seule transaction : soit tout est écrit, soit rien.

**Les paiements ne dépendent plus de la session.** L'intention de paiement est
persistée dans `fedapay_pending` avec une référence unique. Le retour navigateur
**et** le webhook peuvent la retrouver ; l'imputation est idempotente, donc un
double appel ne compte le montant qu'une fois. Un onglet fermé pendant le
paiement ne fait plus perdre la transaction. Le montant imputé vient toujours de
la base, jamais du navigateur, et la transaction est revérifiée côté serveur avec
la clé privée avant toute écriture.

**Trois anomalies corrigées au passage** (signalées ici pour que vous puissiez
trancher si vous préférez l'ancien comportement) :

1. `save_retrait.php` contrôlait le solde avec une formule tronquée
   (`ventes − dépenses`), sans retirer les retraits déjà effectués. On pouvait
   donc retirer plusieurs fois le même argent. Le contrôle utilise maintenant la
   formule complète du tableau de bord.
2. `creer_echeances()` insérait le statut `'en_attente'`, absent de l'ENUM
   `commande_echeances.statut`. MySQL le stockait en chaîne vide, et l'échéance
   devenait invisible du `UPDATE … WHERE statut = 'en_cours'` qui la soldait.
   La valeur `'en_cours'` de l'ENUM est désormais utilisée.
3. `calculerFraisKkiaPay()` dans `config.php` (1,5 % + 50 FCFA) n'était appelée
   nulle part — les pages utilisaient 1,9 %. C'est le taux réellement appliqué
   qui a été porté ; l'autre était du code mort.

**Les emojis ne sont plus écrits en base.** Les 22 tables sont en
`CHARSET=utf8`, c'est-à-dire `utf8mb3` : trois octets par caractère au maximum.
Un emoji sur quatre octets (💳 `U+1F4B3`, 📦 `U+1F4E6`…) y est remplacé par un
`?`, alors qu'un symbole sur trois octets (✅ `U+2705`) passe — ce qui rendait le
problème intermittent et difficile à voir. Les libellés de notification stockés
côté serveur sont donc en texte pur, et le pictogramme est choisi à l'affichage
selon le `type` de la notification. Si vous préférez stocker les emojis, il faut
convertir les tables en `utf8mb4` :

```sql
ALTER TABLE notifications CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Les règles de rôle ne sont plus dupliquées.** L'API renvoie
`actions_possibles` sur chaque commande ; le frontend n'affiche que ces boutons.
La règle est écrite une fois, côté serveur, qui reste seul juge.

## Recette effectuée

Testé de bout en bout sur une copie de la base (`boutiq_test`), sans toucher aux
données réelles :

- inscription grossiste + détaillant, connexion des comptes existants ;
- création produit comptant → dépense générée automatiquement ;
- recherche inter-boutiques ;
- commande à crédit avec échéancier, validation, transfert de stock
  (50 → 40 chez le grossiste, 0 → 10 chez le détaillant au bon prix d'achat),
  crédit fournisseur créé des deux côtés, notification émise ;
- vente partielle avec échéancier, encaissement partiel, répercussion sur la vente ;
- retrait avec contrôle de solde ;
- rejets attendus : échéancier incohérent, stock insuffisant, trop-perçu sur
  créance, retrait et paiement au-delà du solde — dans chaque cas la transaction
  est annulée et le stock reste intact.

Pour rejouer la recette sur une base isolée :

```bash
C:\xampp\mysql\bin\mysql -u root -e "CREATE DATABASE boutiq_test CHARACTER SET utf8mb4;"
C:\xampp\mysql\bin\mysql -u root boutiq_test < boutiq.sql
# puis, dans backend/.env.local :
# DATABASE_URL="mysql://root:@127.0.0.1:3306/boutiq_test?serverVersion=10.4.32-MariaDB&charset=utf8mb4"
```

## Points restants avant la production

- **Renseigner les clés KkiaPay et FedaPay** dans `backend/.env`. Sans elles, le
  widget de paiement ne s'ouvre pas ; les règlements en espèces fonctionnent.
- **Déclarer l'URL de webhook** chez chaque passerelle :
  `https://votre-api/api/paiements/webhook/kkiapay` (et `/fedapay`). C'est le
  filet qui rattrape les paiements dont l'utilisateur ferme l'onglet. Il faut
  une URL publique en HTTPS : `127.0.0.1` ne convient pas, prévoir un tunnel
  (ngrok, Cloudflare Tunnel) le temps des essais.
- **Ajouter les clés étrangères manquantes.** La base n'a que 6 contraintes pour
  22 tables ; Doctrine gère les relations au niveau ORM, mais rien n'empêche une
  écriture directe en base de créer un orphelin.
- **Hébergement.** Un runtime Node est désormais nécessaire en plus de PHP : un
  hébergement mutualisé PHP seul ne suffit plus.
