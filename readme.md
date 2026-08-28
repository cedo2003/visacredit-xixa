# Visacredit XIXA — Guide de Connexion

Plateforme B2B de gestion de boutiques et magasins.

---

## 👥 Comptes de démonstration

La base contient un jeu de données de démonstration : produits, clients, ventes,
créances, commandes B2B, crédits fournisseurs, dépenses, retraits et notations.
Les deux comptes sont liés entre eux — les commandes du détaillant arrivent chez
le grossiste.
:d

### 📦 Compte Grossiste — Comptoir Sodji

Vend en gros à des détaillants : stocks, validation des commandes reçues,
encaissement des créances.

- **Téléphone** : `0190000001`
- **Mot de passe** : `grossiste2026`

**Ce que vous y trouverez** :

- 8 produits en stock, dont 2 sous le seuil d'alerte
- 3 clients détaillants et 4 ventes
- 2 créances clients en cours (75 000 FCFA)
- 3 commandes reçues de Boutique Ayaba, à différents stades
- Solde de caisse : environ 173 000 FCFA

### 🏪 Compte Détaillant — Boutique Ayaba

Achète chez les grossistes et revend aux clients finaux : recherche de produits,
commandes B2B, crédits fournisseurs.

- **Téléphone** : `0190000002`
- **Mot de passe** : `detaillant2026`

**Ce que vous y trouverez** :

- 7 produits au détail, dont 2 en alerte de stock
- 5 clients et 7 ventes
- 2 créances clients, dont **une échéance déjà dépassée** (badge « En retard »)
- 4 commandes fournisseurs : une payée, une à crédit en attente de paiement,
  une en attente de validation, une auprès d'un fournisseur hors plateforme
- 6 crédits fournisseurs, réglés en espèces, en mobile money, sur le solde,
  ou sans moyen tracé pour les plus anciens
- Solde de caisse : environ 25 850 FCFA

---

## 🚀 Démarrage rapide

1. Lancez l'API et le frontend avec **`demarrer.bat`** (ou `demarrer-mobile.bat`
   pour l'application mobile).
2. Cliquez sur **Connexion**.
3. Entrez l'un des numéros de téléphone ci-dessus et son mot de passe.
4. Cliquez sur **Se connecter**.

---

## ℹ️ À savoir

- **L'IFU est demandé à l'inscription, mais pas exigé.** Une boutique qui n'a
  pas encore son numéro peut ouvrir son compte et le renseigner ensuite : un
  bandeau l'y invite, et Paramètres, lui, l'exige. Les deux comptes de
  démonstration en ont déjà un.
- **Le solde affiché est une position de caisse calculée** (ventes encaissées −
  dépenses − retraits + versements). Les fonds encaissés en mobile money sont
  détenus chez l'agrégateur de paiement : Visacredit XIXA ne conserve aucun
  fonds.
- **La langue** se règle dans **Paramètres → Langue** : français (par défaut)
  ou anglais, sur le web comme sur mobile. Comme le thème, le choix est propre
  à l'appareil.
- **Le thème clair ou sombre** se règle dans **Paramètres → Apparence**, sur le
  web comme sur mobile. Trois choix : *Système* (suit l'appareil), *Clair*,
  *Sombre*. Le réglage est propre à l'appareil, pas au compte : il s'applique
  avant la connexion et ne suit pas la boutique d'un poste à l'autre.
- **Les numéros de facture et de commande** conservent le préfixe historique
  `BOU-` / `CMD-`.

---

## 🔄 Réinitialiser les données

Le jeu de données peut être rechargé en réimportant `boutiq.sql`, qui contient
le schéma à jour (IFU, date de naissance, adresse, moyen de règlement). Les
sauvegardes horodatées `sauvegarde-boutiq-*.sql` à la racine contiennent les
états antérieurs.
