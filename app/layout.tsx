import type { Metadata } from "next";
import { Exo_2, Rajdhani } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

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
        <footer className="border-t border-line py-6 text-center text-xs tracking-wide text-slate-500">
          <strong className="text-accent">LDUFK League</strong> · CS2 · Season 2026
        </footer>
      </body>
    </html>
  );
}
