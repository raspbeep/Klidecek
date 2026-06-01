---
title: REST — návrh API, endpointy, HTTP metody, JAX-RS
---

**REST** (*Representational State Transfer*) je architektonický styl pro tvorbu webových API definovaný Royem Fieldingem v jeho disertaci (2000). V kontextu business vrstvy je REST nejčastější způsob, jak *vystavit* aplikační logiku — klient (webový prohlížeč, mobilní aplikace, jiná služba) komunikuje s business vrstvou pomocí HTTP volání.

Základní vlastnosti REST:

* **CRUD operace s entitami** — *Create, Retrieve, Update, Delete*. Ale pozor: skutečně **přistupujeme k business vrstvě, ne přímo k datům!** REST je tedy fasáda nad business logikou — voláme aplikační logiku, ne DB.
* **Úzká vazba na HTTP** — REST využívá HTTP metody, status kódy a hlavičky podle jejich původního významu (nezneužívá je).
* **Bezstavovost** — server *nedrží* mezi voláními žádný stav klienta; každý požadavek musí obsahovat vše potřebné.
* **Formát přenosu dat není definován** — nejčastěji JSON, méně XML, vždy obojí možné.

## Endpoint = zdroj + adresa

**Endpoint** je *URL, na které lze zaslat HTTP požadavek*. Reprezentuje **zdroj** (*resource*) — entitu nebo službu, která má nějaký *stav* (*state*). Dva základní typy endpointů:

### Endpointy pro operace se zdroji (CRUD)

* **Kolekce entit**: `http://obchod.cz/api/objednavky` (všechny objednávky)
* **Jedna entita**: `http://obchod.cz/api/objednavky/8235` (objednávka s ID 8235)

### Endpointy pro volání funkcí (RPC-like)

* `http://obchod.cz/api/odesli-objednavku`
* `http://obchod.cz/api/vypocti-cenu`

V čistě RESTful návrhu se *funkční endpointy* používají sporadicky — preferují se operace na zdrojích (`POST /api/objednavky/{id}/odeslani` místo `POST /api/odesli-objednavku`).

## HTTP metody a jejich význam

::: svg "HTTP metody pro operace se zdroji"
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="20" width="520" height="170" rx="6" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="20" y="42" font-size="13" font-weight="600" fill="oklch(0.40 0.14 142)" font-family="var(--font-mono)">GET</text>
  <text x="100" y="42" font-size="12" fill="var(--text)">— čtení stavu zdroje (read)</text>
  <text x="20" y="66" font-size="13" font-weight="600" fill="oklch(0.40 0.14 264)" font-family="var(--font-mono)">POST</text>
  <text x="100" y="66" font-size="12" fill="var(--text)">— přidání podřízeného zdroje (create do kolekce)</text>
  <text x="20" y="90" font-size="13" font-weight="600" fill="oklch(0.40 0.14 80)" font-family="var(--font-mono)">PUT</text>
  <text x="100" y="90" font-size="12" fill="var(--text)">— nahrazení zdroje novým stavem (update, idempotentní)</text>
  <text x="20" y="114" font-size="13" font-weight="600" fill="oklch(0.42 0.14 22)" font-family="var(--font-mono)">PATCH</text>
  <text x="100" y="114" font-size="12" fill="var(--text)">— nahrazení části zdroje (partial update)</text>
  <text x="20" y="138" font-size="13" font-weight="600" fill="oklch(0.42 0.14 340)" font-family="var(--font-mono)">DELETE</text>
  <text x="100" y="138" font-size="12" fill="var(--text)">— smazání zdroje</text>
  <text x="20" y="170" font-size="11" fill="var(--text-faint)" font-style="italic">Volání funkcí: GET (bezpečné, idempotentní) nebo POST (s vedlejším efektem)</text>
  <text x="20" y="184" font-size="11" fill="var(--text-faint)" font-style="italic">Pokud POST vytvoří nový zdroj, URL nového zdroje vrátí v hlavičce Location.</text>
</svg>
:::

| Metoda | Účel | Idempotentní? |
|---|---|---|
| `GET` | Čtení (read) | Ano (vícekrát = stejný stav) |
| `POST` | Vytvoření (create) | **Ne** (každé volání = nový zdroj) |
| `PUT` | Nahrazení celého zdroje | Ano |
| `PATCH` | Změna části zdroje | Obvykle ano |
| `DELETE` | Smazání | Ano (vícekrát = stále smazané) |

**Idempotence** (vícenásobné volání nemá další efekt) je důležitá pro spolehlivost — bezpečně lze automaticky opakovat při timeoutu.

### Volání funkcí

