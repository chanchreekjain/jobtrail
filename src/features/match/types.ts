export type RequirementResult = {
  text: string;
  skill: string;
  kind: "must" | "nice";
  met: boolean;
  evidence: string | null;
};

export type MatchSummary = {
  score: number | null;
  mustMet: number;
  mustTotal: number;
  niceMet: number;
  niceTotal: number;
};

export type Match = MatchSummary & { results: RequirementResult[] };
