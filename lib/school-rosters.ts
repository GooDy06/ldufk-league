export type ManualSchoolTeam = {
  name: string;
  slug: string;
  org: string;
  color: string;
  logo_url?: string | null;
  players: string[];
};

export const schoolRosters: ManualSchoolTeam[] = [
  {
    name: "S0mples",
    slug: "lyceim-74-lviv",
    org: "Ліцей 74 імені Марійки Підгірянки (Львів)",
    color: "#18d7ff",
    players: ["Fintik", "GODlike", "forever", "mar1k_ch", "windivatph"]
  },
  {
    name: "KOZA4KU",
    slug: "lyceum-prestige-nadvirna",
    org: "Ліцей \"Престиж\" (Надвірна)",
    color: "#6ff0c2",
    players: ["Dand_s", "Flaik1ch", "Quer1ann", "mrfliyyy", "zhoha"]
  },
  {
    name: "Nonsense_eSports",
    slug: "lyceum-3-hmel",
    org: "Ліцей №3 імені Артема Мазура (Хмельницький)",
    color: "#facc15",
    players: ["FUGA228", "Goldmay", "awuxm", "sh4d3", "sp5ider"]
  },
  {
    name: "Prestige",
    slug: "prestige",
    org: "LDUFK School Cup 2026",
    color: "#ff9aa2",
    players: ["Cla1m", "Kyos666", "Yarem1ch", "m1quse", "morex666"]
  },
  {
    name: "VLMIA",
    slug: "vlmia",
    org: "LDUFK School Cup 2026",
    color: "#6ee7b7",
    players: ["Klin", "TheEvilBoys", "_ome1ya17_", "manrase2", "s0lanaflip3r"]
  },
  {
    name: "Kostopil FireTeam",
    slug: "kostopil-fireteam",
    org: "LDUFK School Cup 2026",
    color: "#fb923c",
    players: ["-1rix", "Arsen_Bakin", "BambooFury", "Snapcake", "monte666"]
  }
];

export function slugifyPlayerNick(nick: string) {
  return encodeURIComponent(nick.trim());
}
