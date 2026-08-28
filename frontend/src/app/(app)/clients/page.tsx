"use client";

import { useT } from "@/lib/i18n";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { date } from "@/lib/format";
import type { Client } from "@/lib/types";
import {
  Alerte,
  Bouton,
  Champ,
  Chargement,
  EtatVide,
  Tableau,
  TitrePage,
} from "@/components/ui";

/** Port de pages/clients/index.php. */
export default function Clients() {
  const t = useT();
  const [clients, setClients] = useState<Client[] | null>(null);
  const [recherche, setRecherche] = useState("");
  const [erreur, setErreur] = useState("");

  const charger = useCallback(async (q: string) => {
    try {
      const url = q ? `/api/clients?q=${encodeURIComponent(q)}` : "/api/clients";
      setClients(await api.get<Client[]>(url));
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Chargement impossible."));
    }
  }, [t]);

  useEffect(() => {
    // Léger décalage pour ne pas interroger l'API à chaque frappe.
    const timer = setTimeout(() => void charger(recherche), 300);
    return () => clearTimeout(timer);
  }, [recherche, charger]);

  async function supprimer(client: Client) {
    if (!confirm(`Supprimer le client « ${client.nom_complet} » ?`)) return;

    try {
      await api.delete(`/api/clients/${client.id}`);
      setClients((liste) => liste?.filter((c) => c.id !== client.id) ?? null);
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Suppression impossible."));
    }
  }

  return (
    <div>
      <TitrePage
        titre={t("Clients")}
        sousTitre={t("Votre carnet d'adresses")}
        action={
          <Link href="/clients/nouveau">
            <Bouton>{t("+ Nouveau client")}</Bouton>
          </Link>
        }
      />

      {erreur && <Alerte>{erreur}</Alerte>}

      <div className="mb-5 max-w-md">
        <Champ
          placeholder={t("Rechercher par nom ou téléphone…")}
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
      </div>

      {!clients ? (
        <Chargement />
      ) : clients.length === 0 ? (
        <EtatVide
          titre={t("Aucun client")}
          description={
            recherche
              ? t("Aucun client ne correspond à cette recherche.")
              : t("Ajoutez votre premier client pour suivre ses achats et ses créances.")
          }
          action={
            !recherche ? (
              <Link href="/clients/nouveau">
                <Bouton>{t("Ajouter un client")}</Bouton>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Tableau>
          <thead className="bg-surface-douce">
            <tr>
              <th>{t("Nom")}</th>
              <th>{t("Téléphone")}</th>
              <th>{t("Email")}</th>
              <th>{t("Ajouté le")}</th>
              <th className="text-right">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="font-medium text-titre">{client.nom_complet}</td>
                <td>{client.telephone}</td>
                <td className="text-faible">{client.email ?? "—"}</td>
                <td className="text-faible">{date(client.created_at)}</td>
                <td>
                  <div className="flex justify-end gap-3 text-sm">
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {t("Modifier")}
                    </Link>
                    <button
                      onClick={() => supprimer(client)}
                      className="font-medium text-red-600 hover:underline"
                    >
                      {t("Supprimer")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Tableau>
      )}
    </div>
  );
}
