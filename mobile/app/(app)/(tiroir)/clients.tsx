/**
 * Carnet de clients — port de frontend/src/app/(app)/clients/page.tsx.
 *
 * Le téléphone est cliquable : sur mobile, appeler un client depuis sa fiche
 * est l'usage le plus fréquent, autant l'ouvrir directement dans le composeur.
 */

import { useT } from "@/i18n";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { BoutonFlottant, Ecran } from "@/components/Ecran";
import { Alerte, Bouton, Carte, Champ, Chargement, EtatVide, LienTexte } from "@/components/ui";
import { useRequete } from "@/lib/requete";
import type { Client } from "@/lib/types";
import { espacement, rayons, type Palette } from "@/theme";
import { useStyles } from "@/theme-contexte";

export default function Clients() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const router = useRouter();

  const [recherche, setRecherche] = useState("");
  const [termeDifferee, setTermeDifferee] = useState("");

  useEffect(() => {
    const minuterie = setTimeout(() => setTermeDifferee(recherche.trim()), 350);
    return () => clearTimeout(minuterie);
  }, [recherche]);

  const chemin = termeDifferee
    ? `/api/clients?q=${encodeURIComponent(termeDifferee)}`
    : "/api/clients";

  const { donnees, chargement, rafraichissement, erreur, recharger } =
    useRequete<Client[]>(chemin);

  const clients = donnees ?? [];

  return (
    <>
      <Ecran
        titre={t("Mes clients")}
        sousTitre={clients.length > 0 ? `${clients.length} client(s)` : undefined}
        onRafraichir={recharger}
        rafraichissement={rafraichissement}
      >
        <Champ
          value={recherche}
          onChangeText={setRecherche}
          placeholder={t("🔍 Rechercher un client…")}
          autoCorrect={false}
        />

        {erreur ? <Alerte>{erreur}</Alerte> : null}

        {chargement ? (
          <Chargement />
        ) : clients.length === 0 ? (
          <EtatVide
            titre={termeDifferee ? t("Aucun résultat") : t("Aucun client")}
            description={
              termeDifferee
                ? `Rien ne correspond à « ${termeDifferee} ».`
                : "Enregistrez vos clients pour suivre leurs achats et leurs créances."
            }
            action={
              termeDifferee ? undefined : (
                <Bouton onPress={() => router.push("/clients/nouveau")}>
                  {t("Ajouter un client")}
                </Bouton>
              )
            }
          />
        ) : (
          clients.map((client) => (
            <Pressable key={client.id} onPress={() => router.push(`/clients/${client.id}`)}>
              {({ pressed }) => (
                <Carte style={pressed ? styles.cartePressee : undefined}>
                  <View style={styles.ligne}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarTexte}>
                        {(client.nom_complet[0] ?? "?").toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.textes}>
                      <Text style={styles.nom} numberOfLines={1}>
                        {client.nom_complet}
                      </Text>
                      <LienTexte onPress={() => Linking.openURL(`tel:${client.telephone}`)}>
                        📞 {client.telephone}
                      </LienTexte>
                      {client.adresse ? (
                        <Text style={styles.adresse} numberOfLines={1}>
                          {client.adresse}
                        </Text>
                      ) : null}
                    </View>

                    <Text style={styles.chevron}>›</Text>
                  </View>
                </Carte>
              )}
            </Pressable>
          ))
        )}
      </Ecran>

      <BoutonFlottant onPress={() => router.push("/clients/nouveau")} />
    </>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  cartePressee: {
    opacity: 0.7,
  },
  ligne: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: rayons.rond,
    backgroundColor: couleurs.secondaireClair,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexte: {
    fontSize: 18,
    fontWeight: "800",
    color: couleurs.secondaire,
  },
  textes: {
    flex: 1,
    gap: 2,
  },
  nom: {
    fontSize: 15,
    fontWeight: "700",
    color: couleurs.texte,
  },
  adresse: {
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  chevron: {
    fontSize: 22,
    color: couleurs.texteTresFaible,
  },
});
