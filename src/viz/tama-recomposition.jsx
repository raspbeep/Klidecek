// tama-recomposition — recomposition v deklarativním UI (Jetpack Compose / SwiftUI).
// Měníš stav a sleduješ, které části UI stromu se přepočítají (recompose) a které
// framework přeskočí, protože jejich vstupy se nezměnily. To je jádro deklarativního modelu.
import { useState } from "react";

// Stromová UI hierarchie: Column { Header(title), Counter(count), Footer(static) }
// Header závisí na `title`, Counter na `count`, Footer na ničem.
export default function TamaRecomposition() {
  const [count, setCount] = useState(0);
  const [title, setTitle] = useState("Profil");
  const [flash, setFlash] = useState({}); // které uzly právě „blikly" jako recomposed

  function recompose(changed) {
    // změnil se jen jeden vstup → přepočítá se kořen a uzly, jejichž vstup se změnil
    const nodes = { root: true };
    if (changed === "count") nodes.counter = true;
    if (changed === "title") nodes.header = true;
    setFlash(nodes);
    setTimeout(() => setFlash({}), 600);
  }

  const NODES = [
    { id: "root", x: 60, y: 30, w: 380, label: "Column { … }", dep: "kontejner (recompose vždy)" },
    { id: "header", x: 80, y: 80, w: 150, label: "Header(title)", dep: "závisí na title" },
    { id: "counter", x: 250, y: 80, w: 150, label: "Counter(count)", dep: "závisí na count" },
    { id: "footer", x: 165, y: 140, w: 160, label: "Footer()", dep: "bez vstupů → skip" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={() => { setCount((c) => c + 1); recompose("count"); }} style={btn}>count++</button>
        <button onClick={() => { setTitle((t) => (t === "Profil" ? "Nastavení" : "Profil")); recompose("title"); }} style={btn}>změnit title</button>
        <span style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "ui-monospace, monospace" }}>
          state: count={count}, title="{title}"
        </span>
      </div>

      <svg viewBox="0 0 500 190" style={{ width: "100%", maxWidth: 520, background: "var(--bg-inset)", borderRadius: 4 }}>
        {/* hrany stromu */}
        <line x1={250} y1={48} x2={155} y2={80} stroke="var(--line)" strokeWidth="1" />
        <line x1={250} y1={48} x2={325} y2={80} stroke="var(--line)" strokeWidth="1" />
        <line x1={250} y1={48} x2={245} y2={140} stroke="var(--line)" strokeWidth="1" />

        {NODES.map((n) => {
          const lit = flash[n.id];
          const skipped = Object.keys(flash).length > 0 && !lit;
          return (
            <g key={n.id}>
              <rect x={n.x} y={n.y} width={n.w} height={n.id === "root" ? 30 : 42} rx={6}
                fill={lit ? "var(--accent)" : "var(--bg-card)"}
                stroke={lit ? "var(--accent)" : "var(--line-strong)"} strokeWidth="1.4"
                opacity={skipped ? 0.4 : 1}
                style={{ transition: "fill 0.2s, opacity 0.2s" }} />
              <text x={n.x + n.w / 2} y={n.y + (n.id === "root" ? 19 : 18)} textAnchor="middle"
                fontSize="11.5" fontWeight="700" fill={lit ? "white" : "var(--text)"}
                fontFamily="ui-monospace, monospace" opacity={skipped ? 0.5 : 1}>{n.label}</text>
              {n.id !== "root" && (
                <text x={n.x + n.w / 2} y={n.y + 34} textAnchor="middle" fontSize="8.5"
                  fill={lit ? "white" : "var(--text-muted)"} opacity={skipped ? 0.5 : 1}>{n.dep}</text>
              )}
            </g>
          );
        })}
      </svg>

      <div style={{ padding: 8, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        Změna jednoho stavu přepočítá jen ty <strong style={{ color: "var(--text)" }}>composable funkce, jejichž vstup se změnil</strong>.
        Uzly se stejnými vstupy framework <strong style={{ color: "var(--text)" }}>přeskočí</strong> (slabší = skip) — nemusíš ručně volat settery na konkrétní view.
      </div>
    </div>
  );
}

const btn = {
  background: "var(--bg-inset)",
  color: "var(--text)",
  border: "1px solid var(--line)",
  padding: "4px 12px",
  borderRadius: 4,
  fontSize: 12,
  fontFamily: "ui-monospace, monospace",
  cursor: "pointer",
};
