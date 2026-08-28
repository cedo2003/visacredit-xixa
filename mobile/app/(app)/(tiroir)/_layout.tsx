/**
 * Menu latéral (tiroir).
 *
 * Équivalent mobile de la Sidebar du frontend web : mêmes rubriques, même
 * regroupement, et le même filtrage par rôle — la recherche inter-boutiques
 * n'apparaît que pour un détaillant, l'API la refusant aux grossistes.
 *
 * Le tiroir porte aussi l'en-tête de chaque écran (bouton ☰ et cloche de
 * notifications), ce qui évite de recopier cette barre dans les treize écrans
 * qu'il contient.
 */

import { useT } from "@/i18n";
import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ModaleConfirmation } from "@/components/ui";
import { useState } from "react";
import { LOGO } from "@/marque";
import { useAuth } from "@/lib/auth";
import { useRequete } from "@/lib/requete";
import { couleurs, espacement, rayons, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

/** Une entrée du menu : le nom du fichier d'écran et sa présentation. */
interface Rubrique {
  nom: string;
  titre: string;
  icone: string;
  /** Absente = visible par tous les rôles. */
  role?: "grossiste" | "detaillant";
}

const GROUPES: { titre: string; rubriques: Rubrique[] }[] = [
  {
    titre: "Activité",
    rubriques: [
      { nom: "tableau-de-bord", titre: "Tableau de bord", icone: "🏠" },
      { nom: "produits", titre: "Produits", icone: "📦" },
      { nom: "ventes", titre: "Ventes", icone: "🧾" },
      { nom: "commandes", titre: "Commandes", icone: "🚚" },
      { nom: "recherche", titre: "Chercher un produit", icone: "🔍", role: "detaillant" },
    ],
  },
  {
    titre: "Gestion",
    rubriques: [
      { nom: "clients", titre: "Clients", icone: "👥" },
      { nom: "creances", titre: "Créances clients", icone: "💰" },
      { nom: "credits", titre: "Crédits fournisseurs", icone: "🤝" },
      { nom: "depenses", titre: "Dépenses", icone: "🧮" },
      { nom: "retraits", titre: "Retraits", icone: "💸" },
    ],
  },
  {
    titre: "Compte",
    rubriques: [
      { nom: "notifications", titre: "Notifications", icone: "🔔" },
      { nom: "notations", titre: "Notations", icone: "⭐" },
      { nom: "parametres", titre: "Paramètres", icone: "⚙️" },
    ],
  },
];

/** Titre affiché dans l'en-tête, par nom d'écran. */
const TITRES: Record<string, string> = Object.fromEntries(
  GROUPES.flatMap((g) => g.rubriques).map((r) => [r.nom, r.titre]),
);

export default function LayoutTiroir() {
  const couleurs = useCouleurs();
  const { estGrossiste } = useAuth();

  return (
    <Drawer
      drawerContent={(props) => <ContenuTiroir {...props} />}
      screenOptions={{
        // Chaque écran porte son propre en-tête (EnteteEcran), qui contient le
        // bouton ☰ : un seul titre à l'écran, adapté au rôle et chiffré.
        headerShown: false,
        drawerType: "front",
        drawerStyle: { width: 300 },
        sceneStyle: { backgroundColor: couleurs.fond },
      }}
    >
      {GROUPES.flatMap((groupe) => groupe.rubriques).map((rubrique) => (
        <Drawer.Screen
          key={rubrique.nom}
          name={rubrique.nom}
          options={{
            title: TITRES[rubrique.nom],
            // Une rubrique hors rôle reste routable mais disparaît du menu :
            // c'est l'API qui reste l'autorité, le menu ne fait que guider.
            drawerItemStyle:
              rubrique.role && (rubrique.role === "grossiste") !== estGrossiste
                ? { display: "none" }
                : undefined,
          }}
        />
      ))}
    </Drawer>
  );
}

function ContenuTiroir(props: DrawerContentComponentProps) {
  const t = useT();
  const styles = useStyles(creerStyles);
  const router = useRouter();
  const marges = useSafeAreaInsets();
  const { user, estGrossiste, deconnexion } = useAuth();

  const compteur = useRequete<{ non_lues: number }>("/api/notifications/non-lues");
  const nonLues = compteur.donnees?.non_lues ?? 0;

  const [deconnexionVisible, setDeconnexionVisible] = useState(false);

  // Le nom de l'écran courant, pour surligner la rubrique active.
  const routeActive = props.state.routeNames[props.state.index];

  return (
    <View style={styles.tiroir}>
      <View style={[styles.enteteTiroir, { paddingTop: marges.top + espacement.lg }]}>
        <Image source={LOGO} style={styles.marque} resizeMode="contain" />

        <View style={styles.profil}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexte}>
              {(user?.prenom?.[0] ?? "?").toUpperCase()}
            </Text>
          </View>

          <View style={styles.profilTextes}>
            <Text style={styles.profilNom} numberOfLines={1}>
              {user?.prenom} {user?.nom}
            </Text>
            <Text style={styles.profilBoutique} numberOfLines={1}>
              {user?.nom_boutique}
            </Text>
          </View>
        </View>

        <View style={styles.etiquetteRole}>
          <Text style={styles.etiquetteRoleTexte}>
            {estGrossiste ? t("📦 Grossiste") : t("🏪 Détaillant")}
          </Text>
        </View>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.liste}>
        {GROUPES.map((groupe) => {
          const visibles = groupe.rubriques.filter(
            (r) => !r.role || (r.role === "grossiste") === estGrossiste,
          );

          if (visibles.length === 0) return null;

          return (
            <View key={groupe.titre} style={styles.groupe}>
              <Text style={styles.groupeTitre}>{t(groupe.titre)}</Text>

              {visibles.map((rubrique) => {
                const actif = rubrique.nom === routeActive;

                return (
                  <Pressable
                    key={rubrique.nom}
                    onPress={() => props.navigation.navigate(rubrique.nom)}
                    style={({ pressed }) => [
                      styles.rubrique,
                      actif && styles.rubriqueActive,
                      pressed && !actif && styles.rubriquePressee,
                    ]}
                  >
                    <Text style={styles.rubriqueIcone}>{rubrique.icone}</Text>
                    <Text
                      style={[styles.rubriqueTitre, actif && styles.rubriqueTitreActif]}
                      numberOfLines={1}
                    >
                      {t(rubrique.titre)}
                    </Text>

                    {rubrique.nom === "notifications" && nonLues > 0 ? (
                      <View style={styles.pastille}>
                        <Text style={styles.pastilleTexte}>
                          {nonLues > 99 ? "99+" : nonLues}
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </DrawerContentScrollView>

      <View style={[styles.piedTiroir, { paddingBottom: marges.bottom + espacement.md }]}>
        <Pressable
          onPress={() => setDeconnexionVisible(true)}
          style={({ pressed }) => [styles.deconnexion, pressed && styles.rubriquePressee]}
        >
          <Text style={styles.rubriqueIcone}>↪</Text>
          <Text style={styles.deconnexionTexte}>{t("Se déconnecter")}</Text>
        </Pressable>
      </View>

      <ModaleConfirmation
        visible={deconnexionVisible}
        titre={t("Se déconnecter ?")}
        message={t("Vous devrez saisir à nouveau votre téléphone et votre mot de passe.")}
        libelleConfirmer={t("Se déconnecter")}
        onAnnuler={() => setDeconnexionVisible(false)}
        onConfirmer={async () => {
          setDeconnexionVisible(false);
          await deconnexion();
          router.replace("/connexion");
        }}
      />
    </View>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  tiroir: {
    flex: 1,
    backgroundColor: couleurs.surface,
  },

  enteteTiroir: {
    paddingHorizontal: espacement.lg,
    paddingBottom: espacement.lg,
    borderBottomWidth: 1,
    borderBottomColor: couleurs.bordure,
  },
  marque: {
    width: 108,
    height: 78,
    marginLeft: -6,
  },
  profil: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.md,
    marginTop: espacement.lg,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: rayons.rond,
    backgroundColor: couleurs.primaireClair,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexte: {
    fontSize: 19,
    fontWeight: "800",
    color: couleurs.primaireSombre,
  },
  profilTextes: {
    flex: 1,
  },
  profilNom: {
    fontSize: 15,
    fontWeight: "700",
    color: couleurs.texte,
  },
  profilBoutique: {
    marginTop: 1,
    fontSize: 13,
    color: couleurs.texteFaible,
  },
  etiquetteRole: {
    alignSelf: "flex-start",
    marginTop: espacement.md,
    borderRadius: rayons.rond,
    backgroundColor: couleurs.surfaceDouce,
    paddingHorizontal: espacement.md,
    paddingVertical: 5,
  },
  etiquetteRoleTexte: {
    fontSize: 12,
    fontWeight: "700",
    color: couleurs.texteDoux,
  },

  liste: {
    paddingTop: espacement.sm,
    paddingHorizontal: espacement.md,
  },
  groupe: {
    marginBottom: espacement.lg,
  },
  groupeTitre: {
    marginLeft: espacement.md,
    marginBottom: espacement.xs,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: couleurs.texteTresFaible,
  },
  rubrique: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.md,
    paddingVertical: 11,
    paddingHorizontal: espacement.md,
    borderRadius: rayons.md,
  },
  rubriqueActive: {
    backgroundColor: couleurs.primaireClair,
  },
  rubriquePressee: {
    backgroundColor: couleurs.surfaceDouce,
  },
  rubriqueIcone: {
    fontSize: 17,
    width: 24,
    textAlign: "center",
  },
  rubriqueTitre: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: "600",
    color: couleurs.texteDoux,
  },
  rubriqueTitreActif: {
    color: couleurs.primaireSombre,
    fontWeight: "800",
  },
  pastille: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: rayons.rond,
    backgroundColor: couleurs.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  pastilleTexte: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },

  piedTiroir: {
    paddingHorizontal: espacement.md,
    paddingTop: espacement.md,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
  },
  deconnexion: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.md,
    paddingVertical: 11,
    paddingHorizontal: espacement.md,
    borderRadius: rayons.md,
  },
  deconnexionTexte: {
    fontSize: 14.5,
    fontWeight: "600",
    color: couleurs.danger,
  },
});
