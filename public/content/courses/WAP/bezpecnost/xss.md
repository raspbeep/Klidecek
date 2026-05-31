---
title: Cross-Site Scripting (XSS)
---

**Cross-Site Scripting** (XSS) je útok, při kterém útočník propašuje do důvěryhodné stránky vlastní spustitelný kód (typicky JavaScript), jenž se pak vykoná v prohlížeči oběti v *kontextu napadené domény*. V klasifikaci [OWASP Top 10](https://owasp.org/www-project-top-ten/) patří do kategorie injekcí — útočníkův vstup se chybně začne vykládat jako kód, ne jako data.

Protože skript běží v rámci původu napadené stránky, má přístup ke všemu, co tam má i legitimní kód: může číst a měnit DOM, odesílat požadavky jménem uživatele a — zásadní — dostat se k relaci. Atribut `HttpOnly` u session cookie zabrání jejímu přečtení přes `document.cookie`, ale **session hijacking tím nekončí**: skript může relaci zneužít *přímo z prohlížeče oběti* — pošle požadavky na server, ke kterým prohlížeč cookie sám přiloží. Krádež identity relace tak proběhne, i když útočník samotnou hodnotu cookie nikdy nespatří.

## Tři formy XSS

Formy se liší tím, *kudy* se payload do stránky dostane a *kdo* se na útoku podílí.

::: viz wap-xss-types "Přepínej mezi Stored, Reflected a DOM-based. Sleduj cestu škodlivého payloadu a zejména to, zda se na útoku podílí server, nebo jde čistě o klientský kód."
:::

* **Stored (perzistentní)** — payload se *trvale uloží na serveru* (komentář, profil, příspěvek v DB) a vykoná se každému, kdo si daný obsah zobrazí. Nejnebezpečnější forma: nevyžaduje žádnou akci oběti a může zasáhnout mnoho uživatelů najednou.
* **Reflected (odražený, neperzistentní)** — payload je součástí požadavku (typicky parametr v URL), který server *neošetřený „odrazí"* zpět ve své odpovědi. Útočník musí oběť přimět kliknout na připravený odkaz, payload se nikam neukládá.
* **DOM-based (klientský)** — zranitelnost je výhradně v klientském JS. Skript přečte data z nedůvěryhodného zdroje (`location.hash`, `location.search`) a bez ošetření je předá do nebezpečného **sinku** — `eval()`, `innerHTML`, `document.write()`. Server payload nikdy nevidí, takže serverová ochrana ho neodchytí.

```js
// DOM-based XSS — antivzor: data z URL rovnou do innerHTML
const name = decodeURIComponent(location.hash.slice(1));
document.getElementById("greeting").innerHTML = "Ahoj " + name;
//  útok:  https://app.example.com/#<img src=x onerror=alert(document.cookie)>
//  sink innerHTML payload vyhodnotí a onerror se spustí
```

## Obrana — kontextové escapování a šablony

Základem je **kontextové escapování výstupu**: každý nedůvěryhodný řetězec se před vložením do stránky zakóduje podle toho, *kam* se vkládá. Stejný řetězec se jinak escapuje v HTML textu, jinak v atributu, jinak v URL a jinak uvnitř `<script>`. Ruční escapování jednou univerzální funkcí (typicky obecné HTML-escapování) je nedostatečné a chybové — neumí rozlišit kontext.

Proto je primární obranou **automaticky escapující šablonovací systém**, který kontext rozpozná sám a vloží správné kódování. Šablony Latte (Nette) i JSX v React escapují vykreslované hodnoty *standardně*; nebezpečné je teprve vědomé obejití (`dangerouslySetInnerHTML` v Reactu, `|noescape` v Latte).

```jsx
// React — bezpečné automaticky: výraz {comment} se zaescapuje jako text
function Comment({ comment }) {
  return <p>{comment}</p>;          // <script> se vykreslí jako neškodný text

  // NEBEZPEČNÉ — vědomé obejití escapování:
  // return <p dangerouslySetInnerHTML={{ __html: comment }} />;
}
```

Pro DOM-based XSS, kde žádná šablona není, slouží prohlížečové **Trusted Types**. Direktiva CSP `require-trusted-types-for 'script'` zakáže předat do nebezpečného sinku obyčejný řetězec — sink přijme jen objekt vytvořený schválenou politikou, která vstup ošetří. Tím se z auditu „kde všude může téct nedůvěryhodný řetězec do DOM" stane vynutitelné pravidlo.

Poslední vrstvou je **[[bezpecnostni-hlavicky|Content-Security-Policy]]** jako *defense-in-depth*: i když nějaká injekce projde, striktní CSP (nonce/hash, `strict-dynamic`) zabrání spuštění neoprávněného skriptu. CSP je pojistka, ne náhrada správného escapování.

::: quiz "Aplikace ukládá session cookie s atributem HttpOnly. Útočník našel Stored XSS. Je relace v bezpečí?"
- [ ] Ano — HttpOnly skriptu znepřístupní cookie, takže ji nemůže ukrást.
  > HttpOnly skutečně zabrání přečtení cookie přes document.cookie, ale to relaci nezachrání.
- [x] Ne — skript může relaci zneužít přímo: pošle požadavky, k nimž prohlížeč cookie sám přiloží.
  > Správně. Session hijacking nevyžaduje hodnotu cookie vyčíst. Skript běží v původu oběti a jedná jejím jménem — HttpOnly je dílčí ztížení, ne řešení XSS.
- [ ] Ano, pokud je cookie i Secure.
  > Secure jen vynutí přenos po HTTPS. Proti zneužití relace z XSS uvnitř téže stránky nepomůže.
:::

::: link "OWASP — Cross Site Scripting (XSS)" "https://owasp.org/www-community/attacks/xss/"
:::

::: link "OWASP Cheat Sheet — Cross Site Scripting Prevention" "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"
:::

::: link "MDN — Trusted Types API" "https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API"
:::

*Zdroj: SZZ NADE — předmět Internetové aplikace, VUT FIT. Externí reference: OWASP (Top 10, XSS Cheat Sheet), MDN Web Docs (Trusted Types, CSP).*
