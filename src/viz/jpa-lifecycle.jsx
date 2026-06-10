// JPA entity lifecycle — interaktivní state machine.
// Klikni na operaci a sleduj přechod entity mezi stavy new/managed/detached/removed,
// včetně stavu DB a SQL, který by JPA vygeneroval při commitu.
import { useState } from "react";

const STATES = {
  none: { label: "—", desc: "Žádná entita neexistuje. Začni s `new Person()` nebo `em.find()`." },
  newState: { label: "new (transient)", desc: "Objekt v paměti, JPA o něm neví. ID je 0 nebo null." },
  managed: { label: "managed", desc: "Entita v persistenčním kontextu. JPA sleduje změny (dirty checking). Při commitu se zapíšou do DB." },
  detached: { label: "detached", desc: "Entita má ID, ale persistenční kontext skončil nebo byla explicitně odpojena. Změny se NEpromítají." },
  removed: { label: "removed", desc: "Označena ke smazání. Při commitu se vykoná DELETE." },
};

// Definice operací: jejich efekt podle aktuálního stavu
const OPERATIONS = [
  {
    id: "new",
    label: "new Person()",
    desc: "Vytvoř novou instanci v paměti",
    apply: (s) => {
      if (s.entityState !== "none") return { error: "Entita už existuje. Resetuj prvně." };
      return {
        entityState: "newState",
        entityId: null,
        entityName: "Karel",
        pendingSQL: [],
      };
    },
  },
  {
    id: "find",
    label: "em.find(Person.class, 42)",
    desc: "Načti existující z DB",
    apply: (s) => {
      if (s.entityState === "managed") return { error: "Entita s ID 42 už je v kontextu — vrátí se stejná instance." };
      return {
        entityState: "managed",
        entityId: 42,
        entityName: "Karel",
        dbHas42: true,
        sqlLog: [...s.sqlLog, "SELECT * FROM person WHERE id = 42"],
        pendingSQL: [],
      };
    },
  },
  {
    id: "persist",
    label: "em.persist(p)",
    desc: "Označ jako novou — INSERT při commitu",
    apply: (s) => {
      if (s.entityState !== "newState") return { error: `persist() vyžaduje stav 'new', je '${STATES[s.entityState].label}'.` };
      return {
        entityState: "managed",
        entityId: 42,
        pendingSQL: [`INSERT INTO person (id, name) VALUES (42, '${s.entityName}')`],
      };
    },
  },
  {
    id: "setName",
    label: "p.setName(\"Karel M.\")",
    desc: "Změň atribut — JPA dirty-check zjistí",
    apply: (s) => {
      if (s.entityState === "managed") {
        return {
          entityName: "Karel M.",
          pendingSQL: [...s.pendingSQL.filter((q) => !q.startsWith("UPDATE")),
            `UPDATE person SET name = 'Karel M.' WHERE id = ${s.entityId}`],
        };
      }
      if (s.entityState === "detached" || s.entityState === "newState") {
        return { entityName: "Karel M." }; // změna se ztratí, JPA nesleduje
      }
      return { error: `Nelze měnit v stavu '${STATES[s.entityState].label}'.` };
    },
  },
  {
    id: "remove",
    label: "em.remove(p)",
    desc: "Označ ke smazání — DELETE při commitu",
    apply: (s) => {
      if (s.entityState !== "managed") return { error: `remove() vyžaduje 'managed', je '${STATES[s.entityState].label}'.` };
      return {
        entityState: "removed",
        pendingSQL: [`DELETE FROM person WHERE id = ${s.entityId}`],
      };
    },
  },
  {
    id: "merge",
    label: "em.merge(p)",
    desc: "Z detached zpět do kontextu",
    apply: (s) => {
      if (s.entityState !== "detached") return { error: `merge() je hlavně pro 'detached', je '${STATES[s.entityState].label}'.` };
      return {
        entityState: "managed",
        pendingSQL: [`UPDATE person SET name = '${s.entityName}' WHERE id = ${s.entityId}`],
      };
    },
  },
  {
    id: "detach",
    label: "em.detach(p)",
    desc: "Odpoj z persistenčního kontextu",
    apply: (s) => {
      if (s.entityState !== "managed") return { error: `detach() vyžaduje 'managed', je '${STATES[s.entityState].label}'.` };
      return {
        entityState: "detached",
        pendingSQL: [], // pending změny se zahodí
      };
    },
  },
  {
    id: "commit",
    label: "tx.commit()",
    desc: "Zapsat všechny pending změny do DB",
    apply: (s) => {
      const newLog = [...s.sqlLog, ...s.pendingSQL];
      let dbHas42 = s.dbHas42;
      // aplikuj pending SQL
      for (const q of s.pendingSQL) {
        if (q.startsWith("INSERT")) dbHas42 = true;
        if (q.startsWith("DELETE")) dbHas42 = false;
      }
      // po commitu se 'removed' entita "ztratí"
      let entityState = s.entityState;
      if (s.entityState === "removed") entityState = "detached"; // existuje v paměti, ale ne v DB
      return {
        entityState,
        sqlLog: newLog,
        pendingSQL: [],
        dbHas42,
        committed: true,
      };
    },
  },
];

