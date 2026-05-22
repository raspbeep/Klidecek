# Zřetězené transakce — chained transactions

Plochá transakce v rezervaci letenek vystačila s body návratu ([[modely-transakci]]). Reálné podnikové procesy jsou ovšem často **dlouhé sekvence** — typicky *přijetí objednávky → expedice → fakturace*. Pokud takovou sekvenci provedeme jako jednu plochou transakci, narážíme na dvě věci: **dlouho držené zámky** snižují propustnost a **havárie** kdekoli uvnitř zničí veškerou už vykonanou práci. Řešením je **dekompozice na menší podtransakce**.

## Motivace — proč dělit dlouhé transakce

> *„Většina aplikací = sekvence transakcí.”*

- Dlouho trvající transakce **blokují záznamy** (zámky), čímž snižují propustnost systému.
- Při havárii uprostřed dlouhé transakce se **ztratí veškerá provedená práce**.
- Řešením je **dekompozice na menší podtransakce**, které potvrzují svůj výsledek průběžně.

Tato motivace navazuje přímo na dvouúrovňové schéma z [[procesy-uml]]: dlouhý proces *= sekvence menších stavů*, kde každý stav je vlastní transakce.

## Slučování řízení a transakcí

Zajímavé pozorování: pokud sekvence stavů ve **vrstvě řízení** *nemá žádné podmínky na přechodech* (žádné `if`-větvení), pak řízení nic nerozhoduje — jen *sekvencuje* kroky. V takovém případě **obě vrstvy splývají do jedné struktury**: zřetězené transakce.

```
přijetí objednávky → [bez podmínky] → doprava → [bez podmínky] → fakturace
```

Tj. **zřetězená transakce** je v jistém smyslu *projekcí* dvouúrovňového schématu do roviny, kde si můžeme dovolit slít řízení s vykonáváním do jedné lineární struktury.

## Schéma zřetězené transakce

Zřetězená transakce = posloupnost **podtransakcí** $ST_1, ST_2, \ldots, ST_n$, kde $S_i$ je tělo $i$-té podtransakce:

```text
begin_transaction();
    S1;
commit();       // ST1 potvrzena, trvanlivá
    S2;
commit();       // ST2 potvrzena, trvanlivá
    …
    Sn;
commit();       // STn potvrzena
```

- Každé `commit()` zajišťuje **trvanlivost předchozí podtransakce**.
- Při havárii v $ST_i$ zůstávají $ST_1, \ldots, ST_{i-1}$ **zachovány** v databázi.

## Vlastnosti vs. ACID — celek není ACID

Tady přichází *zásadní obchod*: zřetězená transakce **vědomě porušuje** některé ACID vlastnosti za vyšší propustnost:

| Vlastnost | Zřetězená transakce |
| :--- | :--- |
| **Atomičnost** | ❌ pouze každá podtransakce zvlášť — celek není atomický |
| **Konzistence** | ⚠ vyžadována *po každém commitu* (každá $ST_i$ musí konzistenci splnit) |
| **Izolovanost** | ❌ každá podtransakce izolovaná, ale **celek nikoli** |
| **Trvanlivost** | ✅ potvrzené podtransakce jsou trvalé |

Tedy jsme získali rychlost a robustnost vůči haváriím, ale **ztratili jsme celkovou atomičnost a izolovanost**. Pro řadu byznysových procesů je to vyhovující — zákazník přijme, že mezi přijetím objednávky a její expedicí může soubězná transakce vidět stav „přijato, neexpedováno”. Tento kompromis je v moderních distribuovaných systémech kořenem **eventual consistency**, viz [[distribuovane-transakce]].

## Databázový kontext mezi podtransakcemi

Klíčový praktický důsledek: po `commit()` $ST_i$ se **uvolní všechny zámky a kurzory**.

- Souběžné transakce mohou *vidět změny* provedené $ST_i$ a samy je měnit.
- $ST_{i+1}$ tak může pracovat s **jinými hodnotami**, než ukončila $ST_i$ — protože mezitím proběhla cizí transakce.
- Výhoda: **kratší doba zamykání → vyšší propustnost**.
- Nevýhoda: aplikační logika musí počítat s tím, že stav mezi podtransakcemi je „chytatelný” z venku.

