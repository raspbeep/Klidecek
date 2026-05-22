---
title: Výpočetně obtížné problémy
---

# Výpočetně obtížné problémy

Bezpečnost [[principy|asymetrické kryptografie]] stojí na **konkrétních úlohách**, které předpokládáme za výpočetně neřešitelné v polynomiálním čase. Žádná z těchto úloh není dokázaně obtížná — kdyby někdo nalezl polynomiální algoritmus, padne mnoho moderní kryptografie. Jednotlivé asymetrické algoritmy se opírají o různé úlohy:

| Úloha | Algoritmy postavené na ní |
| :--- | :--- |
| Factoring (FP) | RSA, Rabin |
| Discrete Log (DLP) | Diffie-Hellman, ElGamal, DSA |
| Elliptic Curve DLP (ECDLP) | ECDH, ECDSA, EdDSA |
| Learning With Errors (LWE) | Kyber, Dilithium ([[postkvantova|PQC]]) |
| Short Integer Solution (SIS) | mřížkové podpisy |
| Code-based decoding | McEliece, BIKE |

## Factoring (FP) — faktorizace složených čísel

**Úloha:** dáno $n = pq$, kde $p, q$ jsou velká neznámá prvočísla podobné velikosti. Najdi $p$ a $q$.

Pro $n$ s $k$ bity je naivní zkoušení dělitelů $O(2^{k/2})$ — pro 2048-bit $n$ to je $2^{1024}$ operací, *nedostupné*. Lepší algoritmy:

### Pollardův $\rho$-algoritmus

Brent-Pollard 1981. Hledá netriviální dělitele pomocí *náhodné posloupnosti modulo $n$* a *Floydovy detekce cyklů*. Složitost $O(n^{1/4})$. Pro 2048-bit $n$ je to $2^{512}$ — také nedostupné, ale výrazně lepší než zkoušení.

### Pollardův $p-1$ algoritmus

Pokud $p-1$ má pouze malé prvočíselné faktory ("$B$-smooth pro malé $B$"), pak $p$ lze najít. **Obrana RSA**: vybírat *safe primes* $p$ tak, aby $p-1 = 2q$, kde $q$ je velké prvočíslo. Pak Pollardův $p-1$ vyžaduje $O(q) = O(p)$ operací.

### General Number Field Sieve (GNFS)

Nejlepší známý algoritmus pro RSA-styled $n$. Sub-exponenciální složitost:

::: math
L_n[1/3, c] = \exp\big((c + o(1)) (\log n)^{1/3} (\log \log n)^{2/3}\big),
:::

s $c = (64/9)^{1/3} \approx 1{,}923$. Pro 2048-bit $n$ odhadovaná složitost $\approx 2^{112}$ — proto **RSA-2048 = bezpečnostní úroveň 112 bitů**.

### Aktuální stav

* **RSA-768** (232 desítkových míst) prolomena 2009 (Kleinjung et al.) — $\approx 2000$ CPU-let.
* **RSA-829** (250 desítkových míst) prolomena 2020 (Boudot et al.) — $\approx 2700$ CPU-let.
* **RSA-1024** stále neprolomena, ale je *na hraně*. Doporučení NIST: nepoužívat.
* **RSA-2048** — bezpečné do ~2030 podle NIST SP 800-57.
* **RSA-3072** — bezpečné do ~2030+ (bezpečnostní úroveň 128 bitů).

## Discrete Logarithm (DLP) — diskrétní logaritmus

**Úloha:** dáno cyklická grupa $G$ s generátorem $g$ řádu $q$ a prvek $h = g^x \in G$. Najdi $x$.

### V multiplikativní grupě $\mathbb{Z}_p^*$

Pro velké prvočíslo $p$ se hledá $x$ s $g^x \equiv h \pmod p$.

**Algoritmy:**

