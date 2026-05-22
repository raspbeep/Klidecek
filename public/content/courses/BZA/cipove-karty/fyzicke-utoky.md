---
title: Fyzické útoky na čipové karty
---

# Fyzické útoky na čipové karty

*Fyzický útok* (invasive nebo semi-invasive — viz [[klasifikace-utoku]]) mění fyzický stav čipu — odstraňuje pasivační vrstvu, řeže metalické vrstvy, vytváří kontaktní plochy, modifikuje paměti. Drahé, viditelné, ale dávají *plný* přístup. Pro pochopení obran v BH je nutné znát alespoň základní techniky a jejich limity.

## Reverze čipu — pre-attack analýza

Před vlastním útokem útočník obvykle musí poznat **topologii čipu**:

1. **Decapping** (odstranění obalu):
   * Mechanické — soustruh, frézování (~ pro plastové obaly).
   * Chemické — kyselina dusičná HNO₃ (smoking nitric acid) rozpustí epoxidovou zálivku, vrstvy SiO₂ zůstanou. Klasický postup pro smart cards.
2. **Odstranění pasivační vrstvy** — typicky SiO₂ nebo Si₃N₄ nad metalickými vrstvami. Selektivní leptání kyselinou fluorovodíkovou (HF) nebo reaktivním plazmatem.
3. **Optická analýza** — fotografování pod světelným mikroskopem (zvětšení 1000×) nebo SEM (Scanning Electron Microscope, zvětšení 100 000×). Postupné odstraňování metalických vrstev (back-side etching, FIB cross-section) odhalí všechny propojené vrstvy.
4. **Rekonstrukce schématu** — manuální nebo poloautomaticky pomocí ChipWorks, TechInsights, nebo softwaru pro reverz IC.

Pro starý čip (>500 nm proces) lze udělat doma s vybavením za $10 000. Pro moderní (< 90 nm) je třeba FIB workstation za $1M+ a specializovaná laboratoř.

## Mikrojehlové útoky (microprobing)

::: svg "Mikrojehlový útok: čip decap, mikrojehla pod mikroskopem se umístí na linku v metalické vrstvě, měří signály v reálném čase."
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11.5">
  <g fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.3">
    <rect x="40" y="100" width="460" height="50" rx="4"/>
  </g>
  <g fill="var(--bg-inset)" stroke="var(--line)">
    <rect x="60" y="120" width="80" height="12" rx="2"/>
    <rect x="160" y="120" width="80" height="12" rx="2"/>
    <rect x="260" y="120" width="80" height="12" rx="2"/>
    <rect x="360" y="120" width="80" height="12" rx="2"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="270" y="118" font-size="10.5" fill="var(--text-muted)">čip — metalická vrstva</text>
    <text x="270" y="172" font-size="11" fill="var(--text-muted)">data lines, buses</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.8" fill="none">
    <path d="M280,30 L280,118"/>
    <circle cx="280" cy="118" r="3" fill="var(--accent)"/>
  </g>
  <g fill="var(--text)" text-anchor="middle">
    <text x="280" y="22" font-size="11">mikrojehla (probe)</text>
    <text x="280" y="60" font-size="9.5" fill="var(--text-muted)">→ osciloskop / logická analyzátor</text>
  </g>
  <g stroke="var(--text-muted)" stroke-width="0.6" stroke-dasharray="2 2">
    <path d="M280,118 L280,150"/>
  </g>
</svg>
:::

* **Princip:** mikroskopická sonda (jehla, ovládaná mikrometrickými šrouby pod mikroskopem) se umístí přímo na metalickou linku v čipu a měří signály v reálném čase.
* **Vybavení:** mikroprobing station (Cascade Microtech, FormFactor), $20 000 – $200 000. Typicky dostupné na elektrotechnických univerzitách v rámci výzkumu.
* **Pasivní využití:**
  * Měření průběhů na sběrnici — odhalí přenášené bity klíčů.
  * Sledování stavu CPU.
  * Elektrooptické vzorkování — krystal niobátu lithia (LiNbO₃) pod čipem reaguje na elektrostatické pole laserovým paprskem; *bez fyzického kontaktu* (semi-invasive) odhaluje signály.
