import { type ProjectDesignTokensJson } from "@majico-xyz/design-tokens";
import type { MotionPreference } from "./resolve-motion.js";
/**
 * Normalize a stored or partial `design_tokens_json` and read motion preference.
 *
 * @param raw - Project design tokens payload from DB or API.
 */
export declare function hydrateMotionPreferenceState(raw: unknown): {
    tokens: ProjectDesignTokensJson;
    preference: MotionPreference;
};
/**
 * Build a PATCH body that updates only `meta.motionPreference` on design tokens.
 *
 * @param preference - New per-project motion intensity.
 * @param existing - Current stored tokens (merged with defaults when partial).
 */
export declare function buildMotionPreferencePatch(preference: MotionPreference, existing?: ProjectDesignTokensJson | null): {
    designTokensJson: ProjectDesignTokensJson;
};
/**
 * Type guard for motion preference enum values.
 *
 * @param value - Unknown input from API or form control.
 */
export declare function isMotionPreference(value: unknown): value is MotionPreference;
