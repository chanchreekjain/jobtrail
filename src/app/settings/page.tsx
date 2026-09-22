import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth/current-user";
import { currentPlan } from "@/lib/plans";
import { countLookupsThisWeek } from "@/features/intel/repo";
import { setTheme } from "@/features/account/actions";
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

  return (
    <main className="min-h-screen p-12 max-w-2xl space-y-12">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section>
        <h2 className="text-lg font-semibold mb-1">Appearance</h2>
        <p className="text-sm text-gray-500 mb-4">Saved on this device.</p>

        {/* One form, three submit buttons: the one clicked sends its own
            name/value pair, so no JavaScript is needed. */}
        <form action={setTheme} className="flex gap-2" role="radiogroup" aria-label="Theme">
          {THEMES.map((t) => (
            <button
              key={t}
              type="submit"
              name="theme"
              value={t}
              role="radio"
              aria-checked={theme === t}
              className={`rounded border px-4 py-2 text-sm ${
                theme === t
                  ? "border-blue-600 ring-1 ring-blue-600"
                  : "border-gray-400 hover:bg-gray-500/10"
              }`}
            >
              {THEME_LABEL[t]}
            </button>
          ))}
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-1">Profile</h2>
        <p className="text-sm text-gray-500">Coming next — name and picture.</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Plan</h2>
        <div className="border border-gray-300 rounded p-4 space-y-2 text-sm">
          <p>
            You&apos;re on the <strong>{plan.label}</strong> plan.
          </p>
          <ul className="text-gray-500 space-y-1">
            <li>History shows your last {plan.historyLimit} JDs</li>
            <li>
              Company research: {Math.min(lookupsUsed, plan.intelPerWeek)} of{" "}
              {plan.intelPerWeek} lookups used in the last 7 days
            </li>
          </ul>
          <p className="text-gray-500 pt-2">Paid plans aren&apos;t available yet.</p>
        </div>
      </section>
    </main>
  );
}
