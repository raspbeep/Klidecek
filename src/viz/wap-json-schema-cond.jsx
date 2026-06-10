// JSON Schema if/then/else — podmíněná validace PSČ podle země.
// Vyber zemi a uprav PSČ; viz ukáže, kterou větev schématu validátor použije
// a zda je dokument validní, plus jaký regex se uplatnil.
import { useState } from "react";

const GREEN = "oklch(0.52 0.16 142)";
const RED = "oklch(0.55 0.18 22)";

// pravidla
const RULES = {
  USA: { re: /^[0-9]{5}$/, hint: "5 číslic, např. 90210" },
  Canada: { re: /^[A-Za-z][0-9][A-Za-z] ?[0-9][A-Za-z][0-9]$/, hint: "A1A 1A1" },
};

export default function WapJsonSchemaCond() {
  const [country, setCountry] = useState("USA");
  const [postal, setPostal] = useState("90210");

  const rule = RULES[country];
  const valid = rule.re.test(postal);
  // if (country == USA) → then USA-regex; else Canada-regex
  const branch = country === "USA" ? "then" : "else";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* ovládání */}
      <div className="viz-controls" style={{
        gap: 12,
        padding: "8px 10px", background: "var(--bg-inset)", borderRadius: 8,
        border: "1px solid var(--line)", fontSize: 12.5,
      }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontFamily: "var(--font-mono)" }}>country:</span>
          <select className="viz-select" value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="USA">USA</option>
            <option value="Canada">Canada</option>
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontFamily: "var(--font-mono)" }}>postalCode:</span>
          <input value={postal} onChange={(e) => setPostal(e.target.value)} style={inpStyle} />
        </label>
      </div>

      {/* schéma + vyhodnocení */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <pre style={{
          flex: "1 1 240px", minWidth: 220, margin: 0, padding: 10,
          background: "var(--bg-card)", border: "1px solid var(--line)",
          borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 10.5,
          lineHeight: 1.5, color: "var(--text-muted)", overflowX: "auto",
        }}>
{`"if":   { "properties": {`}
{"\n"}
{`          "country": {`}
<span style={{ color: branch === "then" ? GREEN : "var(--text-faint)" }}>{` "const": "USA" `}</span>
{`} } },`}
{"\n"}
<span style={{
  background: branch === "then" ? GREEN + "22" : "transparent",
  color: branch === "then" ? GREEN : "var(--text-muted)",
  fontWeight: branch === "then" ? 700 : 400,
}}>{`"then": { "properties": { "postalCode":\n          { "pattern": "^[0-9]{5}$" } } },`}</span>
{"\n"}
<span style={{
  background: branch === "else" ? GREEN + "22" : "transparent",
  color: branch === "else" ? GREEN : "var(--text-muted)",
  fontWeight: branch === "else" ? 700 : 400,
}}>{`"else": { "properties": { "postalCode":\n          { "pattern": "…A1A 1A1…" } } }`}</span>
        </pre>

        <div style={{
          flex: "1 1 160px", minWidth: 150, display: "flex",
          flexDirection: "column", gap: 6,
        }}>
          <div style={{
            padding: "6px 9px", borderRadius: 6, fontSize: 11.5,
            background: "var(--bg-card)", border: "1px solid var(--line)",
          }}>
            <span style={{ color: "var(--text-muted)" }}>if vyhodnoceno → větev </span>
            <strong style={{ fontFamily: "var(--font-mono)", color: GREEN }}>{branch}</strong>
          </div>
          <div style={{
            padding: "6px 9px", borderRadius: 6, fontSize: 11,
            background: "var(--bg-card)", border: "1px solid var(--line)",
            color: "var(--text-muted)",
          }}>
            očekávaný tvar:<br />
            <strong style={{ color: "var(--text)" }}>{rule.hint}</strong>
          </div>
          <div style={{
            padding: "8px 9px", borderRadius: 6, fontSize: 13, fontWeight: 700,
            textAlign: "center",
            background: valid ? GREEN + "1f" : RED + "1f",
            border: `1.5px solid ${valid ? GREEN : RED}`,
            color: valid ? GREEN : RED,
          }}>
            {valid ? "✓ VALIDNÍ" : "✗ NEVALIDNÍ"}
          </div>
        </div>
      </div>

      <div style={{
        fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5,
        padding: "8px 10px", background: "var(--bg-card)",
        borderRadius: 6, border: "1px solid var(--line)",
      }}>
        Klíč <code>country = "{country}"</code>{" "}
        {country === "USA"
          ? "splňuje if (const \"USA\"), takže platí větev then a postalCode se měří regexem na 5 číslic."
          : "nesplňuje if, takže platí větev else a postalCode se měří kanadským vzorem."}{" "}
        Stejné pole tak má v různých kontextech různá pravidla — to je podstata if/then/else.
      </div>
    </div>
  );
}

const inpStyle = {
  padding: "3px 6px", fontSize: 11.5, fontFamily: "var(--font-mono)",
  background: "var(--bg-card)", border: "1px solid var(--line)",
  borderRadius: 3, color: "var(--text)", width: 90,
};
