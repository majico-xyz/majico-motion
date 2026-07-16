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
 * Staggered list reveal using Motion One `animate` with sibling stagger token.
 *
 * @param input - Resolved motion values from {@link resolveMotion}.
 */
export function staggerListTemplate(
  input: MotionOneTemplateInput
): MotionOneTemplate {
  const durationSec =
    parseDurationMs(input.resolved.durationFast) / 1000 || 0.001;
  const staggerSec =
    parseDurationMs(input.resolved.staggerSibling) / 1000 || 0.001;
  const easing = cubicBezierToMotionOneEasing(input.resolved.easingStandard);
  const reducedGuard = input.reducedMotionSafe !== false;

  const componentTsx = `"use client";
import { useEffect, useRef } from "react";
import { animate, stagger } from "motion";

export function StaggerList({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = Array.from(root.children) as HTMLElement[];
    if (!items.length) return;
    ${
      reducedGuard
        ? `if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(function(el) {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }`
        : ""
    }
    const controls = animate(
      items,
      { opacity: [0, 1], transform: ["translateY(8px)", "translateY(0)"] },
      { duration: ${durationSec}, delay: stagger(${staggerSec}), easing: ${easing} }
    );
    return () => controls.stop();
  }, []);

  return <ul ref={ref}>{children}</ul>;
}`;

  const vanillaJs = `(function(){
  var lists = document.querySelectorAll("[data-motion-stagger-list]");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var staggerMs = ${parseDurationMs(input.resolved.staggerSibling)};
  lists.forEach(function(list) {
    var items = list.children;
    for (var i = 0; i < items.length; i++) {
      var el = items[i];
      if (reduced) { el.style.opacity = "1"; el.style.transform = "none"; continue; }
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      el.style.transition = "opacity ${durationSec}s ${input.resolved.easingStandard}, transform ${durationSec}s ${input.resolved.easingStandard}";
      (function(node, delay) {
        setTimeout(function() {
          node.style.opacity = "1";
          node.style.transform = "translateY(0)";
        }, delay);
      })(el, i * staggerMs);
    }
  });
})();`;

  return {
    id: "stagger-list",
    label: "Stagger list (sibling cadence)",
    componentTsx,
    vanillaJs,
  };
}
