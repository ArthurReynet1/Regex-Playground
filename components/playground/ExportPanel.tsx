"use client";

import { useMemo } from "react";
import { AlertCircle, AlertTriangle, Code2, Copy, Info } from "lucide-react";
import { toast } from "sonner";
import { usePlaygroundStore } from "@/stores/playground";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TRANSPILERS, exportKeyToTarget } from "@/lib/transpilers";
import type { Target } from "@/lib/transpilers/types";
import type { TranspileWarning } from "@/types/regex";

const targetToKey: Record<Target, "js" | "python" | "csharp"> = {
  ecmascript: "js",
  python: "python",
  csharp: "csharp",
};

const severityClass: Record<TranspileWarning["severity"], string> = {
  error: "border-destructive/40 bg-destructive/10 text-destructive",
  diff: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  info: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
};

const severityIcon = (s: TranspileWarning["severity"]) => {
  switch (s) {
    case "error":
      return AlertCircle;
    case "diff":
      return AlertTriangle;
    case "info":
      return Info;
  }
};

const headerCommentPrefix = (target: Target): string => {
  switch (target) {
    case "python":
      return "# ⚠️";
    case "ecmascript":
    case "csharp":
      return "// ⚠️";
  }
};

export const ExportPanel = () => {
  const source = usePlaygroundStore((s) => s.source);
  const flags = usePlaygroundStore((s) => s.flags);
  const ast = usePlaygroundStore((s) => s.ast);
  const parseError = usePlaygroundStore((s) => s.parseError);
  const activeExportKey = usePlaygroundStore((s) => s.activeExport);
  const setActiveExport = usePlaygroundStore((s) => s.setActiveExport);

  const target = exportKeyToTarget(activeExportKey);
  const transpiler = TRANSPILERS[target];

  const result = useMemo(() => {
    if (parseError || !source) return null;
    return transpiler.transpile({
      ast,
      source,
      flags: flags.join(""),
    });
  }, [transpiler, ast, source, flags, parseError]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copié`),
      () => toast.error("Échec de la copie"),
    );
  };

  if (!result) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-input px-4 py-8 text-center text-sm text-muted-foreground">
        <Code2 className="h-6 w-6 text-muted-foreground/60" aria-hidden="true" />
        {parseError
          ? "Corrige la regex pour voir le code exporté."
          : "Tape une regex pour voir le code exporté."}
      </div>
    );
  }

  // Prepend 🔴 errors as header comments in the snippet (other severities only in panel)
  const errorWarnings = result.warnings.filter((w) => w.severity === "error");
  const prefix = headerCommentPrefix(target);
  const snippetWithHeader =
    errorWarnings.length > 0
      ? `${errorWarnings.map((w) => `${prefix} ${w.message}`).join("\n")}\n\n${result.snippet}`
      : result.snippet;

  return (
    <div className="space-y-3">
      <div className="flex gap-1" role="tablist" aria-label="Langage d'export">
        {(Object.keys(TRANSPILERS) as Target[]).map((t) => {
          const k = targetToKey[t];
          const isActive = activeExportKey === k;
          return (
            <Button
              key={t}
              type="button"
              role="tab"
              aria-selected={isActive}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveExport(k)}
            >
              {TRANSPILERS[t].label}
            </Button>
          );
        })}
      </div>

      <pre className="overflow-x-auto rounded-md border bg-card p-3 text-xs">
        <code className="font-mono">{snippetWithHeader}</code>
      </pre>

      {result.warnings.length > 0 && (
        <ul className="space-y-2">
          {result.warnings.map((w, i) => {
            const Icon = severityIcon(w.severity);
            return (
              <li
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-md border px-3 py-2 text-xs",
                  severityClass[w.severity],
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{w.message}</span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => copy(result.pattern, "Motif")}
          className="flex-1 transition-transform duration-100 active:scale-[0.97]"
        >
          <Copy className="mr-2 h-3.5 w-3.5" />
          Copier motif
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => copy(snippetWithHeader, "Snippet")}
          className="flex-1 transition-transform duration-100 active:scale-[0.97]"
        >
          <Copy className="mr-2 h-3.5 w-3.5" />
          Copier snippet
        </Button>
      </div>
    </div>
  );
};
