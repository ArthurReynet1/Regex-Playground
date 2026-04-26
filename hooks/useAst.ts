"use client";
import { useEffect } from "react";
import { usePlaygroundStore } from "@/stores/playground";
import { parse } from "@/lib/regex/parse";
import { enrich } from "@/lib/regex/enrich";
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

  useEffect(() => {
    const flagsStr = flags.join("");
    const result = parse(source, flagsStr);
    if (result.ok) {
      const ast = enrich(result.pattern);
      setAst(ast, []);
      setParseError(null);
    } else {
      setParseError(result.error);
    }
  }, [source, flags, setAst, setParseError]);

  const ast = usePlaygroundStore((s) => s.ast);
  const parseError = usePlaygroundStore((s) => s.parseError);
  return { ast, parseError };
};
