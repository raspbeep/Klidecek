// ais-two-hats — princip dvou klobouků: vývojář má vždy nasazený právě JEDEN
// klobouk. Přepínač mění aktivní klobouk; panel ukazuje, co se v tom režimu
// SMÍ a NESMÍ dělat, a sloupec "diff" naznačí, co se mění (chování vs. struktura).
import { useState } from "react";

const HATS = {
  feature: {
    label: "Klobouk: přidávání funkce",
    hue: 142,
    changes: "mění vnější chování",
    keeps: "nemění strukturu",
    may: ["přidat novou funkcionalitu", "rozšířit testy o nové chování", "psát nový kód"],
    mustNot: ["současně přeorganizovávat existující kód"],
  },
  refactor: {
    label: "Klobouk: refaktorizace",
    hue: 264,
    changes: "mění vnitřní strukturu",
    keeps: "nemění vnější chování",
    may: ["přejmenovat, rozdělit metodu, extrahovat třídu", "odstranit duplicitu", "zlepšit čitelnost"],
    mustNot: ["přidávat novou funkcionalitu", "měnit, co testy ověřují"],
  },
};

export default function AisTwoHats() {
  const [hat, setHat] = useState("feature");
  const h = HATS[hat];
  const accent = `oklch(0.62 0.16 ${h.hue})`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {Object.entries(HATS).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setHat(k)}
            style={{
              flex: 1,
              padding: "6px 8px",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              borderRadius: 5,
              border: `1px solid oklch(0.62 0.16 ${v.hue})`,
              background: hat === k ? `oklch(0.62 0.16 ${v.hue})` : "var(--bg-card)",
              color: hat === k ? "var(--bg-card)" : `oklch(0.62 0.16 ${v.hue})`,
              fontWeight: 600,
            }}
          >
            {k === "feature" ? "▲ funkce" : "▲ refaktor"}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 360 116" style={{ width: "100%", maxWidth: 440 }}>
        <rect width="360" height="116" fill="var(--bg-inset)" rx="6" />
        {/* klobouk (zjednodušená silueta) */}
        <g transform="translate(28 28)">
          <ellipse cx="34" cy="44" rx="32" ry="7" fill={accent} opacity="0.85" />
          <path d="M14 44 Q14 8 34 8 Q54 8 54 44 Z" fill={accent} />
          <rect x="14" y="36" width="40" height="6" fill="var(--bg-inset)" opacity="0.5" />
        </g>
        <text x="116" y="34" fontSize="12.5" fontWeight="700" fill={accent}>{h.label}</text>
        <text x="116" y="56" fontSize="11" fontFamily="var(--font-mono)" fill="oklch(0.55 0.16 142)">✔ {h.changes}</text>
        <text x="116" y="74" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">✖ {h.keeps}</text>
        <text x="116" y="98" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">vždy právě jeden klobouk, nikdy oba</text>
      </svg>

      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, padding: 8, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "oklch(0.55 0.16 142)", marginBottom: 4 }}>smí</div>
          {h.may.map((m, i) => (
            <div key={i} style={{ fontSize: 11.5, color: "var(--text)", lineHeight: 1.45 }}>· {m}</div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 8, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "oklch(0.58 0.18 22)", marginBottom: 4 }}>nesmí</div>
          {h.mustNot.map((m, i) => (
            <div key={i} style={{ fontSize: 11.5, color: "var(--text)", lineHeight: 1.45 }}>· {m}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
