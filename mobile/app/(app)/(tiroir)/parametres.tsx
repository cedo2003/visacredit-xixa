/**
 * Paramètres — port de frontend/src/app/(app)/parametres/page.tsx.
 *
 * Blocs indépendants : profil de la boutique, mot de passe, notifications
 * push, préférences de l'appareil, et l'adresse du serveur réellement utilisée
 * — que l'utilisateur ne peut deviner autrement sur mobile, et qui sert au
 * dépannage.
 */

import { useT } from "@/i18n";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Linking, StyleSheet, Text } from "react-native";
import { Ecran } from "@/components/Ecran";
import {
  Alerte,
  Bouton,
  Carte,
  Champ,
  ChampDate,
  ChampSelect,
  Chargement,
  ChoixCartes,
  LigneInfo,
  ModaleConfirmation,
  TitreSection,
} from "@/components/ui";
import { BASE_URL, api, messageErreur } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRequete } from "@/lib/requete";
import { enregistrerAppareil, etatPush, type EtatPush } from "@/lib/push";
import { montant } from "@/lib/format";
import type { User } from "@/lib/types";
import { couleurs, espacement, type Palette } from "@/theme";
import {
  LIBELLES_THEME,
  useCouleurs,
  useStyles,
  useTheme,
  type ModeTheme,
} from "@/theme-contexte";
import { LANGUES, LIBELLES_LANGUE, useLangue, type Langue } from "@/i18n";

interface Reponse {
  profil: User;
  frequence_retrait: string;
  /** Restreint à « 1 jour » tant que le registre du commerce n'est pas déclaré. */
  frequences_autorisees: string[];
  solde: number;
}

