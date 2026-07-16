import { parseDurationMs } from "../resolve-motion.js";
import type { MotionOneTemplate, MotionOneTemplateInput } from "./types.js";

function cubicBezierToMotionOneEasing(easing: string): string {
  const match =
    /cubic-bezier\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/i.exec(
      easing
    );
  if (!match) return `"ease-out"`;
  return `[${match[1]}, ${match[2]}, ${match[3]}, ${match[4]}]`;
}

/**
 * Section entrance using Motion One `animate` — opacity + translateY.
 *
 * @param input - Resolved motion values from {@link resolveMotion}.
 */
export function sectionEntranceTemplate(
  input: MotionOneTemplateInput
): MotionOneTemplate {
  const durationSec =
    parseDurationMs(input.resolved.durationEmphasis) / 1000 || 0.001;
  const easing = cubicBezierToMotionOneEasing(input.resolved.easingStandard);
  const reducedGuard = input.reducedMotionSafe !== false;

  const componentTsx = `"use client";
import { useEffect, useRef } from "react";
import { animate } from "motion";

export function SectionEntrance({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    ${
      reducedGuard
        ? `if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }`
        : ""
    }
    const controls = animate(
      el,
      { opacity: [0, 1], transform: ["translateY(12px)", "translateY(0)"] },
      { duration: ${durationSec}, easing: ${easing} }
    );
    return () => controls.stop();
  }, []);

  return <div ref={ref}>{children}</div>;
}`;

  const vanillaJs = `(function(){
  var nodes = document.querySelectorAll("[data-motion-section-entrance]");
  if (!nodes.length) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  nodes.forEach(function(el) {
    if (reduced) { el.style.opacity = "1"; el.style.transform = "none"; return; }
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    el.style.transition = "opacity ${durationSec}s ${input.resolved.easingStandard}, transform ${durationSec}s ${input.resolved.easingStandard}";
    requestAnimationFrame(function() {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  });
})();`;

  return {
    id: "section-entrance",
    label: "Section entrance (emphasis tier)",
    componentTsx,
    vanillaJs,
  };
}
