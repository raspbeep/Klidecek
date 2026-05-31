---
title: Přizpůsobení napěťových úrovní
---

Číslicové vstupy a výstupy (GPIO) jsou rozhraní, kterým mikrokontrolér komunikuje s fyzickým světem. Z pohledu procesoru jsou piny mapovány do paměti jako trojice registrů: **DDR** (Data Direction Register) určuje směr pinu (vstup/výstup), **PORT** drží výstupní logickou úroveň (a u vstupního pinu zapíná interní pull-up), a **PIN** je *jen pro čtení* — vrací skutečnou fyzickou úroveň na pinu.

```c
/* AVR (ATmega): bit 3 portu B jako výstup, log. 1 */
DDRB  |=  (1 << PB3);   /* 1 = výstup, 0 = vstup            */
PORTB |=  (1 << PB3);   /* nastaví výstup na H              */

/* bit 2 portu B jako vstup s interním pull-up */
DDRB  &= ~(1 << PB2);   /* 0 = vstup                        */
PORTB |=  (1 << PB2);   /* u vstupu = zapne pull-up (20–50 kΩ) */
uint8_t stav = (PINB >> PB2) & 1;  /* čtení skutečné úrovně */
```

Klíčová past: u AVR má zápis do `PORTx` *dva různé významy* podle směru pinu. Je-li pin výstupní, nastavuje úroveň; je-li vstupní, zapíná či vypíná interní pull-up rezistor (typicky 20–50 kΩ). Na samotné čtení se vždy používá `PINx`, nikdy `PORTx`.

## Napěťové prahy a šumová imunita

Logická úroveň není jedno napětí, ale *interval*. Vysílač garantuje výstupní napětí v určitých mezích, přijímač rozhoduje podle svých vstupních prahů:

* **V_OH** — minimální výstupní napětí, které vysílač zaručí pro log. 1.
* **V_OL** — maximální výstupní napětí pro log. 0.
* **V_IH** — minimální vstupní napětí, které přijímač *bezpečně* přečte jako 1.
* **V_IL** — maximální vstupní napětí čtené jako 0.

Aby spoj fungoval spolehlivě, musí platit `V_OH ≥ V_IH` (úroveň H se přenese) a `V_OL ≤ V_IL` (úroveň L se přenese). Rozdíl mezi zaručeným výstupem a požadovaným vstupním prahem je **šumová imunita** (noise margin) — kolik rušení napětí snese, než se bit překlopí:

::: math
NM_H = V_OH − V_IH        NM_L = V_IL − V_OL
:::

::: viz nav-noise-margin "Posouvej napětí vysílače a sleduj, zda jeho V_OH/V_OL ještě překlene vstupní prahy přijímače — a kolik zbývá šumové imunity."
:::

## Problém 5 V ↔ 3,3 V

Spojení obvodů s různým napájením přináší dvě nezávislé poruchy:

* **5 V výstup → 3,3 V vstup.** Pokud 3,3V vstup *není* „5V-tolerant", přivedení 5 V signálu otevře vstupní ESD diodu (clamp na V_CC) a může součástku trvale zničit. I bez okamžitého zničení teče svodový proud do napájení 3,3 V.
* **3,3 V výstup → 5 V vstup.** Opačný směr nezničí nic, ale 3,3 V nemusí stačit k překročení V_IH 5V logiky. Klasické 5V **CMOS** má V_IH typicky `0,7 · V_CC ≈ 3,5 V`, takže 3,3 V leží *pod* prahem a vstup čte nedefinovanou úroveň. (5V **TTL**/LVTTL mívá V_IH ≈ 2,0 V, takže to projde.)

Z toho plyne, že obvykle potřebujeme aktivní převodník úrovní (level shifter), ne jen přímý drát.

## Řešení přizpůsobení

| Metoda | Směr | Rychlost | Galvanické oddělení | Typické použití |
|---|---|---|---|---|
| Odporový dělič | jednosměrný | nízká (RC + parazitní C) | ne | pomalý signál 5→3,3 V |
| Obousměrný MOSFET | obousměrný | střední (open-drain) | ne | I2C, otevřený kolektor |
| Buffer 74LVC245 | jednosměrný (na směr) | desítky/stovky MHz | ne | datové sběrnice |
| Optočlen | jednosměrný | nízká–střední | **ano** | síťové napětí, odrušení |

### Odporový dělič

Nejjednodušší jednosměrné řešení pro směr „dolů" (5 → 3,3 V): dva rezistory dělí napětí v poměru `V_out = V_in · R2 / (R1 + R2)`. Nevýhoda — dělič tvoří spolu s parazitními kapacitami spoje RC článek, takže omezuje maximální frekvenci a zaobluje hrany. Pro pomalé signály postačí, na rychlou sběrnici ne.

### Obousměrný MOSFET (I2C)

Pro sběrnice s otevřeným kolektorem/drainem (typicky **I2C**) se používá jediný N-kanálový MOSFET na vodič, podle aplikační poznámky NXP AN10441. Gate je trvale na nižším napájení (3,3 V), source na straně nízkého napětí, drain na straně vysokého; obě strany mají vlastní pull-up. Když kterákoliv strana stáhne vodič k zemi, sepne se cesta druhým směrem — řešení je obousměrné a nepotřebuje řídicí signál směru. Běžně se realizuje tranzistorem BSS138.

