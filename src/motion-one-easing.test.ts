import { describe, expect, it } from "vitest";
import { cubicBezierToMotionOneEasing } from "./motion-one-easing.js";

describe("cubicBezierToMotionOneEasing", () => {
  it("parses cubic-bezier CSS easing into Motion One tuple syntax", () => {
    expect(cubicBezierToMotionOneEasing("cubic-bezier(0.2, 0, 0, 1)")).toBe(
      "[0.2, 0, 0, 1]"
    );
    expect(
      cubicBezierToMotionOneEasing("CUBIC-BEZIER( 0.33 , 1 , 0.68 , 1 )")
    ).toBe("[0.33, 1, 0.68, 1]");
  });

  it('falls back to "ease-out" for non-bezier values', () => {
    expect(cubicBezierToMotionOneEasing("ease-out")).toBe('"ease-out"');
    expect(cubicBezierToMotionOneEasing("linear")).toBe('"ease-out"');
    expect(cubicBezierToMotionOneEasing("")).toBe('"ease-out"');
  });
});