Pro endpointy reprezentující *funkce* (operace, které nemají přirozený zdroj) se používá:

* **`GET`** — pokud operace *jen čte data* (bez vedlejších efektů). Výsledek se serializuje a vrátí.
* **`POST`** — pokud operace má *vedlejší efekt* (zaúčtuje platbu, odešle email). Pokud výsledkem je nový zdroj, jeho URL se vrátí v hlavičce **`Location`**.

## Stavové kódy HTTP

Stavový kód odpovědi popisuje výsledek operace. Typické případy:

| Kód | Význam | Kdy |
|---|---|---|
| `200 OK` | úspěch | GET/PUT/PATCH/DELETE |
| `201 Created` | úspěch + vytvořen nový zdroj | POST (+ Location header) |
| `204 No Content` | úspěch bez návratových dat | DELETE bez výsledku |
| `400 Bad Request` | neplatný požadavek | špatná validace vstupu |
| `401 Unauthorized` | chybí autentizace | nepřihlášen |
| `403 Forbidden` | autentizace OK, ale chybí oprávnění | role nestačí |
| `404 Not Found` | zdroj neexistuje | špatné ID |
| `409 Conflict` | konflikt stavu | např. optimistic locking |
| `500 Internal Server Error` | chyba serveru | nezachycená výjimka |

Volba správného kódu má praktický dopad: klient se podle kódu rozhoduje, *jak na chybu reagovat* — 5xx zopakovat, 4xx ne.

## Formát přenosu dat

REST formát přenosu *nestandardizuje*. V praxi:

* **JSON** — dnešní výchozí volba (čitelný pro lidi, parsovatelný v JS, kompaktní).
* **XML** — starší, hojně v enterprise (SOAP koukal odsud), ale ustupuje.
* Občas **CSV**, **binární formáty** (Protobuf, MessagePack) pro výkon.

Server často nabízí **více formátů** současně — klient si vybírá:

* `http://noviny.cz/clanky.xml` vs. `http://noviny.cz/clanky.json` (přípona),
* nebo HTTP **content negotiation** přes hlavičky `Accept` / `Content-Type` s MIME typy (`application/json`, `application/xml`).

```
GET /api/objednavky/42
Accept: application/json
```

## REST v Jakarta EE — JAX-RS

Jakarta EE poskytuje pro tvorbu REST API specifikaci **JAX-RS** (*Jakarta REST*). Vlastnosti:

* **Vytváření služeb pomocí anotací** — minimum boilerplate.
* **Aplikační server zajistí endpoint** (JAX-RS servlet) — mapování URL a HTTP metod na Javovské objekty a metody.
* **Serializace/deserializace JSON/XML** na objekty.

### Implementace

* **JAX-RS specifikace** má více implementací: **Jersey** (RI v Glassfish/Payara), **RESTEasy** (WildFly), **Apache CXF**.
* **Serializace JSON** — **Jackson**, **gson**, **MOXy** (EclipseLink), **JSON-B**.
* Vše je **součástí aplikačního serveru** (Payara/Open Liberty) — typicky neřešíte přímo, jen napíšete anotace.

### Příklad — REST endpoint v Javě

```java
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;

@Path("/users/{username}")
public class UserResource {

    @EJB
    private UserService userService;            // business vrstva

    @GET
    @Produces("application/json")
    public User getUser(@PathParam("username") String userName) {
        return userService.findByLogin(userName);     // volání business logiky
    }
}
```

Co se zde děje:

* `@Path("/users/{username}")` mapuje třídu na URL šablonu (`{username}` je placeholder).
* `@GET` říká, že metoda zpracovává HTTP GET.
* `@Produces("application/json")` — výstup je JSON. JAX-RS automaticky serializuje return value (objekt typu `User`).
* `@PathParam("username")` extrahuje hodnotu z URL.

### Konfigurace — `Application`

Aby JAX-RS poznal, kam má svůj servlet zaregistrovat, potřebuje jednu třídu odvozenou od `jakarta.ws.rs.core.Application`:

```java
import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;

@ApplicationPath("/api")             // všechny endpointy budou pod /api/...
public class ApplicationConfig extends Application { }
```

Žádný kód uvnitř není nutný — anotace stačí.

## Návrh REST rozhraní — systematicky

Architektura REST je **velmi volná** — umožňuje *„chaoticky"* přidávat endpointy podle aktuální potřeby. Ze zkušenosti je to past: po roce máte API se 200 endpointy bez systému.

> **Systematický návrh je nutný.**

Konkrétně:

