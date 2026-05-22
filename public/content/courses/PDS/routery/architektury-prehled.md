# Přehled architektur směrovačů

Strategie přepínání ([[prepinani-paketu]]) se *vyvíjely* spolu s architekturami směrovačů. Tato sekce klasifikuje směrovače podle *způsobu zpracování paketu na úrovni architektury* — od centralizované Shared CPU až po distribuovanou Clustered. Tato evoluce kopíruje *růst rychlostí* sítí v posledních 30 letech.

## Čtyři architektonické vzory

Podle Medhi & Ramasamy (2007):

1. **Architektura se sdíleným procesorem** (Shared CPU) — *všechno* dělá CPU.
2. **Architektura s nezávislými moduly FE** (Shared Forwarding Engine) — *jeden* FE pro všechny porty.
3. **Distribuovaná architektura** (Shared Nothing) — *FE na každé* line card.
4. **Modulární architektura** (Clustered) — *více* RCP, *více* FE, *koordinace*.

Tyto čtyři vzory představují *historický vývoj* — od 90. let až do současnosti.

## 1. Architektura se sdíleným procesorem (Shared CPU)

**Princip:** *jediný CPU* zpracovává *vše* — směrování, přepínání, queue management.

```
Control Plane                                    Data Plane
─────────────────────────────────────────────────────────────────
Route Control     Routing      Forwarding       Buffer Memory  Queue Manager
Processor    →   Table     ←  Table       ←─ → │       │     ←→  Traffic Manager
                                  ↑
                                  │     L2/L3 Processing (Inbound)
                                  ↓
                       L2/L3 Processing (Outbound)
─────────────────────────────────────────────────────────────────
Shared Backplane
─────────────────────────────────────────────────────────────────
Line  Line  Line  Line  Line     (network interfaces)
Card  Card  Card  Card  Card
```

Charakteristiky:

- Využívá **softwarové přepínání** ([[prepinani-paketu]]) → každý paket zpracován na CPU.
- Cykly CPU rozděleny mezi *přepínání, směrování, další operace* (NAT, ACL, ...).
- **Sdílená sběrnice i procesor** — *levné, ale pomalé*.

Typické nasazení: malé SOHO routery, ranní Cisco modely (Cisco 2500, 2600 z roku 1995).

### Varianta s pamětí cache na kartě

```
Shared CPU                       Memory   Routing
   ↓                             Buffer    Table
Route Control Processor → FE → Buffer Memory
                                              
─────────────────────────────────────────────
Shared Backplane
─────────────────────────────────────────────
Line Card 1:                Line Card 2:
   Forwarding Cache            Forwarding Cache  ...
   Buffer Memory               Buffer Memory
   FE, QM, TM                  FE, QM, TM
```

Vylepšení:

- *Forwarding Cache na kartě* → **synchronizace přepínacích tabulek** s centrálním FE.
- *Rychlé přepínání* (Fast Switching): první paket toku jde do centrálního FE, další přes Forwarding Cache na kartě.
- *Síťová karta obsahuje vlastní FE* pro zpracování hlaviček + cache + traffic manager.

Typický příklad: Cisco 7500 s VIP (Versatile Interface Processor) z konce 90. let.

## 2. Architektura s nezávislými moduly FE (Shared FE)

**Princip:** *Forwarding Engine* je samostatný modul, *paralelní* zpracování.

```
Control Plane                          Data Plane
                                              
Shared CPU                          
Memory                                        
Route Control Processor             
Routing Table                                 
                ─────────────────────────────────
                Forwarding Backplane
                ─────────────────────────────────
Forwarding Engine Cards:
  ┌────────────────┐   ┌────────────────┐
  │ Forwarding     │   │ Forwarding     │
  │ Table          │   │ Table          │   ...
  │ Forwarding     │   │ Forwarding     │
  │ Engine         │   │ Engine         │
  └────────┬───────┘   └────────┬───────┘
           │                    │
           ↓                    ↓
─────────────────────────────────────────────
Line Cards (s Queue Manager, Traffic Manager, Buffer Memory)
─────────────────────────────────────────────
Shared Backplane (datový provoz)
```

Charakteristiky:

- Přepínací moduly FE *implementovány na speciálních kartách* (ne v CPU).
- *Paralelní zpracování paketů* — víc FE současně.
- **Dvě sběrnice**:
  - *Sdílená* (pro RCP, control plane).
  - *Přepínaná* (pro data plane).

Typický příklad: Cisco GSR 12000 raných verzí.

## 3. Distribuovaná architektura (Shared Nothing)

**Princip:** **každá line card má vlastní FE**. *Centrální* je *jen control plane*.

