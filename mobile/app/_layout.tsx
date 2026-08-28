/**
 * Racine de l'application.
 *
 * Monte le contexte de session au-dessus de la pile de navigation : tous les
 * écrans, y compris ceux de connexion, partagent le même AuthProvider. Le
 * thème est monté encore au-dessus — il habille aussi l'écran de connexion,
 * avant qu'on sache qui se connecte.
 *
 * `GestureHandlerRootView` est exigée par le tiroir de navigation : sans elle,
 * le menu latéral s'ouvre au bouton mais pas au glissement du doigt.
 */

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/lib/auth";
import { LangueProvider } from "@/i18n";
import { ThemeProvider, useCouleurs } from "@/theme-contexte";

export default function LayoutRacine() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LangueProvider>
            <AuthProvider>
              <Navigation />
            </AuthProvider>
          </LangueProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Séparée de la racine parce qu'elle consomme le thème : un composant ne peut
 * pas lire un contexte qu'il monte lui-même.
 */
function Navigation() {
  const couleurs = useCouleurs();

  return (
    <>
      {/*
        `barreEtat` porte le style de l'heure et des icônes système, pas une
        couleur : en thème sombre elles doivent virer au clair pour rester
        visibles sur le fond de l'application.
      */}
      <StatusBar style={couleurs.barreEtat} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: couleurs.fond },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="connexion" />
        <Stack.Screen name="inscription" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}
