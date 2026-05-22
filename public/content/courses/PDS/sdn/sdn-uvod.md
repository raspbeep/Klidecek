# Software-Defined Networking — koncept a controller

Po seznámení s rovinami routeru ([[roviny-routera]]) a DCN topologiemi ([[dcn-topologie]]) přichází **SDN** — *koncept*, který má tyto tři problémy adresovat: oddělit control plane od data plane, použít commodity hardware, programovatelně řídit síť. Tato sekce vysvětluje *co je* (a *co není*) SDN, role **SDN controlleru** a *northbound/southbound* API.

## Co je SDN (nebo není…)

**SDN má tři klíčové vlastnosti:**

1. **Decoupling of Forwarding Plane and Control Plane** — fyzické oddělení rovin.
2. **Networking on white-boxes / generic hardware** — *commodity* HW místo proprietary ASIC.
3. **Programmability support on embedded network devices to program the network** — schopnost *programovat síť* z aplikace.

**Co SDN není:**

- *Není to jedno specifické řešení, technologie nebo produkt*. Je to *rozsah pokroků* v networkingu.
- Je to **buzz word** používaný k *marketingovým účelům*, k prezentaci nových produktů.
- Ale jsou tu *zajímavé koncepty*, které se objevují.

Vendoři (Cisco *ACI*, VMware *NSX*, Juniper *Contrail*) každý mluví o SDN, ale myslí jím *odlišné věci*. Pro studenty PDS je důležité **abstraktní pochopení** — co SDN slibuje a *proč* je relevantní.

## Co SDN slibuje

> SDN aims to:
>
> - Transform the networking industry and challenge the way we build and manage networks today.
> - Allow administrators to easily control the network, in the same way applications and operating systems.
> - Bring more flexibility to networking to influence design and operations from external applications.
> - Provide new ways of interaction with network devices.

Klíčové slovo: **flexibility**. Klasická síť je *rigidní* — VLAN, BGP konfigurace se mění pomalu. SDN slibuje **API**, přes které aplikace *řídí* síť stejně, jako řídí storage či compute.

## Omezení současné technologie

- Síťová zařízení používají *protokoly/algoritmy* (BGP, OSPF, MPLS), které **nejsou známé** ostatnímu IT personálu.
- Interakce se sítí vyžaduje *jazyk*, který *málo lidí v organizaci rozumí* — *vendor-specific CLI*.
- Existují *use cases*, které je *těžké přeložit do síťové konfigurace ručně*.

V *DevOps* éře, kdy *aplikace* deploy přes Kubernetes během minut, *síť* nemůže být týdny zpožděna.

## SDN adresuje potřeby

- **Centralizovaná konfigurace, management/control, monitoring** síťových zařízení (fyzických či virtuálních).
- *Schopnost přepsat tradiční forwarding algoritmy* pro unique business/technical needs.
- *Umožnit externím aplikacím* nebo systémům **ovlivňovat provisioning a operace** sítě.
- **Rapid and scalable deployment** síťových služeb s *lifecycle management*.

## SDN koncepty

### Co bychom rádi měli

- *Automatický a konzistentní deploy síťových služeb*.
- *Konzistentní policies*.
- *End-to-end visibility*.
- *Rozhodnutí přijatá na centralizovaném pohledu na end-to-end visibility*.
- *Automatic programming nebo konfigurace síťových zařízení*.

### Obvyklé námitky

- *Jak se to liší od Single-Pane-of-Glass?* (Vendor management tools už existují — Cisco DNAC, HPE IMC.)
- *Co se stane při network partition?* (Centralizovaný controller je SPOF.)
- *Proč by to mělo fungovat tentokrát?* (Centralizace byla zkoušena — ATM signaling, *softswitche* v telekomu — selhalo.)

## Co lze a nelze udělat se stávajícími protokoly

**Snadné:**

- *Programmatic device configuration* (management plane interactions přes NETCONF/RESTCONF).
- *IP forwarding table modifications* (BGP, BGP Flowspec).
- *Simple edge policy enforcement* (per-user ACLs).
- *Topology discovery and extraction* (LLDP).

**Těžší:**

- *Non-standard forwarding models* (např. source-based IP routing).
- *Multi-vendor solutions* (few standard YANG models, vendor-specific RADIUS attributes).
- *End-to-end transactional consistency and visibility*.

