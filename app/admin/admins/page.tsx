import { AdminNav, Field, inputClass, roleDescriptions, roleLabels } from "@/components/admin";
import { SubmitButton } from "@/components/submit-button";
import { deleteAdminUser, saveAdminUser } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/supabase/server";
import type { AdminRole, AdminUser } from "@/lib/types";

export const dynamic = "force-dynamic";

const roles: AdminRole[] = ["admin", "moderator", "reporter", "main_admin"];

export default async function AdminUsersPage({ searchParams }: { searchParams: { saved?: string; deleted?: string; error?: string } }) {
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
      <div className="mb-5 rounded-2xl border border-line bg-surface p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-accent">Доступи до адмінки</p>
        <h1 className="mt-2 font-rajdhani text-4xl font-bold">Адміни та ролі</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Тут ви додаєте email, який вже має акаунт у Supabase Auth, і вибираєте що ця людина може редагувати на сайті.
        </p>
      </div>

      {searchParams.saved ? <StatusMessage text="Адміна збережено." /> : null}
      {searchParams.deleted ? <StatusMessage text="Адміна видалено." /> : null}
      {searchParams.error === "auth_user_missing" ? (
        <ErrorMessage text="Цього email немає в Supabase Authentication. Спочатку створіть користувача в Supabase Auth, потім додайте його тут." />
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid gap-4">
          <div className="rounded-2xl border border-accent/25 bg-accent/10 p-5">
            <h2 className="font-rajdhani text-2xl font-bold">Додати нового адміна</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Введіть той самий email, який ви створили в Supabase Auth. Якщо email ще не створений у Supabase, людина не зможе увійти паролем.
            </p>
            <div className="mt-4">
              <AdminUserForm mode="create" />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-rajdhani text-2xl font-bold">Поточні адміни</h2>
                <p className="mt-1 text-sm text-slate-400">Змінюйте роль біля потрібного email і натискайте “Зберегти”.</p>
              </div>
              <div className="text-sm font-bold text-slate-400">Всього: {admins.length}</div>
            </div>
            <div className="mt-4 grid gap-3">
              {admins.length ? admins.map((admin) => <AdminUserForm key={admin.email} admin={admin} currentEmail={email || undefined} />) : (
                <div className="rounded-xl border border-dashed border-line bg-surface2 p-4 text-sm text-slate-400">
                  Поки немає записів у таблиці <code>admin_users</code>.
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-rajdhani text-2xl font-bold">Як додати через Supabase</h2>
            <ol className="mt-3 grid gap-3 text-sm leading-6 text-slate-300">
              <li><span className="font-bold text-white">1.</span> Supabase → Authentication → Users → Add user.</li>
              <li><span className="font-bold text-white">2.</span> Вкажіть email і тимчасовий пароль для людини.</li>
              <li><span className="font-bold text-white">3.</span> Поверніться сюди, додайте той самий email і виберіть роль.</li>
              <li><span className="font-bold text-white">4.</span> Людина входить на <code>/admin</code> своїм email і паролем.</li>
            </ol>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-rajdhani text-2xl font-bold">Що означають ролі</h2>
            <div className="mt-3 grid gap-3">
              {roles.map((item) => (
                <div key={item} className="rounded-xl border border-line bg-surface2 p-3">
                  <div className="font-bold text-white">{roleLabels[item]}</div>
                  <p className="mt-1 text-sm leading-5 text-slate-400">{roleDescriptions[item]}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function StatusMessage({ text }: { text: string }) {
  return <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-200">{text}</div>;
}

function ErrorMessage({ text }: { text: string }) {
  return <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm font-bold text-red-100">{text}</div>;
}

function AdminUserForm({ admin, currentEmail, mode = "edit" }: { admin?: AdminUser; currentEmail?: string; mode?: "create" | "edit" }) {
  const isCurrentUser = Boolean(admin && currentEmail && admin.email.toLowerCase() === currentEmail.toLowerCase());
  const createdAt = admin?.created_at ? new Intl.DateTimeFormat("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(admin.created_at)) : null;

  return (
    <form action={saveAdminUser} className="grid gap-3 rounded-xl border border-line bg-surface2 p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px_auto]">
        <Field label="Email">
          <input className={inputClass} name="email" type="email" placeholder="admin@email.com" defaultValue={admin?.email || ""} readOnly={Boolean(admin)} required />
        </Field>
        <Field label="Роль">
          {isCurrentUser ? <input type="hidden" name="role" value="main_admin" /> : null}
          <select className={inputClass} name="role" defaultValue={admin?.role || "reporter"} disabled={isCurrentUser}>
            <option value="admin">{roleLabels.admin}</option>
            <option value="moderator">{roleLabels.moderator}</option>
            <option value="reporter">{roleLabels.reporter}</option>
            <option value="main_admin">{roleLabels.main_admin}</option>
          </select>
          {isCurrentUser ? <span className="text-xs text-slate-500">Свою роль не можна понизити через сайт, щоб не втратити доступ.</span> : null}
        </Field>
        <div className="flex items-end gap-2">
          <SubmitButton pendingText="Зберігаю..." className="rounded-lg bg-accent px-4 py-2 font-bold text-bg">
            {mode === "create" ? "Додати" : "Зберегти"}
          </SubmitButton>
          {admin && !isCurrentUser ? (
            <SubmitButton formAction={deleteAdminUser} name="email" value={admin.email} pendingText="Видаляю..." className="rounded-lg border border-red-500/30 px-3 py-2 text-sm font-bold text-red-300">
              Видалити
            </SubmitButton>
          ) : null}
        </div>
      </div>
      {admin ? (
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span>{roleDescriptions[admin.role]}</span>
          {createdAt ? <span>Додано: {createdAt}</span> : null}
          {isCurrentUser ? <span className="text-accent">Це ваш акаунт.</span> : null}
        </div>
      ) : null}
    </form>
  );
}
