import { VetoTool } from "./veto-tool";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/supabase/server";
import { signOut } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function VetoPage() {
  const { user } = await requireAdmin();

  if (!user) {
    const host = headers().get("x-ldufk-hostname") || headers().get("host") || "";
    redirect(host.toLowerCase().includes("veto.ldufk.com") ? "https://admin.ldufk.com/admin/veto" : "/admin/veto");
  }

  return (
    <div className="py-4 sm:py-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">LDUFK tools</div>
          <h1 className="font-rajdhani text-3xl font-bold sm:text-4xl">CS2 Veto</h1>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400 sm:text-sm">
            Швидкий veto для матчів: вручну вписуєш команди, формат, pool карт і проходиш bans/picks по черзі.
          </p>
        </div>
        <form action={signOut}>
          <input type="hidden" name="redirect_to" value="https://admin.ldufk.com" />
          <button className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100">Sign out</button>
        </form>
      </div>
      <VetoTool />
    </div>
  );
}
