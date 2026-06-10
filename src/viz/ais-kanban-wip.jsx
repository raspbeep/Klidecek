// Kanban tabule s WIP limitem na sloupci "Rozpracováno".
// Posuneš úkol doprava klikem; když je In Progress plné (limit), nelze začít nový.
// Posuvník mění WIP limit. Ukazuje, jak limit tlačí na dokončování (pull, ne push).
import { useState } from "react";

const COLS = [
  { id: "todo", label: "To Do", hue: 264 },
  { id: "doing", label: "Rozpracováno", hue: 65 },
  { id: "done", label: "Hotovo", hue: 142 },
];

const INITIAL = [
  { id: "A", col: "todo" },
  { id: "B", col: "todo" },
  { id: "C", col: "todo" },
  { id: "D", col: "todo" },
  { id: "E", col: "todo" },
];

const W = 360, H = 220;
const COL_W = 110, COL_X = [12, 126, 240];
const CARD_W = 92, CARD_H = 22;

export default function KanbanWip() {
  const [cards, setCards] = useState(INITIAL);
  const [wip, setWip] = useState(3);
  const [msg, setMsg] = useState("Klikni na úkol v To Do nebo Rozpracováno a posuň ho doprava.");

  const doingCount = cards.filter((c) => c.col === "doing").length;

  const advance = (id) => {
    const card = cards.find((c) => c.id === id);
    if (!card || card.col === "done") return;
    if (card.col === "todo") {
      if (doingCount >= wip) {
        setMsg(`⛔ WIP limit ${wip} dosažen v „Rozpracováno". Nejdřív dokonči rozdělaný úkol — pak začni nový.`);
        return;
      }
      setMsg(`Úkol ${id}: To Do → Rozpracováno.`);
      setCards(cards.map((c) => (c.id === id ? { ...c, col: "doing" } : c)));
      return;
    }
    if (card.col === "doing") {
      setMsg(`✓ Úkol ${id} dokončen → Hotovo. Uvolnilo se místo v „Rozpracováno".`);
      setCards(cards.map((c) => (c.id === id ? { ...c, col: "done" } : c)));
    }
  };

  const reset = () => {
    setCards(INITIAL);
    setMsg("Reset. Klikni na úkol a posuň ho doprava.");
  };

  const full = doingCount >= wip;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />
        {COLS.map((col, ci) => {
          const x = COL_X[ci];
          const isDoing = col.id === "doing";
          const colCards = cards.filter((c) => c.col === col.id);
          return (
            <g key={col.id}>
              <rect
                x={x} y={34} width={COL_W} height={H - 46} rx="5"
                fill="var(--bg-card)"
                stroke={isDoing && full ? "oklch(0.6 0.18 22)" : "var(--line)"}
                strokeWidth={isDoing && full ? "1.6" : "1"}
              />
              <text x={x + COL_W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">
                {col.label}
              </text>
              {isDoing && (
                <text
                  x={x + COL_W / 2} y={31} textAnchor="middle" fontSize="9"
                  fontFamily="var(--font-mono)"
                  fill={full ? "oklch(0.55 0.18 22)" : "var(--text-muted)"}
                >
                  WIP {doingCount}/{wip}
                </text>
              )}
              {colCards.map((c, k) => (
                <g
                  key={c.id}
                  onClick={() => advance(c.id)}
                  style={{ cursor: col.id === "done" ? "default" : "pointer" }}
                >
                  <rect
                    x={x + (COL_W - CARD_W) / 2}
                    y={44 + k * (CARD_H + 6)}
                    width={CARD_W}
                    height={CARD_H}
                    rx="3"
                    fill={`oklch(0.62 0.14 ${col.hue} / 0.22)`}
                    stroke={`oklch(0.6 0.14 ${col.hue})`}
                  />
                  <text
                    x={x + COL_W / 2}
                    y={44 + k * (CARD_H + 6) + 15}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontFamily="var(--font-mono)"
                    fill="var(--text)"
                  >
                    úkol {c.id}
                  </text>
                </g>
              ))}
            </g>
          );
        })}
      </svg>

      <div className="viz-controls">
        <span className="viz-readout">WIP limit:</span>
        <input type="range" className="viz-slider" min={1} max={5} value={wip} onChange={(e) => { setWip(+e.target.value); }} style={{ flex: 1 }} />
        <span className="viz-readout" style={{ color: "var(--text)", fontWeight: 600 }}>{wip}</span>
        <button
          className="viz-btn"
          onClick={reset}
        >
          ↺ reset
        </button>
      </div>

      <div
        style={{
          fontSize: 12, padding: "6px 10px", borderRadius: 4, lineHeight: 1.4,
          background: full ? "oklch(0.62 0.18 22 / 0.10)" : "var(--bg-card)",
          color: full ? "oklch(0.42 0.18 22)" : "var(--text-muted)",
          border: `1px solid ${full ? "oklch(0.55 0.18 22)" : "var(--line)"}`,
        }}
      >
        {msg}
      </div>
    </div>
  );
}