* **Brute force:** $O(p)$ — nedostupné.
* **Baby-Step Giant-Step (Shanks):** $O(\sqrt{p})$ čas i paměť. Pro 2048-bit $p$: $2^{1024}$.
* **Pollardův $\rho$:** $O(\sqrt{p})$, lineární paměť.
* **Index Calculus:** $L_p[1/3, c]$ s $c = 1{,}923$ — *stejné* jako GNFS pro faktorizaci. **Proto má DH-mod-p a RSA *stejné* doporučené velikosti klíčů**.

### Subgroup attack — Pohlig-Hellman

Pokud $q = |G|$ je *smooth* (skládá se z malých prvočíselných faktorů $q = q_1 q_2 \dots q_k$), pak DLP se redukuje na DLP v každém z menších faktorů. Složitost $O(\sqrt{\max q_i})$.

**Obrana:** pracovat v *podgrupě prvočíselného řádu* $q$. Pro $p = 2q + 1$ ("safe prime") tvoří kvadratické zbytky modulo $p$ podgrupu řádu $q$ — bezpečnou. **Schnorrova grupa** je standardní: $p, q$ velká prvočísla s $q \mid (p-1)$, generátor $g$ má řád $q$.

### Logjam (2015)

Heninger et al. ukázali, že **mnoho serverů sdílí stejnou DH grupu** — totiž 1024-bit prvočíslo zakódované přímo v softwaru. Provedení Index Calculus *předpočítané* pro toto konkrétní $p$ je drahé, ale jednou udělané umožní *online* DH downgrade za pár minut. Pohled NSA: státní úroveň zdrojů (řád milionů dolarů) na *předzpracování* jedné grupy umožní paralelní odposlech mnoha komunikací.

## Elliptic Curve DLP (ECDLP)

**Úloha:** Dáno eliptická křivka $E$ nad konečným tělesem, generátor $G \in E$ řádu $n$ a bod $Q = k G$. Najdi $k$.

### Klíčový rozdíl od DLP-$\mathbb{Z}_p^*$

**Index Calculus nefunguje** pro generické EC. Důvod: neexistuje vhodná "factor base" — body na EC nemají strukturu "malých prvočíselných faktorů". Jen **generické algoritmy** s $O(\sqrt{n})$ složitostí.

**Důsledek:** pro 128-bit bezpečnost potřebujeme $n \approx 2^{256}$, tj. ECC s 256-bit klíčem. Srovnání s RSA: kratší klíče → rychlejší výpočty → ECDSA, X25519, Ed25519 dominují v moderní praxi.

### Standardní křivky

| Křivka | Bezpečnost | Použití |
| :--- | :-: | :--- |
| **P-256 (secp256r1, NIST)** | 128 b | TLS, JWT (ES256) |
| **P-384 (secp384r1)** | 192 b | TLS strict, vládní |
| **P-521 (secp521r1)** | 256 b | top-secret |
| **Curve25519 / X25519** | 128 b | Signal, TLS, SSH, WireGuard |
| **Ed25519** | 128 b | OpenSSH klíče, signatures |
| **secp256k1** | 128 b | Bitcoin, Ethereum |

Curve25519 a Ed25519 (Bernstein 2006) byly navrženy s důrazem na *constant-time* implementaci a *resistance to side channels*; NIST P-křivky jsou starší a méně flexibilní.

### Útoky proti ECDLP

* **Pollardův $\rho$:** $O(\sqrt{n})$.
* **Pohlig-Hellman:** vyžaduje smooth order, opět obrana volbou prvočíselného řádu.
* **MOV / Frey-Rück útok** pro *supersingulární* křivky — redukuje ECDLP na DLP v $\mathbb{F}_{q^k}$ s malým $k$. Standardní křivky (Curve25519, P-256) jsou *ne-supersingulární*.
* **Smart útok** na *anomální* křivky (kde $|E(\mathbb{F}_p)| = p$) — polynomiální. Standardní křivky se vyhýbají.

