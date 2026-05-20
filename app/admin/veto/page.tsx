import { AdminNav } from "@/components/admin";
import { requireAdmin } from "@/lib/supabase/server";
import { VetoTool } from "@/app/veto/veto-tool";

export const dynamic = "force-dynamic";

export default async function AdminVetoPage() {
  const { user, role } = await requireAdmin();

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-12">
        <h1 className="font-rajdhani text-4xl font-bold">Admin login required</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">Спочатку увійди в адмінку, потім відкрий Veto.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <AdminNav role={role} />
      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">LDUFK tools</div>
        <h1 className="font-rajdhani text-3xl font-bold sm:text-4xl">CS2 Veto</h1>
        <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400 sm:text-sm">
          Керування veto доступне тільки з адмінки. OBS links можна додавати в трансляцію без логіну.
        </p>
      </div>
      <VetoTool />
    </div>
  );
}