* **Aktivní využití:**
  * Propojení testovacích pojistek (*security fuse* propálená během výroby) — návrat čipu do testovacího režimu, který umožní vypsat celou paměť.
  * Vynucení specifické hodnoty na linku (set/reset).
* **Slavné útoky:**
  * Hitachi H8/3101 (Mondex, 1996) — zkratování test pin přes microprobing umožnilo dump celé paměti, čímž byly odhaleny klíče.
  * NS5xx (cable TV cards) — series útoků v 90. letech.
* **Obrana:** menší process node (< 90 nm) znesnadňuje fyzické umístění jehly na konkrétní linku; bus encryption uvnitř čipu (data nikdy plaintext na sběrnici); tamper-detect mesh.

## FIB — Focused Ion Beam Workstation

* **Princip:** Ga⁺ ionty fokusované do paprsku ~5 nm šířky umožňují:
  * **Vyřezat** metalické spoje (cut).
  * **Vytvořit** nové spoje deposicí (plnit kovem přivedeným zhydroxydem nebo karbonylem).
  * **Vyrobit** nové kontaktní plochy pro mikrojehly i ve hlubokých vrstvách čipu.
* **Vybavení:** FIB station (FEI Helios, Zeiss Crossbeam) — $1M+, vyžaduje vakuovou komoru, čistou místnost. Komerční služby ChipWorks, TechInsights *najímají čas*.
* **Použití:**
  * **Bypass security fuses** — vyřezání spoje, který deaktivuje testovací režim.
  * **Bypass tamper-detect mesh** — opravná deposice po prořezání ochranné drátěné sítě.
  * **Připojení skrytých vrstev** — vytvoření via z hluboké metalické vrstvy na povrch pro probing.
* **Slavné:** používán pro zjištění klíčů u placené TV (NDS Videocrypt, BSkyB ~ 2000), GSM autentizační čipy.

## Modifikace ROM a EEPROM

* **ROM** je *mask* — kdo má layout, dokáže rozumět topologii (proto se používá *encrypted* ROM s kódem rozházeným podle scramblingu). Modifikace:
  * **Laser řezačka** v laboratoři buněčné biologie (běžně dostupné) — přepálení vrstvy se zvedne nebo sníží odpor → flip bitu (jen v jednom směru, 0→1 nebo opačně, podle topologie).
  * Typický cíl: instrukce **podmíněného skoku** v authentication code — místo `branch if PIN_WRONG` udělá `nop`.
  * Nebo: **S-boxy DESu** — modifikace zjednoduší kryptoanalýzu.
* **EEPROM:**
  * Dvě mikrojehly nebo laser — modifikace bitu *obousměrně* (0→1 i 1→0).
  * Cíl: PIN nastavit na známou hodnotu, modifikovat access conditions, ošidit detekci parity klíče u DESu.
  * **Dostupnost:** stanice s mikrojehlami — katedra mikroelektroniky; laser microscope — buněčná biologie (laboratoř fluorescence). Útok je drahý, ale ne nedostupný.

## Glitch a fault injection

Aktivní non-invasive nebo semi-invasive útok — viz [[glitch-utoky]] (samostatný subtopic, klíčový pro [[dfa-princip|chybovou analýzu]]):

* **Vpp útok** — odstranění Vpp brání zápisu (čítače chyb PIN, decrement kreditu).
* **CLK glitch** — krátká odchylka frekvence; způsobí, že instrukce nedoběhne (procesor *vynechá* operaci).
* **VCC glitch** — pokles napětí způsobí, že instrukce se *provede chybně*.
* **Laser fault injection (LFI)** — fokusovaný laser na konkrétní gate vyvolá single-event-upset (flip bitu). Semi-invasive — vyžaduje decap.
* **EM fault injection** — krátký EM impuls antény nad čipem; non-invasive.

