# Transakční zpracování — opakování a rozšíření

Ve **vrstvě stavů** dvouúrovňového schématu vykonává každý stav obecný proces nad databází. Aby takový proces dovedl IS z jednoho konzistentního stavu do druhého i v přítomnosti souběhu, chyb a havárií, ohraničujeme ho jako **transakci**. Tato podkapitola je krátkým opakováním ACID z předchozího studia (IDS) doplněným o dva přesahující pohledy — kdo *zodpovídá* za jednotlivé vlastnosti, a *jaké jsou důvody zrušení* transakce. Bez tohoto základu nepochopíme, proč pozdější modely (zřetězené, kompenzující, SAGA) od ACID *záměrně* odstupují.

## ACID v kostce

| Vlastnost | Význam | Kdo zajišťuje |
| :--- | :--- | :--- |
| **A** — Atomičnost | Celá transakce, nebo nic; `commit` nebo `rollback`. | **TPS** (Transaction Processing System) |
| **C** — Konzistence | DB splňuje integritní omezení *před* i *po* transakci. | **Programátor** |
| **I** — Izolovanost | Souběžné provádění dává stejný výsledek jako sekvenční (úrovně: `serializable` > `repeatable read` > `read committed` > `read uncommitted`). | TPS |
| **D** — Trvanlivost | Potvrzené změny přežijí havárii (žurnál, zrcadlení). | TPS |

**TPS** je výkonné jádro databázového systému — to, co skutečně provádí commit, rollback, zamykání a zápis do žurnálu (*write-ahead log*). V Jakarta EE je TPS součástí databáze a zároveň Java Transaction API (JTA) — viz [[transakce-jakarta]].

## Kdo co zajišťuje

Klíčový princip, který se táhne celou přednáškou:

- **Programátor zodpovídá za konzistenci.** TPS *neví*, co je z hlediska podnikové logiky správně — jen zaručuje, že buď proběhne celý sled operací (atomičnost), nebo nic. Logiku musí sestavit programátor.
- **TPS zajišťuje atomičnost, izolovanost a trvanlivost** automaticky:
  - atomičnost — mechanismus `commit` / `rollback`,
  - izolovanost — zamykání záznamů, uspořadatelné plány,
  - trvanlivost — žurnál (write-ahead log), zrcadlení.

> *Celý zbytek přednášky se zabývá modely, kde se záměrně od ACID odchylujeme — vždy je důležité vědět, **která vlastnost se porušuje a proč**.*

## Důvody zrušení transakce

Transakce může být zrušena (abortována) z různých příčin. Lze je rozdělit do tří skupin:

**Nepředvídatelné**
- *havárie systému* — výpadek napájení, pád procesu, chyba HW.

**V režii TPS**
- *porušení integritního omezení* (FK, UNIQUE, CHECK),
- *porušení izolovanosti souběžných transakcí* (např. nelze serializovat plán),
- *detekované uváznutí* (deadlock) — TPS jednu z transakcí zruší a uvolní zámky.

**V režii transakce / programátora**
- explicitní `rollback()` na požadavek aplikační logiky (validační chyba, business pravidlo, výjimka).

V Jakarta EE se tento poslední případ realizuje implicitně přes `RuntimeException` v `@Transactional` metodě nebo explicitně přes `EJBContext.setRollbackOnly()` — viz [[transakce-jakarta]].

## Proč potřebujeme pokročilejší modely

Plochá ACID transakce má dvě praktická omezení:

1. **Žádné částečné zotavení** — chyba uprostřed dlouhé sekvence znamená ztrátu *celé* dosavadní práce. Pro některé scénáře (rezervace letenek, plánování trasy s alternativami) je to neúnosné.
2. **Dlouhé transakce blokují záznamy** — čím déle transakce běží, tím delší dobu drží zámky a tím horší je propustnost systému. Při havárii navíc ztratíme veškerou již vykonanou práci.

Z těchto dvou problémů vyrůstají všechny pokročilé modely v této přednášce:

- **Body návratu (savepoints)** a **backtracking** řeší první problém v rámci jedné transakce — viz [[modely-transakci]].
- **Zřetězené transakce** rozdělí dlouhou práci na menší atomické úseky se sníženou izolovaností — viz [[zretezene-transakce]].
- **Distribuované transakce (2PC, SAGA)** rozšiřují atomičnost přes hranice nezávislých TPS — viz [[distribuovane-transakce]].
- **Zotavitelné fronty** oddělí akce v čase a zajistí, že *jednou potvrzená* práce bude *někdy* provedena — viz [[zotavitelne-fronty]].

---

### Videa

::: youtube "https://www.youtube.com/watch?v=GAe5oB742dw" "ACID Properties in Databases With Examples" "ByteByteGo"
:::

*Zdroj: PIS přednáška 6, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: Gray, J., Reuter, A.: *Transaction Processing: Concepts and Techniques* (Morgan Kaufmann, 1992) — kanonická monografie o transakčních modelech.*
