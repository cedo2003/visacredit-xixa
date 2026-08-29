# Déploiement de Visacredit XIXA sur le serveur waofin

Le serveur héberge déjà **epargne-africaVR** sous Dokploy. Visacredit XIXA s'y
installe à côté, sans rien toucher à l'existant.

**Ce qu'on déploie : le web, et lui seul.** Trois conteneurs — le frontend
Next.js, l'API Symfony, la base MariaDB — dont un seul est exposé.

L'application mobile n'a rien à faire ici : elle est autonome, avec sa propre
base SQLite embarquée, et ne joint aucun serveur (voir `mobile/src/lib/api.ts`).

---

## L'adresse

```
http://13.140.134.229:8090
```

Pas de nom de domaine, pas de HTTPS : c'est un déploiement direct sur l'IP du
serveur. Le passage à un domaine se fera plus tard, en une étape (voir la fin).

---

## Pourquoi la cohabitation est sûre

| Ressource | epargne-africaVR | Visacredit XIXA | Risque de collision |
|---|---|---|---|
| Application Dokploy | la sienne | **une nouvelle** | aucun |
| Base de données | `waofin`, gérée par Dokploy | **MariaDB embarquée dans le compose** | aucun — conteneur et volume distincts |
| Port hôte publié | `8082` (frontend) | **`8090`** (frontend) | aucun |
| Réseau Docker | `dokploy-network` | **un réseau privé** | aucun — et c'est nécessaire, voir ci-dessous |

**Rien n'est partagé, réseau compris — et ce point n'est pas cosmétique.**

