import type { StateCreator } from "zustand";
import type { PlaygroundStore } from "../playground";
import type { HistoryEntry, Flag } from "@/types/regex";

export type HistorySlice = {
  entries: HistoryEntry[];
  pushToHistory: (
    entry: Omit<HistoryEntry, "id" | "createdAt" | "lastSeenAt">,
  ) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
};

const flagsEqual = (a: Flag[], b: Flag[]): boolean =>
  a.length === b.length && a.every((flag) => b.includes(flag));

const makeHistoryEntry = (
  entry: Omit<HistoryEntry, "id" | "createdAt" | "lastSeenAt">,
): HistoryEntry => ({
  ...entry,
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  lastSeenAt: Date.now(),
});

export const createHistorySlice: StateCreator<
  PlaygroundStore,
  [],
  [],
  HistorySlice
> = (set) => ({
  entries: [],
  pushToHistory: (entry) =>
    set((state) => {
      const existingIdx = state.entries.findIndex(
        (e) => e.source === entry.source && flagsEqual(e.flags, entry.flags),
      );

      let newEntries;
      if (existingIdx === -1) {
        newEntries = [makeHistoryEntry(entry), ...state.entries];
      } else {
        const existing = state.entries[existingIdx];
        const updated = { ...existing, lastSeenAt: Date.now() };
        const withoutOld = state.entries.filter((_, i) => i !== existingIdx);
        newEntries = [updated, ...withoutOld];
      }

      return { entries: newEntries.slice(0, 30) };
    }),
  removeFromHistory: (id) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    })),
  clearHistory: () => set({ entries: [] }),
});
