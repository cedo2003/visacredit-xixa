import type { Metadata } from "next";

import { Liste, P, PageLegale, Puce, SectionLegale } from "@/components/PageLegale";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Visacredit XIXA",
  description:
    "Quelles données Visacredit XIXA collecte, pourquoi, combien de temps elles sont conservées et quels sont vos droits.",
};

/**
 * Politique de confidentialité.
 *
 * Le contenu décrit ce que l'application fait réellement — les champs du
 * formulaire d'inscription, les passerelles de paiement effectivement
 * intégrées, le stockage local. Une politique qui décrit autre chose que le
 * code n'engage à rien et induit l'utilisateur en erreur.
 */
export default function Confidentialite() {
  return (
    <PageLegale titre="Politique de confidentialité" miseAJour="1er septembre 2026">
      <SectionLegale titre="En résumé">
        <P texte="Visacredit XIXA collecte les informations nécessaires à la tenue de votre boutique et à l'identification de votre compte. Ces données ne sont ni vendues, ni louées, ni transmises à des tiers à des fins publicitaires. La plateforme ne conserve aucun fonds : les encaissements en mobile money sont détenus par l'agrégateur de paiement." />
      </SectionLegale>

      <SectionLegale titre="Qui traite vos données">
        <P texte="Visacredit Tech Inc, éditeur de la plateforme Visacredit XIXA, est responsable du traitement des données décrites ici." />
      </SectionLegale>

      <SectionLegale titre="Quelles données nous collectons">
        <P texte="Les données que vous saisissez vous-même :" />
        <Liste>
          <Puce texte="Identité et contact : nom, prénom, numéro de téléphone, adresse e-mail." />
          <Puce texte="Informations professionnelles : nom de la boutique, type d'activité (grossiste ou détaillant), numéro IFU, registre du commerce (RCCM), adresse." />
          <Puce texte="Date de naissance, lorsque vous la renseignez." />
          <Puce texte="Données d'exploitation : produits, stocks, ventes, clients, créances, commandes, crédits fournisseurs, dépenses et retraits." />
        </Liste>
        <P texte="L'IFU et le registre du commerce restent facultatifs à l'inscription : une boutique en cours d'enregistrement peut ouvrir son compte et les renseigner ensuite. En leur absence, la fréquence de retrait est limitée à un jour." />
      </SectionLegale>

      <SectionLegale titre="Pourquoi nous les collectons">
        <Liste>
          <Puce texte="Vous authentifier et sécuriser l'accès à votre compte." />
          <Puce texte="Faire fonctionner la gestion de votre boutique : stock, ventes, créances, commandes entre grossistes et détaillants." />
          <Puce texte="Exécuter les paiements que vous initiez, par l'intermédiaire des passerelles." />
          <Puce texte="Respecter nos obligations légales et comptables." />
        </Liste>
      </SectionLegale>

      <SectionLegale titre="Votre mot de passe">
        <P texte="Il n'est jamais stocké en clair. Seule une empreinte chiffrée irréversible est conservée : nous sommes dans l'incapacité technique de retrouver votre mot de passe, et aucun membre de l'équipe ne peut le lire." />
      </SectionLegale>

      <SectionLegale titre="Paiements">
        <P texte="Les paiements en mobile money et par carte passent par KkiaPay et par notre agrégateur de paiement. Vos identifiants de paiement sont saisis chez eux et ne transitent pas par nos serveurs. Nous conservons uniquement la trace de la transaction : montant, moyen, date et statut." />
        <P texte="Visacredit XIXA ne détient à aucun moment vos fonds. Le solde affiché dans l'application est une position de caisse calculée, non un compte que nous tiendrions pour vous." />
      </SectionLegale>

      <SectionLegale titre="Partage avec des tiers">
        <P texte="Vos données ne sont transmises qu'aux prestataires indispensables au service — les passerelles de paiement et l'hébergeur — et uniquement dans la mesure nécessaire. Elles ne sont ni vendues, ni louées, ni utilisées à des fins publicitaires." />
        <P texte="Certaines informations sont visibles de vos partenaires commerciaux sur la plateforme : lorsqu'un détaillant passe commande chez un grossiste, chacun voit le nom de la boutique de l'autre et le détail de la commande. C'est le principe même de la mise en relation." />
      </SectionLegale>

      <SectionLegale titre="Combien de temps nous les conservons">
        <P texte="Vos données d'exploitation sont conservées tant que votre compte est actif. Après fermeture, elles sont supprimées, à l'exception de ce que la loi impose de conserver — notamment les pièces comptables et les traces de transactions." />
      </SectionLegale>

      <SectionLegale titre="Vos droits">
        <P texte="Vous pouvez accéder à vos données, les corriger, en demander la suppression, ou vous opposer à leur traitement. La plupart des informations de votre compte se modifient directement dans Paramètres. Pour les autres demandes, écrivez-nous." />
      </SectionLegale>

      <SectionLegale titre="Cookies et stockage local">
        <P texte="Le site ne dépose aucun cookie. Il utilise le stockage local de votre navigateur pour trois choses seulement, détaillées dans la politique de cookies." />
      </SectionLegale>

      <SectionLegale titre="Nous contacter">
        <P texte="Pour toute question sur cette politique ou sur vos données, contactez Visacredit Tech Inc." />
      </SectionLegale>
    </PageLegale>
  );
}
