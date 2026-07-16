import type { ResolvedMotion } from "../resolve-motion.js";

/** Input for generating Motion One snippets wired to resolved brand motion. */
export type MotionOneTemplateInput = {
  resolved: ResolvedMotion;
  /** When true, generated code respects `prefers-reduced-motion`. */
  reducedMotionSafe?: boolean;
};

/** A reusable Motion One code snippet for Studio HTML frames or exports. */
export type MotionOneTemplate = {
  id: string;
  label: string;
  /** React / Motion One component source (string for embedding in htmlFrame). */
  componentTsx: string;
  /** Optional vanilla JS fallback when React is unavailable. */
  vanillaJs?: string;
};
