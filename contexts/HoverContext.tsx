"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

export type HoverRange = { start: number; end: number } | null;

type HoverContextValue = {
  hoveredRange: HoverRange;
  setHoveredRange: Dispatch<SetStateAction<HoverRange>>;
};

const HoverContext = createContext<HoverContextValue | null>(null);

export const HoverProvider = ({ children }: { children: ReactNode }) => {
  const [hoveredRange, setHoveredRange] = useState<HoverRange>(null);
  return (
    <HoverContext.Provider value={{ hoveredRange, setHoveredRange }}>
      {children}
    </HoverContext.Provider>
  );
};

export const useHoveredRange = (): HoverContextValue => {
  const ctx = useContext(HoverContext);
  if (!ctx) {
    throw new Error("useHoveredRange must be used within a HoverProvider");
  }
  return ctx;
};
