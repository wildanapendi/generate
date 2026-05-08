import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function test() {
  console.log("Mencoba login...");
  const res = await supabase.auth.signInWithPassword({
    email: "admin@modulgenerator.com",
    password: "Props-Ti@2026",
  });
  console.log("Result:", JSON.stringify(res, null, 2));
}

test();
