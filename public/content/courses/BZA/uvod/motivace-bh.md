---
title: Motivace pro bezpečný hardware
---

# Motivace pro bezpečný hardware

Klasická softwarová kryptografie předpokládá, že útočník má *black-box* přístup k zařízení — vidí jen vstup a výstup. V reálu má útočník u zařízení v rukou — placená televize na střeše, předplatní karta v peněžence, elektronický pas v hotelovém trezoru — **plný fyzický přístup**, často po neomezenou dobu. To je zcela odlišný útočný model, který vyžaduje *hardwarovou* obranu.

## Proč software nestačí

Bezpečnost mnoha kryptografických aplikací stojí na dvou pilířích:

1. **Bezpečném uložení klíčů** — útočník nesmí klíče přečíst, ani když má fyzický přístup.
2. **Nepozorovatelnosti výpočtů** — útočník nesmí ze vstupů, výstupů, ani z fyzických projevů (proud, čas, EM záření) zrekonstruovat tajné parametry.

Software běžící v běžném prostředí (PC, mobil) obě vlastnosti garantovat neumí: kdo má root, čte paměť; kdo má osciloskop, vidí spotřebu. *Bezpečný hardware* (tamper-resistant hardware) je dedikované zařízení, které tato dvě tajemství chrání i v hostile prostředí.

## Typické aplikace

Důvod, proč tato disciplína existuje, je velmi praktický — všude tam, kde se *cizí* zařízení musí chovat *spravedlivě*:

* **Placená televize** (kabelová, satelitní) — dekodér v domácnosti útočníka nesmí umožnit sledování bez zaplacení.
* **Pay-per-view** a podobné mikroplatby — autorizace bez kontaktu s providerem.
* **Předplatní karty** — telefonní, parkovací, věrnostní, městské karty, jízdenky MHD.
* **Platební terminály** (ATM, POS, EMV karty) — banka nemůže každému zákazníkovi věřit, ale musí mu dovolit transakci.
* **Hardware tokeny** (hardlock, dongle) — ochrana proti kopírování drahého softwaru.
* **Předplatní měřiče** — plynu, elektřiny, telefonních impulsů; účet vyrovnán dopředu.
* **Imobilizéry a elektronické zámky** — auto, RFID karty.
* **SIM karty mobilů** — identifikace odběratele a sdílené tajemství s operátorem.
* **HSM a kryptografické moduly** ([[hsm-definice]]) — bankovní backend, certifikační autority, podepisování kódu.

V každém z těchto případů zařízení obsluhuje *jinou stranu*, než kdo má zájem na zachování pravidel — což je jádro problému.

## Příklad zranitelného objektu

Uvažujme zjednodušený model předplatní karty — objekt s proměnnou (zbývající kredit) a dvěma metodami:

::: svg "Triviální stavový objekt: čte počitadlo, snižuje hodnotu. Šipky ukazují místa, kde útočník může manipulovat."
<svg viewBox="0 0 540 220" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <defs>
    <marker id="aBZA1" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)"/>
    </marker>
    <marker id="aBZA1d" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--danger, #d33)"/>
    </marker>
  </defs>
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="20" y="20" width="170" height="180" rx="8"/>
    <rect x="370" y="40" width="150" height="40" rx="6"/>
    <rect x="370" y="100" width="150" height="40" rx="6"/>
    <rect x="370" y="160" width="150" height="40" rx="6"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="105" y="44" font-size="13">Objekt: kredit</text>
    <text x="105" y="74" font-size="11" fill="var(--text-muted)">var A : Word = 150;</text>
    <text x="105" y="110" font-size="11">Read():</text>
    <text x="105" y="124" font-size="10.5" fill="var(--text-muted)">return A;</text>
    <text x="105" y="156" font-size="11">Decrease(V):</text>
    <text x="105" y="170" font-size="10.5" fill="var(--text-muted)">A := A - V;</text>
    <text x="105" y="184" font-size="10.5" fill="var(--text-muted)">return OK;</text>
    <text x="445" y="64" font-size="11.5">A := A + 1000;</text>
    <text x="445" y="78" font-size="10" fill="var(--danger, #d33)">přímá manipulace</text>
    <text x="445" y="124" font-size="11.5">emulátor objektu</text>
    <text x="445" y="138" font-size="10" fill="var(--danger, #d33)">falešná identita</text>
    <text x="445" y="184" font-size="11.5">vrať vždy "OK"</text>
    <text x="445" y="198" font-size="10" fill="var(--danger, #d33)">modifikace odpovědi</text>
  </g>
  <g stroke="var(--danger, #d33)" stroke-width="1.2" fill="none" marker-end="url(#aBZA1d)" stroke-dasharray="3 3">
    <path d="M370,60 L195,60"/>
    <path d="M370,120 L195,120"/>
    <path d="M370,180 L195,180"/>
  </g>
</svg>
:::

* **Manipulace s obsahem** (tampering) — hodnotu $A$ jde modifikovat (samozřejmě *zvýšit*) přímou fyzickou nebo logickou manipulací (patching binárky, electrical tampering, EEPROM rewrite).
* **Použití falešného objektu** — emulátor (např. softwarová karta v jiném zařízení) předstírá legitimní kartu a vrací nadiktované odpovědi.
* **Modifikace komunikace** — útočník mezi kartu a terminál vloží zařízení (man-in-the-middle), které pozmění zprávy.
* **Ilegální nakreditování** — speciální případ manipulace, kdy se nelegálně nastaví "kredit" zpět na maximum.

Tyto čtyři útočné vektory jsou *univerzální* — opakují se u jakéhokoli předplatního systému, u placené TV, u parkovacích karet, i u sofistikovanějších zařízení jako jsou HSM. Návrh bezpečného zařízení musí mít obranu proti každému z nich, viz [[realizace-bh]] a [[klasifikace-utoku]].

## Distribuované a mobilní prostředí

Specifickým a vážným faktorem je, že u zařízení v rukou útočníka má *neomezený čas*. Útočník může:

* Provést tisíce měření spotřeby (DPA — viz [[spa-dpa]]) bez zásahu legitimního provozovatele.
* Vystavit zařízení nestandardním teplotám, napětím, hodinovým frekvencím (viz [[glitch-utoky]], [[environmentalni]]).
* Odlinkovat kryt, odleptat pasivaci, použít FIB workstation (viz [[fyzicke-utoky]]).
* Spolupracovat v hierarchické struktuře — vrcholoví hackeři investují do drahého vybavení (mikrojehly, FIB, $10^6$ USD) a získané know-how dále prodávají; nižší úrovně už jen replikují (cracking the cracker).

Z pohledu provozovatele je proto ekonomicky důležité, aby útok byl *drahý vzhledem k užitku* — bezpečnost není absolutní, je to nastavení nákladů útoku tak, aby se nevyplatil. Pokud Mondex stál průlom 100 000 USD, ale útočník vydělal 1 000 000 USD, zařízení selhalo. Pokud naopak SIM karta stojí 1 USD a útok stejně tolik, je bezpečnost adekvátní.

---

*Zdroj: BZA přednášky 2025/26, BZA 01 — Úvod a motivace. Externí reference: Anderson, R. J.: *Security Engineering* (3rd ed., Wiley 2020), kap. 18 (Tamper Resistance) — [dostupné online](https://www.cl.cam.ac.uk/~rja14/book.html); Koc, Ç. K. (ed.): *Cryptographic Engineering* (Springer 2009).*
