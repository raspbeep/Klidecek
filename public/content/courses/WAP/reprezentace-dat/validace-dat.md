---
title: Validace značkovacích jazyků
---

Syntakticky správný (**well‑formed**) dokument pro aplikaci nestačí. To, že XML má jeden kořen a spárované tagy, nic neříká o tom, zda obsahuje *právě ty elementy a typy*, na kterých jsme se s protistranou dohodli. Tomuto formálnímu ověření obsahu proti dohodnutému modelu se říká **validace**.

## Well‑formed ≠ validní

Rozdíl je zásadní a u zkoušky často probíraný:

* **Well‑formed** — dokument dodržuje gramatiku XML (právě jeden kořenový element, dokonale spárované otevírací a uzavírací tagy, plná **case‑sensitivita**, hodnoty atributů v uvozovkách, speciální znaky jako `<` a `&` nahrazené **entitami** `&lt;` / `&amp;`). Bez toho ho parser ani nepřečte.
* **Validní** — dokument je *navíc* v souladu s konkrétním **schématem** (modelem), které předepisuje povolené elementy, jejich pořadí, počet výskytů a datové typy.

::: svg "Vztah obou pojmů: každý validní dokument je well-formed, naopak ne"
<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="160" cy="105" r="90" fill="oklch(0.55 0.14 65 / 0.10)" stroke="oklch(0.52 0.16 65)"/>
  <circle cx="160" cy="130" r="48" fill="oklch(0.55 0.14 142 / 0.18)" stroke="oklch(0.50 0.16 142)"/>
  <text x="160" y="38" text-anchor="middle" font-size="12.5" font-weight="600" fill="oklch(0.45 0.16 65)">well-formed</text>
  <text x="160" y="54" text-anchor="middle" font-size="10" fill="var(--text-muted)">dodržuje gramatiku XML</text>
  <text x="160" y="128" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.42 0.16 142)">validní</text>
  <text x="160" y="143" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">+ odpovídá schématu</text>
  <text x="160" y="186" text-anchor="middle" font-size="10.5" fill="var(--text)" font-style="italic">každý validní je well-formed; naopak to neplatí</text>
</svg>
:::

## Validace XML

Pro XML existuje několik schémových jazyků s rostoucí výrazovou silou.

### DTD — Document Type Definition

Nejstarší metoda, zděděná ze SGML. Předepíše **gramatiku a zanořování** elementů a seznam atributů, ale má dvě zásadní omezení:

* **nepodporuje datové typy** — textový obsah elementu je vždy jen `#PCDATA` (*parsed character data*), nelze tedy říct „tady musí být celé číslo";
* **nezná jmenné prostory** (XML Namespaces), takže míchat více slovníků do jednoho dokumentu je problematické.

```dtd
<!ELEMENT objednavka (zakaznik, polozka+)>
<!ELEMENT zakaznik (#PCDATA)>
<!ELEMENT polozka (nazev, cena)>
<!ATTLIST objednavka id CDATA #REQUIRED>
```

### XSD — XML Schema (W3C)

