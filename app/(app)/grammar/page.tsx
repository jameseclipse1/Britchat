import { createClient } from "@/lib/supabase/server";
import GrammarApp from "./grammar-app";

export default async function GrammarPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const initialProgress: Record<string, { bestScore: number; total: number; attempts: number }> = {};
  if (userData.user) {
    const { data: rows } = await supabase
      .from("quiz_progress")
      .select("topic_id, best_score, total_questions, attempts")
      .eq("user_id", userData.user.id);
    for (const row of rows ?? []) {
      initialProgress[row.topic_id] = {
        bestScore: row.best_score,
        total: row.total_questions,
        attempts: row.attempts,
      };
    }
  }

  return <GrammarApp initialProgress={initialProgress} />;
}
