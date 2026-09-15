// Tiny in-memory sliding-window limiter (per server instance — good enough
// to blunt abuse on a hobby deploy; swap for Upstash Redis when you need
// cross-instance guarantees).
type Bucket = { hits: number[] };
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  if (bucket.hits.length >= limit) {
    const retryAfterSec = Math.ceil(
      (windowMs - (now - bucket.hits[0])) / 1000,
    );
    return { ok: false, retryAfterSec: Math.max(retryAfterSec, 1) };
  }
  bucket.hits.push(now);
  // occasional housekeeping so the map cannot grow unbounded
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      if (b.hits.length === 0 || now - (b.hits.at(-1) ?? 0) > windowMs) {
        buckets.delete(k);
      }
    }
  }
  return { ok: true };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
