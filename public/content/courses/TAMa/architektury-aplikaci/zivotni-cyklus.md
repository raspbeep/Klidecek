---
title: Životní cyklus aktivit a aplikací
---

Mobilní operační systém spravuje paměť **agresivně**: na rozdíl od desktopu nepředpokládá, že proces poběží, dokud ho uživatel neukončí. Aby udržel popředí svižné, OS aplikace na pozadí pozastavuje a podle potřeby je z paměti vyhazuje — proces s aktivní obrazovkou má nejnižší prioritu k zabití, neviditelný proces nejvyšší. Z toho plyne základní povinnost aplikace: **v každé fázi životního cyklu uvolnit zdroje a uložit stav** tak, aby ho šlo po obnovení nebo znovuvytvoření rekonstruovat. Stav přitom může zmizet nejen při zabití procesu, ale i při běžné **změně konfigurace**, jako je rotace displeje.

## Android — Activity

Aktivita představuje jednu obrazovku a prochází těmito callbacky:

* **`onCreate()`** — jednorázová inicializace instance: načtení uloženého stavu, navázání pohledu (binding). Volá se jen jednou za život instance.
* **`onStart()`** — aktivita se stává **viditelnou** pro uživatele.
* **`onResume()`** — vstupuje do **popředí**, získá focus a je plně interaktivní.
* **`onPause()`** — ztrácí focus, ale **může být ještě částečně viditelná** (např. v multi-window módu nebo pod průhledným dialogem). Volá se rychle — žádné náročné ukládání; jen pozastavit animace a uvolnit zdroje typu senzory/GPS.
* **`onStop()`** — aktivita přestala být **zcela viditelná**. Tady je prostor na CPU-náročnější úklid a ukládání do databáze.
* **`onDestroy()`** — zánik instance: buď protože aktivita končí (`finish()`), nebo kvůli **změně konfigurace**.

Rozdíl `onPause` vs `onStop` je oblíbená zkoušková otázka: **`onPause` = bez focusu, ale možná stále vidět; `onStop` = už vůbec není vidět.** Po `onStop` se aktivita může vrátit přes `onRestart()` → `onStart()` → `onResume()`.

::: viz tama-activity-lifecycle "Vyvolávej události (odchod, návrat, otočení displeje) a sleduj posloupnost callbacků. Rotace projde celým onPause → onStop → onDestroy → onCreate → onStart → onResume."
:::

### Rotace = znovuvytvoření

Při změně konfigurace (typicky rotaci) systém aktivitu **zničí a vytvoří znovu** s novou konfigurací: `onDestroy` → `onCreate`. Naivně držený stav v polích instance se přitom ztratí. Řešení:

* **`ViewModel`** — přežije změnu konfigurace (je svázán s rozsahem, který rotaci „přečká"); ideální pro stav obrazovky a probíhající úlohy.
* **`rememberSaveable`** (Compose) / **`onSaveInstanceState`** — pro malý UI stav (text v poli, pozice scrollu), který přežije i zabití procesu na pozadí (uloží se do `Bundle`).

```kotlin
@Composable
fun SearchScreen(vm: SearchViewModel = viewModel()) {
    // přežije rotaci i zabití procesu (serializuje se do instance state Bundle)
    var query by rememberSaveable { mutableStateOf("") }
    // rozsáhlejší stav a běžící dotazy drží ViewModel — přežije rotaci
    val results by vm.results.collectAsState()
}
```

```kotlin
override fun onStop() {
    super.onStop()
    viewModel.saveDraft()   // náročnější uložení patří sem, ne do onPause
}
```

*(Fragmenty mají obdobný cyklus, navíc s odděleným cyklem pohledu přes `onCreateView()` / `onDestroyView()`.)*

## iOS — UIViewController

Řadič pohledu (`UIViewController`) má vlastní cyklus událostí pohledu:

* **`loadView()` / `viewDidLoad()`** — vytvoření kořenového pohledu a jednorázová inicializace (`viewDidLoad` se volá jednou). Místo pro prvotní nastavení a první načtení dat.
* **`viewWillAppear()` / `viewDidAppear()`** — před a po skutečném zobrazení na displeji. Volají se **při každém** objevení obrazovky — vhodné pro obnovení obsahu a spuštění animací.
* **`viewWillLayoutSubviews()` / `viewDidLayoutSubviews()`** — kolem výpočtu geometrie podpohledů (Auto Layout). Volají se i opakovaně, např. po otočení.
* **`viewWillDisappear()` / `viewDidDisappear()`** — před a po odchodu obrazovky. Místo pro uložení stavu a zrušení senzorů a pozorovatelů.

```swift
override func viewDidLoad() {
    super.viewDidLoad()
    setupUI()          // jednou za život řadiče
}
override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    refreshData()      // při každém objevení obrazovky
}
override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    saveState()        // uložit stav a uvolnit pozorovatele před odchodem
}
```

## iOS — stavy UIScene

Na úrovni celé scény (od iOS 13) řídí přechody **`UISceneDelegate`**. Scéna prochází stavy:

* **Foreground Active** — viditelná a přijímá vstupy uživatele (nejvyšší priorita; `sceneDidBecomeActive`).
* **Foreground Inactive** — viditelná, ale dočasně nepřijímá vstupy (např. při zobrazení Ovládacího centra; `sceneWillResignActive`).
* **Background** — už není vidět; aplikace má **omezený čas** doběhnout úklid, uvolnit RAM a uložit stav (`sceneDidEnterBackground`).
* **Suspended** — proces je v RAM **zmrazen**, nevyužívá CPU. Z tohoto stavu může systém aplikaci **kdykoli vyhodit z paměti**, aby uvolnil zdroje.

::: svg "Stavy UIScene a přechody řízené UISceneDelegate."
<svg viewBox="0 0 540 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="14" y="44" width="112" height="46" rx="8" fill="oklch(0.62 0.14 142 / 0.2)" stroke="oklch(0.5 0.12 142)"/>
  <text x="70" y="64" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text)">Foreground</text>
  <text x="70" y="79" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text)">Active</text>
  <rect x="148" y="44" width="112" height="46" rx="8" fill="oklch(0.62 0.14 65 / 0.2)" stroke="oklch(0.55 0.14 65)"/>
  <text x="204" y="64" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text)">Foreground</text>
  <text x="204" y="79" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text)">Inactive</text>
  <rect x="282" y="44" width="106" height="46" rx="8" fill="oklch(0.62 0.14 264 / 0.2)" stroke="oklch(0.55 0.14 264)"/>
  <text x="335" y="71" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text)">Background</text>
  <rect x="410" y="44" width="112" height="46" rx="8" fill="oklch(0.6 0.18 22 / 0.18)" stroke="oklch(0.55 0.18 22)"/>
  <text x="466" y="71" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text)">Suspended</text>
  <!-- dopředné přechody (po horní hraně) -->
  <line x1="126" y1="60" x2="146" y2="60" stroke="var(--text-muted)" stroke-width="1.3" marker-end="url(#scA)"/>
  <line x1="260" y1="60" x2="280" y2="60" stroke="var(--text-muted)" stroke-width="1.3" marker-end="url(#scA)"/>
  <line x1="388" y1="60" x2="408" y2="60" stroke="var(--text-muted)" stroke-width="1.3" marker-end="url(#scA)"/>
  <!-- zpětný přechod Inactive → Active (po dolní hraně) -->
  <line x1="146" y1="74" x2="126" y2="74" stroke="var(--text-muted)" stroke-width="1.3" marker-end="url(#scA)"/>
  <text x="204" y="118" text-anchor="middle" font-size="9" fill="var(--text-muted)">sceneWillResignActive / sceneDidBecomeActive</text>
  <text x="466" y="118" text-anchor="middle" font-size="9" fill="oklch(0.6 0.18 22)">systém kdykoli uvolní z RAM</text>
  <defs>
    <marker id="scA" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

