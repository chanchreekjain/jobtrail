export type PlanId = "free" | "pro" | "unlimited";

export type Plan = {
  id: PlanId;
  label: string;
  /** How many past JDs the history page will show. */
  historyLimit: number;
  /** Company lookups that spend a search credit, per rolling 7 days. */
  intelPerWeek: number;
  /** All AI calls — extraction, scoring, resume reading — per rolling day. */
  aiCallsPerDay: number;
};

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    label: "Free",
    historyLimit: 25,
    intelPerWeek: 10,
    aiCallsPerDay: 40,
  },
  pro: {
    id: "pro",
    label: "Pro",
    historyLimit: 250,
    intelPerWeek: 50,
    aiCallsPerDay: 200,
  },
  unlimited: {
    id: "unlimited",
    label: "Unlimited",
    historyLimit: 10_000,
    intelPerWeek: 200,
    aiCallsPerDay: 1_000,
  },
};

/**
 * Accounts exist now, but nobody can buy a plan yet, so everyone is on
 * free. When payments land, this reads the plan off the user's row —
 * and nothing that calls it has to change.
 */
export function currentPlan(): Plan {
  return PLANS.free;
}
