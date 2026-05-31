---
title: Datové proudy a klientské API
---

Běžný HTTP požadavek je „jeden dotaz → jedna celá odpověď → konec spojení". Pro aplikace, které potřebují **průběžně doručovat data** (živé notifikace, burzovní kurzy, chat, sledování průběhu úlohy), je tento model nešikovný — klient by se musel pořád znovu ptát (*polling*). Existují proto techniky, které **udrží spojení otevřené** a posílají data postupně.

## Chunked Transfer Encoding

Nejnižší vrstva je **chunked transfer encoding** (kódování přenosu po blocích) — mechanismus přímo v HTTP/1.1. Server **předem nezná celkovou délku** obsahu, takže místo hlavičky `Content-Length` pošle `Transfer-Encoding: chunked` a tělo posílá **po blocích** (*chunks*). Každý blok začíná svou velikostí (hexadecimálně), pak následují data. **Soket zůstává záměrně otevřený** a server přidává další bloky, dokud nepošle **blok nulové velikosti**, který přenos ukončí.

```http
HTTP/1.1 200 OK
Content-Type: text/plain
Transfer-Encoding: chunked

7\r\n
Vítejte\r\n
9\r\n
 na webu!\r\n
0\r\n
\r\n
```

Klient tak může zobrazovat data, jakmile dorazí první blok, aniž čeká na celý obsah. (V HTTP/2 a HTTP/3 už `Transfer-Encoding: chunked` neexistuje — streamování tam zajišťují přímo **datové rámce** protokolu.)

## Push: SSE vs WebSockets

Nad otevřeným spojením stojí dvě standardizované technologie pro doručování dat na klienta. Liší se hlavně **směrem** komunikace a tím, kolik práce nechávají na vývojáři.

::: svg "Směr a vlastnosti: chunked, SSE, WebSocket"
<svg viewBox="0 0 540 196" xmlns="http://www.w3.org/2000/svg">
  <text x="80" y="20" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Chunked</text>
  <text x="270" y="20" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">SSE</text>
  <text x="460" y="20" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">WebSocket</text>
  <rect x="20" y="34" width="50" height="22" rx="4" fill="oklch(0.62 0.14 264 / 0.15)" stroke="oklch(0.55 0.16 264)"/>
  <text x="45" y="49" text-anchor="middle" font-size="9" fill="var(--text)">klient</text>
  <rect x="90" y="34" width="50" height="22" rx="4" fill="oklch(0.50 0.16 142 / 0.15)" stroke="oklch(0.50 0.16 142)"/>
  <text x="115" y="49" text-anchor="middle" font-size="9" fill="var(--text)">server</text>
  <line x1="138" y1="78" x2="22" y2="78" stroke="oklch(0.50 0.16 142)" stroke-width="1.6" marker-end="url(#stArrG)"/>
  <line x1="138" y1="92" x2="22" y2="92" stroke="oklch(0.50 0.16 142)" stroke-width="1.6" marker-end="url(#stArrG)"/>
  <text x="80" y="116" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">jeden tok po blocích</text>
  <text x="80" y="128" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">server → klient</text>
  <rect x="210" y="34" width="50" height="22" rx="4" fill="oklch(0.62 0.14 264 / 0.15)" stroke="oklch(0.55 0.16 264)"/>
  <text x="235" y="49" text-anchor="middle" font-size="9" fill="var(--text)">klient</text>
  <rect x="280" y="34" width="50" height="22" rx="4" fill="oklch(0.50 0.16 142 / 0.15)" stroke="oklch(0.50 0.16 142)"/>
  <text x="305" y="49" text-anchor="middle" font-size="9" fill="var(--text)">server</text>
  <line x1="328" y1="78" x2="212" y2="78" stroke="oklch(0.50 0.16 142)" stroke-width="1.6" marker-end="url(#stArrG)"/>
  <line x1="328" y1="92" x2="212" y2="92" stroke="oklch(0.50 0.16 142)" stroke-width="1.6" marker-end="url(#stArrG)"/>
  <text x="270" y="116" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">jednosměr, text UTF-8</text>
  <text x="270" y="128" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">auto-rekonexe</text>
  <rect x="400" y="34" width="50" height="22" rx="4" fill="oklch(0.62 0.14 264 / 0.15)" stroke="oklch(0.55 0.16 264)"/>
  <text x="425" y="49" text-anchor="middle" font-size="9" fill="var(--text)">klient</text>
  <rect x="470" y="34" width="50" height="22" rx="4" fill="oklch(0.50 0.16 142 / 0.15)" stroke="oklch(0.50 0.16 142)"/>
  <text x="495" y="49" text-anchor="middle" font-size="9" fill="var(--text)">server</text>
  <line x1="448" y1="76" x2="492" y2="76" stroke="oklch(0.55 0.16 22)" stroke-width="1.6" marker-end="url(#stArrR)"/>
  <line x1="492" y1="92" x2="448" y2="92" stroke="oklch(0.55 0.16 22)" stroke-width="1.6" marker-end="url(#stArrR)"/>
  <text x="460" y="116" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">duplex, i binární</text>
  <text x="460" y="128" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">rekonexe ručně</text>
  <line x1="20" y1="146" x2="520" y2="146" stroke="var(--line)"/>
  <text x="20" y="166" font-size="9" fill="var(--text-faint)">SSE běží nad HTTP; WebSocket se z HTTP „upgraduje" na vlastní protokol (101 Switching Protocols).</text>
  <defs>
    <marker id="stArrG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.50 0.16 142)"/></marker>
    <marker id="stArrR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.16 22)"/></marker>
  </defs>
