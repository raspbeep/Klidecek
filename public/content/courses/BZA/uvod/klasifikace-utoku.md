---
title: Klasifikace útoků na bezpečný hardware
---

# Klasifikace útoků na bezpečný hardware

Útoky na BH se klasifikují podle dvou os: **úroveň invazivity** (jak moc se mění fyzický stav zařízení) a **typ rozhraní** (přes co útok proniká). Klasifikace pomáhá designérovi rozhodovat, kterou ochranu prioritizovat a jaký útočný profil pokrýt.

## Osa 1 — Invazivita

Mezinárodní termíny (Anderson, Skorobogatov):

::: svg "Tři úrovně invazivity: non-invasive (zařízení neotevřeno), semi-invasive (otevřeno, ale obvody nezasahovány), invasive (modifikace obvodů)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="40" width="160" height="140" rx="8"/>
    <rect x="190" y="40" width="160" height="140" rx="8"/>
    <rect x="360" y="40" width="160" height="140" rx="8"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="100" y="32" font-size="12">Non-invasive</text>
    <text x="100" y="62" font-size="10.5" fill="var(--text-muted)">zařízení neotevřeno</text>
    <text x="270" y="32" font-size="12">Semi-invasive</text>
    <text x="270" y="62" font-size="10.5" fill="var(--text-muted)">decap, optika</text>
    <text x="440" y="32" font-size="12">Invasive</text>
    <text x="440" y="62" font-size="10.5" fill="var(--text-muted)">microprobing, FIB</text>
  </g>
  <g fill="var(--text)" text-anchor="start" font-size="10.5">
    <text x="32"  y="92">• timing analýza</text>
    <text x="32"  y="108">• SPA / DPA</text>
    <text x="32"  y="124">• EM emanation</text>
    <text x="32"  y="140">• glitch (CLK, VCC)</text>
    <text x="32"  y="156">• padding oracle</text>
    <text x="202" y="92">• decapping kyselinou</text>
    <text x="202" y="108">• laser fault inj.</text>
    <text x="202" y="124">• optický probing</text>
    <text x="202" y="140">• focused EM</text>
    <text x="202" y="156">• photon emission</text>
    <text x="372" y="92">• microprobes (jehly)</text>
    <text x="372" y="108">• FIB rewiring</text>
    <text x="372" y="124">• ROM/EEPROM rewrite</text>
    <text x="372" y="140">• elektrooptické vzork.</text>
    <text x="372" y="156">• SEM analýza</text>
  </g>
</svg>
:::

* **Non-invasive** — zařízení zůstává intaktní, externě nelze poznat, že útok proběhl. Útočník využívá legitimní rozhraní (kontakty, anténu, napájení) a měří fyzikální projevy. Nejlevnější, nejtěžší detekovat.
  * *Příklady:* časová analýza ([[casova-analyza]]), SPA/DPA ([[spa-dpa]]), EM emanation ([[em-kanal]]), glitch attacky ([[glitch-utoky]]).
* **Semi-invasive** — zařízení se otevře (decap pasivace), ale obvody se *fyzicky nemodifikují*. Útočník přidává externí signály (laser, fokusovaná EM) nebo měří optické projevy (photon emission).
  * *Příklady:* laser fault injection (LFI), photon emission analysis, optické probing přes IR mikroskop.
* **Invasive** — útočník fyzicky modifikuje čip — řeže metalické vrstvy, vytváří kontaktní plochy pro mikrojehly, přepisuje ROM/EEPROM laserem. Drahé (FIB workstation $10^6$ USD), zanechává viditelnou stopu, ale dává *plný* přístup.
  * *Příklady:* microprobing, FIB rewiring, elektrooptické vzorkování (lithium niobate crystal), pasivní pozorování přes SEM. Viz [[fyzicke-utoky]].

## Osa 2 — Typ rozhraní (aktivní vs. pasivní)

* **Pasivní útok** — útočník pouze *měří* (čte signály, časy, spotřebu, EM záření, optické záření). Nemění vstupy. Pro detekci je třeba sofistikovaný monitoring (např. anomálie ve frekvenci dotazů).
* **Aktivní útok** — útočník *zasahuje* — mění napájení, hodiny, vstupy, dotazy. Cílem je vyvolat chybnou operaci, kterou pak využije (DFA, glitch — viz [[dfa-princip]]).

Kombinace dvou os dává matrici:

| Invazivita ↓ / Aktivita → | Pasivní | Aktivní |
| :--- | :--- | :--- |
| **Non-invasive** | TA, SPA, DPA, EM | glitch, padding oracle |
| **Semi-invasive** | photon emission | laser fault inj. |
| **Invasive** | microprobing, SEM | FIB rewiring, ROM rewrite |

## Útočné scénáře (formální klasifikace)

V kryptografii se útoky klasifikují podle toho, jaký vstup útočník kontroluje:

* **COA** — ciphertext-only attack: útočník má jen šifrový text. (např. odposlech)
* **KPA** — known-plaintext attack: dvojice (plaintext, ciphertext). (např. záhlaví TLS)
* **CPA** — chosen-plaintext attack: útočník volí plaintexty. (zařízení mu vydává odpovídající šifrový text)
* **CCA** — chosen-ciphertext attack: útočník volí ciphertexty a získává plaintext / chybový kód. (např. dešifrovací orákulum)

