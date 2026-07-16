/** @vitest-environment jsdom */
import type { ReactNode } from "react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  LandingMotionContext,
  useLandingMotion,
  useLandingMotionContext,
} from "./use-landing-motion.js";

describe("useLandingMotion", () => {
  let changeHandler: (() => void) | null = null;
  let prefersReducedMotion = false;

  beforeEach(() => {
    changeHandler = null;
    prefersReducedMotion = false;
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        get matches() {
          return query.includes("reduce") ? prefersReducedMotion : false;
        },
        media: query,
        addEventListener: vi.fn((_event: string, handler: () => void) => {
          changeHandler = handler;
        }),
        removeEventListener: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exposes cinematic landing motion css vars by default", () => {
    const { result } = renderHook(() => useLandingMotion());

    expect(result.current.reducedMotionOs).toBe(false);
    expect(result.current.heroTimings.logoScaleDurationMs).toBeGreaterThan(0);
    expect(result.current.showcaseSpinDurationMs).toBeGreaterThan(0);
    expect(result.current.marqueeDurationMs).toBeGreaterThan(0);
    expect(result.current.carouselIntervalMs).toBeGreaterThan(0);
    expect(result.current.cssVars["--ds-motion-duration-normal"]).toBeTruthy();
    expect(
      result.current.cssVars["--lf-motion-showcase-spin-duration"]
    ).toMatch(/s$/);
    expect(
      result.current.cssVars["--lf-motion-carousel-interval"]
    ).toBeTruthy();
    expect(result.current.cssVars["--lf-motion-star-twinkle-duration"]).toMatch(
      /s$/
    );
  });

  it("forces instant motion when OS prefers reduced motion", async () => {
    prefersReducedMotion = true;
    const { result } = renderHook(() => useLandingMotion());

    await waitFor(() => {
      expect(result.current.reducedMotionOs).toBe(true);
    });
    expect(result.current.heroTimings.logoScaleDurationMs).toBe(0);
    expect(result.current.cssVars["--lf-motion-showcase-spin-duration"]).toBe(
      "0ms"
    );
    expect(result.current.cssVars["--lf-motion-marquee-duration"]).toBe("0ms");
    expect(result.current.cssVars["--lf-motion-star-twinkle-duration"]).toBe(
      "0ms"
    );
  });

  it("updates when matchMedia preference changes", async () => {
    const { result } = renderHook(() => useLandingMotion());
    expect(result.current.reducedMotionOs).toBe(false);

    prefersReducedMotion = true;
    act(() => {
      changeHandler?.();
    });

    await waitFor(() => {
      expect(result.current.reducedMotionOs).toBe(true);
    });
  });

  it("unsubscribes from matchMedia on unmount", () => {
    const removeListener = vi.fn();
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        get matches() {
          return false;
        },
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: removeListener,
      }))
    );

    const { unmount } = renderHook(() => useLandingMotion());
    unmount();

    expect(removeListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});

describe("useLandingMotionContext", () => {
  it("throws when used outside LandingMotionProvider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => renderHook(() => useLandingMotionContext())).toThrow(
      "useLandingMotionContext requires LandingMotionProvider"
    );

    consoleError.mockRestore();
  });

  it("returns context value from provider", () => {
    const value = {
      reducedMotionOs: false,
      resolved: {} as never,
      heroTimings: {} as never,
      showcaseSpinDurationMs: 1000,
      marqueeDurationMs: 2000,
      carouselIntervalMs: 3000,
      cssVars: { "--lf-motion-showcase-spin-duration": "30s" },
    };
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(LandingMotionContext.Provider, { value }, children);

    const { result } = renderHook(() => useLandingMotionContext(), {
      wrapper,
    });
    expect(result.current).toBe(value);
  });
});
