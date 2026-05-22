---
title: One-time pad (Vernamova šifra)
---

# One-time pad (Vernamova šifra)

One-time pad (OTP) je *jediná* prakticky dosažitelná šifra, která dosahuje **perfektní bezpečnosti** ve smyslu [[kerckhoff|Shannona]]. Vynalezl ji **Gilbert Vernam** (AT&T 1917) pro šifrování telegrafu, **Joseph Mauborgne** doplnil požadavek na *jednorázové použití* klíče. Frank Miller publikoval podobnou ideu už 1882, ale Vernamova konstrukce s XORem je kanonická.

## Definice

* Plaintext $M \in \{0, 1\}^n$ je bitová sekvence délky $n$.
* Klíč $K \in \{0, 1\}^n$ je **rovnoměrně náhodná** bitová sekvence stejné délky $n$.
* Šifrování: $C = M \oplus K$ (bitový XOR).
* Dešifrování: $M = C \oplus K$ (XOR je svým vlastním inverzem).

Pro abecedu se generalizuje: klíč $K_i$ je nezávislé rovnoměrné celé číslo z $\{0, \dots, |\mathcal{A}| - 1\}$, šifrování je $C_i = (M_i + K_i) \bmod |\mathcal{A}|$.

::: svg "OTP — XOR plaintextu s jednorázovým náhodným klíčem"
<svg viewBox="0 0 540 130" font-family="ui-sans-serif, system-ui" font-size="12">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.2">
    <rect x="20"  y="20" width="500" height="22" rx="4"/>
    <rect x="20"  y="50" width="500" height="22" rx="4"/>
    <rect x="20"  y="90" width="500" height="22" rx="4"/>
  </g>
  <g font-family="var(--font-mono)" font-size="13">
    <text x="32" y="36" fill="var(--text)">M</text>
    <text x="55" y="36" fill="var(--text)">= 1 0 1 1 0 1 1 0 1 0 0 1 1 1 0 0 0 1 1 0 1 1 0 0 1 0 1</text>
    <text x="32" y="66" fill="var(--accent)">K</text>
    <text x="55" y="66" fill="var(--accent)">= 0 1 1 0 1 1 0 1 1 1 0 0 0 1 0 1 1 0 1 1 0 0 1 0 1 1 0</text>
    <text x="32" y="106" fill="var(--text)">C</text>
    <text x="55" y="106" fill="var(--text)">= 1 1 0 1 1 0 1 1 0 1 0 1 1 0 0 1 1 1 0 1 1 1 1 0 0 1 1</text>
  </g>
  <g fill="var(--text-muted)" font-size="10.5">
    <text x="30" y="86">XOR</text>
  </g>
</svg>
:::

## Perfektní bezpečnost — důkaz

Cíl: pro každý $C$ a libovolné dva $M_0, M_1$ platí $\Pr[E_K(M_0) = C] = \Pr[E_K(M_1) = C]$.

Pro daný $C$ a $M_0$ je jediný klíč, který produkuje právě tento $C$, $K = M_0 \oplus C$. Protože $K$ je rovnoměrné v $\{0,1\}^n$, platí $\Pr[K = M_0 \oplus C] = 2^{-n}$. Totéž pro $M_1$: $\Pr[K = M_1 \oplus C] = 2^{-n}$. Pravděpodobnosti jsou stejné, tedy $\Pr[C \mid M_0] = \Pr[C \mid M_1]$.

> Důsledek: znalost $C$ útočníkovi *nesděluje žádnou informaci* o $M$ (entropie $H(M | C) = H(M)$). Jakýkoli plaintext stejné délky je rovnocenně možný.

## Tři podmínky pro perfektní bezpečnost

OTP funguje *pouze* pokud:

1. **Klíč je skutečně náhodný** — generován z fyzické entropie (radioaktivní rozpad, šum diody, kvantové měření). Pseudonáhodný generátor *zbavuje OTP perfekce*. Útočník, který zná jeho vnitřní stav, dešifruje vše.
2. **Klíč je stejně dlouhý jako zpráva** — Shannonova věta vyžaduje $|\mathcal{K}| \geq |\mathcal{M}|$.
3. **Klíč se použije jen jednou** — odtud "one-time".

Porušení libovolné z nich → OTP přestane být perfektně bezpečný.

## Two-time pad — co se stane při opakovaném použití

Předpokládejme, že útočník odposlechne dvě zprávy šifrované stejným klíčem:

::: math
C_1 = M_1 \oplus K, \qquad C_2 = M_2 \oplus K.
:::

Pak

::: math
C_1 \oplus C_2 = (M_1 \oplus K) \oplus (M_2 \oplus K) = M_1 \oplus M_2.
:::

