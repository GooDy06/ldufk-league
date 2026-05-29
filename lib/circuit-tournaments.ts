export type CircuitLeagueKey = "school" | "university";
export type CircuitStageKey = "open" | "showdown" | "rivals" | "bounty" | "finals";
export type RoadStageKind = "points" | "qualification" | "finals";
export type CircuitTournamentStatus = "Coming Soon" | "Реєстрація";

export type CircuitTournament = {
  slug: string;
  stage: CircuitStageKey;
  name: string;
  month: string;
  format: "FACEIT Online" | "LAN";
  status: CircuitTournamentStatus;
  role: string;
  description: string;
  points: number | null;
  entry: string | null;
  prizePool: string;
};

export type CircuitLeague = {
  key: CircuitLeagueKey;
  title: string;
  eyebrow: string;
  description: string;
  tournaments: CircuitTournament[];
};

export type RoadStage = {
  title: string;
  description: string;
  meta: string;
  prizePool: string;
  kind: RoadStageKind;
};

export type StagePointsRow = {
  tournament: string;
  max: number;
  role: string;
};

export type FinalDayPointsRow = {
  tournament: string;
  first: number;
  second: number;
  thirdFourth: number;
  fifthSixth: number;
};

export type QualificationPointsRow = {
  tournament: string;
  fourth: number;
  fifthSixth: number;
  seventhEighth: number;
  ninthSixteenth: number;
  seventeenthPlus: number;
};

export type PointsRule = {
  title: string;
  description: string;
};

export const circuitSeason = {
  name: "LDUFK CS2 Season 2026/27",
  subtitle: "Щорічна серія турнірів з Counter-Strike 2 для шкіл та закладів вищої освіти України.",
  summary:
    "Один сезон. Дві ліги. Чотири онлайн-етапи. Один головний LAN-фінал. Команди заробляють LDUFK Points протягом сезону та проходять шлях до LDUFK Finals.",
  dates: "Жовтень 2026 — Травень 2027",
  leagues: "2 ліги",
  onlineStages: "4 онлайн-етапи",
  lanSlots: "8 LAN слотів"
};

const freeEntry = "Безкоштовна участь";
const onlinePrizePool = "50 000 грн";
const playInPrizePool = "15 000 грн";
const lastChancePrizePool = "25 000 грн";
const lanPrizePool = "150 000 грн";

export const circuitConceptSteps = [
  {
    title: "Що це",
    text: "LDUFK CS2 Season — щорічна кіберспортивна серія турнірів з Counter-Strike 2 для школярів та студентів України."
  },
  {
    title: "Як працює сезон",
    text: "Команди проходять онлайн-етапи Open, Showdown, Rivals та Bounty, заробляють LDUFK Points і піднімаються в сезонному рейтингу."
  },
  {
    title: "Шлях на LAN",
    text: "Найкращі команди отримують пряме запрошення на LDUFK Finals, інші претенденти проходять через Play-In або Last Chance."
  },
  {
    title: "Фінал",
    text: "LDUFK Finals — LAN-турнір, де 8 найсильніших команд року грають офлайн за чемпіонство LDUFK CS2 Season."
  }
];

export const roadToFinals: RoadStage[] = [
  {
    title: "Open",
    description: "Старт сезону та перші LDUFK Points.",
    meta: "200 points",
    prizePool: onlinePrizePool,
    kind: "points"
  },
  {
    title: "Showdown",
    description: "Перше велике зіткнення фаворитів і претендентів.",
    meta: "220 points",
    prizePool: onlinePrizePool,
    kind: "points"
  },
  {
    title: "Rivals",
    description: "Етап принципових матчів, реваншів і боротьби за позиції.",
    meta: "260 points",
    prizePool: onlinePrizePool,
    kind: "points"
  },
  {
    title: "Bounty",
    description: "Фінальний онлайн-етап, де команди полюють за останніми важливими очками.",
    meta: "320 points",
    prizePool: onlinePrizePool,
    kind: "points"
  },
  {
    title: "Play-In",
    description: "Кваліфікація для команд з 5–20 місця рейтингу за 2 слоти на LAN.",
    meta: "No points",
    prizePool: playInPrizePool,
    kind: "qualification"
  },
  {
    title: "Last Chance",
    description: "Відкрита кваліфікація для всіх команд, включно з новими претендентами.",
    meta: "No points",
    prizePool: lastChancePrizePool,
    kind: "qualification"
  },
  {
    title: "Finals",
    description: "Головний LAN-фінал сезону.",
    meta: "Champion",
    prizePool: lanPrizePool,
    kind: "finals"
  }
];

