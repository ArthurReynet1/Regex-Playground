import type { TranspileWarning } from "@/types/regex";

// Map ECMAScript flags to Python re flag constants.
export const pythonFlagMap: Record<string, string> = {
  i: "re.IGNORECASE",
  m: "re.MULTILINE",
  s: "re.DOTALL",
  x: "re.VERBOSE", // not produced from ECMA but here for reference
};

// Flags that are valid in JS but have no equivalent in Python `re` stdlib.
export const pythonUnsupportedFlags = new Set(["g", "y", "v", "d"]);

// Map ECMAScript flags to C# RegexOptions members.
export const csharpFlagMap: Record<string, string> = {
  i: "RegexOptions.IgnoreCase",
  m: "RegexOptions.Multiline",
  s: "RegexOptions.Singleline", // careful: in C#, `Singleline` means dot matches \n
};

export const csharpUnsupportedFlags = new Set(["g", "y", "v", "d"]);

export const buildPythonFlagsExpression = (
  flags: string,
): { expression: string; warnings: TranspileWarning[] } => {
  const warnings: TranspileWarning[] = [];
  const mapped: string[] = [];

  for (const f of flags) {
    if (pythonFlagMap[f]) {
      mapped.push(pythonFlagMap[f]);
    } else if (f === "g") {
      warnings.push({
        severity: "diff",
        message:
          "Flag 'g' non mappable — utilise re.findall() ou re.finditer() pour matcher toutes les occurrences",
      });
    } else if (f === "u") {
      warnings.push({
        severity: "info",
        message:
          "Flag 'u' — Unicode est actif par défaut en Python 3, aucune option à passer",
      });
    } else if (pythonUnsupportedFlags.has(f)) {
      warnings.push({
        severity: "diff",
        message: `Flag '${f}' non supporté en Python re stdlib`,
      });
    }
  }

  return {
    expression: mapped.length > 0 ? mapped.join(" | ") : "0",
    warnings,
  };
};

export const buildCSharpFlagsExpression = (
  flags: string,
): { expression: string; warnings: TranspileWarning[] } => {
  const warnings: TranspileWarning[] = [];
  const mapped: string[] = [];

  for (const f of flags) {
    if (csharpFlagMap[f]) {
      mapped.push(csharpFlagMap[f]);
      if (f === "s") {
        warnings.push({
          severity: "info",
          message:
            "Flag 's' (dotall) → RegexOptions.Singleline en .NET (attention au nom : 'Multiline' fait autre chose en C#)",
        });
      }
    } else if (f === "g") {
      warnings.push({
        severity: "diff",
        message:
          "Flag 'g' non mappable — utilise Regex.Matches() pour matcher toutes les occurrences",
      });
    } else if (csharpUnsupportedFlags.has(f)) {
      warnings.push({
        severity: "diff",
        message: `Flag '${f}' non supporté en .NET`,
      });
    }
  }

  return {
    expression: mapped.length > 0 ? mapped.join(" | ") : "RegexOptions.None",
    warnings,
  };
};
