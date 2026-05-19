"use client";

import { useMemo } from "react";
import { usePlaygroundStore } from "@/stores/playground";
import { useAst } from "@/hooks/useAst";
import { SyntaxInput, type Token } from "./SyntaxInput";
import type { EnrichedNode } from "@/types/regex";

const collectTokens = (node: EnrichedNode | null): Token[] => {
  if (!node) return [];
  const tokens: Token[] = [
    { start: node.start, end: node.end, category: node.kind },
  ];
  if (node.children) {
    for (const child of node.children) {
      tokens.push(...collectTokens(child));
    }
  }
  return tokens;
};

export const RegexEditor = () => {
  const source = usePlaygroundStore((s) => s.source);
  const setSource = usePlaygroundStore((s) => s.setSource);
  const { ast, parseError } = useAst();

  const tokens = useMemo(() => collectTokens(ast), [ast]);

  let errorRange: { start: number; end: number } | undefined;
  if (parseError && source.length > 0) {
    const clampedStart = Math.min(parseError.offset, source.length - 1);
    errorRange = { start: clampedStart, end: clampedStart + 1 };
  }

  const borderState: "neutral" | "valid" | "error" = parseError
    ? "error"
    : ast
      ? "valid"
      : "neutral";

  return (
    <SyntaxInput
      value={source}
      onChange={setSource}
      tokens={tokens}
      errorRange={errorRange}
      borderState={borderState}
      placeholder="Tape ta regex..."
      ariaLabel="Regex source"
    />
  );
};
