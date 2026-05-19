import { ecmascriptTranspiler } from "./ecmascript";
import { pythonTranspiler } from "./python";
import { csharpTranspiler } from "./csharp";
import type { Target, Transpiler } from "./types";

export const TRANSPILERS: Record<Target, Transpiler> = {
  ecmascript: ecmascriptTranspiler,
  python: pythonTranspiler,
  csharp: csharpTranspiler,
};

export const exportKeyToTarget = (
  key: "js" | "python" | "csharp",
): Target => {
  switch (key) {
    case "js":
      return "ecmascript";
    case "python":
      return "python";
    case "csharp":
      return "csharp";
  }
};
