---
title: Media types / MIME
---

Když server pošle data po síti, příjemce potřebuje vědět, *co to vlastně je* — má sekvenci bajtů zobrazit jako stránku, vykreslit jako obrázek, nebo spustit jako skript? Tuto informaci nese **internetový typ média** (*media type*), historicky známý jako **MIME typ** (*Multipurpose Internet Mail Extensions*). Jde o standardizovaný identifikátor formátu, registrovaný u [IANA](https://www.iana.org/assignments/media-types/media-types.xhtml). Původně vznikl pro přílohy e-mailů, dnes je ale klíčový především v HTTP.

V protokolu HTTP server oznamuje typ těla odpovědi hlavičkou **`Content-Type`**. Zásadní pravidlo: **prohlížeč se řídí touto hlavičkou, nikoli příponou souboru v URL.** Soubor `data.txt` poslaný s `Content-Type: text/html` se zobrazí jako HTML stránka; obrázek `logo.png` poslaný jako `text/plain` se ukáže jako změť bajtů. Přípona je jen vodítko pro server, jak hlavičku nastavit — pro klienta není závazná.

## Struktura zápisu

MIME typ se skládá z **typu** a **podtypu** oddělených lomítkem: `typ/podtyp`. Za nimi mohou následovat nepovinné **parametry** ve tvaru `; klíč=hodnota`.

::: svg "Anatomie hlavičky Content-Type"
<svg viewBox="0 0 540 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="520" height="130" rx="6" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="26" y="56" font-size="15" font-family="var(--font-mono)" font-weight="600" fill="oklch(0.55 0.16 264)">text</text>
  <text x="66" y="56" font-size="15" font-family="var(--font-mono)" fill="var(--text-muted)">/</text>
  <text x="78" y="56" font-size="15" font-family="var(--font-mono)" font-weight="600" fill="oklch(0.50 0.16 142)">html</text>
  <text x="128" y="56" font-size="15" font-family="var(--font-mono)" fill="var(--text-muted)">;</text>
  <text x="142" y="56" font-size="15" font-family="var(--font-mono)" font-weight="600" fill="oklch(0.52 0.16 65)">charset</text>
  <text x="208" y="56" font-size="15" font-family="var(--font-mono)" fill="var(--text-muted)">=</text>
  <text x="222" y="56" font-size="15" font-family="var(--font-mono)" fill="oklch(0.52 0.16 65)">UTF-8</text>
  <line x1="26" y1="68" x2="113" y2="68" stroke="oklch(0.55 0.16 264)" stroke-width="1.5"/>
  <text x="26" y="86" font-size="11" fill="oklch(0.55 0.16 264)">typ — hrubá kategorie</text>
  <line x1="78" y1="40" x2="118" y2="40" stroke="oklch(0.50 0.16 142)" stroke-width="1.5"/>
  <text x="200" y="40" font-size="11" fill="oklch(0.50 0.16 142)">podtyp — konkrétní formát</text>
  <line x1="142" y1="68" x2="262" y2="68" stroke="oklch(0.52 0.16 65)" stroke-width="1.5"/>
  <text x="142" y="86" font-size="11" fill="oklch(0.52 0.16 65)">parametr — doplňující info (kódování)</text>
  <text x="26" y="118" font-size="11.5" fill="var(--text-muted)">Diskrétní typy: <tspan font-family="var(--font-mono)" fill="var(--text)">text, image, audio, video, application, font</tspan></text>
  <text x="26" y="134" font-size="11.5" fill="var(--text-muted)">Vícedílné (composite) typy: <tspan font-family="var(--font-mono)" fill="var(--text)">multipart, message</tspan></text>
</svg>
:::

Typ je hrubá kategorie (`text`, `image`, `audio`, `video`, `application`, `font` a vícedílné `multipart`/`message`). Podtyp identifikuje konkrétní formát. Časté kombinace na webu:

| MIME typ | Co reprezentuje |
|---|---|
| `text/html` | HTML dokument |
| `text/css` | kaskádové styly |
| `text/javascript` | JavaScript (dnešní doporučený typ pro skripty) |
| `application/json` | JSON data |
| `application/xml`, `text/xml` | XML dokument |
| `image/png`, `image/jpeg`, `image/svg+xml` | rastrová / vektorová grafika |
| `application/octet-stream` | obecná binární data ("neznámé bajty") |
| `multipart/form-data` | odeslání formuláře se soubory |

## Parametry: charset a boundary

Parametry zpřesňují interpretaci. Dva nejvýznamnější:

* **`charset`** — určuje znakové kódování textu, typicky `charset=UTF-8`. Má smysl u textových typů (`text/html; charset=UTF-8`), protože stejné bajty znamenají v různých kódováních různé znaky. Pozor na výjimku: u `application/json` **není parametr `charset` registrován** — JSON se podle [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259) vyměňuje vždy v UTF-8, takže `; charset=…` na kompatibilní příjemce nemá žádný vliv (a je technicky nadbytečné).
* **`boundary`** — používá se u vícedílných zpráv. Když prohlížeč odesílá formulář se soubory jako `multipart/form-data`, je tělo složeno z více částí (textová pole, nahrávané soubory) a `boundary` definuje řetězec, který tyto části odděluje. U `multipart/form-data` je `boundary` podle [RFC 7578](https://www.rfc-editor.org/rfc/rfc7578) **povinný** parametr.

```http
POST /upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4
Content-Length: 312

------WebKitFormBoundary7MA4
Content-Disposition: form-data; name="jmeno"

Jan Novák
------WebKitFormBoundary7MA4
Content-Disposition: form-data; name="avatar"; filename="foto.png"
Content-Type: image/png

‹binární data PNG›
------WebKitFormBoundary7MA4--
```

## MIME sniffing a bezpečnost

Špatně nastavený `Content-Type` se projeví dvojím způsobem. Buď aplikace **nefunguje** (prohlížeč odmítne zpracovat CSS poslané jako `text/plain` nebo skript bez správného typu), nebo — což je horší — vzniká **bezpečnostní díra**.

Historicky se prohlížeče snažily být "užitečné": když hlavička chyběla nebo se zdála chybná, **hádaly** typ podle prvních bajtů obsahu (tzv. **MIME sniffing**, *content sniffing*). To otevřelo cestu k útokům typu **XSS**: útočník nahraje na server soubor deklarovaný jako neškodný (`image/png`), do kterého ale vloží `<script>`. Pokud prohlížeč obsah „očichá" a usoudí, že vypadá jako HTML, spustí jej jako stránku v kontextu napadené domény — a vykoná útočníkův skript.

Obranou je hlavička **`X-Content-Type-Options: nosniff`**. Říká prohlížeči: *„důvěřuj deklarovanému `Content-Type` a nehádej."* Při zapnutém `nosniff` prohlížeč navíc **zablokuje** načtení zdroje přes `<script>`, pokud jeho typ není skutečně skriptový, a obdobně u `<link rel=stylesheet>` vyžaduje stylový typ.

::: viz wap-mime-sniffing "Přepni nosniff a sleduj, jak se prohlížeč rozhodne soubor s nesprávným typem buď bezpečně odmítnout, nebo nebezpečně 'očichat'."
:::

::: quiz "Server odešle uživatelem nahraný soubor s hlavičkou `Content-Type: image/png`, ale obsah souboru začíná značkou `<script>`. Co soubor ochrání před spuštěním jako HTML?"
- [ ] Změna přípony souboru z `.png` na něco neutrálního.
  > Prohlížeč se řídí hlavičkou `Content-Type`, ne příponou — přípona problém neřeší.
- [x] Hlavička `X-Content-Type-Options: nosniff`, která zakáže MIME sniffing.
  > Správně. Bez sniffingu prohlížeč přijme deklarovaný typ `image/png` a obsah neinterpretuje jako spustitelné HTML, čímž zablokuje XSS.
- [ ] Nastavení `charset=UTF-8` v hlavičce.
  > Parametr kódování nijak neovlivňuje, zda prohlížeč obsah „očichá" a spustí jako skript.
:::

::: link "MDN — X-Content-Type-Options" "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Content-Type-Options"
:::

::: link "MDN — MIME types (IANA media types)" "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types"
:::

::: link "RFC 7578 — Returning Values from Forms: multipart/form-data" "https://www.rfc-editor.org/rfc/rfc7578"
:::

::: link "IANA — Media Types registry" "https://www.iana.org/assignments/media-types/media-types.xhtml"
:::

*Zdroj: SZZ NADE — předmět Internetové aplikace (WAP), VUT FIT. Externí reference: MDN Web Docs, IANA Media Types, RFC 7578, RFC 8259, OWASP.*