> Bezpečnost ECC tedy stojí na *generičnosti* — křivka musí splňovat řadu kritérií. NIST P-256 a Curve25519 prošly kontrolou, ale podezření existují (Dual_EC_DRBG ukázal, že NIST/NSA mohou ovlivnit konstanty). Curve25519 byla *zveřejněna* s reproducibilní konstrukcí parametrů — důvěryhodnější.

## Diffie-Hellman problem (DHP) a Decisional DH (DDH)

* **CDH (Computational DH):** Dáno $g^a, g^b$ (v cyklické grupě), spočítej $g^{ab}$. Zjednodušení DLP — pokud umíme řešit DLP, umíme CDH (najdeme $a$ a spočítáme $(g^b)^a$). Opak je *otevřený problém* — věří se, že CDH je *přibližně* stejně obtížné jako DLP.

* **DDH (Decisional DH):** Dáno $(g^a, g^b, c)$, rozhodni, zda $c = g^{ab}$ nebo $c = g^z$ pro náhodné $z$. **Slabší** problém než CDH (umíme-li CDH, řešíme i DDH). Pro grupy s pairings (např. supersingulární EC) je DDH *prolomena*, ale CDH ne.

Mnoho schémat (ElGamal šifrování) se opírá o DDH; jiné (DSA podpis) o CDH/DLP.

## Mřížkové problémy (PQC)

Pro [[postkvantova|post-kvantové algoritmy]]:

* **LWE (Learning with Errors)** — dáno řadu $(\mathbf{a}_i, b_i)$ s $b_i = \mathbf{a}_i \cdot \mathbf{s} + e_i$ (s malou chybou $e_i$), najdi $\mathbf{s}$. Základ Kyber, Dilithium.
* **Ring-LWE, Module-LWE** — varianty s mřížkou v polynomiálním okruhu, efektivnější.
* **SIS (Short Integer Solution)** — najdi krátký vektor $\mathbf{z}$ s $A \mathbf{z} = 0$ modulo $q$.

Mřížkové problémy jsou *předpokládané* za obtížné i pro kvantové počítače. Nejlepší klasické a kvantové algoritmy (BKZ, sieving) mají sub-exponenciální složitost — pro NIST PQC parametry (Kyber-768) $\approx 2^{180}$ klasicky, $\approx 2^{160}$ kvantově.

## Co když je problém prolomen?

Hypotetické scénáře:

* **Faktorizace polynomiální** → RSA pad, X.509 PKI v krizi. Migrace na ECC zachrání jen dočasně (pokud nepadne i ECDLP). Plnohodnotná migrace na PQC.
* **DLP a ECDLP polynomiální** → veškerá současná asymetrika padne. PQC zachrání.
* **Mřížkové problémy polynomiální** → katastrofa pro PQC i pro asymetrickou kryptografii dnes (mřížky se zkoumají *desetiletí*; náhlý průlom je nepravděpodobný, ale ne nemožný).
* **Kolize hashe AES, SHA-3 přes brute force** → symetrika potřebuje 2× delší klíče (Grover), ale strukturálně přežije.

> NIST a NSA proto plánují *crypto agility* — schopnost rychle vyměnit primitivum v existujících systémech. TLS 1.3 částečně podporuje (cipher suites, signatures), ale velká část PKI je *staticky* zafixována na RSA / ECDSA.

---

*Zdroj: KRY přednášky 2025/26, KRY 4 — Asymetrické algoritmy. Externí reference: Boneh, D., Shoup, V.: *A Graduate Course in Applied Cryptography* (v0.6, 2023), kap. 11–13; Lenstra, A. K.: "Integer Factoring", Designs, Codes and Cryptography 19, 2000; Heninger, N. a kol.: "Imperfect Forward Secrecy: How Diffie-Hellman Fails in Practice" (Logjam), CCS 2015; NIST IR 8413: Status Report on the Third Round of the NIST PQC Standardization Process (2022).*
