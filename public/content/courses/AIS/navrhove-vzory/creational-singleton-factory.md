---
title: "Creational: Singleton a Abstract Factory"
---

Vytvářecí (*creational*) vzory řeší jednu otázku: **jak vznikají objekty, aniž se klient váže na jejich konkrétní třídu**. Singleton omezuje *počet* instancí na jednu; Abstract Factory odstiňuje klienta od *konkrétních tříd* celých rodin produktů.

## Singleton

**Záměr:** zajistit, že určitá třída má v celém programu **právě jednu instanci**, a poskytnout k ní jediný globální přístupový bod. Typické použití: konfigurace aplikace, sdílený logger, pool databázových spojení — objekty, které dávají smysl jen v jediném exempláři.

Mechanika stojí na třech prvcích:

* **privátní konstruktor** — nikdo zvenčí nemůže vytvořit instanci přes `new`,
* **privátní statický atribut** držící onu jedinou instanci,
* **veřejná statická metoda `getInstance()`**, která instanci vrací (a při prvním volání případně vytvoří).

::: svg "UML třídy Singleton — privátní ctor, statická instance, statický getInstance()"
<svg viewBox="0 0 280 168" xmlns="http://www.w3.org/2000/svg">
  <rect x="60" y="14" width="160" height="140" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 264)" stroke-width="1.3"/>
  <text x="140" y="33" text-anchor="middle" font-size="13" font-weight="600" fill="var(--text)">Singleton</text>
  <line x1="60" y1="42" x2="220" y2="42" stroke="oklch(0.62 0.14 264)" stroke-width="1"/>
  <text x="68" y="60" font-size="11" font-family="var(--font-mono)" fill="var(--text-muted)">- instance: Singleton</text>
  <text x="68" y="75" font-size="9.5" fill="var(--text-faint)">  {static}</text>
  <line x1="60" y1="84" x2="220" y2="84" stroke="oklch(0.62 0.14 264)" stroke-width="1"/>
  <text x="68" y="102" font-size="11" font-family="var(--font-mono)" fill="var(--text-muted)">- Singleton()</text>
  <text x="68" y="116" font-size="9.5" fill="var(--text-faint)">  privátní konstruktor</text>
  <text x="68" y="135" font-size="11" font-family="var(--font-mono)" fill="oklch(0.50 0.14 264)">+ getInstance(): Singleton</text>
  <text x="68" y="149" font-size="9.5" fill="var(--text-faint)">  {static}</text>
</svg>
:::

```java
public class AppConfig {
    private static AppConfig instance;     // jediná instance

    private AppConfig() { }                // nikdo zvenčí nesmí new

    public static AppConfig getInstance() {
        if (instance == null) {            // lazy inicializace
            instance = new AppConfig();
        }
        return instance;
    }
}

// použití
AppConfig config = AppConfig.getInstance();
```

Tato „učebnicová" verze s líným vytvořením **není bezpečná ve více vláknech**: dvě vlákna mohou současně projít testem `instance == null` a vytvořit dvě instance. Bezpečné varianty:

* **eager (dychtivá) inicializace** — `private static final AppConfig instance = new AppConfig();` (vytvoří se při zavedení třídy, JVM to zaručí jednou),
* **double-checked locking** — dvojitý test s `synchronized` blokem; atribut **musí** být `volatile`, jinak hrozí publikace nezinicializovaného objektu,
* **enum** — jednoprvkový `enum` je v Javě nejjednodušší vláknově bezpečný Singleton odolný i proti serializaci.

Singleton je oblíbený, ale **kontroverzní**: zavádí globální stav, ztěžuje testování (nelze ho snadno nahradit *mockem*) a často skrytě roste do [God Objectu](anti-vzory). Nadužitý Singleton je typickým projevem anti-vzoru *Golden Hammer*.

## Abstract Factory

**Záměr:** poskytnout rozhraní pro vytváření **celých rodin souvisejících produktů**, aniž klient zná jejich konkrétní třídy. Klasický příklad je GUI s vyměnitelným vzhledem: rodina *Windows* (tlačítko, zaškrtávátko, posuvník ve stylu Windows) versus rodina *Mac*. Klient si vyžádá továrnu jednou a všechny produkty, které vyrobí, k sobě **stylem patří**.

