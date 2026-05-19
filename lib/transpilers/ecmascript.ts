import type { Transpiler, TranspileInput, TranspileResult } from "./types";
import { escapeForJsRegexLiteral } from "./common/host-escape";

const buildSnippet = (pattern: string, flags: string): string => {
  const escaped = escapeForJsRegexLiteral(pattern);
  return `const pattern = /${escaped}/${flags};
const match = pattern.exec(text);
if (match) {
  const full = match[0];
  // match.groups contient les groupes nommés (flag 'd' donne les indices)
}`;
};

export const ecmascriptTranspiler: Transpiler = {
  target: "ecmascript",
  label: "JavaScript",
  language: "javascript",
  transpile(input: TranspileInput): TranspileResult {
    return {
      pattern: input.source,
      flags: input.flags,
      snippet: buildSnippet(input.source, input.flags),
      warnings: [],
    };
  },
};
