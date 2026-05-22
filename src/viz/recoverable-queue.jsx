// Recoverable queue — simulátor zotavitelné fronty s injekcí havárie.
// Producent vloží zprávu v transakci, fronta ji uchová trvanlivě, konzument
// později vyzvedne. Klikni „havárie" v jakémkoli kroku a sleduj, co přežije.
import { useState } from "react";

/**
 * Scenario steps: producer creates order in DB + enqueues message in queue,
 * all in one JTA transaction (DB + Queue as XA resources).
 *
 * Then later (separate transaction) consumer picks up message, processes, commits.
 *
 * Crash button at any step shows what survives.
 */

const STEPS = [
  {
    id: 0,
    title: "Start — vše idle",
    detail: "Žádná transakce neběží. DB prázdná, fronta prázdná, konzument čeká.",
    state: { tx: null, db: [], queue: [], consumer: "idle", processed: [] },
  },
  {
    id: 1,
    title: "1️⃣ Producent: begin TX",
    detail: "Producent (např. OrderService) zahájí JTA transakci. JTA koordinátor pozná DB i JMS broker jako XA resources.",
    state: { tx: "active", db: [], queue: [], consumer: "idle", processed: [], producerPending: { db: null, queue: null } },
  },
  {
    id: 2,
    title: "2️⃣ Insert do DB",
    detail: "Producent vloží objednávku do DB. Změna je „pending\" — viditelná jen v této transakci.",
    state: { tx: "active", db: [], queue: [], consumer: "idle", processed: [],
      producerPending: { db: { id: 42, item: "kniha" }, queue: null } },
  },
  {
    id: 3,
    title: "3️⃣ Vlož do fronty",
    detail: "Producent pošle zprávu na expediční frontu. Také „pending\" — fronta zatím zprávu nezpřístupní.",
    state: { tx: "active", db: [], queue: [], consumer: "idle", processed: [],
      producerPending: { db: { id: 42, item: "kniha" }, queue: { orderId: 42 } } },
  },
  {
    id: 4,
    title: "4️⃣ JTA commit (XA 2PC)",
    detail: "JTA koordinuje 2PC mezi DB a brokerem. Buď oba commitnou (atomicky), nebo ani jeden. To je ta klíčová záruka.",
    state: { tx: null, db: [{ id: 42, item: "kniha", state: "new" }], queue: [{ orderId: 42 }], consumer: "idle", processed: [] },
  },
  {
    id: 5,
    title: "⏳ ... uplyne čas ...",
    detail: "Mezi commitem producenta a startem konzumenta může být libovolně dlouhá prodleva. Zpráva persistentně čeká.",
    state: { tx: null, db: [{ id: 42, item: "kniha", state: "new" }], queue: [{ orderId: 42 }], consumer: "idle", processed: [] },
  },
  {
    id: 6,
    title: "5️⃣ Konzument: begin TX, fetch zprávu",
    detail: "Konzument (@MessageDriven bean) zahájí novou TX a vyzvedne zprávu z fronty. Zpráva je „in-flight\" — pokud TX rollbackne, vrátí se do fronty.",
    state: { tx: "consumer", db: [{ id: 42, item: "kniha", state: "new" }], queue: [], consumer: "processing", processed: [],
      consumerPending: { msg: { orderId: 42 } } },
  },
  {
    id: 7,
    title: "6️⃣ Zpracuj objednávku (např. update v DB)",
    detail: "Konzument zpracuje zprávu — třeba vystaví fakturu, aktualizuje stav objednávky na „zpracováno\".",
    state: { tx: "consumer", db: [{ id: 42, item: "kniha", state: "processed" }], queue: [], consumer: "processing", processed: [],
      consumerPending: { msg: { orderId: 42 }, dbUpdate: true } },
  },
  {
    id: 8,
    title: "7️⃣ Konzument: commit",
    detail: "Konzument commitne. Zpráva je nyní trvale odstraněna z fronty, DB obsahuje aktualizovaný stav. Hotovo.",
    state: { tx: null, db: [{ id: 42, item: "kniha", state: "processed" }], queue: [], consumer: "idle", processed: [{ orderId: 42 }] },
  },
];

