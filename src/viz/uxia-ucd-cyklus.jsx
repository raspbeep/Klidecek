// Iterativní cyklus návrhu zaměřeného na uživatele podle ISO 9241-210.
// Stepper provází čtyřmi aktivitami + plánováním; po evaluaci buď cyklus
// uzavře (cíle splněny), nebo se vrací zpět do dřívější aktivity.
import { useState } from "react";

// uzly rozmístěné po obvodu cyklu (4 aktivity) + plánování nahoře
const NODES = [
  { id: "plan", label: "Plánování", sub: "cíle, role, kritéria", x: 230, y: 28, hue: 264 },
  { id: "context", label: "Kontext použití", sub: "kdo, úkoly, prostředí", x: 392, y: 112, hue: 200 },
  { id: "reqs", label: "Požadavky", sub: "testovatelné požadavky", x: 312, y: 214, hue: 142 },
  { id: "design", label: "Designová řešení", sub: "skici → prototypy", x: 148, y: 214, hue: 80 },
  { id: "eval", label: "Evaluace", sub: "test proti požadavkům", x: 68, y: 112, hue: 22 },
];

// kroky: dorazíme do uzlu, případně se vrátíme zpět (iterace)
const STEPS = [
  { node: "plan", from: null, detail: "Schůzky se zúčastněnými stranami (stakeholdery). Definují se cíle projektu, role, rozpočet a kritéria úspěchu — jakou roli bude hrát použitelnost a jak se UCD aktivity zařadí do vývoje." },
  { node: "context", from: "plan", detail: "Pochopení a popis kontextu použití. Zjišťuje se, kdo jsou uživatelé, jaké úkoly plní, v jakém prostředí a s jakými omezeními. Metody: stínování, pozorování v terénu, rozhovory." },
  { node: "reqs", from: "context", detail: "Data z kontextu se převedou na formální, inženýrsky testovatelné požadavky na uživatele a organizaci — funkce a formy interakce, které jsou potřeba." },
  { node: "design", from: "reqs", detail: "Tvorba designových řešení: koncepty, scénáře a prototypy od papírových skic (low-fidelity) po plně funkční modely (high-fidelity)." },
  { node: "eval", from: "design", detail: "Evaluace návrhu proti specifikovaným požadavkům. Klíčový rozhodovací bod: splňuje návrh cíle použitelnosti?" },
  { node: "context", from: "eval", iterate: true, detail: "Cíle ZATÍM nesplněny → cyklus se vrací zpět (typicky ke kontextu nebo požadavkům) a návrh se zpřesňuje. Toto je podstata iterativnosti — opakuje se, dokud řešení nevyhoví." },
  { node: "design", from: "context", detail: "Druhá iterace: zpřesněné prototypy na základě poznatků z evaluace." },
  { node: "eval", from: "design", done: true, detail: "Evaluace podruhé: cíle SPLNĚNY. Cyklus se uzavírá, návrh je připraven k nasazení." },
];

export default function UxiaUcdCyklus() {
  const [step, setStep] = useState(0);
  const cur = STEPS[step];
  const active = cur.node;
  const visited = new Set(STEPS.slice(0, step + 1).map((s) => s.node));

  const node = (id) => NODES.find((n) => n.id === id);
  const a = node(active);
  const f = cur.from ? node(cur.from) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button className="btn ghost" style={btn} onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← zpět</button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          krok {step + 1} / {STEPS.length}{cur.iterate ? "  ·  iterace" : ""}
        </div>
        <button className="btn ghost" style={btn} onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1}>další →</button>
      </div>

      <svg viewBox="0 0 460 250" style={{ width: "100%", maxWidth: 520 }}>
        <rect width="460" height="250" fill="var(--bg-inset)" />

        {/* obvodový tok mezi 4 aktivitami (context→reqs→design→eval→context) */}
        {[["context", "reqs"], ["reqs", "design"], ["design", "eval"], ["eval", "context"]].map(([p, q], i) => {
          const A = node(p), B = node(q);
          return (
            <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
              stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="3 4" />
          );
        })}
        {/* plánování → kontext (vstup do cyklu) */}
        <line x1={node("plan").x} y1={node("plan").y} x2={node("context").x} y2={node("context").y}
          stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="3 4" />

        {/* aktivní přechod zvýrazněný */}
        {f && (
          <line x1={f.x} y1={f.y} x2={a.x} y2={a.y}
            stroke={cur.iterate ? "oklch(0.6 0.18 22)" : `oklch(0.6 0.16 ${a.hue})`}
            strokeWidth="2.4" markerEnd="url(#ucdArr)" />
        )}

        {NODES.map((n) => {
          const isActive = n.id === active;
          const seen = visited.has(n.id);
          const fill = isActive
            ? `oklch(0.62 0.15 ${n.hue} / 0.30)`
            : seen ? `oklch(0.62 0.15 ${n.hue} / 0.12)` : "var(--bg-card)";
          const stroke = isActive ? `oklch(0.58 0.16 ${n.hue})` : "var(--line)";
          return (
            <g key={n.id}>
              <rect x={n.x - 62} y={n.y - 22} width="124" height="44" rx="8"
                fill={fill} stroke={stroke} strokeWidth={isActive ? 2 : 1} />
              <text x={n.x} y={n.y - 3} textAnchor="middle" fontSize="12" fontWeight="600"
                fill="var(--text)">{n.label}</text>
              <text x={n.x} y={n.y + 12} textAnchor="middle" fontSize="9"
                fill="var(--text-muted)">{n.sub}</text>
            </g>
          );
        })}

        {/* rozhodovací značka u evaluace */}
        <text x={node("eval").x} y={node("eval").y + 40} textAnchor="middle" fontSize="9"
          fontFamily="var(--font-mono)" fill="var(--text-faint)">cíle splněny?</text>

        <defs>
          <marker id="ucdArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
          </marker>
        </defs>
      </svg>

      <div style={{
        padding: 10, borderRadius: 6,
        background: cur.done ? "oklch(0.62 0.15 142 / 0.12)" : cur.iterate ? "oklch(0.6 0.18 22 / 0.10)" : "var(--bg-card)",
        border: `1px solid ${cur.done ? "oklch(0.58 0.16 142)" : cur.iterate ? "oklch(0.6 0.18 22 / 0.5)" : "var(--line)"}`,
      }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>
          {node(active).label}{cur.done ? "  ✓ hotovo" : cur.iterate ? "  ↺ návrat" : ""}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{cur.detail}</div>
      </div>
    </div>
  );
}

const btn = {
  padding: "5px 12px",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 4,
  cursor: "pointer",
};
