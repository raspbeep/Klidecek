// wap-origin-check — porovnání Origin (scheme+host+port) vs Site (eTLD+1).
// Uživatel vybírá cílovou URL proti pevné základní stránce a vidí, zda jde
// o same-origin, jen same-site, nebo cross-site — a co SOP v daném případě
// dovolí (odeslání/vložení) a co zakáže (čtení odpovědi).
import { useState } from "react";

const BASE = { scheme: "https", host: "app.example.com", port: "443" };

// Pro každý cíl rozebereme jeho trojici a (zjednodušeně) registrovatelnou doménu.
const TARGETS = [
  { url: "https://app.example.com/data", scheme: "https", host: "app.example.com", port: "443", site: "example.com" },
  { url: "https://api.example.com/data", scheme: "https", host: "api.example.com", port: "443", site: "example.com" },
  { url: "http://app.example.com/data",  scheme: "http",  host: "app.example.com", port: "80",  site: "example.com" },
  { url: "https://app.example.com:8443", scheme: "https", host: "app.example.com", port: "8443", site: "example.com" },
  { url: "https://evil.com/steal",       scheme: "https", host: "evil.com",        port: "443", site: "evil.com" },
];

const GREEN = "oklch(0.52 0.16 142)";
const AMBER = "oklch(0.58 0.15 75)";
const RED = "oklch(0.55 0.18 22)";

function classify(t) {
  const sameScheme = t.scheme === BASE.scheme;
  const sameHost = t.host === BASE.host;
  const samePort = t.port === BASE.port;
  const sameOrigin = sameScheme && sameHost && samePort;
  const sameSite = t.site === "example.com" && sameScheme; // schemeful same-site
  return { sameScheme, sameHost, samePort, sameOrigin, sameSite };
}

export default function WapOriginCheck() {
  const [idx, setIdx] = useState(1);
  const t = TARGETS[idx];
  const c = classify(t);

  const verdict = c.sameOrigin
    ? { label: "SAME-ORIGIN", color: GREEN }
    : c.sameSite
    ? { label: "SAME-SITE, cross-origin", color: AMBER }
    : { label: "CROSS-SITE", color: RED };

  const W = 460;
  const H = 200;

  const Row = ({ y, label, base, target, ok }) => (
    <g>
      <text x={16} y={y} fontSize="10.5" fill="var(--text-muted)">{label}</text>
      <text x={120} y={y} fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--text)">{base}</text>
      <text x={250} y={y} fontSize="10.5" fontFamily="var(--font-mono)"
        fill={ok ? GREEN : RED}>{target}</text>
      <text x={420} y={y} fontSize="11" textAnchor="middle" fill={ok ? GREEN : RED}>
        {ok ? "✓" : "✗"}
      </text>
    </g>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>cíl požadavku:</span>
        <select value={idx} onChange={(e) => setIdx(Number(e.target.value))} style={selectStyle}>
          {TARGETS.map((tt, i) => (
            <option key={i} value={i}>{tt.url}</option>
          ))}
        </select>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        <text x={120} y={20} fontSize="10" fontWeight="600" fill="var(--text-muted)"
          style={{ textTransform: "uppercase" }}>základní stránka</text>
        <text x={250} y={20} fontSize="10" fontWeight="600" fill="var(--text-muted)"
          style={{ textTransform: "uppercase" }}>cíl</text>

        <Row y={42} label="protokol" base={BASE.scheme} target={t.scheme} ok={c.sameScheme} />
        <Row y={62} label="host (doména)" base={BASE.host} target={t.host} ok={c.sameHost} />
        <Row y={82} label="port" base={BASE.port} target={t.port} ok={c.samePort} />

        <line x1={16} y1={96} x2={W - 16} y2={96} stroke="var(--line)" strokeWidth="0.7" />
        <text x={16} y={114} fontSize="10.5" fill="var(--text-muted)">Site (eTLD+1)</text>
        <text x={120} y={114} fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--text)">example.com</text>
        <text x={250} y={114} fontSize="10.5" fontFamily="var(--font-mono)"
          fill={t.site === "example.com" ? GREEN : RED}>{t.site}</text>

        {/* Verdikt */}
        <rect x={16} y={128} width={W - 32} height={26} rx={5}
          fill={`${verdict.color.replace(")", " / 0.14)")}`} stroke={verdict.color} strokeWidth="1.3" />
        <text x={W / 2} y={145} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={verdict.color}>
          {verdict.label}
        </text>

        {/* Co SOP dělá */}
        <text x={16} y={174} fontSize="10.5" fill="var(--text)">
          SOP: odeslání požadavku i vložení (img/script)
          <tspan fill={GREEN} fontWeight="700"> ✓ povoleno</tspan>
        </text>
        <text x={16} y={190} fontSize="10.5" fill="var(--text)">
          SOP: čtení odpovědi JS skriptem
          <tspan fill={c.sameOrigin ? GREEN : RED} fontWeight="700">
            {c.sameOrigin ? " ✓ povoleno (same-origin)" : " ✗ zakázáno (jiný Origin)"}
          </tspan>
        </text>
      </svg>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, padding: "8px 10px", background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        {c.sameOrigin
          ? "Shoduje se protokol, host i port — stejný Origin. Skript smí odpověď přečíst bez jakéhokoli CORS."
          : c.sameSite
          ? "Stejná registrovatelná doména (Site), ale jiný Origin — liší se subdoména nebo port. Pro cookies to může být „same-site\", ale pro čtení odpovědi je to cross-origin: SOP čtení zakáže, dokud server nepošle CORS hlavičku."
          : "Jiná registrovatelná doména — cross-site. Požadavek se odešle (a útočníkův web tak může spustit CSRF), ale odpověď skript bez CORS nepřečte."}
      </div>
    </div>
  );
}

const selectStyle = {
  padding: "3px 6px",
  fontSize: 11.5,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 3,
  color: "var(--text)",
};
