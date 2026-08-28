import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";
import { SCRIPT_LANGUE, LangueProvider } from "@/lib/i18n";
import { SCRIPT_AMORCAGE, ThemeProvider } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visacredit XIXA",
  description: "Plateforme B2B de gestion de boutiques et magasins",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/*
          Posent `data-theme` et `lang` avant le premier pixel.
          `suppressHydrationWarning` sur <html> est la contrepartie : le serveur
          ne peut pas savoir ce que ces scripts auront écrit.
        */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_AMORCAGE }} />
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_LANGUE }} />
      </head>
      <body className="min-h-screen bg-fond text-corps antialiased">
        <ThemeProvider>
          <LangueProvider>
            <AuthProvider>{children}</AuthProvider>
          </LangueProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
