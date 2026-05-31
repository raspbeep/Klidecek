---
title: Bezpečnostní hlavičky HTTP
---

Bezpečnostní hlavičky se nastavují na serveru a **deklarativně instruují prohlížeč**, jaké hranice má vynutit. Tvoří vrstvu *defense-in-depth*: chrání i tehdy, když nějaká jiná obrana selže. Prohlížeč je vykonavatelem — server jen řekne pravidla.

## Strict-Transport-Security (HSTS)

HSTS chrání před downgrade útokem zvaným **SSL stripping**, při kterém útočník (man-in-the-middle) odstraní šifrování a donutí prohlížeč komunikovat po nešifrovaném HTTP.

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

Když prohlížeč tuto hlavičku obdrží, zapamatuje si doménu po dobu `max-age` (v sekundách) jako „pouze HTTPS". Zadá-li pak uživatel `http://…`, prohlížeč nešifrovaný požadavek vůbec neodešle do sítě — schéma nahradí za `https://` ještě na straně klienta. (V nástrojích Chrome se toto vnitřní povýšení zobrazuje jako *307 Internal Redirect*; není to ale odpověď serveru, jen popisek pro vývojáře.)

Tři klíčové vlastnosti do zkoušky:

* **Jen přes HTTPS.** Hlavička přijatá po nešifrovaném HTTP se ignoruje — jinak by ji útočník mohl podvrhnout nebo vypnout poslat `max-age=0`.
* **Zákaz „click-through".** Nastane-li u HSTS domény chyba certifikátu (expirovaný, podvržený), prohlížeč **neumožní uživateli chybu prokliknout** a pokračovat — spojení tvrdě odmítne.
* **`includeSubDomains` a `preload`.** První rozšíří politiku na všechny subdomény (brání podvržení přes falešnou nešifrovanou subdoménu). Druhý řeší slabinu *prvního kontaktu*: než prohlížeč hlavičku poprvé uvidí, je úvodní požadavek zranitelný. `preload` umožní zapsat doménu do seznamu zabudovaného přímo v prohlížečích, takže HTTPS platí už od úplně první návštěvy (vyžaduje `max-age` ≥ 1 rok a `includeSubDomains`).

## Content-Security-Policy (CSP)

CSP je mocná, ale na konfiguraci náročná dodatečná vrstva především proti [[xss|XSS]]. Skládá se z direktiv (`script-src`, `style-src`, `img-src`, `connect-src`…); chybí-li specifická direktiva, použije se záložní **`default-src`**.

::: viz wap-csp-eval "Vyber politiku script-src a sleduj, které ze čtyř ukázkových skriptů (dva vlastní, dva injektované) se smí spustit. Porovnej slabou 'unsafe-inline', allowlist a moderní nonce + 'strict-dynamic'."
:::

Tradiční CSP whitelistovalo domény (`script-src https://cdn.example.com`), ale takové allowlisty lze často obejít. Moderní **strict CSP** stojí na kryptografii:

* **nonce** — server s každou odpovědí vygeneruje náhodný řetězec, pošle ho v hlavičce (`script-src 'nonce-r4nd0m'`) i u inline skriptu (`<script nonce="r4nd0m">`). Injektovaný skript nonce nezná, proto se nespustí.
* **hash** — v hlavičce je `sha256-…` otisk těla skriptu; spustí se jen při přesné shodě obsahu.
* **`strict-dynamic`** — skript, kterému prohlížeč díky nonce/hash věří, smí programově vkládat a spouštět další skripty (důvěra se propaguje). Hodí se pro analytické či reklamní skripty, které dotahují vlastní závislosti; allowlist domén se přitom ignoruje.

Naopak `'unsafe-inline'` (povolí jakýkoli inline skript i `onclick=…`) a `'unsafe-eval'` (povolí `eval()` a spol.) vracejí stránku do stavu náchylného na XSS — do strict CSP nepatří. Klientskou vrstvou navíc bývá `require-trusted-types-for 'script'` ([[xss|Trusted Types]]).

## Clickjacking — X-Frame-Options vs frame-ancestors

**Clickjacking** (UI redress) načte vaši aplikaci do průhledného `<iframe>` a překryje ji vábivým obsahem; uživatel klikne „naslepo" do skryté aplikace. Bránit se dá dvěma hlavičkami:

| | X-Frame-Options (starší) | CSP `frame-ancestors` (moderní) |
|---|---|---|
| Zákaz vložení kamkoli | `DENY` | `frame-ancestors 'none'` |
| Jen stejný původ | `SAMEORIGIN` | `frame-ancestors 'self'` |
| Konkrétní partner | `ALLOW-FROM` — **zastaralé, nefunkční** | `frame-ancestors 'self' https://partner.com` |

Důležité pravidlo přednosti: pokud server pošle **obě** hlavičky, prohlížeč podporující CSP se řídí **výhradně `frame-ancestors`** a starší `X-Frame-Options` zcela ignoruje. (`X-Frame-Options` se uvádí navíc už jen kvůli prastarým prohlížečům bez podpory CSP.)

