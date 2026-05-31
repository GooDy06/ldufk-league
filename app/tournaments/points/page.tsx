import type { Metadata } from "next";
import Link from "next/link";
import { BackButton } from "@/components/back-button";
import {
  finalDayPoints,
  pointsRules,
  qualificationPoints,
  qualificationSlots,
  stagePoints
} from "@/lib/circuit-tournaments";

export const metadata: Metadata = {
  title: "LDUFK Points | Формула рейтингу",
  description: "Пояснення формули LDUFK Points для сезону LDUFK CS2 Season 2026/27."
};

const noPointsStages = [
  ["LDUFK Finals Play-In", "Ні", "Дає 2 слоти на LAN Finals"],
  ["LDUFK Finals Last Chance", "Ні", "Відкрита кваліфікація за 2 слоти"],
  ["LDUFK Finals LAN", "Ні", "Визначає чемпіона сезону"]
];

const tournamentFlow = [
  ["1", "Кваліфікація #1", "BO1", "Топ-3 проходять у фінальний день"],
  ["2", "Кваліфікація #2", "BO1", "Топ-3 проходять у фінальний день"],
  ["3", "Фінальний день", "BO3", "6 команд грають за основні LDUFK Points"],
  ["4", "Рейтинг", "Season table", "Команда отримує тільки одне нарахування за турнір"]
];

