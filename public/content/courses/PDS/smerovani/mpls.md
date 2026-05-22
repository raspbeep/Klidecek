---
title: MPLS — label switching
---

# MPLS — label switching jako mezivrstva

Klasický IP forwarding znamená *longest prefix match* na **každém routeru** po cestě — drahá hardware operace, často 1M+ záznamů ([[smerovaci-tabulky]]). **MPLS** (*Multiprotocol Label Switching*, [RFC 3031](https://www.rfc-editor.org/rfc/rfc3031), 2001) řeší: na *edge* routeru se IP paket *jednou* klasifikuje a obalí krátkým **labelem**; *core* routery pak fungují *jen na labelu* — rychlé table lookup. Bonus: labely umožňují **traffic engineering**, **VPN**, **QoS** way beyond čistého IP routingu.

## Layer 2.5 — mezi IP a Ethernet

MPLS *nesedí* na žádné OSI vrstvě čistě:

- Nad IP (L3)? *Nestačí* — paket není routován podle IP, ale podle labelu.
- Pod IP (L2)? *Skoro* — label je vsunut mezi IP hlavičku a L2 framing.

Proto **"layer 2.5"**. Formát:

```
[ Ethernet header | MPLS label | IP header | TCP/UDP | payload ]
```

MPLS header je **4 B**:

::: svg "MPLS label stack entry — 4 B"
<svg viewBox="0 0 540 130" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="40"  y="30" width="280" height="40"/>
    <rect x="320" y="30" width="50"  height="40"/>
    <rect x="370" y="30" width="40"  height="40"/>
    <rect x="410" y="30" width="80"  height="40"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="180" y="48">Label (20 b)</text>
    <text x="180" y="63" font-size="9" fill="var(--text-muted)">2^20 = 1M hodnot</text>
    <text x="345" y="48">TC (3)</text>
    <text x="345" y="63" font-size="9" fill="var(--text-muted)">QoS class</text>
    <text x="390" y="48">S (1)</text>
    <text x="390" y="63" font-size="9" fill="var(--text-muted)">stack bottom</text>
    <text x="450" y="48">TTL (8)</text>
  </g>
  <text x="265" y="100" fill="var(--text-muted)" text-anchor="middle" font-size="10">Můžeš mít víc labelů ve stacku — vrstevnaté MPLS (VPN, TE)</text>
</svg>
:::

- **Label** (20 b) — hodnota pro lookup. Lokální význam *per-link*, ne globální.
- **TC** (3 b) — Traffic Class (původně EXP, dnes QoS DSCP-like).
- **S** (1 b) — Bottom-of-stack. `1` = poslední label, dále IP. `0` = další label následuje.
- **TTL** (8 b) — like IP TTL, dekrementuje se na hopu.

Lze stackovat několik labels — typicky 2 pro MPLS VPN, 3+ pro MPLS-TE.

## Komponenty MPLS sítě

| | Role |
| :--- | :--- |
| **LER** (Label Edge Router) | hraniční. Vstupní LER klasifikuje IP → label, "push". Výstupní pop & forward IP. |
| **LSR** (Label Switching Router) | jádrový. Lookup *jen na labelu*, swap label, forward. |
| **LSP** (Label Switched Path) | cesta od ingress LER k egress LER, identifikovaná posloupností labels. |
| **FEC** (Forwarding Equivalence Class) | množina IP toků, které mají stejný *next-hop* a *politiku* → stejný label. |

::: svg "MPLS forwarding — push, swap, pop"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1.5">
    <rect x="20" y="80" width="60" height="40"/>
    <rect x="120" y="80" width="60" height="40"/>
    <rect x="220" y="80" width="60" height="40"/>
    <rect x="320" y="80" width="60" height="40"/>
    <rect x="420" y="80" width="60" height="40"/>
    <rect x="490" y="80" width="40" height="40" fill="var(--bg-inset)" stroke="none"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="50" y="105">IP src</text>
    <text x="150" y="100">Ingress</text>
    <text x="150" y="113">LER</text>
    <text x="250" y="105">LSR</text>
    <text x="350" y="105">LSR</text>
    <text x="450" y="100">Egress</text>
    <text x="450" y="113">LER</text>
    <text x="510" y="105">IP dst</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5" fill="none" marker-end="url(#arr2)">
    <line x1="82" y1="100" x2="115" y2="100"/>
    <line x1="182" y1="100" x2="215" y2="100"/>
    <line x1="282" y1="100" x2="315" y2="100"/>
    <line x1="382" y1="100" x2="415" y2="100"/>
    <line x1="482" y1="100" x2="490" y2="100"/>
  </g>
  <defs>
    <marker id="arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--text-muted)" font-size="9" text-anchor="middle">
    <text x="150" y="55">push 17</text>
    <text x="250" y="55">swap 17 → 22</text>
    <text x="350" y="55">swap 22 → 35</text>
    <text x="450" y="55">pop</text>
  </g>
  <g fill="var(--text-faint)" font-size="9" text-anchor="middle">
    <text x="200" y="155">label=17</text>
    <text x="300" y="155">label=22</text>
    <text x="400" y="155">label=35</text>
  </g>
</svg>
:::

1. **Ingress LER**: paket s IP `10.5.0.42` → klasifikace → FEC → push label **17**.
2. **LSR 1**: lookup label 17 → "swap to 22, forward eth1".
3. **LSR 2**: lookup label 22 → "swap to 35, forward eth2".
4. **Egress LER**: lookup label 35 → "pop, IP forward to `10.5.0.42`".

Core LSR *vůbec se nedívá na IP*. Lookup je `(incoming label, incoming port) → (outgoing label, outgoing port)` — **table size << IP routing table**. Pro core router se globální 1M IP prefixů smrští na zhruba *desítky tisíc labels* (1 per FEC).

## Forwarding Equivalence Class (FEC)

Cokoliv, co se má forwardovat **stejně**, je v jedné FEC. Definice je flexibilní:

- *IP prefix* — všechny IP `10.5.0.0/16` → FEC "do Brna".
- *5-tuple* — specifické (src, dst, proto, src-port, dst-port) → speciální path.
- *MPLS VPN customer* — všechen traffic customer X → tunnel X.

Klasifikace probíhá **jen** na ingress LER — pak label nese FEC po zbytek cesty.

## Label Distribution Protocol (LDP)

Aby LSR věděl *"label 17 z ethernet 1 = label 22 na eth 0"*, musí někdo *naprogramovat* tabulku.

**LDP** ([RFC 5036](https://www.rfc-editor.org/rfc/rfc5036)) je nejjednodušší. Princip:

1. *LSR sousedí přes UDP 646*, vytvoří LDP session přes TCP.
2. Každý LSR si pro každý prefix v IGP vytvoří *lokální label* (z dynamic range `16–1048575`).
3. Pošle peer-routerům: *"Pro prefix `10.5.0.0/16` použij label 17, když mi tudy něco pošleš."*
4. Peer si to uloží do tabulky — `(prefix 10.5.0.0/16) → (next-hop = sosed, outgoing label = 17)`.

LDP *kopíruje* IGP topologii — labels mappujou na nejkratší IGP cestě. Nelze řídit *kudy* LSP vede.

## RSVP-TE — Traffic Engineering

[RFC 3209](https://www.rfc-editor.org/rfc/rfc3209). Rozšíření RSVP pro **explicitní LSP routes**.

Administrátor:

1. Definuje LSP s **explicit route** — sequence routerů.
2. RSVP-TE pošle *Path* zprávu po této cestě, *rezervuje* bandwidth na každém linku.
3. Egress odpoví *Resv* zprávou s allocated label.
4. Path zpět se "stačí" install — bandwidth zarezervována, label distribuován.

Výsledek: LSP, který **NEjede** po IGP shortest path; přesměrovává traffic kolem přetížených linek nebo přes konkrétní páteř.

Příklad: 10 Gbps link od Frankfurt → Mnichov je zaplněn 80 %. Admin vytvoří **RSVP-TE LSP** Frankfurt → Praha → Vídeň → Mnichov. Pro určité customery se to forwarduje. Off-loading: zaplněný link klesne na 50 %.

## Segment Routing (SR-MPLS) — moderní náhrada

LDP/RSVP-TE mají problémy:

- LDP nemůže traffic engineer.
- RSVP-TE drží *state per LSP* na všech routerech → komplikovaná údržba.

**Segment Routing** ([RFC 8402](https://www.rfc-editor.org/rfc/rfc8402), 2018) přesouvá *state* z core do *ingress paketu*. Ingress LER vloží **stack labels** (= sequence "segmentů"), core LSR jen popují a swappují:

```
[ outer label A ][ inner label B ][ inner label C ][ IP ]
```

Každý label = "next segment". Core LSR pop top label, forward — žádná per-flow state.

Výhody:

- **Stateless** core.
- *Explicit* path bez RSVP signalizace.
- Snadná **TI-LFA** (Topology-Independent Loop-Free Alternate) — fast reroute.

Dnes (2026) Segment Routing nahrazuje RSVP-TE u většiny velkých provozovatelů (Telia, Orange, NTT). SR-MPLS koexistuje s **SRv6** (Segment Routing nad IPv6, žádné MPLS labely — Source Routing rozšíření IPv6).

## Aplikace MPLS — VPN

Nejpopulárnější *praktická* MPLS aplikace: **MPLS VPN** ([RFC 4364](https://www.rfc-editor.org/rfc/rfc4364)). Provider provozuje *jednu* fyzickou síť a *nabízí* mnoha customer VPNs — každý customer se chová jako *vlastní* virtual private network.

Mechanismus:

- **Provider Edge (PE)** přijme customer IP traffic přes **VRF** (Virtual Routing & Forwarding) instance — separátní routing table per customer.
- PE vrazí **inner label** = "customer VRF" + **outer label** = "MPLS tunnel k destination PE".
- Core P routery jen forwardují outer label.
- Destination PE pop outer, lookup inner → forward do správné VRF.

Customer adresní prostor se *netříská* — Customer A používá `10.0.0.0/8`, Customer B taky `10.0.0.0/8` — *paralelně*, ve dvou VRF instancích.

V 2026 je MPLS VPN základní *enterprise WAN* offering od Verizon, Orange, AT&T, BT, Telefónica. *Konkurence* — SD-WAN a Internet-VPN — *neslevila* MPLS úplně, protože dává *garantovanou SLA*.

## QoS s MPLS — EXP/TC bity

3-bit TC pole v MPLS labelu nese QoS class. Mapuje se z IP DSCP na ingress, zpět na egress. Core routery uplatňují QoS strategie (priority queueing, WRED) podle TC bez čtení IP. Detaily v [[zpracovani-uvod]] — nyní jen zaznamenáváme, že MPLS to umožňuje *transparentně*.

## Penultimate Hop Popping (PHP)

Na egress LER musí pop label a IP forward. Drobná optimalizace: *předposlední* LSR pop label *za* egress LER. Egress dostane *čistý* IP paket — žádný label lookup nutný, jen IP forward.

Realizováno přes speciální *reserved label*: **3** (implicit-null) — *"místo swap, pop tento label"*. Šetří mikrosekundy v core. Standardní v všech MPLS deploymentech.

## Kdy MPLS, kdy ne

**MPLS pro**:

- Service Provider core (BGP-free core: edge routery dělají IP/BGP, core jen MPLS).
- Enterprise WAN (MPLS VPN).
- Traffic Engineering (RSVP-TE, SR).
- Layer 2 over Layer 3 (Pseudowire, VPLS).

**MPLS ne**:

- Malé enterprise (jednoduché IPsec VPN stačí).
- Cloud-native (overlay sítě: VXLAN, Geneve).
- Mobilní / IoT (overhead).

V 2026 se MPLS přesouvá od **LDP/RSVP-TE → Segment Routing**, a od **IPv4-based → SRv6**. Páteřní telco sítě stále *centrálně* MPLS-driven.

## Co dál

Kapitola o routingu končí. Závěrečné téma — **konvergence a smyčky** ([[konvergence-smycky]]) — sjednotí teorii smyček, hold-down, split horizon a shrne mechanismy stabilizace napříč všemi protokoly.

---

*Zdroj: PDS přednáška 3 (Směrování), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 3031 — MPLS Architecture](https://www.rfc-editor.org/rfc/rfc3031); [RFC 3032 — MPLS Label Stack Encoding](https://www.rfc-editor.org/rfc/rfc3032); [RFC 5036 — LDP](https://www.rfc-editor.org/rfc/rfc5036); [RFC 3209 — RSVP-TE](https://www.rfc-editor.org/rfc/rfc3209); [RFC 4364 — BGP/MPLS IP VPNs](https://www.rfc-editor.org/rfc/rfc4364); [RFC 8402 — Segment Routing Architecture](https://www.rfc-editor.org/rfc/rfc8402); De Ghein, L.: *MPLS Fundamentals* (Cisco Press 2007); [APNIC — MPLS Workshop materials](https://www.apnic.net/).*
