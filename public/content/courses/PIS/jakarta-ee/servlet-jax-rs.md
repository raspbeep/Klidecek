---
title: REST API v Jakarta EE — JAX-RS
---

REST (*REpresentational State Transfer*) je dominantní architektonický styl pro webová API. V Jakarta EE ho implementuje **JAX-RS** (*Jakarta RESTful Web Services*). Tento subtopic shrnuje principy REST z pohledu praktického návrhu API a ukazuje, jak je v JAX-RS realizovat anotacemi.

## Principy REST

REST není protokol — je to **sada konvencí** o tom, jak nad HTTP modelovat operace s business doménou:

1. **CRUD nad entitami.** Každý kus dat (uživatel, objednávka, faktura) je *resource* s URL adresou (*endpointem*).
2. **Pozor: voláme business vrstvu, ne přímo data.** Endpoint sice vypadá jako přístup k tabulce, ale za ním je business logika (validace, autorizace, transakce, případně volání externích služeb).
3. **HTTP metody nesou význam operace.** Stejná URL + jiná metoda = jiná operace.
4. **HTTP stavové kódy nesou výsledek.** 2xx = úspěch, 4xx = chyba klienta, 5xx = chyba serveru.
5. **Bezstavovost.** Každý požadavek nese vše potřebné (autentizační hlavičky, parametry); server si nepamatuje předchozí výměnu.
6. **Formát přenosu** se nevynucuje. V praxi JSON, méně často XML; přes hlavičky `Accept:` a `Content-Type:` lze rozlišit (HTTP content negotiation).

## Endpointy

Endpoint je URL, na které lze poslat požadavek. Konvence:

| Příklad | Význam |
|---|---|
| `https://obchod.cz/api/objednavky` | kolekce entit |
| `https://obchod.cz/api/objednavky/8235` | jedna entita s id 8235 |
| `https://obchod.cz/api/objednavky/8235/polozky` | podřízená kolekce |
| `https://obchod.cz/api/odesli-objednavku` | volání funkce (méně RESTful, ale praktické) |

## Mapování metod HTTP na operace

::: svg "HTTP metody, jejich CRUD ekvivalent a typické stavové kódy"
<svg viewBox="0 0 560 240" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="520" height="28" fill="var(--accent-soft)" stroke="var(--accent-line)"/>
  <text x="35" y="38" font-size="11" font-weight="600" fill="var(--accent)">Metoda</text>
  <text x="125" y="38" font-size="11" font-weight="600" fill="var(--accent)">CRUD</text>
  <text x="215" y="38" font-size="11" font-weight="600" fill="var(--accent)">Idempotentní?</text>
  <text x="355" y="38" font-size="11" font-weight="600" fill="var(--accent)">Typický status</text>
  <g font-family="var(--font-mono)" font-size="11">
    <rect x="20" y="50" width="520" height="28" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="35" y="68" font-weight="600" fill="oklch(0.55 0.18 142)">GET</text>
    <text x="125" y="68" fill="var(--text)" font-family="var(--font-sans)">Read</text>
    <text x="215" y="68" fill="oklch(0.55 0.18 142)">ano</text>
    <text x="355" y="68" fill="var(--text)">200 OK</text>
    <rect x="20" y="80" width="520" height="28" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="35" y="98" font-weight="600" fill="oklch(0.55 0.18 264)">POST</text>
    <text x="125" y="98" fill="var(--text)" font-family="var(--font-sans)">Create</text>
    <text x="215" y="98" fill="oklch(0.62 0.15 30)">ne</text>
    <text x="355" y="98" fill="var(--text)">201 Created + Location: /…</text>
    <rect x="20" y="110" width="520" height="28" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="35" y="128" font-weight="600" fill="oklch(0.55 0.18 22)">PUT</text>
    <text x="125" y="128" fill="var(--text)" font-family="var(--font-sans)">Update (celé)</text>
    <text x="215" y="128" fill="oklch(0.55 0.18 142)">ano</text>
    <text x="355" y="128" fill="var(--text)">200 OK / 204 No Content</text>
    <rect x="20" y="140" width="520" height="28" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="35" y="158" font-weight="600" fill="oklch(0.55 0.18 22)">PATCH</text>
    <text x="125" y="158" fill="var(--text)" font-family="var(--font-sans)">Update (částečné)</text>
    <text x="215" y="158" fill="oklch(0.62 0.15 30)">ne (RFC 5789)</text>
    <text x="355" y="158" fill="var(--text)">200 OK / 204</text>
    <rect x="20" y="170" width="520" height="28" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="35" y="188" font-weight="600" fill="oklch(0.55 0.18 340)">DELETE</text>
    <text x="125" y="188" fill="var(--text)" font-family="var(--font-sans)">Delete</text>
    <text x="215" y="188" fill="oklch(0.55 0.18 142)">ano</text>
    <text x="355" y="188" fill="var(--text)">200 OK / 204</text>
    <rect x="20" y="200" width="520" height="28" fill="var(--bg-inset)" stroke="var(--line)"/>
    <text x="35" y="218" font-weight="600" fill="var(--text-muted)">GET/POST</text>
    <text x="125" y="218" fill="var(--text)" font-family="var(--font-sans)">Volání funkce</text>
    <text x="215" y="218" fill="var(--text-muted)">záleží</text>
    <text x="355" y="218" fill="var(--text)">200 OK + data</text>
  </g>
