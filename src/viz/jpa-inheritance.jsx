// JPA inheritance strategy visualizer.
// Pick a strategy and see how the Publication / Book / BlogPost hierarchy
// is mapped to relational tables, with trade-offs annotated below.
import { useState } from "react";

const STRATEGIES = [
  {
    id: "mapped",
    name: "@MappedSuperclass",
    summary: "Publikace není entita, není tabulka. Vlastnosti se zkopírují do potomků.",
    tables: [
      {
        name: "book",
        color: 22,
        cols: [
          { k: "id", t: "bigint PK" },
          { k: "title", t: "varchar" },
          { k: "version", t: "int" },
          { k: "publishingDate", t: "date" },
          { k: "pages", t: "int", own: true },
        ],
      },
      {
        name: "blogpost",
        color: 142,
        cols: [
          { k: "id", t: "bigint PK" },
          { k: "title", t: "varchar" },
          { k: "version", t: "int" },
          { k: "publishingDate", t: "date" },
          { k: "url", t: "varchar", own: true },
        ],
      },
    ],
    pros: ["Snadné na pochopení", "Žádné JOINy"],
    cons: ["Publication není entita → bez vztahu Publication-Author", "Bez polymorfních dotazů"],
  },
  {
    id: "table_per",
    name: "TABLE_PER_CLASS",
    summary: "Tabulka pro každou konkrétní třídu. Publikace je entita, ale dotazy přes ni dělají UNION ALL.",
    tables: [
      {
        name: "book",
        color: 22,
        cols: [
          { k: "id", t: "bigint PK" },
          { k: "title", t: "varchar" },
          { k: "version", t: "int" },
          { k: "publishingDate", t: "date" },
          { k: "pages", t: "int", own: true },
        ],
      },
      {
        name: "blogpost",
        color: 142,
        cols: [
          { k: "id", t: "bigint PK" },
          { k: "title", t: "varchar" },
          { k: "version", t: "int" },
          { k: "publishingDate", t: "date" },
          { k: "url", t: "varchar", own: true },
        ],
      },
    ],
    pros: ["Žádné NULL sloupce", "Publication je entita"],
    cons: ["Polymorfní dotazy = UNION ALL → drahé", "FK na Publication je problém"],
  },
  {
    id: "single",
    name: "SINGLE_TABLE",
    summary: "Jedna tabulka pro celou hierarchii s diskriminátorem. Defaultní volba JPA.",
    tables: [
      {
        name: "publication",
        color: 264,
        cols: [
          { k: "id", t: "bigint PK" },
          { k: "publicationType", t: "varchar (diskriminátor)", disc: true },
          { k: "title", t: "varchar" },
          { k: "version", t: "int" },
          { k: "publishingDate", t: "date" },
          { k: "pages", t: "int  (jen Book, jinak NULL)" },
          { k: "url", t: "varchar (jen BlogPost, jinak NULL)" },
        ],
      },
    ],
    pros: ["Velmi efektivní dotazy", "Snadné vztahy přes Publication"],
    cons: ["NOT NULL na potomky nelze", "Více NULL sloupců"],
  },
  {
    id: "joined",
    name: "JOINED",
    summary: "Tabulka pro každou třídu, společné v rodičovské. FK z dětí mířímí na publication.id.",
    tables: [
      {
        name: "publication",
        color: 264,
        cols: [
          { k: "id", t: "bigint PK" },
          { k: "title", t: "varchar" },
          { k: "version", t: "int" },
          { k: "publishingDate", t: "date" },
        ],
      },
      {
        name: "book",
        color: 22,
        cols: [
          { k: "id", t: "bigint PK + FK → publication" },
          { k: "pages", t: "int  NOT NULL", own: true },
        ],
      },
      {
        name: "blogpost",
        color: 142,
        cols: [
          { k: "id", t: "bigint PK + FK → publication" },
          { k: "url", t: "varchar NOT NULL", own: true },
        ],
      },
    ],
    pros: ["Žádné NULL sloupce", "Vztahy a NOT NULL jdou čistě"],
    cons: ["Polymorfní i konkrétní dotazy = JOIN", "Vyšší počet tabulek"],
  },
];

export default function JpaInheritance() {
  const [stratId, setStratId] = useState("single");
  const strat = STRATEGIES.find((s) => s.id === stratId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="viz-controls">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            className="viz-btn"
            data-active={stratId === s.id}
            onClick={() => setStratId(s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.45, fontStyle: "italic" }}>
        {strat.summary}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          padding: 12,
          background: "var(--bg-inset)",
          borderRadius: 8,
          maxWidth: 560,
        }}
      >
        {strat.tables.map((tab) => (
          <div
            key={tab.name}
            style={{
              minWidth: 220,
              flex: "1 1 220px",
              background: "var(--bg-card)",
              borderRadius: 6,
              border: `1px solid oklch(0.62 0.14 ${tab.color})`,
              overflow: "hidden",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
            }}
          >
            <div
              style={{
                background: `oklch(0.62 0.14 ${tab.color} / 0.18)`,
                color: `oklch(0.40 0.14 ${tab.color})`,
                padding: "5px 10px",
                fontWeight: 600,
                fontSize: 12.5,
              }}
            >
              {tab.name}
            </div>
            <div style={{ padding: "6px 10px" }}>
              {tab.cols.map((c) => (
                <div
                  key={c.k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    padding: "2px 0",
                    color: c.disc
                      ? `oklch(0.45 0.14 ${tab.color})`
                      : c.own
                      ? "var(--text)"
                      : "var(--text-muted)",
                    fontWeight: c.disc || c.own ? 600 : 400,
                  }}
                >
                  <span>{c.k}</span>
                  <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>{c.t}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          fontSize: 12.5,
          lineHeight: 1.45,
          maxWidth: 560,
        }}
      >
        <div
          style={{
            padding: 10,
            background: "oklch(0.62 0.14 142 / 0.10)",
            borderRadius: 6,
            border: "1px solid oklch(0.62 0.14 142)",
          }}
        >
          <div style={{ fontWeight: 600, color: "oklch(0.40 0.14 142)", marginBottom: 4 }}>✓ Výhody</div>
          <ul style={{ margin: 0, paddingLeft: 16, color: "var(--text)" }}>
            {strat.pros.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div
          style={{
            padding: 10,
            background: "oklch(0.62 0.14 22 / 0.10)",
            borderRadius: 6,
            border: "1px solid oklch(0.62 0.14 22)",
          }}
        >
          <div style={{ fontWeight: 600, color: "oklch(0.42 0.14 22)", marginBottom: 4 }}>✗ Nevýhody</div>
          <ul style={{ margin: 0, paddingLeft: 16, color: "var(--text)" }}>
            {strat.cons.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
