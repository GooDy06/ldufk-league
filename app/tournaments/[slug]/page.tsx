import { notFound } from "next/navigation";
import { getCircuitTournamentBySlug } from "@/lib/circuit-tournaments";
import { createClient } from "@/lib/supabase/server";
import type { Tournament } from "@/lib/types";
import { CalendarDays, CircleDollarSign, Gamepad2, GraduationCap, Monitor, ShieldCheck, Sparkles, Trophy, UsersRound } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { FALLBACK_HERO_IMAGE, publicImageUrl } from "@/lib/image-url";

export const dynamic = "force-dynamic";

export default async function TournamentDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data } = await supabase.from("tournaments").select("*, winner:teams(name, slug)").eq("slug", params.slug).eq("published", true).single();
  if (!data) {
    const circuitItem = getCircuitTournamentBySlug(params.slug);
    if (!circuitItem) notFound();

    return <CircuitTournamentDetail {...circuitItem} />;
  }

  const tournament = data as Tournament;

  return (
    <article className="mx-auto max-w-4xl py-8">
      <div className="mb-4">
        <BackButton fallbackHref="/tournaments" label="Назад до турнірів" />
      </div>
      <div className="mb-4 h-72 rounded-2xl border border-line bg-cover bg-center" style={{ backgroundImage: `url(${publicImageUrl(tournament.banner_url || FALLBACK_HERO_IMAGE)})` }} />
      <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">{tournament.division} · {tournament.type}</div>
      <h1 className="mt-2 font-rajdhani text-5xl font-bold">{tournament.name}</h1>
      <p className="mt-4 text-lg leading-8 text-slate-300">{tournament.description}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Info label="Дата" value={tournament.date_label} />
        <Info label="Статус" value={tournament.status} />
        <Info label="Переможець" value={tournament.winner?.name || "Буде визначено"} />
        <Info label="Формат" value={tournament.format || "TBA"} />
        <Info label="Очки" value={tournament.points || "TBA"} />
        <Info label="Приз" value={tournament.prize || "TBA"} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {tournament.participants.map((participant) => (
          <span key={participant} className="rounded-full border border-line bg-surface2 px-3 py-1 text-sm text-slate-300">{participant}</span>
        ))}
      </div>
    </article>
  );
}

