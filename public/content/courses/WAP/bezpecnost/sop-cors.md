---
title: Same-Origin Policy a CORS
---

**Same-Origin Policy** (SOP) je naprosto základní bezpečnostní hranice uvnitř webového prohlížeče. Zabraňuje tomu, aby kód načtený z jednoho původu mohl číst data nebo skriptovat dokument jiného původu. Bez SOP by libovolná stránka, kterou si otevřete, mohla skriptem vyčíst obsah vaší rozečtené pošty nebo internetového bankovnictví v jiné záložce. SOP tedy odděluje vzájemně nedůvěryhodné weby běžící ve stejném prohlížeči.

## Origin vs Site

Klíčové je nezaměňovat dva pojmy, které vypadají podobně, ale platí pro ně jiná pravidla.

**Origin (původ)** je striktně definován trojicí *protokol + host + port*. Změní-li se kterákoli ze tří složek, jde už o jiný původ a tedy o cross-origin interakci. Na tuto trojici se SOP dívá při rozhodování, zda smí skript přečíst odpověď.

**Site (web)** je mnohem volnější pojem označující *registrovatelnou doménu* — efektivní nejvyšší doménu plus jednu úroveň (eTLD+1), např. `example.com`. Konkrétní subdoména ani port se neberou v potaz. Pojem Site používá hlavně mechanismus cookies (atribut `SameSite`), nikoli SOP.

::: viz wap-origin-check "Vyber cíl požadavku a sleduj porovnání trojice protokol/host/port proti základní stránce. Všimni si rozdílu mezi same-origin (čtení povoleno) a jen same-site (jiný Origin — čtení zakázáno)."
:::

Důsledek je zrádný: `https://app.example.com` a `https://api.example.com` jsou **stejná Site**, ale **různé Origin**. Cookie s `SameSite=Lax` se mezi nimi pošle, ale skript z jednoho z nich nepřečte odpověď druhého, dokud to nepovolí CORS.

## Co SOP zakazuje a co ne

Tady studenti nejčastěji chybují. SOP **nezakazuje odeslání** cross-origin požadavku ani vložení cizího zdroje — zakazuje pouze **čtení odpovědi** skriptem.

| Akce | Příklad | SOP |
|---|---|---|
| Vložení (embedding) | `<img>`, `<script src>`, `<link>`, `<iframe>`, `@font-face` | **povoleno** |
| Zápis / navigace (write) | odkaz, přesměrování, odeslání `<form>` | **povoleno** |
| Čtení odpovědi (read) | `fetch()`/`XHR` a přečtení těla odpovědi | **zakázáno** (cross-origin) |

To, že se požadavek *odešle*, je přesně důvod, proč samotná SOP nestačí proti [[csrf]] — útočníkova stránka request rozjede, jen mu prohlížeč nedá přečíst odpověď. Odeslaný požadavek ale na serveru může něco změnit a útočníkovi stačí, že proběhl.

## CORS — řízené uvolnění, ne obrana

**Cross-Origin Resource Sharing** (CORS) je mechanismus, kterým server *dovolí* prohlížeči vydat odpověď skriptu z jiného původu. Server v odpovědi pošle hlavičku `Access-Control-Allow-Origin` s povoleným původem; teprve pak prohlížeč skriptu odpověď zpřístupní.

```http
GET /data HTTP/1.1
Host: api.example.com
Origin: https://app.example.com

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com
Content-Type: application/json
```

Pro požadavky, které nejsou „jednoduché" (mají vlastní hlavičky, metodu jako `PUT`/`DELETE`, apod.), pošle prohlížeč nejprve **preflight** dotaz metodou `OPTIONS` a server jím povolí konkrétní metody a hlavičky (`Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`).

Zásadní myšlenkové nastavení do zkoušky: **CORS není obrana, ale deklarativní povolení**. Neztužuje SOP — naopak ji řízeně *uvolňuje*. Nastavit naslepo `Access-Control-Allow-Origin: *` na endpoint vracející citlivá data znamená cíleně zbourat hranici, kterou SOP staví. (Hodnota `*` navíc nedovoluje posílat přihlašovací cookies — k tomu je nutné `Allow-Origin` s konkrétním původem a `Access-Control-Allow-Credentials: true`.)

## XS-Leaks — postranní kanály kolem SOP

I když SOP zabrání přímému *přečtení* cross-origin odpovědi, útočník může z chování prohlížeče odvodit binární informaci nepřímo. **Cross-Site Leaks** (XS-Leaks) využívají postranní kanály: doba načtení, zda se vyvolala událost `onload` vs `onerror`, počet vrácených prvků, stav cache nebo frame countu. Tak lze zjistit třeba „je tento uživatel přihlášen?" nebo „existuje účet s tímto e-mailem?", aniž by se odpověď kdy přímo četla. Obranou jsou izolační mechanismy jako [[bezpecnostni-hlavicky|Fetch Metadata]], `Cross-Origin-Resource-Policy` a `Cross-Origin-Opener-Policy`.

::: quiz "Útočníkova stránka pošle pomocí fetch() požadavek na vaši bankovní API. Co SOP udělá?"
- [ ] Zablokuje odeslání požadavku, takže na server nikdy nedorazí.
  > Toto je nejčastější mýtus. SOP odeslání cross-origin požadavku nebrání — request normálně dorazí na server (a může tam něco změnit). To je přesně živná půda pro CSRF.
- [x] Požadavek odešle, ale skriptu útočníka nedovolí přečíst tělo odpovědi (bez CORS).
  > Správně. SOP je hranice pro *čtení* odpovědi, ne pro odeslání. Server proto musí mít vlastní CSRF obranu; spoléhat jen na to, že „SOP to zařízne", je chyba.
- [ ] Odpověď přečte, ale zahodí cookies.
  > Ne — cookies se k cross-site požadavku obvykle přiloží (podle atributu SameSite), a čtení odpovědi je naopak to, co SOP blokuje.
:::

::: link "MDN — Same-origin policy" "https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy"
:::

::: link "MDN — Cross-Origin Resource Sharing (CORS)" "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS"
:::

::: link "web.dev — XS-Leaks a izolace stránek" "https://web.dev/articles/xs-leaks"
:::

### Videa

::: youtube "https://www.youtube.com/watch?v=4KHiSt0oLJ0" "CORS in 100 Seconds" "Fireship"
:::

*Zdroj: SZZ NADE — předmět Internetové aplikace, VUT FIT. Externí reference: MDN Web Docs (Same-origin policy, CORS), WHATWG Fetch, web.dev (XS-Leaks).*