export default function Parametres() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const couleurs = useCouleurs();
  const router = useRouter();
  const { deconnexion, rafraichir } = useAuth();

  const { donnees, chargement, rafraichissement, erreur, recharger } =
    useRequete<Reponse>("/api/parametres");

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nomBoutique, setNomBoutique] = useState("");
  const [email, setEmail] = useState("");
  const [ifu, setIfu] = useState("");
  const [registreCommerce, setRegistreCommerce] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [adresse, setAdresse] = useState("");
  const [frequence, setFrequence] = useState("7 jours");

  const [erreurProfil, setErreurProfil] = useState("");
  const [messageProfil, setMessageProfil] = useState("");
  const [envoiProfil, setEnvoiProfil] = useState(false);

  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreurMdp, setErreurMdp] = useState("");
  const [messageMdp, setMessageMdp] = useState("");
  const [envoiMdp, setEnvoiMdp] = useState(false);

  const [deconnexionVisible, setDeconnexionVisible] = useState(false);

  useEffect(() => {
    if (!donnees) return;

    setNom(donnees.profil.nom);
    setPrenom(donnees.profil.prenom);
    setNomBoutique(donnees.profil.nom_boutique);
    setEmail(donnees.profil.email ?? "");
    setIfu(donnees.profil.ifu ?? "");
    setRegistreCommerce(donnees.profil.registre_commerce ?? "");
    setDateNaissance(donnees.profil.date_naissance ?? "");
    setAdresse(donnees.profil.adresse ?? "");
    setFrequence(donnees.frequence_retrait);
  }, [donnees]);

  if (chargement) return <Chargement />;

  if (erreur && !donnees) {
    return (
      <Ecran>
        <Alerte>{erreur}</Alerte>
      </Ecran>
    );
  }

  if (!donnees) return null;

  async function enregistrerProfil() {
    setErreurProfil("");
    setMessageProfil("");
    setEnvoiProfil(true);

    try {
      await api.put("/api/parametres", {
        nom: nom.trim(),
        prenom: prenom.trim(),
        nom_boutique: nomBoutique.trim(),
        email: email.trim(),
        ifu: ifu.trim(),
        registre_commerce: registreCommerce.trim(),
        date_naissance: dateNaissance,
        adresse: adresse.trim(),
        frequence_retrait: frequence,
      });

      // Le profil est aussi porté par le contexte de session (en-tête,
      // menu « Plus ») : il faut le rafraîchir, pas seulement cet écran.
      await rafraichir();
      await recharger();
      setMessageProfil(t("Paramètres enregistrés."));
    } catch (e) {
      setErreurProfil(t(messageErreur(e, "Enregistrement impossible.")));
    } finally {
      setEnvoiProfil(false);
    }
  }

  async function changerMotDePasse() {
    setErreurMdp("");
    setMessageMdp("");

    if (nouveau !== confirmation) {
      setErreurMdp(t("Les deux nouveaux mots de passe ne correspondent pas."));
      return;
    }

    setEnvoiMdp(true);

    try {
      await api.post("/api/parametres/mot-de-passe", {
        mot_de_passe_actuel: actuel,
        nouveau_mot_de_passe: nouveau,
      });

      setActuel("");
      setNouveau("");
      setConfirmation("");
      setMessageMdp(t("Mot de passe mis à jour."));
    } catch (e) {
      setErreurMdp(t(messageErreur(e, "Modification impossible.")));
    } finally {
      setEnvoiMdp(false);
    }
  }

  return (
    <>
      <Ecran
        titre={t("Paramètres")}
        sousTitre={t("Profil, boutique et sécurité")}
        onRafraichir={recharger}
        rafraichissement={rafraichissement}
      >
        <Carte>
          <LigneInfo libelle={t("Rôle")}>
            {donnees.profil.role === "grossiste" ? t("📦 Grossiste") : t("🏪 Détaillant")}
          </LigneInfo>
          <LigneInfo libelle={t("Téléphone (identifiant)")}>{donnees.profil.telephone}</LigneInfo>
          <LigneInfo libelle={t("Solde actuel")} fort couleur={couleurs.succes}>
            {montant(donnees.solde)}
          </LigneInfo>
        </Carte>

        <Carte>
          <TitreSection>{t("Ma boutique")}</TitreSection>

          {erreurProfil ? <Alerte>{erreurProfil}</Alerte> : null}
          {messageProfil ? <Alerte type="succes">{messageProfil}</Alerte> : null}

          <Champ label={t("Nom de la boutique")} value={nomBoutique} onChangeText={setNomBoutique} />
          <Champ label={t("Prénom")} value={prenom} onChangeText={setPrenom} />
          <Champ label={t("Nom")} value={nom} onChangeText={setNom} />
          <Champ
            label={t("Email")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Champ
            label={t("IFU (Identifiant Fiscal Unique)")}
            value={ifu}
            onChangeText={setIfu}
            autoCapitalize="characters"
            aide={t("Obligatoire. Les espaces et tirets sont ignorés.")}
            erreur={ifu.trim() ? undefined : "Champ obligatoire"}
          />

          <Champ
            label={t("Registre du commerce (RCCM)")}
            value={registreCommerce}
            onChangeText={setRegistreCommerce}
            autoCapitalize="characters"
            aide={t("Facultatif, mais tant qu'il n'est pas renseigné les retraits sont limités à la fréquence « 1 jour ».")}
          />

          <ChampDate
            label={t("Date de naissance (optionnel)")}
            valeur={dateNaissance}
            onChange={setDateNaissance}
          />

          <Champ
            label={t("Adresse (optionnel)")}
            value={adresse}
            onChangeText={setAdresse}
            multiline
          />

          <ChampSelect
            label={t("Fréquence de retrait habituelle")}
            valeur={frequence}
            onChange={setFrequence}
            disabled={donnees.profil.registre_commerce_manquant}
            options={(donnees.frequences_autorisees ?? ["1 jour"]).map((f) => ({
              valeur: f,
              label: `Tous les ${f}`,
            }))}
            aide={
              donnees.profil.registre_commerce_manquant
                ? "Renseignez votre registre du commerce ci-dessus pour choisir une autre fréquence."
                : undefined
            }
          />

          <Bouton
            onPress={enregistrerProfil}
            disabled={envoiProfil || !ifu.trim()}
            pleineLargeur
          >
            {envoiProfil ? t("Enregistrement…") : t("Enregistrer")}
          </Bouton>
        </Carte>

        <Carte>
          <TitreSection>{t("Mot de passe")}</TitreSection>

          {erreurMdp ? <Alerte>{erreurMdp}</Alerte> : null}
          {messageMdp ? <Alerte type="succes">{messageMdp}</Alerte> : null}

          <Champ
            label={t("Mot de passe actuel")}
            value={actuel}
            onChangeText={setActuel}
            secureTextEntry
          />
          <Champ
            label={t("Nouveau mot de passe")}
            value={nouveau}
            onChangeText={setNouveau}
            secureTextEntry
            aide={t("6 caractères minimum")}
          />
          <Champ
            label={t("Confirmer le nouveau mot de passe")}
            value={confirmation}
            onChangeText={setConfirmation}
            secureTextEntry
          />

          <Bouton
            variante="secondaire"
            onPress={changerMotDePasse}
            disabled={envoiMdp || !actuel || !nouveau}
            pleineLargeur
          >
            {envoiMdp ? t("Modification…") : t("Changer le mot de passe")}
          </Bouton>
        </Carte>

        <CartePush />

        <ChoixLangue />

        <ChoixTheme />

        <Carte>
          <LigneInfo libelle={t("Serveur")}>{BASE_URL}</LigneInfo>
        </Carte>

        <Bouton variante="neutre" pleineLargeur onPress={() => setDeconnexionVisible(true)}>
          {t("Se déconnecter")}
        </Bouton>
      </Ecran>

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
    </>
  );
}

