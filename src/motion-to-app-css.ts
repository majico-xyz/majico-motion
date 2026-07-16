import type { DesignMotionTokens } from "@majico-xyz/design-tokens";

/**
 * Map motion tokens to `--app-motion-*` CSS custom properties for app-brand injection.
 *
 * @param motion - Canonical or merged brand motion token set.
 * @returns CSS variable names and values for layout / guidelines consumption.
 */
export function motionTokensToAppCssVars(
  motion: DesignMotionTokens
): Record<string, string> {
  return {
    "--app-motion-duration-instant": motion.durationInstant,
    "--app-motion-duration-micro": motion.durationMicro,
    "--app-motion-duration-fast": motion.durationFast,
    "--app-motion-duration-normal": motion.durationNormal,
    "--app-motion-duration-emphasis": motion.durationEmphasis,
    "--app-motion-duration-choreography": motion.durationChoreography,
    "--app-motion-ease-standard": motion.easingStandard,
    "--app-motion-ease-expressive": motion.easingExpressive,
    "--app-motion-stagger-sibling": motion.staggerSibling,
    "--app-motion-stagger-stream": motion.staggerStream,
    "--app-motion-hold-readable": motion.holdReadable,
  };
}
