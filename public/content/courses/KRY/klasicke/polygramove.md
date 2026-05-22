---
title: Polygramové šifry (Playfair, Hill)
---

# Polygramové šifry

Polygramová šifra **šifruje skupinu znaků naráz** — digram (dvojici), trigram, obecně $n$-gram. Tím skrývá frekvence jednotlivých znaků (které u [[mono-substituce|monoalfabetické substituce]] útočníka vedou za ruku) a *zvyšuje stavový prostor* — pro digramy ze 26písmenné abecedy je možností $26^2 = 676$ místo 26.

> Trade-off: tabulka substituce roste exponenciálně se skupinou. Pro plný digram bychom potřebovali $676 \times 676$ tabulku — nepraktické na papíře. Reálné šifry proto definují substituci *algoritmicky* z menšího klíče.

## Playfairova šifra

Vynalezena **Charlesem Wheatstoneem** (1854), zpopularizována **Lyonem Playfairem** (odtud jméno). Používaná britskou armádou v 1. světové válce, australským signal corps ve 2. válce, IRA do 1990s.

### Konstrukce klíčové matice

Klíčem je 25-znaková matice $5 \times 5$ (písmeno *J* se ztotožňuje s *I*, nebo se vynechá):

```
Klíč: "MONARCHY"

  M O N A R
  C H Y B D
  E F G I K
  L P Q S T
  U V W X Z
```

Postup naplnění:

1. Klíčové slovo (bez opakování písmen) zleva nahoře.
2. Zbylá písmena abecedy doplníme v abecedním pořadí.

### Šifrování digramu

Plaintext rozdělíme na **dvojice** (digramy). Pokud má dvojice dvě stejná písmena, vložíme mezi ně `X` (nebo `Q`). Pokud má text lichý počet znaků, doplníme `X` na konec.

Pro každý digram $(P_1, P_2)$ aplikujeme jedno ze tří pravidel:

| Vztah písmen | Pravidlo |
| :--- | :--- |
| stejný **řádek** | nahradíme každé písmenem **vpravo** (cyklicky) |
| stejný **sloupec** | nahradíme každé písmenem **dolů** (cyklicky) |
| **obdélník** (různé řádky i sloupce) | každé písmeno → ve svém řádku, ale ve sloupci toho druhého |

### Příklad

Plaintext "HIDE THE GOLD" → dvojice `HI DE TH EG OL DX` (poslední X doplněno).

```
HI:  H je v řádku 'CHYBD', I je v řádku 'EFGIK' — obdélník
     H sloupec C (sloupec 0), I sloupec 3
     → BM (H→sloupec 3 v jeho řádku = B; I→sloupec 0 v jeho řádku = E)
     ⚠ pozor — řekněme:
     H (řádek 1, sl. 1) ↔ I (řádek 2, sl. 3)
     ciphertext = (řádek 1, sl. 3, řádek 2, sl. 1) = B, F
     → BF
```

(Korektní výsledek závisí na konkrétní orientaci matice; v praxi se tabuluje.)

::: viz playfair "Klíčové slovo definuje 5×5 matici. Klikněte na digram nahoře a podívejte se, podle kterého pravidla (řádek / sloupec / obdélník) se šifruje."
:::

### Bezpečnost Playfair

* **Klíčový prostor:** $25! \approx 1{,}55 \cdot 10^{25}$ klíčových matic ($\approx 2^{84}$). Brute force nepraktický.
* **Útok přes digramové frekvence:** Playfair zachovává **digramovou strukturu**. Nejčastější anglické digramy (`TH`, `HE`, `IN`, `ER`, ...) se v ciphertextu projeví jako nejčastější digramy ciphertextu. Útok podobný frekvenční analýze, jen na 676-prvkové tabulce.
* **Strukturální vlastnosti:**
  * V ciphertextu je vždy *sudý* počet písmen.
  * Žádný digram `XX` (stejná písmena vedle sebe) — protože jsme je oddělili.
  * Reverzní digram plaintextu → reverzní digram ciphertextu (např. `ER` → `XY`, pak `RE` → `YX`).
  * Žádné písmeno se nešifruje samo na sebe.

V praxi Playfair padá při zprávách *cca několik stovek znaků*. Pro krátké válečné rozkazy byl dlouho dostatečný.

## Hillova šifra

Lester Hill (1929) — první **opravdově polygramová** šifra (n znaků pro libovolné *n* najednou) a první šifra postavená na **lineární algebře** v $\mathbb{Z}_{26}$.