| Platforma | Vstup do popředí | Plně interaktivní | Ztráta focusu | Mimo dohled | Zmrazení / zánik |
|-----------|------------------|-------------------|---------------|-------------|------------------|
| **Android Activity** | `onStart` | `onResume` | `onPause` | `onStop` | `onDestroy` |
| **iOS UIScene** | (foreground) | Foreground Active | Foreground Inactive | Background | Suspended → vyhozeno |

::: quiz "Po otočení displeje na Androidu se ztratil obsah textového pole. Co se stalo a jak to opravit?"
- [x] Rotace je změna konfigurace → systém aktivitu zničil a znovu vytvořil (onDestroy → onCreate); stav v polích instance se ztratil. Řeší ho ViewModel nebo rememberSaveable.
  > Přesně. ViewModel přežije změnu konfigurace, rememberSaveable navíc i zabití procesu na pozadí.
- [ ] Aktivita byla úplně ukončena uživatelem, takže se stav uložit nedá.
  > Rotace není ukončení uživatelem; je to změna konfigurace, kterou lze přečkat. Mechanismus uloženého stavu se naopak po explicitním finish() neuplatní.
- [ ] Stačí přesunout načtení dat z onCreate do onResume.
  > To nepomůže — problém je ztráta stavu při znovuvytvoření, ne místo, kde se data načítají. Stav je třeba zachovat mimo instanci aktivity.
:::

::: quiz "Co znamená stav Suspended u iOS scény?"
- [x] Proces je zmrazen v RAM, nevyužívá CPU a systém ho může kdykoli vyhodit z paměti, aby uvolnil zdroje.
  > Správně. Proto je nutné uložit stav už při přechodu do pozadí (sceneDidEnterBackground), kdy je na to ještě omezený čas.
- [ ] Aplikace byla uživatelem ukončena a smazána z paměti.
  > Suspended není ukončení — proces stále existuje v RAM, jen zmrazený. K vyhození z paměti může dojít až později, bez varování.
- [ ] Aplikace běží na pozadí a aktivně zpracovává úlohy.
  > To je spíš stav Background s omezeným časem. V Suspended už CPU nepracuje.
:::

::: link "Android Developers — The activity lifecycle" "https://developer.android.com/guide/components/activities/activity-lifecycle"
:::

::: link "Apple — Managing your app's life cycle (UIScene states)" "https://developer.apple.com/documentation/uikit/managing-your-app-s-life-cycle"
:::

::: link "Android Developers — Save UI states (ViewModel, rememberSaveable, onSaveInstanceState)" "https://developer.android.com/topic/libraries/architecture/saving-states"
:::

---

*Zdroj: SZZ NADE — předmět Tvorba aplikací pro mobilní zařízení, VUT FIT. Externí reference: Android Developers (Activity lifecycle, Save UI states), Apple Developer Documentation (Managing your app's life cycle, View controller lifecycle).*
