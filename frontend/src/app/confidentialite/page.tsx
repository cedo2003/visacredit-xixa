import type { Metadata } from "next";

import {
  Liste,
  P,
  PageLegale,
  Puce,
  SectionLegale,
  SousSection,
  Tableau,
} from "@/components/PageLegale";

export const metadata: Metadata = {
  title: "Politique de Confidentialité — Visacredit XIXA",
  description:
    "Comment Visacredit XIXA collecte, utilise, partage et protège les données personnelles des grossistes et détaillants.",
};

const ENTITES: string[][] = [
  ["Bénin", "Visacredit Tech Bénin SARL", "RCCM Cotonou RB/COT/25 B 40300"],
  [
    "Côte d'Ivoire",
    "Visacredit Tech Côte d'Ivoire SARL",
    "Immatriculation en cours — [RCCM à compléter]",
  ],
  [
    "Tout autre pays sans entité locale établie",
    "Visacredit Tech Bénin SARL (par défaut)",
    "RCCM Cotonou RB/COT/25 B 40300",
  ],
];

/**
 * Politique de Confidentialité.
 *
 * Reproduction du document officiel du 31 août 2026 fourni par Visacredit.
 */
export default function Confidentialite() {
  return (
    <PageLegale titre="Politique de Confidentialité" miseAJour="31 août 2026">
      <SectionLegale titre="1. Préambule">
        <P texte="La présente Politique de Confidentialité décrit la manière dont l'entité du groupe Visacredit légalement établie dans le pays d'enregistrement de l'Utilisateur (ci-après l'« Entité Exploitante », « Visacredit », « nous »), éditrice et exploitante de la plateforme Visacredit XIXA (« XIXA », « la Plateforme ») pour ce pays, collecte, utilise, partage et protège les données à caractère personnel des utilisateurs grossistes et détaillants (« vous », « l'Utilisateur »)." />
        <P texte="L'Entité Exploitante applicable est déterminée selon le tableau suivant, également repris dans les Mentions Légales de XIXA :" />
        <Tableau entetes={["Pays / zone", "Entité applicable", "Immatriculation"]} lignes={ENTITES} />
        <P texte="Cette politique s'applique dans le respect de la loi applicable dans le pays de l'Entité Exploitante — notamment la loi béninoise n° 2017-20 portant Code du numérique pour les Utilisateurs relevant de Visacredit Tech Bénin SARL — et, pour les utilisateurs situés dans l'Union européenne, du Règlement général sur la protection des données (RGPD)." />
      </SectionLegale>

      <SectionLegale titre="2. Responsable du traitement">
        <P texte="L'Entité Exploitante applicable à l'Utilisateur, telle qu'identifiée dans le tableau ci-dessus, est seule responsable du traitement de ses données, en sa qualité d'éditrice et d'exploitante opérationnelle de XIXA pour son pays." />
        <P texte="Toutes les Entités Exploitantes sont des entités de Visacredit Tech Inc. (Delaware, États-Unis). Visacredit Tech Inc. n'a aucun rôle opérationnel dans l'exploitation de la Plateforme et ne traite pas, à titre opérationnel, les données des Utilisateurs de XIXA, quel que soit leur pays." />
        <P texte="Pour toute question relative à cette politique ou à l'exercice de vos droits, vous pouvez contacter Visacredit à l'adresse : contact@visacredit.info." />
      </SectionLegale>

      <SectionLegale titre="3. Données que nous collectons">
        <SousSection titre="3.1 Données fournies directement par l'Utilisateur">
          <Liste>
            <Puce texte="Données d'identification : nom, prénom, numéro de téléphone, mot de passe (conservé sous forme chiffrée)" />
            <Puce texte="Données professionnelles : nom de la boutique, rôle choisi (grossiste ou détaillant), Identifiant Fiscal Unique (IFU) ou équivalent national lorsqu'il est renseigné — non obligatoire à l'inscription" />
            <Puce texte="Données commerciales : catalogue de produits, prix d'achat et de vente, seuils d'alerte de stock" />
            <Puce texte="Données de gestion : ventes enregistrées, factures émises, créances clients et échéanciers, commandes B2B passées ou reçues, crédits fournisseurs, notations attribuées à vos partenaires commerciaux" />
          </Liste>
        </SousSection>

        <SousSection titre="3.2 Données collectées automatiquement">
          <Liste>
            <Puce texte="Données de connexion et d'utilisation : jetons de session signés, historique de connexion, journaux techniques" />
            <Puce texte="Données de l'appareil (application mobile) : identifiant technique de l'appareil, version de l'application, données stockées localement de façon chiffrée pour permettre le fonctionnement hors ligne" />
          </Liste>
        </SousSection>

        <SousSection titre="3.3 Données de paiement">
          <P texte="Les encaissements par mobile money (FedaPay) ou par carte via agrégateur sont traités directement par ces prestataires de paiement tiers agréés. Visacredit XIXA ne collecte ni ne conserve les numéros de carte bancaire ni les identifiants mobile money de l'Utilisateur ; nous recevons uniquement la confirmation et le montant de la transaction nécessaires à la mise à jour de la position de caisse et des créances." />
        </SousSection>
      </SectionLegale>

      <SectionLegale titre="4. Finalités du traitement">
        <Liste>
          <Puce texte="Créer, authentifier et gérer votre compte grossiste ou détaillant" />
          <Puce texte="Permettre la mise en relation, la commande, la validation et le suivi des livraisons entre grossistes et détaillants" />
          <Puce texte="Calculer et afficher votre position de caisse, vos créances, vos crédits fournisseurs et vos statistiques de vente" />
          <Puce texte="Assurer le fonctionnement du système de notation et de confiance entre utilisateurs" />
          <Puce texte="Assurer la sécurité de la Plateforme et prévenir la fraude" />
          <Puce texte="Respecter nos obligations légales et réglementaires, notamment en matière de lutte contre le blanchiment de capitaux et le financement du terrorisme, le cas échéant" />
          <Puce texte="Fournir une assistance et un support client" />
          <Puce texte="Améliorer nos services et développer de nouvelles fonctionnalités" />
        </Liste>
      </SectionLegale>

      <SectionLegale titre="5. Base légale des traitements">
        <Liste>
          <Puce texte="L'exécution du contrat qui nous lie à vous (Conditions Générales d'Utilisation), pour la fourniture du service" />
          <Puce texte="Notre intérêt légitime, pour la sécurité de la Plateforme, la prévention de la fraude et l'amélioration de nos services" />
          <Puce texte="Le respect d'une obligation légale, notamment en matière fiscale ou de vigilance commerciale" />
          <Puce texte="Votre consentement, notamment pour certains cookies non essentiels (voir notre Politique de Cookies)" />
        </Liste>
      </SectionLegale>

      <SectionLegale titre="6. Partage des données">
        <P texte="Vos données peuvent être partagées avec :" />
        <Liste>
          <Puce texte="Votre partenaire commercial direct dans le cadre d'une commande B2B (par exemple, le grossiste voit le nom de la boutique du détaillant qui commande, et réciproquement), ainsi que les notations échangées entre vous, dans la mesure nécessaire au fonctionnement de la mise en relation grossiste/détaillant" />
          <Puce texte="Les agrégateurs de paiement (FedaPay ou autres) pour le traitement des encaissements et décaissements" />
          <Puce texte="Nos prestataires techniques (hébergement, maintenance, sécurité), tenus à des obligations de confidentialité" />
          <Puce texte="Les autorités administratives ou judiciaires compétentes, lorsque la loi nous y oblige" />
        </Liste>
        <P texte="Visacredit Tech Inc., société holding du groupe, peut recevoir des données agrégées ou anonymisées à des fins de gouvernance et de consolidation de groupe, mais n'a pas accès, dans le cadre de son rôle de holding, à vos données à caractère personnel identifiables pour un usage opérationnel." />
        <P texte="Visacredit ne vend ni ne loue vos données personnelles à des tiers à des fins commerciales ou publicitaires." />
      </SectionLegale>

      <SectionLegale titre="7. Transferts internationaux de données">
        <P texte="Vos données sont traitées et hébergées dans le cadre de l'exploitation de la Plateforme par l'Entité Exploitante applicable à votre pays. Dans la mesure où le groupe Visacredit dispose d'une société holding aux États-Unis (Visacredit Tech Inc.) et de plusieurs Entités Exploitantes réparties dans différents pays, un transfert ponctuel de données agrégées ou anonymisées à des fins de gouvernance de groupe est possible ; il est, le cas échéant, encadré par des garanties appropriées (clauses contractuelles types ou mécanismes équivalents) destinées à assurer un niveau de protection adéquat de vos données." />
      </SectionLegale>

      <SectionLegale titre="8. Durée de conservation">
        <P texte="Vos données sont conservées pendant toute la durée de votre compte actif sur la Plateforme. À la clôture de votre compte, vos données sont conservées pendant une durée supplémentaire nécessaire au respect des obligations légales, comptables et fiscales applicables dans le pays de l'Entité Exploitante (notamment en matière de lutte contre le blanchiment de capitaux le cas échéant), puis archivées ou supprimées." />
      </SectionLegale>

      <SectionLegale titre="9. Sécurité des données">
        <Liste>
          <Puce texte="Authentification par numéro de téléphone et mot de passe chiffré en base de données" />
          <Puce texte="Jeton de session signé à chaque appel à nos serveurs" />
          <Puce texte="Chiffrement des données stockées localement sur l'appareil mobile pour le fonctionnement hors ligne" />
          <Puce texte="Aucune conservation, par Visacredit, des fonds ou des moyens de paiement des utilisateurs — ceux-ci sont détenus exclusivement par l'agrégateur de paiement" />
        </Liste>
      </SectionLegale>

      <SectionLegale titre="10. Vos droits">
        <P texte="Conformément à la réglementation applicable dans le pays de l'Entité Exploitante, vous disposez des droits suivants sur vos données à caractère personnel :" />
        <Liste>
          <Puce texte="Droit d'accès à vos données" />
          <Puce texte="Droit de rectification des données inexactes ou incomplètes" />
          <Puce texte="Droit à l'effacement de vos données, dans les limites de nos obligations légales de conservation" />
          <Puce texte="Droit d'opposition et de limitation du traitement" />
          <Puce texte="Droit à la portabilité de vos données" />
          <Puce texte="Droit de retirer votre consentement à tout moment, lorsque le traitement repose sur celui-ci" />
        </Liste>
        <P texte="Pour exercer ces droits, contactez-nous à l'adresse visa.credit.africa@gmail.com. Vous disposez également du droit d'introduire une réclamation auprès de l'autorité de protection des données du pays de l'Entité Exploitante applicable (par exemple, l'Autorité de Protection des Données Personnelles — APDP — du Bénin pour les Utilisateurs relevant de Visacredit Tech Bénin SARL) ou, le cas échéant, de l'autorité de contrôle compétente de votre pays de résidence." />
      </SectionLegale>

      <SectionLegale titre="11. Cookies et traceurs">
        <P texte="L'utilisation de cookies et technologies similaires sur le site web de XIXA fait l'objet d'une Politique de Cookies distincte, disponible séparément." />
      </SectionLegale>

      <SectionLegale titre="12. Utilisateurs mineurs">
        <P texte="La Plateforme XIXA est réservée aux professionnels et commerçants majeurs, agissant dans le cadre de leur activité commerciale. Elle n'est pas destinée aux mineurs." />
      </SectionLegale>

      <SectionLegale titre="13. Modification de la présente politique">
        <P texte="Visacredit peut être amené à modifier la présente Politique de Confidentialité, notamment pour se conformer à toute évolution légale, réglementaire, technique ou fonctionnelle de la Plateforme, ou pour mettre à jour la liste des Entités Exploitantes du groupe. La version en vigueur est celle publiée sur le site et dans l'application XIXA, avec mention de sa date de dernière mise à jour." />
      </SectionLegale>

      <SectionLegale titre="14. Contact">
        <P texte="Pour toute question relative à la présente Politique de Confidentialité ou à la protection de vos données personnelles, vous pouvez nous contacter à l'adresse : contact@visacredit.info." />
      </SectionLegale>
    </PageLegale>
  );
}
