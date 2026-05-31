---
title: "Behavioral: Strategy a Observer"
---

Behaviorální (*behavioral*) vzory řeší **rozdělení odpovědností a komunikaci mezi objekty**. Strategy odděluje *zaměnitelný algoritmus* od kontextu, který ho používá; Observer zavádí vztah *1:N*, v němž změna stavu jednoho objektu automaticky upozorní mnoho dalších.

## Strategy

**Záměr:** definovat rodinu **zaměnitelných algoritmů**, každý zapouzdřit do samostatné třídy a umožnit jejich **výměnu za běhu**. Místo dlouhého `if-else`/`switch`, který vybírá chování podle typu, drží *kontext* odkaz na rozhraní strategie a deleguje na ně. Příklad: platba — kartou, přes PayPal, kryptem — všechny implementují tutéž operaci `pay()`.

Role: **Strategy** (rozhraní algoritmu, např. `pay()`), **ConcreteStrategy** (konkrétní implementace) a **Context**, který strategii drží přes agregaci a volá ji.

::: svg "UML Strategy — Context drží odkaz na rozhraní Strategy; konkrétní algoritmy z něj dědí"
<svg viewBox="0 0 460 184" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="48" width="130" height="50" rx="4" fill="oklch(0.62 0.16 22 / 0.12)" stroke="oklch(0.62 0.16 22)"/>
  <text x="85" y="68" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">PaymentContext</text>
  <text x="85" y="84" text-anchor="middle" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-muted)">+ pay(amount)</text>
  <rect x="250" y="48" width="160" height="50" rx="4" fill="oklch(0.62 0.14 264 / 0.12)" stroke="oklch(0.62 0.14 264)"/>
  <text x="330" y="64" text-anchor="middle" font-size="9.5" font-style="italic" fill="var(--text-muted)">«interface»</text>
  <text x="330" y="79" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">PaymentStrategy</text>
  <text x="330" y="92" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">+ pay(amount)</text>
  <!-- aggregation: context -> strategy -->
  <line x1="150" y1="73" x2="250" y2="73" stroke="oklch(0.62 0.16 22)" stroke-width="1.3" marker-start="url(#str-dia)" marker-end="url(#str-a)"/>
  <text x="200" y="66" text-anchor="middle" font-size="9.5" fill="var(--text-faint)" font-style="italic">strategy</text>
  <!-- concrete strategies -->
  <rect x="232" y="142" width="92" height="32" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 264)"/>
  <text x="278" y="162" text-anchor="middle" font-size="10.5" fill="var(--text)">CardPayment</text>
  <rect x="336" y="142" width="100" height="32" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 264)"/>
  <text x="386" y="162" text-anchor="middle" font-size="10.5" fill="var(--text)">PayPalPayment</text>
  <line x1="278" y1="142" x2="320" y2="98" stroke="oklch(0.62 0.14 264)" stroke-width="1.2" marker-end="url(#str-tri)"/>
  <line x1="386" y1="142" x2="340" y2="98" stroke="oklch(0.62 0.14 264)" stroke-width="1.2" marker-end="url(#str-tri)"/>
  <defs>
    <marker id="str-dia" viewBox="0 0 16 10" refX="1" refY="5" markerWidth="14" markerHeight="9" orient="auto"><path d="M0,5 L7,0 L14,5 L7,10 Z" fill="var(--bg-inset)" stroke="oklch(0.62 0.16 22)"/></marker>
    <marker id="str-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10" fill="none" stroke="oklch(0.62 0.16 22)"/></marker>
    <marker id="str-tri" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="11" markerHeight="11" orient="auto"><path d="M0,0 L12,6 L0,12 Z" fill="var(--bg-inset)" stroke="oklch(0.62 0.14 264)"/></marker>
  </defs>
</svg>
:::

```java
public interface PaymentStrategy { void pay(double amount); }

public class CardPayment implements PaymentStrategy {
    public void pay(double amount) { System.out.println("Platba kartou: " + amount); }
}
public class PayPalPayment implements PaymentStrategy {
    public void pay(double amount) { System.out.println("Platba přes PayPal: " + amount); }
}

public class PaymentContext {
    private PaymentStrategy strategy;          // drží zvolenou strategii
    public PaymentContext(PaymentStrategy strategy) { this.strategy = strategy; }
    public void setStrategy(PaymentStrategy s)      { this.strategy = s; }   // výměna za běhu
    public void pay(double amount) { strategy.pay(amount); }   // deleguje
}

PaymentContext ctx = new PaymentContext(new CardPayment());
ctx.pay(1000);                       // → kartou
ctx.setStrategy(new PayPalPayment());
ctx.pay(500);                        // → PayPal, beze změny kontextu
```

Místo větvení `if-else` se použije **polymorfismus**: kontext nezná konkrétní algoritmus, jen rozhraní. Přidání nové platby (`CryptoPayment`) nevyžaduje zásah do `PaymentContext` — to je *otevřenost změnám, uzavřenost úpravám* (Open/Closed Principle) v praxi.

## Observer

**Záměr:** definovat závislost **1:N** mezi objekty tak, že když jeden objekt (**Subjekt**) změní stav, **automaticky** jsou o tom uvědoměni a aktualizováni všichni jeho **Pozorovatelé** (*Observers*). Příklad: kanál (subjekt) a jeho odběratelé (pozorovatelé) — zveřejnění videa upozorní všechny odběratele. Stejný princip pohání event listenery v GUI nebo reaktivní datové vazby.