```
Shared CPU
  ↓
Route Control Processor → Routing Table → Memory
                                              
─────────────────────────────────────────────
Switched Backplane (high-speed fabric)
─────────────────────────────────────────────
Line Card 1:           Line Card 2:          Line Card 3:
  Forwarding Table       Forwarding Table      Forwarding Table
  Forwarding Engine      Forwarding Engine     Forwarding Engine
  Buffer Memory          Buffer Memory         Buffer Memory
  Queue Manager          Queue Manager         Queue Manager
  Traffic Manager        Traffic Manager       Traffic Manager
  L2/L3 NI               L2/L3 NI              L2/L3 NI
```

Charakteristiky:

- *Veškeré zpracování paketu přeneseno do síťového modulu* (line card).
- *Oddělení procesu směrování a přepínání* → využití technologie **CEF**.
- *Distribuovaný CEF (dCEF)* — každá line card má vlastní CEF tabulku.

### Příklad — Cisco 7500, Cisco 12000 (GSR)

```
Line Card 1:               Process-Level Management Plane         Line Card 3:
  Data Plane                  ┌───────────────────────────┐         Data Plane
  ASIC: FIB, Adj              │ IP Routing Table          │         ASIC: FIB, Adj
  Physical Interface          │ Process: SNMP, FTP, SSH,  │
       ↓                      │           syslog          │           ↓
  Fabric Interface ←┐         ├───────────────────────────┤         ←─ Fabric I/F
                    │         │ Control Plane             │
                    │         │   BGP, OSPF, MPLS, IS-IS  │
                    ↓         │   IGMP                     │
              ┌─────────────  │ Performance Route          │
              │  Crossbar     │ Processor (PRP)            │
              │  Switch Fabric└────────┬──────────────────┘
              └────────┬───────┐       │  CPU, RAM, NVRAM
                       │  ← ── ┘       │  flash
Line Card 2:           │               │
  Data Plane           │               │
  ASIC: FIB, Adj  ─ ── ┘
  Physical Interface
```

- *ASIC* na každé line card → hardwarové zpracování paketu.
- *Centrální Performance Route Processor (PRP)* — routing protocol, BGP, OSPF.
- *Crossbar Switch Fabric* — vysokorychlostní propojení line cards.

To je *dominantní vzor* moderních enterprise/edge routerů.

## 4. Modulární architektura (Clustered)

**Princip:** *více* RCP, *více* FE, *více* line cards, propojení přes *speciální fabric*.

```
Modular Service Card:
  Cisco SPP (Service Processing Plane)
  ASIC Data Plane                        Route Processors:
                                            ┌─────┐ ┌─────┐
Interface Modules:                          │     │ │     │ ...
  ┌─────────────┐  ┌─────────────┐         └─────┘ └─────┘
  │ Modular     │  │ Modular     │              │
  │ Service Card│  │ Service Card│              │ control bus
  │             │  │             │         ↓ ─ data fabric
  └─────────────┘  └─────────────┘  ↑    ┌──────────────────┐
                                    │    │ Service-Intelligent
                                    └────┤ Switch Fabric    │
                                         └──────────────────┘
```

Charakteristiky:

- *Nezávislé moduly* připojené k *centrálnímu přepínači*.
- *Více přepínacích modulů*, *více směrovacích procesorů* — redundance, paralelismus.
- *Distribuované zpracování* → **dCEF** (distributed CEF).
- *Service-Intelligent Switch Fabric* — *programovatelná* látka (Cisco SDN-Ready, Juniper Junos Fabric).

Typický příklad: **Cisco CRS-3**, **Cisco NCS 6000**, **Juniper PTX10000**.

To jsou *carrier-grade* routery pro **Tier-1 ISP** páteře (Cogent, Level 3, Telia).

## Srovnání

| Architektura | Když | Příklady | Komplexita |
| :--- | :--- | :--- | :--- |
| **Shared CPU** | 1995–2000 | Cisco 2500, 2600 | nízká |
| **Shared CPU + Cache** | 1998–2005 | Cisco 7500 (VIP) | střední |
| **Shared FE** | 2000–2010 | Cisco GSR 12000 | střední |
| **Shared Nothing** | 2005–present | Cisco 7500, 12000, ASR 9000 | vysoká |
| **Clustered** | 2010–present | Cisco CRS-3, NCS 6000 | velmi vysoká |

---

*Zdroj: PDS přednáška 5, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Medhi, D., Ramasamy, K.: *Network Routing* (Elsevier 2007), kap. 14–15; Aweya, J.: *Designing Switch/Routers* (CRC Press 2023); [Cisco IOS Software Architecture](https://www.ciscopress.com/store/inside-cisco-ios-software-architecture-9781578701810).*
