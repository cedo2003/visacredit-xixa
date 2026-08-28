/**
 * Tableau de bord — port de frontend/src/app/(app)/tableau-de-bord/page.tsx.
 *
 * Mêmes chiffres et même bandeau de rôle que le web. Cet écran porte son propre
 * en-tête (le tiroir masque le sien) : le bouton ☰ y côtoie la salutation et la
 * cloche de notifications, comme sur la maquette.
 */

import { useT } from "@/i18n";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ecran } from "@/components/Ecran";
import { Alerte, Carte, Chargement, StatCarte } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useRequete } from "@/lib/requete";
import { montant, nombre } from "@/lib/format";
import type { DashboardStats } from "@/lib/types";
import { couleurs, espacement, ombre, rayons, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

export default function TableauDeBord() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const router = useRouter();
  const navigation = useNavigation();
  const marges = useSafeAreaInsets();
  const { user } = useAuth();

  const stats = useRequete<DashboardStats>("/api/dashboard");
  const compteur = useRequete<{ non_lues: number }>("/api/notifications/non-lues");

  const d = stats.donnees;
  const estGrossiste = d?.role === "grossiste";
  const nonLues = compteur.donnees?.non_lues ?? 0;

  return (
    <View style={styles.plein}>
      {/* En-tête propre à l'accueil : ☰ + salutation + cloche */}
      <View style={[styles.entete, { paddingTop: marges.top + espacement.sm }]}>
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          hitSlop={10}
          style={styles.boutonMenu}
        >
          <Text style={styles.iconeMenu}>☰</Text>
        </Pressable>

        <View style={styles.enteteTextes}>
          <Text style={styles.salutation} numberOfLines={1}>
            Bonjour, {d?.prenom ?? ""} 👋
          </Text>
          <Text style={styles.sousTitre}>
            {estGrossiste
              ? t("Fournisseur en gros — vous recevez et validez les commandes des détaillants")
              : t("Fournisseur en détail — vous commandez chez les grossistes et vendez à vos clients")}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push("/notifications")}
          hitSlop={10}
          style={styles.boutonCloche}
        >
          <Text style={styles.iconeCloche}>🔔</Text>
          {nonLues > 0 ? (
            <View style={styles.pastille}>
              <Text style={styles.pastilleTexte}>{nonLues > 99 ? "99+" : nonLues}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {stats.chargement ? (
        <Chargement />
      ) : (
        <Ecran
          onRafraichir={() => {
            void stats.recharger();
            void compteur.recharger();
          }}
          rafraichissement={stats.rafraichissement}
        >
          {stats.erreur ? <Alerte>{stats.erreur}</Alerte> : null}

          {/*
            Rappel d'IFU : persistant tant que le champ est vide, mais non
            bloquant — une boutique déjà en activité doit pouvoir continuer
            à vendre pendant qu'elle rassemble ses papiers.
          */}
          {user?.ifu_manquant ? (
            <Pressable onPress={() => router.push("/parametres")}>
              <View style={styles.bandeauIfu}>
                <Text style={styles.bandeauIfuTitre}>{t("⚠️ IFU manquant")}</Text>
                <Text style={styles.bandeauIfuTexte}>
                  {t("Votre Identifiant Fiscal Unique est obligatoire. Appuyez ici pour le renseigner dans Paramètres.")}
                </Text>
              </View>
            </Pressable>
          ) : null}

          {d ? (
            <>
              {/*
                Le bandeau de rôle du dashboard PHP a été retiré : le tiroir
                porte déjà le nom de la boutique et l'étiquette
                Grossiste/Détaillant, et il repoussait les chiffres sous la
                ligne de flottaison.
              */}
              <View style={styles.grille}>
                <StatCarte
                  valeur={montant(d.solde)}
                  libelle={t("Solde actuel")}
                  couleur={couleurs.succes}
                  icone="💚"
                  note={
                    d.commandes_attente_paiement > 0
                      ? `+ ${d.commandes_attente_paiement} commande(s) en attente de paiement`
                      : undefined
                  }
                  onPress={() => router.push("/retraits")}
                />
                <StatCarte
                  valeur={nombre(d.total_clients)}
                  libelle={t("Clients")}
                  couleur={couleurs.secondaire}
                  icone="👥"
                  onPress={() => router.push("/clients")}
                />
              </View>

              <View style={styles.grille}>
                <StatCarte
                  valeur={montant(d.ventes_jour)}
                  libelle={t("Ventes aujourd'hui")}
                  couleur={couleurs.violet}
                  icone="📈"
                  onPress={() => router.push("/ventes")}
                />
                <StatCarte
                  valeur={nombre(d.creances_en_cours)}
                  libelle={t("Créances en cours")}
                  couleur={couleurs.attente}
                  icone="💰"
                  onPress={() => router.push("/creances")}
                />
              </View>

              <View style={styles.grille}>
                <StatCarte
                  valeur={montant(d.ventes_mois)}
                  libelle={t("Ventes du mois")}
                  couleur={couleurs.indigo}
                  icone="📊"
                  onPress={() => router.push("/ventes")}
                />
                <StatCarte
                  valeur={nombre(d.produits_alerte)}
                  libelle={t("Produits en alerte de stock")}
                  couleur={couleurs.alerte}
                  icone="⚠️"
                  onPress={() => router.push("/produits")}
                />
              </View>

              <StatCarte
                valeur={montant(d.montant_creances)}
                libelle={t("Montant total des créances")}
                couleur={couleurs.danger}
                icone="🧾"
                onPress={() => router.push("/creances")}
              />

              {/* Raccourci propre au rôle */}
              {estGrossiste ? (
                <Pressable onPress={() => router.push("/commandes")}>
                  <Carte style={styles.encartGrossiste}>
                    <View style={styles.encartLigne}>
                      <View style={styles.encartTextes}>
                        <Text style={styles.encartTitreGrossiste}>{t("📦 Commandes reçues")}</Text>
                        <Text style={styles.encartNoteGrossiste}>
                          {t("Gérer les commandes des détaillants")}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.encartChiffre}>
                          {d.commandes_attente_paiement}
                        </Text>
                        <Text style={styles.encartChiffreNote}>en attente</Text>
                      </View>
                    </View>
                  </Carte>
                </Pressable>
              ) : (
                <Pressable onPress={() => router.push("/recherche")}>
                  <Carte style={styles.encartDetaillant}>
                    <View style={styles.encartLigne}>
                      <Text style={styles.encartLoupe}>🔍</Text>
                      <View style={styles.encartTextes}>
                        <Text style={styles.encartTitreDetaillant}>
                          {t("Chercher des produits")}
                        </Text>
                        <Text style={styles.encartNoteDetaillant}>
                          {t("Trouver un grossiste et passer une commande")}
                        </Text>
                      </View>
                      <Text style={styles.encartFleche}>→</Text>
                    </View>
                  </Carte>
                </Pressable>
              )}

              <View style={styles.raccourcis}>
                <Raccourci
                  icone="👤"
                  titre={t("Nouveau client")}
                  note={t("Ajouté rapidement")}
                  onPress={() => router.push("/clients/nouveau")}
                />
                <Raccourci
                  icone="🛒"
                  titre={t("Nouvelle vente")}
                  note={t("Enregistrer une transaction")}
                  principal
                  onPress={() => router.push("/ventes/nouvelle")}
                />
                <Raccourci
                  icone="💸"
                  titre={t("Nouveau retrait")}
                  note={t("Retirer de la caisse")}
                  onPress={() => router.push("/retraits")}
                />
              </View>
            </>
          ) : null}
        </Ecran>
      )}
    </View>
  );
}

