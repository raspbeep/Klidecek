---
title: Paralelismus a asynchronní zpracování
---

Mobilní aplikace vykresluje rozhraní na jediném **hlavním (UI) vlákně**, které musí stíhat dodávat snímky zhruba každých 16 ms (60 fps). Jakákoli déletrvající blokující operace — síťový dotaz, čtení z databáze, zpracování obrázku — provedená přímo na tomto vlákně zastaví vykreslování: rozhraní „zatuhne", animace poskakuje a systém může aplikaci označit za nereagující. Cílem asynchronního zpracování je dlouhou práci přesunout mimo UI vlákno, ale výsledek vrátit zpět bezpečně a bez zacyklení v ruční správě vláken.

::: viz tama-ui-thread "Přepni mezi blokující operací na UI vlákně a neblokujícím suspend/await na pozadí. V blokujícím režimu se snímky během operace nestihnou vykreslit (červené = zahozené)."
:::

## Strukturovaná souběžnost

Tradiční ruční správa vláken (vytvoř vlákno, spusť, nezapomeň ho ukončit) je náchylná na únik vláken a osamělé úlohy, které běží i po zániku obrazovky, jež je spustila. Moderní runtime to řeší **strukturovanou souběžností (structured concurrency)**: souběžné úlohy tvoří **strom rodič–potomek**. Rodič počká na dokončení všech potomků a — což je klíčové — **zánik rodiče automaticky zruší všechny jeho potomky**. Když uživatel opustí obrazovku, její rozsah (scope) se zruší a všechny rozběhnuté dotazy se automaticky stornují. Není potřeba ručně sledovat a rušit jednotlivá vlákna.

## Kotlin Coroutines (Android)

Korutina je odložitelný výpočet. Funkce označená **`suspend`** se může v určitém bodě *pozastavit* (suspend) bez toho, aby zablokovala vlákno — vlákno se uvolní pro jinou práci a korutina se později obnoví. To je zásadní rozdíl: *suspend uvolní vlákno, blocking ho drží*. Díky tomu je možné mít tisíce souběžných korutin nad malým fondem vláken.

Kde korutina běží, určuje **Dispatcher**:

* **`Dispatchers.Main`** — hlavní (UI) vlákno; jen pro aktualizaci rozhraní.
* **`Dispatchers.IO`** — fond optimalizovaný pro I/O: síť, soubory, databáze.
* **`Dispatchers.Default`** — fond podle počtu jader pro CPU-náročné výpočty.

```kotlin
// viewModelScope je svázán s životem ViewModelu → při jeho zániku se vše zruší
fun loadProfile() = viewModelScope.launch {          // běží na Main
    _state.value = Loading
    val user = withContext(Dispatchers.IO) {         // přepnutí na IO vlákno
        repository.fetchUser()                        // suspend dotaz, neblokuje
    }
    _state.value = Loaded(user)                       // zpět na Main, bezpečná změna UI
}
```

`launch` spustí úlohu, u které nepotřebuješ návratovou hodnotu (vrací `Job`); `async` vrací `Deferred` a hodnotu získáš přes `await()`. Souběžnost dvou nezávislých dotazů je tak triviální a obě úlohy se zruší společně, pokud zanikne jejich `coroutineScope`.

## Swift async/await (iOS)

Swift používá klíčová slova **`async`** (funkce se může pozastavit) a **`await`** (bod pozastavení). U `await` se vlákno **neblokuje** — vrátí se runtime, který na něm může spustit jinou práci, a úloha se obnoví, až bude výsledek hotov. Práci zapouzdřuje hierarchie **`Task`**, která je nositelem strukturované souběžnosti i **priority** (`.high`, `.userInitiated`, `.default`, `.utility`, `.background`).

```swift
func loadProfile() async {
    state = .loading
    async let user = repository.fetchUser()   // souběžná podúloha
    async let posts = repository.fetchPosts() // běží paralelně s user
    state = .loaded(await user, await posts)   // počká na obě; při zániku scope se zruší
}
```

