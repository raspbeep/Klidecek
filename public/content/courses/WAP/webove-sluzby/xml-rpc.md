---
title: XML-RPC
---

Jakmile spolu mají komunikovat dvě aplikace napsané v různých jazycích a běžící na různých strojích, potřebují se shodnout na *společném jazyce volání*. **XML-RPC** byl historicky první široce přijatý standard pro vzdálené volání procedur (RPC, *Remote Procedure Call*) po síti. Vznikl roku 1998 jako záměrně minimalistická odpověď na tehdejší těžkopádné technologie pro distribuované objekty (zejména CORBA): myšlenkou bylo *„zavolat funkci na jiném počítači stejně snadno jako lokálně"*, ale s pomocí dvou věcí, které už každý uměl — HTTP jako transportu a XML jako serializačního formátu.

Klient tedy převede volání lokální funkce na HTTP požadavek, server jej dekóduje, provede odpovídající proceduru a výsledek pošle zpět zakódovaný v XML. Pro programátora to vypadá téměř jako obyčejné volání metody — síťová vrstva zůstává skrytá.

## Síťový model: jeden endpoint, výhradně POST

XML-RPC **záměrně potlačuje běžnou sémantiku webu**. Místo aby každý zdroj měl vlastní URI a využíval různá HTTP slovesa, má celá služba *jediný koncový bod* (jedno URI), který slouží jako univerzální brána, a **veškerá komunikace probíhá výhradně přes metodu HTTP POST**. Co se má vlastně vykonat, není zakódováno v URL ani v HTTP metodě, ale až uvnitř těla XML zprávy v elementu `methodName`.

Tělo požadavku má `Content-Type: text/xml` a HTTP hlavičky `Host` a `User-Agent` musí být uvedeny. Důsledek tohoto návrhu je zásadní: protože každé volání (i pouhé čtení) je POST na stejnou adresu, **mezilehlé prvky sítě nemohou odpovědi cachovat** — z pohledu HTTP cache, proxy nebo CDN vypadají všechna volání stejně a jsou považována za potenciálně měnící stav. Tunelování přes POST je vlastnost, kterou XML-RPC sdílí se SOAP a kterou REST naopak odmítá.

::: svg "Architektura XML-RPC: jeden endpoint, vše přes POST, akce je v těle"
<svg viewBox="0 0 540 170" xmlns="http://www.w3.org/2000/svg">
  <rect x="14" y="40" width="120" height="90" rx="8" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.55 0.16 264)"/>
  <text x="74" y="64" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.50 0.16 264)">klient</text>
  <text x="74" y="84" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">volá lokální</text>
  <text x="74" y="98" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">„proxy" funkci</text>
  <text x="74" y="116" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">add(2, 3)</text>
  <line x1="134" y1="70" x2="404" y2="70" stroke="oklch(0.55 0.16 22)" stroke-width="1.6" marker-end="url(#xrpcA)"/>
  <text x="269" y="60" text-anchor="middle" font-size="10" font-family="var(--font-mono)" font-weight="600" fill="oklch(0.55 0.16 22)">POST /RPC2</text>
  <text x="269" y="86" text-anchor="middle" font-size="9" fill="var(--text-muted)">methodCall (text/xml)</text>
  <line x1="404" y1="105" x2="134" y2="105" stroke="oklch(0.52 0.16 142)" stroke-width="1.6" marker-end="url(#xrpcA)"/>
  <text x="269" y="123" text-anchor="middle" font-size="9" fill="var(--text-muted)">methodResponse</text>
  <rect x="406" y="40" width="120" height="90" rx="8" fill="oklch(0.52 0.16 142 / 0.10)" stroke="oklch(0.50 0.16 142)"/>
  <text x="466" y="64" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.42 0.16 142)">server</text>
  <text x="466" y="84" text-anchor="middle" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">jediné URI</text>
  <text x="466" y="98" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">dispatch dle</text>
  <text x="466" y="112" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">methodName</text>
  <text x="270" y="150" text-anchor="middle" font-size="10" fill="var(--text-faint)">Co se má vykonat NENÍ v URL ani v metodě — je až v těle XML.</text>
  <defs>
    <marker id="xrpcA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="currentColor"/>
    </marker>
  </defs>
</svg>
:::

## Struktura zprávy: methodCall a methodResponse

Požadavek je XML dokument s kořenovým elementem `methodCall`. Ten obsahuje povinný `methodName` (název volané procedury) a volitelný `params` se seznamem parametrů. Každý parametr je obalen elementem `value`, jehož vnitřní element určuje typ.

```xml
<?xml version="1.0"?>
<methodCall>
  <methodName>math.add</methodName>
  <params>
    <param><value><int>2</int></value></param>
    <param><value><int>3</int></value></param>
  </params>
</methodCall>
```

