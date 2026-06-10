// LSB steganografie — schovej bity zprávy do nejnižších bitů pixelů.
// Slider: kolik LSB použít (1-4). Zobrazí originál vs. stego + chi-square detekci.
import { useMemo, useState } from "react";

const W = 32, H = 32;

// Procedurální gradient — má dostatek "místa" pro skrytí
function generateCover() {
  const px = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const r = Math.floor(100 + 100 * Math.sin(x / 8) + 30 * Math.cos(y / 6));
    const g = Math.floor(120 + 80 * Math.cos(y / 7));
    const b = Math.floor(140 + 70 * Math.sin((x + y) / 10));
    px.push([Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b))]);
  }
  return px;
}

function embedLSB(cover, msgBytes, numLsb) {
  const out = cover.map((p) => [...p]);
  const mask = (0xFF << numLsb) & 0xFF;
  let bitIdx = 0;
  const totalBits = msgBytes.length * 8;
  for (let i = 0; i < out.length && bitIdx < totalBits; i++) {
    for (let ch = 0; ch < 3 && bitIdx < totalBits; ch++) {
      // Extract numLsb bits of message starting at bitIdx
      let chunk = 0;
      for (let b = 0; b < numLsb && bitIdx < totalBits; b++) {
        const byteI = Math.floor(bitIdx / 8);
        const bitI = bitIdx % 8;
        const bit = (msgBytes[byteI] >> (7 - bitI)) & 1;
        chunk = (chunk << 1) | bit;
        bitIdx++;
      }
      out[i][ch] = (out[i][ch] & mask) | chunk;
    }
  }
  return { stego: out, bitsHidden: bitIdx };
}

function chiSquare(pixels, numLsb) {
  // simplified chi^2 test on LSB pairs (Westfeld-Pfitzmann)
  // For each channel, count adjacent value pairs (2k, 2k+1). Random → roughly equal.
  // Here we count globally: parity distribution per channel of lowest 2^numLsb buckets
  const N = 1 << numLsb;
  const totals = [new Array(N).fill(0), new Array(N).fill(0), new Array(N).fill(0)];
  for (const px of pixels) {
    for (let ch = 0; ch < 3; ch++) {
      totals[ch][px[ch] & (N - 1)]++;
    }
  }
  let chi2 = 0;
  for (let ch = 0; ch < 3; ch++) {
    const sum = totals[ch].reduce((a, b) => a + b, 0);
    const expected = sum / N;
    for (let i = 0; i < N; i++) {
      const diff = totals[ch][i] - expected;
      chi2 += (diff * diff) / expected;
    }
  }
  return chi2;
}

export default function LsbSteganografie() {
  const [numLsb, setNumLsb] = useState(1);
  const [message, setMessage] = useState("SECRET MESSAGE!");
  const [showDiff, setShowDiff] = useState(false);

  const cover = useMemo(() => generateCover(), []);
  const msgBytes = useMemo(() => message.split("").map((c) => c.charCodeAt(0)), [message]);
  const { stego, bitsHidden } = useMemo(() => embedLSB(cover, msgBytes, numLsb), [cover, msgBytes, numLsb]);

  const coverChi2 = useMemo(() => chiSquare(cover, numLsb), [cover, numLsb]);
  const stegoChi2 = useMemo(() => chiSquare(stego, numLsb), [stego, numLsb]);

  const capacity = cover.length * 3 * numLsb;

  function pxToHex([r, g, b]) {
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <label style={lbl}>Zpráva:</label>
        <input value={message} onChange={(e) => setMessage(e.target.value.slice(0, 24))} style={inp} maxLength={24} />
        <label style={lbl}>počet LSB: {numLsb}</label>
        <input type="range" className="viz-slider" min={1} max={4} value={numLsb} onChange={(e) => setNumLsb(+e.target.value)} />
        <label style={{ ...lbl, display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={showDiff} onChange={(e) => setShowDiff(e.target.checked)} />
          zvýraznit změněné pixely (×8)
        </label>
      </div>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginBottom: 4 }}>cover</div>
          <svg viewBox={`0 0 ${W * 8} ${H * 8}`} style={{ width: 220, height: 220, border: "1px solid var(--line)" }}>
            {cover.map((p, i) => {
              const x = (i % W) * 8, y = Math.floor(i / W) * 8;
              return <rect key={i} x={x} y={y} width={8} height={8} fill={pxToHex(p)} />;
            })}
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginBottom: 4 }}>
            stego (skryto {bitsHidden} b)
          </div>
          <svg viewBox={`0 0 ${W * 8} ${H * 8}`} style={{ width: 220, height: 220, border: "1px solid var(--line)" }}>
            {stego.map((p, i) => {
              const x = (i % W) * 8, y = Math.floor(i / W) * 8;
              const orig = cover[i];
              const changed = p[0] !== orig[0] || p[1] !== orig[1] || p[2] !== orig[2];
              let display = p;
              if (showDiff && changed) {
                // amplify diff by 8x for visibility
                display = p.map((v, ch) => Math.min(255, Math.max(0, orig[ch] + (v - orig[ch]) * 8)));
              }
              return <rect key={i} x={x} y={y} width={8} height={8} fill={pxToHex(display)} />;
            })}
          </svg>
        </div>
      </div>

      <div style={section}>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Kapacita / využití:</div>
        <div style={mono}>
          {numLsb} bit/kanál × {cover.length} pixelů × 3 kanály = <b>{capacity} b</b> ({Math.floor(capacity / 8)} B kapacity)<br />
          Skryto: <b style={{ color: "var(--accent)" }}>{bitsHidden} b</b> ({(100 * bitsHidden / capacity).toFixed(1)} %)
        </div>
      </div>

      <div style={section}>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Chi-kvadrát test (Westfeld-Pfitzmann, na LSB distribuci):</div>
        <div style={mono}>
          χ²(cover) = <b>{coverChi2.toFixed(1)}</b><br />
          χ²(stego) = <b style={{ color: stegoChi2 < coverChi2 * 0.5 ? "#e07a5f" : "var(--accent)" }}>
            {stegoChi2.toFixed(1)}
          </b>{" "}
          <span style={{ color: "var(--text-faint)" }}>
            ({stegoChi2 < coverChi2 * 0.5 ? "↓ podezřele rovnoměrná LSB distribuce — detekováno" : "obě podobné — slabší signál"})
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Vyšší numLsb = více skryté kapacity, ale větší vizuální stopa a snadnější detekce.
        1 LSB je vizuálně nedetekovatelné (změna pixelu ±1/256), 4 LSB začínají být patrné.
        Obrana detekce: <b>adaptivní steganografie</b> (HUGO, S-UNIWARD) — vepisuje do texturně bohatých oblastí.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const lbl = { fontSize: 11, color: "var(--text-muted)" };
const inp = { padding: "3px 6px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 12, fontFamily: "var(--font-mono)", width: 180 };
const section = { background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
const mono = { fontFamily: "var(--font-mono)", color: "var(--text)", fontSize: 11, lineHeight: 1.6 };
