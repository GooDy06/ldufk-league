import { AdminNav, Field, inputClass } from "@/components/admin";
import { SubmitButton } from "@/components/submit-button";
import { saveHomepageChampion } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/supabase/server";
import type { Division, HomepageChampion } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage({ searchParams }: { searchParams: { saved?: string } }) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("homepage_champions").select("*").order("slot");
  const champions = (data || []) as HomepageChampion[];
  const university = champions.find((champion) => champion.slot === "University");
  const school = champions.find((champion) => champion.slot === "School");

  return (
    <div className="py-8">
      <AdminNav />
      <h1 className="mb-4 font-rajdhani text-4xl font-bold">Homepage winners</h1>
      {searchParams.saved ? <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm font-bold text-emerald-200">Головну оновлено.</div> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChampionForm slot="University" champion={university} />
        <ChampionForm slot="School" champion={school} />
      </div>
    </div>
  );
}

function ChampionForm({ slot, champion }: { slot: Division; champion?: HomepageChampion }) {
  return (
    <form action={saveHomepageChampion} className="grid gap-3 rounded-2xl border border-line bg-surface p-4">
      <input type="hidden" name="slot" value={slot} />
      <div>
        <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent">{slot} banner</div>
        <h2 className="font-rajdhani text-2xl font-bold">Переможець {slot} Division</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Winner team name">
          <input className={inputClass} name="team_name" defaultValue={champion?.team_name || ""} required />
        </Field>
        <Field label="Tournament name">
          <input className={inputClass} name="tournament_name" defaultValue={champion?.tournament_name || ""} required />
        </Field>
        <Field label="Date label">
          <input className={inputClass} name="date_label" defaultValue={champion?.date_label || ""} required />
        </Field>
        <Field label="Division label">
          <input className={inputClass} name="division_label" defaultValue={champion?.division_label || slot} required />
        </Field>
        <Field label="Winner photo URL">
          <input className={inputClass} name="image_url" placeholder="https://..." defaultValue={champion?.image_url || ""} />
        </Field>
        <Field label="Details URL">
          <input className={inputClass} name="details_url" placeholder="/tournaments/..." defaultValue={champion?.details_url || ""} />
        </Field>
      </div>
      <SubmitButton pendingText="Зберігаю..." className="w-fit rounded-lg bg-accent px-4 py-2 font-bold text-bg">
        Зберегти
      </SubmitButton>
    </form>
  );
}
