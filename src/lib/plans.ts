export type PlanId = "free" | "pro" | "unlimited";

export type Plan = {
  id: PlanId;
  label: string;
  /** How many past JDs the history page will show. */
  historyLimit: number;
};

export const PLANS: Record<PlanId, Plan> = {
  free: { id: "free", label: "Free", historyLimit: 25 },
  pro: { id: "pro", label: "Pro", historyLimit: 250 },
  unlimited: { id: "unlimited", label: "Unlimited", historyLimit: 10_000 },
};

/**
 * There are no accounts yet, so everyone is on the free plan.
 * When auth lands, this reads the plan off the signed-in user —
 * and nothing that calls it has to change.
 */
export function currentPlan(): Plan {
  return PLANS.free;
}
