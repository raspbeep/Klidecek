# Workflow patterns — vzory řízení toku

Když máme BPMN notaci ([[bpmn-notace]]) s aktivitami, branami a událostmi, vyvstává otázka: *jaké kanonické vzory řízení toku se v procesech vlastně objevují?* Tuto otázku zodpověděla skupina kolem **Wil van der Aalsta** ve výzkumu *Workflow Patterns* (TU Eindhoven & QUT, 1999–dnes). Katalog na [workflowpatterns.com](http://workflowpatterns.com) obsahuje desítky vzorů; přednáška se soustřeďuje na **sedm základních** vzorů řízení toku.

## Split, Join, Merge — terminologie

Kromě konkrétních vzorů zavádí přednáška obecnou terminologii:

- **Split** — *rozdělení* toku na více větví.
- **Join / Merge** — *sloučení* více větví do jedné.
- Typy bran: **XOR** (vzájemné vyloučení), **AND** (paralelní), **OR** (inkluzivní).

Jednotlivé vzory pak odpovídají kombinacím split/merge a typů bran.

## 7 základních vzorů

### 1. Sekvence

Pracovní úkol je povolen, *až je dokončen předcházející úkol*. Nejzákladnější vzor, *základ všech procesů*.

```
A → B → C
```

### 2. Parallel Split (AND-split)

Rozděluje tok do **dvou a více paralelních vláken**. Všechny větve jsou spuštěny *současně*. Tři BPMN varianty zápisu — nekontrolovaný tok ze start event, nekontrolovaný tok z aktivity, nebo explicitní brána **+**.

```
        ┌→ B
A → AND ┤
        └→ C
```

### 3. Synchronizace (AND-join)

Navazující úkol začne, *až jsou dokončena všechna* předchozí vlákna. **Párový vzor k AND-split**.

```
B ─┐
   AND → D
C ─┘
```

### 4. Výlučné rozhodnutí (XOR-split)

Rozděluje tok na větve **vzájemně výlučné**. Na základě podmínky se vstupuje do *právě jedné* z větví. V BPMN se kreslí jako brána s **X**.

```
        ┌ [a < 100] → B
A → XOR ┤
        └ [a ≥ 100] → C
```

### 5. Jednoduché spojení (XOR-merge)

Spojení dvou nebo více *nezávislých* větví do jedné. Navazující aktivita začne *okamžitě, jakmile **jedno** vlákno dosáhne konce* — **nemusí čekat** na ostatní větve.

```
A ─┐
   XOR → C
B ─┘
```

XOR-merge je párový vzor k XOR-split: pokud po XOR-split běží *právě jedna* větev, XOR-merge dostane *právě jeden* token a okamžitě pokračuje dále.

### 6. Vícenásobná volba (OR-split)

Rozdělení toku do **jedné nebo více** větví. Výběr na základě podmínek (**neexkluzivně** — může se splnit více podmínek najednou).

V BPMN se kreslí jako brána s **O** (Inclusive Decision Gate).

### 7. Synchronizující sloučení (OR-join)

Čeká na ukončení **všech větví, které byly spuštěny** (ne nutně všech *možných*). Párový vzor k OR-split — *„skončí vše, co začalo".*

Implementace je netriviální — engine musí vědět, *které větve byly aktivovány*, aby věděl, na které čekat. Toto je důvod, proč některé starší enginy OR-join řádně nepodporují a doporučují místo něj kombinace XOR a AND.

::: viz workflow-patterns "Vyber pattern, pak klikni na zvýrazněný obdélník nebo tlačítko ▶ pro „fire transition\". Sleduj, jak se tokeny pohybují."
:::

## Souhrnná tabulka

| # | Vzor | Anglicky | Brána | Sémantika |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Sekvence | Sequence | — | krok po kroku |
| 2 | Parallel Split | AND-split | AND ⊕ | rozdělí na *všechny* paralelní větve |
| 3 | Synchronizace | AND-join | AND ⊕ | čeká na *všechny* vstupní |
| 4 | Výlučné rozhodnutí | XOR-split | XOR ⊗ | vstupuje do *právě jedné* větve |
| 5 | Jednoduché spojení | XOR-merge | XOR ⊗ | první příchozí pokračuje |
| 6 | Vícenásobná volba | OR-split | OR ○ | vstupuje do *jedné nebo více* větví |
| 7 | Synchronizující sloučení | OR-join | OR ○ | čeká na *všechny aktivované* větve |

## Sémantika tokenů — Petriho sítě

Formálně se sémantika BPMN modelů popisuje pomocí **Petriho sítí**. Každá aktivita drží *tokeny*; přechod (brána) se *aktivuje*, když má dost vstupních tokenů, a vyrábí výstupní tokeny podle pravidla brány.

- **AND-split** vyrobí *tokeny pro každou výstupní větev*.
- **AND-join** spotřebuje *po jednom tokenu z každé vstupní větve* a vyrobí jeden výstupní.
- **XOR-split** vyrobí *jeden token do jedné větve* podle podmínky.
- **XOR-merge** *přepošle* token z libovolné vstupní větve.

Tato Petri-síťová sémantika je teoretický základ **verifikace** workflow modelů — viz [[flexibilita-workflow]].

---

*Zdroj: PIS přednáška 7, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: [workflowpatterns.com](http://workflowpatterns.com) — van der Aalst et al., kanonický katalog workflow patterns; OMG BPMN 2.0.2, kap. 13 (Gateways).*
