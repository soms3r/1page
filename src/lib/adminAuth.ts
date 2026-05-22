import { ADMIN_HASH } from "./admin-hash.generated";

const SESSION_COOKIE = "admin_session";
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getExpectedHash(): string {
  return ADMIN_HASH;
}

export function setSessionCookie(): void {
  const expires = new Date(Date.now() + SESSION_EXPIRY_MS).toUTCString();
  document.cookie = `${SESSION_COOKIE}=1; path=/admin; expires=${expires}; SameSite=Lax`;
}

export function clearSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE}=; path=/admin; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function checkAuthCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${SESSION_COOKIE}=`));
}
