// wap-csp-eval — vyhodnocení skriptů proti CSP script-src politice.
// Uživatel vybere politiku (unsafe-inline / allowlist / nonce / nonce+strict-dynamic)
// a vidí, který z ukázkových skriptů se smí spustit a který se zablokuje.
import { useState } from "react";

const GREEN = "oklch(0.52 0.16 142)";
const RED = "oklch(0.55 0.18 22)";
const ACCENT = "oklch(0.55 0.16 264)";

// Ukázkové skripty na stránce. injected = vložený útočníkem injekcí.
const SCRIPTS = [
  { id: "own-inline", label: "<script nonce>…vlastní inline</script>", nonce: true, host: null, injected: false },
  { id: "cdn", label: "<script src=cdn.example.com/lib.js>", nonce: false, host: "cdn.example.com", injected: false },
  { id: "xss-inline", label: "<script>steal()</script>  (injekce)", nonce: false, host: null, injected: true },
  { id: "xss-evil", label: "<script src=evil.com/x.js>  (injekce)", nonce: false, host: "evil.com", injected: true },
];

const POLICIES = {
  unsafe: {
    label: "'unsafe-inline'",
    csp: "script-src 'unsafe-inline' https:",
    allow: (s) => (s.host ? s.host !== "evil.com" : true), // inline vše, src jen ne evil
    note: "'unsafe-inline' spustí jakýkoli inline skript — i ten injektovaný. CSP tu prakticky nechrání.",
  },
  allowlist: {
    label: "allowlist domén",
    csp: "script-src 'self' cdn.example.com",
    allow: (s) => !!s.host && (s.host === "cdn.example.com"),
    note: "Allowlist povolí jen jmenované domény. Vlastní inline skript bez nonce ale neprojde — a allowlisty lze často obejít přes povolené domény.",
  },
  nonce: {
    label: "'nonce-…'",
    csp: "script-src 'nonce-r4nd0m'",
    allow: (s) => s.nonce === true,
    note: "Spustí se jen skript s platným nonce. Útočník nonce nezná, takže injektovaný inline i jeho externí skript prohlížeč zablokuje. Externí lib bez nonce ale taky neprojde.",
  },
  strict: {
    label: "'nonce' + 'strict-dynamic'",
    csp: "script-src 'nonce-r4nd0m' 'strict-dynamic'",
    allow: (s) => s.nonce === true, // důvěra se propaguje jen z nonce skriptů, ne z injekce
    note: "Doporučená strict CSP: skript s nonce smí programově vkládat další skripty (důvěra se propaguje). Injektovaný skript nonce nemá a zablokuje se. Domény v allowlistu se ignorují.",
  },
};

export default function WapCspEval() {
  const [key, setKey] = useState("nonce");
  const p = POLICIES[key];
  const W = 440;
  const rowH = 30;
  const H = 56 + SCRIPTS.length * rowH + 8;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {Object.entries(POLICIES).map(([k, v]) => (
          <button key={k} onClick={() => setKey(k)} style={{
            padding: "6px 9px", fontSize: 11.5, borderRadius: 6, cursor: "pointer",
            border: key === k ? `1.5px solid ${ACCENT}` : "1px solid var(--line)",
            background: key === k ? "oklch(0.55 0.16 264 / 0.12)" : "var(--bg-card)",
            color: key === k ? ACCENT : "var(--text-muted)",
            fontWeight: key === k ? 700 : 500, fontFamily: "var(--font-mono)",
          }}>{v.label}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />
        <text x={14} y={22} fontSize="10" fontWeight="600" fill="var(--text-muted)"
          style={{ textTransform: "uppercase" }}>aktivní politika — Content-Security-Policy</text>
        <text x={14} y={41} fontSize="11" fontFamily="var(--font-mono)" fill={ACCENT}>
          {p.csp}
        </text>
        <line x1={14} y1={50} x2={W - 14} y2={50} stroke="var(--line)" strokeWidth="0.7" />

        {SCRIPTS.map((s, i) => {
          const y = 58 + i * rowH;
          const allowed = p.allow(s);
          return (
            <g key={s.id}>
              <rect x={14} y={y} width={W - 28} height={rowH - 4} rx={4}
                fill={s.injected ? "oklch(0.55 0.18 22 / 0.06)" : "var(--bg-card)"}
                stroke="var(--line)" />
              <text x={22} y={y + 17} fontSize="10" fontFamily="var(--font-mono)"
                fill={s.injected ? RED : "var(--text)"}>{s.label}</text>
              <text x={W - 24} y={y + 17} textAnchor="end" fontSize="10.5" fontWeight="700"
                fill={allowed ? GREEN : RED}>
                {allowed ? "✓ spuštěno" : "✗ blokováno"}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, padding: "8px 10px", background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        {p.note}
      </div>
    </div>
  );
}
