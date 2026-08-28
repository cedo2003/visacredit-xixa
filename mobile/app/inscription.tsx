/**
 * Création de boutique — port de frontend/src/app/inscription/page.tsx.
 *
 * `etatEts` reprend la colonne historique : "1" grossiste, "0" détaillant.
 * L'API refuse toute autre valeur, et l'inscription connecte directement.
 */

import { useT } from "@/i18n";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ecran } from "@/components/Ecran";
import { Alerte, Bouton, Carte, Champ, ChampDate, ChoixCartes } from "@/components/ui";
import { messageErreur } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { LOGO } from "@/marque";
import { espacement, type Palette } from "@/theme";
import { useStyles } from "@/theme-contexte";

export default function Inscription() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const router = useRouter();
  const { inscription } = useAuth();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [nomBoutique, setNomBoutique] = useState("");
  const [ifu, setIfu] = useState("");
  const [registreCommerce, setRegistreCommerce] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [adresse, setAdresse] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [etatEts, setEtatEts] = useState<"0" | "1">("0");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function soumettre() {
    setErreur("");

    // Contrôle local : l'API ne connaît pas le champ de confirmation.
    if (motDePasse !== confirmation) {
      setErreur(t("Les deux mots de passe ne correspondent pas."));
      return;
    }
    if (motDePasse.length < 6) {
      setErreur(t("Le mot de passe doit contenir au moins 6 caractères."));
      return;
    }

    setEnvoi(true);

    try {
      await inscription({
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone: telephone.trim(),
        email: email.trim() || undefined,
        password: motDePasse,
        nom_boutique: nomBoutique.trim(),
        ifu: ifu.trim(),
        registre_commerce: registreCommerce.trim(),
        date_naissance: dateNaissance,
        adresse: adresse.trim(),
        etatEts,
      });

      router.replace("/tableau-de-bord");
    } catch (e) {
      setErreur(t(messageErreur(e, "Inscription impossible.")));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Ecran style={styles.ecran}>
      <View style={styles.marque}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <Text style={styles.accroche}>{t("Créez votre boutique en une minute")}</Text>
      </View>

      <Carte>
        <ChoixCartes<"0" | "1">
          label={t("Vous vendez…")}
          valeur={etatEts}
          onChange={setEtatEts}
          options={[
            {
              valeur: "0",
              titre: t("🏪 En détail"),
              note: t("Détaillant : vous revendez aux clients finaux"),
            },
            {
              valeur: "1",
              titre: t("📦 En gros"),
              note: t("Grossiste : vous fournissez des détaillants"),
            },
          ]}
        />

        {erreur ? <Alerte>{erreur}</Alerte> : null}

        <Champ label={t("Prénom")} value={prenom} onChangeText={setPrenom} autoComplete="given-name" />
        <Champ label={t("Nom")} value={nom} onChangeText={setNom} autoComplete="family-name" />
        <Champ
          label={t("Nom de la boutique")}
          value={nomBoutique}
          onChangeText={setNomBoutique}
          placeholder={t("Ex : Chez Amina")}
        />
        <Champ
          label={t("Téléphone")}
          value={telephone}
          onChangeText={setTelephone}
          keyboardType="phone-pad"
          autoComplete="tel"
          aide={t("Il servira d'identifiant de connexion")}
        />
        <Champ
          label={t("IFU (Identifiant Fiscal Unique) — si vous l'avez")}
          value={ifu}
          onChangeText={setIfu}
          autoCapitalize="characters"
          aide={t("Vous pourrez le renseigner plus tard dans Paramètres. Les espaces et tirets sont ignorés.")}
        />
        <Champ
          label={t("Registre du commerce (RCCM) — optionnel")}
          value={registreCommerce}
          onChangeText={setRegistreCommerce}
          autoCapitalize="characters"
          aide={t("Sans lui, vos retraits seront limités à la fréquence « 1 jour ». Vous pourrez l'ajouter plus tard dans Paramètres.")}
        />
        <ChampDate
          label={t("Date de naissance (optionnel)")}
          valeur={dateNaissance}
          onChange={setDateNaissance}
        />
        <Champ
          label={t("Adresse (optionnel)")}
          value={adresse}
          onChangeText={setAdresse}
        />
        <Champ
          label={t("Email (optionnel)")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Champ
          label={t("Mot de passe")}
          value={motDePasse}
          onChangeText={setMotDePasse}
          secureTextEntry
          aide={t("6 caractères minimum")}
        />
        <Champ
          label={t("Confirmer le mot de passe")}
          value={confirmation}
          onChangeText={setConfirmation}
          secureTextEntry
        />

        <Bouton onPress={soumettre} disabled={envoi} pleineLargeur>
          {envoi ? t("Création…") : t("Créer ma boutique")}
        </Bouton>
      </Carte>

      <Pressable onPress={() => router.back()} style={styles.lienBas}>
        <Text style={styles.lienBasTexte}>
          Déjà inscrit ? <Text style={styles.lienBasFort}>{t("Se connecter")}</Text>
        </Text>
      </Pressable>
    </Ecran>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  ecran: {
    padding: espacement.xl,
  },
  marque: {
    alignItems: "center",
    marginBottom: espacement.md,
  },
  logo: {
    width: 160,
    height: 116,
  },
  accroche: {
    marginTop: espacement.xs,
    fontSize: 14,
    color: couleurs.texteFaible,
  },
  lienBas: {
    alignItems: "center",
    paddingVertical: espacement.lg,
  },
  lienBasTexte: {
    fontSize: 14,
    color: couleurs.texteFaible,
  },
  lienBasFort: {
    color: couleurs.primaire,
    fontWeight: "700",
  },
});
