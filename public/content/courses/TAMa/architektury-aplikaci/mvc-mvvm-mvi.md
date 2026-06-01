---
title: Architektury MVC, MVVM, MVI
---

Architektury prezentační vrstvy řeší jednu opakující se otázku: *kdo drží stav obrazovky, kdo ho mění a jak se o změně dozví UI?* Mobilní svět se posunul od jednoho objektu, který dělá všechno, přes oddělený testovatelný stavový reprezentant až k čistě jednosměrnému toku dat. Cílem všech tří vzorů je oddělit **doménová data (Model)** od jejich **zobrazení (View)** — liší se v tom, kde sídlí logika a kterým směrem mezi vrstvami teče informace.

## MVC a problém „Massive View Controlleru"

V klasickém MVC (původně z Cocoa Touch na iOS) tvoří trojici **Model** (data), **View** (vizuální prvky) a **Controller** (`UIViewController`). Controller je prostředník: reaguje na akce z View, čte a zapisuje Model a aktualizuje View.

Problém je, že platformní framework Controller k View pevně přivazuje — `UIViewController` vlastní pohled, jeho životní cyklus, navigaci. Vývojář pak do téhož místa přidá i prezentační logiku, síťové dotazy, parsování odpovědí a formátování. Vznikne tzv. **Massive View Controller**: jedna třída o stovkách řádků, kterou nelze rozumně otestovat, protože je svázaná s běžícím UI a systémovým životním cyklem.

::: svg "MVC — Controller se v praxi rozroste do „Massive View Controlleru"."
<svg viewBox="0 0 520 170" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="55" width="120" height="60" rx="8" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="80" y="80" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">View</text>
  <text x="80" y="98" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">prvky UI</text>
  <rect x="200" y="35" width="120" height="100" rx="8" fill="oklch(0.6 0.18 22 / 0.14)" stroke="oklch(0.55 0.18 22)"/>
  <text x="260" y="58" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">Controller</text>
  <text x="260" y="76" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">+ prezentace</text>
  <text x="260" y="90" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">+ síť/parsing</text>
  <text x="260" y="104" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">+ životní cyklus</text>
  <text x="260" y="122" text-anchor="middle" font-size="8.5" fill="oklch(0.55 0.18 22)" font-weight="600">→ Massive VC</text>
  <rect x="380" y="55" width="120" height="60" rx="8" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="440" y="80" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">Model</text>
  <text x="440" y="98" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">doménová data</text>
  <line x1="140" y1="85" x2="198" y2="85" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#mvcA)"/>
  <line x1="200" y1="95" x2="142" y2="95" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#mvcA)"/>
  <line x1="322" y1="85" x2="378" y2="85" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#mvcA)"/>
  <line x1="380" y1="95" x2="324" y2="95" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#mvcA)"/>
  <defs>
    <marker id="mvcA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

## MVVM — ViewModel jako testovatelný stav

MVVM nahrazuje Controller za **ViewModel**: objekt, který drží *stav obrazovky* a prezentační logiku, ale **nezná konkrétní UI prvky**. Nemá referenci na žádné tlačítko ani `TextView`; vystavuje jen pozorovatelné hodnoty. Tím se stává testovatelným v čistém unit testu bez běžícího displeje.

View se na ViewModel napojí přes **reaktivní svázání dat (data binding)** nebo sledováním stavu. Když se hodnota ve ViewModelu změní, framework UI automaticky překreslí. Na Androidu je dnes nositelem stavu typicky `StateFlow` (resp. `LiveData`), na iOS objekt typu `ObservableObject` s `@Published` vlastnostmi (nebo `@Observable` od iOS 17).

```kotlin
// Android — ViewModel vystavuje stav jako StateFlow, nezná žádný View
class CounterViewModel : ViewModel() {
    private val _count = MutableStateFlow(0)
    val count: StateFlow<Int> = _count.asStateFlow()   // jen pro čtení

    fun increment() { _count.value += 1 }              // prezentační logika
}
```

```swift
// iOS — ViewModel jako ObservableObject; @Published spustí překreslení View
class CounterViewModel: ObservableObject {
    @Published private(set) var count = 0
    func increment() { count += 1 }
}
```

Klíčový rozdíl oproti MVC: závislost ukazuje **jen od View k ViewModelu**. ViewModel směrem k View „mluví" pouze přes pozorovatelný stav, ne přímým voláním setterů. Díky tomu lze logiku otestovat samostatně a View je tenká vrstva.

## MVI — jednosměrný tok dat

MVI (Model-View-Intent) je nejpřísnější model: prosazuje **jednosměrný tok dat (Unidirectional Data Flow, UDF)**. Celý běh je smyčka:

* **Intent** — uživatelská akce (záměr) se vyšle jako událost, např. `Increment`.
* **Reducer** — *čistá funkce* vezme aktuální stav a intent a vrátí **nový stav**: `(State, Intent) → State`.
* **State** — jediný neměnný objekt popisující celou obrazovku; jediný zdroj pravdy.
* **View** — vykreslí se jako čistá funkce stavu podle vzorce **UI = f(State)**.

