import { type LandingHeroTimings } from "./majico-motion-presets.js";
import { type ResolvedMotion } from "./resolve-motion.js";
export type UseLandingMotionResult = {
    reducedMotionOs: boolean;
    resolved: ResolvedMotion;
    heroTimings: LandingHeroTimings;
    showcaseSpinDurationMs: number;
    marqueeDurationMs: number;
    carouselIntervalMs: number;
    cssVars: Record<string, string>;
};
export declare const LandingMotionContext: any;
/**
 * Marketing landing motion: cinematic preference + OS reduced-motion + CSS vars
 * for showcase, marquee, and carousel surfaces.
 */
export declare function useLandingMotion(): UseLandingMotionResult;
/**
 * Read landing motion context from {@link LandingMotionProvider}.
 */
export declare function useLandingMotionContext(): UseLandingMotionResult;
