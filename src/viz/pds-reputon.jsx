// RFC 7070/7072/7071: sestav reputační dotaz (HTTP URI dle 7072) a podívej se na
// odpovídající reputon (application/reputon+json dle 7071). Měň pole dotazu.
import { useState } from "react";

const SERVICES = ["rep.example.net", "rep.spamhaus.org", "nerd.cesnet.cz"];
const ASSERTIONS = ["spam", "malware", "phishing", "fraud"];

// fake-but-plausible ratings per assertion
const RATINGS = {
  spam: { rating: 0.012, confidence: 0.95, identity: "dkim", note: "doména hodnocena jako spam s pravd. 1,2 %" },
  malware: { rating: 0.34, confidence: 0.88, identity: "spf", note: "hostuje malware s pravd. 34 %" },
  phishing: { rating: 0.71, confidence: 0.9, identity: "dkim", note: "phishing s pravd. 71 % — vysoké riziko" },
  fraud: { rating: 0.08, confidence: 0.6, identity: "spf", note: "podvod s pravd. 8 %, nízká jistota" },
};

export default function PdsReputon() {
  const [service, setService] = useState(SERVICES[0]);
  const [application] = useState("email-id");
  const [subject, setSubject] = useState("example.com");
  const [assertion, setAssertion] = useState("spam");

  const uri = `http://${service}/${application}/${subject}/${assertion}`;
  const r = RATINGS[assertion];
  const sampleSize = 16938213;

  const reputon = `{
  "application": "${application}",
  "reputons": [
    {
      "rater": "${service}",
      "assertion": "${assertion}",
      "identity": "${r.identity}",
      "rated": "${subject}",
      "rating": ${r.rating},
      "confidence": ${r.confidence},
      "sample-size": ${sampleSize}
    }
  ]
}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* query builder */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
        <label style={lbl}>
          <span style={lblTxt}>reputační služba</span>
          <select value={service} onChange={(e) => setService(e.target.value)} style={sel}>
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={lbl}>
          <span style={lblTxt}>aplikace (kontext)</span>
          <input value={application} readOnly style={{ ...sel, opacity: 0.7 }} />
        </label>
        <label style={lbl}>
          <span style={lblTxt}>subject (předmět)</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value || "example.com")} style={sel} />
        </label>
        <label style={lbl}>
          <span style={lblTxt}>assertion (tvrzení)</span>
          <select value={assertion} onChange={(e) => setAssertion(e.target.value)} style={sel}>
            {ASSERTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
      </div>

      {/* request URI (RFC 7072) */}
      <div style={panel}>
        <div style={panelLabel}>① dotaz klienta — HTTP URI (RFC 7072)</div>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--accent)", wordBreak: "break-all" }}>
          GET {uri}
        </code>
      </div>

      {/* response reputon (RFC 7071) */}
      <div style={panel}>
        <div style={panelLabel}>② odpověď — application/reputon+json (RFC 7071)</div>
        <pre style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", whiteSpace: "pre-wrap", lineHeight: 1.4 }}>
          {reputon}
        </pre>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.45 }}>
        <strong>rating</strong> {r.rating} → {r.note}. <strong>confidence</strong> {r.confidence} = jistota {(r.confidence * 100).toFixed(0)} %.
        <strong> sample-size</strong> = počet hodnot použitých k výpočtu. Architektura klient–server je definována v RFC 7070.
      </div>
    </div>
  );
}

const lbl = { display: "flex", flexDirection: "column", gap: 3 };
const lblTxt = { color: "var(--text-muted)", fontSize: 11 };
const sel = {
  padding: "4px 6px",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  background: "var(--bg-card)",
  border: "1px solid var(--line)",
  borderRadius: 4,
  color: "var(--text)",
};
const panel = { padding: 10, background: "var(--bg-inset)", borderRadius: 6, border: "1px solid var(--line)" };
const panelLabel = {
  fontSize: 10.5,
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
  marginBottom: 6,
};
