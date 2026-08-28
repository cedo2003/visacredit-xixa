/**
 * Formulaire de client, partagé par la création et la modification —
 * port de frontend/src/components/FormulaireClient.tsx.
 *
 * L'API impose le nom et le téléphone ; le reste est facultatif.
 */

import { useT } from "@/i18n";
import { useState } from "react";
import { Alerte, Bouton, Champ, ChampDate } from "./ui";
import { api, messageErreur } from "../lib/api";
import type { Client } from "../lib/types";

export default function FormulaireClient({
  client,
  onEnregistre,
}: {
  /** Absent en création, présent en modification. */
  client?: Client;
  onEnregistre: (client: Client) => void;
}) {
  const t = useT();
  const [nomComplet, setNomComplet] = useState(client?.nom_complet ?? "");
  const [telephone, setTelephone] = useState(client?.telephone ?? "");
  const [telephone2, setTelephone2] = useState(client?.telephone2 ?? "");
  const [dateNaissance, setDateNaissance] = useState(client?.date_naissance ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [adresse, setAdresse] = useState(client?.adresse ?? "");
  const [notes, setNotes] = useState(client?.notes ?? "");

  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function soumettre() {
    setErreur("");
    setEnvoi(true);

    const corps = {
      nom_complet: nomComplet.trim(),
      telephone: telephone.trim(),
      telephone2: telephone2.trim(),
      date_naissance: dateNaissance,
      email: email.trim(),
      adresse: adresse.trim(),
      notes: notes.trim(),
    };

    try {
      const enregistre = client
        ? await api.put<Client>(`/api/clients/${client.id}`, corps)
        : await api.post<Client>("/api/clients", corps);

      onEnregistre(enregistre);
    } catch (e) {
      setErreur(t(messageErreur(e, "Enregistrement impossible.")));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <>
      {erreur ? <Alerte>{erreur}</Alerte> : null}

      <Champ
        label={t("Nom complet")}
        value={nomComplet}
        onChangeText={setNomComplet}
        placeholder={t("Ex : Amina Diallo")}
      />

      <Champ
        label={t("Téléphone")}
        value={telephone}
        onChangeText={setTelephone}
        keyboardType="phone-pad"
      />

      <Champ
        label={t("Second téléphone (optionnel)")}
        value={telephone2}
        onChangeText={setTelephone2}
        keyboardType="phone-pad"
        aide={t("Ligne de secours, pour joindre le client quand la première ne répond pas")}
      />

      <ChampDate
        label={t("Date de naissance (optionnel)")}
        valeur={dateNaissance}
        onChange={setDateNaissance}
      />

      <Champ
        label={t("Email (optionnel)")}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Champ label={t("Adresse (optionnel)")} value={adresse} onChangeText={setAdresse} />

      <Champ label={t("Notes (optionnel)")} value={notes} onChangeText={setNotes} multiline />

      <Bouton
        onPress={soumettre}
        disabled={envoi || !nomComplet.trim() || !telephone.trim()}
        pleineLargeur
      >
        {envoi ? "Enregistrement…" : client ? t("Enregistrer les modifications") : t("Ajouter le client")}
      </Bouton>
    </>
  );
}
