import { animate, stagger } from "motion";

type OpacityTransformKeyframes = {
  opacity: number | number[];
  transform: string | string[];
};

type OpacityTransformOptions = {
  duration: number;
  delay?: number | ReturnType<typeof stagger>;
  easing: string;
};

/**
 * Motion One wrapper limited to opacity + transform keyframes (landing motion policy).
 */
export function animateOpacityTransform(
  target: Element | Element[],
  keyframes: OpacityTransformKeyframes,
  options: OpacityTransformOptions
) {
  return animate(target, keyframes as never, options as never);
}

export { stagger };
