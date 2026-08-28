"use client";

import { useT } from "@/lib/i18n";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { date, libelleReglement, montant } from "@/lib/format";
import type { CreditFournisseur, IntentionPaiement, Role } from "@/lib/types";
import PaiementMobile from "@/components/PaiementMobile";
import ChoixPasserelle from "@/components/ChoixPasserelle";
import {
  Alerte,
  Badge,
  Bouton,
  Chargement,
  EtatVide,
  StatCarte,
  Tableau,
  TitrePage,
} from "@/components/ui";

interface Reponse {
  role: Role;
  en_attente: CreditFournisseur[];
  payes?: CreditFournisseur[];
  payees?: CreditFournisseur[];
  total_du?: number;
  total_a_encaisser?: number;
  solde?: number;
  solde_suffisant?: boolean;
}

/**
 * Port de pages/credits/credits_fournisseurs.php.
 * Deux lectures d'une même table selon le rôle : dettes côté détaillant,
 * créances à encaisser côté grossiste.
 */
export default function Credits() {
  const t = useT();
  const [donnees, setDonnees] = useState<Reponse | null>(null);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [enCours, setEnCours] = useState<number | null>(null);
  const [aReclamer, setAReclamer] = useState<CreditFournisseur | null>(null);
  const [intention, setIntention] = useState<IntentionPaiement | null>(null);

  const charger = useCallback(async () => {
    try {
      setDonnees(await api.get<Reponse>("/api/credits"));
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Chargement impossible."));
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  async function payer(credit: CreditFournisseur, moyen: "especes" | "solde") {
    const question =
      moyen === "especes"
        ? `Marquer ce crédit de ${montant(credit.montant_total)} comme payé en espèces ? Une dépense sera générée.`
        : `Payer ${montant(credit.montant_total)} depuis votre solde ?`;

    if (!confirm(question)) return;

    setErreur("");
    setSucces("");
    setEnCours(credit.id);

    try {
      const reponse = await api.post<{ solde: number }>(
        `/api/credits/${credit.id}/payer-${moyen}`,
      );
      setSucces(
        moyen === "solde"
          ? `Crédit payé. Nouveau solde : ${montant(reponse.solde)}.`
          : t("Crédit soldé en espèces. La dépense correspondante a été générée."),
      );
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Paiement impossible."));
    } finally {
      setEnCours(null);
    }
  }

  /**
   * Le grossiste réclame le règlement : le widget cible le téléphone du
   * détaillant, qui confirme depuis son mobile (ancien payer_credit_kkiapay.php).
   */
  async function reclamer(
    credit: CreditFournisseur,
    passerelle: "kkiapay" | "fedapay",
    repartition: string,
  ) {
    setAReclamer(null);
    setErreur("");
    setEnCours(credit.id);

    try {
      const reponse = await api.post<{ paiement: IntentionPaiement }>(
        `/api/credits/${credit.id}/demander-paiement`,
        { passerelle, repartition_frais: repartition },
      );
      setIntention(reponse.paiement);
    } catch (e) {
      setErreur(e instanceof Error ? t(e.message) : t("Demande impossible."));
    } finally {
      setEnCours(null);
    }
  }

  if (erreur && !donnees) return <Alerte>{erreur}</Alerte>;
  if (!donnees) return <Chargement />;

  const estGrossiste = donnees.role === "grossiste";
  const soldes = donnees.payes ?? donnees.payees ?? [];

  return (
    <div>
      <TitrePage
        titre={estGrossiste ? t("Créances fournisseurs") : t("Mes crédits fournisseurs")}
        sousTitre={
          estGrossiste
            ? t("Crédits à encaisser auprès des détaillants")
            : t("Crédits à payer à vos fournisseurs")
        }
      />

      {erreur && <Alerte>{erreur}</Alerte>}
      {succes && <Alerte type="succes">{succes}</Alerte>}

      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <StatCarte
          valeur={montant(
            estGrossiste ? (donnees.total_a_encaisser ?? 0) : (donnees.total_du ?? 0),
          )}
          libelle={estGrossiste ? t("Total à encaisser") : t("Total dû")}
          couleur="text-orange-600"
        />
        {!estGrossiste && (
          <StatCarte
            valeur={montant(donnees.solde ?? 0)}
            libelle={t("Solde disponible")}
            couleur={donnees.solde_suffisant ? "text-emerald-600" : "text-red-600"}
            note={
              donnees.solde_suffisant
                ? t("Suffisant pour tous vos crédits")
                : `Insuffisant de ${montant((donnees.total_du ?? 0) - (donnees.solde ?? 0))}`
            }
          />
        )}
      </div>

      {donnees.en_attente.length === 0 ? (
        <EtatVide
          titre={estGrossiste ? t("Aucune créance en attente") : t("Aucun crédit en cours")}
          description={
            estGrossiste
              ? t("Aucun détaillant ne vous doit de marchandise à crédit.")
              : t("Vous n'avez aucune dette fournisseur en cours.")
          }
        />
      ) : (
        <Tableau>
          <thead className="bg-surface-douce">
            <tr>
              <th>{t("Produit")}</th>
              <th>{estGrossiste ? t("Détaillant") : t("Fournisseur")}</th>
              <th className="text-center">{t("Qté")}</th>
              <th className="text-right">{t("Montant")}</th>
              <th>{t("Date")}</th>
              <th className="text-right">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {donnees.en_attente.map((credit) => (
              <tr key={credit.id}>
                <td className="font-medium text-titre">{credit.produit_nom}</td>
                <td>
                  {estGrossiste ? (
                    <>
                      <div className="font-medium">{credit.acheteur?.nom_boutique}</div>
                      <div className="text-xs text-faible">
                        {credit.acheteur?.nom_complet}
                      </div>
                      {credit.acheteur && (
                        <Link
                          href={`/notations/client/${credit.acheteur.id}`}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          {t("Voir ses avis →")}
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="font-medium">{credit.fournisseur_nom ?? "—"}</div>
                      <div className="text-xs text-faible">
                        {credit.fournisseur_telephone}
                      </div>
                      {credit.origine_commande ? (
                        <Badge classe="mt-1 bg-emerald-100 text-emerald-700">
                          Cmd #{credit.origine_commande}
                        </Badge>
                      ) : (
                        <Badge classe="mt-1 bg-surface-forte text-doux">{t("Crédit manuel")}</Badge>
                      )}
                    </>
                  )}
                </td>
                <td className="text-center">{credit.quantite} u.</td>
                <td className="text-right font-bold text-orange-600">
                  {montant(credit.montant_total)}
                </td>
                <td className="text-faible">{date(credit.date_appro)}</td>
                {estGrossiste ? (
                  <td>
                    <div className="flex justify-end">
                      <Bouton
                        variante="secondaire"
                        disabled={enCours === credit.id}
                        onClick={() => setAReclamer(credit)}
                      >
                        {t("💳 Demander paiement")}
                      </Bouton>
                    </div>
                  </td>
                ) : (
                  <td>
                    <div className="flex justify-end gap-2">
                      <Bouton
                        variante="neutre"
                        disabled={enCours === credit.id}
                        onClick={() => payer(credit, "especes")}
                      >
                        {t("Espèces")}
                      </Bouton>
                      <Bouton
                        disabled={
                          enCours === credit.id ||
                          (donnees.solde ?? 0) < credit.montant_total
                        }
                        onClick={() => payer(credit, "solde")}
                        title={
                          (donnees.solde ?? 0) < credit.montant_total
                            ? "Solde insuffisant"
                            : undefined
                        }
                      >
                        {t("Solde")}
                      </Bouton>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Tableau>
      )}

      {soldes.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-corps">
            {estGrossiste ? t("Créances encaissées") : t("Crédits soldés")} ({soldes.length})
          </h2>
          <Tableau>
            <thead className="bg-surface-douce">
              <tr>
                <th>{t("Produit")}</th>
                <th>{estGrossiste ? t("Détaillant") : t("Fournisseur")}</th>
                <th className="text-right">{t("Montant")}</th>
                <th>{t("Règlement")}</th>
                <th>{t("Date")}</th>
              </tr>
            </thead>
            <tbody>
              {soldes.map((credit) => (
                <tr key={credit.id} className="opacity-70">
                  <td className="font-medium">{credit.produit_nom}</td>
                  <td className="text-sm text-faible">
                    {estGrossiste
                      ? credit.acheteur?.nom_boutique
                      : (credit.fournisseur_nom ?? "—")}
                  </td>
                  <td className="text-right font-bold text-accent">
                    {montant(credit.montant_total)}
                  </td>
                  <td>
                    <Badge classe="bg-emerald-100 text-emerald-700">
                      {t(libelleReglement(credit.moyen_reglement))}
                    </Badge>
                  </td>
                  <td className="text-faible">{date(credit.date_appro)}</td>
                </tr>
              ))}
            </tbody>
          </Tableau>
        </div>
      )}

      {aReclamer && (
        <ChoixPasserelle
          titre={`${aReclamer.produit_nom} — ${aReclamer.acheteur?.nom_boutique ?? t("détaillant")}`}
          montantDu={aReclamer.montant_total}
          onValider={(passerelle, repartition) =>
            void reclamer(aReclamer, passerelle, repartition)
          }
          onFermer={() => setAReclamer(null)}
        />
      )}

      {intention && (
        <PaiementMobile
          intention={intention}
          onSucces={async () => {
            setIntention(null);
            setSucces(t("Paiement confirmé : la créance est encaissée."));
            await charger();
          }}
          onAnnuler={() => setIntention(null)}
        />
      )}
    </div>
  );
}
