const LOG_LEVEL = process.env.LOG_LEVEL || "info";

export const log = {
  debug: (...a) => (LOG_LEVEL === "debug" ? console.log("[DEBUG]", ...a) : null),
  info: (...a) => console.log("[INFO]", ...a),
  warn: (...a) => console.warn("[WARN]", ...a),
  error: (...a) => console.error("[ERROR]", ...a),
};