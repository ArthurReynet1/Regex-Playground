"use client";

import { useState } from "react";
import { usePlaygroundStore } from "@/stores/playground";
import { useHoveredMatch } from "@/contexts/MatchHoverContext";
import { Button } from "@/components/ui/button";
import { MatchCard } from "./MatchCard";

const INITIAL_DISPLAY = 100;
const STEP = 100;

const formatNumber = (n: number) => n.toLocaleString("fr-FR");

export const CapturesPanel = () => {
  const matches = usePlaygroundStore((s) => s.matches);
  const truncated = usePlaygroundStore((s) => s.truncated);
  const { hoveredMatchIndex, setHoveredMatchIndex } = useHoveredMatch();

  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY);

  if (matches.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground">
        Aucun match pour cette regex et ce texte.
      </div>
    );
  }

  const visible = matches.slice(0, displayCount);
  const hiddenCount = matches.length - visible.length;

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        {formatNumber(matches.length)} {matches.length > 1 ? "matches" : "match"}
        {truncated && " — cap 10 000 atteint"}
      </div>

      <ul className="space-y-2">
        {visible.map((match, i) => (
          <li key={`${match.start}-${match.end}-${i}`}>
            <MatchCard
              index={i}
              match={match}
              isHovered={hoveredMatchIndex === i}
              onHover={setHoveredMatchIndex}
            />
          </li>
        ))}
      </ul>

      {hiddenCount > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDisplayCount((c) => c + STEP)}
          className="w-full"
        >
          Afficher {formatNumber(Math.min(STEP, hiddenCount))} suivants ·{" "}
          {formatNumber(hiddenCount)} restants
        </Button>
      )}
    </div>
  );
};
