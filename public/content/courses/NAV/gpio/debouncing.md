---
title: Snímání mechanického kontaktu (zákmity)
---

Mechanický spínač, tlačítko nebo kontakt relé se při sepnutí ani rozepnutí neustálí okamžitě. Kovové kontakty jsou pružné, takže se po dotyku několikrát odrazí a signál na pinu chvíli **kmitá** mezi log. 0 a log. 1, než se ustálí — tomu se říká **bounce efekt** (zákmity). Jev typicky trvá od zlomku milisekundy po jednotky až desítky milisekund.

Pro mikrokontrolér je každá náběžná hrana potenciální „stisk". Nepřizpůsobený program tak z jednoho fyzického stisku tlačítka detekuje sérii mnoha falešných stisků — počítadlo naskočí o pět, menu přeskočí položky, přerušení se spustí desetkrát.

::: viz nav-debounce-shift "Stiskni tlačítko a sleduj zákmity. Přepni mezi syrovým čtením a softwarovým debouncingem posuvným registrem — surové čtení napočítá falešné stisky, filtr ne."
:::

Cílem **odrušení (debouncing)** je z roztřeseného signálu udělat jeden čistý přechod. Řeší se dvěma cestami: hardwarově (přidané součástky) nebo softwarově (filtrace v programu).

## Hardwarový debouncing

### RC dolní propust + Schmittův klopný obvod

Nejběžnější HW řešení spojuje dva prvky. **RC dolní propust** (sériový rezistor, kondenzátor proti zemi) zprůměruje rychlé špičky — kondenzátor se nestihne během krátkých zákmitů nabít/vybít naplno, takže napětí přechází pomalu a hladce. Tím ale vzniká *pomalý analogový náběh*, který by běžný vstup s jediným prahem mohl v okolí prahu znovu číst nestabilně.

Proto následuje **Schmittův klopný obvod**: vstup se dvěma rozhodovacími prahy (**hysterezí**). Pro náběžnou hranu platí horní práh V_T+, pro sestupnou nižší V_T−. Dokud signál nepřekročí V_T+, výstup zůstává L; po překročení se překlopí na H a zpět spadne až pod V_T−. Pásmo mezi prahy pohltí šum i pomalý náběh — výstup je čistý obdélník bez oscilací.

::: svg "RC dolní propust hladí zákmity, Schmittův klopný obvod s hysterezí (V_T+ ≠ V_T−) je digitalizuje na čistý obdélník"
<svg viewBox="0 0 520 210" xmlns="http://www.w3.org/2000/svg">
  <!-- tlačítko + RC -->
  <text x="60" y="20" font-size="11" font-weight="600" fill="var(--text)">tlačítko</text>
  <line x1="30" y1="55" x2="60" y2="55" stroke="var(--line-strong)" stroke-width="1.5"/>
  <circle cx="64" cy="55" r="3" fill="var(--text-muted)"/>
  <line x1="78" y1="48" x2="92" y2="42" stroke="var(--text-muted)" stroke-width="1.5"/>
  <circle cx="92" cy="55" r="3" fill="var(--text-muted)"/>
  <line x1="92" y1="55" x2="130" y2="55" stroke="var(--line-strong)" stroke-width="1.5"/>
  <rect x="130" y="46" width="34" height="18" rx="3" fill="var(--bg-card)" stroke="var(--accent)"/>
  <text x="147" y="42" text-anchor="middle" font-size="9" fill="var(--text-muted)">R</text>
  <line x1="164" y1="55" x2="210" y2="55" stroke="var(--accent)" stroke-width="1.5"/>
  <line x1="188" y1="55" x2="188" y2="90" stroke="var(--accent)" stroke-width="1.5"/>
  <line x1="178" y1="90" x2="198" y2="90" stroke="var(--text-muted)" stroke-width="1.5"/>
  <line x1="178" y1="95" x2="198" y2="95" stroke="var(--text-muted)" stroke-width="1.5"/>
  <text x="205" y="93" font-size="9" fill="var(--text-muted)">C</text>
  <line x1="188" y1="103" x2="188" y2="112" stroke="var(--text-muted)" stroke-width="1.5"/>
  <line x1="180" y1="112" x2="196" y2="112" stroke="var(--text-muted)" stroke-width="1.5"/>
  <!-- Schmitt symbol -->
  <path d="M 210 35 L 260 35 L 260 75 L 210 75 Z" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <path d="M 222 62 L 230 62 L 230 48 L 244 48 M 226 62 L 226 48 L 240 48 L 240 62" fill="none" stroke="var(--accent)" stroke-width="1.2"/>
  <text x="235" y="30" text-anchor="middle" font-size="9" fill="var(--text-muted)">Schmitt</text>
  <line x1="260" y1="55" x2="300" y2="55" stroke="var(--line-strong)" stroke-width="1.5"/>
  <text x="300" y="51" font-size="9" fill="var(--text-muted)">→ MCU</text>

  <!-- průběhy -->
  <text x="330" y="30" font-size="9.5" fill="var(--text-muted)">na C (po RC, s prahy)</text>
  <line x1="330" y1="58" x2="510" y2="58" stroke="oklch(0.62 0.15 150)" stroke-width="0.8" stroke-dasharray="3 3"/>
  <text x="513" y="61" font-size="7.5" fill="oklch(0.55 0.15 150)" text-anchor="end" transform="translate(0,-10)"></text>
  <text x="330" y="46" font-size="7.5" fill="oklch(0.55 0.15 150)">V_T+</text>
  <line x1="330" y1="74" x2="510" y2="74" stroke="oklch(0.62 0.19 25)" stroke-width="0.8" stroke-dasharray="3 3"/>
  <text x="330" y="85" font-size="7.5" fill="oklch(0.6 0.19 25)">V_T−</text>
  <path d="M 330 90 C 360 90 365 50 400 52 C 430 53 440 64 470 64 C 490 64 500 55 510 55"
        fill="none" stroke="var(--text)" stroke-width="1.4"/>
  <!-- čistý výstup -->
  <text x="330" y="115" font-size="9.5" fill="var(--text-muted)">výstup Schmitta (čistý)</text>
  <path d="M 330 175 L 372 175 L 372 130 L 510 130"
        fill="none" stroke="var(--accent)" stroke-width="1.6"/>
  <text x="335" y="195" font-size="9" fill="var(--text-faint)">L</text>
  <text x="500" y="148" font-size="9" fill="var(--text-faint)">H</text>