const INITIAL = {
  entityState: "none",
  entityId: null,
  entityName: null,
  dbHas42: true,    // simulujeme, že v DB existuje záznam s ID 42
  sqlLog: [],
  pendingSQL: [],
  message: null,
};

export default function JpaLifecycle() {
  const [s, setS] = useState(INITIAL);

  const run = (op) => {
    const result = op.apply(s);
    if (result.error) {
      setS({ ...s, message: { kind: "error", text: result.error } });
      return;
    }
    setS({ ...s, ...result, message: { kind: "ok", text: `${op.label} — ${op.desc}` } });
  };

  const reset = () => setS(INITIAL);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* State machine diagram */}
      <svg viewBox="0 0 540 180" style={{ width: "100%", maxWidth: 540 }}>
        <rect width="540" height="180" fill="var(--bg-inset)" />
        {/* States */}
        {[
          { id: "newState", label: "new", x: 70, y: 50, color: 264 },
          { id: "managed", label: "managed", x: 250, y: 50, color: 142 },
          { id: "detached", label: "detached", x: 430, y: 50, color: 22 },
          { id: "removed", label: "removed", x: 250, y: 130, color: 340 },
        ].map((st) => {
          const active = s.entityState === st.id;
          return (
            <g key={st.id}>
              <rect x={st.x - 55} y={st.y - 18} width="110" height="36" rx="6"
                fill={active ? `oklch(0.62 0.14 ${st.color} / 0.40)` : `oklch(0.62 0.14 ${st.color} / 0.10)`}
                stroke={`oklch(0.62 0.14 ${st.color})`}
                strokeWidth={active ? "2" : "1"} />
              <text x={st.x} y={st.y + 4} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--text)">
                {st.label}
              </text>
            </g>
          );
        })}
        {/* Transitions */}
        <defs>
          <marker id="jla" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)" />
          </marker>
        </defs>
        {/* new → managed (persist) */}
        <path d="M 125,42 L 195,42" stroke="var(--text-muted)" markerEnd="url(#jla)" fill="none" />
        <text x="160" y="35" textAnchor="middle" fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">persist()</text>
        {/* managed → detached (detach) */}
        <path d="M 305,42 L 375,42" stroke="var(--text-muted)" markerEnd="url(#jla)" fill="none" />
        <text x="340" y="35" textAnchor="middle" fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">detach()</text>
        {/* detached → managed (merge) */}
        <path d="M 375,58 L 305,58" stroke="var(--text-muted)" markerEnd="url(#jla)" fill="none" />
        <text x="340" y="70" textAnchor="middle" fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">merge()</text>
        {/* managed → removed (remove) */}
        <path d="M 250,68 L 250,110" stroke="var(--text-muted)" markerEnd="url(#jla)" fill="none" />
        <text x="290" y="92" fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">remove()</text>
        {/* find: ?  → managed */}
        <text x="195" y="22" fontSize="10" fill="var(--text-faint)" fontFamily="var(--font-mono)" fontStyle="italic">
          find() vrací rovnou managed
        </text>
      </svg>

      {/* Operations */}
      <div className="viz-controls">
        {OPERATIONS.map((op) => (
          <button key={op.id} className="viz-btn" onClick={() => run(op)} title={op.desc}>
            {op.label}
          </button>
        ))}
        <button className="viz-btn" onClick={reset} style={{ background: "oklch(0.55 0.18 22 / 0.15)", marginLeft: "auto" }}>
          ↺ reset
        </button>
      </div>

      {/* Message */}
      {s.message && (
        <div style={{
          fontSize: 12, padding: "6px 10px", borderRadius: 4,
          background: s.message.kind === "error" ? "oklch(0.62 0.18 22 / 0.10)" : "oklch(0.62 0.14 142 / 0.10)",
          color: s.message.kind === "error" ? "oklch(0.40 0.18 22)" : "oklch(0.30 0.14 142)",
          border: `1px solid ${s.message.kind === "error" ? "oklch(0.55 0.18 22)" : "oklch(0.55 0.14 142)"}`,
          fontFamily: "var(--font-mono)",
        }}>
          {s.message.text}
        </div>
      )}

      {/* Status grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
        <div style={panelStyle}>
          <div style={panelHeadStyle}>Entita v paměti</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--text)" }}>
            {s.entityState === "none" ? (
              <span style={{ color: "var(--text-faint)" }}>—</span>
            ) : (
              <>
                <div>state: <span style={{ color: "oklch(0.40 0.14 142)", fontWeight: 600 }}>{STATES[s.entityState].label}</span></div>
                <div>id: {s.entityId === null ? "null" : s.entityId}</div>
                <div>name: {s.entityName ? `"${s.entityName}"` : "null"}</div>
              </>
            )}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontStyle: "italic", lineHeight: 1.4 }}>
            {STATES[s.entityState].desc}
          </div>
        </div>
        <div style={panelStyle}>
          <div style={panelHeadStyle}>Databáze (po commitu)</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
            {s.dbHas42 ? (
              <>
                <div style={{ color: "var(--text)" }}>id=42, name="{s.entityState === "managed" || s.entityState === "removed" ? s.entityName : "Karel"}"</div>
              </>
            ) : (
              <span style={{ color: "var(--text-faint)" }}>(řádek s id=42 neexistuje)</span>
            )}
          </div>
        </div>
      </div>

      {/* Pending SQL */}
      <div style={panelStyle}>
        <div style={panelHeadStyle}>Pending SQL (vykoná se při commitu)</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "oklch(0.55 0.18 65)" }}>
          {s.pendingSQL.length === 0 ? (
            <span style={{ color: "var(--text-faint)" }}>—</span>
          ) : (
            s.pendingSQL.map((q, i) => <div key={i}>{q};</div>)
          )}
        </div>
      </div>

      {/* SQL Log */}
      <div style={panelStyle}>
        <div style={panelHeadStyle}>SQL log (provedené)</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", maxHeight: 100, overflowY: "auto" }}>
          {s.sqlLog.length === 0 ? (
            <span style={{ color: "var(--text-faint)" }}>—</span>
          ) : (
            s.sqlLog.map((q, i) => <div key={i}>{q};</div>)
          )}
        </div>
      </div>
    </div>
  );
}

const panelStyle = {
  padding: 10,
  background: "var(--bg-inset)",
  borderRadius: 6,
  border: "1px solid var(--line)",
};
const panelHeadStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: 6,
};
