/** Nouveau client — port de frontend/src/app/(app)/clients/nouveau/page.tsx. */

import { useRouter } from "expo-router";
import { Ecran } from "@/components/Ecran";
import FormulaireClient from "@/components/FormulaireClient";
import { Carte } from "@/components/ui";

export default function NouveauClient() {
  const router = useRouter();

  return (
    <Ecran>
      <Carte>
        <FormulaireClient
          onEnregistre={(client) => router.replace(`/clients/${client.id}`)}
        />
      </Carte>
    </Ecran>
  );
}
