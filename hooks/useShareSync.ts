"use client";

import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePlaygroundStore } from "@/stores/playground";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { encodeShareUrl } from "@/lib/share/encode";
import { decodeShareUrl } from "@/lib/share/decode";
import { parseFlagsString } from "@/lib/regex/parse-flags";

const URL_SYNC_DELAY_MS = 500;

/**
 * Two-way sync between store state and the URL query string.
 *
 * - At mount, hydrates source/flags/text from `?d=...` if present.
 * - Then debounces 500ms and pushes the current state back to the URL
 *   via `history.replaceState` (not pushState — would pollute back button).
 *
 * The `hydratingRef` flag prevents the initial URL→store hydration from
 * triggering a store→URL push and looping.
 */
export const useShareSync = () => {
  const { source, flags, text, setSource, setFlags, setText } =
    usePlaygroundStore(
      useShallow((s) => ({
        source: s.source,
        flags: s.flags,
        text: s.text,
        setSource: s.setSource,
        setFlags: s.setFlags,
        setText: s.setText,
      })),
    );

  const hydratingRef = useRef(true);

  // Hydrate from URL once at mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("d");
    if (encoded) {
      const decoded = decodeShareUrl(encoded);
      if (decoded) {
        setSource(decoded.s);
        setFlags(parseFlagsString(decoded.f));
        setText(decoded.t);
      } else {
        console.warn(
          "[useShareSync] Failed to decode shared URL — falling back to default state.",
        );
      }
    }
    hydratingRef.current = false;
  }, [setSource, setFlags, setText]);

  const debouncedSource = useDebouncedValue(source, URL_SYNC_DELAY_MS);
  const debouncedFlags = useDebouncedValue(flags, URL_SYNC_DELAY_MS);
  const debouncedText = useDebouncedValue(text, URL_SYNC_DELAY_MS);

  // Push store → URL after debounce
  useEffect(() => {
    if (hydratingRef.current) return;
    if (typeof window === "undefined") return;

    const encoded = encodeShareUrl({
      s: debouncedSource,
      f: debouncedFlags.join(""),
      t: debouncedText,
    });

    const url = new URL(window.location.href);
    if (encoded) {
      url.searchParams.set("d", encoded);
    } else {
      url.searchParams.delete("d");
    }
    window.history.replaceState({}, "", url.toString());
  }, [debouncedSource, debouncedFlags, debouncedText]);
};
