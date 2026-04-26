import { describe, it, expect } from "vitest";
import { parse } from "@/lib/regex/parse";
import { enrich } from "@/lib/regex/enrich";
import type { EnrichedNode } from "@/types/regex";

const enrichRegex = (source: string, flags = "") => {
  const result = parse(source, flags);
  if (!result.ok) throw new Error(`Parse failed: ${result.error.message}`);
  return enrich(result.pattern);
};

const expectKind = <K extends EnrichedNode["kind"]>(
  node: EnrichedNode | null | undefined,
  kind: K,
): Extract<EnrichedNode, { kind: K }> => {
  expect(node).toBeTruthy();
  expect(node?.kind).toBe(kind);
  return node as Extract<EnrichedNode, { kind: K }>;
};

describe("enrich — happy path", () => {
  it("simple literal sequence", () => {
    const ast = enrichRegex("abc");
    const seq = expectKind(ast, "sequence");
    expect(seq.children).toHaveLength(3);

    const expected = ["a", "b", "c"];
    seq.children?.forEach((child, i) => {
      const lit = expectKind(child, "literal");
      expect(lit.value).toBe(expected[i]);
    });
  });

  it("assertions start/end", () => {
    const ast = enrichRegex("^a$");
    const seq = expectKind(ast, "sequence");
    expect(seq.children).toHaveLength(3);

    const start = expectKind(seq.children?.[0], "assertion");
    expect(start.assertionKind).toBe("start");

    const lit = expectKind(seq.children?.[1], "literal");
    expect(lit.value).toBe("a");

    const end = expectKind(seq.children?.[2], "assertion");
    expect(end.assertionKind).toBe("end");
  });

  it("quantifier + characterSet digit", () => {
    const ast = enrichRegex("\\d+");
    const qua = expectKind(ast, "quantifier");
    expect(qua.min).toBe(1);
    expect(qua.max).toBe(Infinity);
    expect(qua.greedy).toBe(true);
    expect(qua.children).toHaveLength(1);

    const set = expectKind(qua.children?.[0], "characterSet");
    expect(set.setKind).toBe("digit");
    expect(set.negated).toBe(false);
  });

  it("capturing group + quantifier exact + literal", () => {
    const ast = enrichRegex("(\\d{3})-\\d{4}");
    const seq = expectKind(ast, "sequence");
    expect(seq.children).toHaveLength(3);

    const group = expectKind(seq.children?.[0], "group");
    expect(group.capturing).toBe(true);
    expect(group.index).toBe(1);
    expect(group.name).toBeUndefined();
    expect(group.children).toHaveLength(1);

    const qua1 = expectKind(group.children?.[0], "quantifier");
    expect(qua1.min).toBe(3);
    expect(qua1.max).toBe(3);

    const lit = expectKind(seq.children?.[1], "literal");
    expect(lit.value).toBe("-");

    const qua2 = expectKind(seq.children?.[2], "quantifier");
    expect(qua2.min).toBe(4);
    expect(qua2.max).toBe(4);
    expect(qua2.greedy).toBe(true);
  });

  it("non-capturing group", () => {
    const ast = enrichRegex("(?:foo)");
    const group = expectKind(ast, "group");
    expect(group.capturing).toBe(false);
    expect(group.name).toBeUndefined();
    expect(group.children).toHaveLength(1);

    const seq = expectKind(group.children?.[0], "sequence");
    expect(seq.children).toHaveLength(3);

    const expected = ["f", "o", "o"];
    seq.children?.forEach((child, i) => {
      const lit = expectKind(child, "literal");
      expect(lit.value).toBe(expected[i]);
    });
  });

  it("named capturing group", () => {
    const ast = enrichRegex("(?<year>\\d{4})");
    const group = expectKind(ast, "group");
    expect(group.capturing).toBe(true);
    expect(group.name).toBe("year");
    expect(group.index).toBe(1);
    expect(group.children).toHaveLength(1);

    const qua = expectKind(group.children?.[0], "quantifier");
    expect(qua.min).toBe(4);
    expect(qua.max).toBe(4);

    const set = expectKind(qua.children?.[0], "characterSet");
    expect(set.setKind).toBe("digit");
  });

  it("alternative top-level (3 branches)", () => {
    const ast = enrichRegex("a|b|c");
    const alt = expectKind(ast, "alternative");
    expect(alt.children).toHaveLength(3);

    const expected = ["a", "b", "c"];
    alt.children?.forEach((child, i) => {
      const lit = expectKind(child, "literal");
      expect(lit.value).toBe(expected[i]);
    });
  });

  it("character class simple range", () => {
    const ast = enrichRegex("[a-z]");
    const cc = expectKind(ast, "characterClass");
    expect(cc.negated).toBe(false);
    expect(cc.elements).toHaveLength(1);
    expect(cc.elements[0]).toEqual({ type: "range", from: "a", to: "z" });
  });

  it("character class negated", () => {
    const ast = enrichRegex("[^0-9]");
    const cc = expectKind(ast, "characterClass");
    expect(cc.negated).toBe(true);
    expect(cc.elements).toHaveLength(1);
    expect(cc.elements[0]).toEqual({ type: "range", from: "0", to: "9" });
  });

  it("lookahead positif", () => {
    const ast = enrichRegex("(?=foo)");
    const look = expectKind(ast, "lookaround");
    expect(look.direction).toBe("ahead");
    expect(look.negative).toBe(false);
    expect(look.children).toHaveLength(1);

    const seq = expectKind(look.children?.[0], "sequence");
    expect(seq.children).toHaveLength(3);
  });

  it("lookbehind négatif", () => {
    const ast = enrichRegex("(?<!bar)");
    const look = expectKind(ast, "lookaround");
    expect(look.direction).toBe("behind");
    expect(look.negative).toBe(true);
    expect(look.children).toHaveLength(1);

    const seq = expectKind(look.children?.[0], "sequence");
    expect(seq.children).toHaveLength(3);
  });

  it("backreference numérique", () => {
    const ast = enrichRegex("(.)\\1");
    const seq = expectKind(ast, "sequence");
    expect(seq.children).toHaveLength(2);

    const group = expectKind(seq.children?.[0], "group");
    expect(group.capturing).toBe(true);
    expect(group.index).toBe(1);

    const backref = expectKind(seq.children?.[1], "backreference");
    expect(backref.target).toBe(1);
  });

  it("word boundary assertion", () => {
    const ast = enrichRegex("\\b");
    const assertion = expectKind(ast, "assertion");
    expect(assertion.assertionKind).toBe("wordBoundary");
  });

  it("lazy quantifier + any", () => {
    const ast = enrichRegex(".*?");
    const qua = expectKind(ast, "quantifier");
    expect(qua.min).toBe(0);
    expect(qua.max).toBe(Infinity);
    expect(qua.greedy).toBe(false);
    expect(qua.children).toHaveLength(1);

    const set = expectKind(qua.children?.[0], "characterSet");
    expect(set.setKind).toBe("any");
    expect(set.negated).toBe(false);
  });

  it("unicode property with flag u", () => {
    const ast = enrichRegex("\\p{Letter}", "u");
    const set = expectKind(ast, "characterSet");
    expect(set.setKind).toBe("unicodeProperty");
    expect(set.negated).toBe(false);
    expect(set.property).toContain("Letter");
  });
});

describe("enrich — parseError", () => {
  it("unterminated group", () => {
    const result = parse("(", "");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toBeTruthy();
    expect(typeof result.error.offset).toBe("number");
  });

  it("unterminated character class", () => {
    const result = parse("[", "");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toBeTruthy();
    expect(typeof result.error.offset).toBe("number");
  });

  it("duplicate capture group name", () => {
    const result = parse("(?<dup>x)(?<dup>y)", "");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toBeTruthy();
  });

  it("invalid flag", () => {
    const result = parse("a", "z");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toBeTruthy();
  });

  it("nothing to repeat (lone quantifier)", () => {
    const result = parse("+abc", "");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toBeTruthy();
  });
});
