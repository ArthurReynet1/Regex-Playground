"use client";

import { useState } from "react";
import { usePlaygroundStore } from "@/stores/playground";
import { AstNode, nodeId } from "./AstNode";
import type { EnrichedNode } from "@/types/regex";

// Collect all node ids in DFS order — used to initialize expanded set
// and (later) for keyboard navigation.
const collectIds = (node: EnrichedNode): string[] => {
  const ids = [nodeId(node)];
  if (node.children) {
    for (const child of node.children) ids.push(...collectIds(child));
  }
  return ids;
};

export const AstTree = () => {
  const ast = usePlaygroundStore((s) => s.ast);
  const parseError = usePlaygroundStore((s) => s.parseError);
  const source = usePlaygroundStore((s) => s.source);

  // All nodes expanded by default — user can collapse manually
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  // Initialize expanded with all ids when ast changes
  // (we use a render-time effect via useMemo-like pattern)
  // For simplicity we use a stable default: expanded if not in set means expanded
  const isExpanded = (id: string): boolean => !expandedIds.has(id);

  const handleToggle = (id: string, expand: boolean) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (expand) {
        next.delete(id); // expanded = not in "collapsed" set
      } else {
        next.add(id); // collapsed = in set
      }
      return next;
    });
  };

  const handleActivate = (id: string) => {
    setActiveId(id);
  };

  if (parseError) {
    return (
      <div className="rounded-md border border-dashed border-destructive/40 bg-destructive/5 p-4 text-sm text-muted-foreground">
        ⚠️ Correction de la regex requise — l'arbre est masqué tant que la
        syntaxe est invalide.
      </div>
    );
  }

  if (!ast || !source) {
    return (
      <div className="rounded-md border border-dashed border-input p-4 text-sm text-muted-foreground">
        Écris une regex pour voir sa décomposition.
      </div>
    );
  }

  return (
    <ul
      role="tree"
      aria-label="Décomposition de la regex"
      className="m-0 list-none space-y-0.5 p-0"
    >
      <AstNode
        node={ast}
        depth={0}
        activeId={activeId}
        onActivate={handleActivate}
        onToggle={handleToggle}
        isExpanded={isExpanded}
      />
    </ul>
  );
};

// Exported helper for keyboard nav (used in commit 4)
export { collectIds };
