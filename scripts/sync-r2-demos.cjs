#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

function loadDotEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

loadDotEnvLocal();

const REQUIRED_ENV = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_BASE_URL"
];

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function matchIdFromKey(key) {
  const patterns = [
    /(?:^|[_-])match[_-]?(\d+)(?:[_-]|\.|$)/i,
    /(?:^|[_-])(\d{3,8})(?:[_-])de_/i,
    /(?:^|[_-])(\d{3,8})(?:[_-][A-Za-z0-9]+_vs_)/i
  ];

  for (const pattern of patterns) {
    const match = key.match(pattern);
    if (match) return Number(match[1]);
  }

  return null;
}

function labelFromKey(key, matchId) {
  const file = path.basename(key).replace(/\.dem$/i, "");
  const map = file.match(/(de_[a-z0-9_]+)/i)?.[1]?.replace(/^de_/, "") || "Demo";
  const teams = file.match(/([A-Za-z0-9]+)_vs_([A-Za-z0-9]+)/i);
  const mapLabel = map.replace(/^\w/, (char) => char.toUpperCase());
  if (teams) return `${mapLabel} · ${teams[1]} vs ${teams[2]}`;
  return `${mapLabel} · match ${matchId}`;
}

function readManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) return [];
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function writeManifest(manifestPath, manifest) {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  const sorted = [...manifest].sort((a, b) => a.matchId - b.matchId);
  fs.writeFileSync(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);
}

async function listObjects() {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY")
    }
  });

  const bucket = env("R2_BUCKET");
  const prefix = process.env.R2_PREFIX || "";
  const objects = [];
  let ContinuationToken;

  do {
    const response = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken
    }));
    objects.push(...(response.Contents || []));
    ContinuationToken = response.NextContinuationToken;
  } while (ContinuationToken);

  return objects.map((object) => object.Key).filter((key) => key && key.toLowerCase().endsWith(".dem"));
}

async function main() {
  for (const name of REQUIRED_ENV) env(name);

  const publicBaseUrl = env("R2_PUBLIC_BASE_URL").replace(/\/$/, "");
  const manifestPath = path.join("public", "demo-data", "demo-manifest.json");
  const existing = readManifest(manifestPath);
  const byMatch = new Map(existing.map((item) => [Number(item.matchId), item]));
  const keys = await listObjects();

  for (const key of keys) {
    const matchId = matchIdFromKey(key);
    if (!matchId) {
      console.warn(`Skip ${key}: could not infer match id`);
      continue;
    }

    const encodedKey = key.split("/").map(encodeURIComponent).join("/");
    byMatch.set(matchId, {
      matchId,
      label: byMatch.get(matchId)?.label || labelFromKey(key, matchId),
      url: `${publicBaseUrl}/${encodedKey}`
    });
  }

  const manifest = [...byMatch.values()];
  writeManifest(manifestPath, manifest);
  console.log(`Wrote ${manifestPath} with ${manifest.length} demos`);

  for (const demo of manifest) {
    const outputPath = path.join("public", "demo-data", "matches", `${demo.matchId}.json`);
    if (fs.existsSync(outputPath) && !process.argv.includes("--force")) continue;

    console.log(`Parsing match ${demo.matchId}`);
    const result = spawnSync(process.execPath, ["scripts/parse-demo.cjs", "--match", String(demo.matchId), "--url", demo.url], {
      stdio: "inherit"
    });
    if (result.status !== 0) process.exit(result.status || 1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
