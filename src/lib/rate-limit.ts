export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

const clients = new Map<string, { count: number; resetAt: number }>();
let cleanupScheduled = false;

function scheduleCleanup(): void {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  setTimeout(() => {
    const now = Date.now();
    for (const [key, entry] of clients) {
      if (now >= entry.resetAt) {
        clients.delete(key);
      }
    }
    cleanupScheduled = false;
    if (clients.size > 0) scheduleCleanup();
  }, WINDOW_MS * 2).unref();
}

export function rateLimit(key: string, maxRequests = MAX_REQUESTS, windowMs = WINDOW_MS): RateLimitResult {
  const now = Date.now();
  const entry = clients.get(key);

  if (!entry || now >= entry.resetAt) {
    clients.set(key, { count: 1, resetAt: now + windowMs });
    scheduleCleanup();
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}
