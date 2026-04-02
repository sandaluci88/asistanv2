
import { SupabaseService } from "./src/utils/supabase.service";

async function runCleanup() {
  try {
    console.log("🚀 Starting final cleanup before VPS deployment...");
    const supabase = SupabaseService.getInstance();
    await supabase.resetDatabase();
    console.log("⭐ Database and local ghost files cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  }
}

runCleanup();
