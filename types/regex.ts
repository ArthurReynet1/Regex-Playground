import type { AST } from "@eslint-community/regexpp";

type Flag = "g" | "i" | "m" | "s" | "u" | "y" | "d" | "v";

type TokenCategory =
  | "assertion"
  | "quantifier"
  | "characterSet"
  | "characterClass"
  | "group"
  | "lookaround"
  | "literal"
  | "backreference"
  | "alternative";

type ParseError = {
  message: string;
  offset: number;
  messageFr?: string;
};

type RuntimeError = { kind: "timeout" | "unknown"; message: string };

type HistoryEntry = {
  id: string;
  source: string;
  flags: Flag[];
  createdAt: number;
  lastSeenAt?: number;
};

type ReDoSWarning = {
  rule: "nested-quantifier" | "overlapping-alternation" | "repeated-star";
  offset: number;
  message: string;
};

type Capture = {
  index: number;
  name?: string;
  value: string;
  start: number;
  end: number;
};

type MatchResult = {
  value: string;
  start: number;
  end: number;
  captures: Capture[];
};

type TranspileWarning = {
  severity: "error" | "diff" | "info";
  message: string;
  offset?: number;
  suggestion?: string;
};

type EnrichedNodeBase = {
  start: number;
  end: number;
  raw: AST.Node;
  explanation: string;
  children?: EnrichedNode[];
};

type EnrichedNode =
  | ({
      kind: "quantifier";
      min: number;
      max: number;
      greedy: boolean;
    } & EnrichedNodeBase)
  | ({
      kind: "assertion";
      assertionKind: "start" | "end" | "wordBoundary" | "nonWordBoundary";
    } & EnrichedNodeBase)
  | ({
      kind: "characterSet";
      setKind: "digit" | "word" | "space" | "any" | "unicodeProperty";
      negated: boolean;
      property?: string;
    } & EnrichedNodeBase)
  | ({
      kind: "characterClass";
      elements: Array<
        | { type: "char"; value: string }
        | { type: "range"; from: string; to: string }
      >;
      negated: boolean;
    } & EnrichedNodeBase)
  | ({
      kind: "group";
      index: number;
      name?: string;
      capturing: boolean;
    } & EnrichedNodeBase)
  | ({
      kind: "lookaround";
      direction: "ahead" | "behind";
      negative: boolean;
    } & EnrichedNodeBase)
  | ({ kind: "literal"; value: string } & EnrichedNodeBase)
  | ({ kind: "backreference"; target: number | string } & EnrichedNodeBase)
  | ({ kind: "alternative" } & EnrichedNodeBase);

export type {
  Flag,
  TokenCategory,
  ParseError,
  RuntimeError,
  HistoryEntry,
  ReDoSWarning,
  Capture,
  MatchResult,
  TranspileWarning,
  EnrichedNode,
  EnrichedNodeBase,
};
