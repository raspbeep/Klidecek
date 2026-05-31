---
title: Podstata spotřeby a řízení jádra
---

Celkový příkon integrovaného obvodu se rozpadá na dvě fyzikálně odlišné složky. **Dynamická spotřeba** vzniká *při přepínání* logických stavů — když hradlo mění výstup, musí nabít nebo vybít parazitní kapacity (vodiče, brány následujících tranzistorů) a navíc po krátký okamžik vede oba komplementární tranzistory současně, čímž teče tzv. *zkratový* (shoot-through) proud. **Statická spotřeba** je energie odebíraná i *bez jakékoli spínací aktivity*, v ustáleném stavu, primárně kvůli svodovým a subprahovým proudům uzavřených tranzistorů.

Dynamickou složku popisuje vztah, který je jádrem celého řízení spotřeby:

::: math
P_dyn = α · C · U² · f
:::

kde α je činitel aktivity (jak často hradla spínají), C zatěžovací kapacita, U napájecí napětí a f hodinová frekvence. Klíčové je, že příkon roste **lineárně s frekvencí**, ale **kvadraticky s napětím** — proto je snížení napětí mnohonásobně účinnější než snížení frekvence.

## Proč dnes dominuje statická spotřeba

Po desetiletí byla dynamická spotřeba ta hlavní. S každým zmenšením technologického uzlu (deep / ultra-deep submicron, dnes jednotky nm) se ale snižuje i prahové napětí tranzistorů, a **subprahový svodový proud roste s poklesem prahového napětí exponenciálně** — řádově desetinásobně na každých ~100 mV. K tomu přibývá svod hradlem (gate leakage) přes velmi tenký oxid. Výsledkem je, že v moderních procesech statická spotřeba dorovnává nebo převyšuje dynamickou a stává se *určujícím* faktorem v pohotovostním (idle) režimu, kdy hradla nespínají vůbec.

| Vlastnost | Dynamická | Statická |
|---|---|---|
| Vzniká | při přepínání hradel | v klidu, bez spínání |
| Mechanismus | nabíjení kapacit + zkratový proud | subprahový a hradlový svod |
| Závislost | α·C·U²·f | exponenciálně na U_T (prahu) a teplotě |
| Dominantní v | aktivním provozu | pohotovosti, moderních uzlech |
| Léčba | clock gating, DVFS | power gating, multi-Vt |

## Hardwarové techniky řízení

Každá technika cílí na jednu ze dvou složek. Tomu odpovídá i kompromis mezi úsporou a rychlostí probuzení.

**Hradlování hodin (clock gating)** redukuje *dynamickou* spotřebu. Hodinový signál se selektivně odpojí od nečinného bloku — typicky integrovaným hradlem AND s povolovacím signálem. Aby se zabránilo zákmitům (glitches) na hodinách, používá se buňka s latchem, který povolení vzorkuje v low fázi hodin. Vnitřní registry si data zachovají, blok je stále napájen, takže **probuzení je okamžité** (stačí znovu pustit hodiny). Statickou spotřebu ovšem clock gating nesníží — tranzistory dál svádějí.

**Odpojování napájecích domén (power gating)** cílí na *statickou* spotřebu. Výkonové „sleep" tranzistory fyzicky odpojí blok od napájení (od Vdd hlavičkou, nebo Vss patičkou), čímž se svod téměř eliminuje. Cenou je ztráta stavu — odpojené registry zapomenou data. Kontext, který musí přežít, se proto ukládá do **retenčních registrů** (retention flops) napájených z trvalé zálohové domény. Probuzení je pomalejší (ustálení napětí, obnova kontextu).

