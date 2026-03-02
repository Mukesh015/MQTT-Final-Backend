export function toMysqlFormat(ts) {
  if (typeof ts !== "string") ts = String(ts);

  const ampm = ts.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i,
  );

  if (ampm) {
    let [, Y, M, D, h, m, s, ap] = ampm;
    let H = parseInt(h, 10);
    ap = ap.toUpperCase();
    if (ap === "PM" && H < 12) H += 12;
    if (ap === "AM" && H === 12) H = 0;
    return `${Y}-${M}-${D} ${String(H).padStart(2, "0")}:${m}:${s}`;
  }

  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(ts)) return ts;

  const d = new Date(ts);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 19).replace("T", " ");
  }

  return ts;
}
