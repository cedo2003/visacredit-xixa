/**
 * Données de départ de la base locale.
 *
 * Export de la base MySQL de démonstration, figé à la génération de ce fichier.
 * Il n'est joué qu'une fois, au tout premier lancement de l'application : les
 * modifications faites ensuite par l'utilisateur vivent dans SQLite et ne sont
 * jamais écrasées.
 *
 * Les mots de passe ont été rehachés en SHA-256 salé par le téléphone :
 * le bcrypt de Symfony n'est pas vérifiable sans le serveur. Voir modules/auth.
 *
 * FICHIER GÉNÉRÉ, puis retouché à la main lors du passage au catalogue commun de
 * catégories (`categories.user_id` nul) et à l'ajout du registre du commerce.
 * Toute régénération depuis MySQL doit reprendre ces deux points.
 */

export const AMORCAGE: Record<string, Record<string, unknown>[]> = {
  "users": [
    {
      "id": 1,
      "nom": "SODJI",
      "prenom": "Bernard",
      "telephone": "0190000001",
      "email": "contact@comptoir-sodji.bj",
      "ifu": "3201900000011",
      "registre_commerce": "RB/COT/21 B 4517",
      "date_naissance": "1978-03-11 23:00:00",
      "adresse": "Zone industrielle, Godomey, Abomey-Calavi",
      "password_hash": "d05a6380e3ab6a6ce0826f37416831631cc49208761e56c18ac63238dc1bec27",
      "nom_boutique": "Comptoir Sodji",
      "etatEts": 1,
      "created_at": "2026-08-14 20:40:22",
      "solde": "0.00"
    },
    {
      "id": 2,
      "nom": "AGOSSOU",
      "prenom": "Rollande",
      "telephone": "0190000002",
      "email": "rollande@boutique-ayaba.bj",
      "ifu": "3201900000022",
      // Volontairement sans RCCM : illustre la limitation des retraits à « 1 jour ».
      "registre_commerce": null,
      "date_naissance": "1992-11-04 23:00:00",
      "adresse": "Marché Dantokpa, Cotonou",
      "password_hash": "df80433b923941d1e5065dcd1859d8b49fb6ad811247a8aefdc51ca968bc84f0",
      "nom_boutique": "Boutique Ayaba",
      "etatEts": 0,
      "created_at": "2026-08-14 20:41:16",
      "solde": "0.00"
    }
  ],
  "user_params": [
    {
      "user_id": 1,
      "frequence_retrait": "7 jours"
    },
    {
      "user_id": 2,
      // Sans registre du commerce, seule la fréquence quotidienne est ouverte.
      "frequence_retrait": "1 jour"
    }
  ],
  // Catalogue commun défini par la plateforme : `user_id` nul, mêmes libellés
  // et mêmes identifiants que le catalogue livré côté serveur.
  "categories": [
    { "id": 1, "user_id": null, "nom": "Agriculture et élevage", "created_at": "2026-08-14 19:43:09" },
    { "id": 2, "user_id": null, "nom": "Boissons", "created_at": "2026-08-14 19:43:09" },
    { "id": 3, "user_id": null, "nom": "Carburants et lubrifiants", "created_at": "2026-08-14 19:43:09" },
    { "id": 4, "user_id": null, "nom": "Céréales et féculents", "created_at": "2026-08-14 19:43:09" },
    { "id": 5, "user_id": null, "nom": "Cosmétiques et beauté", "created_at": "2026-08-14 19:43:09" },
    { "id": 6, "user_id": null, "nom": "Divers", "created_at": "2026-08-14 19:43:09" },
    { "id": 7, "user_id": null, "nom": "Électroménager", "created_at": "2026-08-14 19:43:09" },
    { "id": 8, "user_id": null, "nom": "Électronique et téléphonie", "created_at": "2026-08-14 19:43:09" },
    { "id": 9, "user_id": null, "nom": "Épicerie générale", "created_at": "2026-08-14 19:43:09" },
    { "id": 10, "user_id": null, "nom": "Fournitures scolaires et bureautique", "created_at": "2026-08-14 19:43:09" },
    { "id": 11, "user_id": null, "nom": "Habillement et chaussures", "created_at": "2026-08-14 19:43:09" },
    { "id": 12, "user_id": null, "nom": "Huiles et condiments", "created_at": "2026-08-14 19:43:09" },
    { "id": 13, "user_id": null, "nom": "Hygiène et entretien", "created_at": "2026-08-14 19:43:09" },
    { "id": 14, "user_id": null, "nom": "Matériaux de construction", "created_at": "2026-08-14 19:43:09" },
    { "id": 15, "user_id": null, "nom": "Produits frais", "created_at": "2026-08-14 19:43:09" },
    { "id": 16, "user_id": null, "nom": "Quincaillerie et outillage", "created_at": "2026-08-14 19:43:09" },
    { "id": 17, "user_id": null, "nom": "Santé et parapharmacie", "created_at": "2026-08-14 19:43:09" }
  ],
  "produits": [
    {
      "id": 1,
      "user_id": 1,
      "categorie_id": 4,
      "nom": "Sac de riz parfumé 25 kg",
      "prix_achat": "16500.00",
      "prix_vente": "19500.00",
      "stock": 120,
      "seuil_alerte": 20,
      "description": "Riz importé, sac de 25 kg",
      "image_path": null,
      "created_at": "2026-05-16 19:43:09"
    },
    {
      "id": 2,
      "user_id": 1,
      "categorie_id": 4,
      "nom": "Sac de maïs 50 kg",
      "prix_achat": "13000.00",
      "prix_vente": "15500.00",
      "stock": 64,
      "seuil_alerte": 15,
      "description": "Maïs local séché",
      "image_path": null,
      "created_at": "2026-05-18 19:43:09"
    },
    {
      "id": 3,
      "user_id": 1,
      "categorie_id": 12,
      "nom": "Bidon d'huile 20 L",
      "prix_achat": "18000.00",
      "prix_vente": "21000.00",
      "stock": 38,
      "seuil_alerte": 10,
      "description": "Huile végétale raffinée",
      "image_path": null,
      "created_at": "2026-05-26 19:43:09"
    },
    {
      "id": 4,
      "user_id": 1,
      "categorie_id": 12,
      "nom": "Carton de tomate concentrée",
      "prix_achat": "9500.00",
      "prix_vente": "11500.00",
      "stock": 8,
      "seuil_alerte": 12,
      "description": "Boîtes de 400 g, carton de 24",
      "image_path": null,
      "created_at": "2026-05-31 19:43:09"
    },
    {
      "id": 5,
      "user_id": 1,
      "categorie_id": 9,
      "nom": "Sac de sucre 50 kg",
      "prix_achat": "22000.00",
      "prix_vente": "25500.00",
      "stock": 45,
      "seuil_alerte": 10,
      "description": "Sucre en poudre",
      "image_path": null,
      "created_at": "2026-06-15 19:43:09"
    },
    {
      "id": 6,
      "user_id": 1,
      "categorie_id": 2,
      "nom": "Casier de sucrerie 24 bouteilles",
      "prix_achat": "4200.00",
      "prix_vente": "5400.00",
      "stock": 96,
      "seuil_alerte": 24,
      "description": "Assortiment de boissons gazeuses",
      "image_path": null,
      "created_at": "2026-06-20 19:43:09"
    },
    {
      "id": 7,
      "user_id": 1,
      "categorie_id": 13,
      "nom": "Carton de savon de ménage",
      "prix_achat": "6800.00",
      "prix_vente": "8200.00",
      "stock": 6,
      "seuil_alerte": 15,
      "description": "Savon en barre, carton de 20",
      "image_path": null,
      "created_at": "2026-07-05 19:43:09"
    },
    {
      "id": 8,
      "user_id": 1,
      "categorie_id": 2,
      "nom": "Pack d'eau minérale 1,5 L",
      "prix_achat": "1800.00",
      "prix_vente": "2400.00",
      "stock": 210,
      "seuil_alerte": 30,
      "description": "Pack de 6 bouteilles",
      "image_path": null,
      "created_at": "2026-07-15 19:43:09"
    },
    {
      "id": 9,
      "user_id": 2,
      "categorie_id": 4,
      "nom": "Riz au détail (bol)",
      "prix_achat": "780.00",
      "prix_vente": "1000.00",
      "stock": 145,
      "seuil_alerte": 30,
      "description": "Vendu au bol",
      "image_path": null,
      "created_at": "2026-06-05 19:43:09"
    },
    {
      "id": 10,
      "user_id": 2,
      "categorie_id": 12,
      "nom": "Huile au détail (litre)",
      "prix_achat": "1050.00",
      "prix_vente": "1350.00",
      "stock": 52,
      "seuil_alerte": 15,
      "description": "Servie au litre",
      "image_path": null,
      "created_at": "2026-06-07 19:43:09"
    },
    {
      "id": 11,
      "user_id": 2,
      "categorie_id": 9,
      "nom": "Sucre au détail (kg)",
      "prix_achat": "520.00",
      "prix_vente": "700.00",
      "stock": 74,
      "seuil_alerte": 20,
      "description": "Vendu au kilo",
      "image_path": null,
      "created_at": "2026-06-10 19:43:09"
    },
    {
      "id": 12,
      "user_id": 2,
      "categorie_id": 2,
      "nom": "Bouteille de sucrerie",
      "prix_achat": "225.00",
      "prix_vente": "350.00",
      "stock": 84,
      "seuil_alerte": 24,
      "description": "Boisson gazeuse 33 cl",
      "image_path": null,
      "created_at": "2026-06-15 19:43:09"
    },
    {
      "id": 13,
      "user_id": 2,
      "categorie_id": 2,
      "nom": "Bouteille d'eau 1,5 L",
      "prix_achat": "300.00",
      "prix_vente": "500.00",
      "stock": 11,
      "seuil_alerte": 24,
      "description": "Eau minérale",
      "image_path": null,
      "created_at": "2026-06-25 19:43:09"
    },
    {
      "id": 14,
      "user_id": 2,
      "categorie_id": 13,
      "nom": "Savon de ménage (barre)",
      "prix_achat": "340.00",
      "prix_vente": "500.00",
      "stock": 9,
      "seuil_alerte": 20,
      "description": "Barre de savon",
      "image_path": null,
      "created_at": "2026-06-30 19:43:09"
    },
    {
      "id": 15,
      "user_id": 2,
      "categorie_id": 12,
      "nom": "Boîte de tomate 400 g",
      "prix_achat": "400.00",
      "prix_vente": "550.00",
      "stock": 63,
      "seuil_alerte": 18,
      "description": "Tomate concentrée",
      "image_path": null,
      "created_at": "2026-07-10 19:43:09"
    }
  ],
  "clients": [
    {
      "id": 1,
      "user_id": 1,
      "nom_complet": "Boutique Ayaba",
      "telephone": "0190000002",
      "email": "rollande@boutique-ayaba.bj",
      "adresse": "Marché Dantokpa, Cotonou",
      "notes": "Cliente régulière, paie à temps",
      "created_at": "2026-06-15 19:43:09"
    },
    {
      "id": 2,
      "user_id": 1,
      "nom_complet": "Alimentation Gbêdji",
      "telephone": "0197112233",
      "email": null,
      "adresse": "Vêdoko, Cotonou",
      "notes": "Commande surtout du riz",
      "created_at": "2026-06-30 19:43:09"
    },
    {
      "id": 3,
      "user_id": 1,
      "nom_complet": "Kiosque Sènou",
      "telephone": "0166554477",
      "email": null,
      "adresse": "Sènou, Porto-Novo",
      "notes": null,
      "created_at": "2026-07-25 19:43:09"
    },
    {
      "id": 4,
      "user_id": 2,
      "nom_complet": "Mariam ADJAHO",
      "telephone": "0195223344",
      "email": null,
      "adresse": "Akpakpa, Cotonou",
      "notes": "Achète chaque semaine",
      "created_at": "2026-06-20 19:43:09"
    },
    {
      "id": 5,
      "user_id": 2,
      "nom_complet": "Restaurant Chez Fifa",
      "telephone": "0164889900",
      "email": "chezfifa@mail.bj",
      "adresse": "Fidjrossè, Cotonou",
      "notes": "Gros volumes, paie en fin de mois",
      "created_at": "2026-06-25 19:43:09"
    },
    {
      "id": 6,
      "user_id": 2,
      "nom_complet": "Justin HOUNKPATIN",
      "telephone": "0198334455",
      "email": null,
      "adresse": "Cadjèhoun, Cotonou",
      "notes": null,
      "created_at": "2026-07-15 19:43:09"
    },
    {
      "id": 7,
      "user_id": 2,
      "nom_complet": "Épicerie du Carrefour",
      "telephone": "0167445566",
      "email": null,
      "adresse": "Godomey",
      "notes": "Revend une partie",
      "created_at": "2026-07-30 19:43:09"
    },
    {
      "id": 8,
      "user_id": 2,
      "nom_complet": "Cliente de passage",
      "telephone": "0100000000",
      "email": null,
      "adresse": null,
      "notes": "Fiche générique",
      "created_at": "2026-08-04 19:43:09"
    }
  ],
  "ventes": [
    {
      "id": 1,
      "user_id": 1,
      "client_id": 1,
      "numero_facture": "BOU-20260802-001",
      "montant_total": "390000.00",
      "montant_paye": "390000.00",
      "statut": "en_cours",
      "date_vente": "2026-08-02 19:43:09",
      "mode_paiement": "especes",
      "telephone_client": null,
      "transaction_id": null,
      "statut_paiement": "paye",
      "frais_client": "0.00",
      "frais_vendeur": "0.00",
      "fedapay_identifiant": null,
      "fedapay_frais_client": 0,
      "fedapay_frais_vendeur": 0
    },
    {
      "id": 2,
      "user_id": 1,
      "client_id": 2,
      "numero_facture": "BOU-20260806-001",
      "montant_total": "155000.00",
      "montant_paye": "80000.00",
      "statut": "en_cours",
      "date_vente": "2026-08-06 19:43:09",
      "mode_paiement": "especes",
      "telephone_client": null,
      "transaction_id": null,
      "statut_paiement": "paye",
      "frais_client": "0.00",
      "frais_vendeur": "0.00",
      "fedapay_identifiant": null,
      "fedapay_frais_client": 0,
      "fedapay_frais_vendeur": 0
    },
    {
      "id": 3,
      "user_id": 1,
      "client_id": 3,
      "numero_facture": "BOU-20260811-001",
      "montant_total": "108000.00",
      "montant_paye": "108000.00",
      "statut": "en_cours",
      "date_vente": "2026-08-11 19:43:09",
      "mode_paiement": "mobile_money",
      "telephone_client": "0166554477",
      "transaction_id": null,
      "statut_paiement": "paye",
      "frais_client": "2052.00",
      "frais_vendeur": "0.00",
      "fedapay_identifiant": null,
      "fedapay_frais_client": 0,
      "fedapay_frais_vendeur": 0
    },
    {
      "id": 4,
      "user_id": 1,
      "client_id": 1,
      "numero_facture": "BOU-20260814-001",
      "montant_total": "102000.00",
      "montant_paye": "102000.00",
      "statut": "en_cours",
      "date_vente": "2026-08-14 15:43:09",
      "mode_paiement": "especes",
      "telephone_client": null,
      "transaction_id": null,
      "statut_paiement": "paye",
      "frais_client": "0.00",
      "frais_vendeur": "0.00",
      "fedapay_identifiant": null,
      "fedapay_frais_client": 0,
      "fedapay_frais_vendeur": 0
    },
    {
      "id": 5,
      "user_id": 2,
      "client_id": 4,
      "numero_facture": "BOU-20260725-001",
      "montant_total": "8600.00",
      "montant_paye": "8600.00",
      "statut": "en_cours",
      "date_vente": "2026-07-25 19:43:10",
      "mode_paiement": "especes",
      "telephone_client": null,
      "transaction_id": null,
      "statut_paiement": "paye",
      "frais_client": "0.00",
      "frais_vendeur": "0.00",
      "fedapay_identifiant": null,
      "fedapay_frais_client": 0,
      "fedapay_frais_vendeur": 0
    },
    {
      "id": 6,
      "user_id": 2,
      "client_id": 5,
      "numero_facture": "BOU-20260731-001",
      "montant_total": "47500.00",
      "montant_paye": "20000.00",
      "statut": "en_cours",
      "date_vente": "2026-07-31 19:43:10",
      "mode_paiement": "especes",
      "telephone_client": null,
      "transaction_id": null,
      "statut_paiement": "paye",
      "frais_client": "0.00",
      "frais_vendeur": "0.00",
      "fedapay_identifiant": null,
      "fedapay_frais_client": 0,
      "fedapay_frais_vendeur": 0
    },
    {
      "id": 7,
      "user_id": 2,
      "client_id": 6,
      "numero_facture": "BOU-20260805-001",
      "montant_total": "5250.00",
      "montant_paye": "5250.00",
      "statut": "en_cours",
      "date_vente": "2026-08-05 19:43:10",
      "mode_paiement": "mobile_money",
      "telephone_client": "0198334455",
      "transaction_id": null,
      "statut_paiement": "paye",
      "frais_client": "100.00",
      "frais_vendeur": "0.00",
      "fedapay_identifiant": null,
      "fedapay_frais_client": 0,
      "fedapay_frais_vendeur": 0
    },
    {
      "id": 8,
      "user_id": 2,
      "client_id": 7,
      "numero_facture": "BOU-20260809-001",
      "montant_total": "27500.00",
      "montant_paye": "27500.00",
      "statut": "en_cours",
      "date_vente": "2026-08-09 19:43:10",
      "mode_paiement": "especes",
      "telephone_client": null,
      "transaction_id": null,
      "statut_paiement": "paye",
      "frais_client": "0.00",
      "frais_vendeur": "0.00",
      "fedapay_identifiant": null,
      "fedapay_frais_client": 0,
      "fedapay_frais_vendeur": 0
    },
    {
      "id": 9,
      "user_id": 2,
      "client_id": null,
      "numero_facture": "BOU-20260812-001",
      "montant_total": "3200.00",
      "montant_paye": "3200.00",
      "statut": "en_cours",
      "date_vente": "2026-08-12 19:43:10",
      "mode_paiement": "especes",
      "telephone_client": null,
      "transaction_id": null,
      "statut_paiement": "paye",
      "frais_client": "0.00",
      "frais_vendeur": "0.00",
      "fedapay_identifiant": null,
      "fedapay_frais_client": 0,
      "fedapay_frais_vendeur": 0
    },
    {
      "id": 10,
      "user_id": 2,
      "client_id": 4,
      "numero_facture": "BOU-20260814-001",
      "montant_total": "6900.00",
      "montant_paye": "6900.00",
      "statut": "en_cours",
      "date_vente": "2026-08-14 13:43:10",
      "mode_paiement": "especes",
      "telephone_client": null,
      "transaction_id": null,
      "statut_paiement": "paye",
      "frais_client": "0.00",
      "frais_vendeur": "0.00",
      "fedapay_identifiant": null,
      "fedapay_frais_client": 0,
      "fedapay_frais_vendeur": 0
    },
    {
      "id": 11,
      "user_id": 2,
      "client_id": null,
      "numero_facture": "BOU-20260814-002",
      "montant_total": "2100.00",
      "montant_paye": "2100.00",
      "statut": "en_cours",
      "date_vente": "2026-08-14 17:43:10",
      "mode_paiement": "especes",
      "telephone_client": null,
      "transaction_id": null,
      "statut_paiement": "paye",
      "frais_client": "0.00",
      "frais_vendeur": "0.00",
      "fedapay_identifiant": null,
      "fedapay_frais_client": 0,
      "fedapay_frais_vendeur": 0
    }
  ],
  "vente_details": [
    {
      "id": 1,
      "vente_id": 1,
      "produit_id": 1,
      "quantite": 20,
      "prix_unitaire": "19500.00"
    },
    {
      "id": 2,
      "vente_id": 2,
      "produit_id": 2,
      "quantite": 10,
      "prix_unitaire": "15500.00"
    },
    {
      "id": 3,
      "vente_id": 3,
      "produit_id": 3,
      "quantite": 4,
      "prix_unitaire": "21000.00"
    },
    {
      "id": 4,
      "vente_id": 3,
      "produit_id": 6,
      "quantite": 4,
      "prix_unitaire": "5400.00"
    },
    {
      "id": 5,
      "vente_id": 4,
      "produit_id": 5,
      "quantite": 4,
      "prix_unitaire": "25500.00"
    },
    {
      "id": 6,
      "vente_id": 5,
      "produit_id": 9,
      "quantite": 6,
      "prix_unitaire": "1000.00"
    },
    {
      "id": 7,
      "vente_id": 5,
      "produit_id": 11,
      "quantite": 2,
      "prix_unitaire": "700.00"
    },
    {
      "id": 8,
      "vente_id": 5,
      "produit_id": 12,
      "quantite": 4,
      "prix_unitaire": "350.00"
    },
    {
      "id": 9,
      "vente_id": 6,
      "produit_id": 9,
      "quantite": 25,
      "prix_unitaire": "1000.00"
    },
    {
      "id": 10,
      "vente_id": 6,
      "produit_id": 10,
      "quantite": 8,
      "prix_unitaire": "1350.00"
    },
    {
      "id": 11,
      "vente_id": 6,
      "produit_id": 15,
      "quantite": 20,
      "prix_unitaire": "550.00"
    },
    {
      "id": 12,
      "vente_id": 7,
      "produit_id": 12,
      "quantite": 9,
      "prix_unitaire": "350.00"
    },
    {
      "id": 13,
      "vente_id": 7,
      "produit_id": 13,
      "quantite": 4,
      "prix_unitaire": "500.00"
    },
    {
      "id": 14,
      "vente_id": 8,
      "produit_id": 9,
      "quantite": 15,
      "prix_unitaire": "1000.00"
    },
    {
      "id": 15,
      "vente_id": 8,
      "produit_id": 11,
      "quantite": 10,
      "prix_unitaire": "700.00"
    },
    {
      "id": 16,
      "vente_id": 8,
      "produit_id": 14,
      "quantite": 11,
      "prix_unitaire": "500.00"
    },
    {
      "id": 17,
      "vente_id": 9,
      "produit_id": 12,
      "quantite": 4,
      "prix_unitaire": "350.00"
    },
    {
      "id": 18,
      "vente_id": 9,
      "produit_id": 15,
      "quantite": 3,
      "prix_unitaire": "550.00"
    },
    {
      "id": 19,
      "vente_id": 10,
      "produit_id": 9,
      "quantite": 4,
      "prix_unitaire": "1000.00"
    },
    {
      "id": 20,
      "vente_id": 10,
      "produit_id": 10,
      "quantite": 1,
      "prix_unitaire": "1350.00"
    },
    {
      "id": 21,
      "vente_id": 10,
      "produit_id": 14,
      "quantite": 3,
      "prix_unitaire": "500.00"
    },
    {
      "id": 22,
      "vente_id": 11,
      "produit_id": 12,
      "quantite": 6,
      "prix_unitaire": "350.00"
    }
  ],
  "creances": [
    {
      "id": 1,
      "vente_id": 2,
      "user_id": 1,
      "client_id": 2,
      "montant_restant": "40000.00",
      "date_limite": "2026-08-19 23:00:00",
      "statut": "en_cours",
      "created_at": "2026-08-06 19:43:10",
      "numero_echeance": 1,
      "nb_echeances_total": 2
    },
    {
      "id": 2,
      "vente_id": 2,
      "user_id": 1,
      "client_id": 2,
      "montant_restant": "35000.00",
      "date_limite": "2026-09-03 23:00:00",
      "statut": "en_cours",
      "created_at": "2026-08-06 19:43:10",
      "numero_echeance": 2,
      "nb_echeances_total": 2
    },
    {
      "id": 3,
      "vente_id": 6,
      "user_id": 2,
      "client_id": 5,
      "montant_restant": "15000.00",
      "date_limite": "2026-08-09 23:00:00",
      "statut": "en_cours",
      "created_at": "2026-07-31 19:43:10",
      "numero_echeance": 1,
      "nb_echeances_total": 2
    },
    {
      "id": 4,
      "vente_id": 6,
      "user_id": 2,
      "client_id": 5,
      "montant_restant": "12500.00",
      "date_limite": "2026-08-24 23:00:00",
      "statut": "en_cours",
      "created_at": "2026-07-31 19:43:10",
      "numero_echeance": 2,
      "nb_echeances_total": 2
    }
  ],
  "creance_paiements": [],
  "depenses": [
    {
      "id": 1,
      "user_id": 1,
      "categorie": "loyer",
      "autre_categorie": null,
      "montant": "150000.00",
      "description": "Loyer du magasin de stockage",
      "justificatif_path": null,
      "date_depense": "2026-07-19 23:00:00",
      "created_at": "2026-07-20 19:43:10"
    },
    {
      "id": 2,
      "user_id": 1,
      "categorie": "transport",
      "autre_categorie": null,
      "montant": "45000.00",
      "description": "Camion de livraison Godomey",
      "justificatif_path": null,
      "date_depense": "2026-08-02 23:00:00",
      "created_at": "2026-08-03 19:43:10"
    },
    {
      "id": 3,
      "user_id": 1,
      "categorie": "salaires",
      "autre_categorie": null,
      "montant": "90000.00",
      "description": "Salaire du magasinier",
      "justificatif_path": null,
      "date_depense": "2026-08-07 23:00:00",
      "created_at": "2026-08-08 19:43:10"
    },
    {
      "id": 4,
      "user_id": 1,
      "categorie": "electricite",
      "autre_categorie": null,
      "montant": "22000.00",
      "description": "Facture SBEE",
      "justificatif_path": null,
      "date_depense": "2026-08-11 23:00:00",
      "created_at": "2026-08-12 19:43:10"
    },
    {
      "id": 5,
      "user_id": 2,
      "categorie": "loyer",
      "autre_categorie": null,
      "montant": "15000.00",
      "description": "Loyer de la boutique",
      "justificatif_path": null,
      "date_depense": "2026-07-22 23:00:00",
      "created_at": "2026-07-23 19:43:10"
    },
    {
      "id": 6,
      "user_id": 2,
      "categorie": "transport",
      "autre_categorie": null,
      "montant": "6500.00",
      "description": "Zémidjan pour ravitaillement",
      "justificatif_path": null,
      "date_depense": "2026-07-31 23:00:00",
      "created_at": "2026-08-01 19:43:10"
    },
    {
      "id": 7,
      "user_id": 2,
      "categorie": "electricite",
      "autre_categorie": null,
      "montant": "8200.00",
      "description": "Facture SBEE",
      "justificatif_path": null,
      "date_depense": "2026-08-06 23:00:00",
      "created_at": "2026-08-07 19:43:10"
    },
    {
      "id": 8,
      "user_id": 2,
      "categorie": "autres",
      "autre_categorie": "Réparation",
      "montant": "6000.00",
      "description": "Réparation du congélateur",
      "justificatif_path": null,
      "date_depense": "2026-08-10 23:00:00",
      "created_at": "2026-08-11 19:43:10"
    }
  ],
  "retraits": [
    {
      "id": 1,
      "user_id": 1,
      "montant": "120000.00",
      "frequence": "7 jours",
      "date_retrait": "2026-07-27 19:43:10"
    },
    {
      "id": 2,
      "user_id": 1,
      "montant": "80000.00",
      "frequence": "7 jours",
      "date_retrait": "2026-08-09 19:43:10"
    },
    {
      "id": 3,
      "user_id": 2,
      "montant": "8000.00",
      "frequence": "7 jours",
      "date_retrait": "2026-07-29 19:43:10"
    },
    {
      "id": 4,
      "user_id": 2,
      "montant": "4000.00",
      "frequence": "7 jours",
      "date_retrait": "2026-08-10 19:43:10"
    }
  ],
  "commandes": [
    {
      "id": 1,
      "user_id_detaillant": 2,
      "user_id_grossiste": 1,
      "fournisseur_nom": "Comptoir Sodji",
      "fournisseur_telephone": "0190000001",
      "numero_commande": "CMD-260715-00001",
      "montant_total": "195000.00",
      "montant_paye": "195000.00",
      "statut": "payee",
      "recu_par_detaillant": 1,
      "date_reception": "2026-07-19 19:43:10",
      "mode_reception": "plateforme",
      "mode_paiement": "comptant",
      "date_commande": "2026-07-15 19:43:10",
      "date_validation": "2026-07-16 19:43:10",
      "date_livraison": "2026-07-18 19:43:10",
      "notes": "Première commande de la saison",
      "date_echeance": null,
      "date_paiement": "2026-07-19 19:43:10"
    },
    {
      "id": 2,
      "user_id_detaillant": 2,
      "user_id_grossiste": 1,
      "fournisseur_nom": "Comptoir Sodji",
      "fournisseur_telephone": "0190000001",
      "numero_commande": "CMD-260804-00001",
      "montant_total": "108000.00",
      "montant_paye": "0.00",
      "statut": "en_attente_paiement",
      "recu_par_detaillant": 1,
      "date_reception": "2026-08-07 19:43:10",
      "mode_reception": "plateforme",
      "mode_paiement": "credit",
      "date_commande": "2026-08-04 19:43:10",
      "date_validation": "2026-08-05 19:43:10",
      "date_livraison": "2026-08-06 19:43:10",
      "notes": "Réglable en deux fois",
      "date_echeance": null,
      "date_paiement": null
    },
    {
      "id": 3,
      "user_id_detaillant": 2,
      "user_id_grossiste": 1,
      "fournisseur_nom": "Comptoir Sodji",
      "fournisseur_telephone": "0190000001",
      "numero_commande": "CMD-260813-00001",
      "montant_total": "84000.00",
      "montant_paye": "0.00",
      "statut": "en_attente",
      "recu_par_detaillant": 0,
      "date_reception": null,
      "mode_reception": "plateforme",
      "mode_paiement": "comptant",
      "date_commande": "2026-08-13 19:43:10",
      "date_validation": null,
      "date_livraison": null,
      "notes": "À livrer avant vendredi",
      "date_echeance": null,
      "date_paiement": null
    },
    {
      "id": 4,
      "user_id_detaillant": 2,
      "user_id_grossiste": null,
      "fournisseur_nom": "Grossiste Zogbo",
      "fournisseur_telephone": "0169887766",
      "numero_commande": "CMD-260808-00002",
      "montant_total": "46000.00",
      "montant_paye": "46000.00",
      "statut": "payee",
      "recu_par_detaillant": 1,
      "date_reception": "2026-08-09 19:43:10",
      "mode_reception": "manuel",
      "mode_paiement": "comptant",
      "date_commande": "2026-08-08 19:43:10",
      "date_validation": null,
      "date_livraison": null,
      "notes": "Fournisseur hors plateforme",
      "date_echeance": null,
      "date_paiement": "2026-08-09 19:43:10"
    }
  ],
  "commande_details": [
    {
      "id": 1,
      "commande_id": 1,
      "produit_nom": "Sac de riz parfumé 25 kg",
      "quantite": 10,
      "prix_unitaire": "19500.00"
    },
    {
      "id": 2,
      "commande_id": 2,
      "produit_nom": "Bidon d'huile 20 L",
      "quantite": 4,
      "prix_unitaire": "21000.00"
    },
    {
      "id": 3,
      "commande_id": 2,
      "produit_nom": "Casier de sucrerie 24 bouteilles",
      "quantite": 4,
      "prix_unitaire": "5400.00"
    },
    {
      "id": 4,
      "commande_id": 3,
      "produit_nom": "Sac de maïs 50 kg",
      "quantite": 4,
      "prix_unitaire": "15500.00"
    },
    {
      "id": 5,
      "commande_id": 3,
      "produit_nom": "Pack d'eau minérale 1,5 L",
      "quantite": 9,
      "prix_unitaire": "2400.00"
    },
    {
      "id": 6,
      "commande_id": 4,
      "produit_nom": "Carton de savon de ménage",
      "quantite": 5,
      "prix_unitaire": "8200.00"
    },
    {
      "id": 7,
      "commande_id": 4,
      "produit_nom": "Boîte de tomate 400 g",
      "quantite": 10,
      "prix_unitaire": "500.00"
    }
  ],
  "commande_echeances": [
    {
      "id": 1,
      "commande_id": 2,
      "user_id_detaillant": 2,
      "montant": "54000.00",
      "date_limite": "2026-08-17 23:00:00",
      "numero_echeance": 1,
      "nb_echeances_total": 2,
      "statut": "en_cours",
      "date_paiement": null,
      "transaction_id": null,
      "created_at": "2026-08-04 19:43:10"
    },
    {
      "id": 2,
      "commande_id": 2,
      "user_id_detaillant": 2,
      "montant": "54000.00",
      "date_limite": "2026-09-01 23:00:00",
      "numero_echeance": 2,
      "nb_echeances_total": 2,
      "statut": "en_cours",
      "date_paiement": null,
      "transaction_id": null,
      "created_at": "2026-08-04 19:43:10"
    }
  ],
  "commande_negociations": [],
  "commandes_versements": [],
  "approvisionnements": [
    {
      "id": 1,
      "user_id": 2,
      "produit_id": 9,
      "quantite": 200,
      "prix_achat": "780.00",
      "montant_total": "156000.00",
      "mode_paiement": "credit",
      "statut": "payé",
      "moyen_reglement": "especes",
      "notes": "Réglé à la livraison",
      "fournisseur_nom": "Comptoir Sodji",
      "fournisseur_telephone": "0190000001",
      "date_appro": "2026-07-19 19:43:10"
    },
    {
      "id": 2,
      "user_id": 2,
      "produit_id": 10,
      "quantite": 60,
      "prix_achat": "1050.00",
      "montant_total": "63000.00",
      "mode_paiement": "credit",
      "statut": "payé",
      "moyen_reglement": "mobile_money",
      "notes": "Payé via la passerelle",
      "fournisseur_nom": "Comptoir Sodji",
      "fournisseur_telephone": "0190000001",
      "date_appro": "2026-07-27 19:43:10"
    },
    {
      "id": 3,
      "user_id": 2,
      "produit_id": 14,
      "quantite": 40,
      "prix_achat": "340.00",
      "montant_total": "13600.00",
      "mode_paiement": "credit",
      "statut": "payé",
      "moyen_reglement": "solde",
      "notes": "Prélevé sur le solde",
      "fournisseur_nom": "Grossiste Zogbo",
      "fournisseur_telephone": "0169887766",
      "date_appro": "2026-08-02 19:43:10"
    },
    {
      "id": 4,
      "user_id": 2,
      "produit_id": 11,
      "quantite": 80,
      "prix_achat": "520.00",
      "montant_total": "41600.00",
      "mode_paiement": "credit",
      "statut": "payé",
      "moyen_reglement": null,
      "notes": "Règlement antérieur au suivi",
      "fournisseur_nom": "Grossiste Zogbo",
      "fournisseur_telephone": "0169887766",
      "date_appro": "2026-07-05 19:43:10"
    },
    {
      "id": 5,
      "user_id": 2,
      "produit_id": 15,
      "quantite": 100,
      "prix_achat": "400.00",
      "montant_total": "40000.00",
      "mode_paiement": "credit",
      "statut": "en_attente",
      "moyen_reglement": null,
      "notes": "À régler sous 15 jours",
      "fournisseur_nom": "Comptoir Sodji",
      "fournisseur_telephone": "0190000001",
      "date_appro": "2026-08-07 19:43:10"
    },
    {
      "id": 6,
      "user_id": 2,
      "produit_id": 13,
      "quantite": 50,
      "prix_achat": "300.00",
      "montant_total": "15000.00",
      "mode_paiement": "credit",
      "statut": "en_attente",
      "moyen_reglement": null,
      "notes": null,
      "fournisseur_nom": "Grossiste Zogbo",
      "fournisseur_telephone": "0169887766",
      "date_appro": "2026-08-11 19:43:10"
    },
    {
      "id": 7,
      "user_id": 1,
      "produit_id": 1,
      "quantite": 150,
      "prix_achat": "16500.00",
      "montant_total": "2475000.00",
      "mode_paiement": "comptant",
      "statut": "payé",
      "moyen_reglement": "especes",
      "notes": "Approvisionnement initial",
      "fournisseur_nom": "Importateur Tokpa",
      "fournisseur_telephone": "0155667788",
      "date_appro": "2026-05-16 19:43:10"
    }
  ],
  "notations_fournisseurs": [
    {
      "id": 1,
      "user_id_detaillant": 2,
      "user_id_grossiste": 1,
      "commande_id": 1,
      "note": 5,
      "commentaire": "Livraison rapide et marchandise conforme.",
      "created_at": "2026-07-20 19:43:10"
    },
    {
      "id": 2,
      "user_id_detaillant": 2,
      "user_id_grossiste": 1,
      "commande_id": 2,
      "note": 4,
      "commentaire": "Bon fournisseur, léger retard sur la livraison.",
      "created_at": "2026-08-08 19:43:10"
    }
  ],
  "notations_clients": [
    {
      "id": 1,
      "user_id_grossiste": 1,
      "user_id_detaillant": 2,
      "commande_id": 1,
      "note": 5,
      "commentaire": "Cliente sérieuse, règlement immédiat.",
      "created_at": "2026-07-20 19:43:10",
      "updated_at": "2026-08-14 19:43:10"
    }
  ],
  "notifications": [
    {
      "id": 1,
      "user_id": 1,
      "type": "commande",
      "titre": "Nouvelle commande reçue",
      "message": "Boutique Ayaba a passé une commande de 84 000 FCFA.",
      "lien": "/commandes/3",
      "lu": 0,
      "created_at": "2026-08-13 19:43:10"
    },
    {
      "id": 2,
      "user_id": 1,
      "type": "paiement",
      "titre": "Paiement en attente",
      "message": "La commande à crédit de Boutique Ayaba reste à encaisser.",
      "lien": "/commandes/2",
      "lu": 0,
      "created_at": "2026-08-08 19:43:10"
    },
    {
      "id": 3,
      "user_id": 1,
      "type": "notation",
      "titre": "Nouvel avis reçu",
      "message": "Boutique Ayaba vous a attribué 4 étoiles.",
      "lien": "/notations",
      "lu": 1,
      "created_at": "2026-08-08 19:43:10"
    },
    {
      "id": 4,
      "user_id": 2,
      "type": "commande",
      "titre": "Commande livrée",
      "message": "Votre commande auprès de Comptoir Sodji a été expédiée.",
      "lien": "/commandes/2",
      "lu": 0,
      "created_at": "2026-08-06 19:43:10"
    },
    {
      "id": 5,
      "user_id": 2,
      "type": "creance",
      "titre": "Échéance dépassée",
      "message": "Une échéance de 15 000 FCFA de Restaurant Chez Fifa est en retard.",
      "lien": "/creances",
      "lu": 0,
      "created_at": "2026-08-10 19:43:10"
    },
    {
      "id": 6,
      "user_id": 2,
      "type": "credit",
      "titre": "Crédit fournisseur à régler",
      "message": "40 000 FCFA sont dus à Comptoir Sodji.",
      "lien": "/credits",
      "lu": 1,
      "created_at": "2026-08-07 19:43:10"
    }
  ]
};
