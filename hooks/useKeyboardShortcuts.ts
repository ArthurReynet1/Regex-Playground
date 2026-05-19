"use client";

import { useEffect } from "react";

export type ShortcutHandlers = {
  toggleLibrary?: () => void;
  toggleHistory?: () => void;
  toggleCheatsheet?: () => void;
  shareUrl?: () => void;
  copyExportSnippet?: () => void;
};

const isInTextField = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
};

/**
 * Global keyboard shortcuts.
 *
 * Combo-with-modifier shortcuts (Ctrl/Cmd + key) fire everywhere — the
 * modifier signals user intent and they generally override the browser
 * (we preventDefault).
 *
 * Single-key shortcuts (`?`) skip when focus is inside a text field, so
 * the user can type `?` in the textarea without triggering the cheatsheet.
 */
export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const hasMod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      const inField = isInTextField(e.target);

      if (hasMod && key === "k") {
        e.preventDefault();
        handlers.toggleLibrary?.();
        return;
      }

      if (hasMod && key === "s") {
        e.preventDefault();
        handlers.shareUrl?.();
        return;
      }

      if (hasMod && key === "enter") {
        e.preventDefault();
        handlers.copyExportSnippet?.();
        return;
      }

      if (e.key === "?" && !inField) {
        e.preventDefault();
        handlers.toggleCheatsheet?.();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handlers]);
};
