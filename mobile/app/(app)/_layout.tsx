/**
 * Zone authentifiée.
 *
 * Deux rôles :
 *   - le garde de session : tant que le profil n'est pas chargé on patiente,
 *     et sans profil on repart sur /connexion. C'est l'équivalent du
 *     `if (!estConnecte()) redirect(...)` de l'ancien config.php ;
 *   - la pile de navigation : le tiroir forme l'écran de base, les fiches et
 *     formulaires s'empilent par-dessus. Ces écrans-là n'ont pas de menu
 *     latéral mais une flèche de retour, ce qui est le bon geste pour un
 *     détail dont on ressort là d'où l'on vient.
 */

import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/lib/auth";
import { useCouleurs } from "@/theme-contexte";

export default function LayoutApplication() {
  const couleurs = useCouleurs();
  const { user, chargement } = useAuth();

  if (chargement) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: couleurs.fond }}>
        <ActivityIndicator color={couleurs.primaire} size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/connexion" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: couleurs.surface },
        headerTintColor: couleurs.primaire,
        headerTitleStyle: { color: couleurs.texte, fontWeight: "700", fontSize: 17 },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: couleurs.fond },
      }}
    >
      <Stack.Screen name="(tiroir)" options={{ headerShown: false }} />

      <Stack.Screen name="produits/nouveau" options={{ title: "Nouveau produit" }} />
      <Stack.Screen name="produits/[id]" options={{ title: "Produit" }} />

      <Stack.Screen name="ventes/nouvelle" options={{ title: "Nouvelle vente" }} />
      <Stack.Screen name="ventes/[id]" options={{ title: "Reçu de vente" }} />

      <Stack.Screen name="commandes/nouvelle" options={{ title: "Nouvelle commande" }} />
      <Stack.Screen name="commandes/[id]" options={{ title: "Commande" }} />

      <Stack.Screen name="clients/nouveau" options={{ title: "Nouveau client" }} />
      <Stack.Screen name="clients/[id]" options={{ title: "Client" }} />

      <Stack.Screen name="notations/[type]/[id]" options={{ title: "Profil de notation" }} />
    </Stack>
  );
}
