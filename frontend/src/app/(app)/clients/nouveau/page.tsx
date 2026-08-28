"use client";

import { useT } from "@/lib/i18n";
import FormulaireClient from "@/components/FormulaireClient";
import { TitrePage } from "@/components/ui";

export default function NouveauClient() {
  const t = useT();
  return (
    <div>
      <TitrePage titre={t("Nouveau client")} sousTitre={t("Ajoutez un client à votre carnet")} />
      <FormulaireClient />
    </div>
  );
}
