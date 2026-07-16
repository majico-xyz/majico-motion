import { describe, expect, it } from "vitest";
import {
  buildMotionPreferencePatch,
  hydrateMotionPreferenceState,
  isMotionPreference,
} from "./motion-preference-persist.js";
import { buildProjectDesignTokensJson } from "@majico-xyz/design-tokens";

describe("motion-preference-persist", () => {
  it("hydrates preference from stored design tokens meta", () => {
    const tokens = buildProjectDesignTokensJson({});
    tokens.meta = { motionPreference: "reduced" };
    const hydrated = hydrateMotionPreferenceState(tokens);
    expect(hydrated.preference).toBe("reduced");
    expect(hydrated.tokens.meta?.motionPreference).toBe("reduced");
  });

  it("defaults to standard when meta is missing", () => {
    const hydrated = hydrateMotionPreferenceState(null);
    expect(hydrated.preference).toBe("standard");
  });

  it("builds a designTokensJson patch preserving other meta fields", () => {
    const existing = buildProjectDesignTokensJson({});
    existing.meta = {
      motionPreference: "standard",
      headingFont: "Poppins",
    };
    const patch = buildMotionPreferencePatch("cinematic", existing);
    expect(patch.designTokensJson.meta?.motionPreference).toBe("cinematic");
    expect(patch.designTokensJson.meta?.headingFont).toBe("Poppins");
  });

  it("validates motion preference enum values", () => {
    expect(isMotionPreference("standard")).toBe(true);
    expect(isMotionPreference("cinematic")).toBe(true);
    expect(isMotionPreference("expressive")).toBe(false);
  });
});
