# Vrstvené modely a zapouzdření

Síť je *komplexní systém* — koncové uzly, směrovače, přepínače, kabely, aplikace, protokoly, HW i SW. Aby byla zvládnutelná, dělí se do **vrstev** se striktně definovanými rozhraními. Tato sekce zopakuje dva referenční modely (**ISO/OSI** a **TCP/IP**), pojem **PDU** (Protocol Data Unit) a princip **zapouzdření / odpouzdření**.

## Proč vrstvy

Síť kombinuje příliš mnoho heterogenních součástí na to, aby šla popsat jako jeden monolit. Klíčové výhody vrstvení:

- *Modularita* — každá vrstva má jasně definovanou odpovědnost (link delivery, IP routing, transport reliability, application semantics).
- *Transparentní změna* — díky dobře definovaným API lze jednu vrstvu vyměnit, aniž se musí přepisovat sousední. Příklad: WiFi nahrazuje Ethernet pod IP, aplikace nic nepozná.
- *Rozšiřitelnost* — nový protokol (např. HTTP/3 nad QUIC) lze zavést bez zásahu do jiných vrstev.

## ISO/OSI — sedm vrstev

**ISO/OSI Reference Model** (1984) je teoretický, ale velmi referenční:

| L | Vrstva | Odpovědnost | Příklady |
| :---: | :--- | :--- | :--- |
| 7 | Application | End-user services | SMTP, HTTP, FTP |
| 6 | Presentation | Encoding, encryption | TLS, ASCII↔EBCDIC |
| 5 | Session | Session establishment | RPC, NetBIOS |
| 4 | Transport | End-to-end delivery | TCP, UDP, SCTP |
| 3 | Network | Routing, addressing | IP, ICMP |
| 2 | Data Link | Hop-by-hop frame | Ethernet, WiFi |
| 1 | Physical | Bits over medium | Cabling, signals |

Tradičně se mluví o *upper layers* (5–7, *host-to-host*) a *lower layers* (1–4, *network*). V praxi se vrstvy 5 a 6 prakticky nepoužívají *jako oddělené* — funkce přebírá L7 nebo L4 (např. TLS leží *„mezi"* L4 a L7).

## TCP/IP — pět praktických vrstev

**TCP/IP** je *pragmatický model* internetu (RFC 1122). Vrstvy 5–7 jsou sloučeny do jedné *Application*:

| L | Vrstva | Příklady |
| :---: | :--- | :--- |
| 5 | Application | HTTP, SMTP, DNS, gRPC |
| 4 | Transport | TCP, UDP, QUIC |
| 3 | Network (Internet) | IPv4, IPv6, ICMP |
| 2 | Data Link | Ethernet, WiFi, PPP |
| 1 | Physical | Twisted pair, fiber, radio |

Pozn.: v některé literatuře (Tanenbaum) se uvádí *4 vrstvy* (bez fyzické), v Cisco materiálech *5 vrstev*. Rozdíl je formální.

## Protocol Data Units (PDU)

Každá vrstva pracuje s *jednotkou informace*, kterou nazývá **PDU**. PDU má strukturu:

```
[ header | payload | (optional) trailer ]
```

Taxonomie PDU napříč vrstvami:

| Vrstva | PDU |
| :--- | :--- |
| L5–7 (Application) | data, *message* |
| L4 (Transport) | **segment** (TCP), **datagram** (UDP) |
| L3 (Network) | **packet** |
| L2 (Data Link) | **frame** |
| L1 (Physical) | **bits** |

Tato terminologie je *kanonická* — i v textech, kde se používá „packet" jako obecný termín, se v technickém kontextu odlišuje *segment*, *packet*, *frame*.

## Zapouzdření (encapsulation)

Data putují **dolů** stackem na vysílací straně a **nahoru** na přijímací straně. Každá vrstva *přidává svou hlavičku* k tomu, co dostane shora.

Příklad cesty z aplikace přes Ethernet (jako request *„download web page"*):

```
L5 Application:  "GET / HTTP/1.1\r\n..."
                  ↓
L4 TCP:          [TCP hdr: src=31244, dst=80][L5 data]
                  ↓
L3 IP:           [IP hdr: src=192.168.1.101, dst=192.168.1.102][L4 segment]
                  ↓
L2 Ethernet:     [Eth hdr: src=00:12:F1..., dst=00:04:A3...][L3 packet][Eth trailer]
                  ↓
L1 Physical:     010101110010...
```

Na příjemci se proces obrátí — **odpouzdření**. Každá vrstva odstraní svou hlavičku, podívá se na ni, a postoupí zbytek nahoru.

Důležité pozorování: **každá vrstva komunikuje se svou peer vrstvou** na druhé straně *logicky*, ale *fyzicky* prochází jen dolů a nahoru.

## Hop-by-hop vs end-to-end

Klíčový rozdíl mezi vrstvami pro pochopení **packet traversal** ([[paketovy-prenos]]):

- **L2 (Data Link)** je *hop-by-hop* — adresy MAC se přepisují na *každém* uzlu (každý směrovač přepíše source/dest MAC). L2 vidí jen *adjacent device* (sousední).
- **L3 (Network)** je *end-to-end* — IP adresy se *nemění* (pokud není NAT). Source a destination IP zůstávají původní celou cestu.

Z toho plyne *zlaté pravidlo*:

> Když paket prochází směrovačem, **L2 hlavička se přepisuje, L3 hlavička se nemění**.

To je důvod, proč směrovač potřebuje *MAC adresu next-hopu*, kterou si zjistí přes ARP ([[paketovy-prenos]]).

## Rebuttal — vrstvy v praxi nejsou rigidní

Striktní ISO/OSI model je *teoretický*. V praxi protokoly „prosakují" mezi vrstvami:

- **TLS** (L7? L4? L6?) — leží *mezi* L4 a L7, ale formálně součást aplikace.
- **MPLS** — *„L2.5"* — leží mezi L2 a L3, dělá label switching.
- **IPsec** — *L3 šifrování*, ale s vlastními headery (AH, ESP).
- **GRE** — *tunelování* L3 nad L3 (paket v paketu).
- **Q-in-Q, 802.1q** — VLAN tagy *v L2 hlavičce*, ale s logikou ovlivňující L3.

Tyto „mimovrstevné" technologie jsou *normální* — vrstvy slouží k *organizaci myšlení*, ne k zakazování řešení.

## Co dále

Vrstvy říkají, *kdo dělá co*. V další sekci ([[sitove-zarizeni]]) si projdeme **která fyzická zařízení implementují které vrstvy** — modem, hub, switch, router.

---

*Zdroj: PDS přednáška 1 (Networker's Handbook, part 1), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: Tanenbaum, A.S., Wetherall, D.J.: *Computer Networks* (5. vyd., Pearson 2010), kap. 1.4; [RFC 1122 — Requirements for Internet Hosts](https://www.rfc-editor.org/rfc/rfc1122).*
