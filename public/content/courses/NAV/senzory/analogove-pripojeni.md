---
title: Analogové připojení a A/D převod
---

Pokud senzor poskytuje spojitý analogový signál, musí se před přivedením na vstup A/D převodníku **upravit** a poté **vzorkovat a kvantovat**. Obě fáze mají svá pravidla, jejichž porušení vede k tichému zkreslení výsledku — proto sem zkoušející míří nejčastěji. Tato sekce probere úpravu signálu, unifikované přenosové standardy a vlastní A/D převod s důrazem na SAR architekturu.

## Úprava signálu před převodem

Signál z čidla bývá příliš slabý a z příliš vysokoimpedančního zdroje, než aby jej ADC zpracoval správně. Dva klíčové obvody to řeší:

* **Přístrojový zesilovač (instrumentation amplifier)** — zesiluje *rozdíl* dvou vstupních napětí s velmi vysokým vstupním odporem a velkým potlačením souhlasného rušení (CMRR). To je přesně to, co potřebuje výstup tenzometrického Wheatstoneova můstku, který dává malé diferenční napětí na souhlasném pozadí.
* **Sledovač napětí (voltage follower)** — operační zesilovač v zapojení se zesílením 1×. Sám signál nezesiluje, ale díky vysokému vstupnímu a nízkému výstupnímu odporu zajišťuje **impedanční přizpůsobení**: oddělí vysokoimpedanční čidlo od vzorkovacího kondenzátoru ADC, který se tak stihne nabít na správné napětí.

## Unifikované signály v průmyslu

Při přenosu analogové hodnoty na větší vzdálenost (desítky až stovky metrů) se používají **unifikované signály**, na něž jsou navrženy všechny průmyslové vstupy:

| Standard | Rozsah | Vlastnosti |
|---|---|---|
| Napěťový | 0–10 V | jednoduchý, ale citlivý na úbytek napětí na vedení a na rušení |
| **Proudová smyčka** | **4–20 mA** | odolná vůči rušení, detekuje přerušený vodič, vhodná na velké vzdálenosti |

Proudová smyčka 4–20 mA je v průmyslu de facto standard, a to ze dvou důvodů. Za prvé je **proud podél celé smyčky stejný**, takže úbytek napětí na dlouhém vedení hodnotu nezkreslí (rušení indukuje napětí, ne proud). Za druhé používá tzv. **živou nulu**: nule měřené veličiny odpovídá 4 mA, ne 0 mA. Proud pod ~4 mA je vyhrazen pro chybové stavy — pokles na **0 mA jednoznačně signalizuje přerušený vodič** nebo výpadek vysílače, což čistě napěťový signál ani proudová smyčka s nulou v nule rozlišit neumí.

::: viz nav-proudova-smycka "Posuňte měřenou veličinu a vyzkoušejte přerušení vodiče — sledujte, jak živá nula 4 mA umožňuje odlišit minimum stupnice od poruchy."
:::

## A/D převod — vzorkování a kvantování

Po MUXu se signál dostane k internímu ADC, kde projde dvěma kroky: **vzorkováním** v čase a **kvantováním** v hodnotě.

### Sample & Hold

Před každým převodem připojí obvod sample & hold vstupní pin na krátkou dobu k vnitřnímu **vzorkovacímu kondenzátoru**, který se nabije na okamžité vstupní napětí. Poté se odpojí (*hold*) a napětí na kondenzátoru zůstává konstantní po celou dobu převodu — to je nutné, protože převod nějakou dobu trvá a vstup se mezitím nesmí měnit.

### Nyquistův teorém a anti-aliasing

Aby vzorky věrně reprezentovaly signál, musí být **vzorkovací frekvence alespoň dvojnásobkem nejvyšší frekvence** obsažené v signálu:

::: math
f_vz > 2 · f_max
:::

Při porušení tohoto Nyquistova–Shannonova kritéria dochází k **aliasingu**: vysokofrekvenční složky se „složí" do nízkofrekvenčního pásma a jeví se jako falešný pomalý signál, který už nelze odfiltrovat softwarem. Proto se *před* ADC zařazuje hardwarová **dolní propust (anti-aliasing filtr)**, která vysoké frekvence odřízne ještě v analogové doméně.

