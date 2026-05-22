# Bitové vektory a kartézský součin

Hierarchické trie ([[2d-klasifikace]]) zvládají 2D. Pro **plnou ACL klasifikaci** (5-tuple) potřebujeme jiné techniky. Tato sekce ukazuje dva klasické algoritmy: **Lucent Bit Vector** a **Cross Producting**.

## Lucent Bit Vector (LBV)

**LBV** (Lakshman, Stiliadis, SIGCOMM 1998) používá **bitový vektor** pro popis výskytu prefixů v množině pravidel.

### Princip

Pro každou *dimenzi* a každou *hodnotu prefixu* sestrojíme **bit vector**, který má bit nastavený na 1 pro pravidla, *jejichž prefix v této dimenzi pokrývá danou hodnotu*.

Pro klasifikaci: spočtěme **bitový AND** vektorů přes všechny dimenze; výsledný vektor má 1 jen pro pravidla, která matchují *ve všech* dimenzích současně.

### Příklad

Pravidla (6 pravidel × 5 dimenzí):

| | Dst IP | Src IP | Dst port | Src port | Proto | Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 147.229.\*.\* | \* | 25 | \* | \* | permit |
| 2 | 147.229.\*.\* | \* | 53 | \* | UDP | permit |
| 3 | 147.229.\*.\* | \* | 22 | \* | TCP | permit |
| 4 | 147.229.5.1 | 153.13.2.5 | 123 | 123 | UDP | permit |
| 5 | \* | 117.16.\*.\* | \* | \* | IP | permit |
| 6 | \* | \* | \* | \* | \* | deny |

Bit vectory:

| Destination Prefixes | Bit vector |
| :--- | :--- |
| 147.229.\*.\* | 111011 |
| 147.229.5.1 | 111111 |
| \* | 000011 |

Bit 1 znamená *pravidlo se v dimenzi pokrývá touto hodnotou*. Např. `147.229.*.*` pokrývá pravidla 1, 2, 3 (samé `147.229.*.*`) + 4 (`147.229.5.1` je v `147.229.*.*`) + 5, 6 (`*` jsou v *libovolném*).

### Lookup

Pro paket H = (147.229.5.1, 147.228.15.1, 53, 1029, UDP):

1. **Pro každou dimenzi** vyhledej bit vector podle prefixu paketu (LPM v dané dimenzi).
2. **AND** všech vektorů.
3. **První 1** ve výsledném vektoru → matching pravidlo (s nejvyšší prioritou).

Příklad:

- DstIP 147.229.5.1 → vector `111111`.
- SrcIP 147.228.15.1 → vector `111001` (matchuje pravidla 1, 2, 3, 6).
- DstPort 53 → vector `010011`.
- SrcPort 1029 → vector `111011` (matchuje 1, 2, 3, 5, 6).
- Proto UDP → vector `110111`.

AND = `010001` → první 1 je pravidlo 2 (UDP/53). To se dá *vyložit* jako *„povol DNS"* (port 53 UDP).

### Vlastnosti

- *Časová složitost lookupu:* $\mathcal{O}(d \cdot W + N/w)$ — d trie traverz + jeden AND.
- *Prostorová složitost:* $\mathcal{O}(N^2)$ pro malé množiny pravidel; lze redukovat **Aggregated Bit Vector** (ABV).
- *Vhodné pro střední počet pravidel* (řád stovek–tisíců).

### Implementace bit vector pomocí trie

Bit vector je často *řídký* (mnoho 0 bitů). Místo přímého vector lookupu se používá **trie** pro každou dimenzi, kde *listy obsahují bit vector*. To redukuje paměť.

## Kartézský součin (Cross Producting)

**Cross Producting** (Srinivasan et al., 1998) **předpočítá** výsledek klasifikace pro **každou kombinaci prefixů** napříč dimenzemi.

### Princip

