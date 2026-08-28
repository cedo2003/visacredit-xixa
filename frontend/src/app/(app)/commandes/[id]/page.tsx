"use client";

import { useT } from "@/lib/i18n";
import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { badgeCommande, date, dateHeure, montant } from "@/lib/format";
import type { ActionCommande, Commande, IntentionPaiement } from "@/lib/types";
import PaiementMobile from "@/components/PaiementMobile";
import ModaleNotation from "@/components/ModaleNotation";
import ChoixPasserelle from "@/components/ChoixPasserelle";
import {
  Alerte,
  Badge,
  Bouton,
  Carte,
  Champ,
  Chargement,
  TitrePage,
} from "@/components/ui";

/** Où en est chaque tour de marchandage. */
const ETIQUETTES_NEGOCIATION: Record<string, { label: string; classe: string }> = {
  en_attente: { label: "En attente de réponse", classe: "bg-amber-100 text-amber-800" },
  acceptee: { label: "Acceptée", classe: "bg-emerald-100 text-emerald-700" },
  refusee: { label: "Refusée", classe: "bg-red-100 text-red-700" },
  contre_proposee: { label: "Contre-proposée", classe: "bg-surface-forte text-doux" },
};

function etiquetteNegociation(statut: string) {
  return ETIQUETTES_NEGOCIATION[statut] ?? ETIQUETTES_NEGOCIATION.en_attente;
}

/**
 * Port de pages/commandes/show.php.
 *
 * Les boutons affichés viennent de `actions_possibles`, calculé côté API :
 * la règle de rôle et de statut n'est donc écrite qu'à un seul endroit, alors
 * qu'elle était dupliquée entre le contrôle serveur et l'affichage en PHP.
 */
