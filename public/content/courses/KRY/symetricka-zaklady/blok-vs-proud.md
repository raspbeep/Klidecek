---
title: Blokové a proudové šifry
---

# Blokové a proudové šifry

Symetrické šifry se dělí podle *velikosti zpracovávaného vstupu*. **Bloková šifra** přijme blok pevné délky (typicky 64–256 bitů) a klíč; výstupem je stejně velký blok ciphertextu. **Proudová šifra** zpracovává znak po znaku (bit po bitu) — typicky XORem s pseudonáhodným klíčovým proudem.

Volba ovlivňuje *kde* a *jak* lze šifru použít, *jak* se navrhuje protokol nad ní a jaké útoky jsou pro ni nebezpečné.

## Bloková šifra — definice

Bloková šifra je dvojice efektivních funkcí

::: math
E : \{0,1\}^k \times \{0,1\}^n \to \{0,1\}^n, \qquad D : \{0,1\}^k \times \{0,1\}^n \to \{0,1\}^n,
:::

kde $k$ je délka klíče (key length) a $n$ je velikost bloku (block size), s podmínkou $D_K(E_K(M)) = M$ pro každý $K, M$. Pro libovolný klíč $K$ je $E_K$ **bijektivní permutací** na $\{0,1\}^n$.

| Šifra | $n$ | $k$ |
| :--- | :-: | :-: |
| DES | 64 | 56 |
| 3DES | 64 | 112 / 168 |
| AES | 128 | 128 / 192 / 256 |
| Camellia | 128 | 128 / 192 / 256 |
| Twofish | 128 | 128 / 192 / 256 |
| Blowfish | 64 | 32–448 |

> **Velikost bloku** určuje, kolik plaintextu projde *jedním voláním* šifry. Větší blok = víc dat *bezpečně* za jedno volání (méně problémů s opakováním), ale větší implementační overhead.

## Proudová šifra — definice

Proudová šifra generuje **klíčový proud** (keystream) $z = z_1 z_2 z_3 \dots$, který se XORuje s plaintextem:

::: math
C_i = M_i \oplus z_i, \qquad M_i = C_i \oplus z_i.
:::

Klíčový proud je *deterministicky generovaný* z klíče $K$ (a obvykle navíc *nonce* nebo *IV*). Bezpečnost stojí na nerozlišitelnosti $z$ od pravé náhody — proto se proudová šifra někdy nazývá **pseudonáhodný generátor** (PRG) z bezpečného semene.

| Šifra | Klíč | Stav | Útoky |
| :--- | :-: | :-: | :--- |
| RC4 | 40–256 b | 256 bajtů (S, i, j) | RC4-bias, FMS, related-keys |
| ChaCha20 | 256 b | 512 b (16 × 32 b) | žádný známý útok |
| Salsa20 | 128 / 256 b | 512 b | žádný známý praktický útok |
| A5/1 (GSM) | 64 b | 3 LFSR (19+22+23 b) | TMTO, real-time |
| E0 (Bluetooth) | 128 b | 4 LFSR | algebraické útoky |

## Klíčové rozdíly

::: svg "Blok versus proud — schematicky"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20"  y="30"  width="240" height="180" rx="8"/>
    <rect x="280" y="30"  width="240" height="180" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="13">
    <text x="140" y="56">Bloková šifra</text>
    <text x="400" y="56">Proudová šifra</text>
  </g>
  <g fill="var(--text-muted)" font-size="11">
    <text x="40" y="84">• fixní blok (128 b)</text>
    <text x="40" y="104">• 1 volání = 1 blok</text>
    <text x="40" y="124">• klíčový rozvrh (~50 cyklů)</text>
    <text x="40" y="144">• potřebuje režim (ECB,…)</text>
    <text x="40" y="164">• padding pro neúplný blok</text>
    <text x="40" y="184">• zranitelnost: padding, IV</text>

    <text x="300" y="84">• zpracuje 1 bit / 1 byte</text>
    <text x="300" y="104">• kontinuální keystream</text>
    <text x="300" y="124">• inicializace + krok</text>
    <text x="300" y="144">• prostě XOR (C = M ⊕ z)</text>
    <text x="300" y="164">• žádný padding</text>
    <text x="300" y="184">• zranitelnost: nonce reuse</text>
  </g>
</svg>
:::

### Blokové výhody a nevýhody

**Výhody:**

* **Větší stavový prostor.** AES má 128bitový blok; přejet všechny vstupy by trvalo $2^{128}$ pokusů.
* **Lépe se konstruují útoky bezpečnostních důkazů.** Bezpečnost mnoha schémat (CBC, GCM, MAC) lze formálně redukovat na pseudonáhodnost blokové šifry.
* **AES-NI** (od Intel Westmere 2010) — hardwarová akcelerace; AES-128 dosáhne ~5 GB/s/jádro.

