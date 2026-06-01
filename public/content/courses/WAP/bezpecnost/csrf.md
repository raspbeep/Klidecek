---
title: Cross-Site Request Forgery (CSRF)
---

Zatímco [[xss|XSS]] zneužívá důvěru *uživatele v server*, **Cross-Site Request Forgery** (CSRF) zneužívá obrácenou důvěru — důvěru *serveru v prohlížeč* přihlášeného uživatele. Princip stojí na tom, že prohlížeč k požadavku na danou doménu **automaticky přiloží její cookies** bez ohledu na to, odkud byl požadavek vyvolán.

Útok vypadá takto: uživatel je přihlášen u banky a v jiné záložce otevře útočníkovu stránku. Ta nechá prohlížeč odeslat požadavek na bankovní endpoint (např. převod peněz nebo změnu hesla). Prohlížeč k němu přiloží platnou relační cookie, a server proto požadavek vyhodnotí jako legitimní a autorizovaný. Útočník přitom odpověď ani nepotřebuje vidět — [[sop-cors|SOP]] mu sice brání ji přečíst, ale *na odeslání požadavku nemá vliv*, a změna na serveru už nastala.

::: viz wap-csrf-flow "Projdi útok krok po kroku. Pak zapni Synchronizer Token a sleduj, jak server požadavek bez platného tokenu odmítne — útočník ho kvůli SOP nemohl z banky přečíst."
:::

## Synchronizer Token Pattern

Stavová a nejrobustnější obrana. Server vygeneruje kryptograficky silný náhodný **token** a sváže ho s relací uživatele. Token vloží do stránky — typicky jako skryté pole formuláře — a při zpracování požadavku ověří, že přišlý token odpovídá tomu uloženému v session.

Klíč k tomu, proč to funguje: útočníkova stránka token **nemůže přečíst**, protože ho k tomu nepustí SOP (čtení cross-origin odpovědi je zakázané). Bez platného tokenu server podvržený požadavek odmítne.

```html
<form method="POST" action="/prevod">
  <input type="hidden" name="csrf_token" value="9f2c…náhodný-token-ze-session">
  <input name="castka">
  <button>Odeslat</button>
</form>
```

## Signed Double-Submit Cookie

Bezstavová varianta vhodná pro API, kde nechceme držet token v session. Server token uloží do cookie a klient ho zároveň pošle i v hlavičce nebo parametru; server ověří shodu obou. Aby to bylo bezpečné, musí být token **podepsaný (HMAC)** vázaným na session — naivní double-submit bez podpisu lze obejít: útočník ovládající *jakoukoli subdoménu* může podvrhnout cookie pro celou registrovatelnou doménu (cookies nerozlišují subdomény tak striktně jako [[sop-cors|Origin]]) a tím obě „poloviny" srovnat.

## Atribut SameSite

`SameSite` je instrukce prohlížeči, kdy vůbec cookie ke cross-site požadavku přiložit. Je to silná systémová vrstva, ale **ne kompletní řešení** — má důležité díry.

| Hodnota | Chování |
|---|---|
| `Strict` | Cookie se na cross-site požadavek **nepřiloží nikdy**, ani při kliknutí na odkaz z cizího webu. |
| `Lax` | Cookie se přiloží jen u **top-level navigace bezpečnou metodou** (GET/HEAD) — kliknutí na odkaz ano, skrytý cross-site POST, `fetch` ani `<img>` ne. Výchozí hodnota moderních prohlížečů. |
| `None` | Cookie se přikládá vždy; nutně musí být i `Secure`. |

Dvě pasti do zkoušky. Za prvé: pokud aplikace **mění stav metodou GET** (např. `/odhlasit` nebo `/smazat?id=5`), `SameSite=Lax` proti CSRF **nepomůže** — Lax právě top-level GET navigaci povolí. Stav měnící operace proto musí používat `POST`/`PUT`/`DELETE`. Za druhé: pod výchozím Lax existuje **dvouminutové okno** — čerstvě nastavená cookie (mladší než 2 minuty) se přiloží i k cross-site `POST` z top-level navigace, takže spoléhat výhradně na implicitní Lax nestačí.

## Fetch Metadata

Moderní doplňková obrana. Prohlížeč ke každému požadavku sám přidá hlavičky, které **JavaScript nemůže zfalšovat** (mají prefix `Sec-`). Nejdůležitější je `Sec-Fetch-Site` s hodnotami `same-origin`, `same-site`, `cross-site`, `none`. Server tak plošně odmítne stav měnící požadavky přicházející z cizích webů.

```http
POST /prevod HTTP/1.1
Host: bank.example
Sec-Fetch-Site: cross-site      ← požadavek z cizího webu → server vrátí 403
Sec-Fetch-Mode: cors
```

::: quiz "Endpoint /odhlasit?token=… provádí odhlášení metodou GET a cookie má SameSite=Lax. Chrání tato kombinace před CSRF?"
- [ ] Ano — SameSite=Lax blokuje všechny cross-site požadavky.
  > Lax neblokuje všechno. Bezpečnou metodou (GET) u top-level navigace cookie přiloží.
- [x] Ne — Lax povolí top-level GET navigaci, takže cizí web může uživatele odhlásit přes <img>/odkaz.
  > Správně. Lax chrání jen proti nebezpečným metodám. Stav měnící operace nesmí běžet přes GET — to je porušení HTTP sémantiky i bezpečnostní díra.
- [ ] Ano, protože token v URL útočník nezná.
  > Token v URL je čitelný z historie/loggů a u GET odhlášení tu žádný anti-CSRF token efektivně není. Hlavní problém je stav měnící GET.
:::

::: link "OWASP Cheat Sheet — Cross-Site Request Forgery Prevention" "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html"
:::

::: link "MDN — SameSite atribut cookie" "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value"
:::

::: link "MDN — Sec-Fetch-Site (Fetch Metadata)" "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-Fetch-Site"
:::

### Videa

::: youtube "https://www.youtube.com/watch?v=eWEgUcHPle0" "Cross-Site Request Forgery (CSRF) Explained" "PwnFunction"
:::

*Zdroj: SZZ NADE — předmět Internetové aplikace, VUT FIT. Externí reference: OWASP (CSRF Prevention Cheat Sheet), MDN Web Docs (SameSite, Fetch Metadata).*
