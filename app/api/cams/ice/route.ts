import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function splitEnv(value?: string) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function GET() {
  const stunUrls = splitEnv(process.env.NEXT_PUBLIC_CAMS_STUN_URLS || "stun:stun.l.google.com:19302,stun:global.stun.twilio.com:3478");
  const turnUrls = splitEnv(process.env.CAMS_TURN_URLS);
  const turnUsername = process.env.CAMS_TURN_USERNAME;
  const turnCredential = process.env.CAMS_TURN_CREDENTIAL;

  const iceServers: RTCIceServer[] = [];

  if (stunUrls.length) {
    iceServers.push({ urls: stunUrls });
  }

  if (turnUrls.length && turnUsername && turnCredential) {
    iceServers.push({
      urls: turnUrls,
      username: turnUsername,
      credential: turnCredential
    });
  }

  return NextResponse.json({ iceServers });
}
