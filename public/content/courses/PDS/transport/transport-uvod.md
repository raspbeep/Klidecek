# Transportní vrstva — pozice a služby

Recap ([[paketovy-prenos]]) ukázal, jak IP **doručuje pakety mezi sítěmi**. Pakety se ale ztrácejí, duplikují, mění pořadí, fragmentují a vkládají útočníkem — IP nabízí *best-effort*, nic víc. Aplikace, které potřebují **spolehlivý** přenos (HTTP, SSH, SMTP), si proto musí spolehlivost zařídit jinde. Tato role připadá **transportní vrstvě (L4)**.

## Pozice v zásobníku

L4 sedí *mezi* aplikační a síťovou vrstvou:

- *Nahoře:* nabízí služby aplikační vrstvě (sockety, port-based multiplexing).
- *Dole:* využívá síťovou vrstvu (IP) k přenosu segmentů.
- *Vodorovně:* komunikuje **peer-to-peer** s transportní vrstvou na druhém koncovém uzlu — tady leží *end-to-end semantika*.

Klíčové úkoly:

- **Packetizing** — rozdělení aplikačního streamu na segmenty.
- **Addressing** — *port number* (16 bit) jako adresa nad IP — multiplexuje aplikace na jednom hostu.
- **Connection control** — navázání a ukončení spojení (u CO protokolů).
- **Reliability** — spolehlivý přenos (potvrzení, retransmise, sekvenční čísla).
- **QoS** — flow control, congestion control, error recovery.

L4 je tedy *most* mezi *nespolehlivou L3* a *spolehlivými aplikacemi*. Nadcházející sekce postupně rozeberou každou z těchto rolí.

## Berkeley Sockets — programové API

Standardem pro práci s L4 je **Berkeley Sockets** API (BSD 4.2, 1983). Primitivy:

| Primitive | Význam |
| :--- | :--- |
| `SOCKET` | vytvoří nový komunikační endpoint |
| `BIND` | připojí lokální adresu (IP + port) k socketu |
| `LISTEN` | oznámí ochotu přijímat spojení (server side) |
| `ACCEPT` | blokuje volajícího do příchodu spojení |
| `CONNECT` | aktivně navazuje spojení (client side) |
| `SEND` / `RECEIVE` | data |
| `CLOSE` | uvolnění spojení |

Toto API se používá v UNIX, Linux, Windows (Winsock), macOS — *de facto* standard. Vyšší programovací jazyky (Java `Socket`, Python `socket`, Go `net`) ho jen obalují.

## Vlastnosti doručování síťové vrstvy

L4 musí *řešit* nedostatky IP:

- IP nabízí jen **best-effort** doručování — paket *může* dojít, *může* být ztracen, *může* být duplikován, *může* dorazit v jiném pořadí.
- I kdyby L3 garantovala spolehlivost (např. ATM v 90. letech), bufferování na L4 je stejně potřeba — kvůli **adaptaci rychlostí** mezi aplikací a sítí.

L4 musí typicky řešit:

- **Bufferování** — kompenzace rozdílu rychlosti mezi odesílatelem a příjemcem.
- **Multiplexing** — jeden L3 hostitel běží mnoho L4 procesů.
- **Reliability** — pokud aplikace chce.

## Buffery — kde a jak

Bufferování se dělá *na obou stranách* — odesílatele i příjemce. Optimum závisí na *typu provozu*:

- **Bursty provoz** (krátké zprávy, interaktivní aplikace) → buffery na *odesílateli* (pro retransmise při ztrátě).
- **Spojitý provoz** (soubor, video stream) → buffery na *příjemci* (aby aplikace mohla zpracovávat svou rychlostí, využila se plná šířka pásma).

Implementační varianty:

- **Fixní buffery** — jednoduché, ale plýtvají pamětí (předalokace pro max).
- **Proměnné buffery** — dynamická alokace.
- **Sdílené buffery** (pool) — řadu segmentů spravuje OS společně.

## Dichotomie regulace — flow vs congestion

Klíčové rozdělení, ke kterému se v této přednášce vracíme často:

- **Flow control** — regulace mezi *odesílatelem a příjemcem*. Cíl: nezahltit *malou kapacitu příjemce*.
- **Congestion control** — regulace *celé sítě*. Cíl: nezahltit *kapacitu sítě* mezi nimi.

Analogie:

| | Flow control | Congestion control |
| :--- | :--- | :--- |
| Co řeší | small receiver capacity | large internal congestion |
| Kdo monitoruje | end-points | router + end-points |
| Jak v TCP | receive window (`rwnd`) | congestion window (`cwnd`) |
| Důvod selhání | příjemce shazuje pakety | router shazuje pakety |

Cíle systému jsou *dichotomické*:

- **End-to-end** systém optimalizuje *vlastní throughput* (občas na úkor ostatních).
- **Síť** musí optimalizovat *celkový throughput* — fairness mezi flow.

Tomuto napětí se v praxi říká **congestion collapse risk** — když všichni jen optimalizují své flow bez ohledu na síť, throughput se *zhroutí* (typicky kolem 1986 v ARPANETu).

## Multiplexing — upward vs downward

- **Upward multiplexing** — *více L4 procesů* sdílí *jednu* L3 adresu. Když přijde TPDU, musí ho L4 doručit *správnému procesu* (podle portu).
- **Downward multiplexing** — *jeden* L4 proces využívá *více* L3 adres. Méně časté; aktuální výzkum: **MP-TCP** (multipath TCP) — spojení rozložené přes WiFi + LTE.

---

*Zdroj: PDS přednáška 2 (Transportní protokoly), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: Tanenbaum, A.S., Wetherall, D.J.: *Computer Networks* (5. vyd., Pearson 2010), kap. 6; Kurose, J.F., Ross, K.W.: *Computer Networking: A Top-Down Approach* (8. vyd., Pearson 2021), kap. 3.*
