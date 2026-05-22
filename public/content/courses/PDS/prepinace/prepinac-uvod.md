# Architektura přepínačů — úvod

V recapu ([[sitove-zarizeni]]) jsme viděli **switch** jako L2 zařízení, které posílá rámce podle MAC tabulky (CAM). To je *funkční* pohled. Tato přednáška se ptá *jak je switch postaven uvnitř* — jaká je architektura *přepínacího pole* (switch fabric), jak rozhoduje *plánovač* (scheduler) o tom, co kdy propustit, jaké jsou limity škálovatelnosti. Jde o **hardwarovou anatomii** moderních síťových zařízení.

## Co dělá přepínač

Přepínač má **4 fundamentální otázky**:

1. **Na jaké vrstvě OSI pracuje?** L2 (Ethernet switch), L3 (router), L4–L7 (load balancer, firewall). V této přednášce mluvíme primárně o L2/L3 přepínání jako *hardwarovém* problému.
2. **Na základě čeho přepíná?** MAC (L2), IP prefix (L3), 5-tuple (L4), URL (L7). Pro hardware se hodí *jednoduchá rozhodnutí* (MAC, IP prefix); složitější rozhodnutí (URL) potřebují CPU.
3. **Jaké typy přenosů implementuje?** *Unicast*, *broadcast*, *multicast*, *anycast*. Hardwarová podpora pro multicast je netriviální — viz dále.
4. **Co ovlivňuje propustnost?** Architektura přepínacího pole, plánovací algoritmus, HOL blokování, vícestupňovost.

## Obecná architektura přepínače

Moderní switch se skládá z těchto **základních částí**:

- **Procesor vstupního/výstupního rozhraní** (*fabric interface chip*, FIC) — propojuje fyzický port a přepínací pole; rozděluje pakety na buňky *pevné délky* (cells) pro snazší plánování.
- **Vstupní/výstupní buffer** — fronty pro pakety čekající na přenos (vstupní) nebo na odeslání (výstupní).
- **Přepínací pole** (*switch fabric*) — *jádro* zařízení, dynamicky propojuje vstupní rozhraní s výstupními. Může to být sběrnice, sdílená paměť, crossbar nebo vícestupňová síť.
- **Řadič přepínacího pole + plánovač** (*controller and scheduler*) — rozhoduje, *které* vstupní paket(y) se v daném časovém slotu přenesou na *které* výstupy.

```
        ┌─ Line Card 1 ─────────────────────┐    ┌─ Switch Fabric Card ─┐
Rx  → [Ingress Proc.] → [Fabric Interface] →│    │   ┌──────────────┐  │
                                            │    │   │  Controller   │  │
Tx  ← [Egress  Proc.] ← [Fabric Interface] ←│    │   │  & Scheduler  │  │
        ……                                  │    │   └───────┬──────┘  │
        ……                                  │    │           ↓         │
Rx  → [Ingress Proc.] → [Fabric Interface] →│    │  [ Switch Fabric ]  │
                                            │    │                     │
Tx  ← [Egress  Proc.] ← [Fabric Interface] ←│    └─────────────────────┘
        └─ Line Card N ─────────────────────┘
```

## Požadavky na činnost přepínače

- **Maximální využití přepínacího pole** (propustnost).
- **Paralelní přenosy** mezi různými síťovými rozhraními (vstup i výstup).
- **Spravedlivé přidělování pásma** — žádný flow nemá vyhladovět.
- **Rozšiřitelnost** — přidání portů by mělo být *lineárně* nákladné, ne kvadraticky.

## Metriky výkonu

- **Propustnost** (*throughput*) — množství dat za jednotku času, $[\text{bps}]$ nebo $[\text{pps}]$.
- **Latence** — doba přenosu paketu z vstupu na výstup $[s]$.
- **Počet dostupných cest** v přepínacím poli mezi danými vstupními a výstupními porty (důležité pro redundanci a vícestupňové sítě).
- **Blokující vs neblokující přepínání** — *neblokující* znamená, že pro libovolnou disjunktní množinu požadavků existuje propojení současně. Blokující přepínač má některé požadavky, které musí *čekat*.

## Klasifikace přepínačů

```
                  Propojovací deska (backplane)
                          │
            ┌─────────────┴─────────────┐
            ↓                           ↓
  Sdílená propojovací         Přepínaná propojovací
  deska (shared backplane)    deska (switched backplane)
       ↓                              │
  Přepínače se sdílenou        ┌──────┴──────┐
  sběrnicí (shared bus)        ↓             ↓
       ↓                  Jednostupňové   Vícestupňové
  Přepínače se sdílenou   ↓                ↓ ↓
  pamětí (shared memory)  Crossbar      Clos / Beneš
                          (křížový)     (multi-stage)
```

Pro jednostupňové crossbar existují **plánovací algoritmy** — *Take-a-Ticket*, **PIM**, **iSLIP** — které vybírají, *které* požadavky se v daném slotu zpracují. Pro vícestupňové sítě (Clos, Beneš) je výzva *propojení* — kde každý paket projde *více vrstvami* crossbarů.

## Co následuje

Postupně rozebereme:

1. **Konkrétní architektury** ([[architektury]]) — shared bus, shared memory, crossbar.
2. **HOL blokování a VOQ** ([[hol-voq]]) — proč vzniká a jak ho řešit.
3. **PIM algoritmus** ([[planovani-pim]]) — Parallel Iterative Matching.
4. **iSLIP algoritmus** ([[planovani-islip]]) — Iterative Round-Robin Matching with SLIP.
5. **Vícestupňové sítě** ([[multistage-clos-benes]]) — Clos a Beneš.

---

*Zdroj: PDS přednáška 4 (Architektura přepínačů), doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Medhi, D., Ramasamy, K.: *Network Routing: Algorithms, Protocols, and Architectures* (Elsevier 2007); Liu, B., Chao, H.J.: *High Performance Switches and Routers* (Wiley-IEEE Press 2007).*