Aktuální robustní standard organizace [W3C](https://www.w3.org/TR/xmlschema11-1/), který nedostatky DTD odstraňuje. Samotné schéma se píše **ve formátu XML** a přináší **vyspělý typový systém** — elementy lze omezit jen na celá čísla, desetinná čísla, data, **regulární výrazy**, výčty hodnot či rozsahy, podporuje jmenné prostory.

```xml
<xs:element name="item" maxOccurs="unbounded">
  <xs:complexType>
    <xs:sequence>
      <xs:element name="title"    type="xs:string"/>
      <xs:element name="note"     type="xs:string" minOccurs="0"/>
      <xs:element name="quantity" type="xs:positiveInteger"/>
      <xs:element name="price"    type="xs:decimal"/>
    </xs:sequence>
  </xs:complexType>
</xs:element>
```

Klíčový pojem: při validaci proti XSD vzniká **PSVI** (*Post‑Schema‑Validation Infoset*) — obohacený infoset, ve kterém má každý text přiřazen **reálný aplikační datový typ** (např. `integer` či `date`) a doplněny výchozí/normalizované hodnoty. Aplikace pak s daty může pracovat jako s typovanými objekty, ne jako s holými řetězci.

### Schematron a Relax NG

Dvě další alternativy s jiným přístupem:

* **Relax NG** — nabízí **jednodušší a elegantnější** definici struktur než XSD (existuje i kompaktní syntaxe), ale méně rozsáhlý vestavěný typový systém.
* **Schematron** — nevytváří klasickou gramatiku, ale **sadu pravidel (asercí) zapsaných v jazyce XPath**. Umí vyjádřit podmínky napříč dokumentem, na které gramatika nestačí, např. *„pokud existuje element A, jeho hodnota musí být menší než hodnota elementu B"*. (Tuto myšlenku XPath‑asercí převzal i XSD 1.1 přes `xs:assert`.)

| Jazyk | Datové typy | Jmenné prostory | Hlavní síla |
|---|---|---|---|
| DTD | ne (`#PCDATA`) | ne | jednoduchá gramatika |
| XSD | bohaté (PSVI) | ano | typový systém, výchozí hodnoty |
| Relax NG | omezené | ano | jednoduchost, čitelnost |
| Schematron | — | ano | mezi‑elementová pravidla (XPath) |

## Validace JSON: JSON Schema

JSON nemá atributy ani jmenné prostory, takže XML Schema na něj nelze použít. Vlastní validační jazyk je **[JSON Schema](https://json-schema.org/)** — deklarativní slovník zapsaný **přímo ve formátu JSON**. Umožňuje efektivně předepsat:

* **povinné prvky** — `required`;
* **datové typy** — `type` (`string`, `number`, `integer`, `boolean`, `object`, `array`, `null`);
* **omezení hodnot a délek** — `minimum`/`maximum`, `minLength`/`maxLength`, `pattern` (regex), `enum`, `format`.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["title", "content", "author"],
  "properties": {
    "title":   { "type": "string", "minLength": 1 },
    "content": { "type": "string" },
    "publishedDate": { "type": "string", "format": "date-time" },
    "tags": { "type": "array", "items": { "type": "string" } }
  }
}
```

### Podmíněná validace

Pokročilé verze (draft 2019‑09 a 2020‑12) nabízejí **podmíněnou validaci** — to, co je platné, se dynamicky přizpůsobí jiné hodnotě:

* dvojice/trojice **`if` / `then` / `else`** — je‑li podschéma v `if` splněno, musí platit `then`; jinak musí platit `else`. (Vynechaný `then`/`else` se chová jako „vždy platí".)
* **`dependentRequired`** — *„je‑li přítomen klíč P, pak jsou povinné i klíče X, Y"*.

Typický příklad: formát poštovního směrovacího čísla se validuje jinak podle hodnoty klíče `country` (`"USA"` → pět číslic, `"Canada"` → vzor písmeno‑číslice). Následující viz tuto myšlenku ukazuje naživo — měníš zemi a PSČ a sleduješ, kterou větev schématu validátor vybere.

::: viz wap-json-schema-cond "Vyber zemi a uprav PSČ. Schéma má if/then/else: podle 'country' se použije jiný regex na 'postalCode' — sleduj, kdy je dokument validní a proč."
:::

::: quiz "Dokument XML má jeden kořen, spárované tagy a hodnoty atributů v uvozovkách, ale obsahuje element, který schéma nepovoluje. Jak ho označíme?"
- [x] Well‑formed, ale nevalidní.
  > Správně. Gramatiku XML splňuje (proto well‑formed), ale neodpovídá schématu (proto nevalidní). Validní ⇒ well‑formed, opačně to neplatí.
- [ ] Nevalidní, a tedy ani well‑formed.
  > Tyto vlastnosti jsou nezávislé v jednom směru: být well‑formed lze i bez validity. Dokument je well‑formed.
- [ ] Validní, protože je well‑formed.
  > Well‑formedness je jen syntaxe. Validita navíc vyžaduje soulad se schématem, který zde chybí.
:::

::: link "JSON Schema — Conditional schema validation (if/then/else, dependentRequired)" "https://json-schema.org/understanding-json-schema/reference/conditionals"
:::

::: link "W3C — XML Schema Definition Language (XSD) 1.1" "https://www.w3.org/TR/xmlschema11-1/"
:::

::: link "ISO Schematron — oficiální stránka" "https://schematron.com/"
:::

::: link "Relax NG — specifikace (OASIS)" "https://relaxng.org/spec-20011203.html"
:::

*Zdroj: SZZ NADE — předmět Internetové aplikace (WAP), VUT FIT. Externí reference: W3C XSD 1.1, JSON Schema (draft 2020-12), ISO Schematron, Relax NG (OASIS).*
