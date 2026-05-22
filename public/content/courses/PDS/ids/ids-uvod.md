---
title: IDS — co se na síti děje a proč nás to zajímá
---

# IDS — úvod do monitorování síťového provozu

Po probrání mechanismů přenosu ([[transport-uvod]]) a směrování ([[smerovani-uvod]]) přichází otázka *operativní*: **co se na mé síti skutečně děje?** Tato kapitola probere **identifikaci** síťového provozu, **signatury** (Snort, Suricata), **fingerprinting** (JA3, JA4), **flow monitoring** (NetFlow, IPFIX) a **detekci anomálií**. Klíčový důraz: technické přístupy *a* jejich omezení v reálném nasazení.

## Co je problém

Když spravujete síť — domácí, kampusovou, korporátní — *nestačí pasivně čekat*, až se něco rozbije. Důvody, proč zájem o monitoring:

1. **Bezpečnost** — útoky, malware, exfiltrace dat, C&C komunikace. Bez detekce *netušíte*, že máte v síti botnet.
2. **Compliance** — GDPR, NIS2, SOX vyžadují *logovat* určitý provoz pro audity.
3. **Plánování kapacity** — co je *normální* využití? Které služby rostou? Kdy přidat 10 Gbps backbone?
4. **Forensics** — když dojde k incidentu, máte *záznam*, ze kterého rekonstruujete, co se stalo.
5. **SLA a QoS** — zákazníci platí za garantovanou bandwidth; musíte měřit.
6. **Nelegální obsah** — sdílení autorsky chráněných souborů, hostování spamu, P2P torrenty mimo policy.

## Identifikace vs detekce anomálií

V této kapitole rozlišujeme dvě činnosti:

- **Identifikace** — co je *tento* tok zač? Je to HTTPS? VPN? VoIP? Botnet C&C přes port 443?
- **Detekce anomálií** — *něco* na síti vypadá netypicky; co je *normální* a co *odlišné*?

Identifikace je *deterministická* — klasifikujeme proti pevnému katalogu. Detekce je *statistická* — pracujeme s pravděpodobností odlišnosti.

Obě dovednosti se doplňují: identifikace odhalí *známé* hrozby; anomálie odhalí *nové, dosud neviděné*.

## Problémy identifikace — proč není snadná

### 1. Šifrování

Drtivá většina dnešního provozu je TLS (HTTPS, IMAPS, SMTPS, FTPS), QUIC, WireGuard. *Obsah je zašifrovaný*. Hlavičky aplikační vrstvy nepoznáte. Můžete vidět *SNI* (Server Name Indication) v ClientHello — ale ten je teď taky šifrovaný v *Encrypted ClientHello* (ECH).

### 2. Port hopping

Klasická heuristika "port 443 = HTTPS" je *ne*spolehlivá. Server může běžet *kdekoliv*:

- Webserver na portu 8080.
- SSH tunelovaný přes 443 (`stunnel`, `sslh`).
- IRC přes 80.
- Botnet C&C přes 443 (tváří se jako HTTPS).

Kdykoliv uživatel ovládá aplikaci na endpoint, může zvolit nestandardní port.

### 3. Tunelování

Provoz se zabaluje do jiných protokolů:

- **GRE tunel** — IP-in-IP.
- **PPP over Ethernet** (PPPoE) — pro ADSL, dříve běžné.
- **L2TP, PPTP** — VPN protokoly.
- **MPLS** ([[mpls]]) — service-provider páteř.
- **IPv4 v IPv6** (6in4), **IPv6 v IPv4** (Teredo, 6to4).

Vnější hlavička skrývá pravou identitu. Většina firewalls a IDS sond se *dívá jen na vnější* — vnitřní obsah pak unikne kontrole.

### 4. Skryté kanály

Pro průchod restriktivním firewallem útočník využije *vždycky-otevřené* protokoly:

- **DNS exfiltrace** — soubory rozkouskované do DNS query names (`base32encoded.malware.com`). DNS port 53 je *vždycky* otevřený, DNS odpovědi jsou krátké, ale dlouhodobou exfiltraci zvládají.
- **ICMP tunneling** — data v payload ICMP Echo. `ping` se nefilltruje.
- **HTTP/HTTPS** — beacon traffic pro malware C&C, vypadá jako normální browsing.

Tyto kanály *jsou*, jejich detekce vyžaduje *anomálie detection* — nikoli signature match.

