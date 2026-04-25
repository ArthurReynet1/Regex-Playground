import { createInputSlice, type InputSlice } from "./slices/input";
import { createUiSlice, type UiSlice } from "./slices/ui";
import { createHistorySlice, type HistorySlice } from "./slices/history";
import { createExecutionSlice, type ExecutionSlice } from "./slices/execution";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PlaygroundStore = InputSlice &
  UiSlice &
  HistorySlice &
  ExecutionSlice;

export const usePlaygroundStore = create<PlaygroundStore>()(
  persist(
    (set, get, api) => ({
      ...createInputSlice(set, get, api),
      ...createUiSlice(set, get, api),
      ...createHistorySlice(set, get, api),
      ...createExecutionSlice(set, get, api),
    }),
    {
      name: "regex-playground",
      partialize: (state) => ({
        entries: state.entries,
        activeExport: state.activeExport,
      }),
    },
  ),
);
