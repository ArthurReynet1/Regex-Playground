import { RegExpParser, type AST } from "@eslint-community/regexpp";
import type { ParseError } from "@/types/regex";
import { translateError } from "./errors-fr";

const parser = new RegExpParser();

export type ParseResult =
  | { ok: true; pattern: AST.Pattern; flags: AST.Flags }
  | { ok: false; error: ParseError };

export const parse = (source: string, flags: string): ParseResult => {
  let parsedFlags: AST.Flags;
  try {
    parsedFlags = parser.parseFlags(flags);
  } catch (e) {
    return { ok: false, error: buildParseError(e, 0) };
  }

  try {
    const pattern = parser.parsePattern(source, 0, source.length, {
      unicode: parsedFlags.unicode,
      unicodeSets: parsedFlags.unicodeSets,
    });
    return { ok: true, pattern, flags: parsedFlags };
  } catch (e) {
    return { ok: false, error: buildParseError(e, 0) };
  }
};

const buildParseError = (e: unknown, defaultOffset = 0): ParseError => {
  const message = e instanceof Error ? e.message : "Unknown error";
  const offset =
    e instanceof Error && "index" in e && typeof e.index === "number"
      ? e.index
      : defaultOffset;
  return {
    message,
    offset,
    messageFr: translateError(message),
  };
};
