"use client";

import { useT } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { LIBELLES_THEME, useTheme, type ModeTheme } from "@/lib/theme";
import { LANGUES, LIBELLES_LANGUE, useLangue, type Langue } from "@/lib/i18n";
import { montant } from "@/lib/format";
import type { User } from "@/lib/types";
import {
  Alerte,
  Bouton,
  Carte,
  Champ,
  ChampSelect,
  Chargement,
  StatCarte,
  TitrePage,
} from "@/components/ui";

interface Reponse {
  profil: User;
  frequence_retrait: string;
  /** Restreint à « 1 jour » tant que le registre du commerce n'est pas déclaré. */
  frequences_autorisees: string[];
  solde: number;
}

/** Port de pages/parametres/{index,update}.php + changement de mot de passe. */
export default function Parametres() {
  const t = useT();
  const { rafraichir } = useAuth();
  const [donnees, setDonnees] = useState<Reponse | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    api
      .get<Reponse>("/api/parametres")
      .then((r) => {
        setDonnees(r);
        setForm({
          prenom: r.profil.prenom,
          nom: r.profil.nom,
          nom_boutique: r.profil.nom_boutique,
          email: r.profil.email ?? "",
          ifu: r.profil.ifu ?? "",
          registre_commerce: r.profil.registre_commerce ?? "",
          date_naissance: r.profil.date_naissance ?? "",
          adresse: r.profil.adresse ?? "",
          frequence_retrait: r.frequence_retrait,
        });
      })
      .catch((e) => setErreur(e.message));
  }, []);

  function maj(champ: string, valeur: string) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setSucces("");
    setEnvoi(true);

    try {
      const profil = await api.put<User>("/api/parametres", form);
      await rafraichir();
      // Renseigner son RCCM débloque les autres fréquences : la liste doit
      // refléter la nouvelle situation sans recharger la page.
      setDonnees((d) =>
        d
          ? {
              ...d,
              profil,
              frequences_autorisees: profil.registre_commerce_manquant
                ? ["1 jour"]
                : ["1 jour", "7 jours", "15 jours", "30 jours"],
            }
          : d,
      );
      setSucces(t("Paramètres enregistrés."));
    } catch (err) {
      setErreur(err instanceof Error ? t(err.message) : t("Enregistrement impossible."));
    } finally {
      setEnvoi(false);
    }
  }

  if (erreur && !donnees) return <Alerte>{erreur}</Alerte>;
  if (!donnees) return <Chargement />;

  return (
    <div>
      <TitrePage titre={t("Paramètres")} sousTitre={t("Votre profil et vos préférences")} />

      {erreur && <Alerte>{erreur}</Alerte>}
      {succes && <Alerte type="succes">{succes}</Alerte>}

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <StatCarte
          valeur={montant(donnees.solde)}
          libelle={t("Solde de caisse")}
          couleur="text-emerald-600"
        />
        <StatCarte
          valeur={donnees.profil.role === "grossiste" ? t("Grossiste") : t("Détaillant")}
          libelle={t("Type de compte")}
          couleur="text-blue-600"
          note={t("Le type de compte ne peut pas être modifié depuis cet écran")}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Carte>
          <h2 className="mb-4 text-lg font-bold">{t("Profil")}</h2>
          <form onSubmit={enregistrer} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Champ
                label={t("Prénom")}
                value={form.prenom ?? ""}
                onChange={(e) => maj("prenom", e.target.value)}
              />
              <Champ
                label={t("Nom")}
                value={form.nom ?? ""}
                onChange={(e) => maj("nom", e.target.value)}
              />
            </div>

            <Champ
              label={t("Nom de la boutique")}
              required
              value={form.nom_boutique ?? ""}
              onChange={(e) => maj("nom_boutique", e.target.value)}
            />

            <Champ
              label={t("Email")}
              type="email"
              value={form.email ?? ""}
              onChange={(e) => maj("email", e.target.value)}
            />

            <Champ
              label={t("IFU (Identifiant Fiscal Unique)")}
              required
              value={form.ifu ?? ""}
              onChange={(e) => maj("ifu", e.target.value)}
              aide={t("Obligatoire. Les espaces et tirets sont ignorés.")}
            />

            <Champ
              label={t("Registre du commerce (RCCM)")}
              value={form.registre_commerce ?? ""}
              onChange={(e) => maj("registre_commerce", e.target.value)}
              aide={t("Facultatif, mais tant qu'il n'est pas renseigné les retraits sont limités à la fréquence « 1 jour ».")}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Champ
                label={t("Date de naissance")}
                type="date"
                value={form.date_naissance ?? ""}
                onChange={(e) => maj("date_naissance", e.target.value)}
              />
              <Champ
                label={t("Adresse")}
                value={form.adresse ?? ""}
                onChange={(e) => maj("adresse", e.target.value)}
              />
            </div>

            <Champ
              label={t("Téléphone")}
              value={donnees.profil.telephone}
              disabled
              aide={t("Le téléphone sert d'identifiant de connexion et ne peut pas être modifié ici")}
            />

            <ChampSelect
              label={t("Fréquence de retrait")}
              value={form.frequence_retrait ?? "7 jours"}
              onChange={(e) => maj("frequence_retrait", e.target.value)}
              disabled={donnees.profil.registre_commerce_manquant}
            >
              {donnees.frequences_autorisees.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </ChampSelect>

            {donnees.profil.registre_commerce_manquant && (
              <p className="-mt-2 text-xs text-amber-700">
                {t("Renseignez votre registre du commerce ci-dessus pour choisir une autre fréquence de retrait.")}
              </p>
            )}

            <Bouton type="submit" disabled={envoi} className="w-full">
              {envoi ? t("Enregistrement…") : t("Enregistrer")}
            </Bouton>
          </form>
        </Carte>

        {/* Colonne de droite : les réglages courts, les uns sous les autres. */}
        <div className="space-y-6">
          <FormulaireMotDePasse />
          <ChoixLangue />
          <ChoixApparence />
        </div>
      </div>
    </div>
  );
}

