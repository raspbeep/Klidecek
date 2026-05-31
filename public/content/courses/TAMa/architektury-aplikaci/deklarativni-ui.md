---
title: Imperativní vs. deklarativní UI
---

Mobilní platformy prošly zásadní změnou v tom, *jak* se popisuje uživatelské rozhraní. Starší přístup byl **imperativní** — vývojář vytvořil hierarchii prvků a pak ji krok po kroku měnil. Moderní frameworky jsou **deklarativní** — vývojář popíše, jak má UI vypadat *pro daný stav*, a framework sám zařídí překreslení. Rozdíl není kosmetický: mění se tím, kdo odpovídá za synchronizaci obrazovky s daty.

## Imperativní model a riziko desynchronizace

V imperativním přístupu se hierarchie prvků nejprve navrhne staticky — v **XML layoutu** (Android Views) nebo ve **Storyboardu / XIBu** (UIKit). Z kódu se pak jednotlivé prvky drží přes reference a jejich vlastnosti se mění **settery** v reakci na události.

```kotlin
// Imperativně: musíš ručně synchronizovat každý prvek s každou změnou stavu
fun render(state: UiState) {
    titleView.text = state.title
    counterView.text = state.count.toString()
    if (state.loading) progressBar.visibility = View.VISIBLE
    else progressBar.visibility = View.GONE
    errorView.visibility = if (state.error != null) View.VISIBLE else View.GONE
    // … na každou změnu musíš nezapomenout sáhnout do správného prvku
}
```

Problém je, že **vnitřní stav** (data) a **vizuální stav** (co je opravdu na displeji) jsou dvě oddělené pravdy, které musí vývojář ručně držet v souladu. Stačí přidat novou cestu změny stavu a zapomenout aktualizovat jeden prvek — a UI ukazuje něco jiného, než říkají data. S rostoucím počtem stavů a prvků počet těchto „cest synchronizace" kombinatoricky roste.

## Deklarativní model a recomposition

Deklarativní framework otáčí odpovědnost: vývojář napíše **funkci, která pro daný stav popíše celé UI**. Když se stav změní, framework znovu vyhodnotí popis a **přepočítá jen ty části, jejichž vstup se změnil** — tomuto procesu se říká **recomposition** (Compose) resp. opětovné vyhodnocení `body` (SwiftUI). Vizuální stav je tak vždy odvozen z dat; nemůže se „rozejít".

::: viz tama-recomposition "Změň stav (count nebo title) a sleduj, které composable funkce se přepočítají (recompose) a které framework přeskočí, protože jejich vstup zůstal stejný."
:::

Klíčové je, že popis UI je **deklarace, ne posloupnost příkazů**: neříkáš „nastav text na X", ale „text *je* X pro tento stav". Identita prvků se neudržuje ručně — framework porovná nový popis se stávajícím stromem a aplikuje minimální změny.

## Jetpack Compose (Android)

Compose používá jazyk **Kotlin** a **čisté funkce anotované `@Composable`**. Stav, na který má UI reagovat, se drží v `mutableStateOf` a `remember` (zapamatuje hodnotu napříč rekompozicemi). Čtení takového stavu uvnitř composable funkce ji *přihlásí* ke změnám — když se stav změní, právě tyto funkce se přepočítají. K rozvržení slouží kontejnery `Column` (svisle), `Row` (vodorovně) a `Box` (přes sebe).

```kotlin
@Composable
fun Counter() {
    // remember + mutableStateOf = stav přežije rekompozici; jeho změna ji spustí
    var count by remember { mutableStateOf(0) }

    Column {                                  // svislé uspořádání
        Text("Počet: $count")                 // čte count → překreslí se při změně
        Button(onClick = { count++ }) {       // změna stavu → recomposition
            Text("Přidat")
        }
    }
}
```

## SwiftUI (iOS)

SwiftUI používá jazyk **Swift** a **struktury implementující protokol `View`** s vlastností `body`, která vrací popis hierarchie. Stav vlastněný daným pohledem se značí `@State` (zdroj pravdy), a `@Binding` je *obousměrná reference* na stav vlastněný jinde. Změna `@State` (nebo `@Published`/`@Observable` modelu) způsobí opětovné vyhodnocení `body`. Rozvržení obstarají kontejnery `VStack` (svisle), `HStack` (vodorovně), `ZStack` (přes sebe).

```swift
struct Counter: View {
    @State private var count = 0        // zdroj pravdy vlastněný tímto View

    var body: some View {               // popis UI pro aktuální stav
        VStack {
            Text("Počet: \(count)")
            Button("Přidat") { count += 1 }   // změna @State → překreslení
        }
    }
}

struct Stepper: View {
    @Binding var value: Int             // dvousměrná reference na cizí @State
    var body: some View { Button("+") { value += 1 } }
}
```

Rozdíl `@State` vs `@Binding` je zkušební oblíbenec: `@State` daný pohled stav **vlastní**, `@Binding` ho jen **sdílí** (zapisuje do zdroje pravdy, který drží rodič) — typicky se předá přes `$value`.

| Aspekt | Imperativní (XML/Storyboard + settery) | Deklarativní (Compose / SwiftUI) |
|--------|----------------------------------------|----------------------------------|
| Popis UI | statická hierarchie + ruční mutace | funkce stavu (UI je odvozeno) |
| Synchronizace dat s UI | ruční, riziko desynchronizace | automatická (recomposition) |
| Jazyk / jednotka | XML/Storyboard + Kotlin/Swift | Kotlin `@Composable` / Swift `View` |
| Kontejnery rozvržení | `LinearLayout`, Auto Layout | `Column`/`Row`/`Box`, `VStack`/`HStack`/`ZStack` |
| Stav | reference na prvky | `mutableStateOf`+`remember` / `@State`+`@Binding` |

::: quiz "Proč deklarativní UI snižuje riziko, že obrazovka ukazuje neaktuální data?"
- [x] Vizuální stav je vždy odvozen z dat funkcí UI = f(State); není druhá „pravda", kterou by bylo nutné ručně synchronizovat.
  > Správně. Framework při změně stavu sám překreslí dotčené části (recomposition), takže nemůže vzniknout rozpor mezi daty a obrazovkou.
- [ ] Protože deklarativní frameworky překreslují celé UI při každém snímku.
  > Nepřekreslují vše — recomposition cíleně přepočítá jen části s změněným vstupem. Nižší riziko plyne z odvozenosti, ne z brute-force překreslování.
- [ ] Protože v deklarativním UI nelze používat settery.
  > Settery nejsou zakázané; podstata je, že stav popisuješ deklarativně a o synchronizaci se stará framework.
:::

::: link "Jetpack Compose — Thinking in Compose (deklarativní paradigma, recomposition)" "https://developer.android.com/develop/ui/compose/mental-model"
:::

::: link "SwiftUI — Declaring a custom view / State and data flow" "https://developer.apple.com/documentation/swiftui/state-and-data-flow"
:::

::: link "Jetpack Compose — State and Jetpack Compose (mutableStateOf, remember)" "https://developer.android.com/develop/ui/compose/state"
:::

---

*Zdroj: SZZ NADE — předmět Tvorba aplikací pro mobilní zařízení, VUT FIT. Externí reference: Android Developers (Jetpack Compose — mental model, state), Apple Developer Documentation (SwiftUI state and data flow).*