Sdílený měnitelný stav chrání **aktér (`actor`)**: zaručuje **serializovaný přístup** ke svým datům, takže nemůže dojít k souběhu (data race) — přístup zvenčí je `await`-ovaný a frontovaný, bez nutnosti ručních zámků. Speciální **`@MainActor`** serializuje práci na hlavním vlákně; metody a typy jím označené tak garantovaně běží na UI vlákně, což je správné místo pro aktualizaci rozhraní.

```swift
@MainActor
final class ProfileViewModel: ObservableObject {
    @Published var state: State = .idle   // změny zaručeně na hlavním vlákně
}
```

| Aspekt | Kotlin Coroutines | Swift async/await |
|--------|-------------------|-------------------|
| Pozastavení | `suspend` funkce | `async` / `await` |
| Jednotka úlohy | korutina (`launch`/`async`) | `Task`, `async let`, `TaskGroup` |
| Volba vlákna | `Dispatchers.Main/IO/Default` | runtime fond + `Task(priority:)` |
| Ochrana sdíleného stavu | `Mutex`, omezení dispatcheru | `actor`, `@MainActor` |
| Automatické rušení | zánik `CoroutineScope` | konec rozsahu `Task` |

## Řízení událostmi (event-driven)

Mobilní aplikace jsou řízeny událostmi: vstupy uživatele i systémové události se asynchronně řadí do **aplikační smyčky událostí** a postupně se zpracovávají. Na iOS je to **`RunLoop`**, na Androidu **`Looper`** s frontou zpráv obsluhovanou přes **`Handler`**. Smyčka v cyklu vybírá zprávy z fronty a předává je k obsluze; právě proto nesmí žádný handler běžet dlouho — blokoval by zpracování všech dalších událostí včetně překreslení.

```kotlin
// Android — naplánování práce zpět na UI vlákno přes Handler hlavního Looperu
Handler(Looper.getMainLooper()).post {
    textView.text = "Hotovo"   // poběží na UI vlákně, mezi snímky
}
```

::: quiz "Jaký je rozdíl mezi *pozastavením* korutiny (suspend) a *zablokováním* vlákna?"
- [x] Suspend uvolní vlákno pro jinou práci a korutina se později obnoví; blokování drží vlákno nečinně obsazené.
  > Přesně. Proto lze mít tisíce souběžných korutin nad malým fondem vláken — pozastavená korutina vlákno nedrží.
- [ ] Žádný — obě dělají totéž, jen jinou syntaxí.
  > Liší se zásadně. Blokující operace na UI vlákně zastaví vykreslování; pozastavení vlákno uvolní.
- [ ] Suspend vždy vytvoří nové vlákno, blokování běží na stávajícím.
  > Suspend nové vlákno nevytváří; o to právě jde — pozastavená korutina nesedí na žádném vlákně, dokud se neobnoví.
:::

::: quiz "Proč je výhodné spouštět síťové dotazy v rozsahu svázaném se životním cyklem obrazovky (např. viewModelScope)?"
- [x] Při zániku obrazovky se rozsah zruší a všechny rozběhnuté úlohy se automaticky stornují — to je podstata strukturované souběžnosti.
  > Správně. Odpadá ruční sledování a rušení vláken a nehrozí, že úloha „přežije" obrazovku a sáhne na neexistující UI.
- [ ] Protože dotazy v takovém rozsahu běží rychleji.
  > Rychlost se nemění. Přínos je v automatickém rušení a předvídatelném životním cyklu.
- [ ] Protože jen takové dotazy smí běžet na Dispatchers.IO.
  > IO dispatcher lze použít z libovolného rozsahu. Souvislost s životním cyklem je o rušení, ne o volbě vlákna.
:::

::: link "Kotlin — Coroutines basics (suspend, structured concurrency)" "https://kotlinlang.org/docs/coroutines-basics.html"
:::

::: link "Apple — Concurrency (async/await, Task, actors)" "https://developer.apple.com/documentation/swift/concurrency"
:::

::: link "Android Developers — Kotlin coroutines on Android (dispatchers, scopes)" "https://developer.android.com/kotlin/coroutines"
:::

---

*Zdroj: SZZ NADE — předmět Tvorba aplikací pro mobilní zařízení, VUT FIT. Externí reference: Kotlin coroutines (kotlinlang.org), Apple Developer Documentation (Swift Concurrency), Android Developers (Kotlin coroutines on Android).*
