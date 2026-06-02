// in-view.js — a tiny, pooled IntersectionObserver hook used to:
//   • lazy-mount a subtopic's blocks only when it nears the viewport, and
//   • mount/unmount (and thus pause the rAF/interval loops of) interactive viz
//     so a long "whole course on one page" view doesn't keep dozens of
//     animations + heavy SVGs live at once.
//
// One IntersectionObserver is shared per distinct `rootMargin` (a browser
// object per element would be wasteful on pages with 40+ subtopics/viz).
//
// `?eager=1` in the URL forces every gate open (no observer at all) — the
// render-audit tooling relies on this so it can read the full DOM in one shot
// without scrolling the page. See tools/video-data/embed-audit.mjs.

import { useState, useRef, useEffect } from "react";

const HAS_IO = typeof window !== "undefined" && typeof IntersectionObserver !== "undefined";
export const EAGER =
  typeof window !== "undefined" && /[?&]eager(=1)?(&|$)/.test(window.location.search || "");

// rootMargin -> { io, cbs: Map<Element, (inView:boolean)=>void> }
const pools = new Map();
function poolFor(rootMargin) {
  let p = pools.get(rootMargin);
  if (!p) {
    const cbs = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const cb = cbs.get(e.target);
          if (cb) cb(e.isIntersecting);
        }
      },
      { rootMargin }
    );
    p = { io, cbs };
    pools.set(rootMargin, p);
  }
  return p;
}

// Returns [ref, inView]. Attach `ref` to the element to watch.
//   once:true  → latches true on first intersection and stops observing
//                (use for "mount when near, keep mounted").
//   once:false → tracks visibility both ways (use to pause offscreen work).
export function useInView({ rootMargin = "200px", once = false } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(EAGER || !HAS_IO);

  useEffect(() => {
    if (EAGER || !HAS_IO) return; // already true; nothing to observe
    const el = ref.current;
    if (!el) return;
    const { io, cbs } = poolFor(rootMargin);
    let latched = false;
    cbs.set(el, (vis) => {
      if (latched) return;
      setInView(vis);
      if (vis && once) {
        latched = true;
        cbs.delete(el);
        io.unobserve(el);
      }
    });
    io.observe(el);
    return () => {
      cbs.delete(el);
      io.unobserve(el);
    };
  }, [rootMargin, once]);

  return [ref, inView];
}

// Rough rendered-height estimate (px) for a list of blocks, so a not-yet-mounted
// subtopic reserves believable space and the scrollbar barely drifts as content
// streams in. Deliberately a touch generous for heavy blocks.
// embed + link are compact rows in the unified "Další zdroje" list now, not big
// thumbnails — estimate them small (plus a little for the section header).
const BLOCK_PX = {
  viz: 360, image: 300, svg: 300, table: 220, quiz: 200,
  code: 170, math: 120, quote: 110, list: 110,
  heading: 44, embed: 56, link: 48, hr: 24, diagram: 90, text: 90,
};
export function estimateBlocksHeight(blocks) {
  if (!blocks || !blocks.length) return 200;
  let h = 0;
  for (const b of blocks) h += BLOCK_PX[b.kind] ?? 90;
  return Math.min(h, 6000); // cap so one huge subtopic doesn't over-reserve
}
