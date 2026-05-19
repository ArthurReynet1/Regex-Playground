"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AlertTriangle, Wand2 } from "lucide-react";
import { usePlaygroundStore } from "@/stores/playground";
import { AstNode, nodeId } from "./AstNode";
import type { EnrichedNode } from "@/types/regex";

// Collect all node ids in DFS order — used for keyboard navigation.
// Only descends into expanded nodes so navigation matches what's visible.
const collectVisibleIds = (
  node: EnrichedNode,
  isExpanded: (id: string) => boolean,
): string[] => {
  const id = nodeId(node);
  const ids = [id];
  if (node.children && isExpanded(id)) {
    for (const child of node.children) {
      ids.push(...collectVisibleIds(child, isExpanded));
    }
  }
  return ids;
};

const hasChildrenById = (
  root: EnrichedNode | null,
  targetId: string,
): EnrichedNode | null => {
  if (!root) return null;
  if (nodeId(root) === targetId) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = hasChildrenById(child, targetId);
      if (found) return found;
    }
  }
  return null;
};

export const AstTree = () => {
  const ast = usePlaygroundStore((s) => s.ast);
  const parseError = usePlaygroundStore((s) => s.parseError);
  const source = usePlaygroundStore((s) => s.source);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const treeRef = useRef<HTMLUListElement>(null);

  const isExpanded = (id: string): boolean => !expandedIds.has(id);

  const handleToggle = (id: string, expand: boolean) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (expand) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleActivate = (id: string) => {
    setActiveId(id);
  };

  // Focus the currently active node when activeId changes
  useEffect(() => {
    if (!activeId || !treeRef.current) return;
    const el = treeRef.current.querySelector<HTMLElement>(
      `[data-node-id="${activeId}"]`,
    );
    el?.focus();
  }, [activeId]);

  const handleKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (!ast) return;
    const visibleIds = collectVisibleIds(ast, isExpanded);
    const current = activeId ?? visibleIds[0];
    const currentIdx = visibleIds.indexOf(current);

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const next = visibleIds[Math.min(currentIdx + 1, visibleIds.length - 1)];
        setActiveId(next);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prev = visibleIds[Math.max(currentIdx - 1, 0)];
        setActiveId(prev);
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        const node = hasChildrenById(ast, current);
        if (node?.children && node.children.length > 0) {
          if (!isExpanded(current)) {
            handleToggle(current, true);
          } else {
            // already expanded — move to first child
            const firstChildId = nodeId(node.children[0]);
            setActiveId(firstChildId);
          }
        }
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        const node = hasChildrenById(ast, current);
        if (node?.children && node.children.length > 0 && isExpanded(current)) {
          handleToggle(current, false);
        }
        // else: could navigate to parent, but we keep it simple in MVP
        break;
      }
      case "Enter": {
        e.preventDefault();
        handleActivate(current);
        break;
      }
      case "Escape": {
        e.preventDefault();
        setActiveId(null);
        break;
      }
    }
  };

  if (parseError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-destructive/40 bg-destructive/5 px-4 py-8 text-center text-sm text-muted-foreground">
        <AlertTriangle className="h-6 w-6 text-destructive/70" aria-hidden="true" />
        Correction de la regex requise — l'arbre est masqué tant que la syntaxe
        est invalide.
      </div>
    );
  }

  if (!ast || !source) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-input px-4 py-8 text-center text-sm text-muted-foreground">
        <Wand2 className="h-6 w-6 text-muted-foreground/60" aria-hidden="true" />
        Écris une regex pour voir sa décomposition.
      </div>
    );
  }

  return (
    <ul
      ref={treeRef}
      role="tree"
      aria-label="Décomposition de la regex"
      onKeyDown={handleKeyDown}
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