**Nemožné s existujícími protokoly:**

- *Nové control-plane protokoly*.
- *Modifikace chování existujících control-plane protokolů*.

Tady přichází **OpenFlow** ([[openflow-nfv-p4]]) — *nahrazuje* existující control plane *programovatelným kontroleréem*.

## SDN Toolbox — existující nástroje

Před OpenFlow se SDN dělalo *přes existující protokoly*:

| Plane | Protokoly |
| :--- | :--- |
| Management | **NETCONF**, **SNMP**, RESTCONF |
| Control | **BGP** (FlowSpec, route injection), PCEP |
| Data | **ForCES**, BGP Flowspec, MPLS-TP |

To je *„soft SDN"* — používá *existující* protokoly k *centralizovanému* řízení. Stále má každé zařízení *vlastní control plane*; SDN controller jen *injektuje* policies.

## SDN Toolbox — emerging protocols

S OpenFlow přišly **emerging** protokoly:

| Plane | Protokoly |
| :--- | :--- |
| Management | **OF-Config**, **XMPP**, **OVSDB**, Puppet/Chef |
| Control | **I2RS** (Interface to Routing System), **OVSDB** |
| Data | **OpenFlow** |
| Proprietary | Cisco OnePK |

To je *„hard SDN"* — *plné rozbití* tradičních rovin a *přesun control plane* do controlleru.

## SDN Controller

```
                Northbound API
                     ↑
                ┌────┴────┐
                │  REST   │
                │  Plug-in│
                │ Proprietary│
                └────┬────┘
                     ↑
                ╔════╧════╗
                ║   SDN   ║
                ║Controller║
                ╚════╤════╝
                     ↓
                ┌────┴────┐
                │ OpenFlow│
                │ OnePK   │
                │ CLI/SNMP│
                └────┬────┘
                     ↓
                Southbound API
```

**SDN Controller** = *centralizovaný proces*, který:

- **Northbound** (k *aplikacím*): nabízí *REST API*, plug-iny, proprietární SDK.
- **Southbound** (k *switchům*): používá **OpenFlow**, OnePK, *CLI/SNMP* pro vendor specific zařízení.

### Funkce controlleru

- **Control/Data plane separation** — typicky přes *OpenFlow*.
- **Control- nebo Management plane interaction**:
  - *Existing/new control-plane protocols* (BGP, BGP FlowSpec, I2RS).
  - *Existing/new management-plane protocols* (NETCONF, XMPP, OpFlex).
- **Decoupling and abstracting:**
  - *Overlay virtual networks* (VMware NSX).
  - *Wireless controllers* (Cisco DNA).
  - *VPN solutions*.
- **Proprietary vendor APIs:** Juniper SDK, Cisco OnePK, Arista eAPI, F5 iControl.

Známí SDN controlery: **OpenDaylight** (Linux Foundation), **ONOS** (open-source), **Ryu** (Python), **Floodlight**, **NOX**/**POX**.

Reálné nasazení: *většina enterprise* nemá *čistý* SDN. Mají *hybrid* — některé části (VXLAN overlay, datacentrum) jsou SDN-řízené, jiné (campus, WAN) zůstávají tradiční.

## Reality check

Ve **2015–2018** byl SDN *velký hype*. Dnes je *pragmatičtější* — SDN se prosadil hlavně:

- *V datacentrech* (Google B4 WAN, Microsoft SWAN, Facebook Express Backbone).
- *V SD-WAN* (Cisco Viptela, Versa Networks).
- *Pro cloud overlay* (VMware NSX, Cisco ACI).

Klasické **campus / enterprise** sítě zůstávají *převážně tradiční*. Reality check: SDN je *uskutečnitelný*, ale *není* univerzální řešení.

## Co dále

S abstrakcí SDN v ruce probereme **konkrétní technologie** — **OpenFlow**, **NFV**, **P4** ([[openflow-nfv-p4]]) — *tři pilíře* moderní programovatelné sítě.

---

*Zdroj: PDS přednáška 10, Ing. Matěj Grégr, Ph.D., FIT VUT v Brně. Externí reference: Pepelnjak, I.: „What Is SDN?" ([ipSpace.net](https://blog.ipspace.net/2014/03/what-is-sdn.html)); [ONF SDN Architecture](https://opennetworking.org/sdn-definition/); [OpenDaylight project](https://www.opendaylight.org/).*