/** Tuile d'action rapide, en bas de l'accueil : icône au-dessus, textes dessous. */
function Raccourci({
  icone,
  titre,
  note,
  onPress,
  principal = false,
}: {
  icone: string;
  titre: string;
  note: string;
  onPress: () => void;
  principal?: boolean;
}) {
  const styles = useStyles(creerStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.raccourci,
        principal && styles.raccourciPrincipal,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={[styles.raccourciIcone, principal && styles.raccourciIconePrincipal]}>
        <Text style={styles.raccourciEmoji}>{icone}</Text>
      </View>

      <Text
        style={[styles.raccourciTitre, principal && styles.raccourciTitrePrincipal]}
        numberOfLines={2}
      >
        {titre}
      </Text>
      <Text
        style={[styles.raccourciNote, principal && styles.raccourciNotePrincipal]}
        numberOfLines={2}
      >
        {note}
      </Text>
    </Pressable>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  plein: {
    flex: 1,
    backgroundColor: couleurs.fond,
  },

  entete: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espacement.md,
    paddingHorizontal: espacement.lg,
    paddingBottom: espacement.md,
    backgroundColor: couleurs.surface,
    borderBottomWidth: 1,
    borderBottomColor: couleurs.bordure,
  },
  boutonMenu: {
    paddingTop: 2,
  },
  iconeMenu: {
    fontSize: 22,
    color: couleurs.texte,
  },
  enteteTextes: {
    flex: 1,
  },
  salutation: {
    fontSize: 19,
    fontWeight: "800",
    color: couleurs.texte,
  },
  sousTitre: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: couleurs.texteFaible,
  },
  boutonCloche: {
    paddingTop: 2,
  },
  iconeCloche: {
    fontSize: 21,
  },
  pastille: {
    position: "absolute",
    top: -3,
    right: -7,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
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

  bandeauIfu: {
    borderWidth: 1,
    borderColor: couleurs.alerte,
    backgroundColor: couleurs.alerteClair,
    borderRadius: rayons.lg,
    padding: espacement.md,
  },
  bandeauIfuTitre: {
    fontSize: 14,
    fontWeight: "800",
    color: couleurs.alerteSombre,
  },
  bandeauIfuTexte: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: couleurs.alerteSombre,
  },
  grille: {
    flexDirection: "row",
    gap: espacement.md,
  },

  encartGrossiste: {
    backgroundColor: couleurs.alerteClair,
    borderColor: couleurs.alerteBordure,
  },
  encartDetaillant: {
    backgroundColor: couleurs.infoClair,
    borderColor: couleurs.infoBordure,
  },
  encartLigne: {
    flexDirection: "row",
    alignItems: "center",
    gap: espacement.md,
  },
  encartLoupe: {
    fontSize: 22,
  },
  encartTextes: {
    flex: 1,
  },
  encartTitreGrossiste: {
    fontSize: 16,
    fontWeight: "800",
    color: couleurs.alerteSombre,
  },
  encartNoteGrossiste: {
    marginTop: 3,
    fontSize: 13,
    color: couleurs.alerte,
  },
  encartTitreDetaillant: {
    fontSize: 16,
    fontWeight: "800",
    color: couleurs.info,
  },
  encartNoteDetaillant: {
    marginTop: 3,
    fontSize: 13,
    color: couleurs.info,
  },
  encartChiffre: {
    fontSize: 26,
    fontWeight: "800",
    color: couleurs.alerte,
    textAlign: "right",
  },
  encartChiffreNote: {
    fontSize: 11,
    color: couleurs.alerte,
    textAlign: "right",
  },
  encartFleche: {
    fontSize: 22,
    color: couleurs.info,
  },

  raccourcis: {
    flexDirection: "row",
    gap: espacement.md,
  },
  raccourci: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    backgroundColor: couleurs.surface,
    borderRadius: rayons.xl,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    paddingVertical: espacement.lg,
    paddingHorizontal: espacement.sm,
    ...ombre,
  },
  raccourciPrincipal: {
    backgroundColor: couleurs.primaire,
    borderColor: couleurs.primaire,
  },
  raccourciIcone: {
    width: 42,
    height: 42,
    borderRadius: rayons.md,
    backgroundColor: couleurs.surfaceDouce,
    alignItems: "center",
    justifyContent: "center",
  },
  raccourciIconePrincipal: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
  },
  raccourciEmoji: {
    fontSize: 21,
  },
  raccourciTitre: {
    fontSize: 13,
    fontWeight: "700",
    color: couleurs.texte,
    textAlign: "center",
  },
  raccourciTitrePrincipal: {
    color: "#ffffff",
  },
  raccourciNote: {
    fontSize: 11,
    lineHeight: 15,
    color: couleurs.texteFaible,
    textAlign: "center",
  },
  raccourciNotePrincipal: {
    color: "#FFD9C7",
  },
});
