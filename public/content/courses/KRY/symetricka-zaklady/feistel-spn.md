---
title: Feistelova síť a SP síť
---

# Feistelova síť a SP síť

Po zavedení Shannonových principů *konfuze* a *difúze* ([[kerckhoff]]) potřebovaly blokové šifry **konstrukci**, která tyto vlastnosti efektivně realizuje. Dvě dominantní strukturální schémata vznikly v 70. letech: **Feistelova síť** (Horst Feistel, IBM, 1973) a **Substitučně-permutační síť** (SP-síť, Shannon implicitně, formalizováno později). DES a 3DES jsou Feistel, AES je SP-síť.

## Feistelova síť

### Princip

Plaintext blok velikosti $2w$ se rozdělí na **levou a pravou** polovinu, $L_0$ a $R_0$. V každém **kole** $i$ se aplikuje **kolová funkce** $F$ s **kolovým klíčem** $K_i$ na pravou polovinu a výsledek se XOR'uje s levou:

::: math
L_{i+1} = R_i, \qquad R_{i+1} = L_i \oplus F(R_i, K_i).
:::

Po $n$ kolech dostaneme $(L_n, R_n)$. Ciphertext je obvykle $(R_n, L_n)$ (pro symetrii s dešifrováním — *poslední swap se neprovede* v plné variantě DES).

::: svg "Feistelova síť — jedno kolo"
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aFeist" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="100" y="20" width="100" height="30" rx="4"/>
    <rect x="320" y="20" width="100" height="30" rx="4"/>
    <rect x="260" y="90" width="80" height="40" rx="4"/>
    <rect x="100" y="170" width="100" height="30" rx="4"/>
    <rect x="320" y="170" width="100" height="30" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="12.5">
    <text x="150" y="40">L_i</text>
    <text x="370" y="40">R_i</text>
    <text x="300" y="115">F(·, K_i)</text>
    <text x="150" y="190">L_{i+1}</text>
    <text x="370" y="190">R_{i+1}</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aFeist)">
    <!-- R_i větví do vstupu F -->
    <path d="M370,50 L370,70 L255,70 L255,110 L258,110"/>
    <!-- R_i křižuje do levého L_{i+1} -->
    <path d="M370,50 L370,90 L150,150 L150,160"/>
    <!-- L_i klesá do XOR uzlu v pravém sloupci -->
    <path d="M150,50 L150,150 L370,150"/>
    <!-- výstup F jde do XOR, pak dolů do R_{i+1} -->
    <path d="M340,110 L370,110 L370,160"/>
  </g>
  <circle cx="370" cy="70" r="2.5" fill="var(--accent)"/>
  <g fill="var(--text-muted)" font-size="11">
    <text x="382" y="154">⊕</text>
    <text x="440" y="80">K_i</text>
  </g>
  <g stroke="var(--text-muted)" stroke-dasharray="3 3" fill="none" marker-end="url(#aFeist)">
    <path d="M430,100 L345,110"/>
  </g>
</svg>
:::

::: viz feistel "Krok po kroku Feistelovou sítí. Přepněte mezi šifrováním a dešifrováním — vidíte, že struktura je identická, jen klíče v opačném pořadí. Round-trip ověřuje invertibilitu."
:::

### Dešifrování

Klíčová vlastnost Feistela: **dešifrování má strukturu identickou se šifrováním**, jen *obrácené pořadí klíčů*:

::: math
R_i = L_{i+1}, \qquad L_i = R_{i+1} \oplus F(L_{i+1}, K_i).
:::

Stejný hardware/software lze použít pro $E$ i $D$ — jen se mění pořadí subklíčů. Toto je důvod, proč byla Feistelova konstrukce v 70. letech atraktivní (méně tranzistorů, levnější hardware).

### Vlastnosti

* **Žádný požadavek na invertibilitu F.** Funkce $F$ může být libovolná — i nelineární a non-bijektivní. Stačí, aby byla "dostatečně promíchávající".
* **Mírná difúze v 1 kole.** V jednom kole je difúze omezena — změna 1 bitu v $R_i$ ovlivní celé $R_{i+1}$ skrze $F$, ale $L_{i+1}$ je beze změny. Proto Feistel potřebuje *více kol* než SP-síť pro srovnatelnou bezpečnost.
* **Důkazatelná bezpečnost.** *Luby-Rackoff* (1988): 3 kola Feistela s nezávislými pseudonáhodnými funkcemi $F$ jsou *pseudonáhodnou permutací* (PRP); 4 kola jsou *silnou* PRP. Pro reálné šifry to motivuje 12–16 kol s bezpečnostní rezervou.

## Substituční-permutační síť (SP-síť)

### Princip

V každém kole se na *celý* blok aplikují dvě transformace:

1. **Substituční vrstva** (S-vrstva): blok rozdělen na malé skupiny (typicky 4 nebo 8 bitů); každá skupina prochází nelineární tabulkou — **S-box**.
2. **Permutační vrstva** (P-vrstva): bity ze všech S-boxů jsou *promíchány*, takže výstup jednoho S-boxu se rozlije do mnoha S-boxů příští vrstvy.
3. **Klíčové míchání**: XOR kolového klíče.

