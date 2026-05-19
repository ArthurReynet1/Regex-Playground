"use client";

import { cn } from "@/lib/utils";
import type { MatchResult } from "@/types/regex";

const MAX_DISPLAY_LENGTH = 60;

const truncate = (s: string): string =>
  s.length > MAX_DISPLAY_LENGTH ? `${s.slice(0, MAX_DISPLAY_LENGTH - 1)}…` : s;

const formatRange = (start: number, end: number): string =>
  `${start}–${end}`;

export type MatchCardProps = {
  index: number; // 0-based position in the matches array
  match: MatchResult;
  isHovered: boolean;
  onHover: (index: number | null) => void;
};

export const MatchCard = ({
  index,
  match,
  isHovered,
  onHover,
}: MatchCardProps) => {
  return (
    <div
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "rounded-md border bg-card p-3 text-sm transition-colors",
        "hover:border-blue-500/60",
        isHovered ? "border-blue-500 bg-blue-500/5" : "border-input",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Match #{index + 1}
        </span>
        <code className="text-xs text-muted-foreground">
          {formatRange(match.start, match.end)}
        </code>
      </div>

      <div className="mt-2">
        <code
          className="block rounded-sm bg-blue-500/15 px-2 py-1 font-mono text-xs break-all"
          title={match.value}
        >
          {truncate(match.value)}
        </code>
      </div>

      {match.captures.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {match.captures.map((cap, i) => (
            <li key={`${cap.index}-${i}`} className="flex items-start gap-2">
              <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                {cap.name ? `<${cap.name}>` : `#${cap.index}`}
              </span>
              <code
                className="flex-1 rounded-sm bg-muted px-2 py-0.5 font-mono text-xs break-all"
                title={cap.value}
              >
                {truncate(cap.value)}
              </code>
              <code className="shrink-0 text-xs text-muted-foreground">
                {formatRange(cap.start, cap.end)}
              </code>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
