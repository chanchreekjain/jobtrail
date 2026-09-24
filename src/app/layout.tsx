import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";
import { CONSENT_COOKIE, parseConsent } from "@/features/account/cookie-consent";
import { THEME_COOKIE, parseTheme } from "@/features/account/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "jobtrail",
  description: "Track every application. Tailor every resume.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const jar = await cookies();
  const theme = parseTheme(jar.get(THEME_COOKIE)?.value);
  const consent = parseConsent(jar.get(CONSENT_COOKIE)?.value);

  return (
    <html
      lang="en"
      // "system" sets no attribute, so the CSS media query decides.
      data-theme={theme === "system" ? undefined : theme}
      // No h-full here: with html at 100% height, a phone's collapsing
      // address bar leaves a strip of empty page below the footer.
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      {/* dvh follows the visible viewport as the address bar hides;
          overflow-x-hidden stops a wide table dragging the page sideways. */}
      <body className="bg-bg text-text flex min-h-dvh flex-col overflow-x-hidden">
        <Nav />
        {children}
        <Footer />
        {consent === null && <CookieBanner />}
      </body>
    </html>
  );
}