Odpověď má kořenový element `methodResponse` a může obsahovat **buď** `params` s návratovou hodnotou, **anebo** element `fault` při chybě — nikdy oboje současně.

```xml
<?xml version="1.0"?>
<methodResponse>
  <params>
    <param><value><int>5</int></value></param>
  </params>
</methodResponse>
```

## Hlášení chyb: fault

Při chybě se vrací `methodResponse` obsahující `fault`. Uvnitř je vždy jediný `value` typu `struct` s **přesně dvěma** členy: `faultCode` (typ `int`) a `faultString` (typ `string`). Struktura `fault` nesmí obsahovat žádné jiné členy. Pozoruhodné je, že **HTTP stavový kód zůstává 200 OK** i u chybové odpovědi — chyba je signalizována uvnitř těla, nikoli na úrovni HTTP. Specifikace navíc *nedefinuje* žádný globální seznam chybových kódů; jejich význam si určuje implementace serveru nebo nadstavbový standard.

```xml
<methodResponse>
  <fault>
    <value>
      <struct>
        <member><name>faultCode</name><value><int>4</int></value></member>
        <member><name>faultString</name>
          <value><string>Příliš mnoho parametrů.</string></value></member>
      </struct>
    </value>
  </fault>
</methodResponse>
```

## Typový systém

Typový systém je striktní a zrcadlí běžné datové typy programovacích jazyků. Skalární typy se značí vnitřním elementem uvnitř `value`; pokud typ chybí, hodnota je implicitně `string`.

| Element | Význam | Příklad |
|---|---|---|
| `<i4>` nebo `<int>` | 32bitové celé číslo se znaménkem (−2³¹ … 2³¹−1) | `<int>42</int>` |
| `<double>` | desetinné číslo (plovoucí řádová čárka) | `<double>3.14</double>` |
| `<boolean>` | pravdivostní hodnota — `0` (false) nebo `1` (true) | `<boolean>1</boolean>` |
| `<string>` | textový řetězec (výchozí, je-li typ vynechán) | `<string>ahoj</string>` |
| `<dateTime.iso8601>` | datum a čas ve formátu ISO 8601 (časové pásmo nedefinováno) | `19980717T14:08:55` |
| `<base64>` | binární data zakódovaná do Base64 | `<base64>eW91IGNhb…</base64>` |

K nim přistupují dva složené typy:

* **`<struct>`** — neuspořádaná množina pojmenovaných členů (`member` = `name` + `value`), obdoba záznamu / objektu.
* **`<array>`** — uspořádaný seznam hodnot uvnitř elementu `data`, obdoba pole. Prvky pole **nemusí být téhož typu**.

```xml
<value>
  <struct>
    <member><name>jmeno</name><value><string>Eva</string></value></member>
    <member><name>vek</name><value><int>30</int></value></member>
  </struct>
</value>
```

## Introspekce

Aby klient nemusel znát rozhraní serveru předem, definuje XML-RPC sadu *systémových metod* pro **introspekci** — objevování dostupných služeb za běhu. Volání `system.listMethods` vrátí pole názvů všech metod, které server nabízí; `system.methodSignature` vrátí signaturu (typy návratové hodnoty a parametrů) konkrétní metody a `system.methodHelp` její textový popis. Jde o de-facto rozšíření nad rámec původní specifikace, ale je široce podporované.

```xml
<methodCall>
  <methodName>system.listMethods</methodName>
  <params/>
</methodCall>
```

::: quiz "Server XML-RPC vrátí na chybné volání odpověď s `<fault>`. Jaký HTTP stavový kód odpověď nese?"
- [ ] 500 Internal Server Error — chyba se mapuje na HTTP kód 5xx.
  > Ne. XML-RPC nevyužívá HTTP stavové kódy pro aplikační chyby; ty signalizuje uvnitř těla.
- [x] 200 OK — chyba je uvnitř těla v elementu `fault`, HTTP vrstva o ní „neví".
  > Správně. Protože vše tuneluje přes POST a sémantiku řeší až tělo XML, i chybová odpověď je z pohledu HTTP úspěšná (200). To je přímý důsledek potlačení sémantiky webu.
- [ ] 400 Bad Request — protože parametry byly špatné.
  > Ne. Aplikační chyba se nemapuje na HTTP 4xx; výsledkem je 200 OK s `fault` v těle.
:::

::: link "XML-RPC Specification (xmlrpc.com)" "https://xmlrpc.com/spec.md"
:::

::: link "XML-RPC — Wikipedia" "https://en.wikipedia.org/wiki/XML-RPC"
:::

::: link "Python xmlrpc.client — referenční implementace klienta" "https://docs.python.org/3/library/xmlrpc.client.html"
:::

*Zdroj: SZZ NADE — předmět WAP — Internetové aplikace, VUT FIT. Externí reference: XML-RPC Specification (xmlrpc.com), Wikipedia, Python Standard Library docs.*
