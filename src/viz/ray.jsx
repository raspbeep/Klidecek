// Ray-sphere intersection demo.
import { useState, useRef, useEffect } from "react";

export default function Ray() {
  const [origin, setOrigin] = useState([30, 90]);
  const [drag, setDrag] = useState(false);
  const ref = useRef(null);
  const W = 280, H = 180;
  const spheres = [
    { c: [120, 70],  r: 28, color: "oklch(0.65 0.16 264)" },
    { c: [200, 110], r: 22, color: "oklch(0.65 0.16 22)" },
    { c: [150, 140], r: 18, color: "oklch(0.65 0.16 142)" },
  ];
  const target = [W - 10, 90];
  const d = [target[0] - origin[0], target[1] - origin[1]];
  const dlen = Math.hypot(d[0], d[1]) || 1;
  const dir = [d[0] / dlen, d[1] / dlen];

  let bestT = Infinity, hitS = null, hitP = null;
  for (const s of spheres) {
    const oc = [origin[0] - s.c[0], origin[1] - s.c[1]];
    const B = 2 * (oc[0]*dir[0] + oc[1]*dir[1]);
    const C = oc[0]*oc[0] + oc[1]*oc[1] - s.r*s.r;
    const disc = B*B - 4*C;
    if (disc < 0) continue;
    const t = (-B - Math.sqrt(disc)) / 2;
    if (t > 0 && t < bestT) {
      bestT = t; hitS = s;
      hitP = [origin[0] + dir[0] * t, origin[1] + dir[1] * t];
    }
  }
  const tEnd = bestT === Infinity ? 400 : bestT;

  const pointer = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return [((p.clientX - rect.left) / rect.width) * W, ((p.clientY - rect.top) / rect.height) * H];
  };
  useEffect(() => {
    if (!drag) return;
    const move = (e) => setOrigin(pointer(e));
    const up = () => setDrag(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [drag]);

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", touchAction: "none", maxWidth: 400 }}>
      <rect width={W} height={H} fill="var(--bg-inset)" />
      {spheres.map((s, i) => (
        <circle key={i} cx={s.c[0]} cy={s.c[1]} r={s.r}
          fill={s === hitS ? s.color : "var(--bg-card)"}
          stroke={s.color} strokeWidth="1.5"
          opacity={s === hitS ? 0.9 : 0.6} />
      ))}
      <line x1={origin[0]} y1={origin[1]} x2={origin[0] + dir[0] * tEnd} y2={origin[1] + dir[1] * tEnd}
        stroke="var(--accent)" strokeWidth="1.5" strokeDasharray={hitS ? "" : "3 3"} />
      {hitP && <circle cx={hitP[0]} cy={hitP[1]} r="3" fill="var(--accent)" />}
      <circle cx={origin[0]} cy={origin[1]} r="7" fill="var(--bg-card)"
        stroke="var(--accent)" strokeWidth="2"
        onMouseDown={(e) => { e.preventDefault(); setDrag(true); }}
        onTouchStart={(e) => { e.preventDefault(); setDrag(true); }}
        style={{ cursor: "grab" }} />
    </svg>
  );
}
