import type { EnrichedNode, ReDoSWarning } from "@/types/regex";

// A quantifier is "unbounded" if its max is Infinity or extremely large.
// Bounded quantifiers like {3,5} cannot cause exponential backtracking.
const UNBOUNDED_THRESHOLD = 100;

const isUnboundedQuantifier = (
  node: EnrichedNode,
): node is Extract<EnrichedNode, { kind: "quantifier" }> =>
  node.kind === "quantifier" &&
  (node.max === Infinity || node.max > UNBOUNDED_THRESHOLD);

const containsUnboundedQuantifier = (node: EnrichedNode): boolean => {
  if (isUnboundedQuantifier(node)) return true;
  if (node.children) {
    for (const child of node.children) {
      if (containsUnboundedQuantifier(child)) return true;
    }
  }
  return false;
};

const isDotStar = (node: EnrichedNode): boolean => {
  if (node.kind !== "quantifier") return false;
  if (node.max !== Infinity && node.max <= UNBOUNDED_THRESHOLD) return false;
  const child = node.children?.[0];
  if (!child) return false;
  // Direct .* / .+
  if (child.kind === "characterSet" && child.setKind === "any") return true;
  // sequence wrapping a single any (rare but possible)
  if (
    child.kind === "sequence" &&
    child.children?.length === 1 &&
    child.children[0].kind === "characterSet" &&
    child.children[0].setKind === "any"
  ) {
    return true;
  }
  return false;
};

// Rule 1: Nested quantifier — an unbounded quantifier whose subject
// also contains an unbounded quantifier.
const detectNestedQuantifier = (root: EnrichedNode): ReDoSWarning[] => {
  const warnings: ReDoSWarning[] = [];
  const walk = (node: EnrichedNode) => {
    if (isUnboundedQuantifier(node) && node.children) {
      for (const child of node.children) {
        if (containsUnboundedQuantifier(child)) {
          warnings.push({
            rule: "nested-quantifier",
            offset: node.start,
            message:
              "Quantifieur imbriqué — risque de catastrophic backtracking",
          });
          break;
        }
      }
    }
    if (node.children) {
      for (const child of node.children) walk(child);
    }
  };
  walk(root);
  return warnings;
};

// Rule 2: Overlapping alternation — an alternation where at least one
// branch is a prefix of another (or identical). Only flagged if the
// alternation is itself inside an unbounded quantifier or repeated context.
const detectOverlappingAlternation = (
  root: EnrichedNode,
  source: string,
): ReDoSWarning[] => {
  const warnings: ReDoSWarning[] = [];

  const isInsideUnboundedAncestor = (
    target: EnrichedNode,
    current: EnrichedNode,
    insideUnbounded: boolean,
  ): boolean => {
    if (current === target) return insideUnbounded;
    if (!current.children) return false;
    const nextInside =
      insideUnbounded || isUnboundedQuantifier(current);
    for (const child of current.children) {
      if (isInsideUnboundedAncestor(target, child, nextInside)) return true;
    }
    return false;
  };

  const commonPrefixLength = (a: string, b: string): number => {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return i;
  };

  const walk = (node: EnrichedNode) => {
    if (
      node.kind === "alternative" &&
      node.children &&
      node.children.length >= 2 &&
      isInsideUnboundedAncestor(node, root, false)
    ) {
      const branches = node.children;
      let flagged = false;
      for (let i = 0; i < branches.length && !flagged; i++) {
        for (let j = i + 1; j < branches.length && !flagged; j++) {
          const a = source.slice(branches[i].start, branches[i].end);
          const b = source.slice(branches[j].start, branches[j].end);
          if (a.length === 0 || b.length === 0) continue;
          if (commonPrefixLength(a, b) > 0) {
            warnings.push({
              rule: "overlapping-alternation",
              offset: node.start,
              message:
                "Alternance avec préfixes chevauchants dans un contexte répété — risque de catastrophic backtracking",
            });
            flagged = true;
          }
        }
      }
    }
    if (node.children) {
      for (const child of node.children) walk(child);
    }
  };
  walk(root);
  return warnings;
};

// Rule 3: Multiple .* (or .+) at the same level — siblings, not nested.
// Two unbounded dot-quantifiers as siblings can backtrack massively.
const detectRepeatedStar = (root: EnrichedNode): ReDoSWarning[] => {
  const warnings: ReDoSWarning[] = [];
  const walk = (node: EnrichedNode) => {
    if (node.children) {
      const dotStarSiblings = node.children.filter(isDotStar);
      if (dotStarSiblings.length >= 2) {
        warnings.push({
          rule: "repeated-star",
          offset: dotStarSiblings[0].start,
          message:
            "Plusieurs '.*' ou '.+' au même niveau — risque de catastrophic backtracking",
        });
      }
      for (const child of node.children) walk(child);
    }
  };
  walk(root);
  return warnings;
};

export const detectReDoS = (
  root: EnrichedNode | null,
  source: string,
): ReDoSWarning[] => {
  if (!root) return [];
  return [
    ...detectNestedQuantifier(root),
    ...detectOverlappingAlternation(root, source),
    ...detectRepeatedStar(root),
  ];
};
