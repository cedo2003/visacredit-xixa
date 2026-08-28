/**
 * Briques d'interface communes.
 *
 * Équivalent mobile de frontend/src/components/ui.tsx : mêmes noms, mêmes
 * intentions, mais rendus avec les primitives React Native. Deux composants
 * n'ont pas d'équivalent web parce que le mobile n'a pas de contrôle natif
 * comparable : `ChampSelect` ouvre une feuille de sélection au lieu d'un
 * <select>, et `ChampDate` s'appuie sur le sélecteur de date du système.
 */

import { useT } from "@/i18n";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { couleurs, espacement, ombre, rayons, type Palette } from "../theme";
import { useCouleurs, useStyles } from "../theme-contexte";
import { date as formaterDate } from "../lib/format";

/* ────────────────────────────── Conteneurs ───────────────────────────── */

export function Carte({
  children,
  style,
}: {
  children: ReactNode;
  style?: ViewStyle;
}) {
  const styles = useStyles(creerStyles);
  return <View style={[styles.carte, style]}>{children}</View>;
}

export function TitreSection({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  const styles = useStyles(creerStyles);
  return (
    <View style={styles.titreSection}>
      <Text style={styles.titreSectionTexte}>{children}</Text>
      {action}
    </View>
  );
}

/* ─────────────────────────────── Boutons ─────────────────────────────── */

/**
 * `succes` existe parce que l'orange de la marque et le rouge de `danger` se
 * ressemblent trop pour opposer deux actions contraires : « Valider » et
 * « Refuser » côte à côte se lisaient comme deux boutons de la même famille.
 * Les accords sont donc verts, les refus rouges.
 */
export type VarianteBouton = "primaire" | "secondaire" | "succes" | "danger" | "neutre";

export function Bouton({
  children,
  onPress,
  variante = "primaire",
  disabled = false,
  pleineLargeur = false,
  compact = false,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  variante?: VarianteBouton;
  disabled?: boolean;
  pleineLargeur?: boolean;
  compact?: boolean;
  style?: ViewStyle;
}) {
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  // Les quatre premiers portent du libellé blanc : ce sont les aplats `action*`
  // qui ne s'éclaircissent pas en thème sombre, pas les couleurs de texte.
  const fond = {
    primaire: couleurs.actionPrimaire,
    secondaire: couleurs.actionSecondaire,
    succes: couleurs.actionSucces,
    danger: couleurs.actionDanger,
    neutre: couleurs.surface,
  }[variante];

  const teinte = variante === "neutre" ? couleurs.texteDoux : "#ffffff";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.bouton,
        compact && styles.boutonCompact,
        { backgroundColor: fond },
        variante === "neutre" && styles.boutonNeutre,
        pleineLargeur && styles.boutonPleineLargeur,
        (disabled || pressed) && { opacity: disabled ? 0.5 : 0.75 },
        style,
      ]}
    >
      <Text
        style={[styles.boutonTexte, compact && styles.boutonTexteCompact, { color: teinte }]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </Pressable>
  );
}

