import {
  compressToEncodedURIComponent,
} from "lz-string";

export type SharePayload = {
  s: string; // source
  f: string; // flags joined
  t: string; // text
};

/**
 * Encode a SharePayload into a URL-safe compressed string.
 * Returns `null` if the payload is "empty" (no need to put it in the URL).
 */
export const encodeShareUrl = (payload: SharePayload): string | null => {
  if (!payload.s && !payload.t) return null;
  return compressToEncodedURIComponent(JSON.stringify(payload));
};
