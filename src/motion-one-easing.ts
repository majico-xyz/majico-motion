/**
 * Convert a CSS `cubic-bezier(...)` easing string to a Motion One easing tuple.
 *
 * @param easing - CSS easing value (e.g. `cubic-bezier(0.2, 0, 0, 1)`).
 * @returns Motion One cubic-bezier array literal or `"ease-out"` fallback.
 */
export function cubicBezierToMotionOneEasing(easing: string): string {
  const match =
    /cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/i.exec(
      easing
    );
  if (!match) return `"ease-out"`;
  return `[${match[1]}, ${match[2]}, ${match[3]}, ${match[4]}]`;
}
