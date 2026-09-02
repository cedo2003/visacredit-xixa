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
  title: "Mentions Légales — Visacredit XIXA",
  description:
    "Éditeur, exploitant, hébergement, propriété intellectuelle et contacts de la plateforme Visacredit XIXA.",
};

const ENTITES: string[][] = [
  ["Bénin", "Visacredit Tech Bénin SARL", "RCCM Cotonou RB/COT/25 B 40300"],
  ["Côte d'Ivoire", "Visacredit Tech Côte d'Ivoire", "Immatriculation en cours"],
  [
    "Tout autre pays sans entité locale établie",
    "Visacredit Tech Bénin SARL (par défaut)",
    "RCCM Cotonou RB/COT/25 B 40300",
  ],
];

/**
 * Mentions Légales.
 *
 * Reproduction du document officiel du 31 août 2026 fourni par Visacredit.
 */
export default function MentionsLegales() {
  return (
    <PageLegale titre="Mentions Légales" miseAJour="31 août 2026">
      <SectionLegale titre="1. Éditeur et exploitant de la plateforme">
        <P texte="La plateforme « Visacredit XIXA » (ci-après « XIXA », « la Plateforme ») est éditée par le groupe Visacredit. Elle est exploitée, à l'égard de chaque Utilisateur, par l'entité du groupe Visacredit légalement établie dans le pays d'enregistrement de l'Utilisateur (ci-après l'« Entité Exploitante »), conformément au tableau ci-dessous :" />
        <Tableau entetes={["Pays / zone", "Entité applicable", "Immatriculation"]} lignes={ENTITES} />
        <P texte="Lorsqu'aucune entité du groupe n'est établie dans le pays d'enregistrement de l'Utilisateur, Visacredit Tech Bénin SARL agit en qualité d'Entité Exploitante par défaut. Cette liste est mise à jour au fur et à mesure de la création de nouvelles entités locales du groupe, sans que cela nécessite une modification des présentes mentions légales autre que la mise à jour du tableau ci-dessus." />
        <P texte="Sauf mention contraire, toute référence à « Visacredit », « nous », « notre », « nos » dans les présentes mentions légales et dans les documents associés (Conditions Générales d'Utilisation, Politique de Confidentialité, Politique de Cookies) désigne l'Entité Exploitante applicable à l'Utilisateur concerné, en sa qualité d'éditeur et d'exploitant opérationnel de la Plateforme XIXA pour son pays." />

        <SousSection titre="Visacredit Tech Bénin SARL">
          <Liste>
            <Puce texte="Société à responsabilité limitée (SARL) de droit béninois, au capital social de 5 000 000 FCFA" />
            <Puce texte="Immatriculée au Registre du Commerce et du Crédit Mobilier (RCCM) de Cotonou sous le numéro RB/COT/25 B 40300" />
            <Puce texte="Siège social : Ilot 211, Quartier Fifatin, Parcelle K, 2ème étage, Cotonou, République du Bénin" />
            <Puce texte="Téléphone / Whatsapp : +229 40 50 22 50" />
            <Puce texte="Courriel : contact@visacredit.info" />
            <Puce texte="Représentée par son gérant, M. Justin Hadegbe" />
          </Liste>
        </SousSection>

        <SousSection titre="Visacredit Tech Côte d'Ivoire">
          <Liste>
            <Puce texte="Entité en cours d'immatriculation en République de Côte d'Ivoire" />
            <Puce texte="Siège social :" />
            <Puce texte="Immatriculation RCCM :" />
          </Liste>
          <Note texte="Tant que Visacredit Tech Côte d'Ivoire n'est pas formellement immatriculée, Visacredit Tech Bénin SARL demeure l'Entité Exploitante par défaut pour les Utilisateurs ivoiriens, conformément au tableau ci-dessus." />
        </SousSection>

        <SousSection titre="Société holding du groupe">
          <P texte="Les entités opérationnelles ci-dessus sont des filiales du groupe Visacredit, dont la société holding est :" />
          <Liste>
            <Puce texte="Visacredit Tech Inc., société de droit américain constituée dans l'État du Delaware (États-Unis d'Amérique)" />
            <Puce texte="Numéro d'immatriculation : EIN (IRS) : 32-0842131 — File Number : 10277308" />
          </Liste>
          <P texte="Visacredit Tech Inc. n'exerce aucun rôle opérationnel dans l'exploitation de la Plateforme XIXA, quel que soit le pays de l'Utilisateur. Elle n'intervient pas dans la fourniture du service, ne gère pas la relation client, et ne traite pas les données des Utilisateurs à titre opérationnel. Ces activités relèvent exclusivement de l'Entité Exploitante applicable." />
        </SousSection>
      </SectionLegale>

      <SectionLegale titre="2. Directeur de la publication">
        <P texte="Le directeur de la publication de la Plateforme XIXA est M. Justin Hadegbe, en sa qualité de gérant de Visacredit Tech Bénin SARL." />
      </SectionLegale>

      <SectionLegale titre="3. Hébergement">
        <P texte="Le site internet et les infrastructures serveur de la Plateforme XIXA sont hébergés par :" />
        <Liste>
          <Puce texte="LWS France" />
          <Puce texte="Adresse : 10 rue de Penthièvre, 75008, Paris, France" />
          <Puce texte="Contact : +33 01 77 62 30 03" />
        </Liste>
        <P texte="L'application mobile XIXA fonctionne en mode hors ligne : les données de l'Utilisateur sont conservées, chiffrées, directement sur son terminal, et ne transitent vers les serveurs de Visacredit que lors des synchronisations." />
      </SectionLegale>

      <SectionLegale titre="4. Activité de la Plateforme">
        <P texte="Visacredit XIXA est une plateforme de gestion commerciale à destination des grossistes et détaillants, permettant notamment la gestion des stocks, des ventes, des factures, des créances clients, des commandes interentreprises (B2B) et des crédits fournisseurs. XIXA n'est ni un établissement de paiement, ni un établissement de crédit, ni un teneur de compte : les encaissements par mobile money ou par carte sont opérés et détenus par des agrégateurs de paiement tiers agréés (notamment FedaPay), et non par Visacredit." />
      </SectionLegale>

      <SectionLegale titre="5. Propriété intellectuelle">
        <P texte="Les marques, dénominations et signes distinctifs du groupe Visacredit, y compris la dénomination « Visacredit XIXA » et les logos associés, sont détenus par Visacredit Tech Inc., et sont concédés en licence à chaque Entité Exploitante pour les besoins de l'exploitation de la Plateforme dans son pays. Les autres éléments composant la Plateforme XIXA (structure, textes, graphismes, icônes, bases de données, logiciels, code source, application mobile) sont la propriété exclusive de l'Entité Exploitante applicable, ou font l'objet d'une licence d'utilisation, et sont protégés par les législations nationales concernées ainsi que par le droit international de la propriété intellectuelle." />
        <P texte="Toute reproduction, représentation, modification, publication, transmission ou dénaturation, totale ou partielle, de la Plateforme ou de son contenu, par quelque procédé que ce soit, sans autorisation écrite préalable, est strictement interdite et constitutive de contrefaçon. Toute utilisation non autorisée des marques du groupe est susceptible d'engager la responsabilité de son auteur." />
      </SectionLegale>

      <SectionLegale titre="6. Autorité de contrôle des données personnelles">
        <P texte="Pour les traitements de données réalisés dans le cadre de l'exploitation de la Plateforme, l'autorité de contrôle compétente est celle du pays de l'Entité Exploitante applicable à l'Utilisateur (par exemple, l'Autorité de Protection des Données Personnelles — APDP — de la République du Bénin pour les Utilisateurs relevant de Visacredit Tech Bénin SARL). Pour les utilisateurs situés dans l'Union européenne, l'autorité de contrôle compétente est celle de leur État de résidence. Pour plus de détails, se reporter à la Politique de Confidentialité de XIXA." />
      </SectionLegale>

      <SectionLegale titre="7. Signalement d'un contenu ou d'un dysfonctionnement">
        <P texte="Toute personne souhaitant signaler un contenu illicite, un dysfonctionnement technique ou toute autre difficulté rencontrée sur la Plateforme peut contacter Visacredit à l'adresse suivante : contact@visacredit.info." />
      </SectionLegale>

      <SectionLegale titre="8. Médiation et réclamations">
        <P texte="En cas de litige, l'Utilisateur est invité à contacter en premier lieu le service client de Visacredit à l'adresse mentionnée ci-dessus. À défaut de résolution amiable, les dispositions relatives au droit applicable et à la juridiction compétente figurant dans les Conditions Générales d'Utilisation de XIXA trouveront à s'appliquer." />
      </SectionLegale>

      <SectionLegale titre="9. Crédits">
        <P texte="Application mobile Visacredit XIXA — version 1.1.0 (Android). Développement et conception : équipes du groupe Visacredit, exploitation opérationnelle assurée par l'Entité Exploitante applicable à chaque pays." />
      </SectionLegale>
    </PageLegale>
  );
}
