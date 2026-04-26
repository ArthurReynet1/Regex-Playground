import type { AST } from "@eslint-community/regexpp";
import type { EnrichedNode, EnrichedNodeBase } from "@/types/regex";
import { explain } from "./explain";

const buildBase = (
  node: AST.Node,
  partial: Omit<EnrichedNodeBase, "raw" | "explanation" | "start" | "end">,
): Omit<EnrichedNodeBase, "explanation"> => ({
  start: node.start,
  end: node.end,
  raw: node,
  ...partial,
});

const buildAlternativesContainer = (
  parentNode: AST.Node & { alternatives: AST.Alternative[] },
  groupIndexes: Map<AST.CapturingGroup, number>,
): EnrichedNode[] => {
  if (parentNode.alternatives.length === 1) {
    return [buildSequence(parentNode.alternatives[0], groupIndexes)];
  }
  const branches = parentNode.alternatives.map((alt) =>
    buildSequence(alt, groupIndexes),
  );
  const inner: EnrichedNode = {
    kind: "alternative",
    ...buildBase(parentNode, { children: branches }),
    explanation: "",
  };
  return [{ ...inner, explanation: explain(inner) }];
};

const collectCapturingGroupIndexes = (
  pattern: AST.Pattern,
): Map<AST.CapturingGroup, number> => {
  const map = new Map<AST.CapturingGroup, number>();
  let counter = 0;

  const walk = (node: AST.Node): void => {
    if (node.type === "CapturingGroup") {
      counter++;
      map.set(node, counter);
    }
    if ("alternatives" in node) {
      for (const alt of node.alternatives) walk(alt);
    }
    if ("elements" in node) {
      for (const el of node.elements) walk(el as AST.Node);
    }
    if ("element" in node) {
      walk(node.element as AST.Node);
    }
  };

  walk(pattern);
  return map;
};

const visit = (
  node: AST.Node,
  groupIndexes: Map<AST.CapturingGroup, number>,
): EnrichedNode | null => {
  switch (node.type) {
    case "Alternative":
      return buildSequence(node, groupIndexes);
    case "CapturingGroup":
    case "Group":
      return buildGroup(node, groupIndexes);
    case "Quantifier":
      return buildQuantifier(node, groupIndexes);
    case "Assertion":
      return buildAssertion(node, groupIndexes);
    case "CharacterSet":
      return buildCharacterSet(node);
    case "CharacterClass":
      return buildCharacterClass(node);
    case "Character":
      return buildLiteral(node);
    case "Backreference":
      return buildBackreference(node);
    default:
      return null;
  }
};

export const enrich = (pattern: AST.Pattern): EnrichedNode | null => {
  if (pattern.alternatives.length === 0) return null;

  const groupIndexes = collectCapturingGroupIndexes(pattern);
  if (pattern.alternatives.length === 1) {
    return buildSequence(pattern.alternatives[0], groupIndexes);
  }

  const branches = pattern.alternatives.map((alt) =>
    buildSequence(alt, groupIndexes),
  );

  const node: EnrichedNode = {
    kind: "alternative",
    ...buildBase(pattern, { children: branches }),
    explanation: "",
  };
  return { ...node, explanation: explain(node) };
};

const buildSequence = (
  node: AST.Alternative,
  groupIndexes: Map<AST.CapturingGroup, number>,
): EnrichedNode => {
  if (node.elements.length === 1) {
    const child = visit(node.elements[0], groupIndexes);
    if (child) return child;
  }

  const children = node.elements
    .map((el) => visit(el, groupIndexes))
    .filter((n): n is EnrichedNode => n !== null);

  const enriched: EnrichedNode = {
    kind: "sequence",
    ...buildBase(node, { children }),
    explanation: "",
  };
  return { ...enriched, explanation: explain(enriched) };
};

const buildGroup = (
  node: AST.Group | AST.CapturingGroup,
  groupIndexes: Map<AST.CapturingGroup, number>,
): EnrichedNode => {
  const children = buildAlternativesContainer(node, groupIndexes);

  const isCapturing = node.type === "CapturingGroup";

  const groupNode: EnrichedNode = {
    kind: "group",
    capturing: isCapturing,
    index: isCapturing ? (groupIndexes.get(node) ?? 0) : 0,
    name: isCapturing ? (node.name ?? undefined) : undefined,
    ...buildBase(node, { children }),
    explanation: "",
  };

  return { ...groupNode, explanation: explain(groupNode) };
};

