/**
 * Routeur local.
 *
 * Reproduit la table de routage de l'API Symfony et exécute chaque route sur la
 * base SQLite du téléphone. C'est la pièce qui permet aux 25 écrans de rester
 * inchangés : ils continuent d'appeler `api.get("/api/ventes")`, sans savoir que
 * la réponse ne vient plus du réseau.
 *
 * Les chemins et les formes de réponse sont donc contraints — ce sont ceux du
 * serveur. Toute divergence casserait un écran silencieusement.
 */

import { ErreurMetier } from "./base";
import * as auth from "./modules/auth";
import * as b2b from "./modules/b2b";
import * as catalogue from "./modules/catalogue";
import * as commerce from "./modules/commerce";
import * as divers from "./modules/divers";
import * as solde from "./modules/solde";

export type Methode = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type Corps = Record<string, any>;

/** Découpe « /api/commandes/12/valider?x=1 » en segments et paramètres. */
function analyser(chemin: string): { segments: string[]; requete: URLSearchParams } {
  const [avant, apres] = chemin.split("?");

  return {
    segments: avant.split("/").filter(Boolean),
    requete: new URLSearchParams(apres ?? ""),
  };
}

const nombre = (v: string | undefined): number => {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new ErreurMetier("Identifiant invalide.", 404);
  return n;
};

/**
 * Exécute une route.
 *
 * @throws ErreurMetier avec le même `status` que l'API renverrait — 401 pour une
 *         session absente, 403 pour un rôle insuffisant, 404 pour une ressource
 *         inconnue. Le client HTTP local les retraduit en ApiError.
 */