::: svg "UML Abstract Factory — továrna i produkt mají rozhraní; klient vidí jen abstrakce"
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg">
  <!-- factory interface -->
  <rect x="16" y="14" width="150" height="40" rx="4" fill="oklch(0.62 0.14 264 / 0.12)" stroke="oklch(0.62 0.14 264)"/>
  <text x="91" y="29" text-anchor="middle" font-size="9.5" font-style="italic" fill="var(--text-muted)">«interface»</text>
  <text x="91" y="46" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">UiFactory</text>
  <!-- concrete factories -->
  <rect x="16" y="110" width="150" height="34" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 264)"/>
  <text x="91" y="131" text-anchor="middle" font-size="11" fill="var(--text)">WindowsFactory</text>
  <rect x="16" y="156" width="150" height="34" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 264)"/>
  <text x="91" y="177" text-anchor="middle" font-size="11" fill="var(--text)">MacFactory</text>
  <line x1="91" y1="110" x2="91" y2="54" stroke="oklch(0.62 0.14 264)" stroke-width="1.2" marker-end="url(#abf-tri)"/>
  <line x1="91" y1="156" x2="91" y2="144" stroke="oklch(0.62 0.14 264)" stroke-width="1.2"/>
  <!-- product interface -->
  <rect x="374" y="14" width="150" height="40" rx="4" fill="oklch(0.62 0.14 142 / 0.12)" stroke="oklch(0.62 0.14 142)"/>
  <text x="449" y="29" text-anchor="middle" font-size="9.5" font-style="italic" fill="var(--text-muted)">«interface»</text>
  <text x="449" y="46" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Button</text>
  <!-- concrete products -->
  <rect x="374" y="110" width="150" height="34" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 142)"/>
  <text x="449" y="131" text-anchor="middle" font-size="11" fill="var(--text)">WindowsButton</text>
  <rect x="374" y="156" width="150" height="34" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 142)"/>
  <text x="449" y="177" text-anchor="middle" font-size="11" fill="var(--text)">MacButton</text>
  <line x1="449" y1="110" x2="449" y2="54" stroke="oklch(0.62 0.14 142)" stroke-width="1.2" marker-end="url(#abf-tri2)"/>
  <line x1="449" y1="156" x2="449" y2="144" stroke="oklch(0.62 0.14 142)" stroke-width="1.2"/>
  <!-- creates dependency -->
  <line x1="166" y1="34" x2="374" y2="34" stroke="var(--text-muted)" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#abf-open)"/>
  <text x="270" y="27" text-anchor="middle" font-size="10" fill="var(--text-muted)" font-style="italic">«create»</text>
  <text x="270" y="48" text-anchor="middle" font-size="10" fill="var(--text-faint)">createButton()</text>
  <defs>
    <marker id="abf-tri" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="11" markerHeight="11" orient="auto"><path d="M0,0 L12,6 L0,12 Z" fill="var(--bg-inset)" stroke="oklch(0.62 0.14 264)"/></marker>
    <marker id="abf-tri2" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="11" markerHeight="11" orient="auto"><path d="M0,0 L12,6 L0,12 Z" fill="var(--bg-inset)" stroke="oklch(0.62 0.14 142)"/></marker>
    <marker id="abf-open" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10" fill="none" stroke="var(--text-muted)"/></marker>
  </defs>
</svg>
:::

```java
public interface Button { void render(); }

public class WindowsButton implements Button {
    public void render() { System.out.println("Windows button"); }
}
public class MacButton implements Button {
    public void render() { System.out.println("Mac button"); }
}

public interface UiFactory {        // abstraktní továrna
    Button createButton();          // (reálně i createCheckbox(), …)
}
public class WindowsFactory implements UiFactory {
    public Button createButton() { return new WindowsButton(); }
}
public class MacFactory implements UiFactory {
    public Button createButton() { return new MacButton(); }
}

// klient zná jen rozhraní UiFactory a Button:
UiFactory factory = osIsMac ? new MacFactory() : new WindowsFactory();
Button button = factory.createButton();
button.render();
```

Klíčové je, že rozhodnutí *„která rodina?"* padne **na jediném místě** (výběr konkrétní továrny). Zbytek aplikace pracuje výhradně s `UiFactory` a `Button` a o konkrétních třídách nic neví — přidání nové rodiny (např. `LinuxFactory`) tak nevyžaduje zásah do klientského kódu.

::: viz ais-abstract-factory "Přepni rodinu produktů. Klient se nemění — vyměníš jen konkrétní továrnu a všechny produkty k sobě stylem patří."
:::

### Abstract Factory vs. Factory Method

Examinátoři rádi zkouší rozdíl proti příbuznému vzoru **Factory Method**:

| | Factory Method | Abstract Factory |
|---|---|---|
| Co vytváří | **jeden** produkt | **rodinu** souvisejících produktů |
| Mechanismus | **dědičnost** — podtřída překryje tovární metodu | **skládání** — klient drží objekt-továrnu a deleguje na něj |
| Forma | jedna metoda v třídě | samostatná hierarchie tříd-továren |

Zjednodušeně: Abstract Factory je často *implementována* sadou Factory Methods (každá `create…()` v rozhraní továrny je tovární metoda).

::: quiz "V čem se liší Abstract Factory od Factory Method?"
- [x] Abstract Factory vytváří celé rodiny souvisejících produktů přes objekt-továrnu (skládání); Factory Method vytváří jeden produkt a varianta se volí děděním.
  > Správně. Abstract Factory je o rodinách a delegaci; Factory Method o jednom produktu a dědičnosti podtřídou.
- [ ] Jsou to dva názvy pro tentýž vzor.
  > Ne. Jsou příbuzné (Abstract Factory bývá realizována sadou tovární metod), ale liší se rozsahem i mechanismem.
- [ ] Factory Method patří mezi behaviorální vzory, Abstract Factory mezi strukturální.
  > Oba jsou creational (vytvářecí) vzory.
:::

::: link "Refactoring.guru — Abstract Factory" "https://refactoring.guru/design-patterns/abstract-factory"
:::

::: link "Refactoring.guru — Singleton (a jeho úskalí)" "https://refactoring.guru/design-patterns/singleton"
:::

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: Design Patterns (GoF, 1994), Refactoring.guru, Effective Java (Bloch) — Singleton přes enum.*
