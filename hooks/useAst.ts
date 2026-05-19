"use client";
import { useEffect } from "react";
import { usePlaygroundStore } from "@/stores/playground";
import { parse } from "@/lib/regex/parse";
import { enrich } from "@/lib/regex/enrich";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useShallow } from "zustand/react/shallow";

export const useAst = () => {
  const { source, flags, setAst, setParseError } = usePlaygroundStore(
    useShallow((s) => ({
      source: s.source,
      flags: s.flags,
      setAst: s.setAst,
      setParseError: s.setParseError,
    })),
  );

  const debouncedSource = useDebouncedValue(source, 200);
  const debouncedFlags = useDebouncedValue(flags, 200);

  useEffect(() => {
    const flagsStr = debouncedFlags.join("");
    const result = parse(debouncedSource, flagsStr);
    if (result.ok) {
      const ast = enrich(result.pattern);
      setAst(ast, []);
      setParseError(null);
    } else {
      setParseError(result.error);
    }
  }, [debouncedSource, debouncedFlags, setAst, setParseError]);

  const ast = usePlaygroundStore((s) => s.ast);
  const parseError = usePlaygroundStore((s) => s.parseError);
  return { ast, parseError };
};
