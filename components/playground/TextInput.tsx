"use client";

import { usePlaygroundStore } from "@/stores/playground";
import { HighlightedTextarea } from "./HighlightedTextarea";

const MAX_SIZE = 100 * 1024; // 100 KB

const formatNumber = (n: number) => n.toLocaleString("fr-FR");

export const TextInput = () => {
  const text = usePlaygroundStore((s) => s.text);
  const setText = usePlaygroundStore((s) => s.setText);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_SIZE;

  return (
    <div className="space-y-2">
      <HighlightedTextarea
        value={text}
        onChange={setText}
        placeholder="Colle ton texte ici pour tester la regex..."
        ariaLabel="Texte à tester"
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span
          className={
            isOverLimit ? "text-destructive" : "text-muted-foreground"
          }
        >
          {formatNumber(charCount)} caractères
          {isOverLimit &&
            " — au-delà de 100 KB, le worker n'exécutera pas la regex"}
        </span>
        <span className="text-muted-foreground">
          Limite : 100 KB ({formatNumber(MAX_SIZE)} caractères)
        </span>
      </div>
    </div>
  );
};
