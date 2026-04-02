import * as dotenv from "dotenv";
import { StaffService } from "./src/utils/staff.service";

dotenv.config();

function check() {
  const bossIds = (process.env.TELEGRAM_BOSS_ID || "")
    .split(",")
    .map((id) => id.trim().replace(/['"]/g, ""));
  console.log("Current BOSS IDs in .env:", bossIds);

  const staffService = StaffService.getInstance();
  const testId = 1030595483;
  console.log(`Checking ID ${testId}:`);
  console.log("  isBoss:", staffService.isBoss(testId));
  console.log("  staffInfo:", staffService.getStaffByTelegramId(testId));

  const guestId = 6030287709;
  console.log(`Checking ID ${guestId}:`);
  console.log("  isBoss:", staffService.isBoss(guestId));
  console.log("  staffInfo:", staffService.getStaffByTelegramId(guestId));
}

check();
