// uxi-vv-klasifikace — klikni na QA aktivitu, viz zařadí ji k verifikaci
// (statická) nebo validaci (dynamická) a vysvětlí proč. Vybraná aktivita se
// barevně přesune do správného sloupce.
import { useState } from "react";

const ITEMS = [
  { id: "inspekce", label: "Inspekce UML diagramů", kind: "V", why: "Statická revize artefaktu bez spuštění kódu — kontrola shody se zadáním." },
  { id: "konzistence", label: "Kontrola konzistence slovníku", why: "Porovnání názvů napříč modely; nespouští se nic, jen se čtou artefakty.", kind: "V" },
  { id: "dukaz", label: "Formální matematický důkaz", kind: "V", why: "Dokazuje korektnost vůči specifikaci staticky, bez běhu programu." },
  { id: "revize", label: "Revize dokumentace", kind: "V", why: "Čtení a oponentura dokumentu — typická statická verifikační technika." },
  { id: "blackbox", label: "Black-box test", kind: "L", why: "Spouští systém a ověřuje chování proti scénáři — dynamická validace." },
  { id: "whitebox", label: "White-box test", kind: "L", why: "Spouští kód se znalostí struktury (pokrytí větví) — dynamický běh." },
  { id: "uat", label: "Akceptační test (UAT)", kind: "L", why: "Uživatel spouští systém a potvrzuje, že řeší jeho potřebu — validace účelu." },
  { id: "scenar", label: "Test podle uživ. scénáře", kind: "L", why: "Procházení reálného scénáře za běhu — dynamické ověření správného produktu." },
];

export default function UxiVvKlasifikace() {
  const [sel, setSel] = useState(null);
  const item = ITEMS.find((x) => x.id === sel);

  const W = 440;
  const colW = 200;
  const leftX = 10;
  const rightX = W - colW - 10;

  const verif = ITEMS.filter((x) => x.kind === "V");
  const valid = ITEMS.filter((x) => x.kind === "L");

  const chip = (it, x, y, hue) => {
    const active = sel === it.id;
    return (
      <g key={it.id} style={{ cursor: "pointer" }} onClick={() => setSel(it.id)}>
        <rect
          x={x}
          y={y}
          width={colW - 8}
          height="22"
          rx="4"
          fill={active ? `oklch(0.62 0.14 ${hue} / 0.85)` : `oklch(0.62 0.14 ${hue} / 0.14)`}
          stroke={`oklch(0.58 0.14 ${hue})`}
          strokeWidth={active ? 1.8 : 1}
        />
        <text
          x={x + 9}
          y={y + 15}
          fontSize="10.5"
          fill={active ? "var(--bg-card)" : "var(--text)"}
          fontWeight={active ? 700 : 400}
        >
          {it.label}
        </text>
      </g>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} 238`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height="238" fill="var(--bg-inset)" rx="6" />
        {/* column headers */}
        <rect x={leftX} y="8" width={colW - 8} height="30" rx="5" fill="oklch(0.62 0.14 264 / 0.16)" stroke="oklch(0.6 0.14 264)" strokeWidth="1.2" />
        <text x={leftX + (colW - 8) / 2} y="22" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">VERIFIKACE</text>
        <text x={leftX + (colW - 8) / 2} y="34" textAnchor="middle" fontSize="9.5" fill="oklch(0.55 0.14 264)">statická · „správně dle zadání?"</text>

        <rect x={rightX} y="8" width={colW - 8} height="30" rx="5" fill="oklch(0.62 0.14 142 / 0.16)" stroke="oklch(0.55 0.14 142)" strokeWidth="1.2" />
        <text x={rightX + (colW - 8) / 2} y="22" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">VALIDACE</text>
        <text x={rightX + (colW - 8) / 2} y="34" textAnchor="middle" fontSize="9.5" fill="oklch(0.5 0.14 142)">dynamická · „správný produkt?"</text>

        {verif.map((it, k) => chip(it, leftX, 48 + k * 28, 264))}
        {valid.map((it, k) => chip(it, rightX, 48 + k * 28, 142))}
      </svg>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", minHeight: 54 }}>
        {item ? (
          <>
            <div style={{ fontWeight: 600, fontSize: 12.5, color: item.kind === "V" ? "oklch(0.55 0.14 264)" : "oklch(0.5 0.14 142)", marginBottom: 4 }}>
              {item.label} → {item.kind === "V" ? "VERIFIKACE (statická)" : "VALIDACE (dynamická)"}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{item.why}</div>
          </>
        ) : (
          <div style={{ fontSize: 12.5, color: "var(--text-faint)", lineHeight: 1.5 }}>
            Klikněte na aktivitu. Rozhoduje, zda se kód <b>spouští</b> (validace) nebo jen čtou artefakty (verifikace).
          </div>
        )}
      </div>
    </div>
  );
}
