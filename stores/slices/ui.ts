import type { StateCreator } from "zustand";
import type { PlaygroundStore } from "../playground";

export type UiSlice = {
  activeExport: "js" | "python" | "csharp";
  openDrawer: "library" | "history" | "cheatsheet" | null;
  showAdvancedFlags: boolean;
  setActiveExport: (t: UiSlice["activeExport"]) => void;
  setDrawer: (d: UiSlice["openDrawer"]) => void;
  toggleAdvancedFlags: () => void;
};

export const createUiSlice: StateCreator<PlaygroundStore, [], [], UiSlice> = (
  set,
) => ({
  activeExport: "js",
  openDrawer: null,
  showAdvancedFlags: false,
  setActiveExport: (activeExport) => set({ activeExport }),
  setDrawer: (openDrawer) => set({ openDrawer }),
  toggleAdvancedFlags: () =>
    set((state) => ({ showAdvancedFlags: !state.showAdvancedFlags })),
});
