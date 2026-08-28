"use client";

import { useT } from "@/lib/i18n";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { montant } from "@/lib/format";
import {
  LIBELLES_REPARTITION,
  calculerFrais,
  partVendeurPourcent,
  tauxPour,
  versApi as repartitionVersApi,
  type Repartition,
} from "@/lib/frais";
import {
  PERIODICITES,
  ajouterJours,
  demain,
  echeancesDepassees,
  planifier,
  sommeEcheances as sommeDes,
  type EcheanceSaisie,
} from "@/lib/echeancier";
import type { Client, IntentionPaiement, Produit, Vente } from "@/lib/types";
import PaiementMobile from "@/components/PaiementMobile";
import {
  Alerte,
  Bouton,
  Carte,
  Champ,
  ChampSelect,
  Chargement,
  TitrePage,
} from "@/components/ui";

interface LignePanier {
  produit: Produit;
  quantite: number;
}

/**
 * Nouvelle vente — fusionne pages/ventes/create.php, save_vente.php,
 * creances_setup.php et save_creances.php.
 *
 * Le tunnel PHP passait par quatre pages reliées par $_SESSION ; ici le panier,
 * le règlement et les échéances sont saisis sur un seul écran et envoyés en une
 * requête, donc en une seule transaction côté serveur.
 */