export async function router(
  methode: Methode,
  chemin: string,
  corps: Corps = {},
): Promise<unknown> {
  const { segments, requete } = analyser(chemin);

  if (segments[0] !== "api") throw new ErreurMetier("Route inconnue.", 404);

  const [, section, ...reste] = segments;
  const q = requete.get("q") ?? undefined;

  switch (section) {
    /* ─────────────────────────────── auth ─────────────────────────────── */
    case "auth": {
      if (methode === "POST" && reste[0] === "login") return auth.connexion(corps);
      if (methode === "POST" && reste[0] === "register") return auth.inscription(corps);
      if (methode === "GET" && reste[0] === "me") return auth.moi();
      break;
    }

    /* ───────────────────────────── dashboard ──────────────────────────── */
    case "dashboard": {
      if (methode === "GET" && reste.length === 0) return solde.tableauDeBord();
      break;
    }

    /* ───────────────────────────── produits ───────────────────────────── */
    case "produits": {
      // Le catalogue de catégories est défini par la plateforme : il se lit,
      // il ne se complète plus depuis l'application.
      if (methode === "GET" && reste[0] === "categories") return catalogue.categories();

      if (methode === "GET" && reste[0] === "recherche-grossistes") {
        return catalogue.rechercheGrossistes(q ?? "");
      }

      if (methode === "GET" && reste.length === 0) return catalogue.liste(q);
      if (methode === "POST" && reste.length === 0) return catalogue.creer(corps);

      if (reste.length === 1) {
        const id = nombre(reste[0]);
        if (methode === "GET") return catalogue.fiche(id);
        if (methode === "PUT" || methode === "PATCH") return catalogue.modifier(id, corps);
        if (methode === "DELETE") return catalogue.supprimer(id);
      }
      break;
    }

    /* ────────────────────────────── clients ───────────────────────────── */
    case "clients": {
      if (methode === "GET" && reste.length === 0) return commerce.clients(q);
      if (methode === "POST" && reste.length === 0) return commerce.creerClient(corps);

      if (reste.length === 1) {
        const id = nombre(reste[0]);
        if (methode === "GET") return commerce.client(id);
        if (methode === "PUT" || methode === "PATCH") return commerce.modifierClient(id, corps);
        if (methode === "DELETE") return commerce.supprimerClient(id);
      }
      break;
    }

    /* ─────────────────────────────── ventes ───────────────────────────── */
    case "ventes": {
      if (methode === "GET" && reste.length === 0) return commerce.ventes();
      if (methode === "POST" && reste.length === 0) return commerce.creerVente(corps);
      if (methode === "GET" && reste.length === 1) return commerce.vente(nombre(reste[0]));
      break;
    }

    /* ────────────────────────────── créances ──────────────────────────── */
    case "creances": {
      if (methode === "GET" && reste.length === 0) return commerce.creances();
      if (methode === "POST" && reste[1] === "paiement") {
        return commerce.payerCreance(nombre(reste[0]), corps);
      }
      break;
    }

    /* ───────────────────────────── commandes ──────────────────────────── */
    case "commandes": {
      if (methode === "GET" && reste.length === 0) return b2b.listeCommandes();
      if (methode === "POST" && reste[0] === "verifier-fournisseur") {
        return b2b.verifierFournisseur(String(corps.telephone ?? ""));
      }
      if (methode === "POST" && reste.length === 0) return b2b.creerCommande(corps);

      if (reste.length === 1 && methode === "GET") return b2b.ficheCommande(nombre(reste[0]));

      if (reste.length === 2) {
        const id = nombre(reste[0]);

        if (methode === "POST") {
          switch (reste[1]) {
            case "marchandage":
              return b2b.proposerPrix(id, corps);
            case "valider":
              return b2b.validerCommande(id);
            case "livrer":
              return b2b.livrerCommande(id);
            case "reception":
              return b2b.receptionCommande(id);
            case "encaisser-especes":
              return b2b.encaisserEspeces(id);
            case "payer-especes":
              return b2b.payerEspecesCommande(id);
            case "demander-paiement":
              return b2b.demanderPaiementCommande(id, corps);
            case "annuler":
              return b2b.annulerCommande(id);
          }
        }

        if (methode === "PUT" && reste[1] === "echeances") {
          return b2b.majEcheancesCommande(id, corps);
        }
      }

      // Réponse à une proposition de prix : .../marchandage/{accepter,refuser}
      if (reste.length === 3 && methode === "POST" && reste[1] === "marchandage") {
        const id = nombre(reste[0]);

        if (reste[2] === "accepter") return b2b.repondrePrix(id, true);
        if (reste[2] === "refuser") return b2b.repondrePrix(id, false);
      }
      break;
    }

    /* ────────────────────────────── crédits ───────────────────────────── */
    case "credits": {
      if (methode === "GET" && reste.length === 0) return b2b.credits();

      if (reste.length === 2 && methode === "POST") {
        const id = nombre(reste[0]);

        switch (reste[1]) {
          case "payer-especes":
            return b2b.payerCreditEspeces(id);
          case "payer-solde":
            return b2b.payerCreditSolde(id);
          case "demander-paiement":
            return b2b.demanderPaiementCredit(id, corps);
        }
      }
      break;
    }

    /* ────────────────────────────── dépenses ──────────────────────────── */
    case "depenses": {
      if (methode === "GET" && reste.length === 0) return divers.depenses();
      if (methode === "POST" && reste.length === 0) return divers.creerDepense(corps);
      if (methode === "DELETE" && reste.length === 1) {
        return divers.supprimerDepense(nombre(reste[0]));
      }
      break;
    }

    /* ────────────────────────────── retraits ──────────────────────────── */
    case "retraits": {
      if (methode === "GET" && reste.length === 0) return divers.retraits();
      if (methode === "POST" && reste.length === 0) return divers.creerRetrait(corps);
      break;
    }

    /* ────────────────────────────── notations ─────────────────────────── */
    case "notations": {
      if (methode === "GET" && reste.length === 0) return b2b.notations();

      if (methode === "POST" && reste[0] === "fournisseur") {
        return b2b.noterFournisseur(nombre(reste[1]), corps);
      }
      if (methode === "POST" && reste[0] === "client") {
        return b2b.noterClient(nombre(reste[1]), corps);
      }
      if (methode === "GET" && reste[0] === "profil") {
        return b2b.profilNotation(String(reste[1]), nombre(reste[2]));
      }
      if (methode === "GET" && reste[0] === "grossiste") {
        return b2b.moyenneGrossiste(nombre(reste[1]));
      }
      break;
    }

    /* ──────────────────────────── notifications ───────────────────────── */
    case "notifications": {
      if (methode === "GET" && reste.length === 0) return divers.notifications();
      if (methode === "GET" && reste[0] === "non-lues") return divers.nonLues();

      if (methode === "POST" && reste[0] === "tout-lu") return divers.toutMarquerLu();
      if (methode === "POST" && reste[1] === "lue") return divers.marquerLue(nombre(reste[0]));

      if (methode === "DELETE" && reste[0] === "lues") return divers.supprimerLues();
      if (methode === "DELETE" && reste[0] === "toutes") return divers.supprimerToutes();
      if (methode === "DELETE" && reste.length === 1) {
        return divers.supprimerNotification(nombre(reste[0]));
      }
      break;
    }

    /* ───────────────────────────── paramètres ─────────────────────────── */
    case "parametres": {
      if (methode === "GET" && reste.length === 0) return auth.lireParametres();
      if ((methode === "PUT" || methode === "PATCH") && reste.length === 0) {
        return auth.majParametres(corps);
      }
      if (methode === "POST" && reste[0] === "mot-de-passe") {
        return auth.changerMotDePasse(corps);
      }
      break;
    }

    /* ────────────────────────────── paiements ─────────────────────────── */
    case "paiements": {
      if (methode === "GET" && reste[0] === "config") return divers.configPaiements();
      if (methode === "POST" && reste[0] === "confirmer") return divers.confirmerPaiement();
      break;
    }
  }

  throw new ErreurMetier(`Route inconnue : ${methode} ${chemin}`, 404);
}
