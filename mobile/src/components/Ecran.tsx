/**
 * Enveloppe commune à tous les écrans.
 *
 * Regroupe ce que chaque page répétait autrement : fond, marges, défilement,
 * « tirer pour rafraîchir », remontée du contenu au-dessus du clavier et marge
 * basse pour ne pas passer sous le geste système.
 */

import { useContext, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderHeightContext } from "@react-navigation/elements";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { couleurs, espacement, ombre, rayons, type Palette } from "../theme";
import { useCouleurs, useStyles } from "../theme-contexte";

export function Ecran({
  children,
  titre,
  sousTitre,
  action,
  rafraichissement,
  onRafraichir,
  style,
  sansPadding = false,
}: {
  children: ReactNode;
  /**
   * Titre de l'écran. Fourni, il s'affiche dans une barre **fixe** au-dessus du
   * contenu : on sait toujours où l'on est, même après avoir fait défiler. Les
   * écrans empilés l'omettent — leur en-tête natif joue déjà ce rôle.
   */
  titre?: string;
  sousTitre?: string;
  /** Élément aligné à droite dans la barre de titre. */
  action?: ReactNode;
  rafraichissement?: boolean;
  onRafraichir?: () => void;
  style?: ViewStyle;
  sansPadding?: boolean;
}) {
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const marges = useSafeAreaInsets();

  // Hauteur réelle de l'en-tête natif : elle vaut la vraie valeur sur les
  // écrans empilés, et 0 sur ceux du tiroir, qui n'en ont pas. Une constante
  // écrirait un décalage faux dans l'un des deux cas — et laisserait le clavier
  // recouvrir le dernier champ.
  const hauteurEntete = useContext(HeaderHeightContext) ?? 0;

  return (
    <KeyboardAvoidingView
      style={styles.plein}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? hauteurEntete : 0}
    >
      {titre ? <EnteteEcran titre={titre} sousTitre={sousTitre} action={action} /> : null}

      <ScrollView
        style={styles.plein}
        contentContainerStyle={[
          styles.contenu,
          sansPadding && styles.contenuSansPadding,
          { paddingBottom: espacement.xxl + marges.bottom },
          style,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          onRafraichir ? (
            <RefreshControl
              refreshing={Boolean(rafraichissement)}
              onRefresh={onRafraichir}
              colors={[couleurs.primaire]}
              tintColor={couleurs.primaire}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * Barre de titre fixe des écrans du tiroir.
 *
 * Rendue par `Ecran` **au-dessus** de la zone de défilement, et non dedans :
 * c'est ce qui la garde visible quand on fait défiler la page, comme l'en-tête
 * natif des écrans empilés. Elle est opaque pour que le contenu passe dessous
 * sans transparaître.
 *
 * Elle porte le bouton ☰ et écarte le contenu de la barre d'état : ces écrans
 * masquent l'en-tête natif, plus rien d'autre ne réserve cette hauteur.
 *
 * Le titre est préféré à celui de la navigation parce qu'il en dit plus : il
 * s'adapte au rôle (« Mes commandes » / « Commandes reçues ») et porte un
 * sous-titre chiffré.
 */
export function EnteteEcran({
  titre,
  sousTitre,
  action,
}: {
  titre: string;
  sousTitre?: string;
  action?: ReactNode;
}) {
  const styles = useStyles(creerStyles);
  const navigation = useNavigation();
  const marges = useSafeAreaInsets();

  return (
    <View style={[styles.entete, { paddingTop: marges.top + espacement.sm }]}>
      <Pressable
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        hitSlop={10}
        style={styles.boutonMenu}
      >
        <Text style={styles.iconeMenu}>☰</Text>
      </Pressable>

      <View style={styles.enteteTextes}>
        <Text style={styles.enteteTitre} numberOfLines={1}>
          {titre}
        </Text>
        {sousTitre ? (
          <Text style={styles.enteteSousTitre} numberOfLines={1}>
            {sousTitre}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

/** Bouton d'action principal, ancré en bas à droite de l'écran. */
export function BoutonFlottant({
  onPress,
  icone = "+",
  libelle,
}: {
  onPress: () => void;
  icone?: string;
  libelle?: string;
}) {
  const styles = useStyles(creerStyles);
  const marges = useSafeAreaInsets();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        { bottom: espacement.xl + marges.bottom },
        libelle ? styles.fabEtendu : null,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={styles.fabIcone}>{icone}</Text>
      {libelle ? <Text style={styles.fabLibelle}>{libelle}</Text> : null}
    </Pressable>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  plein: {
    flex: 1,
    backgroundColor: couleurs.fond,
  },
  contenu: {
    padding: espacement.lg,
    gap: espacement.md,
  },
  contenuSansPadding: {
    padding: 0,
  },

  entete: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.md,
    paddingHorizontal: espacement.lg,
    paddingBottom: espacement.md,
    backgroundColor: couleurs.surface,
    borderBottomWidth: 1,
    borderBottomColor: couleurs.bordure,
  },
  boutonMenu: {
    paddingVertical: 2,
  },
  iconeMenu: {
    fontSize: 22,
    color: couleurs.texte,
  },
  enteteTextes: {
    flex: 1,
  },
  enteteTitre: {
    fontSize: 20,
    fontWeight: "800",
    color: couleurs.texte,
  },
  enteteSousTitre: {
    marginTop: 2,
    fontSize: 13,
    color: couleurs.texteFaible,
  },

  fab: {
    position: "absolute",
    right: espacement.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.sm,
    height: 56,
    minWidth: 56,
    paddingHorizontal: espacement.lg,
    borderRadius: rayons.rond,
    backgroundColor: couleurs.primaire,
    justifyContent: "center",
    ...ombre,
    elevation: 6,
  },
  fabEtendu: {
    paddingHorizontal: espacement.xl,
  },
  fabIcone: {
    fontSize: 26,
    lineHeight: 30,
    color: "#ffffff",
    fontWeight: "300",
  },
  fabLibelle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
});