export default function NouvelleVente() {
  const t = useT();
  const router = useRouter();

  const [produits, setProduits] = useState<Produit[] | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [panier, setPanier] = useState<LignePanier[]>([]);
  const [clientId, setClientId] = useState("");
  const [modePaiement, setModePaiement] = useState("especes");
  const [montantPaye, setMontantPaye] = useState("");
  const [telephoneClient, setTelephoneClient] = useState("");
  const [fedapayIdentifiant, setFedapayIdentifiant] = useState("");
  const [repartitionFrais, setRepartitionFrais] = useState<Repartition>("client");
  const [partVendeur, setPartVendeur] = useState("50");
  const [echeances, setEcheances] = useState<EcheanceSaisie[]>([]);
  const [nbEcheances, setNbEcheances] = useState("1");
  const [periodicite, setPeriodicite] = useState("30");
  const [premiereEcheance, setPremiereEcheance] = useState(demain());
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [intention, setIntention] = useState<IntentionPaiement | null>(null);
  const [venteCreee, setVenteCreee] = useState<Vente | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Produit[]>("/api/produits"),
      api.get<Client[]>("/api/clients"),
    ])
      .then(([p, c]) => {
        setProduits(p);
        setClients(c);
      })
      .catch((e) => setErreur(e.message));
  }, []);

  const total = useMemo(
    () => panier.reduce((s, l) => s + l.quantite * l.produit.prix_vente, 0),
    [panier],
  );

  const paye = Math.min(parseFloat(montantPaye) || 0, total);
  const reste = Math.max(0, total - paye);

  const sommeEcheances = useMemo(() => sommeDes(echeances), [echeances]);
  const enRetard = useMemo(() => echeancesDepassees(echeances), [echeances]);

  // Partage des frais de transaction. La part du vendeur est saisie librement
  // quand « personnalisé » est choisi ; les trois raccourcis restent des
  // pourcentages, ce qui donne un calcul unique quel que soit le choix.
  const part = partVendeurPourcent(repartitionFrais, parseInt(partVendeur, 10) || 0);
  const frais = calculerFrais(paye, tauxPour(modePaiement), part);
  const fraisApplicables = modePaiement !== "especes" && paye > 0;

  // Un reste à payer impose de définir un échéancier, comme dans creances_setup.php.
  // Il est amorcé au plan par défaut : une échéance, dans un mois.
  useEffect(() => {
    if (reste > 0 && echeances.length === 0) {
      setEcheances([{ montant: String(Math.round(reste)), date_limite: ajouterJours(demain(), 29) }]);
    }
    if (reste <= 0 && echeances.length > 0) {
      setEcheances([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reste > 0]);

  function appliquerPlan() {
    setEcheances(
      planifier(reste, parseInt(nbEcheances, 10) || 1, parseInt(periodicite, 10) || 30, premiereEcheance),
    );
  }

  function ajouterProduit(id: string) {
    const produit = produits?.find((p) => p.id === parseInt(id, 10));
    if (!produit) return;

    setPanier((p) => {
      const existante = p.find((l) => l.produit.id === produit.id);
      if (existante) {
        return p.map((l) =>
          l.produit.id === produit.id
            ? { ...l, quantite: Math.min(l.quantite + 1, produit.stock) }
            : l,
        );
      }
      return [...p, { produit, quantite: 1 }];
    });
  }

  function changerQuantite(produitId: number, quantite: number) {
    setPanier((p) =>
      p.map((l) =>
        l.produit.id === produitId
          ? { ...l, quantite: Math.max(1, Math.min(quantite, l.produit.stock)) }
          : l,
      ),
    );
  }

  function retirer(produitId: number) {
    setPanier((p) => p.filter((l) => l.produit.id !== produitId));
  }

  function majEcheance(index: number, champ: keyof EcheanceSaisie, valeur: string) {
    setEcheances((liste) =>
      liste.map((e, i) => (i === index ? { ...e, [champ]: valeur } : e)),
    );
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");

    if (panier.length === 0) {
      setErreur(t("Ajoutez au moins un produit."));
      return;
    }
    if (reste > 0 && Math.abs(sommeEcheances - reste) > 1) {
      setErreur(
        `La somme des échéances (${montant(sommeEcheances)}) ne correspond pas au reste à payer (${montant(reste)}).`,
      );
      return;
    }
    if (enRetard > 0) {
      setErreur(
        t("Une échéance est datée dans le passé : un paiement se planifie à une date à venir."),
      );
      return;
    }

    setEnvoi(true);

    try {
      const reponse = await api.post<{
        vente: Vente;
        paiement: IntentionPaiement | null;
      }>("/api/ventes", {
        client_id: clientId ? parseInt(clientId, 10) : null,
        montant_paye: paye,
        mode_paiement: modePaiement,
        telephone_client: telephoneClient,
        fedapay_identifiant: fedapayIdentifiant,
        repartition_frais: repartitionVersApi(repartitionFrais, part),
        lignes: panier.map((l) => ({
          produit_id: l.produit.id,
          quantite: l.quantite,
        })),
        echeances: echeances.map((ech) => ({
          montant: parseFloat(ech.montant) || 0,
          date_limite: ech.date_limite,
        })),
      });

      setVenteCreee(reponse.vente);

      if (reponse.paiement) {
        setIntention(reponse.paiement);
      } else {
        router.push(`/ventes/${reponse.vente.id}`);
      }
    } catch (err) {
      setErreur(err instanceof Error ? t(err.message) : t("Enregistrement impossible."));
    } finally {
      setEnvoi(false);
    }
  }

  if (!produits) return <Chargement />;

  const disponibles = produits.filter((p) => p.stock > 0);

  return (
    <div>
      <TitrePage titre={t("Nouvelle vente")} sousTitre={t("Enregistrez une transaction")} />

      {erreur && <Alerte>{erreur}</Alerte>}

      <form onSubmit={soumettre} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Carte>
            <h2 className="mb-4 text-lg font-bold">{t("Produits")}</h2>

            {disponibles.length === 0 ? (
              <Alerte type="info">
                {t("Aucun produit en stock. Ajoutez du stock avant d'enregistrer une vente.")}
              </Alerte>
            ) : (
              <ChampSelect
                label={t("Ajouter un produit")}
                value=""
                onChange={(e) => e.target.value && ajouterProduit(e.target.value)}
              >
                <option value="">{t("Choisir un produit…")}</option>
                {disponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} — {montant(p.prix_vente)} ({p.stock} en stock)
                  </option>
                ))}
              </ChampSelect>
            )}

            {panier.length > 0 && (
              <div className="mt-5 space-y-3">
                {panier.map((ligne) => (
                  <div
                    key={ligne.produit.id}
                    className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface-douce p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{ligne.produit.nom}</p>
                      <p className="text-xs text-faible">
                        {montant(ligne.produit.prix_vente)} · stock {ligne.produit.stock}
                      </p>
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={ligne.produit.stock}
                      value={ligne.quantite}
                      onChange={(e) =>
                        changerQuantite(ligne.produit.id, parseInt(e.target.value, 10) || 1)
                      }
                      className="w-20 rounded-xl border border-bordure-forte px-3 py-1.5 text-sm"
                    />
                    <div className="w-28 text-right text-sm font-semibold">
                      {montant(ligne.quantite * ligne.produit.prix_vente)}
                    </div>
                    <button
                      type="button"
                      onClick={() => retirer(ligne.produit.id)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      {t("Retirer")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Carte>

          <Carte>
            <h2 className="mb-4 text-lg font-bold">{t("Règlement")}</h2>

            <div className="space-y-4">
              <ChampSelect
                label={t("Client (optionnel)")}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">{t("Client de passage")}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom_complet} — {c.telephone}
                  </option>
                ))}
              </ChampSelect>

              <ChampSelect
                label={t("Mode de paiement")}
                value={modePaiement}
                onChange={(e) => setModePaiement(e.target.value)}
              >
                <option value="especes">{t("💵 Espèces")}</option>
                <option value="mobile_money">{t("📱 Mobile Money (KkiaPay)")}</option>
                <option value="fedapay">{t("💳 Agrégateur")}</option>
              </ChampSelect>

              <Champ
                label={t("Montant payé (FCFA)")}
                type="number"
                min="0"
                max={total}
                step="1"
                value={montantPaye}
                onChange={(e) => setMontantPaye(e.target.value)}
                aide={`Total : ${montant(total)} — laissez à 0 pour une vente entièrement à crédit`}
              />

              {modePaiement === "mobile_money" && paye > 0 && (
                <Champ
                  label={t("Numéro Mobile Money du client")}
                  type="tel"
                  required
                  value={telephoneClient}
                  onChange={(e) => setTelephoneClient(e.target.value)}
                />
              )}

              {modePaiement === "fedapay" && paye > 0 && (
                <Champ
                  label={t("Téléphone ou email de l'agrégateur")}
                  required
                  value={fedapayIdentifiant}
                  onChange={(e) => setFedapayIdentifiant(e.target.value)}
                />
              )}

              {fraisApplicables && (
                <div className="space-y-4 rounded-2xl bg-surface-douce p-4">
                  <ChampSelect
                    label={t("Partage des frais de transaction")}
                    value={repartitionFrais}
                    onChange={(e) => setRepartitionFrais(e.target.value as Repartition)}
                  >
                    {(Object.keys(LIBELLES_REPARTITION) as Repartition[]).map((cle) => (
                      <option key={cle} value={cle}>
                        {t(LIBELLES_REPARTITION[cle])}
                      </option>
                    ))}
                  </ChampSelect>

                  {repartitionFrais === "personnalise" && (
                    <div>
                      <span className="mb-1.5 block text-sm font-medium text-corps">
                        Part à ma charge : {part} % — part du client : {100 - part} %
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={partVendeur}
                        onChange={(e) => setPartVendeur(e.target.value)}
                        className="w-full accent-marque-600"
                      />
                    </div>
                  )}

                  <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-doux">
                        Frais de la passerelle ({(tauxPour(modePaiement) * 100).toFixed(1)} %)
                      </dt>
                      <dd className="font-medium">{montant(frais.fraisTotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-doux">{t("À la charge du client")}</dt>
                      <dd className="font-medium">{montant(frais.fraisClient)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-doux">{t("À ma charge")}</dt>
                      <dd className="font-medium text-orange-600">
                        {montant(frais.fraisVendeur)}
                      </dd>
                    </div>
                    <div className="flex justify-between border-t border-bordure pt-1.5">
                      <dt className="text-doux">{t("Le client est débité de")}</dt>
                      <dd className="font-semibold">{montant(frais.montantWidget)}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </Carte>

          {reste > 0 && (
            <Carte>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">{t("Paiements à venir")}</h2>
                <Bouton
                  type="button"
                  variante="neutre"
                  onClick={() =>
                    setEcheances((l) => [
                      ...l,
                      {
                        montant: "",
                        date_limite: ajouterJours(
                          l[l.length - 1]?.date_limite ?? demain(),
                          parseInt(periodicite, 10) || 30,
                        ),
                      },
                    ])
                  }
                >
                  {t("+ Ajouter")}
                </Bouton>
              </div>

              {/*
                Planificateur : la saisie courante est « en N fois, tous les X
                jours ». Le détail reste modifiable ligne par ligne dessous, pour
                les arrangements qui ne tombent pas rond.
              */}
              <div className="mb-5 rounded-2xl bg-surface-douce p-4">
                <p className="mb-3 text-sm font-semibold text-corps">
                  {t("Planifier automatiquement")}
                </p>

                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[110px] flex-1">
                    <Champ
                      label={t("Nombre de fois")}
                      type="number"
                      min="1"
                      max="36"
                      value={nbEcheances}
                      onChange={(e) => setNbEcheances(e.target.value)}
                    />
                  </div>
                  <div className="min-w-[160px] flex-1">
                    <ChampSelect
                      label={t("Rythme")}
                      value={periodicite}
                      onChange={(e) => setPeriodicite(e.target.value)}
                    >
                      {PERIODICITES.map((p) => (
                        <option key={p.valeur} value={p.valeur}>
                          {p.label}
                        </option>
                      ))}
                    </ChampSelect>
                  </div>
                  <div className="min-w-[160px] flex-1">
                    <Champ
                      label={t("Premier paiement")}
                      type="date"
                      min={demain()}
                      value={premiereEcheance}
                      onChange={(e) => setPremiereEcheance(e.target.value)}
                    />
                  </div>
                  <Bouton type="button" variante="secondaire" onClick={appliquerPlan}>
                    {t("Générer le plan")}
                  </Bouton>
                </div>
              </div>

              <div className="space-y-3">
                {echeances.map((echeance, index) => (
                  <div key={index} className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[140px] flex-1">
                      <Champ
                        label={`Échéance ${index + 1} — montant`}
                        type="number"
                        min="0"
                        value={echeance.montant}
                        onChange={(e) => majEcheance(index, "montant", e.target.value)}
                      />
                    </div>
                    <div className="min-w-[160px] flex-1">
                      <Champ
                        label={t("Date de paiement")}
                        type="date"
                        min={demain()}
                        value={echeance.date_limite}
                        onChange={(e) => majEcheance(index, "date_limite", e.target.value)}
                      />
                    </div>
                    {echeances.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setEcheances((l) => l.filter((_, i) => i !== index))
                        }
                        className="pb-2.5 text-sm font-medium text-red-600 hover:underline"
                      >
                        {t("Retirer")}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p
                className={`mt-4 text-sm ${
                  Math.abs(sommeEcheances - reste) > 1 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                Somme des échéances : {montant(sommeEcheances)} — reste à couvrir :{" "}
                {montant(reste)}
              </p>

              {enRetard > 0 && (
                <p className="mt-1 text-sm text-red-600">
                  {enRetard === 1
                    ? t("Une échéance est datée dans le passé.")
                    : `${enRetard} échéances sont datées dans le passé.`}{" "}
                  Un paiement se planifie à une date à venir.
                </p>
              )}
            </Carte>
          )}
        </div>

        <div className="lg:col-span-1">
          <Carte className="lg:sticky lg:top-8">
            <h2 className="mb-4 text-lg font-bold">{t("Récapitulatif")}</h2>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-doux">{t("Articles")}</dt>
                <dd className="font-medium">{panier.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-doux">{t("Total")}</dt>
                <dd className="font-semibold">{montant(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-doux">{t("Payé")}</dt>
                <dd className="font-semibold text-emerald-600">{montant(paye)}</dd>
              </div>
              {fraisApplicables && (
                <div className="flex justify-between">
                  <dt className="text-doux">{t("Frais à ma charge")}</dt>
                  <dd className="font-semibold text-orange-600">
                    {montant(frais.fraisVendeur)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between border-t border-bordure-douce pt-3">
                <dt className="text-doux">{t("Reste à payer")}</dt>
                <dd
                  className={`text-lg font-bold ${
                    reste > 0 ? "text-orange-600" : "text-emerald-600"
                  }`}
                >
                  {montant(reste)}
                </dd>
              </div>
            </dl>

            <Bouton
              type="submit"
              disabled={envoi || panier.length === 0}
              className="mt-6 w-full py-3.5"
            >
              {envoi ? t("Enregistrement…") : t("Enregistrer la vente")}
            </Bouton>
          </Carte>
        </div>
      </form>

      {intention && venteCreee && (
        <PaiementMobile
          intention={intention}
          onSucces={() => router.push(`/ventes/${venteCreee.id}`)}
          onAnnuler={() => router.push(`/ventes/${venteCreee.id}`)}
        />
      )}
    </div>
  );
}
