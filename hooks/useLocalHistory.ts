"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePlaygroundStore } from "@/stores/playground";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { parse } from "@/lib/regex/parse";

const PUSH_DELAY_MS = 1000;

/**
 * Push the current (source, flags) pair into history when it stays stable
 * for PUSH_DELAY_MS and the regex is valid. Dedup, MRU ordering and FIFO
 * cap (30) are handled by the history slice itself.
 *
 * We re-validate via `parse` at push time rather than trusting `store.parseError`,
 * because the store's parseError is debounced 200ms (via useAst) while we
 * debounce 1000ms here — race conditions could push an invalid regex.
 */
export const useLocalHistory = () => {
  const { source, flags, pushToHistory } = usePlaygroundStore(
    useShallow((s) => ({
      source: s.source,
      flags: s.flags,
      pushToHistory: s.pushToHistory,
    })),
  );

  const debouncedSource = useDebouncedValue(source, PUSH_DELAY_MS);
  const debouncedFlags = useDebouncedValue(flags, PUSH_DELAY_MS);

  useEffect(() => {
    if (!debouncedSource) return;
    // Re-validate at push time to avoid stale parseError edge cases
    const result = parse(debouncedSource, debouncedFlags.join(""));
    if (!result.ok) return;
    pushToHistory({
      source: debouncedSource,
      flags: debouncedFlags,
    });
  }, [debouncedSource, debouncedFlags, pushToHistory]);
};
