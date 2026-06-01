---
title: Principy SOLID
---

**SOLID** je pětice fundamentálních principů objektového návrhu, které brání **tuhosti** (změna jedné věci si vynutí změny mnoha dalších), **křehkosti** (změna rozbije nečekaná místa) a špatné **znovupoužitelnosti** kódu. Principy zformuloval Robert C. Martin (na přelomu tisíciletí v eseji *Design Principles and Design Patterns*); samotný *akronym* SOLID poskládal o pár let později z jejich počátečních písmen Michael Feathers.

Zatímco [[grasp]] radí, *kam* přidělit zodpovědnost na úrovni jednotlivého rozhodnutí, SOLID popisuje **vlastnosti dobře strukturovaných tříd a modulů** napříč systémem. Oba pohledy se doplňují — řada SOLID principů jsou důsledky GRASP (např. Open/Closed staví na polymorfismu, DIP na protected variations).

::: svg "Pět principů SOLID"
<svg viewBox="0 0 520 110" xmlns="http://www.w3.org/2000/svg">
  <g font-family="var(--font-mono)">
    <rect x="8"   y="20" width="96" height="70" rx="8" fill="var(--accent)" opacity="0.12" stroke="var(--accent)"/>
    <text x="56"  y="48" text-anchor="middle" font-size="26" font-weight="700" fill="var(--accent)">S</text>
    <text x="56"  y="70" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">Single Resp.</text>
    <rect x="110" y="20" width="96" height="70" rx="8" fill="var(--accent)" opacity="0.12" stroke="var(--accent)"/>
    <text x="158" y="48" text-anchor="middle" font-size="26" font-weight="700" fill="var(--accent)">O</text>
    <text x="158" y="70" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">Open/Closed</text>
    <rect x="212" y="20" width="96" height="70" rx="8" fill="var(--accent)" opacity="0.12" stroke="var(--accent)"/>
    <text x="260" y="48" text-anchor="middle" font-size="26" font-weight="700" fill="var(--accent)">L</text>
    <text x="260" y="70" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">Liskov Subst.</text>
    <rect x="314" y="20" width="96" height="70" rx="8" fill="var(--accent)" opacity="0.12" stroke="var(--accent)"/>
    <text x="362" y="48" text-anchor="middle" font-size="26" font-weight="700" fill="var(--accent)">I</text>
    <text x="362" y="70" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">Interface Seg.</text>
    <rect x="416" y="20" width="96" height="70" rx="8" fill="var(--accent)" opacity="0.12" stroke="var(--accent)"/>
    <text x="464" y="48" text-anchor="middle" font-size="26" font-weight="700" fill="var(--accent)">D</text>
    <text x="464" y="70" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">Dependency Inv.</text>
  </g>
</svg>
:::

## S — Single Responsibility Principle

Třída má mít **právě jeden důvod ke změně** — věnovat se jediné, jasně vymezené úloze. „Důvod ke změně" se váže na *aktéra* / zájmovou skupinu: pokud by třídu chtěli měnit účetní (formát faktury) *i* správce DB (schéma) *i* marketing (text e-mailu), drží tři zodpovědnosti a měla by se rozdělit.

```java
// porušení: tři důvody ke změně v jedné třídě
class Order {
    double calculatePrice() { ... }   // doménová logika
    String toInvoicePdf()   { ... }   // formát faktury
    void   saveToDb()       { ... }   // perzistence
}
// SRP: Order (doména) | InvoiceRenderer (formát) | OrderRepository (perzistence)
```

Je to objektové dvojče GRASP *High Cohesion* a *Pure Fabrication*.

## O — Open/Closed Principle

Moduly mají být **otevřené pro rozšíření, ale uzavřené pro modifikaci**. Nové chování přidáváme **psaním nového kódu** (nová podtřída, nová implementace rozhraní), ne zásahem do už funkčního a otestovaného kódu.

```java
public interface ShippingMethod { double price(double weight); }
// přidání nového dopravce = nová třída, žádná editace ShippingCalculatoru
public class DpdShipping implements ShippingMethod { ... }
```

Klasickým mechanismem OCP je polymorfismus za rozhraním — proto se OCP a GRASP *Polymorphism* / *Protected Variations* tolik překrývají.

## L — Liskov Substitution Principle

Objekt podtřídy musí být **plně zaměnitelný** za objekt nadtřídy: kód, který používá předka, musí bez úprav a bez chyb fungovat i s potomkem. Formálně (Liskov & Wing) jde o *behaviorální podtypování* — potomek **nesmí zesílit předpoklady** (preconditions) a **nesmí zeslabit garance** (postconditions). Jinými slovy: potomek smí přijmout *stejně nebo více* vstupů a slíbit *stejně nebo více* výsledku.

::: math
preconditions_sub ≤ preconditions_super     a     postconditions_sub ≥ postconditions_super
:::

Učebnicový protipříklad: `Square extends Rectangle`. `Rectangle` slibuje, že `setWidth(w)` nezmění výšku. `Square` to poruší (musí držet w = h), takže kód počítající plochu obdélníku se na čtverci chová jinak — podtyp tedy **není** zaměnitelný a LSP je porušen.

