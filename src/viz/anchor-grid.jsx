// One-stage detector: grid of cells, anchor boxes, per-cell prediction.
// Click a cell, switch the anchor shape, and watch the predicted box / class /
// objectness change — the anchor that best matches the object gets high objectness.
import { useState } from "react";

export default function AnchorGrid() {
  const W = 300, H = 200;
  const G = 5;                       // 5x5 grid
  const cell = { w: (W - 40) / G, h: (H - 40) / G, ox: 20, oy: 20 };

  // ground-truth object (a "car": wide box) centered on cell (col 2, row 2)
  // center = (102+48, 77+23) = (150, 100) -> respC = floor((150-20)/52) = 2,
  // respR = floor((100-20)/32) = 2, takže výchozí výběr (2,2) = zodpovědná buňka.
  const obj = { x: 102, y: 77, w: 96, h: 46, cls: "auto" };

  // anchor templates (aspect ratios), relative size factors
  const anchors = [
    { name: "wide",  w: 70, h: 34 },  // matches the wide car well
    { name: "tall",  w: 30, h: 64 },
    { name: "square",w: 46, h: 46 },
  ];

  const [sel, setSel] = useState({ c: 2, r: 2 });
  const [ai, setAi] = useState(0);

  const cx = cell.ox + (sel.c + 0.5) * cell.w;
  const cy = cell.oy + (sel.r + 0.5) * cell.h;
  const a = anchors[ai];
  const anchorBox = { x: cx - a.w / 2, y: cy - a.h / 2, w: a.w, h: a.h };

  // IoU of this anchor with the object -> drives objectness
  const ix1 = Math.max(anchorBox.x, obj.x), iy1 = Math.max(anchorBox.y, obj.y);
  const ix2 = Math.min(anchorBox.x + anchorBox.w, obj.x + obj.w);
  const iy2 = Math.min(anchorBox.y + anchorBox.h, obj.y + obj.h);
  const iw = Math.max(0, ix2 - ix1), ih = Math.max(0, iy2 - iy1);
  const inter = iw * ih;
  const union = anchorBox.w * anchorBox.h + obj.w * obj.h - inter;
  const iou = union > 0 ? inter / union : 0;

  // cell responsible for the object = the cell containing the object center
  const objCx = obj.x + obj.w / 2, objCy = obj.y + obj.h / 2;
  const respC = Math.floor((objCx - cell.ox) / cell.w);
  const respR = Math.floor((objCy - cell.oy) / cell.h);
  const onObjectCell = sel.c === respC && sel.r === respR;

  // objectness: high only when this is the responsible cell AND anchor overlaps
  const objectness = onObjectCell ? Math.min(0.99, iou * 1.3) : 0.04 + iou * 0.4;
  const predClass = objectness > 0.5 ? obj.cls : "pozadí";

  // predicted box = anchor nudged toward the object (only if it's the object cell)
  const t = onObjectCell ? Math.min(1, iou * 1.6) : 0;
  const pred = {
    x: anchorBox.x + (obj.x - anchorBox.x) * t,
    y: anchorBox.y + (obj.y - anchorBox.y) * t,
    w: anchorBox.w + (obj.w - anchorBox.w) * t,
    h: anchorBox.h + (obj.h - anchorBox.h) * t,
  };

  const cells = [];
  for (let r = 0; r < G; r++)
    for (let c = 0; c < G; c++)
      cells.push({ c, r });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 440, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* ground-truth object */}
        <rect x={obj.x} y={obj.y} width={obj.w} height={obj.h}
          fill="var(--accent)" opacity="0.14" rx="3" />
        <text x={obj.x + obj.w / 2} y={obj.y + obj.h / 2 + 3} textAnchor="middle"
          fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">objekt</text>

        {/* grid + clickable cells */}
        {cells.map(({ c, r }) => {
          const x = cell.ox + c * cell.w, y = cell.oy + r * cell.h;
          const isSel = c === sel.c && r === sel.r;
          const isResp = c === respC && r === respR;
          return (
            <rect key={`${c}-${r}`} x={x} y={y} width={cell.w} height={cell.h}
              fill={isSel ? "var(--accent)" : "transparent"}
              fillOpacity={isSel ? 0.10 : 0}
              stroke={isResp ? "var(--accent-line)" : "var(--line)"}
              strokeWidth={isResp ? 1.4 : 0.7}
              onClick={() => setSel({ c, r })} style={{ cursor: "pointer" }} />
          );
        })}

        {/* anchor box (dashed) on selected cell */}
        <rect x={anchorBox.x} y={anchorBox.y} width={anchorBox.w} height={anchorBox.h}
          fill="none" stroke="var(--text-muted)" strokeWidth="1.3" strokeDasharray="3 2" rx="2" />
        {/* center dot */}
        <circle cx={cx} cy={cy} r="2.4" fill="var(--accent)" />

        {/* predicted box (solid) — only meaningful on the object cell */}
        {predClass !== "pozadí" && (
          <rect x={pred.x} y={pred.y} width={pred.w} height={pred.h}
            fill="none" stroke="var(--accent)" strokeWidth="2.4" rx="2" />
        )}

        <text x={20} y={14} fontSize="7.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          klikni buňku · čárkovaně = anchor · plně = predikce
        </text>
      </svg>

      <div className="viz-controls">
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>anchor:</span>
        {anchors.map((an, i) => (
          <button key={an.name} className="viz-btn" data-active={ai === i} onClick={() => setAi(i)}>
            {an.name}
          </button>
        ))}
      </div>

      <span className="viz-readout">
        buňka ({sel.c},{sel.r}){onObjectCell ? " · obsahuje střed objektu" : " · pozadí"} ·
        anchor {a.name} · IoU s objektem = {iou.toFixed(2)} ·{" "}
        objectness = <b style={{ color: objectness > 0.5 ? "var(--accent)" : "var(--text)" }}>{objectness.toFixed(2)}</b> ·
        třída = <b style={{ color: "var(--text)" }}>{predClass}</b>
      </span>
    </div>
  );
}
