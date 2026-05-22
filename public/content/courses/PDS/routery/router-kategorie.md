# Kategorie směrovačů — core, edge, enterprise, SOHO

Router je *jeden pojem*, ale fyzická realizace pokrývá rozsah od *zařízení za 100 Kč* (Mikrotik) po *bedny za 100 milionů Kč* (Cisco 8000, Juniper PTX). Tato sekce klasifikuje směrovače podle *role* v internetu a popisuje jejich typické *technické parametry*.

## Páteřní směrovač (Core Router)

- Tvoří součást **páteřních sítí** poskytovatelů internetového připojení (ISP, Tier-1).
- Vytváří *vysoce agregovaný přenos* — propojení tisíců menších sítí.

### Požadavky

- *Velmi vysoká rychlost přepínání* — propustnost stovky Gbps až jednotky Tbps na port.
- *Rychlost přepínání závisí na době vyhledávání ve FIB* — *kritická* operace.
- Využití technik **CEF** (Cisco Express Forwarding, viz [[prepinani-paketu]]).
- *Optimalizace vyhledávání cesty* — algoritmus **LPM** (Longest Prefix Match), trie struktury.
- **Hardwarová akcelerace** zpracování paketů na platformách **ASIC** či **FPGA**.

### Důraz na spolehlivost

- Zálohování *napájení*, *přepínacího pole*, *modulů pro zpracování*.
- *Vysoká dostupnost* (high-availability) — 99,999 % uptime ("five nines").
- Hot-swap modulů — výměna *za běhu*.

### Příklady

- **Cisco 8000 Series** — propustnost 3,2 – 518 Tb/s, rozhraní 100–800 GbE.
- **Juniper PTX Series** — propustnost 28,8 – 460,4 Tb/s, rozhraní 400–800 GbE.

## Hraniční směrovač (Edge Router)

- Připojuje *zákaznické sítě* směrem k ISP.

### Požadavky

- *Velké přenosové pásmo* pro připojení k ISP.
- *Agregace zákaznického provozu* z různých přístupových technologií.
- *Redundance komponent* — paměť, síťové moduly, napájení.

### Přístupové technologie WAN

- **PPTP, PPPoE, L2TP, IPSEC VPN** — tunelované spojení.
- **IP/MPLS, 5G/LTE** — moderní páteřní technologie.
- **Optické porty SFP+/QSFP** — vysokorychlostní fiber.
- *SDN* (Software-Defined Networking) — programovatelnost.

### Zabezpečení

- *Vysoká propustnost šifrovaného provozu IPsec* — typicky ASIC akcelerátor ~300 Gb/s.
- *Filtrování* — velké množství pravidel (~300+ ACL pravidel).

### Příklady

- **Cisco Catalyst 8500** — propustnost 20 – 500 Gb/s.
- **Juniper MX Series** (Universal Edge Routers) — propustnost 400 Gb/s – 80 Tb/s.

## Podnikový směrovač (Enterprise Router, Branch Router)

- Propojuje koncové systémy v *podnikových sítích*.

### Požadavky

- *Velké počty portů* na rychlostech 1–10 GbE.
- **Modulární a rozšiřitelné řešení** — možnost přidávat karty (4G/5G, fiber, kopper).
- *WAN technologie:* Ethernet (1–100 Gb/s), optické vlákno, *podpora 5G*.
- *Podpora QoS, VLAN* (virtuálních sítí).
- **ISSU** (In-Service Software Upgrade) — aktualizace softwaru *za běhu*.
- *Podpora NFV* (Network Function Virtualization) — virtualizace síťových funkcí (firewall, NAT, VPN).
- *Efektivní přenos multicastu a broadcastu*.
- *Bezpečnost* — filtrování, VPN sítě.

### Příklady

- **Cisco Network Convergence System (NCS)** — propustnost 800 Gb/s.
- **Cisco Aggregation Services Routers (ASR)** — propustnost 160 Tb/s.
- **Juniper ACX Series** — propustnost 60 Gb/s – 4,8 Tb/s.

## Domácí směrovač (SOHO Router)

- Zařízení pro připojení *uživatele či domácnosti*.

### Charakteristiky

- *Menší počet portů* (8, 12, 16).
- Rychlost typicky **1 Gb/s**.
- Připojení do WAN: *Ethernet*, *kabelový modem*, *xDSL*.
- Připojení do LAN: *Ethernet*, *WiFi 802.11a/b/g/n/ac/ax/be*, *RJ-11* (klasický telefon), *USB*.
- *Důraz na cenu*, proprietární řešení.
- *Softwarová implementace*, linuxové jádro (OpenWrt, DD-WRT) → **nižší propustnost**.

### Menší možnosti konfigurace

- *Vzdálený přístup* k zařízení, filtrovací pravidla.
- *Podpora DHCP, NAT, statického směrování, RIP*.
- *Malá podpora vzdálené správy* (SNMP, syslog).

### Příklady a propustnost

- **Asus** — 600–1300 Mb/s.
- **Linksys** — 400–800 Mb/s.
- **Belkin** — 300–450 Mb/s.
- **Mikrotik** — 12–80 Gb/s (specifické modely, vysoce konfigurovatelné).
- **Turris** — ~1 Gb/s (open-source, vysoká bezpečnost).

## Klíčové rozdíly mezi kategoriemi

| Aspekt | SOHO | Enterprise | Edge | Core |
| :--- | :--- | :--- | :--- | :--- |
| Propustnost | 100 Mb/s – 1 Gb/s | 10 Gb/s – 1 Tb/s | 100 Gb/s – 10 Tb/s | 1 Tb/s – 500 Tb/s |
| Portů | 4–16 | 24–96 | 24–96 | 100+ |
| Implementace | software (Linux) | hybrid | ASIC + software | čistý ASIC/FPGA |
| Redundance | nemá | částečná | full | full (dual power, dual fabric) |
| Cena | $50–500 | $5k–100k | $100k–1M | $1M–10M+ |
| Příklady | Asus RT-AX86U | Cisco ASR 920 | Cisco ASR 9000 | Cisco 8000 |

## Co dále

Jakmile víme *jakou role router hraje*, můžeme se podívat na **architekturu uvnitř** — funkční a fyzické části, kontext paketu, fáze zpracování. Viz [[router-architektura]].

---

*Zdroj: PDS přednáška 5, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: [Cisco 8000 Series Routers](https://www.cisco.com/c/en/us/products/routers/8000-series-routers/index.html); [Juniper PTX Series Routers](https://www.juniper.net/us/en/products/routers/ptx-series.html).*
