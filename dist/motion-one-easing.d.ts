/**
 * Convert a CSS `cubic-bezier(...)` easing string to a Motion One easing tuple.
 *
 * @param easing - CSS easing value (e.g. `cubic-bezier(0.2, 0, 0, 1)`).
 * @returns Motion One cubic-bezier array literal or `"ease-out"` fallback.
 */
export declare function cubicBezierToMotionOneEasing(easing: string): string;
