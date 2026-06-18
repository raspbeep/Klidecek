// Genetic algorithm: a population of binary strings evolving toward a target pattern.
// "Next generation" runs selection (tournament) + single-point crossover + bit mutation,
// keeps the best (elitism), and shows best/avg fitness climbing over generations.
import { useState, useRef } from "react";

const L = 12; // chromosome length
const POP = 16; // population size

// random target pattern (fixed so the demo is reproducible)
const TARGET = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1];

const randBit = () => (Math.random() < 0.5 ? 1 : 0);
const randChrom = () => Array.from({ length: L }, randBit);
const fitness = (c) => c.reduce((s, b, i) => s + (b === TARGET[i] ? 1 : 0), 0); // matches with target

function tournament(pop, fits, k = 3) {
  let best = -1, bf = -1;
  for (let i = 0; i < k; i++) {
    const r = Math.floor(Math.random() * pop.length);
    if (fits[r] > bf) { bf = fits[r]; best = r; }
  }
  return pop[best];
}

function crossover(a, b) {
  const pt = 1 + Math.floor(Math.random() * (L - 1));
  return a.slice(0, pt).concat(b.slice(pt));
}

function mutate(c, pm) {
  return c.map((b) => (Math.random() < pm ? 1 - b : b));
}

function nextGen(pop, pm) {
  const fits = pop.map(fitness);
  // elitism: carry the single best unchanged
  let eliteIdx = 0;
  for (let i = 1; i < pop.length; i++) if (fits[i] > fits[eliteIdx]) eliteIdx = i;
  const out = [pop[eliteIdx].slice()];
  while (out.length < pop.length) {
    const p1 = tournament(pop, fits);
    const p2 = tournament(pop, fits);
    out.push(mutate(crossover(p1, p2), pm));
  }
  return out;
}

export default function GeneticAlgorithm() {
  const seed = useRef(Array.from({ length: POP }, randChrom));
  const [pop, setPop] = useState(seed.current);
  const [gen, setGen] = useState(0);
  const [pm, setPm] = useState(0.03);
  const [history, setHistory] = useState(() => {
    const f = seed.current.map(fitness);
    return [{ best: Math.max(...f), avg: f.reduce((a, b) => a + b, 0) / f.length }];
  });

  const fits = pop.map(fitness);
  const bestF = Math.max(...fits);
  const avgF = fits.reduce((a, b) => a + b, 0) / fits.length;
  const bestIdx = fits.indexOf(bestF);
  const solved = bestF === L;

  const step = () => {
    if (solved) return;
    const np = nextGen(pop, pm);
    const nf = np.map(fitness);
    setPop(np);
    setGen((g) => g + 1);
    setHistory((h) => [...h, { best: Math.max(...nf), avg: nf.reduce((a, b) => a + b, 0) / nf.length }].slice(-40));
  };

  const reset = () => {
    const fresh = Array.from({ length: POP }, randChrom);
    setPop(fresh);
    setGen(0);
    const f = fresh.map(fitness);
    setHistory([{ best: Math.max(...f), avg: f.reduce((a, b) => a + b, 0) / f.length }]);
  };

  // layout: grid of chromosomes on the left, fitness curve on the right
  const W = 340, H = 200;
  const cell = 8, gap = 1.2;
  const gridX = 10, gridY = 16;
  const cols = L;

  // fitness curve area
  const cx0 = 200, cy0 = 24, cw = 130, ch = 130;
  const maxLen = Math.max(history.length, 8);
  const px = (i) => cx0 + (i / (maxLen - 1)) * cw;
  const py = (v) => cy0 + ch - (v / L) * ch;
  const linePath = (key) =>
    history.map((p, i) => `${i === 0 ? "M" : "L"} ${px(i).toFixed(1)} ${py(p[key]).toFixed(1)}`).join(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 460 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* population grid */}
        <text x={gridX} y={11} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          populace ({POP} jedinců)
        </text>
        {pop.map((chrom, r) =>
          chrom.map((b, c) => {
            const matches = b === TARGET[c];
            const isElite = r === bestIdx;
            return (
              <rect key={`${r}-${c}`}
                x={gridX + c * (cell + gap)} y={gridY + r * (cell + gap)}
                width={cell} height={cell} rx="1"
                fill={matches ? "var(--accent)" : "var(--bg-card)"}
                opacity={matches ? (isElite ? 0.95 : 0.7) : 1}
                stroke={isElite ? "var(--accent)" : "var(--line)"}
                strokeWidth={isElite ? 1.2 : 0.4} />
            );
          })
        )}
        {/* target row */}
        <text x={gridX} y={gridY + POP * (cell + gap) + 9} fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">cíl:</text>
        {TARGET.map((b, c) => (
          <rect key={`t-${c}`}
            x={gridX + c * (cell + gap)} y={gridY + POP * (cell + gap) + 2}
            width={cell} height={cell} rx="1"
            fill={b ? "var(--accent-line)" : "var(--bg-card)"} stroke="var(--line-strong)" strokeWidth="0.4" />
        ))}

        {/* fitness curve */}
        <text x={cx0} y={11} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">fitness za generaci</text>
        <line x1={cx0} y1={cy0} x2={cx0} y2={cy0 + ch} stroke="var(--line-strong)" strokeWidth="0.5" />
        <line x1={cx0} y1={cy0 + ch} x2={cx0 + cw} y2={cy0 + ch} stroke="var(--line-strong)" strokeWidth="0.5" />
        <line x1={cx0} y1={py(L)} x2={cx0 + cw} y2={py(L)} stroke="var(--line)" strokeWidth="0.5" strokeDasharray="3 3" />
        <text x={cx0 + cw} y={py(L) - 2} textAnchor="end" fontSize="7.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">max {L}</text>
        <path d={linePath("avg")} fill="none" stroke="var(--text-muted)" strokeWidth="1.2" opacity="0.8" />
        <path d={linePath("best")} fill="none" stroke="var(--accent)" strokeWidth="1.6" />
        <circle cx={px(history.length - 1)} cy={py(history[history.length - 1].best)} r="2.5" fill="var(--accent)" />
        <text x={cx0 + 4} y={cy0 + ch + 12} fontSize="7.5" fontFamily="var(--font-mono)" fill="var(--accent)">— nejlepší</text>
        <text x={cx0 + 64} y={cy0 + ch + 12} fontSize="7.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">— průměr</text>
      </svg>

      <div className="viz-controls">
        <button className="viz-btn primary" onClick={step} disabled={solved}>
          {solved ? "vyřešeno ✓" : "Další generace"}
        </button>
        <button className="viz-btn" onClick={reset}>Reset</button>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>mutace p_m:</span>
        <input type="range" className="viz-slider" min={0} max={0.2} step={0.005}
          value={pm} onChange={(e) => setPm(+e.target.value)} style={{ width: 90 }} />
      </div>

      <span className="viz-readout">
        generace = {gen} · nejlepší = {bestF}/{L} · průměr = {avgF.toFixed(1)}/{L} · p_m = {pm.toFixed(3)}
        {solved ? " · cíl trefen" : ""}
      </span>
    </div>
  );
}
