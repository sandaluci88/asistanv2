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

  const staffId = crypto.randomUUID();
  console.log("Attempting to insert with ID:", staffId);

  const { data, error } = await client.from("staff").upsert(
      {
        id: staffId,
        telegram_id: staff.telegramId,
        name: staff.name,
        department: staff.department,
        role: staff.role,
        phone: staff.phone,
      },
      { onConflict: "telegram_id" }
  );

  console.log("Upsert result data:", data);
  console.log("Upsert result error:", error);
}

testUpsert().catch(console.error);
