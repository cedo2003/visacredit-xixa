# Visacredit XIXA Mobile

Application mobile React Native (Expo SDK 54) de la plateforme Visacredit XIXA.

**Application autonome** : elle fonctionne entièrement hors ligne, sans serveur.
Les données vivent dans une base SQLite sur le téléphone, et les règles métier du
backend Symfony ont été portées en TypeScript.

Le dossier `backend/` reste la référence : c'est de lui que viennent le schéma,
les règles et le jeu de données de démonstration.

---

## Démarrage rapide

```bash
cd mobile
npm install     # la première fois seulement
npx expo start
```

Puis scannez le QR code avec **Expo Go**. Aucun backend à lancer, aucun réseau
partagé à configurer : l'application se suffit à elle-même.

Comptes de démonstration (voir `readme.md` à la racine) :

| Rôle | Téléphone | Mot de passe |
|---|---|---|
| Grossiste | `0190000001` | `grossiste2026` |
| Détaillant | `0190000002` | `detaillant2026` |

---

## Architecture : application autonome

**L'application ne dépend d'aucun serveur.** Toutes les données vivent dans une
base SQLite sur le téléphone (`visacredit.db`), et toute la logique métier —
ventes, stock, échéanciers, commandes B2B, crédits, solde — a été portée du
backend Symfony vers TypeScript.

### Le contrat d'API a été conservé

Les 25 écrans n'ont pas été réécrits. Ils appellent toujours
`api.get("/api/ventes")`, mais `src/lib/api.ts` n'envoie plus de requête HTTP :
il aiguille vers un **routeur local** qui rejoue les mêmes routes sur SQLite.

```
écran  →  api.get("/api/ventes")  →  routeur local  →  SQLite
                                     (src/local/)
```

Ce choix a deux mérites : aucun écran à modifier, et un éventuel retour vers une
API distante ne toucherait qu'un seul fichier.

```
src/local/
├── schema.ts        Schéma SQLite, transposé de boutiq.sql
├── amorcage.ts      Données de départ (généré depuis MySQL)
├── base.ts          Ouverture, amorçage, helpers, transactions
├── presentateur.ts  Mise en forme JSON — pendant d'ApiPresenter
├── routeur.ts       Table de routage — pendant des Controllers
└── modules/
    ├── auth.ts      Connexion, inscription, profil, mot de passe
    ├── solde.ts     Position de caisse et tableau de bord
    ├── catalogue.ts Produits, catégories, recherche
    ├── commerce.ts  Clients, ventes, créances
    ├── b2b.ts       Commandes, crédits fournisseurs, notations
    └── divers.ts    Dépenses, retraits, notifications, paiements
```

### Amorçage

Au **tout premier lancement**, la base est créée et remplie avec le jeu de
démonstration (deux comptes liés, produits, ventes, commandes…). Ensuite, elle
appartient à l'utilisateur : une mise à jour de l'application ne la réamorce
jamais. Un bouton **Paramètres → Réinitialiser** permet de revenir à l'état
d'origine.

### Ce qui change par rapport à la version connectée

| Sujet | Version connectée | Version autonome |
|---|---|---|
| Données | MySQL sur le serveur | SQLite sur le téléphone |
| Mot de passe | bcrypt (Symfony) | SHA-256 salé par le téléphone |
| Commandes B2B | entre deux appareils | entre les deux comptes du **même** appareil |
| Paiement mobile money | vérifié par le serveur | **indisponible** — voir ci-dessous |

**Le paiement mobile money est désactivé, volontairement.** Sa sécurité reposait
sur le serveur, qui revérifiait chaque transaction auprès de la passerelle avec
la clé privée avant de l'imputer. Hors ligne, cette vérification est impossible :
l'application le dit clairement plutôt que de faire croire à un encaissement.
Les règlements se saisissent en espèces.

**Le B2B fonctionne réellement**, mais sur un seul appareil : une commande
passée depuis le compte détaillant est visible par le compte grossiste après
changement de compte. C'est ce qui permet de dérouler le cycle complet
— commande, validation, livraison, réception, règlement, notation — sans serveur.

## Français / anglais

Réglable dans **Paramètres → Langue**. Le français est la langue par défaut et
la langue **source** : la clé de traduction est la phrase française elle-même.

```ts
import { useT } from "@/i18n";

const t = useT();
t("Nouvelle vente");                    // « New sale » en anglais
t("Bonjour, {prenom} 👋", { prenom });  // interpolation
```

Trois conséquences :

- une phrase sans traduction s'affiche en français, jamais comme une clé nue ;
- retoucher une phrase française oblige à retoucher l'entrée correspondante de
  `src/dictionnaire-en.ts` — `npm run i18n` liste les entrées orphelines et les
  phrases sans traduction ;
