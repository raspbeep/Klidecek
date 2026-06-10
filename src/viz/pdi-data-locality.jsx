// pdi-data-locality — datová lokalita: porovnání "data za výpočtem" vs
// "výpočet za daty". Přepínač mění, co se posílá po síti; ukazuje, kolik
// bajtů musí přes síť při velkém datovém bloku a malém programu.
import { useState } from "react";

const W = 540, H = 210;

// Tři uzly s datovým blokem; jeden uzel hostí "compute" (program).
const NODES = [
  { id: "N1", x: 90, dataMB: 128 },
  { id: "N2", x: 270, dataMB: 128 },
  { id: "N3", x: 450, dataMB: 128 },
];
const PROGRAM_KB = 64; // velikost zkompilovaného map-tasku

export default function PdiDataLocality() {
  // false = výpočet za daty (lokalita), true = data za výpočtem (naivní)
  const [moveData, setMoveData] = useState(false);

  // Při lokalitě se po síti pošle jen malý program na uzly bez něj (2 uzly).
  // Při "data za výpočtem" se přesouvají celé bloky na jeden výpočetní uzel.
  const netMB = moveData
    ? NODES.length * NODES[0].dataMB - NODES[0].dataMB // 2 bloky přes síť
    : ((NODES.length - 1) * PROGRAM_KB) / 1024; // 2× malý program

  const computeNode = NODES[1]; // při "data za výpočtem" sbíhá vše sem
  const ratio = (NODES[0].dataMB * 1024) / PROGRAM_KB; // 2048×

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <span style={{ color: "var(--text-muted)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: 11.5 }}>strategie:</span>
        <button className="viz-btn" data-active={!moveData} onClick={() => setMoveData(false)}>výpočet → za daty</button>
        <button className="viz-btn" data-active={moveData} onClick={() => setMoveData(true)}>data → za výpočtem</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* síťová sběrnice */}
        <line x1={40} y1={40} x2={W - 20} y2={40} stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={W - 22} y={32} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">síť (sběrnice)</text>

        {NODES.map((n) => {
          const isCompute = moveData ? n.id === computeNode.id : true;
          const dataHere = moveData ? n.id === computeNode.id : true;
          return (
            <g key={n.id}>
              {/* spoj do sítě */}
              <line x1={n.x} y1={40} x2={n.x} y2={70} stroke="var(--line)" strokeWidth="1" />
              {/* uzel */}
              <rect x={n.x - 55} y={70} width={110} height={110} rx={8}
                fill="var(--bg-inset)" stroke="var(--line)" strokeWidth="1" />
              <text x={n.x} y={88} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text)" fontFamily="var(--font-mono)">{n.id}</text>

              {/* datový blok — zůstává tam, kde vznikl */}
              {(!moveData || dataHere) && (
                <g>
                  <rect x={n.x - 42} y={98} width={84} height={34} rx={4}
                    fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)" />
                  <text x={n.x} y={112} textAnchor="middle" fontSize="9.5" fill="var(--text)" fontFamily="var(--font-mono)">blok</text>
                  <text x={n.x} y={126} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">{n.dataMB} MB</text>
                </g>
              )}
              {/* prázdné místo po přesunutém bloku */}
              {moveData && !dataHere && (
                <text x={n.x} y={118} textAnchor="middle" fontSize="9" fill="var(--text-faint)" fontFamily="var(--font-mono)">(blok odeslán →)</text>
              )}

              {/* program / map task */}
              {isCompute && (
                <g>
                  <rect x={n.x - 42} y={140} width={84} height={28} rx={4}
                    fill="oklch(0.62 0.14 142 / 0.20)" stroke="oklch(0.62 0.14 142)" />
                  <text x={n.x} y={158} textAnchor="middle" fontSize="9.5" fill="var(--text)" fontFamily="var(--font-mono)">map ({PROGRAM_KB} kB)</text>
                </g>
              )}
            </g>
          );
        })}

        {/* šipky toku po síti */}
        {moveData
          ? // bloky N1, N3 → N2
            NODES.filter((n) => n.id !== computeNode.id).map((n) => (
              <line key={n.id} x1={n.x} y1={40} x2={computeNode.x} y2={40}
                stroke="oklch(0.62 0.14 264)" strokeWidth="3" opacity={0.7}
                markerEnd="url(#dl-big)" />
            ))
          : // program → N1, N3 (N2 má program lokálně, sem putuje od "klienta")
            NODES.filter((n) => n.id !== computeNode.id).map((n) => (
              <line key={n.id} x1={computeNode.x} y1={40} x2={n.x} y2={40}
                stroke="oklch(0.62 0.14 142)" strokeWidth="1.5" opacity={0.8}
                markerEnd="url(#dl-small)" />
            ))}

        <defs>
          <marker id="dl-big" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.62 0.14 264)" />
          </marker>
          <marker id="dl-small" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.62 0.14 142)" />
          </marker>
        </defs>
      </svg>

      <div style={{ padding: 10, background: "var(--bg-inset)", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {moveData ? (
          <span>
            <strong style={{ color: "oklch(0.6 0.16 264)" }}>Data za výpočtem (naivní):</strong> celé bloky se kopírují přes síť na jeden výpočetní uzel. Přenos ≈ <strong>{netMB} MB</strong>. Síť se stává úzkým hrdlem.
          </span>
        ) : (
          <span>
            <strong style={{ color: "oklch(0.55 0.16 142)" }}>Výpočet za daty (datová lokalita):</strong> plánovač pošle malý map task tam, kde už blok leží. Přes síť putuje jen ≈ <strong>{netMB.toFixed(2)} MB</strong> programu. Blok je oproti programu ~<strong>{ratio.toFixed(0)}×</strong> větší — proto se vyplatí stěhovat kód, ne data.
          </span>
        )}
      </div>
    </div>
  );
}
