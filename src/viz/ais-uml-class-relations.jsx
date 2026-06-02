// ais-uml-class-relations — přepínač vztahů v diagramu tříd.
// Ukáže notaci (čára, kosočtverec, trojúhelník) a sémantiku pro
// asociaci, agregaci, kompozici a generalizaci na jednom páru tříd.
import { useState } from "react";

const RELS = {
  asociace: {
    label: "Asociace",
    desc: "Obecný vztah „zná / používá“. Prostá čára. Multiplicita upřesní počet (zde 1 ku *).",
    end: "none",
    multA: "1",
    multB: "*",
    titleA: "Objednávka",
    titleB: "Položka",
    semantic: "Objednávka odkazuje na položky; obě třídy žijí nezávisle.",
  },
  agregace: {
    label: "Agregace",
    desc: "Slabý vztah „celek–část“. Prázdný kosočtverec u celku. Část přežije zánik celku.",
    end: "hollow",
    multA: "1",
    multB: "*",
    titleA: "Tým",
    titleB: "Hráč",
    semantic: "Hráč může existovat i bez týmu — po rozpuštění týmu hráč zůstává.",
  },
  kompozice: {
    label: "Kompozice",
    desc: "Silný vztah „celek–část“. Plný kosočtverec u celku. Se zánikem celku zaniká i část.",
    end: "filled",
    multA: "1",
    multB: "*",
    titleA: "Faktura",
    titleB: "Řádek",
    semantic: "Řádek nemůže žít bez faktury — smazání faktury smaže její řádky.",
  },
  generalizace: {
    label: "Generalizace",
    desc: "Dědičnost „je-druhem“. Prázdný trojúhelník míří na předka. Bez multiplicity.",
    end: "triangle",
    multA: "",
    multB: "",
    titleA: "Osoba",
    titleB: "Zaměstnanec",
    semantic: "Zaměstnanec JE Osoba — dědí její atributy a operace.",
  },
};

function ClassBox({ x, y, title, attrs, ops }) {
  const w = 132, hHead = 24, hAttr = 18 * attrs.length + 6, hOps = 18 * ops.length + 6;
  return (
    <g>
      <rect x={x} y={y} width={w} height={hHead} fill="var(--bg-card)" stroke="var(--line-strong)" />
      <text x={x + w / 2} y={y + 16} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">{title}</text>
      <rect x={x} y={y + hHead} width={w} height={hAttr} fill="var(--bg-inset)" stroke="var(--line-strong)" />
      {attrs.map((a, i) => (
        <text key={i} x={x + 6} y={y + hHead + 16 + i * 18} fontSize="10" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">{a}</text>
      ))}
      <rect x={x} y={y + hHead + hAttr} width={w} height={hOps} fill="var(--bg-inset)" stroke="var(--line-strong)" />
      {ops.map((o, i) => (
        <text key={i} x={x + 6} y={y + hHead + hAttr + 16 + i * 18} fontSize="10" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">{o}</text>
      ))}
    </g>
  );
}

export default function AisUmlClassRelations() {
  const [rel, setRel] = useState("kompozice");
  const r = RELS[rel];

  // Línie: z pravé strany levé třídy (x=164,y=86) do levé strany pravé (x=336,y=86)
  const x1 = 164, x2 = 336, y = 86;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {Object.keys(RELS).map((k) => (
          <button key={k} onClick={() => setRel(k)} style={btn(rel === k)}>{RELS[k].label}</button>
        ))}
      </div>

      <svg viewBox="0 0 500 200" style={{ width: "100%", maxWidth: 540, background: "var(--bg-inset)", borderRadius: 4 }}>
        <ClassBox x={32} y={44} title={r.titleA} attrs={["- id"]} ops={["+ akce()"]} />
        <ClassBox x={336} y={44} title={r.titleB} attrs={["- id"]} ops={["+ akce()"]} />

        {/* spojnice */}
        <line x1={x1} y1={y} x2={x2} y2={y} stroke="var(--text)" strokeWidth="1.6"
          markerStart={r.end === "hollow" ? "url(#hollowDia)" : r.end === "filled" ? "url(#filledDia)" : r.end === "triangle" ? "url(#hollowTri)" : undefined} />

        {/* multiplicity */}
        {r.multA && <text x={x1 + 6} y={y - 6} fontSize="11" fontFamily="ui-monospace, monospace" fill="var(--accent)">{r.multA}</text>}
        {r.multB && <text x={x2 - 14} y={y - 6} fontSize="11" fontFamily="ui-monospace, monospace" fill="var(--accent)">{r.multB}</text>}

        {/* end-label */}
        <text x={250} y={y - 10} textAnchor="middle" fontSize="10" fill="var(--text-faint)">
          {r.end === "hollow" ? "◇ celek" : r.end === "filled" ? "◆ celek" : r.end === "triangle" ? "△ předek" : "asociace"}
        </text>

        <defs>
          <marker id="hollowDia" viewBox="0 0 20 12" refX="1" refY="6" markerWidth="20" markerHeight="12" orient="auto">
            <path d="M1,6 L10,1 L19,6 L10,11 Z" fill="var(--bg-inset)" stroke="var(--text)" strokeWidth="1.2" />
          </marker>
          <marker id="filledDia" viewBox="0 0 20 12" refX="1" refY="6" markerWidth="20" markerHeight="12" orient="auto">
            <path d="M1,6 L10,1 L19,6 L10,11 Z" fill="var(--text)" stroke="var(--text)" strokeWidth="1.2" />
          </marker>
          <marker id="hollowTri" viewBox="0 0 16 16" refX="1" refY="8" markerWidth="16" markerHeight="16" orient="auto">
            <path d="M15,1 L1,8 L15,15 Z" fill="var(--bg-inset)" stroke="var(--text)" strokeWidth="1.2" />
          </marker>
        </defs>
      </svg>

      <div style={{ marginTop: 8, padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>{r.label}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{r.desc}</div>
        <div style={{ fontSize: 12, color: "var(--text)", marginTop: 6 }}><b>Sémantika:</b> {r.semantic}</div>
      </div>
    </div>
  );
}

const base = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "4px 10px", borderRadius: 4, fontSize: 11.5, cursor: "pointer" };
function btn(active) {
  return { ...base, background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", fontWeight: active ? 600 : 400 };
}
