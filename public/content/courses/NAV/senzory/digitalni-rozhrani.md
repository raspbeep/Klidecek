---
title: Digitální připojení senzorů
---

Digitální připojení senzoru je oproti analogovému **mnohem odolnější vůči elektromagnetickému rušení** — přenáší se logické úrovně, ne křehká absolutní hodnota napětí. Proto moderní smart senzory komunikují s MCU přes některou ze standardních sériových sběrnic. Liší se počtem vodičů, způsobem adresace, rychlostí a tím, zda nesou hodinový signál (synchronní) nebo ne (asynchronní). Výběr sběrnice je oblíbená zkušební otázka, protože každá řeší jiný kompromis.

::: viz nav-digital-sbernice "Přepínejte mezi sběrnicemi a sledujte zapojení vodičů i způsob adresace — kolik vodičů, master/slave, sdílení sběrnice."
:::

## I2C — Inter-Integrated Circuit

Dvouvodičová **synchronní** sběrnice: **SDA** (data) a **SCL** (hodiny). Obě linky jsou v zapojení s otevřeným kolektorem (open-drain), takže nutně potřebují **pull-up rezistory** k napájení (typicky 4,7 kΩ pro 100 kHz, nižší pro vyšší rychlosti) — zařízení linku samo umí jen stáhnout k zemi, nikdy ne aktivně zvednout.

Klíčovou výhodou je, že každé zařízení má vlastní **hardwarovou adresu** (obvykle 7bitovou, volitelně 10bitovou), takže na jediný pár vodičů lze připojit mnoho senzorů. Master zahájí komunikaci start podmínkou, vyšle adresu cílového zařízení a bit směru (čtení/zápis). Standardní mód běží na 100 kHz, fast mode na 400 kHz.

## SPI — Serial Peripheral Interface

Rychlá **synchronní, plně duplexní** sběrnice (master i slave vysílají současně). Používá minimálně **čtyři vodiče**:

* **SCK** — hodinový signál z masteru,
* **MOSI** — Master Out, Slave In (data od masteru),
* **MISO** — Master In, Slave Out (data od slave),
* **CS** (Chip Select, též SS) — výběr zařízení, aktivní v L.

SPI **nepoužívá datovou adresaci**. Místo toho má každé připojené zařízení vlastní vodič **CS**: master aktivuje právě toho slave, s nímž chce komunikovat. To je rychlé, ale počet vodičů roste s počtem zařízení (N senzorů → 3 sdílené + N samostatných CS).

| | I2C | SPI |
|---|---|---|
| Vodiče | 2 (SDA, SCL) + pull-upy | 3 sdílené + CS na každé zařízení |
| Adresace | hardwarová adresa (7/10 b) | samostatný CS vodič |
| Duplex | poloduplex | plný duplex |
| Rychlost | 100 k / 400 k Hz (vyšší v rozšířených módech) | typicky jednotky až desítky MHz |
| Hodiny | ano (SCL) — synchronní | ano (SCK) — synchronní |

