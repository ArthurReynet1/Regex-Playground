"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { usePlaygroundStore } from "@/stores/playground";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type { Flag } from "@/types/regex";

const FLAG_INFO: Record<Flag, { label: string; tooltip: string }> = {
  g: { label: "g", tooltip: "Global — toutes les occurrences" },
  i: { label: "i", tooltip: "Insensible à la casse" },
  m: { label: "m", tooltip: "Multi-ligne — ^ et $ matchent par ligne" },
  s: { label: "s", tooltip: "Dotall — . matche aussi le saut de ligne" },
  u: { label: "u", tooltip: "Unicode — support des codepoints" },
  y: { label: "y", tooltip: "Sticky — match à partir de lastIndex" },
  d: { label: "d", tooltip: "Indices — positions des groupes capturés" },
  v: { label: "v", tooltip: "Unicode set notation (ES2024)" },
};

const PRIMARY: Flag[] = ["g", "i", "m", "s", "u"];
const ADVANCED: Flag[] = ["y", "d", "v"];

type FlagToggleProps = {
  flag: Flag;
  active: boolean;
  onToggle: () => void;
};

const FlagToggle = ({ flag, active, onToggle }: FlagToggleProps) => {
  const info = FLAG_INFO[flag];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          pressed={active}
          onPressedChange={onToggle}
          aria-label={info.tooltip}
          variant="outline"
          size="sm"
          className="font-mono"
        >
          {info.label}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>{info.tooltip}</TooltipContent>
    </Tooltip>
  );
};

export const FlagsToggles = () => {
  const flags = usePlaygroundStore((s) => s.flags);
  const setFlags = usePlaygroundStore((s) => s.setFlags);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleFlag = (flag: Flag) => {
    if (flags.includes(flag)) {
      setFlags(flags.filter((f) => f !== flag));
    } else {
      setFlags([...flags, flag]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRIMARY.map((flag) => (
        <FlagToggle
          key={flag}
          flag={flag}
          active={flags.includes(flag)}
          onToggle={() => toggleFlag(flag)}
        />
      ))}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvanced((prev) => !prev)}
        className="gap-1"
      >
        {showAdvanced ? "Masquer" : "Advanced"}
        {showAdvanced ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </Button>

      {showAdvanced &&
        ADVANCED.map((flag) => (
          <FlagToggle
            key={flag}
            flag={flag}
            active={flags.includes(flag)}
            onToggle={() => toggleFlag(flag)}
          />
        ))}
    </div>
  );
};