**Nevýhody:**

* **Padding.** Pro plaintext, který není násobek bloku, potřebujeme doplnit ([[padding-aead|PKCS#7]]) — to otevírá padding oracle útoky.
* **Latenci.** Šifrování krátké zprávy stejně vyžaduje plný blok ($\geq 128$ b).
* **Režim činnosti je separátní problém.** ECB je nebezpečný; CBC vyžaduje IV; CTR vyžaduje nonce. Volba špatného režimu = totální průlom (viz [[rezimy]]).

### Proudové výhody a nevýhody

**Výhody:**

* **Bez paddingu** — XOR po jednotlivých bitech zpracuje jakoukoli délku.
* **Nízká latence** — první byte je hotový po jedné iteraci, ne po plném bloku.
* **Symetrie** — keystream lze předgenerovat předem, šifrování pak jen XOR.
* **Vhodné pro hardware s omezeným prostorem** (GSM, IoT) — A5/1 implementace má pár tisíc hradel.

**Nevýhody:**

* **Nonce reuse je katastrofa** — pokud se použije stejný nonce s stejným klíčem, dva XOR'd plaintexty se odhalí (two-time pad, viz [[one-time-pad]]).
* **Žádná autentizace** — XOR může útočník přepsat bit po bitu (bit-flipping). Musí se použít zvlášť MAC ([[mac-hmac]]) nebo AEAD ([[padding-aead|ChaCha20-Poly1305]]).
* **Mnoho proudových šifer historicky padlo** — RC4 byl základem WEP a po ~20 letech analyzy se objevily desítky útoků.

## Blokové šifry v proudovém režimu — CTR

**Bloková šifra v CTR režimu** funguje jako proudová: generuje keystream tak, že šifruje řadu *čítačů*:

::: math
z_i = E_K(\mathrm{nonce} \| i), \qquad C_i = M_i \oplus z_i.
:::

Výhody obou: bezpečnostní důkazy blokové šifry (AES je dobře prostudovaná), žádný padding (XOR po byte), paralelizovatelné (každý blok keystreamu generován nezávisle). **AES-CTR + Poly1305 = AEAD** — moderní standard.

> Důsledek: rozlišení blok vs. proud je z hlediska *použití* spíše umělé. Konstrukce se *mohou* používat zaměnitelně. Rozdíl zůstává v *bezpečnostních předpokladech* a *implementačních nárocích*.

## Konkrétní volba v praxi

| Případ | Doporučení |
| :--- | :--- |
| TLS 1.3 | AES-128-GCM nebo ChaCha20-Poly1305 |
| Disk encryption | AES-XTS (XEX-based Tweaked-codebook with Ciphertext Stealing) |
| Bluetooth LE | AES-CCM |
| Wi-Fi (WPA3) | AES-CCM (CCMP) nebo AES-GCM (GCMP) |
| Mobilní (LTE/5G) | AES-CTR + AES-CMAC, ZUC, Snow 3G |
| IoT / embedded | AES-GCM (HW), nebo ChaCha20-Poly1305 (SW) |

Žádný moderní protokol nepoužívá *čistě* proudovou nebo *čistě* blokovou šifru — kombinace zajišťuje *důvěrnost* (proud/CTR) i *autenticitu* (MAC/Poly1305) v jedné konstrukci (AEAD).

## Limit "pravěkých" proudových šifer — RC4

RC4 (1987 RSA Security, *trade secret* do 1994 kdy ho někdo zveřejnil anonymně) je didakticky důležitý: jednoduchá konstrukce, ale **rozsáhlé biases v keystreamu**. Útok Fluhrer-Mantin-Shamir (2001) na WEP, AlFardan-Bernstein-Paterson-Poettering-Schuldt (2013) na TLS-RC4. Praktický útok na RC4 v TLS dělal odhad cookie session během cca $2^{30}$ připojení — proveditelné u dlouho-běžících sessions.

RFC 7465 (2015) zakázalo RC4 v TLS. Dnešní moderní proudové šifry (ChaCha20, Salsa20) jsou navrženy s odlišnou filozofií — ARX (Add-Rotate-XOR) bez tabulek, bez timing side channels.

---

*Zdroj: KRY přednášky 2025/26, KRY 3 — Symetrické algoritmy. Externí reference: Stallings, W.: *Cryptography and Network Security* (8th ed., Pearson 2022), kap. 6, 7; Bernstein, D. J.: "ChaCha, a variant of Salsa20", Workshop Record of SASC 2008; AlFardan, N., Bernstein, D., Paterson, K., a kol.: "On the Security of RC4 in TLS", USENIX Security 2013; NIST SP 800-67 Rev. 2: Recommendation for the Triple Data Encryption Algorithm (2017).*
