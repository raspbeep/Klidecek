---
title: Linux kernel networking — sk_buff, NetDevice, netfilter
---

# Linux kernel — jak vnitřně vypadá síťový stack

Linux kernel je *otevřený*, *široce nasazený* a *kanonický* příklad implementace síťového stacku. Tato sekce probere klíčové struktury — `sk_buff` (paket) a `net_device` (rozhraní) — a hookovací body **netfilter** (firewall, NAT). Cílem je: rozumět *kde* lze do paketu *zasáhnout* a *za jakou cenu*.

## net_device — abstrakce rozhraní

Každé síťové rozhraní (Ethernet card, WiFi, virtuální `lo`, Docker `veth`, tunnel `tun0`) je v kernelu reprezentováno strukturou `struct net_device` definovanou v `include/linux/netdevice.h`.

Pole (zkráceně):

```c
struct net_device {
    char name[IFNAMSIZ];           // "eth0", "wlan0"
    int  irq;                      // interrupt number
    unsigned int mtu;              // 1500 default
    unsigned char dev_addr[6];     // MAC adresa
    unsigned short flags;          // IFF_UP, IFF_PROMISC, ...
    netdev_features_t features;    // GRO, GSO, TSO, checksumming
    const struct net_device_ops *netdev_ops;   // callback table
    const struct ethtool_ops *ethtool_ops;     // ethtool callbacks
    void *priv;                    // driver-private data
    /* … hundreds of more fields … */
};
```

Klíčový design: **callback tables** (`netdev_ops`, `ethtool_ops`). C nemá interfaces — implementuje se *strukturou ukazatelů na funkce*. Kernel volá `dev->netdev_ops->ndo_start_xmit(skb, dev)`, driver poskytl konkrétní implementaci.

Standardní callbacky:

- `ndo_open`, `ndo_stop` — bring interface up/down.
- `ndo_start_xmit` — transmit paket (z kernelu na drát).
- `ndo_set_rx_mode` — multicast/promiscuous nastavení.
- `ndo_set_mac_address` — změnit MAC.

To, že MAC se *dá změnit* (`ip link set eth0 address 02:42:...`) je díky tomuto callback — i když výrobce v firmware "vypálil" adresu, kernel ji *přepíše* v paměti a NIC ji emituje jako novou.

## sk_buff — reprezentace paketu

Druhá zásadní struktura. Každý paket *v kernelu* je `struct sk_buff`. Velmi velká struktura (~250 bajtů na 64-bit) s mnoha ukazateli.

::: svg "sk_buff struktura — buffer s posuvnými pointery"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="20" y="60" width="500" height="50" fill="var(--bg-inset)"/>
  </g>
  <g fill="var(--text)" font-size="10" text-anchor="middle">
    <text x="270" y="88">Data buffer</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5">
    <line x1="80" y1="55" x2="80" y2="115"/>
    <line x1="150" y1="55" x2="150" y2="115"/>
    <line x1="280" y1="55" x2="280" y2="115"/>
    <line x1="460" y1="55" x2="460" y2="115"/>
  </g>
  <g fill="var(--text-muted)" font-size="9" text-anchor="middle">
    <text x="50" y="50">head</text>
    <text x="115" y="50">data</text>
    <text x="215" y="50">network header</text>
    <text x="370" y="50">tail</text>
    <text x="490" y="50">end</text>
  </g>
  <g fill="var(--text)" font-size="9" text-anchor="middle">
    <text x="115" y="135">L2 header</text>
    <text x="215" y="135">L3 header</text>
    <text x="370" y="135">payload</text>
  </g>
  <text x="270" y="160" fill="var(--text-muted)" font-size="10" text-anchor="middle">Pointery skb_push/skb_pull posouvají, data se nekopírují</text>
</svg>
:::

Klíčové ukazatele:

- `head` — začátek alokovaného bufferu (immutable).
- `data` — *aktuální* začátek paketu (přesun při push/pull).
- `tail` — konec validních dat.
- `end` — konec bufferu (immutable).
- `network_header`, `transport_header`, `mac_header` — offsety jednotlivých vrstev.

### Operace

- **`skb_push(skb, n)`** — *odhal* `n` bajtů před `data` (přidá hlavičku). Posune `data` zpět.
- **`skb_pull(skb, n)`** — *spotřebuj* `n` bajtů (odstraň hlavičku). Posune `data` dopředu.
- **`skb_put(skb, n)`** — extend `tail` o `n` (přidej payload).
- **`skb_clone(skb)`** — *shared* duplikát (sdílí buffer, kopíruje skbuff struktura).

### Lifecycle

1. **Driver RX**: NIC kopíruje paket do paměti (DMA). Driver alokuje `sk_buff`, nastaví `data` na paketové data.
2. **Stack ingress**: L2 driver volá `netif_receive_skb()` → netfilter pre-routing → routing decision.
3. **Pokud lokální**: netfilter local-in → L3 protokol (IP) → L4 (TCP) → fronta socket.
4. **Pokud forwarding**: netfilter forward → output queue → driver TX.
5. **Driver TX**: alokuje DMA descriptor, NIC odešle.

Mezi tím *žádné kopírování dat* — ukazatele se přesouvají. Paket "*plynárně teče*" kernelem.

## Netfilter — pět hooků