::: math
newState = reduce(oldState, intent),   UI = f(State)
:::

Protože stav je neměnný a reducer čistá funkce, je chování deterministické a snadno se ladí i testuje (stejný vstup → stejný stav). Stav nelze měnit „bokem" přímo z UI — každá změna musí projít celou smyčkou.

::: viz tama-mvi-cycle "Vyšli Intent a sleduj, jak projde reducerem do nového stavu a UI se přerenderuje jako UI = f(State). Tok jde jen po směru cyklu."
:::

| Vzor | Drží stav | Vztah View → logika | Tok dat | Hlavní riziko / přínos |
|------|-----------|---------------------|---------|------------------------|
| **MVC** | Controller | obousměrný, těsná vazba | obousměrný | Massive View Controller, špatná testovatelnost |
| **MVVM** | ViewModel | View pozoruje stav | převážně jednosměrný | testovatelný ViewModel bez UI |
| **MVI** | jeden neměnný State | View posílá Intenty | striktně jednosměrný (UDF) | determinismus, snadné ladění; více „boilerplate" |

## Mikrovzory: Delegate, Data Source, Observer

Vedle architektury celé obrazovky se v mobilních frameworcích opakují tři menší vzory, které řeší komunikaci mezi komponentami bez těsné vazby:

* **Delegate** — objekt deleguje část odpovědnosti na jiný objekt přes protokol/rozhraní (např. `UITableViewDelegate` reaguje na výběr řádku). Volající nezná konkrétní typ delegáta, jen smlouvu.
* **Data Source** — speciální delegát, který *poskytuje data* pro zobrazení (kolik buněk, jak vypadá buňka `i`). Odděluje *co se zobrazí* od *jak se to zobrazí* — typické u tabulek a seznamů.
* **Observer (Pozorovatel)** — komponenta se přihlásí k odběru změn datového toku a je reaktivně notifikována. Je to základ data bindingu v MVVM i MVI (`StateFlow`, `Combine`, `ObservableObject`).

```swift
// Delegate + Data Source — tabulka neví, odkud data jsou, jen se ptá
extension Screen: UITableViewDataSource {
    func tableView(_ t: UITableView, numberOfRowsInSection s: Int) -> Int { items.count }
    func tableView(_ t: UITableView, cellForRowAt ip: IndexPath) -> UITableViewCell { /* … */ }
}
extension Screen: UITableViewDelegate {
    func tableView(_ t: UITableView, didSelectRowAt ip: IndexPath) { open(items[ip.row]) }
}
```

::: quiz "Co konkrétně dělá z MVVM lépe testovatelný vzor než MVC?"
- [x] ViewModel nedrží referenci na konkrétní UI prvky a komunikuje s View jen přes pozorovatelný stav.
  > Přesně. ViewModel jde otestovat v čistém unit testu bez běžícího displeje — stačí ověřit, že po akci má vystavený stav očekávanou hodnotu.
- [ ] ViewModel běží na pozadí, takže testy jsou rychlejší.
  > Vlákno s tím nesouvisí. Testovatelnost plyne z absence vazby na UI, ne z toho, kde kód běží.
- [ ] MVVM nepoužívá Model, takže je co testovat méně.
  > MVVM Model používá; „M" v názvu je právě Model. Rozdíl je v oddělení prezentačního stavu do ViewModelu.
:::

::: quiz "V MVI uživatel klikne na tlačítko. Smí View změnit stav přímo?"
- [ ] Ano, View může stav upravit a pak poslat Intent jako notifikaci.
  > Ne — tím by se porušil jednosměrný tok. Stav by mohly měnit dvě cesty a chování by přestalo být deterministické.
- [x] Ne, View jen vyšle Intent; stav vznikne výhradně v reduceru a vrátí se zpět jako nový State.
  > Správně. Veškerá změna prochází smyčkou Intent → Reducer → State → UI, proto je běh deterministický a dobře laditelný.
- [ ] Smí, pokud jde o čistě vizuální stav bez vlivu na data.
  > MVI drží i UI stav v jediném State objektu; obcházení smyčky by znovu zavedlo dva zdroje pravdy.
:::

::: link "Android Developers — Guide to app architecture (UDF, UI state)" "https://developer.android.com/topic/architecture"
:::

::: link "Apple — Managing model data in your app (ObservableObject, @Published)" "https://developer.apple.com/documentation/swiftui/managing-model-data-in-your-app"
:::

::: link "Kotlin — StateFlow and SharedFlow" "https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/"
:::

---

### Videa

::: youtube "https://www.youtube.com/watch?v=8YPXv7xKh2w" "How to Make a Clean Architecture Note App (MVVM / CRUD / Jetpack Compose) - Android Studio Tutorial" "Philipp Lackner"
:::

*Zdroj: SZZ NADE — předmět Tvorba aplikací pro mobilní zařízení, VUT FIT. Externí reference: Android Developers (Guide to app architecture), Apple Developer Documentation (SwiftUI data flow), Kotlin coroutines StateFlow.*
