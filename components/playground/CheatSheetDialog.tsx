"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  REGEX_SECTIONS,
  SHORTCUTS,
  type CheatSheetSection,
} from "@/lib/cheatsheet/data";

const SectionBlock = ({ section }: { section: CheatSheetSection }) => (
  <div className="space-y-2">
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {section.title}
    </h3>
    <ul className="space-y-1.5">
      {section.entries.map((entry) => (
        <li
          key={entry.syntax}
          className="flex items-baseline gap-3 text-sm"
        >
          <code className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs">
            {entry.syntax}
          </code>
          <span className="text-muted-foreground">{entry.description}</span>
        </li>
      ))}
    </ul>
  </div>
);

export type CheatSheetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CheatSheetDialog = ({
  open,
  onOpenChange,
}: CheatSheetDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cheatsheet</DialogTitle>
          <DialogDescription>
            Référence rapide des tokens regex et des raccourcis du playground.
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[70vh] grid-cols-1 gap-6 overflow-y-auto pr-2 md:grid-cols-2">
          <div className="space-y-5">
            <h2 className="text-sm font-semibold">Tokens regex</h2>
            {REGEX_SECTIONS.map((section) => (
              <SectionBlock key={section.title} section={section} />
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold">Raccourcis clavier</h2>
            <ul className="space-y-1.5">
              {SHORTCUTS.map((s) => (
                <li
                  key={s.combo}
                  className="flex items-baseline gap-3 text-sm"
                >
                  <kbd className="shrink-0 rounded-sm border border-input bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {s.combo}
                  </kbd>
                  <span className="text-muted-foreground">
                    {s.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
