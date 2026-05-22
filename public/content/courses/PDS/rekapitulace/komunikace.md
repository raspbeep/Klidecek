# Komunikace — protokoly, modely, typy přenosu

Předmět **PDS** (Přenos dat, počítačové sítě a protokoly) navazuje na bakalářskou síťovou výuku (IPK, ISA) a posouvá ji do hloubky — k *vnitřnostem směrovačů*, *klasifikaci paketů*, *SDN* a podobně. Než se dostaneme k těmto pokročilým tématům, první přednáška (*Networker's Handbook*) zopakuje *minimální slovník*, který budeme potřebovat. Tato sekce shrnuje **základní pojmy komunikace** — co je protokol, jaké jsou komunikační modely a typy přenosu.

## Co je protokol

**Protokol** definuje *syntax* a *sémantiku* zpráv, které si dvě strany vyměňují:

- **Pořadí výměny** (order of exchange) — kdo začne, kdo odpoví, kdy se uzavírá relace.
- **Role entit** — kdo je *iniciátor*, kdo *respondent*, jaké stavy jsou povolené.
- **Vykonávané akce** — co se má stát po přijetí dané zprávy.

Analogie s lidskou komunikací: *„Ahoj!" → „Ahoj!" → „Kolik je hodin?" → „Dvě."* Pořadí, role i očekávané akce odpovídají *aplikační protokolu*. Strojový protokol (např. **TCP handshake**) má stejnou logiku — jen místo slov bity.

Síťové protokoly dělíme podle:

- **Cílové strany** — *Machine vs. human* (lidské jsou typicky textové: HTTP, SMTP, FTP).
- **Kódování** — *Textové* (mail, web, FTP) vs. *binární* (RADIUS, Skype, gRPC).

## Komunikační modely

Z hlediska *kdo komunikuje s kým* existují dva základní modely:

- **Client–server** — klient žádá server o službu. Iniciuje pouze klient, server jen odpovídá. Příklad: webový prohlížeč ↔ webový server.
- **Peer-to-peer (P2P)** — minimální použití serveru. Účastníci si rovnocenně předávají data. Příklad: BitTorrent, Gnutella; viz pozdější přednáška [[p2p-uvod]].

V praxi se používají i *hybridní* modely — např. Skype má centrální *signaling* server (klient–server) pro inicializaci, pak P2P pro media stream.

## Typy přenosu

Pohled **z hlediska média**:

- **Simplex** — jen jeden směr (vysílání rozhlasu).
- **Half-duplex** — oba směry, ale ne současně (CB rádio, klasický Ethernet s hubem).
- **Full-duplex** — oba směry současně (Ethernet point-to-point se switchem, optické vlákno).

Pohled **z hlediska entit** (kolik příjemců):

- **Unicast** — *jeden vysílá jednomu* (TCP, klasický HTTP request).
- **Broadcast** — *jeden vysílá všem* v segmentu (DHCP discovery, ARP request).
- **Multicast** — *jeden vysílá skupině* zájemců (IPTV streaming, video conferencing).
- **Anycast** — *jeden vysílá nejbližšímu* z více serverů se stejnou adresou (DNS root servery, CDN).

Tyto čtyři typy jsou základní vokabulář všech sítí — vrátíme se k nim v sekcích o adresování ([[adresovani-l3]]) a v ukázkách průchodu paketu ([[paketovy-prenos]]).

## Connection-oriented vs Connectionless

Zda komunikace vyžaduje **navázání spojení** je další zásadní dělící osa:

- **Connection-oriented (CO)**
  - *Handshaking* — explicitní navázání spojení (SYN/SYN-ACK/ACK u TCP).
  - *Reliable* — potvrzování (ACK), řízení toku, řízení zahlcení.
  - Příklady: **TCP**, **SCTP**, *Virtual Circuit* v ATM/Frame Relay.

- **Connectionless (CL)**
  - *Bez synchronizace* — odesílatel jen pošle paket bez ohledu na příjemce.
  - *Unreliable* — best-effort, žádné záruky doručení.
  - Příklady: **UDP**, *IP datagramy*.

CO model je *spolehlivý*, ale s *vyšší latencí* (handshake stojí čas) a *vyšší režií* (potvrzení, retransmise). CL model je *rychlý a jednoduchý*, ale neposkytuje záruky — aplikace si je musí zařídit sama (např. QUIC nad UDP).

Pro pochopení moderních pokročilých protokolů (QUIC, HTTP/3, MP-TCP) je toto rozdělení *zásadní* — vrátíme se k tomu v přednášce o transportní vrstvě ([[transport-uvod]]).

## Co dále

S terminologií komunikace v ruce přejdeme k **vrstvenému modelu sítě** ([[vrstvene-modely]]), který je rámcem, do něhož všechny protokoly zapadnou.

---

*Zdroj: PDS přednáška 1 (Networker's Handbook, part 1), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: Tanenbaum, A.S., Wetherall, D.J.: *Computer Networks* (5. vyd., Pearson 2010), kap. 1; Kurose, J.F., Ross, K.W.: *Computer Networking: A Top-Down Approach* (8. vyd., Pearson 2021), kap. 1.*
