"use client";

import { AlertTriangle } from "lucide-react";
import { usePlaygroundStore } from "@/stores/playground";

export const ReDoSBanner = () => {
  const redosWarnings = usePlaygroundStore((s) => s.redosWarnings);

  if (redosWarnings.length === 0) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        <div className="font-semibold">
          {redosWarnings.length} pattern
          {redosWarnings.length > 1 ? "s" : ""} à risque détecté
          {redosWarnings.length > 1 ? "s" : ""}
        </div>
        <ul className="list-disc space-y-0.5 pl-4">
          {redosWarnings.map((w, i) => (
            <li key={`${w.rule}-${w.offset}-${i}`}>
              <span className="font-mono text-xs">@{w.offset}</span> · {w.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