export const stagePoints: StagePointsRow[] = [
  { tournament: "LDUFK Open", max: 200, role: "Стартовий турнір сезону" },
  { tournament: "LDUFK Showdown", max: 220, role: "Другий етап сезону" },
  { tournament: "LDUFK Rivals", max: 260, role: "Етап активної боротьби за позиції" },
  { tournament: "LDUFK Bounty", max: 320, role: "Фінальний онлайн-етап перед LAN" }
];

export const finalDayPoints: FinalDayPointsRow[] = [
  { tournament: "LDUFK Open", first: 200, second: 150, thirdFourth: 110, fifthSixth: 80 },
  { tournament: "LDUFK Showdown", first: 220, second: 165, thirdFourth: 120, fifthSixth: 90 },
  { tournament: "LDUFK Rivals", first: 260, second: 195, thirdFourth: 145, fifthSixth: 105 },
  { tournament: "LDUFK Bounty", first: 320, second: 240, thirdFourth: 175, fifthSixth: 130 }
];

export const qualificationPoints: QualificationPointsRow[] = [
  { tournament: "LDUFK Open", fourth: 50, fifthSixth: 30, seventhEighth: 20, ninthSixteenth: 10, seventeenthPlus: 5 },
  { tournament: "LDUFK Showdown", fourth: 55, fifthSixth: 35, seventhEighth: 25, ninthSixteenth: 12, seventeenthPlus: 6 },
  { tournament: "LDUFK Rivals", fourth: 65, fifthSixth: 40, seventhEighth: 30, ninthSixteenth: 15, seventeenthPlus: 8 },
  { tournament: "LDUFK Bounty", fourth: 80, fifthSixth: 50, seventhEighth: 35, ninthSixteenth: 18, seventeenthPlus: 10 }
];

export const pointsRules: PointsRule[] = [
  {
    title: "Одне нарахування за турнір",
    description: "Команда може отримати LDUFK Points за один турнір лише один раз."
  },
  {
    title: "Фінальний день має пріоритет",
    description: "Якщо команда пройшла у фінальний день, вона отримує очки тільки за підсумкове місце в турнірі."
  },
  {
    title: "Кваліфікаційні очки",
    description: "Якщо команда не пройшла у фінальний день, у рейтинг іде її найкращий результат у кваліфікації."
  },
  {
    title: "Кілька кваліфікацій",
    description: "Якщо команда грала кілька кваліфікацій одного турніру, зараховується тільки найкращий результат."
  },
  {
    title: "Без points у Play-In та Last Chance",
    description: "Play-In і Last Chance дають тільки слоти на LAN Finals, але не додають рейтингових очок."
  },
  {
    title: "LAN Finals не змінює рейтинг",
    description: "LAN-фінал визначає чемпіона сезону, але не впливає на LDUFK Points, бо відбір уже завершено."
  }
];

