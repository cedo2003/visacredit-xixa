# Déploiement de Visacredit XIXA sur le serveur waofin

Le serveur héberge déjà **epargne-africaVR** sous Dokploy. Visacredit XIXA s'y
installe à côté, sur le même modèle, sans rien toucher à l'existant.

---

## Pourquoi la cohabitation est sûre

| Ressource | epargne-africaVR | Visacredit XIXA | Risque de collision |
|---|---|---|---|
| Application Dokploy | la sienne | **une nouvelle** | aucun |
| Base MySQL | `waofin` | **une nouvelle base** | aucun, si le nom diffère |
| Domaines | `waofin.co`, `phpadmin.waofin.co` | **deux sous-domaines dédiés** | aucun |
| Ports hôte publiés | `8082` (frontend) | **aucun** — tout passe par Traefik | aucun |
| Réseau Docker | `dokploy-network` | le même | aucun — c'est seulement le chemin de Traefik vers les conteneurs |

Le seul élément partagé est le réseau Docker, indispensable pour que Traefik
route le trafic. Il ne donne aucun accès aux données de l'autre application.

---

## L'architecture, en une phrase

**Le navigateur ne voit qu'une seule origine.** Le frontend Next.js relaie
`/api/*` vers le backend Symfony par le réseau interne Docker
(`frontend/next.config.ts`), exactement comme epargne-africaVR. Conséquence :
**aucun CORS à régler pour le web**.

L'application mobile, elle, n'a pas de proxy : elle attaque le backend sur son
propre sous-domaine. N'envoyant pas d'en-tête `Origin`, elle n'est pas non plus
concernée par le CORS.

```
navigateur ──── https://visacredit.waofin.co ────► frontend:3000 ──┐
                                                    (proxy /api)   │  réseau
                                                                   ├─► backend:80
mobile ──────── https://api.visacredit.waofin.co ──────────────────┘  interne
```

---

## 1. Publier le code sur Git

Dokploy déploie depuis un dépôt Git. Le projet n'en a pas encore à sa racine.

```bash
cd /c/xampp/htdocs/Boutiqueo

# frontend/ et mobile/ contiennent des dépôts .git issus de leurs générateurs.
# Laissés en place, ils deviendraient des sous-modules vides côté GitHub et le
# serveur clonerait des dossiers sans code.
rm -rf frontend/.git mobile/.git

git init
git add .
git commit -m "Visacredit XIXA — backend, frontend et mobile"
git branch -M main
git remote add origin https://github.com/<votre-compte>/visacredit-xixa.git
git push -u origin main
```

Avant de committer, vérifiez que rien de sensible ne part :

```bash
git status --short | grep -E "[.]env$|jwt/"    # ne doit rien afficher
```

Le `.gitignore` exclut déjà `backend/.env`, le `.env` de la racine écrit par
Dokploy, `backend/config/jwt/`, `**/node_modules` et `backend/vendor`. Seul le
gabarit vide `.env.example` est versionné.

---

## 2. Créer la base MySQL dans Dokploy

**Databases → Create → MySQL**.

- Nom de la base : `visacredit`
- Utilisateur : `visacredit`
- Mot de passe : généré par Dokploy

**Ne réutilisez pas la base `waofin`.** Une base distincte garantit qu'aucune
opération sur Visacredit ne peut atteindre les données d'épargne.

Notez l'hôte **interne** que Dokploy affiche : c'est lui qui va dans
`DATABASE_URL`, pas l'adresse publique.

---

## 3. Créer l'application

**Applications → Create → Compose**, en pointant sur le dépôt Git et sur le
fichier `docker-compose.prod.yml`.

### Variables d'environnement

Onglet *Environment* de Dokploy. Le gabarit complet est
[`.env.example`](.env.example) — remplissez-en une copie et collez-la.

> ⚠️ **Les deux secrets de webhook sont obligatoires.**
> `KKIAPAY_WEBHOOK_SECRET` et `FEDAPAY_WEBHOOK_SECRET` sont injectés par
> autowiring dans `SignatureWebhookService`. Si l'une des lignes manque, le
> conteneur Symfony **refuse de démarrer** — mettez une valeur bidon plutôt que
> d'omettre la ligne. Même chose pour `DEFAULT_URI`, lu par le routeur.

La liste exhaustive de ce que le backend exige au démarrage :

