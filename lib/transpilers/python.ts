import type { EnrichedNode, TranspileWarning } from "@/types/regex";
import type { Transpiler, TranspileInput, TranspileResult } from "./types";
import { buildPythonFlagsExpression } from "./common/flag-map";
import { escapeForPythonRawString } from "./common/host-escape";

// Transform JS regex syntax to Python re-compatible syntax:
//   (?<name>...)  →  (?P<name>...)
//   \k<name>      →  (?P=name)
const transformPattern = (
  source: string,
): { pattern: string; warnings: TranspileWarning[] } => {
  const warnings: TranspileWarning[] = [];
  let renamedCount = 0;

  // Named group declaration: (?<name>  →  (?P<name>
  // Negative lookbehind (?<! and positive (?<= are NOT named groups — exclude them.
  const namedGroupRe = /\(\?<(?![=!])([A-Za-z_][A-Za-z0-9_]*)>/g;
  let pattern = source.replace(namedGroupRe, (_m, name: string) => {
    renamedCount++;
    return `(?P<${name}>`;
  });

  // Named backreference: \k<name>  →  (?P=name)
  const namedBackrefRe = /\\k<([A-Za-z_][A-Za-z0-9_]*)>/g;
  pattern = pattern.replace(namedBackrefRe, (_m, name: string) => {
    renamedCount++;
    return `(?P=${name})`;
  });

  if (renamedCount > 0) {
    warnings.push({
      severity: "info",
      message:
        "Groupes nommés convertis : (?<name>) → (?P<name>) et \\k<name> → (?P=name)",
    });
  }

  return { pattern, warnings };
};

// Detect variable-length lookbehinds — Python re stdlib (not the third-party `regex`)
// raises SyntaxError on them at compile time.
const detectVariableLookbehind = (
  ast: EnrichedNode | null,
): TranspileWarning[] => {
  if (!ast) return [];
  const warnings: TranspileWarning[] = [];

  const walk = (node: EnrichedNode) => {
    if (node.kind === "lookaround" && node.direction === "behind") {
      const inner = node.children?.[0];
      if (inner?.kind === "alternative") {
        warnings.push({
          severity: "error",
          offset: node.start,
          message:
            "Lookbehind avec alternance — Python re stdlib lèvera SyntaxError. Utilise la lib tierce `regex` ou réécris avec une longueur fixe.",
        });
      } else if (inner) {
        // Walk into the lookbehind for nested quantifiers that would make it variable
        const hasUnbounded = (n: EnrichedNode): boolean => {
          if (
            n.kind === "quantifier" &&
            (n.max === Infinity || n.min !== n.max)
          )
            return true;
          if (n.children) return n.children.some(hasUnbounded);
          return false;
        };
        if (hasUnbounded(inner)) {
          warnings.push({
            severity: "error",
            offset: node.start,
            message:
              "Lookbehind de longueur variable — Python re stdlib lèvera SyntaxError. Utilise la lib tierce `regex` ou borne le lookbehind.",
          });
        }
      }
    }
    if (node.children) {
      for (const child of node.children) walk(child);
    }
  };
  walk(ast);
  return warnings;
};

const buildSnippet = (
  pattern: string,
  flagsExpression: string,
  isGlobal: boolean,
): string => {
  const rawPattern = escapeForPythonRawString(pattern);
  const flagsArg = flagsExpression === "0" ? "" : `, ${flagsExpression}`;

  if (isGlobal) {
    return `import re

pattern = re.compile(${rawPattern}${flagsArg})
for match in pattern.finditer(text):
    full = match.group(0)
    # match.group("name") pour les groupes nommés`;
  }

  return `import re

pattern = re.compile(${rawPattern}${flagsArg})
match = pattern.search(text)
if match:
    full = match.group(0)
    # match.group("name") pour les groupes nommés`;
};

export const pythonTranspiler: Transpiler = {
  target: "python",
  label: "Python",
  language: "python",
  transpile(input: TranspileInput): TranspileResult {
    const { pattern, warnings: patternWarnings } = transformPattern(
      input.source,
    );
    const { expression, warnings: flagWarnings } = buildPythonFlagsExpression(
      input.flags,
    );
    const lookbehindWarnings = detectVariableLookbehind(input.ast);

    return {
      pattern,
      flags: expression,
      snippet: buildSnippet(pattern, expression, input.flags.includes("g")),
      warnings: [
        ...lookbehindWarnings,
        ...patternWarnings,
        ...flagWarnings,
      ],
    };
  },
};
