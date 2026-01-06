import { headers } from "next/headers";

const rateLimit = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  identifier: string,
  max: number = 10,
  windowMs: number = 60000
) {
  const now = Date.now();
  const record = rateLimit.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimit.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  if (record.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count++;
  return { allowed: true, remaining: max - record.count };
}

// Usage dans server actions
export async function withRateLimit(action: () => Promise<any>) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";

  const { allowed, retryAfter } = await checkRateLimit(ip, 10, 60000);

  if (!allowed) {
    throw new Error(`Trop de requêtes. Réessayez dans ${retryAfter}s`);
  }

  return action();
}
