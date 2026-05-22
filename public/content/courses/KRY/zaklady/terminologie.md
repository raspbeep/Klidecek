---
title: Terminologie a cíle kryptografie
---

# Terminologie a cíle kryptografie

Kryptografie není věda o "tajném psaní" v populárním smyslu — je to **inženýrská disciplína** pro zajištění čtyř konkrétních bezpečnostních vlastností nad komunikačním kanálem nebo úložištěm: *důvěrnosti, integrity, autenticity* a *nepopiratelnosti*. Klíčový vstup je matematicky obtížný problém (faktorizace, diskrétní logaritmus, dobré chování blokové šifry); klíčový výstup je odolnost vůči definovaným útokům, nikoli mystická "nečitelnost".

## Pojmy

* **Kryptografie** (cryptography) — návrh transformací, které otevřený text převedou na šifrovaný a obvykle naopak.
* **Kryptoanalýza** (cryptanalysis, *codebreaking*) — analýza šifry bez znalosti klíče s cílem získat klíč nebo otevřený text.
* **Kryptologie** (cryptology) — zastřešující obor, který obsahuje kryptografii i kryptoanalýzu.
* **Šifra / šifrovací algoritmus** (cipher) — vlastní algoritmus transformace; je veřejně známá funkce, jejíž parametrizace klíčem mění výsledek.
* **Otevřený text** (plaintext, message) — vstup šifry. Bývá označen $M$.
* **Šifrovaný text** (ciphertext, kryptogram) — výstup šifry; označen $C$.
* **Šifrování** $E$ (encryption) a **dešifrování** $D$ (decryption) — dvě stranové transformace.
* **Klíč** $K$ (key) — utajená informace, která určuje konkrétní instanci transformace. Prostor klíčů $\mathcal{K}$ je množina všech přípustných hodnot.

::: math
C = E_K(M), \qquad M = D_K(C), \qquad D_K(E_K(M)) = M \text{ pro všechna } M.
:::

