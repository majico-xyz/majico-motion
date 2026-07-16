import { describe, expect, it } from "vitest";
import { DEFAULT_MOTION } from "@majico-xyz/design-tokens";
import {
  parseDurationMs,
  formatDurationMs,
  resolveMotion,
  resolvedMotionToCssVars,
  scaleDuration,
} from "./resolve-motion.js";

describe("resolveMotion", () => {
  it("uses appChrome normal–emphasis tiers for standard preference", () => {
    const resolved = resolveMotion({
      motion: DEFAULT_MOTION,
      context: "appChrome",
      preference: "standard",
    });

    expect(resolved.durationNormal).toBe(DEFAULT_MOTION.durationNormal);
    expect(resolved.durationEmphasis).toBe(DEFAULT_MOTION.durationEmphasis);
    expect(resolved.easingStandard).toBe(DEFAULT_MOTION.easingStandard);
    expect(parseDurationMs(resolved.durationChoreography)).toBe(
      parseDurationMs(DEFAULT_MOTION.durationEmphasis)
    );
  });

  it("uses choreography tier for marketing and reel contexts", () => {
    const marketing = resolveMotion({
      motion: DEFAULT_MOTION,
      context: "marketing",
      preference: "standard",
    });
    const reel = resolveMotion({
      motion: DEFAULT_MOTION,
      context: "reel",
      preference: "standard",
    });

    expect(marketing.durationEmphasis).toBe(
      DEFAULT_MOTION.durationChoreography
    );
    expect(marketing.easingStandard).toBe(DEFAULT_MOTION.easingExpressive);
    expect(marketing.holdReadable).toBe(DEFAULT_MOTION.holdReadable);
    expect(reel.durationEmphasis).toBe(DEFAULT_MOTION.durationChoreography);
    expect(reel.holdReadable).toBe(DEFAULT_MOTION.holdReadable);
  });

  it("returns full brand tokens for handoff context", () => {
    const resolved = resolveMotion({
      motion: DEFAULT_MOTION,
      context: "handoff",
      preference: "standard",
    });

    expect(resolved).toEqual(DEFAULT_MOTION);
  });

  it("forces instant durations when OS prefers reduced motion", () => {
    const resolved = resolveMotion({
      motion: DEFAULT_MOTION,
      context: "marketing",
      preference: "cinematic",
      reducedMotionOs: true,
    });

    expect(resolved.durationFast).toBe("0ms");
    expect(resolved.durationChoreography).toBe("0ms");
    expect(resolved.staggerStream).toBe("0ms");
    expect(resolved.holdReadable).toBe("0ms");
  });

  it("forces instant durations when project preference is reduced", () => {
    const resolved = resolveMotion({
      motion: DEFAULT_MOTION,
      context: "appChrome",
      preference: "reduced",
    });

    expect(resolved.durationNormal).toBe("0ms");
    expect(resolved.durationEmphasis).toBe("0ms");
  });

  it("applies cinematic multiplier to choreography surfaces", () => {
    const standard = resolveMotion({
      motion: DEFAULT_MOTION,
      context: "marketing",
      preference: "standard",
    });
    const cinematic = resolveMotion({
      motion: DEFAULT_MOTION,
      context: "marketing",
      preference: "cinematic",
    });

    expect(parseDurationMs(cinematic.durationChoreography)).toBeGreaterThan(
      parseDurationMs(standard.durationChoreography)
    );
    expect(parseDurationMs(cinematic.holdReadable)).toBeGreaterThan(
      parseDurationMs(standard.holdReadable)
    );
    expect(parseDurationMs(cinematic.staggerStream)).toBeGreaterThan(
      parseDurationMs(standard.staggerStream)
    );
  });

  it("maps resolved motion to CSS variables", () => {
    const resolved = resolveMotion({
      motion: DEFAULT_MOTION,
      context: "handoff",
    });
    const vars = resolvedMotionToCssVars(resolved);

    expect(vars["--ds-motion-duration-choreography"]).toBe(
      DEFAULT_MOTION.durationChoreography
    );
    expect(vars["--ds-motion-ease-expressive"]).toBe(
      DEFAULT_MOTION.easingExpressive
    );
  });
});

describe("duration helpers", () => {
  it("parses and scales CSS durations", () => {
    expect(parseDurationMs("320ms")).toBe(320);
    expect(parseDurationMs("1.2s")).toBe(1200);
    expect(parseDurationMs("not-a-duration")).toBe(0);
    expect(formatDurationMs(0)).toBe("0ms");
    expect(scaleDuration("400ms", 1.25)).toBe("500ms");
    expect(scaleDuration("0ms", 1.25)).toBe("0ms");
  });
});
