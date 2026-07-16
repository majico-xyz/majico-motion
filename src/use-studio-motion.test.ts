/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { buildProjectDesignTokensJson } from "@majico-xyz/design-tokens";
import { useStudioMotion } from "./use-studio-motion.js";

describe("useStudioMotion", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("reduce") ? false : false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads project motion preference and exposes resolved appChrome vars", async () => {
    const tokens = buildProjectDesignTokensJson({});
    tokens.meta = { motionPreference: "cinematic" };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ design_tokens_json: tokens }),
    });

    const { result } = renderHook(() => useStudioMotion("proj-1"));

    await waitFor(() => {
      expect(result.current.preference).toBe("cinematic");
    });
    expect(result.current.cssVars["--ds-motion-duration-normal"]).toBeTruthy();
  });

  it("persists preference via PATCH designTokensJson", async () => {
    const tokens = buildProjectDesignTokensJson({});
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ design_tokens_json: tokens }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ design_tokens_json: tokens }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ design_tokens_json: tokens }),
      });

    const { result } = renderHook(() => useStudioMotion("proj-2"));

    await waitFor(() => {
      expect(result.current.preference).toBe("standard");
    });

    await act(async () => {
      const ok = await result.current.setPreference("reduced");
      expect(ok).toBe(true);
    });

    expect(result.current.preference).toBe("reduced");
    const patchCall = fetchMock.mock.calls.find(
      (call) => call[1]?.method === "PATCH"
    );
    expect(patchCall).toBeTruthy();
    const body = JSON.parse(String(patchCall?.[1]?.body));
    expect(body.designTokensJson.meta.motionPreference).toBe("reduced");
  });

  it("forces instant resolved durations when OS prefers reduced motion", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("reduce"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        design_tokens_json: buildProjectDesignTokensJson({}),
      }),
    });

    const { result } = renderHook(() => useStudioMotion("proj-3"));

    await waitFor(() => {
      expect(result.current.reducedMotionOs).toBe(true);
    });
    expect(result.current.resolved.durationNormal).toBe("0ms");
  });
});
