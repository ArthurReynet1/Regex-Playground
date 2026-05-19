import { decompressFromEncodedURIComponent } from "lz-string";
import type { SharePayload } from "./encode";

const isStringField = (obj: unknown, key: string): obj is Record<string, string> =>
  typeof (obj as Record<string, unknown>)[key] === "string";

/**
 * Decode a URL-safe compressed string into a SharePayload.
 * Returns `null` if the input is invalid, missing fields, or malformed.
 * Never throws — caller can rely on a safe fallback.
 */
export const decodeShareUrl = (encoded: string): SharePayload | null => {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed: unknown = JSON.parse(json);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !isStringField(parsed, "s") ||
      !isStringField(parsed, "f") ||
      !isStringField(parsed, "t")
    ) {
      return null;
    }
    const obj = parsed as Record<string, string>;
    return { s: obj.s, f: obj.f, t: obj.t };
  } catch {
    return null;
  }
};
