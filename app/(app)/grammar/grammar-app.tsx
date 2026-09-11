"use client";

import { useState } from "react";
import { QUIZZES } from "@/lib/data/content";
import { saveQuizProgress } from "@/app/actions";

type ProgressMap = Record<string, { bestScore: number; total: number; attempts: number }>;

export default function GrammarApp({ initialProgress }: { initialProgress: ProgressMap }) {
  const [progress, setProgress] = useState<ProgressMap>(initialProgress);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  if (activeTopic) {
    return (
      <Quiz
        topicId={activeTopic}
        onExit={() => setActiveTopic(null)}
        onFinished={(topicId, best, total, attempts) =>
          setProgress((p) => ({ ...p, [topicId]: { bestScore: best, total, attempts } }))
        }
      />
    );
  }

  return (
    <section className="flex flex-col gap-3">
      {Object.entries(QUIZZES).map(([id, quiz]) => {
        const rec = progress[id];
        return (
          <button
            key={id}
            onClick={() => setActiveTopic(id)}
            className="card flex items-center justify-between gap-3 text-left cursor-pointer"
          >
            <div>
              <h3 className="text-base m-0 mb-1" style={{ textTransform: "none", letterSpacing: 0 }}>
                {quiz.title}
              </h3>
              <p className="text-sm m-0" style={{ color: "var(--muted)" }}>
                {quiz.blurb}
              </p>
            </div>
            <div className="display text-2xl tabular flex-none" style={{ color: "var(--pitch)" }}>
              {rec ? `${rec.bestScore}/${rec.total}` : "-"}
              <small
                className="block text-[9.5px] uppercase tracking-wide text-center"
                style={{ color: "var(--muted)" }}
              >
                {rec ? "best" : "not started"}
              </small>
            </div>
          </button>
        );
      })}
    </section>
  );
}

function Quiz({
  topicId,
  onExit,
  onFinished,
}: {
  topicId: string;
  onExit: () => void;
  onFinished: (topicId: string, best: number, total: number, attempts: number) => void;
}) {
  const quiz = QUIZZES[topicId];
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const total = quiz.questions.length;

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <section className="text-center py-8 px-2">
        <div className="display text-5xl tabular leading-none" style={{ color: "var(--pitch)" }}>
          {score}/{total}
        </div>
        <p className="mt-1.5 mb-6" style={{ color: "var(--muted)" }}>
          {pct}% correct on {quiz.title}
        </p>
        <div className="flex gap-2.5 justify-center flex-wrap">
          <button
            className="btn accent"
            onClick={() => {
              setQIndex(0);
              setScore(0);
              setSelected(null);
              setDone(false);
            }}
          >
            Try again
          </button>
          <button className="btn ghost" onClick={onExit}>
            Back to topics
          </button>
        </div>
      </section>
    );
  }

  const q = quiz.questions[qIndex];

  async function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    const nextScore = i === q.a ? score + 1 : score;
    if (i === q.a) setScore(nextScore);

    if (qIndex + 1 >= total) {
      setSaving(true);
      const result = await saveQuizProgress(topicId, nextScore, total);
      setSaving(false);
      if (result && !("error" in result)) {
        onFinished(topicId, result.bestScore, total, result.attempts);
      }
    }
  }

  function next() {
    if (qIndex + 1 >= total) {
      setDone(true);
    } else {
      setQIndex(qIndex + 1);
      setSelected(null);
    }
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-2.5">
        <button className="text-sm cursor-pointer" style={{ color: "var(--muted)" }} onClick={onExit}>
          &lt; Topics
        </button>
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          {qIndex + 1} / {total}
        </div>
      </div>
      <div className="meter mb-5">
        <div className="meter-fill" style={{ width: `${Math.round((qIndex / total) * 100)}%` }} />
      </div>
      <p className="text-lg leading-snug mb-4">{q.p}</p>
      {q.c.map((choiceText, i) => {
        let cls = "choice";
        if (selected !== null) {
          if (i === q.a) cls += " correct";
          else if (i === selected) cls += " incorrect";
        }
        return (
          <button key={i} className={cls} disabled={selected !== null} onClick={() => choose(i)}>
            {choiceText}
          </button>
        );
      })}
      {selected !== null && (
        <>
          <div className="card mt-1.5 mb-4 text-sm leading-relaxed" style={{ background: "var(--surface-2)" }}>
            {q.e}
          </div>
          <button className="btn accent" onClick={next} disabled={saving}>
            {saving ? "Saving..." : qIndex + 1 < total ? "Next question" : "See my score"}
          </button>
        </>
      )}
    </section>
  );
}
