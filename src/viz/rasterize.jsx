// Triangle rasterization demo: drag the vertices, pixels turn on when all three
// edge functions agree.
import { useState, useRef, useEffect } from "react";

export default function Rasterize() {
  const [tri, setTri] = useState([[40, 30], [220, 50], [120, 160]]);
  const [drag, setDrag] = useState(null);
  const ref = useRef(null);
  const W = 280, H = 180, PIX = 10;

  const pointer = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return [
      ((p.clientX - rect.left) / rect.width) * W,
      ((p.clientY - rect.top) / rect.height) * H,
    ];
  };
  const onDown = (i) => (e) => { e.preventDefault(); setDrag(i); };
  useEffect(() => {
    if (drag === null) return;
    const move = (e) => {
      const [x, y] = pointer(e);
      setTri((t) => t.map((p, i) => i === drag ? [Math.max(6, Math.min(W-6, x)), Math.max(6, Math.min(H-6, y))] : p));
    };
    const up = () => setDrag(null);
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

  const edge = (a, b, p) => (p[0]-a[0])*(b[1]-a[1]) - (p[1]-a[1])*(b[0]-a[0]);
  const pixels = [];
  for (let y = 0; y < H; y += PIX) {
    for (let x = 0; x < W; x += PIX) {
      const p = [x + PIX/2, y + PIX/2];
      const e0 = edge(tri[0], tri[1], p);
      const e1 = edge(tri[1], tri[2], p);
      const e2 = edge(tri[2], tri[0], p);
      const inside = (e0 >= 0 && e1 >= 0 && e2 >= 0) || (e0 <= 0 && e1 <= 0 && e2 <= 0);
      if (inside) pixels.push([x, y]);
    }
  }

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", touchAction: "none", maxWidth: 400 }}>
      <rect width={W} height={H} fill="var(--bg-inset)" />
      <g stroke="var(--line)" strokeWidth="0.5">
        {Array.from({ length: Math.ceil(W/PIX)+1 }, (_, i) => <line key={"vl"+i} x1={i*PIX} y1={0} x2={i*PIX} y2={H}/>)}
        {Array.from({ length: Math.ceil(H/PIX)+1 }, (_, i) => <line key={"hl"+i} x1={0} y1={i*PIX} x2={W} y2={i*PIX}/>)}
      </g>
      {pixels.map(([x,y], i) => (
        <rect key={i} x={x+0.5} y={y+0.5} width={PIX-1} height={PIX-1} fill="var(--accent)" opacity="0.42"/>
      ))}
      <polygon points={tri.map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="1.5"/>
      {tri.map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="7" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="2"
          onMouseDown={onDown(i)} onTouchStart={onDown(i)} style={{ cursor: "grab" }}/>
      ))}
    </svg>
  );
}
