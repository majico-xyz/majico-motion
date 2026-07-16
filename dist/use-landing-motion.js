"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_MOTION } from "@majico-xyz/design-tokens";
import { getLandingCarouselIntervalMs, getLandingHeroTimings, getLandingMarqueeDurationMs, getLandingShowcaseSpinDurationMs, getMotionPreset, } from "./majico-motion-presets.js";
import { formatDurationMs, parseDurationMs, resolvedMotionToCssVars, } from "./resolve-motion.js";
export const LandingMotionContext = createContext(null);
const LANDING_MOTION_OPTIONS = {
    motion: DEFAULT_MOTION,
    preference: "cinematic",
};
/**
 * Marketing landing motion: cinematic preference + OS reduced-motion + CSS vars
 * for showcase, marquee, and carousel surfaces.
 */
export function useLandingMotion() {
    const [reducedMotionOs, setReducedMotionOs] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReducedMotionOs(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);
    const presetOptions = useMemo(() => ({
        ...LANDING_MOTION_OPTIONS,
        reducedMotionOs,
    }), [reducedMotionOs]);
    const resolved = useMemo(() => getMotionPreset("landingHero", presetOptions), [presetOptions]);
    const heroTimings = useMemo(() => getLandingHeroTimings(resolved), [resolved]);
    const showcaseSpinDurationMs = useMemo(() => getLandingShowcaseSpinDurationMs(getMotionPreset("landingShowcase", presetOptions)), [presetOptions]);
    const marqueeDurationMs = useMemo(() => getLandingMarqueeDurationMs(getMotionPreset("landingMarquee", presetOptions)), [presetOptions]);
    const carouselIntervalMs = useMemo(() => getLandingCarouselIntervalMs(getMotionPreset("landingCarousel", presetOptions)), [presetOptions]);
    const cssVars = useMemo(() => {
        const base = resolvedMotionToCssVars(resolved);
        return {
            ...base,
            "--lf-motion-showcase-spin-duration": showcaseSpinDurationMs > 0
                ? `${showcaseSpinDurationMs / 1000}s`
                : "0ms",
            "--lf-motion-marquee-duration": marqueeDurationMs > 0 ? `${marqueeDurationMs / 1000}s` : "0ms",
            "--lf-motion-carousel-interval": formatDurationMs(carouselIntervalMs),
            "--lf-motion-star-twinkle-duration": parseDurationMs(resolved.holdReadable) > 0
                ? `${(parseDurationMs(resolved.holdReadable) / 1000) * 2.5}s`
                : "0ms",
        };
    }, [resolved, showcaseSpinDurationMs, marqueeDurationMs, carouselIntervalMs]);
    return {
        reducedMotionOs,
        resolved,
        heroTimings,
        showcaseSpinDurationMs,
        marqueeDurationMs,
        carouselIntervalMs,
        cssVars,
    };
}
/**
 * Read landing motion context from {@link LandingMotionProvider}.
 */
export function useLandingMotionContext() {
    const ctx = useContext(LandingMotionContext);
    if (!ctx) {
        throw new Error("useLandingMotionContext requires LandingMotionProvider");
    }
    return ctx;
}