</svg>
:::

**Idempotentní** = opakované provedení dává stejný výsledek jako jednorázové. Důležité pro retry logiku v sítích: GET, PUT a DELETE lze bezpečně opakovat; POST ne, protože by mohl vytvořit duplicitní entitu.

### Status kódy

Nejčastěji používané:

* **200 OK** — úspěch s tělem odpovědi.
* **201 Created** — vytvořen nový zdroj; URL v hlavičce `Location:`.
* **204 No Content** — úspěch bez těla.
* **400 Bad Request** — chybný vstup od klienta.
* **401 Unauthorized** — chybí / neplatné autentizační údaje.
* **403 Forbidden** — autentizován, ale nemá oprávnění.
* **404 Not Found** — zdroj neexistuje.
* **409 Conflict** — pokus o operaci, která porušuje invariant (např. zapsat objednávku v terminálním stavu).
* **500 Internal Server Error** — neošetřená výjimka na serveru.

## JAX-RS — implementace REST v Jakarta EE

JAX-RS je standardizované API pro tvorbu REST endpointů. **Aplikační server samotnou infrastrukturu poskytuje** (registruje JAX-RS *servlet*, řeší routing, deserializaci JSON/XML); my dodáváme pouze třídy s anotacemi.

```java
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.inject.Inject;

@Path("/orders")                              // bázová cesta zdroje
public class OrderResource {

    @Inject
    private OrderService service;             // business vrstva (CDI)

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public OrderDto getOne(@PathParam("id") long id) {
        return service.find(id);              // automatická serializace → JSON
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(OrderDto input) {
        long newId = service.create(input);
        return Response
            .created(URI.create("/orders/" + newId))   // status 201 + Location
            .build();
    }
}
```

Klíčové anotace:

* `@Path(...)` — mapování URL.
* `@GET`, `@POST`, `@PUT`, `@PATCH`, `@DELETE` — výběr HTTP metody.
* `@Produces(...)`, `@Consumes(...)` — MIME typ těla; obvykle `application/json`.
* `@PathParam`, `@QueryParam`, `@HeaderParam` — extrakce parametrů z URL/hlaviček.

## Konfigurace JAX-RS aplikace

JAX-RS aplikaci musíte „přihlásit" — vytvořte třídu odvozenou od `jakarta.ws.rs.core.Application` a anotujte ji **bázovou cestou** API:

```java
import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;

@ApplicationPath("/api")     // např. /api/orders/{id}
public class ApplicationConfig extends Application {
    // nic víc — server objeví resource třídy přes classpath scanning
}
```

## Data Transfer Objects (DTO)

Mezi klientem a serverem se přenášejí *speciálně tvarované* objekty — **DTO** (*Data Transfer Object*). Důvod: chcete oddělit *vnější API* od *vnitřního* datového modelu (entit, viz subtopic [[jpa-persistence]]). DTO může:

* skrýt citlivé sloupce z DB (např. heslo, interní ID),
* sloučit data z více entit do plochého tvaru pro klienta,
* být verzované zvlášť od entit (změna DB neovlivní API).

## Implementace pod kapotou

Specifikaci JAX-RS implementují různé runtime knihovny:

* **Jersey** — referenční implementace, používá ji GlassFish/Payara.
* **Apache CXF** — v TomEE.
* **RESTEasy** — ve WildFly.
* O serializaci/deserializaci JSON se starají knihovny jako **Jackson**, **Gson** nebo **EclipseLink MOXy** — zde nemusíte řešit nic, server si vybere sám.

::: link "Jakarta RESTful Web Services — specifikace" "https://jakarta.ee/specifications/restful-ws/"
:::

::: link "REST API design — best practices (Microsoft)" "https://learn.microsoft.com/azure/architecture/best-practices/api-design"
:::

::: link "RFC 9110 — HTTP Semantics (metody, status kódy)" "https://www.rfc-editor.org/rfc/rfc9110.html"
:::

::: quiz "Klient požádá `POST /api/orders` a vy úspěšně vytvoříte objednávku s id 8235. Která dvojice je idiomatická?"
- [x] Status `201 Created` + hlavička `Location: /api/orders/8235`.
  > Přesně. 201 + Location je standard pro úspěšný POST, který vytvořil nový zdroj.
- [ ] Status `200 OK` + tělo s URL.
  > Tělem klienta neporušíte, ale Location je správný kanál a 201 je sémanticky přesnější.
- [ ] Status `302 Found` + Location.
  > 3xx slouží pro redirecty (klient by udělal druhý GET); pro výsledek operace není vhodný.
:::

::: quiz "Endpoint `/api/objednavky/8235` reaguje jak na `GET`, tak na `DELETE`. Co to znamená?"
- [x] Jedna URL, dvě operace nad týmž zdrojem — `GET` vrátí stav, `DELETE` ho smaže.
  > Ano. REST využívá metodu HTTP k rozlišení operace; URL identifikuje zdroj.
- [ ] Je to chyba v API; každá operace musí mít vlastní URL.
  > Naopak — sdílení URL je správný REST styl.
- [ ] DELETE je v REST zakázáno; má se mazat přes POST.
  > Ne, DELETE je standardní HTTP metoda pro odstranění zdroje (RFC 9110).
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, VUT FIT, část „Webové API — REST rozhraní pomocí JAX-RS".*
