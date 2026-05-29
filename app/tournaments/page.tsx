import type { Metadata } from "next";
import Link from "next/link";
import {
  circuitConceptSteps,
  circuitLeagues,
  circuitSeason,
  pointsDistribution,
  qualificationSlots,
  qualificationZones,
  roadToFinals,
  type CircuitLeague,
  type CircuitTournament
} from "@/lib/circuit-tournaments";

export const metadata: Metadata = {
  title: "LDUFK CS2 Season 2026/27 | Турніри",
  description: "Сезонна система турнірів LDUFK CS2 Season для шкіл та університетів України."
};

const leagueStyles = {
  school: {
    accent: "text-school",
    border: "border-school/35",
    bg: "bg-school/10",
    glow: "shadow-[0_0_34px_rgba(167,139,250,0.08)]",
    chip: "border-school/30 bg-school/10 text-school"
  },
  university: {
    accent: "text-accent",
    border: "border-accent/35",
    bg: "bg-accent/10",
    glow: "shadow-[0_0_34px_rgba(0,213,255,0.08)]",
    chip: "border-accent/30 bg-accent/10 text-accent"
  }
};

const roadStageStyles = {
  points: {
    border: "border-accent/25",
    bg: "bg-accent/10",
    text: "text-accent"
  },
  qualification: {
    border: "border-slate-600/45",
    bg: "bg-slate-500/10",
    text: "text-slate-400"
  },
  finals: {
    border: "border-slate-600/45",
    bg: "bg-slate-500/10",
    text: "text-slate-400"
  }
};

const roadStageBadge = {
  points: "Online stage",
  qualification: "LAN qualifier",
  finals: "LAN final"
};

const dataTileClass =
  "rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-md transition group-hover:border-emerald-300/35 group-hover:bg-white/[0.06]";

export default function TournamentsPage() {
  return (
    <div className="space-y-3 py-3 sm:space-y-7 sm:py-8">
      <CircuitHero />
      <RegistrationBanner />
      <CircuitIntro />
      {circuitLeagues.map((league) => (
        <LeagueSection key={league.key} league={league} />
      ))}
      <RoadToFinals />
      <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <PointsBlock />
        <QualificationBlock />
      </div>
      <CircuitCta />
    </div>
  );
}

function CircuitHero() {
  return (
    <section className="soft-enter relative overflow-hidden rounded-2xl border border-line bg-surface sm:rounded-3xl">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url('/map-images/de_ancient.jpg')",
          backgroundPosition: "center",
          backgroundSize: "cover"
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(7,10,16,0.98)_0%,rgba(7,10,16,0.86)_52%,rgba(0,213,255,0.14)_100%)]" />
      <div className="absolute right-0 top-0 hidden h-full w-72 bg-[radial-gradient(circle_at_60%_30%,rgba(0,213,255,0.26),transparent_56%)] md:block" />

      <div className="relative z-10 grid gap-3 p-3 sm:gap-5 sm:p-6 lg:grid-cols-[1fr_280px] lg:p-7">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.2em] text-accent sm:mb-3 sm:gap-2 sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.22em]">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Season system
          </div>
          <h1 className="season-title-shine whitespace-nowrap font-rajdhani text-[clamp(1.26rem,5.55vw,1.65rem)] font-bold leading-none tracking-normal sm:text-5xl sm:leading-[0.95] sm:tracking-wide lg:text-6xl" data-title={circuitSeason.name}>
            {circuitSeason.name}
          </h1>
          <p className="mt-2 max-w-3xl text-[11px] font-semibold leading-4 text-slate-300 sm:mt-3 sm:text-base sm:leading-6">{circuitSeason.subtitle}</p>
          <p className="mt-1.5 line-clamp-2 max-w-3xl text-[10px] leading-4 text-slate-400 sm:mt-2 sm:line-clamp-none sm:text-sm sm:leading-6">{circuitSeason.summary}</p>

          <div className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-4 sm:grid-cols-[1.05fr_1fr_1.12fr_0.72fr] sm:gap-2 xl:max-w-5xl">
            <div className="col-span-3 sm:col-auto">
              <HeroButton href="#registration" tone="register">Зареєструватися</HeroButton>
            </div>
            <HeroButton href="#school-league" tone="school" size="xs">School League</HeroButton>
            <HeroButton href="#university-league" tone="accent" size="xs">University League</HeroButton>
            <HeroButton href="#ldufk-points" size="xs">LDUFK Points</HeroButton>
          </div>
        </div>

        <div className="grid grid-cols-3 content-start gap-1.5 sm:gap-2 lg:grid-cols-1 lg:self-start">
          <HeroMetric label="Season" value={circuitSeason.dates} mobileValue="10.26–05.27" />
          <HeroMetric label="Format" value={`${circuitSeason.leagues} · ${circuitSeason.onlineStages}`} mobileValue="2 ліги · 4 етапи" />
          <HeroMetric label="Finals" value={circuitSeason.lanSlots} />
        </div>
      </div>
    </section>
  );
}

