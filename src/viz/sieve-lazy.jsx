// Lazy Sieve of Eratosthenes — primes consumed on demand.
import { useState } from "react";

function buildSieveTrace(limit, demand) {
  // Simulate primes = sieve [2..]
  // sieve (p:xs) = p : sieve [x | x <- xs, x `mod` p /= 0]
  // Lazy-faithful: only the candidates up to the demand frontier (the Nth
  // yielded prime) have actually been forced through the filter, so we only
  // record strikes for x <= frontier. Numbers above the frontier stay grey
  // ("not yet forced") — exactly what call-by-need would do.
  const nums = [];
  for (let i = 2; i <= limit; i++) nums.push(i);
  // Pass 1: compute the yielded primes (cheap loop).
  const primes = [];
  let current = [...nums];
  while (primes.length < demand && current.length) {
    const p = current[0];
    primes.push(p);
    current = current.slice(1).filter((x) => x % p !== 0);
  }
  // Pass 2: strike each composite up to the frontier with its smallest
  // yielded prime factor.
  const frontier = primes.length ? primes[primes.length - 1] : 1;
  const primeSet = new Set(primes);
  const removedBy = new Map(); // n -> p that struck it
  for (let x = 2; x <= frontier; x++) {
    if (primeSet.has(x)) continue;
    for (const p of primes) {
      if (p >= x) break;
      if (x % p === 0) { removedBy.set(x, p); break; }
    }
  }
  return { primes, removedBy };
}

export default function SieveLazy() {
  const [demand, setDemand] = useState(5);
  const LIMIT = 50;
  const { primes, removedBy } = buildSieveTrace(LIMIT, demand);

  return (
    <div style={ctn}>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, textAlign: "center" }}>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" }}>
          primes = sieve [2..]  where  sieve (p:xs) = p : sieve [x | x &lt;- xs, x `mod` p /= 0]
        </code>
      </div>
      <div style={row}>
        <label style={lbl}>take N primes:</label>
        <input type="range" min="0" max="15" value={demand} onChange={(e) => setDemand(parseInt(e.target.value))} />
        <code style={mono}>N = {demand}</code>
        <span style={{ ...lbl, marginLeft: 12 }}>výsledek:</span>
        <code style={{ ...mono, color: "rgb(64,192,87)" }}>[{primes.join(", ")}]</code>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4 }}>
        {Array.from({ length: LIMIT - 1 }, (_, i) => i + 2).map((n) => {
          const isPrime = primes.includes(n);
          const removed = removedBy.has(n);
          const untouched = !isPrime && !removed;
          return (
            <div key={n} title={removed ? `× ${removedBy.get(n)}` : ""} style={{
              padding: "6px 4px", textAlign: "center", borderRadius: 4, fontFamily: "var(--font-mono)", fontSize: 12,
              background: isPrime ? "rgb(64,192,87)" : removed ? "var(--bg-inset)" : "var(--bg-card)",
              color: isPrime ? "var(--bg-card)" : removed ? "var(--text-muted)" : "var(--text)",
              textDecoration: removed ? "line-through" : "none",
              border: `1px solid ${untouched ? "var(--line)" : "transparent"}`,
              fontWeight: isPrime ? 600 : 400,
            }}>{n}</div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text-muted)", flexWrap: "wrap" }}>
        <span><span style={{ display: "inline-block", width: 12, height: 12, background: "rgb(64,192,87)", marginRight: 4, verticalAlign: "middle" }}/> prime (yielded)</span>
        <span><span style={{ display: "inline-block", width: 12, height: 12, background: "var(--bg-inset)", marginRight: 4, verticalAlign: "middle", textDecoration: "line-through" }}/> crossed out</span>
        <span><span style={{ display: "inline-block", width: 12, height: 12, background: "var(--bg-card)", border: "1px solid var(--line)", marginRight: 4, verticalAlign: "middle" }}/> nedotčeno (lazy — nebylo třeba)</span>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Nekonečný seznam <code style={mono}>[2..]</code> není problém — lazy evaluation vyžaduje jen tolik prvků, kolik <code style={mono}>take N</code> spotřebuje. Filter aplikuje jen na potřebné kandidáty. Posuňte N — vidíte, jak víc čísel se "aktivuje".
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)" };
