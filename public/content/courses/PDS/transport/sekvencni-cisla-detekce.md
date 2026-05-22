# Sekvenční čísla a detekce chyb

Pět typů paketových chyb ([[chyby-paketu]]) potřebujeme nejdřív **detekovat**, než je můžeme opravit. Hlavním mechanismem detekce v TCP a podobných protokolech je **sekvenční číslování paketů** — každý paket nese unikátní pořadové číslo, podle kterého příjemce pozná duplikaci, ztrátu nebo přeházení.

## Sekvenční čísla

> **Sekvenční číslo** = jedinečné číslo v paketu, které identifikuje jeho *pořadí v datovém toku*.

Chování:

- *Inkrementuje se* pro každý nový paket (ne pro retransmisi téhož paketu).
- Při *přetečení* se nuluje — čísla tvoří **okruh** (mod $2^n$).

### Co všechno sekvenční čísla detekují

| Chyba | Jak ji sekvenční čísla odhalí |
| :--- | :--- |
| **Duplikace** | stejné sekvenční číslo dorazí dvakrát |
| **Změna pořadí** | čísla nepřicházejí monotónně |
| **Ztráta** | *mezera* v posloupnosti |
| **Vložení** | *odchylka* od posloupnosti (ale ne vždy spolehlivě) |

## Velikost prostoru sekvenčních čísel

Klíčová otázka: *kolik bitů má mít sekvenční číslo?*

- Příliš málo bitů → *přetečení během žití paketu v síti* (zmatek).
- Příliš mnoho bitů → *plýtvání* (zbytečně velká hlavička).

### Parametry

Pro odvození potřebujeme:

- **MPL** (*Maximum Packet Lifetime*) — max. čas, který paket smí v síti existovat $[s]$. Pro IPv4 odpovídá MSL = 2 min (RFC 793).
- **T** — max. doba, po kterou je odesílatel ochoten paket *čekat na potvrzení* a být schopen ho znovuzaslat $[s]$.
- **A** — max. doba, po kterou se příjemce může zdržet *před zasláním potvrzení* (delayed ACK) $[s]$.
- **R** — max. přenosová rychlost odesílatele $\left[\frac{\text{pakety}}{s}\right]$.

### Vzorec

Největší možný počet *aktivních* paketů (paket je aktivní, dokud čeká na ACK nebo na retransmisi):

$$n_{\max} = (2 \cdot MPL + T + A) \cdot R$$

Faktor $2 \cdot MPL$ pokrývá *cestu tam i zpět* paketu, $T + A$ je *čekací doba* odesílatele a příjemce. Vynásobeno *rychlostí* dostane *kolik paketů* se vejde do tohoto okna.

Sekvenční prostor musí být alespoň takový:

$$2^n > n_{\max} \quad \Rightarrow \quad n = \lceil \log_2 n_{\max} \rceil$$

### Příklad

Paket žije max 2 min, odesílatel má 2 Mbps linku a je ochoten paket retransmise po dobu 1 min, příjemce ACKuje do 500 ms. Pakety mají 40 B.

- $MPL = 120 \text{ s}$, $T = 60 \text{ s}$, $A = 0{,}5 \text{ s}$.
- $R = \frac{2 \cdot 10^6 \text{ b/s}}{40 \cdot 8 \text{ b/packet}} = 6250 \text{ packets/s}$.
- $n_{\max} = (2 \cdot 120 + 60 + 0{,}5) \cdot 6250 = 300{,}5 \cdot 6250 = 1\,878\,125$ paketů.
- $n = \lceil \log_2 1\,878\,125 \rceil = 21$ bitů.

V TCP je sekvenční prostor $n = 32$ bitů — *bohatě stačí* i pro multi-Gb/s linky, ale na 100 Gb/s ethernetu se začíná přetékat (RFC 7323 — *TCP Extensions for High Performance*, timestamp option).

## Negativní potvrzování (NACK)

Vedle sekvenčních čísel existuje **alternativní detekce** — *negativní potvrzování*:

- *Funguje bez jakýchkoli timeoutů.*
- **Princip:** příjemce odesílateli zašle, *které pakety k němu nedorazily* (z mezery v sekvencích).

### Nevýhody

- Při zahlcení sítě se *posílání NACKů* dále podílí na zahlcení.
- Co když se *NACK sám ztratí*? Stále potřebujeme zpětný timeout.

### Použití

- *RTP* (real-time multimedia) — kombinuje s FEC.
- *Některé multicast protokoly* (NAK-based reliable multicast).
- Pro point-to-point CO transport je *čistá* NACK metoda nedostatečná — kombinuje se s ACK a timeoutem.

## 3-way handshake — detekce v navazování spojení

Při *navazování* TCP spojení vznikají specifické problémy:

1. **Normální** — A pošle CR (Connection Request) se seq=x, B odpoví ACK(x) se seq=y, A odpoví DATA s ACK=y. ⇒ 3-way handshake.
2. **Starý CR** — duplikátní CR z minulého spojení se *zničehonic objeví*. B nechť pošle ACK, A pozná, že to nepatří k aktuálnímu pokusu → REJECT.
3. **Duplikátní CR a duplikátní ACK** — kombinace, vyžaduje pečlivé porovnávání seq.

Tří-cestný handshake **garantuje** synchronizaci sekvenčních čísel obou stran *a* odolnost vůči duplikátním CR z minulých spojení. Detail viz později ([[tcp-spojeni-hlavicka]] v Lec 2 pokračování).

## Ukončování spojení — 4 scénáře

Při *ukončování* TCP spojení vznikají 4 případy (DR = Disconnect Request):

1. *Normální:* A pošle DR, B odpoví DR, A odpoví ACK.
2. *Poslední ACK se ztratí:* B timeoutuje, znovu pošle DR.
3. *Odpověď se ztratí:* A timeoutuje, znovu pošle DR.
4. *Odpověď i následující DR se ztratí:* po N timeoutech obě strany ukončí spojení samy.

To je důvod, proč TCP používá **`TIME_WAIT` state** — po posledním ACK čeká `2 * MSL`, kdyby přišel duplikátní DR.

## Co dále

Detekce přes sekvenční čísla je jasná. Otázka je *jak dlouho čekat* na potvrzení, než prohlásíme paket za ztracený. To je problém **timeoutu a odhadu RTT** — viz [[timeouty-rtt]].

---

*Zdroj: PDS přednáška 2 (Transportní protokoly), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 793 — TCP](https://www.rfc-editor.org/rfc/rfc793), kap. 3.3 (Sequence Numbers); [RFC 7323 — TCP Extensions for High Performance](https://www.rfc-editor.org/rfc/rfc7323).*
