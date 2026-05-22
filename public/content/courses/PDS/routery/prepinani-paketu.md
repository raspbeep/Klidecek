# Přepínání paketů — Process, Fast, CEF

Architektura routeru ([[router-architektura]]) říká, *kde* moduly leží. Tato sekce řeší *jak rychle paket prochází*. Existují tři klasické strategie ve vývoji Cisco IOS, každá *řádově rychlejší* než předchozí:

1. **Software Switching (Process Switching)** — paket zpracovává CPU.
2. **Fast Switching** — Route Cache s předpočítanou L2 hlavičkou.
3. **CEF (Cisco Express Forwarding)** — předpočítaná FIB + Adjacency Table, hardwarová akcelerace.

## Co je přepínání paketů

Nejdůležitější funkce směrovače — přepínání paketů z jednoho rozhraní na druhé *na základě směrovacích informací*. Proces zahrnuje:

1. *Zjištění, zda existuje cesta k cíli*.
2. *Vyhledání dalšího uzlu na cestě* (next-hop) a *určení výstupního rozhraní*.
3. *Vytvoření hlavičky L2*, *zapouzdření paketu* a *předání na výstup*.

Každý z těchto kroků je *kritický* pro úspěšné odeslání paketu. Cílem je dělat to *co nejrychleji*.

## Process Switching (Softwarové přepínání)

**Princip:** každý paket se vyhledá ve směrovací tabulce; CPU dělá *všechno*.

```
Route Processor:
  Software Processing:
     ┌──── IP Routing Table
     ↓
  ┌───────────────┐
  │ ip_input      │ ← receive interrupt
  │ process       │
  │ (CPU driven)  │
  └───────────────┘
        ↓
     ARP cache
        ↓
  ┌──── Output Queue → I/O processor → wire
```

### Detailní průběh

1. *I/O procesor* (síťová karta) načte paket ze vstupního rozhraní; uloží do paměti na kartě.
2. *Vygeneruje přerušení* (`receive interrupt`); zkontroluje hlavičku; paket vloží do *vstupní fronty* pro další zpracování.
3. *Centrální plánovač* naplánuje proces `ip_input` pro softwarové přepínání paketů. Proces si načte paket a začne zpracovávat.
4. Ze *směrovací tabulky* zjistí cestu k cíli (next-hop). Z *ARP cache* určí MAC sousedního uzlu.
5. Ze získaných informací *vygeneruje hlavičku L2*. Paket vloží do výstupní fronty.
6. *Výstupní I/O procesor* detekuje paket ve frontě a předá jej na síťové rozhraní.
7. Rozhraní *paket odešle* a vygeneruje přerušení o odeslání (`transmit interrupt`).

### Rozdělení zátěže (Load Sharing)

Pokud existuje *víc cest k cíli* (ECMP, *Equal-Cost Multi-Path*), Process Switching rozloží zátěž **po paketech** (per-packet):

- Každý paket → vybere se cesta podle *metric* / *load share counter*.
- Při *stejné ceně* dochází ke *kruhové* distribuci (round robin).

### Nevýhody

- **Každý paket zpracovává CPU** → *pomalá cesta*.
- *Pro každý paket* vyhledáváme ve směrovací tabulce a ARP cache.
- *CPU se brzy stane bottleneck* pro vysoké rychlosti.

Process Switching je *legacy* — dnes jen pro výjimky (broadcasty, ICMP, source-routed pakety).

## Fast Switching

**Princip:** *první paket toku* projde pomalou cestou (Process Switching). *Další pakety stejného toku* využijí **Route Cache** s předpočítanou hlavičkou L2.

```
Route Processor:
  Software Processing → IP Routing Table (process switching cesta)
  
  ┌── Interrupt Processing ──────────────────┐
  │   ┌── Route Cache ─→ Fast Switching      │
  │   │   (hit?)         (rychlá cesta)      │
  │   ↓                                       │
  │   no → process switching                  │
  └──────────────────────────────────────────┘
```