::: svg "Obousměrný MOSFET pro I2C podle NXP AN10441 — jeden tranzistor na vodič, pull-up na obou stranách"
<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg">
  <text x="105" y="20" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">strana 3,3 V (LV)</text>
  <text x="415" y="20" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">strana 5 V (HV)</text>
  <!-- LV rail -->
  <line x1="40" y1="40" x2="170" y2="40" stroke="var(--line-strong)" stroke-width="1.5"/>
  <text x="40" y="36" font-size="10" fill="var(--text-muted)">+3,3 V</text>
  <!-- pull-up LV -->
  <rect x="95" y="48" width="20" height="34" rx="3" fill="var(--bg-card)" stroke="var(--accent)"/>
  <text x="123" y="69" font-size="10" fill="var(--text-muted)">Rp</text>
  <line x1="105" y1="40" x2="105" y2="48"  stroke="var(--line-strong)" stroke-width="1.5"/>
  <line x1="105" y1="82" x2="105" y2="120" stroke="var(--accent)" stroke-width="1.5"/>
  <!-- HV rail -->
  <line x1="350" y1="40" x2="480" y2="40" stroke="var(--line-strong)" stroke-width="1.5"/>
  <text x="450" y="36" font-size="10" fill="var(--text-muted)">+5 V</text>
  <rect x="405" y="48" width="20" height="34" rx="3" fill="var(--bg-card)" stroke="var(--accent)"/>
  <text x="433" y="69" font-size="10" fill="var(--text-muted)">Rp</text>
  <line x1="415" y1="40" x2="415" y2="48"  stroke="var(--line-strong)" stroke-width="1.5"/>
  <line x1="415" y1="82" x2="415" y2="120" stroke="var(--accent)" stroke-width="1.5"/>
  <!-- MOSFET body -->
  <rect x="205" y="80" width="110" height="80" rx="8" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <text x="260" y="105" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">N-MOSFET</text>
  <text x="260" y="122" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">source = LV</text>
  <text x="260" y="135" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">drain = HV</text>
  <!-- gate to 3.3V -->
  <line x1="260" y1="80" x2="260" y2="55" stroke="var(--text-muted)" stroke-width="1.2"/>
  <line x1="200" y1="55" x2="320" y2="55" stroke="var(--text-muted)" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="260" y="50" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">gate = +3,3 V</text>
  <!-- source / drain lines -->
  <line x1="105" y1="120" x2="205" y2="120" stroke="var(--accent)" stroke-width="1.5"/>
  <line x1="315" y1="120" x2="415" y2="120" stroke="var(--accent)" stroke-width="1.5"/>
  <text x="150" y="115" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">SDA / SCL</text>
  <text x="370" y="115" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">SDA / SCL</text>
  <!-- device boxes -->
  <rect x="60" y="150" width="90" height="34" rx="4" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="105" y="171" text-anchor="middle" font-size="10" fill="var(--text)">MCU 3,3 V</text>
  <rect x="370" y="150" width="90" height="34" rx="4" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="415" y="171" text-anchor="middle" font-size="10" fill="var(--text)">čidlo 5 V</text>
  <line x1="105" y1="120" x2="105" y2="150" stroke="var(--accent)" stroke-width="1.5"/>
  <line x1="415" y1="120" x2="415" y2="150" stroke="var(--accent)" stroke-width="1.5"/>
</svg>
:::

### Integrované buffery (74LVC245)

Pro rychlé datové sběrnice se používají hradlové převodníky, např. oktálový transceiver **74LVC245**. Pracuje při V_CC 1,65–3,6 V, ale jeho vstupy jsou *5V-tolerant* (snesou až 5,5 V), takže umí přijmout 5V signál a vydat 3,3V. Má vstup `OE` (output enable, třetí stav = odpojí sběrnici) a `DIR` (volba směru). Nabízí ostré hrany a propustnost desítek až stovek MHz — to dělič ani jednoduchý MOSFET nezvládnou.

### Optočleny (galvanické oddělení)

Tam, kde je kromě úrovní potřeba *galvanicky oddělit* zem řídicí a silové části (síťové napětí, silné rušení, průmyslové řízení), se používá **optočlen**: LED a fototranzistor v jednom pouzdře. Signál přechází jen světlem, takže obě strany nemají žádné společné vodivé spojení — to chrání mikrokontrolér před přepětím a rozbíjí zemní smyčky. Daní je nižší rychlost a nutnost napájet obě strany.

::: quiz "3,3V mikrokontrolér posílá signál do 5V CMOS vstupu. Čeká ho problém?"
- [x] Ano — 3,3 V leží pod V_IH ≈ 0,7·V_CC ≈ 3,5 V u 5V CMOS, vstup nemusí spolehlivě číst log. 1.
  > Přesně. Směr „nahoru" do CMOS je problematický kvůli vysokému prahu V_IH. Potřebuje převodník nahoru (např. 74LVC245 napájený 5 V, nebo dedikovaný shifter).
- [ ] Ne, nižší napětí nikdy nevadí — projde každým vstupem.
  > To platí jen pro logiku s nižším prahem (TTL/LVTTL, V_IH ≈ 2 V). U 5V CMOS je práh příliš vysoký.
- [ ] Ano, 3,3 V do 5V vstupu zničí přijímač přepětím.
  > Naopak — přepětím se ničí směr 5 V → nechráněný 3,3V vstup. 3,3 V do 5V vstupu nic nepálí, jen nemusí dosáhnout prahu.
:::

::: link "NXP AN10441 — Level shifting techniques in I2C-bus design" "https://assets.nexperia.com/documents/application-note/AN10441.pdf"
:::

::: link "Nexperia/TI 74LVC245A — Octal bus transceiver, 3-state (datasheet)" "https://assets.nexperia.com/documents/data-sheet/74LVC_LVCH245A.pdf"
:::

::: link "ElectronicWings — ATmega16/32 GPIO ports and registers (DDR/PORT/PIN)" "https://www.electronicwings.com/avr-atmega/atmega1632-gpio-ports-and-registers"
:::

---

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: NXP/Nexperia AN10441, Nexperia 74LVC245A datasheet, ElectronicWings AVR GPIO.*
