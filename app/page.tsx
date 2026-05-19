"use client";

import { RegexEditor } from "@/components/playground/RegexEditor";
import { FlagsToggles } from "@/components/playground/FlagsToggles";

export default function Home() {
  return (
    <main className="flex flex-col flex-1 items-center justify-center gap-8 p-8">
      <div className="w-full max-w-3xl space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Regex Playground
          </h1>
          <p className="text-sm text-muted-foreground">
            Un playground visuel pour tester, décomposer et exporter vos regex.
          </p>
        </header>

        <div className="space-y-3">
          <RegexEditor />
          <FlagsToggles />
        </div>
      </div>
    </main>
  );
}
