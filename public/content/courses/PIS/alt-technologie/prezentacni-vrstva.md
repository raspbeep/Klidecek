---
title: Serverová prezentační vrstva — Servlet, JSP, Facelets, JSF
---

Když IS běží na **aplikačním serveru** Jakarta EE, prezentační vrstvu lze řešit dvěma způsoby:

1. **Server vrací jen data** (REST/GraphQL) a o HTML/UI se stará *JS klient* — Angular, React, Vue. Toto je dnešní mainstream a věnoval se mu subtopic [[rest-design]] a [[graphql]].
2. **Server generuje HTML přímo** přes serverový framework — historicky Facelets + JSF, Spring MVC + Thymeleaf, Struts, Vaadin. Tento přístup byl typický pro klasické enterprise IS a stále se vyskytuje v rozsáhlých interních aplikacích.

Druhá cesta — serverová prezentační vrstva v Jakarta EE — má svou specifickou architekturu, kterou rozebírá tato podkapitola.

## Tří-vrstvá architektura Jakarta EE

::: svg "Tři vrstvy Jakarta EE — databáze (JPA), business (EJB/CDI), prezentace (JSF nebo REST + JS klient)"
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="30" width="500" height="44" rx="6" fill="oklch(0.62 0.14 22 / 0.10)" stroke="oklch(0.55 0.18 22)"/>
  <text x="270" y="52" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.18 22)">Prezentační vrstva</text>
  <text x="270" y="68" text-anchor="middle" font-size="11" fill="var(--text)">Facelets + JSF  ⟷  REST/JAX-RS + JS klient (React, Angular…)</text>

  <rect x="20" y="88" width="500" height="44" rx="6" fill="oklch(0.62 0.14 142 / 0.10)" stroke="oklch(0.55 0.18 142)"/>
  <text x="270" y="110" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.18 142)">Business vrstva</text>
  <text x="270" y="126" text-anchor="middle" font-size="11" fill="var(--text)">EJB + CDI (logika, transakce, security)</text>

  <rect x="20" y="146" width="500" height="44" rx="6" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.55 0.18 264)"/>
  <text x="270" y="168" text-anchor="middle" font-size="13" font-weight="600" fill="oklch(0.40 0.18 264)">Databázová vrstva</text>
  <text x="270" y="184" text-anchor="middle" font-size="11" fill="var(--text)">JPA / JDBC / NoSQL klienti</text>

  <text x="270" y="210" text-anchor="middle" font-size="10" fill="var(--text-muted)" font-style="italic">stejný model lze poskytnout přes web UI i přes API</text>
</svg>
:::

## Java Servlet — základ webové vrstvy

**Servlet** je nejnižší stavební prvek webové vrstvy v Jakarta EE. Třída dědící z `jakarta.servlet.http.HttpServlet` přepíše metody `doGet(req, resp)` a `doPost(req, resp)`, které kontejner volá při příchodu HTTP požadavku. Životní cyklus servletu řídí kontejner (Tomcat, Open Liberty, …):

* `init()` — jednorázová inicializace,
* `service()` → `doGet/doPost/doPut/doDelete` — pro každý požadavek,
* `destroy()` — uvolnění při shutdown.

Servlet je *imperativní* — programátor přímo skládá HTML do `PrintWriter`. To je nepraktické pro složitější stránky, proto vznikly *šablonové* technologie nad servletem.

## JSP — Java Server Pages

**JSP** je šablona HTML, do které lze vkládat:

* **Scriptlety** `<% ... %>` — kód Javy přímo,
* **Expression** `<%= expr %>` — výraz vyhodnocený a vypsaný,
* **Direktivy** `<%@ ... %>` — importy, taglib, page,
* **Tag knihovny** `<c:if>`, `<c:forEach>` — JSTL,
* **EL výrazy** `${customer.name}` — Expression Language.

JSP stránku kontejner při prvním požadavku **přeloží na servlet** (Java zdroj), zkompiluje a běh dál pokračuje jako u servletu. JSP tedy *není* interpretovaná — překlad probíhá jednou.

