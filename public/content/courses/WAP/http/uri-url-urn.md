---
title: URI, URL a URN
---

Aby si dva uzly na webu mohly cokoli předat, musí se nejprve **shodnout na tom, o jaký zdroj jde**. Stavebním kamenem celého webu je proto schopnost zdroj jednoznačně pojmenovat — a případně i lokalizovat. Trojice pojmů **URI**, **URL** a **URN** tuto roli řeší a často se zaměňuje, ačkoli mezi nimi platí přesný vztah nadmnožiny a podmnožin.

## URI je nadmnožina

**URI** (*Uniform Resource Identifier*) je obecný, zastřešující koncept pro identifikaci zdroje. Definuje ho [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986). Zdrojem může být cokoli — HTML stránka, obrázek, e-mailová schránka, kniha, ba i abstraktní pojem. Platí jednoduché pravidlo: **každé URL i každé URN je platné URI, ale ne každé URI je URL nebo URN.**

URI tedy říká *„toto je identifikátor zdroje"*, aniž by nutně prozrazovalo, kde zdroj leží nebo jak se k němu dostat. Rozdělení na URL a URN vyjadřuje dvě *role*, které identifikátor může hrát: **lokalizovat** (URL) nebo jen **pojmenovat** (URN).

::: svg "URI jako nadmnožina; URL a URN jako jeho dvě role"
<svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="380" height="160" rx="10" fill="var(--accent)" fill-opacity="0.07" stroke="var(--accent)"/>
  <text x="210" y="42" text-anchor="middle" font-size="13" font-weight="600" fill="var(--accent)">URI — identifikátor zdroje</text>
  <text x="210" y="58" text-anchor="middle" font-size="10" fill="var(--text-muted)">obecná nadmnožina (RFC 3986)</text>
  <rect x="48" y="74" width="150" height="86" rx="8" fill="oklch(0.62 0.14 264 / 0.14)" stroke="oklch(0.55 0.16 264)"/>
  <text x="123" y="98" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.50 0.16 264)">URL</text>
  <text x="123" y="116" text-anchor="middle" font-size="10" fill="var(--text)">KDE + JAK</text>
  <text x="123" y="132" text-anchor="middle" font-size="9" fill="var(--text-muted)">lokace + protokol</text>
  <text x="123" y="148" text-anchor="middle" font-size="8.5" font-family="var(--font-mono)" fill="var(--text-faint)">https://…</text>
  <rect x="222" y="74" width="150" height="86" rx="8" fill="oklch(0.55 0.16 142 / 0.14)" stroke="oklch(0.50 0.16 142)"/>
  <text x="297" y="98" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.42 0.16 142)">URN</text>
  <text x="297" y="116" text-anchor="middle" font-size="10" fill="var(--text)">JEN JMÉNO</text>
  <text x="297" y="132" text-anchor="middle" font-size="9" fill="var(--text-muted)">trvalé, nezávislé na lokaci</text>
  <text x="297" y="148" text-anchor="middle" font-size="8.5" font-family="var(--font-mono)" fill="var(--text-faint)">urn:isbn:…</text>
</svg>
:::

## Syntaxe URI

Obecná syntaxe URI se skládá z až pěti složek. Jejich uspořádání a oddělovače jsou pevně dané:

```text
  scheme://authority/path?query#fragment
  └──┬──┘  └───┬───┘ └─┬─┘ └─┬─┘ └──┬──┘
 schéma    autorita  cesta dotaz fragment
```

* **scheme** (schéma) — určuje druh identifikátoru či protokolu, např. `http`, `https`, `mailto`, `urn`, `ftp`. Povinná složka, ukončená dvojtečkou.
* **authority** (autorita) — typicky `[userinfo@]host[:port]`, tedy jméno serveru a volitelně port. Uvozena `//`.
* **path** (cesta) — hierarchická cesta ke zdroji v rámci autority.
* **query** (dotaz) — nepovinné parametry za otazníkem, obvykle `klíč=hodnota` oddělené `&`.
* **fragment** — nepovinný odkaz na podčást zdroje za znakem `#`. Fragment **zpracovává až klient** (prohlížeč skroluje na kotvu); na server se neposílá.

