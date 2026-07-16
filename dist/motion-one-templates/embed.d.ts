import type { ResolvedMotion } from "../resolve-motion.js";
import type { MotionOneTemplate } from "./types.js";
/**
 * All built-in Motion One templates for Studio HTML frames and landing samples.
 *
 * @param resolved - Effective motion from {@link resolveMotion}.
 */
export declare function buildMotionOneTemplates(resolved: ResolvedMotion): MotionOneTemplate[];
/**
 * Inject resolved motion CSS vars and vanilla fallback scripts into an HTML document.
 *
 * @param html - Full or partial HTML document string.
 * @param resolved - Effective motion values for the target surface.
 * @returns HTML with `:root` motion vars and optional vanilla stagger/entrance bootstraps.
 */
export declare function embedMotionOneInHtml(html: string, resolved: ResolvedMotion): string;
/**
 * Minimal Motion One CDN script tag for React-based Studio samples.
 */
export declare function motionOneCdnScriptTag(): string;
