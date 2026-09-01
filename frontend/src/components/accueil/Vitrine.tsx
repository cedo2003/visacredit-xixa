"use client";

import { useT } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { ApercuMobile } from "./ApercuMobile";
import { EnteteAccueil } from "./EnteteAccueil";
import { MarqueXixa } from "./MarqueXixa";
import { Reveal } from "./Reveal";


/**
 * Vitrine publique — première page du site.
 *
 * L'ancienne racine se contentait d'aiguiller vers /connexion : un visiteur sans
 * compte tombait sur un formulaire sans savoir ce qu'il ouvrait. La présentation
 * prend cette place, et la connexion devient une destination parmi d'autres
 * depuis cette page.
 *
 * Rendu côté serveur : rien ici ne dépend de la session, sauf le bouton de la
 * barre de navigation, isolé dans `EnteteAccueil`.
 */
export function Vitrine() {
  return (
    <div className="page-accueil min-h-screen bg-vitrine text-titre">
      <EnteteAccueil />

      <main>
        <Hero />
        <BandeauPaiements />
        <Fonctionnement />
        <Fonctions />
        <Roles />
        <Confiance />
        <Metiers />
        <Chiffres />
        <Telecharger />
        <Questions />
        <AppelFinal />
      </main>

      <PiedDePage />
    </div>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────────── */

function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden px-5 pb-14 pt-14 sm:pt-20">
      {/* Halos de marque, purement décoratifs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-40 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(240,142,0,0.18),transparent_62%)]" />
        <div className="absolute -right-28 top-40 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(20,55,71,0.14),transparent_62%)]" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
        <Reveal className="min-w-0">
          <Eyebrow>{t("Plateforme de gestion — grossistes & détaillants")}</Eyebrow>

          {/*
            Le titre est coupé en deux : la seconde moitié porte l'orange. Deux
            entrées de dictionnaire donc, pour que l'anglais puisse rompre la
            phrase ailleurs si sa syntaxe l'exige.
          */}
          <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-titre sm:text-5xl lg:text-6xl">
            {t("Votre boutique,")}
            <br />
            <span className="text-accent">{t("tenue au clair.")}</span>
          </h1>

          <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-doux">
            {t("Visacredit XIXA réunit votre stock, vos ventes, vos créances et vos commandes entre grossistes et détaillants. Un seul endroit pour savoir ce que vous avez, ce qu'on vous doit et ce que vous devez.")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 rounded-full bg-marque-600 px-7 py-3.5 font-bold text-white shadow-xl shadow-marque-600/30 transition hover:-translate-y-0.5 hover:bg-marque-700"
            >
              {t("Créer un compte")}
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/connexion"
              className="inline-flex items-center rounded-full border-2 border-bordure px-7 py-3.5 font-bold text-titre transition hover:-translate-y-0.5 hover:border-marque-400 hover:text-accent"
            >
              {t("Se connecter")}
            </Link>
            <a
              href="#telecharger"
              className="inline-flex items-center gap-2 px-2 py-3.5 font-bold text-titre underline-offset-4 transition hover:text-accent hover:underline"
            >
              <IconeTelechargement />
              {t("Télécharger l'application")}
            </a>
          </div>

          <p className="mt-7 flex items-center gap-2.5 text-sm text-faible">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            {t("L'application mobile fonctionne hors ligne — vos données vivent sur votre téléphone.")}
          </p>
        </Reveal>

        <Reveal delai={120} className="flex min-w-0 justify-center">
          <div className="relative">
            {/* Étiquettes flottantes : deux moments réels de la plateforme */}
            <div className="absolute -left-10 -top-8 z-10 hidden items-center gap-2.5 rounded-2xl border border-marque-100 bg-surface px-3.5 py-2.5 shadow-xl sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-marque-50 text-sm">
                🚚
              </span>
              <span className="text-xs">
                <span className="block text-faible">{t("Commande CMD-2026-0004")}</span>
                <span className="font-extrabold text-accent">
                  {t("Validée par le grossiste")}
                </span>
              </span>
            </div>

            <div className="absolute -right-6 -bottom-8 z-10 hidden items-center gap-2.5 rounded-2xl border border-emerald-100 bg-surface px-3.5 py-2.5 shadow-xl sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-sm">
                ✓
              </span>
              <span className="text-xs">
                <span className="block text-faible">{t("Créance encaissée")}</span>
                <span className="font-extrabold text-emerald-600">{t("+12 500 FCFA")}</span>
              </span>
            </div>

            <ApercuMobile />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Moyens de paiement ───────────────────────────────────────────────────── */

const PAIEMENTS = [
  { couleur: "#059669", libelle: "Espèces" },
  { couleur: "#F08E00", libelle: "Mobile Money · KkiaPay" },
  { couleur: "#143747", libelle: "Mobile Money & carte · Agrégateur" },
  { couleur: "#7C3AED", libelle: "Sur le solde" },
  { couleur: "#EA580C", libelle: "À crédit" },
];

function BandeauPaiements() {
  const t = useT();
  return (
    <section className="border-y border-marque-100 bg-marque-50/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-5">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-faible">
          {t("Encaissez comme vos clients paient")}
        </span>
        {PAIEMENTS.map((moyen) => (
          <span
            key={moyen.libelle}
            className="inline-flex items-center gap-2 text-sm font-bold text-titre"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: moyen.couleur }}
            />
            {t(moyen.libelle)}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ── Comment ça marche ────────────────────────────────────────────────────── */

const ETAPES = [
  {
    icone: "🔍",
    titre: "Le détaillant commande",
    texte:
      "Il cherche un produit parmi les catalogues des grossistes de la plateforme, compare, puis passe commande. Un numéro CMD- lui est attribué.",
  },
  {
    icone: "🚚",
    titre: "Le grossiste valide et livre",
    texte:
      "La commande arrive chez lui. Il la valide, la livre, et se fait payer comptant, en mobile money, ou la laisse en crédit fournisseur.",
  },
  {
    icone: "📊",
    titre: "Tout se met à jour",
    texte:
      "Stock, position de caisse, créances et crédits suivent le mouvement des deux côtés. Chacun note l'autre à la réception.",
  },
];

function Fonctionnement() {
  const t = useT();
  return (
    <Section id="fonctionnement">
      <EnTeteSection
        eyebrow={t("Comment ça marche")}
        titre={t("Du grossiste au détaillant, sans carnet.")}
        texte={t("Les deux comptes sont reliés : ce que l'un commande, l'autre le voit arriver. Plus de cahier à recopier ni d'appel pour savoir où en est la livraison.")}
      />

      <div className="grid gap-5 md:grid-cols-3">
        {ETAPES.map((etape, index) => (
          <Reveal key={etape.titre} delai={index * 90}>
            <div className="h-full rounded-3xl border border-marque-100 bg-surface p-7 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-marque-50 text-xl">
                {etape.icone}
              </span>
              <span className="mt-5 block text-sm font-black tracking-[0.1em] text-accent">
                0{index + 1}
              </span>
              <h3 className="mt-2 text-xl font-bold text-titre">{t(etape.titre)}</h3>
              <p className="mt-2.5 text-[0.95rem] leading-relaxed text-doux">
                {t(etape.texte)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ── Fonctions ────────────────────────────────────────────────────────────── */

const FONCTIONS = [
  {
    icone: "📦",
    titre: "Stock & produits",
    texte:
      "Catalogue, prix d'achat et de vente, seuil d'alerte. Vous savez ce qui manque avant que le client le demande.",
  },
  {
    icone: "🛒",
    titre: "Ventes & factures",
    texte:
      "Vente au comptant ou à crédit, facture numérotée BOU-, encaissement en espèces ou en mobile money avec partage des frais.",
  },
  {
    icone: "💰",
    titre: "Créances clients",
    texte:
      "Un échéancier par client, des paiements partiels, et un badge « En retard » dès le jour d'échéance dépassé.",
  },
  {
    icone: "🚚",
    titre: "Commandes B2B",
    texte:
      "Du détaillant au grossiste : validation, livraison, réception, paiement. Négociation de prix et échéances comprises.",
  },
  {
    icone: "🤝",
    titre: "Crédits fournisseurs",
    texte:
      "Ce que vous devez à vos grossistes, réglé en espèces, en mobile money ou directement sur votre solde.",
  },
  {
    icone: "⭐",
    titre: "Notations & confiance",
    texte:
      "Chaque partie note l'autre après la commande. La réputation d'un fournisseur se construit livraison après livraison.",
  },
];

function Fonctions() {
  const t = useT();
  return (
    <Section id="fonctions" fond>
      <EnTeteSection
        eyebrow={t("Tout au même endroit")}
        titre={t("Les outils d'une boutique qui tourne.")}
        texte={t("Douze écrans, pensés pour le commerce d'ici : le stock, l'argent qui rentre, l'argent qui sort, et ce qui reste à régler.")}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FONCTIONS.map((fonction, index) => (
          <Reveal key={fonction.titre} delai={(index % 3) * 80}>
            <div className="h-full rounded-3xl border border-marque-100 bg-surface p-6 transition hover:-translate-y-1 hover:border-marque-300 hover:shadow-lg">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-marque-50 text-xl">
                {fonction.icone}
              </span>
              <h3 className="mt-4 text-lg font-bold text-titre">{t(fonction.titre)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-doux">{t(fonction.texte)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ── Les deux rôles ───────────────────────────────────────────────────────── */

const ATOUTS_ROLES = [
  "Le grossiste voit arriver les commandes des détaillants et les valide en un geste",
  "Le détaillant cherche un produit, compare les grossistes et commande sans se déplacer",
  "Payé comptant ou laissé en crédit fournisseur : la dette reste chiffrée des deux côtés",
];

function Roles() {
  const t = useT();
  return (
    <section id="roles" className="scroll-mt-24 px-5 py-12">
      <Reveal className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[2rem] bg-linear-to-br from-encre-700 via-encre-600 to-encre-800 p-8 sm:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex max-w-full flex-wrap items-center gap-2.5 text-xs font-black uppercase tracking-[0.16em] text-marque-400">
                <span className="h-0.5 w-6 rounded bg-marque-500" />
                {t("Deux métiers")}
              </span>

              <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
                {t("Grossiste ou détaillant, la même plateforme.")}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-encre-100">
                {t("Vous choisissez votre rôle à l'inscription. L'application s'adapte : le grossiste reçoit et valide, le détaillant cherche et commande. Les deux vendent à leurs propres clients.")}
              </p>

              <ul className="mt-7 space-y-3.5">
                {ATOUTS_ROLES.map((atout) => (
                  <li key={atout} className="flex gap-3 text-encre-50">
                    <span className="mt-0.5 shrink-0 font-black text-marque-400">✓</span>
                    <span className="leading-relaxed">{t(atout)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <CarteRole
                badge="📦 Grossiste"
                nom="Comptoir Sodji"
                lignes={[
                  ["Commandes reçues", "3"],
                  ["Produits en stock", "8"],
                  ["Position de caisse", "173 000 FCFA"],
                ]}
                progression={{ libelle: t("Commandes traitées"), valeur: 66 }}
              />
              <CarteRole
                badge="🏪 Détaillant"
                nom="Boutique Ayaba"
                lignes={[
                  ["Commandes fournisseurs", "4"],
                  ["Crédits fournisseurs", "6"],
                  ["Position de caisse", "25 850 FCFA"],
                ]}
                progression={{ libelle: t("Créances recouvrées"), valeur: 42 }}
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function CarteRole({
  badge,
  nom,
  lignes,
  progression,
}: {
  badge: string;
  nom: string;
  lignes: [string, string][];
  progression: { libelle: string; valeur: number };
}) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-marque-500/20 px-3 py-1 text-xs font-bold text-marque-300">
          {badge}
        </span>
        <span className="text-sm font-bold text-white">{nom}</span>
      </div>

      <dl className="mt-4 space-y-2">
        {lignes.map(([libelle, valeur]) => (
          <div key={libelle} className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-encre-100">{t(libelle)}</dt>
            <dd className="font-extrabold text-white">{t(valeur)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs text-encre-200">
          <span>{t(progression.libelle)}</span>
          <span>{progression.valeur} %</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-marque-500"
            style={{ width: `${progression.valeur}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Confiance ────────────────────────────────────────────────────────────── */

const GARANTIES = [
  {
    icone: "🪪",
    titre: "IFU quand vous l'avez",
    texte:
      "L'Identifiant Fiscal Unique est demandé à l'inscription, mais n'y est pas exigé : une boutique déjà en activité ouvre son compte le jour même et le renseigne ensuite.",
  },
  {
    icone: "🏦",
    titre: "Aucun fonds conservé",
    texte:
      "Les encaissements mobile money sont détenus chez l'agrégateur de paiement. Visacredit XIXA ne garde jamais votre argent.",
  },
  {
    icone: "🔐",
    titre: "Session signée",
    texte:
      "Connexion par téléphone et mot de passe, jeton signé à chaque appel, mot de passe chiffré en base.",
  },
  {
    icone: "📵",
    titre: "Mobile sans réseau",
    texte:
      "L'application téléphone garde vos données dans une base sur l'appareil. Elle fonctionne même quand la connexion lâche.",
  },
];

function Confiance() {
  const t = useT();
  return (
    <Section id="confiance">
      <EnTeteSection
        eyebrow={t("Confiance & Confidentialité")}
        titre={t("Ce qu'il faut savoir avant d'ouvrir un compte.")}
        texte={t("Le solde affiché est une position de caisse calculée : les ventes encaissées, moins les dépenses et les retraits, plus les versements.")}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {GARANTIES.map((garantie, index) => (
          <Reveal key={garantie.titre} delai={index * 70}>
            <div className="h-full rounded-3xl border border-marque-100 bg-surface p-6">
              <span className="text-2xl">{garantie.icone}</span>
              <h3 className="mt-3 text-base font-bold text-titre">{t(garantie.titre)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-doux">{t(garantie.texte)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ── Pour qui ? ───────────────────────────────────────────────────────────── */

const METIERS = [
  {
    initiales: "CS",
    fond: "#FFD599",
    role: "Le grossiste",
    contexte: "Vend en gros aux détaillants",
    citation:
      "Les commandes des détaillants arrivent directement dans l'application. Je valide, je livre, et mon stock se met à jour tout seul.",
  },
  {
    initiales: "BA",
    fond: "#B9CBD6",
    role: "La détaillante",
    contexte: "Achète en gros, revend au détail",
    citation:
      "Je cherche le produit, je compare les grossistes, je commande. Et je sais à tout moment ce qu'il me reste à leur payer.",
  },
  {
    initiales: "GC",
    fond: "#A7F3D0",
    role: "La gérante de caisse",
    contexte: "Ventes à crédit et recouvrement",
    citation:
      "Mes clients achètent à crédit. L'échéancier me dit qui doit quoi, depuis quand, et qui est déjà en retard.",
  },
];

function Metiers() {
  const t = useT();
  return (
    <Section id="metiers" fond>
      <EnTeteSection
        eyebrow={t("Pour qui ?")}
        titre={t("Fait pour le commerce de tous les jours.")}
        texte={t("Des exemples d'usage — pas des témoignages réels : la plateforme s'adapte à chaque façon de tenir boutique.")}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {METIERS.map((metier, index) => (
          <Reveal key={metier.role} delai={index * 90}>
            <div className="h-full rounded-3xl border border-marque-100 bg-linear-to-b from-marque-50/70 to-white p-7">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-black text-titre"
                  style={{ backgroundColor: metier.fond }}
                >
                  {metier.initiales}
                </span>
                <span>
                  <span className="block font-bold text-titre">{t(metier.role)}</span>
                  <span className="block text-sm text-faible">{t(metier.contexte)}</span>
                </span>
              </div>
              <p className="mt-5 leading-relaxed text-titre">
                &laquo;&nbsp;{t(metier.citation)}&nbsp;&raquo;
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ── Chiffres ─────────────────────────────────────────────────────────────── */

const CHIFFRES = [
  { valeur: "2", libelle: "rôles : grossiste et détaillant" },
  { valeur: "0 à 1,8 %", libelle: "de frais mobile money" },
  { valeur: "100 %", libelle: "hors ligne sur mobile" },
];

function Chiffres() {
  const t = useT();
  return (
    <section className="px-5 py-12">
      <Reveal className="mx-auto grid max-w-6xl gap-8 text-center sm:grid-cols-3 sm:gap-6">
        {CHIFFRES.map((chiffre) => (
          <div key={chiffre.libelle} className="mx-auto max-w-[16rem]">
            <div className="whitespace-nowrap text-3xl font-black tracking-tight text-accent sm:text-4xl lg:text-5xl">
              {t(chiffre.valeur)}
            </div>
            <div className="mt-1.5 text-sm font-semibold text-balance text-faible">
              {t(chiffre.libelle)}
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/* ── Téléchargement de l'application ──────────────────────────────────────── */

/**
 * Lien de téléchargement du paquet Android.
 *
 * Il n'existe aucune URL de build dans le dépôt : `mobile/eas.json` définit un
 * profil `apk` en distribution interne, dont l'adresse est émise par EAS à
 * chaque build. Elle se pose donc en variable d'environnement plutôt qu'en dur.
 * Tant qu'elle est absente, le bouton annonce l'attente au lieu de mener à une
 * page morte.
 */
const LIEN_APK = process.env.NEXT_PUBLIC_LIEN_APK;

function Telecharger() {
  const t = useT();
  return (
    <Section id="telecharger">
      <Reveal>
        <div className="grid items-center gap-10 rounded-[2rem] border border-marque-100 bg-surface p-8 shadow-sm sm:p-12 lg:grid-cols-[auto_1fr]">
          <div className="flex items-center gap-5 lg:flex-col lg:items-start">
            <Image
              src="/icone-app.png"
              alt=""
              width={112}
              height={112}
              className="h-24 w-24 shrink-0 rounded-[1.4rem] border border-marque-100 shadow-lg sm:h-28 sm:w-28"
            />
            <div>
              <div className="font-bold text-titre">{t("Visacredit XIXA")}</div>
              <div className="text-sm text-faible">{t("Version 1.1.0 · Android")}</div>
            </div>
          </div>

          <div>
            <Eyebrow>{t("Application mobile")}</Eyebrow>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-titre sm:text-4xl">
              {t("Emportez votre boutique dans votre poche.")}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-doux">
              {t("Les mêmes écrans que le web, dans une application autonome : vos ventes, votre stock, vos créances et vos commandes vivent sur le téléphone et continuent de fonctionner quand le réseau lâche.")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              {LIEN_APK ? (
                <a
                  href={LIEN_APK}
                  className="inline-flex items-center gap-2.5 rounded-full bg-marque-600 px-7 py-3.5 font-bold text-white shadow-xl shadow-marque-600/30 transition hover:-translate-y-0.5 hover:bg-marque-700"
                >
                  <IconeTelechargement />
                  {t("Télécharger pour Android")}
                </a>
              ) : (
                <span className="inline-flex cursor-default items-center gap-2.5 rounded-full bg-marque-50 px-7 py-3.5 font-bold text-accent ring-1 ring-marque-200">
                  <IconeTelechargement />
                  {t("Android — lien bientôt disponible")}
                </span>
              )}

              <BoutiqueBientot nom="Google Play" />
              <BoutiqueBientot nom="App Store" />
            </div>

            <p className="mt-6 text-sm text-faible">
              {t("Aucune connexion n'est nécessaire après l'installation : les données sont conservées et chiffrées sur l'appareil.")}
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function IconeTelechargement() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v13m0 0 4.5-4.5M12 16l-4.5-4.5M4 20h16" />
    </svg>
  );
}

/** Boutique d'applications où l'application n'est pas encore publiée. */
function BoutiqueBientot({ nom }: { nom: string }) {
  const t = useT();
  return (
    <span className="inline-flex cursor-default items-center gap-2.5 rounded-full border-2 border-bordure px-6 py-3.5 font-bold text-estompe">
      {nom}
      <span className="rounded-full bg-surface-forte px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-faible">
        {t("Bientôt")}
      </span>
    </span>
  );
}

/* ── Questions fréquentes ─────────────────────────────────────────────────── */

const QUESTIONS = [
  {
    question: "Qui peut ouvrir un compte ?",
    reponse:
      "Toute boutique ou magasin, en gros comme en détail. Vous choisissez votre rôle à l'inscription : fournisseur en gros ou fournisseur en détail. C'est lui qui décide des écrans que vous verrez.",
  },
  {
    question: "L'IFU est-il obligatoire ?",
    reponse:
      "Il est demandé à l'inscription, mais vous pouvez ouvrir votre compte sans l'avoir sous la main. Un bandeau invite alors à le renseigner dans Paramètres — c'est là qu'il devient obligatoire, et le compte n'est en règle qu'une fois rempli.",
  },
  {
    question: "Comment le solde est-il calculé ?",
    reponse:
      "C'est une position de caisse : les ventes encaissées, moins les dépenses et les retraits, plus les versements. Les fonds encaissés en mobile money sont détenus chez l'agrégateur de paiement — la plateforme ne conserve aucun fonds.",
  },
  {
    question: "Puis-je vendre à crédit ?",
    reponse:
      "Oui. Une vente à crédit crée une créance client avec son échéance. Vous suivez les paiements partiels, et un badge « En retard » apparaît dès le jour d'échéance dépassé.",
  },
  {
    question: "Y a-t-il une application mobile ?",
    reponse:
      "Oui, avec les mêmes écrans que le web. Elle est autonome : les données vivent dans une base sur le téléphone et tout fonctionne sans réseau.",
  },
];

function Questions() {
  const t = useT();
  return (
    <Section id="questions">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <Eyebrow>{t("Questions fréquentes")}</Eyebrow>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-titre sm:text-4xl">
            {t("Bon à savoir")}
          </h2>
        </Reveal>
      </div>

      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {QUESTIONS.map((item, index) => (
          <Reveal key={item.question} delai={index * 60}>
            <details className="group overflow-hidden rounded-2xl border border-marque-100 bg-surface">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-4 font-bold text-titre [&::-webkit-details-marker]:hidden">
                {t(item.question)}
                <span className="shrink-0 text-xl font-normal text-accent transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="px-6 pb-5 leading-relaxed text-doux">{t(item.reponse)}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ── Appel final ──────────────────────────────────────────────────────────── */

function AppelFinal() {
  const t = useT();
  return (
    <section className="px-5 py-12">
      <Reveal className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] bg-linear-to-br from-marque-500 via-marque-600 to-marque-800 px-8 py-14 text-center sm:px-12">
          <h2 className="mx-auto max-w-[18ch] text-3xl font-black leading-tight text-white sm:text-5xl">
            {t("Ouvrez votre boutique sur Visacredit XIXA.")}
          </h2>
          <p className="mx-auto mt-5 max-w-[46ch] font-medium text-marque-50">
            {t("Quelques minutes pour créer le compte, et votre stock, vos ventes et vos créances tiennent enfin au même endroit.")}
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3.5">
            <Link
              href="/inscription"
              className="rounded-full bg-encre-700 px-8 py-4 font-bold text-white shadow-xl shadow-encre-900/25 transition hover:-translate-y-0.5 hover:bg-encre-800"
            >
              {t("Créer un compte")}
            </Link>
            <Link
              href="/connexion"
              className="rounded-full border-2 border-white/50 px-8 py-4 font-bold text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
            >
              {t("J'ai déjà un compte")}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ── Pied de page ─────────────────────────────────────────────────────────── */

function PiedDePage() {
  const t = useT();
  return (
    <footer className="mt-12 border-t border-marque-100 px-5 py-14">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-10">
        <div className="max-w-sm">
          <MarqueXixa taille="sm" />
          <p className="mt-4 text-sm leading-relaxed text-faible">
            {t("La plateforme de gestion des boutiques et magasins qui relie grossistes, détaillants et clients. Votre boutique, tenue au clair.")}
          </p>
        </div>

        <div className="flex flex-wrap gap-10 sm:gap-14">
          <ColonnePied
            titre={t("Produit")}
            liens={[
              ["Comment ça marche", "#fonctionnement"],
              ["Fonctionnalités", "#fonctions"],
              ["Grossiste & détaillant", "#roles"],
              ["Confiance & Confidentialité", "#confiance"],
              ["Télécharger l'application", "#telecharger"],
            ]}
          />
          <ColonnePied
            titre={t("Votre compte")}
            liens={[
              ["Se connecter", "/connexion"],
              ["Créer un compte", "/inscription"],
              ["Questions fréquentes", "#questions"],
            ]}
          />
          <ColonnePied
            titre={t("Légal")}
            liens={[
              ["Politique de confidentialité", "/confidentialite"],
              ["Politique de cookies", "/cookies"],
            ]}
          />
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-3 border-t border-marque-100 pt-6 text-sm text-faible sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} {t("Visacredit Tech Inc")}</span>
        <span>{t("Visacredit ne conserve aucun fonds.")}</span>
      </div>
    </footer>
  );
}

function ColonnePied({ titre, liens }: { titre: string; liens: [string, string][] }) {
  const t = useT();
  return (
    <div>
      <h3 className="mb-3.5 text-xs font-bold uppercase tracking-[0.12em] text-estompe">
        {t(titre)}
      </h3>
      {liens.map(([libelle, href]) =>
        href.startsWith("#") ? (
          <a
            key={href}
            href={href}
            className="mb-2.5 block text-sm text-titre transition hover:text-accent"
          >
            {t(libelle)}
          </a>
        ) : (
          <Link
            key={href}
            href={href}
            className="mb-2.5 block text-sm text-titre transition hover:text-accent"
          >
            {t(libelle)}
          </Link>
        ),
      )}
    </div>
  );
}

/* ── Briques partagées ────────────────────────────────────────────────────── */

function Section({
  id,
  fond = false,
  children,
}: {
  id: string;
  fond?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 px-5 py-16 sm:py-20 ${fond ? "bg-surface" : ""}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function EnTeteSection({
  eyebrow,
  titre,
  texte,
}: {
  eyebrow: string;
  titre: string;
  texte: string;
}) {
  return (
    <Reveal className="mb-12 max-w-2xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-titre sm:text-4xl">
        {titre}
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-doux">{texte}</p>
    </Reveal>
  );
}

/**
 * Sur-titre de section.
 *
 * `max-w-full` et `flex-wrap` ne sont pas décoratifs : un `inline-flex` se
 * dimensionne sur son contenu non coupé, et la colonne de grille du hero, dont
 * la largeur minimale vaut son contenu, s'alignait dessus — la page entière
 * débordait horizontalement sous 400 px.
 */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-2.5 text-xs font-black uppercase tracking-[0.16em] text-accent">
      <span className="h-0.5 w-6 rounded bg-marque-500" />
      {children}
    </span>
  );
}
