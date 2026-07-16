import { describe, expect, it } from "vitest";
import { DEFAULT_MOTION } from "@majico-xyz/design-tokens";
import { motionTokensToAppCssVars } from "./motion-to-app-css.js";

describe("motionTokensToAppCssVars", () => {
  it("maps motion tokens to --app-motion-* CSS variables", () => {
    const vars = motionTokensToAppCssVars(DEFAULT_MOTION);
    expect(vars["--app-motion-duration-fast"]).toBe(
      DEFAULT_MOTION.durationFast
    );
    expect(vars["--app-motion-ease-expressive"]).toBe(
      DEFAULT_MOTION.easingExpressive
    );
    expect(vars["--app-motion-stagger-stream"]).toBe(
      DEFAULT_MOTION.staggerStream
    );
  });
});
