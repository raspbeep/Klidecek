// komise-exam.jsx — committee insights surfaced inside the final-exam-prep pages.
//
//  ExamSpecHistogram  — on a specialization's topic list: when a commission is set,
//                       a histogram of how often each okruh was asked (My / Všichni).
//  ExamTopicAskedBy   — on a single okruh: who asked it (global by default, with a
//                       My-commission / Všichni toggle).
//
// Both read the shared board + index from KomiseContext and load it lazily.

import { useState, useEffect } from "react";
import { useKomise } from "./komise-context.jsx";
import { askHistogram, whoAsked } from "./komise.js";

function ScopeToggle({ scope, setScope }) {
  return (
    <div className="komise-scope" role="tablist">
      <button role="tab" aria-selected={scope === "board"} data-active={scope === "board"} onClick={() => setScope("board")}>Moje komise</button>
      <button role="tab" aria-selected={scope === "global"} data-active={scope === "global"} onClick={() => setScope("global")}>Všichni</button>
    </div>
  );
}

/* Histogram of asked okruhy for a whole specialization. Gated on a commission being
 * set (that's the "min-max" lens); a toggle widens it to all examiners. */
export function ExamSpecHistogram({ specId, topics, navigate }) {
  const k = useKomise();
  const [scope, setScope] = useState("board");
  const hasBoard = !!(k && k.board.length);
  useEffect(() => { if (hasBoard && k) k.ensureLoaded(); }, [hasBoard, k]);

  if (!hasBoard || !k.index) return null; // no commission set → no histogram
  const rows = askHistogram(k.index, topics, k.board, scope)
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count || a.n - b.n);
  const max = Math.max(1, ...rows.map((d) => d.count));

  return (
    <section className="komise-hist">
      <div className="komise-hist-head">
        <div>
          <h2 className="komise-hist-title">Nejčastěji zkoušené okruhy</h2>
          <p className="komise-hist-sub">
            {scope === "board" ? "Podle tvé komise" : "Napříč všemi komisaři"} — co nahoře, to opakuj přednostně.
          </p>
        </div>
        <ScopeToggle scope={scope} setScope={setScope} />
      </div>
      {rows.length === 0 ? (
        <div className="komise-muted" style={{ padding: "var(--pad-3) 0" }}>
          {scope === "board" ? "Z tvé komise u téhle specializace nemáme žádné záznamy — přepni na Všichni." : "Žádné záznamy."}
        </div>
      ) : (
        <div className="komise-hist-bars">
          {rows.map((d) => (
            <button key={d.id} className="komise-hist-row" onClick={() => navigate(`/x/${specId}/${d.id}`)} title={d.title}>
              <span className="komise-hist-fill" style={{ width: `${(100 * d.count) / max}%` }} />
              <span className="komise-hist-n">{String(d.n).padStart(2, "0")}</span>
              <span className="komise-hist-label">{d.title}</span>
              <span className="komise-hist-count">{d.count}×</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

/* Who asked this single okruh. Global by default; toggle to your commission only.
 * Board members are highlighted even in the global view. */
export function ExamTopicAskedBy({ topic }) {
  const k = useKomise();
  const [scope, setScope] = useState("global");
  useEffect(() => { if (k) k.ensureLoaded(); }, [k]);

  if (!k || !k.index) return null;
  const { members, total, boardTotal } = whoAsked(k.index, topic, k.board);
  if (total === 0) return null; // nobody on record asked this → nothing to show

  const hasBoard = k.board.length > 0;
  const shown = scope === "board" ? members.filter((m) => m.mine) : members;

  return (
    <section className="komise-asked">
      <div className="komise-asked-head">
        <span className="komise-asked-title">
          Kdo se na tohle ptal
          <span className="komise-asked-total">{scope === "board" ? boardTotal : total}×</span>
        </span>
        {hasBoard && <ScopeToggle scope={scope} setScope={setScope} />}
      </div>
      {shown.length === 0 ? (
        <div className="komise-muted">Z tvé komise se na tohle zatím nikdo neptal.</div>
      ) : (
        <div className="komise-asked-list">
          {shown.map((m) => (
            <span key={m.key} className="komise-asked-chip" data-mine={m.mine} title={m.mine ? "Ve tvé komisi" : undefined}>
              {m.display}
              <span className="komise-asked-n">{m.count}×</span>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
