"use client";

import { useT } from "@/lib/i18n";
import { use, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Client } from "@/lib/types";
import FormulaireClient from "@/components/FormulaireClient";
import { Alerte, Chargement, TitrePage } from "@/components/ui";

export default function ModifierClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useT();
  const { id } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api
      .get<Client>(`/api/clients/${id}`)
      .then(setClient)
      .catch((e) => setErreur(e.message));
  }, [id]);

  if (erreur) return <Alerte>{erreur}</Alerte>;
  if (!client) return <Chargement />;

  return (
    <div>
      <TitrePage titre={t("Modifier le client")} sousTitre={client.nom_complet} />
      <FormulaireClient client={client} />
    </div>
  );
}
