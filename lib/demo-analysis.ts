import { existsSync, readFileSync } from "fs";
import path from "path";

export type DemoAnalysisSide = "T" | "CT";

export type DemoAnalysisSideStats = {
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  firstKills: number;
  firstDeaths: number;
  flashAssists: number;
  headshots?: number;
};

export type DemoAnalysisPlayer = {
  steamId: string;
  name: string;
  teamName: string;
  sides: Record<DemoAnalysisSide, DemoAnalysisSideStats>;
};

export type DemoAnalysisTeamSideStats = {
  teamName: string;
  side: DemoAnalysisSide;
  roundsPlayed: number;
  roundsWon: number;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  firstKills: number;
  firstDeaths: number;
  flashAssists: number;
};

export type DemoAnalysisRound = {
  roundNumber: number;
  winnerSide: DemoAnalysisSide;
  winnerTeam: string;
  reason: string | null;
  firstKill: null | {
    attacker: string | null;
    attackerTeam: string;
    attackerSide: DemoAnalysisSide;
    victim: string | null;
    victimTeam: string;
    victimSide: DemoAnalysisSide;
    weapon: string | null;
    headshot: boolean;
  };
  bombEvents: Array<{
    type: string;
    player: string | null;
    teamName: string;
    side: DemoAnalysisSide;
    site: number | null;
  }>;
};

export type DemoAnalysis = {
  schemaVersion: number;
  generatedAt: string;
  sourceDemoUrl: string | null;
  matchId: number;
  mapName: string;
  serverName: string;
  rounds: DemoAnalysisRound[];
  teamSideStats: DemoAnalysisTeamSideStats[];
  players: DemoAnalysisPlayer[];
};

export function getDemoAnalysis(matchId: string | number): DemoAnalysis | null {
  const filePath = path.join(process.cwd(), "public", "demo-data", "matches", `${matchId}.json`);
  if (!existsSync(filePath)) return null;

  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as DemoAnalysis;
  } catch {
    return null;
  }
}