Linux `netfilter` ([RFC ne — Linux-specific](https://www.netfilter.org/)) definuje **5 hookovacích bodů** v IP stacku, kde lze do paketu zasáhnout:

::: svg "Netfilter hooky a flow paketu"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1.5">
    <rect x="20" y="80" width="80" height="36"/>
    <rect x="130" y="80" width="80" height="36"/>
    <rect x="240" y="80" width="80" height="36"/>
    <rect x="350" y="80" width="80" height="36"/>
    <rect x="460" y="80" width="60" height="36"/>
    <rect x="240" y="20" width="80" height="36"/>
    <rect x="240" y="140" width="80" height="36"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="60" y="103">incoming</text>
    <text x="170" y="98">PRE-</text>
    <text x="170" y="111">ROUTING</text>
    <text x="280" y="103">routing</text>
    <text x="390" y="103">FORWARD</text>
    <text x="490" y="103">outgoing</text>
    <text x="280" y="43">LOCAL-IN</text>
    <text x="280" y="163">LOCAL-OUT</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.4" fill="none" marker-end="url(#arr5)">
    <line x1="100" y1="98" x2="125" y2="98"/>
    <line x1="210" y1="98" x2="235" y2="98"/>
    <line x1="320" y1="98" x2="345" y2="98"/>
    <line x1="430" y1="98" x2="455" y2="98"/>
    <line x1="280" y1="80" x2="280" y2="58"/>
    <line x1="280" y1="140" x2="280" y2="118"/>
  </g>
  <defs>
    <marker id="arr5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="280" y="195" fill="var(--text-muted)" text-anchor="middle" font-size="9">POST-ROUTING = za FORWARD, před egress</text>
</svg>
:::

5 hooků:

| Hook | Kdy se volá |
| :--- | :--- |
| **PRE_ROUTING** | po L2 dekódování, *před* routing decision |
| **LOCAL_IN** | paket je pro tento host (po routing → local) |
| **FORWARD** | paket se *transit*uje (po routing → forward) |
| **LOCAL_OUT** | lokálně generovaný outgoing paket |
| **POST_ROUTING** | *poslední* hook před TX |

### Použití

| Hook | Co se tam typicky dělá |
| :--- | :--- |
| PRE_ROUTING | **DNAT** (Destination NAT) — přepíše dst IP před routing |
| FORWARD | **Filtering** — accept/drop přeposílaných paketů |
| LOCAL_IN | **Filtering** — input firewall |
| LOCAL_OUT | output firewall, mark output |
| POST_ROUTING | **SNAT/MASQUERADE** — přepíše src IP před TX |

### NAT — kanonický příklad

Domácí router přijme paket z laptopu (`192.168.1.5:54321 → 8.8.8.8:80`):

1. PRE_ROUTING: nic.
2. Routing: vidí, že dst není lokální → FORWARD.
3. FORWARD: filtering (povoleno? ano).
4. POST_ROUTING: **MASQUERADE** — přepíše src na veřejnou IP (`84.21.5.10:33000 → 8.8.8.8:80`). Uloží mapping `(54321 ↔ 33000)`.
5. TX přes WAN interface.

Reply paket (`8.8.8.8:80 → 84.21.5.10:33000`):

1. PRE_ROUTING: **DNAT reverse** — najde mapping, přepíše dst na `192.168.1.5:54321`.
2. Routing: lokální / forward → FORWARD.
3. POST_ROUTING: nic.
4. TX přes LAN.

NAT je *stateful* — kernel udržuje **conntrack table** s aktivními překlady.

## iptables / nftables — uživatelské rozhraní

Klasické `iptables` (legacy) a moderní `nftables` (2014+) jsou *user-space* nástroje, které programují netfilter pravidla.

iptables formát:

```sh
# Allow incoming SSH
iptables -t filter -A INPUT -p tcp --dport 22 -j ACCEPT

# Masquerade outgoing
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# Forward only established connections
iptables -t filter -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT
```

`-t` = tabulka (filter, nat, mangle, raw).
`-A` = append do chainu (INPUT, OUTPUT, FORWARD, PREROUTING, POSTROUTING).
`-j` = action (ACCEPT, DROP, REJECT, SNAT, DNAT, MASQUERADE, RETURN).

nftables modernější:

```sh
nft add table inet filter
nft add chain inet filter input { type filter hook input priority 0 \; }
nft add rule inet filter input tcp dport 22 accept
```

Single syntax pro IPv4/IPv6/ARP, atomické updates, mapy/sety.

## Performance dopady

Hook *má cenu*. Při 1 Mpps a 100 iptables pravidlech = 100M lookups/s — měřitelný load.

Drop *brzy* je levnější:

- Drop v PRE_ROUTING `raw` table (před conntrack) — *nejlevnější*.
- Drop v INPUT filter table — středně.
- Drop až po L4 socket — *nejdražší*.

Standardní praxe: DDoS mitigation rules → `raw` table → drop *přímo*. Šetří 5–10× CPU.

## Co dál

Když chcete *vyhnout se* tomu, aby paket procházel kernel stackem vůbec — *kernel bypass* technologie. Sekce [[dpdk-pfring]]. Ale *před* tím se podíváme na *standard kernel* optimalizace, které zvyšují propustnost bez ztráty funkcionality — [[napi-rss-offload]].

---

*Zdroj: PDS přednáška 9 (Zpracování paketů), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: Wehrle, K. et al.: *The Linux Networking Architecture* (Prentice Hall 2004); Salim, J.H., Olsson, R., Kuznetsov, A.: „Beyond Softnet" (ALS 2001); [Linux Foundation — Netfilter Wiki](https://wiki.nftables.org/); [The Linux Kernel — Network Packet Reception](https://www.kernel.org/doc/html/latest/networking/index.html); [Linux source — Packet Flow Diagram](https://en.wikipedia.org/wiki/Iptables).*