- les messages d'erreur du moteur local traversent le même dictionnaire, sans
  table de correspondance séparée.

Les **tables de module** (rubriques du tiroir, filtres, badges de `format.ts`)
gardent leur libellé français : un hook ne s'appelle pas hors composant. C'est
au rendu qu'elles passent par `t()` — `{t(rubrique.titre)}`.

Le dictionnaire reprend mot pour mot celui du web pour tout le vocabulaire
commun : deux traductions divergentes de « Créances » seraient un défaut, pas
une nuance.

## Thème clair / sombre

Réglable dans **Paramètres → Apparence** : *Système*, *Clair* ou *Sombre*. Le
choix appartient à l'appareil — il est rangé dans SecureStore, pas dans la base,
pour s'appliquer avant même l'écran de connexion.

### Écrire un écran qui suit le thème

`StyleSheet.create` fige ses valeurs au chargement du module : une feuille écrite
une fois pour toutes ne peut pas changer de couleur ensuite. Chaque écran expose
donc une **fabrique** de styles, et la réclame par un hook :

```ts
import { espacement, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

export default function MonEcran() {
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();   // seulement si le JSX pose une couleur lui-même
  …
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
    carte: { backgroundColor: couleurs.surface },
  });
```

Les feuilles sont mémorisées par palette : la fabrique tourne une fois par thème
et par écran, pas à chaque rendu.

### Les deux palettes

`src/theme.ts` définit `PALETTE_CLAIRE` et `PALETTE_SOMBRE`, de clés identiques.
Une distinction compte plus que les autres :

| Famille | Rôle | En sombre |
|---|---|---|
| `succes`, `danger`, `alerte`… | **texte** sur un fond | s'éclaircit |
| `succesClair`, `dangerClair`… | **fond** sous ce texte | s'assombrit |
| `actionSucces`, `actionDanger`… | **aplat** sous du texte blanc | ne bouge pas |

Un bouton « Valider » et un montant encaissé sont tous deux verts, mais pas du
même vert. Éclaircir l'aplat du bouton ferait passer son libellé blanc sous le
seuil de contraste : d'où les jetons `action*`, seuls jetons identiques dans les
deux thèmes.

L'export `couleurs` reste disponible pour le code hors composant, mais il vaut
la palette claire : dans un écran, c'est toujours `useStyles` ou `useCouleurs`.

## Écrans

Parité fonctionnelle avec le frontend Next.js.

| Écran | Route | API |
|---|---|---|
| Connexion / Inscription | `/connexion`, `/inscription` | `/api/auth/*` |
| Tableau de bord | `/tableau-de-bord` | `/api/dashboard` |
| Produits (liste, fiche, création) | `/produits`, `/produits/[id]`, `/produits/nouveau` | `/api/produits` |
| Ventes (liste, reçu, nouvelle) | `/ventes`, `/ventes/[id]`, `/ventes/nouvelle` | `/api/ventes` |
| Commandes B2B (liste, fiche, nouvelle) | `/commandes`, `/commandes/[id]`, `/commandes/nouvelle` | `/api/commandes` |
| Clients | `/clients`, `/clients/[id]`, `/clients/nouveau` | `/api/clients` |
| Créances clients | `/creances` | `/api/creances` |
| Crédits fournisseurs | `/credits` | `/api/credits` |
| Recherche chez les grossistes | `/recherche` | `/api/produits/recherche-grossistes` |
| Dépenses | `/depenses` | `/api/depenses` |
| Retraits | `/retraits` | `/api/retraits` |
| Notations | `/notations`, `/notations/[type]/[id]` | `/api/notations` |
| Notifications | `/notifications` | `/api/notifications` |
| Paramètres | `/parametres` | `/api/parametres` |

**Navigation** : un menu latéral (tiroir), ouvert par le bouton ☰ ou par un
glissement depuis le bord gauche. Il reprend les rubriques et les groupes de la
Sidebar du site web, avec le même filtrage par rôle — la recherche
inter-boutiques n'apparaît que pour un détaillant.

