// CRC karty (Class–Responsibilities–Collaborators) — průchod objednávkovým
// scénářem e-shopu. Pro každou třídu ukáže knowing/doing zodpovědnosti
// a kolaboranty; zvýrazní právě aktivní kartu a kolaborační šipku.
import { useState } from "react";

const CARDS = [
  {
    id: "OrderController",
    role: "Controller / Interfacer",
    color: 264,
    know: ["nic doménového – jen vstupní data"],
    do: ["přijme HTTP požadavek", "deleguje na OrderService"],
    collab: ["OrderService"],
  },
  {
    id: "OrderService",
    role: "Koordinátor / Service provider",
    color: 200,
    know: ["pravidla vytvoření objednávky"],
    do: ["vytvoří Order", "spustí platbu", "uloží objednávku"],
    collab: ["Order", "PaymentService", "OrderRepository"],
  },
  {
    id: "Order",
    role: "Information holder / Creator",
    color: 142,
    know: ["své položky (OrderLine)", "stav objednávky"],
    do: ["vytvoří OrderLine", "spočítá celkovou cenu"],
    collab: ["OrderLine"],
  },
  {
    id: "OrderLine",
    role: "Information holder",
    color: 100,
    know: ["produkt a počet kusů"],
    do: ["spočítá mezisoučet"],
    collab: ["Product"],
  },
  {
    id: "OrderRepository",
    role: "Pure Fabrication",
    color: 22,
    know: ["mapování na databázi"],
    do: ["uloží / načte objednávku"],
    collab: ["(databáze)"],
  },
];

export default function AisCrcCard() {
  const [idx, setIdx] = useState(0);
  const card = CARDS[idx];
  const accent = `oklch(0.62 0.14 ${card.color})`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* picker */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {CARDS.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setIdx(i)}
            style={{
              padding: "4px 9px",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              borderRadius: 5,
              border: `1px solid ${i === idx ? `oklch(0.62 0.14 ${c.color})` : "var(--line)"}`,
              background: i === idx ? `oklch(0.62 0.14 ${c.color} / 0.16)` : "var(--bg-card)",
              color: i === idx ? `oklch(0.45 0.14 ${c.color})` : "var(--text-muted)",
              fontWeight: i === idx ? 600 : 400,
            }}
          >
            {c.id}
          </button>
        ))}
      </div>

      {/* the card */}
      <div style={{ border: `1.5px solid ${accent}`, borderRadius: 10, overflow: "hidden", background: "var(--bg-card)" }}>
        <div style={{ padding: "8px 12px", background: `oklch(0.62 0.14 ${card.color} / 0.14)`, borderBottom: `1px solid ${accent}` }}>
          <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14, color: accent }}>{card.id}</div>
          <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 1 }}>role: {card.role}</div>
        </div>
        <div style={{ display: "flex", minHeight: 120 }}>
          <div style={{ flex: 1.4, padding: "8px 12px", borderRight: "1px solid var(--line)" }}>
            <div style={lbl}>Responsibilities</div>
            <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", margin: "4px 0 2px" }}>knowing</div>
            <ul style={ul}>{card.know.map((k) => <li key={k} style={li}>{k}</li>)}</ul>
            <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--font-mono)", margin: "6px 0 2px" }}>doing</div>
            <ul style={ul}>{card.do.map((d) => <li key={d} style={li}>{d}</li>)}</ul>
          </div>
          <div style={{ flex: 1, padding: "8px 12px" }}>
            <div style={lbl}>Collaborators</div>
            <ul style={ul}>
              {card.collab.map((c) => {
                const target = CARDS.findIndex((x) => x.id === c);
                return (
                  <li key={c} style={li}>
                    {target >= 0 ? (
                      <button onClick={() => setIdx(target)} style={collabBtn}>{c} →</button>
                    ) : (
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{c}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
        Levý sloupec = co třída <b>ví</b> (knowing) a co <b>dělá</b> (doing). Pravý = koho potřebuje. Klikni na kolaboranta a sleduj, jak se práce <b>deleguje</b> dál (delegované řízení).
      </div>
    </div>
  );
}

const lbl = { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" };
const ul = { margin: "2px 0 0", paddingLeft: 16 };
const li = { fontSize: 11.5, color: "var(--text)", lineHeight: 1.5, marginBottom: 1 };
const collabBtn = {
  padding: 0,
  border: "none",
  background: "none",
  cursor: "pointer",
  fontFamily: "var(--font-mono)",
  fontSize: 11.5,
  color: "var(--accent)",
  textDecoration: "underline",
};
