// mindmap.jsx — radial mindmap of a course: center = course, ring 1 = topics,
// ring 2 = subtopics. Click a subtopic to jump into it.

import { useState, useMemo, useRef, useEffect } from "react";

export function Mindmap({ course, completedSet, onNavigate }) {
  const W = 720, H = 520;
  const cx = W / 2, cy = H / 2;
  const r1 = 110;
  const r2 = 220;

  const totalSubs = course.topics.reduce((s, t) => s + t.subtopics.length, 0) || 1;

  const ranges = useMemo(() => {
    let acc = -Math.PI / 2;
    return course.topics.map((t) => {
      const span = (t.subtopics.length / totalSubs) * Math.PI * 2;
      const from = acc;
      const to = acc + span;
      acc = to;
      return { topic: t, from, to, mid: (from + to) / 2 };
    });
  }, [course, totalSubs]);

  const hueFor = (i) => 264 + i * (360 / Math.max(1, course.topics.length));

  const [hover, setHover] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState([0, 0]);
  const dragRef = useRef(null);

  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.5, Math.min(2.5, z * delta)));
  };

  const onPanStart = (e) => {
    const p = e.touches ? e.touches[0] : e;
    dragRef.current = { x: p.clientX, y: p.clientY, px: pan[0], py: pan[1] };
  };

  useEffect(() => {
    const move = (e) => {
      if (!dragRef.current) return;
      const p = e.touches ? e.touches[0] : e;
      setPan([
        dragRef.current.px + (p.clientX - dragRef.current.x),
        dragRef.current.py + (p.clientY - dragRef.current.y),
      ]);
    };
    const up = () => { dragRef.current = null; };
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
  }, []);

  return (
    <div style={{ position: "relative", border: "0.5px solid var(--line)", borderRadius: "var(--r-lg)", overflow: "hidden", background: "var(--bg-card)" }}>
      <div style={{
        position: "absolute", top: 8, left: 12, zIndex: 5,
        fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)",
        textTransform: "uppercase", letterSpacing: "0.06em",
      }}>
        mindmap · drag to pan · scroll to zoom · tap a leaf to open
      </div>
      <div style={{ position: "absolute", top: 6, right: 8, zIndex: 5, display: "flex", gap: 4 }}>
        <button className="icon-btn" onClick={() => setZoom((z) => Math.min(2.5, z * 1.2))} aria-label="zoom in">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M8 11h6M11 8v6"/><path d="m20 20-3.5-3.5"/></svg>
        </button>
        <button className="icon-btn" onClick={() => setZoom((z) => Math.max(0.5, z / 1.2))} aria-label="zoom out">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M8 11h6"/><path d="m20 20-3.5-3.5"/></svg>
        </button>
        <button className="icon-btn" onClick={() => { setZoom(1); setPan([0, 0]); }} aria-label="reset">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5"/></svg>
        </button>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", width: "100%", touchAction: "none", cursor: dragRef.current ? "grabbing" : "grab", aspectRatio: `${W}/${H}` }}
        onWheel={onWheel}
        onMouseDown={onPanStart}
        onTouchStart={onPanStart}
      >
        <defs>
          <pattern id="mmgrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="0.8" fill="var(--line)" />
          </pattern>
          <filter id="softshadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="1" />
            <feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect width={W} height={H} fill="url(#mmgrid)" opacity="0.5" />

        <g transform={`translate(${pan[0]} ${pan[1]}) translate(${cx} ${cy}) scale(${zoom}) translate(${-cx} ${-cy})`}>
          {ranges.map((r, ti) => {
            const tx = cx + Math.cos(r.mid) * r1;
            const ty = cy + Math.sin(r.mid) * r1;
            const hue = hueFor(ti);
            const color = `oklch(0.62 0.14 ${hue})`;
            const colorSoft = `oklch(0.62 0.14 ${hue} / 0.10)`;
            return (
              <g key={r.topic.id}>
                <path
                  d={`M${cx} ${cy} Q ${(cx + tx) / 2} ${(cy + ty) / 2} ${tx} ${ty}`}
                  stroke={color} strokeWidth="1.5" fill="none" opacity="0.7"
                />

                {r.topic.subtopics.map((sub, si) => {
                  const subCount = r.topic.subtopics.length;
                  const span = Math.max(0.3, (r.to - r.from) * 0.85);
                  const a = subCount === 1
                    ? r.mid
                    : r.from + (r.to - r.from) * 0.5 - span / 2 + (si / (subCount - 1)) * span;
                  const sx = cx + Math.cos(a) * r2;
                  const sy = cy + Math.sin(a) * r2;
                  const done = completedSet.has(`${course.id}/${r.topic.id}/${sub.id}`);
                  const isHover = hover && hover.tid === r.topic.id && hover.sid === sub.id;

                  const cos = Math.cos(a), sin = Math.sin(a);
                  const labelOffset = 14;
                  const lx = sx + cos * labelOffset;
                  const ly = sy + sin * labelOffset;
                  const anchor = cos > 0.2 ? "start" : (cos < -0.2 ? "end" : "middle");
                  const words = (sub.title || sub.id).split(" ");
                  const lines = [];
                  let line = "";
                  for (const w of words) {
                    if ((line + " " + w).trim().length > 18) {
                      lines.push(line.trim()); line = w;
                    } else line += " " + w;
                  }
                  if (line.trim()) lines.push(line.trim());

                  return (
                    <g
                      key={sub.id}
                      style={{ cursor: "pointer" }}
                      onClick={(e) => { e.stopPropagation(); onNavigate(r.topic.id, sub.id); }}
                      onMouseEnter={() => setHover({ tid: r.topic.id, sid: sub.id })}
                      onMouseLeave={() => setHover(null)}
                    >
                      <path
                        d={`M${tx} ${ty} Q ${(tx + sx) / 2 + cos * 8} ${(ty + sy) / 2 + sin * 8} ${sx} ${sy}`}
                        stroke={color} strokeWidth={isHover ? 2 : 1} fill="none"
                        opacity={isHover ? 0.95 : 0.55}
                      />
                      <circle cx={sx} cy={sy} r={isHover ? 9 : 7}
                        fill={done ? color : "var(--bg-card)"}
                        stroke={color} strokeWidth="1.5"
                        filter={isHover ? "url(#softshadow)" : undefined}
                      />
                      {done && (
                        <path d={`M${sx - 3} ${sy} L${sx - 0.5} ${sy + 2.5} L${sx + 3} ${sy - 2.5}`}
                          stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      )}
                      {lines.map((ln, i) => (
                        <text key={i} x={lx} y={ly + i * 12 - (lines.length - 1) * 6}
                          textAnchor={anchor} dominantBaseline="middle"
                          fontSize="11" fontFamily="var(--font-sans)"
                          fontWeight={isHover ? 600 : 500}
                          fill={isHover ? color : "var(--text)"}>
                          {ln}
                        </text>
                      ))}
                    </g>
                  );
                })}

                <g style={{ cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); onNavigate(r.topic.id, r.topic.subtopics[0]?.id); }}>
                  <rect
                    x={tx - 56} y={ty - 14} width="112" height="28" rx="14"
                    fill={colorSoft} stroke={color} strokeWidth="1.5"
                    filter="url(#softshadow)"
                  />
                  <text x={tx} y={ty + 1} textAnchor="middle" dominantBaseline="middle"
                    fontSize="11.5" fontWeight="600" fontFamily="var(--font-sans)" fill={color}>
                    {r.topic.title.length > 16 ? r.topic.title.slice(0, 15) + "…" : r.topic.title}
                  </text>
                </g>
              </g>
            );
          })}

          <circle cx={cx} cy={cy} r={50} fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="2" filter="url(#softshadow)" />
          <text x={cx} y={cy - 6} textAnchor="middle" dominantBaseline="middle"
            fontFamily="var(--font-mono)" fontSize="11" fill="var(--text-faint)">
            {course.id}
          </text>
          <text x={cx} y={cy + 9} textAnchor="middle" dominantBaseline="middle"
            fontSize="11" fontWeight="600" fill="var(--text)">
            {course.topics.length} topics
          </text>
        </g>
      </svg>
    </div>
  );
}