### Příklad Route Cache

```
Router# show ip cache
IP routing cache version 4490, 141 entries, 20772 bytes, 0 hash overflows
Minimum invalidation interval 2 seconds, maximum interval 5 seconds
Invalidation rate 0 in last 7 seconds, 0 in last 3 seconds

Prefix/Length      Age      Interface      MAC Header
192.168.1.1/32    0:01:09   Ethernet0/0    AA00000010C13400000C0357430800
192.168.1.0/24    0:00:21   Ethernet1/2    00000026C600000C0357400800
192.168.4.0/24    0:01:02   Ethernet1/2    …
…
```

### Předpoklady úspěšného použití Fast Cache

- *Stabilní síť* s malými změnami ve směrovací tabulce.
- *Provoz jdoucí na určitou množinu cílových uzlů* (tj. *flow concentration*).
- **Nefunguje u páteřních směrovačů** — *příliš mnoho* různých cílových uzlů (tisíce, miliony) → cache *thrashing*.

### Konzistence dat ve Fast Cache

- Data ve Fast Cache *závisí na směrovací tabulce a ARP*.
- Problém u **rekurzivních cest** → Fast Cache obsahuje *vyhodnocené* záznamy.

### Cache invalidation

- *Změna nebo expirace* záznamu v ARP tabulce.
- *Změna nebo odstranění* cesty ve směrovací tabulce.
- *Změna dalšího uzlu* (next hop) ve směrovací tabulce.

### Cache aging

- Při zaplnění paměti nad určitou mez začne *náhodně zahazovat záznamy*.

### Rozdělení zátěže ve Fast Switching

- *Per-destination* — všechny pakety se *stejnou cílovou adresou* používají *stejnou linku*.
- *Nedeterministické a neefektivní* — zátěž se nerozdělí *rovnoměrně*.

### Nevýhody

- *První paket* toku se vždy zpracovává softwarově.
- *Změny v RIB nebo ARP* způsobí zneplatnění záznamů → další paket toku se zpracuje *v software*.
- *Nedeterministické* rozložení zátěže.
- Nevhodné pro **páteřní směrovače**, kritické pro **enterprise**.

## Cisco Express Forwarding (CEF)

**Princip:** předpočítej FIB *před* příchodem prvního paketu, použij optimální datovou strukturu pro lookup, *odděl* L2 informace od FIB.

### Dvě klíčové tabulky

1. **CEF Table (FIB)** — IP prefix → adjacency pointer.
2. **Adjacency Table** — L2 hlavičky pro známé next-hopy.

### Tabulka CEF (FIB)

- *Vytváří se dynamicky* ze směrovací tabulky (RIB).
- Optimalizovaná pro vyhledávání pomocí **256-ární struktury trie (256-way mtrie)**.
- Každý uzel má *až 256 potomků* (jeden byte IPv4 adresy → 256 hodnot).
- *Listový uzel* obsahuje *ukazatel do tabulky sousedů* (Adjacency Table).

```
                          root
              ┌─────┬─────┴─────┬─────┐
            0.0.0.0  1.0.0.0  2.0.0.0  …  255.0.0.0
                                    ↓
                       (úroveň 2 - druhý byte)
                                    ↓
                       (úroveň 3 - třetí byte)
                                    ↓
                  list: → Adjacency Table
```

Pro úplnou IPv4 adresu má strom *max 4 úrovně* → každý lookup je *4 lookups v poli*.

### Tabulka sousedů (Adjacency Table)

- *Obsahuje IP adresy a MAC adresy sousedních uzlů* (next-hop).
- *Vytváří se na základě ARP tabulky*.

Typy záznamů:

- *Předpočítané hlavičky* přímo připojených sousedů (**auto**).
- *Nekompletní L2 hlavičky* → vyžaduje dotaz ARP (**glean**).
- *Pakety určené pro softwarové zpracování* (**punt**) — výjimky.

