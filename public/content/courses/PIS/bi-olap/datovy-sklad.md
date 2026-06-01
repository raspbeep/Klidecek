# Datový sklad — infrastruktura pro analýzu

V úvodu ([[bi-uvod]]) jsme si vymezili rozdíl mezi OLTP a OLAP. Tato sekce řeší **kde fyzicky leží data**, nad kterými OLAP server pracuje. Klasická odpověď zní: *v datovém skladu (data warehouse)*.

## Inmonova definice

Otcem konceptu je **William H. Inmon**, který v knize *Building the Data Warehouse* (1992) definoval datový sklad jako úložiště se čtyřmi charakteristikami:

> **Datový sklad (Data Warehouse)** je *předmětově orientovaná*, *integrovaná*, *časově závislá* a *neměnná* kolekce dat na podporu rozhodování managementu.

Tyto čtyři vlastnosti tvoří jádro disciplíny — jdou postupně:

### Předmětově orientovaný (Subject-Oriented)

Sklad je organizován podle **předmětů byznysu** — *zákazník, produkt, prodej* — nikoli podle aplikací jako v OLTP. Zatímco OLTP IS má samostatné tabulky pro fakturaci, sklad, CRM, datový sklad sdružuje data o *zákazníkovi* ze všech těchto zdrojů do **jednoho předmětu**.

Důvod: analytik se ptá *„který zákazník nakupuje nejvíc?"*, ne *„který záznam v jaké aplikaci říká co o zákazníkovi?"*.

### Integrovaný (Integrated)

Data ze všech zdrojů jsou **sjednocena**:

- *Jednotné kódování* — pohlaví `M/F` vs `1/0` vs `muž/žena` → jedno schéma.
- *Jednotné měrné jednotky* — Kč vs CZK, kg vs g, datum DD.MM.YYYY vs ISO 8601.
- *Jednotná dimenze času* — všechny zdroje mají časovou osu sladěnou na společný kalendář.

Tato integrace je **práce ETL** (viz dále) — a často je *nejtěžší část* celého BI projektu.

### Časově závislý (Time-Variant)

Sklad uchovává **historii** — ne jen aktuální stav. Každý záznam má *časovou dimenzi*, takže lze ptát se: *„jaký byl stav 31. 12. 2023?"*.

Tomu odpovídá technika **slowly changing dimensions (SCD)** — pro hodnoty, které se v čase mění (např. adresa zákazníka), se uchovává *více verzí* s časem platnosti, nikoli přepis. Detail: Kimballův *SCD typ 2*.

### Neměnný (Non-Volatile)

Data se do skladu **vkládají dávkově** (typicky každou noc) a **nikdy se nemažou ani neupravují**. Operace nad skladem jsou výhradně:

- *INSERT* — nová dávka.
- *SELECT* — analytické dotazy.

Žádné UPDATE, žádné DELETE. Tím se sklad zásadně liší od OLTP.

Toto pravidlo má dva přínosy: (1) *konzistence historie* — zítra dostane analytik stejnou odpověď jako dnes; (2) *zjednodušení optimalizace* — bez UPDATE lze používat agresivní indexy, kompresní techniky a předpočítané agregáty.

## ETL — most mezi OLTP a skladem

**ETL** (*Extract – Transform – Load*) je *proces*, kterým se data dostávají z OLTP zdrojů do skladu. Klasicky se rozkládá na tři fáze:

| Fáze | Co dělá |
| :--- | :--- |
| **Extract** | Stažení dat z různých zdrojů (provozní DB, CRM, externí soubory, API). |
| **Transform** | Čištění, normalizace, sjednocení kódů, agregace na požadovanou granularitu. |
| **Load** | Vložení do skladu — typicky bulk INSERT do faktové tabulky. |

V moderním cloud-native světě se často mluví o **ELT** (*Extract – Load – Transform*) — data se nejdřív načtou *syrová* do *staging area*, a transformace probíhá až v cílovém skladu (Snowflake, BigQuery, Redshift). Důvod: cloudové sklady mají dost výpočetního výkonu, aby transformaci zvládly na své straně, a *syrová záloha* dovoluje znovu transformovat při změně schématu.

Nástroje: **Apache Airflow, dbt, Talend, Microsoft SSIS, Informatica, Fivetran**. Vývoj ETL pipeline je obvykle 60–70 % nákladů BI projektu.

## Granularita dat

**Granularita** = *úroveň detailu*, na které sklad data drží. Příklady:

- *Nejjemnější:* jednotlivá pokladní účtenka (čas s přesností na vteřinu).
- *Hrubší:* denní součet prodejů na produkt a prodejnu.
- *Velmi hrubá:* měsíční tržba na regionu.

Volba granularity je **tradeoff**:

- *Jemnější* → flexibilnější dotazy, ale větší objem (TB → PB).
- *Hrubší* → menší objem, rychlejší dotazy, ale ztratíme schopnost drill-downu na detail.

**Doporučení (Kimball):** držte granularitu *co nejjemnější je rozumné*, protože pak lze agregovat při dotazu (`GROUP BY`). Jakmile data zahodíte (agregujete při loadu), zpět už se k detailu nedostanete.

## Datové trhy (Data Marts)

Vedle celopodnikového datového skladu existují **datové trhy** (*data marts*) — *menší specializované sklady*, optimalizované pro konkrétní oddělení (marketing, finance, HR). Datový trh:

- Obsahuje *podmnožinu* dat z hlavního skladu.
- Je *předagregovaný* na specifickou granularitu.
- Bývá rychlejší pro běžné dotazy oddělení.

Vztah ke skladu závisí na architektuře: *top-down* (Inmon) — sklad jako jediný zdroj pravdy, trhy jsou view; *bottom-up* (Kimball) — trhy jsou stavební bloky, sklad je jejich federace.

## Co je za sklad — multidimenzionální model

Sklad sám o sobě je *fyzické úložiště*. Co OLAP server prezentuje *na výstupu*, je **multidimenzionální kostka** — abstraktní model dat s dimenzemi (čas, region, produkt) a měrami (tržba, počet kusů). V další sekci ([[multidimenzionalni-kostka]]) si tento model formálně definujeme.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=k4tK2ttdSDg" "What is a Data Warehouse?" "IBM Technology"
:::

*Zdroj: PIS přednáška 8, prof. Ing. Tomáš Hruška, CSc., FIT VUT v Brně. Externí reference: Inmon, W.H.: *Building the Data Warehouse* (4. vyd., Wiley 2005); Kimball, R., Ross, M.: *The Data Warehouse Toolkit* (3. vyd., Wiley 2013); [dbt docs](https://docs.getdbt.com/) — moderní ELT framework; [Apache Airflow](https://airflow.apache.org/) — orchestrace ETL pipeline.*
