"use client";

import { Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePlaygroundStore } from "@/stores/playground";
import type { HistoryEntry } from "@/types/regex";

const formatRelative = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const sec = Math.max(0, Math.floor(diff / 1000));
  if (sec < 60) return "à l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min}m`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `il y a ${hour}h`;
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
};

export type HistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const HistoryDialog = ({ open, onOpenChange }: HistoryDialogProps) => {
  const entries = usePlaygroundStore((s) => s.entries);
  const setSource = usePlaygroundStore((s) => s.setSource);
  const setFlags = usePlaygroundStore((s) => s.setFlags);
  const removeFromHistory = usePlaygroundStore((s) => s.removeFromHistory);
  const clearHistory = usePlaygroundStore((s) => s.clearHistory);

  const handleLoad = (entry: HistoryEntry) => {
    setSource(entry.source);
    setFlags(entry.flags);
    onOpenChange(false);
    toast.success("Entrée chargée");
  };

  const handleRemove = (id: string) => {
    removeFromHistory(id);
    toast.success("Entrée supprimée");
  };

  const handleClear = () => {
    if (entries.length === 0) return;
    if (window.confirm("Effacer toutes les entrées de l'historique ?")) {
      clearHistory();
      toast.success("Historique effacé");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Historique</DialogTitle>
          <DialogDescription>
            {entries.length > 0
              ? `Tes ${entries.length} dernières regex testées (30 max, dedup automatique).`
              : "L'historique se construit automatiquement quand tu testes une regex valide."}
          </DialogDescription>
        </DialogHeader>

        {entries.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Aucune regex testée pour l'instant.
          </div>
        ) : (
          <ul className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-md border border-input p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <code className="min-w-0 flex-1 truncate font-mono text-xs">
                    /{entry.source}/{entry.flags.join("")}
                  </code>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatRelative(entry.lastSeenAt ?? entry.createdAt)}
                  </span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoad(entry)}
                    className="flex-1"
                  >
                    Charger
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(entry.id)}
                    aria-label="Supprimer cette entrée"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {entries.length > 0 && (
          <div className="border-t pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-destructive hover:text-destructive"
            >
              Tout effacer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
