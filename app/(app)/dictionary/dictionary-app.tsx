"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, DICTIONARY, type DictEntry } from "@/lib/data/content";

function matchesQuery(entry: DictEntry, q: string) {
  if (!q) return true;
  return (
    entry.term.toLowerCase().includes(q) ||
    entry.meaning.toLowerCase().includes(q) ||
    entry.plainWords.some((p) => p.toLowerCase().includes(q)) ||
    entry.definition.toLowerCase().includes(q)
  );
}

export default function DictionaryApp() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DICTIONARY.filter(
      (e) => (category === "all" || e.category === category) && matchesQuery(e, q)
    );
  }, [query, category]);

  return (
    <section>
      <p className="eyebrow">Dictionary — slang in, meaning out (or the other way round)</p>
      <input
        type="text"
        placeholder="Search a word, e.g. 'good', 'tired', 'peng', 'PPV'..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3"
      />
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`chip${category === cat.id ? " active" : ""}`}
            onClick={() => setCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <p className="text-xs mb-3.5" style={{ color: "var(--muted)" }}>
        {results.length} {results.length === 1 ? "term" : "terms"} found
      </p>
      {results.length === 0 ? (
        <p className="text-center py-10" style={{ color: "var(--muted)" }}>
          No matches. Try a different word, or browse by category above.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((entry) => (
            <article key={entry.term} className="card">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-lg m-0" style={{ textTransform: "none", letterSpacing: 0 }}>
                  {entry.term}
                </h3>
                {entry.club && <span className="badge-club">{entry.club}</span>}
              </div>
              <p className="text-sm font-semibold mb-2" style={{ color: "var(--pitch)" }}>
                means: {entry.meaning}
              </p>
              <p className="text-sm mb-2.5 leading-relaxed">{entry.definition}</p>
              <div
                className="flex flex-col gap-1.5 pt-2"
                style={{ borderTop: "1px dashed var(--line)" }}
              >
                {entry.examples.map((ex) => (
                  <p
                    key={ex}
                    className="text-sm italic m-0"
                    style={{ color: "var(--muted)" }}
                  >
                    &ldquo;{ex}&rdquo;
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
