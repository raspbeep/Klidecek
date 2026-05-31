---
title: Implementace: Hadoop vs. Spark
---

Programovací model MapReduce (viz [[mapreduce-model]]) má dvě dominantní implementace z ekosystému Apache. **Hadoop** je klasická, diskově orientovaná realizace; **Spark** je novější in-memory engine, který tentýž princip zobecňuje a výrazně zrychluje. Pochopení jejich rozdílu je jádrem této oblasti.

## Apache Hadoop — diskově orientovaná realizace

Hadoop je open-source framework, který staví na dvou vrstvách: distribuovaném úložišti **HDFS** a správci zdrojů **YARN**, nad kterými běží vlastní MapReduce engine.

### HDFS — distribuované úložiště

**HDFS** (Hadoop Distributed File System) ukládá obrovské soubory rozsekané na **bloky** (typicky **128 MB**; ve starších verzích 64 MB) rozprostřené po uzlech clusteru. Architektura je master–slave:

* **NameNode** (master) drží jmenný prostor souborového systému a mapování, *které bloky leží na kterých DataNode* — samotná data jím neprotékají.
* **DataNode** (slave) ukládá fyzické bloky a obsluhuje čtení/zápis; NameNodu posílá heartbeaty a hlášení o blocích.

Kvůli odolnosti se každý blok **replikuje** (výchozí faktor **3×**). Umístění replik řídí **rack awareness** — znalost fyzického rozmístění uzlů do racků. Při faktoru 3 je politika: **1. replika** na lokálním uzlu zapisovatele, **2. replika** na uzlu v *jiném* racku (přežije výpadek celého racku) a **3. replika** na *dalším* uzlu téhož vzdáleného racku (úspora mezirack-ové šířky pásma oproti třetímu racku). Tím se vyvažuje spolehlivost a síťový provoz.

::: svg "Rack-aware umístění 3 replik bloku: replika 1 v lokálním racku, repliky 2 a 3 v jiném racku (na různých uzlech)."
<svg viewBox="0 0 520 200" font-family="var(--font-mono)" font-size="10.5">
  <!-- Rack A -->
  <rect x="20" y="30" width="220" height="150" rx="8" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="130" y="22" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Rack A</text>
  <rect x="40" y="55" width="80" height="46" rx="5" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.6 0.14 142)"/>
  <text x="80" y="74" text-anchor="middle" fill="var(--text)">DataNode 1</text>
  <text x="80" y="90" text-anchor="middle" font-size="9" fill="oklch(0.5 0.14 142)">replika 1</text>
  <rect x="140" y="55" width="80" height="46" rx="5" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="180" y="80" text-anchor="middle" fill="var(--text-muted)">DataNode 2</text>
  <rect x="40" y="118" width="80" height="46" rx="5" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="80" y="143" text-anchor="middle" fill="var(--text-muted)">DataNode 3</text>

  <!-- Rack B -->
  <rect x="280" y="30" width="220" height="150" rx="8" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="390" y="22" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Rack B</text>
  <rect x="300" y="55" width="80" height="46" rx="5" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
  <text x="340" y="74" text-anchor="middle" fill="var(--text)">DataNode 4</text>
  <text x="340" y="90" text-anchor="middle" font-size="9" fill="oklch(0.45 0.14 264)">replika 2</text>
  <rect x="400" y="55" width="80" height="46" rx="5" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.62 0.14 264)"/>
  <text x="440" y="74" text-anchor="middle" fill="var(--text)">DataNode 5</text>
  <text x="440" y="90" text-anchor="middle" font-size="9" fill="oklch(0.45 0.14 264)">replika 3</text>
  <rect x="300" y="118" width="80" height="46" rx="5" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="340" y="143" text-anchor="middle" fill="var(--text-muted)">DataNode 6</text>

  <line x1="120" y1="78" x2="300" y2="78" stroke="var(--text-faint)" stroke-width="0.8" stroke-dasharray="3 3"/>
  <text x="210" y="72" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">mezi racky</text>
</svg>
:::

### YARN — správa zdrojů

Od Hadoopu 2.x odděluje **YARN** (Yet Another Resource Negotiator) správu výpočetních zdrojů od vlastní výpočetní logiky. Plánuje a přiděluje CPU a paměť v clusteru pomocí tří rolí:

* **ResourceManager** (globální) — nejvyšší autorita, která arbitruje zdroje mezi všemi aplikacemi a přiděluje *kontejnery* (CPU/RAM).
* **NodeManager** (na každém uzlu) — spouští a hlídá kontejnery na svém uzlu a hlásí jejich využití ResourceManageru.
* **ApplicationMaster** (na každou aplikaci) — vyjednává kontejnery od ResourceManageru a koordinuje s NodeManagery běh tasků konkrétní úlohy.

### Zásadní nevýhoda — mezivýsledky na disk

Nativní MapReduce v Hadoopu **ukládá mezilehlá data po každé fázi fyzicky na disk** (HDFS mezi joby, lokální disk při shuffle). Pro *iterativní* úlohy — typicky strojové učení, kde se nad týmiž daty opakuje desítky iterací — je opakované čtení a zápis na disk drtivým úzkým hrdlem. Právě tuto bolest řeší Spark.

