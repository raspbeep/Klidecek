// Srovnání digitálních sběrnic pro připojení senzorů — I2C / SPI / 1-Wire / UART.
// Toggle vybere sběrnici; diagram ukáže zapojení vodičů MCU↔senzory a panel
// shrne klíčové vlastnosti (vodiče, adresace, synchronní/asynchronní).
import { useState } from "react";

const BUSES = {
  I2C: {
    hue: 264,
    wires: ["SDA", "SCL"],
    shared: true,
    nDev: 3,
    sync: "synchronní (SCL)",
    addr: "HW adresa 7/10 b",
    note: "Dva vodiče s pull-up rezistory sdílí všechny senzory; rozlišují se adresou. Úsporné na vodiče, 100 k / 400 kHz.",
  },
  SPI: {
    hue: 142,
    wires: ["SCK", "MOSI", "MISO"],
    shared: true,
    cs: true,
    nDev: 3,
    sync: "synchronní (SCK)",
    addr: "samostatný CS na zařízení",
    note: "Tři sdílené vodiče + CS na každý slave. Plně duplexní a rychlé (MHz), ale vodičů přibývá s počtem zařízení.",
  },
  "1-Wire": {
    hue: 200,
    wires: ["DQ"],
    shared: true,
    nDev: 3,
    sync: "asynchronní",
    addr: "64b ROM adresa (vypálená)",
    note: "Jediný datový vodič (+ zem) pro mnoho senzorů. Parazitní napájení z linky. Typicky teploměr DS18B20.",
  },
  UART: {
    hue: 22,
    wires: ["TX", "RX"],
    shared: false,
    nDev: 1,
    sync: "asynchronní (baud rate)",
    addr: "point-to-point",
    note: "Dva vodiče (TX/RX) mezi dvěma zařízeními, bez hodin — nutná shodná přenosová rychlost. Pro dálku → RS-485.",
  },
};

export default function NavDigitalSbernice() {
  const [sel, setSel] = useState("I2C");
  const b = BUSES[sel];
  const accent = `oklch(0.58 0.15 ${b.hue})`;

  const W = 360, H = 130;
  const mcuX = 18, mcuY = 40, mcuW = 56, mcuH = 50;
  const busY0 = 30;

  // device positions
  const devs = Array.from({ length: b.nDev }, (_, i) => i);
  const devX = (i) => 150 + i * 68;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.keys(BUSES).map((k) => (
          <button key={k} onClick={() => setSel(k)} style={{
            ...tab,
            background: sel === k ? `oklch(0.58 0.15 ${BUSES[k].hue} / 0.18)` : "var(--bg-card)",
            borderColor: sel === k ? `oklch(0.58 0.15 ${BUSES[k].hue})` : "var(--line)",
            color: "var(--text)",
            fontWeight: sel === k ? 700 : 500,
          }}>{k}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* MCU */}
        <rect x={mcuX} y={mcuY} width={mcuW} height={mcuH} rx="6" fill={`oklch(0.58 0.15 ${b.hue} / 0.15)`} stroke={accent} strokeWidth="1.4" />
        <text x={mcuX + mcuW / 2} y={mcuY + mcuH / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">MCU</text>

        {/* shared bus wires */}
        {b.wires.map((w, wi) => {
          const yy = busY0 + wi * 13;
          const lastX = b.shared ? devX(b.nDev - 1) + 26 : devX(0) + 26;
          return (
            <g key={w}>
              <line x1={mcuX + mcuW} y1={yy} x2={lastX} y2={yy} stroke="var(--text-muted)" strokeWidth="1.3" />
              <text x={mcuX + mcuW + 3} y={yy - 3} fontSize="7.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">{w}</text>
              {wi === 0 && (sel === "I2C") && (
                <text x={mcuX + mcuW + 30} y={yy - 3} fontSize="7" fill="oklch(0.55 0.18 22)">+ pull-up</text>
              )}
            </g>
          );
        })}

        {/* devices */}
        {devs.map((i) => {
          const x = devX(i);
          const dy = 78;
          return (
            <g key={i}>
              {/* drop line from bus to device */}
              {b.wires.map((w, wi) => (
                <line key={w} x1={x + 13} y1={busY0 + wi * 13} x2={x + 13} y2={dy} stroke="var(--text-muted)" strokeWidth="0.9" />
              ))}
              {/* CS line (SPI) */}
              {b.cs && (
                <>
                  <line x1={mcuX + mcuW} y1={mcuY + mcuH - 6} x2={x + 26} y2={mcuY + mcuH - 6 + 0} stroke="oklch(0.55 0.18 22)" strokeWidth="0.8" />
                  <line x1={x + 26} y1={mcuY + mcuH - 6} x2={x + 26} y2={dy} stroke="oklch(0.55 0.18 22)" strokeWidth="0.8" />
                  <text x={x + 30} y={mcuY + mcuH - 8} fontSize="6.5" fill="oklch(0.55 0.18 22)">CS{i + 1}</text>
                </>
              )}
              <rect x={x} y={dy} width={28} height={26} rx="4" fill="var(--bg-card)" stroke="var(--line-strong)" />
              <text x={x + 14} y={dy + 16} textAnchor="middle" fontSize="8" fill="var(--text)">S{i + 1}</text>
            </g>
          );
        })}

        {/* count note */}
        <text x={W - 8} y={H - 8} textAnchor="end" fontSize="8.5" fontFamily="var(--font-mono)" fill={accent}>
          {sel === "UART" ? "point-to-point" : `${b.wires.length}${b.cs ? "+CS" : ""} vodiče, sdílené`}
        </text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "3px 10px", padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)" }}>vodiče:</span>
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>{b.wires.join(" · ")}{b.cs ? " + CS/zařízení" : ""}</span>
        <span style={{ color: "var(--text-muted)" }}>časování:</span>
        <span style={{ color: "var(--text)" }}>{b.sync}</span>
        <span style={{ color: "var(--text-muted)" }}>adresace:</span>
        <span style={{ color: "var(--text)" }}>{b.addr}</span>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{b.note}</div>
    </div>
  );
}

const tab = {
  padding: "4px 12px",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  border: "1px solid var(--line)",
  borderRadius: 5,
  cursor: "pointer",
};
