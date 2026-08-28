/**
 * Traductions anglaises, indexées par la phrase française.
 *
 * Le français est la langue source : ce fichier ne contient donc que l'anglais.
 * Une entrée absente n'est pas une erreur — la phrase française s'affiche telle
 * quelle, ce qui vaut mieux qu'une clé nue à l'écran. Les mots identiques dans
 * les deux langues (« Description », « Action », « Total ») sont volontairement
 * absents : les répéter n'apporterait rien.
 *
 * Rangé par domaine, dans l'ordre où l'utilisateur rencontre les écrans.
 */

export const DICTIONNAIRE_EN: Record<string, string> = {
  // ── Navigation et cadre ────────────────────────────────────────────────
  "Tableau de bord": "Dashboard",
  Clients: "Customers",
  Client: "Customer",
  "Stock & Produits": "Stock & products",
  "Stock & produits": "Stock & products",
  Ventes: "Sales",
  Créances: "Receivables",
  "Créances clients": "Customer receivables",
  Dépenses: "Expenses",
  Retraits: "Withdrawals",
  "Crédits fournisseurs": "Supplier credit",
  "Chercher des produits": "Find products",
  Commandes: "Orders",
  "Mes notations": "My ratings",
  Paramètres: "Settings",
  Déconnexion: "Sign out",
  "Ouvrir le menu": "Open menu",
  "Visacredit XIXA, accueil": "Visacredit XIXA, home",
  Grossiste: "Wholesaler",
  Détaillant: "Retailer",
  détaillant: "retailer",
  Fournisseur: "Supplier",
  Partenaire: "Partner",
  "Mes commandes": "My orders",
  "Mes crédits fournisseurs": "My supplier credit",

  // ── Actions ────────────────────────────────────────────────────────────
  "+ Ajouter": "+ Add",
  "+ Nouveau client": "+ New customer",
  "+ Nouveau produit": "+ New product",
  "+ Nouvelle commande": "+ New order",
  "+ Nouvelle dépense": "+ New expense",
  "+ Nouvelle vente": "+ New sale",
  "+ Échéance": "+ Instalment",
  Annuler: "Cancel",
  Continuer: "Continue",
  Enregistrer: "Save",
  Fermer: "Close",
  Modifier: "Edit",
  Supprimer: "Delete",
  Valider: "Approve",
  Réessayer: "Try again",
  Retirer: "Withdraw",
  Encaisser: "Collect",
  Commander: "Order",
  Détails: "Details",
  Reçu: "Receipt",
  "Voir le reçu": "View receipt",
  "Se connecter": "Sign in",
  "Créer un compte": "Create an account",
  "Créer mon compte": "Create my account",
  "Mon tableau de bord": "My dashboard",
  "Plus tard": "Later",
  "Payer maintenant": "Pay now",
  Télécharger: "Download",
  "Télécharger pour Android": "Download for Android",
  "Imprimer le reçu": "Print receipt",
  "Générer le plan": "Generate schedule",
  "Planifier automatiquement": "Schedule automatically",

  // Libellés d'attente : le point de suspension marque une action en cours.
  "Chargement…": "Loading…",
  "Connexion…": "Signing in…",
  "Création…": "Creating…",
  "Enregistrement…": "Saving…",
  "Envoi…": "Sending…",
  "Modification…": "Updating…",
  "Recherche…": "Searching…",
  "Suppression…": "Deleting…",
  "Traitement…": "Processing…",
  "Vérification du paiement en cours…": "Verifying payment…",

  // ── En-têtes d'écran ───────────────────────────────────────────────────
  "Votre carnet d'adresses": "Your address book",
  "Ajoutez un client à votre carnet": "Add a customer to your address book",
  "Ajouter un client": "Add a customer",
  "Modifier le client": "Edit customer",
  "Créer le client": "Create customer",
  "Ajoutez un article à votre stock": "Add an item to your stock",
  "Ajouter un produit": "Add a product",
  "Modifier le produit": "Edit product",
  "Enregistrer le produit": "Save product",
  "Nouveau produit": "New product",
  "Nouveau client": "New customer",
  "Nouvelle vente": "New sale",
  "Nouvelle commande": "New order",
  "Nouveau retrait": "New withdrawal",
  "Enregistrer une vente": "Record a sale",
  "Enregistrez une transaction": "Record a transaction",
  "Enregistrer une transaction": "Record a transaction",
  "Enregistrer la vente": "Save sale",
  "Enregistrer la dépense": "Save expense",
  "Créer la commande": "Create order",
  "Historique de vos transactions": "Your transaction history",
  "Sommes restant dues par vos clients": "Amounts still owed by your customers",
  "Sorties de caisse": "Cash out",
  "Retirer de la caisse": "Withdraw from the till",
  "Avis échangés avec vos partenaires": "Reviews exchanged with your partners",
  "Votre profil et vos préférences": "Your profile and preferences",
  "Trouvez les produits des grossistes et commandez directement":
    "Find wholesalers' products and order directly",
  "Commandez auprès d'un grossiste, inscrit ou non sur Visacredit XIXA":
    "Order from a wholesaler, whether or not they are on Visacredit XIXA",
  "Commandes passées par vos clients détaillants": "Orders placed by your retail customers",
  "Commandes passées auprès de vos fournisseurs": "Orders placed with your suppliers",
  "Crédits à encaisser auprès des détaillants": "Credit to collect from retailers",
  "Crédits à payer à vos fournisseurs": "Credit to pay your suppliers",
  "Commencez à gérer votre boutique": "Start managing your shop",
  "Votre boutique, simplifiée": "Your shop, made simple",

  // ── Tableaux et champs ─────────────────────────────────────────────────
  Actions: "Actions",
  Adresse: "Address",
  "Adresse (optionnel)": "Address (optional)",
  "Ajouté le": "Added on",
  Article: "Item",
  Articles: "Items",
  Catégorie: "Category",
  "Choisir une catégorie…": "Choose a category…",
  "Choisir un produit…": "Choose a product…",
  "Préciser la catégorie": "Specify the category",
  "Date de naissance": "Date of birth",
  "Date de naissance (optionnel)": "Date of birth (optional)",
  "Date de paiement": "Payment date",
  "Date limite": "Due date",
  Échéance: "Instalment",
  Échéancier: "Payment schedule",
  "Échéances en retard": "Overdue instalments",
  "Paiements à venir": "Upcoming payments",
  "Premier paiement": "First payment",
  Email: "Email",
  "Email (optionnel)": "Email (optional)",
  Facture: "Invoice",
  "N° Facture": "Invoice no.",
  "N° Commande": "Order no.",
  Fréquence: "Frequency",
  "Fréquence de retrait": "Withdrawal frequency",
  Rythme: "Pace",
  "Nombre de fois": "Number of times",
  "IFU (Identifiant Fiscal Unique)": "TIN (Tax Identification Number)",
  "IFU (Identifiant Fiscal Unique) — si vous l'avez":
    "TIN (Tax Identification Number) — if you have one",
  "Registre du commerce (RCCM)": "Trade register (RCCM)",
  "Registre du commerce (RCCM) — optionnel": "Trade register (RCCM) — optional",
  Lignes: "Lines",
  Mode: "Method",
  "Mode de paiement": "Payment method",
  Montant: "Amount",
  "Montant (FCFA)": "Amount (FCFA)",
  "Montant encaissé (FCFA)": "Amount collected (FCFA)",
  "Montant payé": "Amount paid",
  "Montant payé (FCFA)": "Amount paid (FCFA)",
  "Montant total": "Total amount",
  "Montant total dû": "Total amount due",
  "Montant total des créances": "Total receivables",
  "Montant à encaisser": "Amount to collect",
  Nom: "Last name",
  Prénom: "First name",
  "Nom complet": "Full name",
  "Nom de la boutique": "Shop name",
  "Nom du produit": "Product name",
  "Nom du fournisseur": "Supplier name",
  "Informations du fournisseur": "Supplier details",
  "Téléphone du fournisseur": "Supplier phone",
  "Numéro de téléphone du fournisseur": "Supplier phone number",
  "Type de fournisseur": "Supplier type",
  "Fournisseur externe": "External supplier",
  Notes: "Notes",
  "Notes (optionnel)": "Notes (optional)",
  "Message (optionnel)": "Message (optional)",
  "Commentaire (optionnel)": "Comment (optional)",
  "Client (optionnel)": "Customer (optional)",
  "Client de passage": "Walk-in customer",
  "Prix d'achat (FCFA)": "Cost price (FCFA)",
  "Prix de vente": "Selling price",
  "Prix de vente (FCFA)": "Selling price (FCFA)",
  "Prix proposé pour la commande entière (FCFA)":
    "Price offered for the whole order (FCFA)",
  Produit: "Product",
  Produits: "Products",
  "Produits commandés": "Products ordered",
  "Produits en alerte": "Low stock",
  "Produits en alerte de stock": "Products low on stock",
  Qté: "Qty",
  Récapitulatif: "Summary",
  Règlement: "Settlement",
  Reste: "Remaining",
  "Reste dû": "Still owed",
  "Reste à payer": "Left to pay",
  "Second téléphone (optionnel)": "Second phone (optional)",
  "Seuil d'alerte": "Low-stock threshold",
  Solde: "Balance",
  "Solde actuel": "Current balance",
  "Solde de caisse": "Cash balance",
  "Solde disponible": "Available balance",
  Statut: "Status",
  Stock: "Stock",
  "Stock initial": "Opening stock",
  Suivi: "Tracking",
  Téléphone: "Phone",
  "Total à encaisser": "Total to collect",
  "Total déjà retiré": "Total already withdrawn",
  "Total dû": "Total due",
  "Type de compte": "Account type",
  "Ventes aujourd'hui": "Sales today",
  "Ventes du mois": "Sales this month",
  "Créances en cours": "Open receivables",
  "Créances encaissées": "Receivables collected",
  "Créances fournisseurs": "Supplier receivables",
  "Crédits soldés": "Credit settled",
  Encaissé: "Collected",
  "Déjà payé": "Already paid",
  "Le client est débité de": "The customer is charged",
  "Mot de passe": "Password",
  "Mot de passe actuel": "Current password",
  "Nouveau mot de passe": "New password",
  "Confirmer le nouveau mot de passe": "Confirm the new password",
  "6 caractères minimum": "6 characters minimum",
  Profil: "Profile",
  "Note moyenne reçue": "Average rating received",
  "Votre note": "Your rating",
  "Avis reçus": "Reviews received",
  "Avis que j'ai laissés": "Reviews I left",
  "Voir ses avis →": "See their reviews →",
  "⭐ Voir ses avis": "⭐ See their reviews",
  "⭐ Noter le client": "⭐ Rate the customer",
  "⭐ Noter le fournisseur": "⭐ Rate the supplier",
  "Envoyer mon avis": "Send my review",
  "Partagez votre expérience…": "Share your experience…",

  // ── Aides et exemples de saisie ────────────────────────────────────────
  "Ex : Riz": "e.g. Rice",
  "Ex : riz, sucre, farine…": "e.g. rice, sugar, flour…",
  "Ex : 22901020304": "e.g. 22901020304",
  "Exemple : 22901020304": "Example: 22901020304",
  "Ex : facture #123, lot spécial…": "e.g. invoice #123, special batch…",
  "Ex : client fidèle, commande régulière…": "e.g. loyal customer, regular order…",
  "Rechercher un produit…": "Search for a product…",
  "Rechercher par nom ou téléphone…": "Search by name or phone…",
  "Tapez au moins 2 caractères": "Type at least 2 characters",
  "Obligatoire. Les espaces et tirets sont ignorés.":
    "Required. Spaces and dashes are ignored.",
  "Vous pourrez le renseigner plus tard dans Paramètres. Les espaces et tirets sont ignorés.":
    "You can add it later in Settings. Spaces and dashes are ignored.",
  "Facultatif, mais tant qu'il n'est pas renseigné les retraits sont limités à la fréquence « 1 jour ».":
    "Optional, but until it is filled in withdrawals are limited to the “1 day” frequency.",
  "Sans lui, vos retraits seront limités à la fréquence « 1 jour ». Vous pourrez l'ajouter plus tard dans Paramètres.":
    "Without it, your withdrawals are limited to the “1 day” frequency. You can add it later in Settings.",
  "Renseignez votre registre du commerce ci-dessus pour choisir une autre fréquence de retrait.":
    "Fill in your trade register above to choose another withdrawal frequency.",
  "Le téléphone sert d'identifiant de connexion et ne peut pas être modifié ici":
    "The phone number is your sign-in ID and cannot be changed here",
  "Le type de compte ne peut pas être modifié depuis cet écran":
    "The account type cannot be changed from this screen",
  "S'il est inscrit sur Visacredit XIXA, il sera reconnu automatiquement":
    "If they are registered on Visacredit XIXA, they will be recognised automatically",
  "Ligne de secours, pour joindre le client quand la première ne répond pas":
    "Backup line, to reach the customer when the first one does not answer",
  "Votre avis aide les autres commerçants de la plateforme.":
    "Your review helps the other traders on the platform.",
  "Renseignez-le dans Paramètres": "Fill it in under Settings",

  // ── Rôles et types de compte ───────────────────────────────────────────
  "Fournisseur en gros": "Wholesale supplier",
  "Fournisseur en détail": "Retail supplier",
  "Fournisseur en gros — vous recevez et validez les commandes des détaillants":
    "Wholesale supplier — you receive and approve retailers' orders",
  "Fournisseur en détail — vous commandez chez les grossistes et vendez à vos clients":
    "Retail supplier — you order from wholesalers and sell to your customers",
  "Vous approvisionnez des détaillants": "You supply retailers",
  "Vous vendez aux clients finaux": "You sell to end customers",
  "Le grossiste": "The wholesaler",
  "Le détaillant": "The retailer",
  "Gérer les commandes des détaillants": "Manage retailers' orders",
  "Trouver un grossiste et passer une commande": "Find a wholesaler and place an order",

  // ── Paiement ───────────────────────────────────────────────────────────
  Espèces: "Cash",
  Comptant: "Upfront",
  Crédit: "Credit",
  "Crédit manuel": "Manual credit",
  "À crédit": "On credit",
  "Sur le solde": "From the balance",
  "Sur Visacredit XIXA": "On Visacredit XIXA",
  "💵 Espèces": "💵 Cash",
  "💵 Comptant": "💵 Upfront",
  "💵 Encaisser en espèces": "💵 Collect in cash",
  "💵 Payer en espèces": "💵 Pay in cash",
  "📅 Crédit": "📅 Credit",
  "📅 À crédit": "📅 On credit",
  "📱 Mobile Money (KkiaPay)": "📱 Mobile Money (KkiaPay)",
  "💳 Agrégateur": "💳 Aggregator",
  "💳 Demander le paiement": "💳 Request payment",
  "💳 Demander paiement": "💳 Request payment",
  "Demander le paiement": "Request payment",
  "Paiement mobile money": "Mobile money payment",
  "Numéro Mobile Money": "Mobile Money number",
  "Numéro Mobile Money du client": "Customer's Mobile Money number",
  "Téléphone ou email de l'agrégateur": "Aggregator phone or email",
  "l’agrégateur": "the aggregator",
  Passerelle: "Gateway",
  "Mobile Money — frais 1,9 %": "Mobile Money — 1.9% fee",
  "Carte et mobile — frais 1,8 %": "Card and mobile — 1.8% fee",
  "Répartition des frais": "Fee split",
  "Partage des frais de transaction": "Transaction fee split",
  "Le payeur supporte les frais": "The payer covers the fees",
  "Le client paie les frais": "The customer pays the fees",
  "Je supporte les frais": "I cover the fees",
  "Je paie les frais": "I pay the fees",
  "Frais à la charge du client": "Fees charged to the customer",
  "Frais à ma charge": "Fees charged to me",
  "À la charge du client": "Charged to the customer",
  "À ma charge": "Charged to me",
  "Moitié-moitié": "Split evenly",
  "À recevoir": "To receive",
  "Encaisser une créance": "Collect a receivable",
  "Paiement immédiat (espèces ou mobile money)":
    "Immediate payment (cash or mobile money)",
  "Vous définissez les échéances ci-dessous": "You set the instalments below",
  "Une dépense est générée automatiquement": "An expense is created automatically",
  "Enregistré dans les crédits fournisseurs": "Recorded under supplier credit",

  // ── Statuts ────────────────────────────────────────────────────────────
  "En cours": "Open",
  "En retard": "Overdue",
  Payé: "Paid",
  Payée: "Paid",
  Soldée: "Settled",
  Acceptée: "Accepted",
  Refusée: "Declined",
  Validée: "Approved",
  Livrée: "Delivered",
  Réceptionnée: "Received",
  "Contre-proposée": "Counter-offered",
  "En attente de réponse": "Awaiting a reply",
  "En attente de confirmation": "Awaiting confirmation",
  "⏳ En attente": "⏳ Pending",
  "✅ Validée": "✅ Approved",
  "📦 Livrée": "📦 Delivered",
  "✋ Reçue": "✋ Received",
  "💳 En attente de paiement": "💳 Awaiting payment",
  "✅ Payée": "✅ Paid",
  "✖ Annulée": "✖ Cancelled",
  "Commande passée": "Order placed",

  // ── Négociation et cycle de commande ───────────────────────────────────
  "Négociation du prix": "Price negotiation",
  "Proposer un prix": "Offer a price",
  "Contre-proposer": "Counter-offer",
  "Envoyer la proposition": "Send the offer",
  "✅ Valider la commande": "✅ Approve the order",
  "📦 Marquer comme livrée": "📦 Mark as delivered",
  "✖ Refuser la commande": "✖ Decline the order",
  "✖ Refuser le prix": "✖ Decline the price",
  "✖ Annuler ma commande": "✖ Cancel my order",
  "🧾 Reçu": "🧾 Receipt",
  "📦 Commandes reçues": "📦 Orders received",
  "Commandes reçues": "Orders received",
  "🔍 Chercher des produits": "🔍 Find products",
  "Valider cette commande ? Votre stock sera décrémenté et transféré au détaillant.":
    "Approve this order? Your stock will be decremented and transferred to the retailer.",
  "Confirmer la réception des produits ?": "Confirm receipt of the goods?",
  "Refuser définitivement cette commande ?": "Permanently decline this order?",
  "Annuler définitivement cette commande ?": "Permanently cancel this order?",
  "Refuser cette proposition de prix ?": "Decline this price offer?",
  "⚠️ Fournisseur externe — vous gérerez vous-même la réception et le paiement de cette commande.":
    "⚠️ External supplier — you will handle receipt and payment of this order yourself.",
  "trouvé sur Visacredit XIXA — il validera la commande et le stock sera transféré automatiquement.":
    "found on Visacredit XIXA — they will approve the order and stock will be transferred automatically.",
  "trouvé sur Visacredit XIXA — paiement traçable via la plateforme.":
    "found on Visacredit XIXA — payment traceable through the platform.",
  "sera créée automatiquement.": "will be created automatically.",
  "Reçu de commande": "Order receipt",
  "Document généré par Visacredit XIXA": "Document generated by Visacredit XIXA",
  "Merci de votre confiance — Visacredit XIXA": "Thank you for your trust — Visacredit XIXA",
  "← Retour à la commande": "← Back to the order",
  "← Retour aux commandes": "← Back to orders",
  "← Retour aux ventes": "← Back to sales",
  "← Retour aux notations": "← Back to ratings",

  // ── États vides ────────────────────────────────────────────────────────
  "Aucun client": "No customers",
  "Aucun client ne correspond à cette recherche.": "No customer matches this search.",
  "Ajoutez votre premier client pour suivre ses achats et ses créances.":
    "Add your first customer to track their purchases and receivables.",
  "Aucun produit": "No products",
  "Aucun produit trouvé": "No products found",
  "Aucun produit ne correspond à cette recherche.": "No product matches this search.",
  "Ajoutez votre premier produit pour commencer à vendre.":
    "Add your first product to start selling.",
  "Aucune vente": "No sales",
  "Enregistrez votre première vente pour suivre votre chiffre d'affaires.":
    "Record your first sale to track your turnover.",
  "Aucune commande": "No orders",
  "Vos clients détaillants n'ont pas encore passé de commande.":
    "Your retail customers have not placed an order yet.",
  "Cherchez des produits chez un grossiste pour passer votre première commande.":
    "Look for products at a wholesaler to place your first order.",
  "Aucune créance en cours": "No open receivables",
  "Aucune créance en attente": "No pending receivables",
  "Toutes vos ventes à crédit sont soldées.": "All your credit sales are settled.",
  "Aucun crédit en cours": "No open credit",
  "Aucun détaillant ne vous doit de marchandise à crédit.":
    "No retailer owes you goods on credit.",
  "Vous n'avez aucune dette fournisseur en cours.": "You have no outstanding supplier debt.",
  "Aucune dépense": "No expenses",
  "Les achats de marchandises réglés comptant sont ajoutés ici automatiquement.":
    "Goods bought and paid for upfront are added here automatically.",
  "Aucun retrait": "No withdrawals",
  "Vos retraits apparaîtront ici.": "Your withdrawals will appear here.",
  "Aucune notification": "No notifications",
  "Les événements de vos commandes apparaîtront ici.":
    "Events from your orders will appear here.",
  "Aucun avis reçu": "No reviews received",
  "Aucun avis laissé": "No reviews left",
  "Aucun avis pour le moment": "No reviews yet",
  "Les avis apparaissent après une commande réceptionnée.":
    "Reviews appear once an order has been received.",
  "Vos partenaires pourront vous noter après une commande réceptionnée.":
    "Your partners can rate you once an order has been received.",
  "Vous pourrez noter vos partenaires après réception d'une commande.":
    "You can rate your partners once an order has been received.",
  "Tout est à jour": "Everything is up to date",

  // ── Messages ───────────────────────────────────────────────────────────
  "Chargement impossible.": "Could not load.",
  "Enregistrement impossible.": "Could not save.",
  "Suppression impossible.": "Could not delete.",
  "Modification impossible.": "Could not update.",
  "Création impossible.": "Could not create.",
  "Recherche impossible.": "Could not search.",
  "Retrait impossible.": "Could not withdraw.",
  "Paiement impossible.": "Payment failed.",
  "Demande impossible.": "Request failed.",
  "Opération impossible.": "Operation failed.",
  "Proposition impossible.": "Offer failed.",
  "Confirmation impossible.": "Confirmation failed.",
  "Inscription impossible.": "Sign-up failed.",
  "Opération enregistrée.": "Operation recorded.",
  "Paiement confirmé.": "Payment confirmed.",
  "Paiement confirmé et imputé sur la créance.":
    "Payment confirmed and applied to the receivable.",
  "Paiement confirmé : la créance est encaissée.":
    "Payment confirmed: the receivable is collected.",
  "Paiement non abouti.": "Payment did not go through.",
  "Paiement échoué ou annulé.": "Payment failed or cancelled.",
  "Configuration de paiement indisponible.": "Payment configuration unavailable.",
  "Paramètres enregistrés.": "Settings saved.",
  "Mot de passe mis à jour.": "Password updated.",
  "Votre avis a été enregistré.": "Your review has been recorded.",
  "Proposition envoyée. Votre interlocuteur doit maintenant se prononcer.":
    "Offer sent. It is now up to the other party to respond.",
  "Crédit soldé en espèces. La dépense correspondante a été générée.":
    "Credit settled in cash. The matching expense has been created.",
  "Téléphone ou mot de passe incorrect.": "Incorrect phone number or password.",
  "Les deux nouveaux mots de passe ne correspondent pas.":
    "The two new passwords do not match.",
  "Ajoutez au moins un produit.": "Add at least one product.",
  "Ajoutez au moins un produit avec une quantité et un prix valides.":
    "Add at least one product with a valid quantity and price.",
  "Choisissez la catégorie du produit.": "Choose the product category.",
  "Choisissez une note entre 1 et 5 étoiles.": "Choose a rating between 1 and 5 stars.",
  "Une échéance est datée dans le passé.": "One instalment is dated in the past.",
  "Une échéance est datée dans le passé : un paiement se planifie à une date à venir.":
    "One instalment is dated in the past: a payment must be scheduled for a future date.",
  "Suffisant pour tous vos crédits": "Enough for all your credit",
  "Supprimer cette dépense ?": "Delete this expense?",
  "Supprimer cette notification": "Delete this notification",
  "Supprimer cette notification ?": "Delete this notification?",
  "Supprimer les lues": "Delete read ones",
  "Supprimer les notifications lues ?": "Delete read notifications?",
  "Tout supprimer": "Delete all",
  "Tout supprimer ?": "Delete everything?",
  "Tout marquer comme lu": "Mark all as read",
  "Cette action est définitive.": "This action is permanent.",
  "⚠️ IFU manquant": "⚠️ Missing TIN",
  "Votre Identifiant Fiscal Unique est obligatoire. Cliquez ici pour le renseigner dans Paramètres.":
    "Your Tax Identification Number is required. Click here to fill it in under Settings.",

  // ── Fréquences de retrait ──────────────────────────────────────────────
  "Chaque semaine": "Every week",
  "Tous les 15 jours": "Every 15 days",
  "Chaque mois": "Every month",
  "Chaque trimestre": "Every quarter",

  // ── Paramètres ─────────────────────────────────────────────────────────
  Apparence: "Appearance",
  "Thème de l'interface": "Interface theme",
  "Suit votre appareil": "Follows your device",
  "Toujours clair": "Always light",
  "Toujours sombre": "Always dark",
  Langue: "Language",
  "Langue de l'interface": "Interface language",
  "Langue de l'interface.": "Interface language.",
  "Ce choix est enregistré sur cet appareil uniquement.":
    "This choice is saved on this device only.",
  "Changer le mot de passe": "Change password",
  "Votre compte": "Your account",

  // ── Vitrine publique ───────────────────────────────────────────────────
  "Plateforme B2B de gestion de boutiques et magasins":
    "B2B platform for managing shops and stores",
  "La plateforme qui relie grossistes et détaillants : stock, ventes, créances, commandes B2B et crédits fournisseurs, sur le web comme sur le téléphone.":
    "The platform that connects wholesalers and retailers: stock, sales, receivables, B2B orders and supplier credit, on the web and on the phone.",
  "Comment ça marche": "How it works",
  Fonctions: "Features",
  "Grossiste & détaillant": "Wholesaler & retailer",
  Questions: "Questions",
  Confiance: "Trust",
  "Pour qui ?": "Who is it for?",
  "Deux métiers": "Two trades",
  "Tout au même endroit": "All in one place",
  "Questions fréquentes": "Frequently asked questions",
  "Bon à savoir": "Good to know",
  "Application mobile": "Mobile app",
  Bientôt: "Soon",
  "Android — lien bientôt disponible": "Android — link coming soon",
  "Version 1.1.0 · Android": "Version 1.1.0 · Android",

  "Encaissez comme vos clients paient": "Take payment the way your customers pay",
  "Mobile Money · KkiaPay": "Mobile Money · KkiaPay",
  "Mobile Money & carte · Agrégateur": "Mobile Money & card · Aggregator",

  "Du grossiste au détaillant, sans carnet.": "From wholesaler to retailer, without a ledger.",
  "Les deux comptes sont reliés : ce que l'un commande, l'autre le voit arriver. Plus de cahier à recopier ni d'appel pour savoir où en est la livraison.":
    "The two accounts are linked: what one orders, the other sees arrive. No more notebook to copy out, no more calls to find out where the delivery stands.",
  "Le détaillant commande": "The retailer orders",
  "Il cherche un produit parmi les catalogues des grossistes de la plateforme, compare, puis passe commande. Un numéro CMD- lui est attribué.":
    "They search the catalogues of the platform's wholesalers, compare, then place an order. A CMD- number is assigned.",
  "Le grossiste valide et livre": "The wholesaler approves and delivers",
  "La commande arrive chez lui. Il la valide, la livre, et se fait payer comptant, en mobile money, ou la laisse en crédit fournisseur.":
    "The order reaches them. They approve it, deliver it, and take payment upfront, by mobile money, or leave it as supplier credit.",
  "Tout se met à jour": "Everything updates",
  "Stock, position de caisse, créances et crédits suivent le mouvement des deux côtés. Chacun note l'autre à la réception.":
    "Stock, cash position, receivables and credit follow the movement on both sides. Each party rates the other on receipt.",

  "Les outils d'une boutique qui tourne.": "The tools of a shop that runs.",
  "Douze écrans, pensés pour le commerce d'ici : le stock, l'argent qui rentre, l'argent qui sort, et ce qui reste à régler.":
    "Twelve screens, designed for trade here: stock, money coming in, money going out, and what is left to settle.",
  "Catalogue, prix d'achat et de vente, seuil d'alerte. Vous savez ce qui manque avant que le client le demande.":
    "Catalogue, cost and selling prices, low-stock threshold. You know what is missing before the customer asks.",
  "Ventes & factures": "Sales & invoices",
  "Vente au comptant ou à crédit, facture numérotée BOU-, encaissement en espèces ou en mobile money avec partage des frais.":
    "Sales upfront or on credit, invoices numbered BOU-, payment in cash or mobile money with fee splitting.",
  "Un échéancier par client, des paiements partiels, et un badge « En retard » dès le jour d'échéance dépassé.":
    "A schedule per customer, partial payments, and an “Overdue” badge the day a due date passes.",
  "Commandes B2B": "B2B orders",
  "Du détaillant au grossiste : validation, livraison, réception, paiement. Négociation de prix et échéances comprises.":
    "From retailer to wholesaler: approval, delivery, receipt, payment. Price negotiation and instalments included.",
  "Ce que vous devez à vos grossistes, réglé en espèces, en mobile money ou directement sur votre solde.":
    "What you owe your wholesalers, settled in cash, by mobile money, or straight from your balance.",
  "Notations & confiance": "Ratings & trust",
  "Chaque partie note l'autre après la commande. La réputation d'un fournisseur se construit livraison après livraison.":
    "Each party rates the other after the order. A supplier's reputation is built delivery after delivery.",

  "Grossiste ou détaillant, la même plateforme.":
    "Wholesaler or retailer, the same platform.",
  "Vous choisissez votre rôle à l'inscription. L'application s'adapte : le grossiste reçoit et valide, le détaillant cherche et commande. Les deux vendent à leurs propres clients.":
    "You choose your role when you sign up. The app adapts: the wholesaler receives and approves, the retailer searches and orders. Both sell to their own customers.",
  "Le grossiste voit arriver les commandes des détaillants et les valide en un geste":
    "The wholesaler sees retailers' orders arrive and approves them in one gesture",
  "Le détaillant cherche un produit, compare les grossistes et commande sans se déplacer":
    "The retailer searches for a product, compares wholesalers and orders without leaving the shop",
  "Payé comptant ou laissé en crédit fournisseur : la dette reste chiffrée des deux côtés":
    "Paid upfront or left as supplier credit: the debt stays quantified on both sides",
  "Commandes traitées": "Orders handled",
  "Créances recouvrées": "Receivables recovered",
  "Position de caisse": "Cash position",
  "Commandes fournisseurs": "Supplier orders",
  "Produits en stock": "Products in stock",

  "Ce qu'il faut savoir avant d'ouvrir un compte.":
    "What you should know before opening an account.",
  "Le solde affiché est une position de caisse calculée : les ventes encaissées, moins les dépenses et les retraits, plus les versements.":
    "The balance shown is a computed cash position: sales collected, less expenses and withdrawals, plus deposits.",
  "IFU quand vous l'avez": "TIN when you have it",
  "L'Identifiant Fiscal Unique est demandé à l'inscription, mais n'y est pas exigé : une boutique déjà en activité ouvre son compte le jour même et le renseigne ensuite.":
    "The Tax Identification Number is asked for at sign-up, but not required there: a shop already trading opens its account the same day and fills it in afterwards.",
  "Aucun fonds conservé": "No funds held",
  "Les encaissements mobile money sont détenus chez l'agrégateur de paiement. Visacredit XIXA ne garde jamais votre argent.":
    "Mobile money collections are held by the payment aggregator. Visacredit XIXA never keeps your money.",
  "Session signée": "Signed session",
  "Connexion par téléphone et mot de passe, jeton signé à chaque appel, mot de passe chiffré en base.":
    "Sign-in by phone and password, a signed token on every call, password hashed in the database.",
  "Mobile sans réseau": "Mobile without a network",
  "L'application téléphone garde vos données dans une base sur l'appareil. Elle fonctionne même quand la connexion lâche.":
    "The phone app keeps your data in a database on the device. It works even when the connection drops.",

  "Fait pour le commerce de tous les jours.": "Built for everyday trade.",
  "Des exemples d'usage — pas des témoignages réels : la plateforme s'adapte à chaque façon de tenir boutique.":
    "Examples of use — not real testimonials: the platform adapts to every way of running a shop.",
  "Vend en gros aux détaillants": "Sells wholesale to retailers",
  "Les commandes des détaillants arrivent directement dans l'application. Je valide, je livre, et mon stock se met à jour tout seul.":
    "Retailers' orders come straight into the app. I approve, I deliver, and my stock updates itself.",
  "La détaillante": "The retailer",
  "Achète en gros, revend au détail": "Buys wholesale, sells retail",
  "Je cherche le produit, je compare les grossistes, je commande. Et je sais à tout moment ce qu'il me reste à leur payer.":
    "I search for the product, compare wholesalers, and order. And I know at any moment what I still owe them.",
  "La gérante de caisse": "The till manager",
  "Ventes à crédit et recouvrement": "Credit sales and recovery",
  "Mes clients achètent à crédit. L'échéancier me dit qui doit quoi, depuis quand, et qui est déjà en retard.":
    "My customers buy on credit. The schedule tells me who owes what, since when, and who is already late.",

  "rôles : grossiste et détaillant": "roles: wholesaler and retailer",
  "écrans de gestion": "management screens",
  "de frais mobile money": "mobile money fees",
  "hors ligne sur mobile": "offline on mobile",

  "Emportez votre boutique dans votre poche.": "Carry your shop in your pocket.",
  "Les mêmes écrans que le web, dans une application autonome : vos ventes, votre stock, vos créances et vos commandes vivent sur le téléphone et continuent de fonctionner quand le réseau lâche.":
    "The same screens as the web, in a standalone app: your sales, stock, receivables and orders live on the phone and keep working when the network drops.",
  "Aucune connexion n'est nécessaire après l'installation : les données sont conservées et chiffrées sur l'appareil.":
    "No connection is needed after installation: data is kept and encrypted on the device.",

  "Qui peut ouvrir un compte ?": "Who can open an account?",
  "Toute boutique ou magasin, en gros comme en détail. Vous choisissez votre rôle à l'inscription : fournisseur en gros ou fournisseur en détail. C'est lui qui décide des écrans que vous verrez.":
    "Any shop or store, wholesale or retail. You choose your role at sign-up: wholesale supplier or retail supplier. That role decides which screens you see.",
  "L'IFU est-il obligatoire ?": "Is the TIN required?",
  "Il est demandé à l'inscription, mais vous pouvez ouvrir votre compte sans l'avoir sous la main. Un bandeau invite alors à le renseigner dans Paramètres — c'est là qu'il devient obligatoire, et le compte n'est en règle qu'une fois rempli.":
    "It is asked for at sign-up, but you can open your account without it to hand. A banner then invites you to fill it in under Settings — that is where it becomes mandatory, and the account is only in order once it is filled in.",
  "Comment le solde est-il calculé ?": "How is the balance calculated?",
  "C'est une position de caisse : les ventes encaissées, moins les dépenses et les retraits, plus les versements. Les fonds encaissés en mobile money sont détenus chez l'agrégateur de paiement — la plateforme ne conserve aucun fonds.":
    "It is a cash position: sales collected, less expenses and withdrawals, plus deposits. Funds collected by mobile money are held by the payment aggregator — the platform holds no funds.",
  "Puis-je vendre à crédit ?": "Can I sell on credit?",
  "Oui. Une vente à crédit crée une créance client avec son échéance. Vous suivez les paiements partiels, et un badge « En retard » apparaît dès le jour d'échéance dépassé.":
    "Yes. A credit sale creates a customer receivable with its due date. You track partial payments, and an “Overdue” badge appears the day the due date passes.",
  "Y a-t-il une application mobile ?": "Is there a mobile app?",
  "Oui, avec les mêmes écrans que le web. Elle est autonome : les données vivent dans une base sur le téléphone et tout fonctionne sans réseau.":
    "Yes, with the same screens as the web. It is standalone: data lives in a database on the phone and everything works without a network.",

  "Ouvrez votre boutique sur Visacredit XIXA.": "Open your shop on Visacredit XIXA.",
  "Quelques minutes pour créer le compte, et votre stock, vos ventes et vos créances tiennent enfin au même endroit.":
    "A few minutes to create the account, and your stock, sales and receivables finally sit in one place.",
  "La plateforme de gestion des boutiques et magasins qui relie grossistes et détaillants. Votre boutique, tenue au clair.":
    "The shop and store management platform that connects wholesalers and retailers. Your shop, kept clear.",

  // Maquette du téléphone sur la vitrine
  "Bonjour, Rollande 👋": "Hello, Rollande 👋",
  "Commande CMD-2026-0004": "Order CMD-2026-0004",
  "Validée par le grossiste": "Approved by the wholesaler",
  "Créance encaissée": "Receivable collected",
  "Ajouté rapidement": "Added quickly",
  "Écran d'accueil de l'application mobile Visacredit XIXA : solde, clients, ventes, créances et raccourcis":
    "Home screen of the Visacredit XIXA mobile app: balance, customers, sales, receivables and shortcuts",

  // ── Phrases rattrapées après coup (entités JSX, texte coupé) ───────────
  "Prix d'achat": "Cost price",
  "S'inscrire": "Sign up",
  "J'ai déjà un compte": "I already have an account",
  "Télécharger l'application": "Download the app",
  "✋ J'ai reçu la commande": "✋ I received the order",
  "Mode de paiement de l'approvisionnement initial":
    "Payment method for the opening stock",
  "Aucun produit en stock. Ajoutez du stock avant d'enregistrer une vente.":
    "No product in stock. Add stock before recording a sale.",
  "Votre solde est nul : aucun retrait n'est possible pour l'instant.":
    "Your balance is zero: no withdrawal is possible for now.",
  "L'opération n'est enregistrée qu'après vérification auprès de la passerelle.":
    "The operation is only recorded after verification with the gateway.",
  "Le prix affiché est celui de la commande. Vous pouvez en proposer un autre : le grossiste devra l'accepter pour qu'il s'applique.":
    "The price shown is the order's. You may offer another: the wholesaler must accept it for it to apply.",
  "L'application mobile fonctionne hors ligne — vos données vivent sur votre téléphone.":
    "The mobile app works offline — your data lives on your phone.",
  "Plateforme B2B — grossistes & détaillants": "B2B platform — wholesalers & retailers",
  "Visacredit XIXA réunit votre stock, vos ventes, vos créances et vos commandes entre grossistes et détaillants. Un seul endroit pour savoir ce que vous avez, ce qu'on vous doit et ce que vous devez.":
    "Visacredit XIXA brings together your stock, your sales, your receivables and your orders between wholesalers and retailers. One place to know what you have, what you are owed and what you owe.",
  "Visacredit XIXA. Fonds détenus chez l'agrégateur de paiement — Visacredit XIXA ne conserve aucun fonds.":
    "Visacredit XIXA. Funds held by the payment aggregator — Visacredit XIXA holds no funds.",
  "Votre registre du commerce (RCCM) n'est pas enregistré : vos retraits sont limités à la fréquence":
    "Your trade register (RCCM) is not recorded: your withdrawals are limited to the frequency",
  "pour débloquer les autres rythmes.": "to unlock the other paces.",
  "reste {montant}": "{montant} left",
  "Votre boutique,": "Your shop,",
  "tenue au clair.": "kept clear.",
  "Bonjour, {prenom} 👋": "Hello, {prenom} 👋",
  "Thème de l'interface. Actuellement affiché en {theme}.":
    "Interface theme. Currently showing in {theme}.",
  clair: "light",
  sombre: "dark",
};
