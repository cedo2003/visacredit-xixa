"use client";

import { useT } from "@/lib/i18n";
import Image from "next/image";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Alerte, Bouton, Champ, ChampMotDePasse } from "@/components/ui";

/**
 * Remplace register.php.
 * Différence : l'inscription connecte directement l'utilisateur (le jeton est
 * renvoyé par l'API), au lieu de rediriger vers l'écran de connexion.
 */
export default function Inscription() {
  const t = useT();
  const { inscription } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    nom_boutique: "",
    ifu: "",
    registre_commerce: "",
    date_naissance: "",
    adresse: "",
    password: "",
    etatEts: "0",
  });
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  function maj(champ: keyof typeof form, valeur: string) {
    setForm((f) => ({ ...f, [champ]: valeur }));
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);

    try {
      await inscription(form);
      router.replace("/tableau-de-bord");
    } catch (err) {
      setErreur(err instanceof Error ? t(err.message) : t("Inscription impossible."));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl bg-surface p-8 shadow-xl sm:p-10">
        <div className="mb-8 text-center">
          <Image
            src="/logo-xixa.png"
            alt={t("Visacredit XIXA")}
            width={180}
            height={131}
            priority
            className="mx-auto h-auto w-auto dark:rounded-2xl dark:bg-white dark:p-3"
          />
          <p className="mt-2 text-doux">{t("Commencez à gérer votre boutique")}</p>
        </div>

        {erreur && <Alerte>{erreur}</Alerte>}

        <form onSubmit={soumettre} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Champ
              label={t("Prénom")}
              required
              value={form.prenom}
              onChange={(e) => maj("prenom", e.target.value)}
            />
            <Champ
              label={t("Nom")}
              required
              value={form.nom}
              onChange={(e) => maj("nom", e.target.value)}
            />
          </div>

          <Champ
            label={t("Téléphone")}
            type="tel"
            inputMode="numeric"
            required
            aide={t("Exemple : 22901020304")}
            value={form.telephone}
            onChange={(e) => maj("telephone", e.target.value)}
          />

          <Champ
            label={t("Email (optionnel)")}
            type="email"
            value={form.email}
            onChange={(e) => maj("email", e.target.value)}
          />

          <Champ
            label={t("Nom de la boutique")}
            required
            value={form.nom_boutique}
            onChange={(e) => maj("nom_boutique", e.target.value)}
          />

          <Champ
            label={t("IFU (Identifiant Fiscal Unique) — si vous l'avez")}
            value={form.ifu}
            onChange={(e) => maj("ifu", e.target.value)}
            aide={t("Vous pourrez le renseigner plus tard dans Paramètres. Les espaces et tirets sont ignorés.")}
          />

          <Champ
            label={t("Registre du commerce (RCCM) — optionnel")}
            value={form.registre_commerce}
            onChange={(e) => maj("registre_commerce", e.target.value)}
            aide={t("Sans lui, vos retraits seront limités à la fréquence « 1 jour ». Vous pourrez l'ajouter plus tard dans Paramètres.")}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Champ
              label={t("Date de naissance (optionnel)")}
              type="date"
              value={form.date_naissance}
              onChange={(e) => maj("date_naissance", e.target.value)}
            />
            <Champ
              label={t("Adresse (optionnel)")}
              value={form.adresse}
              onChange={(e) => maj("adresse", e.target.value)}
            />
          </div>

          <ChampMotDePasse
            label={t("Mot de passe")}
            required
            minLength={6}
            aide={t("6 caractères minimum")}
            value={form.password}
            onChange={(e) => maj("password", e.target.value)}
          />

          <div>
            <span className="mb-2 block text-sm font-medium text-corps">
              {t("Type de fournisseur")}
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { valeur: "0", titre: t("Fournisseur en détail"), note: t("Vous vendez aux clients finaux") },
                { valeur: "1", titre: t("Fournisseur en gros"), note: t("Vous approvisionnez des détaillants") },
              ].map((option) => (
                <label
                  key={option.valeur}
                  className={`cursor-pointer rounded-2xl border-2 px-4 py-3 transition ${
                    form.etatEts === option.valeur
                      ? "border-marque-500 bg-marque-50"
                      : "border-bordure hover:bg-surface-douce"
                  }`}
                >
                  <input
                    type="radio"
                    name="etatEts"
                    className="sr-only"
                    checked={form.etatEts === option.valeur}
                    onChange={() => maj("etatEts", option.valeur)}
                  />
                  <span className="block text-sm font-semibold text-titre">
                    {option.titre}
                  </span>
                  <span className="mt-0.5 block text-xs text-faible">{option.note}</span>
                </label>
              ))}
            </div>
          </div>

          <Bouton type="submit" disabled={envoi} className="w-full py-3.5">
            {envoi ? t("Création…") : t("Créer mon compte")}
          </Bouton>
        </form>

        <p className="mt-6 text-center text-sm text-doux">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="font-medium text-accent hover:underline">
            {t("Se connecter")}
          </Link>
        </p>
      </div>
    </main>
  );
}
