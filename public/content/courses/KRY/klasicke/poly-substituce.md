---
title: Polyalfabetická substituce
---

# Polyalfabetická substituce

Slabina [[mono-substituce|monoalfabetické substituce]] je v tom, že *frekvence znaků jsou invariantní* — nejčastější znak ciphertextu odpovídá nejčastějšímu znaku plaintextu, a útočník to využije. Polyalfabetická substituce tuto invariantu rozbije tím, že **střídá více substitučních abeced** podle pozice znaku ve zprávě. Idea sahá do 15. století (Alberti), ale dokonalou kanonickou podobu dostala u Blaise de Vigenère (~1550).

## Albertiho disk a Trithemiova *tabula recta*

První polyalfabetický systém (Leon Battista Alberti, 1466) byl mechanický disk se dvěma soustřednými prstenci abecedy. Při zašifrování několika písmen se vnitřní disk pootočil — efektivně se přepínalo mezi několika Caesarovými šiframi.

Johannes Trithemius v knize *Polygraphia* (1518) tabuloval **všech 26 Caesarových posunů** najednou — *tabula recta*. Šifrování bez klíče: $i$-tý znak plaintextu se posune o $i \bmod 26$ pozic. Bez klíče je triviálně řešitelné (útočník zná schéma).

## Vigenèrova šifra

Vigenère přidal *klíč*. Klíčem je **slovo nebo fráze**; klíč se cyklí, jeho znaky určují posuny:

::: math
C_i = (M_i + K_{i \bmod \ell}) \bmod 26, \qquad M_i = (C_i - K_{i \bmod \ell}) \bmod 26,
:::

kde $\ell$ je délka klíče. Klíčový prostor pro klíč délky $\ell$ je $26^\ell$ — pro $\ell = 6$ máme $\approx 3 \cdot 10^8$ (32 bitů), pro $\ell = 10$ už $\approx 1{,}4 \cdot 10^{14}$ (47 bitů). Brute force je proto problematický.

```
Plaintext: V I G E N E R E S C I P H E R
Klíč:      K E Y K E Y K E Y K E Y K E Y
                                          (klíč "KEY" cyklen)
Ciphertext: F M E O R C B I Q M M N R I P
```

Šifrování i-tého znaku ($V = 21$, $K = 10$): $C_0 = (21 + 10) \bmod 26 = 5 = F$.

### Vigenèrova tabulka

Tabulka 26 × 26: řádek = znak klíče, sloupec = znak plaintextu, průsečík = znak ciphertextu.

```
   A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
A  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
B  B C D E F G H I J K L M N O P Q R S T U V W X Y Z A
C  C D E F G H I J K L M N O P Q R S T U V W X Y Z A B
...
K  K L M N O P Q R S T U V W X Y Z A B C D E F G H I J
```

## Varianty

* **Beaufort:** $C_i = (K_i - M_i) \bmod 26$ — symetrická (šifrování i dešifrování stejnou operací).
* **Beaufort variant:** $C_i = (M_i - K_i) \bmod 26$.
* **Autoklíč (Vigenère):** Klíč se *neopakuje*, ale po krátkém startovním klíči pokračuje *plaintextem zprávy* (anebo *ciphertextem*). Eliminuje periodicitu — útoky níže neplatí (alespoň ne přímo).

```
Klíč (autoklíč): D  A L B A T R O ...
Plaintext:       A  L B A T R O S
Ciphertext:      D  L M B T K F G
```

První znak D je domluvený, dále je každý další klíčový znak rovný předchozímu plaintextovému znaku.

## Útoky na Vigenèrovu šifru

Vigenère byla **nerozluštěna ~300 let**. Babbage (utajeno) a Kasiski (publikováno 1863) ji prolomili. Útok má dvě fáze: *najít délku klíče*, pak *vyřešit jako řetězec Caesarových šifer*.

### 1. Kasiskiho test — délka klíče

Pokud se v plaintextu opakuje stejné slovo na pozicích $i$ a $j$ a vzdálenost $j - i$ je násobkem délky klíče $\ell$, pak budou *zašifrovány stejně*. V ciphertextu hledáme **opakující se trigramy nebo delší řetězce** a zaznamenáme vzdálenosti mezi nimi.

> Pokud najdeme vzdálenosti $d_1, d_2, \dots, d_n$, pak délka klíče je *dělitelem* všech z nich. Pravděpodobný kandidát je $\ell = \gcd(d_1, \dots, d_n)$.

Příklad: trigram `TYX` se v ciphertextu vyskytuje na pozicích 25, 181, 235. Vzdálenosti: $156, 54$. $\gcd(156, 54) = 6$. Délka klíče je pravděpodobně 6.

