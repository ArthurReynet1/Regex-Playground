"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePlaygroundStore } from "@/stores/playground";
import { cn } from "@/lib/utils";
import {
  LIBRARY_PATTERNS,
  type LibraryCategory,
  type LibraryPattern,
} from "@/lib/library/patterns";
import type { Flag } from "@/types/regex";

const VALID_FLAGS = new Set<string>(["g", "i", "m", "s", "u", "y", "d", "v"]);

const parseFlags = (flags: string): Flag[] =>
  flags
    .split("")
    .filter((f) => VALID_FLAGS.has(f)) as Flag[];

const categoryColor: Record<LibraryCategory, string> = {
  Identifiants: "text-violet-500",
  France: "text-blue-500",
  Web: "text-cyan-500",
  Formats: "text-green-500",
  "Logs & data": "text-amber-500",
};

const matchesQuery = (pattern: LibraryPattern, query: string): boolean => {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    pattern.name.toLowerCase().includes(q) ||
    pattern.description.toLowerCase().includes(q) ||
    pattern.category.toLowerCase().includes(q)
  );
};

export type LibraryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const LibraryDialog = ({ open, onOpenChange }: LibraryDialogProps) => {
  const setSource = usePlaygroundStore((s) => s.setSource);
  const setFlags = usePlaygroundStore((s) => s.setFlags);
  const setText = usePlaygroundStore((s) => s.setText);

  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => LIBRARY_PATTERNS.filter((p) => matchesQuery(p, query)),
    [query],
  );

  const handleLoad = (pattern: LibraryPattern) => {
    setSource(pattern.source);
    setFlags(parseFlags(pattern.flags));
    setText(pattern.testText);
    toast.success(`Pattern chargé : ${pattern.name}`);
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bibliothèque de regex</DialogTitle>
          <DialogDescription>
            Charge un pattern courant en un clic. Recherche par nom, catégorie
            ou description.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (email, IP, date...)"
            aria-label="Rechercher un pattern"
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring"
          />
        </div>

        <ul className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <li className="py-8 text-center text-sm text-muted-foreground">
              Aucun pattern trouvé pour « {query} »
            </li>
          ) : (
            filtered.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => handleLoad(p)}
                  className="w-full rounded-md border border-input p-3 text-left transition-colors hover:border-primary hover:bg-accent/30"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{p.name}</span>
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        categoryColor[p.category],
                      )}
                    >
                      {p.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.description}
                  </p>
                  <code className="mt-2 block truncate rounded-sm bg-muted px-2 py-1 font-mono text-xs">
                    /{p.source}/{p.flags}
                  </code>
                </button>
              </li>
            ))
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
};
