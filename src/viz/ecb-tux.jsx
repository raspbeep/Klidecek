// Block cipher modes — slavný "ECB Tux" demo.
// Procedurálně vygenerovaný "obrázek" (logo / čtverce) zašifrovaný jako 8-bit bloky:
// ECB: identické bloky → identické šifrované → struktura viditelná.
// CBC/CTR/GCM: každý blok jiný → vypadá náhodně.
import { useMemo, useState } from "react";

const W = 32, H = 32; // 32x32 image in 8-bit "blocks"

// Simple deterministic "image": stylized smiley
function genImage() {
  const pixels = new Array(W * H).fill(0);
  function set(x, y, v) { if (x >= 0 && x < W && y >= 0 && y < H) pixels[y * W + x] = v; }
  // background
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x - 16, dy = y - 16;
    if (dx * dx + dy * dy < 220) set(x, y, 1); // face
  }
  // eyes
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
    set(11 + dx, 12 + dy, 0);
    set(21 + dx, 12 + dy, 0);
  }
  // smile
  for (let x = 10; x <= 22; x++) {
    const y = Math.round(22 + 3 * Math.sin((x - 10) / 12 * Math.PI));
    set(x, y, 0);
    set(x, y + 1, 0);
  }
  // border noise to ensure many distinct blocks too
  return pixels;
}

// Each "block" is a single pixel (1 byte). For ECB, equal pixels → equal cipher.
// For CBC/CTR, we feed prev ciphertext / counter; simulated cipher: pseudo-random of block.
function hash32(seed) {
  let x = seed | 0;
  x = (x ^ (x << 13)) | 0;
  x = (x ^ (x >>> 17)) | 0;
  x = (x ^ (x << 5)) | 0;
  return (x >>> 0) % 256;
}
function fakeAes(block, key) {
  // 0..255 → 0..255, deterministic, "looks random"
  return hash32(block * 2654435761 + key * 1597334677);
}

function encryptECB(pixels, key) {
  return pixels.map((p) => fakeAes(p, key));
}
function encryptCBC(pixels, key, iv) {
  const out = [];
  let prev = iv;
  for (const p of pixels) {
    const c = fakeAes(p ^ prev, key);
    out.push(c);
    prev = c;
  }
  return out;
}
function encryptCTR(pixels, key, nonce) {
  return pixels.map((p, i) => p ^ fakeAes(nonce + i, key));
}

const MODES = {
  Plaintext: (px) => px,
  "ECB (slabý)": (px) => encryptECB(px, 0x42),
  "CBC": (px) => encryptCBC(px, 0x42, 0xAB),
  "CTR": (px) => encryptCTR(px, 0x42, 0x100),
  "GCM-like": (px) => encryptCTR(px, 0x99, 0x500),
};

export default function EcbTux() {
  const [mode, setMode] = useState("Plaintext");
  const original = useMemo(() => genImage(), []);
  const encrypted = useMemo(() => MODES[mode](original), [original, mode]);

  const SVGW = 480, CELL = SVGW / W / 2;

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <label style={lbl}>Režim:</label>
        {Object.keys(MODES).map((m) => (
          <button key={m} className="viz-btn" data-active={mode === m} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, textAlign: "center" }}>plaintext</div>
          <svg viewBox={`0 0 ${W * 8} ${H * 8}`} style={{ width: 220, height: 220, background: "#fff", border: "1px solid var(--line)" }}>
            {original.map((p, i) => {
              const x = (i % W) * 8, y = Math.floor(i / W) * 8;
              return <rect key={i} x={x} y={y} width={8} height={8} fill={p ? "#000" : "#fff"} />;
            })}
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, textAlign: "center" }}>{mode}</div>
          <svg viewBox={`0 0 ${W * 8} ${H * 8}`} style={{ width: 220, height: 220, background: "#fff", border: "1px solid var(--line)" }}>
            {encrypted.map((c, i) => {
              const x = (i % W) * 8, y = Math.floor(i / W) * 8;
              const intensity = mode === "Plaintext" ? (c ? 0 : 255) : c;
              const hex = intensity.toString(16).padStart(2, "0");
              return <rect key={i} x={x} y={y} width={8} height={8} fill={`#${hex}${hex}${hex}`} />;
            })}
          </svg>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Každý pixel = 1 "blok". V <b>ECB</b>: stejné plaintext bloky (např. plocha pozadí) →
        stejné šifrované bloky → struktura prosvítá. V <b>CBC/CTR/GCM</b>: každý blok závisí
        na předchozím nebo na čítači → vypadá náhodně.
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        AES sám o sobě je matematicky robustní — ale v ECB režimu uniká strukturu obrazu i s 256-bitovým klíčem.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const lbl = { fontSize: 12, color: "var(--text-muted)" };
