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
    <div className="grid grid-cols-[minmax(0,8rem)_1fr] gap-x-3 gap-y-1.5 text-sm">
      {section.entries.map((entry) => (
        <div key={entry.syntax} className="contents">
          <code className="self-start truncate rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs">
            {entry.syntax}
          </code>
          <span className="text-muted-foreground">{entry.description}</span>
        </div>
      ))}
    </div>
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
      <DialogContent className="max-w-5xl">
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
            <div className="grid grid-cols-[minmax(0,10rem)_1fr] gap-x-3 gap-y-2 text-sm">
              {SHORTCUTS.map((s) => (
                <div key={s.combo} className="contents">
                  <kbd className="self-start truncate rounded-sm border border-input bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {s.combo}
                  </kbd>
                  <span className="text-muted-foreground">{s.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
