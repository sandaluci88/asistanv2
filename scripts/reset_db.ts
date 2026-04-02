import { SupabaseService } from "../src/utils/supabase.service";
import dotenv from "dotenv";

dotenv.config();

async function runReset() {
  console.log("🚀 Veri tabanı sıfırlama işlemi başlatılıyor...");
  const supabase = SupabaseService.getInstance();
  try {
    await supabase.resetDatabase();
    console.log("✨ Sıfırlama tamamlandı.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Hata:", err);
    process.exit(1);
  }
}

runReset();
