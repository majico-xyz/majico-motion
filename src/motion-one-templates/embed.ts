import { resolvedMotionToCssVars } from "../resolve-motion.js";
import type { ResolvedMotion } from "../resolve-motion.js";
import { staggerListTemplate } from "./stagger-list.js";
import { sectionEntranceTemplate } from "./section-entrance.js";
import type { MotionOneTemplate } from "./types.js";

const MOTION_CDN =
  "https://cdn.jsdelivr.net/npm/motion@12.23.12/dist/motion.min.js";

/**
 * All built-in Motion One templates for Studio HTML frames and landing samples.
 *
 * @param resolved - Effective motion from {@link resolveMotion}.
 */
export function buildMotionOneTemplates(
  resolved: ResolvedMotion
): MotionOneTemplate[] {
  const input = { resolved, reducedMotionSafe: true };
  return [sectionEntranceTemplate(input), staggerListTemplate(input)];
}

/**
 * Inject resolved motion CSS vars and vanilla fallback scripts into an HTML document.
 *
 * @param html - Full or partial HTML document string.
 * @param resolved - Effective motion values for the target surface.
 * @returns HTML with `:root` motion vars and optional vanilla stagger/entrance bootstraps.
 */
export function embedMotionOneInHtml(
  html: string,
  resolved: ResolvedMotion
): string {
  const vars = resolvedMotionToCssVars(resolved);
  const varBlock = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  const cssInjection = `<style id="majico-motion-vars">:root {\n${varBlock}\n}</style>`;

  const templates = buildMotionOneTemplates(resolved);
  const scriptBody = templates
    .map((t) => t.vanillaJs ?? "")
    .filter(Boolean)
    .join("\n");
  const scriptInjection = scriptBody ? `<script>${scriptBody}</script>` : "";

  let out = html;
  if (out.includes("</head>")) {
    out = out.replace("</head>", `${cssInjection}\n</head>`);
  } else {
    out = `${cssInjection}\n${out}`;
  }

  if (scriptInjection) {
    if (out.includes("</body>")) {
      out = out.replace("</body>", `${scriptInjection}\n</body>`);
    } else {
      out = `${out}\n${scriptInjection}`;
    }
  }

  return out;
}

/**
 * Minimal Motion One CDN script tag for React-based Studio samples.
 */
export function motionOneCdnScriptTag(): string {
  return `<script src="${MOTION_CDN}" crossorigin="anonymous"></script>`;
}
