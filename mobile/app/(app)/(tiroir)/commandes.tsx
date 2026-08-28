/**
 * Commandes B2B — port de frontend/src/app/(app)/commandes/page.tsx.
 *
 * Le même écran sert aux deux rôles : le détaillant y suit les commandes qu'il
 * a passées, le grossiste celles qu'il a reçues. L'API renvoie `role` avec la
 * liste, ce qui évite de rejouer la logique de rôle côté client.
 */

import { useT } from "@/i18n";
import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BoutonFlottant, Ecran } from "@/components/Ecran";
import { Alerte, Badge, Bouton, Carte, Chargement, EtatVide } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { useRequete } from "@/lib/requete";
import { badgeCommande, date, montant } from "@/lib/format";
import type { Commande, Role } from "@/lib/types";
import { espacement, rayons, type Palette } from "@/theme";
import { useCouleurs, useStyles } from "@/theme-contexte";

interface Reponse {
  commandes: Commande[];
  stats: Record<string, number>;
  role: Role;
}

const FILTRES: { valeur: string; label: string }[] = [
  { valeur: "", label: "Toutes" },
  { valeur: "en_attente", label: "En attente" },
  { valeur: "validee", label: "Validées" },
  { valeur: "livree", label: "Livrées" },
  { valeur: "en_attente_paiement", label: "À payer" },
  { valeur: "payee", label: "Payées" },
  { valeur: "annulee", label: "Annulées" },
];

export default function Commandes() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const router = useRouter();
  const { estDetaillant } = useAuth();

  const [filtre, setFiltre] = useState("");

  const { donnees, chargement, rafraichissement, erreur, recharger } =
    useRequete<Reponse>("/api/commandes");

  const commandes = useMemo(() => {
    const liste = donnees?.commandes ?? [];
    return filtre ? liste.filter((c) => c.statut === filtre) : liste;
  }, [donnees, filtre]);

  const total = donnees?.commandes.length ?? 0;

  return (
    <>
      <Ecran
        titre={estDetaillant ? t("Mes commandes") : t("Commandes reçues")}
        sousTitre={
          estDetaillant
            ? t("Approvisionnements auprès de vos fournisseurs")
            : t("Commandes passées par vos clients détaillants")
        }
        onRafraichir={recharger}
        rafraichissement={rafraichissement}
      >

        {erreur ? <Alerte>{erreur}</Alerte> : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtres}
        >
          {FILTRES.map((option) => {
            const actif = option.valeur === filtre;
            const compte = option.valeur
              ? (donnees?.stats?.[option.valeur] ?? 0)
              : total;

            return (
              <Pressable
                key={option.valeur || "toutes"}
                onPress={() => setFiltre(option.valeur)}
                style={[styles.filtre, actif && styles.filtreActif]}
              >
                <Text style={[styles.filtreTexte, actif && styles.filtreTexteActif]}>
                  {option.label}
                  {compte > 0 ? ` (${compte})` : ""}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {chargement ? (
          <Chargement />
        ) : commandes.length === 0 ? (
          <EtatVide
            titre={filtre ? t("Aucune commande dans ce statut") : t("Aucune commande")}
            description={
              estDetaillant
                ? t("Passez une commande auprès d'un grossiste, inscrit ou non sur Visacredit XIXA.")
                : t("Les commandes de vos clients détaillants apparaîtront ici.")
            }
            action={
              estDetaillant && !filtre ? (
                <Bouton onPress={() => router.push("/commandes/nouvelle")}>
                  {t("Nouvelle commande")}
                </Bouton>
              ) : undefined
            }
          />
        ) : (
          commandes.map((commande) => {
            const badge = badgeCommande(commande.statut, couleurs);
            const partenaire = estDetaillant
              ? (commande.fournisseur_nom ?? commande.fournisseur_telephone)
              : (commande.detaillant?.nom_boutique ?? "Détaillant");

            return (
              <Pressable
                key={commande.id}
                onPress={() => router.push(`/commandes/${commande.id}`)}
              >
                {({ pressed }) => (
                  <Carte style={pressed ? styles.cartePressee : undefined}>
                    <View style={styles.ligne}>
                      <View style={styles.textes}>
                        <Text style={styles.numero}>{commande.numero_commande}</Text>
                        <Text style={styles.partenaire} numberOfLines={1}>
                          {estDetaillant ? t("Chez ") : t("De ")}
                          {partenaire}
                        </Text>
                        <Text style={styles.dateCommande}>
                          {date(commande.date_commande)} ·{" "}
                          {commande.mode_paiement === "credit" ? t("À crédit") : t("Comptant")}
                        </Text>
                      </View>

                      <View style={styles.droite}>
                        <Text style={styles.montant}>{montant(commande.montant_total)}</Text>
                        <Badge fond={badge.fond} texte={badge.texte}>
                          {t(badge.label)}
                        </Badge>
                      </View>
                    </View>

                    {commande.reste > 0 && commande.statut !== "annulee" ? (
                      <Text style={styles.reste}>
                        Reste à payer : {montant(commande.reste)}
                      </Text>
                    ) : null}
                  </Carte>
                )}
              </Pressable>
            );
          })
        )}
      </Ecran>

      {estDetaillant ? (
        <BoutonFlottant onPress={() => router.push("/commandes/nouvelle")} />
      ) : null}
    </>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  cartePressee: {
    opacity: 0.7,
  },
  filtres: {
    gap: espacement.sm,
    paddingVertical: espacement.xs,
  },
  filtre: {
    paddingHorizontal: espacement.lg,
    paddingVertical: 8,
    borderRadius: rayons.rond,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.surface,
  },
  filtreActif: {
    backgroundColor: couleurs.primaire,
    borderColor: couleurs.primaire,
  },
  filtreTexte: {
    fontSize: 13,
    fontWeight: "600",
    color: couleurs.texteDoux,
  },
  filtreTexteActif: {
    color: "#ffffff",
  },
  ligne: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espacement.md,
  },
  textes: {
    flex: 1,
  },
  numero: {
    fontSize: 15,
    fontWeight: "700",
    color: couleurs.texte,
  },
  partenaire: {
    marginTop: 2,
    fontSize: 13,
    color: couleurs.texteDoux,
  },
  dateCommande: {
    marginTop: 2,
    fontSize: 12,
    color: couleurs.texteTresFaible,
  },
  droite: {
    alignItems: "flex-end",
    gap: 5,
    maxWidth: "45%",
  },
  montant: {
    fontSize: 16,
    fontWeight: "800",
    color: couleurs.texte,
  },
  reste: {
    marginTop: espacement.md,
    paddingTop: espacement.sm,
    borderTopWidth: 1,
    borderTopColor: couleurs.bordure,
    fontSize: 13,
    fontWeight: "600",
    color: couleurs.attente,
  },
});