### Propojení s ARP

```
Routing Table:                        ARP Cache:
Protocol  Address      Next-Hop       IP Address    MAC Address
OSPF      192.168.5.0  10.14.1.1      10.14.1.1     00:08:A3:7F:CB:7C
OSPF      10.14.1.0    10.14.1.1      192.168.1.2   D4:50:64:B1:9F:02
EIGRP     172.16.1.0   192.168.1.2

         ↓ derivuje                        ↓ derivuje

CEF Table:                            Adjacency Table:
IP Address    Prefix  Adjacency Ptr   IP Address    Layer 2 Header
192.168.5.0   24      10.14.1.1   →   10.14.1.1     0008A37FCB7C00503EFA3780...
10.14.1.0     30      10.14.1.1       192.168.1.2   006D471E91D8003071D3105...
172.16.1.0    24      192.168.1.2
```

### Průběh expresního přepínání

1. *Podle směrovací tabulky* se předpočítá tabulka CEF (FIB) a tabulka sousedů *ještě před* příchodem prvního paketu.
2. Na vstupní rozhraní přijde paket. *Odstraní se hlavička L2*.
3. *Podle cílové IP* se v CEF vyhledá *ukazatel na tabulku sousedů*.
4. V tabulce sousedů se *vyhledá předkompilovaná hlavička L2* pro cílovou IP.
5. *Doplní* se nová hlavička L2 a paket se *předá na výstupní rozhraní*.

### Výhody CEF

- *Implementováno v hardwaru* pomocí technologie **ASIC**.
- *Tabulka CEF se předpočítá* na základě aktuální RIB a ARP cache → **nedochází k softwarovému zpracování** ani u prvního paketu toku.
- *Oddělení směrovacích informací od L2* → *nedochází ke stárnutí záznamů* při expiraci ARP.
- *Změny ve směrovací tabulce či ARP* se *okamžitě propagují* do CEF.
- ARP tabulka je *synchronizována* s tabulkou sousedů.

### Rozdělení zátěže v CEF

- *Per-packet* (round-robin) nebo *per-destination* (consistent hashing).
- *Per-destination* preferováno — zachovává pořadí paketů (důležité pro TCP throughput).
- **Load Share Table** — pomocí hashe ze zdrojové/cílové IP se vybere index 0–15 v *Load Share Table*; záznamy *ukazují na tabulku sousedů*.

```
CEF Table:                Load Share Table:
192.168.5.0/24  →         [0]: → adjacency 1
                hash      [1]: → adjacency 2
                          [2]: → adjacency 1
                ↑          ⋮
       Src IP + Dst IP     [15]: → adjacency 2
```

CEF je *dnes standardní* mechanism v Cisco IOS, IOS XE, IOS XR. Juniper má vlastní implementaci (PFE — Packet Forwarding Engine). Linuxový kernel má **FIB trie** (od 2.6.32) podobné CEF.

## Srovnání

| Strategie | Lookup | First packet | Změna RIB | Použití |
| :--- | :--- | :--- | :--- | :--- |
| **Process Switching** | RIB pro každý paket | software | OK (žádná cache) | legacy, výjimky |
| **Fast Switching** | Route Cache | software (pomalá) | cache invalidation | enterprise (stabilní toky) |
| **CEF** | FIB (předpočtený trie) | hardware | okamžitá propagace | core, enterprise |

## Co dále

Tyto tři strategie zapadají do *vyšší organizace* — celého routeru. Viz [[architektury-prehled]] pro klasifikaci moderních směrovačů podle architektonického vzoru.

---

*Zdroj: PDS přednáška 5, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Stringfield, N., White, R., McKee, S.: *Cisco Express Forwarding* (Cisco Press 2007); Varghese, G.: *Network Algorithmics* (Elsevier 2005).*
