"use client";

import { useRef, type ChangeEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { TokenCategory } from "@/types/regex";

export type Token = {
  start: number;
  end: number;
  category: TokenCategory;
};

export type SyntaxInputProps = {
  value: string;
  onChange: (value: string) => void;
  tokens?: Token[];
  errorRange?: { start: number; end: number };
  highlightRange?: { start: number; end: number };
  borderState?: "neutral" | "valid" | "error";
  placeholder?: string;
  ariaLabel?: string;
};

const categoryClass: Record<TokenCategory, string> = {
  assertion: "text-violet-500",
  quantifier: "text-green-500",
  characterSet: "text-orange-500",
  characterClass: "text-yellow-500",
  group: "text-blue-500",
  lookaround: "text-pink-500",
  literal: "text-foreground",
  backreference: "text-cyan-500",
  alternative: "text-rose-500",
  sequence: "text-foreground",
};

const borderClass = {
  neutral: "border-input",
  valid: "border-green-500/60",
  error: "border-destructive",
} as const;

const renderTokenized = (
  value: string,
  tokens: Token[] | undefined,
  errorRange: { start: number; end: number } | undefined,
  highlightRange: { start: number; end: number } | undefined,
): ReactNode => {
  if (
    (!tokens || tokens.length === 0) &&
    !errorRange &&
    !highlightRange
  )
    return value;

  // Pour chaque char index, prendre la catégorie du token le plus interne (range le plus petit)
  const categoryAt = (i: number): TokenCategory | null => {
    if (!tokens) return null;
    let result: TokenCategory | null = null;
    let smallestRange = Infinity;
    for (const t of tokens) {
      if (i >= t.start && i < t.end) {
        const range = t.end - t.start;
        if (range < smallestRange) {
          smallestRange = range;
          result = t.category;
        }
      }
    }
    return result;
  };

  const isError = (i: number): boolean =>
    errorRange ? i >= errorRange.start && i < errorRange.end : false;

  const isHighlighted = (i: number): boolean =>
    highlightRange
      ? i >= highlightRange.start && i < highlightRange.end
      : false;

  // Group consecutive chars with same (category, error, highlight) into spans
  const spans: {
    text: string;
    category: TokenCategory | null;
    error: boolean;
    highlighted: boolean;
  }[] = [];
  for (let i = 0; i < value.length; i++) {
    const cat = categoryAt(i);
    const err = isError(i);
    const hl = isHighlighted(i);
    const last = spans[spans.length - 1];
    if (
      last &&
      last.category === cat &&
      last.error === err &&
      last.highlighted === hl
    ) {
      last.text += value[i];
    } else {
      spans.push({
        text: value[i],
        category: cat,
        error: err,
        highlighted: hl,
      });
    }
  }

  return spans.map((span, i) => (
    <span
      key={i}
      className={cn(
        span.category && categoryClass[span.category],
        span.error && "underline decoration-wavy decoration-destructive",
        span.highlighted && "bg-accent/60 rounded-sm",
      )}
    >
      {span.text}
    </span>
  ));
};

export const SyntaxInput = ({
  value,
  onChange,
  tokens,
  errorRange,
  highlightRange,
  borderState = "neutral",
  placeholder,
  ariaLabel,
}: SyntaxInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleScroll = () => {
    if (overlayRef.current && inputRef.current) {
      overlayRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  };

  return (
    <div
      className={cn(
        "relative h-10 w-full rounded-md border bg-background font-mono text-sm transition-colors",
        borderClass[borderState],
      )}
    >
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre px-3 py-2 leading-6 [font-feature-settings:'liga'_0,'calt'_0]"
      >
        {renderTokenized(value, tokens, errorRange, highlightRange)}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onScroll={handleScroll}
        placeholder={placeholder}
        aria-label={ariaLabel}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="absolute inset-0 w-full rounded-md bg-transparent px-3 py-2 leading-6 text-transparent caret-foreground outline-none placeholder:text-muted-foreground/60 [font-feature-settings:'liga'_0,'calt'_0]"
      />
    </div>
  );
};
