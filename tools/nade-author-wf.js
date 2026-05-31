export const meta = {
  name: 'nade-author',
  description: 'Author Czech exam-prep study content (.md + viz) for the 6 NADE specialization courses',
  phases: [
    { title: 'AIS' }, { title: 'NAV' }, { title: 'PDI' },
    { title: 'TAMa' }, { title: 'UXIa' }, { title: 'WAP' },
  ],
}

const ROOT = '/home/tmokenc/workspace/vut/aio'
const SRC = '/tmp/claude-1000/nade'   // extracted source write-ups: tNN.txt

// ---------------------------------------------------------------------------
// Full decomposition: one entry per topic. Each topic -> one authoring agent.
// ids are PINNED (agents must use them verbatim so the main loop can wire refs).
// ---------------------------------------------------------------------------
const SPEC = [
  // ===== AIS — Analýza a návrh informačních systémů =====
  { course: 'AIS', courseName: 'Analýza a návrh informačních systémů', topic: 'zivotni-cyklus',
    topicTitle: 'Životní cyklus a metodiky vývoje SW', src: ['t01'], examN: 1, subs: [
    { id: 'vodopad-iterativni', title: 'Vodopád, iterativní a inkrementální model', scope: 'Nedostatky vodopádu; iterativní = předělávat/vylepšovat (mini-vodopády v každé iteraci); inkrementální = přidávat funkce; jak se v praxi prolínají.' },
    { id: 'unified-process', title: 'Unified Process (RUP)', scope: 'Iterativní+inkrementální rámec; use-case driven, architecture-centric, risk-driven; 4 fáze Inception/Elaboration/Construction/Transition; hump chart (úsilí disciplín v čase).' },
    { id: 'agilni-vyvoj', title: 'Agilní vývoj — Scrum a Kanban', scope: 'Agilní manifest (4 hodnoty); Scrum (role PO/SM/dev, sprinty 1–4 týdny, daily standup, backlog); Kanban (plynulý tok, WIP limity, tabule To Do/In Progress/Done).' },
    { id: 'mda-agilni-modelovani', title: 'MDA a agilní modelování', scope: 'MDA: vrstvy CIM/PIM/PSM, transformace modelů, oddělení byznysu od technologie. Agile Modeling: model s účelem, travel light, prove it with code, simple tools.' },
  ]},
  { course: 'AIS', courseName: 'Analýza a návrh informačních systémů', topic: 'uml',
    topicTitle: 'Modelovací techniky UML', src: ['t02'], examN: 2, subs: [
    { id: 'uml-charakteristika-rozsiritelnost', title: 'Charakteristika UML a rozšiřitelnost', scope: 'UML jako standard OMG (sjednocení Booch/OMT/OOSE); není metodika, je notace; náčrt/plán/jazyk. Rozšiřitelnost: stereotypy («…»), tagged values {k=v}, omezení (OCL, {balance>=0}), profily.' },
    { id: 'strukturni-diagramy', title: 'Strukturní diagramy', scope: 'Diagram tříd (třída = 3 oddíly; vztahy asociace/agregace prázdný kosočtverec/kompozice plný kosočtverec/generalizace; multiplicita 1..*). Diagram komponent (poskytované „lízátko“/požadovaná „zásuvka“ rozhraní, porty). Diagram nasazení (uzly + artefakty).' },
    { id: 'diagramy-chovani', title: 'Diagramy chování', scope: 'Use case (aktér, případ užití, include/extend/generalizace). Aktivit (akce, hrany, fork/join). Stavový (stavy, přechody, události). Sekvenční (lifelines, zprávy shora dolů, kombinované fragmenty).' },
  ]},
  { course: 'AIS', courseName: 'Analýza a návrh informačních systémů', topic: 'pozadavky',
    topicTitle: 'Získávání a modelování požadavků', src: ['t03'], examN: 3, subs: [
    { id: 'evoluce-pozadavku', title: 'Evoluce požadavků', scope: 'Vodopád zmrazí požadavky vs evoluční/iterativní přístup; statistiky (~25 % požadavků se mění; ~65 % předem specifikovaných funkcí přináší málo hodnoty); začít s 10–20 % rizikových/architektonicky významných.' },
    { id: 'furps-plus', title: 'Model FURPS+', scope: 'F (funkčnost), U (použitelnost), R (spolehlivost, MTBF), P (výkon), S (udržovatelnost) + dodatečná omezení (implementační, rozhraní, OS/balení, právní). Funkční vs nefunkční požadavky (atributy kvality).' },
    { id: 'techniky-elicitace', title: 'Techniky získávání požadavků', scope: 'Rozhovory, workshopy, průzkumy, prototypování (HTML modely UI), persony a mapování cest. Účel: odhalit a vyřešit protichůdné požadavky.' },
    { id: 'use-case-model', title: 'Use Case model a artefakty UP', scope: 'Artefakty UP (Vize, Use-Case Model, Doplňková specifikace, Slovník, Obchodní pravidla; naplněnost dle fáze). Tvorba use case modelu: aktér/případ užití, scénáře brief/casual/fully-dressed (preconditions, postconditions, basic/alternative flow), black-box styl.' },
  ]},
  { course: 'AIS', courseName: 'Analýza a návrh informačních systémů', topic: 'oo-navrh',
    topicTitle: 'Objektově orientovaný návrh', src: ['t04'], examN: 4, subs: [
    { id: 'oo-podstata', title: 'Podstata OO návrhu, vstupy a výstupy', scope: 'OOD = most analýza→implementace; 4 principy (abstrakce, zapouzdření, dědičnost, polymorfismus). Vstupy: use cases, doménový model, systémové sekvenční diagramy, doplňkové specifikace. Výstupy: interakční diagramy, designový diagram tříd (DCD), návrh datové vrstvy, stavové diagramy.' },
    { id: 'rdd-crc', title: 'Návrh řízený zodpovědností a CRC karty', scope: 'RDD (Wirfs-Brock): knowing vs doing; role/stereotypy (information holder, service provider, coordinator, controller); klient-server kontrakty; CRC karty (Class/Responsibilities/Collaborators); delegované vs centralizované řízení.' },
    { id: 'grasp', title: 'Principy GRASP', scope: '9 principů (Larman): Information Expert, Creator, Controller, Low Coupling, High Cohesion, Polymorphism, Pure Fabrication, Indirection, Protected Variations — s konkrétními příklady z e-shopu (Order/OrderLine/Product, PaymentGateway, ShippingMethod).' },
    { id: 'solid', title: 'Principy SOLID', scope: '5 principů (R. C. Martin): Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. Vysvětlit každý + krátký příklad.' },
  ]},
  { course: 'AIS', courseName: 'Analýza a návrh informačních systémů', topic: 'navrhove-vzory',
    topicTitle: 'Návrhové vzory', src: ['t05'], examN: 5, subs: [
    { id: 'vzory-podstata', title: 'Podstata a kategorie návrhových vzorů', scope: 'Co je návrhový vzor (ověřené řešení opakovaného problému, ne hotový kód); význam (rychlost, společný slovník týmu); kategorie creational/structural/behavioral (GoF).' },
    { id: 'creational-singleton-factory', title: 'Creational: Singleton a Abstract Factory', scope: 'Singleton (privátní konstruktor, statická instance, getInstance) — Java + UML. Abstract Factory (rodiny souvisejících produktů bez znalosti konkrétních tříd) — Java (UiFactory/Button) + UML.' },
    { id: 'structural-composite-facade', title: 'Structural: Composite a Facade', scope: 'Composite (stromová struktura část-celek, jednotná práce s listem i složeninou — soubory/složky) + UML. Facade (zjednodušené rozhraní ke složitému subsystému) + UML.' },
    { id: 'behavioral-strategy-observer', title: 'Behavioral: Strategy a Observer', scope: 'Strategy (zaměnitelné algoritmy za běhu — platební strategie) + UML. Observer (vztah 1:N, subjekt notifikuje pozorovatele — attach/notify/update) + UML.' },
    { id: 'anti-vzory', title: 'Návrhové anti-vzory', scope: 'Podstata a význam anti-vzorů (varovný signál, technický dluh); God Object, Spaghetti Code, Golden Hammer — popis + jak refaktorovat.' },
  ]},
  { course: 'AIS', courseName: 'Analýza a návrh informačních systémů', topic: 'kvalita-kodu',
    topicTitle: 'TDD, refaktorizace a správa kódu', src: ['t06'], examN: 6, subs: [
    { id: 'tdd', title: 'Návrh řízený testem (TDD)', scope: 'Cyklus red-green-refactor (napsat test → selhání → minimální kód → zelená → refaktor); přínos: regresní záchranná síť, lepší návrh rozhraní; nevýhody (počáteční zpomalení, chyby v testech).' },
    { id: 'refaktorizace', title: 'Refaktorizace', scope: 'Změna vnitřní struktury beze změny vnějšího chování; code smells; malé kroky + sada testů; princip dvou klobouků (přidávat funkci NEBO refaktorovat, ne obojí); pravidlo tří.' },
    { id: 'vlastnictvi-kodu', title: 'Vlastnictví kódu v týmu', scope: 'Modely: žádné/silné(individuální)/slabé/kolektivní (CCO); výhody CCO (zastupitelnost, vyšší kvalita); souvislosti (standardy kódování, TDD, CI, párové programování).' },
    { id: 'vetveni-git', title: 'Repozitáře a větvení', scope: 'Lineární vs větvená historie; feature branching (izolace, slučování zpět) vs Trunk Based Development (jedna větev, malé časté změny, feature toggles); merge konflikty; nároky na automatizované testy.' },
  ]},

  // ===== NAV — Návrh vestavěných systémů =====
  { course: 'NAV', courseName: 'Návrh vestavěných systémů', topic: 'vestavene-systemy',
    topicTitle: 'Vestavěný vs. univerzální systém', src: ['t07'], examN: 7, subs: [
    { id: 'gpcs-vs-embedded', title: 'Vymezení a společné znaky', scope: 'GPCS (flexibilita, libovolný SW, interakce s uživatelem) vs vestavěný systém (specifická funkce, autonomní, v pozadí). Shody: CPU/RAM/ROM, I/O, vykonávání instrukcí.' },
    { id: 'architektura-odlisnosti', title: 'Klíčové odlišnosti', scope: 'MPU vs MCU/SoC; Von Neumann vs Harvard (paralelní čtení instrukce+dat, determinismus); rozhraní GUI vs senzory/aktuátory (SPI/I2C/UART); GPOS (propustnost, fair-share) vs RTOS (determinismus, prioritní preempce, deadline); omezení zdrojů; spolehlivost (watchdog, -40..85 °C, životnost 10–20 let); cross-development, C/C++/ASM.' },
  ]},
  { course: 'NAV', courseName: 'Návrh vestavěných systémů', topic: 'hw-sw-codesign',
    topicTitle: 'Implementace funkcí SW a HW prostředky', src: ['t08'], examN: 8, subs: [
    { id: 'partitioning', title: 'HW/SW co-design a partitioning', scope: 'Hardware-Software Partitioning (HSP) — rozhodnutí co realizovat SW (CPU) vs HW (ASIC/FPGA); co-design (paralelní vývoj); NP-těžký problém, exaktní (MILP) nebo heuristiky (GA, PSO); kritéria čas/energie/plocha.' },
    { id: 'sw-vs-hw-implementace', title: 'SW vs. HW implementace — dopady', scope: 'SW (sekvenční fetch-decode-execute; flexibilita/OTA, levný vývoj; jitter/nedeterminismus, nižší výkon) vs HW (prostorový paralelismus, determinismus, energetická efektivita; rigidita, NRE náklady). Příklady FFT a AES (cykly+energie); race-to-sleep; režie komunikace přes sběrnici.' },
  ]},
  { course: 'NAV', courseName: 'Návrh vestavěných systémů', topic: 'gpio',
    topicTitle: 'Číslicové vstupy a výstupy', src: ['t09'], examN: 9, subs: [
    { id: 'level-shifting', title: 'Přizpůsobení napěťových úrovní', scope: 'GPIO registry (DDR/PORT/PIN); VOH/VOL vs VIH/VIL, šumová imunita; 5V↔3.3V problém; řešení: odporový dělič, obousměrný MOSFET (I2C), buffery 74LVC245, optočleny (galvanické oddělení).' },
    { id: 'debouncing', title: 'Snímání mechanického kontaktu (zákmity)', scope: 'Bounce efekt (kmitání kontaktů); HW debouncing (RC dolní propust + Schmittův klopný obvod s hysterezí; SR/monostabilní); SW debouncing (vzorkování čítačem, posuvný registr 0x00/0xFF); vyhnout se blokujícím delay.' },
    { id: 'ovladani-zateze', title: 'Ovládání zátěže a posílení výstupu', scope: 'Limit GPIO ~20 mA; spínače BJT/MOSFET (Rds(on)); Darlingtonova pole ULN2803A (8× 500 mA/50 V); flyback (nulová) dioda u induktivní zátěže; optoizolátory pro síťové napětí/rušení.' },
    { id: 'h-mustek', title: 'H-můstek a řízení DC motorů', scope: '4 spínače do tvaru H; režimy vpřed/vzad (diagonála), brzdění (zkrat svorek), volnoběh; PWM řízení rychlosti; shoot-through + dead-time; bipolární vs unipolární řízení (zvlnění proudu).' },
  ]},
  { course: 'NAV', courseName: 'Návrh vestavěných systémů', topic: 'sw-architektura',
    topicTitle: 'Architektura SW pro vestavěné systémy', src: ['t10'], examN: 10, subs: [
    { id: 'super-loop', title: 'Hlavní smyčka (super-loop)', scope: 'Init + nekonečný cyklus (čtení vstupů, logika, výstupy); výhody (jedno vlákno, bez plánovače, bez deadlocku, nulová režie, jeden stack); nevýhody (jitter, doba reakce = součet WCET, ne pro hard real-time).' },
    { id: 'stavovy-automat', title: 'Implementace stavového automatu', scope: 'FSM pro neblokující kód (uložit stav, příště zkontrolovat přechod); switch-case (jump table, O(1)); pole ukazatelů na funkce (O(1), nutný bounds check); if-else (O(n)); hierarchický koordinátor.' },
    { id: 'preruseni-isr', title: 'Obsluha přerušení (ISR)', scope: 'Asynchronní události; latence (stacking registrů, vektor přerušení, blokování prioritou/kritickou sekcí); pravidla ISR (krátké, neblokující); model top-half/bottom-half; volatile (zákaz cachování v registru); atomicita + kritické sekce (race condition).' },
  ]},
  { course: 'NAV', courseName: 'Návrh vestavěných systémů', topic: 'rizeni-spotreby',
    topicTitle: 'Řízení spotřeby', src: ['t11'], examN: 11, subs: [
    { id: 'spotreba-podstata', title: 'Podstata spotřeby a řízení jádra', scope: 'Dynamická (přepínání, nabíjení kapacit) vs statická (svodové/subprahové proudy, dnes dominantní) spotřeba. Clock gating (dynamická, okamžité probuzení), power gating (statická, retenční registry), DVFS (P~f, P~U^2), multi-Vt (LVT kritické cesty / HVT zbytek).' },
    { id: 'rezimy-cinnosti', title: 'Typické režimy činnosti', scope: 'ARM Cortex-M režimy: Run/Low-power run; Sleep (WFI/WFE, periferie běží); Stop (hodiny stop, SRAM/registry zachovány); Standby (Vcore odpojen, ztráta SRAM, <1 µA); Shutdown (<100 nA, studený reset). Co se zachová vs ztratí.' },
    { id: 'spotreba-perifierii', title: 'Spotřeba modulů a SW kooperace', scope: 'Autonomní DMA na pozadí (LPBAM/BAM), instrukční cache, vypínání bloků pamětí, SMPS vs LDO; ošetření floating GPIO (analogový režim); RTOS Tickless Idle (LPTIM místo SysTick), Sleep-on-Exit.' },
  ]},
  { course: 'NAV', courseName: 'Návrh vestavěných systémů', topic: 'senzory',
    topicTitle: 'Snímání neelektrických veličin', src: ['t12'], examN: 12, subs: [
    { id: 'merici-retezec', title: 'Měřicí řetězec', scope: 'Prvky: snímač/čidlo → Analog Front-End (zesílení, filtrace, impedanční přizpůsobení) → analogový multiplexer → A/D převodník → MCU (číslicové zpracování, přepočet na jednotky).' },
    { id: 'typy-senzoru', title: 'Typy senzorů', scope: 'Pasivní/parametrické (mění R/C/L, nutné napájení — tenzometr, Pt100, kapacitní) vs aktivní/generátorické (přímý měnič, bez napájení — termočlánek, piezo). Smart senzory (čidlo+ADC+MCU na čipu, autokalibrace, digitální data).' },
    { id: 'analogove-pripojeni', title: 'Analogové připojení a A/D převod', scope: 'Úprava signálu (přístrojový zesilovač, sledovač napětí); unifikované signály (0–10 V; proudová smyčka 4–20 mA odolná, detekce přerušení). A/D: sample&hold, Nyquist + anti-aliasing dolní propust, kvantování/kódování, SAR převodník (10–16 b).' },
    { id: 'digitalni-rozhrani', title: 'Digitální připojení senzorů', scope: 'I2C (2 vodiče SDA/SCL, pull-up, 7/10b adresa), SPI (MISO/MOSI/SCK/CS, plně duplex, CS per zařízení), 1-Wire (1 vodič, 64b adresa, parazitní napájení, DS18B20), UART (TX/RX, baud rate, RS-485). Binární vstupy (koncové spínače, pull-up/down).' },
  ]},

  // ===== PDI — Prostředí distribuovaných aplikací =====
  { course: 'PDI', courseName: 'Prostředí distribuovaných aplikací', topic: 'globalni-stav',
    topicTitle: 'Konzistentní globální stav', src: ['t13'], examN: 13, subs: [
    { id: 'konzistentni-rez', title: 'Konzistentní řez a podmínky C1/C2', scope: 'Globální stav = lokální stavy procesů + stavy kanálů; absence sdílené paměti/globálních hodin; happened-before; konzistentní řez (uzavřený vůči kauzalitě). Podmínky C1 (odeslané zprávy z minulosti musí být zaznamenány) a C2 (zprávy z budoucnosti nesmí být evidovány — ghost deadlock). Slabě/beztranzitní/silně konzistentní stav.' },
    { id: 'chandy-lamport', title: 'Chandy–Lamportův algoritmus', scope: 'Snapshot za běhu bez zastavení; předpoklady (spolehlivé FIFO kanály); markery (oddělovač minulost/budoucnost). Fáze: iniciace (zaznamenat stav, rozeslat markery, nahrávat kanály), propagace (první vs opakovaný marker), terminace (marker ze všech kanálů). Proč splňuje C1/C2.' },
    { id: 'vektorove-hodiny', title: 'Vektorové hodiny a ověření konzistence', scope: 'Vektorové vs Lamportovy hodiny (rozliší kauzalitu od souběžnosti); řez konzistentní ⟺ hraniční události jsou vzájemně souběžné; pravidlo V(s_k)[k] ≥ V(s_i)[k]; ochrana před zprávami z budoucnosti (efekt bez příčiny).' },
  ]},
  { course: 'PDI', courseName: 'Prostředí distribuovaných aplikací', topic: 'mapreduce',
    topicTitle: 'Distribuované zpracování MapReduce', src: ['t14'], examN: 14, subs: [
    { id: 'mapreduce-model', title: 'Principy MapReduce', scope: 'Model + framework (Google); rozděl a panuj (Map/Reduce, framework řeší distribuci/síť/selhání); páry klíč-hodnota; datová lokalita (výpočet za daty); fault tolerance (heartbeats, re-spuštění, spekulativní exekuce stragglerů).' },
    { id: 'mapreduce-faze', title: 'Průběh: Map, Shuffle, Reduce', scope: 'Word Count: Input&Splitting → Mapping (emit <slovo,1>) → Shuffling (seskupení+seřazení stejných klíčů přes síť) → Reducing (agregace) → zápis výsledku. Combiner (lokální reducer pro úsporu sítě).' },
    { id: 'hadoop-spark', title: 'Implementace: Hadoop vs. Spark', scope: 'Hadoop: HDFS (bloky 128 MB, replikace 3×, rack awareness), YARN (ResourceManager/NodeManager/ApplicationMaster); nevýhoda — mezivýsledky na disk. Spark: in-memory (až 100× rychlejší), RDD (immutable, lineage→recompute), DAG, narrow (map/filter, pipeline) vs wide (reduceByKey/join, shuffle, hranice stage), lazy transformace + akce.' },
  ]},
  { course: 'PDI', courseName: 'Prostředí distribuovaných aplikací', topic: 'esb',
    topicTitle: 'Enterprise Service Bus', src: ['t15'], examN: 15, subs: [
    { id: 'esb-kontejner', title: 'ESB a kontejner', scope: 'ESB v SOA — prostředník propojující heterogenní aplikace; point-to-point „špageta“ vs sběrnice; impedanční nesoulad; kanonický datový model + adaptéry/překladače. ESB kontejner: OSGi bundles (izolace classloaderů — „JAR hell“, dynamický životní cyklus instalace/update bez restartu); Fuse Fabric.' },
    { id: 'mom', title: 'Message-Oriented Middleware (MOM)', scope: 'Asynchronní přenos diskrétních zpráv; dekoupling prostorový/časový/synchronizační; fronty (FIFO); persistentní (na disk, doručení „právě jednou“) vs non-persistentní (v paměti, riziko ztráty). Modely Point-to-Point (1 konzument, load balancing) vs Publish-Subscribe (téma, 1:N). Protokoly AMQP/MQTT/STOMP.' },
    { id: 'eip-smerovani', title: 'Enterprise Integration Patterns (směrování)', scope: 'Pipes and Filters; Content-Based Router (analýza obsahu, Dead Letter Queue pro No-Match); Message Filter (predikát); Splitter (rozdělení + Correlation ID); Aggregator (stavový, kdy hotovo dle počtu/timeoutu, strategie kompletace). Řetězení vzorů na příkladu objednávky.' },
  ]},

  // ===== TAMa — Tvorba aplikací pro mobilní zařízení =====
  { course: 'TAMa', courseName: 'Tvorba aplikací pro mobilní zařízení', topic: 'mobilni-ui',
    topicTitle: 'UI mobilních telefonů', src: ['t16'], examN: 16, subs: [
    { id: 'odlisnosti-desktop', title: 'Odlišnosti od konvenčních rozhraní', scope: 'Velikost obrazovky a okna (24–30" víceokenní vs 5–7" jedno okno); interakční model (kurzor+klávesnice vs nepřesný dotyk „tlustý prst“); kontext a pozornost (fragmentovaná, relace ~72 s vs ~150 s); stabilita připojení.' },
    { id: 'ergonomie-thumb-zone', title: 'Ergonomie: palcová zóna a Fittsův zákon', scope: 'Úchopy (jednoruční 49 %, kolébkový 36 %, obouruční 15 %; ~75 % interakcí palcem); zóny green/yellow/red. Fittsův zákon (čas ~ vzdálenost a velikost); na desktopu „nekonečné cíle“ na okraji vs na mobilu okluze; min. cíle 44×44 pt (iOS) / 48×48 dp (Android), rozestupy.' },
    { id: 'principy-navrhu', title: 'Principy návrhu mobilního UI', scope: 'Vysoký content-to-chrome poměr; uchování stavu (přerušené relace); progressive disclosure + chunking; minimalizace vstupu (senzory GPS/kamera/biometrie, autocomplete). Navigace: bottom navigation/tab bar (zlatý standard, zelená zóna) vs hamburger (skrývá funkce, červená zóna); gesta (skrytá, nutná zpětná vazba).' },
    { id: 'mobilni-formulare', title: 'Mobilní formuláře', scope: 'Jednosloupcový layout; labels nad poli (viditelné i s klávesnicí); placeholdery ≠ labels; správné klávesnice (HTML5 input types email/tel); eliminace dělených polí + masky; dynamická inline validace (ne jen červená barva — ikony/text).' },
  ]},
  { course: 'TAMa', courseName: 'Tvorba aplikací pro mobilní zařízení', topic: 'architektury-aplikaci',
    topicTitle: 'Princip činnosti moderních mobilních aplikací', src: ['t17'], examN: 17, subs: [
    { id: 'mvc-mvvm-mvi', title: 'Architektury MVC, MVVM, MVI', scope: 'MVC (Massive View Controller problém); MVVM (ViewModel + data binding, StateFlow/ObservableObject, testovatelnost); MVI (unidirectional data flow, Intent→State→UI=f(State)). Mikrovzory: Delegate, Data Source, Observer.' },
    { id: 'deklarativni-ui', title: 'Imperativní vs. deklarativní UI', scope: 'Imperativní (XML/Storyboard + settery, riziko desynchronizace) vs deklarativní (popis UI pro daný stav, recomposition). Jetpack Compose (Kotlin, @Composable, mutableStateOf/remember, Column/Row/Box); SwiftUI (Swift, View, @State/@Binding, VStack/HStack/ZStack).' },
    { id: 'paralelismus', title: 'Paralelismus a asynchronní zpracování', scope: 'UI thread nesmí blokovat; structured concurrency (auto-rušení). Kotlin Coroutines (suspend, Dispatchers Main/IO/Default); Swift async/await (Task, priority, Actor/@MainActor). Event-driven (RunLoop/Looper+Handler).' },
    { id: 'zivotni-cyklus', title: 'Životní cyklus aktivit a aplikací', scope: 'Agresivní správa paměti OS. Android Activity (onCreate/onStart/onResume/onPause/onStop/onDestroy; rotace → znovuvytvoření → ViewModel/rememberSaveable). iOS UIViewController (viewDidLoad/viewWillAppear/viewDidAppear/…); UIScene stavy (foreground active/inactive/background/suspended).' },
  ]},
  { course: 'TAMa', courseName: 'Tvorba aplikací pro mobilní zařízení', topic: 'vyvojovy-proces',
    topicTitle: 'Proces návrhu a vývoje mobilních aplikací', src: ['t18'], examN: 18, subs: [
    { id: 'sdlc-mvp', title: 'Životní cyklus a MVP', scope: 'Vodopád vs agile pro mobil. Fáze: Discovery&validace (BA, use-cases, ověření poptávky), MVP (design sprinty), návrh UX/UI (wireframy, prototypy, design manuál), návrh architektury+vývoj (frontend/backend, vendor lock-in), testování/nasazení/údržba.' },
    { id: 'technologicke-pristupy', title: 'Technologické přístupy', scope: 'Nativní (Kotlin/Java, Swift/Obj-C; výkon, 2 týmy/codebase); cross-platform (React Native, Flutter/Dart, Kotlin Multiplatform, .NET MAUI; sdílí 70–90 %); hybridní (WebView/Cordova; rychlé/levné, slabší výkon); PWA (prohlížeč + offline + instalace).' },
    { id: 'offline-bezpecnost', title: 'Offline architektura a bezpečnost', scope: 'Variabilita sítí → offline-first: lokální DB/cache (SQLite/CoreData), write-ahead queue, asynchronní synchronizace (řešení konfliktů last-write-wins). Bezpečnost: OWASP MASVS (šifrování úložiště, SSL pinning, HW biometrie).' },
    { id: 'devops-distribuce', title: 'Mobilní DevOps a distribuce', scope: 'Bariéry Apple/Google: code signing (certifikáty/profily). CI/CD (Bitrise macOS, Fastlane): kompilace, automatické podepisování, zkušební distribuce (TestFlight, Play Console), Staged Rollout (1 %→10 %…, rollback), OTA aktualizace.' },
  ]},

  // ===== UXIa — User Experience a návrh uživatelských rozhraní =====
  { course: 'UXIa', courseName: 'User Experience a návrh uživatelských rozhraní', topic: 'konceptualni-model',
    topicTitle: 'Konceptuální model funkčnosti', src: ['t19'], examN: 19, subs: [
    { id: 'domenovy-model', title: 'Konceptuální / doménový model', scope: 'Deskriptivní model problémové domény (význam termínů a vztahů, sjednocení komunikace, nezávislost na technologii); doménový model v OOA (entity + chování). CIM v MDA. Dva pohledy: statický (třídy/objekty/balíčky/komponenty) a dynamický (use case/sekvenční/aktivit/stavový). 5 iteračních kroků návrhu.' },
    { id: 'verifikace-validace', title: 'Verifikace a validace (V&V)', scope: 'Verifikace („děláme produkt správně dle zadání?“ — statické: revize, inspekce UML, kontroly konzistence, formální důkazy) vs validace („správný produkt pro účel?“ — dynamické: testy dle scénářů, black/white-box, UAT). Funkční vs nefunkční testy; úrovně unit/integrace/systém.' },
    { id: 'prototypovani-fidelity', title: 'Prototypování a žebříček věrnosti', scope: 'Design Thinking (vcítění/definice/nápady/prototyp/test). Fidelity ladder: low-fi (papír/wireframe — levné, upřímná kritika) vs high-fi (klikatelné). Wizard-of-Oz/Concierge MVP, Proof of Concept, MVP.' },
  ]},
  { course: 'UXIa', courseName: 'User Experience a návrh uživatelských rozhraní', topic: 'ucd',
    topicTitle: 'User Centered Design (UCD)', src: ['t20'], examN: 20, subs: [
    { id: 'ucd-pojmy', title: 'Klíčové pojmy UCD', scope: 'Usability (ISO 9241-11: efektivnost, účinnost, spokojenost v kontextu); UX (celkový prožitek před/během/po) vs UI (vizuální/interaktivní plocha); mentální modely a kognitivní zátěž; persony (proto/kvalitativní/statistické/přístupnostní); wireframe vs prototyp.' },
    { id: 'ucd-proces-iso', title: 'Proces UCD (ISO 9241-210)', scope: 'Iterativní, multidisciplinární, zapojení uživatelů. Kroky: plánování → specifikace kontextu použití (shadowing, pozorování) → specifikace požadavků → tvorba designových řešení → evaluace (cyklus se vrací dokud nesplní cíle).' },
    { id: 'evaluace-metody', title: 'Testování a evaluace', scope: 'Usability testing (testuje se systém, ne uživatel; formativní vs sumativní); heuristická analýza (3–5 expertů, 10 Nielsenových heuristik); kontextový rozhovor + pozorování; A/B testing + kvantitativní analytika; SUS (10 otázek, skóre 0–100).' },
  ]},

  // ===== WAP — Internetové aplikace =====
  { course: 'WAP', courseName: 'Internetové aplikace', topic: 'javascript',
    topicTitle: 'Jazyk JavaScript', src: ['t21'], examN: 21, subs: [
    { id: 'datove-typy', title: 'Datové typy a typový systém', scope: 'Dynamické a slabé typování (type coercion); 8 typů (7 primitiv: Undefined, Null, Boolean, Number IEEE754 ±(2^53−1), BigInt, String UTF-16, Symbol) + Object (heap, funkce/pole). Autoboxing; anomálie typeof null="object", typeof function="function". JIT kompilace (hoisting/syntax errors jako důkaz oddělené fáze).' },
    { id: 'scope-uzavery', title: 'Rozsahy platnosti a uzávěry', scope: 'Lexikální scoping, scope chain, variable shadowing; var (function-scoped, hoisting→undefined) vs let/const (block-scoped, TDZ, ReferenceError; const váže referenci, obsah mutable). Uzávěry (funkce + lexikální prostředí; live link ne snapshot; GC drží proměnné; privátní proměnné/currying/factories/callbacks).' },
    { id: 'prototypy-delegace', title: 'Prototypy a delegace volání', scope: 'Prototypová dědičnost (class = syntaktický cukr); [[Prototype]] vs .prototype; delegace čtení (rekurzivně po řetězci po null→undefined) vs zápis (nedeleguje se — shadowing). this = runtime binding (obj.metoda vs vytržená metoda → undefined/global); arrow funkce (lexikální this); call/apply/bind. Polymorfismus přes overriding + duck typing.' },
  ]},
  { course: 'WAP', courseName: 'Internetové aplikace', topic: 'udalosti',
    topicTitle: 'Události v JavaScriptu', src: ['t22'], examN: 22, subs: [
    { id: 'event-loop', title: 'Smyčka událostí (event loop)', scope: 'Single-threaded, jeden Call Stack (LIFO); Web/Node APIs na pozadí; fronta makroúloh (setTimeout, události, I/O) vs mikroúloh (Promise.then, queueMicrotask, vyšší priorita). Cyklus: vyprázdnit VŠECHNY mikroúlohy → zvážit render (~60 fps) → 1 makroúloha. Node libuv (6 fází) + process.nextTick.' },
    { id: 'asynchronni-programovani', title: 'Asynchronní programování', scope: 'Callbacks → callback hell → Promises → async/await. Priorita: mikroúlohy před makroúlohami (.then/po await dříve než setTimeout(…,0)). await rozdělí funkci (kód za await = mikroúloha). Hladovění mikroúlohami (zamrznutí UI). Srovnání s C# TPL (.Wait deadlock vs JS neblokuje hlavní vlákno).' },
    { id: 'dom-events', title: 'Klientské události (DOM)', scope: 'Šíření: capturing (kořen→cíl), target, bubbling (cíl→kořen). addEventListener config (capture/once/passive — passive:true zaručí žádný preventDefault → plynulý scroll). User vs programové (element.click() synchronně, Call Stack se nevyprázdní). Optimalizace: debouncing (našeptávač) vs throttling (scroll), requestAnimationFrame.' },
  ]},
  { course: 'WAP', courseName: 'Internetové aplikace', topic: 'reprezentace-dat',
    topicTitle: 'Reprezentace dat', src: ['t23'], examN: 23, subs: [
    { id: 'mime-types', title: 'Media types / MIME', scope: 'MIME typy (Multipurpose Internet Mail Extensions); hlavička Content-Type (prohlížeč spoléhá na ni, ne na příponu); struktura typ/podtyp (text/html, application/json), parametry charset/boundary (multipart/form-data). MIME sniffing → XSS, obrana X-Content-Type-Options: nosniff.' },
    { id: 'znackovaci-jazyky', title: 'HTML, XML, JSON a DOM', scope: 'SGML původ. HTML (pevná sada tagů, prezentace, tolerantní). XML (vlastní tagy, popis dat, well-formed: 1 kořen, párování, case-sensitive, uvozovky, entity; odvozené SVG/MathML/RSS). JSON (nativní typy, objekty/pole, o 30–50 % menší, rychlé parsování). DOM (strom uzlů Document/Element/Attr/Text, API).' },
    { id: 'validace-dat', title: 'Validace značkovacích jazyků', scope: 'Well-formed ≠ validní. XML: DTD (#PCDATA, bez datových typů/NS), XSD (W3C, typový systém, regexy, PSVI), Schematron (XPath podmínky), Relax NG (jednodušší). JSON: JSON Schema (required, min/max, typy, podmíněné if/then/else/dependentRequired).' },
  ]},
  { course: 'WAP', courseName: 'Internetové aplikace', topic: 'http',
    topicTitle: 'Přenos a distribuce webových dat', src: ['t24'], examN: 24, subs: [
    { id: 'uri-url-urn', title: 'URI, URL a URN', scope: 'URI = nadmnožina (každé URL/URN je URI); syntaxe scheme/authority/path/query/fragment. URL (kde + jak, protokol). URN (trvalé unikátní jméno nezávislé na lokaci, urn:isbn:…).' },
    { id: 'http-protokol', title: 'Protokol HTTP a jeho evoluce', scope: 'Bezstavovost (cookies/skrytá pole pro kontext); zprávy request/response (hlavičky + tělo). Metody GET (safe, idempotent, data v URL)/POST (tělo)/PUT/DELETE/HEAD/OPTIONS. Stavové kódy 1xx–5xx (200/201/204, 301, 400/401/404, 500/503). Evoluce: HTTP/1.1 (pipelining, aplikační HoL blocking) → HTTP/2 (binární framing, multiplexing streamů; transportní HoL) → HTTP/3 (QUIC nad UDP, eliminace transportního HoL, migrace spojení).' },
    { id: 'cdn-anycast', title: 'CDN a Anycast směrování', scope: 'Latence vs fyzická vzdálenost → CDN (globální uzly blízko uživatelům). Anycast (mnoho serverů sdílí jednu IP; routery dle BGP najdou nejbližší — bez GPS); mitigace DDoS (rozptyl útoku napříč uzly).' },
    { id: 'http-streams', title: 'Datové proudy a klientské API', scope: 'Chunked Transfer Encoding (data po blocích, otevřený soket). Server-Sent Events (jednosměr server→klient, text UTF-8, automatická rekonexe od last event ID). WebSockets (duplex, upgrade z HTTP, binární, ruční rekonekce). Klient: XMLHttpRequest (callbacky, upload progress, abort) vs Fetch (Promises/async-await, response.ok nutné kontrolovat, AbortController).' },
  ]},
  { course: 'WAP', courseName: 'Internetové aplikace', topic: 'webove-sluzby',
    topicTitle: 'Webová aplikační rozhraní a webové služby', src: ['t25'], examN: 25, subs: [
    { id: 'xml-rpc', title: 'XML-RPC', scope: 'První RPC standard (1998, alternativa k CORBA); transport HTTP, serializace XML; jediný endpoint, výhradně POST (potlačuje sémantiku webu); methodCall/methodName/params, methodResponse, fault (faultCode/faultString); typy int/double/string/boolean/dateTime.iso8601/base64/struct/array; introspekce (system.listMethods).' },
    { id: 'soap-wsdl-uddi', title: 'Klasické webové služby: SOAP, WSDL, UDDI', scope: 'SOAP (Envelope/Header/Body/Fault; ne jen HTTP — i SMTP/TCP/JMS; WS-Security, WS-ReliableMessaging). WSDL (XML popis rozhraní: types/message/portType/binding/service; generování klienta). UDDI (registr „Zlaté stránky“: bílé kontakty / žluté kategorie / zelené technické odkazy na WSDL).' },
    { id: 'rest', title: 'Architektonický styl REST', scope: 'REST (Fielding 2000), orientace na zdroje (ne akce); 6 omezení: Client-Server, Stateless, Cacheable, Uniform Interface (URI, reprezentace, HATEOAS), Layered System, Code on Demand (nepovinné). Mapování na HTTP slovesa GET/POST/PUT/PATCH/DELETE. Srovnání REST vs SOAP vs XML-RPC (sémantika sítě/cache, payload, kdy co).' },
  ]},
  { course: 'WAP', courseName: 'Internetové aplikace', topic: 'bezpecnost',
    topicTitle: 'Bezpečnost webových aplikací', src: ['t26'], examN: 26, subs: [
    { id: 'sop-cors', title: 'Same-Origin Policy a CORS', scope: 'SOP = základní bezpečnostní hranice prohlížeče; Origin = protokol+host+port vs Site = registrovatelná doména. SOP nezakazuje odeslání cross-origin požadavku ani vložení obrázku, ale zakazuje ČTENÍ odpovědi. CORS (Access-Control-Allow-Origin — řízené uvolnění, ne obrana). XS-Leaks (postranní kanály).' },
    { id: 'xss', title: 'Cross-Site Scripting (XSS)', scope: 'Injekce skriptu do důvěryhodné stránky (OWASP Top 10); session hijacking i přes HttpOnly. Formy: Stored (perzistentní v DB), Reflected (v URL, odražený), DOM-based (klient, sink eval/innerHTML). Obrana: kontextové escapování, automatické šablony (React/Latte), Trusted Types.' },
    { id: 'csrf', title: 'Cross-Site Request Forgery (CSRF)', scope: 'Zneužití důvěry serveru v prohlížeč přihlášeného uživatele (prohlížeč přiloží cookies). Obrana: Synchronizer Token Pattern (token v session, SOP brání čtení), Signed Double-Submit Cookie (HMAC, bezstavové), atribut SameSite (Strict/Lax — pozor na GET měnící stav), Fetch Metadata (Sec-Fetch-Site).' },
    { id: 'bezpecnostni-hlavicky', title: 'Bezpečnostní hlavičky HTTP', scope: 'HSTS (max-age, includeSubDomains, preload; 307 internal redirect; zákaz click-through u chyb certifikátu; jen přes HTTPS). CSP (direktivy script-src…, default-src fallback; nonce/hash, strict-dynamic; nebezpečné unsafe-inline/unsafe-eval). X-Frame-Options vs CSP frame-ancestors (clickjacking, CSP má přednost). X-Content-Type-Options: nosniff. Subresource Integrity (integrity hash + nutné crossorigin/CORS).' },
  ]},
]

