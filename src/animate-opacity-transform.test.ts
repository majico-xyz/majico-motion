/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";

const { animateMock, staggerMock } = vi.hoisted(() => ({
  animateMock: vi.fn(() => ({ stop: vi.fn() })),
  staggerMock: vi.fn(),
}));

vi.mock("motion", () => ({
  animate: animateMock,
  stagger: staggerMock,
}));

import {
  animateOpacityTransform,
  stagger,
} from "./animate-opacity-transform.js";

describe("animateOpacityTransform", () => {
  it("delegates opacity + transform keyframes to Motion One animate", () => {
    const target = document.createElement("div");
    const keyframes = {
      opacity: [0, 1],
      transform: ["translateY(8px)", "none"],
    };
    const options = { duration: 0.5, easing: "ease-out" };

    const controls = animateOpacityTransform(target, keyframes, options);

    expect(animateMock).toHaveBeenCalledWith(target, keyframes, options);
    expect(controls).toEqual({ stop: expect.any(Function) });
  });

  it("re-exports stagger from motion", () => {
    stagger(0.1);
    expect(staggerMock).toHaveBeenCalledWith(0.1);
  });
});
