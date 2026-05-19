import type { EnrichedNode, TranspileWarning } from "@/types/regex";

export type Target = "ecmascript" | "python" | "csharp";

export type TranspileInput = {
  ast: EnrichedNode | null;
  source: string;
  flags: string;
};

export type TranspileResult = {
  pattern: string;
  flags: string;
  snippet: string;
  warnings: TranspileWarning[];
};

export interface Transpiler {
  readonly target: Target;
  readonly label: string;
  readonly language: string;
  transpile(input: TranspileInput): TranspileResult;
}
