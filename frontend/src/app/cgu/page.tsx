import type { Metadata } from "next";

import {
  Liste,
  Note,
  P,
  PageLegale,
  Puce,
  SectionLegale,
  SousSection,
  Tableau,
} from "@/components/PageLegale";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Visacredit XIXA",
  description:
    "Conditions Générales d'Utilisation de la plateforme Visacredit XIXA : accès, rôles, fonctionnalités, paiements, responsabilité et droit applicable.",
};

/** Tableau des entités exploitantes, repris à l'identique dans trois documents. */
const ENTITES: string[][] = [
  ["Bénin", "Visacredit Tech Bénin SARL", "RCCM Cotonou RB/COT/25 B 40300"],
  ["Côte d'Ivoire", "Visacredit Tech Côte d'Ivoire SARL", "Immatriculation en cours"],
  [
    "Tout autre pays sans entité locale établie",
    "Visacredit Tech Bénin SARL (par défaut)",
    "RCCM Cotonou RB/COT/25 B 40300",
  ],
];

/**
 * Conditions Générales d'Utilisation.
 *
 * Reproduction du document officiel du 31 août 2026 fourni par Visacredit.
 */
export default function CGU() {
  return (
    <PageLegale titre="Conditions Générales d'Utilisation" miseAJour="31 août 2026">
      <SectionLegale titre="1. Objet">
        <P texte="Les présentes Conditions Générales d'Utilisation (« CGU ») ont pour objet de définir les modalités et conditions dans lesquelles l'entité du groupe Visacredit légalement établie dans le pays d'enregistrement de l'Utilisateur (ci-après l'« Entité Exploitante », « Visacredit », « nous »), éditrice et exploitante de la plateforme de gestion commerciale « Visacredit XIXA » (« XIXA », « la Plateforme ») pour ce pays, met celle-ci à disposition des grossistes et détaillants (« l'Utilisateur », « vous ») et régit l'utilisation de ses fonctionnalités." />
        <P texte="L'Entité Exploitante applicable à l'Utilisateur est déterminée selon le tableau suivant :" />
        <Tableau entetes={["Pays / zone", "Entité applicable", "Immatriculation"]} lignes={ENTITES} />
        <P texte="Cette liste est mise à jour au fur et à mesure de la création de nouvelles entités locales. Toutes les Entités Exploitantes sont des entités de Visacredit Tech Inc. (Delaware, États-Unis). Visacredit Tech Inc. n'exerce aucun rôle opérationnel dans l'exploitation de la Plateforme et n'est pas partie aux présentes CGU." />
        <P texte="XIXA a pour vocation de réunir, en un seul endroit, la gestion du stock, des ventes, des créances et des commandes interentreprises entre grossistes et détaillants. Toute création de compte sur la Plateforme emporte acceptation pleine et entière des présentes CGU." />
      </SectionLegale>

      <SectionLegale titre="2. Définitions">
        <Liste>
          <Puce texte="« Grossiste » : Utilisateur professionnel qui propose ses produits à la vente à des détaillants via la Plateforme, reçoit et valide leurs commandes." />
          <Puce texte="« Détaillant » : Utilisateur professionnel qui recherche des produits auprès des grossistes référencés sur la Plateforme, passe commande et revend à ses propres clients." />
          <Puce texte="« Commande » : commande interentreprises passée par un Détaillant auprès d'un Grossiste via la Plateforme, identifiée par un numéro au format « CMD- »." />
          <Puce texte="« Facture » : document généré lors d'une vente enregistrée sur la Plateforme, identifié par un numéro au format « BOU- »." />
          <Puce texte="« Créance » : somme due à l'Utilisateur par l'un de ses propres clients, à la suite d'une vente à crédit enregistrée sur la Plateforme." />
          <Puce texte="« Crédit fournisseur » : somme due par un Détaillant à un Grossiste à la suite d'une Commande livrée et non intégralement réglée." />
          <Puce texte="« Position de caisse » : solde calculé automatiquement par la Plateforme à partir des ventes encaissées, diminué des dépenses et retraits, et augmenté des versements enregistrés." />
          <Puce texte="« IFU » : Identifiant Fiscal Unique délivré par l'administration fiscale béninoise." />
          <Puce texte="« Agrégateur de paiement » : prestataire de paiement tiers (notamment FedaPay) permettant l'encaissement par mobile money ou par carte sur la Plateforme." />
        </Liste>
      </SectionLegale>

      <SectionLegale titre="3. Accès à la Plateforme et création de compte">
        <SousSection titre="3.1 Conditions d'éligibilité">
          <P texte="La Plateforme XIXA est réservée aux professionnels et commerçants majeurs, agissant dans le cadre de leur activité commerciale de vente en gros ou au détail. En créant un compte, l'Utilisateur déclare disposer de la capacité juridique nécessaire à l'exercice de son activité commerciale." />
        </SousSection>

        <SousSection titre="3.2 Choix du rôle">
          <P texte="Lors de son inscription, l'Utilisateur choisit son rôle sur la Plateforme : Grossiste ou Détaillant. Ce choix détermine les fonctionnalités auxquelles il a accès : le Grossiste reçoit et valide les commandes des Détaillants, tandis que le Détaillant recherche des produits, compare les Grossistes référencés et passe commande. Chaque Utilisateur, quel que soit son rôle, peut par ailleurs enregistrer ses propres ventes à ses clients finaux." />
        </SousSection>

        <SousSection titre="3.3 Renseignement de l'IFU (Identifiant fiscal)">
          <P texte="L'identifiant fiscal est demandé lors de l'inscription mais n'est pas exigé pour la création du compte : une boutique déjà en activité peut ouvrir son compte le jour même et renseigner son IFU ultérieurement." />
        </SousSection>

        <SousSection titre="3.4 Identifiants de connexion">
          <P texte="L'accès au compte s'effectue au moyen d'un numéro de téléphone et d'un mot de passe. L'Utilisateur est seul responsable de la confidentialité de ses identifiants et de toute activité réalisée depuis son compte. Il s'engage à informer Visacredit sans délai en cas de perte, de vol ou d'utilisation non autorisée de ses identifiants." />
        </SousSection>
      </SectionLegale>

      <SectionLegale titre="4. Fonctionnalités de la Plateforme">
        <P texte="Selon son rôle, l'Utilisateur a accès à tout ou partie des fonctionnalités suivantes :" />
        <Liste>
          <Puce texte="Stock & produits : gestion du catalogue, des prix d'achat et de vente, et des seuils d'alerte de réapprovisionnement" />
          <Puce texte="Ventes & factures : enregistrement des ventes au comptant ou à crédit, génération de factures numérotées, encaissement en espèces ou en mobile money" />
          <Puce texte="Créances clients : suivi d'un échéancier par client, enregistrement des paiements partiels, signalement des créances en retard" />
          <Puce texte="Commandes B2B : recherche de produits, comparaison des Grossistes, passation, validation, livraison et réception des commandes entre Grossistes et Détaillants" />
          <Puce texte="Crédits fournisseurs : suivi des sommes dues aux Grossistes et de leur règlement, en espèces, en mobile money ou sur le solde" />
          <Puce texte="Notations & confiance : possibilité, pour chaque partie à une Commande, de noter l'autre partie après exécution de celle-ci" />
        </Liste>
      </SectionLegale>

      <SectionLegale titre="5. Processus de commande entre Grossiste et Détaillant">
        <Liste>
          <Puce texte="Le Détaillant recherche un produit parmi les catalogues des Grossistes référencés sur la Plateforme, compare les offres, puis passe commande ; un numéro « CMD- » est attribué à la Commande" />
          <Puce texte="Le Grossiste reçoit la Commande, la valide, procède à la livraison et se fait régler comptant, en mobile money, ou accorde un Crédit fournisseur au Détaillant" />
          <Puce texte="Le stock, la Position de caisse, les Créances et les Crédits fournisseurs des deux parties sont mis à jour automatiquement" />
          <Puce texte="Chaque partie note l'autre à réception de la Commande" />
        </Liste>
        <P texte="Visacredit met à disposition l'outil technique permettant cette mise en relation et ce suivi, mais n'est pas partie au contrat de vente conclu entre le Grossiste et le Détaillant. La négociation des prix, des délais de livraison et des conditions de paiement relève de la seule responsabilité des Utilisateurs concernés." />
      </SectionLegale>

      <SectionLegale titre="6. Moyens de paiement">
        <P texte="Les encaissements réalisés sur la Plateforme peuvent s'effectuer selon les modalités suivantes : espèces, mobile money (via l'agrégateur FedaPay), mobile money et carte via agrégateur de paiement, prélèvement sur le solde, ou vente à crédit." />
        <P texte="Les fonds encaissés par mobile money ou par carte sont détenus par l'Agrégateur de paiement partenaire, et non par Visacredit : à aucun moment Visacredit ne conserve les fonds des Utilisateurs. Des frais, pouvant aller de 0 à 1,8 %, peuvent être appliqués sur les transactions par mobile money ; ces frais sont fixés et perçus par l'Agrégateur, et non par Visacredit. Le vendeur et l'acheteur ont la possibilité de se partager les frais." />
        <P texte="La Position de caisse affichée sur la Plateforme est une valeur calculée à titre informatif à partir des mouvements enregistrés par l'Utilisateur (ventes encaissées, dépenses, retraits, versements) ; elle ne constitue pas un solde bancaire ni un dépôt de fonds auprès de Visacredit." />
      </SectionLegale>

      <SectionLegale titre="7. Créances, crédits fournisseurs et recouvrement">
        <P texte="La Plateforme constitue un outil de suivi des Créances et des Crédits fournisseurs entre Utilisateurs. Visacredit n'intervient pas dans le recouvrement de ces sommes et ne garantit ni le paiement des Créances d'un Utilisateur envers ses clients, ni le règlement des Crédits fournisseurs d'un Détaillant envers un Grossiste. Chaque Utilisateur demeure seul responsable de la gestion commerciale de ses relations clients et fournisseurs." />
      </SectionLegale>

      <SectionLegale titre="8. Notations et confiance entre Utilisateurs">
        <P texte="Le système de notation permet à chaque partie à une Commande d'évaluer, de bonne foi et sur la base de son expérience réelle, l'autre partie. L'Utilisateur s'engage à ne publier que des notations sincères et à ne pas détourner cette fonctionnalité à des fins de dénigrement ou de concurrence déloyale. Visacredit se réserve le droit de retirer toute notation manifestement abusive, diffamatoire ou sans rapport avec une Commande réellement exécutée." />
      </SectionLegale>

      <SectionLegale titre="9. Application mobile et fonctionnement hors ligne">
        <P texte="L'application mobile XIXA fonctionne hors ligne : les données de l'Utilisateur (stock, ventes, créances, commandes) sont conservées, chiffrées, directement sur son terminal, et synchronisées avec les serveurs de Visacredit dès que la connexion est rétablie. L'Utilisateur est responsable de la sécurité physique de son terminal et de la mise à jour de l'application afin de bénéficier des derniers correctifs de sécurité. Visacredit ne saurait être tenu responsable de la perte de données résultant de la perte, du vol, de la réinitialisation ou du dysfonctionnement du terminal de l'Utilisateur." />
      </SectionLegale>

      <SectionLegale titre="10. Obligations de l'Utilisateur">
        <Liste>
          <Puce texte="Fournir des informations exactes, complètes et à jour lors de son inscription et de l'utilisation de la Plateforme" />
          <Puce texte="Utiliser la Plateforme conformément à sa destination, dans le cadre d'une activité commerciale licite" />
          <Puce texte="Ne pas utiliser la Plateforme à des fins frauduleuses, notamment pour enregistrer des transactions fictives ou fausser le système de notation" />
          <Puce texte="Respecter les droits des autres Utilisateurs et des tiers" />
          <Puce texte="Préserver la confidentialité de ses identifiants de connexion" />
          <Puce texte="Se conformer à ses propres obligations légales, fiscales et réglementaires liées à son activité commerciale" />
        </Liste>
      </SectionLegale>

      <SectionLegale titre="11. Propriété intellectuelle">
        <P texte="La Plateforme, sa structure, ses fonctionnalités, ses contenus, ses marques et logos demeurent la propriété exclusive de Visacredit. L'Utilisateur bénéficie d'un droit d'usage personnel, non exclusif et non transférable de la Plateforme, pour la durée de son compte et dans le strict cadre des présentes CGU. L'Utilisateur conserve la propriété des données commerciales qu'il saisit (catalogue, ventes, créances) ; il concède à Visacredit le droit de les traiter dans la seule mesure nécessaire à la fourniture du service." />
      </SectionLegale>

      <SectionLegale titre="12. Responsabilité et garanties">
        <P texte="Visacredit met en œuvre des moyens raisonnables pour assurer la disponibilité, la sécurité et le bon fonctionnement de la Plateforme, sans toutefois garantir une disponibilité continue ou une absence totale d'erreurs. Visacredit ne saurait être tenu responsable des dommages résultant : d'une utilisation non conforme de la Plateforme par l'Utilisateur ; d'un différend commercial entre un Grossiste et un Détaillant ; d'un défaut de paiement d'une Créance ou d'un Crédit fournisseur entre Utilisateurs ; d'une interruption ou d'une indisponibilité de l'Agrégateur de paiement ; ou d'un cas de force majeure." />
        <P texte="La responsabilité de Visacredit, si elle venait à être retenue, est limitée aux dommages directs et prévisibles résultant d'un manquement avéré à ses obligations au titre des présentes CGU." />
      </SectionLegale>

      <SectionLegale titre="13. Protection des données personnelles">
        <P texte="Le traitement des données à caractère personnel des Utilisateurs est décrit dans la Politique de Confidentialité de XIXA, qui fait partie intégrante des présentes CGU. L'utilisation de cookies sur le site web de XIXA est décrite dans la Politique de Cookies de XIXA." />
      </SectionLegale>

      <SectionLegale titre="14. Durée, suspension et résiliation">
        <P texte="Les présentes CGU s'appliquent pendant toute la durée d'utilisation de la Plateforme par l'Utilisateur. Visacredit peut suspendre ou résilier, à tout moment et sans préavis, l'accès d'un Utilisateur en cas de manquement grave aux présentes CGU, notamment en cas de fraude avérée, d'usage frauduleux du système de notation, ou de non-respect des obligations légales applicables. L'Utilisateur peut à tout moment demander la clôture de son compte en contactant le service client de Visacredit." />
      </SectionLegale>

      <SectionLegale titre="15. Modification des CGU">
        <P texte="Visacredit se réserve le droit de modifier les présentes CGU à tout moment, notamment pour tenir compte de l'évolution de la Plateforme, de la réglementation applicable ou de ses conditions d'exploitation. Toute modification substantielle sera portée à la connaissance des Utilisateurs par tout moyen approprié (notification dans l'application, courriel ou affichage sur le site). La poursuite de l'utilisation de la Plateforme après entrée en vigueur des modifications vaut acceptation de celles-ci." />
      </SectionLegale>

      <SectionLegale titre="16. Droit applicable et juridiction compétente">
        <P texte="Les présentes CGU sont soumises au droit du pays de l'Entité Exploitante applicable à l'Utilisateur, tel qu'identifié dans le tableau figurant à l'article 1 (à titre d'exemple, le droit de la République du Bénin pour les Utilisateurs relevant de Visacredit Tech Bénin SARL). Tout différend relatif à la validité, à l'interprétation ou à l'exécution des présentes CGU qui n'aurait pu être résolu à l'amiable sera soumis aux tribunaux compétents du siège de l'Entité Exploitante concernée, sous réserve des dispositions d'ordre public éventuellement applicables à l'Utilisateur en fonction de sa qualité ou de sa localisation." />
      </SectionLegale>

      <SectionLegale titre="17. Contact">
        <P texte="Pour toute question relative aux présentes Conditions Générales d'Utilisation, l'Utilisateur peut contacter Visacredit à l'adresse : contact@visacredit.info, ou par téléphone/whatsapp au +229 01 40 50 22 50." />
        <Note texte="Toutes les Entités Exploitantes sont des entités de Visacredit Tech Inc. (Delaware, États-Unis), qui n'exerce aucun rôle opérationnel dans l'exploitation de la Plateforme." />
      </SectionLegale>
    </PageLegale>
  );
}
