import Image from "next/image";

/**
 * Verrou de marque horizontal, pour la barre de navigation et le pied de page.
 *
 * `logo-xixa.png` empile le pictogramme au-dessus du mot-symbole : à 40 px de
 * haut dans une barre, « visacredit » devient illisible. `logo-xixa-horizontal.png`
 * est le même fichier remonté côte à côte — la loupe découpée en haut, le bloc
 * « visacredit / XIXA » découpé en bas, replacés à droite. Aucun tracé n'a été
 * redessiné : ce sont les pixels du logo d'origine.
 *
 * Si un verrou horizontal officiel existe un jour, il suffit de remplacer le
 * fichier en gardant le rapport 4:1.
 */
export function MarqueXixa({ taille = "md" }: { taille?: "sm" | "md" }) {
  return (
    <Image
      src="/logo-xixa-horizontal.png"
      alt="Visacredit XIXA"
      width={398}
      height={99}
      priority={taille === "md"}
      className={`w-auto dark:rounded-xl dark:bg-white dark:px-2.5 dark:py-1.5 ${taille === "sm" ? "h-8" : "h-10"}`}
    />
  );
}