// ---------------------------------------------------------------------------
const CONV = [
  'You are authoring high-quality Czech exam-prep study content for a Vite+React study app.',
  'WRITE IN CZECH (all existing content is Czech). Repo root: ' + ROOT + '.',
  '',
  'STEP 0 — ground yourself in the house style FIRST:',
  '  • Read 1 existing markdown subtopic, e.g. ' + ROOT + '/public/content/courses/PIS/jakarta-ee/jpa-persistence.md (or any *.md under public/content/courses/).',
  '  • Read 2 existing viz components, e.g. ' + ROOT + '/src/viz/two-phase-commit.jsx and ' + ROOT + '/src/viz/biasvar.jsx, to copy the SVG/theme idiom.',
  '  • Skim FRAMEWORK.md sections 0.6, 0.7, 0.8, 4, 5, 5.2 (' + ROOT + '/FRAMEWORK.md).',
  '  • Read your source write-up(s) listed in the task — they are the content base.',
  '',
  'MARKDOWN FORMAT (parser: src/framework/md-parser.js):',
  '  • Start with frontmatter delimited by --- lines: a single "title: <Czech title>" line.',
  '  • Paragraphs separated by blank lines. Inline: **bold**, *italic*, `code`, [label](url).',
  '  • Use ## and ### headings to structure. Use GitHub tables for comparisons.',
  '  • Fenced code blocks WITH a language tag (java, js, c, sql, xml, json, kotlin, swift, bash, ...).',
  '  • Math: a typed fence opening with three chars ":::" then "math" on its own line, the formula, then ":::". Use it for formulas (e.g. C1/C2 conditions, Fitts, vector-clock rule). Inline math is NOT supported — keep formulas in math fences or as plain text/code.',
  '  • Link block: ":::" + " link \"Label\" \"https://url\"" then ":::". Put >=1 authoritative external link per subtopic.',
  '  • Quiz block: ":::" + " quiz \"Question?\"" then a markdown list of "- [x]"/"- [ ]" options each with an indented "> explanation" line, then ":::". Add 1 quiz to ~half the subtopics where a misconception is common.',
  '  • Figure — PREFER an inline SVG for static spatial figures: ":::" + " svg \"caption\"" then raw <svg viewBox=...>...</svg> then ":::". SVG must be theme-aware: use var(--accent), var(--text), var(--text-muted), var(--line), var(--bg-inset), var(--bg-card) for colors (NEVER hardcode black/white fills). Keep viewBox height <= 220, width ~ 280-540, font-size 12-14.',
  '  • Figure — build an INTERACTIVE viz (a new component) ONLY when a parameter/step/toggle genuinely aids understanding (e.g. event loop stepper, Chandy-Lamport markers, H-bridge modes, HTTP HoL, prototype chain, thumb zone). Reference it with ":::" + " viz <id> \"caption\"" then ":::".',
  '  • EVERY subtopic must have at least one figure (svg or viz). Do NOT leave a "::: diagram" placeholder.',
  '  • End the file with external "::: link" blocks, then a final italic citation footer line in this exact shape:',
  '      *Zdroj: SZZ NADE — předmět <COURSE NAME>, VUT FIT. Externí reference: <comma-separated source names>.*',
  '',
  'HARD CONTENT RULES:',
  '  • DO NOT name any instructor/person or the source document in body prose (FRAMEWORK 0.8). The source write-up names a lecturer — that name must NOT appear anywhere. Only the citation footer mentions "VUT FIT".',
  '  • DO NOT write "Souhrn"/"Co dále" recap lists or "this section covers X,Y,Z" preview lists (FRAMEWORK 0.7). The app already shows navigation.',
  '  • VERIFY against authoritative web sources (FRAMEWORK 0.2) — use WebSearch/WebFetch. The source write-up is a student summary; cross-check facts (definitions, numbers, RFC/ISO/spec details) and fix anything wrong. Cite what you used (MDN, OWASP, RFC, W3C, ISO, OMG/UML, GoF, Larman, ECMAScript spec, ARM docs, Hadoop/Spark papers, etc.).',
  '  • Be accurate and exam-focused: clear definitions, the distinctions examiners probe, worked mini-examples. Split into blocks (prose + code + table + figure), never one wall of text.',
  '',
  'VIZ COMPONENT RULES (only if you build one):',
  '  • One file per viz at ' + ROOT + '/src/viz/<id>.jsx, default-exporting a React component that takes NO props.',
  '  • viz id = kebab-case, GLOBALLY UNIQUE — PREFIX IT WITH THE COURSE id in lowercase, e.g. "wap-event-loop", "nav-h-bridge", "pdi-chandy-lamport", "ais-grasp-assign". This avoids clashing with 300+ existing ids.',
  '  • Import only from "react" (useState/useEffect/useRef). No other deps. Self-contained.',
  '  • Use a viewBox around "0 0 280 180" (up to ~540 wide, height <= 220). Color via CSS vars only (var(--accent), var(--accent-line), var(--text), var(--text-muted), var(--text-faint), var(--line), var(--line-strong), var(--bg-inset), var(--bg-card)). Must look correct in BOTH dark and light themes — never hardcode #000/#fff/black/white.',
  '  • Keep interactions simple and robust (a step button, a slider, a toggle). Avoid layout that overflows the viewBox (see FRAMEWORK 5.2). Do NOT register it in src/viz/index.js — just report the id; the registry is wired centrally.',
  '  • The markdown ":::" + " viz <id>" id MUST exactly match the file/exported viz id you report.',
  '',
  'OUTPUT: Write every .md (to public/content/courses/<COURSE>/<topic>/<sub>.md) and every viz .jsx now,',
  'then return the structured result (topicId, courseId, subtopicsWritten, viz list, resources, notes).',
].join('\n')

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    courseId: { type: 'string' },
    topicId: { type: 'string' },
    subtopicsWritten: { type: 'array', items: { type: 'string' } },
    viz: { type: 'array', items: { type: 'object', additionalProperties: false,
      properties: { id: { type: 'string' }, file: { type: 'string' }, caption: { type: 'string' } },
      required: ['id', 'file'] } },
    resources: { type: 'array', items: { type: 'object', additionalProperties: false,
      properties: { title: { type: 'string' }, url: { type: 'string' }, kind: { type: 'string' }, note: { type: 'string' } },
      required: ['title', 'url'] } },
    notes: { type: 'string' },
  },
  required: ['courseId', 'topicId', 'subtopicsWritten', 'viz', 'resources'],
}

