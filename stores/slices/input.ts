import type { Flag } from "@/types/regex";
import type { PlaygroundStore } from "../playground";
import type { StateCreator } from "zustand";

export type InputSlice = {
  source: string;
  flags: Flag[];
  text: string;
  setSource: (source: string) => void;
  setFlags: (flags: Flag[]) => void;
  setText: (text: string) => void;
};

export const createInputSlice: StateCreator<
  PlaygroundStore,
  [],
  [],
  InputSlice
> = (set) => ({
  source: "",
  flags: [],
  text: "",
  setSource: (source) => set({ source }),
  setFlags: (flags) => set({ flags }),
  setText: (text) => set({ text }),
});
