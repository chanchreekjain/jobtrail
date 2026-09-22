export type RequirementResult = {
  text: string;
  skill: string;
  kind: "must" | "nice";
  met: boolean;
  /** False for things a resume can't show (attitude etc.) — left out of the score. */
  assessable?: boolean;
  evidence: string | null;
};

export type MatchSummary = {
  score: number | null;
  mustMet: number;
  mustTotal: number;
  niceMet: number;
  niceTotal: number;
};

export type MatchMethod = "ai" | "basic";

export type Match = MatchSummary & {
  results: RequirementResult[];
  method: MatchMethod;
};
