import { describe, it, expect } from "vitest";
import { parse } from "@/lib/regex/parse";
import { enrich } from "@/lib/regex/enrich";
import { ecmascriptTranspiler } from "@/lib/transpilers/ecmascript";
import { pythonTranspiler } from "@/lib/transpilers/python";
import { csharpTranspiler } from "@/lib/transpilers/csharp";
import type { Transpiler } from "@/lib/transpilers/types";

const transpileFromSource = (
  transpiler: Transpiler,
  source: string,
  flags = "",
) => {
  const result = parse(source, flags);
  if (!result.ok) throw new Error(`Parse failed: ${result.error.message}`);
  const ast = enrich(result.pattern);
  return transpiler.transpile({ ast, source, flags });
};

// Shared fixtures used across all 3 targets
const FIXTURES: Array<{ name: string; source: string; flags: string }> = [
  { name: "simple-digits", source: "\\d+", flags: "g" },
  { name: "phone-number", source: "^(\\d{3})-(\\d{4})$", flags: "" },
  { name: "named-group-year", source: "(?<year>\\d{4})", flags: "" },
  {
    name: "named-group-with-backref",
    source: "(?<word>\\w+)\\s+\\k<word>",
    flags: "",
  },
  { name: "char-class-lower", source: "[a-z]+", flags: "gi" },
  { name: "char-class-negated", source: "[^0-9]", flags: "" },
  { name: "lookahead-positive", source: "(?=foo)bar", flags: "" },
  { name: "lookbehind-fixed", source: "(?<=abc)def", flags: "" },
  { name: "lookbehind-variable", source: "(?<=ab|abcd)xyz", flags: "" },
  { name: "alternation-simple", source: "cat|dog|fish", flags: "" },
  { name: "flag-dotall", source: ".+", flags: "gs" },
  { name: "flag-multi", source: "^foo$", flags: "gim" },
];

describe("ECMAScript transpiler", () => {
  for (const fx of FIXTURES) {
    it(`snapshot — ${fx.name}`, () => {
      const result = transpileFromSource(
        ecmascriptTranspiler,
        fx.source,
        fx.flags,
      );
      expect(result).toMatchSnapshot();
    });
  }

  it("has no warnings on any fixture (canonical target)", () => {
    for (const fx of FIXTURES) {
      const result = transpileFromSource(
        ecmascriptTranspiler,
        fx.source,
        fx.flags,
      );
      expect(result.warnings).toHaveLength(0);
    }
  });
});

describe("Python transpiler", () => {
  for (const fx of FIXTURES) {
    it(`snapshot — ${fx.name}`, () => {
      const result = transpileFromSource(pythonTranspiler, fx.source, fx.flags);
      expect(result).toMatchSnapshot();
    });
  }

  it("converts (?<name>) to (?P<name>) with info warning", () => {
    const result = transpileFromSource(
      pythonTranspiler,
      "(?<year>\\d{4})",
      "",
    );
    expect(result.pattern).toContain("(?P<year>");
    expect(result.warnings.some((w) => w.severity === "info")).toBe(true);
  });

  it("converts \\k<name> to (?P=name)", () => {
    const result = transpileFromSource(
      pythonTranspiler,
      "(?<w>\\w+)\\k<w>",
      "",
    );
    expect(result.pattern).toContain("(?P=w)");
  });

  it("emits 🔴 error warning on variable-length lookbehind", () => {
    const result = transpileFromSource(
      pythonTranspiler,
      "(?<=ab|abcd)xyz",
      "",
    );
    expect(result.warnings.some((w) => w.severity === "error")).toBe(true);
  });

  it("does NOT emit error on fixed-length lookbehind", () => {
    const result = transpileFromSource(pythonTranspiler, "(?<=abc)def", "");
    expect(result.warnings.some((w) => w.severity === "error")).toBe(false);
  });

  it("warns on global flag (no equivalent)", () => {
    const result = transpileFromSource(pythonTranspiler, "\\d+", "g");
    expect(
      result.warnings.some(
        (w) => w.severity === "diff" && w.message.includes("'g'"),
      ),
    ).toBe(true);
  });
});

describe("C# transpiler", () => {
  for (const fx of FIXTURES) {
    it(`snapshot — ${fx.name}`, () => {
      const result = transpileFromSource(csharpTranspiler, fx.source, fx.flags);
      expect(result).toMatchSnapshot();
    });
  }

  it("maps flag 's' to RegexOptions.Singleline with info warning", () => {
    const result = transpileFromSource(csharpTranspiler, ".+", "s");
    expect(result.flags).toContain("Singleline");
    expect(
      result.warnings.some(
        (w) => w.severity === "info" && w.message.includes("Singleline"),
      ),
    ).toBe(true);
  });

  it("warns on global flag (no equivalent)", () => {
    const result = transpileFromSource(csharpTranspiler, "\\d+", "g");
    expect(
      result.warnings.some(
        (w) => w.severity === "diff" && w.message.includes("'g'"),
      ),
    ).toBe(true);
  });

  it("does NOT emit error on variable-length lookbehind (.NET supports them)", () => {
    const result = transpileFromSource(csharpTranspiler, "(?<=ab|abcd)xyz", "");
    expect(result.warnings.some((w) => w.severity === "error")).toBe(false);
  });
});
