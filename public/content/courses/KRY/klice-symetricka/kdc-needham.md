---
title: KDC a Needham-Schroeder protokol
---

# KDC a Needham-Schroeder protokol

**Key Distribution Center (KDC)** je důvěryhodná třetí strana, která sdílí dlouhodobé symetrické klíče s každým uživatelem v systému. Když dva uživatelé chtějí komunikovat, KDC jim distribuuje *čerstvý klíč relace*. Tato architektura *redukuje* $O(n^2)$ párových klíčů na $O(n)$ klíčů ke KDC.

Klasický protokol **Needham-Schroeder** (Roger Needham, Michael Schroeder, MIT 1978) je *historicky první* formálně analyzovaný klíčový protokol. Jeho slabiny (Denning, Sacco 1981; Lowe 1996) demonstrují, *proč* je formální analýza protokolů zásadní.

## Architektura KDC

::: svg "KDC — centrální distribuce klíčů"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aKDC" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <circle cx="270" cy="60" r="40"/>
    <rect x="20"  y="140" width="120" height="40" rx="8"/>
    <rect x="170" y="140" width="120" height="40" rx="8"/>
    <rect x="320" y="140" width="120" height="40" rx="8"/>
    <rect x="470" y="140" width="50"  height="40" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="65">KDC</text>
    <text x="80"  y="165">Alice</text>
    <text x="230" y="165">Bob</text>
    <text x="380" y="165">Carol</text>
    <text x="495" y="165">...</text>
  </g>
  <g stroke="var(--text-muted)" stroke-width="1" fill="none" marker-end="url(#aKDC)">
    <path d="M250,95 L100,140"/>
    <path d="M260,95 L230,140"/>
    <path d="M285,95 L370,140"/>
    <path d="M300,95 L490,140"/>
  </g>
  <g fill="var(--text-muted)" font-size="10" text-anchor="middle">
    <text x="160" y="120">K_A</text>
    <text x="245" y="125">K_B</text>
    <text x="345" y="118">K_C</text>
  </g>
</svg>
:::

* Každý uživatel $U$ sdílí dlouhodobý klíč $K_U$ s KDC.
* KDC drží databázi $(U, K_U)$ pro všechny uživatele.
* Když Alice chce komunikovat s Bobem, KDC vygeneruje $K_{AB}$ a oběma ho doručí.

### Co KDC musí splnit

1. **Důvěryhodnost** — KDC zná všechny klíče. Pokud je kompromitované, je kompromitovaná celá infrastruktura.
2. **Dostupnost** — Když KDC nefunguje, žádné nové sessions nemohou vzniknout.
3. **Autentizace** — KDC musí ověřit identitu žadatele *před* vydáním klíče.
4. **Replay rezistence** — útočník nesmí přehrát staré zprávy z KDC.

## Needham-Schroeder Symmetric Key Protocol (1978)

Klasický 5-zprávový protokol:

::: math
\begin{array}{rl}
1) \quad A \to S: & A, B, N_A \\
2) \quad S \to A: & E_{K_A}(N_A, B, K_{AB}, E_{K_B}(K_{AB}, A)) \\
3) \quad A \to B: & E_{K_B}(K_{AB}, A) \\
4) \quad B \to A: & E_{K_{AB}}(N_B) \\
5) \quad A \to B: & E_{K_{AB}}(N_B - 1)
\end{array}
:::

kde:

* $A, B$ — identity Alice a Bob.
* $S$ — server (KDC).
* $K_A, K_B$ — sdílené klíče $A$-KDC, $B$-KDC.
* $K_{AB}$ — nově vygenerovaný session key.
* $N_A, N_B$ — nonce (random challenge values).

### Krok za krokem

1. **A → S:** Alice řekne KDC: "Chci komunikovat s Bobem, můj nonce je $N_A$".
2. **S → A:** KDC zašifruje pomocí $K_A$ čtyři položky:
   * $N_A$ — Alice ověří, že odpověď patří k její žádosti.
   * $B$ — KDC potvrzuje, koho Alice chtěla.
   * $K_{AB}$ — nový session key.
   * **Ticket** $E_{K_B}(K_{AB}, A)$ — pro Boba, zašifrovaný *jeho* klíčem.
3. **A → B:** Alice předá Bobovi ticket. Bob ho rozšifruje a získá $K_{AB}$ a identitu Alice.
4. **B → A:** Bob vyzve Alici: "$N_B$ + 1 pls?". Tím ověří, že Alice opravdu zná $K_{AB}$.
5. **A → B:** Alice odpoví $N_B - 1$ šifrováno $K_{AB}$. Bob vidí, že Alice klíč zná.

### Cíle protokolu (původně)

* **Mutual authentication** — Alice si je jistá, že komunikuje s Bobem; Bob si je jistý, že komunikuje s Alicí.
* **Key freshness** — $K_{AB}$ je nově vygenerovaný KDC.
* **Replay resistance** — nonce $N_A, N_B$ chrání proti přehrávání.

::: viz needham-schroeder "Stepper pro Needham-Schroeder (symetrický 1978, asymetrický 1978 + Lowe 1996 oprava). Tlačítka přepínají normální průběh, Denning-Sacco replay, a Lowe MITM."
:::

## Denning-Sacco útok (1981)

Slabost: **třetí zpráva nemá časové razítko**. Pokud útočník Mallory zachytí $E_{K_B}(K_{AB}, A)$ z minulé session a *později* získá $K_{AB}$ (např. brute force po čase), může zprávu *přehrát* Bobovi → Bob věří, že Alice začíná novou session se starým $K_{AB}$ → Mallory se vydává za Alici.

### Náklady útoku

* Kompromitace jednoho session key (např. 56-bit DES v 1981) → trvalá schopnost vydávat se za Alici vůči Bobovi.

