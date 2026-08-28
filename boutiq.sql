-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: boutiq
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `approvisionnements`
--

DROP TABLE IF EXISTS `approvisionnements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `approvisionnements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `produit_id` int(11) NOT NULL,
  `quantite` int(11) NOT NULL,
  `prix_achat` decimal(10,2) NOT NULL,
  `montant_total` decimal(10,2) NOT NULL,
  `mode_paiement` enum('comptant','credit') NOT NULL DEFAULT 'comptant',
  `statut` enum('payé','en_attente') NOT NULL DEFAULT 'payé',
  `moyen_reglement` enum('especes','mobile_money','solde') DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `fournisseur_nom` varchar(100) DEFAULT NULL,
  `fournisseur_telephone` varchar(20) DEFAULT NULL,
  `date_appro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_appro_user` (`user_id`),
  KEY `idx_appro_produit` (`produit_id`),
  KEY `idx_appro_statut` (`statut`),
  KEY `idx_appro_fournisseur_tel` (`fournisseur_telephone`),
  CONSTRAINT `approvisionnements_ibfk_1` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approvisionnements`
--

LOCK TABLES `approvisionnements` WRITE;
/*!40000 ALTER TABLE `approvisionnements` DISABLE KEYS */;
INSERT INTO `approvisionnements` VALUES (1,2,9,200,780.00,156000.00,'credit','payé','especes','Réglé à la livraison','Comptoir Sodji','0190000001','2026-07-19 20:43:10'),(2,2,10,60,1050.00,63000.00,'credit','payé','mobile_money','Payé via la passerelle','Comptoir Sodji','0190000001','2026-07-27 20:43:10'),(3,2,14,40,340.00,13600.00,'credit','payé','solde','Prélevé sur le solde','Grossiste Zogbo','0169887766','2026-08-02 20:43:10'),(4,2,11,80,520.00,41600.00,'credit','payé',NULL,'Règlement antérieur au suivi','Grossiste Zogbo','0169887766','2026-07-05 20:43:10'),(5,2,15,100,400.00,40000.00,'credit','en_attente',NULL,'À régler sous 15 jours','Comptoir Sodji','0190000001','2026-08-07 20:43:10'),(6,2,13,50,300.00,15000.00,'credit','en_attente',NULL,NULL,'Grossiste Zogbo','0169887766','2026-08-11 20:43:10'),(7,1,1,150,16500.00,2475000.00,'comptant','payé','especes','Approvisionnement initial','Importateur Tokpa','0155667788','2026-05-16 20:43:10');
/*!40000 ALTER TABLE `approvisionnements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,1,'Céréales et féculents','2026-08-14 19:43:09'),(2,1,'Huiles et condiments','2026-08-14 19:43:09'),(3,1,'Boissons','2026-08-14 19:43:09'),(4,2,'Épicerie','2026-08-14 19:43:09'),(5,2,'Boissons','2026-08-14 19:43:09'),(6,2,'Hygiène','2026-08-14 19:43:09');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `nom_complet` varchar(150) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `adresse` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,1,'Boutique Ayaba','0190000002','rollande@boutique-ayaba.bj','Marché Dantokpa, Cotonou','Cliente régulière, paie à temps','2026-06-15 19:43:09'),(2,1,'Alimentation Gbêdji','0197112233',NULL,'Vêdoko, Cotonou','Commande surtout du riz','2026-06-30 19:43:09'),(3,1,'Kiosque Sènou','0166554477',NULL,'Sènou, Porto-Novo',NULL,'2026-07-25 19:43:09'),(4,2,'Mariam ADJAHO','0195223344',NULL,'Akpakpa, Cotonou','Achète chaque semaine','2026-06-20 19:43:09'),(5,2,'Restaurant Chez Fifa','0164889900','chezfifa@mail.bj','Fidjrossè, Cotonou','Gros volumes, paie en fin de mois','2026-06-25 19:43:09'),(6,2,'Justin HOUNKPATIN','0198334455',NULL,'Cadjèhoun, Cotonou',NULL,'2026-07-15 19:43:09'),(7,2,'Épicerie du Carrefour','0167445566',NULL,'Godomey','Revend une partie','2026-07-30 19:43:09'),(8,2,'Cliente de passage','0100000000',NULL,NULL,'Fiche générique','2026-08-04 19:43:09');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commande_approvisionnements`
--

DROP TABLE IF EXISTS `commande_approvisionnements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commande_approvisionnements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `commande_id` int(11) NOT NULL,
  `approvisionnement_id` int(11) DEFAULT NULL,
  `statut` enum('en_attente','credit_cree','credit_solde') DEFAULT 'en_attente',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `commande_id` (`commande_id`),
  KEY `idx_appro` (`approvisionnement_id`),
  KEY `idx_statut` (`statut`),
  CONSTRAINT `commande_approvisionnements_ibfk_1` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commande_approvisionnements_ibfk_2` FOREIGN KEY (`approvisionnement_id`) REFERENCES `approvisionnements` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commande_approvisionnements`
