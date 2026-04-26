import type { EnrichedNode } from "@/types/regex";

const explainQuantifier = (
  node: Extract<EnrichedNode, { kind: "quantifier" }>,
): string => {
  const { min, max, greedy } = node;
  if (min === max && min === 1)
    return "Exactement 1 occurrence" + (greedy ? "" : " (lazy)");
  if (min === max)
    return `Exactement ${min} occurrences` + (greedy ? "" : " (lazy)");
  if (min === 0 && max === Infinity)
    return "0 ou plusieurs occurrences" + (greedy ? "" : " (lazy)");
  if (min === 1 && max === Infinity)
    return "1 ou plusieurs occurrences" + (greedy ? "" : " (lazy)");
  if (min > 1 && max === Infinity)
    return `Au moins ${min} occurrences` + (greedy ? "" : " (lazy)");
  if (min < max)
    return `Entre ${min} et ${max} occurrences` + (greedy ? "" : " (lazy)");

  return (
    `Quantificateur : de ${min} à ${max === Infinity ? "infini" : max} occurrences` +
    (greedy ? "" : " (lazy)")
  );
};

const explainAssertion = (
  node: Extract<EnrichedNode, { kind: "assertion" }>,
): string => {
  switch (node.assertionKind) {
    case "start":
      return "Ancre — début de chaîne (ou de ligne avec flag m)";
    case "end":
      return "Ancre — fin de chaîne (ou de ligne avec flag m)";
    case "wordBoundary":
      return "Limite de mot (entre \\w et \\W)";
    case "nonWordBoundary":
      return "Pas de limite de mot";
  }
};

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

const explainCharacterSet = (
  node: Extract<EnrichedNode, { kind: "characterSet" }>,
): string => {
  switch (node.setKind) {
    case "digit": {
      const desc = "un chiffre (0-9)";
      return node.negated ? `Tout sauf ${desc}` : cap(desc);
    }
    case "word": {
      const desc = "un caractère de mot (lettre, chiffre, ou _)";
      return node.negated ? `Tout sauf ${desc}` : cap(desc);
    }
    case "space": {
      const desc = "un espace blanc (espace, tab, retour à la ligne...)";
      return node.negated ? `Tout sauf ${desc}` : cap(desc);
    }
    case "any": {
      const desc = "tout caractère (sauf retour ligne, ou tout avec flag s)";
      return node.negated ? `Tout sauf ${desc}` : cap(desc);
    }
    case "unicodeProperty": {
      const desc = `un caractère avec la propriété Unicode ${node.property}`;
      return node.negated ? `Tout sauf ${desc}` : cap(desc);
    }
  }
};

const explainCharacterClass = (
  node: Extract<EnrichedNode, { kind: "characterClass" }>,
): string => {
  if (node.elements.length === 0) return "Classe de caractères vide";
  const elementsExplanation = node.elements
    .map((el) => {
      if (el.type === "char") return `le caractère "${el.value}"`;
      if (el.type === "range")
        return `un caractère entre "${el.from}" et "${el.to}"`;
    })
    .join(" ou ");
  return (node.negated ? "Tout sauf " : "") + elementsExplanation;
};

const explainGroup = (
  node: Extract<EnrichedNode, { kind: "group" }>,
): string => {
  if (!node.capturing) {
    return "Groupe non capturant";
  }
  if (node.name) {
    return `Groupe capturant nommé "${node.name}" (index ${node.index})`;
  }
  return "Groupe capturant";
};

const explainLookaround = (
  node: Extract<EnrichedNode, { kind: "lookaround" }>,
): string => {
  const label = node.direction === "ahead" ? "Lookahead" : "Lookbehind";
  const polarity = node.negative ? "négatif" : "positif";
  const detail =
    node.direction === "ahead"
      ? node.negative
        ? "vérifie que la suite ne matche pas"
        : "vérifie que la suite matche, sans consommer"
      : node.negative
        ? "vérifie que ce qui précède ne matche pas"
        : "vérifie que ce qui précède matche";
  return `${label} ${polarity} — ${detail}`;
};

const explainLiteral = (
  node: Extract<EnrichedNode, { kind: "literal" }>,
): string => {
  return `Le caractère littéral "${node.value}"`;
};

const explainBackreference = (
  node: Extract<EnrichedNode, { kind: "backreference" }>,
): string => {
  if (typeof node.target === "number") {
    return `Référence au groupe capturant #${node.target}`;
  }
  return `Référence au groupe nommé "${node.target}"`;
};

const explainAlternative = (
  node: Extract<EnrichedNode, { kind: "alternative" }>,
): string => {
  return `Alternative — ${node.children?.length ?? 0} branches possibles`;
};

const assertNever = (x: never): never => {
  throw new Error(`Unhandled kind: ${JSON.stringify(x)}`);
};

export const explain = (node: EnrichedNode): string => {
  switch (node.kind) {
    case "quantifier":
      return explainQuantifier(node);
    case "assertion":
      return explainAssertion(node);
    case "characterSet":
      return explainCharacterSet(node);
    case "characterClass":
      return explainCharacterClass(node);
    case "group":
      return explainGroup(node);
    case "lookaround":
      return explainLookaround(node);
    case "literal":
      return explainLiteral(node);
    case "backreference":
      return explainBackreference(node);
    case "alternative":
      return explainAlternative(node);
    default:
      return assertNever(node);
  }
};
