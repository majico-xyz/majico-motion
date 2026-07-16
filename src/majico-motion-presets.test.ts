import { describe, expect, it } from "vitest";
import { DEFAULT_MOTION } from "@majico-xyz/design-tokens";
import {
  getLandingCarouselIntervalMs,
  getLandingHeroTimings,
  getLandingMarqueeDurationMs,
  getLandingShowcaseSpinDurationMs,
  getMotionPreset,
  getTokenFountainTimings,
  readMotionPreferenceFromTokens,
  resolveLandingHeroMotion,
  resolveTokenFountainMotion,
  resolveStudioChromeMotion,
} from "./majico-motion-presets.js";
import { parseDurationMs } from "./resolve-motion.js";

describe("majico-motion-presets", () => {
  it("maps landingHero to marketing choreography tier", () => {
    const resolved = getMotionPreset("landingHero", {
      motion: DEFAULT_MOTION,
      preference: "cinematic",
    });
    expect(parseDurationMs(resolved.durationEmphasis)).toBe(
      Math.round(parseDurationMs(DEFAULT_MOTION.durationChoreography) * 1.25)
    );
  });

  it("derives landing hero timings from resolved marketing motion", () => {
    const { timings } = resolveLandingHeroMotion({
      motion: DEFAULT_MOTION,
      preference: "cinematic",
    });
    const resolved = getMotionPreset("landingHero", {
      motion: DEFAULT_MOTION,
      preference: "cinematic",
    });
    expect(getLandingHeroTimings(resolved)).toEqual(timings);
    expect(timings.logoScaleDurationMs).toBe(
      parseDurationMs(resolved.durationEmphasis)
    );
    expect(timings.headlineStaggerMs).toBe(
      parseDurationMs(resolved.staggerSibling)
    );
    expect(timings.subcopyDelayMs).toBe(timings.headlineStaggerMs * 2);
    expect(timings.holdReadableMs).toBe(parseDurationMs(resolved.holdReadable));
  });

  it("forces instant landing hero timings when OS prefers reduced motion", () => {
    const { timings } = resolveLandingHeroMotion({
      motion: DEFAULT_MOTION,
      preference: "cinematic",
      reducedMotionOs: true,
    });
    expect(timings.logoScaleDurationMs).toBe(0);
    expect(timings.headlineStaggerMs).toBe(0);
    expect(timings.subcopyDelayMs).toBe(0);
    expect(timings.holdReadableMs).toBe(0);
  });

  it("scales landing surface loop durations from marketing presets", () => {
    const cinematic = {
      motion: DEFAULT_MOTION,
      preference: "cinematic" as const,
    };
    const showcase = getLandingShowcaseSpinDurationMs(
      getMotionPreset("landingShowcase", cinematic)
    );
    const marquee = getLandingMarqueeDurationMs(
      getMotionPreset("landingMarquee", cinematic)
    );
    const carousel = getLandingCarouselIntervalMs(
      getMotionPreset("landingCarousel", cinematic)
    );
    expect(showcase).toBeGreaterThan(20_000);
    expect(marquee).toBeGreaterThan(36_000);
    expect(carousel).toBeGreaterThan(4500);
  });

  it("returns zero landing surface loop durations when hold or emphasis is instant", () => {
    const instant = getMotionPreset("landingShowcase", {
      motion: DEFAULT_MOTION,
      preference: "cinematic",
      reducedMotionOs: true,
    });
    expect(getLandingShowcaseSpinDurationMs(instant)).toBe(0);
    expect(getLandingMarqueeDurationMs(instant)).toBe(0);
    expect(getLandingCarouselIntervalMs(instant)).toBe(0);
  });

  it("maps tokenFountain to marketing choreography tier", () => {
    const resolved = getMotionPreset("tokenFountain", {
      motion: DEFAULT_MOTION,
      preference: "standard",
    });
    expect(resolved.durationEmphasis).toBe(DEFAULT_MOTION.durationChoreography);
    expect(resolved.easingStandard).toBe(DEFAULT_MOTION.easingExpressive);
  });

  it("maps studioPanel to appChrome normal–emphasis tier", () => {
    const resolved = getMotionPreset("studioPanel", {
      motion: DEFAULT_MOTION,
      preference: "standard",
    });
    expect(resolved.durationNormal).toBe(DEFAULT_MOTION.durationNormal);
    expect(resolved.durationEmphasis).toBe(DEFAULT_MOTION.durationEmphasis);
  });

  it("derives Token Fountain timings from resolved marketing motion", () => {
    const { timings } = resolveTokenFountainMotion({ motion: DEFAULT_MOTION });
    expect(timings.flipDurationMs).toBe(
      parseDurationMs(DEFAULT_MOTION.durationChoreography)
    );
    expect(timings.lineDelayMs).toBe(
      parseDurationMs(DEFAULT_MOTION.staggerStream)
    );
    expect(timings.holdAfterStreamMs).toBe(
      parseDurationMs(DEFAULT_MOTION.holdReadable)
    );
    expect(timings.easingExpressive).toBe(DEFAULT_MOTION.easingExpressive);
  });

  it("forces instant Token Fountain timings when OS prefers reduced motion", () => {
    const { timings } = resolveTokenFountainMotion({
      motion: DEFAULT_MOTION,
      reducedMotionOs: true,
    });
    expect(timings.flipDurationMs).toBe(0);
    expect(timings.lineDelayMs).toBe(0);
    expect(timings.holdAfterStreamMs).toBe(0);
  });

  it("reads motion preference from design token meta", () => {
    expect(
      readMotionPreferenceFromTokens({
        meta: { motionPreference: "cinematic" },
      })
    ).toBe("cinematic");
    expect(readMotionPreferenceFromTokens({ meta: {} })).toBe("standard");
    expect(readMotionPreferenceFromTokens(null)).toBe("standard");
  });

  it("boosts studio chrome emphasis under cinematic preference", () => {
    const standard = resolveStudioChromeMotion({
      motion: DEFAULT_MOTION,
      preference: "standard",
    });
    const cinematic = resolveStudioChromeMotion({
      motion: DEFAULT_MOTION,
      preference: "cinematic",
    });
    expect(cinematic.timings.emphasisDurationMs).toBeGreaterThan(
      standard.timings.emphasisDurationMs
    );
  });
});

describe("getTokenFountainTimings", () => {
  it("uses marketing-resolved easing for FLIP", () => {
    const resolved = getMotionPreset("tokenFountain");
    const timings = getTokenFountainTimings(resolved);
    expect(timings.easingExpressive).toBe(resolved.easingStandard);
  });
});
