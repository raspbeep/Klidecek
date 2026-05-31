---
title: Architektonický styl REST
---

**REST** (*Representational State Transfer*) není protokol ani formát zprávy jako [[xml-rpc]] nebo SOAP — je to **architektonický styl**, který v roce 2000 popsal Roy Fielding ve své disertaci. Místo aby přidával novou vrstvu *nad* web, REST naopak žádá, aby se aplikace chovala *podle* principů, na nichž web už stojí. Zásadní posun oproti RPC je v tom, kam orientuje návrh: RPC přemýšlí o **akcích** (zavolej proceduru `smazUzivatele(42)`), zatímco REST přemýšlí o **zdrojích** (*resources*) a o operacích nad nimi (pošli `DELETE` na zdroj `/uzivatele/42`).

Tato „orientace na data místo na akce" má praktické důsledky: každý zdroj má vlastní adresu, manipuluje se s ním standardními HTTP slovesy a síť (cache, proxy, CDN) může tyto operace inteligentně zpracovávat, protože jejich význam zná předem.

## Šest omezení (constraints)

Aby byl systém *RESTful*, musí splňovat šest architektonických omezení. Pět je povinných; poslední (Code on Demand) je jediné nepovinné.

::: svg "Šest omezení REST — pět povinných, Code on Demand nepovinné"
<svg viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg">
  <g font-size="10.5">
    <rect x="14" y="16" width="158" height="44" rx="7" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.55 0.16 264)"/>
    <text x="93" y="34" text-anchor="middle" font-weight="600" fill="oklch(0.50 0.16 264)">Client–Server</text>
    <text x="93" y="50" text-anchor="middle" fill="var(--text-muted)">oddělení UI a dat</text>
    <rect x="181" y="16" width="158" height="44" rx="7" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.55 0.16 264)"/>
    <text x="260" y="34" text-anchor="middle" font-weight="600" fill="oklch(0.50 0.16 264)">Stateless</text>
    <text x="260" y="50" text-anchor="middle" fill="var(--text-muted)">žádný kontext relace</text>
    <rect x="348" y="16" width="158" height="44" rx="7" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.55 0.16 264)"/>
    <text x="427" y="34" text-anchor="middle" font-weight="600" fill="oklch(0.50 0.16 264)">Cacheable</text>
    <text x="427" y="50" text-anchor="middle" fill="var(--text-muted)">odpovědi lze cachovat</text>
    <rect x="14" y="68" width="158" height="44" rx="7" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.55 0.16 264)"/>
    <text x="93" y="86" text-anchor="middle" font-weight="600" fill="oklch(0.50 0.16 264)">Uniform Interface</text>
    <text x="93" y="102" text-anchor="middle" fill="var(--text-muted)">URI + reprez. + HATEOAS</text>
    <rect x="181" y="68" width="158" height="44" rx="7" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.55 0.16 264)"/>
    <text x="260" y="86" text-anchor="middle" font-weight="600" fill="oklch(0.50 0.16 264)">Layered System</text>
    <text x="260" y="102" text-anchor="middle" fill="var(--text-muted)">transparentní vrstvy</text>
    <rect x="348" y="68" width="158" height="44" rx="7" fill="oklch(0.55 0.14 65 / 0.12)" stroke="oklch(0.52 0.16 65)" stroke-dasharray="4 3"/>
    <text x="427" y="86" text-anchor="middle" font-weight="600" fill="oklch(0.48 0.16 65)">Code on Demand</text>
    <text x="427" y="102" text-anchor="middle" fill="var(--text-muted)">nepovinné</text>
  </g>
  <text x="260" y="140" text-anchor="middle" font-size="10" fill="var(--text-faint)">Pět plných rámečků je povinných; přerušovaný (Code on Demand) je jediné nepovinné omezení.</text>
  <text x="260" y="162" text-anchor="middle" font-size="10" fill="var(--text-faint)">Vynechání kteréhokoli povinného omezení znamená, že systém už není RESTful.</text>
</svg>
:::

* **Client–Server** — striktní oddělení zodpovědností: klient řeší uživatelské rozhraní, server úložiště dat. Obě strany se mohou vyvíjet nezávisle, dokud drží smluvené rozhraní.
* **Stateless (bezstavovost)** — server **neuchovává žádný kontext relace** mezi požadavky. Každý požadavek musí nést *veškeré* informace potřebné k jeho vyřízení (např. autentizační token). To zvyšuje viditelnost, spolehlivost a hlavně *škálovatelnost* — libovolný požadavek může obsloužit kterýkoli server za load balancerem.
* **Cacheable** — každá odpověď musí být explicitně označena, zda a jak dlouho ji lze cachovat (hlavičky `Cache-Control`, `ETag`). Vhodně provozu se tak obslouží z mezipaměti, což výrazně zrychluje a odlehčuje server.
* **Uniform Interface (jednotné rozhraní)** — *centrální* a nejcharakterističtější omezení REST. Skládá se ze čtyř dílčích pravidel: (1) každý zdroj má unikátní *identifikaci* (URI); (2) se zdroji se manipuluje skrze jejich *reprezentace* (JSON, XML…), ne přímo; (3) zprávy jsou *sebepopisné* (nesou vše pro své zpracování, např. typ obsahu); (4) **HATEOAS** (*Hypermedia as the Engine of Application State*) — odpovědi obsahují odkazy na další možné stavy, takže klient prochází aplikací podle hypertextu serveru, nikoli podle natvrdo zadrátovaných URL.
* **Layered System (vrstvená architektura)** — mezi klientem a serverem mohou ležet průhledné vrstvy (load balancery, proxy, brány, cache), o kterých klient nemusí vědět. Každá vrstva „vidí" jen sousední vrstvu.
* **Code on Demand** — server může klientovi poslat spustitelný kód (typicky JavaScript), který rozšíří jeho chování. **Jediné nepovinné** omezení.