### Komunikace mezi podtransakcemi

Pokud potřebují $ST_i$ a $ST_{i+1}$ sdílet stav:

- **Lokální proměnné** v programovém kódu *nepřežijí havárii* (po pádu se ztratí).
- **Databázové proměnné** se před commitem $ST_i$ uloží do DB — přežijí havárii. Nevýhoda: jsou *viditelné* všem souběžným transakcím a vyžadují zamykání nebo verzování.

## Kompenzující transakce — když rollback nestačí

Po potvrzení několika podtransakcí **nelze provést klasický rollback** — fyzické vrácení by porušilo trvanlivost těchto podtransakcí i následných transakcí, které na nich postavily svou práci.

**Řešení:** *kompenzující transakce* — nová transakce, která **logicky obnoví efekt** jiné, již potvrzené transakce.

> *Příklad:* Student se zaregistroval do předmětu (transakce $T$). Pokud se má registrace vrátit, neprovádíme `rollback($T$)`, ale spustíme **kompenzaci $C$ = odregistrace** (sníží počet studentů zpět). Funguje i tehdy, když mezitím proběhla souběžná registrace dalšího studenta — kompenzace s ním nekoliduje.

Kompenzace ale **není vždy prostý opak**: vrácení peněz po odeslaném bankovním převodu má jinou logiku (i daňové dopady) než původní převod. Návrh kompenzací je proto věc *byznysové analýzy*, ne mechanická operace.

Kompenzace tvoří **přímou vazbu na SAGA pattern** — viz [[distribuovane-transakce]], kde se z kompenzací stane standardní mechanismus pro distribuované business transakce v mikroslužbách.

## Alternativní sémantika — chain()

Aby celá zřetězená transakce byla **izolovaná navenek** (souběžné transakce neviděly mezistavy), zavádí se alternativní operace **`chain()`**, která:

- **potvrdí** $ST_i$ (zajistí trvanlivost),
- **začne** $ST_{i+1}$,
- **NEuvolní** databázový kontext (zámky, kurzory).

```text
begin_transaction();
    S1;
chain();        // potvrdí ST1, začne ST2, ale neuvolní kontext
    S2;
chain();        // potvrdí ST2, začne ST3, neuvolní kontext
    …
    Sn;
commit();
```

- Souběžné transakce **nevidí mezistavy** — celek je izolovaný.
- Cena: **horší propustnost** (zámky drží po celou dobu zřetězené transakce).

V Jakarta EE se chování typu `chain()` v praxi realizuje **rozdělením do více volání s `@TransactionAttribute(REQUIRES_NEW)`** — kontejner spustí nezávislou podtransakci automaticky (viz [[transakce-jakarta]]).

## Dopředný návrat (roll forward)

Co když systém zhavaruje uprostřed zřetězené transakce s alternativní (izolovanou) sémantikou — `chain()` už proběhl pro $ST_1, \ldots, ST_{i-1}$, ale $ST_i$ nedoběhla?

- Klasický rollback nelze — předchozí podtransakce jsou trvanlivé.
- **Řešení: dopředný návrat (roll forward)** — po restartu se TPS pokusí *dokončit* nedokončenou podtransakci $ST_i$ a všechny následující.
- Výsledek: zachována izolovanost i celková atomičnost zřetězené transakce.

Tato myšlenka — *„práce, kterou jsme začali, se musí někdy dokončit”* — je přímo motivační pro [[zotavitelne-fronty]].

---

*Zdroj: PIS přednáška 6, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: Gray, J., Reuter, A.: *Transaction Processing: Concepts and Techniques* (1992), kap. 4 (Long-lived transactions); García-Molina, H., Salem, K.: „Sagas” (ACM SIGMOD 1987, [DOI 10.1145/38713.38742](https://dl.acm.org/doi/10.1145/38713.38742)).*
