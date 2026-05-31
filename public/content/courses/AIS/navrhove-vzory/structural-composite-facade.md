---
title: "Structural: Composite a Facade"
---

Strukturální (*structural*) vzory řeší **skládání tříd a objektů do větších celků**. Composite skládá objekty do stromu tak, aby se s jedním i se skupinou pracovalo stejně; Facade naopak schová celou změť tříd za jediné zjednodušené rozhraní.

## Composite

**Záměr:** poskládat objekty do **stromové struktury** reprezentující hierarchii *část–celek* a umožnit klientovi zacházet s jednotlivým objektem (**listem**) i se skupinou objektů (**složeninou**) **naprosto stejně**. Učebnicový příklad: souborový systém — soubor (list) i složka (složenina obsahující další položky) se zobrazí, smažou nebo spočítá jejich velikost přes totéž rozhraní.

Trojice rolí:

* **Component** — společné rozhraní s operací (např. `show()`), kterou umí list i složenina,
* **Leaf** (list) — koncový prvek bez dětí (soubor),
* **Composite** (složenina) — prvek s dětmi (složka); navíc nese metody pro správu dětí (`add()`, `remove()`) a svoji operaci typicky deleguje rekurzivně na děti.

::: svg "UML Composite — Composite drží kolekci Component, takže strom může být libovolně hluboký"
<svg viewBox="0 0 460 188" xmlns="http://www.w3.org/2000/svg">
  <!-- component interface -->
  <rect x="150" y="12" width="160" height="42" rx="4" fill="oklch(0.62 0.14 142 / 0.12)" stroke="oklch(0.62 0.14 142)"/>
  <text x="230" y="27" text-anchor="middle" font-size="9.5" font-style="italic" fill="var(--text-muted)">«interface»</text>
  <text x="230" y="42" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">FileSystemItem</text>
  <text x="230" y="51" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">+ show()</text>
  <!-- leaf -->
  <rect x="40" y="120" width="150" height="50" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 142)"/>
  <text x="115" y="139" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">FileItem</text>
  <text x="115" y="153" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">(list / Leaf)</text>
  <text x="115" y="165" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">+ show()</text>
  <!-- composite -->
  <rect x="270" y="120" width="150" height="58" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 142)"/>
  <text x="345" y="138" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Folder</text>
  <text x="345" y="150" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">(složenina / Composite)</text>
  <text x="345" y="162" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">+ show()  + add(item)</text>
  <text x="345" y="173" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">+ remove(item)</text>
  <!-- inheritance -->
  <line x1="115" y1="120" x2="200" y2="54" stroke="oklch(0.62 0.14 142)" stroke-width="1.2" marker-end="url(#cmp-tri)"/>
  <line x1="345" y1="120" x2="260" y2="54" stroke="oklch(0.62 0.14 142)" stroke-width="1.2" marker-end="url(#cmp-tri2)"/>
  <!-- aggregation diamond from Folder back to Component -->
  <line x1="345" y1="120" x2="300" y2="48" stroke="oklch(0.62 0.14 22)" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#cmp-dia)"/>
  <text x="360" y="92" font-size="10" fill="var(--text-muted)" font-style="italic">0..* dětí</text>
  <defs>
    <marker id="cmp-tri" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="11" markerHeight="11" orient="auto"><path d="M0,0 L12,6 L0,12 Z" fill="var(--bg-inset)" stroke="oklch(0.62 0.14 142)"/></marker>
    <marker id="cmp-tri2" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="11" markerHeight="11" orient="auto"><path d="M0,0 L12,6 L0,12 Z" fill="var(--bg-inset)" stroke="oklch(0.62 0.14 142)"/></marker>
    <marker id="cmp-dia" viewBox="0 0 16 10" refX="14" refY="5" markerWidth="14" markerHeight="9" orient="auto"><path d="M0,5 L7,0 L14,5 L7,10 Z" fill="var(--bg-inset)" stroke="oklch(0.62 0.14 22)"/></marker>
  </defs>
</svg>
:::

```java
public interface FileSystemItem { void show(); }   // Component

public class FileItem implements FileSystemItem {   // Leaf
    public void show() { System.out.println("Soubor"); }
}

public class Folder implements FileSystemItem {     // Composite
    private List<FileSystemItem> items = new ArrayList<>();
    public void add(FileSystemItem item)    { items.add(item); }
    public void remove(FileSystemItem item) { items.remove(item); }
    public void show() {
        for (FileSystemItem item : items)   // rekurze přes děti
            item.show();
    }
}

// klient pracuje stejně se souborem i složkou — přes FileSystemItem
Folder root = new Folder();
root.add(new FileItem());
Folder sub = new Folder();
sub.add(new FileItem());
root.add(sub);          // složka ve složce — strom libovolné hloubky
root.show();
```

Síla vzoru je v **rekurzi**: `Folder.show()` volá `show()` na svých dětech, a ty mohou být zase `Folder`. Klient nemusí ve smyčkách rozlišovat „je to soubor, nebo složka?" — pracuje s jednotným `FileSystemItem`. Tomu se říká **transparentní** varianta: operace pro správu dětí (`add`/`remove`) jsou součástí společného rozhraní, takže se s listem i složeninou zachází uniformně, byť za cenu toho, že `add()` na listu nemá smysl (řeší se výjimkou). *Bezpečná* varianta drží `add`/`remove` jen na `Composite` — pak nelze zavolat nesmysl, ale klient ztrácí uniformitu. GoF preferuje transparentní variantu.

