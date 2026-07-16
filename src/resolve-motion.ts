import {
  DEFAULT_MOTION,
  mergeMotionTokens,
  type DesignMotionTokens,
} from "@majico-xyz/design-tokens";

/** Surface type that selects default motion tier when preference is standard. */
export type MotionContext = "marketing" | "appChrome" | "reel" | "handoff";

/** Per-project motion intensity stored in `design_tokens_json.meta.motionPreference`. */
export type MotionPreference = "reduced" | "standard" | "cinematic";

/** Effective motion values after context, preference, and OS reduced-motion resolution. */
export type ResolvedMotion = DesignMotionTokens;

const CINEMATIC_DURATION_MULTIPLIER = 1.25;
const CINEMATIC_STAGGER_MULTIPLIER = 1.2;

/**
 * Parse a CSS time value (e.g. `320ms`, `1.2s`) into milliseconds.
 *
 * @param value - CSS duration string.
 * @returns Duration in milliseconds, or 0 when unparseable.
 */
export function parseDurationMs(value: string): number {
  const trimmed = value.trim();
  const msMatch = /^([\d.]+)\s*ms$/i.exec(trimmed);
  if (msMatch) return Number(msMatch[1]);
  const sMatch = /^([\d.]+)\s*s$/i.exec(trimmed);
  if (sMatch) return Number(sMatch[1]) * 1000;
  return 0;
}

/**
 * Format milliseconds as a CSS duration string.
 *
 * @param ms - Duration in milliseconds.
 * @returns CSS time value (`0ms` or `${n}ms`).
 */
export function formatDurationMs(ms: number): string {
  if (ms <= 0) return "0ms";
  return `${Math.round(ms)}ms`;
}

/**
 * Scale a CSS duration by a multiplier, preserving instant (0ms) values.
 *
 * @param value - Source CSS duration.
 * @param multiplier - Scale factor (e.g. cinematic boost).
 * @returns Scaled CSS duration string.
 */
export function scaleDuration(value: string, multiplier: number): string {
  const ms = parseDurationMs(value);
  if (ms <= 0) return value;
  return formatDurationMs(ms * multiplier);
}

function applyReducedMotion(motion: DesignMotionTokens): ResolvedMotion {
  const instant = motion.durationInstant;
  return {
    ...motion,
    durationMicro: instant,
    durationFast: instant,
    durationNormal: instant,
    durationEmphasis: instant,
    durationChoreography: instant,
    staggerSibling: instant,
    staggerStream: instant,
    holdReadable: instant,
  };
}

function applyCinematicBoost(motion: DesignMotionTokens): DesignMotionTokens {
  return {
    ...motion,
    durationEmphasis: scaleDuration(
      motion.durationEmphasis,
      CINEMATIC_DURATION_MULTIPLIER
    ),
    durationChoreography: scaleDuration(
      motion.durationChoreography,
      CINEMATIC_DURATION_MULTIPLIER
    ),
    staggerSibling: scaleDuration(
      motion.staggerSibling,
      CINEMATIC_STAGGER_MULTIPLIER
    ),
    staggerStream: scaleDuration(
      motion.staggerStream,
      CINEMATIC_STAGGER_MULTIPLIER
    ),
    holdReadable: scaleDuration(
      motion.holdReadable,
      CINEMATIC_DURATION_MULTIPLIER
    ),
  };
}

function resolveForContext(
  motion: DesignMotionTokens,
  context: MotionContext,
  preference: MotionPreference
): DesignMotionTokens {
  const base = mergeMotionTokens(motion);

  if (context === "handoff") {
    return preference === "cinematic" ? applyCinematicBoost(base) : base;
  }

  if (context === "marketing" || context === "reel") {
    const choreographed: DesignMotionTokens = {
      ...base,
      durationFast: base.durationNormal,
      durationNormal: base.durationEmphasis,
      durationEmphasis: base.durationChoreography,
      easingStandard: base.easingExpressive,
    };
    return preference === "cinematic"
      ? applyCinematicBoost(choreographed)
      : choreographed;
  }

  // appChrome — normal through emphasis for everyday UI
  const chrome: DesignMotionTokens = {
    ...base,
    durationChoreography:
      preference === "cinematic"
        ? scaleDuration(base.durationEmphasis, CINEMATIC_DURATION_MULTIPLIER)
        : base.durationEmphasis,
  };
  return preference === "cinematic" ? applyCinematicBoost(chrome) : chrome;
}

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
export function resolveMotion(input: ResolveMotionInput): ResolvedMotion {
  const preference = input.preference ?? "standard";
  const merged = mergeMotionTokens(input.motion ?? DEFAULT_MOTION);

  if (input.reducedMotionOs || preference === "reduced") {
    return applyReducedMotion(merged);
  }

  return resolveForContext(merged, input.context, preference);
}

/**
 * Map resolved motion values to `--ds-motion-*` CSS custom properties.
 *
 * @param resolved - Output of {@link resolveMotion}.
 * @returns Record of CSS variable names to values.
 */
export function resolvedMotionToCssVars(
  resolved: ResolvedMotion
): Record<string, string> {
  return {
    "--ds-motion-duration-instant": resolved.durationInstant,
    "--ds-motion-duration-micro": resolved.durationMicro,
    "--ds-motion-duration-fast": resolved.durationFast,
    "--ds-motion-duration-normal": resolved.durationNormal,
    "--ds-motion-duration-emphasis": resolved.durationEmphasis,
    "--ds-motion-duration-choreography": resolved.durationChoreography,
    "--ds-motion-ease-standard": resolved.easingStandard,
    "--ds-motion-ease-expressive": resolved.easingExpressive,
    "--ds-motion-stagger-sibling": resolved.staggerSibling,
    "--ds-motion-stagger-stream": resolved.staggerStream,
    "--ds-motion-hold-readable": resolved.holdReadable,
  };
}