</svg>
:::

Jednodušší alternativy bez RC: pro spínač s přepínacím (SPDT) kontaktem stačí **SR klopný obvod** ze dvou hradel — první přechod kontaktu jej překlopí a další zákmity už stav nemění (klopný obvod „pamatuje" první hranu). Lze použít i **monostabilní klopný obvod**, který po první hraně vyšle jeden pevně dlouhý impuls a po dobu doznění zákmitů ignoruje vstup.

## Softwarový debouncing

Nevyžaduje žádné externí součástky, ale zatěžuje procesor pravidelným vzorkováním. Společný princip: stav pinu se nepovažuje za platný hned, ale až **po dostatečném počtu shodných vzorků**.

### Vzorkování čítačem

Pin se čte periodicky (typicky každou 1 ms z přerušení časovače). Vede se počítadlo shodných hodnot: pokaždé, když je vzorek stejný jako předchozí, čítač roste; při změně se nuluje. Tlačítko se prohlásí za sepnuté až tehdy, když čítač dosáhne prahu (např. 4 stejné vzorky = ustálené po 4 ms).

### Posuvný registr

Elegantní varianta: každý vzorek se *zasouvá* do 8- nebo 16bitové proměnné. Bit za bitem se historie posledních N čtení posouvá doleva. Stav se vyhodnotí porovnáním celé proměnné — všechny bity musí být shodné:

```c
/* Volá se periodicky, např. každou 1 ms z přerušení časovače. */
volatile uint8_t hist = 0xFF;   /* historie posledních 8 vzorků (1 = rozepnuto) */

void debounce_tick(void) {
    hist = (hist << 1) | read_pin();   /* zasuň nový vzorek (0/1) zprava */

    if (hist == 0x00) button_state = PRESSED;     /* 8× po sobě 0 = sepnuto */
    else if (hist == 0xFF) button_state = RELEASED; /* 8× po sobě 1 = rozepnuto */
    /* mezilehlé hodnoty (0x0F, 0xC0, …) = právě zákmitává → drž starý stav */
}
```

Hodnota `0x00` znamená osm po sobě jdoucích sepnutí (kontakt je ustáleně sepnutý), `0xFF` osm rozepnutí. Cokoliv mezi tím (`0x0F`, `0xC0`, …) signalizuje, že kontakt právě kmitá, a starý stav se podrží. Délka registru × perioda vzorkování určuje filtrované okno (8 × 1 ms = 8 ms).

### Past — blokující delay

Naivní „počkej a přečti znovu" se píše snadno, ale je to chyba:

```c
/* ŠPATNĚ — blokuje celý systém na 20 ms */
if (read_pin() == PRESSED) {
    delay_ms(20);                 /* po tuto dobu MCU nedělá nic jiného */
    if (read_pin() == PRESSED) handle_press();
}
```

`delay_ms()` zastaví běh celého programu — žádné jiné události, žádná další tlačítka, žádné PWM se po tu dobu neobslouží. Správně se vzorkuje *neblokujícím* časovačem (přerušení nebo stavový automat řízený systémovým časem), takže debouncing běží „na pozadí" a hlavní smyčka zůstává volná.

::: quiz "Proč se softwarový debouncing dělá z přerušení časovače a ne pomocí delay_ms() v hlavní smyčce?"
- [x] delay_ms() blokuje celý systém — po dobu čekání se neobslouží žádná jiná událost (další tlačítka, PWM, komunikace).
  > Přesně. Neblokující vzorkování z časovače běží na pozadí a hlavní smyčka zůstává volná pro ostatní úlohy.
- [ ] Přerušení čte pin přesněji než hlavní smyčka.
  > Přesnost čtení je stejná; rozdíl je v tom, že časovač nezablokuje běh ostatního kódu.
- [ ] delay_ms() nefunguje, dokud běží přerušení.
  > delay_ms() funguje, jen po dobu svého běhu blokuje vše ostatní — to je ten problém.
:::

::: link "Jack Ganssle — A Guide to Debouncing (klasický rozbor zákmitů a metod)" "http://www.ganssle.com/debouncing.htm"
:::

::: link "ti.com — Understanding Schmitt Triggers (hystereze, prahy V_T+/V_T−)" "https://www.ti.com/lit/an/scea046/scea046.pdf"
:::

---

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: Jack Ganssle „A Guide to Debouncing", TI „Understanding Schmitt Triggers".*
