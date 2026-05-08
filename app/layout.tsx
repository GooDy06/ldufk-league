import type { Metadata } from "next";
import { Exo_2, Rajdhani } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { socialLinks } from "@/lib/site-config";
import { SpeedInsights } from "@vercel/speed-insights/next";

const exo = Exo_2({ subsets: ["latin", "cyrillic"], variable: "--font-exo" });
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani"
});

export const metadata: Metadata = {
  title: "LDUFK League",
  description: "Український портал навчальної CS2-ліги"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${exo.variable} ${rajdhani.variable}`}>
      <body className="font-exo">
        <SiteHeader />
        <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-12">{children}</main>
        <footer className="border-t border-line py-5">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs tracking-wide text-slate-500 sm:flex-row">
            <div>
              <strong className="text-accent">LDUFK League</strong> · CS2 · Season 2026
            </div>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-lg border border-line bg-surface text-[10px] font-extrabold text-slate-500 transition hover:border-accent/40 hover:bg-accent/10 hover:text-accent">
                  <span>{link.shortLabel}</span>
                  <img src={link.iconUrl} alt={link.label} className="absolute inset-0 m-auto h-4 w-4 object-contain" />
                </a>
              ))}
            </div>
          </div>
        </footer>
        <SpeedInsights />
      </body>
    </html>
  );
}
