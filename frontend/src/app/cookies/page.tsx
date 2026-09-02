import type { Metadata } from "next";

import { Liste, Note, P, PageLegale, Puce, SectionLegale, SousSection } from "@/components/PageLegale";

export const metadata: Metadata = {
  title: "Politique de Cookies — Visacredit XIXA",
  description:
    "Cookies et technologies similaires utilisés sur le site web de Visacredit XIXA : catégories, durées et gestion du consentement.",
};

/**
 * Politique de Cookies.
 *
 * Reproduction du document officiel du 31 août 2026 fourni par Visacredit.
 */
export default function Cookies() {
  return (
    <PageLegale titre="Politique de Cookies" miseAJour="31 août 2026">
      <SectionLegale titre="1. Qu'est-ce qu'un cookie ?">
        <P texte="Un cookie est un petit fichier texte déposé sur votre ordinateur, votre tablette ou votre smartphone lors de la consultation du site web de Visacredit XIXA (« XIXA », « la Plateforme »), édité par le groupe Visacredit et exploité localement par l'entité établie dans votre pays d'enregistrement (l'« Entité Exploitante », « Visacredit », « nous » — voir la liste des Entités Exploitantes dans les Mentions Légales de XIXA). Visacredit Tech Inc. (États-Unis) n'a aucun rôle opérationnel dans l'exploitation de la Plateforme. Un cookie permet, entre autres, de reconnaître votre terminal lors de vos visites ultérieures et de faciliter votre navigation." />
        <Note texte="L'application mobile XIXA fonctionne majoritairement hors ligne et conserve les données sur l'appareil dans une base locale chiffrée plutôt que par des cookies au sens strict du navigateur. Les principes de transparence et de contrôle décrits ci-dessous s'appliquent néanmoins par analogie à ce stockage local." />
      </SectionLegale>

      <SectionLegale titre="2. Les cookies que nous utilisons">
        <SousSection titre="2.1 Cookies strictement nécessaires">
          <P texte="Ces cookies sont indispensables au fonctionnement du site et de votre espace personnel. Ils ne peuvent pas être désactivés." />
          <Liste>
            <Puce texte="Cookies de session et d'authentification, associés à votre jeton de connexion signé" />
            <Puce texte="Cookies de sécurité, destinés à détecter et prévenir les tentatives de fraude ou d'usurpation" />
            <Puce texte="Cookies techniques permettant la mémorisation de votre rôle (grossiste ou détaillant) au cours de votre session" />
          </Liste>
        </SousSection>

        <SousSection titre="2.2 Cookies de préférence">
          <P texte="Ces cookies permettent de mémoriser vos choix afin de personnaliser votre expérience (langue d'affichage, boutique sélectionnée, préférences d'affichage du tableau de bord)." />
        </SousSection>

        <SousSection titre="2.3 Cookies de mesure d'audience">
          <P texte="Le cas échéant, des cookies de mesure d'audience peuvent être utilisés afin de comprendre la manière dont les visiteurs utilisent le site (pages consultées, parcours de navigation) et d'améliorer nos services. Ces cookies sont utilisés sous une forme respectant votre vie privée et, lorsque la réglementation l'exige, ne sont déposés qu'avec votre consentement." />
        </SousSection>

        <SousSection titre="2.4 Absence de cookies publicitaires tiers">
          <P texte="Visacredit XIXA n'utilise pas de cookies à des fins de publicité ciblée ou de revente de données de navigation à des tiers annonceurs." />
        </SousSection>
      </SectionLegale>

      <SectionLegale titre="3. Durée de conservation des cookies">
        <P texte="Les cookies déposés sur votre terminal ont une durée de conservation qui n'excède pas treize (13) mois à compter de leur premier dépôt, sauf pour les cookies strictement nécessaires à la sécurité et à l'authentification, dont la durée est limitée à votre session de connexion." />
      </SectionLegale>

      <SectionLegale titre="4. Gestion de votre consentement">
        <P texte="Lors de votre première visite sur le site web de XIXA, un bandeau d'information vous permet d'accepter ou de refuser le dépôt des cookies non strictement nécessaires. Vous pouvez à tout moment modifier vos préférences via les paramètres de gestion des cookies accessibles depuis le site." />
      </SectionLegale>

      <SectionLegale titre="5. Comment désactiver les cookies depuis votre navigateur">
        <P texte="Vous pouvez également configurer votre navigateur pour refuser tout ou partie des cookies, ou être averti avant leur dépôt. La désactivation des cookies strictement nécessaires peut toutefois empêcher le bon fonctionnement de votre espace personnel sur XIXA." />
        <Liste>
          <Puce texte="Google Chrome : Paramètres > Confidentialité et sécurité > Cookies" />
          <Puce texte="Mozilla Firefox : Paramètres > Vie privée et sécurité > Cookies et données de sites" />
          <Puce texte="Safari : Réglages > Confidentialité > Gérer les données de site" />
          <Puce texte="Microsoft Edge : Paramètres > Cookies et autorisations de site" />
        </Liste>
      </SectionLegale>

      <SectionLegale titre="6. Modification de la présente politique">
        <P texte="Visacredit peut modifier la présente Politique de Cookies à tout moment, notamment pour tenir compte de l'évolution de la réglementation ou des technologies utilisées sur la Plateforme. La version en vigueur est celle publiée sur le site XIXA, avec mention de sa date de dernière mise à jour." />
      </SectionLegale>

      <SectionLegale titre="7. Contact">
        <P texte="Pour toute question relative à l'utilisation des cookies sur la Plateforme XIXA, vous pouvez nous contacter à l'adresse : contact@visacredit.info." />
      </SectionLegale>
    </PageLegale>
  );
}
