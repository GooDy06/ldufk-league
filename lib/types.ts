export type Division = "University" | "School";
export type Publishable = { published: boolean };

export type Team = Publishable & {
  id: string;
  name: string;
  slug: string;
  division: Division;
  org: string;
  points: number;
  trend: number;
  color: string;
  logo_url: string | null;
  summary: string | null;
  created_at: string;
};

export type Player = Publishable & {
  id: string;
  team_id: string | null;
  nick: string;
  role: string;
  rating: number;
  avatar_url: string | null;
  team?: Pick<Team, "name" | "slug" | "division" | "color"> | null;
};

export type NewsItem = Publishable & {
  id: string;
  slug: string;
  title: string;
  tag: string;
  excerpt: string;
  body: string;
  image_url: string | null;
  published_at: string | null;
  created_at: string;
};

export type Tournament = Publishable & {
  id: string;
  slug: string;
  name: string;
  division: Division | "Global";
  type: "online" | "lan";
  date_label: string;
  status: "done" | "live" | "soon";
  teams_count: number;
  winner_team_id: string | null;
  points: string | null;
  prize: string | null;
  format: string | null;
  description: string | null;
  participants: string[];
  banner_url: string | null;
  winner?: Pick<Team, "name" | "slug"> | null;
};
