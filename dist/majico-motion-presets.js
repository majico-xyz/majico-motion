import { DEFAULT_MOTION, } from "@majico-xyz/design-tokens";
import { parseDurationMs, resolveMotion, } from "./resolve-motion.js";
const PRESET_CONTEXT = {
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
/**
 * Resolve effective motion for a named preset.
 *
 * @param presetId - Landing or studio preset identifier.
 * @param options - Brand motion, project preference, and OS reduced-motion flag.
 * @returns Resolved motion token set for the preset's surface context.
 */
export function getMotionPreset(presetId, options = {}) {
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
export function readMotionPreferenceFromTokens(tokens) {
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
export function getTokenFountainTimings(resolved) {
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
export function getLandingHeroTimings(resolved) {
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
export function getLandingShowcaseSpinDurationMs(resolved) {
    const hold = parseDurationMs(resolved.holdReadable);
    if (hold <= 0)
        return 0;
    return Math.round(hold * SHOWCASE_SPIN_HOLD_RATIO);
}
/**
 * Integrations marquee loop period from resolved `landingMarquee` motion.
 *
 * @param resolved - Output of {@link getMotionPreset} for `landingMarquee`.
 */
export function getLandingMarqueeDurationMs(resolved) {
    const emphasis = parseDurationMs(resolved.durationEmphasis);
    if (emphasis <= 0)
        return 0;
    return Math.round(emphasis * MARQUEE_EMPHASIS_RATIO);
}
/**
 * Mobile plans carousel auto-advance interval from `landingCarousel` motion.
 *
 * @param resolved - Output of {@link getMotionPreset} for `landingCarousel`.
 */
export function getLandingCarouselIntervalMs(resolved) {
    const hold = parseDurationMs(resolved.holdReadable);
    if (hold <= 0)
        return 0;
    return Math.round(hold * CAROUSEL_HOLD_RATIO);
}
/**
 * Derive Studio chrome timings from a resolved appChrome preset.
 *
 * @param resolved - Output of {@link getMotionPreset} for an appChrome preset.
 * @returns Millisecond timings for panels, dock, regen, and canvas focus.
 */
export function getStudioChromeTimings(resolved) {
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
export function resolveTokenFountainMotion(options = {}) {
    const resolved = getMotionPreset("tokenFountain", options);
    return { resolved, timings: getTokenFountainTimings(resolved) };
}
/**
 * Convenience: resolve landing hero preset and timings in one call.
 *
 * @param options - Brand motion, preference, and OS flag.
 */
export function resolveLandingHeroMotion(options = {}) {
    const resolved = getMotionPreset("landingHero", options);
    return { resolved, timings: getLandingHeroTimings(resolved) };
}
/**
 * Convenience: resolve Studio chrome preset and timings in one call.
 *
 * @param options - Brand motion, preference, and OS flag.
 */
export function resolveStudioChromeMotion(options = {}) {
    const resolved = getMotionPreset("studioPanel", options);
    return { resolved, timings: getStudioChromeTimings(resolved) };
}
