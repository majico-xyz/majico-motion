import { type DesignMotionTokens, type ProjectDesignTokensJson } from "@majico-xyz/design-tokens";
import { type MotionPreference, type ResolvedMotion } from "./resolve-motion.js";
/** Named landing / studio choreography presets backed by {@link resolveMotion}. */
export type MotionPresetId = "tokenFountain" | "landingHero" | "landingShowcase" | "landingMarquee" | "landingCarousel" | "studioPanel" | "studioRegen" | "studioCanvasFocus" | "studioToast";
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
export declare function getMotionPreset(presetId: MotionPresetId, options?: MotionPresetOptions): ResolvedMotion;
/**
 * Read project motion preference from stored design tokens meta.
 *
 * @param tokens - Project `design_tokens_json` payload (partial ok).
 * @returns Stored preference or `standard` when unset.
 */
export declare function readMotionPreferenceFromTokens(tokens?: Pick<ProjectDesignTokensJson, "meta"> | null): MotionPreference;
/**
 * Derive Token Fountain FLIP + stream timings from a resolved marketing preset.
 *
 * @param resolved - Output of {@link getMotionPreset} for `tokenFountain`.
 * @returns Millisecond timings and easing for FLIP choreography.
 */
export declare function getTokenFountainTimings(resolved: ResolvedMotion): TokenFountainTimings;
/**
 * Derive landing hero intro timings from a resolved marketing preset.
 *
 * @param resolved - Output of {@link getMotionPreset} for `landingHero`.
 * @returns Millisecond timings for logo scale, headline stagger, and subcopy delay.
 */
export declare function getLandingHeroTimings(resolved: ResolvedMotion): LandingHeroTimings;
/**
 * Showcase prism spin period from resolved `landingShowcase` motion.
 *
 * @param resolved - Output of {@link getMotionPreset} for `landingShowcase`.
 */
export declare function getLandingShowcaseSpinDurationMs(resolved: ResolvedMotion): number;
/**
 * Integrations marquee loop period from resolved `landingMarquee` motion.
 *
 * @param resolved - Output of {@link getMotionPreset} for `landingMarquee`.
 */
export declare function getLandingMarqueeDurationMs(resolved: ResolvedMotion): number;
/**
 * Mobile plans carousel auto-advance interval from `landingCarousel` motion.
 *
 * @param resolved - Output of {@link getMotionPreset} for `landingCarousel`.
 */
export declare function getLandingCarouselIntervalMs(resolved: ResolvedMotion): number;
/**
 * Derive Studio chrome timings from a resolved appChrome preset.
 *
 * @param resolved - Output of {@link getMotionPreset} for an appChrome preset.
 * @returns Millisecond timings for panels, dock, regen, and canvas focus.
 */
export declare function getStudioChromeTimings(resolved: ResolvedMotion): StudioChromeTimings;
/**
 * Convenience: resolve Token Fountain preset and timings in one call.
 *
 * @param options - Brand motion, preference, and OS flag.
 */
export declare function resolveTokenFountainMotion(options?: MotionPresetOptions): {
    resolved: ResolvedMotion;
    timings: TokenFountainTimings;
};
/**
 * Convenience: resolve landing hero preset and timings in one call.
 *
 * @param options - Brand motion, preference, and OS flag.
 */
export declare function resolveLandingHeroMotion(options?: MotionPresetOptions): {
    resolved: ResolvedMotion;
    timings: LandingHeroTimings;
};
/**
 * Convenience: resolve Studio chrome preset and timings in one call.
 *
 * @param options - Brand motion, preference, and OS flag.
 */
export declare function resolveStudioChromeMotion(options?: MotionPresetOptions): {
    resolved: ResolvedMotion;
    timings: StudioChromeTimings;
};
