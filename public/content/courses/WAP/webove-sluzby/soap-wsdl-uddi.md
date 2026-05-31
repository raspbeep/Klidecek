---
title: Klasické webové služby: SOAP, WSDL, UDDI
---

Tam, kde je [[xml-rpc]] záměrně minimalistické, představují tzv. *klasické webové služby* (anglicky „Big Web Services") robustní, standardizovaný systém navržený pro podnikové (enterprise) prostředí. Stojí na třech vzájemně se doplňujících pilířích, z nichž každý řeší jinou otázku: **SOAP** definuje *formát zprávy* (co a jak se posílá), **WSDL** *popisuje rozhraní* (jaké operace služba nabízí a kde) a **UDDI** poskytuje *registr* (jak služby najít). Dohromady tvoří tzv. zlatý trojúhelník publish–find–bind.

::: svg "Trojúhelník publish–find–bind: jak do sebe zapadají UDDI, WSDL a SOAP"
<svg viewBox="0 0 520 190" xmlns="http://www.w3.org/2000/svg">
  <rect x="200" y="14" width="120" height="44" rx="8" fill="oklch(0.52 0.16 65 / 0.12)" stroke="oklch(0.52 0.16 65)"/>
  <text x="260" y="34" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.48 0.16 65)">UDDI registr</text>
  <text x="260" y="50" text-anchor="middle" font-size="9" fill="var(--text-muted)">vyhledávání služeb</text>
  <rect x="26" y="128" width="140" height="48" rx="8" fill="oklch(0.62 0.14 264 / 0.12)" stroke="oklch(0.55 0.16 264)"/>
  <text x="96" y="148" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.50 0.16 264)">klient (consumer)</text>
  <text x="96" y="164" text-anchor="middle" font-size="9" fill="var(--text-muted)">generuje klienta z WSDL</text>
  <rect x="354" y="128" width="140" height="48" rx="8" fill="oklch(0.52 0.16 142 / 0.12)" stroke="oklch(0.50 0.16 142)"/>
  <text x="424" y="148" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.42 0.16 142)">poskytovatel</text>
  <text x="424" y="164" text-anchor="middle" font-size="9" fill="var(--text-muted)">publikuje WSDL</text>
  <line x1="354" y1="48" x2="320" y2="42" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#swuA)"/>
  <text x="372" y="92" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">1. publish (WSDL)</text>
  <line x1="166" y1="148" x2="200" y2="48" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#swuA)"/>
  <text x="120" y="96" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">2. find</text>
  <line x1="354" y1="152" x2="166" y2="152" stroke="oklch(0.55 0.16 22)" stroke-width="1.6" marker-end="url(#swuA)"/>
  <text x="260" y="146" text-anchor="middle" font-size="9.5" font-weight="600" fill="oklch(0.55 0.16 22)">3. bind — volání přes SOAP</text>
  <defs>
    <marker id="swuA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="currentColor"/>
    </marker>
  </defs>
</svg>
:::

## SOAP — formát zprávy

**SOAP** (původně *Simple Object Access Protocol*, dnes je zkratka považována za vlastní jméno) vznikl jako evoluce XML-RPC do plnohodnotného standardu pro výměnu XML zpráv; spravuje jej W3C. Každá SOAP zpráva má pevnou stromovou strukturu:

* **Envelope (obálka)** — *povinný* kořenový element, který uvozuje zprávu a definuje použité jmenné prostory (XML namespaces).
* **Header (hlavička)** — *nepovinný* element pro meta-informace infrastruktury, které se netýkají vlastních aplikačních dat: bezpečnostní tokeny, směrování, identifikátory transakcí. Právě sem se zapojují rozšiřující standardy.
* **Body (tělo)** — *povinný* element s vlastními aplikačními daty. Při chybě obsahuje standardizovaný blok **Fault** (s pod-elementy jako `faultcode` a `faultstring`).

```xml
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header>
    <wsse:Security>…bezpečnostní token…</wsse:Security>
  </soap:Header>
  <soap:Body>
    <m:GetPrice xmlns:m="https://example.com/stock">
      <m:Symbol>VUT</m:Symbol>
    </m:GetPrice>
  </soap:Body>
</soap:Envelope>
```

Klíčový rozdíl oproti XML-RPC a REST: **SOAP není vázán výhradně na HTTP**. Obálka je nezávislá na transportu, takže ji lze přenášet i přes SMTP, čistý TCP nebo frontu zpráv (JMS). Tato nezávislost otevírá prostor pro pokročilá rozšíření rodiny WS-\*:

| Rozšíření | Co řeší |
|---|---|
| **WS-Security** | šifrování a elektronické podpisy na úrovni zprávy (end-to-end, nezávisle na TLS spoji) |
| **WS-ReliableMessaging** | garantované doručení zprávy (i přes nespolehlivý transport) |
| **WS-AtomicTransaction** | distribuované ACID transakce napříč službami |

Cenou za tuto robustnost je *upovídanost*: každá zpráva nese rozsáhlou XML obálku, jejíž parsování a validace má nezanedbatelnou režii.

## WSDL — strojem čitelný popis rozhraní

**WSDL** (*Web Services Description Language*) je XML formát, který *formálně a strojově čitelně* popisuje rozhraní služby. Odděluje **abstraktní** definici operací od jejich **konkrétní** vazby na protokol a adresu — díky tomu z WSDL dokumentu nástroje automaticky vygenerují klientský kód (tzv. *stub*/proxy), takže programátor volá vzdálené operace jako lokální metody.

