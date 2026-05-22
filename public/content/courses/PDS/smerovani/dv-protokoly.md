---
title: DV protokoly — RIP, EIGRP, Babel
---

# Konkrétní distance-vector protokoly

Předchozí sekce ([[distance-vector]]) ustanovila *teorii* — Bellman-Ford, count-to-infinity, obranné mechanismy. Teď konkrétní zástupci: **RIP** (1988, učebnice), **RIPng** (IPv6 verze), **EIGRP** (Cisco, DUAL), **Babel** (moderní mesh). Sekce ukáže, jak různě se *stejný princip* parametrizuje.

## RIPv1 (1988) — historický artefakt

[RFC 1058](https://www.rfc-editor.org/rfc/rfc1058). První standardizovaný IP routing protokol. Specifikace má dvě a půl stránky. *Dnes se nepoužívá*, ale slouží jako učebnicový vzor.

| Vlastnost | Hodnota |
| :--- | :--- |
| Algoritmus | Bellman-Ford |
| Metric | hop count |
| `∞` | **16** |
| Update interval | 30 s |
| Invalid timer | 180 s (6 missed updates) |
| Hold-down | 180 s |
| Flush | 240 s |
| Transport | UDP port 520 |
| Distribuce | broadcast `255.255.255.255` |
| Classful | ano (žádný subnet mask) |
| AD (Cisco) | 120 |

Problémy:

- **Classful** — neumí VLSM. Síť `10.0.0.0/16` se interpretovala jako `10.0.0.0/8` (class A).
- **Plaintext** — žádná autentizace, kdokoliv může injektovat trasy.
- **Broadcast** — všechny zařízení na segmentu dostanou update, i ne-routery.
- **Hop limit 15** — síť větší než 15 hopů neexistuje.

Update formát: každý 30 s router pošle *celý DV* všem sousedům:

```
Command: 2 (Response)
Version: 1
Entries:
  Address Family: 2 (IP)
  IP Address:     192.168.1.0
  Metric:         3
  Address Family: 2
  IP Address:     10.5.0.0
  Metric:         7
  ...
```

Bandwidth režie: 25 entries / paket. Při 100 trasách = 4 pakety každých 30 s.

## RIPv2 (1998) — pragmatický refresh

[RFC 2453](https://www.rfc-editor.org/rfc/rfc2453). Stejný princip, *modernější paket*:

- **Subnet mask** — podporuje VLSM/CIDR.
- **Next-hop** — explicitní (umožní routovat přes router, který *není* odesílatel update).
- **Multicast** — `224.0.0.9` místo broadcastu.
- **Authentication** — plaintext nebo MD5 password.
- **Route tag** — značka pro redistribuované trasy (z BGP např.).

Zbytek (algoritmus, časy, hop limit) identický. *V malých sítích používaný*; v moderních enterprise spíš OSPF.

## RIPng — IPv6 verze

[RFC 2080](https://www.rfc-editor.org/rfc/rfc2080). RIP pro IPv6.

Změny:

- Adresy 128-bit.
- UDP port **521** (ne 520).
- Multicast `FF02::9` (link-local).
- Bez authentication v protokolu — *spoléhá na* IPsec.
- Next-hop *zvlášť* (1 next-hop pro skupinu prefixů → menší pakety).

Zbytek stejný — Bellman-Ford, 30 s, hop count, max 15.

## EIGRP (1992 → otevřen 2013)

**Enhanced Interior Gateway Routing Protocol** — Cisco's flagship DV. Po dvou dekádách proprietary v 2013 Cisco zveřejnilo specifikaci jako [RFC 7868](https://www.rfc-editor.org/rfc/rfc7868) (informational). Implementace existuje v Juniperu, FRR a dalších.

| Vlastnost | Hodnota |
| :--- | :--- |
| Algoritmus | **DUAL** (Diffusing Update Algorithm) |
| Metric | composite (bandwidth + delay [+ load + reliability + MTU]) |
| Updates | **incremental + triggered** (ne periodické full DV!) |
| Transport | IP protokol 88 (vlastní, ne UDP) |
| Multicast | `224.0.0.10` / `FF02::A` |
| AD (Cisco) | 90 (internal), 170 (external), 5 (summary) |
| `∞` | velmi velké (32-bit metric) |

### Composite metric

Klasický EIGRP vzorec (5 K-konstant, 4 jsou defaultně 0):

$$
\text{metric} = \left[ K_1 \cdot \text{BW} + \frac{K_2 \cdot \text{BW}}{256 - \text{load}} + K_3 \cdot \text{delay} \right] \cdot \frac{K_5}{K_4 + \text{reliability}} \cdot 256
$$

Default `K_1 = K_3 = 1`, ostatní 0 → metric ≈ bandwidth + delay. Modernější *Wide Metric* (64-bit) pro 10 Gbps+ linky.

### DUAL výhody nad RIP

- **Sub-second konvergence** s Feasible Successor (backup pre-computed).
- **No periodic floods** — jen hello packety (5 s) jako keep-alive.
- **No count-to-infinity** — Feasibility Condition matematicky garantuje acyklicitu.

### EIGRP topologie

V routeru:

- **Topology Table** — *všechny* trasy ze všech sousedů.
- **Routing Table** — vybraní Successors (instalovaní pro forwarding).

Když Successor selže:

1. Pokud máš Feasible Successor → instaluj okamžitě (žádný query).
2. Jinak → **active state** — pošli query všem sousedům "kdo zná trasu?". Po odpovědích zvol nového Successor.

V perfektně designované síti hodně cest má FS → 95+% selhání se *vyřídí <1 s*.

## Babel — moderní mesh protokol

[RFC 8966](https://www.rfc-editor.org/rfc/rfc8966), 2021. Designed pro **wireless mesh** (community networks: Freifunk, Guifi, Funkfeuer) — kde linky padají, RTT kolísá, ztrátovost vysoká.

Klíčové rozdíly od RIP/EIGRP:

| | RIP | Babel |
| :--- | :---: | :---: |
| Update | full DV | incremental |
| Loop avoidance | poison reverse | **feasibility conditions** |
| Metric | hop count | configurable (cost based on **link quality**) |
| Link metric measurement | — | *aktivně* (hello packets, expected losses) |
| Convergence | minuty | sekundy |

### ETX — Expected Transmission Count

Babel měří *kolik retransmisí* na linku v průměru potřebuje paket:

$$
\text{ETX} = \frac{1}{p_\text{forward} \cdot p_\text{reverse}}
$$

kde $p_\text{forward}$ je míra úspěchu doručení tam, $p_\text{reverse}$ zpátky. Lossy WiFi linka může mít ETX = 4 (4 retransmisí na úspěch). Stejné ETX znamená *stejnou efektivní bandwidth* napříč různými fyzickými vrstvami.

### Aplikace

- **Freifunk** (Německo) — města mesh sítí, 30 000+ uzlů; Babel default.
- **Guifi.net** (Katalánsko) — největší community mesh, mixed Babel + BGP.
- **Lab a research** — NS3 / Mininet experimenty.

V enterprise sítích **se nepoužívá** — OSPF, EIGRP, IS-IS lépe fungují v deterministických L2 prostředích.

## Srovnání DV protokolů

| | RIPv1 | RIPv2 | RIPng | EIGRP | Babel |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Rok | 1988 | 1998 | 1997 | 1992 | 2011 |
| IPv | 4 | 4 | 6 | 4+6 | 4+6 |
| VLSM | ✗ | ✓ | ✓ | ✓ | ✓ |
| Multicast | ✗ | ✓ | ✓ | ✓ | ✓ |
| Algoritmus | BF | BF | BF | DUAL | BF + feasibility |
| Metric | hops | hops | hops | composite | ETX-like |
| Auth | ✗ | MD5/plain | (IPsec) | MD5/SHA | (extern) |
| Konvergence | minuty | minuty | minuty | <1 s | sekundy |
| Dnes | nepoužívaný | malé sítě | malé IPv6 | Cisco-only | mesh |

## Kdy DV?

- **Učební cíle** — DV je jednodušší než link-state ([[link-state]]).
- **Malé sítě (<50 routerů)** — RIPv2 dostatečné.
- **Cisco-only enterprise** — EIGRP s DUAL je výkonný a snadno konfigurovatelný.
- **Mesh / IoT** — Babel pro nedeterministické linky.

Pro většinu *seriózních* sítí se ale dnes přechází na **link-state** — OSPF, IS-IS. Tam jde celá kapitola dál.

## Co dál

Link-state filosofie ([[link-state]]) — *opak* DV — router *zná celou topologii* a centrálně počítá nejkratší cesty Dijkstrovým algoritmem.

---

*Zdroj: PDS přednáška 3 (Směrování), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 2453 — RIPv2](https://www.rfc-editor.org/rfc/rfc2453); [RFC 2080 — RIPng](https://www.rfc-editor.org/rfc/rfc2080); [RFC 7868 — EIGRP](https://www.rfc-editor.org/rfc/rfc7868); [RFC 8966 — Babel](https://www.rfc-editor.org/rfc/rfc8966); Doyle, J., Carroll, J.: *Routing TCP/IP, Vol. I* (Cisco Press 2005), kap. 5–6; Chroboczek, J.: „The Babel Routing Protocol" (Internet-Draft → RFC).*