/**
 * Notifications push de ce téléphone.
 *
 * L'abonnement se fait de lui-même à la connexion (voir lib/auth) ; cette
 * carte dit où l'on en est, et propose la seule action utile selon le cas :
 * réessayer, ou ouvrir les réglages du téléphone quand la permission a été
 * refusée — l'application ne peut plus la redemander elle-même.
 */
function CartePush() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const [etat, setEtat] = useState<EtatPush | null>(null);
  const [enCours, setEnCours] = useState(false);

  const actualiser = useCallback(() => {
    etatPush().then(setEtat, () => setEtat("indisponible"));
  }, []);

  useEffect(actualiser, [actualiser]);

  async function activer() {
    setEnCours(true);
    try {
      setEtat(await enregistrerAppareil());
    } finally {
      setEnCours(false);
    }
  }

  const explication: Record<EtatPush, string> = {
    actif: "Activées : vous êtes prévenu de chaque commande, paiement ou livraison, même application fermée.",
    refuse: "Vous avez refusé les notifications. Autorisez-les dans les réglages du téléphone pour être prévenu.",
    indisponible: "Pas encore activées sur ce téléphone.",
  };

  return (
    <Carte>
      <TitreSection>{t("Notifications push")}</TitreSection>

      <Text style={styles.aide}>{etat ? t(explication[etat]) : t("Vérification…")}</Text>

      {etat === "refuse" && (
        <Bouton variante="neutre" pleineLargeur onPress={() => void Linking.openSettings()}>
          {t("Ouvrir les réglages")}
        </Bouton>
      )}

      {etat === "indisponible" && (
        <Bouton pleineLargeur onPress={activer} disabled={enCours}>
          {enCours ? t("Activation…") : t("Activer les notifications")}
        </Bouton>
      )}
    </Carte>
  );
}

/**
 * Choix du thème clair / sombre.
 *
 * Le réglage vit sur l'appareil, pas dans le compte : c'est dit sous les
 * options, pour que personne ne s'étonne de retrouver le thème clair en
 * ouvrant l'application sur un autre téléphone. Rien ne part vers l'API, la
 * bascule est immédiate et ne peut pas échouer.
 */
const OPTIONS_THEME: { valeur: ModeTheme; titre: string; note: string }[] = [
  { valeur: "systeme", titre: LIBELLES_THEME.systeme, note: "Suit le réglage du téléphone" },
  { valeur: "clair", titre: LIBELLES_THEME.clair, note: "Toujours clair" },
  { valeur: "sombre", titre: LIBELLES_THEME.sombre, note: "Toujours sombre" },
];

/**
 * Choix de la langue.
 *
 * Même portée que le thème : l'appareil, pas le compte. Le français est la
 * langue source — une phrase non traduite s'affiche donc en français plutôt
 * que de disparaître.
 */
function ChoixLangue() {
  const styles = useStyles(creerStyles);
  const t = useT();
  const { langue, definir } = useLangue();

  return (
    <Carte>
      <TitreSection>Langue</TitreSection>

      <ChoixCartes
        valeur={langue}
        options={LANGUES.map((valeur: Langue) => ({
          valeur,
          titre: LIBELLES_LANGUE[valeur],
        }))}
        onChange={definir}
      />

      <Text style={styles.aide}>
        {t("Ce choix est enregistré sur cet appareil uniquement.")}
      </Text>
    </Carte>
  );
}

function ChoixTheme() {
  const t = useT();
  const styles = useStyles(creerStyles);
  const { mode, resolu, definir } = useTheme();

  return (
    <Carte>
      <TitreSection>{t("Apparence")}</TitreSection>

      <ChoixCartes
        valeur={mode}
        options={OPTIONS_THEME.map((o) => ({ ...o, titre: t(o.titre), note: t(o.note) }))}
        onChange={definir}
      />

      <Text style={styles.aide}>
        Actuellement affiché en {resolu === "sombre" ? "sombre" : "clair"}. Ce choix
        est enregistré sur cet appareil uniquement.
      </Text>
    </Carte>
  );
}

const creerStyles = (couleurs: Palette) =>
  StyleSheet.create({
  aide: {
    marginBottom: espacement.sm,
    fontSize: 12,
    lineHeight: 18,
    color: couleurs.texteFaible,
  },
});