```java
Rectangle r = new Square();   // klient čeká chování obdélníku
r.setWidth(5);
r.setHeight(4);
assert r.area() == 20;        // selže: Square si vynutí 4×4 nebo 5×5
```

## I — Interface Segregation Principle

Klienti nemají být **nuceni záviset na metodách, které nepoužívají**. Místo jednoho velkého (*fat*) rozhraní se použije více malých, úzce specializovaných. Implementace pak nemusí dodávat prázdné/výjimkou házející metody, které se jí netýkají.

```java
// porušení: tiskárna musí implementovat i scan/fax, které neumí
interface MultiFunction { void print(); void scan(); void fax(); }

// ISP: drobná rozhraní podle role
interface Printer { void print(); }
interface Scanner { void scan(); }
class SimplePrinter implements Printer { public void print() { ... } }
```

ISP je SRP aplikované na rozhraní — a souzní s GRASP *High Cohesion*.

## D — Dependency Inversion Principle

Moduly **vyšší úrovně abstrakce** nesmějí záviset na modulech nižší úrovně (např. na konkrétním DB driveru); **oba** mají záviset na společných **abstrakcích**. A abstrakce nesmí záviset na detailech — detaily závisí na abstrakcích. Tím se „obrátí" obvyklý směr závislosti.

::: svg "DIP: obě vrstvy závisí na abstrakci, ne nižší na vyšší"
<svg viewBox="0 0 420 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="150" y="10" width="120" height="34" rx="7" fill="var(--accent)" opacity="0.12" stroke="var(--accent)"/>
  <text x="210" y="31" text-anchor="middle" font-size="11" font-weight="600" fill="var(--accent)">OrderService</text>
  <text x="210" y="58" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">vyšší vrstva</text>
  <rect x="140" y="66" width="140" height="30" rx="7" fill="var(--bg-card)" stroke="var(--line-strong)" stroke-dasharray="4 3"/>
  <text x="210" y="85" text-anchor="middle" font-size="10.5" font-style="italic" fill="var(--text)">«interface» Repository</text>
  <rect x="150" y="116" width="120" height="30" rx="7" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="210" y="135" text-anchor="middle" font-size="10.5" fill="var(--text)">JdbcRepository</text>
  <text x="350" y="135" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">detail</text>
  <line x1="210" y1="44" x2="210" y2="64" stroke="var(--accent)" stroke-width="1.5" marker-end="url(#dipA)"/>
  <line x1="210" y1="116" x2="210" y2="98" stroke="var(--text-muted)" stroke-width="1.5" marker-end="url(#dipB)"/>
  <text x="300" y="60" font-size="8.5" fill="var(--text-muted)">závisí ↓</text>
  <text x="300" y="110" font-size="8.5" fill="var(--text-muted)">implementuje ↑</text>
  <defs>
    <marker id="dipA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="var(--accent)"/></marker>
    <marker id="dipB" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto"><path d="M1,1 L11,6 L1,11 Z" fill="none" stroke="var(--text-muted)"/></marker>
  </defs>
</svg>
:::

```java
public interface OrderRepository { void save(Order o); }   // abstrakce

public class OrderService {                                 // vyšší vrstva
    private final OrderRepository repo;                     // závisí na abstrakci
    public OrderService(OrderRepository r) { this.repo = r; }
}
public class JdbcOrderRepository implements OrderRepository { ... } // detail
```

DIP je technický základ *dependency injection* a přímo realizuje GRASP *Protected Variations* na úrovni vrstev.

::: quiz "Třída Square dědí z Rectangle. Volání setWidth(5); setHeight(4) na proměnné typu Rectangle drasticky změní chování. Co je porušeno?"
- [x] Liskov Substitution Principle — podtyp Square není beze zbytku zaměnitelný za Rectangle.
  > Ano. Square zeslabuje garance, které Rectangle dává (nezávislost šířky a výšky), takže kód pracující s Rectangle selže — substituovatelnost neplatí.
- [ ] Single Responsibility Principle — Rectangle má víc důvodů ke změně.
  > SRP je o počtu zodpovědností jedné třídy, ne o zaměnitelnosti podtypu. Problém je v dědičnosti.
- [ ] Interface Segregation Principle — rozhraní je příliš velké.
  > ISP řeší vnucené nepoužívané metody. Tady jde o porušení kontraktu při substituci podtypu, tj. LSP.
:::

::: link "Wikipedia — SOLID" "https://en.wikipedia.org/wiki/SOLID"
:::
::: link "Wikipedia — Liskov substitution principle" "https://en.wikipedia.org/wiki/Liskov_substitution_principle"
:::

### Videa

::: youtube "https://www.youtube.com/watch?v=pTB30aXS77U" "Uncle Bob’s SOLID Principles Made Easy 🍀 - In Python!" "ArjanCodes"
:::

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: Robert C. Martin (Design Principles and Design Patterns; Clean Architecture), Liskov & Wing (behavioral subtyping), Wikipedia.*