function HeroButton({
  href,
  children,
  tone = "neutral",
  size = "md"
}: {
  href: string;
  children: React.ReactNode;
  tone?: "accent" | "school" | "neutral" | "register";
  size?: "md" | "sm" | "xs";
}) {
  const className =
    tone === "register"
      ? "border-emerald-300/45 bg-emerald-300 text-bg shadow-[0_0_20px_rgba(52,211,153,0.12)] hover:bg-emerald-200"
      : tone === "accent"
      ? "border-accent/35 bg-accent/10 text-accent hover:bg-accent/15 hover:border-accent/60"
      : tone === "school"
        ? "border-school/35 bg-school/10 text-school hover:bg-school/15 hover:border-school/60"
        : "border-line bg-surface2/85 text-slate-300 hover:border-accent/35 hover:text-accent";
  const sizeClass =
    size === "xs"
      ? "px-1.5 py-2 text-[8px] tracking-[0.05em] sm:px-3 sm:text-xs sm:tracking-[0.09em]"
      : size === "sm"
        ? "px-2.5 py-2 text-[9px] tracking-[0.08em] sm:text-[10px]"
        : "px-3 py-2 text-[11px] tracking-[0.09em] sm:text-xs";

  return (
    <Link href={href} className={`focus-ring flex min-w-0 items-center justify-center whitespace-nowrap rounded-lg border text-center font-extrabold uppercase transition ${sizeClass} ${className}`}>
      {children}
    </Link>
  );
}