::: svg "Když server pošle obě hlavičky, moderní prohlížeč ignoruje X-Frame-Options a řídí se CSP frame-ancestors."
<svg viewBox="0 0 460 168" xmlns="http://www.w3.org/2000/svg">
  <g font-size="11">
    <rect x="14" y="20" width="180" height="52" rx="7" fill="var(--bg-card)" stroke="var(--line-strong)"/>
    <text x="104" y="38" text-anchor="middle" font-weight="600" fill="var(--text)">odpověď serveru</text>
    <text x="24" y="56" font-family="var(--font-mono)" font-size="10" fill="var(--text-muted)">X-Frame-Options: DENY</text>
    <text x="24" y="68" font-family="var(--font-mono)" font-size="10" fill="var(--text)">frame-ancestors 'self'</text>

    <line x1="194" y1="46" x2="248" y2="46" stroke="var(--text-muted)" stroke-width="1.6" marker-end="url(#xfoArr)"/>

    <rect x="252" y="14" width="194" height="64" rx="8" fill="oklch(0.55 0.16 264 / 0.10)" stroke="oklch(0.55 0.16 264)"/>
    <text x="349" y="33" text-anchor="middle" font-weight="600" fill="var(--text)">moderní prohlížeč</text>
    <text x="349" y="51" text-anchor="middle" font-size="10" fill="oklch(0.55 0.18 22)">X-Frame-Options: ignorováno</text>
    <text x="349" y="68" text-anchor="middle" font-size="10" fill="oklch(0.52 0.16 142)">řídí se frame-ancestors 'self'</text>

    <text x="230" y="120" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">CSP frame-ancestors má v enforcujícím režimu přednost před X-Frame-Options.</text>
    <text x="230" y="140" text-anchor="middle" font-size="10.5" fill="var(--text-faint)">X-Frame-Options se posílá navíc jen kvůli prohlížečům bez podpory CSP.</text>
  </g>
  <defs>
    <marker id="xfoArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

## X-Content-Type-Options: nosniff

Prohlížeče historicky „hádaly" typ souboru podle obsahu (**MIME sniffing**), když nedůvěřovaly deklarovanému `Content-Type`. Útočník toho zneužije: nahraje „obrázek", uvnitř kterého je validní JavaScript. Server jej nabídne jako `image/png`, ale prohlížeč nahlédne dovnitř, pozná skript a spustí ho — vzniká XSS. Hlavička `X-Content-Type-Options: nosniff` hádání zakáže: prohlížeč ctí deklarovaný typ a obsah jako skript neinterpretuje. (Detailní průchod viz [[mime-types]].)

## Subresource Integrity (SRI)

Načítáte-li knihovnu z cizí CDN a útočník CDN kompromituje, jeho kód se automaticky spustí u všech vašich uživatelů. SRI to ošetří otiskem: do `<script>`/`<link>` se přidá atribut `integrity` s hashem (`sha256`/`sha384`/`sha512`) očekávaného souboru. Prohlížeč si po stažení hash sám spočítá — sedí-li, kód spustí; nesedí-li, soubor zahodí jako síťovou chybu.

```html
<script src="https://cdn.example.com/lib.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
        crossorigin="anonymous"></script>
```

Technický detail, na který se u státnic ptají: aby prohlížeč mohl hash vůbec ověřit, musí být cizí zdroj stažen **přes CORS**. Proto je nutné `crossorigin="anonymous"` a CDN musí odpovědět hlavičkou `Access-Control-Allow-Origin`. Bez tohoto povolení by šlo o cross-origin čtení, které [[sop-cors|SOP]] blokuje, a kontrola SRI by selhala — `integrity` bez `crossorigin` u cizího zdroje požadavek rovnou shodí.

::: quiz "Server posílá X-Frame-Options: SAMEORIGIN i Content-Security-Policy: frame-ancestors 'none'. Co udělá moderní prohlížeč s podporou CSP?"
- [ ] Použije obě a vezme přísnější — efektivně SAMEORIGIN.
  > Ne, hlavičky se nekombinují. V enforcujícím režimu CSP frame-ancestors přebíjí X-Frame-Options úplně.
- [x] Řídí se výhradně frame-ancestors 'none' a X-Frame-Options ignoruje.
  > Správně. frame-ancestors má v moderních prohlížečích přednost; XFO se posílá jen kvůli prastarým prohlížečům bez CSP. Vložení do rámce tedy bude zcela zakázáno.
- [ ] Vezme X-Frame-Options, protože je starší a kompatibilnější.
  > Naopak — moderní prohlížeč preferuje CSP. Starší hlavičku ignoruje.
:::

::: link "MDN — Strict-Transport-Security (HSTS)" "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security"
:::

::: link "MDN — Content-Security-Policy" "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy"
:::

::: link "MDN — Subresource Integrity" "https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity"
:::

*Zdroj: SZZ NADE — předmět Internetové aplikace, VUT FIT. Externí reference: MDN Web Docs (HSTS, CSP, X-Frame-Options, frame-ancestors, SRI), W3C CSP Level 3.*
