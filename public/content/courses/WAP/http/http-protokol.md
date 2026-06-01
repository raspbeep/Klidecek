---
title: Protokol HTTP a jeho evoluce
---

**HTTP** (*Hypertext Transfer Protocol*) je aplikační protokol, na němž stojí World Wide Web. Jeho úkolem je přenášet *reprezentace zdrojů* (popsaných pomocí [[uri-url-urn]]) mezi **klientem** (prohlížeč, mobilní aplikace) a **serverem** (tzv. *origin server*, který zdroj vlastní). Komunikace má tvar dvojice zpráv: klient pošle **požadavek** (*request*), server vrátí **odpověď** (*response*).

## Bezstavovost

HTTP je **bezstavový** (*stateless*): server si sám o sobě nepamatuje nic o předchozích požadavcích. Každý požadavek se zpracuje **zcela nezávisle** na ostatních — jako by žádný předtím nepřišel. To protokol zjednodušuje a usnadňuje škálování (libovolný server ve farmě zvládne libovolný požadavek), ale aplikace, která potřebuje udržet **kontext** (kdo je přihlášený, co má v košíku), musí stav uchovávat *mimo* samotný protokol.

K tomu slouží externí mechanismy: nejčastěji **cookies** (server pošle hlavičkou `Set-Cookie` malý identifikátor, prohlížeč ho automaticky přikládá ke každému dalšímu požadavku na danou doménu), případně **skrytá formulářová pole** nebo token v URL. Stav tedy nenese protokol — nese ho aplikace nad ním.

## Anatomie zprávy

Textová HTTP/1.x zpráva má čtyři části: **úvodní řádek** (*start-line*), **hlavičky** (*headers*) s metadaty, **prázdný řádek** oddělující hlavičky od těla a nepovinné **tělo** (*body*) se samotným obsahem.

::: svg "Struktura HTTP požadavku a odpovědi (HTTP/1.x)"
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="12" width="250" height="178" rx="8" fill="oklch(0.62 0.14 264 / 0.08)" stroke="oklch(0.55 0.16 264)"/>
  <text x="135" y="30" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.50 0.16 264)">Požadavek (klient → server)</text>
  <text x="24" y="52" font-size="10.5" font-family="var(--font-mono)" font-weight="600" fill="var(--text)">GET /v1/books?lang=cs HTTP/1.1</text>
  <text x="24" y="64" font-size="8.5" fill="var(--text-faint)">úvodní řádek: metoda · cíl · verze</text>
  <text x="24" y="84" font-size="10.5" font-family="var(--font-mono)" fill="var(--text-muted)">Host: api.example.com</text>
  <text x="24" y="98" font-size="10.5" font-family="var(--font-mono)" fill="var(--text-muted)">Accept: application/json</text>
  <text x="24" y="110" font-size="8.5" fill="var(--text-faint)">hlavičky (metadata)</text>
  <line x1="24" y1="122" x2="246" y2="122" stroke="var(--line)" stroke-dasharray="3 3"/>
  <text x="24" y="138" font-size="8.5" fill="var(--text-faint)">prázdný řádek</text>
  <text x="24" y="158" font-size="10.5" font-family="var(--font-mono)" fill="var(--text-faint)">(GET nemá tělo)</text>
  <rect x="280" y="12" width="250" height="178" rx="8" fill="oklch(0.55 0.16 142 / 0.08)" stroke="oklch(0.50 0.16 142)"/>
  <text x="405" y="30" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.42 0.16 142)">Odpověď (server → klient)</text>
  <text x="294" y="52" font-size="10.5" font-family="var(--font-mono)" font-weight="600" fill="var(--text)">HTTP/1.1 200 OK</text>
  <text x="294" y="64" font-size="8.5" fill="var(--text-faint)">úvodní řádek: verze · kód · fráze</text>
  <text x="294" y="84" font-size="10.5" font-family="var(--font-mono)" fill="var(--text-muted)">Content-Type: application/json</text>
  <text x="294" y="98" font-size="10.5" font-family="var(--font-mono)" fill="var(--text-muted)">Content-Length: 42</text>
  <line x1="294" y1="110" x2="516" y2="110" stroke="var(--line)" stroke-dasharray="3 3"/>
  <text x="294" y="124" font-size="8.5" fill="var(--text-faint)">prázdný řádek</text>
  <text x="294" y="144" font-size="10.5" font-family="var(--font-mono)" fill="oklch(0.42 0.16 142)">{ "title": "Web", ... }</text>
  <text x="294" y="156" font-size="8.5" fill="var(--text-faint)">tělo (přenášený obsah)</text>
