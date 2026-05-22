# Průchod paketu sítí

Adresy ([[adresovani-l2]], [[adresovani-l3]]) jsou *statický* popis. Tato sekce je *dynamická* — sledujeme **konkrétní paket** od aplikace odesílatele přes drát, switche, routery až k aplikaci příjemce. Cílem je upevnit klíčové pojmy: **hop-by-hop vs. end-to-end**, **ARP / NDP**, **default gateway**, **routing table lookup**.

## Klíčová terminologie

- **Adjacent devices** — sousední zařízení na stejné lince / stejném segmentu (L2-přístupné).
- **Hop-by-hop** — *one TTL hop away*; každý router je jeden hop.
- **End-to-end** — *{0, n} hops away*; logická komunikace mezi koncovými body.

## Scénář 1: Unicast v rámci jedné LAN

Host A (`192.168.1.10`, MAC `AA:..:AA`) chce poslat IP paket na host B (`192.168.1.20`, MAC `BB:..:BB`). Oba jsou v *téže LAN* (`192.168.1.0/24`).

1. **Lokální rozhodnutí.** A si spočte `dest_net = 192.168.1.20 AND mask` a srovná se svojí sítí. Zjistí, že B je *lokální* (stejný NetId).
2. **ARP lookup.** A potřebuje MAC pro `192.168.1.20`. Podívá se do **ARP cache**:
   - Hit → použije známou MAC.
   - Miss → pošle **ARP request** (L2 broadcast `FF:FF:FF:FF:FF:FF`): *„Who has 192.168.1.20? Tell 192.168.1.10."*
3. **ARP reply.** B odpoví unicast: *„192.168.1.20 is at BB:..:BB."*. A si uloží mapování.
4. **Odeslání rámce.** A pošle Ethernet rámec:
   ```
   [ dst=BB:..:BB | src=AA:..:AA | EtherType=0x0800 | IP packet | FCS ]
   ```
   IP hlavička: `src=192.168.1.10, dst=192.168.1.20`.
5. **Switch.** Switch v LAN přepošle rámec na port, kde má v CAM tabulce MAC B (viz [[sitove-zarizeni]]). *Žádný router se neúčastní* — komunikace v rámci jedné L2 broadcast domény.

## Scénář 2: Unicast mezi LAN — přes router

Host A (`192.168.1.10`, `192.168.1.0/24`) chce poslat na host C (`10.0.0.5`, `10.0.0.0/24`) v *jiné* LAN. Mezi LAN je router R s rozhraními `192.168.1.1` (v LAN A) a `10.0.0.1` (v LAN C). A má v konfiguraci *default gateway = `192.168.1.1`*.

1. **Lokální rozhodnutí.** A zjistí, že C je *vzdálené* (jiný NetId). Cíl L3 je `10.0.0.5`, ale **next-hop L2** bude default gateway.
2. **ARP pro gateway.** A potřebuje MAC routeru R (`192.168.1.1`). Buď je v ARP cache, nebo proběhne ARP request/reply.
3. **První rámec.** A pošle:
   ```
   L2: [ dst=MAC(R) | src=MAC(A) ]
   L3: [ src=192.168.1.10 | dst=10.0.0.5 ]   ← end-to-end IP
   ```
   *Pozorování:* L2 cíl je *MAC routeru* (sousedního), L3 cíl je *koncová IP*. To je **hop-by-hop vs end-to-end** v praxi.
4. **Router R přijme rámec.** Router:
   - Dekapsuluje L2.
   - Podívá se na destination IP `10.0.0.5`.
   - V *routing table* najde longest-prefix match — najde `10.0.0.0/24 → eth1`.
   - Sníží TTL o 1.
   - Přepočte IPv4 header checksum.
   - Pro odeslání potřebuje MAC `10.0.0.5` — ARP v LAN C.
5. **Druhý rámec.** R pošle:
   ```
   L2: [ dst=MAC(C) | src=MAC(R-eth1) ]
   L3: [ src=192.168.1.10 | dst=10.0.0.5 ]   ← stále původní
   ```
   *L2 hlavička se kompletně přepsala* (nový src/dst MAC). *L3 hlavička je stejná* (až na TTL a checksum).

## Klíčové pravidlo

> **L2 hlavička je hop-by-hop, mění se na každém routeru.**
> **L3 hlavička je end-to-end, prochází beze změny (kromě TTL/HopLimit a checksum).**

Tato vlastnost je *základ celého internetu* — kdokoli kdekoli může poslat paket komukoli jinému, protože každý router *jen rozhodne další hop* (longest-prefix lookup), nemusí znát globální topologii.

## Scénář 3: Broadcast a Multicast

### IPv4 Limited Broadcast (`255.255.255.255`)

A pošle paket s dest IP `255.255.255.255`. Router *nepřeposílá* — paket zůstane v lokální broadcast doméně.