Subjekt vystavuje trojici operací: **`attach(observer)`** (přihlásit pozorovatele), **`detach(observer)`** (odhlásit) a **`notify()`** (uvědomit všechny). Každý pozorovatel implementuje **`update()`**, kterou subjekt při notifikaci zavolá.

::: svg "UML Observer — Subject drží seznam pozorovatelů a při změně volá update() na každém"
<svg viewBox="0 0 460 184" xmlns="http://www.w3.org/2000/svg">
  <rect x="18" y="42" width="150" height="64" rx="4" fill="oklch(0.62 0.16 22 / 0.12)" stroke="oklch(0.62 0.16 22)"/>
  <text x="93" y="60" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Channel (Subject)</text>
  <text x="93" y="76" text-anchor="middle" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-muted)">+ attach(o)  + detach(o)</text>
  <text x="93" y="89" text-anchor="middle" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-muted)">+ notifyObservers(msg)</text>
  <text x="93" y="100" text-anchor="middle" font-size="9" fill="var(--text-faint)">- observers: List</text>
  <rect x="270" y="42" width="170" height="50" rx="4" fill="oklch(0.62 0.14 264 / 0.12)" stroke="oklch(0.62 0.14 264)"/>
  <text x="355" y="58" text-anchor="middle" font-size="9.5" font-style="italic" fill="var(--text-muted)">«interface»</text>
  <text x="355" y="73" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Observer</text>
  <text x="355" y="86" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">+ update(msg)</text>
  <line x1="168" y1="66" x2="270" y2="66" stroke="oklch(0.62 0.16 22)" stroke-width="1.3" marker-start="url(#obs-dia)" marker-end="url(#obs-a)"/>
  <text x="219" y="59" text-anchor="middle" font-size="9.5" fill="var(--text-faint)" font-style="italic">0..*</text>
  <rect x="290" y="142" width="130" height="32" rx="4" fill="var(--bg-card)" stroke="oklch(0.62 0.14 264)"/>
  <text x="355" y="162" text-anchor="middle" font-size="11" fill="var(--text)">Subscriber</text>
  <line x1="355" y1="142" x2="355" y2="92" stroke="oklch(0.62 0.14 264)" stroke-width="1.2" marker-end="url(#obs-tri)"/>
  <defs>
    <marker id="obs-dia" viewBox="0 0 16 10" refX="1" refY="5" markerWidth="14" markerHeight="9" orient="auto"><path d="M0,5 L7,0 L14,5 L7,10 Z" fill="var(--bg-inset)" stroke="oklch(0.62 0.16 22)"/></marker>
    <marker id="obs-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10" fill="none" stroke="oklch(0.62 0.16 22)"/></marker>
    <marker id="obs-tri" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="11" markerHeight="11" orient="auto"><path d="M0,0 L12,6 L0,12 Z" fill="var(--bg-inset)" stroke="oklch(0.62 0.14 264)"/></marker>
  </defs>
</svg>
:::

```java
public interface Observer { void update(String message); }   // pozorovatel

public class Subscriber implements Observer {
    private final String name;
    public Subscriber(String name) { this.name = name; }
    public void update(String message) {
        System.out.println(name + " — notifikace: " + message);
    }
}

public class Channel {                              // Subject
    private List<Observer> observers = new ArrayList<>();
    public void attach(Observer o) { observers.add(o); }
    public void detach(Observer o) { observers.remove(o); }
    public void notifyObservers(String message) {   // 1:N rozeslání
        for (Observer o : observers) o.update(message);
    }
}

Channel ch = new Channel();
ch.attach(new Subscriber("Alice"));
ch.attach(new Subscriber("Bob"));
ch.notifyObservers("Nové video");   // upozorní oba najednou
```

Klíčový přínos: subjekt a pozorovatelé jsou **volně provázáni** — subjekt zná pozorovatele jen přes rozhraní `Observer` a netuší, co s notifikací dělají. Lze přidávat a odebírat pozorovatele za běhu, aniž se subjekt mění. Při zkoušce nezapomeňte na trojici subjektu *attach / detach / notify* a na pozorovatelovu *update*.

::: viz ais-observer-notify "Přidej/odeber odběratele a změň stav subjektu. Sleduj, jak notify() rozešle update() všem připojeným pozorovatelům naráz (vztah 1:N)."
:::

::: quiz "Co charakterizuje vztah mezi Subjektem a Pozorovateli ve vzoru Observer?"
- [x] Vztah 1:N s volnou vazbou — subjekt zná pozorovatele jen přes rozhraní a při změně stavu zavolá update() na všech.
  > Správně. Subjekt vede seznam pozorovatelů (attach/detach) a notify() rozešle update() všem; konkrétní typy nezná.
- [ ] Vztah 1:1, kde pozorovatel pravidelně volá getStav() na subjektu (polling).
  > To je polling, ne Observer. Observer je push: subjekt aktivně notifikuje, a může jich být N.
- [ ] Subjekt dědí z každého pozorovatele a přebírá jeho chování.
  > Ne — subjekt drží pozorovatele přes agregaci, nedědí z nich. Dědičnost je mezi Observer a ConcreteObserver.
:::

::: link "Refactoring.guru — Strategy" "https://refactoring.guru/design-patterns/strategy"
:::

::: link "Refactoring.guru — Observer" "https://refactoring.guru/design-patterns/observer"
:::

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: Design Patterns (GoF, 1994), Refactoring.guru.*