Pro BH se přidávají *fyzické* útočné modely:

* **Power model** — útočník měří spotřebu během operace (DPA, viz [[spa-dpa]]).
* **Timing model** — útočník měří dobu trvání operace ([[casova-analyza]]).
* **Fault model** — útočník indukuje chyby a měří chybné výstupy ([[dfa-princip]]).
* **API model** — útočník volá legitimní API zařízení, ale v kombinacích, které designér nepředvídal ([[utoky-na-api]]).

## Modely silných útočníků

Anderson rozlišuje úrovně technické vyspělosti útočníka:

* **Class I — Clever outsider** — vzdělaný amatér s malými prostředky. Studuje veřejné dokumenty, používá levné nástroje (osciloskop, JTAG sondu).
* **Class II — Knowledgeable insider** — bývalý zaměstnanec výrobce nebo provozovatele s detailní znalostí systému. Limitovaný čas a prostředky.
* **Class III — Funded organization** — státem podporovaný útočník (NSA, FSB, MSS), velký rozpočet, neomezený čas. Má přístup k FIB, SEM, laserovým laboratořím; spolupracuje s univerzitami.

> Většina komerčních BH cílí na *Class I + II*. Class III útočník v praxi prolomí cokoli, otázka je *za jakou cenu* a *jak rychle* — z čehož vychází ekonomická logika bezpečnosti.

## Hierarchie černého trhu ("Black Box Industry")

Útoky na placené TV, satelitní karty a mobilní telefony vytvořily celé ekonomické odvětví:

::: svg "Hierarchická struktura černého trhu: nahoře několik elitních hackerských firem (s vlastním R&D), pod nimi hobby crackers, dole dodavatelé (čipy, emulátory)."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="160" y="20" width="220" height="46" rx="6"/>
    <rect x="80" y="86" width="160" height="46" rx="6"/>
    <rect x="300" y="86" width="160" height="46" rx="6"/>
    <rect x="160" y="150" width="220" height="40" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="42" font-size="12">Elite hackerské firmy</text>
    <text x="270" y="58" font-size="10" fill="var(--text-muted)">vlastní R&amp;D, FIB, vědci</text>
    <text x="160" y="108" font-size="12">Hobby crackers</text>
    <text x="160" y="124" font-size="10" fill="var(--text-muted)">reverz pirátských zařízení</text>
    <text x="380" y="108" font-size="12">Resellers / pirate cards</text>
    <text x="380" y="124" font-size="10" fill="var(--text-muted)">prodej výsledku elity</text>
    <text x="270" y="172" font-size="12">Dodavatelé</text>
    <text x="270" y="186" font-size="10" fill="var(--text-muted)">PIC čipy, emulátory, blockers, RFID</text>
  </g>
  <g stroke="var(--text-muted)" stroke-width="1" fill="none" stroke-dasharray="3 3">
    <path d="M260,66 L160,86"/>
    <path d="M280,66 L380,86"/>
    <path d="M160,132 L240,150"/>
    <path d="M380,132 L300,150"/>
  </g>
</svg>
:::

* **Špičkové firmy** investují do drahého vybavení a kryptoanalýzy, prodávají *první kolo* (originální cracking zařízení s plnou ziskovostí).
* **Hobby crackers** *crackují cracker* — reverzem klonují pirátské zařízení a prodávají levnější kopie ("cracking the cracker"), druhé kolo se sníženými náklady.
* **Dodavatelé** zásobují všechny vrstvy generickými komponentami (PIC mikrokontroléry pro Wafer karty, emulátory, blockery).

Pro provozovatele BH je z toho ponaučení: **rychle průlomená první generace** prochází kaskádou trhu, dokud nepřijde redesign. Náklad obnovy generace (přepsání všech karet) je obvykle vyšší než navýšení ochrany v původním designu. Proto se vyplatí investovat do silnější varianty od začátku.

## Limity klasifikace

Klasifikace pomáhá orientovat se v poli, ale nepřímo svádí k *security by checklist* — "pokryl jsem všech 12 kategorií útoků, jsem bezpečný". Reálné útoky obvykle **kombinují** několik kategorií: SPA + glitch + microprobing v jediném útoku na konkrétní cíl. Klasifikace pomáhá nezapomenout na žádnou třídu, ale nenahrazuje threat modelling pro konkrétní zařízení a konkrétní útočníka.

---

*Zdroj: BZA přednášky 2025/26, BZA 01 — Úvod a motivace. Externí reference: Anderson, R. J.: *Security Engineering* (3rd ed., Wiley 2020), kap. 18 — [online](https://www.cl.cam.ac.uk/~rja14/book.html); Skorobogatov, S.: *Semi-invasive attacks* (UCAM-CL-TR-630, 2005) — [PDF](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-630.pdf); Kömmerling, O., Kuhn, M.: *Design Principles for Tamper-Resistant Smartcard Processors* (USENIX 1999) — [PDF](https://www.usenix.org/legacy/events/smartcard99/full_papers/kommerling/kommerling.pdf).*
