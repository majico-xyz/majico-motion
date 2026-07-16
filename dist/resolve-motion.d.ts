import { type DesignMotionTokens } from "@majico-xyz/design-tokens";
/** Surface type that selects default motion tier when preference is standard. */
export type MotionContext = "marketing" | "appChrome" | "reel" | "handoff";
/** Per-project motion intensity stored in `design_tokens_json.meta.motionPreference`. */
export type MotionPreference = "reduced" | "standard" | "cinematic";
/** Effective motion values after context, preference, and OS reduced-motion resolution. */
export type ResolvedMotion = DesignMotionTokens;
/**
 * Parse a CSS time value (e.g. `320ms`, `1.2s`) into milliseconds.
 *
 * @param value - CSS duration string.
 * @returns Duration in milliseconds, or 0 when unparseable.
 */
export declare function parseDurationMs(value: string): number;
/**
 * Format milliseconds as a CSS duration string.
 *
 * @param ms - Duration in milliseconds.
 * @returns CSS time value (`0ms` or `${n}ms`).
 */
export declare function formatDurationMs(ms: number): string;
/**
 * Scale a CSS duration by a multiplier, preserving instant (0ms) values.
 *
 * @param value - Source CSS duration.
 * @param multiplier - Scale factor (e.g. cinematic boost).
 * @returns Scaled CSS duration string.
 */
export declare function scaleDuration(value: string, multiplier: number): string;
export type ResolveMotionInput = {
    /** Brand motion tokens from `design_tokens_json` (partial values merged with defaults). */
    motion?: Partial<DesignMotionTokens> | null;
    /** Surface context selecting default tier when preference is standard. */
    context: MotionContext;
    /** Per-project intensity; defaults to standard. */
    preference?: MotionPreference;
    /** When true, OS `prefers-reduced-motion` forces instant final states. */
    reducedMotionOs?: boolean;
};
/**
 * Resolve effective motion durations and easings from brand tokens, surface context,
 * project preference, and OS reduced-motion.
 *
 * Resolution order: merge brand tokens → context tier → preference → OS override.
 *
 * @param input - Brand motion, context, preference, and OS flag.
 * @returns Effective motion token set for the target surface.
 */
export declare function resolveMotion(input: ResolveMotionInput): ResolvedMotion;
/**
 * Map resolved motion values to `--ds-motion-*` CSS custom properties.
 *
 * @param resolved - Output of {@link resolveMotion}.
 * @returns Record of CSS variable names to values.
 */
export declare function resolvedMotionToCssVars(resolved: ResolvedMotion): Record<string, string>;
