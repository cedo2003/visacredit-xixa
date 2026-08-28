"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Apparition au défilement.
 *
 * L'observateur se déconnecte dès le premier passage : une section déjà vue ne
 * doit pas rejouer son animation quand on remonte la page. Le rendu serveur
 * part de l'état masqué, mais `motion-reduce:` rétablit tout immédiatement pour
 * qui a demandé moins d'animations.
 */
export function Reveal({
  children,
  delai = 0,
  className = "",
}: {
  children: ReactNode;
  delai?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vu, setVu] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Navigateur sans IntersectionObserver : on montre tout. Le rendu est
    // repoussé d'une frame plutôt qu'appelé dans le corps de l'effet, qui
    // déclencherait un rendu en cascade.
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setVu(true));
      return () => cancelAnimationFrame(frame);
    }

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) {
          setVu(true);
          observateur.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observateur.observe(element);
    return () => observateur.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delai}ms` }}
      className={`transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        vu ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
