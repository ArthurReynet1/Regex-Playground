"use client";

import { useEffect, useState } from "react";
import { History, Library } from "lucide-react";
import { RegexEditor } from "@/components/playground/RegexEditor";
import { FlagsToggles } from "@/components/playground/FlagsToggles";
import { TextInput } from "@/components/playground/TextInput";
import { AstTree } from "@/components/playground/AstTree";
import { CapturesPanel } from "@/components/playground/CapturesPanel";
import { ReDoSBanner } from "@/components/playground/ReDoSBanner";
import { ExportPanel } from "@/components/playground/ExportPanel";
import { LibraryDialog } from "@/components/playground/LibraryDialog";
import { HistoryDialog } from "@/components/playground/HistoryDialog";
import { Button } from "@/components/ui/button";
import { HoverProvider } from "@/contexts/HoverContext";
import { MatchHoverProvider } from "@/contexts/MatchHoverContext";
import { useRegexWorker } from "@/hooks/useRegexWorker";
import { useLocalHistory } from "@/hooks/useLocalHistory";

export default function Home() {
  useRegexWorker();
  useLocalHistory();
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setLibraryOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <HoverProvider>
      <MatchHoverProvider>
      <main className="flex flex-col flex-1 p-4 md:p-8">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <header className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Regex Playground
            </h1>
            <p className="text-sm text-muted-foreground">
              Un playground visuel pour tester, décomposer et exporter vos
              regex.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
              <section
                className="space-y-3"
                aria-labelledby="regex-section"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2
                    id="regex-section"
                    className="text-sm font-semibold text-muted-foreground"
                  >
                    Regex
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setHistoryOpen(true)}
                      className="gap-2"
                    >
                      <History className="h-3.5 w-3.5" />
                      Historique
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setLibraryOpen(true)}
                      className="gap-2"
                    >
                      <Library className="h-3.5 w-3.5" />
                      Bibliothèque
                      <kbd className="ml-1 hidden rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                        ⌘K
                      </kbd>
                    </Button>
                  </div>
                </div>
                <RegexEditor />
                <FlagsToggles />
                <ReDoSBanner />
              </section>

              <section
                className="space-y-3"
                aria-labelledby="text-section"
              >
                <h2
                  id="text-section"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  Texte à tester
                </h2>
                <TextInput />
              </section>
            </div>

            <aside className="space-y-6">
              <section
                className="space-y-3"
                aria-labelledby="ast-section"
              >
                <h2
                  id="ast-section"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  Décomposition
                </h2>
                <AstTree />
              </section>

              <section
                className="space-y-3"
                aria-labelledby="captures-section"
              >
                <h2
                  id="captures-section"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  Matches & captures
                </h2>
                <CapturesPanel />
              </section>

              <section
                className="space-y-3"
                aria-labelledby="export-section"
              >
                <h2
                  id="export-section"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  Export
                </h2>
                <ExportPanel />
              </section>
            </aside>
          </div>
        </div>
      </main>
      <LibraryDialog open={libraryOpen} onOpenChange={setLibraryOpen} />
      <HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
      </MatchHoverProvider>
    </HoverProvider>
  );
}
