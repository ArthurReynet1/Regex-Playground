"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

type MatchHoverContextValue = {
  hoveredMatchIndex: number | null;
  setHoveredMatchIndex: Dispatch<SetStateAction<number | null>>;
};

const MatchHoverContext = createContext<MatchHoverContextValue | null>(null);

export const MatchHoverProvider = ({ children }: { children: ReactNode }) => {
  const [hoveredMatchIndex, setHoveredMatchIndex] = useState<number | null>(
    null,
  );
  return (
    <MatchHoverContext.Provider
      value={{ hoveredMatchIndex, setHoveredMatchIndex }}
    >
      {children}
    </MatchHoverContext.Provider>
  );
};

export const useHoveredMatch = (): MatchHoverContextValue => {
  const ctx = useContext(MatchHoverContext);
  if (!ctx) {
    throw new Error(
      "useHoveredMatch must be used within a MatchHoverProvider",
    );
  }
  return ctx;
};
