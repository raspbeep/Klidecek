// Step through sum-product (belief propagation) on a 3-variable factor-graph chain:
//   x1 --[fa]-- x2 --[fb]-- x3   with binary states.
// Forward pass sends messages left->right, backward pass right->left. Each step lights
// up the next message (computed numerically from the factors) and, once a variable has
// messages from both sides, its marginal P(x) = normalized product appears.
import { useState } from "react";

// pairwise factor tables fa(x1,x2), fb(x2,x3); rows = left var state, cols = right var state.
// Důležité: řádky NEsčítají na 1 (asymetrické potenciály) — jinak by zpětné zprávy vyšly
// uniformní [1,1] a marginály by se po zpětném průchodu vůbec nehnuly (viz README níže).
const FA = [[0.9, 0.4], [0.2, 0.6]]; // fa(x1=i, x2=j)
const FB = [[0.8, 0.4], [0.1, 0.5]]; // fb(x2=i, x3=j)
// leaf priors enter as variable->factor messages from x1 and x3 (uniform here = neutral leaf)
const LEAF = [1, 1];

// --- Příklad (přepočítaný pro tabulky výše, vše nenormalizované krom marginálů) ---
// Dopředný průchod:
//   μ fa→x2 = fwd(FA,[1,1])     = [1.1, 1.0]
//   μ fb→x3 = fwd(FB,[1.1,1.0]) = [0.98, 0.94]
// Zpětný průchod (řádky FB nesčítají na 1, takže NETRIVIÁLNÍ):
//   μ fb→x2 = bwd(FB,[1,1]) = [0.8+0.4, 0.1+0.5] = [1.2, 0.6]
//   μ fa→x1 = bwd(FA,[1.2,0.6]) = [0.9·1.2+0.4·0.6, 0.2·1.2+0.6·0.6] = [1.32, 0.60]
// Marginál x2:
//   jen dopředně   → norm([1.1,1.0])            = [0.524, 0.476]
//   z obou stran   → norm([1.1·1.2, 1.0·0.6])   = norm([1.32, 0.60]) = [0.688, 0.312]
//   => zpětná zpráva marginál x2 VIDITELNĚ posune (0.52 → 0.69). Ověřeno brute-force
//      přes sdružené P(x1,x2,x3) ∝ FA[x1][x2]·FB[x2][x3]: P(x1)=[0.688,0.312],
//      P(x2)=[0.688,0.312], P(x3)=[0.51,0.49] — sedí přesně s BP.

// matrix-vector style helpers over binary messages
const norm = (v) => { const s = v[0] + v[1]; return s ? [v[0] / s, v[1] / s] : v; };
// message factor->right var: sum over left var of F[left][right]*msgIn[left]
const fwdThrough = (F, msgIn) => [
  F[0][0] * msgIn[0] + F[1][0] * msgIn[1],
  F[0][1] * msgIn[0] + F[1][1] * msgIn[1],
];
// message factor->left var: sum over right var of F[left][right]*msgIn[right]
const bwdThrough = (F, msgIn) => [
  F[0][0] * msgIn[0] + F[0][1] * msgIn[1],
  F[1][0] * msgIn[0] + F[1][1] * msgIn[1],
];

// Precompute all messages in pass order.
// m_fa_x2 : message fa->x2 (forward),  m_fb_x3 : fb->x3 (forward)
// m_fb_x2 : fb->x2 (backward), m_fa_x1 : fa->x1 (backward)
const M_fa_x2 = fwdThrough(FA, LEAF);     // x1 leaf -> fa -> x2
const M_fb_x3 = fwdThrough(FB, M_fa_x2);  // x2 -> fb -> x3   (forward continues)
const M_fb_x2 = bwdThrough(FB, LEAF);     // x3 leaf -> fb -> x2
const M_fa_x1 = bwdThrough(FA, M_fb_x2);  // x2 -> fa -> x1   (backward continues)

// Step sequence: each step reveals one message (and possibly a marginal).
const STEPS = [
  { msg: "fa-x2", from: "fa", to: "x2", dir: "fwd", val: M_fa_x2, label: "μ fa→x2" },
  { msg: "fb-x3", from: "fb", to: "x3", dir: "fwd", val: M_fb_x3, label: "μ fb→x3" },
  { msg: "fb-x2", from: "fb", to: "x2", dir: "bwd", val: M_fb_x2, label: "μ fb→x2" },
  { msg: "fa-x1", from: "fa", to: "x1", dir: "bwd", val: M_fa_x1, label: "μ fa→x1" },
];

// node coordinates
const NX = { x1: 45, x2: 140, x3: 235 };
const FX = { fa: 92.5, fb: 187.5 };
const VY = 60, FY = 60;

