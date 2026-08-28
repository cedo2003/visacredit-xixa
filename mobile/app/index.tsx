/**
 * Écran d'entrée : aiguille vers la boutique ou vers la connexion.
 *
 * Il ne s'affiche que le temps de relire le jeton dans le stockage sécurisé —
 * quelques dizaines de millisecondes — puis redirige.
 */

import { Redirect } from "expo-router";
import { Image, ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/lib/auth";
import { LOGO } from "@/marque";
import { couleurs, espacement, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

export default function Accueil() {
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const { user, chargement } = useAuth();

  if (chargement) {
    return (
      <View style={styles.conteneur}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <ActivityIndicator color={couleurs.primaire} />
      </View>
    );
  }

  return <Redirect href={user ? "/tableau-de-bord" : "/connexion"} />;
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  conteneur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: espacement.xl,
    backgroundColor: couleurs.fond,
  },
  logo: {
    width: 160,
    height: 116,
  },
});