export default function LdufkPointsPage() {
  return (
    <div className="space-y-3 py-3 sm:space-y-7 sm:py-8">
      <section className="soft-enter rounded-xl border border-line bg-[linear-gradient(135deg,rgba(0,213,255,0.12),rgba(13,20,32,0.98)_42%,rgba(7,10,16,0.98))] p-3 sm:rounded-3xl sm:p-6">
        <BackButton fallbackHref="/tournaments" label="Назад до турнірів" />
        <div className="mt-3 grid gap-3 sm:mt-5 sm:gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-accent sm:text-[10px] sm:tracking-[0.22em]">Ranking formula</div>
            <h1 className="mt-1 font-rajdhani text-3xl font-bold leading-[0.95] sm:text-6xl">LDUFK Points</h1>
            <p className="mt-2 max-w-4xl text-[11px] leading-4 text-slate-400 sm:mt-3 sm:text-base sm:leading-6">
              Це сезонна рейтингова система LDUFK CS2 Season. Команди отримують очки за результати в чотирьох онлайн-етапах: Open, Showdown, Rivals та Bounty. Максимум за ідеальний сезон — 1000 LDUFK Points.
            </p>
          </div>
          <div className="rounded-xl border border-accent/30 bg-bg/55 p-3 sm:rounded-2xl sm:p-4">
            <div className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-slate-500 sm:text-[10px] sm:tracking-[0.2em]">Головна формула</div>
            <div className="mt-1 font-rajdhani text-lg font-bold leading-tight text-slate-100 sm:mt-2 sm:text-2xl">
              Очки за турнір = результат фінального дня або найкращий результат кваліфікації
            </div>
            <p className="mt-1 text-[10px] leading-4 text-slate-400 sm:mt-2 sm:text-xs sm:leading-5">Фінальний день завжди має пріоритет. Подвійно набрати очки в одному турнірі не можна.</p>
          </div>
        </div>
      </section>

      <section className="soft-enter grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-xl border border-line bg-surface p-3 sm:rounded-2xl sm:p-5">
          <div className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-accent sm:text-[10px] sm:tracking-[0.22em]">Season weight</div>
          <h2 className="mt-1 font-rajdhani text-xl font-bold sm:text-3xl">Вага етапів</h2>
          <p className="mt-1 text-[11px] leading-4 text-slate-400 sm:mt-2 sm:text-sm sm:leading-6">
            Кожен наступний онлайн-етап має більшу вагу, щоб боротьба за LAN залишалась відкритою до Bounty.
          </p>
          <div className="mt-2 overflow-hidden rounded-lg border border-line sm:mt-4 sm:rounded-xl">
            {stagePoints.map((row) => (
              <div key={row.tournament} className="grid grid-cols-[1fr_auto] gap-2 border-b border-line bg-surface2/70 px-2 py-2 last:border-b-0 sm:gap-3 sm:px-3 sm:py-2.5">
                <div>
                  <div className="text-sm font-bold text-slate-100 sm:text-base">{row.tournament}</div>
                  <div className="text-[10px] text-slate-500 sm:text-xs">{row.role}</div>
                </div>
                <div className="font-rajdhani text-lg font-bold text-accent sm:text-xl">{row.max}</div>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_auto] gap-3 bg-accent/10 px-2 py-2 sm:px-3 sm:py-2.5">
              <div className="font-bold text-slate-100">Разом</div>
              <div className="font-rajdhani text-lg font-bold text-accent sm:text-xl">1000</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-3 sm:rounded-2xl sm:p-5">
          <div className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-gold sm:text-[10px] sm:tracking-[0.22em]">Tournament flow</div>
          <h2 className="mt-1 font-rajdhani text-xl font-bold sm:text-3xl">Як проходить один онлайн-турнір</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-4">
            {tournamentFlow.map(([step, title, format, text]) => (
              <div key={title} className="rounded-lg border border-line bg-surface2 p-2 sm:rounded-xl sm:p-3">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-md border border-gold/25 bg-gold/10 font-rajdhani text-xs font-bold text-gold sm:h-7 sm:w-7 sm:rounded-lg sm:text-sm">{step}</span>
                  <span className="rounded-full border border-line px-1.5 py-0.5 text-[7px] font-extrabold uppercase tracking-[0.1em] text-slate-400 sm:px-2 sm:text-[9px] sm:tracking-[0.14em]">{format}</span>
                </div>
                <h3 className="mt-1.5 font-rajdhani text-sm font-bold leading-tight sm:mt-2 sm:text-xl">{title}</h3>
                <p className="mt-1 text-[10px] leading-4 text-slate-400 sm:text-xs sm:leading-5">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="soft-enter rounded-xl border border-line bg-surface p-3 sm:rounded-2xl sm:p-5">
        <div className="mb-2 flex flex-col justify-between gap-2 sm:mb-4 sm:gap-3 lg:flex-row lg:items-end">
          <div>
            <div className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-accent sm:text-[10px] sm:tracking-[0.22em]">Final day points</div>
            <h2 className="mt-1 font-rajdhani text-xl font-bold sm:text-3xl">Основні очки за фінальний день</h2>
          </div>
          <p className="max-w-2xl text-[11px] leading-4 text-slate-400 sm:text-sm sm:leading-6">Якщо команда пройшла у фінальний день, саме ця таблиця визначає її LDUFK Points за турнір.</p>
        </div>
        <div className="grid gap-2 sm:hidden">
          {finalDayPoints.map((row) => (
            <div key={row.tournament} className="rounded-lg border border-line bg-surface2 p-2">
              <div className="font-bold text-slate-100">{row.tournament}</div>
              <div className="mt-2 grid grid-cols-4 gap-1 text-center">
                {[["1", row.first], ["2", row.second], ["3-4", row.thirdFourth], ["5-6", row.fifthSixth]].map(([place, value]) => (
                  <div key={place} className="rounded-md border border-line bg-bg/35 px-1 py-1">
                    <div className="text-[7px] font-extrabold uppercase text-slate-500">{place}</div>
                    <div className="font-rajdhani text-sm font-bold text-accent">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto rounded-xl border border-line sm:block">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-bg/70 text-[10px] uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-3 py-3">Турнір</th>
                <th className="px-3 py-3">1 місце</th>
                <th className="px-3 py-3">2 місце</th>
                <th className="px-3 py-3">3–4 місце</th>
                <th className="px-3 py-3">5–6 місце</th>
              </tr>
            </thead>
            <tbody>
              {finalDayPoints.map((row) => (
                <tr key={row.tournament} className="border-t border-line bg-surface2/65">
                  <td className="px-3 py-3 font-bold text-slate-100">{row.tournament}</td>
                  <td className="px-3 py-3 font-rajdhani text-lg font-bold text-accent">{row.first}</td>
                  <td className="px-3 py-3 font-rajdhani text-lg font-bold text-slate-200">{row.second}</td>
                  <td className="px-3 py-3 font-rajdhani text-lg font-bold text-slate-200">{row.thirdFourth}</td>
                  <td className="px-3 py-3 font-rajdhani text-lg font-bold text-slate-200">{row.fifthSixth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="soft-enter rounded-xl border border-line bg-surface p-3 sm:rounded-2xl sm:p-5">
        <div className="mb-2 flex flex-col justify-between gap-2 sm:mb-4 sm:gap-3 lg:flex-row lg:items-end">
          <div>
            <div className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-gold sm:text-[10px] sm:tracking-[0.22em]">Qualification points</div>
            <h2 className="mt-1 font-rajdhani text-xl font-bold sm:text-3xl">Очки за кваліфікацію</h2>
          </div>
          <p className="max-w-2xl text-[11px] leading-4 text-slate-400 sm:text-sm sm:leading-6">Ці очки отримують тільки команди, які грали кваліфікацію, але не пройшли у фінальний день.</p>
        </div>
        <div className="grid gap-2 sm:hidden">
          {qualificationPoints.map((row) => (
            <div key={row.tournament} className="rounded-lg border border-line bg-surface2 p-2">
              <div className="font-bold text-slate-100">{row.tournament}</div>
              <div className="mt-2 grid grid-cols-5 gap-1 text-center">
                {[["4", row.fourth], ["5-6", row.fifthSixth], ["7-8", row.seventhEighth], ["9-16", row.ninthSixteenth], ["17+", row.seventeenthPlus]].map(([place, value]) => (
                  <div key={place} className="rounded-md border border-line bg-bg/35 px-1 py-1">
                    <div className="text-[7px] font-extrabold uppercase text-slate-500">{place}</div>
                    <div className="font-rajdhani text-xs font-bold text-gold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto rounded-xl border border-line sm:block">
          <table className="min-w-[840px] w-full text-left text-sm">
            <thead className="bg-bg/70 text-[10px] uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-3 py-3">Турнір</th>
                <th className="px-3 py-3">4 місце у кваліфікації</th>
                <th className="px-3 py-3">5–6 місце</th>
                <th className="px-3 py-3">7–8 місце</th>
                <th className="px-3 py-3">9–16 місце</th>
                <th className="px-3 py-3">17+ місце</th>
              </tr>
            </thead>
            <tbody>
              {qualificationPoints.map((row) => (
                <tr key={row.tournament} className="border-t border-line bg-surface2/65">
                  <td className="px-3 py-3 font-bold text-slate-100">{row.tournament}</td>
                  <td className="px-3 py-3 font-rajdhani text-lg font-bold text-gold">{row.fourth}</td>
                  <td className="px-3 py-3 font-rajdhani text-lg font-bold text-slate-200">{row.fifthSixth}</td>
                  <td className="px-3 py-3 font-rajdhani text-lg font-bold text-slate-200">{row.seventhEighth}</td>
                  <td className="px-3 py-3 font-rajdhani text-lg font-bold text-slate-200">{row.ninthSixteenth}</td>
                  <td className="px-3 py-3 font-rajdhani text-lg font-bold text-slate-200">{row.seventeenthPlus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="soft-enter grid gap-3 sm:gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-xl border border-line bg-surface p-3 sm:rounded-2xl sm:p-5">
          <div className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-accent sm:text-[10px] sm:tracking-[0.22em]">Rules</div>
          <h2 className="mt-1 font-rajdhani text-xl font-bold sm:text-3xl">Правила нарахування</h2>
          <div className="mt-2 grid gap-2 sm:mt-4">
            {pointsRules.map((rule) => (
              <div key={rule.title} className="rounded-lg border border-line bg-surface2 p-2 sm:rounded-xl sm:p-3">
                <h3 className="font-rajdhani text-base font-bold text-slate-100 sm:text-xl">{rule.title}</h3>
                <p className="mt-1 text-[11px] leading-4 text-slate-400 sm:text-sm sm:leading-6">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="rounded-xl border border-line bg-surface p-3 sm:rounded-2xl sm:p-5">
            <div className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-gold sm:text-[10px] sm:tracking-[0.22em]">No ranking points</div>
            <h2 className="mt-1 font-rajdhani text-xl font-bold sm:text-3xl">Де очки не нараховуються</h2>
            <div className="mt-2 overflow-hidden rounded-lg border border-line sm:mt-4 sm:rounded-xl">
              {noPointsStages.map(([stage, points, role]) => (
                <div key={stage} className="grid grid-cols-[1fr_auto] gap-2 border-b border-line bg-surface2/70 px-2 py-2 last:border-b-0 sm:gap-3 sm:px-3 sm:py-2.5">
                  <div>
                    <div className="text-sm font-bold text-slate-100 sm:text-base">{stage}</div>
                    <div className="text-[10px] text-slate-500 sm:text-xs">{role}</div>
                  </div>
                  <div className="font-rajdhani text-lg font-bold text-gold sm:text-xl">{points}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-3 sm:rounded-2xl sm:p-5">
            <div className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-accent sm:text-[10px] sm:tracking-[0.22em]">LAN qualification</div>
            <h2 className="mt-1 font-rajdhani text-xl font-bold sm:text-3xl">Як рейтинг веде на LAN</h2>
            <div className="mt-2 grid gap-2 sm:mt-4">
              {qualificationSlots.map((slot) => (
                <div key={slot.title} className="rounded-lg border border-line bg-surface2 p-2 sm:rounded-xl sm:p-3">
                  <div className="text-[8px] font-extrabold uppercase tracking-[0.13em] text-accent sm:text-[10px] sm:tracking-[0.16em]">{slot.slots}</div>
                  <h3 className="mt-1 font-rajdhani text-base font-bold sm:text-xl">{slot.title}</h3>
                  <p className="mt-1 text-[10px] leading-4 text-slate-400 sm:text-xs sm:leading-5">{slot.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