## Mapování na HTTP slovesa

V REST se naplno využívá sémantika HTTP — význam operace nese *sloveso* (metoda), nikoli URL. U každé metody jsou klíčové dvě vlastnosti, na které se zkoušející rádi ptají:

* **bezpečná (*safe*)** — operace pouze čte, nemění stav zdroje (`GET`).
* **idempotentní** — opakované provedení téhož požadavku má *stejný výsledný efekt* na server jako jediné provedení.

::: viz wap-rest-verbs "Vyber HTTP sloveso. Sleduj, na co cílí (kolekce vs. položka), jakou CRUD operaci značí, typický stavový kód a zda je bezpečné a idempotentní."
:::

`GET` je bezpečné i idempotentní. `PUT` a `DELETE` jsou idempotentní (ale ne bezpečné): nahrát zdroj nebo jej smazat lze opakovat se stejným koncovým stavem. `POST` a `PATCH` idempotentní obecně **nejsou** — opakovaný `POST` vytvoří více zdrojů, opakovaný relativní `PATCH` se může nasčítat. O výsledku operace informuje server typizovanými HTTP stavovými kódy (`200`, `201`, `204`, `404`, `409`…).

## Srovnání: REST vs SOAP vs XML-RPC

| | XML-RPC | SOAP | REST |
|---|---|---|---|
| Typ | protokol RPC | protokol / standard | architektonický styl |
| Návrh orientován na | akce (procedury) | akce (operace) | **zdroje** |
| Sémantika sítě | vše přes POST na 1 endpoint | vše přes POST na 1 endpoint | URI na zdroj + GET/POST/PUT/PATCH/DELETE |
| Cachování | ne (vše POST) | ne (vše POST) | **ano** (GET, `Cache-Control`/`ETag`) |
| Transport | jen HTTP | HTTP, SMTP, TCP, JMS | HTTP |
| Formát dat | XML | jen XML (obálka) | libovolný — typicky JSON |
| Kontrakt | introspekce (volitelná) | WSDL (striktní, ověřen) | obvykle volnější (OpenAPI) |
| Režie | nízká | vysoká (XML obálka, WS-\*) | nízká (typicky JSON) |

**Sémantika sítě** je tím nejhlubším rozdílem. RPC i SOAP *tunelují* vše přes `POST` na jediné URI, takže mezipaměti a proxy vidí jen neprůhledné POSTy a nemohou nic optimalizovat. REST naopak *spolupracuje s architekturou webu*: díky unikátním URI a správně použitým slovesům umí CDN a proxy odpovědi cachovat a celý systém škálovat.

**Kdy co nasadit.** SOAP přežívá ve financích, pojišťovnictví a starších enterprise systémech, kde je potřeba striktní typový kontrakt ověřený už při překladu (WSDL), garantované doručení a transakce přes WS-\*. REST je dnes de facto standardem pro veřejná rozhraní, web i mobilní aplikace díky bezstavovosti, cachovatelnosti a nízké režii. XML-RPC je dnes do značné míry historií; jeho minimalistické principy ale přežívají v modernějších RPC stylech jako JSON-RPC nebo gRPC, které se hodí pro vnitřní komunikaci mikroslužeb.

::: quiz "Klient zopakuje stejný požadavek, protože si není jistý, zda první dorazil. U které dvojice sloves to neohrozí konzistenci (jsou idempotentní), i když nejsou bezpečná?"
- [ ] POST a PATCH.
  > Ani jedno není idempotentní: dvojí POST vytvoří dva zdroje, dvojí relativní PATCH může změnu nasčítat.
- [x] PUT a DELETE.
  > Správně. Oba mění stav (nejsou bezpečné), ale opakování dá stejný koncový stav — PUT zdroj znovu kompletně nahradí, DELETE už nemá co mazat. Lze tedy bezpečně opakovat.
- [ ] GET a POST.
  > GET je idempotentní (i bezpečný), ale POST nikoli — opakování vytvoří více zdrojů.
:::

::: link "Roy Fielding — Architectural Styles (disertace, kap. 5: REST)" "https://roy.gbiv.com/pubs/dissertation/rest_arch_style.htm"
:::

::: link "RFC 9110 — HTTP Semantics (metody, safe & idempotent)" "https://www.rfc-editor.org/rfc/rfc9110"
:::

::: link "MDN — HTTP request methods" "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods"
:::

*Zdroj: SZZ NADE — předmět WAP — Internetové aplikace, VUT FIT. Externí reference: Fielding (disertace 2000), RFC 9110, MDN Web Docs.*
