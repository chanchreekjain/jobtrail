import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth/current-user";
import { currentPlan } from "@/lib/plans";
import { countLookupsThisWeek } from "@/features/intel/repo";
import { setTheme } from "@/features/account/actions";
import { auth } from "@/auth";
import { ProfileForm } from "@/features/account/ui/profile-form";
import { Card, Page } from "@/components/ui";
import { THEME_COOKIE, THEMES, parseTheme, type Theme } from "@/features/account/theme";

const THEME_LABEL: Record<Theme, string> = {
  system: "Match my device",
  light: "Light",
  dark: "Dark",
};

export default async function SettingsPage() {
  const user = await requireUser();
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);
  const plan = currentPlan();
  const lookupsUsed = await countLookupsThisWeek(user.id);
  const googleName = (await auth())?.user?.name ?? null;

  return (
    <Page title="Settings" width="narrow">
      <div className="space-y-8">
        <Card className="p-5">
          <h2 className="font-medium">Appearance</h2>
          <p className="text-muted mt-1 mb-4 text-sm">Saved on this device.</p>

          {/* One form, three submit buttons: the one clicked sends its own
            name/value pair, so no JavaScript is needed. */}
          <form
            action={setTheme}
            className="flex gap-2"
            role="radiogroup"
            aria-label="Theme"
          >
            {THEMES.map((t) => (
              <button
                key={t}
                type="submit"
                name="theme"
                value={t}
                role="radio"
                aria-checked={theme === t}
                className={`rounded-[var(--radius)] border px-4 py-2 text-sm ${
                  theme === t
                    ? "border-accent ring-accent ring-1"
                    : "border-line-strong hover:bg-surface-2"
                }`}
              >
                {THEME_LABEL[t]}
              </button>
            ))}
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-medium">Profile</h2>
          <ProfileForm displayName={user.displayName} googleName={googleName} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-medium">Plan</h2>
          <div className="space-y-2 text-sm">
            <p>
              You&apos;re on the <strong>{plan.label}</strong> plan.
            </p>
            <ul className="text-muted space-y-1">
              <li>History shows your last {plan.historyLimit} JDs</li>
              <li>
                Company research: {Math.min(lookupsUsed, plan.intelPerWeek)} of{" "}
                {plan.intelPerWeek} lookups used in the last 7 days
              </li>
            </ul>
            <p className="text-muted pt-2">Paid plans aren&apos;t available yet.</p>
          </div>
        </Card>
      </div>
    </Page>
  );
}