Pro každou kombinaci $(p_1, p_2, \ldots, p_n)$ z $X_1 \times X_2 \times \ldots \times X_n$ (kartézský součin množin prefixů jednotlivých dimenzí) **uložíme matching pravidlo**.

### Příklad

Pravidla (6 pravidel jako výše).

Rozdělení dimenzí na M = 5:

```
M0: Destination Prefix        M1: Source Prefix          M2: DstPort Prefix
   147.229.*.*                   153.13.2.5                 25
   147.229.5.1                   117.16.*.*                 53
   *                             *                          22
                                                            123
                                                            *
M3: SrcPort Prefix             M4: Flag Prefix
   123                           UDP
   *                             TCP
                                 IP
                                 *
```

Cross product všech kombinací:

| # | Cross Product | Matching Rule |
| :--- | :--- | :--- |
| 1 | (147.229.\*.\*, 153.13.2.5, 25, 123, UDP) | Rule 1 |
| 2 | (147.229.\*.\*, 153.13.2.5, 53, 123, TCP) | Rule 1 |
| 3 | (147.229.\*.\*, 153.13.2.5, 25, 123, \*) | Rule 1 |
| 4 | (147.229.\*.\*, 153.13.2.5, 123, \*, \*) | Rule 1 |
| 5 | (147.229.\*.\*, 153.13.2.5, 53, \*, UDP) | Rule 1 |
| 6 | (147.229.\*.\*, 153.13.2.5, 25, \*, TCP) | Rule 1 |
| ⋮ | ⋮ | ⋮ |
| 359 | (\*, \*, \*, \*, IP) | Rule 6 |
| 360 | (\*, \*, \*, \*, \*) | Rule 6 |

Pro $M$ dimenzí a $p_i$ prefixů v $i$-té dimenzi: $\prod_{i=1}^M p_i$ kombinací.

### Lookup

Pro paket:

1. **Pro každou dimenzi** vyhledej nejdelší prefix shody (LPM).
2. Pak **zkonstruuj kombinaci** prefixů (cross product entry).
3. **Hashuj** kombinaci a vyhledej v tabulce (hash lookup).
4. **Vrátí matching rule**.

```
Packet P:  147.229.1.1   153.13.2.5    25    13223    TCP
              ↓             ↓           ↓      ↓         ↓
LPM →   147.229.*.*   153.13.2.5    25    *        TCP
                       (přesně)
              ↓ (concatenation)
        147.229.*.*  153.13.2.5  25  *  TCP
              ↓ (hash)
        0xa106cd34
              ↓ (table lookup)
        (147.229.*.*, 153.13.2.5, 25, *, TCP) → Rule 1
```

### Vlastnosti

- *Časová složitost:* $\mathcal{O}(d \cdot W + 1)$ — LPM + hash lookup.
- *Prostorová složitost:* exponenciální v počtu dimenzí (worst case $\mathcal{O}(N^K)$ kombinací).
- *Vhodné pro malý počet dimenzí (2–3)* — pro 5-tuple ACL by exploze cross-productu byla *katastrofální*.

### Recursive Flow Classification (RFC)

**RFC** (Gupta, McKeown, 2000) je *rozšíření* cross producting — postupně *zužuje* prostor pomocí rekurze. Místo jedné velké hash tabulky používá *posloupnost menších*.

RFC se používá v některých enterprise routerech (Cisco PFC). Jeho účinnost spočívá v tom, že **redukuje paměťovou složitost** za cenu několika hash lookupů místo jednoho.

---

*Zdroj: PDS přednáška 6, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: Lakshman, T.V., Stiliadis, D.: „High-Speed Policy-Based Packet Forwarding Using Efficient Multi-Dimensional Range Matching" (ACM SIGCOMM 1998, [DOI 10.1145/285237.285283](https://doi.org/10.1145/285237.285283)); Gupta, P., McKeown, N.: „Packet Classification using Hierarchical Intelligent Cuttings" (Hot Interconnects 7, 1999).*