::: svg "Power gating: sleep tranzistor odpojí doménu, retenční flop drží stav ze zálohové domény"
<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg">
  <text x="20" y="22" font-size="12" font-weight="600" fill="var(--text)">Vdd</text>
  <line x1="20" y1="32" x2="500" y2="32" stroke="var(--line-strong)" stroke-width="1.5"/>
  <!-- sleep transistor -->
  <rect x="200" y="40" width="120" height="34" rx="5" fill="var(--accent)" fill-opacity="0.15" stroke="var(--accent)"/>
  <text x="260" y="61" text-anchor="middle" font-size="11" fill="var(--text)">sleep tranzistor</text>
  <line x1="260" y1="32" x2="260" y2="40" stroke="var(--line-strong)"/>
  <text x="330" y="61" font-size="10" fill="var(--text-muted)">SLEEP=1 → odpojí</text>
  <!-- virtual vdd -->
  <line x1="120" y1="86" x2="400" y2="86" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3"/>
  <line x1="260" y1="74" x2="260" y2="86" stroke="var(--accent)"/>
  <text x="408" y="90" font-size="10" fill="var(--accent)">virtual Vdd</text>
  <!-- gated domain -->
  <rect x="120" y="96" width="160" height="56" rx="6" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="200" y="118" text-anchor="middle" font-size="11" fill="var(--text)">logika domény</text>
  <text x="200" y="136" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">(stav se ztratí)</text>
  <!-- retention flop on always-on rail -->
  <line x1="20" y1="170" x2="500" y2="170" stroke="oklch(0.62 0.14 142)" stroke-width="1.5"/>
  <text x="20" y="190" font-size="11" fill="oklch(0.45 0.14 142)">Vdd_always-on (záloha)</text>
  <rect x="320" y="96" width="120" height="56" rx="6" fill="oklch(0.62 0.14 142 / 0.12)" stroke="oklch(0.62 0.14 142)"/>
  <text x="380" y="118" text-anchor="middle" font-size="11" fill="var(--text)">retenční flop</text>
  <text x="380" y="136" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">(drží kontext)</text>
  <line x1="380" y1="152" x2="380" y2="170" stroke="oklch(0.62 0.14 142)"/>
</svg>
:::

**Dynamické škálování frekvence a napětí (DVFS)** využívá vztahu výše. Podle aktuální zátěže se sníží frekvence a — co je důležitější — i napětí. Procesor pak běží pomaleji výměnou za kvadratickou úsporu dynamické spotřeby. MCU obvykle nabízí několik napěťových *rozsahů* (např. vyšší rozsah ~0,9 V s maximální frekvencí, nižší ~0,75 V s omezenou frekvencí).

**Optimalizace na úrovni tranzistorů (multi-Vt)** je statická volba při syntéze. Rychlé tranzistory s nízkým prahem (LVT) spínají rychle, ale i v zavřeném stavu hodně svádějí — nasazují se proto jen na **kritické cesty** určující maximální frekvenci (typicky kolem 20 % buněk). Zbytek obvodu, který má časovou rezervu, se osadí tranzistory s vysokým prahem (HVT) s minimálním svodem. Časování zůstane dodrženo, statický příkon dramaticky klesne.

::: viz nav-dvfs "Posuvníkem měň frekvenci a napětí. Sleduj, jak P~U²·f reaguje na napětí mnohem prudčeji než na frekvenci a co to dělá s energií na úlohu."
:::

::: quiz "Proč clock gating nesníží statickou (svodovou) spotřebu odpojeného bloku?"
- [ ] Protože clock gating odpojí i napájení, takže žádný svod neteče.
  > To dělá power gating, ne clock gating. Clock gating odpojuje jen hodinový signál.
- [x] Protože blok zůstává napájen — jen mu stojí hodiny; uzavřené tranzistory dál vedou subprahový svod.
  > Přesně. Hradlování hodin zastaví přepínání (dynamickou složku), ale tranzistory jsou pod napětím a svádějí dál. Statiku řeší až fyzické odpojení napájení.
- [ ] Protože svodový proud vzniká jen při přepínání hodin.
  > Naopak — svodový proud teče i v naprostém klidu, proto je v idle dominantní.
:::

::: quiz "Snížíme frekvenci jádra na polovinu, ale napětí necháme stejné. Co se stane s energií spotřebovanou na dokončení jedné úlohy?"
- [ ] Klesne na čtvrtinu.
  > Kvadratický pokles by nastal jen při snížení napětí, ne frekvence.
- [x] Zůstane zhruba stejná — úloha jen poběží dvakrát déle při poloviční dynamické příkonové úrovni.
  > Ano. P_dyn klesne lineárně s f, ale doba úlohy se prodlouží lineárně, takže energie (P·t) se nezmění. Skutečnou úsporu energie přinese až snížení napětí (U²) nebo odstranění statického příkonu během delší doby běhu.
- [ ] Vzroste, protože delší běh znamená víc spotřebované energie.
  > Delší běh sám o sobě energii nezvyšuje, pokud zároveň klesá příkon; součin P·t zde zůstává konstantní.
:::

::: link "Power Dissipation in CMOS — VLSI Physical Design" "https://medium.com/@vlsipd4/power-dissipation-in-cmos-vlsi-physical-design-33b042d5b16c"
:::

::: link "Power dissipation sources and control in ultra-deep-submicron CMOS (ScienceDirect)" "https://www.sciencedirect.com/science/article/abs/pii/S0026269206000528"
:::

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: Microelectronics Journal (UDSM power dissipation), VLSI Physical Design (CMOS power), STMicroelectronics — STM32 system power.*
