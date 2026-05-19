"use client";

import { usePlaygroundStore } from "@/stores/playground";
import { useHoveredMatch } from "@/contexts/MatchHoverContext";
import { HighlightedTextarea } from "./HighlightedTextarea";

const MAX_SIZE = 100 * 1024; // 100 KB

const formatNumber = (n: number) => n.toLocaleString("fr-FR");

export const TextInput = () => {
  const text = usePlaygroundStore((s) => s.text);
  const setText = usePlaygroundStore((s) => s.setText);
  const matches = usePlaygroundStore((s) => s.matches);
  const truncated = usePlaygroundStore((s) => s.truncated);
  const runtimeError = usePlaygroundStore((s) => s.runtimeError);
  const { hoveredMatchIndex, setHoveredMatchIndex } = useHoveredMatch();

  const charCount = text.length;
  const isOverLimit = charCount > MAX_SIZE;

  return (
    <div className="space-y-2">
      {runtimeError?.kind === "timeout" && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {runtimeError.message}
        </div>
      )}

      {truncated && (
        <div
          role="status"
          className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300"
        >
          10 000 premiers matches affichés sur un total estimé plus grand —
          affine ta regex.
        </div>
      )}

      <HighlightedTextarea
        value={text}
        onChange={setText}
        matches={matches}
        hoveredMatchIndex={hoveredMatchIndex}
        onMatchHover={setHoveredMatchIndex}
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
          {matches.length > 0 &&
            ` — ${formatNumber(matches.length)} ${matches.length > 1 ? "matches" : "match"}`}
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
