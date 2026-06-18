---
title: Model HMM
---

# Model HMM

Představ si, že chceš popsat počasí, ale nemůžeš se dívat z okna — vidíš jen, co kamarád každý den dělá (procházka, úklid, nákup). Z jeho aktivit chceš **uhodnout skrytou posloupnost počasí**. Přesně tohle dělá **skrytý Markovův model** (Hidden Markov Model, HMM): máme **skrytou** posloupnost stavů, kterou nevidíme, a **pozorovanou** posloupnost symbolů, kterou ano. Každý skrytý stav „vyzařuje" (emituje) pozorování.

V rozpoznávání řeči je to úplně stejné: skryté stavy odpovídají **fonémům** (částem hlásek), které nevidíme přímo, a pozorování jsou **akustické příznaky** vytažené z nahrávky (zvuk umíme změřit, ale který foném ho vyslovil, musíme dopočítat).

## Dva propletené procesy

HMM se skládá ze dvou náhodných procesů, které běží společně:

1. **Skrytý Markovův řetězec** — posloupnost stavů $s_1, s_2, \dots, s_T$. V každém čase model „skočí" do nějakého stavu. Tuhle posloupnost nevidíme.
2. **Emise pozorování** — v každém stavu model vygeneruje jeden pozorovatelný symbol (nebo příznakový vektor). Posloupnost pozorování $x_1, x_2, \dots, x_T$ vidíme.

Slovo **„skrytý"** v názvu znamená právě to, že stavovou cestu $S = s_1,\dots,s_T$ nepozorujeme — vidíme jen důsledky (emise $X = x_1,\dots,x_T$). Náš úkol bude tu skrytou cestu **odvodit**, nebo spočítat, jak pravděpodobně mohl model dané pozorování vyprodukovat.

::: viz hmm-generate "Stiskni „krok" → model udělá náhodnou chůzi: vybere další skrytý stav (počasí) podle matice přechodů a pak z něj vyemituje aktivitu. Horní řada = skrytá cesta, dolní = co reálně pozoruješ."
:::

## Markovský předpoklad

Proč „Markovův"? Protože model splňuje **Markovský předpoklad (1. řádu)**: kam skočíme v příštím kroku, závisí **jen na aktuálním stavu**, ne na celé historii.

::: math
P(s_{t+1} \mid s_1, s_2, \dots, s_t) = P(s_{t+1} \mid s_t)
:::

To je obrovské zjednodušení — „budoucnost je nezávislá na minulosti, když znám přítomnost". Druhý předpoklad říká, že **emise závisí jen na aktuálním stavu**: $P(x_t \mid s_1,\dots,s_t, \text{ostatní emise}) = P(x_t \mid s_t)$. Díky těmto dvěma předpokladům se pravděpodobnost celé sekvence rozpadne na součin malých, lokálních členů — a to je přesně to, co později umožní rychlé algoritmy.

## Tři parametry: A, B, π

HMM je plně určen trojicí $\lambda = (A, B, \pi)$. Mějme $N$ skrytých stavů.

- **Matice přechodů $A$** — prvek $a_{ij} = P(s_{t+1}=j \mid s_t=i)$ je pravděpodobnost přechodu ze stavu $i$ do $j$. Je to čtvercová matice $N\times N$ a **každý řádek se sčítá do 1** (z každého stavu se někam musí jít).
- **Emisní pravděpodobnosti $B$** — $b_j(x) = P(x \mid s_t = j)$ říká, jak pravděpodobné je pozorování $x$ ve stavu $j$. Pro **diskrétní** symboly je to matice (každý sloupec = jeden symbol) a hodnoty jsou pravděpodobnosti $\in [0,1]$. Pro **spojité** příznaky (řeč) je to **hustota** pravděpodobnosti, typicky **směs Gaussovek (GMM)** — a u hustoty může být hodnota $b_j(x)$ klidně **větší než 1** (na 1 se integruje, ne sčítá).
- **Počáteční rozdělení $\pi$** — $\pi_i = P(s_1 = i)$, pravděpodobnost, že sekvence začne ve stavu $i$. Vektor délky $N$, sčítá se do 1.

::: math
\sum_{j=1}^{N} a_{ij} = 1 \quad\forall i, \qquad \sum_{i=1}^{N} \pi_i = 1
:::

Normalizace emisí závisí na typu pozorování. U **diskrétních** symbolů se pravděpodobnosti přes všechny možné symboly sčítají do 1; u **spojitých** příznaků (řeč/GMM) je $b_j$ hustota a místo sumy nastupuje integrál:

::: math
\underbrace{\sum_{x} b_j(x) = 1}_{\text{diskrétní symboly}} \qquad\text{vs.}\qquad \underbrace{\int b_j(x)\,dx = 1}_{\text{spojitá hustota (řeč/GMM)}} \qquad\forall j
:::

