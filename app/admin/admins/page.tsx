import { AdminNav, Field, inputClass } from "@/components/admin";
import { SubmitButton } from "@/components/submit-button";
import { deleteAdminUser, saveAdminUser } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/supabase/server";
import type { AdminUser } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }: { searchParams: { saved?: string; deleted?: string } }) {
  const { supabase, role, email } = await requireAdmin();

  if (role !== "main_admin") {
    return (
      <div className="py-8">
        <AdminNav role={role} />
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-100">Доступ тільки для головного адміна.</div>
      </div>
    );
  }

  const { data } = await supabase.from("admin_users").select("*").order("created_at", { ascending: false });
  const admins = (data || []) as AdminUser[];

  return (
    <div className="py-8">
      <AdminNav role={role} />
      <h1 className="mb-4 font-rajdhani text-4xl font-bold">Admins</h1>
      {searchParams.saved ? <StatusMessage text="Адміна збережено." /> : null}
      {searchParams.deleted ? <StatusMessage text="Адміна видалено." /> : null}
      <AdminUserForm />
      <div className="mt-6 grid gap-3">
        {admins.map((admin) => <AdminUserForm key={admin.email} admin={admin} currentEmail={email || undefined} />)}
      </div>
    </div>
  );
}

function StatusMessage({ text }: { text: string }) {
  return <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-200">{text}</div>;
}

function AdminUserForm({ admin, currentEmail }: { admin?: AdminUser; currentEmail?: string }) {
  const isCurrentUser = Boolean(admin && currentEmail && admin.email.toLowerCase() === currentEmail.toLowerCase());

  return (
    <form action={saveAdminUser} className="grid gap-3 rounded-2xl border border-line bg-surface p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <Field label="Email">
          <input className={inputClass} name="email" type="email" defaultValue={admin?.email || ""} readOnly={Boolean(admin)} required />
        </Field>
        <Field label="Role">
          {isCurrentUser ? <input type="hidden" name="role" value="main_admin" /> : null}
          <select className={inputClass} name="role" defaultValue={admin?.role || "reporter"} disabled={isCurrentUser}>
            <option value="main_admin">Головний адмін</option>
            <option value="admin">Адмін</option>
            <option value="moderator">Модератор</option>
            <option value="reporter">Репортер</option>
          </select>
          {isCurrentUser ? <span className="text-xs text-slate-500">Свою роль не можна понизити через сайт, щоб не втратити доступ.</span> : null}
        </Field>
        <div className="flex items-end gap-2">
          <SubmitButton pendingText="Зберігаю..." className="rounded-lg bg-accent px-4 py-2 font-bold text-bg">
            {admin ? "Зберегти" : "Додати"}
          </SubmitButton>
          {admin && !isCurrentUser ? (
            <SubmitButton formAction={deleteAdminUser} name="email" value={admin.email} pendingText="Видаляю..." className="rounded-lg border border-red-500/30 px-3 py-2 text-sm font-bold text-red-300">
              Видалити
            </SubmitButton>
          ) : null}
        </div>
      </div>
    </form>
  );
}
