"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidUsername, normalizeUsername, usernameToEmail } from "@/lib/auth";

// Server Actions are their own POST endpoints and are NOT covered by
// proxy.ts route matching (see Next.js docs on Server Functions), so every
// action that uses the service-role client must check the caller's role
// itself rather than relying on page-level redirects.
async function requireAdmin(): Promise<{ error: string } | null> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Not signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profile?.role !== "admin") return { error: "Admins only." };
  return null;
}

export async function signIn(_prevState: { error?: string } | undefined, formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });

  if (error) {
    return { error: "That username or password isn't right." };
  }
  redirect("/dictionary");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function saveQuizProgress(topicId: string, score: number, total: number) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Not signed in." };

  const { data: existing } = await supabase
    .from("quiz_progress")
    .select("best_score, attempts")
    .eq("user_id", userData.user.id)
    .eq("topic_id", topicId)
    .maybeSingle();

  const bestScore = Math.max(existing?.best_score ?? 0, score);
  const attempts = (existing?.attempts ?? 0) + 1;

  const { error } = await supabase.from("quiz_progress").upsert({
    user_id: userData.user.id,
    topic_id: topicId,
    best_score: bestScore,
    total_questions: total,
    attempts,
    last_attempt_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath("/progress");
  revalidatePath("/admin");
  return { bestScore, attempts };
}

export async function createChatter(
  _prevState: { error?: string; success?: boolean; username?: string } | undefined,
  formData: FormData
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const rawUsername = String(formData.get("username") || "");
  const displayName = String(formData.get("displayName") || "").trim();
  const password = String(formData.get("password") || "");

  if (!isValidUsername(rawUsername)) {
    return { error: "Username must be 2-32 characters: letters, numbers, hyphens only." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!displayName) {
    return { error: "Please enter a display name." };
  }

  const username = normalizeUsername(rawUsername);
  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: usernameToEmail(username),
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    return { error: createError?.message || "Couldn't create that account." };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    username,
    display_name: displayName,
    role: "chatter",
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: profileError.message };
  }

  revalidatePath("/admin");
  return { success: true, username };
}

export async function resetChatterPassword(userId: string, newPassword: string) {
  const authError = await requireAdmin();
  if (authError) return authError;

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return { error: error.message };
  return { success: true };
}