const buildQuantifier = (
  node: AST.Quantifier,
  groupIndexes: Map<AST.CapturingGroup, number>,
): EnrichedNode => {
  const child = visit(node.element as AST.Node, groupIndexes);
  const children = child ? [child] : [];

  const enriched: EnrichedNode = {
    kind: "quantifier",
    min: node.min,
    max: node.max,
    greedy: node.greedy,
    ...buildBase(node, { children }),
    explanation: "",
  };
  return { ...enriched, explanation: explain(enriched) };
};

const buildAssertion = (
  node: AST.Assertion,
  groupIndexes: Map<AST.CapturingGroup, number>,
): EnrichedNode => {
  if (node.kind === "lookahead" || node.kind === "lookbehind") {
    const children = buildAlternativesContainer(node, groupIndexes);

    const enriched: EnrichedNode = {
      kind: "lookaround",
      direction: node.kind === "lookahead" ? "ahead" : "behind",
      negative: node.negate,
      ...buildBase(node, { children }),
      explanation: "",
    };
    return { ...enriched, explanation: explain(enriched) };
  }

  let assertionKind: "start" | "end" | "wordBoundary" | "nonWordBoundary";
  switch (node.kind) {
    case "start":
      assertionKind = "start";
      break;
    case "end":
      assertionKind = "end";
      break;
    case "word":
      assertionKind = node.negate ? "nonWordBoundary" : "wordBoundary";
      break;
  }

  const enriched: EnrichedNode = {
    kind: "assertion",
    assertionKind,
    ...buildBase(node, {}),
    explanation: "",
  };
  return { ...enriched, explanation: explain(enriched) };
};

const buildLiteral = (node: AST.Character): EnrichedNode => {
  const enriched: EnrichedNode = {
    kind: "literal",
    value: String.fromCodePoint(node.value),
    ...buildBase(node, {}),
    explanation: "",
  };
  return { ...enriched, explanation: explain(enriched) };
};

const buildBackreference = (node: AST.Backreference): EnrichedNode => {
  const enriched: EnrichedNode = {
    kind: "backreference",
    target: node.ref,
    ...buildBase(node, {}),
    explanation: "",
  };
  return { ...enriched, explanation: explain(enriched) };
};

const buildCharacterSet = (node: AST.CharacterSet): EnrichedNode => {
  let setKind: "digit" | "word" | "space" | "any" | "unicodeProperty";
  let property: string | undefined;

  switch (node.kind) {
    case "digit":
      setKind = "digit";
      break;
    case "word":
      setKind = "word";
      break;
    case "space":
      setKind = "space";
      break;
    case "any":
      setKind = "any";
      break;
    case "property":
      setKind = "unicodeProperty";
      property = node.value !== null ? `${node.key}=${node.value}` : node.key;
      break;
  }

  const negated = node.kind === "any" ? false : node.negate;

  const enriched: EnrichedNode = {
    kind: "characterSet",
    setKind,
    negated,
    property,
    ...buildBase(node, {}),
    explanation: "",
  };
  return { ...enriched, explanation: explain(enriched) };
};

const buildCharacterClass = (node: AST.CharacterClass): EnrichedNode => {
  type Elem =
    | { type: "char"; value: string }
    | { type: "range"; from: string; to: string };

  const elements: Elem[] = node.elements
    .map((el): Elem | null => {
      if (el.type === "Character") {
        return { type: "char", value: String.fromCodePoint(el.value) };
      }
      if (el.type === "CharacterClassRange") {
        return {
          type: "range",
          from: String.fromCodePoint(el.min.value),
          to: String.fromCodePoint(el.max.value),
        };
      }

      return null;
    })
    .filter((e): e is Elem => e !== null);

  const enriched: EnrichedNode = {
    kind: "characterClass",
    elements,
    negated: node.negate,
    ...buildBase(node, {}),
    explanation: "",
  };
  return { ...enriched, explanation: explain(enriched) };
};
