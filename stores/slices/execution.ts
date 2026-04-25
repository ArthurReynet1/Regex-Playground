import type { StateCreator } from "zustand";
import type { PlaygroundStore } from "../playground";
import type {
  EnrichedNode,
  MatchResult,
  ParseError,
  RuntimeError,
  ReDoSWarning,
} from "@/types/regex";

export type ExecutionSlice = {
  parseError: ParseError | null;
  ast: EnrichedNode | null;
  redosWarnings: ReDoSWarning[];
  matches: MatchResult[];
  truncated: boolean;
  runtimeError: RuntimeError | null;
  setAst: (ast: EnrichedNode | null, redosWarnings: ReDoSWarning[]) => void;
  setParseError: (err: ParseError | null) => void;
  setMatches: (matches: MatchResult[], truncated: boolean) => void;
  setRuntimeError: (err: RuntimeError | null) => void;
  clearExecution: () => void;
};

export const createExecutionSlice: StateCreator<
  PlaygroundStore,
  [],
  [],
  ExecutionSlice
> = (set) => ({
  ast: null,
  redosWarnings: [],
  matches: [],
  truncated: false,
  parseError: null,
  runtimeError: null,
  setAst: (ast, redosWarnings) => set({ ast, redosWarnings }),
  setParseError: (parseError) =>
    set(
      parseError === null
        ? { parseError: null }
        : {
            parseError,
            ast: null,
            redosWarnings: [],
            matches: [],
            truncated: false,
          },
    ),
  setMatches: (matches, truncated) => set({ matches, truncated }),
  setRuntimeError: (runtimeError) => set({ runtimeError }),
  clearExecution: () =>
    set({
      ast: null,
      redosWarnings: [],
      matches: [],
      truncated: false,
      parseError: null,
      runtimeError: null,
    }),
});
