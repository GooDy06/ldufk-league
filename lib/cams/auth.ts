import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "ldufk_cams_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function sessionSecret() {
  return process.env.CAMS_ADMIN_SESSION_SECRET || process.env.CAMS_ADMIN_PASSWORD || process.env.ADMIN_EMAIL || "";
}

function sign(value: string) {
  const secret = sessionSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createCamsAdminSession() {
  const issuedAt = String(Date.now());
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function isCamsAdminSessionValid(value?: string | null) {
  if (!value) return false;

  const [issuedAt, signature] = value.split(".");
  const timestamp = Number(issuedAt);

  if (!issuedAt || !signature || !Number.isFinite(timestamp)) return false;
  if (Date.now() - timestamp > SESSION_TTL_MS) return false;

  const expected = sign(issuedAt);
  return Boolean(expected) && safeEqual(signature, expected);
}

export function isCamsAdminAuthed() {
  return isCamsAdminSessionValid(cookies().get(COOKIE_NAME)?.value);
}

export function setCamsAdminCookie() {
  cookies().set({
    name: COOKIE_NAME,
    value: createCamsAdminSession(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000
  });
}

export function clearCamsAdminCookie() {
  cookies().set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}
