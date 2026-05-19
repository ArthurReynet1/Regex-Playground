import type { Transpiler, TranspileInput, TranspileResult } from "./types";
import { buildCSharpFlagsExpression } from "./common/flag-map";
import { escapeForCSharpVerbatim } from "./common/host-escape";

const buildSnippet = (
  pattern: string,
  flagsExpression: string,
  isGlobal: boolean,
): string => {
  const verbatim = escapeForCSharpVerbatim(pattern);
  const optsArg =
    flagsExpression === "RegexOptions.None" ? "" : `, ${flagsExpression}`;

  if (isGlobal) {
    return `using System.Text.RegularExpressions;

var pattern = new Regex(${verbatim}${optsArg});
foreach (Match match in pattern.Matches(text))
{
    var full = match.Value;
    // match.Groups["name"].Value pour les groupes nommés
}`;
  }

  return `using System.Text.RegularExpressions;

var pattern = new Regex(${verbatim}${optsArg});
var match = pattern.Match(text);
if (match.Success)
{
    var full = match.Value;
    // match.Groups["name"].Value pour les groupes nommés
}`;
};

export const csharpTranspiler: Transpiler = {
  target: "csharp",
  label: "C#",
  language: "csharp",
  transpile(input: TranspileInput): TranspileResult {
    // C# (.NET Regex) syntax is mostly identical to ECMAScript:
    //   - Named groups (?<name>...) and \k<name> are supported natively.
    //   - Lookbehinds of variable length are supported (no warning needed).
    //   - The only meaningful divergence is flag mapping.
    const { expression, warnings } = buildCSharpFlagsExpression(input.flags);

    return {
      pattern: input.source,
      flags: expression,
      snippet: buildSnippet(input.source, expression, input.flags.includes("g")),
      warnings,
    };
  },
};
