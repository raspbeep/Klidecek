// N+1 problem demonstrator pro JPA.
// Načti seznam zákazníků, pak rozbal jejich objednávky. Sleduj, kolik SQL
// se odpálí v různých režimech (LAZY, EAGER, JOIN FETCH).
import { useState } from "react";

const CUSTOMERS = [
  { id: 1, name: "Alice",   orders: [{ id: 101, item: "kniha" }, { id: 102, item: "tužka" }] },
  { id: 2, name: "Bob",     orders: [{ id: 103, item: "lampa" }] },
  { id: 3, name: "Carol",   orders: [{ id: 104, item: "stůl" }, { id: 105, item: "židle" }, { id: 106, item: "polštář" }] },
  { id: 4, name: "Dave",    orders: [] },
  { id: 5, name: "Erin",    orders: [{ id: 107, item: "monitor" }] },
];

const MODES = [
  {
    id: "lazy",
    label: "LAZY (default 1:N)",
    desc: "@OneToMany default. Načte se jen Customer; .getOrders() pak fire-and-forget další SELECT per zákazníka. Klasický N+1!",
  },
  {
    id: "eager",
    label: "EAGER",
    desc: "@OneToMany(fetch=EAGER). JPA může implementovat několika způsoby — Hibernate často udělá N+1 SELECTů ihned při původním dotazu. EAGER nic neřeší, jen schová N+1.",
  },
  {
    id: "joinfetch",
    label: "JOIN FETCH (řešení)",
    desc: "JPQL: SELECT c FROM Customer c LEFT JOIN FETCH c.orders. Jeden SELECT s LEFT JOIN. Žádný N+1, žádný lazy init exception.",
  },
];

