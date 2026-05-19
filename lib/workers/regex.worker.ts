import type {
  RunRequest,
  RunResponse,
  MatchResult,
  Capture,
} from "@/types/regex";

// RegExp with `d` flag exposes `.indices` on the match (ES2022).
// TypeScript may not narrow it automatically, hence the local shapes.
type IndicesArray = ReadonlyArray<readonly [number, number] | undefined> & {
  groups?: Record<string, readonly [number, number] | undefined>;
};

type IndexedMatch = RegExpExecArray & {
  indices?: IndicesArray;
};

const matchToResult = (match: IndexedMatch): MatchResult => {
  const start = match.index ?? 0;
  const end = start + match[0].length;
  const captures: Capture[] = [];

  const indices = match.indices;
  if (indices) {
    // Numbered groups — index 0 is the full match, we skip it
    for (let i = 1; i < indices.length; i++) {
      const groupIndices = indices[i];
      const groupValue = match[i];
      if (groupIndices && groupValue !== undefined) {
        captures.push({
          index: i,
          value: groupValue,
          start: groupIndices[0],
          end: groupIndices[1],
        });
      }
    }

    // Named groups — attach name to the matching numbered capture
    if (indices.groups && match.groups) {
      for (const [name, groupIndices] of Object.entries(indices.groups)) {
        const groupValue = match.groups[name];
        if (groupIndices && groupValue !== undefined) {
          const existing = captures.find(
            (c) => c.start === groupIndices[0] && c.end === groupIndices[1],
          );
          if (existing) {
            existing.name = name;
          }
        }
      }
    }
  }

  return { value: match[0], start, end, captures };
};

self.onmessage = (event: MessageEvent<RunRequest>) => {
  const { id, source, flags, text, maxMatches } = event.data;

  try {
    // Always ensure the `d` flag so we get indices for capture groups
    const finalFlags = flags.includes("d") ? flags : flags + "d";
    const regex = new RegExp(source, finalFlags);

    const matches: MatchResult[] = [];
    let truncated = false;

    if (regex.global || regex.sticky) {
      const iterator = text.matchAll(regex);
      for (const match of iterator) {
        if (matches.length >= maxMatches) {
          truncated = true;
          break;
        }
        matches.push(matchToResult(match as IndexedMatch));
      }
    } else {
      const match = regex.exec(text) as IndexedMatch | null;
      if (match) matches.push(matchToResult(match));
    }

    const response: RunResponse = { id, ok: true, matches, truncated };
    self.postMessage(response);
  } catch (e) {
    const error = e instanceof Error ? e.message : "Unknown worker error";
    const response: RunResponse = { id, ok: false, error };
    self.postMessage(response);
  }
};