export const circuitLeagues: CircuitLeague[] = [
  {
    key: "school",
    title: "LDUFK School League",
    eyebrow: "School Division",
    description:
      "Турнірна система для шкільних команд України. Команди представляють свої заклади освіти, змагаються в онлайн-етапах, набирають LDUFK Points та борються за вихід на LDUFK School Finals.",
    tournaments: [
      {
        slug: "school-open-2026",
        stage: "open",
        name: "LDUFK School Open 2026",
        month: "Жовтень 2026",
        format: "FACEIT Online",
        status: "Реєстрація",
        role: "Старт сезону",
        description: "Перший турнір сезону, де всі команди починають шлях з нуля та отримують перші LDUFK Points.",
        points: 200,
        entry: freeEntry,
        prizePool: onlinePrizePool
      },
      {
        slug: "school-showdown-2026",
        stage: "showdown",
        name: "LDUFK School Showdown 2026",
        month: "Листопад–грудень 2026",
        format: "FACEIT Online",
        status: "Coming Soon",
        role: "Перше велике зіткнення",
        description: "Другий етап сезону, де фаворити підтверджують свій рівень, а нові претенденти борються за місце в рейтингу.",
        points: 220,
        entry: freeEntry,
        prizePool: onlinePrizePool
      },
      {
        slug: "school-rivals-2027",
        stage: "rivals",
        name: "LDUFK School Rivals 2027",
        month: "Лютий 2027",
        format: "FACEIT Online",
        status: "Coming Soon",
        role: "Принципові протистояння",
        description: "Етап реваншів, суперництва між командами та боротьби за важливі позиції в LDUFK Points.",
        points: 260,
        entry: freeEntry,
        prizePool: onlinePrizePool
      },
      {
        slug: "school-bounty-2027",
        stage: "bounty",
        name: "LDUFK School Bounty 2027",
        month: "Квітень 2027",
        format: "FACEIT Online",
        status: "Coming Soon",
        role: "Полювання за очками",
        description: "Фінальний онлайн-етап сезону, де кожна команда бореться за останні важливі очки перед LAN.",
        points: 320,
        entry: freeEntry,
        prizePool: onlinePrizePool
      },
      {
        slug: "school-finals-2027",
        stage: "finals",
        name: "LDUFK School Finals 2027",
        month: "Травень 2027",
        format: "LAN",
        status: "Coming Soon",
        role: "Головний фінал сезону",
        description: "LAN-фінал, де 8 найкращих шкільних команд сезону визначають чемпіона LDUFK School League.",
        points: null,
        entry: freeEntry,
        prizePool: lanPrizePool
      }
    ]
  },
  {
    key: "university",
    title: "LDUFK University League",
    eyebrow: "University Division",
    description:
      "Турнірна система для студентських команд закладів вищої освіти України. Команди представляють свої університети, набирають LDUFK Points та змагаються за вихід на LDUFK University Finals.",
    tournaments: [
      {
        slug: "university-open-2026",
        stage: "open",
        name: "LDUFK University Open 2026",
        month: "Жовтень 2026",
        format: "FACEIT Online",
        status: "Реєстрація",
        role: "Старт сезону",
        description: "Перший етап студентської ліги, який відкриває сезон та формує стартовий рейтинг.",
        points: 200,
        entry: freeEntry,
        prizePool: onlinePrizePool
      },
      {
        slug: "university-showdown-2026",
        stage: "showdown",
        name: "LDUFK University Showdown 2026",
        month: "Листопад–грудень 2026",
        format: "FACEIT Online",
        status: "Coming Soon",
        role: "Перше велике зіткнення",
        description: "Другий етап сезону, де команди борються за стабільність і високі позиції в рейтингу.",
        points: 220,
        entry: freeEntry,
        prizePool: onlinePrizePool
      },
      {
        slug: "university-rivals-2027",
        stage: "rivals",
        name: "LDUFK University Rivals 2027",
        month: "Лютий 2027",
        format: "FACEIT Online",
        status: "Coming Soon",
        role: "Принципові протистояння",
        description: "Турнір реваншів, суперництва та боротьби за місця у верхній частині таблиці.",
        points: 260,
        entry: freeEntry,
        prizePool: onlinePrizePool
      },
      {
        slug: "university-bounty-2027",
        stage: "bounty",
        name: "LDUFK University Bounty 2027",
        month: "Квітень 2027",
        format: "FACEIT Online",
        status: "Coming Soon",
        role: "Полювання за очками",
        description: "Останній онлайн-етап перед фіналом, де команди борються за вирішальні LDUFK Points.",
        points: 320,
        entry: freeEntry,
        prizePool: onlinePrizePool
      },
      {
        slug: "university-finals-2027",
        stage: "finals",
        name: "LDUFK University Finals 2027",
        month: "Травень 2027",
        format: "LAN",
        status: "Coming Soon",
        role: "Головний фінал сезону",
        description: "LAN-фінал для 8 найсильніших студентських команд сезону.",
        points: null,
        entry: freeEntry,
        prizePool: lanPrizePool
      }
    ]
  }
];

export const pointsDistribution = [
  ["LDUFK Open", "200 points"],
  ["LDUFK Showdown", "220 points"],
  ["LDUFK Rivals", "260 points"],
  ["LDUFK Bounty", "320 points"],
  ["Разом", "1000 points"]
];

export const qualificationSlots = [
  {
    slots: "4 слоти",
    title: "Direct Invite",
    description: "Топ-4 команди рейтингу LDUFK Points проходять напряму на LAN Finals."
  },
  {
    slots: "2 слоти",
    title: "LDUFK Finals Play-In",
    description: "Команди з 5 по 20 місце рейтингу грають окрему кваліфікацію за 2 слоти на LAN."
  },
  {
    slots: "2 слоти",
    title: "LDUFK Finals Last Chance",
    description: "Відкрита кваліфікація для всіх команд, включно з тими, хто не брав участі в сезоні."
  }
];

export const qualificationZones = [
  ["Top 4", "Direct Invite Zone"],
  ["5–20", "Play-In Zone"],
  ["21+", "Chasing Zone / Last Chance"]
];

export function getCircuitTournamentBySlug(slug: string) {
  for (const league of circuitLeagues) {
    const tournament = league.tournaments.find((item) => item.slug === slug);
    if (tournament) return { league, tournament };
  }

  return null;
}