::: viz ais-composite-tree "Klikni na složku a přidej do ní soubor nebo podsložku. Tlačítko show() spustí rekurzivní průchod stromem — vidíš, jak Composite deleguje na děti."
:::

## Facade

**Záměr:** poskytnout **jednotné, zjednodušené rozhraní** (vstupní bránu) ke složitému subsystému tvořenému mnoha spolupracujícími třídami. Klient pak nemusí znát vnitřní třídy, jejich pořadí volání ani vzájemné závislosti — zavolá jednu metodu fasády.

::: svg "Facade — klient vidí jen fasádu; změť tříd subsystému zůstává schovaná"
<svg viewBox="0 0 460 178" xmlns="http://www.w3.org/2000/svg">
  <rect x="14" y="64" width="96" height="44" rx="4" fill="oklch(0.62 0.16 22 / 0.12)" stroke="oklch(0.62 0.16 22)"/>
  <text x="62" y="90" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Client</text>
  <rect x="160" y="58" width="120" height="56" rx="4" fill="oklch(0.62 0.14 264 / 0.12)" stroke="oklch(0.62 0.14 264)"/>
  <text x="220" y="80" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">OrderFacade</text>
  <text x="220" y="98" text-anchor="middle" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-muted)">+ createOrder()</text>
  <line x1="110" y1="86" x2="160" y2="86" stroke="oklch(0.62 0.16 22)" stroke-width="1.4" marker-end="url(#fac-a)"/>
  <!-- subsystem -->
  <rect x="320" y="12" width="128" height="34" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="384" y="33" text-anchor="middle" font-size="11" fill="var(--text-muted)">InventoryService</text>
  <rect x="320" y="72" width="128" height="34" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="384" y="93" text-anchor="middle" font-size="11" fill="var(--text-muted)">PaymentService</text>
  <rect x="320" y="132" width="128" height="34" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="384" y="153" text-anchor="middle" font-size="11" fill="var(--text-muted)">EmailService</text>
  <line x1="280" y1="80" x2="320" y2="29" stroke="oklch(0.62 0.14 264)" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#fac-b)"/>
  <line x1="280" y1="86" x2="320" y2="89" stroke="oklch(0.62 0.14 264)" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#fac-b)"/>
  <line x1="280" y1="92" x2="320" y2="149" stroke="oklch(0.62 0.14 264)" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#fac-b)"/>
  <text x="320" y="174" text-anchor="middle" font-size="9.5" fill="var(--text-faint)" font-style="italic">subsystém — klient sem nevidí</text>
  <defs>
    <marker id="fac-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10" fill="none" stroke="oklch(0.62 0.16 22)"/></marker>
    <marker id="fac-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10" fill="none" stroke="oklch(0.62 0.14 264)"/></marker>
  </defs>
</svg>
:::

```java
// bez fasády musí klient znát a správně poskládat tři služby:
inventory.reserve();
payment.pay();
email.send();

// s fasádou:
public class OrderFacade {
    private InventoryService inventory = new InventoryService();
    private PaymentService   payment   = new PaymentService();
    private EmailService     email     = new EmailService();

    public void createOrder() {     // jeden vstupní bod
        inventory.reserve();
        payment.pay();
        email.send();
    }
}

OrderFacade facade = new OrderFacade();
facade.createOrder();               // klient nezná vnitřní třídy
```

Facade snižuje **provázanost** (*coupling*) klienta se subsystémem — klient závisí jen na fasádě, ne na desítkách vnitřních tříd. Důležité: fasáda subsystém **neuzavírá**. Pokročilý klient může vnitřní třídy stále použít přímo, fasáda mu jen nabízí pohodlnou „zkratku" pro běžné scénáře.

::: quiz "Čím se liší Facade od Composite, když obě skládají více objektů?"
- [x] Composite vytváří stromovou hierarchii část–celek se společným rozhraním listu i složeniny; Facade jen obaluje plochý subsystém jedním zjednodušeným rozhraním.
  > Správně. Composite je o rekurzivní uniformitě stromu, Facade o zjednodušení vstupu do subsystému (žádná rekurze ani „je-část-celku").
- [ ] Jsou to dva názvy pro tentýž strukturální vzor.
  > Ne — liší se záměrem i strukturou. Composite řeší hierarchii, Facade řeší zjednodušení rozhraní.
- [ ] Facade zaručuje jedinou instanci subsystému, Composite vytváří rodiny objektů.
  > To si plete s vytvářecími vzory (Singleton, Abstract Factory). Composite i Facade jsou strukturální.
:::

::: link "Refactoring.guru — Composite" "https://refactoring.guru/design-patterns/composite"
:::

::: link "Refactoring.guru — Facade" "https://refactoring.guru/design-patterns/facade"
:::

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: Design Patterns (GoF, 1994), Refactoring.guru.*