// Apply crash effect to current state
function applyCrash(state, crashStep) {
  // Crash effects:
  // step 1-3: producer was in tx -> all pending lost (rollback)
  // step 4 (right after commit): everything persisted
  // step 5: nothing in flight, just persisted state
  // step 6-7: consumer was in tx -> message returned to queue (rollback), DB update reverted
  // step 8: commit done, nothing to lose
  const s = { ...state };
  if (crashStep <= 3) {
    // producer crash mid-tx
    return { ...s, tx: null, producerPending: undefined, db: [], queue: [],
      crashEffect: "TX rolled back: DB beze změny, fronta prázdná. Žádná zpráva neuteče." };
  }
  if (crashStep === 4) {
    // crash right at commit point - XA two-phase commit guarantees atomicity
    return { ...s, tx: null,
      crashEffect: "XA 2PC: pokud crash před fází 1 (PREPARE), oba rollback. Pokud po fázi 1, oba commit po recovery. Bez ztráty atomicity." };
  }
  if (crashStep === 5) {
    return { ...s,
      crashEffect: "Žádná aktivní TX. Zpráva trvanlivě uložena ve frontě, DB stav konzistentní. Po restartu konzument pokračuje." };
  }
  if (crashStep >= 6 && crashStep <= 7) {
    // consumer crash mid-tx -> rollback
    return {
      tx: null,
      db: [{ id: 42, item: "kniha", state: "new" }], // db update reverted
      queue: [{ orderId: 42 }], // message returned
      consumer: "idle",
      processed: [],
      crashEffect: "Konzument rollback: DB update zrušen, ZPRÁVA SE VRÁTÍ DO FRONTY. Po restartu jiný konzument (nebo tentýž) ji vyzvedne znovu — at-least-once doručení.",
    };
  }
  if (crashStep === 8) {
    return { ...s, crashEffect: "Commit dokončen, žádný in-flight stav. Nic se neztratí." };
  }
  return s;
}