Les fiches et formulaires (nouvelle vente, détail d'une commande…) s'empilent
par-dessus le tiroir : ils affichent une flèche de retour plutôt que le ☰, ce
qui est le bon geste pour un écran dont on ressort là d'où l'on vient.

---

## Paiement mobile money

**Indisponible dans la version autonome, et c'est délibéré.**

KkiaPay et FedaPay n'offrent qu'un widget web, chargé dans une `WebView`. Ce
widget ne fait qu'encaisser : la sécurité reposait entièrement sur le serveur,
qui revérifiait chaque transaction auprès de la passerelle avec la clé privée
avant de l'imputer. Sans serveur, cette vérification est impossible.

Une application hors ligne qui « confirmerait » un paiement ne ferait que croire
le widget sur parole — donc n'importe qui pourrait déclarer un règlement qui n'a
pas eu lieu. L'écran affiche donc un message explicite et invite à enregistrer le
règlement en espèces.

Le code du widget (`src/components/PaiementMobile.tsx`) est conservé : il
redeviendra fonctionnel tel quel le jour où l'application sera reliée à une API.

---

## Structure

```
mobile/
├── app/                        Routes (expo-router, routage par fichiers)
│   ├── _layout.tsx             AuthProvider + pile racine
│   ├── index.tsx               Aiguillage session → boutique ou connexion
│   ├── connexion.tsx
│   ├── inscription.tsx
│   └── (app)/                  Zone authentifiée (garde de session)
│       ├── _layout.tsx         Pile : tiroir + écrans empilés par-dessus
│       ├── (tiroir)/           Les 13 rubriques du menu latéral
│       │   └── _layout.tsx     Drawer + contenu du menu
│       └── …                   Fiches et formulaires (hors menu)
└── src/
    ├── lib/
    │   ├── api.ts              Aiguillage vers le routeur local (ex-client HTTP)
    │   ├── auth.tsx            Contexte de session
    │   ├── requete.ts          Hook de chargement (focus + pull-to-refresh)
    │   ├── types.ts            Types partagés avec le backend
    │   └── format.ts           Montants, dates, badges de statut
    ├── local/                  Base SQLite, routeur et logique métier portée
    ├── components/             Briques d'UI et composants métier partagés
    ├── marque.ts               Nom et logo de la plateforme
    └── theme.ts                Palette et espacements
```

Les fichiers `src/lib/types.ts` et `src/lib/format.ts` sont volontairement les
jumeaux de leurs équivalents `frontend/src/lib/` : mobile et web consomment le
même backend, un écart entre les deux signalerait un bug plutôt qu'une variante
voulue.

---

## Différences assumées avec le frontend web

| Sujet | Web | Mobile | Pourquoi |
|---|---|---|---|
| Stockage du JWT | `localStorage` | `expo-secure-store` (Keychain / Keystore) | Un téléphone se perd ; le trousseau système chiffre le jeton |
| Session | perdue à la fermeture de l'onglet | conservée | On rouvre son commerce, on ne se reconnecte pas |
| Rechargement des listes | au montage | au montage **et** au retour sur l'écran, plus « tirer pour rafraîchir » | Attendu sur mobile, et évite les listes périmées après un formulaire |
| Fiche produit / client | consultation puis page d'édition | champs modifiables sur place | Éviter deux navigations pour corriger un prix |
| Confirmations | `confirm()` du navigateur | modale maison | `confirm()` n'existe pas en React Native |
| Sélecteurs | `<select>` natif | feuille modale | Pas d'équivalent portable en React Native |
| Menu | Sidebar toujours visible | tiroir ouvert par ☰ ou glissement | Un écran de téléphone n'a pas la largeur d'une barre latérale permanente |

---

## Commandes

```bash
npm start          # serveur Expo + QR code
npm run android    # ouvre sur un émulateur / appareil Android connecté
npm run ios        # ouvre sur un simulateur iOS (macOS requis)
npm run typecheck  # vérification TypeScript, routes comprises
```

Les routes sont typées (`experiments.typedRoutes`) : un lien vers un écran
inexistant échoue au `typecheck` plutôt qu'à l'exécution. Les types sont
régénérés par `npm start` ; sur un dépôt fraîchement cloné, lancez-le une fois
avant `npm run typecheck`.

---

## Build d'un APK

L'application étant autonome, il n'y a **aucune adresse d'API à configurer**
avant de construire.

```bash
cd mobile
npx eas build --platform android --profile apk
```

Le build se fait dans le cloud EAS : aucun SDK Android n'est nécessaire en
local. À la fin, EAS fournit un lien de téléchargement du `.apk`, installable
directement sur un téléphone (autoriser les « sources inconnues »).

Profils disponibles dans `eas.json` :

| Profil | Produit | Usage |
|---|---|---|
| `apk` | `.apk` | Installation directe, partage par lien |
| `production` | `.aab` | Dépôt sur le Play Store |
| `developpement` | `.apk` | Build de debug relié à un Metro local |

> Le plugin `expo-build-properties` autorise encore le trafic HTTP en clair dans
> `app.json`. Devenu inutile hors ligne, il ne gêne pas et resservira le jour où
> l'application sera reliée à une API.