export default function JpaNplus1() {
  const [mode, setMode] = useState("lazy");
  const [step, setStep] = useState(0);
  // step 0 = initial, 1 = customers loaded, 2 = accessing orders, 3 = all rendered
  const [accessed, setAccessed] = useState(new Set());

  const reset = () => { setStep(0); setAccessed(new Set()); };
  const handleModeChange = (m) => { setMode(m); reset(); };

  // Sestavíme log SQL podle režimu a kroku
  const sqlLog = [];

  if (step >= 1) {
    if (mode === "joinfetch") {
      sqlLog.push({
        sql: "SELECT c.*, o.* FROM customer c LEFT JOIN orders o ON o.customer_id = c.id",
        kind: "ok",
        note: "jeden JOIN — vše najednou",
      });
    } else if (mode === "eager") {
      sqlLog.push({
        sql: "SELECT * FROM customer",
        kind: "warn",
        note: "krok 1 — najdi zákazníky",
      });
      // Hibernate eager: ihned dělá N+1 SELECTů per zákazník
      CUSTOMERS.forEach((c) => {
        sqlLog.push({
          sql: `SELECT * FROM orders WHERE customer_id = ${c.id}`,
          kind: "warn",
          note: `eager fetch pro Customer ${c.id} (skrytý N+1)`,
        });
      });
    } else {
      sqlLog.push({ sql: "SELECT * FROM customer", kind: "ok", note: "krok 1 — najdi zákazníky" });
    }
  }
  if (mode === "lazy" && step >= 2) {
    accessed.forEach((cid) => {
      sqlLog.push({
        sql: `SELECT * FROM orders WHERE customer_id = ${cid}`,
        kind: "warn",
        note: `+1 fetch při .getOrders() na Customer ${cid}`,
      });
    });
  }

  const accessAll = () => {
    setStep(2);
    setAccessed(new Set(CUSTOMERS.map((c) => c.id)));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Mode picker */}
      <div className="viz-controls">
        {MODES.map((m) => (
          <button key={m.id} onClick={() => handleModeChange(m.id)} className="viz-btn"
            data-active={mode === m.id}>
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12.5, color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5 }}>
        {MODES.find((m) => m.id === mode).desc}
      </div>

      {/* Actions */}
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(step, 1))} disabled={step >= 1}>
          1. <code>findAll(Customer)</code>
        </button>
        {mode === "lazy" && (
          <button className="viz-btn" onClick={accessAll} disabled={step < 1 || (mode === "lazy" && accessed.size === CUSTOMERS.length)}>
            2. Pro každého zákazníka volej <code>.getOrders()</code>
          </button>
        )}
        <button className="viz-btn" onClick={reset} style={{ background: "oklch(0.55 0.18 22 / 0.10)", marginLeft: "auto" }}>
          ↺ reset
        </button>
      </div>

      {/* Customer list with orders */}
      <div style={{ ...panelStyle }}>
        <div style={panelHeadStyle}>UI render: seznam zákazníků a jejich objednávky</div>
        {step < 1 ? (
          <div style={{ color: "var(--text-faint)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
            (žádná data — klikni „findAll(Customer)" výše)
          </div>
        ) : (
          <div style={{ fontSize: 12 }}>
            {CUSTOMERS.map((c) => {
              const ordersVisible = mode === "joinfetch" || mode === "eager" || accessed.has(c.id);
              return (
                <div key={c.id} style={{
                  padding: "4px 8px",
                  borderLeft: `3px solid oklch(0.62 0.14 ${ordersVisible ? "142" : "22"})`,
                  margin: "2px 0",
                  background: ordersVisible ? "transparent" : "oklch(0.62 0.14 22 / 0.05)",
                }}>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>{" "}
                  <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>(id={c.id})</span>
                  {mode === "lazy" && !accessed.has(c.id) ? (
                    <>
                      <span style={{ color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginLeft: 8 }}>
                        ↳ orders: <em>not loaded (lazy proxy)</em>
                      </span>
                      <button className="viz-btn" onClick={() => setAccessed(new Set([...accessed, c.id]))}
                        style={{ marginLeft: 8, padding: "2px 8px", fontSize: 10, background: "oklch(0.55 0.18 264 / 0.15)", borderColor: "oklch(0.55 0.18 264)", color: "oklch(0.40 0.18 264)" }}>
                        načti
                      </button>
                    </>
                  ) : (
                    <span style={{ color: "var(--text)", fontFamily: "var(--font-mono)", marginLeft: 8 }}>
                      ↳ {c.orders.length === 0 ? <em style={{ color: "var(--text-faint)" }}>(žádné)</em> : c.orders.map((o) => o.item).join(", ")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SQL log + counter */}
      <div style={panelStyle}>
        <div style={{
          ...panelHeadStyle,
          display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8,
        }}>
          <span>Vygenerované SQL dotazy</span>
          <span style={{
            padding: "2px 8px", borderRadius: 12,
            background: sqlLog.length > 2 ? "oklch(0.62 0.18 22 / 0.20)" : "oklch(0.62 0.14 142 / 0.15)",
            color: sqlLog.length > 2 ? "oklch(0.40 0.18 22)" : "oklch(0.30 0.14 142)",
            fontFamily: "var(--font-mono)",
            fontSize: 12, fontWeight: 600,
          }}>
            {sqlLog.length} {sqlLog.length === 1 ? "dotaz" : sqlLog.length < 5 ? "dotazy" : "dotazů"}
          </span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.55 }}>
          {sqlLog.length === 0 ? (
            <span style={{ color: "var(--text-faint)" }}>—</span>
          ) : (
            sqlLog.map((q, i) => (
              <div key={i} style={{
                padding: "2px 6px", margin: "2px 0",
                background: q.kind === "warn" ? "oklch(0.62 0.18 22 / 0.08)" : "oklch(0.62 0.14 142 / 0.08)",
                borderLeft: `2px solid oklch(0.62 ${q.kind === "warn" ? "0.18 22" : "0.14 142"})`,
                color: "var(--text)",
              }}>
                <div>{q.sql};</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, fontStyle: "italic" }}>
                  {q.note}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {mode === "lazy" && step >= 2 && (
        <div style={{
          padding: 10, borderRadius: 6,
          background: "oklch(0.62 0.18 22 / 0.08)",
          border: "1px solid oklch(0.55 0.18 22)",
          fontSize: 12, color: "var(--text)",
        }}>
          <strong style={{ color: "oklch(0.40 0.18 22)" }}>N+1 problém:</strong>{" "}
          1 dotaz na zákazníky + {CUSTOMERS.length} dalších dotazů na jejich objednávky. Při 1000 zákaznících budete mít 1001 dotazů místo 1.
          <br />Řešení: přepni výše na <strong>JOIN FETCH</strong> — uvidíš 1 dotaz.
        </div>
      )}
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
