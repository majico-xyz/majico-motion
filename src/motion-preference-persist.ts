import {
  buildProjectDesignTokensJson,
  normalizeProjectDesignTokensJson,
  type ProjectDesignTokensJson,
} from "@majico-xyz/design-tokens";
import type { MotionPreference } from "./resolve-motion.js";
import { readMotionPreferenceFromTokens } from "./majico-motion-presets.js";

const VALID_PREFERENCES = new Set<MotionPreference>([
  "reduced",
  "standard",
  "cinematic",
]);

/**
 * Normalize a stored or partial `design_tokens_json` and read motion preference.
 *
 * @param raw - Project design tokens payload from DB or API.
 */
export function hydrateMotionPreferenceState(raw: unknown): {
  tokens: ProjectDesignTokensJson;
  preference: MotionPreference;
} {
  const base =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? normalizeProjectDesignTokensJson(raw as ProjectDesignTokensJson)
      : buildProjectDesignTokensJson({});
  return {
    tokens: base,
    preference: readMotionPreferenceFromTokens(base),
  };
}

/**
 * Build a PATCH body that updates only `meta.motionPreference` on design tokens.
 *
 * @param preference - New per-project motion intensity.
 * @param existing - Current stored tokens (merged with defaults when partial).
 */
export function buildMotionPreferencePatch(
  preference: MotionPreference,
  existing?: ProjectDesignTokensJson | null
): { designTokensJson: ProjectDesignTokensJson } {
  const tokens = existing
    ? normalizeProjectDesignTokensJson(existing)
    : buildProjectDesignTokensJson({});
  return {
    designTokensJson: {
      ...tokens,
      meta: {
        ...tokens.meta,
        motionPreference: preference,
      },
    },
  };
}

/**
 * Type guard for motion preference enum values.
 *
 * @param value - Unknown input from API or form control.
 */
export function isMotionPreference(value: unknown): value is MotionPreference {
  return (
    typeof value === "string" &&
    VALID_PREFERENCES.has(value as MotionPreference)
  );
}
