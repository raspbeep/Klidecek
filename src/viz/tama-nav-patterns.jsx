// Srovnání navigačních vzorů: bottom navigation vs hamburger menu.
// Přepínač "otevři menu" ukazuje, že u hamburgeru jsou funkce skryté
// (objevitelnost) a ikona leží v červené zóně, zatímco tab bar je trvale
// vidět v zelené zóně.
import { useState } from "react";

const W = 460, H = 240;

export default function TamaNavPatterns() {
  const [open, setOpen] = useState(false); // hamburger drawer otevřen?

  // dvě "obrazovky" vedle sebe
  const pw = 150, ph = 200;
  const lx = 40, rx = W - 40 - pw;
  const py = 28;

  const tabs = ["Domů", "Hledat", "Účet"];

  const phoneFrame = (x, label) => (
    <g>
      <rect x={x - 8} y={py - 8} width={pw + 16} height={ph + 16} rx={14}
        fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1.5" />
      <text x={x + pw / 2} y={py - 14} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--text)">{label}</text>
    </g>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => setOpen((o) => !o)}
          style={{
            padding: "5px 12px", fontSize: 11.5, fontFamily: "var(--font-mono)", cursor: "pointer", borderRadius: 5,
            border: `1px solid var(--accent)`,
            background: open ? "var(--accent)" : "var(--bg-card)",
            color: open ? "white" : "var(--text)",
          }}>
          {open ? "zavři hamburger menu" : "otevři hamburger menu"}
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 480 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* zónové pozadí obou telefonů: horní pruh = red, dolní = green */}
        {[lx, rx].map((x, i) => (
          <g key={i} clipPath={`url(#np${i})`}>
            <clipPath id={`np${i}`}><rect x={x} y={py} width={pw} height={ph} rx="4" /></clipPath>
            <rect x={x} y={py} width={pw} height={36} fill="oklch(0.62 0.19 25 / 0.10)" />
            <rect x={x} y={py + ph - 40} width={pw} height={40} fill="oklch(0.65 0.15 150 / 0.12)" />
          </g>
        ))}

        {/* ---- LEVÝ: bottom navigation ---- */}
        {phoneFrame(lx, "Bottom navigation")}
        <rect x={lx} y={py} width={pw} height={ph} rx="4" fill="none" stroke="var(--line)" />
        {/* obsah */}
        <rect x={lx + 14} y={py + 18} width={pw - 28} height={ph - 70} rx="4" fill="var(--accent)" fillOpacity="0.06" />
        <text x={lx + pw / 2} y={py + ph / 2} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">obsah</text>
        {/* tab bar v zelené zóně, trvale viditelný */}
        {tabs.map((t, i) => {
          const tw = pw / tabs.length;
          const tx = lx + i * tw + tw / 2;
          return (
            <g key={t}>
              <circle cx={tx} cy={py + ph - 26} r="6" fill={i === 0 ? "var(--accent)" : "var(--text-faint)"} />
              <text x={tx} y={py + ph - 9} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)"
                fill={i === 0 ? "var(--accent)" : "var(--text-muted)"}>{t}</text>
            </g>
          );
        })}
        <text x={lx + pw / 2} y={py + ph + 26} textAnchor="middle" fontSize="9.5" fill="oklch(0.5 0.15 150)" fontWeight="600">✓ trvale vidět · zelená zóna</text>

        {/* VS pill */}
        <line x1={W / 2} y1={py} x2={W / 2} y2={py + ph} stroke="var(--line)" strokeWidth="0.8" strokeDasharray="3 4" />
        <circle cx={W / 2} cy={py + ph / 2} r="13" fill="var(--bg-card)" stroke="var(--line-strong)" />
        <text x={W / 2} y={py + ph / 2 + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-muted)">VS</text>

        {/* ---- PRAVÝ: hamburger ---- */}
        {phoneFrame(rx, "Hamburger menu")}
        <rect x={rx} y={py} width={pw} height={ph} rx="4" fill="none" stroke="var(--line)" />
        {/* ikona ☰ v červené zóně (horní roh) */}
        <g>
          <rect x={rx + 8} y={py + 8} width={20} height={18} rx="3"
            fill={open ? "var(--accent)" : "var(--bg-card)"} stroke="var(--accent)" />
          {[0, 1, 2].map((k) => (
            <line key={k} x1={rx + 12} y1={py + 13 + k * 4} x2={rx + 24} y2={py + 13 + k * 4}
              stroke={open ? "white" : "var(--accent)"} strokeWidth="1.4" />
          ))}
        </g>
        <text x={rx + 34} y={py + 21} fontSize="8" fill="oklch(0.6 0.19 25)" fontFamily="var(--font-mono)">červená zóna</text>
        {/* obsah */}
        {!open && (
          <>
            <rect x={rx + 14} y={py + 40} width={pw - 28} height={ph - 56} rx="4" fill="var(--accent)" fillOpacity="0.06" />
            <text x={rx + pw / 2} y={py + ph / 2 + 6} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">obsah</text>
            <text x={rx + pw / 2} y={py + ph - 12} textAnchor="middle" fontSize="9" fill="var(--text-faint)">funkce skryté</text>
          </>
        )}
        {/* vysunutý drawer */}
        {open && (
          <g>
            <rect x={rx} y={py} width={pw * 0.72} height={ph} fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1" />
            {["Domů", "Hledat", "Účet", "Nastavení"].map((t, i) => (
              <text key={t} x={rx + 12} y={py + 50 + i * 26} fontSize="10" fill="var(--text)" fontFamily="var(--font-mono)">{t}</text>
            ))}
          </g>
        )}
        <text x={rx + pw / 2} y={py + ph + 26} textAnchor="middle" fontSize="9.5" fill="oklch(0.6 0.19 25)" fontWeight="600">
          {open ? "menu odkryto klepnutím" : "✗ skryto · červená zóna"}
        </text>
      </svg>

      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        <strong>Bottom navigation</strong> drží 3–5 hlavních funkcí trvale na očích v zelené zóně → výborná objevitelnost.
        <strong> Hamburger</strong> šetří místo, ale skrývá funkce za klepnutí a jeho ikona obvykle sedí v červené zóně horního rohu → horší objevitelnost. Hodí se jen pro sekundární funkce.
      </div>
    </div>
  );
}