### Oprava — Denning-Sacco varianta

Přidat časové razítko $T$ do zprávy 2:

::: math
S \to A: E_{K_A}(N_A, B, K_{AB}, T, E_{K_B}(K_{AB}, A, T)).
:::

Bob ověří, že $T$ je *čerstvé* (mladší než tolerance, např. 5 minut). Staré tickety odmítne. Tento přístup vede ke **Kerberosu** ([[kerberos]]).

## Lowe útok (1996) — Public Key variant

Needham-Schroeder publikoval *i* asymetrickou variantu (1978). Gavin Lowe (Oxford 1996) ji zanalyzoval *formálně* a objevil dříve neznámou slabinu.

### Public-key protokol (zjednodušeně)

::: math
\begin{array}{rl}
1) \quad A \to B: & E_{VK_B}(N_A, A) \\
2) \quad B \to A: & E_{VK_A}(N_A, N_B) \\
3) \quad A \to B: & E_{VK_B}(N_B)
\end{array}
:::

Po protokolu Alice a Bob mají vzájemnou autentizaci přes znalost nonce.

### Lowe útok

Mallory aktivně útočí. Alice začíná komunikaci s Mallorym (kterého nepovažuje za útočníka):

::: math
\begin{array}{rl}
1) \quad A \to M: & E_{VK_M}(N_A, A) \\
1') \quad M(A) \to B: & E_{VK_B}(N_A, A) \\
2') \quad B \to M(A): & E_{VK_A}(N_A, N_B) \\
2) \quad M \to A: & E_{VK_A}(N_A, N_B) \\
3) \quad A \to M: & E_{VK_M}(N_B) \\
3') \quad M(A) \to B: & E_{VK_B}(N_B)
\end{array}
:::

* Alice mluví s Malorym. Mallory paralelně zprostředkovává s Bobem (vystupuje jako Alice).
* Alice si myslí, že komunikuje s Malorym. Bob si myslí, že komunikuje s Alicí.
* Mallory ví všechna $N_A, N_B$ a může se vydávat za Alici vůči Bobovi.

### Oprava — Lowe varianta

V druhé zprávě explicitně zahrnout identitu Boba:

::: math
B \to A: E_{VK_A}(N_A, N_B, B).
:::

Alice nyní ověří, že druhá strana je Bob. Mallory by musel mít $VK_A$ pro vytvoření falešné zprávy s identitou Mallory, ale to *neodpovídá* Alicině očekávání.

> **Lekce z Lowe útoku:** Protokoly musí být analyzovány *formálně*. Dnes existují nástroje (ProVerif, Tamarin) pro automatickou analýzu kryptografických protokolů. Needham-Schroeder PK je *standardní* příklad v každé kryptografické výuce.

## Klíčové zásady "key freshness"

Z analýzy Needham-Schroeder a jeho variant:

1. **Časová razítka nebo nonce** v každé zprávě, která má identifikovat aktuální session.
2. **Identity** všech komunikujících stran zahrnut do *podepsaných* nebo *šifrovaných* zpráv.
3. **Žádný recovery z kompromitovaného session key** — staré tickety musí být odmítány.
4. **Replay protection** — nonce nesmí být znovu použit.
5. **Mutual freshness** — obě strany musí ověřit aktuálnost druhé.

## Otway-Rees protokol (1987)

Otway, Rees navrhli vylepšení Needham-Schroeder *bez* časových razítek (pro distribuované systémy bez synchronizovaných hodin). Klíčová myšlenka: *Bob* iniciuje žádost KDC, ne Alice.

::: math
\begin{array}{rl}
1) \quad A \to B: & M, A, B, E_{K_A}(N_A, M, A, B) \\
2) \quad B \to S: & M, A, B, E_{K_A}(N_A, M, A, B), E_{K_B}(N_B, M, A, B) \\
3) \quad S \to B: & M, E_{K_A}(N_A, K_{AB}), E_{K_B}(N_B, K_{AB}) \\
4) \quad B \to A: & M, E_{K_A}(N_A, K_{AB})
\end{array}
:::

$M$ je *session identifier*. Komplikovanější, ale formálně bezpečnější. V praxi vytlačený Kerberosem.

## Současný stav KDC

* **Kerberos** ([[kerberos]]) — *de facto* standard KDC, používaný v Active Directory, MIT Kerberos.
* **TLS 1.3** — KDC-free; používá [[principy|asymetrickou]] DH.
* **Web** — *žádné* KDC, místo toho PKI s X.509 ([[pki-uvod]]).

KDC architektura zůstává *aktuální* v podnikových intranetech (Active Directory), univerzitních systémech, a embedded systémech, kde nelze nasadit asymetrickou kryptografii.

## Útok: Otway útok

I vylepšené protokoly mají slabiny. Pro praxi:

* **Použijte hotový protokol** (Kerberos, TLS) místo vlastního Needham-Schroeder.
* **Spoléhejte na formální analýzu** (ProVerif, Tamarin), pokud navrhujete vlastní protokol.
* **Auditujte** každý kryptografický protokol *externí stranou*.

---

*Zdroj: KRY přednášky 2025/26, KRY 6 — Symetrická správa klíčů. Externí reference: Needham, R., Schroeder, M.: "Using encryption for authentication in large networks of computers", CACM 21(12), 1978; Denning, D., Sacco, G.: "Timestamps in Key Distribution Protocols", CACM 24(8), 1981; Lowe, G.: "Breaking and Fixing the Needham-Schroeder Public-Key Protocol using FDR", Software Concepts and Tools 17(3), 1996; Otway, D., Rees, O.: "Efficient and timely mutual authentication", ACM Op. Sys. Review 21(1), 1987.*
