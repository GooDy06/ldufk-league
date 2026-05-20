import { VetoTool } from "./veto-tool";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function VetoPage() {
  const { user } = await requireAdmin();

  if (!user) {
    const host = headers().get("x-ldufk-hostname") || headers().get("host") || "";
    redirect(host.toLowerCase().includes("veto.ldufk.com") ? "https://admin.ldufk.com" : "/admin");
  }

  return (
    <div className="py-4 sm:py-6">
      <div className="mb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">LDUFK tools</div>
          <h1 className="font-rajdhani text-3xl font-bold sm:text-4xl">CS2 Veto</h1>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400 sm:text-sm">
            Швидкий veto для матчів: вручну вписуєш команди, формат, pool карт і проходиш bans/picks по черзі.
          </p>
        </div>
      </div>
      <VetoTool />
    </div>
  );
}