::: svg "Zpracování JSP — překlad na servlet, kompilace, vykonání"
<svg viewBox="0 0 540 130" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="30" width="100" height="50" rx="5" fill="var(--bg-card)" stroke="oklch(0.55 0.18 264)"/>
  <text x="60" y="55" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">stranka.jsp</text>
  <text x="60" y="70" text-anchor="middle" font-size="10" fill="var(--text-muted)">HTML + EL</text>
  <path d="M 115 55 L 155 55" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#a1)"/>
  <text x="135" y="48" text-anchor="middle" font-size="9" fill="var(--text-muted)">překlad</text>
  <rect x="160" y="30" width="100" height="50" rx="5" fill="var(--bg-card)" stroke="oklch(0.55 0.18 142)"/>
  <text x="210" y="55" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">.java servlet</text>
  <text x="210" y="70" text-anchor="middle" font-size="10" fill="var(--text-muted)">vygenerovaný</text>
  <path d="M 265 55 L 305 55" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#a1)"/>
  <text x="285" y="48" text-anchor="middle" font-size="9" fill="var(--text-muted)">javac</text>
  <rect x="310" y="30" width="100" height="50" rx="5" fill="var(--bg-card)" stroke="oklch(0.55 0.18 80)"/>
  <text x="360" y="55" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">.class</text>
  <text x="360" y="70" text-anchor="middle" font-size="10" fill="var(--text-muted)">bytecode</text>
  <path d="M 415 55 L 455 55" stroke="oklch(0.55 0.18 22)" stroke-width="1.5" marker-end="url(#a1)"/>
  <text x="435" y="48" text-anchor="middle" font-size="9" fill="var(--text-muted)">JVM</text>
  <rect x="460" y="30" width="70" height="50" rx="5" fill="var(--bg-card)" stroke="oklch(0.55 0.18 340)"/>
  <text x="495" y="55" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">HTML</text>
  <text x="495" y="70" text-anchor="middle" font-size="10" fill="var(--text-muted)">odpověď</text>
  <text x="270" y="110" text-anchor="middle" font-size="10" fill="var(--text-faint)" font-style="italic">Překlad proběhne jednou při prvním požadavku; další volání už jdou přímo na vykonání servletu.</text>
  <defs>
    <marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.55 0.18 22)"/></marker>
  </defs>
</svg>
:::

## Facelets — moderní šablony pro JSF

JSP se v Jakarta EE pro JSF nepoužívá (od JSF 2.0). Nahradil ho **Facelets** — XHTML šablonovací engine, který:

* Načte XHTML šablonu,
* Vytvoří *objektovou reprezentaci stromu komponent* (JSF UIComponents),
* Umí *kompozice* — base layout (`<ui:composition template="...">`) s redefinovatelnými *insertami* (`<ui:insert name="content">`).

Facelets používá **XML namespaces** pro odlišení tag knihoven:

```xhtml
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:ui="jakarta.faces.facelets"
      xmlns:h="jakarta.faces.html"
      xmlns:f="jakarta.faces.core">

  <ui:composition template="/layout.xhtml">
    <ui:define name="content">
      <h:form>
        <h:inputText value="#{customer.name}"/>
        <h:commandButton value="Uložit" action="#{customer.save}"/>
      </h:form>
    </ui:define>
  </ui:composition>
</html>
```

Tři klíčové namespaces (Jakarta Faces 4.x):

| Prefix | URI | Význam |
|---|---|---|
| `ui` | `jakarta.faces.facelets` | strukturální tagy — composition, define, include |
| `h` | `jakarta.faces.html` | HTML komponenty — inputText, dataTable, form |
| `f` | `jakarta.faces.core` | core funkcionalita — converter, validator, ajax |

## JSF — komponentový MVC framework

**Jakarta Faces** (dříve JSF) je *komponentový* MVC framework nad Facelets. Hlavní pojmy:

* **View** — XHTML šablona (`*.xhtml`),
* **Model** — *managed bean* (`@Named` v CDI, dříve `@ManagedBean`),
* **Controller** — JSF sám: zachytí HTTP request, mapuje na akci beanu, řídí lifecycle.

JSF lifecycle má 6 fází: *Restore View → Apply Request Values → Process Validations → Update Model Values → Invoke Application → Render Response*. Mezi fázemi se dají vkládat *Process Events* (např. validátory, konvertory).

### UI logika v JSF

