// Helpers to embed a regex source string into a host-language string literal.

// Python raw string r"..." — does NOT interpret backslashes. Cannot end with `\`,
// and cannot contain its delimiter quote unescaped.
export const escapeForPythonRawString = (pattern: string): string => {
  // If the pattern contains both " and ', we fall back to triple-quoted raw.
  const hasDouble = pattern.includes('"');
  const hasSingle = pattern.includes("'");

  if (!hasDouble) return `r"${pattern}"`;
  if (!hasSingle) return `r'${pattern}'`;
  // Both quotes present — use triple-double-quoted raw
  return `r"""${pattern}"""`;
};

// C# verbatim string @"..." — does NOT interpret backslashes. " is escaped as "".
export const escapeForCSharpVerbatim = (pattern: string): string =>
  `@"${pattern.replace(/"/g, '""')}"`;

// ECMAScript regex literal /.../ — / must be escaped as \/ in the body.
// For `new RegExp("...")` form, backslashes must be doubled.
export const escapeForJsRegexLiteral = (pattern: string): string =>
  pattern.replace(/\//g, "\\/");

export const escapeForJsStringLiteral = (pattern: string): string =>
  pattern.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