function buildPrompt(t) {
  const subList = t.subs.map((s, i) =>
    `  ${i + 1}. id="${s.id}"  →  file: public/content/courses/${t.course}/${t.topic}/${s.id}.md\n` +
    `     title: "${s.title}"\n     scope: ${s.scope}`).join('\n')
  const srcPaths = t.src.map(s => `${SRC}/${s}.txt`).join(', ')
  return [
    CONV,
    '',
    '================= YOUR TASK =================',
    `COURSE: ${t.course} — ${t.courseName}`,
    `TOPIC: "${t.topicTitle}" (topic id: ${t.topic})  [maps to NADE exam topic #${t.examN}]`,
    `SOURCE WRITE-UP(S) to read and verify: ${srcPaths}`,
    '',
    `Author these ${t.subs.length} subtopics (use the EXACT ids and file paths):`,
    subList,
    '',
    'Make the set cohesive (consistent terminology, no overlap, no repetition across the subtopics).',
    'Each .md = a focused ~1-study-session unit with at least one figure (prefer inline ::: svg; build a ::: viz only where interaction clearly helps).',
    'When done, return the structured result. For viz, report {id, file} for every NEW component you created (file relative path under src/viz/).',
  ].join('\n')
}

// ---------------------------------------------------------------------------
log(`NADE authoring: ${SPEC.length} topics across 6 courses`)

const results = await parallel(SPEC.map((t) => () =>
  agent(buildPrompt(t), { label: `${t.course}/${t.topic}`, phase: t.course, schema: SCHEMA })
    .then((r) => r ? { ...r, _course: t.course, _topic: t.topic, _examN: t.examN } : null)
))

const ok = results.filter(Boolean)
log(`Authored ${ok.length}/${SPEC.length} topics`)
return {
  topics: ok,
  vizCount: ok.reduce((n, r) => n + (r.viz ? r.viz.length : 0), 0),
  subCount: ok.reduce((n, r) => n + (r.subtopicsWritten ? r.subtopicsWritten.length : 0), 0),
}