::: svg "I2C sdílí dvě linky s pull-upy a adresuje softwarově; SPI sdílí tři linky a každý slave má vlastní CS vodič."
<svg viewBox="0 0 540 178" xmlns="http://www.w3.org/2000/svg">
  <text x="135" y="15" text-anchor="middle" font-size="11.5" font-weight="600" fill="var(--accent)">I2C — sdílená adresace</text>
  <rect x="20" y="28" width="60" height="34" rx="5" fill="oklch(0.62 0.14 264 / 0.12)" stroke="var(--accent)"/>
  <text x="50" y="49" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text)">MCU</text>
  <line x1="20" y1="78" x2="250" y2="78" stroke="var(--text-muted)" stroke-width="1.4"/>
  <line x1="20" y1="100" x2="250" y2="100" stroke="var(--text-muted)" stroke-width="1.4"/>
  <text x="14" y="75" text-anchor="end" font-size="8.5" fill="var(--text-muted)">SDA</text>
  <text x="14" y="103" text-anchor="end" font-size="8.5" fill="var(--text-muted)">SCL</text>
  <line x1="50" y1="62" x2="50" y2="78" stroke="var(--text-muted)" stroke-width="1.2"/>
  <line x1="50" y1="62" x2="50" y2="100" stroke="var(--text-muted)" stroke-width="1.2" stroke-dasharray="2 2"/>
  <circle cx="36" cy="40" r="6" fill="none" stroke="oklch(0.55 0.18 22)"/>
  <text x="36" y="22" text-anchor="middle" font-size="8" fill="oklch(0.55 0.18 22)">pull-up</text>
  <g font-size="8.5" fill="var(--text)">
    <rect x="120" y="116" width="56" height="30" rx="4" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
    <text x="148" y="135" text-anchor="middle">adr 0x48</text>
    <line x1="148" y1="100" x2="148" y2="116" stroke="var(--text-muted)" stroke-width="1"/>
    <line x1="138" y1="78" x2="138" y2="116" stroke="var(--text-muted)" stroke-width="1"/>
    <rect x="194" y="116" width="56" height="30" rx="4" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
    <text x="222" y="135" text-anchor="middle">adr 0x76</text>
    <line x1="222" y1="100" x2="222" y2="116" stroke="var(--text-muted)" stroke-width="1"/>
    <line x1="212" y1="78" x2="212" y2="116" stroke="var(--text-muted)" stroke-width="1"/>
  </g>
  <line x1="280" y1="20" x2="280" y2="160" stroke="var(--line-strong)" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="410" y="15" text-anchor="middle" font-size="11.5" font-weight="600" fill="oklch(0.55 0.16 142)">SPI — CS na každý slave</text>
  <rect x="296" y="28" width="60" height="34" rx="5" fill="oklch(0.62 0.14 142 / 0.12)" stroke="oklch(0.5 0.16 142)"/>
  <text x="326" y="49" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text)">MCU</text>
  <line x1="296" y1="78" x2="520" y2="78" stroke="var(--text-muted)" stroke-width="1.4"/>
  <text x="528" y="81" font-size="8.5" fill="var(--text-muted)">SCK/MOSI/MISO</text>
  <line x1="326" y1="62" x2="326" y2="78" stroke="var(--text-muted)" stroke-width="1.2"/>
  <line x1="356" y1="62" x2="356" y2="118" stroke="oklch(0.55 0.18 22)" stroke-width="1.1"/>
  <line x1="356" y1="118" x2="396" y2="118" stroke="oklch(0.55 0.18 22)" stroke-width="1.1"/>
  <line x1="420" y1="62" x2="420" y2="118" stroke="oklch(0.55 0.18 22)" stroke-width="1.1"/>
  <line x1="420" y1="118" x2="470" y2="118" stroke="oklch(0.55 0.18 22)" stroke-width="1.1"/>
  <text x="372" y="58" text-anchor="middle" font-size="7.5" fill="oklch(0.55 0.18 22)">CS1</text>
  <text x="436" y="58" text-anchor="middle" font-size="7.5" fill="oklch(0.55 0.18 22)">CS2</text>
  <g font-size="8.5" fill="var(--text)">
    <rect x="370" y="118" width="54" height="28" rx="4" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
    <text x="397" y="136" text-anchor="middle">slave 1</text>
    <line x1="397" y1="78" x2="397" y2="118" stroke="var(--text-muted)" stroke-width="1"/>
    <rect x="444" y="118" width="54" height="28" rx="4" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
    <text x="471" y="136" text-anchor="middle">slave 2</text>
    <line x1="471" y1="78" x2="471" y2="118" stroke="var(--text-muted)" stroke-width="1"/>
  </g>
</svg>
:::

## 1-Wire

Sériové rozhraní firmy Dallas Semiconductor, které si vystačí s **jediným datovým vodičem (DQ)** a společnou zemí. Každý senzor má z výroby vypálenou unikátní **64bitovou adresu** (ROM kód: 8 bitů rodiny zařízení, 48 bitů sériové číslo, 8 bitů kontrolní součet CRC), takže master umí jednoznačně adresovat libovolný z mnoha senzorů na jednom drátě.

