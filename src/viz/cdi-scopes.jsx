// CDI Scope visualizer.
// Plot a 2-row timeline of HTTP requests (two sessions). Pick a scope and the
// viz highlights which requests share the same CDI bean instance.
import { useState } from "react";

const SCOPES = [
  {
    id: "dependent",
    name: "@Dependent",
    desc: "Nová instance při každém injektování. Zaniká s vlastníkem.",
    instanceFor: (sessionIdx, reqIdx) => `D-${sessionIdx}-${reqIdx}`,
  },
  {
    id: "request",
    name: "@RequestScoped",
    desc: "Nová instance pro každý HTTP požadavek, sdílená v rámci požadavku.",
    instanceFor: (sessionIdx, reqIdx) => `R-${sessionIdx}-${reqIdx}`,
  },
  {
    id: "session",
    name: "@SessionScoped",
    desc: "Jedna instance po dobu HTTP session uživatele.",
    instanceFor: (sessionIdx) => `S-${sessionIdx}`,
  },
  {
    id: "application",
    name: "@ApplicationScoped",
    desc: "Jedna instance pro celou aplikaci (společná všem uživatelům).",
    instanceFor: () => "A",
  },
];

// Two sessions, 4 requests each
const SESSIONS = [
  { label: "Session A (Alice)", reqs: ["GET /home", "POST /order", "GET /order/42", "DELETE /order/42"] },
  { label: "Session B (Bob)",   reqs: ["GET /home", "GET /products", "POST /order", "GET /order/91"] },
];

function colorForInstance(id) {
  // hash to a hue
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const hue = ((h % 360) + 360) % 360;
  return `oklch(0.72 0.14 ${hue})`;
}

export default function CdiScopes() {
  const [scopeId, setScopeId] = useState("request");
  const scope = SCOPES.find((s) => s.id === scopeId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 4, padding: 3, background: "var(--bg-inset)", borderRadius: 8, flexWrap: "wrap" }}>
        {SCOPES.map((s) => (
          <button
            key={s.id}
            className="btn ghost"
            style={{
              background: scopeId === s.id ? "var(--bg-card)" : "transparent",
              boxShadow: scopeId === s.id ? "var(--shadow-sm)" : "none",
              padding: "5px 10px",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
            }}
            onClick={() => setScopeId(s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 540 200" style={{ width: "100%", display: "block", maxWidth: 600 }}>
        <rect width="540" height="200" fill="var(--bg-inset)" />
        {SESSIONS.map((sess, si) => {
          const y = 30 + si * 75;
          return (
            <g key={si}>
              <text x="10" y={y - 8} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                {sess.label}
              </text>
              <line x1="10" y1={y + 22} x2="530" y2={y + 22} stroke="var(--line-strong)" strokeWidth="0.5" strokeDasharray="2 3" />
              {sess.reqs.map((label, ri) => {
                const x = 20 + ri * 125;
                const instId = scope.instanceFor(si, ri);
                const fill = colorForInstance(instId);
                return (
                  <g key={ri}>
                    <rect x={x} y={y} width="115" height="44" rx="5" fill={fill} opacity="0.85" stroke="var(--bg-card)" strokeWidth="0.5" />
                    <text x={x + 57} y={y + 17} textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="var(--font-mono)" fill="white">
                      {label}
                    </text>
                    <text x={x + 57} y={y + 33} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="white" opacity="0.92">
                      instance: {instId}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
        <text x="270" y="194" textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          Stejná barva = stejná instance CDI beanu. Čas běží zleva doprava.
        </text>
      </svg>

      <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55, padding: "6px 0" }}>
        <strong style={{ color: "var(--text)" }}>{scope.name}</strong> — {scope.desc}
      </div>
    </div>
  );
}
