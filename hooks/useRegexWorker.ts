"use client";

import { useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePlaygroundStore } from "@/stores/playground";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { RunRequest, RunResponse } from "@/types/regex";

const MAX_MATCHES = 10_000;
const TIMEOUT_MS = 1000;
const MAX_TEXT_SIZE = 100 * 1024;

export const useRegexWorker = () => {
  const { source, flags, text, ast, parseError, setMatches, setRuntimeError } =
    usePlaygroundStore(
      useShallow((s) => ({
        source: s.source,
        flags: s.flags,
        text: s.text,
        ast: s.ast,
        parseError: s.parseError,
        setMatches: s.setMatches,
        setRuntimeError: s.setRuntimeError,
      })),
    );

  const debouncedSource = useDebouncedValue(source, 200);
  const debouncedFlags = useDebouncedValue(flags, 200);
  const debouncedText = useDebouncedValue(text, 100);

  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const spawnWorker = useCallback(() => {
    const worker = new Worker(
      new URL("../lib/workers/regex.worker.ts", import.meta.url),
      { type: "module" },
    );
    worker.onmessage = (event: MessageEvent<RunResponse>) => {
      const response = event.data;
      // Ignore stale responses (replaced by a newer request)
      if (response.id !== requestIdRef.current) return;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (response.ok) {
        setMatches(response.matches, response.truncated);
        setRuntimeError(null);
      } else {
        setMatches([], false);
        setRuntimeError({ kind: "unknown", message: response.error });
      }
    };
    workerRef.current = worker;
  }, [setMatches, setRuntimeError]);

  // Spawn at mount, cleanup at unmount
  useEffect(() => {
    spawnWorker();
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [spawnWorker]);

  // Run when inputs change
  useEffect(() => {
    if (parseError) return;
    if (!ast) return;
    if (!debouncedSource) {
      setMatches([], false);
      setRuntimeError(null);
      return;
    }
    if (debouncedText.length > MAX_TEXT_SIZE) {
      setMatches([], false);
      return;
    }

    requestIdRef.current += 1;
    const currentId = requestIdRef.current;

    const request: RunRequest = {
      id: currentId,
      source: debouncedSource,
      flags: debouncedFlags.join(""),
      text: debouncedText,
      maxMatches: MAX_MATCHES,
    };

    if (!workerRef.current) spawnWorker();
    workerRef.current?.postMessage(request);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      spawnWorker();
      setMatches([], false);
      setRuntimeError({
        kind: "timeout",
        message: "Regex trop lente (>1s) — possible catastrophic backtracking",
      });
      timeoutRef.current = null;
    }, TIMEOUT_MS);
  }, [
    debouncedSource,
    debouncedFlags,
    debouncedText,
    ast,
    parseError,
    setMatches,
    setRuntimeError,
    spawnWorker,
  ]);
};
