import Link from "next/link";
import { demoFiles, demoViewerHref } from "@/lib/demo-files";

export const dynamic = "force-static";

export default function DemoViewerIndexPage() {
  return (
    <div className="py-8">
      <Link href="/matches" className="text-sm font-bold text-accent hover:text-white">Назад до матчів</Link>

      <section className="mt-5 rounded-2xl border border-line bg-surface p-5">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-accent">Demo Viewer</div>
        <h1 className="mt-2 font-rajdhani text-5xl font-bold leading-none">2D перегляд демо</h1>
        <p className="mt-3 max-w-3xl text-slate-400">
          Viewer відкривається окремо і не вантажить основні сторінки сайту. Демо-файл качається напряму з R2 тільки після відкриття перегляду.
        </p>

        <div className="mt-5 grid gap-3">
          {demoFiles.map((demo) => (
            <Link
              key={demo.matchId}
              href={demoViewerHref(demo.url)}
              className="grid gap-2 rounded-2xl border border-line bg-surface2 p-4 transition hover:border-accent/50 hover:text-accent md:grid-cols-[1fr_auto] md:items-center"
            >
              <div>
                <div className="font-rajdhani text-2xl font-bold text-slate-200">{demo.label}</div>
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">Match #{demo.matchId}</div>
              </div>
              <div className="rounded-xl border border-line bg-bg px-4 py-2 text-sm font-extrabold uppercase tracking-[0.14em] text-accent">Open 2D</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
