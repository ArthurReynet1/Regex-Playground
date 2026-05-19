"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Global Framer Motion config:
 * - `reducedMotion: "user"` respects the OS `prefers-reduced-motion` setting.
 *   Users who have reduced motion enabled will get instant animations
 *   (no transitions), which is non-negotiable for a11y.
 */
export const MotionProvider = ({ children }: { children: ReactNode }) => (
  <MotionConfig reducedMotion="user">{children}</MotionConfig>
);