::: svg "Vrstvy WSDL dokumentu: od abstraktních typů ke konkrétní adrese"
<svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="14" width="380" height="40" rx="6" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.55 0.16 264)"/>
  <text x="34" y="33" font-size="11" font-weight="600" font-family="var(--font-mono)" fill="oklch(0.50 0.16 264)">types</text>
  <text x="200" y="40" font-size="9.5" fill="var(--text-muted)">datové typy (XSD schéma)</text>
  <rect x="20" y="58" width="380" height="36" rx="6" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.55 0.16 264)"/>
  <text x="34" y="75" font-size="11" font-weight="600" font-family="var(--font-mono)" fill="oklch(0.50 0.16 264)">message</text>
  <text x="200" y="82" font-size="9.5" fill="var(--text-muted)">abstraktní zprávy (vstup/výstup)</text>
  <rect x="20" y="98" width="380" height="36" rx="6" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.55 0.16 264)"/>
  <text x="34" y="115" font-size="11" font-weight="600" font-family="var(--font-mono)" fill="oklch(0.50 0.16 264)">portType</text>
  <text x="200" y="122" font-size="9.5" fill="var(--text-muted)">operace (abstraktní rozhraní)</text>
  <rect x="20" y="138" width="380" height="26" rx="6" fill="oklch(0.52 0.16 142 / 0.10)" stroke="oklch(0.50 0.16 142)"/>
  <text x="34" y="155" font-size="11" font-weight="600" font-family="var(--font-mono)" fill="oklch(0.42 0.16 142)">binding</text>
  <text x="200" y="155" font-size="9.5" fill="var(--text-muted)">konkrétní protokol (SOAP/HTTP)</text>
  <rect x="20" y="168" width="380" height="26" rx="6" fill="oklch(0.52 0.16 142 / 0.10)" stroke="oklch(0.50 0.16 142)"/>
  <text x="34" y="185" font-size="11" font-weight="600" font-family="var(--font-mono)" fill="oklch(0.42 0.16 142)">service</text>
  <text x="200" y="185" font-size="9.5" fill="var(--text-muted)">fyzická adresa (URI endpointu)</text>
</svg>
:::

* **`types`** — definice datových typů, typicky pomocí XML Schema (XSD).
* **`message`** — abstraktní popis přenášených dat (jedna zpráva = vstup nebo výstup operace), složená z `types`.
* **`portType`** — množina *operací* (abstraktní rozhraní), kde každá operace páruje vstupní a výstupní `message`.
* **`binding`** — konkrétní mapování `portType` na transportní protokol a kódování (např. SOAP přes HTTP).
* **`service`** — kolekce *portů*, tedy konkrétních síťových adres (URI), na kterých je daný `binding` dostupný.

Horní tři vrstvy jsou *abstraktní* (co služba dělá), dolní dvě *konkrétní* (kde a jak ji volat). Tím je možné totéž rozhraní vystavit na více adresách či protokolech beze změny abstraktní části.

## UDDI — registr služeb

**UDDI** (*Universal Description, Discovery and Integration*) je distribuovaný adresář (registr), kde poskytovatelé *publikují* své webové služby a klienti je mohou *dynamicky vyhledávat*. Struktura se přirovnává k telefonnímu seznamu se třemi druhy stránek:

| | Bílé stránky | Žluté stránky | Zelené stránky |
|---|---|---|---|
| Anglicky | *white pages* | *yellow pages* | *green pages* |
| Obsah | kontakty a identifikace firmy (jméno, adresa) | kategorizace dle oborových taxonomií (NAICS, UNSPSC) | technické informace o vazbách služby a **odkazy na WSDL** |
| Hledání podle | kdo službu poskytuje | jaký typ / obor služby | jak se ke službě technicky připojit |

Klient tedy v UDDI najde službu (žluté/bílé stránky), získá ze zelených stránek odkaz na její WSDL, z WSDL vygeneruje klientský kód a teprve pak volá vlastní operace přes SOAP. UDDI bylo nejambicióznějším z trojice standardů; v praxi se veřejné UDDI registry neujaly tak, jak se původně předpokládalo, a zůstaly spíše v podnikovém prostředí.

::: quiz "K čemu slouží element `binding` ve WSDL dokumentu?"
- [ ] Definuje datové typy přenášené ve zprávách.
  > To je úkol elementu `types` (zpravidla pomocí XSD).
- [x] Mapuje abstraktní operace (`portType`) na konkrétní protokol a kódování, např. SOAP přes HTTP.
  > Správně. `binding` je most mezi abstraktní částí (types/message/portType) a konkrétní (service); říká, *jak* se operace přenášejí po drátě.
- [ ] Udává fyzickou URL adresu, na které služba běží.
  > Konkrétní adresu nese až element `service` (jeho `port`); `binding` určuje protokol, ne adresu.
:::

::: link "W3C — Web Services Description Language (WSDL) 1.1" "https://www.w3.org/TR/wsdl.html"
:::

::: link "W3C — SOAP Version 1.2 (Part 1: Messaging Framework)" "https://www.w3.org/TR/soap12-part1/"
:::

::: link "OASIS UDDI — Web Services Discovery (přehled)" "https://en.wikipedia.org/wiki/Web_Services_Discovery"
:::

*Zdroj: SZZ NADE — předmět WAP — Internetové aplikace, VUT FIT. Externí reference: W3C (SOAP 1.2, WSDL 1.1), OASIS UDDI, Wikipedia.*
