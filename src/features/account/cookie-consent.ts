export const CONSENT_COOKIE = "cookie-choice";

export type Consent = "all" | "essential";

export function parseConsent(value: string | undefined): Consent | null {
  return value === "all" || value === "essential" ? value : null;
}