Klíč úplně zmizel. Útočník má *XOR dvou plaintextů* — výrazně sníženou entropii. Pokud zná částečně $M_1$ (např. ví, že je to e-mail s hlavičkou `Date: `), může odhadnout odpovídající úsek $M_2$. Jazyková redundance dělá zbytek — *crib-dragging* posouvá známý fragment přes různé pozice a hledá, kde produkuje smysluplný text.

::: viz otp-crib-drag "Two-time pad útok: dva ciphertexty se stejným klíčem dají C₁ ⊕ C₂ = M₁ ⊕ M₂. Hádejte crib (úsek plaintextu) a posouvejte jeho pozici — při správné hypotéze vyjde z druhé zprávy čitelný text."
:::

> **Reálný incident:** Sovětský VENONA projekt (1942–1945) — KGB znovu použila stránky one-time padů kvůli nedostatku. NSA tyto duplicity detekovala a po desetiletí pomalu dešifrovala — odhalila Rosenbergovy a další.

## Praktické problémy OTP

OTP je *teoreticky neporazitelný*, ale prakticky **prakticky nepoužitelný** pro běžnou komunikaci:

1. **Distribuce klíče.** Pro každý byte zprávy je třeba dopředu sdílet jeden byte klíče. Pro gigabyte e-mailu potřebujeme distribuovat gigabyte klíče *fyzicky bezpečně* (dříve diplomatická kurýrní pošta, dnes neexistuje praktický kanál mimo kvantovou distribuci).
2. **Generování pravé náhody.** Pseudonáhoda nestačí. Hardwarové generátory jsou pomalé (Mb/s) a drahé.
3. **Skladování klíče.** Tisíce stran one-time padu uložené v sejfu jsou cíl útočníka.
4. **Spotřeba klíče.** Po každé zprávě je třeba klíčový materiál odstranit (nikoli jen "neopakovat" — útočník, který získá použitý klíč později a má archivovaný ciphertext, dešifruje vše).
5. **Není autentizace.** OTP zajišťuje *důvěrnost*, nikoli integritu. Útočník může *přepsat* libovolný bit ciphertextu, a po dešifrování bude odpovídající bit plaintextu obrácen. Pro integritu je třeba ještě MAC ([[mac-hmac]]).

## Reálné použití

* **Red Phone / Horká linka** (1963 — Bílý dům ↔ Kreml) — používal OTP s teletypem; klíče distribuovány diplomatickou cestou.
* **KGB / sovětská diplomacie** — OTP do 90. let pro velmi citlivou komunikaci.
* **Britská SOE** ve 2. světové válce — operativci v okupované Evropě dostávali drobné OTP knížky pro radiové hlášení.
* **Vojenské drony, jaderné velení** — komunikace s nukleárními ponorkami (US C-3I) údajně používá OTP-podobné schéma.

## OTP vs. moderní šifry

Vzhledem k limitům OTP používá moderní praxe **výpočetní bezpečnost**: AES-256 generuje *pseudonáhodný* klíčový proud z 256bitového semene. Tento proud *není perfektně náhodný* — ale rozdíl je výpočetně nedostupný útočníkovi s $< 2^{256}$ operacemi.

Z tohoto pohledu je každá moderní symetrická šifra "OTP s vygenerovaným klíčem" (proudové šifry doslova, blokové v CTR režimu efektivně). Bezpečnost stojí na obtížnosti rozlišit pseudonáhodu od pravé náhody — což je tvrzení **pseudonáhodného generátoru / blokové šifry**.

## OTP jako rétorický nástroj

Studenti i developeři občas implementují "OTP" pomocí PRNG seedovaného heslem nebo pomocí Mersenne Twisteru. To **není OTP** a *není to perfektně bezpečné*. Označovat takový systém jako OTP je závažné nepochopení — bezpečnost je v tom případě jen tolika silná, kolik daný PRNG.

> Praktický návod: pokud potřebujete šifrovat, **použijte AEAD šifru** (AES-GCM, ChaCha20-Poly1305) z auditované knihovny ([[padding-aead]]). OTP používejte pouze pokud máte hardwarový generátor pravdivé náhody a fyzický bezpečný kanál pro klíče.

---

*Zdroj: KRY přednášky 2025/26, KRY 1 — Klasická kryptografie. Externí reference: Shannon, C. E.: "Communication Theory of Secrecy Systems", Bell System Technical Journal 28(4), 1949; Vernam, G. S.: U.S. Patent 1,310,719 (1919); Bauer, F. L.: *Decrypted Secrets* (4th ed., Springer 2007), §2.6; NSA: "VENONA Story" (https://www.nsa.gov/Helpful-Links/NSA-FOIA/Declassification-Transparency-Initiatives/Historical-Releases/Venona/).*
