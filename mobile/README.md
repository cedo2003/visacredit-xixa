# Visacredit XIXA Mobile

Application mobile React Native (Expo SDK 54) de la plateforme Visacredit XIXA.

**Application connectée** : elle utilise la même API Symfony que le site web.
Mêmes comptes, mêmes données, et les commandes B2B circulent réellement d'un
téléphone à l'autre. Elle reçoit les notifications de la boutique en **push**.

---

## Démarrage rapide

Lancez **`demarrer-mobile.bat`** à la racine du dépôt : il démarre l'API
Symfony (accessible depuis le réseau local) et le serveur Expo.

```bash
# ou, à la main :
cd backend && php -S 0.0.0.0:8000 -t public bin/routeur-dev.php
cd mobile  && npm install && npx expo start
```

Le téléphone doit être sur le même réseau Wi-Fi que le PC. L'adresse de l'API
est déduite de celle du serveur Expo (port 8000) ; pour en viser une autre,
voir `.env.example`.

Comptes de démonstration (voir `readme.md` à la racine) :

| Rôle | Téléphone | Mot de passe |
|---|---|---|
| Grossiste | `0190000001` | `grossiste2026` |
| Détaillant | `0190000002` | `detaillant2026` |

> **Expo Go ne reçoit pas les notifications push sur Android** (depuis le
> SDK 53). Tout le reste y fonctionne ; pour le push, il faut un build — voir
> « Notifications push » plus bas.

---

## Architecture

```
écran  →  api.get("/api/ventes")  →  HTTP  →  API Symfony  →  MariaDB
          (src/lib/api.ts)
```

`src/lib/api.ts` est le pendant de `frontend/src/lib/api.ts` : JWT dans le
stockage sécurisé du téléphone, `401` qui renvoie à la connexion, message clair
quand le serveur est injoignable. Les écrans appellent les mêmes routes que le
web.

L'adresse de l'API est résolue dans cet ordre :

1. `EXPO_PUBLIC_API_URL` (fichier `mobile/.env`), figée au build ;
2. en développement, la machine qui sert Metro, port 8000 ;
3. à défaut, la production (`http://13.140.134.229:8090`).

> Jusqu'à la version 1.1, l'application fonctionnait hors ligne, sur une base
> SQLite embarquée. Ce mode a été retiré pour permettre le push et les échanges
> B2B entre téléphones ; il reste dans l'historique git (`src/local/`).

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
- les messages d'erreur de l'API traversent le même dictionnaire, sans table
  de correspondance séparée.

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

## Notifications push

Toutes les notifications de la boutique (nouvelle commande, validation,
livraison, demande de paiement, marchandage…) arrivent aussi en push,
application ouverte, en arrière-plan ou fermée. Un appui ouvre l'écran concerné
et marque la notification comme lue.

**Fonctionnement** (`src/lib/push.ts`) : à chaque connexion, le téléphone
demande la permission (une seule fois), obtient un jeton Expo et le remet à
l'API (`/api/push/abonnements`). Le serveur envoie ensuite chaque notification
au service push d'Expo, qui relaie vers Firebase (Android) ou APNs (iOS). À la
déconnexion, le téléphone est retiré de la boutique.

**Mise en place, une fois** :

1. **Firebase (Android)** — créer un projet sur console.firebase.google.com,
   y ajouter une application Android de package `com.visacredit.xixa`, et
   télécharger `google-services.json` dans `mobile/`. `app.config.js` le
   branche automatiquement (ou via la variable de fichier EAS
   `GOOGLE_SERVICES_JSON`).
2. **Clé de service FCM chez Expo** — dans Firebase, *Paramètres du projet →
   Comptes de service → Générer une clé privée*, puis
   `npx eas credentials` → Android → *Google Service Account* → *FCM V1*, et
   fournir ce fichier JSON. C'est ce qui autorise Expo à envoyer en votre nom.
3. **Construire** un APK (voir plus bas) : le push ne fonctionne pas dans Expo Go.

Sans Firebase, l'application fonctionne normalement ; seul le push manque, et
Paramètres l'indique.

---

## Paiement mobile money

KkiaPay et FedaPay n'offrent qu'un widget web, chargé dans une `WebView`
(`src/components/PaiementMobile.tsx`). Comme sur le web, ce widget ne fait
qu'encaisser : c'est `/api/paiements/confirmer` qui revérifie chaque transaction
auprès de la passerelle avec la clé privée avant de l'imputer. Une page
manipulée ne peut donc pas déclarer un paiement qui n'a pas eu lieu.

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
    │   ├── api.ts              Client HTTP de l'API Symfony
    │   ├── auth.tsx            Contexte de session
    │   ├── push.ts             Notifications push (jeton Expo, ouverture)
    │   ├── requete.ts          Hook de chargement (focus + pull-to-refresh)
    │   ├── types.ts            Types partagés avec le backend
    │   └── format.ts           Montants, dates, badges de statut
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

Vérifiez d'abord l'adresse de l'API que l'APK utilisera : sans
`EXPO_PUBLIC_API_URL` dans `mobile/.env`, c'est la production
(`http://13.140.134.229:8090`). Et, pour le push, que `google-services.json`
est en place (voir « Notifications push »).

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
| `developpement` | `.apk` | Build de debug relié à un Metro local — reçoit le push |

> `expo-build-properties` autorise le trafic HTTP en clair (`app.json`) : la
> production est encore servie en HTTP sur une adresse IP. Une fois le domaine
> en HTTPS, pointez `EXPO_PUBLIC_API_URL` dessus et retirez cette autorisation.
