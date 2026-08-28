"use client";

import { useT } from "@/lib/i18n";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { aujourdHui, montant } from "@/lib/format";
import type { Commande } from "@/lib/types";
import {
  Alerte,
  Bouton,
  Carte,
  Champ,
  Chargement,
  TitrePage,
} from "@/components/ui";

interface LigneCommande {
  nom: string;
  quantite: string;
  prix_unitaire: string;
}

interface EcheanceSaisie {
  montant: string;
  date_limite: string;
}

interface VerificationFournisseur {
  trouve: boolean;
  id: number | null;
  nom_boutique: string;
  telephone: string;
}

/**
 * Port de pages/commandes/create.php.
 *
 * Les quatre étapes de l'original (fournisseur → mode → produits → confirmation)
 * étaient reliées par $_SESSION['temp_commande'] ; elles tiennent ici sur un
 * seul écran et partent en une requête. Plus de commande à moitié créée si la
 * session expire au milieu du tunnel.
 */
export default function NouvelleCommandePage() {
  return (
    <Suspense fallback={<Chargement />}>
      <NouvelleCommande />
    </Suspense>
  );
}

function NouvelleCommande() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();

  const [telephone, setTelephone] = useState(params.get("telephone") ?? "");
  const [fournisseur, setFournisseur] = useState<VerificationFournisseur | null>(null);
  const [modePaiement, setModePaiement] = useState<"comptant" | "credit">("comptant");
  const [notes, setNotes] = useState("");
  const [lignes, setLignes] = useState<LigneCommande[]>([
    {
      nom: params.get("produit") ?? "",
      quantite: "1",
      prix_unitaire: params.get("prix") ?? "",
    },
  ]);
  const [echeances, setEcheances] = useState<EcheanceSaisie[]>([]);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  // Vérification du fournisseur à la volée (ancien check_grossiste.php).
  useEffect(() => {
    const tel = telephone.replace(/\D/g, "");
    if (tel.length < 8) {
      setFournisseur(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setFournisseur(
          await api.post<VerificationFournisseur>("/api/commandes/verifier-fournisseur", {
            telephone: tel,
          }),
        );
      } catch {
        setFournisseur(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [telephone]);

  const total = useMemo(
    () =>
      lignes.reduce(
        (s, l) => s + (parseInt(l.quantite, 10) || 0) * (parseFloat(l.prix_unitaire) || 0),
        0,
      ),
    [lignes],
  );

  const sommeEcheances = useMemo(
    () => echeances.reduce((s, e) => s + (parseFloat(e.montant) || 0), 0),
    [echeances],
  );

  // Le crédit impose un échéancier : l'API refuse la commande sans lui.
  useEffect(() => {
    if (modePaiement === "credit" && echeances.length === 0) {
      setEcheances([{ montant: String(Math.round(total)), date_limite: aujourdHui() }]);
    }
    if (modePaiement === "comptant") {
      setEcheances([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modePaiement]);

  function majLigne(index: number, champ: keyof LigneCommande, valeur: string) {
    setLignes((l) => l.map((x, i) => (i === index ? { ...x, [champ]: valeur } : x)));
  }

  function majEcheance(index: number, champ: keyof EcheanceSaisie, valeur: string) {
    setEcheances((l) => l.map((x, i) => (i === index ? { ...x, [champ]: valeur } : x)));
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");

    const lignesValides = lignes.filter(
      (l) => l.nom.trim() && parseInt(l.quantite, 10) > 0 && parseFloat(l.prix_unitaire) > 0,
    );

    if (lignesValides.length === 0) {
      setErreur(t("Ajoutez au moins un produit avec une quantité et un prix valides."));
      return;
    }
    if (modePaiement === "credit" && Math.abs(sommeEcheances - total) > 1) {
      setErreur(
        `Le total des échéances (${montant(sommeEcheances)}) ne correspond pas au montant de la commande (${montant(total)}).`,
      );
      return;
    }

    setEnvoi(true);

    try {
      const commande = await api.post<Commande>("/api/commandes", {
        fournisseur_telephone: telephone,
        mode_paiement: modePaiement,
        notes,
        produits: lignesValides.map((l) => ({
          nom: l.nom.trim(),
          quantite: parseInt(l.quantite, 10),
          prix_unitaire: parseFloat(l.prix_unitaire),
        })),
        echeances: echeances.map((ech) => ({
          montant: parseFloat(ech.montant) || 0,
          date_limite: ech.date_limite,
        })),
      });

      router.push(`/commandes/${commande.id}`);
    } catch (err) {
      setErreur(err instanceof Error ? t(err.message) : t("Création impossible."));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div>
      <TitrePage
        titre={t("Nouvelle commande")}
        sousTitre={t("Commandez auprès d'un grossiste, inscrit ou non sur Visacredit XIXA")}
      />

      {erreur && <Alerte>{erreur}</Alerte>}

      <form onSubmit={soumettre} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Carte>
            <h2 className="mb-4 text-lg font-bold">{t("Fournisseur")}</h2>
            <Champ
              label={t("Numéro de téléphone du fournisseur")}
              type="tel"
              required
              placeholder={t("Ex : 22901020304")}
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              aide={t("S'il est inscrit sur Visacredit XIXA, il sera reconnu automatiquement")}
            />

            {fournisseur && (
              <div
                className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                  fournisseur.trouve
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-amber-50 text-amber-800"
                }`}
              >
                {fournisseur.trouve ? (
                  <>
                    ✅ Grossiste <strong>{fournisseur.nom_boutique}</strong> {t("trouvé sur Visacredit XIXA — il validera la commande et le stock sera transféré automatiquement.")}
                  </>
                ) : (
                  <>
                    {t("⚠️ Fournisseur externe — vous gérerez vous-même la réception et le paiement de cette commande.")}
                  </>
                )}
              </div>
            )}
          </Carte>

          <Carte>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{t("Produits")}</h2>
              <Bouton
                type="button"
                variante="neutre"
                onClick={() =>
                  setLignes((l) => [...l, { nom: "", quantite: "1", prix_unitaire: "" }])
                }
              >
                {t("+ Ajouter")}
              </Bouton>
            </div>

            <div className="space-y-4">
              {lignes.map((ligne, index) => (
                <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-6">
                    <Champ
                      label={index === 0 ? "Produit" : undefined}
                      placeholder={t("Ex : Riz")}
                      value={ligne.nom}
                      onChange={(e) => majLigne(index, "nom", e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Champ
                      label={index === 0 ? t("Qté") : undefined}
                      type="number"
                      min="1"
                      value={ligne.quantite}
                      onChange={(e) => majLigne(index, "quantite", e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Champ
                      label={index === 0 ? "Prix unitaire" : undefined}
                      type="number"
                      min="0"
                      step="0.01"
                      value={ligne.prix_unitaire}
                      onChange={(e) => majLigne(index, "prix_unitaire", e.target.value)}
                    />
                  </div>
                  <div className="flex items-end sm:col-span-1">
                    {lignes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setLignes((l) => l.filter((_, i) => i !== index))}
                        className="pb-2.5 text-sm font-medium text-red-600 hover:underline"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Carte>

          <Carte>
            <h2 className="mb-4 text-lg font-bold">{t("Mode de paiement")}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  valeur: "comptant" as const,
                  titre: t("💵 Comptant"),
                  note: t("Paiement immédiat (espèces ou mobile money)"),
                },
                {
                  valeur: "credit" as const,
                  titre: t("📅 À crédit"),
                  note: t("Vous définissez les échéances ci-dessous"),
                },
              ].map((option) => (
                <label
                  key={option.valeur}
                  className={`cursor-pointer rounded-2xl border-2 px-4 py-3 transition ${
                    modePaiement === option.valeur
                      ? "border-marque-500 bg-marque-50"
                      : "border-bordure hover:bg-surface-douce"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode_paiement"
                    className="sr-only"
                    checked={modePaiement === option.valeur}
                    onChange={() => setModePaiement(option.valeur)}
                  />
                  <span className="block text-sm font-semibold">{option.titre}</span>
                  <span className="mt-0.5 block text-xs text-faible">{option.note}</span>
                </label>
              ))}
            </div>

            {modePaiement === "credit" && (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-corps">{t("Échéancier")}</h3>
                  <Bouton
                    type="button"
                    variante="neutre"
                    onClick={() =>
                      setEcheances((l) => [...l, { montant: "", date_limite: aujourdHui() }])
                    }
                  >
                    {t("+ Échéance")}
                  </Bouton>
                </div>

                <div className="space-y-3">
                  {echeances.map((echeance, index) => (
                    <div key={index} className="flex flex-wrap items-end gap-3">
                      <div className="min-w-[140px] flex-1">
                        <Champ
                          label={`Échéance ${index + 1}`}
                          type="number"
                          min="0"
                          value={echeance.montant}
                          onChange={(e) => majEcheance(index, "montant", e.target.value)}
                        />
                      </div>
                      <div className="min-w-[160px] flex-1">
                        <Champ
                          label={t("Date limite")}
                          type="date"
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
                  className={`mt-3 text-sm ${
                    Math.abs(sommeEcheances - total) > 1
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  Total des échéances : {montant(sommeEcheances)} — montant de la commande :{" "}
                  {montant(total)}
                </p>
              </div>
            )}
          </Carte>
        </div>

        <div className="lg:col-span-1">
          <Carte className="lg:sticky lg:top-8">
            <h2 className="mb-4 text-lg font-bold">{t("Récapitulatif")}</h2>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-doux">{t("Fournisseur")}</dt>
                <dd className="max-w-[55%] truncate text-right font-medium">
                  {fournisseur?.nom_boutique ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-doux">{t("Lignes")}</dt>
                <dd className="font-medium">{lignes.filter((l) => l.nom.trim()).length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-doux">{t("Mode")}</dt>
                <dd className="font-medium">
                  {modePaiement === "credit" ? t("Crédit") : t("Comptant")}
                </dd>
              </div>
              <div className="flex justify-between border-t border-bordure-douce pt-3">
                <dt className="text-doux">{t("Montant total")}</dt>
                <dd className="text-lg font-bold text-titre">{montant(total)}</dd>
              </div>
            </dl>

            <Champ
              label={t("Notes (optionnel)")}
              className="mt-4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <Bouton type="submit" disabled={envoi} className="mt-5 w-full py-3.5">
              {envoi ? t("Création…") : t("Créer la commande")}
            </Bouton>
          </Carte>
        </div>
      </form>
    </div>
  );
}
