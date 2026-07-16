import { type MotionPreference, type ResolvedMotion } from "./resolve-motion.js";
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
export declare function useStudioMotion(projectId: string | null): UseStudioMotionResult;
