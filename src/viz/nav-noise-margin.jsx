// Šumová imunita (noise margin) mezi vysílačem a přijímačem.
// Slider mění napájení vysílače; viz ukazuje, zda V_OH/V_OL stále překlenou
// vstupní prahy přijímače V_IH/V_IL a kolik zbývá imunity.
import { useState } from "react";

const W = 460, H = 240;

// Přijímač: pevný 3,3V CMOS (typické prahy)
const RX = { vcc: 3.3, vih: 2.0, vil: 0.8, label: "přijímač (LVTTL vstup)" };

export default function NavNoiseMargin() {
  // napájení vysílače 1.8–5 V
  const [vtx, setVtx] = useState(5.0);

  // typický CMOS výstup: V_OH ≈ vcc − 0,1 ; V_OL ≈ 0,1 (zatížení malé)
  const voh = Math.max(0, vtx - 0.1);
  const vol = 0.1;

  const nmH = voh - RX.vih; // imunita pro H
  const nmL = RX.vil - vol; // imunita pro L
  const okH = nmH >= 0;
  const okL = nmL >= 0;

  const vmax = 5.5;
  const padB = 28, padT = 26;
  const x0 = 70, axH = H - padB;
  const toY = (v) => axH - (v / vmax) * (axH - padT);

  const okCol = "oklch(0.62 0.15 150)";
  const badCol = "oklch(0.62 0.19 25)";

  const tick = (v) => (
    <g key={v}>
      <line x1={x0 - 4} y1={toY(v)} x2={x0} y2={toY(v)} stroke="var(--line-strong)" strokeWidth="0.8" />
      <text x={x0 - 8} y={toY(v) + 3.5} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">{v.toFixed(1)}</text>
    </g>
  );

  const band = (xc, bw, yTop, yBot, fill, stroke) => (
    <rect x={xc - bw / 2} y={Math.min(yTop, yBot)} width={bw} height={Math.abs(yBot - yTop)} rx="3" fill={fill} stroke={stroke} strokeWidth="1" />
  );

  const txX = x0 + 95, rxX = x0 + 300;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 480 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />
        {/* osa napětí */}
        <line x1={x0} y1={padT} x2={x0} y2={axH} stroke="var(--line-strong)" strokeWidth="1" />
        <text x={x0 - 8} y={padT - 8} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">V</text>
        {[0, 1, 2, 3, 4, 5].map(tick)}

        {/* sloupce */}
        <text x={txX} y={padT - 8} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text)">vysílač {vtx.toFixed(1)} V</text>
        <text x={rxX} y={padT - 8} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--text)">přijímač 3,3 V</text>

        {/* vysílač: zaručené pásmo H (V_OH..vtx) a L (0..V_OL) */}
        {band(txX, 70, toY(vtx), toY(voh), "oklch(0.62 0.15 150 / 0.18)", "oklch(0.62 0.15 150)")}
        {band(txX, 70, toY(vol), toY(0), "oklch(0.62 0.15 230 / 0.18)", "oklch(0.62 0.15 230)")}
        <line x1={txX - 35} y1={toY(voh)} x2={txX + 35} y2={toY(voh)} stroke="oklch(0.62 0.15 150)" strokeWidth="1.5" />
        <line x1={txX - 35} y1={toY(vol)} x2={txX + 35} y2={toY(vol)} stroke="oklch(0.62 0.15 230)" strokeWidth="1.5" />
        <text x={txX} y={(toY(vtx) + toY(voh)) / 2 + 3} textAnchor="middle" fontSize="9" fontWeight="600" fill="oklch(0.50 0.15 150)">H výstup</text>
        <text x={txX} y={(toY(vol) + toY(0)) / 2 + 3} textAnchor="middle" fontSize="9" fontWeight="600" fill="oklch(0.50 0.15 230)">L výstup</text>
        <text x={txX + 40} y={toY(voh) + 3} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">V_OH {voh.toFixed(1)}</text>
        <text x={txX + 40} y={toY(vol) + 3} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">V_OL {vol.toFixed(1)}</text>

        {/* přijímač: prahové linie V_IH, V_IL */}
        <line x1={rxX - 60} y1={toY(RX.vih)} x2={rxX + 35} y2={toY(RX.vih)} stroke={okH ? okCol : badCol} strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1={rxX - 60} y1={toY(RX.vil)} x2={rxX + 35} y2={toY(RX.vil)} stroke={okL ? okCol : badCol} strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={rxX + 40} y={toY(RX.vih) + 3} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">V_IH {RX.vih.toFixed(1)}</text>
        <text x={rxX + 40} y={toY(RX.vil) + 3} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">V_IL {RX.vil.toFixed(1)}</text>

        {/* šipky šumové imunity mezi V_OH a V_IH, V_IL a V_OL */}
        <line x1={rxX - 50} y1={toY(voh)} x2={rxX - 50} y2={toY(RX.vih)} stroke={okH ? okCol : badCol} strokeWidth="1.4" markerStart="url(#nmA)" markerEnd="url(#nmA)" />
        <line x1={rxX - 50} y1={toY(RX.vil)} x2={rxX - 50} y2={toY(vol)} stroke={okL ? okCol : badCol} strokeWidth="1.4" markerStart="url(#nmA)" markerEnd="url(#nmA)" />
        <text x={rxX - 46} y={(toY(voh) + toY(RX.vih)) / 2 + 3} fontSize="8.5" fontWeight="600" fill={okH ? okCol : badCol}>NM_H</text>
        <text x={rxX - 46} y={(toY(RX.vil) + toY(vol)) / 2 + 3} fontSize="8.5" fontWeight="600" fill={okL ? okCol : badCol}>NM_L</text>

        <defs>
          <marker id="nmA" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,2 L5,5 L0,8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </marker>
        </defs>
      </svg>

      <input type="range" min={1.8} max={5.0} step={0.1} value={vtx}
        onChange={(e) => setVtx(+e.target.value)} style={{ width: "100%" }} />

      <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
        <span>V_TX = {vtx.toFixed(1)} V</span>
        <span style={{ color: okH ? okCol : badCol }}>NM_H = {nmH.toFixed(1)} V {okH ? "✓" : "✗ pod prahem"}</span>
        <span style={{ color: okL ? okCol : badCol }}>NM_L = {nmL.toFixed(1)} V {okL ? "✓" : "✗"}</span>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {okH
          ? `V_OH ${voh.toFixed(1)} V překlene práh V_IH ${RX.vih.toFixed(1)} V se zásobou ${nmH.toFixed(1)} V — log. 1 se přenese.`
          : `V_OH ${voh.toFixed(1)} V nedosáhne prahu V_IH ${RX.vih.toFixed(1)} V → přijímač nepřečte spolehlivě log. 1. Nutný převodník nahoru.`}
      </div>
    </div>
  );
}
