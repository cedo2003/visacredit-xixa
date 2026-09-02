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
  "Visacredit XIXA réunit votre stock, vos ventes, vos créances et vos commandes entre grossistes et détaillants. Un seul endroit pour savoir ce que vous avez, ce qu'on vous doit et ce que vous devez.":
    "Visacredit XIXA brings together your stock, your sales, your receivables and your orders between wholesalers and retailers. One place to know what you have, what you are owed and what you owe.",
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

  // ── Mot de passe, pied de page, pages légales ──
  "Afficher le mot de passe": "Show password",
  "Masquer le mot de passe": "Hide password",
  "Confiance & Confidentialité": "Trust & Privacy",
  "Fonctionnalités": "Features",
  "Légal": "Legal",
  "Plateforme de gestion — grossistes & détaillants":
    "Management platform — wholesalers & retailers",
  "Visacredit ne conserve aucun fonds.": "Visacredit holds no funds.",
  "La plateforme de gestion des boutiques et magasins qui relie grossistes, détaillants et clients. Votre boutique, tenue au clair.":
    "The shop and store management platform connecting wholesalers, retailers and customers. Your shop, kept clear.",
  "Dernière mise à jour": "Last updated",
  "Retour à l'accueil": "Back to home",

  // ── Politique de confidentialité ──
  "Paiements": "Payments",
  "Vos droits": "Your rights",

  // ── Politique de cookies ──
  "L'application mobile": "The mobile app",

  // ── Facturation ──
  "Télécharger la facture (PDF)": "Download invoice (PDF)",
  "Préparation…": "Preparing…",
  "Document introuvable.": "Document not found.",
  "Le téléchargement a échoué.": "Download failed.",
  "Régime de TVA": "VAT status",
  "Non assujettie — TVA non applicable": "Not registered — VAT not applicable",
  "Assujettie à la TVA": "Registered for VAT",
  "Taux de TVA (%)": "VAT rate (%)",
  "Détermine ce qu'affiche la facture PDF de vos ventes.":
    "Determines what the PDF invoice of your sales shows.",
  "18 % au Bénin. Les prix saisis restent des prix TTC : la base hors taxes est calculée à partir du total.":
    "18% in Benin. The prices you enter stay tax-inclusive: the net base is derived from the total.",

  // ── Documents légaux ──────────────────────────────────────────────────
  //
  // Ces traductions sont celles des versions officielles anglaises fournies
  // par Visacredit, et non une traduction automatique du français : un texte
  // qui engage l'éditeur ne se traduit pas à la volée.
  //
  // `scripts/verifier-i18n.mjs` ne voit pas ces chaînes — elles arrivent par
  // des attributs JSX, pas des propriétés d'objet. Elles ne seront donc
  // jamais signalées comme manquantes : à tenir à jour à la main.
  "1. Objet": "1. Purpose",
  "1. Préambule": "1. Introduction",
  "1. Qu'est-ce qu'un cookie ?": "1. What Is a Cookie?",
  "1. Éditeur et exploitant de la plateforme": "1. Publisher and Operator of the Platform",
  "10. Obligations de l'Utilisateur": "10. User Obligations",
  "10. Vos droits": "10. Your Rights",
  "11. Cookies et traceurs": "11. Cookies and Trackers",
  "11. Propriété intellectuelle": "11. Intellectual Property",
  "12. Responsabilité et garanties": "12. Liability and Warranties",
  "12. Utilisateurs mineurs": "12. Minors",
  "13. Modification de la présente politique": "13. Changes to This Policy",
  "13. Protection des données personnelles": "13. Personal Data Protection",
  "14. Contact": "14. Contact",
  "14. Durée, suspension et résiliation": "14. Term, Suspension and Termination",
  "15. Modification des CGU": "15. Changes to These Terms",
  "16. Droit applicable et juridiction compétente": "16. Governing Law and Jurisdiction",
  "17. Contact": "17. Contact",
  "2. Directeur de la publication": "2. Publication Director",
  "2. Définitions": "2. Definitions",
  "2. Les cookies que nous utilisons": "2. The Cookies We Use",
  "2. Responsable du traitement": "2. Data Controller",
  "2.1 Cookies strictement nécessaires": "2.1 Strictly necessary cookies",
  "2.2 Cookies de préférence": "2.2 Preference cookies",
  "2.3 Cookies de mesure d'audience": "2.3 Audience measurement cookies",
  "2.4 Absence de cookies publicitaires tiers": "2.4 No third-party advertising cookies",
  "3. Accès à la Plateforme et création de compte":
    "3. Access to the Platform and Account Creation",
  "3. Données que nous collectons": "3. Data We Collect",
  "3. Durée de conservation des cookies": "3. Cookie Retention Period",
  "3. Hébergement": "3. Hosting",
  "3.1 Conditions d'éligibilité": "3.1 Eligibility",
  "3.1 Données fournies directement par l'Utilisateur":
    "3.1 Data provided directly by the User",
  "3.2 Choix du rôle": "3.2 Choice of Role",
  "3.2 Données collectées automatiquement": "3.2 Data collected automatically",
  "3.3 Données de paiement": "3.3 Payment data",
  "3.3 Renseignement de l'IFU (Identifiant fiscal)": "3.3 Providing the Tax ID (IFU)",
  "3.4 Identifiants de connexion": "3.4 Login Credentials",
  "31 août 2026": "August 31, 2026",
  "4. Activité de la Plateforme": "4. Business Activity of the Platform",
  "4. Finalités du traitement": "4. Purposes of Processing",
  "4. Fonctionnalités de la Plateforme": "4. Platform Features",
  "4. Gestion de votre consentement": "4. Managing Your Consent",
  "5. Base légale des traitements": "5. Legal Basis for Processing",
  "5. Comment désactiver les cookies depuis votre navigateur":
    "5. How to Disable Cookies in Your Browser",
  "5. Processus de commande entre Grossiste et Détaillant":
    "5. Ordering Process Between Wholesaler and Retailer",
  "5. Propriété intellectuelle": "5. Intellectual Property",
  "6. Autorité de contrôle des données personnelles":
    "6. Data Protection Supervisory Authority",
  "6. Modification de la présente politique": "6. Changes to This Policy",
  "6. Moyens de paiement": "6. Payment Methods",
  "6. Partage des données": "6. Data Sharing",
  "7. Contact": "7. Contact",
  "7. Créances, crédits fournisseurs et recouvrement":
    "7. Receivables, Supplier Credit and Collection",
  "7. Signalement d'un contenu ou d'un dysfonctionnement":
    "7. Reporting Content or a Malfunction",
  "7. Transferts internationaux de données": "7. International Data Transfers",
  "8. Durée de conservation": "8. Data Retention Period",
  "8. Médiation et réclamations": "8. Mediation and Complaints",
  "8. Notations et confiance entre Utilisateurs": "8. Ratings and Trust Between Users",
  "9. Application mobile et fonctionnement hors ligne":
    "9. Mobile Application and Offline Operation",
  "9. Crédits": "9. Credits",
  "9. Sécurité des données": "9. Data Security",
  "Adresse : 10 rue de Penthièvre, 75008, Paris, France":
    "Address: 10 rue de Penthièvre, 75008, Paris, France",
  "Améliorer nos services et développer de nouvelles fonctionnalités":
    "Improve our services and develop new features",
  "Application mobile Visacredit XIXA — version 1.1.0 (Android). Développement et conception : équipes du groupe Visacredit, exploitation opérationnelle assurée par l'Entité Exploitante applicable à chaque pays.":
    "Visacredit XIXA mobile application — version 1.1.0 (Android). Design and development: teams of the Visacredit group; operational management provided by the Operating Entity applicable to each country.",
  "Assurer la sécurité de la Plateforme et prévenir la fraude":
    "Ensure the security of the Platform and prevent fraud",
  "Assurer le fonctionnement du système de notation et de confiance entre utilisateurs":
    "Operate the rating and trust system between users",
  "Aucune conservation, par Visacredit, des fonds ou des moyens de paiement des utilisateurs — ceux-ci sont détenus exclusivement par l'agrégateur de paiement":
    "No holding of user funds or payment instruments by Visacredit — these are held exclusively by the payment aggregator",
  "Authentification par numéro de téléphone et mot de passe chiffré en base de données":
    "Authentication via phone number and password encrypted in our database",
  "Bénin": "Benin",
  "Calculer et afficher votre position de caisse, vos créances, vos crédits fournisseurs et vos statistiques de vente":
    "Calculate and display your cash position, receivables, supplier credit and sales statistics",
  "Ces cookies permettent de mémoriser vos choix afin de personnaliser votre expérience (langue d'affichage, boutique sélectionnée, préférences d'affichage du tableau de bord).":
    "These cookies allow us to remember your choices in order to personalize your experience (display language, selected shop, dashboard display preferences).",
  "Ces cookies sont indispensables au fonctionnement du site et de votre espace personnel. Ils ne peuvent pas être désactivés.":
    "These cookies are essential to the operation of the website and your personal account. They cannot be disabled.",
  "Cette liste est mise à jour au fur et à mesure de la création de nouvelles entités locales. Toutes les Entités Exploitantes sont des entités de Visacredit Tech Inc. (Delaware, États-Unis). Visacredit Tech Inc. n'exerce aucun rôle opérationnel dans l'exploitation de la Plateforme et n'est pas partie aux présentes CGU.":
    "This list is updated as new local entities are created. All Operating Entities are entities of Visacredit Tech Inc. (Delaware, United States). Visacredit Tech Inc. has no operational role in the operation of the Platform and is not a party to these Terms.",
  "Cette politique s'applique dans le respect de la loi applicable dans le pays de l'Entité Exploitante — notamment la loi béninoise n° 2017-20 portant Code du numérique pour les Utilisateurs relevant de Visacredit Tech Bénin SARL — et, pour les utilisateurs situés dans l'Union européenne, du Règlement général sur la protection des données (RGPD).":
    "This policy applies in compliance with the law applicable in the country of the Operating Entity — in particular Beninese Law No. 2017-20 on the Digital Code for Users falling under Visacredit Tech Bénin SARL — and, for users located in the European Union, the General Data Protection Regulation (GDPR).",
  "Chaque partie note l'autre à réception de la Commande":
    "Each party rates the other upon receipt of the Order",
  "Chiffrement des données stockées localement sur l'appareil mobile pour le fonctionnement hors ligne":
    "Encryption of data stored locally on the mobile device to enable offline operation",
  "Commandes B2B : recherche de produits, comparaison des Grossistes, passation, validation, livraison et réception des commandes entre Grossistes et Détaillants":
    "B2B orders: searching for products, comparing Wholesalers, placing, validating, delivering and receiving orders between Wholesalers and Retailers",
  "Conditions Générales d'Utilisation": "Terms of Use",
  "Conformément à la réglementation applicable dans le pays de l'Entité Exploitante, vous disposez des droits suivants sur vos données à caractère personnel :":
    "In accordance with the regulations applicable in the country of the Operating Entity, you have the following rights over your personal data:",
  "Contact : +33 01 77 62 30 03": "Contact: +33 01 77 62 30 03",
  "Cookies de session et d'authentification, associés à votre jeton de connexion signé":
    "Session and authentication cookies, linked to your signed connection token",
  "Cookies de sécurité, destinés à détecter et prévenir les tentatives de fraude ou d'usurpation":
    "Security cookies, designed to detect and prevent fraud or identity theft attempts",
  "Cookies techniques permettant la mémorisation de votre rôle (grossiste ou détaillant) au cours de votre session":
    "Technical cookies used to remember your role (wholesaler or retailer) during your session",
  "Courriel : contact@visacredit.info": "Email: contact@visacredit.info",
  "Créances clients : suivi d'un échéancier par client, enregistrement des paiements partiels, signalement des créances en retard":
    "Accounts receivable: tracking of a payment schedule per customer, recording of partial payments, flagging of overdue receivables",
  "Crédits fournisseurs : suivi des sommes dues aux Grossistes et de leur règlement, en espèces, en mobile money ou sur le solde":
    "Supplier credit: tracking of amounts owed to Wholesalers and their settlement, in cash, via mobile money, or against the balance",
  "Créer, authentifier et gérer votre compte grossiste ou détaillant":
    "Create, authenticate and manage your wholesaler or retailer account",
  "Côte d'Ivoire": "Côte d'Ivoire",
  "Données commerciales : catalogue de produits, prix d'achat et de vente, seuils d'alerte de stock":
    "Commercial data: product catalog, purchase and sale prices, stock alert thresholds",
  "Données d'identification : nom, prénom, numéro de téléphone, mot de passe (conservé sous forme chiffrée)":
    "Identification data: last name, first name, phone number, password (stored in encrypted form)",
  "Données de connexion et d'utilisation : jetons de session signés, historique de connexion, journaux techniques":
    "Connection and usage data: signed session tokens, login history, technical logs",
  "Données de gestion : ventes enregistrées, factures émises, créances clients et échéanciers, commandes B2B passées ou reçues, crédits fournisseurs, notations attribuées à vos partenaires commerciaux":
    "Management data: recorded sales, issued invoices, accounts receivable and payment schedules, B2B orders placed or received, supplier credit, ratings given to your business partners",
  "Données de l'appareil (application mobile) : identifiant technique de l'appareil, version de l'application, données stockées localement de façon chiffrée pour permettre le fonctionnement hors ligne":
    "Device data (mobile application): technical device identifier, application version, data stored locally in encrypted form to enable offline operation",
  "Données professionnelles : nom de la boutique, rôle choisi (grossiste ou détaillant), Identifiant Fiscal Unique (IFU) ou équivalent national lorsqu'il est renseigné — non obligatoire à l'inscription":
    "Business data: shop name, chosen role (wholesaler or retailer), Unique Tax Identifier (IFU) or national equivalent when provided — not required at sign-up",
  "Droit d'accès à vos données": "Right of access to your data",
  "Droit d'opposition et de limitation du traitement":
    "Right to object to and restrict processing",
  "Droit de rectification des données inexactes ou incomplètes":
    "Right to rectify inaccurate or incomplete data",
  "Droit de retirer votre consentement à tout moment, lorsque le traitement repose sur celui-ci":
    "Right to withdraw your consent at any time, where processing is based on it",
  "Droit à l'effacement de vos données, dans les limites de nos obligations légales de conservation":
    "Right to erasure of your data, within the limits of our legal retention obligations",
  "Droit à la portabilité de vos données": "Right to data portability",
  "En cas de litige, l'Utilisateur est invité à contacter en premier lieu le service client de Visacredit à l'adresse mentionnée ci-dessus. À défaut de résolution amiable, les dispositions relatives au droit applicable et à la juridiction compétente figurant dans les Conditions Générales d'Utilisation de XIXA trouveront à s'appliquer.":
    "In the event of a dispute, the User is invited to first contact Visacredit's customer service at the address mentioned above. Failing an amicable resolution, the provisions relating to governing law and competent jurisdiction set out in XIXA's Terms of Use shall apply.",
  "Entité applicable": "Applicable Entity",
  "Entité en cours d'immatriculation en République de Côte d'Ivoire":
    "Entity in the process of registration in the Republic of Côte d'Ivoire",
  "Fournir des informations exactes, complètes et à jour lors de son inscription et de l'utilisation de la Plateforme":
    "Provide accurate, complete and up-to-date information when signing up and using the Platform",
  "Fournir une assistance et un support client": "Provide customer support and assistance",
  "Google Chrome : Paramètres > Confidentialité et sécurité > Cookies":
    "Google Chrome: Settings > Privacy and security > Cookies",
  "Immatriculation": "Registration",
  "Immatriculation RCCM :": "RCCM registration:",
  "Immatriculation en cours": "Registration in progress",
  "Immatriculation en cours — [RCCM à compléter]":
    "Registration in progress — [RCCM number to be added]",
  "Immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) de Cotonou sous le numéro RB/COT/25 B 40300":
    "Registered with the Trade and Personal Property Credit Register (RCCM) of Cotonou under number RB/COT/25 B 40300",
  "Jeton de session signé à chaque appel à nos serveurs":
    "Signed session token on each call to our servers",
  "L'Entité Exploitante applicable est déterminée selon le tableau suivant, également repris dans les Mentions Légales de XIXA :":
    "The applicable Operating Entity is determined according to the following table, also set out in XIXA's Legal Notice:",
  "L'Entité Exploitante applicable à l'Utilisateur est déterminée selon le tableau suivant :":
    "The Operating Entity applicable to the User is determined according to the following table:",
  "L'Entité Exploitante applicable à l'Utilisateur, telle qu'identifiée dans le tableau ci-dessus, est seule responsable du traitement de ses données, en sa qualité d'éditrice et d'exploitante opérationnelle de XIXA pour son pays.":
    "The Operating Entity applicable to the User, as identified in the table above, is solely responsible for the processing of their data, as publisher and operational operator of XIXA for their country.",
  "L'accès au compte s'effectue au moyen d'un numéro de téléphone et d'un mot de passe. L'Utilisateur est seul responsable de la confidentialité de ses identifiants et de toute activité réalisée depuis son compte. Il s'engage à informer Visacredit sans délai en cas de perte, de vol ou d'utilisation non autorisée de ses identifiants.":
    "Account access is via a phone number and password. The User is solely responsible for keeping its credentials confidential and for any activity carried out from its account. The User agrees to inform Visacredit without delay in the event of loss, theft, or unauthorized use of its credentials.",
  "L'application mobile XIXA fonctionne en mode hors ligne : les données de l'Utilisateur sont conservées, chiffrées, directement sur son terminal, et ne transitent vers les serveurs de Visacredit que lors des synchronisations.":
    "The XIXA mobile application operates offline: User data is stored, encrypted, directly on the User's device, and only transmitted to Visacredit's servers during synchronization.",
  "L'application mobile XIXA fonctionne hors ligne : les données de l'Utilisateur (stock, ventes, créances, commandes) sont conservées, chiffrées, directement sur son terminal, et synchronisées avec les serveurs de Visacredit dès que la connexion est rétablie. L'Utilisateur est responsable de la sécurité physique de son terminal et de la mise à jour de l'application afin de bénéficier des derniers correctifs de sécurité. Visacredit ne saurait être tenu responsable de la perte de données résultant de la perte, du vol, de la réinitialisation ou du dysfonctionnement du terminal de l'Utilisateur.":
    "The XIXA mobile application operates offline: the User's data (inventory, sales, receivables, orders) is stored, encrypted, directly on the User's device, and synchronized with Visacredit's servers as soon as a connection is restored. The User is responsible for the physical security of its device and for updating the application to benefit from the latest security fixes. Visacredit shall not be held liable for any loss of data resulting from the loss, theft, reset, or malfunction of the User's device.",
  "L'application mobile XIXA fonctionne majoritairement hors ligne et conserve les données sur l'appareil dans une base locale chiffrée plutôt que par des cookies au sens strict du navigateur. Les principes de transparence et de contrôle décrits ci-dessous s'appliquent néanmoins par analogie à ce stockage local.":
    "The XIXA mobile application operates mostly offline and stores data on the device in a local encrypted database rather than through cookies in the strict browser sense. The principles of transparency and control described below nonetheless apply by analogy to this local storage.",
  "L'exécution du contrat qui nous lie à vous (Conditions Générales d'Utilisation), pour la fourniture du service":
    "Performance of the contract binding us to you (Terms of Use), for the provision of the service",
  "L'identifiant fiscal est demandé lors de l'inscription mais n'est pas exigé pour la création du compte : une boutique déjà en activité peut ouvrir son compte le jour même et renseigner son IFU ultérieurement.":
    "The tax ID is requested at sign-up but is not required in order to create an account: a shop already in operation may open its account the same day and provide its IFU at a later stage.",
  "L'utilisation de cookies et technologies similaires sur le site web de XIXA fait l'objet d'une Politique de Cookies distincte, disponible séparément.":
    "The use of cookies and similar technologies on the XIXA website is covered by a separate Cookie Policy.",
  "LWS France": "LWS France",
  "La Plateforme XIXA est réservée aux professionnels et commerçants majeurs, agissant dans le cadre de leur activité commerciale de vente en gros ou au détail. En créant un compte, l'Utilisateur déclare disposer de la capacité juridique nécessaire à l'exercice de son activité commerciale.":
    "The XIXA Platform is reserved for adult professionals and merchants acting within the scope of their wholesale or retail business activity. By creating an account, the User represents that it has the legal capacity necessary to carry on its business activity.",
  "La Plateforme XIXA est réservée aux professionnels et commerçants majeurs, agissant dans le cadre de leur activité commerciale. Elle n'est pas destinée aux mineurs.":
    "The XIXA Platform is reserved for adult professionals and merchants acting in the course of their business activity. It is not intended for minors.",
  "La Plateforme constitue un outil de suivi des Créances et des Crédits fournisseurs entre Utilisateurs. Visacredit n'intervient pas dans le recouvrement de ces sommes et ne garantit ni le paiement des Créances d'un Utilisateur envers ses clients, ni le règlement des Crédits fournisseurs d'un Détaillant envers un Grossiste. Chaque Utilisateur demeure seul responsable de la gestion commerciale de ses relations clients et fournisseurs.":
    "The Platform is a tool for tracking Receivables and Supplier Credit between Users. Visacredit does not participate in the collection of these amounts and does not guarantee either the payment of a User's Receivables from its customers, or the settlement of a Retailer's Supplier Credit owed to a Wholesaler. Each User remains solely responsible for managing its own customer and supplier relationships.",
  "La Plateforme, sa structure, ses fonctionnalités, ses contenus, ses marques et logos demeurent la propriété exclusive de Visacredit. L'Utilisateur bénéficie d'un droit d'usage personnel, non exclusif et non transférable de la Plateforme, pour la durée de son compte et dans le strict cadre des présentes CGU. L'Utilisateur conserve la propriété des données commerciales qu'il saisit (catalogue, ventes, créances) ; il concède à Visacredit le droit de les traiter dans la seule mesure nécessaire à la fourniture du service.":
    "The Platform, its structure, features, content, trademarks and logos remain the exclusive property of Visacredit. The User is granted a personal, non-exclusive, non-transferable right to use the Platform, for the duration of its account and strictly within the scope of these Terms. The User retains ownership of the business data it enters (catalog, sales, receivables); it grants Visacredit the right to process such data only to the extent necessary to provide the service.",
  "La Position de caisse affichée sur la Plateforme est une valeur calculée à titre informatif à partir des mouvements enregistrés par l'Utilisateur (ventes encaissées, dépenses, retraits, versements) ; elle ne constitue pas un solde bancaire ni un dépôt de fonds auprès de Visacredit.":
    "The Cash Position displayed on the Platform is a value calculated for information purposes based on movements recorded by the User (collected sales, expenses, withdrawals, deposits); it does not constitute a bank balance or a deposit of funds with Visacredit.",
  "La plateforme « Visacredit XIXA » (ci-après « XIXA », « la Plateforme ») est éditée par le groupe Visacredit. Elle est exploitée, à l'égard de chaque Utilisateur, par l'entité du groupe Visacredit légalement établie dans le pays d'enregistrement de l'Utilisateur (ci-après l'« Entité Exploitante »), conformément au tableau ci-dessous :":
    "The 'Visacredit XIXA' platform (\"XIXA\", \"the Platform\") is published by the Visacredit group. It is operated, in relation to each User, by the group entity legally established in the User's country of registration (the \"Operating Entity\"), in accordance with the table below:",
  "La présente Politique de Confidentialité décrit la manière dont l'entité du groupe Visacredit légalement établie dans le pays d'enregistrement de l'Utilisateur (ci-après l'« Entité Exploitante », « Visacredit », « nous »), éditrice et exploitante de la plateforme Visacredit XIXA (« XIXA », « la Plateforme ») pour ce pays, collecte, utilise, partage et protège les données à caractère personnel des utilisateurs grossistes et détaillants (« vous », « l'Utilisateur »).":
    "This Privacy Policy describes how the group entity legally established in the User's country of registration (the \"Operating Entity\", \"Visacredit\", \"we\"), publisher and operator of the Visacredit XIXA platform (\"XIXA\", \"the Platform\") for that country, collects, uses, shares and protects the personal data of wholesale and retail users (\"you\", \"the User\").",
  "La responsabilité de Visacredit, si elle venait à être retenue, est limitée aux dommages directs et prévisibles résultant d'un manquement avéré à ses obligations au titre des présentes CGU.":
    "Visacredit's liability, should it be established, is limited to direct and foreseeable damages resulting from a proven breach of its obligations under these Terms.",
  "Le Détaillant recherche un produit parmi les catalogues des Grossistes référencés sur la Plateforme, compare les offres, puis passe commande ; un numéro « CMD- » est attribué à la Commande":
    "The Retailer searches for a product among the catalogs of Wholesalers listed on the Platform, compares offers, and places an Order; a 'CMD-' number is assigned to the Order",
  "Le Grossiste reçoit la Commande, la valide, procède à la livraison et se fait régler comptant, en mobile money, ou accorde un Crédit fournisseur au Détaillant":
    "The Wholesaler receives the Order, validates it, delivers it, and is paid in cash, via mobile money, or grants Supplier Credit to the Retailer",
  "Le cas échéant, des cookies de mesure d'audience peuvent être utilisés afin de comprendre la manière dont les visiteurs utilisent le site (pages consultées, parcours de navigation) et d'améliorer nos services. Ces cookies sont utilisés sous une forme respectant votre vie privée et, lorsque la réglementation l'exige, ne sont déposés qu'avec votre consentement.":
    "Where applicable, audience measurement cookies may be used to understand how visitors use the website (pages viewed, browsing paths) and to improve our services. These cookies are used in a manner that respects your privacy and, where required by law, are only placed with your consent.",
  "Le directeur de la publication de la Plateforme XIXA est M. Justin Hadegbe, en sa qualité de gérant de Visacredit Tech Bénin SARL.":
    "The publication director of the XIXA Platform is Mr. Justin Hadegbe, in his capacity as manager of Visacredit Tech Bénin SARL.",
  "Le respect d'une obligation légale, notamment en matière fiscale ou de vigilance commerciale":
    "Compliance with a legal obligation, in particular for tax or due-diligence purposes",
  "Le site internet et les infrastructures serveur de la Plateforme XIXA sont hébergés par :":
    "The website and server infrastructure of the XIXA Platform are hosted by:",
  "Le stock, la Position de caisse, les Créances et les Crédits fournisseurs des deux parties sont mis à jour automatiquement":
    "Inventory, Cash Position, Receivables and Supplier Credit for both parties are updated automatically",
  "Le système de notation permet à chaque partie à une Commande d'évaluer, de bonne foi et sur la base de son expérience réelle, l'autre partie. L'Utilisateur s'engage à ne publier que des notations sincères et à ne pas détourner cette fonctionnalité à des fins de dénigrement ou de concurrence déloyale. Visacredit se réserve le droit de retirer toute notation manifestement abusive, diffamatoire ou sans rapport avec une Commande réellement exécutée.":
    "The rating system allows each party to an Order to evaluate, in good faith and based on its actual experience, the other party. The User agrees to post only honest ratings and not to misuse this feature for purposes of disparagement or unfair competition. Visacredit reserves the right to remove any rating that is manifestly abusive, defamatory, or unrelated to an Order that was actually carried out.",
  "Le traitement des données à caractère personnel des Utilisateurs est décrit dans la Politique de Confidentialité de XIXA, qui fait partie intégrante des présentes CGU. L'utilisation de cookies sur le site web de XIXA est décrite dans la Politique de Cookies de XIXA.":
    "The processing of Users' personal data is described in XIXA's Privacy Policy, which forms an integral part of these Terms. The use of cookies on the XIXA website is described in XIXA's Cookie Policy.",
  "Les agrégateurs de paiement (FedaPay ou autres) pour le traitement des encaissements et décaissements":
    "Payment aggregators (FedaPay and others) for processing payments and payouts",
  "Les autorités administratives ou judiciaires compétentes, lorsque la loi nous y oblige":
    "Competent administrative or judicial authorities, where required by law",
  "Les cookies déposés sur votre terminal ont une durée de conservation qui n'excède pas treize (13) mois à compter de leur premier dépôt, sauf pour les cookies strictement nécessaires à la sécurité et à l'authentification, dont la durée est limitée à votre session de connexion.":
    "Cookies placed on your device are retained for no longer than thirteen (13) months from the date they are first placed, except for cookies strictly necessary for security and authentication, which are limited to the duration of your login session.",
  "Les encaissements par mobile money (FedaPay) ou par carte via agrégateur sont traités directement par ces prestataires de paiement tiers agréés. Visacredit XIXA ne collecte ni ne conserve les numéros de carte bancaire ni les identifiants mobile money de l'Utilisateur ; nous recevons uniquement la confirmation et le montant de la transaction nécessaires à la mise à jour de la position de caisse et des créances.":
    "Mobile money (FedaPay) or card payments are processed directly by these licensed third-party payment providers. Visacredit XIXA does not collect or store the User's card numbers or mobile money credentials; we only receive confirmation and the transaction amount necessary to update the cash position and receivables.",
  "Les encaissements réalisés sur la Plateforme peuvent s'effectuer selon les modalités suivantes : espèces, mobile money (via l'agrégateur FedaPay), mobile money et carte via agrégateur de paiement, prélèvement sur le solde, ou vente à crédit.":
    "Payments collected on the Platform may be made using the following methods: cash, mobile money (via the FedaPay aggregator), mobile money and card via payment aggregator, deduction from balance, or credit sale.",
  "Les entités opérationnelles ci-dessus sont des filiales du groupe Visacredit, dont la société holding est :":
    "The operating entities above are subsidiaries of Visacredit Tech Inc.:",
  "Les fonds encaissés par mobile money ou par carte sont détenus par l'Agrégateur de paiement partenaire, et non par Visacredit : à aucun moment Visacredit ne conserve les fonds des Utilisateurs. Des frais, pouvant aller de 0 à 1,8 %, peuvent être appliqués sur les transactions par mobile money ; ces frais sont fixés et perçus par l'Agrégateur, et non par Visacredit. Le vendeur et l'acheteur ont la possibilité de se partager les frais.":
    "Funds collected via mobile money or card are held by the partner Payment Aggregator, not by Visacredit: at no point does Visacredit hold User funds. Fees, which may range from 0 to 1.8%, may be charged on mobile money transactions; these fees are set and collected by the Aggregator, not by Visacredit. The seller and the buyer may choose to share these fees between them.",
  "Les marques, dénominations et signes distinctifs du groupe Visacredit, y compris la dénomination « Visacredit XIXA » et les logos associés, sont détenus par Visacredit Tech Inc., et sont concédés en licence à chaque Entité Exploitante pour les besoins de l'exploitation de la Plateforme dans son pays. Les autres éléments composant la Plateforme XIXA (structure, textes, graphismes, icônes, bases de données, logiciels, code source, application mobile) sont la propriété exclusive de l'Entité Exploitante applicable, ou font l'objet d'une licence d'utilisation, et sont protégés par les législations nationales concernées ainsi que par le droit international de la propriété intellectuelle.":
    "The trademarks, names and distinctive signs of the Visacredit group, including the name 'Visacredit XIXA' and the associated logos, are held by Visacredit Tech Inc. and are licensed to each Operating Entity for the purposes of operating the Platform in its country. The other elements comprising the XIXA Platform (structure, text, graphics, icons, databases, software, source code, mobile application) are the exclusive property of the applicable Operating Entity, or are used under license, and are protected under the relevant national laws as well as international intellectual property law.",
  "Les présentes CGU s'appliquent pendant toute la durée d'utilisation de la Plateforme par l'Utilisateur. Visacredit peut suspendre ou résilier, à tout moment et sans préavis, l'accès d'un Utilisateur en cas de manquement grave aux présentes CGU, notamment en cas de fraude avérée, d'usage frauduleux du système de notation, ou de non-respect des obligations légales applicables. L'Utilisateur peut à tout moment demander la clôture de son compte en contactant le service client de Visacredit.":
    "These Terms apply for the entire duration of the User's use of the Platform. Visacredit may suspend or terminate a User's access at any time and without notice in the event of a serious breach of these Terms, in particular in the event of proven fraud, misuse of the rating system, or non-compliance with applicable legal obligations. The User may request the closure of its account at any time by contacting Visacredit's customer service.",
  "Les présentes CGU sont soumises au droit du pays de l'Entité Exploitante applicable à l'Utilisateur, tel qu'identifié dans le tableau figurant à l'article 1 (à titre d'exemple, le droit de la République du Bénin pour les Utilisateurs relevant de Visacredit Tech Bénin SARL). Tout différend relatif à la validité, à l'interprétation ou à l'exécution des présentes CGU qui n'aurait pu être résolu à l'amiable sera soumis aux tribunaux compétents du siège de l'Entité Exploitante concernée, sous réserve des dispositions d'ordre public éventuellement applicables à l'Utilisateur en fonction de sa qualité ou de sa localisation.":
    "These Terms are governed by the law of the country of the Operating Entity applicable to the User, as identified in the table set out in Article 1 (for example, the law of the Republic of Benin for Users falling under Visacredit Tech Bénin SARL). Any dispute relating to the validity, interpretation or performance of these Terms that cannot be resolved amicably shall be submitted to the competent courts of the registered seat of the Operating Entity concerned, subject to any mandatory public-order provisions applicable to the User depending on its status or location.",
  "Les présentes Conditions Générales d'Utilisation (« CGU ») ont pour objet de définir les modalités et conditions dans lesquelles l'entité du groupe Visacredit légalement établie dans le pays d'enregistrement de l'Utilisateur (ci-après l'« Entité Exploitante », « Visacredit », « nous »), éditrice et exploitante de la plateforme de gestion commerciale « Visacredit XIXA » (« XIXA », « la Plateforme ») pour ce pays, met celle-ci à disposition des grossistes et détaillants (« l'Utilisateur », « vous ») et régit l'utilisation de ses fonctionnalités.":
    "These Terms of Use (\"Terms\") set out the terms and conditions under which the group entity legally established in the User's country of registration (the \"Operating Entity\", \"Visacredit\", \"we\"), publisher and operator of the business management platform \"Visacredit XIXA\" (\"XIXA\", \"the Platform\") for that country, makes it available to wholesalers and retailers (\"the User\", \"you\") and governs the use of its features.",
  "Lors de son inscription, l'Utilisateur choisit son rôle sur la Plateforme : Grossiste ou Détaillant. Ce choix détermine les fonctionnalités auxquelles il a accès : le Grossiste reçoit et valide les commandes des Détaillants, tandis que le Détaillant recherche des produits, compare les Grossistes référencés et passe commande. Chaque Utilisateur, quel que soit son rôle, peut par ailleurs enregistrer ses propres ventes à ses clients finaux.":
    "When signing up, the User chooses its role on the Platform: Wholesaler or Retailer. This choice determines the features the User has access to: the Wholesaler receives and validates Retailers' orders, while the Retailer searches for products, compares listed Wholesalers, and places orders. Regardless of role, each User may also record its own sales to its end customers.",
  "Lors de votre première visite sur le site web de XIXA, un bandeau d'information vous permet d'accepter ou de refuser le dépôt des cookies non strictement nécessaires. Vous pouvez à tout moment modifier vos préférences via les paramètres de gestion des cookies accessibles depuis le site.":
    "On your first visit to the XIXA website, a banner allows you to accept or refuse the placement of non-essential cookies. You may change your preferences at any time via the cookie management settings available on the website.",
  "Lorsqu'aucune entité du groupe n'est établie dans le pays d'enregistrement de l'Utilisateur, Visacredit Tech Bénin SARL agit en qualité d'Entité Exploitante par défaut. Cette liste est mise à jour au fur et à mesure de la création de nouvelles entités locales du groupe, sans que cela nécessite une modification des présentes mentions légales autre que la mise à jour du tableau ci-dessus.":
    "Where no group entity is established in the User's country of registration, Visacredit Tech Bénin SARL acts as the default Operating Entity. This list is updated as new local group entities are created, without requiring any amendment to this Legal Notice other than an update to the table above.",
  "Mentions Légales": "Legal Notice",
  "Microsoft Edge : Paramètres > Cookies et autorisations de site":
    "Microsoft Edge: Settings > Cookies and site permissions",
  "Mozilla Firefox : Paramètres > Vie privée et sécurité > Cookies et données de sites":
    "Mozilla Firefox: Settings > Privacy & Security > Cookies and Site Data",
  "Ne pas utiliser la Plateforme à des fins frauduleuses, notamment pour enregistrer des transactions fictives ou fausser le système de notation":
    "Not use the Platform for fraudulent purposes, in particular to record fictitious transactions or manipulate the rating system",
  "Nos prestataires techniques (hébergement, maintenance, sécurité), tenus à des obligations de confidentialité":
    "Our technical service providers (hosting, maintenance, security), who are bound by confidentiality obligations",
  "Notations & confiance : possibilité, pour chaque partie à une Commande, de noter l'autre partie après exécution de celle-ci":
    "Ratings & trust: the ability for each party to an Order to rate the other party after the Order has been completed",
  "Notre intérêt légitime, pour la sécurité de la Plateforme, la prévention de la fraude et l'amélioration de nos services":
    "Our legitimate interest, for the security of the Platform, fraud prevention and service improvement",
  "Numéro d'immatriculation : EIN (IRS) : 32-0842131 — File Number : 10277308":
    "Registration number: EIN (IRS): 32-0842131 — File Number: 10277308",
  "Pays / zone": "Country / zone",
  "Permettre la mise en relation, la commande, la validation et le suivi des livraisons entre grossistes et détaillants":
    "Enable the matching, ordering, validation and delivery tracking process between wholesalers and retailers",
  "Politique de Confidentialité": "Privacy Policy",
  "Politique de Cookies": "Cookie Policy",
  "Pour exercer ces droits, contactez-nous à l'adresse visa.credit.africa@gmail.com. Vous disposez également du droit d'introduire une réclamation auprès de l'autorité de protection des données du pays de l'Entité Exploitante applicable (par exemple, l'Autorité de Protection des Données Personnelles — APDP — du Bénin pour les Utilisateurs relevant de Visacredit Tech Bénin SARL) ou, le cas échéant, de l'autorité de contrôle compétente de votre pays de résidence.":
    "To exercise these rights, contact us at visa.credit.africa@gmail.com. You also have the right to lodge a complaint with the data protection authority of the country of the applicable Operating Entity (for example, the Data Protection Authority (APDP) of Benin for Users falling under Visacredit Tech Bénin SARL) or, where applicable, the competent supervisory authority of your country of residence.",
  "Pour les traitements de données réalisés dans le cadre de l'exploitation de la Plateforme, l'autorité de contrôle compétente est celle du pays de l'Entité Exploitante applicable à l'Utilisateur (par exemple, l'Autorité de Protection des Données Personnelles — APDP — de la République du Bénin pour les Utilisateurs relevant de Visacredit Tech Bénin SARL). Pour les utilisateurs situés dans l'Union européenne, l'autorité de contrôle compétente est celle de leur État de résidence. Pour plus de détails, se reporter à la Politique de Confidentialité de XIXA.":
    "For data processing carried out in connection with the operation of the Platform, the competent supervisory authority is that of the country of the Operating Entity applicable to the User (for example, the Data Protection Authority (APDP) of the Republic of Benin for Users falling under Visacredit Tech Bénin SARL). For users located in the European Union, the competent supervisory authority is that of their State of residence. For further details, please refer to XIXA's Privacy Policy.",
  "Pour toute question relative aux présentes Conditions Générales d'Utilisation, l'Utilisateur peut contacter Visacredit à l'adresse : contact@visacredit.info, ou par téléphone/whatsapp au +229 01 40 50 22 50.":
    "For any question relating to these Terms of Use, the User may contact Visacredit at: contact@visacredit.info, or by phone/WhatsApp at +229 01 40 50 22 50.",
  "Pour toute question relative à cette politique ou à l'exercice de vos droits, vous pouvez contacter Visacredit à l'adresse : contact@visacredit.info.":
    "For any question relating to this policy or to exercise your rights, you may contact Visacredit at: contact@visacredit.info.",
  "Pour toute question relative à l'utilisation des cookies sur la Plateforme XIXA, vous pouvez nous contacter à l'adresse : contact@visacredit.info.":
    "For any question relating to the use of cookies on the XIXA Platform, you may contact us at: contact@visacredit.info.",
  "Pour toute question relative à la présente Politique de Confidentialité ou à la protection de vos données personnelles, vous pouvez nous contacter à l'adresse : contact@visacredit.info.":
    "For any question relating to this Privacy Policy or to the protection of your personal data, you may contact us at: contact@visacredit.info.",
  "Préserver la confidentialité de ses identifiants de connexion":
    "Keep its login credentials confidential",
  "RCCM Cotonou RB/COT/25 B 40300": "RCCM Cotonou RB/COT/25 B 40300",
  "Représentée par son gérant, M. Justin Hadegbe":
    "Represented by its manager, Mr. Justin Hadegbe",
  "Respecter les droits des autres Utilisateurs et des tiers":
    "Respect the rights of other Users and of third parties",
  "Respecter nos obligations légales et réglementaires, notamment en matière de lutte contre le blanchiment de capitaux et le financement du terrorisme, le cas échéant":
    "Comply with our legal and regulatory obligations, including anti-money laundering and counter-terrorist financing requirements, where applicable",
  "Safari : Réglages > Confidentialité > Gérer les données de site":
    "Safari: Preferences > Privacy > Manage Website Data",
  "Sauf mention contraire, toute référence à « Visacredit », « nous », « notre », « nos » dans les présentes mentions légales et dans les documents associés (Conditions Générales d'Utilisation, Politique de Confidentialité, Politique de Cookies) désigne l'Entité Exploitante applicable à l'Utilisateur concerné, en sa qualité d'éditeur et d'exploitant opérationnel de la Plateforme XIXA pour son pays.":
    "Unless stated otherwise, any reference to 'Visacredit', 'we', 'us', 'our' in this Legal Notice and in the related documents (Terms of Use, Privacy Policy, Cookie Policy) refers to the Operating Entity applicable to the User concerned, as publisher and operational operator of the XIXA Platform for its country.",
  "Se conformer à ses propres obligations légales, fiscales et réglementaires liées à son activité commerciale":
    "Comply with its own legal, tax and regulatory obligations related to its business activity",
  "Selon son rôle, l'Utilisateur a accès à tout ou partie des fonctionnalités suivantes :":
    "Depending on its role, the User has access to some or all of the following features:",
  "Siège social :": "Registered office:",
  "Siège social : Ilot 211, Quartier Fifatin, Parcelle K, 2ème étage, Cotonou, République du Bénin":
    "Registered office: Ilot 211, Quartier Fifatin, Parcelle K, 2nd floor, Cotonou, Republic of Benin",
  "Société holding du groupe": "Group Holding Company",
  "Société à responsabilité limitée (SARL) de droit béninois, au capital social de 5 000 000 FCFA":
    "Limited liability company (SARL) under the laws of Benin, with a share capital of 5,000,000 FCFA",
  "Stock & produits : gestion du catalogue, des prix d'achat et de vente, et des seuils d'alerte de réapprovisionnement":
    "Inventory & products: catalog management, purchase and sale prices, and restocking alert thresholds",
  "Tant que Visacredit Tech Côte d'Ivoire n'est pas formellement immatriculée, Visacredit Tech Bénin SARL demeure l'Entité Exploitante par défaut pour les Utilisateurs ivoiriens, conformément au tableau ci-dessus.":
    "As long as Visacredit Tech Côte d'Ivoire is not formally registered, Visacredit Tech Bénin SARL remains the default Operating Entity for Ivorian Users, in accordance with the table above.",
  "Tout autre pays sans entité locale établie":
    "Any other country with no local entity established",
  "Toute personne souhaitant signaler un contenu illicite, un dysfonctionnement technique ou toute autre difficulté rencontrée sur la Plateforme peut contacter Visacredit à l'adresse suivante : contact@visacredit.info.":
    "Anyone wishing to report unlawful content, a technical malfunction, or any other issue encountered on the Platform may contact Visacredit at: contact@visacredit.info.",
  "Toute reproduction, représentation, modification, publication, transmission ou dénaturation, totale ou partielle, de la Plateforme ou de son contenu, par quelque procédé que ce soit, sans autorisation écrite préalable, est strictement interdite et constitutive de contrefaçon. Toute utilisation non autorisée des marques du groupe est susceptible d'engager la responsabilité de son auteur.":
    "Any reproduction, representation, modification, publication, transmission or alteration, in whole or in part, of the Platform or its content, by any means whatsoever, without prior written authorization, is strictly prohibited and constitutes an infringement. Any unauthorized use of the group's trademarks may give rise to liability on the part of its author.",
  "Toutes les Entités Exploitantes sont des entités de Visacredit Tech Inc. (Delaware, États-Unis), qui n'exerce aucun rôle opérationnel dans l'exploitation de la Plateforme.":
    "All Operating Entities are entities of Visacredit Tech Inc. (Delaware, United States), which has no operational role in the operation of the Platform.",
  "Toutes les Entités Exploitantes sont des entités de Visacredit Tech Inc. (Delaware, États-Unis). Visacredit Tech Inc. n'a aucun rôle opérationnel dans l'exploitation de la Plateforme et ne traite pas, à titre opérationnel, les données des Utilisateurs de XIXA, quel que soit leur pays.":
    "All Operating Entities are entities of Visacredit Tech Inc. (Delaware, United States). Visacredit Tech Inc. has no operational role in the operation of the Platform and does not process XIXA Users' data for operational purposes, regardless of their country.",
  "Téléphone / Whatsapp : +229 40 50 22 50": "Phone / WhatsApp: +229 40 50 22 50",
  "Un cookie est un petit fichier texte déposé sur votre ordinateur, votre tablette ou votre smartphone lors de la consultation du site web de Visacredit XIXA (« XIXA », « la Plateforme »), édité par le groupe Visacredit et exploité localement par l'entité établie dans votre pays d'enregistrement (l'« Entité Exploitante », « Visacredit », « nous » — voir la liste des Entités Exploitantes dans les Mentions Légales de XIXA). Visacredit Tech Inc. (États-Unis) n'a aucun rôle opérationnel dans l'exploitation de la Plateforme. Un cookie permet, entre autres, de reconnaître votre terminal lors de vos visites ultérieures et de faciliter votre navigation.":
    "A cookie is a small text file placed on your computer, tablet or smartphone when you visit the Visacredit XIXA website (\"XIXA\", \"the Platform\"), published by the Visacredit group and operated locally by the entity established in your country of registration (the \"Operating Entity\", \"Visacredit\", \"we\" — see the list of Operating Entities in XIXA's Legal Notice). Visacredit Tech Inc. (United States) has no operational role in the operation of the Platform. A cookie allows, among other things, your device to be recognized on subsequent visits and facilitates your browsing experience.",
  "Utiliser la Plateforme conformément à sa destination, dans le cadre d'une activité commerciale licite":
    "Use the Platform in accordance with its intended purpose, within the scope of a lawful business activity",
  "Ventes & factures : enregistrement des ventes au comptant ou à crédit, génération de factures numérotées, encaissement en espèces ou en mobile money":
    "Sales & invoices: recording of cash or credit sales, generation of numbered invoices, collection in cash or via mobile money",
  "Visacredit Tech Bénin SARL": "Visacredit Tech Bénin SARL",
  "Visacredit Tech Bénin SARL (par défaut)": "Visacredit Tech Bénin SARL (default)",
  "Visacredit Tech Côte d'Ivoire": "Visacredit Tech Côte d'Ivoire",
  "Visacredit Tech Côte d'Ivoire SARL": "Visacredit Tech Côte d'Ivoire SARL",
  "Visacredit Tech Inc. n'exerce aucun rôle opérationnel dans l'exploitation de la Plateforme XIXA, quel que soit le pays de l'Utilisateur. Elle n'intervient pas dans la fourniture du service, ne gère pas la relation client, et ne traite pas les données des Utilisateurs à titre opérationnel. Ces activités relèvent exclusivement de l'Entité Exploitante applicable.":
    "Visacredit Tech Inc. has no operational role in the operation of the XIXA Platform, regardless of the User's country. It does not take part in providing the service, does not manage the customer relationship, and does not process Users' data for operational purposes. These activities are the exclusive responsibility of the applicable Operating Entity.",
  "Visacredit Tech Inc., société de droit américain constituée dans l'État du Delaware (États-Unis d'Amérique)":
    "Visacredit Tech Inc., a company incorporated under the laws of the State of Delaware, United States of America",
  "Visacredit Tech Inc., société holding du groupe, peut recevoir des données agrégées ou anonymisées à des fins de gouvernance et de consolidation de groupe, mais n'a pas accès, dans le cadre de son rôle de holding, à vos données à caractère personnel identifiables pour un usage opérationnel.":
    "Visacredit Tech Inc., the group's holding company, may receive aggregated or anonymized data for group governance and consolidation purposes, but does not, in its capacity as a holding company, have access to your identifiable personal data for operational use.",
  "Visacredit XIXA est une plateforme de gestion commerciale à destination des grossistes et détaillants, permettant notamment la gestion des stocks, des ventes, des factures, des créances clients, des commandes interentreprises (B2B) et des crédits fournisseurs. XIXA n'est ni un établissement de paiement, ni un établissement de crédit, ni un teneur de compte : les encaissements par mobile money ou par carte sont opérés et détenus par des agrégateurs de paiement tiers agréés (notamment FedaPay), et non par Visacredit.":
    "Visacredit XIXA is a business management platform for wholesalers and retailers, enabling in particular the management of inventory, sales, invoices, accounts receivable, business-to-business (B2B) orders, and supplier credit. XIXA is neither a payment institution, nor a credit institution, nor an account custodian: mobile money or card payments are processed and held by licensed third-party payment aggregators (including FedaPay), and not by Visacredit.",
  "Visacredit XIXA n'utilise pas de cookies à des fins de publicité ciblée ou de revente de données de navigation à des tiers annonceurs.":
    "Visacredit XIXA does not use cookies for targeted advertising purposes or to resell browsing data to third-party advertisers.",
  "Visacredit met en œuvre des moyens raisonnables pour assurer la disponibilité, la sécurité et le bon fonctionnement de la Plateforme, sans toutefois garantir une disponibilité continue ou une absence totale d'erreurs. Visacredit ne saurait être tenu responsable des dommages résultant : d'une utilisation non conforme de la Plateforme par l'Utilisateur ; d'un différend commercial entre un Grossiste et un Détaillant ; d'un défaut de paiement d'une Créance ou d'un Crédit fournisseur entre Utilisateurs ; d'une interruption ou d'une indisponibilité de l'Agrégateur de paiement ; ou d'un cas de force majeure.":
    "Visacredit uses reasonable efforts to ensure the availability, security and proper functioning of the Platform, without however guaranteeing continuous availability or the total absence of errors. Visacredit shall not be held liable for damages resulting from: non-compliant use of the Platform by the User; a commercial dispute between a Wholesaler and a Retailer; a default in payment of a Receivable or Supplier Credit between Users; an interruption or unavailability of the Payment Aggregator; or an event of force majeure.",
  "Visacredit met à disposition l'outil technique permettant cette mise en relation et ce suivi, mais n'est pas partie au contrat de vente conclu entre le Grossiste et le Détaillant. La négociation des prix, des délais de livraison et des conditions de paiement relève de la seule responsabilité des Utilisateurs concernés.":
    "Visacredit provides the technical tool enabling this matching and tracking process but is not a party to the sales contract entered into between the Wholesaler and the Retailer. The negotiation of prices, delivery terms and payment conditions is the sole responsibility of the Users concerned.",
  "Visacredit ne vend ni ne loue vos données personnelles à des tiers à des fins commerciales ou publicitaires.":
    "Visacredit does not sell or rent your personal data to third parties for commercial or advertising purposes.",
  "Visacredit peut modifier la présente Politique de Cookies à tout moment, notamment pour tenir compte de l'évolution de la réglementation ou des technologies utilisées sur la Plateforme. La version en vigueur est celle publiée sur le site XIXA, avec mention de sa date de dernière mise à jour.":
    "Visacredit may amend this Cookie Policy at any time, in particular to reflect changes in regulation or in the technologies used on the Platform. The version in force is the one published on the XIXA website, indicating its last update date.",
  "Visacredit peut être amené à modifier la présente Politique de Confidentialité, notamment pour se conformer à toute évolution légale, réglementaire, technique ou fonctionnelle de la Plateforme, ou pour mettre à jour la liste des Entités Exploitantes du groupe. La version en vigueur est celle publiée sur le site et dans l'application XIXA, avec mention de sa date de dernière mise à jour.":
    "Visacredit may amend this Privacy Policy from time to time, in particular to comply with any legal, regulatory, technical or functional change to the Platform, or to update the list of the group's Operating Entities. The version in force is the one published on the XIXA website and application, indicating its last update date.",
  "Visacredit se réserve le droit de modifier les présentes CGU à tout moment, notamment pour tenir compte de l'évolution de la Plateforme, de la réglementation applicable ou de ses conditions d'exploitation. Toute modification substantielle sera portée à la connaissance des Utilisateurs par tout moyen approprié (notification dans l'application, courriel ou affichage sur le site). La poursuite de l'utilisation de la Plateforme après entrée en vigueur des modifications vaut acceptation de celles-ci.":
    "Visacredit reserves the right to amend these Terms at any time, in particular to reflect changes to the Platform, applicable regulations, or its operating conditions. Any material change will be brought to the attention of Users by appropriate means (in-app notification, email, or notice on the website). Continued use of the Platform after such changes take effect constitutes acceptance of them.",
  "Vos données peuvent être partagées avec :": "Your data may be shared with:",
  "Vos données sont conservées pendant toute la durée de votre compte actif sur la Plateforme. À la clôture de votre compte, vos données sont conservées pendant une durée supplémentaire nécessaire au respect des obligations légales, comptables et fiscales applicables dans le pays de l'Entité Exploitante (notamment en matière de lutte contre le blanchiment de capitaux le cas échéant), puis archivées ou supprimées.":
    "Your data is retained for the entire duration of your active account on the Platform. Upon closure of your account, your data is retained for an additional period necessary to comply with the legal, accounting and tax obligations applicable in the country of the Operating Entity (including anti-money laundering obligations where applicable), after which it is archived or deleted.",
  "Vos données sont traitées et hébergées dans le cadre de l'exploitation de la Plateforme par l'Entité Exploitante applicable à votre pays. Dans la mesure où le groupe Visacredit dispose d'une société holding aux États-Unis (Visacredit Tech Inc.) et de plusieurs Entités Exploitantes réparties dans différents pays, un transfert ponctuel de données agrégées ou anonymisées à des fins de gouvernance de groupe est possible ; il est, le cas échéant, encadré par des garanties appropriées (clauses contractuelles types ou mécanismes équivalents) destinées à assurer un niveau de protection adéquat de vos données.":
    "Your data is processed and hosted in connection with the operation of the Platform by the Operating Entity applicable to your country. Because the Visacredit group has a holding company in the United States (Visacredit Tech Inc.) and several Operating Entities located in different countries, an occasional transfer of aggregated or anonymized data may occur for group governance purposes; where applicable, it is governed by appropriate safeguards (standard contractual clauses or equivalent mechanisms) designed to ensure an adequate level of protection for your data.",
  "Votre consentement, notamment pour certains cookies non essentiels (voir notre Politique de Cookies)":
    "Your consent, in particular for certain non-essential cookies (see our Cookie Policy)",
  "Votre partenaire commercial direct dans le cadre d'une commande B2B (par exemple, le grossiste voit le nom de la boutique du détaillant qui commande, et réciproquement), ainsi que les notations échangées entre vous, dans la mesure nécessaire au fonctionnement de la mise en relation grossiste/détaillant":
    "Your direct business partner in connection with a B2B order (for example, the wholesaler sees the shop name of the retailer placing the order, and vice versa), as well as the ratings exchanged between you, to the extent necessary for the wholesaler/retailer matching functionality",
  "Vous pouvez également configurer votre navigateur pour refuser tout ou partie des cookies, ou être averti avant leur dépôt. La désactivation des cookies strictement nécessaires peut toutefois empêcher le bon fonctionnement de votre espace personnel sur XIXA.":
    "You may also configure your browser to refuse all or some cookies, or to be notified before they are placed. Disabling strictly necessary cookies may, however, prevent your personal account on XIXA from functioning properly.",
  "XIXA a pour vocation de réunir, en un seul endroit, la gestion du stock, des ventes, des créances et des commandes interentreprises entre grossistes et détaillants. Toute création de compte sur la Plateforme emporte acceptation pleine et entière des présentes CGU.":
    "XIXA is designed to bring together, in a single place, the management of inventory, sales, receivables and business-to-business orders between wholesalers and retailers. Creating an account on the Platform constitutes full and unconditional acceptance of these Terms.",
  "« Agrégateur de paiement » : prestataire de paiement tiers (notamment FedaPay) permettant l'encaissement par mobile money ou par carte sur la Plateforme.":
    "\"Payment Aggregator\": a third-party payment provider (including FedaPay) enabling mobile money or card payment collection on the Platform.",
  "« Commande » : commande interentreprises passée par un Détaillant auprès d'un Grossiste via la Plateforme, identifiée par un numéro au format « CMD- ».":
    "\"Order\": a business-to-business order placed by a Retailer with a Wholesaler via the Platform, identified by a number in the format \"CMD-\".",
  "« Créance » : somme due à l'Utilisateur par l'un de ses propres clients, à la suite d'une vente à crédit enregistrée sur la Plateforme.":
    "\"Receivable\": an amount owed to the User by one of its own customers, following a credit sale recorded on the Platform.",
  "« Crédit fournisseur » : somme due par un Détaillant à un Grossiste à la suite d'une Commande livrée et non intégralement réglée.":
    "\"Supplier Credit\": an amount owed by a Retailer to a Wholesaler following an Order that has been delivered and not fully paid.",
  "« Détaillant » : Utilisateur professionnel qui recherche des produits auprès des grossistes référencés sur la Plateforme, passe commande et revend à ses propres clients.":
    "\"Retailer\": a business User who searches for products from wholesalers listed on the Platform, places orders, and resells to its own customers.",
  "« Facture » : document généré lors d'une vente enregistrée sur la Plateforme, identifié par un numéro au format « BOU- ».":
    "\"Invoice\": a document generated when a sale is recorded on the Platform, identified by a number in the format \"BOU-\".",
  "« Grossiste » : Utilisateur professionnel qui propose ses produits à la vente à des détaillants via la Plateforme, reçoit et valide leurs commandes.":
    "\"Wholesaler\": a business User who offers products for sale to retailers via the Platform, and who receives and validates their orders.",
  "« IFU » : Identifiant Fiscal Unique délivré par l'administration fiscale béninoise.":
    "\"IFU\": the Unique Tax Identifier issued by the Beninese tax administration.",
  "« Position de caisse » : solde calculé automatiquement par la Plateforme à partir des ventes encaissées, diminué des dépenses et retraits, et augmenté des versements enregistrés.":
    "\"Cash Position\": a balance automatically calculated by the Platform based on collected sales, minus expenses and withdrawals, plus recorded deposits.",
  "Édité par le groupe Visacredit — exploité localement par l'entité applicable à chaque pays":
    "Published by the Visacredit group — operated locally by the entity applicable to each country",
};