U GMM se do 1 sčítají **mixovací váhy** $c_k$ jednotlivých Gaussovek, kdežto celá hustota $b_j(x)=\sum_k c_k\,\mathcal{N}(x;\mu_k,\Sigma_k)$ se k 1 **integruje**, ne sčítá — a její hodnota v konkrétním bodě $x$ může být i větší než 1.

Malý příklad (z viz výše): stavy `{slunce, déšť}`, $\pi = (0.6,\ 0.4)$. Přechody $a_{\text{slunce}\to\text{slunce}} = 0.7$ (po slunci spíš zase slunce), $a_{\text{déšť}\to\text{déšť}} = 0.6$. Emise: ve `slunce` je $b(\text{procházka}) = 0.6$, kdežto v `déšť` je $b(\text{úklid}) = 0.6$. Takže když kamarád uklízí, je to slabý signál, že prší.

::: svg
<svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg" font-family="var(--font-mono)">
  <rect width="300" height="150" fill="var(--bg-inset)"/>
  <circle cx="80" cy="50" r="26" fill="color-mix(in oklch, var(--accent) 30%, var(--bg-card))" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="80" y="54" text-anchor="middle" font-size="11" fill="var(--text)">slunce</text>
  <circle cx="220" cy="50" r="26" fill="color-mix(in oklch, var(--accent-line) 30%, var(--bg-card))" stroke="var(--accent-line)" stroke-width="1.5"/>
  <text x="220" y="54" text-anchor="middle" font-size="11" fill="var(--text)">déšť</text>
  <path d="M106 44 Q150 26 194 44" fill="none" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#a1)"/>
  <text x="150" y="24" text-anchor="middle" font-size="9" fill="var(--text-muted)">0.3</text>
  <path d="M194 58 Q150 78 106 58" fill="none" stroke="var(--text-muted)" stroke-width="1" marker-end="url(#a1)"/>
  <text x="150" y="84" text-anchor="middle" font-size="9" fill="var(--text-muted)">0.4</text>
  <path d="M64 30 Q44 8 76 26" fill="none" stroke="var(--text-faint)" stroke-width="1" marker-end="url(#a1)"/>
  <text x="44" y="18" text-anchor="middle" font-size="9" fill="var(--text-faint)">0.7</text>
  <path d="M236 30 Q256 8 224 26" fill="none" stroke="var(--text-faint)" stroke-width="1" marker-end="url(#a1)"/>
  <text x="256" y="18" text-anchor="middle" font-size="9" fill="var(--text-faint)">0.6</text>
  <text x="80" y="100" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">b: procházka 0.6 / úklid 0.1 / nákup 0.3</text>
  <text x="220" y="118" text-anchor="middle" font-size="8.5" fill="var(--text-faint)">b: procházka 0.1 / úklid 0.6 / nákup 0.3</text>
  <defs><marker id="a1" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="var(--text-muted)"/></marker></defs>
</svg>
:::

## Tři základní úlohy

Celá teorie HMM se točí kolem tří otázek (Rabinerova klasická trojice):

1. **Vyhodnocení (evaluation):** „Jak pravděpodobné je, že tenhle model vygeneroval tohle pozorování?" Tedy spočítat $P(X \mid \lambda)$. Řeší **forward algoritmus**. Používá se k porovnání více modelů (které slovo to bylo).
2. **Dekódování (decoding):** „Jaká skrytá cesta nejspíš stojí za tímhle pozorováním?" Tedy najít $\hat S = \arg\max_S P(S \mid X)$. Řeší **Viterbiho algoritmus**.
3. **Učení (learning):** „Jak z dat odhadnout parametry $A, B, \pi$?" Řeší **Baum–Welch** (EM pro HMM).

První dvě úlohy probereme v podtématu o forwardu a Viterbim, třetí v podtématu o trénování.

::: quiz "Co přesně je v HMM „skryté"?"
- [ ] Matice přechodů A
- [x] Posloupnost stavů — vidíme jen emitovaná pozorování, stavovou cestu musíme dopočítat
  > Parametry $A, B, \pi$ buď známe, nebo je odhadujeme z dat. „Skrytá" je posloupnost stavů $s_1,\dots,s_T$: pozorujeme jen emise $x_1,\dots,x_T$, a kterým stavem byly vygenerovány, není přímo vidět.
- [ ] Pozorování x_t
- [ ] Počet stavů N
:::

::: link "Rabiner — A Tutorial on Hidden Markov Models (1989)" "https://doi.org/10.1109/5.18626"
:::

---

*Zdroj: SUR státnicové okruhy NMAL, VUT FIT. Externí reference: Rabiner, L.R.: „A Tutorial on Hidden Markov Models and Selected Applications in Speech Recognition" (Proc. IEEE 1989, [doi:10.1109/5.18626](https://doi.org/10.1109/5.18626)); Jurafsky, D., Martin, J.H.: „Speech and Language Processing", kap. Hidden Markov Models ([online návrh](https://web.stanford.edu/~jurafsky/slp3/)).*
