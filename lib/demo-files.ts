import { existsSync, readFileSync } from "fs";
import path from "path";

export type DemoFile = {
  matchId: number;
  url: string;
  label: string;
};

function readDemoManifest() {
  const manifestPath = path.join(process.cwd(), "public", "demo-data", "demo-manifest.json");
  if (!existsSync(manifestPath)) return [];

  try {
    return JSON.parse(readFileSync(manifestPath, "utf8")) as DemoFile[];
  } catch {
    return [];
  }
}

export const demoFiles: DemoFile[] = readDemoManifest();

export function getDemoFile(matchId: string | number) {
  return demoFiles.find((demo) => demo.matchId === Number(matchId)) || null;
}

export function demoViewerHref(url: string) {
  return `/demo-viewer/player?demourl=${encodeURIComponent(url)}`;
}
