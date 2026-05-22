---
title: Klasifikace šifer
---

# Klasifikace šifer

Šifry se třídí podle několika *nezávislých* os. Stejná šifra patří současně do několika kategorií — Vigenère je *substituční, polyalfabetická, proudová, symetrická*. Smyslem klasifikace není přihrádkovat, ale orientovat se v útocích, které jsou pro každou kategorii typické.

## Hlavní třídění

::: svg "Klasifikace šifer — čtyři nezávislé osy"
<svg viewBox="0 0 540 240" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="20"  width="120" height="200" rx="8"/>
    <rect x="160" y="20" width="120" height="200" rx="8"/>
    <rect x="300" y="20" width="120" height="200" rx="8"/>
    <rect x="440" y="20" width="80"  height="200" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="12">
    <text x="80"  y="42">Klíč</text>
    <text x="220" y="42">Operace</text>
    <text x="360" y="42">Velikost vstupu</text>
    <text x="480" y="42">Klíčů/zpráva</text>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="11">
    <text x="80"  y="76">symetrická</text>
    <text x="80"  y="96">(secret-key)</text>
    <text x="80"  y="136">asymetrická</text>
    <text x="80"  y="156">(public-key)</text>
    <text x="80"  y="196">bez klíče</text>
    <text x="80"  y="216">(hash)</text>
    <text x="220" y="76">substituční</text>
    <text x="220" y="96">(záměna znaků)</text>
    <text x="220" y="136">transpoziční</text>
    <text x="220" y="156">(přeskupení)</text>
    <text x="220" y="196">kompozitní</text>
    <text x="220" y="216">(produkt)</text>
    <text x="360" y="76">proudová</text>
    <text x="360" y="96">(po bitech)</text>
    <text x="360" y="136">bloková</text>
    <text x="360" y="156">(po blocích)</text>
    <text x="480" y="86">monoalf.</text>
    <text x="480" y="106">(stálá tab.)</text>
    <text x="480" y="146">polyalf.</text>
    <text x="480" y="166">(střídavá)</text>
    <text x="480" y="206">polygramová</text>
  </g>
</svg>
:::

## 1. Symetrická vs. asymetrická vs. bez klíče

Třídění podle *vztahu klíčů*.

* **Symetrické** ([[blok-vs-proud|blok vs. proud]]) — šifrovací a dešifrovací klíč jsou shodné nebo triviálně odvoditelné. Klíč je sdílené tajemství. Příklady: AES, DES, ChaCha20.
* **Asymetrické** ([[principy|principy asymetriky]]) — dvojice $(VK, SK)$. Veřejný klíč $VK$ se zveřejní, soukromý $SK$ zůstává tajný. Příklady: RSA, ECDSA, X25519.
* **Bez klíče (hash)** ([[hash-funkce]]) — jednosměrná funkce $h: \{0,1\}^* \to \{0,1\}^n$. Není to "šifra" ve smyslu reverzibility, ale je to základní kryptografické primitivum. Příklady: SHA-256, SHA-3, BLAKE3.
* **Klíčované hashe / MAC** ([[mac-hmac]]) — kombinace: $\mathrm{MAC}_K(M)$ závisí na klíči, ale je nereverzibilní. HMAC, KMAC, Poly1305.

> "Bez klíče" neznamená "bez bezpečnostního cíle" — kolizní odolnost je definovaná bez klíče a je výpočetně náročná.

## 2. Substituční vs. transpoziční

Třídění podle *operace*.

* **Substituční šifra** — nahrazuje znak (nebo skupinu) jiným znakem ze stejné abecedy. Caesarova, monoalfabetická, Vigenère, Playfair, Hill. Útoky využívají *zachování pozice* a *zkreslení rozdělení znaků*.
* **Transpoziční šifra** — přeskupuje znaky podle nějakého schématu (matice + permutace sloupců, route cipher). Statistika *jednotlivých* znaků se nemění, statistika *digramů* ano. Útok proto pracuje s anagramy a digramovými frekvencemi.
* **Kompozitní (produktová)** — kombinuje substituci a transpozici. Moderní [[feistel-spn|blokové šifry]] (DES, AES) jsou *iterované produktové šifry* — opakují sérii substitučních a permutačních vrstev.

> Šannonova kritéria *konfuze* (substituce — skrýt vztah klíč↔ciphertext) a *difúze* (transpozice — rozprostřít vliv jednoho bitu plaintextu na mnoho bitů ciphertextu) jsou principiální motivace produktových šifer.

## 3. Bloková vs. proudová

Třídění podle *velikosti vstupu*.

* **Proudová šifra** (stream cipher) — šifruje znak po znaku (často bit po bitu), obvykle XORem s pseudonáhodným klíčovým proudem. Není třeba čekat na blok. Příklady: RC4, ChaCha20, Salsa20, A5/1 (GSM).
* **Bloková šifra** (block cipher) — přijímá blok pevné velikosti (64, 128, 256 b) a klíč, vyprodukuje stejně velký blok ciphertextu. Pro delší zprávy potřebuje [[rezimy|režim činnosti]] (ECB, CBC, CTR, GCM). Příklady: DES (64 b), AES (128 b).

