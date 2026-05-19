import { describe, it, expect } from "vitest";
import { parse } from "@/lib/regex/parse";
import { enrich } from "@/lib/regex/enrich";
import { detectReDoS } from "@/lib/regex/redos";
import type { ReDoSWarning } from "@/types/regex";

const detectFromSource = (source: string, flags = ""): ReDoSWarning[] => {
  const result = parse(source, flags);
  if (!result.ok) throw new Error(`Parse failed: ${result.error.message}`);
  const ast = enrich(result.pattern);
  return detectReDoS(ast, source);
};

describe("ReDoS — true positives", () => {
  it("flags (a+)+ as nested quantifier", () => {
    const warnings = detectFromSource("(a+)+");
    expect(warnings.some((w) => w.rule === "nested-quantifier")).toBe(true);
  });

  it("flags (a*)* as nested quantifier", () => {
    const warnings = detectFromSource("(a*)*");
    expect(warnings.some((w) => w.rule === "nested-quantifier")).toBe(true);
  });

  it("flags (a+)* as nested quantifier", () => {
    const warnings = detectFromSource("(a+)*");
    expect(warnings.some((w) => w.rule === "nested-quantifier")).toBe(true);
  });

  it("flags ((a+)+)+ as deeply nested quantifier", () => {
    const warnings = detectFromSource("((a+)+)+");
    expect(warnings.some((w) => w.rule === "nested-quantifier")).toBe(true);
  });

  it("flags (a|a)+ as overlapping alternation", () => {
    const warnings = detectFromSource("(a|a)+");
    expect(warnings.some((w) => w.rule === "overlapping-alternation")).toBe(
      true,
    );
  });

  it("flags (a|ab)+ as overlapping alternation", () => {
    const warnings = detectFromSource("(a|ab)+");
    expect(warnings.some((w) => w.rule === "overlapping-alternation")).toBe(
      true,
    );
  });

  it("flags (abc|abd)+ as overlapping alternation", () => {
    const warnings = detectFromSource("(abc|abd)+");
    expect(warnings.some((w) => w.rule === "overlapping-alternation")).toBe(
      true,
    );
  });

  it("flags .*.* as repeated star", () => {
    const warnings = detectFromSource(".*.*");
    expect(warnings.some((w) => w.rule === "repeated-star")).toBe(true);
  });

  it("flags .+.+ as repeated star", () => {
    const warnings = detectFromSource(".+.+");
    expect(warnings.some((w) => w.rule === "repeated-star")).toBe(true);
  });

  it("flags (.*)+ as nested quantifier", () => {
    const warnings = detectFromSource("(.*)+");
    expect(warnings.some((w) => w.rule === "nested-quantifier")).toBe(true);
  });
});

describe("ReDoS — true negatives (no false positives)", () => {
  it("does NOT flag a+ (single quantifier)", () => {
    const warnings = detectFromSource("a+");
    expect(warnings).toHaveLength(0);
  });

  it("does NOT flag a+b+ (sequential quantifiers)", () => {
    const warnings = detectFromSource("a+b+");
    expect(warnings.some((w) => w.rule === "nested-quantifier")).toBe(false);
  });

  it("does NOT flag (ab)+ (quantifier on group without inner quantifier)", () => {
    const warnings = detectFromSource("(ab)+");
    expect(warnings).toHaveLength(0);
  });

  it("does NOT flag (a{3,5})+ (bounded inner quantifier)", () => {
    const warnings = detectFromSource("(a{3,5})+");
    expect(warnings.some((w) => w.rule === "nested-quantifier")).toBe(false);
  });

  it("does NOT flag (a|b)+ (disjoint alternation)", () => {
    const warnings = detectFromSource("(a|b)+");
    expect(warnings.some((w) => w.rule === "overlapping-alternation")).toBe(
      false,
    );
  });

  it("does NOT flag (cat|dog|fish)+ (disjoint alternation)", () => {
    const warnings = detectFromSource("(cat|dog|fish)+");
    expect(warnings.some((w) => w.rule === "overlapping-alternation")).toBe(
      false,
    );
  });

  it("does NOT flag .* alone", () => {
    const warnings = detectFromSource(".*");
    expect(warnings).toHaveLength(0);
  });

  it("does NOT flag .{3,5} (bounded any)", () => {
    const warnings = detectFromSource(".{3,5}");
    expect(warnings).toHaveLength(0);
  });

  it("does NOT flag (a|b) without quantifier (no repeated context)", () => {
    const warnings = detectFromSource("(a|b)");
    expect(warnings).toHaveLength(0);
  });

  it("does NOT flag ^\\d{3}-\\d{4}$ (phone number pattern)", () => {
    const warnings = detectFromSource("^\\d{3}-\\d{4}$");
    expect(warnings).toHaveLength(0);
  });
});
