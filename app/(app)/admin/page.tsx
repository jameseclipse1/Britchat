import { createClient } from "@/lib/supabase/server";
import { QUIZZES } from "@/lib/data/content";
import AddChatterForm from "./add-chatter-form";
import ResetPasswordButton from "./reset-password-button";

const TOTAL_TOPICS = Object.keys(QUIZZES).length;

export default async function AdminPage() {
  const supabase = await createClient();

  const [{ data: profiles }, { data: progressRows }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, username").eq("role", "chatter"),
    supabase
      .from("quiz_progress")
      .select("user_id, topic_id, best_score, total_questions, last_attempt_at"),
  ]);

  const rows = (profiles ?? []).map((profile) => {
    const entries = (progressRows ?? []).filter((r) => r.user_id === profile.id);
    const topicsCompleted = entries.length;
    const avgPct = entries.length
      ? Math.round(
          entries.reduce((sum, r) => sum + (r.best_score / r.total_questions) * 100, 0) /
            entries.length
        )
      : 0;
    const lastActive = entries
      .map((r) => r.last_attempt_at)
      .sort()
      .at(-1);
    return { ...profile, topicsCompleted, avgPct, lastActive };
  });

  rows.sort((a, b) => b.topicsCompleted - a.topicsCompleted || b.avgPct - a.avgPct);

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg mb-2" style={{ textTransform: "none", letterSpacing: 0 }}>
          League table
        </h2>
        <div className="card overflow-x-auto">
          <table className="league">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Chatter</th>
                <th>Topics</th>
                <th>Avg score</th>
                <th>Last active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ color: "var(--muted)" }}>
                    No chatters yet — add one below.
                  </td>
                </tr>
              )}
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td className="tabular">{i + 1}</td>
                  <td>{r.display_name}</td>
                  <td className="tabular">
                    {r.topicsCompleted}/{TOTAL_TOPICS}
                  </td>
                  <td className="tabular">{r.avgPct}%</td>
                  <td>
                    {r.lastActive ? new Date(r.lastActive).toLocaleDateString("en-GB") : "-"}
                  </td>
                  <td>
                    <ResetPasswordButton userId={r.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddChatterForm />
    </section>
  );
}