Les deux projets ont un service nommé `backend`. Sur le `dokploy-network`
commun, chaque service publie son nom comme alias DNS : l'alias `backend` y
désignait donc deux conteneurs à la fois, et `http://backend` tombait sur l'un
ou sur l'autre. Notre frontend a ainsi interrogé l'API d'epargne pendant tout un
déploiement — elle répondait 404 sur nos routes, 401 sur les siennes, 500 à la
connexion. Panne difficile à lire : les réponses avaient la bonne allure
(FrankenPHP, PHP 8.3, JSON d'erreur Symfony), elles venaient simplement de la
mauvaise application.

Sur un réseau privé, `backend` et `db` ne désignent que nos conteneurs.

---

## L'architecture, en une phrase

**Un seul conteneur est joignable de l'extérieur : le frontend.** Il relaie
`/api/*` vers l'API Symfony par le réseau interne Docker
(`frontend/next.config.ts`), comme le fait epargne-africaVR. Le navigateur ne
voit donc qu'une seule origine — **aucun CORS à régler** — et ni l'API ni la
base n'exposent la moindre porte sur Internet.

```
navigateur ─── http://13.140.134.229:8090 ──► frontend:3000
                                                   │ (proxy /api)
                                     réseau interne ├──► backend:80
                                                    └──► db:3306
```

---

## 1. Le code est déjà publié

Dépôt : **https://github.com/cedo2003/visacredit-xixa** (privé, branche `main`).

Pour publier une mise à jour :

```bash
cd /c/xampp/htdocs/Boutiqueo
git add .
git commit -m "..."
git push
```

Puis *Deploy* dans Dokploy. Le `.gitignore` exclut `backend/.env`, le `.env` de
la racine écrit par Dokploy, `backend/config/jwt/`, `**/node_modules` et
`backend/vendor`. Seul le gabarit vide `.env.example` est versionné.

---

## 2. Créer l'application dans Dokploy

**Applications → Create → Compose**, en pointant sur le dépôt Git et sur le
fichier `docker-compose.prod.yml`.

Il n'y a **ni base à créer** dans l'interface (le compose s'en charge), **ni
domaine à déclarer** (le port est publié directement).

### Variables d'environnement

Onglet *Environment*. Le gabarit complet est [`.env.example`](.env.example) —
remplissez-en une copie et collez-la. Sept valeurs à renseigner :

| Variable | Où la trouver |
|---|---|
| `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD` | à inventer — **sans `@`, `:` ni `/`** |
| `APP_SECRET`, `JWT_PASSPHRASE` | à générer : `php -r "echo bin2hex(random_bytes(16));"` |
| `KKIAPAY_PUBLIC_KEY`, `KKIAPAY_PRIVATE_KEY`, `KKIAPAY_WEBHOOK_SECRET` | votre `backend/.env` local |
| `FEDAPAY_PUBLIC_KEY`, `FEDAPAY_SECRET_KEY`, `FEDAPAY_WEBHOOK_SECRET` | votre `backend/.env` local |

> ⚠️ **Les deux secrets de webhook sont obligatoires.** Ils sont injectés par
> autowiring dans `SignatureWebhookService` : si l'une des lignes manque, le
> conteneur Symfony **refuse de démarrer**. Mettez une valeur bidon plutôt que
> d'omettre la ligne. Même chose pour `DEFAULT_URI`, lu par le routeur.

`DATABASE_URL` n'est pas à saisir : le compose la construit à partir de
`MYSQL_PASSWORD`, l'hôte étant le service `db`.

### Ouvrir le port 8090

Le serveur est sur AWS : ajoutez une règle entrante **TCP 8090** dans son groupe
de sécurité. Sans elle, le conteneur tournera sans que rien ne réponde.

---

## 3. Ce que fait le premier démarrage

**MariaDB importe `boutiq.sql` elle-même.** Le fichier est monté dans
`/docker-entrypoint-initdb.d/` : l'image l'exécute une seule fois, quand le
volume est vide, et **avant d'accepter la moindre connexion**. Pas de course
entre conteneurs, et un import qui échoue fait échouer la base — visible tout de
suite, au lieu d'une application qui démarre sans schéma. L'import apporte le
schéma complet **et** les deux comptes de démonstration (voir `readme.md`).

`backend/docker-entrypoint.sh` prend ensuite le relais, et reste rejouable sans
dommage :

1. génère la paire de clés JWT si elle est absente ;
2. attend que la base réponde, puis **vérifie que le schéma est là** — et refuse
   de démarrer sinon, plutôt que de servir des 500 sans explication ;
3. **applique les migrations Doctrine.** `boutiq.sql` est un instantané daté du
   14/08/2026 : il ne contient pas les évolutions postérieures. La migration du
   19/08 ajoute notamment `users.registre_commerce`, que l'entité `User` mappe —
   sans elle, Doctrine sélectionne une colonne inexistante et **toute** lecture
   d'un utilisateur échoue, donc toute connexion ;
4. lance FrankenPHP. Le cache de production, lui, est figé dans l'image par
   `cache:warmup` au build : rien à vider au démarrage.

Les données vivent dans le volume nommé `visacredit-donnees`. Elles survivent aux
redéploiements et aux reconstructions d'image ; supprimer le volume les efface —
et provoque un nouvel import au démarrage suivant.

---

## 4. Vérifier

```bash
# La page d'accueil répond.
curl -I http://13.140.134.229:8090

# Le proxy /api atteint Symfony : 401 = la route existe et exige un jeton.
curl -i http://13.140.134.229:8090/api/auth/me
```

Puis, dans un navigateur, ouvrir `http://13.140.134.229:8090` et se connecter
avec `0190000001` / `grossiste2026` (voir `readme.md`).

En cas de page blanche ou d'erreur à la connexion, les logs Dokploy dans l'ordre
utile : `db` (a-t-elle démarré ?), `backend` (l'import a-t-il réussi ? une
variable manque-t-elle ?), `frontend` (le proxy joint-il le backend ?).

---

## 5. Redéployer

- **Changer un secret, une clé de passerelle** → modifier la variable dans
  Dokploy puis *Restart*. Ces valeurs sont lues au démarrage.
- **Changer `NEXT_PUBLIC_LIEN_APK`** → *Deploy*. Les variables `NEXT_PUBLIC_*`
  sont figées dans le bundle JavaScript au moment du build ; un redémarrage ne
  les prendrait pas.
- **Publier du code** → `git push`, puis *Deploy*.

---

## 6. Plus tard : passer à un domaine

Le DNS est déjà prêt — `*.waofin.co` pointe sur le serveur, donc
`visacredit.waofin.co` résout sans rien ajouter. Le jour venu :

1. dans `docker-compose.prod.yml`, retirer le bloc `ports:` du service
   `frontend` et le rattacher à `dokploy-network` **en plus** du réseau privé,
   pour que Traefik puisse l'atteindre — en lui donnant un alias explicite,
   distinct de `frontend`, pour ne pas rejouer la collision de noms ;
2. dans Dokploy, **Domains → Add** sur le service `frontend` :
   `visacredit.waofin.co`, **Container Port 3000**, HTTPS activé ;
3. passer `DEFAULT_URI` à `https://visacredit.waofin.co` ;
4. *Deploy*, puis refermer le port 8090 dans le groupe de sécurité.

Rien d'autre ne bouge : le proxy `/api` étant interne, il n'y a toujours pas de
CORS à régler.

---

## Rappel de sécurité

`backend/.env` contient les clés privées KkiaPay et FedaPay. Il ne doit **pas**
être versionné : les valeurs de production se saisissent uniquement dans
l'interface Dokploy.

Tant que l'accès se fait en HTTP simple sur une IP, les échanges — jeton JWT
compris — circulent en clair. C'est acceptable pour une mise en ligne de test,
pas pour des données réelles : le passage au domaine HTTPS (§ 6) est à faire
avant toute exploitation.