::: svg "Rozklad konkrétního URI na složky"
<svg viewBox="0 0 540 130" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="14" width="520" height="44" rx="6" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="22" y="42" font-size="13" font-family="var(--font-mono)">
    <tspan fill="oklch(0.55 0.16 264)" font-weight="600">https</tspan><tspan fill="var(--text-muted)">://</tspan><tspan fill="oklch(0.50 0.16 142)" font-weight="600">api.example.com:443</tspan><tspan fill="var(--text)">/v1/books</tspan><tspan fill="oklch(0.52 0.16 65)">?lang=cs&amp;sort=year</tspan><tspan fill="oklch(0.55 0.16 22)">#chapter-3</tspan>
  </text>
  <text x="22" y="80" font-size="9.5" fill="oklch(0.55 0.16 264)">schéma</text>
  <text x="78" y="80" font-size="9.5" fill="oklch(0.50 0.16 142)">autorita (host:port)</text>
  <text x="246" y="80" font-size="9.5" fill="var(--text-muted)">cesta</text>
  <text x="318" y="80" font-size="9.5" fill="oklch(0.52 0.16 65)">dotaz (query)</text>
  <text x="22" y="100" font-size="9.5" fill="oklch(0.55 0.16 22)">fragment — zpracuje klient, na server se neposílá</text>
  <text x="22" y="118" font-size="9.5" fill="var(--text-faint)">Schéma + dvojtečka je vždy povinné; ostatní složky podle typu identifikátoru.</text>
</svg>
:::

## URL — kde a jak

**URL** (*Uniform Resource Locator*) je takový URI, který kromě identifikace navíc řeší, **kde** se zdroj fyzicky nachází a **jak** se k němu dostat. Schéma URL je proto zpravidla **přístupový protokol** (`https`, `ftp`, `file`) a autorita udává konkrétní server. URL je tím pádem *vázané na lokaci*: jakmile se zdroj přesune na jiný server, původní URL přestane fungovat — vznikne „mrtvý odkaz" (HTTP 404).

```text
https://www.example.com/clanky/2024/web.html
└─ protokol ─┘└──── kde zdroj leží ────────┘
```

## URN — trvalé jméno nezávislé na lokaci

**URN** (*Uniform Resource Name*) identifikuje zdroj výhradně jeho **trvalým, globálně unikátním jménem**, zcela nezávisle na tom, kde se zdroj momentálně nachází. Schéma je vždy `urn:`, následuje *namespace identifier* (NID) a *namespace-specific string* (NSS). Definice viz [RFC 8141](https://www.rfc-editor.org/rfc/rfc8141).

```text
urn:isbn:978-80-247-3539-8
└┬┘ └─┬┘ └────────┬───────┘
urn  NID    NSS — konkrétní jméno v daném jmenném prostoru
```

Klasickým příkladem je mezinárodní číslo knihy **ISBN**: `urn:isbn:978-80-247-3539-8` identifikuje *tutéž knihu* bez ohledu na to, v jakém knihkupectví, knihovně nebo na jakém serveru se právě nachází. Přesune-li se kniha (či její digitální záznam) jinam, URN se nemění — mění se jen URL, na kterých ji lze stáhnout. URN tedy řeší *identitu*, URL řeší *dosažitelnost*.

| | URL | URN |
|---|---|---|
| Co určuje | lokaci + protokol (kde, jak) | jen jméno (kdo/co) |
| Závislost na umístění | ano — přesun rozbije odkaz | žádná — jméno je trvalé |
| Příklad schématu | `https`, `ftp`, `file` | `urn` |
| Příklad | `https://lib.example.com/k/123` | `urn:isbn:978-80-247-3539-8` |
| Lze přímo „otevřít"? | ano (protokol je dán) | ne — nutné rozřešení (resolver) na URL |

URN samo o sobě neříká, *jak* zdroj získat — potřebuje **resolver**, který jméno přeloží na jedno či více aktuálních URL. Tím se odděluje stabilní identita od proměnlivé fyzické lokace.

::: quiz "Knihovna přesune e-knihu na nový server, čímž se změní její adresa pro stažení. Který identifikátor zůstane beze změny?"
- [ ] URL knihy.
  > URL je vázané na lokaci a protokol — přesun na jiný server adresu mění a starý odkaz přestane fungovat.
- [x] URN knihy (např. `urn:isbn:…`).
  > Správně. URN je trvalé jméno nezávislé na umístění; identifikuje tutéž knihu bez ohledu na to, kde a jak je dostupná.
- [ ] Ani jeden — identifikátor se vždy mění s lokací.
  > To platí jen pro URL. Smyslem URN je právě stabilita jména napříč přesuny.
:::

::: link "RFC 3986 — Uniform Resource Identifier (URI): Generic Syntax" "https://www.rfc-editor.org/rfc/rfc3986"
:::

::: link "RFC 8141 — Uniform Resource Names (URNs)" "https://www.rfc-editor.org/rfc/rfc8141"
:::

::: link "MDN — What is a URL?" "https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL"
:::

*Zdroj: SZZ NADE — předmět WAP — Internetové aplikace, VUT FIT. Externí reference: RFC 3986, RFC 8141, MDN Web Docs.*
