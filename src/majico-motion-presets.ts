import {
  DEFAULT_MOTION,
  type DesignMotionTokens,
  type ProjectDesignTokensJson,
} from "@majico-xyz/design-tokens";
import {
  parseDurationMs,
  resolveMotion,
  type MotionContext,
  type MotionPreference,
  type ResolvedMotion,
} from "./resolve-motion.js";

/** Named landing / studio choreography presets backed by {@link resolveMotion}. */
export type MotionPresetId =
  | "tokenFountain"
  | "landingHero"
  | "landingShowcase"
  | "landingMarquee"
  | "landingCarousel"
  | "studioPanel"
  | "studioRegen"
  | "studioCanvasFocus"
  | "studioToast";

const PRESET_CONTEXT: Record<MotionPresetId, MotionContext> = {
  tokenFountain: "marketing",
  landingHero: "marketing",
  landingShowcase: "marketing",
  landingMarquee: "marketing",
  landingCarousel: "marketing",
  studioPanel: "appChrome",
  studioRegen: "appChrome",
  studioCanvasFocus: "appChrome",
  studioToast: "appChrome",
};

export type MotionPresetOptions = {
  /** Brand motion slice from `design_tokens_json.light.motion` (or dark). */
  motion?: Partial<DesignMotionTokens> | null;
  /** Per-project intensity from `design_tokens_json.meta.motionPreference`. */
  preference?: MotionPreference;
  /** When true, OS `prefers-reduced-motion` forces instant values. */
  reducedMotionOs?: boolean;
};

export type TokenFountainTimings = {
  flipDurationMs: number;
  lineDelayMs: number;
  streamStartDelayMs: number;
  holdAfterStreamMs: number;
  titleCharDelayMs: number;
  easingExpressive: string;
};

export type LandingHeroTimings = {
  logoScaleDurationMs: number;
  headlineStaggerMs: number;
  subcopyDelayMs: number;
  holdReadableMs: number;
  easingStandard: string;
};

export type StudioChromeTimings = {
  panelDurationMs: number;
  dockDurationMs: number;
  emphasisDurationMs: number;
  regenPulseDurationMs: number;
  canvasFocusDurationMs: number;
  easingStandard: string;
  easingExpressive: string;
  staggerSiblingMs: number;
};

/**
 * Resolve effective motion for a named preset.
 *
 * @param presetId - Landing or studio preset identifier.
 * @param options - Brand motion, project preference, and OS reduced-motion flag.
 * @returns Resolved motion token set for the preset's surface context.
 */
export function getMotionPreset(
  presetId: MotionPresetId,
  options: MotionPresetOptions = {}
): ResolvedMotion {
  return resolveMotion({
    motion: options.motion ?? DEFAULT_MOTION,
    context: PRESET_CONTEXT[presetId],
    preference: options.preference ?? "standard",
    reducedMotionOs: options.reducedMotionOs,
  });
}

/**
 * Read project motion preference from stored design tokens meta.
 *
 * @param tokens - Project `design_tokens_json` payload (partial ok).
 * @returns Stored preference or `standard` when unset.
 */
export function readMotionPreferenceFromTokens(
  tokens?: Pick<ProjectDesignTokensJson, "meta"> | null
): MotionPreference {
  const pref = tokens?.meta?.motionPreference;
  if (pref === "reduced" || pref === "standard" || pref === "cinematic") {
    return pref;
  }
  return "standard";
}

/**
 * Derive Token Fountain FLIP + stream timings from a resolved marketing preset.
 *
 * @param resolved - Output of {@link getMotionPreset} for `tokenFountain`.
 * @returns Millisecond timings and easing for FLIP choreography.
 */
export function getTokenFountainTimings(
  resolved: ResolvedMotion
): TokenFountainTimings {
  const lineDelayMs = parseDurationMs(resolved.staggerStream);
  const flipDurationMs = parseDurationMs(resolved.durationEmphasis);
  const holdAfterStreamMs = parseDurationMs(resolved.holdReadable);
  const staggerSiblingMs = parseDurationMs(resolved.staggerSibling);

  return {
    flipDurationMs,
    lineDelayMs,
    streamStartDelayMs: Math.max(400, Math.round(lineDelayMs * 3.2)),
    holdAfterStreamMs,
    titleCharDelayMs: Math.max(40, Math.round(staggerSiblingMs * 0.6)),
    easingExpressive: resolved.easingStandard,
  };
}

/**
 * Derive landing hero intro timings from a resolved marketing preset.
 *
 * @param resolved - Output of {@link getMotionPreset} for `landingHero`.
 * @returns Millisecond timings for logo scale, headline stagger, and subcopy delay.
 */
