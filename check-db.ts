import { Client } from 'pg';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function checkDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");
    
    const authUsers = await client.query("SELECT id, email, role, last_sign_in_at FROM auth.users WHERE email = 'admin@modulgenerator.com'");
    console.log("auth.users count:", authUsers.rowCount);
    if (authUsers.rowCount > 0) {
      console.log("auth.user:", authUsers.rows[0]);
    }
    
    const publicUsers = await client.query("SELECT id, email, role FROM public.users WHERE email = 'admin@modulgenerator.com'");
    console.log("public.users count:", publicUsers.rowCount);
    
    if (authUsers.rowCount > 0) {
      const identities = await client.query("SELECT id, provider FROM auth.identities WHERE user_id = $1", [authUsers.rows[0].id]);
      console.log("auth.identities count:", identities.rowCount);
    }

  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

checkDb();
