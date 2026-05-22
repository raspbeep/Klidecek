# Process mining — objevování procesů z dat

Dosud jsme se v této přednášce dívali na workflow *shora dolů*: nejprve modelujeme proces v BPMN ([[bpmn-notace]]), pak ho nasadíme do enginu, který ho řídí. **Process mining** otáčí směr — z *event logů* skutečných systémů *rekonstruuje*, jak procesy reálně běží. Zakladatelem této disciplíny je opět **Wil van der Aalst** (TU Eindhoven), který v roce 2016 publikoval kanonickou knihu *Process Mining: Data Science in Action*.

## Co je process mining

**Process mining** = automatické *objevování procesů* z **event logů**.

> **Event log** = záznamy z IS nebo workflow enginu ve formě trojic:
>
> ```
> [caseID, aktivita, čas]
> ```

Tj. minimální záznam říká: *„v čase T se v případě C odehrála aktivita A"*. To je vše, co process mining potřebuje, aby z toho odvodil model procesu.

## Tři klíčové úlohy

Process mining má **tři kanonické úlohy**, které dohromady tvoří *zlatou trojici*:

| Úloha | Co dělá | Příklad otázky |
| :--- | :--- | :--- |
| **Discovery** | Rekonstrukce *modelu procesu* z logů. | „Jak vlastně náš proces objednávky vypadá v praxi?" |
| **Conformance checking** | Porovnání skutečného průběhu s formálním BPMN modelem. | „Kde se realita liší od dokumentovaného procesu?" |
| **Enhancement** | Doplnění modelu o výkonnostní metriky. | „Které kroky trvají nejdéle? Kde se hromadí fronty?" |

### Discovery

Klasické algoritmy — **α-algorithm**, **Heuristic Miner**, **Inductive Miner** — analyzují log a *staví* graf aktivit (typicky Petriho síť nebo BPMN). Vstupem je log, výstupem model.

Užitečné, když:

- *Žádná dokumentace* procesu neexistuje — discovery ji vyrobí.
- Dokumentace je *zastaralá* — discovery ukáže, jak proces *opravdu* běží.

### Conformance checking

Conformance vstupuje s *existujícím modelem* a *logem*; výstupem je seznam *odchylek*:

- *Missing events* — aktivita byla v modelu, ale v logu chybí.
- *Extra events* — aktivita byla v logu, ale v modelu chybí.
- *Wrong order* — pořadí aktivit se liší od modelu.

To je užitečné pro:

- **Audit a compliance** — splňuje skutečný proces předepsané postupy?
- **Detekci podvodů** — neobvyklé sekvence aktivit jako červené prapory.

### Enhancement

Discovery i conformance jsou *strukturální*. Enhancement přidává **měření**:

- Průměrná doba trvání každé aktivity.
- Pravděpodobnosti jednotlivých větví.
- Vytížení zdrojů (kdo dělá co a jak dlouho).
- Bottlenecky — místa, kde se hromadí fronty.

Výsledný *anotovaný model* je vstupem pro **optimalizaci** — úzká místa lze refaktorovat, automatizovat, nebo přesměrovat.

## Nástroje

| Nástroj | Charakter | Poznámka |
| :--- | :--- | :--- |
| **ProM** | akademická platforma | TU Eindhoven, van der Aalst — výzkumný nástroj, plugin-architektura. |
| **Celonis** | komerční | Lídr trhu enterprise process mining; integrace s SAP, Oracle. |
| **Disco** | komerční | Fluxicon — uživatelsky přívětivý, vizualizace. |
| **bupaR** (R) / **pm4py** (Python) | open-source | Lehčí Python/R knihovny, hodí se na data science workflow. |

ProM je *vědecký standard* — máte-li akademický kontext, jako první vyzkoušejte ProM. Pro byznysové nasazení (banky, výroba, telekom) je standardem **Celonis**. Pro malé projekty a experimentování stačí **pm4py** v Pythonu.

## Vztah k workflow systémům

Process mining a workflow systémy mají **synergický vztah**:

1. *Workflow engine* (Camunda, Temporal) generuje **event logy** přirozeně — každá změna stavu instance je událost.
2. Process mining nástroj logy analyzuje a *poskytuje zpětnou vazbu* o reálném chování procesu.
3. Tato zpětná vazba vede k **optimalizaci** BPMN modelu (= **5. fáze životního cyklu** z [[wfmc-architektura]] — *Analýza a optimalizace*).
4. Optimalizovaný model se redeployuje a cyklus pokračuje.

Process mining tedy uzavírá **smyčku BPM lifecycle**: definice → nasazení → běh → monitorování → **analýza** → nová definice.

---

*Zdroj: PIS přednáška 7, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: van der Aalst, W.M.P.: *Process Mining: Data Science in Action* (2. vyd., Springer 2016, [DOI 10.1007/978-3-662-49851-4](https://doi.org/10.1007/978-3-662-49851-4)); [Celonis Process Mining](https://www.celonis.com/process-mining/); [pm4py.org](https://pm4py.fit.fraunhofer.de/).*