::: svg "Komunikační model: šifrování přes nezabezpečený kanál, na němž je odposlech (Eve) a aktivní útočník (Mallory)"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aKRY1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20"  y="60" width="100" height="60" rx="8"/>
    <rect x="420" y="60" width="100" height="60" rx="8"/>
    <rect x="200" y="40" width="140" height="40" rx="8"/>
    <rect x="200" y="120" width="140" height="44" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="70"  y="86"  font-size="12.5">Odesílatel</text>
    <text x="70"  y="102" font-size="11" fill="var(--text-muted)">Alice</text>
    <text x="470" y="86"  font-size="12.5">Příjemce</text>
    <text x="470" y="102" font-size="11" fill="var(--text-muted)">Bob</text>
    <text x="270" y="56" font-size="11">C = E_K(M)</text>
    <text x="270" y="72" font-size="10.5" fill="var(--text-muted)">nezabezpečený kanál</text>
    <text x="270" y="140" font-size="11" fill="var(--danger, #d33)">Eve (pasivní odposlech)</text>
    <text x="270" y="156" font-size="11" fill="var(--danger, #d33)">Mallory (aktivní změna)</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.2" fill="none" marker-end="url(#aKRY1)">
    <path d="M122,90 L196,60"/>
    <path d="M344,60 L416,90"/>
  </g>
  <g stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="3 3" fill="none">
    <path d="M270,82 L270,118"/>
  </g>
</svg>
:::

## Cíle kryptografie — co se kryptografií *opravdu* zajišťuje

Moderní kryptografie cílí na čtyři vlastnosti, které jsou navzájem *nezávislé*. Algoritmus, který zajišťuje jednu, automaticky nezajišťuje ostatní.

1. **Důvěrnost** (confidentiality) — útočník bez klíče nezíská informaci o $M$ ze samotného $C$. Klasický cíl šifrování.
2. **Integrita** (integrity) — příjemce dokáže detekovat, že $C$ nebyl při přenosu pozměněn. Toto neřeší šifrování samo o sobě (CBC-padded šifrovaná zpráva *lze* změnit a způsobit jiný plaintext); je třeba [[mac-hmac|MAC]] nebo [[padding-aead|AEAD režim]].
3. **Autenticita** (authenticity) — příjemce má jistotu o identitě odesílatele. Symetricky se řeší sdíleným klíčem, asymetricky [[el-podpis|elektronickým podpisem]].
4. **Nepopiratelnost** (non-repudiation) — odesílatel nemůže později popřít, že zprávu poslal. Vyžaduje *asymetrickou* kryptografii — důkaz musí být ověřitelný stranou, která nezná soukromý klíč odesílatele.

> Symetrická kryptografie zajišťuje 1–3 mezi dvojicí sdílejících klíč. *Nepopiratelnost* nelze symetricky zajistit — obě strany znají stejný klíč a každá z nich mohla zprávu autentizovat.

## Klíč, prostor klíčů, bezpečnost

**Bezpečnost** šifry se nehodnotí podle toho, jak je "zamotaná", ale podle:

* **Velikosti prostoru klíčů** $|\mathcal{K}|$. Pro útok hrubou silou je třeba projít v průměru $|\mathcal{K}|/2$ klíčů.
* **Existence efektivnějšího útoku** než hrubá síla. Šifra se nazývá *prolomená*, pokud existuje útok se složitostí asymptoticky nižší než hrubá síla.

Pro 128bitový klíč máme $|\mathcal{K}| = 2^{128} \approx 3{,}4 \cdot 10^{38}$. I při $10^{12}$ pokusech za sekundu by hrubá síla v průměru trvala přes $10^{18}$ let — řádově věk vesmíru, tedy *nepraktický* útok. Naopak 56bitový klíč DESu se v r. 1998 prolomil za 56 hodin specializovaným hardwarem (EFF DES Cracker, ~90 mld. klíčů/s).

## Tři vrstvy abstrakce

Při studiu konkrétního systému je užitečné rozlišovat:

| Vrstva | Příklady | Kým se navrhuje |
| :--- | :--- | :--- |
| **Primitivum** (primitive) | AES, SHA-256, modulární umocnění | kryptografové |
| **Schéma** (scheme) | AES-GCM, RSA-OAEP, HMAC-SHA-256 | kryptografové + standardisté |
| **Protokol** (protocol) | TLS, Signal, IPsec, Kerberos | systémoví architekti |

Většina chyb v praxi *není* slabost primitiva (AES dosud nikdo neprolomil), ale chyba ve schématu (špatná délka IV, nesprávný padding) nebo v protokolu (vynechaná autentizace certifikátu, downgrade na slabší šifru). Pro detaily viz [[principy|principy asymetrické kryptografie]] a [[tls-aplikace|TLS]].

## Symetrická vs. asymetrická

V této taxonomii se rozlišuje podle toho, *jaký vztah* mají šifrovací a dešifrovací klíč:

* **Symetrická** — oba klíče jsou stejné (nebo vzájemně triviálně odvoditelné). Sdílené tajemství. Rychlá (Mb/s až Gb/s na CPU). Trpí *distribučním problémem*: každá dvojice $n$ uživatelů potřebuje vlastní klíč, dohromady $\binom{n}{2} = O(n^2)$ klíčů.
* **Asymetrická** — dvojice klíčů $(VK, SK)$, kde $VK$ (veřejný) lze zveřejnit a $SK$ (soukromý) zůstává tajný. Pomalá (řád ms na jednu operaci RSA-2048). Řeší distribuční problém — každý uživatel má 1 dvojici, dohromady $O(n)$ klíčů.

V praxi se používá **hybridní kryptografie** ([[hybridni]]): asymetricky se vymění *klíč relace* (sdílené tajemství), symetricky se pak šifruje skutečný provoz.

---

*Zdroj: KRY přednášky 2025/26, KRY 1 — Klasická kryptografie. Externí reference: Stallings, W.: *Cryptography and Network Security: Principles and Practice* (8th ed., Pearson 2022), kap. 1; Menezes, A., van Oorschot, P., Vanstone, S.: *Handbook of Applied Cryptography* (CRC Press 1996), kap. 1; Smart, N.: *Cryptography Made Simple* (Springer 2016), kap. 1.*
