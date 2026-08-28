"use client";

import { useT } from "@/lib/i18n";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Client } from "@/lib/types";
import { Alerte, Bouton, Carte, Champ, ChampTexte } from "@/components/ui";

/** Formulaire partagé création / modification (pages/clients/{create,edit}.php). */
export default function FormulaireClient({ client }: { client?: Client }) {
  const t = useT();
  const router = useRouter();
  const [form, setForm] = useState({
    nom_complet: client?.nom_complet ?? "",
    telephone: client?.telephone ?? "",
    telephone2: client?.telephone2 ?? "",
    date_naissance: client?.date_naissance ?? "",
    email: client?.email ?? "",
    adresse: client?.adresse ?? "",
    notes: client?.notes ?? "",
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
      if (client) {
        await api.put(`/api/clients/${client.id}`, form);
      } else {
        await api.post("/api/clients", form);
      }
      router.push("/clients");
      router.refresh();
    } catch (err) {
      setErreur(err instanceof Error ? t(err.message) : t("Enregistrement impossible."));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Carte className="max-w-2xl">
      {erreur && <Alerte>{erreur}</Alerte>}

      <form onSubmit={soumettre} className="space-y-5">
        <Champ
          label={t("Nom complet")}
          required
          value={form.nom_complet}
          onChange={(e) => maj("nom_complet", e.target.value)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ
            label={t("Téléphone")}
            type="tel"
            required
            value={form.telephone}
            onChange={(e) => maj("telephone", e.target.value)}
          />
          <Champ
            label={t("Second téléphone (optionnel)")}
            type="tel"
            value={form.telephone2}
            onChange={(e) => maj("telephone2", e.target.value)}
            aide={t("Ligne de secours, pour joindre le client quand la première ne répond pas")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ
            label={t("Date de naissance (optionnel)")}
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={form.date_naissance}
            onChange={(e) => maj("date_naissance", e.target.value)}
          />
          <Champ
            label={t("Email (optionnel)")}
            type="email"
            value={form.email}
            onChange={(e) => maj("email", e.target.value)}
          />
        </div>
        <ChampTexte
          label={t("Adresse")}
          rows={2}
          value={form.adresse}
          onChange={(e) => maj("adresse", e.target.value)}
        />
        <ChampTexte
          label={t("Notes")}
          rows={3}
          value={form.notes}
          onChange={(e) => maj("notes", e.target.value)}
        />

        <div className="flex gap-3 pt-2">
          <Bouton
            type="button"
            variante="neutre"
            className="flex-1"
            onClick={() => router.push("/clients")}
          >
            {t("Annuler")}
          </Bouton>
          <Bouton type="submit" disabled={envoi} className="flex-1">
            {envoi ? "Enregistrement…" : client ? t("Enregistrer") : t("Créer le client")}
          </Bouton>
        </div>
      </form>
    </Carte>
  );
}
