/**
 * Connexion — port de frontend/src/app/connexion/page.tsx.
 *
 * L'API attend `telephone` + `password` sur /api/auth/login (firewall
 * json_login) et renvoie le JWT.
 */

import { useT } from "@/i18n";
import { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import { Alerte, Bouton, Carte, Champ } from "@/components/ui";
import { messageErreur } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { LOGO } from "@/marque";
import { espacement, type Palette } from "@/theme";
import { useStyles } from "@/theme-contexte";

export default function Connexion() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const router = useRouter();
  const { connexion, user, chargement } = useAuth();

  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  // Déjà connecté (retour arrière depuis la boutique) : on ne repropose pas
  // le formulaire.
  if (!chargement && user) {
    return <Redirect href="/tableau-de-bord" />;
  }

  async function soumettre() {
    setErreur("");
    setEnvoi(true);

    try {
      await connexion(telephone.trim(), motDePasse);
      router.replace("/tableau-de-bord");
    } catch (e) {
      setErreur(t(messageErreur(e, "Connexion impossible.")));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Ecran style={styles.ecran}>
      <View style={styles.marque}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <Text style={styles.accroche}>{t("Gérez votre boutique depuis votre téléphone")}</Text>
      </View>

      <Carte>
        <Text style={styles.titre}>{t("Connexion")}</Text>

        {erreur ? <Alerte>{erreur}</Alerte> : null}

        <Champ
          label={t("Téléphone")}
          value={telephone}
          onChangeText={setTelephone}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          placeholder={t("Ex : 0123456789")}
        />

        <Champ
          label={t("Mot de passe")}
          value={motDePasse}
          onChangeText={setMotDePasse}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          placeholder="••••••••"
          onSubmitEditing={soumettre}
          returnKeyType="go"
        />

        <Bouton
          onPress={soumettre}
          disabled={envoi || !telephone.trim() || !motDePasse}
          pleineLargeur
        >
          {envoi ? t("Connexion…") : t("Se connecter")}
        </Bouton>
      </Carte>

      <Pressable onPress={() => router.push("/inscription")} style={styles.lienBas}>
        <Text style={styles.lienBasTexte}>
          Pas encore de compte ? <Text style={styles.lienBasFort}>{t("Créer une boutique")}</Text>
        </Text>
      </Pressable>

      {/* L'application fonctionne sans réseau : autant le dire d'emblée. */}
      <Text style={styles.serveur}>{t("📴 Fonctionne hors ligne · données sur cet appareil")}</Text>

    </Ecran>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  ecran: {
    flexGrow: 1,
    justifyContent: "center",
    padding: espacement.xl,
  },
  marque: {
    alignItems: "center",
    marginBottom: espacement.xl,
  },
  logo: {
    width: 180,
    height: 131,
  },
  accroche: {
    marginTop: espacement.sm,
    fontSize: 14,
    color: couleurs.texteFaible,
    textAlign: "center",
  },
  titre: {
    fontSize: 20,
    fontWeight: "700",
    color: couleurs.texte,
    marginBottom: espacement.lg,
  },
  lienBas: {
    alignItems: "center",
    paddingVertical: espacement.lg,
  },
  lienBasTexte: {
    fontSize: 14,
    color: couleurs.texteFaible,
  },
  serveur: {
    marginTop: espacement.sm,
    textAlign: "center",
    fontSize: 11,
    color: couleurs.texteTresFaible,
  },
  avertissementTunnel: {
    marginTop: espacement.sm,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 16,
    color: couleurs.alerte,
  },
  lienBasFort: {
    color: couleurs.primaire,
    fontWeight: "700",
  },
});
