---
title: TCP — hlavička, spojení, stavy
---

# TCP — hlavička, spojení a stavy

Předchozí kapitola probrala *abstrakta* L4 — chyby, sekvenční čísla, ARQ, flow & congestion control ([[rizeni-toku-zahlceni]]). Tato sekce začíná **konkrétní protokoly** prvním a nejvýznamnějším: **TCP** (*Transmission Control Protocol*, [RFC 9293](https://www.rfc-editor.org/rfc/rfc9293)). TCP nahradil v roce 1983 **NCP** (Network Control Protocol) v rámci tzv. *flag day* — prvního a posledního dne, kdy se podařilo přepnout celý internet z jednoho protokolu na druhý. Dneska je TCP páteří většiny aplikací — HTTP/1, HTTP/2, SSH, SMTP, IMAP, FTP — a má za sebou 40+ let provozních úprav.

## TCP — co garantuje

| Vlastnost | Hodnota |
| :--- | :--- |
| Spolehlivost | **reliable** — re-transmise při ztrátě |
| Pořadí dat | **in-order byte stream** (nikoli zpráv) |
| Spojení | **connection-oriented** — handshake & teardown |
| Flow control | **sliding window** podle `rwnd` |
| Congestion control | různé varianty (Reno, Cubic, BBR…) — viz [[tcp-congestion-variants]] |
| Retransmise | typicky **fast retransmit**, podporuje i **SACK** |
| Duplex | full-duplex (každý směr má vlastní sekvenční prostor) |

Detail, který se *často chybně tvrdí na státnicích*: TCP **nečísluje pakety** — čísluje **bajty**. Číslo paketu je jen vizualizační zjednodušení. Sekvenční číslo říká, *který bajt streamu* leží na začátku payloadu daného segmentu.

## Anatomie TCP hlavičky

Hlavička má 20 B fixní části + 0–40 B options:

::: svg "TCP hlavička (20 B fixní + 0–40 B options)"
<svg viewBox="0 0 540 230" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <pattern id="opt-stripes" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
      <rect width="3" height="6" fill="var(--bg-inset)"/>
    </pattern>
  </defs>
  <g stroke="var(--line-strong)" stroke-width="1" fill="var(--bg-card)">
    <rect x="20" y="20" width="240" height="20"/>
    <rect x="260" y="20" width="240" height="20"/>
    <rect x="20" y="40" width="480" height="20"/>
    <rect x="20" y="60" width="480" height="20"/>
    <rect x="20" y="80" width="60" height="40"/>
    <rect x="80"  y="80" width="80"  height="20"/>
    <rect x="160" y="80" width="240" height="20"/>
    <rect x="400" y="80" width="100" height="20"/>
    <rect x="80"  y="100" width="320" height="20"/>
    <rect x="400" y="100" width="100" height="20"/>
    <rect x="20" y="120" width="240" height="20"/>
    <rect x="260" y="120" width="240" height="20"/>
    <rect x="20" y="140" width="480" height="30" fill="url(#opt-stripes)"/>
    <rect x="20" y="170" width="480" height="30" fill="var(--bg-inset)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="140" y="34">Source Port (16 b)</text>
    <text x="380" y="34">Destination Port (16 b)</text>
    <text x="260" y="54">Sequence Number (32 b)</text>
    <text x="260" y="74">Acknowledgment Number (32 b)</text>
    <text x="50"  y="104">DataOff</text>
    <text x="120" y="94">Rsvd</text>
    <text x="280" y="94">Flags (URG ACK PSH RST SYN FIN + ECE/CWR)</text>
    <text x="450" y="94">Window</text>
    <text x="240" y="114">(NS, AE)</text>
    <text x="450" y="114">(rwnd)</text>
    <text x="140" y="134">Checksum</text>
    <text x="380" y="134">Urgent Pointer</text>
    <text x="260" y="158">Options (max 40 B, multiple of 4)</text>
    <text x="260" y="188">Data (payload)</text>
  </g>
</svg>
:::

Klíčová pole:

- **Source / Destination port** (16 b) — identifikuje aplikaci. Multiplexing aplikací na jednom hostu.
- **Sequence Number** (32 b) — *číslo prvního bajtu* v tomto segmentu. Při handshaku se inicializuje *náhodně* (ochrana proti starým duplicitám, viz RFC 6528).
- **Acknowledgment Number** (32 b) — *číslo dalšího očekávaného bajtu*. Potvrzuje **kumulativně** všechno do `ack - 1`.
- **Data Offset** (4 b) — délka hlavičky ve 32-bit slovech (umožňuje variabilní options).
- **Flags** (9 b) — bitové příznaky: `URG`, `ACK`, `PSH`, `RST`, `SYN`, `FIN`, plus `ECE`/`CWR` ([RFC 3168](https://www.rfc-editor.org/rfc/rfc3168), [[rizeni-toku-zahlceni]]) a `NS`/`AE` z novějších RFC.
- **Window** (16 b) — `rwnd`, kolik bajtů je odesílatel *ochoten přijmout* (flow control). S **Window Scaling** option ([[tcp-options]]) se násobí 2^N.
- **Checksum** (16 b) — over pseudo-header + TCP segment. Slabá ochrana, dneska doplněna L2 CRC; **netýká se obsahu** spolehlivosti, jen integrity.
- **Urgent Pointer** (16 b) — offset *urgentních* dat v payloadu (relativní k `seq`). Používá se zřídka; klasický příklad: `Ctrl-C` v Telnetu, který musí "předběhnout" data v bufferu příjemce. RFC 6093 doporučuje *nepoužívat*.
- **Options** (0–40 B) — rozšiřitelnost: MSS, Window Scaling, SACK, Timestamps, MP-TCP… ([[tcp-options]]).

## Sequence space a kumulativní potvrzování

TCP udržuje *byte stream*, ne packet stream. Příklad výměny:

```
Sender                     Receiver
  --- seq=8000, 200 B ───►
                            ◄─── ack=8200, win=5000
  --- seq=8200, 1460 B ──►
                            ◄─── ack=9660, win=3540
```

- `ack=8200` znamená „dostal jsem všechno do bajtu 8199 včetně, očekávám bajt 8200".
- Když odesílatel dostane *trojnásobný duplikát* (`3× ack=8200`), spustí **fast retransmit** ([[tcp-congestion-variants]]) bez čekání na RTO.

Příjemce vidí pouze *bajty*, ne hranice zpráv aplikace. Pokud aplikace zapsala dvě `write()` po 500 B, příjemce může číst:

- jeden read 1000 B, nebo
- dva ready po 500 B, nebo
- jakékoli rozdělení.

Aplikace **musí sama** rámcovat zprávy (délkový prefix, oddělovač, parser). Toto je zásadní rozdíl od SCTP ([[sctp]]) a QUIC ([[quic]]).

## Tří-cestné navázání (3WHS)

::: svg "Three-way handshake: SYN, SYN+ACK, ACK"
<svg viewBox="0 0 520 200" font-family="ui-sans-serif, system-ui" font-size="12">
  <g stroke="var(--text-faint)" stroke-width="1">
    <line x1="120" y1="30"  x2="120" y2="180"/>
    <line x1="400" y1="30"  x2="400" y2="180"/>
  </g>
  <g text-anchor="middle" fill="var(--text)">
    <text x="120" y="20" font-weight="600">Client</text>
    <text x="400" y="20" font-weight="600">Server (LISTEN)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.8" fill="none" marker-end="url(#arr)">
    <line x1="125" y1="60"  x2="395" y2="80"/>
    <line x1="395" y1="105" x2="125" y2="125"/>
    <line x1="125" y1="155" x2="395" y2="170"/>
  </g>
  <defs>
    <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--text)" font-size="11">
    <text x="260" y="58" text-anchor="middle">SYN, seq=x</text>
    <text x="260" y="100" text-anchor="middle">SYN+ACK, seq=y, ack=x+1</text>
    <text x="260" y="150" text-anchor="middle">ACK, seq=x+1, ack=y+1</text>
  </g>
  <g fill="var(--text-muted)" font-size="10">
    <text x="80"  y="65" text-anchor="end">SYN_SENT</text>
    <text x="80"  y="135" text-anchor="end">ESTAB.</text>
    <text x="440" y="90">SYN_RCVD</text>
    <text x="440" y="175">ESTAB.</text>
  </g>
</svg>
:::

1. **Klient → Server: `SYN, seq=x`**. Klient zvolí náhodné ISN $x$.
2. **Server → Klient: `SYN+ACK, seq=y, ack=x+1`**. Server volí své ISN $y$, potvrzuje příjem klientova SYN.
3. **Klient → Server: `ACK, seq=x+1, ack=y+1`**. Klient potvrdí, posílá první data.

V tomto okamžiku obě strany přejdou do stavu **ESTABLISHED**.

### Proč 3 cesty a ne 2?

Dvoucestný handshake (jen `SYN` + `ACK`) by *nedetekoval staré duplicitní SYN*: pokud by se síťový SYN ze starého spojení objevil opět, server by ho akceptoval jako nové spojení, ale klient o tom neví. Třetí ACK od klienta garantuje, že obě strany se *shodly* na začátečních sekvenčních číslech.

Detail z provozu: TCP klient v Linuxu volá `connect()`. Volání blokuje až do dokončení 3WHS — nebo selže `ETIMEDOUT` typicky po 75–180 s.

### SYN flood — útok na 3WHS

Slabina 3WHS: server musí *alokovat zdroje* už po prvním SYN — `socket struct`, bookkeeping, timer. Útočník pošle 10 000 SYN s falešnými adresami; server posílá SYN+ACK do prázdna, naplní *backlog queue* a odmítá legitimní klienty. Obrana: **SYN cookies** ([RFC 4987](https://www.rfc-editor.org/rfc/rfc4987)) — server nealokuje stav, místo toho zakóduje do ISN hash požadavku; teprve dokončené 3WHS se hmotně registruje.

## Čtyř-cestné ukončení (4-way close)

TCP spojení je **full-duplex** — má dva nezávislé directiony. Ukončují se *odděleně*:

```
Client                    Server
  --- FIN, seq=u ───────►
                           ◄─── ACK, ack=u+1
        (server může stále posílat data)
                           ◄─── FIN, seq=v
  --- ACK, ack=v+1 ─────►
        TIME_WAIT (2·MSL)
```

- Klient pošle `FIN` (*už nemám data*).
- Server potvrdí `ACK` — ale **ještě může posílat data** ("half-close").
- Až server také dořekne, pošle vlastní `FIN`.
- Klient potvrdí `ACK` a vstoupí do stavu **TIME_WAIT** na 2·MSL (typicky 60 s).

### Proč TIME_WAIT?

Dva důvody:

1. **Zaručit doručení posledního `ACK`.** Pokud se ztratí, server pošle FIN znovu — klient v TIME_WAIT na něj odpoví. Bez TIME_WAIT by ten retransmitovaný FIN dostala nová aplikace na stejném portu.
2. **Vyloučit "zombie" segmenty** z předchozího spojení (duplikáty). 2·MSL = maximálně dlouhý čas, po který může segment putovat sítí v jednom směru × 2.

TIME_WAIT zabírá port — server obsluhující mnoho krátkých spojení (HTTP 1.0) může vyčerpat lokální porty (cca 28 000 zbývajících po `/proc/sys/net/ipv4/ip_local_port_range`). Mitigace: `SO_REUSEADDR`, `tcp_tw_reuse` (riskantní), persistentní spojení (HTTP/1.1 keep-alive).

## Stavový automat

TCP definuje 11 stavů (RFC 9293, §3.3.2):

| Stav | Význam |
| :--- | :--- |
| `CLOSED` | žádné spojení |
| `LISTEN` | server čeká na příchozí SYN |
| `SYN_SENT` | klient poslal SYN, čeká SYN+ACK |
| `SYN_RCVD` | server poslal SYN+ACK, čeká ACK |
| `ESTABLISHED` | běžící spojení, data flow |
| `FIN_WAIT_1` | poslal FIN, čeká ACK nebo FIN |
| `FIN_WAIT_2` | dostal ACK svého FIN, čeká FIN protistrany |
| `CLOSING` | simultánní close (oba poslali FIN) |
| `TIME_WAIT` | obě FINs vyměněny, čeká 2·MSL |
| `CLOSE_WAIT` | dostal FIN, čeká, až aplikace zavolá `close()` |
| `LAST_ACK` | poslal FIN poté, co byl v CLOSE_WAIT, čeká ACK |

::: viz handshake "Procházejte přes 3WHS a 4-way close, ať vidíte stavy."
:::

Praktický důsledek: pokud server *nezavře* socket po dostání FIN od klienta, zůstane v `CLOSE_WAIT` *navždy*. Klasický bug — `netstat -an | grep CLOSE_WAIT | wc -l` vrátí tisíce a server pomalu umírá.

## RST — reset bez handshaku

Příznak `RST` ukončí spojení *okamžitě*, bez výměny FIN. Použití:

- *Nečekaný segment* — přišel SYN na zavřený port → `RST` (klient dostane `ECONNREFUSED`).
- *Aplikace volá `close()` po `SO_LINGER=0`* — zahodí buffery, pošle `RST` místo FIN.
- *Detekce mrtvé protistrany* keep-alive paketem.

Pozor: `RST` *neoznámí* aplikaci, kolik dat se ztratilo — proto je preferován graceful close.

## Co dál

Hlavička TCP nese option-blok dlouhý až 40 B; tam se zaklíná veškerá moderní funkcionalita — MSS, Window Scaling, SACK, Timestamps, MP-TCP option. Pokračování v sekci [[tcp-options]].

Po hlavičce a stavech přijde *srdce* TCP — **congestion control** ([[tcp-congestion-variants]]), historicky nejaktivnější oblast výzkumu transportních protokolů (Van Jacobson 1988 → BBR 2016).

---

*Zdroj: PDS přednáška 2 (Transportní protokoly), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 9293 — Transmission Control Protocol (TCP)](https://www.rfc-editor.org/rfc/rfc9293) (aktualizovaná specifikace, 2022); [RFC 6528 — Defending against Sequence Number Attacks](https://www.rfc-editor.org/rfc/rfc6528); [RFC 4987 — TCP SYN Flooding Attacks](https://www.rfc-editor.org/rfc/rfc4987); [RFC 6093 — On the Implementation of the TCP Urgent Mechanism](https://www.rfc-editor.org/rfc/rfc6093); Stevens, W.R., Fenner, B., Rudoff, A.M.: *UNIX Network Programming, Vol. 1* (3. vyd., Addison-Wesley 2003).*
