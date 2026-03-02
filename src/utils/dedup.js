const windowMs = Number(process.env.DEDUP_WINDOW || 5000);
const recent = new Map();

export function isDuplicate(key) {
  const now = Date.now();

  for (const [k, ts] of recent) {
    if (now - ts > windowMs) recent.delete(k);
  }

  const last = recent.get(key);
  if (last && now - last <= windowMs) return true;

  recent.set(key, now);
  return false;
}   