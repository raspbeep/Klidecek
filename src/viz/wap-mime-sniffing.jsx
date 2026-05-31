// MIME sniffing vs X-Content-Type-Options: nosniff.
// Server posílá uživatelem nahraný "obrázek", jehož obsah ve skutečnosti
// začíná <script>. Toggle přepíná, zda je nastavena hlavička nosniff, a
// ukazuje, jak se prohlížeč rozhodne (spustit jako HTML = XSS, nebo odmítnout).
import { useState } from "react";

const GREEN = "oklch(0.52 0.16 142)";
const RED = "oklch(0.55 0.18 22)";
const ACCENT = "oklch(0.55 0.16 264)";

export default function WapMimeSniffing() {
  const [nosniff, setNosniff] = useState(false);

  const W = 420;
  const H = 200;

  // Výsledek: bez nosniff prohlížeč "očichá" obsah a spustí <script> → XSS.
  const danger = !nosniff;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12.5,
          padding: "7px 10px",
          background: "var(--bg-inset)",
          borderRadius: 8,
          border: "1px solid var(--line)",
        }}
      >
        <input
          type="checkbox"
          checked={nosniff}
          onChange={(e) => setNosniff(e.target.checked)}
        />
        <span style={{ fontFamily: "var(--font-mono)" }}>
          X-Content-Type-Options: nosniff
        </span>
        <span style={{ color: "var(--text-muted)" }}>
          {nosniff ? "zapnuto" : "vypnuto"}
        </span>
      </label>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* Hlavičky odpovědi */}
        <rect x="14" y="14" width="200" height="92" rx="6"
          fill="var(--bg-card)" stroke="var(--line)" />
        <text x="24" y="32" fontSize="10.5" fontWeight="600" fill="var(--text-muted)"
          style={{ textTransform: "uppercase" }}>odpověď serveru</text>
        <text x="24" y="52" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--text)">
          Content-Type:
        </text>
        <text x="24" y="66" fontSize="10.5" fontFamily="var(--font-mono)" fill={ACCENT}>
          image/png
        </text>
        <text x="24" y="86" fontSize="10.5" fontFamily="var(--font-mono)"
          fill={nosniff ? GREEN : "var(--text-faint)"}>
          X-Content-Type-
        </text>
        <text x="24" y="99" fontSize="10.5" fontFamily="var(--font-mono)"
          fill={nosniff ? GREEN : "var(--text-faint)"}>
          Options: {nosniff ? "nosniff" : "— chybí —"}
        </text>

        {/* Skutečný obsah */}
        <rect x="14" y="118" width="200" height="66" rx="6"
          fill="var(--bg-card)" stroke="var(--line)" />
        <text x="24" y="136" fontSize="10.5" fontWeight="600" fill="var(--text-muted)">
          skutečný obsah:
        </text>
        <text x="24" y="156" fontSize="10.5" fontFamily="var(--font-mono)" fill={RED}>
          &lt;script&gt;steal()
        </text>
        <text x="24" y="170" fontSize="10.5" fontFamily="var(--font-mono)" fill={RED}>
          &lt;/script&gt;
        </text>

        {/* Šipka k prohlížeči */}
        <line x1="218" y1="100" x2="252" y2="100"
          stroke="var(--text-muted)" strokeWidth="1.6" markerEnd="url(#wapMimeArr)" />

        {/* Rozhodnutí prohlížeče */}
        <rect x="256" y="30" width="150" height="140" rx="8"
          fill={danger ? "oklch(0.55 0.18 22 / 0.12)" : "oklch(0.52 0.16 142 / 0.12)"}
          stroke={danger ? RED : GREEN} strokeWidth="1.5" />
        <text x="331" y="50" textAnchor="middle" fontSize="11" fontWeight="600"
          fill="var(--text)">prohlížeč</text>
        <text x="331" y="76" textAnchor="middle" fontSize="13" fontWeight="700"
          fill={danger ? RED : GREEN}>
          {danger ? "hádá typ" : "věří hlavičce"}
        </text>
        <text x="331" y="96" textAnchor="middle" fontSize="10" fill="var(--text-muted)">
          {danger ? "(MIME sniffing)" : "(image/png)"}
        </text>
        <text x="331" y="126" textAnchor="middle" fontSize="13" fontWeight="700"
          fill={danger ? RED : GREEN}>
          {danger ? "⚠ spustí skript" : "✓ neinterpretuje"}
        </text>
        <text x="331" y="146" textAnchor="middle" fontSize="10"
          fill={danger ? RED : GREEN}>
          {danger ? "XSS proběhne" : "XSS zablokováno"}
        </text>

        <defs>
          <marker id="wapMimeArr" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)" />
          </marker>
        </defs>
      </svg>

      <div
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          lineHeight: 1.5,
          padding: "8px 10px",
          background: "var(--bg-card)",
          borderRadius: 6,
          border: "1px solid var(--line)",
        }}
      >
        {danger
          ? "Bez nosniff prohlížeč ignoruje deklarovaný image/png, „očichá\" obsah, pozná HTML a spustí <script> v kontextu domény — to je XSS."
          : "S nosniff prohlížeč přijme deklarovaný image/png a obsah neinterpretuje jako spustitelné HTML — útok neprojde."}
      </div>
    </div>
  );
}
