"use client";

import { useT } from "@/lib/i18n";
import Image from "next/image";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Alerte, Bouton, Champ, ChampMotDePasse } from "@/components/ui";

/** Remplace login.php. */
export default function Connexion() {
  const t = useT();
  const { connexion, user, chargement } = useAuth();
  const router = useRouter();

  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (!chargement && user) router.replace("/tableau-de-bord");
  }, [user, chargement, router]);

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setEnvoi(true);

    try {
      await connexion(telephone.trim(), password);
      router.replace("/tableau-de-bord");
    } catch (err) {
      // L'API ne distingue pas identifiant inconnu et mot de passe faux,
      // exactement comme le faisait login.php.
      setErreur(
        err instanceof Error && err.message !== "Invalid credentials."
          ? err.message
          : t("Téléphone ou mot de passe incorrect."),
      );
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-surface p-8 shadow-xl">
        <div className="mb-8 text-center">
          <Image
            src="/logo-xixa.png"
            alt={t("Visacredit XIXA")}
            width={200}
            height={145}
            priority
            className="mx-auto h-auto w-auto dark:rounded-2xl dark:bg-white dark:p-3"
          />
          <p className="mt-2 text-doux">{t("Votre boutique, simplifiée")}</p>
        </div>

        {erreur && <Alerte>{erreur}</Alerte>}

        <form onSubmit={soumettre} className="space-y-5">
          <Champ
            label={t("Téléphone")}
            type="tel"
            inputMode="numeric"
            required
            autoFocus
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />
          <ChampMotDePasse
            label={t("Mot de passe")}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Bouton type="submit" disabled={envoi} className="w-full py-3.5">
            {envoi ? t("Connexion…") : t("Se connecter")}
          </Bouton>
        </form>

        <p className="mt-6 text-center text-sm text-doux">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-accent hover:underline">
            {t("Créer un compte")}
          </Link>
        </p>
      </div>
    </main>
  );
}
