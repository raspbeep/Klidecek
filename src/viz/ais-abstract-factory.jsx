// Abstract Factory — přepínání rodin produktů. Klient drží jen rozhraní
// UiFactory; výměnou konkrétní továrny se vymění celá rodina produktů
// (Button, Checkbox, Scrollbar) a všechny k sobě stylem patří.
import { useState } from "react";

const FAMILIES = {
  Windows: { hue: 264, btn: "[ OK ]", chk: "[x]", scr: "▮▯▯", accent: "Windows" },
  Mac: { hue: 142, btn: "( OK )", chk: "(✓)", scr: "●○○", accent: "macOS" },
};

const NAMES = Object.keys(FAMILIES);

export default function AisAbstractFactory() {
  const [fam, setFam] = useState("Windows");
  const f = FAMILIES[fam];
  const fill = (a) => `oklch(0.62 0.14 ${f.hue} / ${a})`;
  const stroke = `oklch(0.62 0.14 ${f.hue})`;
  const ink = `oklch(0.45 0.14 ${f.hue})`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 600 }}>
          UiFactory =
        </span>
        {NAMES.map((n) => (
          <button
            key={n}
            onClick={() => setFam(n)}
            style={{
              padding: "5px 14px",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              borderRadius: 5,
              cursor: "pointer",
              border: `1px solid ${n === fam ? `oklch(0.62 0.14 ${FAMILIES[n].hue})` : "var(--line)"}`,
              background: n === fam ? `oklch(0.62 0.14 ${FAMILIES[n].hue} / 0.18)` : "var(--bg-card)",
              color: n === fam ? `oklch(0.45 0.14 ${FAMILIES[n].hue})` : "var(--text-muted)",
              fontWeight: n === fam ? 700 : 400,
            }}
          >
            {n}Factory
          </button>
        ))}
      </div>

      <svg viewBox="0 0 460 196" style={{ width: "100%", maxWidth: 460 }}>
        <rect width="460" height="196" fill="var(--bg-inset)" rx="6" />

        {/* client box — never changes */}
        <rect x="14" y="70" width="118" height="54" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1.2" />
        <text x="73" y="90" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text)">Client</text>
        <text x="73" y="106" textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">f.createXxx()</text>
        <text x="73" y="117" textAnchor="middle" fontSize="8.5" fill="var(--text-faint)">(beze změny)</text>

        {/* factory box — the only thing that is swapped */}
        <rect x="160" y="66" width="110" height="62" rx="5" fill={fill(0.16)} stroke={stroke} strokeWidth="1.4" />
        <text x="215" y="86" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={ink}>{fam}Factory</text>
        <text x="215" y="101" textAnchor="middle" fontSize="9" fill="var(--text-muted)">implements</text>
        <text x="215" y="113" textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">UiFactory</text>

        <line x1="132" y1="97" x2="160" y2="97" stroke="var(--text-muted)" strokeWidth="1.4" markerEnd="url(#af-arrow)" />

        {/* produced family */}
        <text x="365" y="22" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={ink}>rodina „{f.accent}"</text>
        {[
          { y: 36, label: "Button", glyph: f.btn },
          { y: 84, label: "Checkbox", glyph: f.chk },
          { y: 132, label: "Scrollbar", glyph: f.scr },
        ].map((p, i) => (
          <g key={i}>
            <rect x="298" y={p.y} width="146" height="40" rx="5" fill={fill(0.1)} stroke={stroke} strokeWidth="1.1" />
            <text x="312" y={p.y + 17} fontSize="10.5" fill="var(--text)">{p.label}</text>
            <text x="312" y={p.y + 31} fontSize="11" fontFamily="var(--font-mono)" fill={ink}>{p.glyph}</text>
            <line x1="270" y1="97" x2="298" y2={p.y + 20} stroke={stroke} strokeWidth="1.1" strokeDasharray="4 3" markerEnd="url(#af-create)" />
          </g>
        ))}

        <defs>
          <marker id="af-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10" fill="none" stroke="var(--text-muted)" />
          </marker>
          <marker id="af-create" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10" fill="none" stroke={stroke} />
          </marker>
        </defs>
      </svg>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        Klient zavolá <code>createButton()</code>, <code>createCheckbox()</code>, <code>createScrollbar()</code> stejně pro
        obě rodiny. Vyměnila se <strong>jen konkrétní továrna</strong> — produkty teď k sobě stylem
        patří (rodina <em>{f.accent}</em>) a kód klienta zůstal nedotčen.
      </div>
    </div>
  );
}
