import type { Metadata } from "next";

import { Liste, P, PageLegale, Puce, SectionLegale } from "@/components/PageLegale";

export const metadata: Metadata = {
  title: "Politique de cookies — Visacredit XIXA",
  description:
    "Visacredit XIXA ne dépose aucun cookie. Le site utilise le stockage local du navigateur pour la session, le thème et la langue.",
};

/**
 * Politique de cookies.
 *
 * Le site n'en pose aucun : la session tient dans un jeton rangé en
 * `localStorage`, et les deux préférences d'affichage aussi. La page le dit
 * plutôt que de recopier un texte générique sur des cookies inexistants — et
 * c'est aussi ce qui justifie l'absence de bandeau de consentement.
 */
export default function Cookies() {
  return (
    <PageLegale titre="Politique de cookies" miseAJour="1er septembre 2026">
      <SectionLegale titre="Nous ne déposons aucun cookie">
        <P texte="Visacredit XIXA ne pose aucun cookie sur votre appareil : ni cookie publicitaire, ni cookie de mesure d'audience, ni cookie de session. Aucun traceur tiers n'est chargé. C'est la raison pour laquelle vous ne voyez pas de bandeau de consentement : il n'y a rien à consentir." />
      </SectionLegale>

      <SectionLegale titre="Ce que nous rangeons dans votre navigateur">
        <P texte="Le site utilise le stockage local (localStorage), qui reste sur votre appareil et n'est jamais envoyé automatiquement à nos serveurs — contrairement à un cookie, joint à chaque requête. Trois entrées seulement :" />
        <Liste>
          <Puce texte="visacredit_xixa_token — le jeton qui vous garde connecté. Effacé à la déconnexion et lorsqu'il expire." />
          <Puce texte="xixa_theme — votre choix d'apparence : système, clair ou sombre." />
          <Puce texte="xixa_langue — votre choix de langue : français ou anglais." />
        </Liste>
        <P texte="Les deux derniers sont propres à l'appareil, non au compte : votre thème sur l'ordinateur du magasin ne suit pas votre téléphone." />
      </SectionLegale>

      <SectionLegale titre="À quoi elles servent">
        <P texte="Ces trois entrées sont strictement nécessaires au fonctionnement du service. Sans le jeton, il faudrait ressaisir son mot de passe à chaque page. Sans les deux préférences, le site reviendrait à ses réglages par défaut à chaque visite, avec un changement d'apparence visible au chargement." />
      </SectionLegale>

      <SectionLegale titre="Les supprimer">
        <P texte="Vous pouvez les effacer à tout moment en vidant les données de site de votre navigateur, ou plus simplement en vous déconnectant pour le jeton de session. Les effacer vous déconnecte et remet l'apparence et la langue par défaut ; aucune donnée de votre boutique n'est perdue, elle vit sur nos serveurs." />
      </SectionLegale>

      <SectionLegale titre="L'application mobile">
        <P texte="L'application Android fonctionne hors ligne, avec sa propre base de données sur le téléphone. Elle n'utilise ni cookie ni traceur." />
      </SectionLegale>

      <SectionLegale titre="Si cela change">
        <P texte="Si nous devions un jour déposer un cookie — pour une mesure d'audience, par exemple — cette page serait mise à jour et votre consentement recueilli au préalable." />
      </SectionLegale>
    </PageLegale>
  );
}