### 5. Dynamické porty

P2P protokoly (BitTorrent, eMule) používají *náhodný* port v rozsahu. RTP/RTCP sjednávají port v SDP přes SIP — analyzátor musí *sledovat sjednání*, ne jen porty.

## Vrstvy informací

Při zkoumání paketu má router/IDS sondu *postupně* dostupné víc informací:

::: svg "Vrstvy paketu pro identifikaci"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" fill="var(--bg-card)" stroke-width="1">
    <rect x="40" y="30" width="460" height="22"/>
    <rect x="40" y="52" width="460" height="22"/>
    <rect x="40" y="74" width="460" height="22"/>
    <rect x="40" y="96" width="460" height="22"/>
    <rect x="40" y="118" width="460" height="44" fill="var(--bg-inset)"/>
  </g>
  <g fill="var(--text)" text-anchor="left">
    <text x="50" y="46">L2 (Ethernet)</text>
    <text x="50" y="68">L3 (IP)</text>
    <text x="50" y="90">L4 (TCP/UDP)</text>
    <text x="50" y="112">L5–L6 (TLS, SSL, …)</text>
    <text x="50" y="135">L7 (HTTP, DNS, SIP, …)</text>
    <text x="50" y="155" font-size="10" fill="var(--text-muted)">+ payload application data</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="end" font-size="10">
    <text x="490" y="46">EtherType, MAC, VLAN</text>
    <text x="490" y="68">IP proto, src/dst, TTL</text>
    <text x="490" y="90">src/dst port, flags</text>
    <text x="490" y="112">SNI, JA3, JA4, certificates</text>
    <text x="490" y="135">URLs, hostnames, headers</text>
  </g>
</svg>
:::

V **šifrovaném** světě nemáme L7. Ale máme **TLS handshake** (L5–L6) — z něj se dá *kupodivu* hodně poznat ([[signatury-snort]] — JA3/JA4 fingerprints).

## Aktivní vs pasivní monitoring

| | Aktivní | Pasivní |
| :--- | :--- | :--- |
| Princip | sondy generují *vlastní* test traffic | sondy *pouze pozorují* skutečný provoz |
| Příklady | ICMP ping, `traceroute`, RIPE Atlas | NetFlow, IPFIX, SPAN port, Wireshark |
| Latence test | ✓ (vlastní paket = známá doba) | jen z TCP timestamps |
| Bandwidth test | ✓ (iperf, speedtest) | pouze pozorovaná |
| Privacy concern | dotčen jen pozorovaný uzel | dotčeni *všichni* uživatelé |
| Stealth | viditelné v logu | neviditelné (čte off SPAN) |

V této přednášce se zaměřujeme primárně na **pasivní** — to dělají IDS, NetFlow sondy, packet brokery.

## Kde se sondy umisťují

Standardní pozice:

1. **Perimeter / firewall** — co vchází a vychází z domácí sítě.
2. **Páteřní routery uvnitř organizace** — east-west traffic mezi pobočkami.
3. **Datacenter top-of-rack switch** — VM-to-VM uvnitř DC.
4. **VPN concentrator** — homeworkers a remote sites.
5. **DNS server, mail server** — high-value monitorovací body.

Mechanismy:

- **SPAN / mirror port** — switch *kopíruje* veškerý traffic z portu A na port B (kde sedí sonda). Software analýza.
- **TAP** (Test Access Point) — fyzický splitter optického vlákna. *Pasivní*, neovlivňuje provoz.
- **NetFlow / sFlow** — switch *sám* generuje *flow* záznamy (ne celý paket) a posílá je na collector.

Pro 100 Gbps backbone nelze ukládat *všechny pakety* — *flow* záznamy jsou typicky 1000× menší.

## Co dál

Začněme nejjednodušší identifikací — *podle headerů* ([[port-header-identifikace]]). Pochopíme limity a důvody, proč potřebujeme bohatší metody.

---

*Zdroj: PDS přednáška 8 (IDS), doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Stallings, W., Brown, L.: *Computer Security: Principles and Practice* (4. vyd., Pearson 2018), kap. 8 (Intrusion Detection); [RFC 7011 — IPFIX Protocol](https://www.rfc-editor.org/rfc/rfc7011); [NIST SP 800-94 — Guide to IDPS](https://csrc.nist.gov/publications/detail/sp/800-94/final); Bishop, M.: *Introduction to Computer Security* (Addison-Wesley 2005).*