export default function DetailCommande({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useT();
  const { id } = use(params);

  const [commande, setCommande] = useState<Commande | null>(null);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [action, setAction] = useState<ActionCommande | null>(null);
  const [intention, setIntention] = useState<IntentionPaiement | null>(null);
  const [notation, setNotation] = useState<"fournisseur" | "client" | null>(null);
  const [choixPasserelle, setChoixPasserelle] = useState(false);
  const [marchandageOuvert, setMarchandageOuvert] = useState(false);
  const [prixPropose, setPrixPropose] = useState("");
  const [messageMarchandage, setMessageMarchandage] = useState("");

  const charger = useCallback(async () => {
    try {
      setCommande(await api.get<Commande>(`/api/commandes/${id}`));
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Chargement impossible."));
    }
  }, [id, t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  async function executer(nom: ActionCommande, chemin: string, confirmation?: string) {
    if (confirmation && !confirm(confirmation)) return;

    setErreur("");
    setSucces("");
    setAction(nom);

    try {
      await api.post(`/api/commandes/${id}/${chemin}`);
      await charger();
      setSucces(t("Opération enregistrée."));
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Opération impossible."));
    } finally {
      setAction(null);
    }
  }

  /** Proposition de prix : le détaillant marchande, le grossiste tranche. */
  async function proposerPrix(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setSucces("");
    setAction("marchander");

    try {
      const misAJour = await api.post<Commande>(`/api/commandes/${id}/marchandage`, {
        montant: parseFloat(prixPropose) || 0,
        message: messageMarchandage,
      });

      setCommande(misAJour);
      setMarchandageOuvert(false);
      setPrixPropose("");
      setMessageMarchandage("");
      setSucces(t("Proposition envoyée. Votre interlocuteur doit maintenant se prononcer."));
    } catch (err) {
      setErreur(err instanceof Error ? t(err.message) : t("Proposition impossible."));
    } finally {
      setAction(null);
    }
  }

  async function demanderPaiement(
    passerelle: "kkiapay" | "fedapay",
    repartition: string,
  ) {
    setChoixPasserelle(false);
    setErreur("");
    setAction("demander_paiement");

    try {
      const reponse = await api.post<{ paiement: IntentionPaiement }>(
        `/api/commandes/${id}/demander-paiement`,
        { passerelle, repartition_frais: repartition },
      );
      setIntention(reponse.paiement);
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Demande impossible."));
    } finally {
      setAction(null);
    }
  }

  if (erreur && !commande) return <Alerte>{erreur}</Alerte>;
  if (!commande) return <Chargement />;

  const badge = badgeCommande(commande.statut);
  const actions = commande.actions_possibles ?? [];
  const occupe = action !== null;
  const estGrossiste = commande.mon_role === "grossiste";
  const negociations = commande.negociations ?? [];
  const enAttente = commande.negociation_en_attente ?? null;
  const peutMarchander =
    actions.includes("marchander") || actions.includes("contre_proposer");

  return (
    <div>
      <Link
        href="/commandes"
        className="mb-4 inline-block text-sm font-medium text-doux hover:underline"
      >
        {t("← Retour aux commandes")}
      </Link>

      <TitrePage
        titre={`Commande ${commande.numero_commande}`}
        sousTitre={`Passée le ${dateHeure(commande.date_commande)}`}
        action={
          <div className="flex items-center gap-3">
            <Badge classe={badge.classe}>{t(badge.label)}</Badge>
            <Link href={`/commandes/${commande.id}/recu`}>
              <Bouton variante="neutre">{t("🧾 Reçu")}</Bouton>
            </Link>
          </div>
        }
      />

      {erreur && <Alerte>{erreur}</Alerte>}
      {succes && <Alerte type="succes">{succes}</Alerte>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Carte>
            <h2 className="mb-4 text-lg font-bold">{t("Produits commandés")}</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bordure">
                  <th className="px-0">{t("Produit")}</th>
                  <th className="px-0 text-center">{t("Qté")}</th>
                  <th className="px-0 text-right">{t("P.U.")}</th>
                  <th className="px-0 text-right">{t("Montant")}</th>
                </tr>
              </thead>
              <tbody>
                {commande.lignes?.map((ligne) => (
                  <tr key={ligne.id}>
                    <td className="px-0 font-medium">{ligne.produit_nom}</td>
                    <td className="px-0 text-center">{ligne.quantite}</td>
                    <td className="px-0 text-right">{montant(ligne.prix_unitaire)}</td>
                    <td className="px-0 text-right font-semibold">
                      {montant(ligne.montant)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-bordure">
                  <td colSpan={3} className="px-0 pt-3 text-right font-bold">
                    {t("Total")}
                  </td>
                  <td className="px-0 pt-3 text-right text-lg font-bold text-titre">
                    {montant(commande.montant_total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Carte>

          {commande.mode_paiement === "credit" && (commande.echeances?.length ?? 0) > 0 && (
            <Carte>
              <h2 className="mb-4 text-lg font-bold">{t("Échéancier")}</h2>
              <ul className="space-y-2 text-sm">
                {commande.echeances?.map((echeance) => (
                  <li
                    key={echeance.id}
                    className="flex items-center justify-between rounded-2xl bg-surface-douce px-4 py-3"
                  >
                    <span>
                      Échéance {echeance.numero_echeance}/{echeance.nb_echeances_total} —{" "}
                      {date(echeance.date_limite)}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-semibold">{montant(echeance.montant)}</span>
                      <Badge
                        classe={
                          echeance.statut === "payee"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-orange-100 text-orange-700"
                        }
                      >
                        {echeance.statut === "payee" ? t("Payée") : t("En cours")}
                      </Badge>
                    </span>
                  </li>
                ))}
              </ul>
            </Carte>
          )}

          {/*
            Marchandage : le prix se discute tant que la commande est en attente.
            Le détaillant propose, le grossiste accepte ou refuse — et peut
            contre-proposer, comme au marché.
          */}
          {(peutMarchander || negociations.length > 0) && (
            <Carte>
              <h2 className="mb-4 text-lg font-bold">{t("Négociation du prix")}</h2>

              {negociations.length === 0 ? (
                <p className="text-sm text-faible">
                  {t("Le prix affiché est celui de la commande. Vous pouvez en proposer un autre : le grossiste devra l'accepter pour qu'il s'applique.")}
                </p>
              ) : (
                <ul className="space-y-3">
                  {negociations.map((negociation) => (
                    <li
                      key={negociation.id}
                      className={`rounded-2xl px-4 py-3 text-sm ${
                        negociation.statut === "acceptee"
                          ? "bg-emerald-50"
                          : negociation.statut === "refusee"
                            ? "bg-red-50"
                            : negociation.statut === "en_attente"
                              ? "bg-amber-50"
                              : "bg-surface-douce"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold">
                          {negociation.auteur?.nom_boutique ??
                            (negociation.role_auteur === "grossiste"
                              ? t("Le grossiste")
                              : t("Le détaillant"))}{" "}
                          propose {montant(negociation.montant_propose)}
                        </span>
                        <Badge classe={etiquetteNegociation(negociation.statut).classe}>
                          {t(etiquetteNegociation(negociation.statut).label)}
                        </Badge>
                      </div>

                      <p className="mt-1 text-xs text-faible">
                        {dateHeure(negociation.created_at)} · au lieu de{" "}
                        {montant(negociation.montant_initial)} (
                        {negociation.ecart_pourcent > 0 ? "+" : ""}
                        {negociation.ecart_pourcent} %)
                      </p>

                      {negociation.message && (
                        <p className="mt-2 text-sm text-corps">
                          « {negociation.message} »
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {peutMarchander && !marchandageOuvert && (
                <Bouton
                  variante="neutre"
                  className="mt-4"
                  onClick={() => {
                    setPrixPropose(String(Math.round(commande.montant_total)));
                    setMarchandageOuvert(true);
                  }}
                >
                  🤝 {actions.includes("contre_proposer") ? t("Contre-proposer") : t("Proposer un prix")}
                </Bouton>
              )}

              {peutMarchander && marchandageOuvert && (
                <form onSubmit={proposerPrix} className="mt-4 space-y-4">
                  <Champ
                    label={t("Prix proposé pour la commande entière (FCFA)")}
                    type="number"
                    min="1"
                    required
                    value={prixPropose}
                    onChange={(e) => setPrixPropose(e.target.value)}
                    aide={`Montant actuel : ${montant(commande.montant_total)}`}
                  />
                  <Champ
                    label={t("Message (optionnel)")}
                    placeholder={t("Ex : client fidèle, commande régulière…")}
                    value={messageMarchandage}
                    onChange={(e) => setMessageMarchandage(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Bouton
                      type="button"
                      variante="neutre"
                      onClick={() => setMarchandageOuvert(false)}
                    >
                      {t("Annuler")}
                    </Bouton>
                    <Bouton type="submit" disabled={occupe}>
                      {t("Envoyer la proposition")}
                    </Bouton>
                  </div>
                </form>
              )}

              {enAttente && actions.includes("accepter_prix") && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <Bouton
                    variante="succes"
                    disabled={occupe}
                    onClick={() =>
                      executer(
                        "accepter_prix",
                        "marchandage/accepter",
                        `Accepter le prix de ${montant(enAttente.montant_propose)} pour cette commande ?`,
                      )
                    }
                  >
                    ✅ Accepter {montant(enAttente.montant_propose)}
                  </Bouton>
                  <Bouton
                    variante="danger"
                    disabled={occupe}
                    onClick={() =>
                      executer(
                        "refuser_prix",
                        "marchandage/refuser",
                        t("Refuser cette proposition de prix ?"),
                      )
                    }
                  >
                    {t("✖ Refuser le prix")}
                  </Bouton>
                </div>
              )}
            </Carte>
          )}

          {actions.length > 0 && (
            <Carte>
              <h2 className="mb-4 text-lg font-bold">{t("Actions")}</h2>
              <div className="flex flex-wrap gap-3">
                {actions.includes("valider") && (
                  <Bouton
                    variante="succes"
                    disabled={occupe}
                    onClick={() =>
                      executer(
                        "valider",
                        "valider",
                        t("Valider cette commande ? Votre stock sera décrémenté et transféré au détaillant."),
                      )
                    }
                  >
                    {t("✅ Valider la commande")}
                  </Bouton>
                )}

                {actions.includes("livrer") && (
                  <Bouton
                    variante="secondaire"
                    disabled={occupe}
                    onClick={() => executer("livrer", "livrer")}
                  >
                    {t("📦 Marquer comme livrée")}
                  </Bouton>
                )}

                {actions.includes("confirmer_reception") && (
                  <Bouton
                    variante="succes"
                    disabled={occupe}
                    onClick={() =>
                      executer(
                        "confirmer_reception",
                        "reception",
                        t("Confirmer la réception des produits ?"),
                      )
                    }
                  >
                    {t("✋ J'ai reçu la commande")}
                  </Bouton>
                )}

                {actions.includes("demander_paiement") && (
                  <Bouton
                    variante="secondaire"
                    disabled={occupe}
                    onClick={() => setChoixPasserelle(true)}
                  >
                    {t("💳 Demander le paiement")}
                  </Bouton>
                )}

                {actions.includes("encaisser_especes") && (
                  <Bouton
                    disabled={occupe}
                    onClick={() =>
                      executer(
                        "encaisser_especes",
                        "encaisser-especes",
                        `Confirmer la réception de ${montant(commande.reste)} en espèces ?`,
                      )
                    }
                  >
                    {t("💵 Encaisser en espèces")}
                  </Bouton>
                )}

                {actions.includes("payer_especes") && (
                  <Bouton
                    disabled={occupe}
                    onClick={() =>
                      executer(
                        "payer_especes",
                        "payer-especes",
                        `Payer ${montant(commande.reste)} en espèces ? Une dépense sera générée.`,
                      )
                    }
                  >
                    {t("💵 Payer en espèces")}
                  </Bouton>
                )}

                {actions.includes("noter_fournisseur") && (
                  <Bouton variante="neutre" onClick={() => setNotation("fournisseur")}>
                    {t("⭐ Noter le fournisseur")}
                  </Bouton>
                )}

                {actions.includes("noter_client") && (
                  <Bouton variante="neutre" onClick={() => setNotation("client")}>
                    {t("⭐ Noter le client")}
                  </Bouton>
                )}

                {/*
                  Côté grossiste, « annuler » veut dire refuser la commande du
                  détaillant : le libellé le dit, et le rouge le distingue du
                  vert de la validation.
                */}
                {actions.includes("annuler") && (
                  <Bouton
                    variante="danger"
                    disabled={occupe}
                    onClick={() =>
                      executer(
                        "annuler",
                        "annuler",
                        estGrossiste
                          ? t("Refuser définitivement cette commande ?")
                          : t("Annuler définitivement cette commande ?"),
                      )
                    }
                  >
                    {estGrossiste ? t("✖ Refuser la commande") : t("✖ Annuler ma commande")}
                  </Bouton>
                )}
              </div>
            </Carte>
          )}
        </div>

        <div className="space-y-6 lg:col-span-1">
          <Carte>
            <h2 className="mb-4 text-lg font-bold">
              {commande.mon_role === "grossiste" ? t("Client") : t("Fournisseur")}
            </h2>
            {commande.mon_role === "grossiste" ? (
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{commande.detaillant?.nom_boutique}</p>
                <p className="text-faible">{commande.detaillant?.nom_complet}</p>
                <p className="text-faible">📞 {commande.detaillant?.telephone}</p>
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{commande.fournisseur_nom}</p>
                <p className="text-faible">📞 {commande.fournisseur_telephone}</p>
                <Badge
                  classe={
                    commande.fournisseur_sur_plateforme
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }
                >
                  {commande.fournisseur_sur_plateforme
                    ? t("Sur Visacredit XIXA")
                    : t("Fournisseur externe")}
                </Badge>
              </div>
            )}
          </Carte>

          <Carte>
            <h2 className="mb-4 text-lg font-bold">{t("Règlement")}</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-doux">{t("Mode")}</dt>
                <dd className="font-medium">
                  {commande.mode_paiement === "credit" ? t("📅 Crédit") : t("💵 Comptant")}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-doux">{t("Montant total")}</dt>
                <dd className="font-semibold">{montant(commande.montant_total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-doux">{t("Déjà payé")}</dt>
                <dd className="font-semibold text-emerald-600">
                  {montant(commande.montant_paye)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-bordure-douce pt-3">
                <dt className="text-doux">{t("Reste")}</dt>
                <dd
                  className={`text-lg font-bold ${
                    commande.reste > 0 ? "text-orange-600" : "text-emerald-600"
                  }`}
                >
                  {montant(commande.reste)}
                </dd>
              </div>
            </dl>
          </Carte>

          <Carte>
            <h2 className="mb-4 text-lg font-bold">{t("Suivi")}</h2>
            <ul className="space-y-3 text-sm">
              <Etape libelle={t("Commande passée")} valeur={dateHeure(commande.date_commande)} />
              <Etape libelle={t("Validée")} valeur={dateHeure(commande.date_validation)} />
              <Etape libelle={t("Livrée")} valeur={dateHeure(commande.date_livraison)} />
              <Etape libelle={t("Réceptionnée")} valeur={dateHeure(commande.date_reception)} />
              <Etape libelle={t("Payée")} valeur={dateHeure(commande.date_paiement)} />
            </ul>
          </Carte>
        </div>
      </div>

      {choixPasserelle && (
        <ChoixPasserelle
          titre={`Commande ${commande.numero_commande}`}
          montantDu={commande.reste}
          onValider={demanderPaiement}
          onFermer={() => setChoixPasserelle(false)}
        />
      )}

      {intention && (
        <PaiementMobile
          intention={intention}
          onSucces={async () => {
            setIntention(null);
            setSucces(t("Paiement confirmé."));
            await charger();
          }}
          onAnnuler={() => setIntention(null)}
        />
      )}

      {notation && (
        <ModaleNotation
          type={notation}
          commandeId={commande.id}
          onFermer={() => setNotation(null)}
          onEnregistre={() => {
            setNotation(null);
            setSucces(t("Votre avis a été enregistré."));
          }}
        />
      )}
    </div>
  );
}

function Etape({ libelle, valeur }: { libelle: string; valeur: string }) {
  const fait = valeur !== "—";

  return (
    <li className="flex items-start gap-3">
      <span
        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
          fait ? "bg-emerald-500" : "bg-bordure-forte"
        }`}
      />
      <span className="flex-1">
        <span className={fait ? "font-medium text-titre" : "text-estompe"}>
          {libelle}
        </span>
        <span className="block text-xs text-faible">{valeur}</span>
      </span>
    </li>
  );
}
