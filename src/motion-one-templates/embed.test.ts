import { describe, expect, it } from "vitest";
import { DEFAULT_MOTION } from "@majico-xyz/design-tokens";
import {
  buildMotionOneTemplates,
  embedMotionOneInHtml,
  sectionEntranceTemplate,
} from "../motion-one-templates.js";
import { resolveMotion } from "../resolve-motion.js";

describe("motion-one-templates", () => {
  const resolved = resolveMotion({ context: "marketing" });

  it("builds section entrance template wired to resolved motion", () => {
    const template = sectionEntranceTemplate({ resolved });
    expect(template.id).toBe("section-entrance");
    expect(template.componentTsx).toContain('from "motion"');
    expect(template.componentTsx).toContain("prefers-reduced-motion");
    expect(template.vanillaJs).toContain("data-motion-section-entrance");
  });

  it("returns stagger and entrance templates from buildMotionOneTemplates", () => {
    const templates = buildMotionOneTemplates(resolved);
    expect(templates.map((t) => t.id)).toEqual([
      "section-entrance",
      "stagger-list",
    ]);
  });

  it("embeds motion CSS vars and vanilla scripts into HTML documents", () => {
    const html =
      "<!DOCTYPE html><html><head></head><body><ul data-motion-stagger-list><li>A</li></ul></body></html>";
    const out = embedMotionOneInHtml(html, resolved);
    expect(out).toContain("--ds-motion-duration-choreography");
    expect(out).toContain(DEFAULT_MOTION.durationChoreography);
    expect(out).toContain("data-motion-stagger-list");
    expect(out).toContain("<script>");
  });
});
