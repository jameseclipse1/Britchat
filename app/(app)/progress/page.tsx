import { createClient } from "@/lib/supabase/server";
import { QUIZZES } from "@/lib/data/content";

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const rows = userData.user
    ? (
        await supabase
          .from("quiz_progress")
          .select("topic_id, best_score, total_questions, attempts")
          .eq("user_id", userData.user.id)
      ).data ?? []
    : [];

  const byTopic = new Map(rows.map((r) => [r.topic_id, r]));
  const topicIds = Object.keys(QUIZZES);
  const started = topicIds.filter((id) => byTopic.has(id)).length;
  const avgPct =
    started === 0
      ? 0
      : Math.round(
          topicIds.reduce((sum, id) => {
            const r = byTopic.get(id);
            return r ? sum + Math.round((r.best_score / r.total_questions) * 100) : sum;
          }, 0) / started
        );

  return (
    <section>
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <StatTile num={`${started}/${topicIds.length}`} label="Topics started" />
        <StatTile num={`${avgPct}%`} label="Best average score" />
      </div>
      <div className="flex flex-col gap-2">
        {topicIds.map((id) => {
          const r = byTopic.get(id);
          const pct = r ? Math.round((r.best_score / r.total_questions) * 100) : null;
          return (
            <div key={id} className="card flex justify-between items-center py-3">
              <span className="text-sm">{QUIZZES[id].title}</span>
              <span className="display tabular" style={{ color: "var(--pitch)" }}>
                {pct === null ? "-" : `${pct}%`}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatTile({ num, label }: { num: string; label: string }) {
  return (
    <div className="card">
      <div className="display text-3xl tabular" style={{ color: "var(--pitch)" }}>
        {num}
      </div>
      <div className="text-[11.5px] uppercase tracking-wide mt-0.5" style={{ color: "var(--muted)" }}>
        {label}
      </div>
    </div>
  );
}
