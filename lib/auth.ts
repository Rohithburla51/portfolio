/**
 * Simple password-based admin authentication.
 *
 * Uses HMAC-signed cookies to verify admin sessions.
 * No Supabase auth, no magic links, no email verification.
 */

import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_PASSWORD = "VISHNU_THE_ULTIMATE";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "rohith-portfolio-admin-secret-key-2024";
const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function sign(value: string): string {
  const hmac = createHmac("sha256", SESSION_SECRET);
  hmac.update(value);
  return hmac.digest("hex");
}

export function createSessionToken(): string {
  const payload = `${Date.now()}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function validateSessionToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  if (!payload || !signature) return false;

  const expectedSignature = sign(payload);
  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (sigBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(sigBuffer, expectedBuffer);
}

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export { COOKIE_NAME, SESSION_MAX_AGE };