L2 cíl: `FF:FF:FF:FF:FF:FF`. Všechny uzly v LAN dostanou rámec, předají L3, který si rozhodne o zpracování.

Typické použití: **DHCP Discover** — klient bez IP adresy se nemá *jak* zeptat na adresu jinak.

### IPv4 Multicast

A pošle paket s dest IP `224.10.10.5`. L2 cíl: `01:00:5e:0a:0a:05` (mapping z předchozí sekce, [[adresovani-l2]]).

Switch s **IGMP snooping** posílá rámec *jen na porty*, kde má registrované *zájemce* (uzly, které se přihlásily přes IGMP). Tím se omezuje šíření multicastu.

Multicast routing **přes routery** funguje přes protokoly jako **PIM** (Protocol Independent Multicast) — pokročilé téma mimo recap.

### IPv6 NDP místo ARP

IPv6 nemá ARP — místo něj **NDP** (RFC 4861) používá ICMPv6:

1. *Neighbor Solicitation* (typ 135) — odesláno na solicited-node multicast adresu (`ff02::1:ffXX:XXXX`).
2. *Neighbor Advertisement* (typ 136) — odpověď unicast s MAC.

Solicited-node multicast je *mnohem efektivnější* než broadcast — jen omezený počet hostů poslouchá danou multicast skupinu (těch, kteří mají poslední 24 bitů adresy stejné).

## Scénář 4: Anycast

Anycast vypadá *stejně* jako unicast z pohledu odesílatele — pošle se na jednu IP. Rozdíl je v *routingu*: víc uzlů má přiřazenu *tutéž* IP, a routing doručí na nejbližší (podle BGP / IGP metriky).

Příklad: dotaz na DNS `8.8.8.8` (Google DNS). V Brně se dotaz routuje na Google's PoP ve Frankfurtu; v Tokiu na PoP v Tokiu. Klient nepozná rozdíl — odpověď přijde stejně.

## Routing table — co skutečně rozhoduje

Když router přijme paket, dělá **longest-prefix match (LPM)** v routing tabulce:

```
Destination          Next-hop      Interface
0.0.0.0/0            10.0.0.1      eth0       (default route)
192.168.1.0/24       direct        eth1
10.0.0.0/8           10.0.0.1      eth0
10.0.5.0/24          10.0.5.1      eth2
```

Pro dest `10.0.5.42`:

- `0.0.0.0/0` matchuje (0 bits) → ne.
- `10.0.0.0/8` matchuje (8 bits) → ano.
- `10.0.5.0/24` matchuje (24 bits) → **ano, nejdelší shoda**.
- Použije se `next-hop = 10.0.5.1, interface = eth2`.

Longest-prefix match je *netriviální algoritmus*; jeho efektivní implementace je předmět celé přednášky o **klasifikaci paketů** ([[klasifikace-uvod]]).

## Co bylo a co bude

Tato sekce uzavírá první přednášku (recap *Networker's Handbook part 1*). Prošli jsme:

- *Komunikace* — protokol, modely, transfer types, CO/CL ([[komunikace]]).
- *Vrstvy* — ISO/OSI, TCP/IP, encapsulation, PDU ([[vrstvene-modely]]).
- *Zařízení* — modem, hub, switch, router, kolize/broadcast ([[sitove-zarizeni]]).
- *L2 adresování* — Ethernet, MAC, EUI-48, ARP ([[adresovani-l2]]).
- *L3 adresování* — IPv4 (classful/classless/CIDR), IPv6 (header, EH, multicast), NDP ([[adresovani-l3]]).
- *Průchod paketu* — hop-by-hop vs end-to-end, ARP, default gateway, LPM (tato sekce).

V dalších přednáškách PDS budeme tyto základy *prohlubovat*:

- Lec 2 — **Transportní vrstva** (TCP, UDP, QUIC) → [[transport-uvod]]
- Lec 3 — **Směrování** (RIP, OSPF, BGP) → [[smerovani-uvod]]
- Lec 4 — **Přepínání** (VLAN, STP, 802.1Q) → [[prepinac-uvod]]
- Lec 5 — **Architektura směrovačů** → [[router-funkce]]
- Lec 6 — **Klasifikace paketů** → [[klasifikace-uvod]]
- Lec 7 — **P2P sítě** → [[p2p-uvod]]
- Lec 8 — **Detekce průniku (IDS)** → [[ids-uvod]]
- Lec 9 — **Zpracování paketů** → [[zpracovani-uvod]]
- Lec 10 — **SDN** → [[sdn-uvod]]

---

*Zdroj: PDS přednáška 1 (Networker's Handbook, part 1), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 826 — ARP](https://www.rfc-editor.org/rfc/rfc826); [RFC 4861 — Neighbor Discovery for IPv6](https://www.rfc-editor.org/rfc/rfc4861); Kurose, J.F., Ross, K.W.: *Computer Networking: A Top-Down Approach* (8. vyd., Pearson 2021), kap. 4–6.*
