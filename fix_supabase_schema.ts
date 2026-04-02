import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL veya SUPABASE_KEY bulunamadı!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSchema() {
  console.log("🚀 Veritabanı şeması güncelleniyor...");

  // NOT: Supabase JS SDK üzerinden doğrudan ALTER TABLE yapılamaz.
  // Ancak 'is_verified' sütununu manuel olarak eklediğinizi varsayarak
  // veya bu sütunu koddan temizleyerek devam edebiliriz.
  //
  // Alternatif olarak: Eğer tabloya ekleyemiyorsak,
  // kod tarafındaki bu zorunluluğu kaldıralım.

  console.log(
    "⚠️  NOT: Sütun ekleme işlemi genellikle SQL Editor üzerinden (Supabase UI) yapılmalıdır.",
  );
  console.log(
    "SQL Kodunuz: ALTER TABLE staff ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE;",
  );

  // Test edelim: Şu an staff tablosuna erişebiliyor muyuz?
  const { data, error } = await supabase
    .from("staff")
    .select("count", { count: "exact", head: true });

  if (error) {
    console.error("❌ Bağlantı hatası:", error.message);
  } else {
    console.log("✅ Supabase bağlantısı başarılı, staff tablosu mevcut.");
  }
}

fixSchema();