export default function BeliefPropagation() {
  const [step, setStep] = useState(0); // 0 = nothing sent yet

  const sent = STEPS.slice(0, step).map((s) => s.msg);
  const lastMsg = step > 0 ? STEPS[step - 1] : null;

  // marginals once both directions reached a variable
  const fmt = (v) => `[${v[0].toFixed(2)}, ${v[1].toFixed(2)}]`;
  const marginal = (incoming) => norm(incoming);

  // which incoming messages a variable currently has
  const x1Msgs = sent.includes("fa-x1") ? [M_fa_x1] : [];
  const x3Msgs = sent.includes("fb-x3") ? [M_fb_x3] : [];
  const x2MsgsList = [];
  if (sent.includes("fa-x2")) x2MsgsList.push(M_fa_x2);
  if (sent.includes("fb-x2")) x2MsgsList.push(M_fb_x2);

  const prodOf = (list) => list.reduce((a, m) => [a[0] * m[0], a[1] * m[1]], [1, 1]);
  const marg = {
    x1: x1Msgs.length ? marginal(prodOf(x1Msgs)) : null,
    x2: x2MsgsList.length === 2 ? marginal(prodOf(x2MsgsList)) : null, // needs both sides
    x3: x3Msgs.length ? marginal(prodOf(x3Msgs)) : null,
  };

  const W = 280, H = 150;

  // draw a message dot partway along the var<->factor edge, colored by direction
  const msgDot = (s) => {
    const fx = FX[s.from], fy = FY;
    const vx = NX[s.to], vy = VY;
    const t = 0.5;
    const mx = fx + (vx - fx) * t, my = fy + (vy - fy) * t - 14;
    const color = s.dir === "fwd" ? "var(--accent)" : "oklch(0.7 0.17 50)";
    const isLast = lastMsg && lastMsg.msg === s.msg;
    return (
      <g key={s.msg}>
        <circle cx={mx} cy={my} r={isLast ? 5 : 3.5} fill={color}
          opacity={isLast ? 1 : 0.7} />
        <text x={mx} y={my - 8} textAnchor="middle" fontSize="7.5"
          fontFamily="var(--font-mono)" fill={color}>
          {s.label.replace("μ ", "")}
        </text>
      </g>
    );
  };

  const edge = (vId, fId) => (
    <line key={vId + fId} x1={NX[vId]} y1={VY} x2={FX[fId]} y2={FY}
      stroke="var(--line-strong)" strokeWidth="1.3" opacity="0.55" />
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}>← zpět</button>
        <button className="viz-btn primary" onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
          disabled={step === STEPS.length}>krok →</button>
        <button className="viz-btn" onClick={() => setStep(0)}>reset</button>
        <span className="viz-readout">
          {step === 0 ? "nic neposláno"
            : `${step}/${STEPS.length} · ${STEPS[step - 1].dir === "fwd" ? "dopředná" : "zpětná"}: ${STEPS[step - 1].label}`}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 460 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* edges */}
        {edge("x1", "fa")}{edge("x2", "fa")}{edge("x2", "fb")}{edge("x3", "fb")}

        {/* sent message dots */}
        {STEPS.filter((s) => sent.includes(s.msg)).map(msgDot)}

        {/* factor squares */}
        {Object.entries(FX).map(([id, x]) => (
          <g key={id}>
            <rect x={x - 8} y={FY - 8} width={16} height={16}
              fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1.3" rx="2" />
            <text x={x} y={FY + 1} textAnchor="middle" dominantBaseline="central"
              fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">{id}</text>
          </g>
        ))}

        {/* variable circles + marginal under those that have both-side info */}
        {Object.entries(NX).map(([id, x]) => {
          const m = marg[id];
          return (
            <g key={id}>
              <circle cx={x} cy={VY} r="15"
                fill={m ? "color-mix(in oklch, var(--accent) 22%, var(--bg-card))" : "var(--bg-card)"}
                stroke={m ? "var(--accent)" : "var(--line-strong)"} strokeWidth={m ? 2 : 1.3} />
              <text x={x} y={VY + 1} textAnchor="middle" dominantBaseline="central"
                fontSize="11" fontWeight="700" fontFamily="var(--font-mono)" fill="var(--text)">{id}</text>
              {m && (
                <text x={x} y={VY + 30} textAnchor="middle" fontSize="8"
                  fontFamily="var(--font-mono)" fill="var(--accent)">{fmt(m)}</text>
              )}
            </g>
          );
        })}

        <text x={8} y={H - 8} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          modrá = dopředná zpráva · oranžová = zpětná
        </text>
      </svg>

      <div style={{ fontSize: 11, lineHeight: 1.7, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        {lastMsg
          ? <div>poslední zpráva <b style={{ color: "var(--text)" }}>{lastMsg.label}</b> = {fmt(lastMsg.val)} <span style={{ color: "var(--text-faint)" }}>(nenorm.)</span></div>
          : <div>klikni „krok →" a posílej sum-product zprávy</div>}
        {marg.x2 && <div>marginál <b style={{ color: "var(--accent)" }}>P(x2) ∝ μfa→x2 · μfb→x2</b> = {fmt(marg.x2)}</div>}
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Na stromu/řetězu projde každou hranou jedna zpráva v každém směru. Jakmile uzel
        dostane zprávy z obou stran, jeho marginál je normalizovaný součin příchozích zpráv.
      </div>
    </div>
  );
}