### Princip

Plaintext rozdělíme do bloků délky $n$ a každý reprezentujeme jako vektor v $\mathbb{Z}_{26}^n$. Klíčem je **regulární matice** $K \in \mathbb{Z}_{26}^{n \times n}$. Šifrování:

::: math
C = K \cdot M \pmod{26}, \qquad M = K^{-1} \cdot C \pmod{26}.
:::

Matice $K$ musí být *invertibilní v $\mathbb{Z}_{26}$* — tedy $\det(K)$ musí mít inverzi modulo 26, což znamená $\gcd(\det(K), 26) = 1$.

### Příklad ($n = 2$)

::: math
K = \begin{pmatrix} 3 & 3 \\ 2 & 5 \end{pmatrix}, \qquad \det(K) = 3 \cdot 5 - 3 \cdot 2 = 9.
:::

$\gcd(9, 26) = 1$, tedy $K$ je invertibilní. Inverze: $9^{-1} \equiv 3 \pmod{26}$, takže

::: math
K^{-1} = 3 \begin{pmatrix} 5 & -3 \\ -2 & 3 \end{pmatrix} = \begin{pmatrix} 15 & -9 \\ -6 & 9 \end{pmatrix} \equiv \begin{pmatrix} 15 & 17 \\ 20 & 9 \end{pmatrix} \pmod{26}.
:::

Šifrování `HE` ($H = 7, E = 4$):

::: math
C = K \begin{pmatrix} 7 \\ 4 \end{pmatrix} = \begin{pmatrix} 3 \cdot 7 + 3 \cdot 4 \\ 2 \cdot 7 + 5 \cdot 4 \end{pmatrix} = \begin{pmatrix} 33 \\ 34 \end{pmatrix} \equiv \begin{pmatrix} 7 \\ 8 \end{pmatrix} = \mathrm{HI}.
:::

### Bezpečnost Hillovy šifry

Hillova šifra je **lineární** — což je z hlediska kryptografie *katastrofa*. Pokud má útočník $n$ lineárně nezávislých dvojic $(M_i, C_i)$ známého plaintextu (KPA), může lineárně vyřešit klíč:

::: math
[C_1 | C_2 | \dots | C_n] = K \cdot [M_1 | M_2 | \dots | M_n], \quad K = C \cdot M^{-1}.
:::

Stačí mít *jeden blok plaintextu a odpovídající ciphertext* o $n$ vektorech — typicky pár vět známého textu. Hillova šifra je tedy **prolomena za jednotky milisekund**, i pro $n = 20$.

> **Důsledek pro moderní kryptografii.** *Lineární* šifry jsou principiálně slabé. Moderní blokové šifry ([[feistel-spn|AES, DES]]) musí mít **nelineární** komponenty (S-boxy). Lineární kryptoanalýza ([[utoky-blokove]]) je útok, který se snaží *lineárně aproximovat* moderní šifru — protože lineární systémy umíme řešit.

::: viz hill-cipher "Hillova šifra a útok přes známý plaintext (KPA). Zadejte 2×2 klíčovou matici a sledujte, jak útočník ze 4 znaků plaintextu rekonstruuje klíč soustavou rovnic v Z₂₆."
:::

## Polygramové šifry obecně — limity

* **Skupina délky $n$** zachovává frekvenci $n$-gramů. Útočník potřebuje dostatečně dlouhý ciphertext pro statistickou analýzu $n$-gramů.
* **Délka klíče** roste s $n$ (pro Hill: $n^2 \log_2 26$ bitů; pro libovolnou substituci $n$-gramů: $\log_2((26^n)!)$ bitů — neúnosné).
* **Nelinearita** — Hillova šifra je lineární a tím prolomitelná pomocí KPA s několika páry. Playfair je *nelineární*, ale jeho stavový prostor je malý.

Polygramové šifry jsou historicky důležité jako *předstupeň* k moderním blokovým šifrám: blok = $n$-gram, klíč definuje **rozsáhlou nelineární transformaci** bloku, šifra se *iteruje*.

---

*Zdroj: KRY přednášky 2025/26, KRY 1 — Klasická kryptografie. Externí reference: Hill, L. S.: "Cryptography in an Algebraic Alphabet", American Mathematical Monthly 36(6), 1929; Playfair, L., Wheatstone, C.: zprávy britského Foreign Office, 1854; Stinson, D.: *Cryptography: Theory and Practice* (4th ed., CRC 2018), §2.1.7.*
