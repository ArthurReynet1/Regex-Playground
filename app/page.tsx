"use client";

import { RegexEditor } from "@/components/playground/RegexEditor";
import { FlagsToggles } from "@/components/playground/FlagsToggles";
import { TextInput } from "@/components/playground/TextInput";
import { AstTree } from "@/components/playground/AstTree";
import { CapturesPanel } from "@/components/playground/CapturesPanel";
import { ReDoSBanner } from "@/components/playground/ReDoSBanner";
import { HoverProvider } from "@/contexts/HoverContext";
import { MatchHoverProvider } from "@/contexts/MatchHoverContext";
import { useRegexWorker } from "@/hooks/useRegexWorker";

export default function Home() {
  useRegexWorker();

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
                <h2
                  id="regex-section"
                  className="text-sm font-semibold text-muted-foreground"
                >
                  Regex
                </h2>
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
            </aside>
          </div>
        </div>
      </main>
      </MatchHoverProvider>
    </HoverProvider>
  );
}
