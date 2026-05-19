"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePlaygroundStore } from "@/stores/playground";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const PUSH_DELAY_MS = 1000;

/**
 * Push the current (source, flags) pair into history when it stays stable
 * for PUSH_DELAY_MS and the regex is valid. Dedup, MRU ordering and FIFO
 * cap (30) are handled by the history slice itself.
 */
export const useLocalHistory = () => {
  const { source, flags, parseError, pushToHistory } = usePlaygroundStore(
    useShallow((s) => ({
      source: s.source,
      flags: s.flags,
      parseError: s.parseError,
      pushToHistory: s.pushToHistory,
    })),
  );

  const debouncedSource = useDebouncedValue(source, PUSH_DELAY_MS);
  const debouncedFlags = useDebouncedValue(flags, PUSH_DELAY_MS);

  useEffect(() => {
    if (parseError) return;
    if (!debouncedSource) return;
    pushToHistory({
      source: debouncedSource,
      flags: debouncedFlags,
    });
  }, [debouncedSource, debouncedFlags, parseError, pushToHistory]);
};