function CircuitTournamentDetail({ league, tournament }: NonNullable<ReturnType<typeof getCircuitTournamentBySlug>>) {
  const isRegistration = tournament.status === "Реєстрація";
  const leagueTone = league.key === "school" ? "text-school" : "text-accent";
  const leagueLabel = league.key === "school" ? "School League" : "University League";
  const invitedLabel = league.key === "school" ? "учня" : "студента";
  const timeline = tournamentTimeline(tournament.month, isRegistration);

  return (
    <article className="mx-auto max-w-5xl py-5 sm:py-8">
      <BackButton fallbackHref="/tournaments" label="Назад до турнірів" />

      <section className={`mt-4 overflow-hidden rounded-3xl border bg-surface ${isRegistration ? "border-emerald-300/45 shadow-[0_0_40px_rgba(52,211,153,0.12)]" : "border-line"}`}>
        <div className="relative min-h-[280px] bg-cover bg-center p-4 sm:p-6" style={{ backgroundImage: "url('/map-images/de_mirage.jpg')" }}>
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(7,10,16,0.98),rgba(7,10,16,0.82)_58%,rgba(0,213,255,0.1))]" />
          <div className="relative z-10 max-w-3xl">
            <div className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] ${isRegistration ? "border-emerald-300/35 bg-emerald-300/15 text-emerald-200" : "border-gold/25 bg-gold/10 text-gold"}`}>
              {tournament.status}
            </div>
            <div className={`mt-4 text-[10px] font-extrabold uppercase tracking-[0.22em] ${leagueTone}`}>{leagueLabel}</div>
            <h1 className="mt-2 font-rajdhani text-4xl font-bold leading-none sm:text-6xl">{tournament.name}</h1>
            <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">{tournament.description}</p>
            {isRegistration ? (
              <button type="button" className="focus-ring mt-5 inline-flex rounded-lg border border-emerald-300/40 bg-emerald-300 px-4 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-bg transition hover:bg-emerald-200">
                Зареєструватися
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-3 border-t border-line p-3 sm:grid-cols-4 sm:gap-x-4 sm:p-4">
          <DetailFact icon={Gamepad2} label="Дисципліна" value="Counter-Strike 2" />
          <DetailFact icon={Trophy} label="Призовий фонд" value={tournament.prizePool} tone="gold" />
          <DetailFact icon={ShieldCheck} label="Поточний етап" value={isRegistration ? "Реєстрація" : tournament.status} />
          <DetailFact icon={Monitor} label="Формат" value={tournament.format} />
          <DetailFact icon={GraduationCap} label="Ліга" value={leagueLabel} />
          <DetailFact icon={CalendarDays} label="Місяць" value={tournament.month} />
          <DetailFact icon={UsersRound} label="Склад" value="5 або 4+1" />
          <DetailFact icon={CircleDollarSign} label="LDUFK Points" value={tournament.points ? `${tournament.points} points` : "Не нараховуються"} />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-gold">Етапи турніру</div>
            <h2 className="mt-1 font-rajdhani text-3xl font-bold">Графік турніру</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            Поточний етап підсвічено зеленим. Після завершення реєстрації команди проходять підтвердження складів і отримують розклад матчів.
          </p>
        </div>
        <TournamentTimeline steps={timeline} />
      </section>

      <section className="mt-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-accent">Умови участі</div>
        <h2 className="mt-1 font-rajdhani text-3xl font-bold">Реєстрація на турнір</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Участь безкоштовна. Команда представляє свій заклад освіти, грає онлайн та бореться за перші LDUFK Points сезону. Команда може грати повним складом свого закладу або використати опцію 4+1.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ["Склад", "5 гравців з одного закладу освіти."],
            ["Опція 4+1", `За потреби можна взяти до 1 запрошеного ${invitedLabel}.`],
            ["Обмеження", "Запрошений гравець не може мати найвищий FACEIT ELO у команді."],
            ["Матчі", "Усі матчі етапу проходять онлайн."],
            ["Нагорода", "50 000 грн та 200 LDUFK Points."]
          ].map(([title, text]) => (
            <div key={title} className="flex gap-2 border-l border-emerald-300/30 pl-2.5 text-sm leading-5">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200/80" strokeWidth={1.8} />
              <div>
                <div className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-emerald-200/80">{title}</div>
                <div className="text-slate-300">{text}</div>
              </div>
            </div>
          ))}
        </div>
        {isRegistration ? (
          <button type="button" className="focus-ring mt-5 inline-flex rounded-lg border border-emerald-300/40 bg-emerald-300 px-4 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-bg transition hover:bg-emerald-200">
            Зареєструватися
          </button>
        ) : null}
      </section>
    </article>
  );
}

type TimelineStep = {
  date: string;
  title: string;
  description: string;
  state: "done" | "active" | "upcoming";
};

function tournamentTimeline(month: string, isRegistration: boolean): TimelineStep[] {
  const isOctober = month.includes("Жовтень");
  const dates = isOctober
    ? ["1-14 вересня 2026", "15 вересня - 5 жовтня 2026", "6-9 жовтня 2026", "10-18 жовтня 2026", "19 жовтня 2026"]
    : ["TBA", "TBA", "TBA", "TBA", "TBA"];

  return [
    {
      date: dates[0],
      title: "Підготовка",
      description: "Ознайомлення з правилами, збір складу та перевірка готовності.",
      state: "done"
    },
    {
      date: dates[1],
      title: "Реєстрація",
      description: "Подача заявки, формування складу та контакт з організаторами.",
      state: isRegistration ? "active" : "done"
    },
    {
      date: dates[2],
      title: "Підтвердження",
      description: "Перевірка заявок, закріплення команд і публікація посіву.",
      state: "upcoming"
    },
    {
      date: dates[3],
      title: "Матчі",
      description: "Основна онлайн-сітка етапу.",
      state: "upcoming"
    },
    {
      date: dates[4],
      title: "Підсумки",
      description: "Нарахування LDUFK Points, призові та оновлення рейтингу.",
      state: "upcoming"
    }
  ];
}

function TournamentTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="relative grid min-w-[860px] grid-cols-5 gap-3 rounded-xl border border-line bg-bg/35 px-4 pb-4 pt-14">
        <div className="absolute left-10 right-10 top-[34px] h-1 rounded-full bg-slate-700/70" />
        <div className="absolute left-10 top-[34px] h-1 w-[28%] rounded-full bg-gradient-to-r from-gold/60 via-gold to-emerald-300" />
        {steps.map((step) => {
          const isActive = step.state === "active";
          const isDone = step.state === "done";
          const dotClass = isActive
            ? "border-emerald-200 bg-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.45)]"
            : isDone
              ? "border-gold bg-gold/70"
              : "border-slate-300 bg-slate-700";

          return (
            <div key={step.title} className={`relative z-10 min-h-[154px] rounded-xl border p-3 ${isActive ? "border-emerald-300/45 bg-emerald-300/10" : "border-transparent"}`}>
              <div className={`absolute left-3 top-[-31px] h-5 w-5 rounded-full border-2 ${dotClass}`} />
              <div className={`text-[10px] font-extrabold uppercase tracking-[0.16em] ${isActive || isDone ? "text-gold" : "text-slate-500"}`}>{step.date}</div>
              {isActive ? <div className="mt-1 inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-emerald-200">Зараз</div> : null}
              <h3 className={`mt-2 font-rajdhani text-2xl font-bold leading-tight ${isActive ? "text-white" : isDone ? "text-slate-300" : "text-slate-500"}`}>{step.title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-400">{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailFact({ icon: Icon, label, value, tone = "default" }: { icon: typeof CalendarDays; label: string; value: string; tone?: "default" | "gold" }) {
  return (
    <div className="flex min-w-0 items-center gap-2 border-l border-white/10 pl-2">
      <Icon className={`h-4 w-4 shrink-0 ${tone === "gold" ? "text-gold" : "text-accent/80"}`} strokeWidth={1.8} />
      <div className="min-w-0">
        <div className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{label}</div>
        <div className={`truncate font-rajdhani text-lg font-bold leading-tight ${tone === "gold" ? "text-gold" : "text-slate-100"}`}>{value}</div>
      </div>
    </div>
  );
}

function Info({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "gold" }) {
  return (
    <div className={`${tone === "gold" ? "prize-sparkle text-center" : ""} rounded-xl border p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md ${
      tone === "gold"
        ? "border-gold/45 bg-[linear-gradient(135deg,rgba(250,204,21,0.18),rgba(250,204,21,0.07)_48%,rgba(13,20,32,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_24px_rgba(250,204,21,0.12)]"
        : "border-white/10 bg-white/[0.035]"
    }`}>
      <span className={`block text-[9px] font-extrabold uppercase tracking-[0.18em] ${tone === "gold" ? "text-gold/80" : "text-slate-500"}`}>{label}</span>
      <strong className={`mt-1 block font-rajdhani font-bold leading-tight ${tone === "gold" ? "text-2xl text-gold" : "text-xl text-slate-100"}`}>{value}</strong>
    </div>
  );
}
