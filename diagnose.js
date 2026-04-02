const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const bossIdsRaw = process.env.TELEGRAM_BOSS_ID;
console.log("TELEGRAM_BOSS_ID raw:", bossIdsRaw);

const bossIds = (bossIdsRaw || "")
  .split(",")
  .map((id) => id.trim().replace(/['"]/g, ""));
console.log("Parsed BOSS IDs:", bossIds);

const testId = "1030595483";
console.log(`Matching test for ${testId}:`, bossIds.includes(testId));
