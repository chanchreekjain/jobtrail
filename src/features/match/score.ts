import type { MatchSummary, RequirementResult } from "./types";

/**
 * The score is plain arithmetic on the checklist, done in code, so it's
 * explainable: a must-have counts double a nice-to-have. The model decides
 * met / not met per line; it never picks the number.
 *
 * 3 of 4 musts and 1 of 2 nices = (2×3 + 1) / (2×4 + 2) = 7/10 = 70%.
 */
export function summarise(results: RequirementResult[]): MatchSummary {
  const must = results.filter((r) => r.kind === "must");
  const nice = results.filter((r) => r.kind === "nice");
  const mustMet = must.filter((r) => r.met).length;
  const niceMet = nice.filter((r) => r.met).length;

  const possible = 2 * must.length + nice.length;
  const earned = 2 * mustMet + niceMet;

  return {
    score: possible === 0 ? null : Math.round((100 * earned) / possible),
    mustMet,
    mustTotal: must.length,
    niceMet,
    niceTotal: nice.length,
  };
}
