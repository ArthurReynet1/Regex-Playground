"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePlaygroundStore } from "@/stores/playground";
import { encodeShareUrl } from "@/lib/share/encode";

export const ShareButton = () => {
  const source = usePlaygroundStore((s) => s.source);
  const flags = usePlaygroundStore((s) => s.flags);
  const text = usePlaygroundStore((s) => s.text);

  const handleShare = () => {
    if (typeof window === "undefined") return;

    const encoded = encodeShareUrl({
      s: source,
      f: flags.join(""),
      t: text,
    });

    const url = new URL(window.location.href);
    if (encoded) {
      url.searchParams.set("d", encoded);
    } else {
      url.searchParams.delete("d");
    }

    navigator.clipboard.writeText(url.toString()).then(
      () => toast.success("Lien copié dans le presse-papiers"),
      () => toast.error("Échec de la copie"),
    );
  };

  const isEmpty = !source && !text;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={isEmpty}
      className="gap-2 motion-safe:transition-transform motion-safe:duration-100 motion-safe:active:scale-[0.97]"
    >
      <Share2 className="h-3.5 w-3.5" />
      Partager
    </Button>
  );
};
