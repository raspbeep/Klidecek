# Tři roviny směrovače — management, control, data

Předchozí přednášky ([[router-architektura]], [[architektury-prehled]]) ukázaly *vnitřní strukturu* směrovače. Tato přednáška se na ní dívá jiným úhlem — z hlediska **odděleného řízení**. Klasický switch/router obsahuje *tři logicky oddělené roviny*: **management plane**, **control plane** a **data (forwarding) plane**. Pochopení této separace je klíčem k **SDN** (Software-Defined Networking).

## Management plane

**Management plane** je *kde se zařízení konfiguruje*.

Interakce:

- **Síťový operátor** — obvykle přes *CLI* (Cisco IOS, Junos) nebo *web interface*.
- **Network Management System (NMS)** — typicky přes *SNMP*, někdy přes *NETCONF* nebo jiné *XML*- či *REST*-based API.

Funkce:

- Udržuje *aktuální* i *uloženou* konfiguraci zařízení.
- Aplikuje konfigurační změny dovnitř (do control plane).
- Reaguje na monitorovací dotazy zvenku (SNMP get/walk).

Příklady protokolů management plane: **SNMP**, **NETCONF**, **gNMI**, **CLI/SSH**, **RESTCONF**.

## Control plane

**Control plane** je *kde se počítá* routovací stav.

Funkce:

- Běh **control protokolů**:
  - L2: LACP, LLDP, CDP, STP.
  - L3: ARP/ND, OSPF, BGP, IS-IS, EIGRP, RIP, multicast PIM.
- Výměna *topologie* a *reachability* informací s *sousedy*.
- Sestavování **forwarding tables** (FIB), které pak data plane používá k *přeposílání rámců/paketů*.

```
Adjacent router        Router                       Adjacent router
                                                    
Control plane      Management / Policy plane        Control plane
                                                    
    Routing        Configuration / CLI / GUI            Routing
    │                                                   │
    ↓                                                   ↓
    OSPF  ←───────  Control plane                       OSPF
                                                    
                       Static routes                
                       ↓                            
                       OSPF                         
                       ↓                            
                       Neighbor / Link State /     
                       IP Routing Table             
                       ↓                            
─────────────────── Data plane ──────────────────────
    Switching          Forwarding table                Switching
─────────────────── Data plane ──────────────────────
```

## Data (forwarding) plane

**Data plane** je *kde se přeposílají pakety*.

Funkce:

- Používá *forwarding tables* (FIB) k *přeposílání* L2 rámců nebo L3 datagramů.
- *Vysoká rychlost* — typicky implementováno v **ASIC** (line cards).
- *Předává* pakety, *které nelze zpracovat*, do **control plane** (např. ARP request, ICMP destination unreachable, *packet for self*).

V CEF ([[prepinani-paketu]]) jsme detail data plane probrali — FIB + Adjacency Table + ASIC-accelerated lookup.

## Proč oddělení rovin?

V *klasickém* síťovém zařízení jsou všechny tři roviny *v jedné krabici*:

- *Management plane* běží jako Linux nebo proprietary OS na CPU.
- *Control plane* běží jako proces v tom OS.
- *Data plane* je v ASIC, řízený z control plane.

Tento monolitický model má nevýhody:

- **Konfigurace složitá** — každé zařízení se konfiguruje *individuálně*, CLI je *vendor-specific* (Cisco IOS ≠ Junos ≠ Arista EOS).
- **Změny pomalé** — manuální zásah na *desítkách až tisících zařízeních*.
- **Optimalizace lokální** — každý router rozhoduje *sám*, bez znalosti globální topologie (ECMP, BGP).
- **Drahá ASIC**, *uzavřená architektura* — vendor lock-in.

**SDN řeší** tyto problémy *fyzickým oddělením* rovin (viz [[sdn-uvod]]):

- Control plane se přesune do **centrálního SDN controlleru** (na *commodity* serveru).
- Data plane zůstává v *jednoduchých switchích* (whitebox).
- Management plane komunikuje s controllerem přes *northbound API* (REST, gRPC).
- Controller komunikuje se switchi přes *southbound API* (OpenFlow, P4Runtime, gNMI).

## Provisioning v klasické síti — bottleneck

```
[New employee hired] → Email IT Operations → Network Team contacts Security
       ↓                                         ↓
[New service]      ←───── We forgot something
       │                                         ↓
       └─── IT contacts Network Team ───→ Network Team contacts Security
                                            ↓
                                  Time spent: WEEKS
```

Tradiční síť: *new VLAN*, *new ACL*, *new BGP peer* — vyžaduje *manuální koordinaci* několika týmů. Provisioning trvá **týdny**. *Human factor je bottleneck*.

**SDN cílí na minutové (nikoliv týdenní) provisioning** — díky centralizovanému API, automatizaci a *konzistentní policy* napříč celou sítí.

## Co dále

Pochopení rovin je předpoklad pro studium **DCN topologií** ([[dcn-topologie]]) — datacentrum klade na separaci rovin *extrémní* nároky kvůli škále.

---

*Zdroj: PDS přednáška 10 (Data center networks, Network programmability), Ing. Matěj Grégr, Ph.D., FIT VUT v Brně. Externí reference: Pepelnjak, I.: „Management, Control, and Data Planes in Network Devices and Systems" (ipSpace.net 2013, [blog.ipspace.net/2013/08/management-control-and-data-planes-in.html](https://blog.ipspace.net/2013/08/management-control-and-data-planes-in.html)).*
