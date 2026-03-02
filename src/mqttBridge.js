import mqtt from "mqtt";
import dotenv from "dotenv";
import crypto from "crypto";
import { pool } from "./db.js";
import { log } from "./utils/logger.js";
import { coerceToJson } from "./utils/jsonRepair.js";
import { isDuplicate } from "./utils/dedup.js";
import { toMysqlFormat } from "./utils/time.js";

dotenv.config();

const {
  MQTT_URL,
  MQTT_USERNAME,
  MQTT_PASSWORD,
  MQTT_TOPIC,
  MQTT_QOS = "1",
} = process.env;

function stableId(obj) {
  const device_id = obj.device_id ?? "";
  const tank_no = obj.tank_no ?? "";
  const when = obj.ts ?? obj.date_time ?? "";
  const value = obj.ul_m ?? obj.ultra_height ?? "";

  return crypto
    .createHash("sha256")
    .update(JSON.stringify({ device_id, tank_no, when, value }))
    .digest("hex");
}

const client = mqtt.connect(MQTT_URL, {
  username: MQTT_USERNAME || undefined,
  password: MQTT_PASSWORD || undefined,
  reconnectPeriod: 2000,
});

client.on("connect", () => {
  log.info("MQTT connected");
  client.subscribe(MQTT_TOPIC, { qos: Number(MQTT_QOS) });
});

client.on("message", async (_topic, buf) => {
  const raw = buf.toString();

  try {
    const incoming = coerceToJson(raw);
    const key = stableId(incoming);

    if (isDuplicate(key)) {
      log.info("Duplicate skipped");
      return;
    }

    const device_id = incoming.device_id;
    const tank_no = incoming.tank_no;
    const ts = incoming.ts ?? incoming.date_time;
    const ultra_height = incoming.ul_m ?? incoming.ultra_height;
    const ul_status = incoming.ul_status ?? null;
    const location = incoming.location ?? null;
    const lidar_height = incoming.lidar_height ?? null;

    if (!device_id || !tank_no || !ts || ultra_height == null) {
      throw new Error("Missing required fields");
    }

    await pool.execute(
      `INSERT INTO Transaction_Table 
      (device_id, tank_no, date_time, ultra_height, lidar_height, location, ul_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        device_id,
        tank_no,
        toMysqlFormat(ts),
        Number(ultra_height),
        lidar_height,
        location,
        ul_status,
      ]
    );

    log.info("Inserted into DB successfully");
  } catch (err) {
    log.error("Bridge error:", err.message);
  }
});