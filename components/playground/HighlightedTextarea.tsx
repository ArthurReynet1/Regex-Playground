"use client";

import { useEffect, useRef, type ChangeEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Range = { start: number; end: number };

export type HighlightedTextareaProps = {
  value: string;
  onChange: (value: string) => void;
  matches?: Range[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  minHeight?: number;
};

const renderWithMatches = (value: string, matches: Range[]): ReactNode => {
  if (matches.length === 0) return value;

  // Sort by start to walk left-to-right safely
  const sorted = [...matches].sort((a, b) => a.start - b.start);

  const nodes: ReactNode[] = [];
  let cursor = 0;

  sorted.forEach((m, i) => {
    // Skip overlapping/invalid ranges
    if (m.end <= cursor || m.start >= value.length) return;
    const start = Math.max(m.start, cursor);
    const end = Math.min(m.end, value.length);

    if (start > cursor) {
      nodes.push(<span key={`gap-${i}`}>{value.slice(cursor, start)}</span>);
    }
    nodes.push(
      <mark
        key={`m-${i}`}
        className="bg-blue-500/25 text-foreground rounded-sm"
      >
        {value.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });

  if (cursor < value.length) {
    nodes.push(<span key="tail">{value.slice(cursor)}</span>);
  }

  return nodes;
};

export const HighlightedTextarea = ({
  value,
  onChange,
  matches,
  placeholder,
  ariaLabel,
  className,
  minHeight = 200,
}: HighlightedTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const syncOverlayPadding = () => {
    if (!textareaRef.current || !overlayRef.current) return;
    const scrollbarWidth =
      textareaRef.current.offsetWidth - textareaRef.current.clientWidth;
    overlayRef.current.style.paddingRight = `calc(0.75rem + ${scrollbarWidth}px)`;
  };

  // Observe textarea size changes (user resize-y, window resize)
  useEffect(() => {
    if (!textareaRef.current) return;
    syncOverlayPadding();
    const ro = new ResizeObserver(syncOverlayPadding);
    ro.observe(textareaRef.current);
    return () => ro.disconnect();
  }, []);

  // Re-sync after value changes (scrollbar can appear/disappear)
  useEffect(() => {
    const id = requestAnimationFrame(syncOverlayPadding);
    return () => cancelAnimationFrame(id);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleScroll = () => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-md border border-input bg-background font-mono text-sm transition-colors",
        className,
      )}
    >
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words py-2 pl-3 leading-6 [font-feature-settings:'liga'_0,'calt'_0]"
      >
        {matches && matches.length > 0
          ? renderWithMatches(value, matches)
          : value}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onScroll={handleScroll}
        placeholder={placeholder}
        aria-label={ariaLabel}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        wrap="soft"
        style={{ minHeight }}
        className="relative w-full resize-y whitespace-pre-wrap break-words rounded-md bg-transparent px-3 py-2 leading-6 text-transparent caret-foreground outline-none placeholder:text-muted-foreground/60 [font-feature-settings:'liga'_0,'calt'_0]"
      />
    </div>
  );
};