> CTR režim ([[rezimy]]) "udělá z blokové šifry proudovou": vygeneruje proud bloků $E_K(\text{nonce}\|i)$, který se XORne s plaintextem.

## 4. Mono- vs. poly-alfabetická, polygramová

Třídění uvnitř substitučních šifer podle *velikosti tabulky a její proměnnosti*.

* **Monoalfabetická** — jedna *stálá* substituční tabulka pro celou zprávu. Caesar, monoalfabetická substituce s permutovaným klíčem. Triviálně útočitelná frekvenční analýzou — viz [[mono-substituce]].
* **Polyalfabetická** — *více* tabulek, mezi kterými se cyklí podle pozice nebo klíče. Vigenère, Beaufort, autoklíč, rotorové stroje ([[rotor-princip]]). Útok přes Kasiského test a index koincidence.
* **Polygramová** — substituuje *skupinu* znaků najednou (digram, trigram, …). Playfair (digramy), Hill (n-gramy přes matici). Skrývá frekvence jednotlivých znaků, ale digramová frekvence je stále útočitelná.

::: svg "Substituční šifry — od mono přes poly k polygramové"
<svg viewBox="0 0 540 180" font-family="ui-sans-serif, system-ui" font-size="11">
  <defs>
    <marker id="aKRY3" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20"  y="40" width="140" height="100" rx="8"/>
    <rect x="200" y="40" width="140" height="100" rx="8"/>
    <rect x="380" y="40" width="140" height="100" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="90"  y="62" font-size="12">Monoalfabetická</text>
    <text x="270" y="62" font-size="12">Polyalfabetická</text>
    <text x="450" y="62" font-size="12">Polygramová</text>
    <text x="90"  y="86"  font-size="11" fill="var(--text-muted)">1 tabulka</text>
    <text x="90"  y="104" font-size="11" fill="var(--text-muted)">A→X, B→Y, …</text>
    <text x="90"  y="124" font-size="10.5" fill="var(--text-muted)">útok: frekvence</text>
    <text x="270" y="86"  font-size="11" fill="var(--text-muted)">k tabulek, cyklus</text>
    <text x="270" y="104" font-size="11" fill="var(--text-muted)">A_1→X, A_2→W, …</text>
    <text x="270" y="124" font-size="10.5" fill="var(--text-muted)">útok: Kasiski, IC</text>
    <text x="450" y="86"  font-size="11" fill="var(--text-muted)">tab. dvojic/trojic</text>
    <text x="450" y="104" font-size="11" fill="var(--text-muted)">AB→XY, AC→PQ</text>
    <text x="450" y="124" font-size="10.5" fill="var(--text-muted)">útok: digramy</text>
  </g>
  <g stroke="var(--text-muted)" stroke-width="1.1" fill="none" marker-end="url(#aKRY3)">
    <path d="M162,90 L198,90"/>
    <path d="M342,90 L378,90"/>
  </g>
  <g fill="var(--text-muted)" font-size="10" text-anchor="middle">
    <text x="180" y="84">+klíč</text>
    <text x="360" y="84">+skupina</text>
  </g>
</svg>
:::

## 5. Klasická vs. moderní

Méně formální, ale užitečné rozlišení:

* **Klasická kryptografie** (do ~1949) — algoritmus často tajný, klíče malé (řád bajtů), bezpečnost intuitivní. Caesar, Vigenère, Playfair, Hillova, Enigma.
* **Moderní kryptografie** (od Shannona 1949 a IBM 1970s) — algoritmus veřejný ([[kerckhoff|Kerckhoff]]), klíče řád stovek bitů, bezpečnost *matematicky podložená* — důkazy redukcí na obtížné problémy (faktorizace, DLP, kolize hashe).

Hranice je v práci Shannona *Communication theory of secrecy systems* (1949), která zavedla **informačně-teoretickou bezpečnost** — pojem *perfektní bezpečnost* a důkaz, že *one-time pad* je perfektně bezpečný ([[one-time-pad]]).

## Mapování na další kapitoly

| Kategorie | Typičtí zástupci | Kde studovat |
| :--- | :--- | :--- |
| Klasická substituční mono | Caesar, monoalf. permutace | [[mono-substituce]] |
| Klasická substituční poly | Vigenère, autoklíč | [[poly-substituce]] |
| Klasická polygramová | Playfair, Hill | [[polygramove]] |
| Klasická transpoziční | Skytale, sloupcová | [[transpozice]] |
| Klasická perfektní | Vernamova / OTP | [[one-time-pad]] |
| Moderní symetrická bloková | DES, AES | [[des]], [[3des-aes]] |
| Moderní symetrická proudová | RC4, ChaCha20 | [[proudove-sifry]] |
| Moderní asymetrická | RSA, DH, ECC | [[rsa]], [[dh-elgamal]], [[elipticke]] |
| Hashovací funkce | SHA-2, SHA-3 | [[hash-funkce]] |

---

*Zdroj: KRY přednášky 2025/26, KRY 1 — Klasická kryptografie. Externí reference: Stallings, W.: *Cryptography and Network Security* (8th ed., Pearson 2022), kap. 2; Shannon, C. E.: "Communication Theory of Secrecy Systems", Bell System Technical Journal 28(4), 1949; Singh, S.: *The Code Book* (Anchor Books 1999).*
