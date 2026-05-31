// DOM strom z malého XML útržku. Klik na uzel vlevo (strom) zvýrazní
// odpovídající kus zdroje vpravo a ukáže typ uzlu (Document / Element / Attr / Text).
import { useState } from "react";

const TYPE_HUE = {
  Document: 65,
  Element: 264,
  Attr: 142,
  Text: 22,
};
const col = (t, l = 0.55, c = 0.16) => `oklch(${l} ${c} ${TYPE_HUE[t]})`;

// uzly: id, label, typ, x, y, rodič, a rozsah znaků ve zdroji [from,to)
const SRC = `<objednavka id="8235">
  <zakaznik>Jan Novák</zakaznik>
</objednavka>`;

// indexy do SRC pro zvýraznění
const NODES = [
  { id: "doc", label: "Document", type: "Document", x: 150, y: 26, parent: null, span: [0, SRC.length] },
  { id: "obj", label: "objednavka", type: "Element", x: 150, y: 70, parent: "doc", span: [0, SRC.length] },
  { id: "attr", label: 'id="8235"', type: "Attr", x: 58, y: 120, parent: "obj", span: [12, 21] },
  { id: "zak", label: "zakaznik", type: "Element", x: 210, y: 120, parent: "obj", span: [25, 60] },
  { id: "txt", label: '"Jan Novák"', type: "Text", x: 210, y: 168, parent: "zak", span: [35, 44] },
];

export default function WapDomTree() {
  const [sel, setSel] = useState("obj");
  const cur = NODES.find((n) => n.id === sel);

  const W = 300;
  const H = 192;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {/* Strom */}
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 320, flex: "1 1 260px" }}>
          <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />
          {/* hrany rodič→dítě */}
          {NODES.filter((n) => n.parent).map((n) => {
            const p = NODES.find((x) => x.id === n.parent);
            return (
              <line key={"e" + n.id} x1={p.x} y1={p.y + 10} x2={n.x} y2={n.y - 10}
                stroke="var(--line-strong)" strokeWidth="1" />
            );
          })}
          {NODES.map((n) => {
            const active = n.id === sel;
            const w = Math.max(58, n.label.length * 6.6 + 16);
            return (
              <g key={n.id} style={{ cursor: "pointer" }} onClick={() => setSel(n.id)}>
                <rect x={n.x - w / 2} y={n.y - 13} width={w} height={26} rx="6"
                  fill={active ? col(n.type, 0.55, 0.16) + "" : "var(--bg-card)"}
                  fillOpacity={active ? 0.22 : 1}
                  stroke={col(n.type)} strokeWidth={active ? 2 : 1} />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="10.5"
                  fontFamily="var(--font-mono)"
                  fill={active ? col(n.type, 0.42) : "var(--text)"}
                  fontWeight={active ? 700 : 400}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Zdroj */}
        <div style={{ flex: "1 1 200px", minWidth: 180 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4,
          }}>zdroj XML</div>
          <pre style={{
            margin: 0, padding: 10, background: "var(--bg-card)",
            border: "1px solid var(--line)", borderRadius: 6,
            fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.5,
            color: "var(--text-muted)", whiteSpace: "pre-wrap", overflowX: "auto",
          }}>
            <span>{SRC.slice(0, cur.span[0])}</span>
            <mark style={{
              background: col(cur.type, 0.55, 0.16) + "33",
              color: col(cur.type, 0.42),
              borderRadius: 3, padding: "1px 2px", fontWeight: 700,
            }}>{SRC.slice(cur.span[0], cur.span[1])}</mark>
            <span>{SRC.slice(cur.span[1])}</span>
          </pre>
        </div>
      </div>

      <div style={{
        fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5,
        padding: "8px 10px", background: "var(--bg-card)",
        borderRadius: 6, border: "1px solid var(--line)",
      }}>
        Vybraný uzel: <strong style={{ color: col(cur.type, 0.42) }}>{cur.label}</strong>{" "}
        — typ <strong style={{ color: col(cur.type, 0.42), fontFamily: "var(--font-mono)" }}>{cur.type}</strong>.
        {cur.type === "Document" && " Kořen celého stromu (nodeType 9)."}
        {cur.type === "Element" && " Značka dokumentu (nodeType 1) — má potomky i atributy."}
        {cur.type === "Attr" && " Atribut elementu (nodeType 2) — nese metadata, není to dítě v childNodes."}
        {cur.type === "Text" && " Textový obsah uvnitř elementu (nodeType 3) — list stromu."}
      </div>
    </div>
  );
}
