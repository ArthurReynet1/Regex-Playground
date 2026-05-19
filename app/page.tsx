"use client";

import { RegexEditor } from "@/components/playground/RegexEditor";
import { FlagsToggles } from "@/components/playground/FlagsToggles";
import { TextInput } from "@/components/playground/TextInput";

export default function Home() {
  return (
    <main className="flex flex-col flex-1 items-center p-8">
      <div className="w-full max-w-3xl space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Regex Playground
          </h1>
          <p className="text-sm text-muted-foreground">
            Un playground visuel pour tester, décomposer et exporter vos regex.
          </p>
        </header>

        <section className="space-y-3" aria-labelledby="regex-section">
          <h2
            id="regex-section"
            className="text-sm font-semibold text-muted-foreground"
          >
            Regex
          </h2>
          <RegexEditor />
          <FlagsToggles />
        </section>

        <section className="space-y-3" aria-labelledby="text-section">
          <h2
            id="text-section"
            className="text-sm font-semibold text-muted-foreground"
          >
            Texte à tester
          </h2>
          <TextInput />
        </section>
      </div>
    </main>
  );
}