V XHTML používáme **Expression Language** `#{...}`:

```xhtml
<h:outputText value="Zákazník: #{customer.name}"/>
<h:commandButton action="#{customer.sayHello}" value="Pozdrav"/>
```

`#{customer}` je *managed bean* (typicky `@Named @RequestScoped`/`@SessionScoped`), `.name` je getter, `.sayHello` je metoda s návratovou hodnotou `String` (outcome — viz dále).

### Validátory a konvertory

Jakarta EE poskytuje *deklarativní validaci* (Bean Validation):

```java
@NotNull @Size(min=3, max=50)
private String name;

@Pattern(regexp = "^\\+?[0-9 ]+$")
private String phone;
```

JSF tyto anotace automaticky zohledňuje při zpracování formuláře — při neúspěchu vrátí stránku se chybovým hlášením.

### Nadstavbové komponentové knihovny

Standardní JSF má jen základní komponenty. V praxi se prakticky vždy přidává:

* **[PrimeFaces](https://www.primefaces.org/)** — nejrozšířenější, bohaté komponenty (DataTable, Calendar, Charts, Wizard, …),
* **[OmniFaces](https://omnifaces.org/)** — utility a chybějící drobnosti pro JSF,
* **Apache MyFaces Tobago** — alternativní implementace + komponenty,
* **RichFaces** — historicky populární, dnes *deprecated*.

### Navigace — outcomes

Akční metoda beanu vrací `String` — *outcome*. JSF outcome převede buď na **stejnou stránku** (`null`/prázdný string), **explicitní stránku** (`"detail.xhtml"`), nebo **logické jméno** namapované v `faces-config.xml`:

```xml
<navigation-rule>
  <from-view-id>/login.xhtml</from-view-id>
  <navigation-case>
    <from-outcome>success</from-outcome>
    <to-view-id>/dashboard.xhtml</to-view-id>
    <redirect/>
  </navigation-case>
</navigation-rule>
```

## Kdy JSF, kdy REST + JS klient?

Praktická volba:

* **JSF** — interní enterprise IS, formulářové aplikace, *dataTable*-těžké UI, malý tým, jedna technologie (Java), důraz na typovou bezpečnost serveru. Méně náročné na DevOps (žádný build frontu).
* **REST + JS klient** — moderní UX, mobilní aplikace, public API stejně potřeba, rozdělení týmů na backend/frontend, real-time funkcionalita (WebSocket).

V praxi se obě varianty kombinují — JSF pro back-office, JS klient pro koncového zákazníka.

::: link "Jakarta Faces — specifikace" "https://jakarta.ee/specifications/faces/"
:::

::: link "PrimeFaces — komponentová knihovna" "https://www.primefaces.org/"
:::

::: link "Jakarta Server Pages — specifikace" "https://jakarta.ee/specifications/pages/"
:::

::: quiz "Co je hlavní rozdíl mezi JSP a Facelets?"
- [x] JSP je překládáno na servlet a generuje HTML imperativně; Facelets staví XHTML strom JSF UIComponents, který lze upravovat lifecycle handlery.
  > Ano. Facelets je *deklarativní stromová reprezentace*, zatímco JSP generuje výstup přímo. Proto JSF od verze 2.0 používá Facelets.
- [ ] JSP umí EL, Facelets neumí.
  > Naopak — obě umí EL. Rozdíl je v reprezentaci stránky.
- [ ] Facelets neumí šablony.
  > Právě naopak — `ui:composition`, `ui:define`, `ui:insert` jsou hlavní výhoda Facelets.
:::

::: quiz "Která knihovna je dnes mainstream pro UI komponenty v JSF?"
- [x] PrimeFaces — bohatá sada komponent (DataTable, Calendar, Charts, …).
  > Ano. PrimeFaces je dnes de facto standard pro JSF UI.
- [ ] RichFaces — od JBoss.
  > Bylo populární, ale je *deprecated* od roku 2016.
- [ ] Vaadin — komponenty pro JSF.
  > Vaadin je samostatný framework s vlastní filozofií, není to JSF nadstavba.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, prof. T. Hruška, VUT FIT, část „Java Server Faces" v přednášce „Alternativní technologie a architektury" (slidy 1–17).*