/**
 * Choix du thème clair / sombre.
 *
 * Le réglage est propre au navigateur, pas au compte : c'est écrit sous les
 * boutons pour que personne ne s'étonne de retrouver le thème clair en
 * ouvrant la caisse depuis un autre poste. Rien n'est envoyé à l'API, la
 * bascule est donc immédiate et ne peut pas échouer.
 */
const MODES: ModeTheme[] = ["systeme", "clair", "sombre"];

// Table de module : les notes restent en français, langue source, et passent
// par `t()` au moment du rendu — un hook ne s'appelle pas ici.
const APERCUS: Record<ModeTheme, { icone: string; note: string }> = {
  systeme: { icone: "🖥️", note: "Suit votre appareil" },
  clair: { icone: "☀️", note: "Toujours clair" },
  sombre: { icone: "🌙", note: "Toujours sombre" },
};

/**
 * Choix de la langue.
 *
 * Même portée que le thème : l'appareil, pas le compte. Le français est la
 * langue source de l'application — une phrase non traduite s'affiche donc en
 * français plutôt que de disparaître.
 */
function ChoixLangue() {
  const t = useT();
  const { langue, definir } = useLangue();

  return (
    <Carte>
      <h2 className="mb-1 text-lg font-bold">{t("Langue")}</h2>
      <p className="mb-4 text-sm text-faible">{t("Langue de l'interface.")}</p>

      <div
        role="radiogroup"
        aria-label={t("Langue de l'interface")}
        className="grid gap-3 sm:grid-cols-2"
      >
        {LANGUES.map((choix: Langue) => {
          const actif = langue === choix;
          return (
            <button
              key={choix}
              type="button"
              role="radio"
              aria-checked={actif}
              onClick={() => definir(choix)}
              className={`rounded-2xl border-2 px-4 py-4 text-left transition ${
                actif
                  ? "border-marque-500 bg-marque-50"
                  : "border-bordure hover:bg-surface-douce"
              }`}
            >
              {/*
                Un code à deux lettres plutôt qu'un drapeau : Windows ne rend
                pas les émojis de drapeau, et une langue n'appartient de toute
                façon pas à un pays.
              */}
              <span
                className="block text-sm font-black tracking-widest text-faible"
                aria-hidden="true"
              >
                {choix.toUpperCase()}
              </span>
              <span className="mt-2 block text-sm font-semibold text-titre">
                {LIBELLES_LANGUE[choix]}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-faible">
        {t("Ce choix est enregistré sur cet appareil uniquement.")}
      </p>
    </Carte>
  );
}

function ChoixApparence() {
  const t = useT();
  const { mode, resolu, definir } = useTheme();

  return (
    <Carte>
      <h2 className="mb-1 text-lg font-bold">{t("Apparence")}</h2>
      <p className="mb-4 text-sm text-faible">
        {t("Thème de l'interface. Actuellement affiché en {theme}.", {
          theme: resolu === "sombre" ? t("sombre") : t("clair"),
        })}
      </p>

      <div role="radiogroup" aria-label={t("Thème de l'interface")} className="grid gap-3 sm:grid-cols-3">
        {MODES.map((choix) => {
          const actif = mode === choix;
          return (
            <button
              key={choix}
              type="button"
              role="radio"
              aria-checked={actif}
              onClick={() => definir(choix)}
              className={`rounded-2xl border-2 px-4 py-4 text-left transition ${
                actif
                  ? "border-marque-500 bg-marque-50"
                  : "border-bordure hover:bg-surface-douce"
              }`}
            >
              <span className="block text-xl" aria-hidden="true">
                {APERCUS[choix].icone}
              </span>
              <span className="mt-2 block text-sm font-semibold text-titre">
                {t(LIBELLES_THEME[choix])}
              </span>
              <span className="mt-0.5 block text-xs text-faible">
                {t(APERCUS[choix].note)}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-faible">
        {t("Ce choix est enregistré sur cet appareil uniquement.")}
      </p>
    </Carte>
  );
}

function FormulaireMotDePasse() {
  const t = useT();
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setSucces("");

    if (nouveau !== confirmation) {
      setErreur(t("Les deux nouveaux mots de passe ne correspondent pas."));
      return;
    }

    setEnvoi(true);

    try {
      await api.post("/api/parametres/mot-de-passe", {
        mot_de_passe_actuel: actuel,
        nouveau_mot_de_passe: nouveau,
      });
      setSucces(t("Mot de passe mis à jour."));
      setActuel("");
      setNouveau("");
      setConfirmation("");
    } catch (err) {
      setErreur(err instanceof Error ? t(err.message) : t("Modification impossible."));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Carte>
      <h2 className="mb-4 text-lg font-bold">{t("Mot de passe")}</h2>

      {erreur && <Alerte>{erreur}</Alerte>}
      {succes && <Alerte type="succes">{succes}</Alerte>}

      <form onSubmit={soumettre} className="space-y-4">
        <Champ
          label={t("Mot de passe actuel")}
          type="password"
          required
          value={actuel}
          onChange={(e) => setActuel(e.target.value)}
        />
        <Champ
          label={t("Nouveau mot de passe")}
          type="password"
          required
          minLength={6}
          aide={t("6 caractères minimum")}
          value={nouveau}
          onChange={(e) => setNouveau(e.target.value)}
        />
        <Champ
          label={t("Confirmer le nouveau mot de passe")}
          type="password"
          required
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />

        <Bouton type="submit" variante="secondaire" disabled={envoi} className="w-full">
          {envoi ? t("Modification…") : t("Changer le mot de passe")}
        </Bouton>
      </form>
    </Carte>
  );
}
