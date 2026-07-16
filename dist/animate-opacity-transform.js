import { animate, stagger } from "motion";
/**
 * Motion One wrapper limited to opacity + transform keyframes (landing motion policy).
 */
export function animateOpacityTransform(target, keyframes, options) {
    return animate(target, keyframes, options);
}
export { stagger };