export function getLandingHeroTimings(
  resolved: ResolvedMotion
): LandingHeroTimings {
  const headlineStaggerMs = parseDurationMs(resolved.staggerSibling);
  return {
    logoScaleDurationMs: parseDurationMs(resolved.durationEmphasis),
    headlineStaggerMs,
    subcopyDelayMs: Math.round(headlineStaggerMs * 2),
    holdReadableMs: parseDurationMs(resolved.holdReadable),
    easingStandard: resolved.easingStandard,
  };
}

/** Baseline showcase Y-spin loop at default marketing holdReadable (1200ms → 20s). */
const SHOWCASE_SPIN_HOLD_RATIO = 20_000 / 1200;
/** Baseline integrations marquee at default marketing emphasis (2800ms → 36s). */
const MARQUEE_EMPHASIS_RATIO = 36_000 / 2800;
/** Baseline plans carousel interval at default holdReadable (1200ms → 4500ms). */
const CAROUSEL_HOLD_RATIO = 4500 / 1200;

/**
 * Showcase prism spin period from resolved `landingShowcase` motion.
 *
 * @param resolved - Output of {@link getMotionPreset} for `landingShowcase`.
 */
export function getLandingShowcaseSpinDurationMs(
  resolved: ResolvedMotion
): number {
  const hold = parseDurationMs(resolved.holdReadable);
  if (hold <= 0) return 0;
  return Math.round(hold * SHOWCASE_SPIN_HOLD_RATIO);
}

/**
 * Integrations marquee loop period from resolved `landingMarquee` motion.
 *
 * @param resolved - Output of {@link getMotionPreset} for `landingMarquee`.
 */
export function getLandingMarqueeDurationMs(resolved: ResolvedMotion): number {
  const emphasis = parseDurationMs(resolved.durationEmphasis);
  if (emphasis <= 0) return 0;
  return Math.round(emphasis * MARQUEE_EMPHASIS_RATIO);
}

/**
 * Mobile plans carousel auto-advance interval from `landingCarousel` motion.
 *
 * @param resolved - Output of {@link getMotionPreset} for `landingCarousel`.
 */
export function getLandingCarouselIntervalMs(resolved: ResolvedMotion): number {
  const hold = parseDurationMs(resolved.holdReadable);
  if (hold <= 0) return 0;
  return Math.round(hold * CAROUSEL_HOLD_RATIO);
}

/**
 * Derive Studio chrome timings from a resolved appChrome preset.
 *
 * @param resolved - Output of {@link getMotionPreset} for an appChrome preset.
 * @returns Millisecond timings for panels, dock, regen, and canvas focus.
 */
export function getStudioChromeTimings(
  resolved: ResolvedMotion
): StudioChromeTimings {
  return {
    panelDurationMs: parseDurationMs(resolved.durationNormal),
    dockDurationMs: parseDurationMs(resolved.durationFast),
    emphasisDurationMs: parseDurationMs(resolved.durationEmphasis),
    regenPulseDurationMs: parseDurationMs(resolved.durationEmphasis),
    canvasFocusDurationMs: parseDurationMs(resolved.durationEmphasis),
    easingStandard: resolved.easingStandard,
    easingExpressive: resolved.easingExpressive,
    staggerSiblingMs: parseDurationMs(resolved.staggerSibling),
  };
}

/**
 * Convenience: resolve Token Fountain preset and timings in one call.
 *
 * @param options - Brand motion, preference, and OS flag.
 */
export function resolveTokenFountainMotion(options: MotionPresetOptions = {}): {
  resolved: ResolvedMotion;
  timings: TokenFountainTimings;
} {
  const resolved = getMotionPreset("tokenFountain", options);
  return { resolved, timings: getTokenFountainTimings(resolved) };
}

/**
 * Convenience: resolve landing hero preset and timings in one call.
 *
 * @param options - Brand motion, preference, and OS flag.
 */
export function resolveLandingHeroMotion(options: MotionPresetOptions = {}): {
  resolved: ResolvedMotion;
  timings: LandingHeroTimings;
} {
  const resolved = getMotionPreset("landingHero", options);
  return { resolved, timings: getLandingHeroTimings(resolved) };
}

/**
 * Convenience: resolve Studio chrome preset and timings in one call.
 *
 * @param options - Brand motion, preference, and OS flag.
 */
export function resolveStudioChromeMotion(options: MotionPresetOptions = {}): {
  resolved: ResolvedMotion;
  timings: StudioChromeTimings;
} {
  const resolved = getMotionPreset("studioPanel", options);
  return { resolved, timings: getStudioChromeTimings(resolved) };
}
