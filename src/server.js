import express from "express";
import dotenv from "dotenv";
import "./mqttBridge.js";
import { pool } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.json({
    status: "MQTT → DB Bridge Running",
    uptime: process.uptime(),
  });
});


(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Database connected successfully");
    conn.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
})();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
