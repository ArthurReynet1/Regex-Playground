"use client";

import { type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlignLeft,
  Anchor,
  Brackets,
  ChevronDown,
  ChevronRight,
  Eye,
  GitBranch,
  Hash,
  Link,
  Parentheses,
  Tag,
  Type,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHoveredRange } from "@/contexts/HoverContext";
import type { EnrichedNode, TokenCategory } from "@/types/regex";

const CATEGORY_ICON: Record<TokenCategory, LucideIcon> = {
  assertion: Anchor,
  quantifier: Hash,
  characterSet: Tag,
  characterClass: Brackets,
  group: Parentheses,
  lookaround: Eye,
  literal: Type,
  backreference: Link,
  alternative: GitBranch,
  sequence: AlignLeft,
};

const CATEGORY_COLOR: Record<TokenCategory, string> = {
  assertion: "text-violet-500",
  quantifier: "text-green-500",
  characterSet: "text-orange-500",
  characterClass: "text-yellow-500",
  group: "text-blue-500",
  lookaround: "text-pink-500",
  literal: "text-foreground",
  backreference: "text-cyan-500",
  alternative: "text-rose-500",
  sequence: "text-muted-foreground",
};

const shortLabel = (node: EnrichedNode): string => {
  switch (node.kind) {
    case "quantifier": {
      if (node.min === node.max) return `{${node.min}}`;
      if (node.max === Infinity) {
        if (node.min === 0) return "*";
        if (node.min === 1) return "+";
        return `{${node.min},}`;
      }
      return `{${node.min},${node.max}}`;
    }
    case "assertion":
      switch (node.assertionKind) {
        case "start":
          return "^";
        case "end":
          return "$";
        case "wordBoundary":
          return "\\b";
        case "nonWordBoundary":
          return "\\B";
      }
      break;
    case "characterSet":
      switch (node.setKind) {
        case "digit":
          return node.negated ? "\\D" : "\\d";
        case "word":
          return node.negated ? "\\W" : "\\w";
        case "space":
          return node.negated ? "\\S" : "\\s";
        case "any":
          return ".";
        case "unicodeProperty":
          return node.negated ? "\\P{…}" : "\\p{…}";
      }
      break;
    case "characterClass":
      return node.negated ? "[^…]" : "[…]";
    case "group":
      if (!node.capturing) return "(?:…)";
      if (node.name) return `(?<${node.name}>…)`;
      return `(…) #${node.index}`;
    case "lookaround":
      if (node.direction === "ahead") return node.negative ? "(?!…)" : "(?=…)";
      return node.negative ? "(?<!…)" : "(?<=…)";
    case "literal":
      return JSON.stringify(node.value);
    case "backreference":
      return typeof node.target === "number"
        ? `\\${node.target}`
        : `\\k<${node.target}>`;
    case "alternative":
      return "|";
    case "sequence":
      return "…";
  }
  return "";
};

const categoryLabel = (kind: TokenCategory): string => {
  switch (kind) {
    case "assertion":
      return "Ancre";
    case "quantifier":
      return "Quantifieur";
    case "characterSet":
      return "Classe prédéf.";
    case "characterClass":
      return "Classe perso";
    case "group":
      return "Groupe";
    case "lookaround":
      return "Lookaround";
    case "literal":
      return "Littéral";
    case "backreference":
      return "Backref";
    case "alternative":
      return "Alternance";
    case "sequence":
      return "Séquence";
  }
};

export type AstNodeProps = {
  node: EnrichedNode;
  depth: number;
  activeId: string | null;
  onActivate: (id: string) => void;
  onToggle: (id: string, expand: boolean) => void;
  isExpanded: (id: string) => boolean;
};

const nodeId = (node: EnrichedNode): string =>
  `${node.kind}-${node.start}-${node.end}`;

export const AstNode = ({
  node,
  depth,
  activeId,
  onActivate,
  onToggle,
  isExpanded,
}: AstNodeProps) => {
  const { setHoveredRange } = useHoveredRange();
  const id = nodeId(node);
  const hasChildren = !!node.children && node.children.length > 0;
  const expanded = isExpanded(id);
  const isActive = activeId === id;
  const Icon = CATEGORY_ICON[node.kind];

  const handleMouseEnter = () => {
    setHoveredRange({ start: node.start, end: node.end });
  };
  const handleMouseLeave = () => {
    setHoveredRange(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onActivate(id);
    }
  };

  return (
    <li role="treeitem" aria-expanded={hasChildren ? expanded : undefined}>
      <div
        tabIndex={isActive ? 0 : -1}
        data-node-id={id}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        onClick={() => onActivate(id)}
        onKeyDown={handleKeyDown}
        className={cn(
          "group flex items-center gap-2 rounded-md px-2 py-1 text-sm cursor-pointer outline-none",
          "hover:bg-accent/50 focus:bg-accent",
          isActive && "bg-accent",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(id, !expanded);
            }}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent"
            aria-label={expanded ? "Replier" : "Déplier"}
            tabIndex={-1}
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <span className="inline-block h-5 w-5" aria-hidden="true" />
        )}

        <Icon
          className={cn("h-4 w-4 shrink-0", CATEGORY_COLOR[node.kind])}
          aria-hidden="true"
        />

        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {categoryLabel(node.kind)}
        </span>

        <code
          className={cn(
            "font-mono text-xs px-1.5 py-0.5 rounded bg-muted",
            CATEGORY_COLOR[node.kind],
          )}
        >
          {shortLabel(node)}
        </code>

        <span className="truncate text-xs text-muted-foreground">
          {node.explanation}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && expanded && (
          <motion.ul
            role="group"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="m-0 list-none overflow-hidden p-0"
          >
            {node.children!.map((child) => (
              <AstNode
                key={nodeId(child)}
                node={child}
                depth={depth + 1}
                activeId={activeId}
                onActivate={onActivate}
                onToggle={onToggle}
                isExpanded={isExpanded}
              />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
};

export { nodeId };
