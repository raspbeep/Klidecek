// wap-http-hol — Head-of-Line blocking napříč HTTP/1.1, HTTP/2 a HTTP/3.
// Tři logické streamy (A, B, C) posílají rámce přes sdílený transport.
// Uživatel vybere verzi a "ztratí" paket jednoho streamu; viz ukáže,
// které streamy se zastaví:
//   HTTP/1.1 — žádný multiplexing, vše čeká za první (aplikační HoL).
//   HTTP/2   — multiplex nad TCP; ztráta paketu zadrží VŠECHNY streamy
//              (transportní HoL — TCP doručuje seřazeně).
//   HTTP/3   — QUIC nad UDP; zdrží se JEN zasažený stream.
import { useState } from "react";

const GREEN = "oklch(0.52 0.16 142)";
const RED = "oklch(0.55 0.18 22)";
const AMBER = "oklch(0.62 0.15 70)";
const ACCENT = "oklch(0.55 0.16 264)";

const STREAMS = ["A", "B", "C"];
const VERSIONS = ["HTTP/1.1", "HTTP/2", "HTTP/3"];

// počet rámců na stream; index "ztraceného" rámce
const FRAMES = 5;
const LOST_AT = 2;

function statusFor(version, stream, lostStream) {
  // Vrátí pole délky FRAMES: "ok" | "lost" | "blocked"
  const out = [];
  for (let i = 0; i < FRAMES; i++) {
    if (version === "HTTP/1.1") {
      // Bez multiplexu: vše jde sériově A→B→C. Zaseknutí na ztrátě
      // zablokuje daný rámec i vše za ním (i v dalších streamech).
      const order = STREAMS.indexOf(stream);
      const lostOrder = STREAMS.indexOf(lostStream);
      if (stream === lostStream && i === LOST_AT) out.push("lost");
      else if (order > lostOrder) out.push("blocked");
      else if (order === lostOrder && i > LOST_AT) out.push("blocked");
      else out.push("ok");
    } else if (version === "HTTP/2") {
      // Multiplex nad TCP: ztráta paketu zadrží všechny streamy
      // od bodu ztráty dál (transportní HoL).
      if (stream === lostStream && i === LOST_AT) out.push("lost");
      else if (i >= LOST_AT) out.push("blocked");
      else out.push("ok");
    } else {
      // HTTP/3 / QUIC: nezávislé streamy — zdrží se jen zasažený.
      if (stream === lostStream && i === LOST_AT) out.push("lost");
      else if (stream === lostStream && i > LOST_AT) out.push("blocked");
      else out.push("ok");
    }
  }
  return out;
}

const colorFor = (s) =>
  s === "lost" ? RED : s === "blocked" ? AMBER : GREEN;

export default function WapHttpHol() {
  const [version, setVersion] = useState("HTTP/2");
  const [lostStream, setLostStream] = useState("A");

  const W = 460;
  const rowH = 40;
  const top = 16;
  const labelW = 70;
  const cellW = (W - labelW - 16) / FRAMES;

  // Souhrn: kolik streamů je dotčeno (má aspoň jeden blocked/lost rámec)
  const grids = STREAMS.map((st) => ({
    st,
    cells: statusFor(version, st, lostStream),
  }));
  const stalled = grids.filter((g) =>
    g.cells.some((c) => c === "blocked" || c === "lost")
  ).length;

  const note =
    version === "HTTP/1.1"
      ? "Bez multiplexu: rámce jdou sériově. Ztráta zastaví zasažený rámec i vše za ním (aplikační HoL)."
      : version === "HTTP/2"
      ? "Multiplex nad TCP: streamy jsou nezávislé na úrovni HTTP, ale TCP doručuje seřazeně — ztráta jednoho paketu zadrží VŠECHNY streamy (transportní HoL)."
      : "QUIC nad UDP: streamy doručovány nezávisle — zastaví se JEN zasažený stream, ostatní jedou dál.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Ovládání */}
      <div
        className="viz-controls"
        style={{
          gap: 12,
          padding: 8,
          background: "var(--bg-inset)",
          borderRadius: 8,
          fontSize: 11.5,
        }}
      >
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>verze:</span>
        {VERSIONS.map((v) => (
          <label key={v} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="radio"
              name="wap-hol-version"
              checked={version === v}
              onChange={() => setVersion(v)}
            />
            <span style={{ fontFamily: "var(--font-mono)" }}>{v}</span>
          </label>
        ))}
        <span style={{ color: "var(--text-muted)", fontWeight: 600, marginLeft: 6 }}>
          ztratit paket streamu:
        </span>
        <select
          className="viz-select"
          value={lostStream}
          onChange={(e) => setLostStream(e.target.value)}
        >
          {STREAMS.map((s) => (
            <option key={s} value={s}>
              stream {s}
            </option>
          ))}
        </select>
      </div>

      <svg viewBox={`0 0 ${W} ${top + STREAMS.length * rowH + 16}`} style={{ width: "100%", maxWidth: W }}>
        <text x="0" y="10" fontSize="9" fill="var(--text-faint)">
          přenos v čase →
        </text>
        {grids.map((g, r) => {
          const y = top + r * rowH;
          return (
            <g key={g.st}>
              <text
                x="2"
                y={y + rowH / 2 + 4}
                fontSize="11"
                fontWeight="600"
                fill={g.st === lostStream ? RED : ACCENT}
                fontFamily="var(--font-mono)"
              >
                stream {g.st}
              </text>
              {g.cells.map((c, i) => {
                const x = labelW + i * cellW;
                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={y + 4}
                      width={cellW - 5}
                      height={rowH - 12}
                      rx="3"
                      fill={`color-mix(in oklch, ${colorFor(c)} 18%, transparent)`}
                      stroke={colorFor(c)}
                      strokeWidth={c === "lost" ? 1.8 : 1}
                      strokeDasharray={c === "blocked" ? "3 2" : "0"}
                    />
                    <text
                      x={x + (cellW - 5) / 2}
                      y={y + rowH / 2 + 4}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontFamily="var(--font-mono)"
                      fill={colorFor(c)}
                    >
                      {c === "lost" ? "✕" : c === "blocked" ? "…" : g.st + (i + 1)}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Legenda */}
      <div style={{ display: "flex", gap: 14, fontSize: 10.5, color: "var(--text-muted)", flexWrap: "wrap" }}>
        <span><span style={{ color: GREEN, fontWeight: 700 }}>■</span> doručeno</span>
        <span><span style={{ color: RED, fontWeight: 700 }}>✕</span> ztracený paket</span>
        <span><span style={{ color: AMBER, fontWeight: 700 }}>…</span> zablokováno (čeká)</span>
      </div>

      <div
        style={{
          fontSize: 12,
          color: "var(--text)",
          lineHeight: 1.5,
          padding: "8px 10px",
          background: "var(--bg-card)",
          borderRadius: 6,
          border: "1px solid var(--line)",
        }}
      >
        <strong style={{ color: stalled > 1 ? RED : stalled === 1 ? AMBER : GREEN }}>
          Zaseknuto {stalled} ze {STREAMS.length} streamů.
        </strong>{" "}
        <span style={{ color: "var(--text-muted)" }}>{note}</span>
      </div>
    </div>
  );
}