## Apache Spark — in-memory engine

Spark drží mezivýpočty pokud možno v **operační paměti (RAM)**, takže u iterativních úloh bývá řádově (uvádí se **až ~100×**) rychlejší než diskový Hadoop MapReduce. Není to ale jen „MapReduce v RAM" — Spark přináší obecnější výpočetní model.

### RDD — neměnná distribuovaná kolekce s rodokmenem

Základní abstrakcí je **RDD** (Resilient Distributed Dataset) — *neměnná* (immutable) distribuovaná kolekce rozdělená na partitions. Místo replikování dat pro odolnost si Spark pamatuje **lineage** (rodokmen) — posloupnost transformací, jimiž RDD vzniklo z původních dat. Když uzel spadne, Spark ztracené partitions **dopočítá znovu** z rodokmenu; nemusí udržovat fyzické kopie dat. (Modernější API jsou DataFrame a Dataset nad týmž jádrem.)

### DAG, líné transformace a akce

Spark neomezuje výpočet na jeden Map a jeden Reduce. Řetězí operace do **DAG** (orientovaný acyklický graf) a rozlišuje dva druhy operací:

| | **Transformace** | **Akce** |
| :--- | :--- | :--- |
| Příklad | `map`, `filter`, `reduceByKey`, `join` | `collect`, `count`, `saveAsTextFile` |
| Výsledek | nové RDD | hodnota / zápis do úložiště |
| Vyhodnocení | **líné** (lazy) — jen se přidá do plánu | **spustí** celý dosavadní DAG |

Transformace jsou **líné** — pouze rozšiřují plán, reálně se nic nepočítá. Výpočet se rozběhne až ve chvíli, kdy se zavolá **akce**. To dává plánovači prostor celý DAG optimalizovat (např. spojit filtry, vynechat nepoužité větve).

### Narrow vs. wide závislosti a hranice stage

DAG se před spuštěním rozdělí na **stage**. Hranici určuje typ závislosti mezi partitions:

* **Narrow (úzké) závislosti** — `map`, `filter`, `flatMap`. Každá výstupní partition závisí na *jedné* vstupní; výpočet je lokální, nevyžaduje přesun dat. Spark takové operace **slévá (pipeline) do jediné stage**, kde proběhnou bleskově za sebou.
* **Wide (široké) závislosti** — `reduceByKey`, `groupByKey`, `join`. Výstupní partition závisí na *více* vstupních z různých uzlů, což vynutí **shuffle** (přeskupení dat po síti). Wide operace proto **přestřihne DAG a založí hranici nové stage**.

::: viz pdi-spark-stages "Skládej řetězec transformací. Narrow operace se slévají do jedné stage; každá wide operace (shuffle) přestřihne graf a založí novou stage."
:::

Shuffle ve Sparku je tedy pojmově totéž jako shuffle v MapReduce (viz [[mapreduce-faze]]) — drahá all-to-all synchronizace — jen je zasazen do bohatšího grafu více stage místo do jediné dvojice Map/Reduce.

::: quiz "Spark transformace `map → filter → reduceByKey → map`. Kolik vznikne stage?"
- [ ] Jedna — Spark vše slévá do jednoho průchodu.
  > Ne. reduceByKey je wide operace a vynutí shuffle, čímž graf rozdělí.
- [x] Dvě — řez nastane u reduceByKey (wide/shuffle).
  > Správně. `map → filter` jsou narrow → stage 1; reduceByKey je wide → hranice stage; následný `map` tvoří stage 2.
- [ ] Čtyři — každá transformace je vlastní stage.
  > Ne. Narrow operace se pipelinují do jedné stage; nová stage vzniká jen na hranici shuffle.
:::

::: quiz "Jak Spark obnoví data ztracená pádem uzlu, když RDD nereplikuje?"
- [x] Dopočítá ztracené partitions znovu podle lineage (rodokmenu transformací).
  > Přesně. Neměnnost RDD a uložený rodokmen umožní deterministicky přepočítat jen chybějící partitions z výchozích dat.
- [ ] Načte zálohu z NameNode.
  > NameNode je součást HDFS (Hadoop), netýká se RDD lineage ve Sparku.
- [ ] Spark data ztratí — proto se používá jen na nekritické úlohy.
  > Naopak, „Resilient" v RDD znamená právě odolnost přes přepočet z rodokmenu.
:::

::: link "Apache Spark — RDD Programming Guide" "https://spark.apache.org/docs/latest/rdd-programming-guide.html"
:::

::: link "Apache Hadoop — HDFS Architecture (block size, replication, rack awareness)" "https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html"
:::

::: link "Apache Hadoop — YARN Architecture (ResourceManager, NodeManager, ApplicationMaster)" "https://hadoop.apache.org/docs/stable/hadoop-yarn/hadoop-yarn-site/YARN.html"
:::

---

*Zdroj: SZZ NADE — předmět Prostředí distribuovaných aplikací, VUT FIT. Externí reference: Apache Hadoop dokumentace (HDFS, YARN); Apache Spark RDD Programming Guide; Zaharia, M. et al.: Apache Spark — A Unified Engine for Big Data Processing, CACM 2016.*