| Variable | Remarque |
|---|---|
| `APP_ENV`, `APP_DEBUG`, `APP_SECRET` | `APP_SECRET` : 32 caractères aléatoires |
| `DATABASE_URL` | hôte **interne** de la MySQL Dokploy |
| `DEFAULT_URI` | `https://visacredit.waofin.co` |
| `CORS_ALLOW_ORIGIN` | laisser la valeur par défaut : inutilisé ici |
| `JWT_SECRET_KEY`, `JWT_PUBLIC_KEY`, `JWT_PASSPHRASE` | la paire est générée au boot |
| `KKIAPAY_PUBLIC_KEY`, `KKIAPAY_PRIVATE_KEY`, `KKIAPAY_WEBHOOK_SECRET`, `KKIAPAY_SANDBOX`, `KKIAPAY_API_URL` | l'URL est `https://api.kkiapay.me/api/v1` |
| `FEDAPAY_PUBLIC_KEY`, `FEDAPAY_SECRET_KEY`, `FEDAPAY_WEBHOOK_SECRET`, `FEDAPAY_SANDBOX` | |
| `NEXT_PUBLIC_LIEN_APK` | frontend, facultatif — voir § 7 |

### Domaines

Le compose expose deux services. **Domains → Add** deux fois :

| Service | Domaine | Container Port | Sert à |
|---|---|---|---|
| `frontend` | `visacredit.waofin.co` | **3000** | le web |
| `backend` | `api.visacredit.waofin.co` | **80** | l'application mobile |

HTTPS activé dans les deux cas (Traefik obtient les certificats).

Les deux noms doivent pointer sur l'IP du serveur **côté DNS avant le
déploiement**, sinon l'émission du certificat échoue.

> Le frontend ne publie aucun port sur l'hôte, contrairement à celui d'epargne
> qui occupe le `8082`. Rien à ouvrir au pare-feu.

---

## 4. Ce que fait le premier démarrage

`backend/docker-entrypoint.sh` s'exécute à chaque boot, mais reste sans effet
une fois la base installée :

1. génère la paire de clés JWT si elle est absente ;
2. **importe `boutiq.sql` uniquement si la table `users` n'existe pas** — donc
   au tout premier démarrage. Un redémarrage ultérieur n'écrase jamais les
   données ;
3. vide le cache de production.

L'import apporte le schéma complet **et** les deux comptes de démonstration
(voir `readme.md`).

---

## 5. Vérifier

```bash
# Le web répond et sert la page d'accueil.
curl -I https://visacredit.waofin.co

# Le proxy /api atteint bien Symfony : 401 = la route existe et exige un jeton.
curl -i https://visacredit.waofin.co/api/auth/me

# Le même test en direct sur l'API, celle que vise le mobile.
curl -i https://api.visacredit.waofin.co/api/auth/me
```

Puis, dans un navigateur, ouvrir `https://visacredit.waofin.co` et se connecter
avec `0190000001` / `grossiste2026` (voir `readme.md`).

Si la page s'affiche mais que la connexion échoue, regardez les logs du service
`frontend` dans Dokploy : une erreur de proxy y apparaît, alors que la console
du navigateur ne montrerait qu'un 500 opaque.

---

## 6. Redéployer

- **Changer un secret, une clé de passerelle, `DATABASE_URL`** → modifier la
  variable dans Dokploy puis *Restart*. Ces valeurs sont lues au démarrage.
- **Changer `NEXT_PUBLIC_LIEN_APK` ou un domaine** → *Deploy*. Les variables
  `NEXT_PUBLIC_*` sont figées dans le bundle JavaScript au moment du build ; un
  redémarrage ne les prendrait pas.

---

## 7. Construire l'APK

Une fois l'API en ligne, renseignez son adresse dans `mobile/eas.json`
(`EXPO_PUBLIC_API_URL`, profils `apk` et `production`) — c'est
`https://api.visacredit.waofin.co`, le domaine du service `backend`, **pas**
celui du web. Puis :

```bash
cd mobile
npx eas build --platform android --profile apk
```

EAS construit dans le cloud — aucun SDK Android n'est nécessaire en local — et
fournit un lien de téléchargement du `.apk` à la fin.

> **L'adresse de l'API est figée dans le bundle au moment du build.** Changer de
> domaine impose de reconstruire l'APK. C'est aussi pourquoi `EXPO_PUBLIC_API_URL`
> doit être renseignée : sans elle, l'application déduit l'adresse du serveur
> Metro, ce qui n'existe pas dans un APK installé.

Reportez enfin le lien de téléchargement émis par EAS dans `NEXT_PUBLIC_LIEN_APK`
et relancez un *Deploy* du service `frontend` : le bouton « Télécharger
l'application » de la page d'accueil s'active alors.

---

## Rappel de sécurité

`backend/.env` contient les clés privées KkiaPay et FedaPay. Il ne doit **pas**
être versionné : les valeurs de production se saisissent uniquement dans
l'interface Dokploy.