</svg>
:::

**Server-Sent Events (SSE)** je standardizovaná **jednosměrná** komunikace **ze serveru na klienta**, běžící nad obyčejným HTTP (`Content-Type: text/event-stream`). Přenáší **výhradně textová data v UTF-8**. Velká výhoda je **vestavěná automatická rekonexe**: při výpadku se prohlížeč sám znovu připojí a v hlavičce `Last-Event-ID` pošle ID poslední přijaté události, takže server může navázat tam, kde se přestalo. Na klientovi se obsluhuje objektem `EventSource`.

```js
const es = new EventSource("/udalosti");
es.onmessage = (e) => console.log("zpráva:", e.data);
es.addEventListener("kurz", (e) => aktualizuj(JSON.parse(e.data)));
es.onerror = () => { /* prohlížeč se sám pokusí znovu připojit */ };
// es.close();  // ruční ukončení
```

**WebSockets** jsou určeny pro **plně obousměrnou** (*duplexní*) komunikaci. Po úvodním HTTP požadavku s hlavičkou `Upgrade: websocket` server odpoví `101 Switching Protocols` a spojení se **přepne z HTTP na samostatný WebSocket protokol** (`ws://` / `wss://`) nad toutéž TCP linkou. Umožňuje posílat i **binární data** s minimální režií. Daní za to je, že **rekonexi po výpadku si musí vývojář implementovat sám** — WebSocket žádnou automatickou neumí.

| | SSE | WebSocket |
|---|---|---|
| Směr | jednosměr (server → klient) | duplex (obousměr) |
| Data | jen text (UTF-8) | text i binární |
| Protokol | běží nad HTTP | upgrade na vlastní protokol |
| Rekonexe | automatická (od `Last-Event-ID`) | ruční (musí řešit vývojář) |
| Klientské API | `EventSource` | `WebSocket` |

## Klientské API: XHR vs Fetch

Data na pozadí stránky (bez přenačtení, *AJAX*) získávají dva JavaScriptové standardy.

**`XMLHttpRequest` (XHR)** je historické, **událostmi řízené** rozhraní postavené na *callbacích*. I přes svůj věk se hodí tam, kde je potřeba **sledovat průběh nahrávání** velkých souborů přes událost `upload.onprogress` (to Fetch nativně neumí), a nabízí jednoduché zrušení přes `xhr.abort()`.

```js
const xhr = new XMLHttpRequest();
xhr.open("POST", "/upload");
xhr.upload.onprogress = (e) => {        // průběh uploadu — XHR umí, Fetch ne
  if (e.lengthComputable) progress(e.loaded / e.total);
};
xhr.onload = () => { if (xhr.status === 200) hotovo(xhr.response); };
xhr.send(soubor);
// xhr.abort();   // zrušení požadavku
```

**`Fetch API`** je moderní standard postavený na **Promises** (a tedy `async/await`). Jedna past, kterou zkoušející rádi probírají: **Fetch nepovažuje HTTP chybu za selhání.** Odpověď `404` nebo `500` Promise **nezamítne** (*není rejected*) — Promise se splní s objektem `Response`. Zamítne se jen při *síťové* chybě. Stav úspěchu proto **musí vývojář vždy explicitně ověřit** přes `response.ok` (true pro 2xx) nebo `response.status`. Zrušení vyžaduje externí objekt `AbortController`.

```js
const ctrl = new AbortController();
try {
  const res = await fetch("/api/data", { signal: ctrl.signal });
  if (!res.ok) {                        // 404/500 NEzamítnou — nutná kontrola!
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
} catch (e) {
  // sem spadne síťová chyba, AbortError nebo náš throw
}
// ctrl.abort();   // zrušení přes AbortController
```

| | XMLHttpRequest | Fetch |
|---|---|---|
| Styl | callbacky (události) | Promises / `async/await` |
| HTTP chyba (404/500) | čte se z `status` | **nezamítne** Promise — nutno kontrolovat `response.ok` |
| Průběh uploadu | `upload.onprogress` | nativně **ne** |
| Zrušení | `xhr.abort()` | `AbortController` + `signal` |

::: quiz "`await fetch('/api/x')` proběhl a server vrátil 404. Co se stane?"
- [ ] Promise se zamítne (rejected) a skočí se do `catch`.
  > Ne. Fetch zamítá jen při síťové chybě; HTTP 404/500 je z jeho pohledu úspěšně doručená odpověď.
- [x] Promise se splní s objektem `Response`, jehož `response.ok` je `false` — chybu musíte ošetřit ručně.
  > Správně. Proto se po každém fetchi kontroluje `response.ok` (nebo `status`); jinak by se s chybovou odpovědí zacházelo jako s úspěchem.
- [ ] Fetch automaticky zopakuje požadavek.
  > Žádné automatické opakování Fetch nedělá; jen vrátí odpověď s daným stavovým kódem.
:::

::: link "MDN — Using server-sent events" "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events"
:::

::: link "MDN — The WebSocket API" "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API"
:::

::: link "MDN — Using the Fetch API" "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"
:::

::: link "MDN — Transfer-Encoding (chunked)" "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Transfer-Encoding"
:::

*Zdroj: SZZ NADE — předmět WAP — Internetové aplikace, VUT FIT. Externí reference: MDN Web Docs, WHATWG Fetch Standard, HTML Living Standard (Server-sent events), RFC 6455 (WebSocket), RFC 9112 (HTTP/1.1, chunked).*