--

LOCK TABLES `commande_approvisionnements` WRITE;
/*!40000 ALTER TABLE `commande_approvisionnements` DISABLE KEYS */;
/*!40000 ALTER TABLE `commande_approvisionnements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commande_details`
--

DROP TABLE IF EXISTS `commande_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commande_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `commande_id` int(11) NOT NULL,
  `produit_nom` varchar(150) NOT NULL COMMENT 'Nom du produit au moment de la commande',
  `quantite` int(11) NOT NULL,
  `prix_unitaire` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `commande_id` (`commande_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commande_details`
--

LOCK TABLES `commande_details` WRITE;
/*!40000 ALTER TABLE `commande_details` DISABLE KEYS */;
INSERT INTO `commande_details` VALUES (1,1,'Sac de riz parfumé 25 kg',10,19500.00),(2,2,'Bidon d\'huile 20 L',4,21000.00),(3,2,'Casier de sucrerie 24 bouteilles',4,5400.00),(4,3,'Sac de maïs 50 kg',4,15500.00),(5,3,'Pack d\'eau minérale 1,5 L',9,2400.00),(6,4,'Carton de savon de ménage',5,8200.00),(7,4,'Boîte de tomate 400 g',10,500.00);
/*!40000 ALTER TABLE `commande_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commande_echeances`
--

DROP TABLE IF EXISTS `commande_echeances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commande_echeances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `commande_id` int(11) NOT NULL,
  `user_id_detaillant` int(11) NOT NULL,
  `montant` decimal(15,2) NOT NULL,
  `date_limite` date NOT NULL,
  `numero_echeance` int(11) NOT NULL,
  `nb_echeances_total` int(11) NOT NULL,
  `statut` enum('en_cours','payee','en_retard') DEFAULT 'en_cours',
  `date_paiement` datetime DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_commande` (`commande_id`),
  KEY `idx_statut` (`statut`),
  CONSTRAINT `commande_echeances_ibfk_1` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commande_echeances`
--

LOCK TABLES `commande_echeances` WRITE;
/*!40000 ALTER TABLE `commande_echeances` DISABLE KEYS */;
INSERT INTO `commande_echeances` VALUES (1,2,2,54000.00,'2026-08-18',1,2,'en_cours',NULL,NULL,'2026-08-04 19:43:10'),(2,2,2,54000.00,'2026-09-02',2,2,'en_cours',NULL,NULL,'2026-08-04 19:43:10');
/*!40000 ALTER TABLE `commande_echeances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commande_paiements`
--

DROP TABLE IF EXISTS `commande_paiements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commande_paiements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `commande_id` int(11) NOT NULL,
  `montant` decimal(15,2) NOT NULL,
  `date_limite` date DEFAULT NULL COMMENT 'Date d’échéance (si crédit)',
  `date_paiement` datetime DEFAULT NULL,
  `statut` enum('en_attente','paye','retard') NOT NULL DEFAULT 'en_attente',
  `mode_paiement` varchar(20) DEFAULT 'especes',
  PRIMARY KEY (`id`),
  KEY `commande_id` (`commande_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commande_paiements`
--

LOCK TABLES `commande_paiements` WRITE;
/*!40000 ALTER TABLE `commande_paiements` DISABLE KEYS */;
/*!40000 ALTER TABLE `commande_paiements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commandes`
--

DROP TABLE IF EXISTS `commandes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commandes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id_detaillant` int(11) NOT NULL COMMENT 'Le client (détaillant)',
  `user_id_grossiste` int(11) DEFAULT NULL,
  `fournisseur_nom` varchar(150) DEFAULT NULL,
  `fournisseur_telephone` varchar(20) NOT NULL,
  `numero_commande` varchar(50) NOT NULL,
  `montant_total` decimal(15,2) NOT NULL,
  `montant_paye` decimal(15,2) NOT NULL DEFAULT 0.00,
  `statut` enum('en_attente','validee','livree','recu_par_detaillant','en_attente_paiement','payee','annulee') DEFAULT 'en_attente',
  `recu_par_detaillant` tinyint(1) DEFAULT 0,
  `date_reception` datetime DEFAULT NULL,
  `mode_reception` enum('plateforme','manuel') DEFAULT 'plateforme',
  `mode_paiement` enum('comptant','credit') NOT NULL DEFAULT 'comptant',
  `date_commande` datetime NOT NULL DEFAULT current_timestamp(),
  `date_validation` datetime DEFAULT NULL,
  `date_livraison` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `date_echeance` date DEFAULT NULL,
  `date_paiement` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_detaillant` (`user_id_detaillant`),
  KEY `idx_grossiste` (`user_id_grossiste`),
  KEY `idx_statut` (`statut`),
  KEY `idx_commandes_recu` (`recu_par_detaillant`,`statut`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commandes`
--

LOCK TABLES `commandes` WRITE;
/*!40000 ALTER TABLE `commandes` DISABLE KEYS */;
INSERT INTO `commandes` VALUES (1,2,1,'Comptoir Sodji','0190000001','CMD-260715-00001',195000.00,195000.00,'payee',1,'2026-07-19 20:43:10','plateforme','comptant','2026-07-15 20:43:10','2026-07-16 20:43:10','2026-07-18 20:43:10','Première commande de la saison',NULL,'2026-07-19 20:43:10'),(2,2,1,'Comptoir Sodji','0190000001','CMD-260804-00001',108000.00,0.00,'en_attente_paiement',1,'2026-08-07 20:43:10','plateforme','credit','2026-08-04 20:43:10','2026-08-05 20:43:10','2026-08-06 20:43:10','Réglable en deux fois',NULL,NULL),(3,2,1,'Comptoir Sodji','0190000001','CMD-260813-00001',84000.00,0.00,'en_attente',0,NULL,'plateforme','comptant','2026-08-13 20:43:10',NULL,NULL,'À livrer avant vendredi',NULL,NULL),(4,2,NULL,'Grossiste Zogbo','0169887766','CMD-260808-00002',46000.00,46000.00,'payee',1,'2026-08-09 20:43:10','manuel','comptant','2026-08-08 20:43:10',NULL,NULL,'Fournisseur hors plateforme',NULL,'2026-08-09 20:43:10');
/*!40000 ALTER TABLE `commandes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commandes_versements`
--

DROP TABLE IF EXISTS `commandes_versements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commandes_versements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `commande_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'Grossiste qui reçoit',
  `montant` decimal(15,2) NOT NULL,
  `mode_paiement` varchar(50) NOT NULL DEFAULT 'especes',
  `transaction_id` varchar(255) DEFAULT NULL,
  `date_versement` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_commande` (`commande_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commandes_versements`
--

LOCK TABLES `commandes_versements` WRITE;
/*!40000 ALTER TABLE `commandes_versements` DISABLE KEYS */;
/*!40000 ALTER TABLE `commandes_versements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `creance_paiements`
--

DROP TABLE IF EXISTS `creance_paiements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `creance_paiements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `creance_id` int(11) NOT NULL,
  `montant` decimal(15,2) NOT NULL,
  `date_paiement` timestamp NOT NULL DEFAULT current_timestamp(),
  `mode_paiement` varchar(20) DEFAULT 'espece',
  `repartition_frais` varchar(20) DEFAULT 'client',
  `transaction_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `creance_id` (`creance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `creance_paiements`
--

LOCK TABLES `creance_paiements` WRITE;
/*!40000 ALTER TABLE `creance_paiements` DISABLE KEYS */;
/*!40000 ALTER TABLE `creance_paiements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `creances`
--

DROP TABLE IF EXISTS `creances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `creances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vente_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `client_id` int(11) DEFAULT NULL,
  `montant_restant` decimal(15,2) NOT NULL,
  `date_limite` date NOT NULL,
  `statut` enum('en_cours','payee','retard') DEFAULT 'en_cours',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `numero_echeance` int(11) NOT NULL DEFAULT 1,
  `nb_echeances_total` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_creances_user` (`user_id`,`statut`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `creances`
--

LOCK TABLES `creances` WRITE;
/*!40000 ALTER TABLE `creances` DISABLE KEYS */;
INSERT INTO `creances` VALUES (1,2,1,2,40000.00,'2026-08-20','en_cours','2026-08-06 19:43:10',1,2),(2,2,1,2,35000.00,'2026-09-04','en_cours','2026-08-06 19:43:10',2,2),(3,6,2,5,15000.00,'2026-08-10','en_cours','2026-07-31 19:43:10',1,2),(4,6,2,5,12500.00,'2026-08-25','en_cours','2026-07-31 19:43:10',2,2);
/*!40000 ALTER TABLE `creances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `depenses`
--

DROP TABLE IF EXISTS `depenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `depenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `categorie` enum('salaires','achat_marchandises','loyer','transport','electricite','autres') NOT NULL,
  `autre_categorie` varchar(100) DEFAULT NULL,
  `montant` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `justificatif_path` varchar(255) DEFAULT NULL,
  `date_depense` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `depenses`
--

LOCK TABLES `depenses` WRITE;
/*!40000 ALTER TABLE `depenses` DISABLE KEYS */;
INSERT INTO `depenses` VALUES (1,1,'loyer',NULL,150000.00,'Loyer du magasin de stockage',NULL,'2026-07-20','2026-07-20 19:43:10'),(2,1,'transport',NULL,45000.00,'Camion de livraison Godomey',NULL,'2026-08-03','2026-08-03 19:43:10'),(3,1,'salaires',NULL,90000.00,'Salaire du magasinier',NULL,'2026-08-08','2026-08-08 19:43:10'),(4,1,'electricite',NULL,22000.00,'Facture SBEE',NULL,'2026-08-12','2026-08-12 19:43:10'),(5,2,'loyer',NULL,15000.00,'Loyer de la boutique',NULL,'2026-07-23','2026-07-23 19:43:10'),(6,2,'transport',NULL,6500.00,'Zémidjan pour ravitaillement',NULL,'2026-08-01','2026-08-01 19:43:10'),(7,2,'electricite',NULL,8200.00,'Facture SBEE',NULL,'2026-08-07','2026-08-07 19:43:10'),(8,2,'autres','Réparation',6000.00,'Réparation du congélateur',NULL,'2026-08-11','2026-08-11 19:43:10');
/*!40000 ALTER TABLE `depenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fedapay_pending`
--

DROP TABLE IF EXISTS `fedapay_pending`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fedapay_pending` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(100) NOT NULL,
  `module` varchar(20) NOT NULL,
  `reference_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `montant` decimal(15,2) NOT NULL,
  `montant_widget` decimal(15,2) NOT NULL,
  `repartition_frais` varchar(20) NOT NULL DEFAULT 'client',
  `meta` text DEFAULT NULL,
  `traite` tinyint(1) NOT NULL DEFAULT 0,
  `traite_at` datetime DEFAULT NULL,
  `source` varchar(20) NOT NULL DEFAULT 'oncomplete',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_transaction` (`transaction_id`),
  KEY `idx_module_ref` (`module`,`reference_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_traite` (`traite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fedapay_pending`
--

LOCK TABLES `fedapay_pending` WRITE;
/*!40000 ALTER TABLE `fedapay_pending` DISABLE KEYS */;
/*!40000 ALTER TABLE `fedapay_pending` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notations_clients`
--

DROP TABLE IF EXISTS `notations_clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notations_clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id_grossiste` int(11) NOT NULL,
  `user_id_detaillant` int(11) NOT NULL,
  `commande_id` int(11) NOT NULL,
  `note` tinyint(1) NOT NULL,
  `commentaire` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notations_clients`
--

LOCK TABLES `notations_clients` WRITE;
/*!40000 ALTER TABLE `notations_clients` DISABLE KEYS */;
INSERT INTO `notations_clients` VALUES (1,1,2,1,5,'Cliente sérieuse, règlement immédiat.','2026-07-20 20:43:10','2026-08-14 20:43:10');
/*!40000 ALTER TABLE `notations_clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notations_fournisseurs`
--

DROP TABLE IF EXISTS `notations_fournisseurs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notations_fournisseurs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id_detaillant` int(11) NOT NULL,
  `user_id_grossiste` int(11) DEFAULT NULL COMMENT 'NULL si fournisseur hors plateforme',
  `commande_id` int(11) NOT NULL,
  `note` tinyint(1) NOT NULL COMMENT '1 à 5',
  `commentaire` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notations_fournisseurs`
--

LOCK TABLES `notations_fournisseurs` WRITE;
/*!40000 ALTER TABLE `notations_fournisseurs` DISABLE KEYS */;
INSERT INTO `notations_fournisseurs` VALUES (1,2,1,1,5,'Livraison rapide et marchandise conforme.','2026-07-20 20:43:10'),(2,2,1,2,4,'Bon fournisseur, léger retard sur la livraison.','2026-08-08 20:43:10');
/*!40000 ALTER TABLE `notations_fournisseurs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL COMMENT 'nouvelle_commande|commande_validee|commande_rejetee|demande_paiement|echeance_proche',
  `titre` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `lien` varchar(255) DEFAULT NULL,
  `lu` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_lu` (`user_id`,`lu`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'commande','Nouvelle commande reçue','Boutique Ayaba a passé une commande de 84 000 FCFA.','/commandes/3',0,'2026-08-13 20:43:10'),(2,1,'paiement','Paiement en attente','La commande à crédit de Boutique Ayaba reste à encaisser.','/commandes/2',0,'2026-08-08 20:43:10'),(3,1,'notation','Nouvel avis reçu','Boutique Ayaba vous a attribué 4 étoiles.','/notations',1,'2026-08-08 20:43:10'),(4,2,'commande','Commande livrée','Votre commande auprès de Comptoir Sodji a été expédiée.','/commandes/2',0,'2026-08-06 20:43:10'),(5,2,'creance','Échéance dépassée','Une échéance de 15 000 FCFA de Restaurant Chez Fifa est en retard.','/creances',0,'2026-08-10 20:43:10'),(6,2,'credit','Crédit fournisseur à régler','40 000 FCFA sont dus à Comptoir Sodji.','/credits',1,'2026-08-07 20:43:10');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produits`
--

DROP TABLE IF EXISTS `produits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `produits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `categorie_id` int(11) DEFAULT NULL,
  `nom` varchar(150) NOT NULL,
  `prix_achat` decimal(15,2) NOT NULL,
  `prix_vente` decimal(15,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `seuil_alerte` int(11) DEFAULT 10,
  `description` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `categorie_id` (`categorie_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produits`
--

LOCK TABLES `produits` WRITE;
/*!40000 ALTER TABLE `produits` DISABLE KEYS */;
INSERT INTO `produits` VALUES (1,1,1,'Sac de riz parfumé 25 kg',16500.00,19500.00,120,20,'Riz importé, sac de 25 kg',NULL,'2026-05-16 19:43:09'),(2,1,1,'Sac de maïs 50 kg',13000.00,15500.00,64,15,'Maïs local séché',NULL,'2026-05-18 19:43:09'),(3,1,2,'Bidon d\'huile 20 L',18000.00,21000.00,38,10,'Huile végétale raffinée',NULL,'2026-05-26 19:43:09'),(4,1,2,'Carton de tomate concentrée',9500.00,11500.00,8,12,'Boîtes de 400 g, carton de 24',NULL,'2026-05-31 19:43:09'),(5,1,1,'Sac de sucre 50 kg',22000.00,25500.00,45,10,'Sucre en poudre',NULL,'2026-06-15 19:43:09'),(6,1,3,'Casier de sucrerie 24 bouteilles',4200.00,5400.00,96,24,'Assortiment de boissons gazeuses',NULL,'2026-06-20 19:43:09'),(7,1,2,'Carton de savon de ménage',6800.00,8200.00,6,15,'Savon en barre, carton de 20',NULL,'2026-07-05 19:43:09'),(8,1,3,'Pack d\'eau minérale 1,5 L',1800.00,2400.00,210,30,'Pack de 6 bouteilles',NULL,'2026-07-15 19:43:09'),(9,2,4,'Riz au détail (bol)',780.00,1000.00,145,30,'Vendu au bol',NULL,'2026-06-05 19:43:09'),(10,2,4,'Huile au détail (litre)',1050.00,1350.00,52,15,'Servie au litre',NULL,'2026-06-07 19:43:09'),(11,2,4,'Sucre au détail (kg)',520.00,700.00,74,20,'Vendu au kilo',NULL,'2026-06-10 19:43:09'),(12,2,5,'Bouteille de sucrerie',225.00,350.00,84,24,'Boisson gazeuse 33 cl',NULL,'2026-06-15 19:43:09'),(13,2,5,'Bouteille d\'eau 1,5 L',300.00,500.00,11,24,'Eau minérale',NULL,'2026-06-25 19:43:09'),(14,2,6,'Savon de ménage (barre)',340.00,500.00,9,20,'Barre de savon',NULL,'2026-06-30 19:43:09'),(15,2,4,'Boîte de tomate 400 g',400.00,550.00,63,18,'Tomate concentrée',NULL,'2026-07-10 19:43:09');
/*!40000 ALTER TABLE `produits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `retraits`
--

DROP TABLE IF EXISTS `retraits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `retraits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `montant` decimal(15,2) NOT NULL,
  `frequence` varchar(50) DEFAULT NULL,
  `date_retrait` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `retraits`
--

LOCK TABLES `retraits` WRITE;
/*!40000 ALTER TABLE `retraits` DISABLE KEYS */;
INSERT INTO `retraits` VALUES (1,1,120000.00,'7 jours','2026-07-27 19:43:10'),(2,1,80000.00,'7 jours','2026-08-09 19:43:10'),(3,2,8000.00,'7 jours','2026-07-29 19:43:10'),(4,2,4000.00,'7 jours','2026-08-10 19:43:10');
/*!40000 ALTER TABLE `retraits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_params`
--

DROP TABLE IF EXISTS `user_params`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_params` (
  `user_id` int(11) NOT NULL,
  `frequence_retrait` varchar(50) DEFAULT '7 jours',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_params`
--

LOCK TABLES `user_params` WRITE;
/*!40000 ALTER TABLE `user_params` DISABLE KEYS */;
INSERT INTO `user_params` VALUES (1,'7 jours'),(2,'7 jours');
/*!40000 ALTER TABLE `user_params` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `ifu` varchar(30) DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nom_boutique` varchar(150) NOT NULL,
  `etatEts` int(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `solde` decimal(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `telephone` (`telephone`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'SODJI','Bernard','0190000001','contact@comptoir-sodji.bj','3201900000011','1978-03-12','Zone industrielle, Godomey, Abomey-Calavi','$2y$13$mW5M70vH8cMqdWhQP9Z7CebNMioNlVa1xz7YGH6jR12XVawObQplO','Comptoir Sodji',1,'2026-08-14 20:40:22',0.00),(2,'AGOSSOU','Rollande','0190000002','rollande@boutique-ayaba.bj','3201900000022','1992-11-05','Marché Dantokpa, Cotonou','$2y$13$aex3B4WQTxpxc3Kov0zi.uxeYNDw9vIs/dJPALzB1F7.KMvfNgMwq','Boutique Ayaba',0,'2026-08-14 20:41:16',0.00);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vente_details`
--

DROP TABLE IF EXISTS `vente_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vente_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vente_id` int(11) NOT NULL,
  `produit_id` int(11) DEFAULT NULL,
  `quantite` int(11) NOT NULL,
  `prix_unitaire` decimal(15,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `vente_id` (`vente_id`),
  KEY `produit_id` (`produit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vente_details`
--

LOCK TABLES `vente_details` WRITE;
/*!40000 ALTER TABLE `vente_details` DISABLE KEYS */;
INSERT INTO `vente_details` VALUES (1,1,1,20,19500.00),(2,2,2,10,15500.00),(3,3,3,4,21000.00),(4,3,6,4,5400.00),(5,4,5,4,25500.00),(6,5,9,6,1000.00),(7,5,11,2,700.00),(8,5,12,4,350.00),(9,6,9,25,1000.00),(10,6,10,8,1350.00),(11,6,15,20,550.00),(12,7,12,9,350.00),(13,7,13,4,500.00),(14,8,9,15,1000.00),(15,8,11,10,700.00),(16,8,14,11,500.00),(17,9,12,4,350.00),(18,9,15,3,550.00),(19,10,9,4,1000.00),(20,10,10,1,1350.00),(21,10,14,3,500.00),(22,11,12,6,350.00);
/*!40000 ALTER TABLE `vente_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventes`
--

DROP TABLE IF EXISTS `ventes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ventes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `client_id` int(11) DEFAULT NULL,
  `numero_facture` varchar(50) NOT NULL,
  `montant_total` decimal(15,2) NOT NULL,
  `montant_paye` decimal(15,2) NOT NULL DEFAULT 0.00,
  `statut` varchar(50) NOT NULL DEFAULT 'en_attente',
  `date_vente` timestamp NOT NULL DEFAULT current_timestamp(),
  `mode_paiement` varchar(50) NOT NULL DEFAULT 'especes',
  `telephone_client` varchar(20) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `statut_paiement` varchar(20) NOT NULL DEFAULT 'paye',
  `frais_client` decimal(10,2) NOT NULL DEFAULT 0.00,
  `frais_vendeur` decimal(10,2) NOT NULL DEFAULT 0.00,
  `fedapay_identifiant` varchar(100) DEFAULT NULL,
  `fedapay_frais_client` int(11) DEFAULT 0,
  `fedapay_frais_vendeur` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_ventes_user_date` (`user_id`,`date_vente`),
  KEY `idx_ventes_transaction_id` (`transaction_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventes`
--

LOCK TABLES `ventes` WRITE;
/*!40000 ALTER TABLE `ventes` DISABLE KEYS */;
INSERT INTO `ventes` VALUES (1,1,1,'BOU-20260802-001',390000.00,390000.00,'en_cours','2026-08-02 19:43:09','especes',NULL,NULL,'paye',0.00,0.00,NULL,0,0),(2,1,2,'BOU-20260806-001',155000.00,80000.00,'en_cours','2026-08-06 19:43:09','especes',NULL,NULL,'paye',0.00,0.00,NULL,0,0),(3,1,3,'BOU-20260811-001',108000.00,108000.00,'en_cours','2026-08-11 19:43:09','mobile_money','0166554477',NULL,'paye',2052.00,0.00,NULL,0,0),(4,1,1,'BOU-20260814-001',102000.00,102000.00,'en_cours','2026-08-14 15:43:09','especes',NULL,NULL,'paye',0.00,0.00,NULL,0,0),(5,2,4,'BOU-20260725-001',8600.00,8600.00,'en_cours','2026-07-25 19:43:10','especes',NULL,NULL,'paye',0.00,0.00,NULL,0,0),(6,2,5,'BOU-20260731-001',47500.00,20000.00,'en_cours','2026-07-31 19:43:10','especes',NULL,NULL,'paye',0.00,0.00,NULL,0,0),(7,2,6,'BOU-20260805-001',5250.00,5250.00,'en_cours','2026-08-05 19:43:10','mobile_money','0198334455',NULL,'paye',100.00,0.00,NULL,0,0),(8,2,7,'BOU-20260809-001',27500.00,27500.00,'en_cours','2026-08-09 19:43:10','especes',NULL,NULL,'paye',0.00,0.00,NULL,0,0),(9,2,NULL,'BOU-20260812-001',3200.00,3200.00,'en_cours','2026-08-12 19:43:10','especes',NULL,NULL,'paye',0.00,0.00,NULL,0,0),(10,2,4,'BOU-20260814-001',6900.00,6900.00,'en_cours','2026-08-14 13:43:10','especes',NULL,NULL,'paye',0.00,0.00,NULL,0,0),(11,2,NULL,'BOU-20260814-002',2100.00,2100.00,'en_cours','2026-08-14 17:43:10','especes',NULL,NULL,'paye',0.00,0.00,NULL,0,0);
/*!40000 ALTER TABLE `ventes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-15  8:00:18
