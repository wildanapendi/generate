import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ ERROR: NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY tidak ditemukan di .env.local"
  );
  process.exit(1);
}

console.log(`Menghubungkan ke Supabase di: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("🔄 Mencoba koneksi...");
  try {
    // Lakukan query sederhana ke tabel 'users' untuk mengecek koneksi database
    const { data, error } = await supabase.from("users").select("id").limit(1);

    if (error) {
      console.error("❌ Gagal terhubung ke Supabase. Detail error:");
      console.error(error);
    } else {
      console.log("✅ Berhasil terhubung ke Supabase!");
      console.log("Status: Koneksi Database Aktif dan Merespons.");
    }
  } catch (err) {
    console.error("❌ Terjadi error tidak terduga:");
    console.error(err);
  }
}

testConnection();