function RegistrationBanner() {
  const registrations = circuitLeagues
    .map((league) => ({
      league,
      tournament: league.tournaments.find((item) => item.status === "Реєстрація")
    }))
    .filter((item): item is { league: CircuitLeague; tournament: CircuitTournament } => Boolean(item.tournament));

  if (!registrations.length) return null;

  return (
    <section id="registration" className="soft-enter scroll-mt-28 overflow-hidden rounded-xl border border-emerald-300/35 bg-[linear-gradient(135deg,rgba(52,211,153,0.13),rgba(13,20,32,0.96))] shadow-[0_0_34px_rgba(52,211,153,0.08)] sm:rounded-2xl">
      <div className="grid gap-2 p-2 sm:gap-4 sm:p-5 lg:grid-cols-[260px_1fr]">
        <div className="min-w-0">
          <div className="mb-1.5 inline-flex rounded-full border border-emerald-300/35 bg-emerald-300/15 px-2.5 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.16em] text-emerald-200 sm:mb-2 sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.18em]">
            Відкрита реєстрація
          </div>
          <h2 className="font-rajdhani text-xl font-bold leading-tight sm:text-3xl">LDUFK Open 2026</h2>
          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-400 sm:mt-2 sm:line-clamp-none sm:text-sm sm:leading-6">
            Старт сезону відкритий одночасно для шкільних та університетських команд.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-2 md:gap-3">
          {registrations.map(({ league, tournament }) => {
            const leagueLabel = league.key === "school" ? "School League" : "University League";
            const invitedLabel = league.key === "school" ? "учень" : "студент";

            return (
              <div key={tournament.slug} className="group rounded-lg border border-line bg-bg/45 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300/60 hover:bg-emerald-300/5 hover:shadow-[0_0_24px_rgba(52,211,153,0.12)] sm:rounded-xl sm:p-3">
                <div className={`truncate text-[8px] font-extrabold uppercase tracking-[0.14em] sm:text-[10px] sm:tracking-[0.18em] ${league.key === "school" ? "text-school" : "text-accent"}`}>{leagueLabel}</div>
                <h3 className="mt-1 line-clamp-2 font-rajdhani text-sm font-bold leading-tight sm:text-xl">{tournament.name}</h3>
                <div className="mt-2 hidden gap-2 text-xs font-bold text-slate-300 sm:mt-3 sm:grid sm:grid-cols-3">
                  <span className={`${dataTileClass} flex items-center justify-center whitespace-nowrap text-center text-[11px]`}>{tournament.month}</span>
                  <span className={`${dataTileClass} flex items-center justify-center whitespace-nowrap text-center text-[11px]`}>{tournament.format}</span>
                  <span className={`${dataTileClass} flex items-center justify-center whitespace-nowrap text-center text-[11px]`}>Опція 4+1</span>
                  <span className="prize-sparkle flex flex-col items-center justify-center rounded-lg border border-gold/50 bg-[radial-gradient(circle_at_50%_0%,rgba(250,204,21,0.26),transparent_48%),linear-gradient(135deg,rgba(250,204,21,0.18),rgba(250,204,21,0.07)_48%,rgba(7,10,16,0.78))] px-3 py-3 text-center text-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_26px_rgba(250,204,21,0.16)] backdrop-blur-md transition group-hover:border-gold/75 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_34px_rgba(250,204,21,0.22)] sm:col-span-3">
                    <span className="font-exo text-[9px] font-extrabold uppercase leading-none tracking-[0.18em] text-gold/75">Призовий фонд</span>
                    <span className="mt-1 font-rajdhani text-2xl font-bold leading-none">{tournament.prizePool}</span>
                  </span>
                </div>
                <div className="mt-2 grid gap-1 text-[9px] font-bold text-slate-300 sm:hidden">
                  <span className="rounded-md border border-white/10 bg-white/[0.045] px-2 py-1 text-center">{tournament.month}</span>
                  <span className="rounded-md border border-white/10 bg-white/[0.045] px-2 py-1 text-center">{tournament.format}</span>
                  <span className="prize-sparkle rounded-md border border-gold/45 bg-gold/10 px-2 py-1.5 text-center font-rajdhani text-base font-bold leading-none text-gold">{tournament.prizePool}</span>
                </div>
                <p className="mt-1 hidden truncate text-xs font-semibold text-slate-500 sm:mt-2 sm:block" title={`5 гравців · опція 4+1: запрошений ${invitedLabel} за потреби`}>
                  5 гравців · опція 4+1: запрошений {invitedLabel} за потреби
                </p>
                <Link href={`/tournaments/${tournament.slug}`} className="focus-ring mt-2 block rounded-md border border-emerald-300/45 bg-emerald-300 px-2 py-2 text-center text-[10px] font-extrabold uppercase tracking-[0.1em] text-bg shadow-[0_0_18px_rgba(52,211,153,0.12)] transition hover:border-white/70 hover:bg-emerald-200 hover:shadow-[0_0_18px_rgba(52,211,153,0.28)] group-hover:border-white/55 sm:mt-3 sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-sm sm:tracking-[0.12em]">
                  Зареєструватися
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ label, value, mobileValue }: { label: string; value: string; mobileValue?: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_30px_rgba(0,0,0,0.22)] backdrop-blur-md sm:rounded-xl sm:p-3">
      <div className="text-[7px] font-extrabold uppercase tracking-[0.16em] text-slate-500 sm:text-[9px] sm:tracking-[0.2em]">{label}</div>
      <div className="mt-0.5 font-rajdhani text-[11px] font-bold leading-tight text-slate-100 sm:mt-1 sm:text-xl">
        <span className="sm:hidden">{mobileValue || value}</span>
        <span className="hidden sm:inline">{value}</span>
      </div>
    </div>
  );
}

function CircuitIntro() {
  return (
    <section className="soft-enter grid gap-2 rounded-xl border border-line bg-surface p-2 sm:gap-4 sm:rounded-2xl sm:p-4 lg:grid-cols-[190px_1fr]">
      <div className="lg:border-r lg:border-line lg:pr-4">
        <div className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-accent sm:text-[10px] sm:tracking-[0.22em]">Season concept</div>
        <h2 className="mt-0.5 font-rajdhani text-xl font-bold sm:mt-1 sm:text-2xl">Що це за сезон</h2>
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-bg/35">
        {circuitConceptSteps.map((step, index) => (
          <div key={step.title} className="grid grid-cols-[28px_86px_1fr] items-center gap-1.5 border-b border-line px-2 py-1.5 last:border-b-0 sm:grid-cols-[54px_150px_1fr] sm:gap-2 sm:px-3 sm:py-2.5">
            <div className="font-rajdhani text-base font-bold text-accent sm:text-xl">{String(index + 1).padStart(2, "0")}</div>
            <h3 className="font-rajdhani text-sm font-bold leading-none text-slate-100 sm:text-lg">{step.title}</h3>
            <p className="line-clamp-2 text-[10px] leading-4 text-slate-400 sm:line-clamp-none sm:text-[13px] sm:leading-5">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RoadToFinals() {
  return (
    <section className="soft-enter rounded-xl border border-line bg-surface p-2 sm:rounded-2xl sm:p-5">
      <div className="mb-2 flex flex-col justify-between gap-2 sm:mb-4 sm:flex-row sm:items-end sm:gap-3">
        <div>
          <div className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-gold sm:text-[10px] sm:tracking-[0.22em]">Road to LDUFK Finals</div>
          <h2 className="mt-0.5 font-rajdhani text-xl font-bold sm:mt-1 sm:text-3xl">Шлях до головної LAN-сцени</h2>
        </div>
        <p className="line-clamp-2 max-w-2xl text-[11px] leading-4 text-slate-400 sm:line-clamp-none sm:text-sm sm:leading-6">
          Road to LDUFK Finals — це шлях команд від першого онлайн-етапу до головної LAN-сцени сезону. Кожна перемога, кожна карта і кожен турнір впливають на позицію команди в рейтингу LDUFK Points.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {roadToFinals.map((stage, index) => {
          const isLocked = stage.kind !== "points";

          return (
          <div key={stage.title} className={`interactive-card flex min-h-[154px] flex-col rounded-lg border p-2 sm:min-h-[260px] sm:rounded-xl sm:p-3 xl:min-h-[292px] ${isLocked ? "border-slate-700/70 bg-slate-900/55 text-slate-400 saturate-[0.68]" : `bg-surface2 ${roadStageStyles[stage.kind].border}`}`}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className={`grid h-6 w-6 place-items-center rounded-md border font-rajdhani text-xs font-bold sm:h-7 sm:w-7 sm:rounded-lg sm:text-sm ${roadStageStyles[stage.kind].border} ${roadStageStyles[stage.kind].bg} ${roadStageStyles[stage.kind].text}`}>
                {index + 1}
              </span>
              <span className={`whitespace-nowrap rounded-full border px-1 py-0.5 text-[6.5px] font-extrabold uppercase leading-none tracking-[0.06em] sm:px-1.5 sm:py-1 sm:text-[8px] sm:tracking-[0.08em] ${roadStageStyles[stage.kind].border} ${roadStageStyles[stage.kind].text}`}>{roadStageBadge[stage.kind]}</span>
            </div>
            <h3 className={`font-rajdhani text-lg font-bold leading-none sm:text-xl ${isLocked ? "text-slate-300" : ""}`}>{stage.title}</h3>
            <p className="mt-1 line-clamp-2 flex-1 text-[10px] leading-4 text-slate-400 sm:line-clamp-none sm:text-xs sm:leading-5">{stage.description}</p>
            <div className={`${isLocked ? "" : "prize-sparkle"} mt-2 flex min-h-[50px] flex-col justify-center rounded-md border px-2 py-1.5 sm:mt-3 sm:min-h-[74px] sm:rounded-lg sm:px-2.5 sm:py-2 ${isLocked ? "border-slate-600/55 bg-slate-800/45 text-slate-300" : "border-gold/45 bg-[linear-gradient(135deg,rgba(250,204,21,0.18),rgba(250,204,21,0.07)_48%,rgba(13,20,32,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_22px_rgba(250,204,21,0.1)]"}`}>
              <div className={`flex items-center gap-1 text-[7px] font-extrabold uppercase tracking-[0.12em] sm:gap-1.5 sm:text-[8px] sm:tracking-[0.15em] ${isLocked ? "text-slate-500" : "text-gold/80"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isLocked ? "bg-slate-500" : "bg-gold shadow-[0_0_10px_rgba(250,204,21,0.7)]"}`} />
                Приз
              </div>
              <div className={`mt-0.5 font-rajdhani text-base font-bold leading-none sm:text-lg ${isLocked ? "text-slate-300" : "text-gold"}`}>{stage.prizePool}</div>
              {stage.kind === "points" ? (
                <div className="mt-0.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-accent">
                  + {stage.meta.replace(" points", "")} LDUFK Points
                </div>
              ) : (
                <div className="mt-0.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                  {stage.kind === "qualification" ? "Слоти на LAN" : "Чемпіон сезону"}
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}

function LeagueSection({ league }: { league: CircuitLeague }) {
  const styles = leagueStyles[league.key];

  return (
    <section id={`${league.key}-league`} className={`soft-enter scroll-mt-28 rounded-xl border ${styles.border} bg-surface p-2 ${styles.glow} sm:rounded-2xl sm:p-5`}>
      <div className="mb-2 flex flex-col justify-between gap-2 sm:mb-4 lg:flex-row lg:items-end">
        <div>
          <div className={`text-[8px] font-extrabold uppercase tracking-[0.2em] sm:text-[10px] sm:tracking-[0.22em] ${styles.accent}`}>{league.eyebrow}</div>
          <h2 className="mt-0.5 font-rajdhani text-xl font-bold sm:mt-1 sm:text-3xl">{league.title}</h2>
        </div>
        <p className="line-clamp-2 max-w-3xl text-[11px] leading-4 text-slate-400 sm:line-clamp-none sm:text-sm sm:leading-6">{league.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5">
        {league.tournaments.map((tournament, index) => (
          <TournamentCard key={tournament.name} tournament={tournament} league={league} index={index} />
        ))}
      </div>
    </section>
  );
}

function TournamentCard({ tournament, league, index }: { tournament: CircuitTournament; league: CircuitLeague; index: number }) {
  const styles = leagueStyles[league.key];
  const isFinals = tournament.stage === "finals";
  const isRegistration = tournament.status === "Реєстрація";
  const isUnavailable = !isRegistration;
  const leagueLabel = league.key === "school" ? "School" : "University";

  return (
    <article className={`interactive-card group flex flex-col overflow-hidden rounded-lg border sm:rounded-xl lg:min-h-[250px] ${isFinals ? "col-span-2 lg:col-span-1" : ""} ${
      isRegistration
        ? "border-emerald-300/60 bg-surface2 shadow-[0_0_34px_rgba(52,211,153,0.13)]"
        : isFinals
          ? "border-slate-600/70 bg-[radial-gradient(circle_at_18%_0%,rgba(148,163,184,0.12),transparent_42%),linear-gradient(135deg,rgba(30,41,59,0.72),rgba(15,23,42,0.86)_44%,rgba(7,10,16,0.92))] text-slate-400 saturate-[0.72]"
          : "border-slate-700/70 bg-slate-900/55 text-slate-400 saturate-[0.65]"
    }`}>
      <div className={`border-b border-line p-2 sm:p-2.5 ${isRegistration ? "bg-emerald-400/10" : "bg-slate-800/20"}`}>
        <div className="flex items-start justify-between gap-1">
          <span className={`whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[7px] font-extrabold uppercase leading-none tracking-[0.06em] sm:py-1 sm:text-[8px] sm:tracking-[0.08em] ${isUnavailable ? "border-slate-500/25 bg-slate-500/10 text-slate-400" : styles.chip}`}>{isFinals ? "LAN Finals" : leagueLabel}</span>
          <span className={`shrink-0 whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[7px] font-extrabold uppercase leading-none tracking-[0.06em] sm:py-1 sm:text-[8px] sm:tracking-[0.08em] ${isRegistration ? "border-emerald-300/35 bg-emerald-300/15 text-emerald-200" : "border-slate-500/25 bg-slate-500/10 text-slate-400"}`}>{isFinals ? "Locked" : tournament.status}</span>
        </div>
        <h3 className={`mt-1.5 line-clamp-2 font-rajdhani text-base font-bold leading-tight sm:mt-2 sm:text-lg lg:min-h-[42px] ${isUnavailable ? "text-slate-300" : ""}`}>{tournament.name}</h3>
        <div className="mt-0.5 truncate text-[7px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:mt-1 sm:text-[9px] sm:tracking-[0.14em]">Stage {index + 1} · {tournament.role}</div>
      </div>

      <div className="flex flex-1 flex-col p-2 sm:p-2.5">
        <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:gap-2 sm:text-xs">
          <InfoPill label="Місяць" value={tournament.month} />
          <InfoPill label="Формат" value={tournament.format} />
        </div>

        <p className="mt-2 hidden flex-1 text-xs leading-[1.65] text-slate-400 sm:line-clamp-3 sm:block lg:line-clamp-none">{tournament.description}</p>

        <div className="mt-2 space-y-1.5 sm:mt-2.5 sm:space-y-2">
          <div className="grid gap-1.5 sm:gap-2">
            <CompactStat label="Prize pool" value={tournament.prizePool} tone="gold" muted={isUnavailable} />
            {tournament.points ? (
              <CompactStat label="LDUFK Points" value={`${tournament.points} pts`} tone="accent" muted={isUnavailable} />
            ) : (
              <CompactStat label="LAN Finals" value="Champion" tone={league.key === "school" ? "school" : "accent"} muted={isUnavailable} />
            )}
          </div>
          {isFinals ? (
            <div className="rounded-md border border-slate-500/25 bg-slate-500/10 px-2 py-1.5 text-center text-[8px] font-extrabold uppercase tracking-[0.12em] text-slate-400 sm:text-[10px]">
              Головна LAN-подія року · 8 найсильніших команд сезону
            </div>
          ) : null}
          <div className="hidden text-[11px] font-semibold leading-4 text-slate-500 sm:block">
            {tournament.entry}
            {!tournament.points ? " · Не дає points. Визначає чемпіона сезону." : ""}
          </div>
          {isRegistration ? (
            <Link href={`/tournaments/${tournament.slug}`} className="focus-ring block rounded-md border border-emerald-300/45 bg-emerald-300 px-2 py-1.5 text-center text-[9px] font-extrabold uppercase tracking-[0.08em] text-bg transition hover:bg-emerald-200 sm:rounded-lg sm:px-3 sm:py-2 sm:text-xs sm:tracking-[0.12em]">
              Зареєструватися
            </Link>
          ) : (
            <span className="block rounded-md border border-line bg-surface2/70 px-2 py-1.5 text-center text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-500 sm:rounded-lg sm:px-3 sm:py-2 sm:text-xs sm:tracking-[0.12em]">
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function CompactStat({ label, value, tone, muted = false }: { label: string; value: string; tone: "gold" | "accent" | "school"; muted?: boolean }) {
  const toneClass =
    muted
      ? "border-slate-600/55 bg-slate-800/45 text-slate-300 shadow-none"
      : tone === "gold"
      ? "border-gold/45 bg-[linear-gradient(135deg,rgba(250,204,21,0.2),rgba(250,204,21,0.08)_48%,rgba(13,20,32,0.9))] text-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_22px_rgba(250,204,21,0.12)]"
      : tone === "school"
        ? "border-school/25 bg-school/10 text-school"
        : "border-accent/20 bg-accent/10 text-accent";

  if (tone === "gold") {
    return (
      <div className={`${muted ? "" : "prize-sparkle"} flex min-h-[44px] flex-col items-center justify-center rounded-md border px-2 py-1.5 text-center sm:min-h-[62px] sm:rounded-lg sm:px-2.5 sm:py-2 ${toneClass}`}>
        <span className={`text-[7px] font-extrabold uppercase leading-none tracking-[0.12em] sm:text-[8px] sm:tracking-[0.16em] ${muted ? "text-slate-500" : "text-gold/75"}`}>{label}</span>
        <strong className="mt-0.5 whitespace-nowrap font-rajdhani text-lg font-bold leading-none sm:mt-1 sm:text-2xl">{value}</strong>
      </div>
    );
  }

  return (
    <div className={`flex min-h-8 items-center justify-between gap-1.5 rounded-md border px-2 py-1 sm:min-h-10 sm:rounded-lg sm:px-2.5 sm:py-1.5 ${toneClass}`}>
      <span className="text-[7px] font-extrabold uppercase tracking-[0.1em] text-slate-500 sm:text-[9px] sm:tracking-[0.13em]">{label}</span>
      <strong className="whitespace-nowrap font-rajdhani text-sm font-bold leading-none sm:text-base">{value}</strong>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.16)] backdrop-blur-md transition group-hover:border-accent/25 group-hover:bg-white/[0.055] sm:rounded-lg sm:px-2.5 sm:py-2">
      <div className="text-[7px] font-extrabold uppercase tracking-[0.12em] text-slate-500 sm:text-[8px] sm:tracking-[0.16em]">{label}</div>
      <div className="mt-0.5 truncate font-semibold leading-tight text-slate-300">{value}</div>
    </div>
  );
}

function PointsBlock() {
  return (
    <section id="ldufk-points" className="soft-enter scroll-mt-28 rounded-xl border border-line bg-surface p-2 sm:rounded-2xl sm:p-5">
      <div className="mb-2 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div>
          <div className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-accent sm:text-[10px] sm:tracking-[0.22em]">Ranking system</div>
          <h2 className="mt-0.5 font-rajdhani text-xl font-bold sm:mt-1 sm:text-3xl">LDUFK Points</h2>
        </div>
        <Link href="/tournaments/points" className="focus-ring rounded-md border border-accent/35 bg-accent/10 px-2 py-1.5 text-center text-[8px] font-extrabold uppercase tracking-[0.1em] text-accent transition hover:bg-accent hover:text-bg sm:rounded-lg sm:px-3 sm:py-2 sm:text-[10px] sm:tracking-[0.14em]">
          Детальніше про формулу
        </Link>
      </div>
      <p className="line-clamp-2 text-[11px] leading-4 text-slate-400 sm:line-clamp-none sm:text-sm sm:leading-6">
        LDUFK Points — це сезонна рейтингова система, за якою команди отримують очки за результати в онлайн-турнірах. Максимальна кількість очок за ідеальний сезон — 1000 points.
      </p>

      <div className="mt-2 overflow-hidden rounded-lg border border-line sm:mt-4 sm:rounded-xl">
        {pointsDistribution.map(([stage, points], index) => (
          <div key={stage} className={`grid grid-cols-[1fr_auto] items-center gap-2 px-2 py-1.5 text-xs sm:gap-3 sm:px-3 sm:py-2.5 sm:text-sm ${index === pointsDistribution.length - 1 ? "bg-accent/10" : "border-b border-line bg-surface2/70"}`}>
            <span className="font-bold text-slate-200">{stage}</span>
            <span className={`font-rajdhani text-base font-bold sm:text-lg ${index === pointsDistribution.length - 1 ? "text-accent" : "text-slate-300"}`}>{points}</span>
          </div>
        ))}
      </div>

      <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-slate-400 sm:mt-3 sm:line-clamp-none sm:text-sm sm:leading-6">
        Чим ближче турнір до фіналу сезону, тим більшу вагу він має. Це зберігає інтригу до останнього онлайн-етапу та дає шанс новим сильним командам увірватися в боротьбу.
      </p>
    </section>
  );
}

function QualificationBlock() {
  return (
    <section className="soft-enter rounded-xl border border-line bg-surface p-2 sm:rounded-2xl sm:p-5">
      <div className="mb-2 sm:mb-3">
        <div className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-gold sm:text-[10px] sm:tracking-[0.22em]">LAN qualification</div>
        <h2 className="mt-0.5 font-rajdhani text-xl font-bold sm:mt-1 sm:text-3xl">Формат виходу на LDUFK Finals</h2>
      </div>
      <p className="text-[11px] leading-4 text-slate-400 sm:text-sm sm:leading-6">У фінальний LAN-турнір проходять 8 команд.</p>

      <div className="mt-2 grid grid-cols-3 gap-1.5 sm:mt-4 sm:gap-2 md:grid-cols-3">
        {qualificationSlots.map((slot) => (
          <div key={slot.title} className="interactive-card rounded-lg border border-line bg-surface2 p-2 sm:rounded-xl sm:p-3">
            <div className="text-[7px] font-extrabold uppercase tracking-[0.12em] text-accent sm:text-[10px] sm:tracking-[0.18em]">{slot.slots}</div>
            <h3 className="mt-0.5 font-rajdhani text-sm font-bold leading-tight sm:mt-1 sm:text-xl">{slot.title}</h3>
            <p className="mt-0.5 line-clamp-2 text-[9px] leading-3 text-slate-400 sm:mt-1 sm:line-clamp-none sm:text-xs sm:leading-5">{slot.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5 sm:mt-4 sm:gap-2">
        {qualificationZones.map(([range, label]) => (
          <div key={range} className="rounded-lg border border-line bg-bg/45 p-2 sm:rounded-xl sm:p-3">
            <div className="font-rajdhani text-lg font-bold text-slate-100 sm:text-2xl">{range}</div>
            <div className="text-[7px] font-extrabold uppercase tracking-[0.1em] text-slate-500 sm:text-[10px] sm:tracking-[0.18em]">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CircuitCta() {
  return (
    <section className="soft-enter rounded-xl border border-accent/25 bg-[linear-gradient(135deg,rgba(0,213,255,0.12),rgba(167,139,250,0.08),rgba(13,20,32,0.92))] p-2 sm:rounded-2xl sm:p-5">
      <div className="flex flex-col justify-between gap-2 sm:gap-4 md:flex-row md:items-center">
        <div>
          <div className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-accent sm:text-[10px] sm:tracking-[0.22em]">Follow the season</div>
          <h2 className="mt-0.5 font-rajdhani text-xl font-bold sm:mt-1 sm:text-3xl">Слідкуй за рейтингом, матчами та новинами сезону</h2>
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
          <HeroButton href="/ranking" tone="accent" size="xs">Рейтинг</HeroButton>
          <HeroButton href="/matches" size="xs">Матчі</HeroButton>
          <HeroButton href="/news" size="xs">Новини</HeroButton>
        </div>
      </div>
    </section>
  );
}
