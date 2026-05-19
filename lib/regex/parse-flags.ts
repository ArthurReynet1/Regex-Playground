import type { Flag } from "@/types/regex";

const VALID_FLAGS = new Set<string>([
  "g",
  "i",
  "m",
  "s",
  "u",
  "y",
  "d",
  "v",
]);

/**
 * Filter an arbitrary flags string into a typed Flag[].
 * Unknown characters are silently dropped (defensive against corrupt input
 * from URL share state, library dataset, etc.).
 */
export const parseFlagsString = (flags: string): Flag[] =>
  flags.split("").filter((f) => VALID_FLAGS.has(f)) as Flag[];
