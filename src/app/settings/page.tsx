import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth/current-user";
import { currentPlan } from "@/lib/plans";
import { countLookupsThisWeek } from "@/features/intel/repo";
import { setTheme } from "@/features/account/actions";
import { auth } from "@/auth";
import { ProfileForm } from "@/features/account/ui/profile-form";
import { Card, Page } from "@/components/ui";
import { DeleteButton } from "@/components/delete-button";
import { deleteAccount } from "@/features/account/actions";
import { aiCallsToday } from "@/lib/usage";
import { getKeyStatus } from "@/features/account/keys";
import { ApiKeyForm } from "@/features/account/ui/api-key-form";
import { removeApiKey } from "@/features/account/actions";
import { formatDay } from "@/lib/dates";
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
  const aiUsed = await aiCallsToday(user.id);
  const key = await getKeyStatus(user.id);
  const googleName = (await auth())?.user?.name ?? null;

  return (
    <Page
      title="Settings"
      sections={[
        { id: "appearance", label: "Appearance" },
        { id: "profile", label: "Profile" },
        { id: "plan", label: "Plan" },
        { id: "api-key", label: "Your own key" },
        { id: "delete", label: "Delete account" },
      ]}
    >
      <div className="max-w-2xl space-y-8">
        <Card id="appearance" className="scroll-mt-24 p-5">
          <h2 className="font-medium">Appearance</h2>
          <p className="text-muted mt-1 mb-4 text-sm">Saved on this device.</p>

          {/* One form, three submit buttons: the one clicked sends its own
            name/value pair, so no JavaScript is needed. */}
          <form
            action={setTheme}
            className="flex flex-wrap gap-2"
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

        <Card id="profile" className="scroll-mt-24 p-5">
          <h2 className="mb-4 font-medium">Profile</h2>
          <ProfileForm displayName={user.displayName} googleName={googleName} />
        </Card>

        <Card id="plan" className="scroll-mt-24 p-5">
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

        <Card id="api-key" className="scroll-mt-24 p-5">
          <h2 className="font-medium">Your own Gemini key</h2>
          <p className="text-muted mt-1 mb-4 text-sm">
            Optional. With your own key, requests run on your Google quota instead of
            the shared one, and the daily limit above doesn&apos;t apply to you. Get one
            free at{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Google AI Studio
            </a>
            .
          </p>

          {key ? (
            <div className="space-y-3 text-sm">
              <p>
                Key ending <span className="tabular">…{key.last4}</span>, added{" "}
                {formatDay(key.setAt)}.
              </p>
              <DeleteButton
                label="Remove key"
                confirm="Requests go back to the shared key and daily limit."
                onDelete={removeApiKey}
              />
            </div>
          ) : (
            <ApiKeyForm />
          )}

          <p className="text-faint mt-4 text-xs">
            Your key is encrypted before it&apos;s stored and is only used for your own
            requests. We can decrypt it to make those requests, so it isn&apos;t secret
            from this app — revoke it any time in Google AI Studio.
          </p>
        </Card>

        <Card id="delete" className="border-negative/40 scroll-mt-24 p-5">
          <h2 className="font-medium">Delete account</h2>
          <p className="text-muted mt-1 mb-4 text-sm">
            Removes your account and everything in it — saved JDs, applications, scores
            and your resume details. This can&apos;t be undone.
          </p>
          <DeleteButton
            label="Delete my account"
            confirm="Everything goes, permanently."
            onDelete={deleteAccount}
          />
        </Card>
      </div>
    </Page>
  );
}
