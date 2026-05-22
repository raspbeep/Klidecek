# Podnikové procesy a workflow

Předchozí přednáška ([[procesy-uml]]) skončila u **zotavitelných front** jako mechanizmu zaručujícího, že *„po dokončení jedné akce bude někdy provedena další”*. Tato vlastnost je přesně to, co potřebujeme pro **workflow systémy** — softwarovou vrstvu, která koordinuje a automatizuje **podnikové procesy** napříč organizačními jednotkami, lidmi a aplikacemi. Tato sekce zasazuje workflow do historického vývoje architektur IS a vysvětluje rozdíl mezi *business procesem* a *workflow*.

## Vývoj architektur IS

Evoluci lze ilustrovat jako postupné **osamostatňování** vrstev IS:

| Dekáda | Vývoj |
| :--- | :--- |
| **60. léta** | Řada samostatných aplikací — každá má vlastní data, UI i komunikaci. |
| **70. léta** | Osamostatnění **dat** → databázové systémy. |
| **80. léta** | Osamostatnění **UI** → Windows API, X Window, … |
| **90. léta** | Osamostatnění **řídicích procesů** → **workflow systémy**. |

Workflow je tedy historicky čtvrtá velká dekompozice IS — vedle dat, uživatelského rozhraní a aplikační logiky se nyní *řízení toku procesů* stává samostatnou vrstvou s vlastními nástroji a standardy.

## Co je podnikový (business) proces

Podnikový proces lze definovat čtyřmi vlastnostmi:

- **Koordinační mechanismus** napříč organizačními jednotkami.
- **Distribuovaný v čase a prostoru** — kroky procesu se mohou odehrávat různě dlouho po sobě a na různých místech.
- **Integruje a koordinuje distribuované zdroje** — lidi, aplikace, databáze.
- **Poskytuje správnou informaci správnému člověku ve správný čas.**

Klíčové slovní spojení, které se v této oblasti opakuje, je **„CO – JAK – KDY – KDO"**:

- **CO** se má udělat (jaké úkoly tvoří proces),
- **JAK** se to udělá (jakými kroky),
- **KDY** se to udělá (v jakém pořadí, s jakými podmínkami),
- **KDO** to udělá (role, organizační jednotky, automaticky vs. manuálně).

Z technologického hlediska musí workflow systém poskytnout tři věci:

1. **Popis procesů *mimo* vlastní implementaci IS** — definice procesu je oddělená od kódu aplikace, lze ji měnit bez přeprogramování.
2. **Infrastrukturu schopnou popsané procesy *vykonávat*** — engine, který interpretuje definice a řídí instance.
3. **Doplňkové funkce** — monitorování, analýza, reporting, optimalizace.

## Příklady podnikových procesů

Aby bylo zřejmé, o jakou třídu úloh jde, uvedeme typické scénáře:

- **Vyřízení reklamace** — obdržení požadavku → rozhodnutí o oprávněnosti → odpověď zákazníkovi.
- **Vyřízení žádosti o půjčku** — žádost → analýza rizik → schválení → sledování splátek → uzavření.
- **Zápis studentů do dalšího ročníku** — předběžný zápis → kontrola průchodu studia → zápis → změny.
- **Výběrové řízení na zakázky** — zadání → vyhodnocení nabídek → výběr dodavatele → realizace.

Všechny tyto procesy mají **podobnou strukturu**: jsou *dlouhotrvající* (dny až měsíce), *koordinují více lidí a systémů*, mají *podmíněné větvení* a *vyžadují stopovatelnost a auditovatelnost*.

## Workflow = procedurální automatizace business procesu

**Workflow** je *procedurální automatizace* business procesu. Konkrétně:

- **Spravuje sekvenci pracovních aktivit** a **vyvolává příslušné zdroje** (lidé nebo aplikace).
- Realizuje business proces formou *opakovatelného, řiditelného, monitorovatelného* postupu.

Rozdíl mezi **business procesem** a **workflow** je úrovní pohledu:

| Pojem | Pohled | Příklad |
| :--- | :--- | :--- |
| **Business proces** | Obecnější, *organizační* perspektiva. Co se v podniku děje. | „Vyřízení reklamace zákazníka.” |
| **Workflow** | Konkrétní popis *realizace* procesu, *technická* implementace. | „BPMN model s 12 úlohami, 3 swimlanes, napojení na Slack a ERP.” |

Workflow je tedy *implementační projekce* business procesu. Lze mít business proces popsaný jen v textu (politika, směrnice), zatímco workflow je *spustitelná artefaktová podoba* — typicky BPMN diagram, který interpretuje workflow engine.

V dalších sekcích uvidíme **WfMC referenční architekturu** ([[wfmc-architektura]]), **BPMN 2.0 notaci** ([[bpmn-notace]]) a **workflow patterns** pro typické vzory řízení toku ([[workflow-patterns]]).

---

*Zdroj: PIS přednáška 7 — Workflow systémy, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně, 2025/2026. Externí reference: van der Aalst, W.M.P.: *Process Mining: Data Science in Action* (2. vyd., Springer 2016).*