Specialitou je **parazitní napájení**: senzor čerpá energii přímo z datové linky, když je v logické jedničce, a uchovává ji ve vnitřním kondenzátoru pro dobu, kdy je linka v nule — odpadá tak samostatný napájecí vodič. (Při energeticky náročných operacích, jako je samotný převod teploty, je ale nutné linku dočasně silně „přitáhnout" k napájení, protože pull-up rezistor by potřebný proud nedodal.) Typickým představitelem je vodotěsný teploměr **DS18B20**.

## UART

**Asynchronní** rozhraní se dvěma datovými vodiči **TX** (vysílání) a **RX** (příjem). Nemá hodinový signál — obě strany se proto musí předem dohodnout na shodné **přenosové rychlosti (baud rate)**, jinak data nepřečtou. Příjemce se synchronizuje na začátku každého rámce podle start bitu a vzorkuje uprostřed bitových intervalů.

Pro přenos na velké vzdálenosti se logické úrovně UARTu převedou na průmyslový diferenciální standard **RS-485**, který je díky diferenciálnímu vedení odolný vůči rušení a umožňuje vícebodovou sběrnici na stovky metrů.

## Binární vstupy

Zvláštním, nejjednodušším případem digitálního připojení jsou senzory s **dvouhodnotovým výstupem** (zapnuto/vypnuto): koncové spínače, detektory přítomnosti, jazýčková relé. Připojují se přímo na digitální vstup (GPIO) MCU. Aby vstup nezůstal v nedefinovaném („plovoucím") stavu, když spínač není sepnutý, je nutné použít **pull-up** nebo **pull-down rezistor**, který drží pin v definované úrovni:

* **pull-up** — pin je v klidu v L? ne — v H; spínač jej stahuje k zemi (sepnuto = L),
* **pull-down** — pin je v klidu v L; spínač jej zvedá k napájení (sepnuto = H).

U mechanických kontaktů navíc vzniká při sepnutí **zákmit (bounce)** — kontakt několik milisekund opakovaně spíná a rozpíná, takže jeden stisk MCU vidí jako mnoho přechodů. Řeší se to **odrušením zákmitů (debouncing)**: softwarově (čtení potvrdíme až po ustálení) nebo hardwarově (RC článek, Schmittův klopný obvod).

::: svg "Plovoucí pin bez pull rezistoru má nedefinovanou úroveň; pull-up jej v klidu drží v H, sepnutí spínače jej stáhne k zemi."
<svg viewBox="0 0 460 150" xmlns="http://www.w3.org/2000/svg">
  <text x="100" y="16" text-anchor="middle" font-size="10.5" font-weight="600" fill="oklch(0.55 0.18 22)">bez rezistoru — plovoucí</text>
  <line x1="40" y1="40" x2="160" y2="40" stroke="var(--text-muted)" stroke-width="1.2"/>
  <rect x="76" y="58" width="48" height="26" rx="4" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <text x="100" y="75" text-anchor="middle" font-size="9" fill="var(--text)">GPIO</text>
  <line x1="100" y1="40" x2="100" y2="58" stroke="var(--text-muted)" stroke-width="1.2"/>
  <path d="M62 40 l-8 -10" stroke="var(--text-muted)" stroke-width="1.2"/>
  <text x="100" y="108" text-anchor="middle" font-size="9" fill="oklch(0.55 0.18 22)">úroveň = ???</text>
  <text x="100" y="122" text-anchor="middle" font-size="8" fill="var(--text-faint)">šum, antény</text>
  <line x1="230" y1="20" x2="230" y2="135" stroke="var(--line-strong)" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="345" y="16" text-anchor="middle" font-size="10.5" font-weight="600" fill="oklch(0.5 0.16 142)">s pull-up — definováno</text>
  <text x="295" y="33" text-anchor="middle" font-size="8.5" fill="var(--text-muted)">Vcc</text>
  <line x1="295" y1="36" x2="295" y2="50" stroke="var(--text-muted)" stroke-width="1.2"/>
  <rect x="288" y="50" width="14" height="24" rx="2" fill="none" stroke="var(--accent)"/>
  <text x="312" y="65" font-size="8" fill="var(--accent)">R</text>
  <line x1="295" y1="74" x2="295" y2="92" stroke="var(--text-muted)" stroke-width="1.2"/>
  <rect x="271" y="92" width="48" height="26" rx="4" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <text x="295" y="109" text-anchor="middle" font-size="9" fill="var(--text)">GPIO</text>
  <line x1="350" y1="83" x2="420" y2="83" stroke="var(--text-muted)" stroke-width="1.2"/>
  <line x1="350" y1="83" x2="295" y2="83" stroke="var(--text-muted)" stroke-width="1.2"/>
  <circle cx="392" cy="83" r="3" fill="none" stroke="var(--text-muted)"/>
  <line x1="404" y1="74" x2="416" y2="92" stroke="var(--text-muted)" stroke-width="1.2"/>
  <text x="392" y="105" text-anchor="middle" font-size="8" fill="var(--text-muted)">spínač → GND</text>
  <text x="345" y="135" text-anchor="middle" font-size="8.5" fill="oklch(0.5 0.16 142)">klid = H · sepnuto = L</text>
</svg>
:::

::: quiz "Připojujete osm digitálních senzorů. U které sběrnice poroste počet potřebných vodičů od MCU nejrychleji s počtem zařízení?"
- [ ] I2C — adresace přidává vodiče na každý senzor.
  > Naopak, I2C je tu nejúspornější: stále jen SDA + SCL bez ohledu na počet zařízení, ta se rozlišují adresou.
- [x] SPI — každé zařízení vyžaduje vlastní Chip Select (CS) vodič.
  > Správně. SPI sdílí SCK/MOSI/MISO, ale CS je per-zařízení, takže pro N slavů je potřeba 3 + N vodičů.
- [ ] 1-Wire — 64bitová adresa zabírá více vodičů.
  > 1-Wire potřebuje jen jeden datový vodič (a zem) i pro mnoho senzorů; 64bitová adresa je posílána po témže drátě.
- [ ] UART — každý senzor přidává TX i RX.
  > UART je point-to-point mezi dvěma zařízeními; pro sběrnici více zařízení se používá RS-485, ne přidávání párů na každý senzor.
:::

::: link "NXP — UM10204 I2C-bus specification and user manual" "https://www.nxp.com/docs/en/user-guide/UM10204.pdf"
:::

::: link "Analog Devices — DS18B20 Programmable Resolution 1-Wire Digital Thermometer (datasheet)" "https://www.analog.com/media/en/technical-documentation/data-sheets/ds18b20.pdf"
:::

::: link "Analog Devices — Introduction to SPI Interface" "https://www.analog.com/en/resources/analog-dialogue/articles/introduction-to-spi-interface.html"
:::

---

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: NXP I2C-bus specification UM10204, Analog Devices DS18B20 datasheet a SPI introduction.*