### Kvantování a kódování

Vzorek (spojité napětí) se přiřadí k nejbližší z 2^N diskrétních úrovní a zakóduje do N-bitového čísla. Velikost jedné úrovně, **kvantovací krok** *LSB*, určuje rozlišení:

::: math
LSB = V_ref / 2^N
:::

Zaokrouhlení na nejbližší úroveň zavádí nevyhnutelnou **kvantovací chybu** (až ±½ LSB). Více bitů znamená jemnější krok a menší chybu — ale i pomalejší převod.

## SAR převodník

Většina mikrokontrolérů má integrovaný **aproximační převodník (SAR — Successive Approximation Register)** pro jeho dobrý kompromis mezi rychlostí a rozlišením (typicky 10–16 bitů). Pracuje jako **binární vyhledávání**: vnitřní D/A převodník (DAC) generuje zkušební napětí, komparátor jej porovnává se vzorkem a podle výsledku se postupně rozhoduje o jednotlivých bitech od nejvýznamnějšího (MSB) k nejméně významnému (LSB).

::: viz nav-sar-adc "Spusťte převod a sledujte binární vyhledávání: pro N-bitový SAR převod trvá přesně N kroků, v každém se rozhodne o jednom bitu od MSB k LSB."
:::

Klíčová vlastnost: **N-bitový převod trvá vždy přesně N porovnání**, tedy převod má pevnou, předvídatelnou dobu trvání. V každém kroku komparátor zjistí, zda zkušební napětí DAC překračuje vstup; pokud ano, testovaný bit se vynuluje, jinak zůstane jednička. Po N krocích obsahuje registr výsledný kód.

## Praktická poznámka — analogový vstup MCU

Vstupní pin MCU má kromě analogové cesty i digitální vstupní budič (Schmittův klopný obvod). Používáte-li pin jako analogový vstup, je vhodné tento digitální budič **softwarově vypnout** (u řady MCU registrem typu *ANSEL* / *disable digital input buffer*). Pin v analogovém pásmu se totiž může ocitnout v „zakázané zóně" mezi logickou nulou a jedničkou, kde digitální budič kmitá, zvyšuje spotřebu (zkratový proud) a může zatěžovat měřené napětí.

::: quiz "Měřený signál může obsahovat složky až do 5 kHz. Jaká je nejmenší teoreticky přípustná vzorkovací frekvence ADC a co je nutné zařadit před převodník?"
- [ ] 5 kHz, žádný filtr není potřeba.
  > To je jen f_max. Při vzorkování rovnou f_max nelze signál rekonstruovat — porušujete Nyquistovo kritérium.
- [x] Více než 10 kHz a před ADC hardwarovou dolní propust (anti-aliasing filtr).
  > Správně. Nyquist žádá f_vz > 2·f_max = 10 kHz a anti-aliasing filtr odřízne složky nad polovinou vzorkovací frekvence dřív, než vzniknou aliasy.
- [ ] 2,5 kHz, stačí poloviční frekvence.
  > Naopak — potřebujete více než dvojnásobek f_max, ne polovinu.
- [ ] 10 kHz, filtrovat lze až softwarově v MCU.
  > Aliasing je nevratný: jakmile se vysoká frekvence „složí" do měřeného pásma, software ji od užitečného signálu neodliší. Filtr musí být analogový, před ADC.
:::

::: link "Analog Devices MT-021 — ADC Architectures II: Successive-Approximation ADCs" "https://www.analog.com/media/en/training-seminars/tutorials/mt-021.pdf"
:::

::: link "Maxim/Analog — Tutorial 1080: Understanding SAR ADCs" "https://www.analog.com/en/resources/technical-articles/understanding-sar-adcs.html"
:::

::: link "Fluke — What is a 4-20 mA current loop?" "https://www.fluke.com/en-us/learn/blog/calibration/what-is-a-4-20-ma-current-loop"
:::

---

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: Analog Devices MT-021 a SAR ADC tutorial, Fluke 4–20 mA current loop.*
