"use client";

import { useEffect } from "react";
import { usePlaygroundStore } from "@/stores/playground";

const SAMPLE_SOURCE = "^(\\d{3})-(\\d{4})$";
const SAMPLE_FLAGS = ["g"] as const;
const SAMPLE_TEXT = "555-1234\n012-99\n1234-5678\n987-6543";

/**
 * On the very first visit (no URL state, no localStorage history, empty store),
 * prefill the playground with a phone-number-like example so the user lands
 * on a working demo instead of an empty page.
 */
export const useFirstVisitPrefill = () => {
  const setSource = usePlaygroundStore((s) => s.setSource);
  const setFlags = usePlaygroundStore((s) => s.setFlags);
  const setText = usePlaygroundStore((s) => s.setText);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // URL contains shared state — skip prefill
    const params = new URLSearchParams(window.location.search);
    if (params.get("d")) return;

    const state = usePlaygroundStore.getState();
    // Returning user — has history
    if (state.entries.length > 0) return;
    // User already typed something (e.g. another hook prefilled)
    if (state.source !== "" || state.text !== "") return;

    setSource(SAMPLE_SOURCE);
    setFlags([...SAMPLE_FLAGS]);
    setText(SAMPLE_TEXT);
  }, [setSource, setFlags, setText]);
};
