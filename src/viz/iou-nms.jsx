// IoU + Non-Max Suppression demo.
// Drag two boxes -> see intersection/union and IoU. Toggle NMS: the lower-score
// box is suppressed when IoU exceeds the threshold (slider).
import { useState, useRef } from "react";

export default function IouNms() {
  const W = 300, H = 200;
  // boxes as {x, y, w, h, score}
  const [boxA, setBoxA] = useState({ x: 60, y: 55, w: 110, h: 90, score: 0.92 });
  const [boxB, setBoxB] = useState({ x: 120, y: 80, w: 110, h: 85, score: 0.74 });
  const [nms, setNms] = useState(false);
  const [thr, setThr] = useState(0.5);
  const svgRef = useRef(null);
  const drag = useRef(null);

  // intersection rectangle
  const ix1 = Math.max(boxA.x, boxB.x);
  const iy1 = Math.max(boxA.y, boxB.y);
  const ix2 = Math.min(boxA.x + boxA.w, boxB.x + boxB.w);
  const iy2 = Math.min(boxA.y + boxA.h, boxB.y + boxB.h);
  const iw = Math.max(0, ix2 - ix1);
  const ih = Math.max(0, iy2 - iy1);
  const inter = iw * ih;
  const union = boxA.w * boxA.h + boxB.w * boxB.h - inter;
  const iou = union > 0 ? inter / union : 0;

  // which box wins / gets suppressed under NMS
  const winner = boxA.score >= boxB.score ? "A" : "B";
  const loser = winner === "A" ? "B" : "A";
  const suppressed = nms && iou > thr; // loser gets removed

  const toLocal = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return { x: (cx / r.width) * W, y: (cy / r.height) * H };
  };

  const onDown = (which) => (e) => {
    e.preventDefault();
    const p = toLocal(e);
    const b = which === "A" ? boxA : boxB;
    drag.current = { which, dx: p.x - b.x, dy: p.y - b.y };
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const p = toLocal(e);
    const set = drag.current.which === "A" ? setBoxA : setBoxB;
    set((b) => {
      const nx = Math.min(W - b.w, Math.max(0, p.x - drag.current.dx));
      // horní mez 14 (ne 0): nad boxem musí zůstat místo na popisek se skóre
      // (label rect je na y = b.y - 14), jinak by se ořízl mimo viewBox
      const ny = Math.min(H - b.h, Math.max(14, p.y - drag.current.dy));
      return { ...b, x: nx, y: ny };
    });
  };
  const onUp = () => { drag.current = null; };

  const boxStyle = (id) => {
    const isSup = suppressed && id === loser;
    const isWin = nms && id === winner;
    return {
      stroke: isSup ? "var(--text-faint)" : (id === "A" ? "var(--accent)" : "var(--accent-line)"),
      opacity: isSup ? 0.3 : 1,
      strokeWidth: isWin ? 3 : 2,
      strokeDasharray: isSup ? "4 3" : "none",
    };
  };

  const drawBox = (b, id) => {
    const s = boxStyle(id);
    return (
      <g key={id} onMouseDown={onDown(id)} onTouchStart={onDown(id)} style={{ cursor: "move" }}>
        <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="transparent"
          stroke={s.stroke} strokeWidth={s.strokeWidth} opacity={s.opacity}
          strokeDasharray={s.strokeDasharray} rx="2" />
        <rect x={b.x} y={b.y - 14} width={62} height={13} fill={s.stroke} opacity={s.opacity * 0.9} rx="2" />
        <text x={b.x + 4} y={b.y - 4} fontSize="9" fontFamily="var(--font-mono)"
          fill="var(--bg-inset)" opacity={s.opacity}>
          {id} · {(id === "A" ? boxA.score : boxB.score).toFixed(2)}
        </text>
      </g>
    );
  };

  const iouColor = iou > thr ? "var(--accent)" : "var(--text)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", maxWidth: 440, display: "block", touchAction: "none" }}
        onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchMove={onMove} onTouchEnd={onUp}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* intersection fill */}
        {inter > 0 && !suppressed && (
          <rect x={ix1} y={iy1} width={iw} height={ih}
            fill="var(--accent)" opacity="0.22" />
        )}
        {drawBox(boxA, "A")}
        {drawBox(boxB, "B")}
        <text x={8} y={H - 8} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          táhni boxy · barevná plocha = průnik
        </text>
      </svg>

      <div className="viz-controls">
        <button className="viz-btn" data-active={nms} onClick={() => setNms((v) => !v)}>
          NMS {nms ? "zap" : "vyp"}
        </button>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>práh IoU:</span>
        <input type="range" className="viz-slider" min={0} max={100} value={Math.round(thr * 100)}
          onChange={(e) => setThr(+e.target.value / 100)} style={{ width: 110 }} />
      </div>

      <span className="viz-readout">
        průnik = {inter.toFixed(0)} · sjednocení = {union.toFixed(0)} ·{" "}
        <b style={{ color: iouColor }}>IoU = {iou.toFixed(2)}</b> · práh = {thr.toFixed(2)}
        {nms && (
          suppressed
            ? <> · NMS: <b style={{ color: "var(--accent)" }}>ponechán {winner}</b>, potlačen {loser}</>
            : <> · NMS: {iou <= thr ? "IoU ≤ práh → oba zůstávají" : "oba zůstávají"}</>
        )}
      </span>
    </div>
  );
}
