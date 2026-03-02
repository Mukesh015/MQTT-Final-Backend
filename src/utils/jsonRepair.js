export function coerceToJson(str) {
  if (typeof str !== "string") return str;
  let s = str.trim();

  try { return JSON.parse(s); } catch (_) {}

  s = s.replace(/'/g, '"');
  s = s.replace(/([{\[,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)/g, '$1"$2"$3');
  s = s.replace(/:\s*([^,\}\]\s][^,\}\]]*)/g, (m, v) => {
    const val = v.trim();
    if (/^(true|false|null)$/i.test(val)) return `: ${val.toLowerCase()}`;
    if (/^-?\d+(\.\d+)?$/.test(val)) return `: ${val}`;
    if (val.startsWith('"') || val.startsWith('{') || val.startsWith('[')) return `: ${val}`;
    return `: "${val}"`;
  });

  return JSON.parse(s);
}