</svg>
:::

## Metody

Metoda v úvodním řádku říká, **jakou operaci** nad zdrojem klient žádá. Dvě vlastnosti zkoušející často probírají: **bezpečnost** (*safe* — metoda zdroj nemění) a **idempotence** (*idempotent* — opakování N-krát má stejný efekt jako jednou).

| Metoda | Význam | Tělo | Bezpečná | Idempotentní |
|---|---|---|---|---|
| `GET` | stažení reprezentace zdroje (čtení) | ne — data jen v URL | ano | ano |
| `HEAD` | jako `GET`, ale server vrátí **jen hlavičky** (bez těla) | ne | ano | ano |
| `OPTIONS` | zjištění podporovaných možností komunikace | ne | ano | ano |
| `POST` | odeslání dat ke zpracování / vytvoření zdroje | ano — v těle | ne | **ne** |
| `PUT` | nahrazení zdroje daty z těla (úplný zápis) | ano | ne | ano |
| `DELETE` | odstranění zdroje | ne | ne | ano |

Klíčový rozdíl **GET vs POST**: u `GET` mohou data odcházet na server **pouze jako součást URL** (v query), takže jsou viditelná v adresním řádku, v historii i v logu serveru a mají omezenou délku. `POST` přenáší data v **těle** zprávy — vhodné pro formuláře, citlivá data a větší objemy. `POST` není idempotentní: dvojí odeslání objednávky vytvoří dvě objednávky (proto „nepřekládejte stránku po odeslání formuláře").

## Stavové kódy

Server v úvodním řádku odpovědi vrací trojmístný **stavový kód**; první číslice určuje třídu.

| Třída | Význam | Typické kódy |
|---|---|---|
| **1xx** | informační — požadavek přijat, pokračuje se | `100 Continue` |
| **2xx** | úspěch | `200 OK`, `201 Created`, `204 No Content` |
| **3xx** | přesměrování — klient musí provést další akci | `301 Moved Permanently`, `304 Not Modified` |
| **4xx** | chyba **klienta** — vadný požadavek nebo chybí oprávnění | `400 Bad Request`, `401 Unauthorized`, `404 Not Found` |
| **5xx** | chyba **serveru** — selhal při plnění platného požadavku | `500 Internal Server Error`, `503 Service Unavailable` |

Časté nedorozumění: **`404 Not Found` je chyba klienta** (4xx). Server tím *informuje*, že klient si vyžádal neexistující adresu — server sám funguje správně. Naopak `500` znamená, že požadavek byl v pořádku, ale server jej nezvládl zpracovat.

## Evoluce: boj s Head-of-Line blockingem

Hlavní motor vývoje HTTP byla snaha **paralelizovat přenos** mnoha zdrojů jedné stránky a odstranit **blokování fronty** (*Head-of-Line blocking*, HoL) — situaci, kdy jedna zpomalená položka zdrží všechny ostatní za ní.

* **HTTP/1.1** — textový protokol. Pro zrychlení zavedl **pipelining**: klient pošle více požadavků za sebou bez čekání na odpovědi. Server však musí odpovídat **v přesně stejném pořadí**. Zdrží-li se první odpověď, zablokuje celou frontu za ní — to je **aplikační HoL blocking**. (V praxi se proto pipelining skoro nepoužíval a prohlížeče místo něj otevíraly více paralelních TCP spojení.)
* **HTTP/2** — přešel na **binární framing** a **multiplexing**. Data se dělí do malých binárních **rámců** (*frames*); každý rámec nese číslo svého logického **proudu** (*stream*). Rámce různých streamů cestují **na přeskáčku** přes jediné TCP spojení a příjemce si je poskládá podle čísel streamů. Tím zmizel *aplikační* HoL blocking — pomalá odpověď už neblokuje ostatní. Zůstává ale **transportní HoL blocking**: streamy stále jedou nad jedním TCP spojením, a TCP doručuje **přísně seřazeně**. Ztratí-li se jediný TCP paket, TCP zadrží *všechna* data za ním, dokud nedorazí retransmise — zaseknou se všechny streamy najednou.
* **HTTP/3** — opouští TCP a staví na protokolu **QUIC nad UDP**. QUIC zná hranice jednotlivých streamů a doručuje je **nezávisle**: ztráta paketu zdrží **jen ten konkrétní zasažený stream**, ostatní pokračují. Tím mizí i *transportní* HoL blocking. QUIC navíc kombinuje navázání spojení se šifrováním (rychlejší start) a umožňuje **migraci spojení** — díky *connection ID* místo dvojice IP+port přežije spojení změnu sítě (Wi-Fi → LTE) bez výpadku.

::: viz wap-http-hol "Vyber verzi HTTP a „ztrať“ paket jednoho ze streamů. Sleduj, které streamy se zastaví: u HTTP/1.1 i HTTP/2 se zaseknou všechny za vadným místem, u HTTP/3 jen zasažený."
:::

| | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---|---|---|---|
| Formát | textový | binární framing | binární framing |
| Transport | TCP (více spojení) | TCP (1 spojení) | **QUIC nad UDP** |
| Multiplexing | ne (jen pipelining) | ano (streamy) | ano (streamy) |
| Aplikační HoL | **ano** | vyřešen | vyřešen |
| Transportní HoL | ano | **ano** (TCP) | vyřešen |
| Migrace spojení | ne | ne | **ano** |

::: quiz "HTTP/2 zavedl multiplexing streamů přes jedno TCP spojení. Jaký druh Head-of-Line blockingu přesto zůstává?"
- [ ] Aplikační HoL — odpovědi se stále musí vracet v pořadí jako u HTTP/1.1.
  > Ne. Multiplexing aplikační HoL právě odstranil: rámce streamů jdou na přeskáčku a neblokují se navzájem.
- [x] Transportní HoL — ztráta jediného TCP paketu zdrží všechny streamy, protože TCP doručuje seřazeně.
  > Správně. Streamy jsou na úrovni HTTP nezávislé, ale sdílejí jeden seřazený TCP tok; ztráta paketu zadrží vše za ním. Řeší to až QUIC v HTTP/3.
- [ ] Žádný — HTTP/2 odstranil HoL blocking úplně.
  > To platí až pro HTTP/3 nad QUIC; HTTP/2 nad TCP transportní HoL stále má.
:::

::: link "MDN — HTTP messages" "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guide/Messages"
:::

::: link "MDN — HTTP request methods" "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods"
:::

::: link "MDN — HTTP response status codes" "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status"
:::

::: link "RFC 9114 — HTTP/3" "https://www.rfc-editor.org/rfc/rfc9114"
:::

### Videa

::: youtube "https://www.youtube.com/watch?v=j9QmMEWmcfo" "SSL, TLS, HTTPS Explained" "ByteByteGo"
:::

*Zdroj: SZZ NADE — předmět WAP — Internetové aplikace, VUT FIT. Externí reference: MDN Web Docs, RFC 9110 (HTTP Semantics), RFC 9113 (HTTP/2), RFC 9114 (HTTP/3), RFC 9000 (QUIC).*
