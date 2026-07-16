"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_MOTION } from "@majico-xyz/design-tokens";
import {
  resolveStudioChromeMotion,
  type MotionPresetOptions,
} from "./majico-motion-presets.js";
import {
  buildMotionPreferencePatch,
  hydrateMotionPreferenceState,
  isMotionPreference,
} from "./motion-preference-persist.js";
import {
  resolvedMotionToCssVars,
  type MotionPreference,
  type ResolvedMotion,
} from "./resolve-motion.js";

export type UseStudioMotionResult = {
  preference: MotionPreference;
  reducedMotionOs: boolean;
  resolved: ResolvedMotion;
  cssVars: Record<string, string>;
  busy: boolean;
  error: string | null;
  setPreference: (next: MotionPreference) => Promise<boolean>;
};

/**
 * Studio hook: project motion preference + OS reduced-motion + resolved appChrome tokens.
 *
 * @param projectId - Active Majico project id (null disables persistence).
 */
export function useStudioMotion(
  projectId: string | null
): UseStudioMotionResult {
  const [preference, setPreferenceState] =
    useState<MotionPreference>("standard");
  const [reducedMotionOs, setReducedMotionOs] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokensLoaded, setTokensLoaded] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotionOs(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!projectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when project context clears
      setPreferenceState("standard");
      setTokensLoaded(true);
      return;
    }
    let cancelled = false;
    setTokensLoaded(false);
    (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Could not load project motion settings");
        const data = (await res.json()) as {
          design_tokens_json?: unknown;
        };
        if (cancelled) return;
        const hydrated = hydrateMotionPreferenceState(data.design_tokens_json);
        setPreferenceState(hydrated.preference);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load motion settings"
          );
        }
      } finally {
        if (!cancelled) setTokensLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const motionOptions: MotionPresetOptions = useMemo(
    () => ({
      motion: DEFAULT_MOTION,
      preference,
      reducedMotionOs,
    }),
    [preference, reducedMotionOs]
  );

  const { resolved } = useMemo(
    () => resolveStudioChromeMotion(motionOptions),
    [motionOptions]
  );

  const cssVars = useMemo(() => resolvedMotionToCssVars(resolved), [resolved]);

  const setPreference = useCallback(
    async (next: MotionPreference) => {
      if (!projectId || !isMotionPreference(next)) return false;
      setBusy(true);
      setError(null);
      const previous = preference;
      setPreferenceState(next);
      try {
        const loadRes = await fetch(`/api/projects/${projectId}`, {
          cache: "no-store",
        });
        const loadData = loadRes.ok
          ? ((await loadRes.json()) as { design_tokens_json?: unknown })
          : {};
        const hydrated = hydrateMotionPreferenceState(
          loadData.design_tokens_json
        );
        const patch = buildMotionPreferencePatch(next, hydrated.tokens);
        const saveRes = await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!saveRes.ok) {
          const payload = (await saveRes.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error ?? "Could not save motion preference");
        }
        return true;
      } catch (saveError) {
        setPreferenceState(previous);
        setError(
          saveError instanceof Error
            ? saveError.message
            : "Could not save motion preference"
        );
        return false;
      } finally {
        setBusy(false);
      }
    },
    [preference, projectId]
  );

  return {
    preference: tokensLoaded ? preference : "standard",
    reducedMotionOs,
    resolved,
    cssVars,
    busy,
    error,
    setPreference,
  };
}
