const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");
require("dotenv").config();

async function testUpsert() {
  const client = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_KEY || "");
  
  const staff = {
    telegramId: 1030595483,
    name: "Barış",
    department: "Yönetim",
    role: "SuperAdmin"
  };

  const { data: existing, error: existError } = await client
      .from("staff")
      .select("id")
      .eq("telegram_id", staff.telegramId)
      .maybeSingle();

  console.log("existing:", existing, "error:", existError);

  const staffId = existing 
      ? existing.id 
      : (staff.id && staff.id.length > 10 ? staff.id : crypto.randomUUID());

  console.log("staffId evaluated as:", staffId);

}

testUpsert().catch(console.error);
