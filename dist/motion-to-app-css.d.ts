import type { DesignMotionTokens } from "@majico-xyz/design-tokens";
/**
 * Map motion tokens to `--app-motion-*` CSS custom properties for app-brand injection.
 *
 * @param motion - Canonical or merged brand motion token set.
 * @returns CSS variable names and values for layout / guidelines consumption.
 */
export declare function motionTokensToAppCssVars(motion: DesignMotionTokens): Record<string, string>;