* **Pevné datové struktury** — vycházející z doménového modelu. Mít DTO třídy, ne ad-hoc mapy. *Včetně reprezentace chybových stavů* (například jednotný `ErrorResponse{code, message, details}`).
* **Mapování business operací na endpointy** — vycházející z případů použití (use cases). Endpoint není „jeden CRUD na entitu"; je to *operace, kterou klient potřebuje*.
* **Ideálně formální popis rozhraní** — mnohem lepší než sdílená tabulka v Confluence.

### Formální popisy — WADL, OpenAPI

* **WADL** (*Web Application Description Language*) — XML-based, starší, podporovaný v Javě (např. Payara). Dnes vzácný.
* **OpenAPI** (dříve Swagger) — YAML/JSON, *dnešní standard*. Specifikace na [swagger.io/specification](https://swagger.io/specification/). Generování z kódu (Payara/Liberty automaticky na `/openapi/`), generátory klientů třetích stran ([OpenAPITools](https://github.com/OpenAPITools)).

OpenAPI nese:

* seznam endpointů, jejich URL a HTTP metody,
* parametry (path/query/header/body) s typy,
* tvar request a response těla,
* stavové kódy a popisky.

Z OpenAPI lze automaticky generovat: dokumentaci, klientské SDK, server stubs, testy. Hodí se i pro *contract-first* vývoj — popíšete API, pak teprve píšete kód obou stran.

## Klientská aplikace — co dělá

Klient (typicky SPA v JS frameworku — React, Vue, Angular) má vlastní úkoly:

* **Zasílání REST požadavků** — každý JS framework má svou infrastrukturu (`fetch`, axios, Vue Resource, …).
* **Prezentační logika**:
  * Navigace (router).
  * Přechody mezi stránkami.
  * Validace formulářů.
  * Výpisy chyb (mapování stavových kódů → UI hlášky).
  * Stavový management (Redux, Pinia, …).

Business logika *není v klientovi* — tam je jen prezentace a koordinace volání API.

::: link "Roy Fielding — Architectural Styles and the Design of Network-based Software Architectures (disertace, 2000)" "https://ics.uci.edu/~fielding/pubs/dissertation/top.htm"
:::

::: link "RFC 9110 — HTTP Semantics (oficiální specifikace HTTP metod a kódů)" "https://www.rfc-editor.org/rfc/rfc9110"
:::

::: link "Jakarta REST (JAX-RS) — specifikace" "https://jakarta.ee/specifications/restful-ws/"
:::

::: link "OpenAPI Specification" "https://swagger.io/specification/"
:::

::: link "OpenAPITools — generátory klientů a serverů z OpenAPI" "https://github.com/OpenAPITools"
:::

::: quiz "Aplikace na POST `/api/objednavky` vytvoří novou objednávku. Jaká kombinace HTTP odpovědi je nejvhodnější?"
- [x] Stavový kód `201 Created`, hlavička `Location: /api/objednavky/8235`, tělo s reprezentací nově vytvořené objednávky.
  > Ano. Kód 201 přesně znamená „vytvořen nový zdroj", `Location` říká klientovi jeho URL pro budoucí GET/PUT/DELETE.
- [ ] `200 OK` s vráceným ID objednávky.
  > Funguje, ale ztrácí sémantiku. Klient pak nepozná, zda došlo k vytvoření nebo k *idempotentnímu* PUT.
- [ ] `204 No Content`, aby se neposílalo zbytečné tělo.
  > Klient potřebuje aspoň ID nové objednávky — 204 ho nezprostředkuje (musel by udělat extra GET, navíc neví URL).
:::

::: quiz "Pro funkční endpoint `/api/vypocti-cenu`, který spočte cenu košíku ze složení (bez modifikace stavu), je vhodnější …"
- [x] `GET` (s parametry v query string), protože operace je *čistá* — nemá vedlejší efekty, výsledek závisí jen na vstupu.
  > Ano. GET je idempotentní a může být cachovaný. To je dobré pro výpočet, který hodnoty čte ale nezapisuje.
- [ ] `POST`, protože je to „akce".
  > POST používáme, když má operace vedlejší efekty (zaúčtuje, odešle, vytvoří). Čistý výpočet je čtení.
- [ ] `PUT`, protože nastavujeme novou cenu.
  > Nenastavujeme nic — pouze počítáme. PUT je pro nahrazení zdroje.
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=-mN3VyJuCjM" "What Is REST API? Examples And How To Use It: Crash Course System Design #3" "ByteByteGo"
:::

*Zdroj: přednášky PIS — doc. R. Burget, VUT FIT, část „Webové API — REST rozhraní pomocí JAX-RS" v přednášce „Business vrstva a API" (slidy 11–23).*
