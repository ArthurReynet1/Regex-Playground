"use client";

import { useRef, type ChangeEvent } from "react";
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
  borderState?: "neutral" | "valid" | "error";
  placeholder?: string;
  ariaLabel?: string;
};

export const SyntaxInput = ({
  value,
  onChange,
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
        "relative h-10 w-full rounded-md border border-input bg-background font-mono text-sm transition-colors",
      )}
    >
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre px-3 py-2 leading-6 [font-feature-settings:'liga'_0,'calt'_0]"
      >
        {value}
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