::: svg "Jedno kolo SP-sítě — S-box + P-permutace"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="40"  y="30" width="60"  height="30" rx="4"/>
    <rect x="120" y="30" width="60"  height="30" rx="4"/>
    <rect x="200" y="30" width="60"  height="30" rx="4"/>
    <rect x="280" y="30" width="60"  height="30" rx="4"/>
    <rect x="40"  y="100" width="300" height="30" rx="4"/>
    <rect x="40"  y="160" width="300" height="20" rx="4"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="11.5">
    <text x="70"  y="50">S_1</text>
    <text x="150" y="50">S_2</text>
    <text x="230" y="50">S_3</text>
    <text x="310" y="50">S_4</text>
    <text x="190" y="120">Permutace (přemíchání bitů)</text>
    <text x="190" y="174">⊕ kolový klíč K_i</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.1" fill="none">
    <path d="M70,60  L150,100"/>
    <path d="M70,60  L230,100"/>
    <path d="M150,60 L70,100"/>
    <path d="M150,60 L310,100"/>
    <path d="M230,60 L150,100"/>
    <path d="M230,60 L310,100"/>
    <path d="M310,60 L70,100"/>
    <path d="M310,60 L230,100"/>
  </g>
  <g fill="var(--text-muted)" font-size="11">
    <text x="400" y="50">S-vrstva (konfuze)</text>
    <text x="400" y="120">P-vrstva (difúze)</text>
    <text x="400" y="174">XOR klíče</text>
  </g>
</svg>
:::

### Vlastnosti

* **Plná difúze.** Změna 1 bitu plaintextu se po několika kolech rozprostře přes celý blok (lavinový efekt). Cíl: každý bit ciphertextu je *neredukovatelně* závislý na každém bitu plaintextu a klíče.
* **Vyžaduje invertibilní operace.** S-box i P-vrstva musí být bijekce, aby šlo dešifrovat. To zvyšuje implementační nároky (potřeba inverzního S-boxu pro $D$).
* **Velmi výkonná v hardwaru.** AES dosahuje vyšších propustností než DES, protože SP-síť pracuje s celým blokem v každém kole.

### AES jako SP-síť

AES-128 má 10 kol. Každé kolo (kromě posledního, kde chybí MixColumns):

1. **SubBytes** — 16 paralelních S-boxů (8 bitů → 8 bitů). S-box je $x \mapsto x^{-1}$ v $\mathrm{GF}(2^8)$ následované afinní transformací.
2. **ShiftRows** — řádky stavu se posunou cyklicky (lineární permutace).
3. **MixColumns** — sloupce stavu prošly maticovým násobením v $\mathrm{GF}(2^8)$.
4. **AddRoundKey** — XOR kolového klíče.

Detaily — viz [[3des-aes]].

## Feistel vs. SP — srovnání

| Vlastnost | Feistel | SP-síť |
| :--- | :--- | :--- |
| F-funkce / S-box | libovolná | musí být bijekce |
| Hardware pro D | stejný jako E | potřeba inverzního S-boxu |
| Difúze za kolo | poloviční | plná |
| Počet kol pro bezpečnost | více (DES: 16) | méně (AES-128: 10) |
| Bezpečnost důkazy | Luby-Rackoff | důkazy ze strukturou S-boxu |
| Příklady | DES, 3DES, Blowfish, Camellia, GOST | AES, SQUARE, Serpent |

## Generalised Feistel

* **Unbalanced Feistel** — L a R nemají stejnou velikost (např. 96 vs. 32 bitů).
* **Type-2 Feistel (CLEFIA, GOST)** — rozdělení bloku na *4* části, F aplikováno na jednu, XOR do několika.
* **Lai-Massey** (IDEA) — varianta, kde se používá $L_i - F(\dots)$ a $R_i + F(\dots)$ místo XOR.

Žádná z těchto variant nepřináší fundamentální zlepšení; jsou to designové volby s drobnými implementačními výhodami.

## Klíčový rozvrh (key schedule)

Z hlavního klíče $K$ se musí odvodit $n$ kolových klíčů $K_1, \dots, K_n$. **Klíčový rozvrh** (key schedule) je algoritmus, který toto provádí. Slabý klíčový rozvrh = related-key útoky:

* **DES key schedule** je *velmi jednoduchý* — permutace + výběr 48 ze 56 bitů. Útoky využívají related keys; v praxi nepřímo zasáhly 3DES.
* **AES key schedule** byl *kritizován* za slabost — Biryukov, Khovratovich (2009) ukázali related-key útok proti AES-256 se $2^{99}$ operacemi. Praxe to neohrožuje (AES-128 zůstává bezpečný), ale akademicky se AES-256 nesplňuje původní specifikaci NIST.
* **ChaCha20** — žádný "key schedule" v klasickém smyslu, klíč se XORuje do stavu přímo.

> **Pravidlo dobrého návrhu:** klíčový rozvrh by měl být *prakticky stejně nelineární* jako šifrovací funkce. AES posuvný registr je *afinní* — historický kompromis pro implementační rychlost.

---

### Videa

::: youtube "https://www.youtube.com/watch?v=FGhj3CGxl8I" "Feistel Cipher - Computerphile" "Computerphile"
:::

*Zdroj: KRY přednášky 2025/26, KRY 3 — Symetrické algoritmy. Externí reference: Feistel, H.: "Cryptography and Computer Privacy", Scientific American 228(5), 1973; Luby, M., Rackoff, C.: "How to Construct Pseudorandom Permutations from Pseudorandom Functions", SIAM J. Comput. 17(2), 1988; Daemen, J., Rijmen, V.: *The Design of Rijndael* (Springer 2002); Biryukov, A., Khovratovich, D.: "Related-Key Cryptanalysis of the Full AES-192 and AES-256", ASIACRYPT 2009.*
