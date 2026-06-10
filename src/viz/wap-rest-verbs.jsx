// REST: mapování HTTP sloves na operace nad zdroji.
// Uživatel vybere sloveso a vidí, na co cílí (kolekce vs. položka), jakou
// CRUD operaci značí, typický stavový kód a zda je bezpečné / idempotentní.
import { useState } from "react";

const GREEN = "oklch(0.52 0.16 142)";
const RED = "oklch(0.55 0.18 22)";
const ACCENT = "oklch(0.55 0.16 264)";
const AMBER = "oklch(0.55 0.14 65)";

const VERBS = {
  GET: {
    crud: "Read (čtení)",
    target: "/books  nebo  /books/42",
    targetLabel: "kolekce i položka",
    code: "200 OK",
    safe: true,
    idem: true,
    note: "Vrací reprezentaci zdroje, nemění stav. Odpověď lze cachovat.",
  },
  POST: {
    crud: "Create (vytvoření)",
    target: "/books",
    targetLabel: "kolekce",
    code: "201 Created",
    safe: false,
    idem: false,
    note: "Vytvoří nový podřízený zdroj v kolekci. Server přidělí jeho URI (Location).",
  },
  PUT: {
    crud: "Update / Create (úplné nahrazení)",
    target: "/books/42",
    targetLabel: "konkrétní položka",
    code: "200 OK / 204",
    safe: false,
    idem: true,
    note: "Kompletně nahradí zdroj na daném URI. Opakování dá stejný výsledek → idempotentní.",
  },
  PATCH: {
    crud: "Update (částečná změna)",
    target: "/books/42",
    targetLabel: "konkrétní položka",
    code: "200 OK",
    safe: false,
    idem: false,
    note: "Aplikuje částečnou změnu. Obecně NENÍ idempotentní (relativní úprava se opakováním nasčítá).",
  },
  DELETE: {
    crud: "Delete (smazání)",
    target: "/books/42",
    targetLabel: "konkrétní položka",
    code: "204 No Content",
    safe: false,
    idem: true,
    note: "Smaže zdroj. Druhé volání už nic nemaže, výsledný stav je stejný → idempotentní.",
  },
};

const ORDER = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function Badge({ on, label }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontFamily: "var(--font-mono)",
        padding: "2px 8px",
        borderRadius: 999,
        fontWeight: 600,
        color: on ? GREEN : RED,
        background: on ? "oklch(0.52 0.16 142 / 0.14)" : "oklch(0.55 0.18 22 / 0.12)",
        border: `1px solid ${on ? GREEN : RED}`,
      }}
    >
      {on ? "✓ " : "✗ "}
      {label}
    </span>
  );
}

export default function WapRestVerbs() {
  const [verb, setVerb] = useState("GET");
  const v = VERBS[verb];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="viz-controls">
        {ORDER.map((k) => (
          <button
            key={k}
            className="viz-btn"
            data-active={verb === k}
            onClick={() => setVerb(k)}
          >
            {k}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 440 150" style={{ width: "100%", maxWidth: 440 }}>
        <rect width="440" height="150" fill="var(--bg-inset)" rx="6" />

        {/* klient */}
        <rect x="14" y="48" width="92" height="54" rx="8" fill="oklch(0.62 0.14 264 / 0.12)" stroke={ACCENT} />
        <text x="60" y="72" textAnchor="middle" fontSize="12" fontWeight="600" fill={ACCENT}>klient</text>
        <text x="60" y="90" textAnchor="middle" fontSize="9" fill="var(--text-muted)">HTTP request</text>

        {/* požadavek */}
        <line x1="106" y1="64" x2="332" y2="64" stroke={ACCENT} strokeWidth="1.6" markerEnd="url(#restArr)" />
        <text x="219" y="56" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="700" fill={ACCENT}>
          {verb} {v.target}
        </text>

        {/* odpověď */}
        <line x1="332" y1="88" x2="106" y2="88" stroke={GREEN} strokeWidth="1.6" markerEnd="url(#restArr)" />
        <text x="219" y="104" textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill={GREEN}>
          {v.code}
        </text>

        {/* server / zdroj */}
        <rect x="334" y="40" width="92" height="70" rx="8" fill="oklch(0.52 0.16 142 / 0.12)" stroke={GREEN} />
        <text x="380" y="60" textAnchor="middle" fontSize="11" fontWeight="600" fill="oklch(0.42 0.16 142)">zdroj</text>
        <text x="380" y="78" textAnchor="middle" fontSize="8.5" fill="var(--text-muted)">{v.targetLabel}</text>
        <text x="380" y="96" textAnchor="middle" fontSize="9.5" fontWeight="600" fill={AMBER}>{verb}</text>

        <text x="220" y="130" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)">
          {v.crud}
        </text>

        <defs>
          <marker id="restArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
          </marker>
        </defs>
      </svg>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Badge on={v.safe} label="bezpečné (safe)" />
        <Badge on={v.idem} label="idempotentní" />
      </div>

      <div
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          lineHeight: 1.5,
          padding: "8px 10px",
          background: "var(--bg-card)",
          borderRadius: 6,
          border: "1px solid var(--line)",
        }}
      >
        {v.note}
      </div>
    </div>
  );
}