Tyto útoky jsou *levné* (osciloskop + signal generator + FPGA = ~$500) a *velmi efektivní*. Cíle:

* Vynechání kontroly PIN.
* Vynechání overflow check.
* Chybný výsledek RSA podpisu → DFA (Bellcore útok, [[bellcore-rsa]]).
* Vynechání authentication v EMV.

## Elektrooptické vzorkování

* **Princip:** krystal niobátu lithia (LiNbO₃) má *elektrooptický* efekt — index lomu závisí na okolním elektrostatickém poli. Pod čip se umístí krystal a sleduje se laserovým paprskem.
* **Citlivost:** detekce 5 V signálu při 25 MHz, *bez fyzického kontaktu* s čipem.
* **Vyvinuto** IBM v 80. letech pro diagnostiku čipů za provozu.
* **Použití pro útok:** snímání výstupních zesilovačů EEPROM — odhalí čtení klíčů během operace.
* Standardní metoda kvalifikovaných útočníků pro zjištění klíčů z čipů se známou topologií.

## Photonic emission analysis

* **Princip:** CMOS gates emitují *fotony* (near-IR, 1.1 eV) při switch — fenomén *hot electron emission*. Při semi-invasive útoku (decap z back-side čipu) se snímá fotonová emise s ICCD kamerou.
* **Vyšetří:** který gate v jakém čase přepnul → odhalí prováděné operace, klíčové bity.
* **Useful pro:** SRAM PUF, AES round operations.
* **Skorobogatov 2010** demonstroval, že lze přečíst content celé SRAM přes back-side PEA. Cena: ~$200 000 (Princeton Scientific iXon EMCCD).

## Obrany — design pro tamper resistance

* **Pasivační vrstva s detektory** — Si₃N₄ + tamper-detect mesh (jemná wire mesh nad celým čipem). Pokud útočník proklepá, mesh přeruší → senzor → zeroization.
* **Aktivní senzory:** teplota (Δ > 10 °C), napětí (Δ > 10 %), frekvence (mimo dovolené pásmo), světlo (back-side photo sensors).
* **Šifrovaná sběrnice (bus encryption)** — data v interní sběrnici jsou šifrovaná; mikrojehla bez znalosti klíče dostane *šum*.
* **Random clock jitter** — náhodné kolísání hodin ztěžuje synchronizaci s útokem.
* **Dummy operations** — vsunutí náhodných instrukcí — *desynchronizace* útoku v čase, ztěžuje DPA i fault injection.
* **Memory scrambling** — data v EEPROM jsou XOR s pseudo-random pattern.
* **Light-erasable mode lock** — testovací režim se *zničí* (laser blow) při personalization a nikdy už nelze obnovit.

Tyto obrany se aplikují kumulativně. EAL5+ smartcards (Infineon SLE 78, NXP P5CD040) implementují *všechny* tyto techniky.

---

*Zdroj: BZA přednášky 2025/26, BZA 04 — Čipové karty. Externí reference: Anderson, R. J., Kuhn, M.: *Tamper Resistance — a Cautionary Note* (USENIX 1996) — [PDF](https://www.cl.cam.ac.uk/~mgk25/tamper.pdf); Kömmerling, O., Kuhn, M.: *Design Principles for Tamper-Resistant Smartcard Processors* (USENIX 1999) — [PDF](https://www.usenix.org/legacy/events/smartcard99/full_papers/kommerling/kommerling.pdf); Skorobogatov, S.: *Optical Fault Induction Attacks* (CHES 2002), *Semi-invasive attacks* (UCAM-CL-TR-630, 2005) — [PDF](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-630.pdf); Schmidt, D., Hutter, M.: *Optical Fault Attacks on AES* (CHES 2007).*