### 2. Index koincidence — délka klíče (alternativně)

**Index koincidence** $I_c$ řetězce $x$ je pravděpodobnost, že dva náhodně vybrané znaky $x$ jsou stejné:

::: math
I_c(x) = \sum_{i=0}^{25} \binom{f_i}{2} \Big/ \binom{n}{2} = \frac{\sum_i f_i(f_i - 1)}{n(n-1)},
:::

kde $f_i$ je počet výskytů $i$-tého písmena a $n = |x|$.

* **Náhodný text** (uniformní distribuce 26 písmen): $I_c \approx 1/26 \approx 0{,}038$.
* **Angličtina** (zachované frekvence): $I_c \approx 0{,}065$.
* **Monoalfabeticky substituovaný plaintext** (frekvence zachovány): $I_c \approx 0{,}065$.
* **Polyalfabeticky substituovaný plaintext s dlouhým klíčem**: $I_c \to 0{,}038$ (frekvence rozprostřené).

Postup: zkoušíme $\ell = 1, 2, 3, \dots$. Rozdělíme ciphertext na $\ell$ podřetězců po znacích na pozicích $i, i + \ell, i + 2\ell, \dots$ a spočítáme $I_c$ pro každý. Když $\ell$ trefíme správně, každý podřetězec je výsledkem *jednoho* Caesarova posunu, takže má $I_c$ angličtiny. Když $\ell$ netrefíme, podřetězce mají pomíchané posuny a $I_c$ je nižší.

### 3. Rozluštění jednotlivých klíčových znaků

Po určení $\ell$ je zpráva rozdělena na $\ell$ řetězců. Každý je zašifrován **jediným posunem** = jednoduchá Caesarova šifra. Frekvenční analýza na každém zvlášť vrátí klíč znak po znaku.

::: viz vigenere-attack "Vyzkoušejte různé předvolby a posouvejte hypotézu délky klíče. Při správné délce skočí průměrný IC z 0.038 (náhoda) k 0.065 (angličtina)."
:::

### Friedmanův test (kappa test)

Alternativní statistika ke Kasiskimu: spočítáme **počet shod** $\kappa$, když řetězec přiložíme sám na sebe posunutý o $d$. Pro $d = $ délka klíče je shod podstatně více než pro $d \neq \ell$.

## Proč pozdější polyalfabetické šifry padly

Vigenère je zranitelná, protože **klíč se opakuje**. Pokud klíč zvolíme stejně dlouhý jako zpráva a navíc *náhodný*, dostáváme [[one-time-pad|one-time pad]] — perfektně bezpečný. Mezistupně:

* **Autoklíč** — částečně řeší periodicitu, ale po krátkém startovním klíči je zpráva *sama svým klíčem*, takže útočník může uhodnout fragment plaintextu a iterovat.
* **Knihový klíč** (book cipher) — klíčem je text knihy (Bible, román), dohodnutý mezi účastníky. Klíč není periodický a "vypadá náhodně", ale zachovává frekvence jazyka klíče. Útok přes statistiku digramů obou jazyků (plaintextu i klíče).
* **Mechanické polyalfabetické systémy** ([[rotor-princip|rotorové stroje]]) — efektivně mají *enormní* periodu (Enigma: $\approx 10^{17}$). Útok ne přes periodu, ale přes *strukturu* (Bombe).

## Postavení v hierarchii klasických šifer

| Šifra | Klíčový prostor | Útok | Cca čas útoku |
| :--- | :-: | :--- | :--- |
| Caesar | 25 | brute force | sekundy |
| Mono-substituce | $26! \approx 2^{88}$ | frekvenční analýza | minuty (ručně) |
| Vigenère ($\ell = 6$) | $26^6 \approx 2^{28}$ | Kasiski + IC + Caesar | hodiny (ručně) |
| Vigenère ($\ell$ velké) | $26^\ell$ | obtížnější — vyžaduje delší ciphertext | dny |
| Vernam / OTP | $\geq |M|$ | *neexistuje* | ∞ |

Detaily perfektní bezpečnosti viz [[kerckhoff]] a [[one-time-pad]]; polygramové šifry (Playfair, Hill) jako jiný směr "vylepšení" viz [[polygramove]].

---

*Zdroj: KRY přednášky 2025/26, KRY 1 — Klasická kryptografie. Externí reference: Kasiski, F. W.: *Die Geheimschriften und die Dechiffrir-Kunst*, Berlin 1863; Friedman, W. F.: "The Index of Coincidence and Its Applications in Cryptography", 1922; Stinson, D. R.: *Cryptography: Theory and Practice* (4th ed., CRC Press 2018), §2.2; Singh, S.: *The Code Book* (Anchor Books 1999), kap. 2.*