export default function RecoverableQueue() {
  const [step, setStep] = useState(0);
  const [crashed, setCrashed] = useState(false);

  const baseState = STEPS[step].state;
  const state = crashed ? applyCrash(baseState, step) : baseState;

  const reset = () => { setStep(0); setCrashed(false); };
  const next = () => {
    if (crashed) { setCrashed(false); return; }
    setStep(Math.min(STEPS.length - 1, step + 1));
  };
  const prev = () => {
    if (crashed) { setCrashed(false); return; }
    setStep(Math.max(0, step - 1));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Controls */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <button style={navBtn} onClick={prev} disabled={step === 0 && !crashed}>← předchozí</button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          krok {step + 1} / {STEPS.length} {crashed && "(💥 crash)"}
        </div>
        <button style={navBtn} onClick={next} disabled={step === STEPS.length - 1 && !crashed}>další →</button>
        <button onClick={() => setCrashed(true)} disabled={crashed} style={{
          ...navBtn,
          background: "oklch(0.62 0.18 22 / 0.20)",
          borderColor: "oklch(0.55 0.18 22)",
          color: "oklch(0.40 0.18 22)",
        }}>
          💥 havárie zde
        </button>
        <button onClick={reset} style={navBtn}>↺</button>
      </div>

      {/* Three lanes */}
      <svg viewBox="0 0 560 260" style={{ width: "100%", maxWidth: 560 }}>
        <rect width="560" height="260" fill="var(--bg-inset)" />

        {/* Producer lane */}
        <g>
          <rect x="10" y="10" width="160" height="240" rx="6" fill="oklch(0.62 0.14 264 / 0.06)" stroke="oklch(0.55 0.18 264)" />
          <text x="90" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="oklch(0.40 0.18 264)">Producer</text>
          {state.producerPending && (
            <g>
              <rect x="20" y="48" width="140" height="56" rx="4" fill="oklch(0.62 0.14 65 / 0.20)" stroke="oklch(0.55 0.18 65)" strokeDasharray="3 3" />
              <text x="90" y="64" textAnchor="middle" fontSize="10" fontWeight="600" fill="oklch(0.40 0.18 65)">pending TX</text>
              {state.producerPending.db && (
                <text x="90" y="80" textAnchor="middle" fontSize="9.5" fill="var(--text)" fontFamily="var(--font-mono)">
                  INSERT id={state.producerPending.db.id}
                </text>
              )}
              {state.producerPending.queue && (
                <text x="90" y="94" textAnchor="middle" fontSize="9.5" fill="var(--text)" fontFamily="var(--font-mono)">
                  SEND orderId={state.producerPending.queue.orderId}
                </text>
              )}
            </g>
          )}
          {state.tx === "active" && (
            <text x="90" y="240" textAnchor="middle" fontSize="10" fill="oklch(0.40 0.18 65)" fontFamily="var(--font-mono)">⚡ TX aktivní</text>
          )}
        </g>

        {/* Queue + DB middle column */}
        <g>
          <rect x="195" y="10" width="170" height="115" rx="6" fill="oklch(0.62 0.14 80 / 0.06)" stroke="oklch(0.55 0.18 80)" />
          <text x="280" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="oklch(0.40 0.18 80)">Message Queue</text>
          <text x="280" y="40" textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontStyle="italic">(trvanlivá)</text>
          {state.queue.length === 0 ? (
            <text x="280" y="80" textAnchor="middle" fontSize="11" fill="var(--text-faint)" fontFamily="var(--font-mono)">— prázdná —</text>
          ) : (
            state.queue.map((m, i) => (
              <g key={i}>
                <rect x="215" y={55 + i * 30} width="130" height="22" rx="3" fill="oklch(0.62 0.14 80 / 0.30)" stroke="oklch(0.55 0.18 80)" />
                <text x="280" y={69 + i * 30} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">
                  msg: orderId={m.orderId}
                </text>
              </g>
            ))
          )}

          <rect x="195" y="135" width="170" height="115" rx="6" fill="oklch(0.62 0.14 142 / 0.06)" stroke="oklch(0.55 0.18 142)" />
          <text x="280" y="153" textAnchor="middle" fontSize="12" fontWeight="600" fill="oklch(0.30 0.14 142)">Database</text>
          <text x="280" y="165" textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontStyle="italic">(trvanlivá)</text>
          {state.db.length === 0 ? (
            <text x="280" y="200" textAnchor="middle" fontSize="11" fill="var(--text-faint)" fontFamily="var(--font-mono)">— prázdná —</text>
          ) : (
            state.db.map((row, i) => (
              <g key={i}>
                <rect x="215" y={180 + i * 30} width="130" height="32" rx="3" fill="oklch(0.62 0.14 142 / 0.20)" stroke="oklch(0.55 0.18 142)" />
                <text x="280" y={194 + i * 30} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">
                  id={row.id}, {row.item}
                </text>
                <text x="280" y={206 + i * 30} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)"
                  fill={row.state === "processed" ? "oklch(0.30 0.14 142)" : "oklch(0.40 0.18 65)"} fontWeight="600">
                  state: {row.state}
                </text>
              </g>
            ))
          )}
        </g>

        {/* Consumer lane */}
        <g>
          <rect x="390" y="10" width="160" height="240" rx="6" fill="oklch(0.62 0.14 22 / 0.06)" stroke="oklch(0.55 0.18 22)" />
          <text x="470" y="28" textAnchor="middle" fontSize="12" fontWeight="600" fill="oklch(0.40 0.18 22)">Consumer</text>
          <text x="470" y="42" textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">
            state: {state.consumer}
          </text>
          {state.consumerPending && (
            <g>
              <rect x="400" y="55" width="140" height="56" rx="4" fill="oklch(0.62 0.14 22 / 0.20)" stroke="oklch(0.55 0.18 22)" strokeDasharray="3 3" />
              <text x="470" y="71" textAnchor="middle" fontSize="10" fontWeight="600" fill="oklch(0.40 0.18 22)">in-flight TX</text>
              <text x="470" y="87" textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text)">
                msg: orderId={state.consumerPending.msg.orderId}
              </text>
              {state.consumerPending.dbUpdate && (
                <text x="470" y="101" textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text)">
                  UPDATE → processed
                </text>
              )}
            </g>
          )}
          {state.processed.length > 0 && (
            <g>
              <text x="400" y="220" fontSize="10" fill="oklch(0.30 0.14 142)" fontWeight="600">✓ dokončeno:</text>
              {state.processed.map((p, i) => (
                <text key={i} x="400" y={234 + i * 12} fontSize="9.5" fontFamily="var(--font-mono)" fill="oklch(0.30 0.14 142)">
                  orderId={p.orderId}
                </text>
              ))}
            </g>
          )}
        </g>
      </svg>

      {/* Step description */}
      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>
          {STEPS[step].title}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.55 }}>
          {STEPS[step].detail}
        </div>
      </div>

      {/* Crash effect */}
      {crashed && state.crashEffect && (
        <div style={{
          padding: 10, background: "oklch(0.62 0.18 22 / 0.10)",
          border: "1px solid oklch(0.55 0.18 22)", borderRadius: 6,
          fontSize: 12.5, color: "var(--text)", lineHeight: 1.55,
        }}>
          <strong style={{ color: "oklch(0.40 0.18 22)" }}>💥 Havárie v kroku {step + 1}:</strong>{" "}
          {state.crashEffect}
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--text-faint)", lineHeight: 1.5 }}>
        <strong>Klíčová záruka:</strong> JTA XA 2PC dělá z atomické dvojice „insert do DB + vlož do fronty"
        jednu transakci. Bez XA bys musel implementovat čítač pro detekci stavu po havárii (viz „reálné události").
        Konzument musí být <em>idempotentní</em> — při retry nesmí způsobit duplicitu.
      </div>
    </div>
  );
}

const navBtn = {
  padding: "5px 12px",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 4,
  cursor: "pointer",
};
