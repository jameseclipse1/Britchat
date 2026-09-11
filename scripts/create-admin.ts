// Run once with: npm run create-admin
// Creates your own admin login directly in Supabase using the service-role
// key from .env.local. Nothing here is sent anywhere except your own
// Supabase project.
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { createInterface } from "node:readline/promises";

async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local. Fill those in first."
    );
    process.exit(1);
  }

  const username = (await prompt("Admin username: ")).toLowerCase().replace(/\s+/g, "-");
  const displayName = await prompt("Admin display name: ");
  const password = await prompt("Admin password (8+ characters): ");

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const email = `${username}@britchat.internal`;
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    console.error("Couldn't create the account:", createError?.message);
    process.exit(1);
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    username,
    display_name: displayName,
    role: "admin",
  });
  if (profileError) {
    console.error("Account created, but the profile row failed:", profileError.message);
    process.exit(1);
  }

  console.log(`\nDone. Sign in at /login with username "${username}" and your password.`);
}

main();