/** Lien textuel discret (« Retirer », « Tout marquer lu »…). */
export function LienTexte({
  children,
  onPress,
  couleur,
}: {
  children: ReactNode;
  onPress?: () => void;
  couleur?: string;
}) {
  const styles = useStyles(creerStyles);
  // Résolue dans le corps et non en valeur par défaut : une valeur par défaut
  // est évaluée au chargement du module, avant que le thème soit connu.
  const couleursTheme = useCouleurs();
  const teinte = couleur ?? couleursTheme.primaire;
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      {({ pressed }) => (
        <Text style={[styles.lienTexte, { color: teinte, opacity: pressed ? 0.6 : 1 }]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

/* ─────────────────────────────── Champs ──────────────────────────────── */

export function Champ({
  label,
  aide,
  erreur,
  style,
  ...props
}: TextInputProps & { label?: string; aide?: string; erreur?: string }) {
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  return (
    <View style={styles.champ}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={couleurs.texteTresFaible}
        {...props}
        style={[
          styles.saisie,
          props.multiline && styles.saisieMultiligne,
          erreur ? styles.saisieErreur : null,
          style,
        ]}
      />
      {erreur ? (
        <Text style={styles.aideErreur}>{erreur}</Text>
      ) : aide ? (
        <Text style={styles.aide}>{aide}</Text>
      ) : null}
    </View>
  );
}

export interface OptionSelect {
  valeur: string;
  label: string;
  note?: string;
}

/**
 * Sélecteur d'option.
 *
 * React Native n'offre pas d'équivalent portable de <select> ; on affiche donc
 * un bouton qui ouvre une liste en feuille modale. Le contrat de props reste
 * celui du web (valeur / onChange) pour que les écrans se lisent pareil.
 */
export function ChampSelect({
  label,
  valeur,
  options,
  onChange,
  placeholder,
  aide,
  disabled = false,
}: {
  label?: string;
  valeur: string;
  options: OptionSelect[];
  onChange: (valeur: string) => void;
  placeholder?: string;
  aide?: string;
  disabled?: boolean;
}) {
  const t = useT();
  const styles = useStyles(creerStyles);
  const [ouvert, setOuvert] = useState(false);
  const choisie = options.find((o) => o.valeur === valeur);

  return (
    <View style={styles.champ}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        onPress={() => !disabled && setOuvert(true)}
        style={[styles.saisie, styles.selecteur, disabled && styles.selecteurDesactive]}
      >
        <Text
          style={[styles.selecteurTexte, !choisie && styles.selecteurPlaceholder]}
          numberOfLines={1}
        >
          {choisie ? t(choisie.label) : (placeholder ?? t("Choisir…"))}
        </Text>
        <Text style={styles.selecteurChevron}>▾</Text>
      </Pressable>

      {aide ? <Text style={styles.aide}>{aide}</Text> : null}

      <Modal
        visible={ouvert}
        transparent
        animationType="slide"
        onRequestClose={() => setOuvert(false)}
      >
        <Pressable style={styles.voile} onPress={() => setOuvert(false)}>
          {/* Pressable interne : un appui sur la feuille ne doit pas la fermer. */}
          <Pressable style={styles.feuille} onPress={() => {}}>
            <View style={styles.poignee} />
            {label ? <Text style={styles.feuilleTitre}>{label}</Text> : null}

            <ScrollView style={styles.feuilleListe} keyboardShouldPersistTaps="handled">
              {options.length === 0 ? (
                <Text style={styles.feuilleVide}>{t("Aucune option disponible.")}</Text>
              ) : (
                options.map((option) => {
                  const active = option.valeur === valeur;

                  return (
                    <Pressable
                      key={option.valeur}
                      onPress={() => {
                        onChange(option.valeur);
                        setOuvert(false);
                      }}
                      style={[styles.optionLigne, active && styles.optionActive]}
                    >
                      <View style={styles.optionTextes}>
                        <Text style={[styles.optionLabel, active && styles.optionLabelActif]}>
                          {option.label}
                        </Text>
                        {option.note ? (
                          <Text style={styles.optionNote}>{option.note}</Text>
                        ) : null}
                      </View>
                      {active ? <Text style={styles.optionCoche}>✓</Text> : null}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/** Saisie de date (Y-m-d) via le sélecteur natif. */
export function ChampDate({
  label,
  valeur,
  onChange,
}: {
  label?: string;
  valeur: string;
  onChange: (iso: string) => void;
}) {
  const t = useT();
  const styles = useStyles(creerStyles);
  const [ouvert, setOuvert] = useState(false);

  const valeurDate = valeur ? new Date(`${valeur}T00:00:00`) : new Date();
  const valide = !Number.isNaN(valeurDate.getTime());

  return (
    <View style={styles.champ}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable onPress={() => setOuvert(true)} style={[styles.saisie, styles.selecteur]}>
        <Text style={styles.selecteurTexte}>{formaterDate(valeur)}</Text>
        <Text style={styles.selecteurChevron}>🗓</Text>
      </Pressable>

      {ouvert ? (
        <DateTimePicker
          value={valide ? valeurDate : new Date()}
          mode="date"
          // Sur iOS le sélecteur reste affiché tant qu'on ne le ferme pas ;
          // sur Android c'est une boîte de dialogue qui se ferme d'elle-même.
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(evenement, choisie) => {
            if (Platform.OS !== "ios") setOuvert(false);
            if (evenement.type === "dismissed" || !choisie) return;

            const mois = String(choisie.getMonth() + 1).padStart(2, "0");
            const jour = String(choisie.getDate()).padStart(2, "0");
            onChange(`${choisie.getFullYear()}-${mois}-${jour}`);
          }}
        />
      ) : null}

      {ouvert && Platform.OS === "ios" ? (
        <Bouton variante="neutre" compact onPress={() => setOuvert(false)}>
          {t("Terminé")}
        </Bouton>
      ) : null}
    </View>
  );
}

/** Choix parmi 2-3 options présentées comme des cartes (mode de paiement…). */
export function ChoixCartes<T extends string>({
  label,
  valeur,
  options,
  onChange,
}: {
  label?: string;
  valeur: T;
  options: { valeur: T; titre: string; note?: string }[];
  onChange: (valeur: T) => void;
}) {
  const styles = useStyles(creerStyles);
  return (
    <View style={styles.champ}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.choixListe}>
        {options.map((option) => {
          const actif = option.valeur === valeur;

          return (
            <Pressable
              key={option.valeur}
              onPress={() => onChange(option.valeur)}
              style={[styles.choixCarte, actif && styles.choixCarteActive]}
            >
              <Text style={[styles.choixTitre, actif && styles.choixTitreActif]}>
                {option.titre}
              </Text>
              {option.note ? <Text style={styles.choixNote}>{option.note}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ──────────────────────────── Retours visuels ────────────────────────── */

export function Alerte({
  type = "erreur",
  children,
}: {
  type?: "erreur" | "succes" | "info";
  children: ReactNode;
}) {
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  // Trois teintes de la palette, plus aucun littéral : les rouges et bleus
  // écrits en dur restaient sombres sur un fond devenu sombre lui aussi.
  const palette = {
    erreur: {
      fond: couleurs.dangerClair,
      texte: couleurs.danger,
      bordure: couleurs.dangerBordure,
    },
    succes: {
      fond: couleurs.succesClair,
      texte: couleurs.succesSombre,
      bordure: couleurs.succesBordure,
    },
    info: {
      fond: couleurs.secondaireClair,
      texte: couleurs.secondaire,
      bordure: couleurs.secondaireBordure,
    },
  }[type];

  return (
    <View
      style={[styles.alerte, { backgroundColor: palette.fond, borderColor: palette.bordure }]}
    >
      <Text style={[styles.alerteTexte, { color: palette.texte }]}>{children}</Text>
    </View>
  );
}

export function Badge({
  children,
  fond,
  texte,
}: {
  children: ReactNode;
  fond?: string;
  texte?: string;
}) {
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  return (
    <View style={[styles.badge, { backgroundColor: fond ?? couleurs.surfaceDouce }]}>
      <Text
        style={[styles.badgeTexte, { color: texte ?? couleurs.texteDoux }]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </View>
  );
}

export function Chargement({ texte }: { texte?: string }) {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  return (
    <View style={styles.chargement}>
      <ActivityIndicator color={couleurs.primaire} size="large" />
      <Text style={styles.chargementTexte}>{texte ?? t("Chargement…")}</Text>
    </View>
  );
}

export function EtatVide({
  titre,
  description,
  action,
}: {
  titre: string;
  description?: string;
  action?: ReactNode;
}) {
  const styles = useStyles(creerStyles);
  return (
    <Carte style={styles.etatVide}>
      <Text style={styles.etatVideTitre}>{titre}</Text>
      {description ? <Text style={styles.etatVideDesc}>{description}</Text> : null}
      {action ? <View style={styles.etatVideAction}>{action}</View> : null}
    </Carte>
  );
}

/**
 * Tuile de statistique.
 *
 * La valeur occupe le haut à gauche, l'icône le haut à droite dans une pastille
 * teintée de la même couleur que la valeur, le libellé passe dessous. `icone`
 * est un emoji : l'application n'embarque ainsi aucune police d'icônes.
 */
export function StatCarte({
  valeur,
  libelle,
  couleur,
  icone,
  note,
  onPress,
}: {
  valeur: ReactNode;
  libelle: string;
  couleur?: string;
  icone?: string;
  note?: string;
  onPress?: () => void;
}) {
  const styles = useStyles(creerStyles);
  const couleursTheme = useCouleurs();
  const teinte = couleur ?? couleursTheme.texte;
  const contenu = (
    <>
      <View style={styles.statHaut}>
        <Text
          style={[styles.statValeur, { color: teinte }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          {valeur}
        </Text>

        {icone ? (
          <View style={[styles.statIcone, { backgroundColor: `${teinte}1A` }]}>
            <Text style={styles.statIconeTexte}>{icone}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.statLibelle}>{libelle}</Text>
      {note ? <Text style={styles.statNote}>{note}</Text> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.carte, styles.statCarte, pressed && { opacity: 0.7 }]}
      >
        {contenu}
      </Pressable>
    );
  }

  return <Carte style={styles.statCarte}>{contenu}</Carte>;
}

/** Ligne libellé / valeur d'un récapitulatif. */
export function LigneInfo({
  libelle,
  children,
  fort = false,
  couleur,
}: {
  libelle: string;
  children: ReactNode;
  fort?: boolean;
  couleur?: string;
}) {
  const styles = useStyles(creerStyles);
  return (
    <View style={[styles.ligneInfo, fort && styles.ligneInfoForte]}>
      <Text style={styles.ligneInfoLibelle}>{libelle}</Text>
      <Text
        style={[
          styles.ligneInfoValeur,
          fort && styles.ligneInfoValeurForte,
          couleur ? { color: couleur } : null,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

/**
 * Confirmation d'une action destructrice.
 *
 * Une modale maison plutôt que `Alert.alert` : le libellé des boutons et le
 * détail affiché varient d'un écran à l'autre, et l'apparence reste la même
 * sur iOS et Android.
 */
export function ModaleConfirmation({
  visible,
  titre,
  message,
  libelleConfirmer = "Confirmer",
  variante = "danger",
  enCours = false,
  onConfirmer,
  onAnnuler,
}: {
  visible: boolean;
  titre: string;
  message?: string;
  libelleConfirmer?: string;
  variante?: VarianteBouton;
  enCours?: boolean;
  onConfirmer: () => void;
  onAnnuler: () => void;
}) {
  const t = useT();
  const styles = useStyles(creerStyles);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onAnnuler}>
      <View style={styles.voileCentre}>
        <Carte style={styles.modaleCarte}>
          <Text style={styles.modaleTitre}>{titre}</Text>
          {message ? <Text style={styles.modaleMessage}>{message}</Text> : null}

          <View style={styles.modaleActions}>
            <Bouton variante="neutre" onPress={onAnnuler} style={styles.modaleBouton}>
              {t("Annuler")}
            </Bouton>
            <Bouton
              variante={variante}
              onPress={onConfirmer}
              disabled={enCours}
              style={styles.modaleBouton}
            >
              {enCours ? "…" : libelleConfirmer}
            </Bouton>
          </View>
        </Carte>
      </View>
    </Modal>
  );
}

/* ─────────────────────────────── Styles ──────────────────────────────── */

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  carte: {
    backgroundColor: couleurs.surface,
    borderRadius: rayons.xl,
    padding: espacement.lg,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    ...ombre,
  },

  titreSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: espacement.md,
    gap: espacement.sm,
  },
  titreSectionTexte: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: couleurs.texte,
  },

  bouton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    paddingHorizontal: espacement.xl,
    borderRadius: rayons.md,
  },
  boutonCompact: {
    paddingVertical: 8,
    paddingHorizontal: espacement.md,
  },
  boutonNeutre: {
    borderWidth: 1,
    borderColor: couleurs.bordureForte,
  },
  boutonPleineLargeur: {
    width: "100%",
  },
  boutonTexte: {
    fontSize: 15,
    fontWeight: "700",
  },
  boutonTexteCompact: {
    fontSize: 13,
  },

  lienTexte: {
    fontSize: 14,
    fontWeight: "600",
  },

  champ: {
    marginBottom: espacement.md,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: couleurs.texteDoux,
    marginBottom: 6,
  },
  saisie: {
    borderWidth: 1,
    borderColor: couleurs.bordureForte,
    borderRadius: rayons.md,
    paddingHorizontal: espacement.lg,
    paddingVertical: Platform.OS === "ios" ? 13 : 10,
    fontSize: 15,
    color: couleurs.texte,
    backgroundColor: couleurs.surface,
  },
  saisieMultiligne: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  saisieErreur: {
    borderColor: couleurs.danger,
  },
  aide: {
    marginTop: 5,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  aideErreur: {
    marginTop: 5,
    fontSize: 12,
    color: couleurs.danger,
  },

  selecteur: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espacement.sm,
  },
  selecteurDesactive: {
    backgroundColor: couleurs.surfaceDouce,
  },
  selecteurTexte: {
    flex: 1,
    fontSize: 15,
    color: couleurs.texte,
  },
  selecteurPlaceholder: {
    color: couleurs.texteTresFaible,
  },
  selecteurChevron: {
    fontSize: 14,
    color: couleurs.texteFaible,
  },

  voile: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  voileCentre: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: espacement.xl,
  },
  feuille: {
    backgroundColor: couleurs.surface,
    borderTopLeftRadius: rayons.xl,
    borderTopRightRadius: rayons.xl,
    paddingBottom: espacement.xl,
    maxHeight: "70%",
  },
  poignee: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: rayons.rond,
    backgroundColor: couleurs.bordureForte,
    marginTop: espacement.md,
    marginBottom: espacement.sm,
  },
  feuilleTitre: {
    fontSize: 16,
    fontWeight: "700",
    color: couleurs.texte,
    paddingHorizontal: espacement.xl,
    paddingVertical: espacement.sm,
  },
  feuilleListe: {
    paddingHorizontal: espacement.md,
  },
  feuilleVide: {
    padding: espacement.xl,
    textAlign: "center",
    color: couleurs.texteFaible,
  },
  optionLigne: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espacement.md,
    paddingVertical: espacement.md,
    paddingHorizontal: espacement.lg,
    borderRadius: rayons.md,
  },
  optionActive: {
    backgroundColor: couleurs.primaireClair,
  },
  optionTextes: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    color: couleurs.texte,
  },
  optionLabelActif: {
    fontWeight: "700",
    color: couleurs.primaireSombre,
  },
  optionNote: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteFaible,
  },
  optionCoche: {
    fontSize: 16,
    fontWeight: "700",
    color: couleurs.primaire,
  },

  choixListe: {
    gap: espacement.sm,
  },
  choixCarte: {
    borderWidth: 2,
    borderColor: couleurs.bordure,
    borderRadius: rayons.lg,
    paddingVertical: espacement.md,
    paddingHorizontal: espacement.lg,
  },
  choixCarteActive: {
    borderColor: couleurs.primaire,
    backgroundColor: couleurs.primaireClair,
  },
  choixTitre: {
    fontSize: 15,
    fontWeight: "700",
    color: couleurs.texte,
  },
  choixTitreActif: {
    color: couleurs.primaireSombre,
  },
  choixNote: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteFaible,
  },

  alerte: {
    borderWidth: 1,
    borderRadius: rayons.lg,
    paddingVertical: espacement.md,
    paddingHorizontal: espacement.lg,
    marginBottom: espacement.lg,
  },
  alerteTexte: {
    fontSize: 14,
    lineHeight: 20,
  },

  badge: {
    alignSelf: "flex-start",
    borderRadius: rayons.rond,
    paddingHorizontal: espacement.md,
    paddingVertical: 5,
  },
  badgeTexte: {
    fontSize: 12,
    fontWeight: "700",
  },

  chargement: {
    paddingVertical: 64,
    alignItems: "center",
    gap: espacement.md,
  },
  chargementTexte: {
    color: couleurs.texteFaible,
    fontSize: 14,
  },

  etatVide: {
    paddingVertical: espacement.xxl,
    alignItems: "center",
  },
  etatVideTitre: {
    fontSize: 16,
    fontWeight: "700",
    color: couleurs.texteDoux,
    textAlign: "center",
  },
  etatVideDesc: {
    marginTop: espacement.sm,
    fontSize: 14,
    color: couleurs.texteFaible,
    textAlign: "center",
    lineHeight: 20,
  },
  etatVideAction: {
    marginTop: espacement.xl,
  },

  statCarte: {
    flex: 1,
    minWidth: 150,
    padding: espacement.lg,
  },
  statHaut: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: espacement.sm,
  },
  statValeur: {
    flexShrink: 1,
    fontSize: 22,
    fontWeight: "800",
  },
  statIcone: {
    width: 30,
    height: 30,
    borderRadius: rayons.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconeTexte: {
    fontSize: 15,
  },
  statLibelle: {
    marginTop: 4,
    fontSize: 13,
    color: couleurs.texteDoux,
  },
  statNote: {
    marginTop: 6,
    fontSize: 12,
    color: couleurs.alerte,
    fontWeight: "600",
  },

  ligneInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: espacement.lg,
    paddingVertical: 7,
  },
  ligneInfoForte: {
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
    marginTop: espacement.sm,
    paddingTop: espacement.md,
  },
  ligneInfoLibelle: {
    fontSize: 14,
    color: couleurs.texteFaible,
  },
  ligneInfoValeur: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: couleurs.texte,
    textAlign: "right",
  },
  ligneInfoValeurForte: {
    fontSize: 17,
    fontWeight: "800",
  },

  modaleCarte: {
    width: "100%",
  },
  modaleTitre: {
    fontSize: 18,
    fontWeight: "700",
    color: couleurs.texte,
  },
  modaleMessage: {
    marginTop: espacement.sm,
    fontSize: 14,
    lineHeight: 20,
    color: couleurs.texteDoux,
  },
  modaleActions: {
    flexDirection: "row",
    gap: espacement.md,
    marginTop: espacement.xl,
  },
  modaleBouton: {
    flex: 1,
  },
});
