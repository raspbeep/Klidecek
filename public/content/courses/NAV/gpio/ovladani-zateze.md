---
title: Ovládání zátěže a posílení výstupu
---

Výstupní pin běžného mikrokontroléru udrží jen malý proud — řádově nízké desítky miliampér (typicky kolem 20 mA na pin, s dalším součtovým limitem na celý port a pouzdro). To stačí na LED nebo logický vstup, ale ani zdaleka ne na motor, výkonové relé, žárovku nebo cívku. Pokus o přímé připojení takové zátěže buď nic nesepne, nebo pin (a celý čip) přetíží a zničí.

Mezi GPIO a výkonovou zátěž se proto vkládá **posilovací (spínací) stupeň**: malý řídicí proud z pinu ovládá tranzistor, který spíná velký proud z odděleného napájení.

## Tranzistor jako spínač

### BJT vs. MOSFET

* **Bipolární tranzistor (BJT)** je řízen *proudem* do báze. Pro sepnutí potřebuje trvalý bázový proud `I_B ≈ I_C / β`, který stále zatěžuje pin a navíc se na tranzistoru v sepnutém stavu ztrácí výkon `U_CE(sat) · I_C`.
* **MOSFET** je řízen *napětím* na gate — v ustáleném stavu gate netáhne žádný proud (jen krátký nabíjecí impuls na hradlovou kapacitu). V sepnutém stavu se chová jako malý odpor `R_DS(on)` (miliohmy až desetiny ohmu), takže ztráta je `R_DS(on) · I²` a velké proudy lze spínat bez chladiče.

Pro spínání zátěže z 3,3/5V logiky se proto dnes preferují MOSFETy (konkrétně **logic-level** typy, které plně sepnou už při V_GS ≈ 2,5–4,5 V). Nejjednodušší je **low-side** zapojení: tranzistor je mezi zátěží a zemí, GPIO ovládá gate/bázi.

::: svg "Low-side spínač zátěže N-MOSFETem; nulová (flyback) dioda zkratuje indukční špičku při vypnutí cívky"
<svg viewBox="0 0 460 210" xmlns="http://www.w3.org/2000/svg">
  <!-- napájení -->
  <line x1="200" y1="20" x2="340" y2="20" stroke="var(--line-strong)" stroke-width="1.5"/>
  <text x="200" y="16" font-size="10" fill="var(--text-muted)">+V_LOAD (12 V)</text>
  <!-- zátěž (cívka) -->
  <line x1="240" y1="20" x2="240" y2="40" stroke="var(--line-strong)" stroke-width="1.5"/>
  <path d="M 240 40 q 8 0 8 8 q 0 8 -8 8 q 8 0 8 8 q 0 8 -8 8 q 8 0 8 8 q 0 8 -8 8" fill="none" stroke="var(--accent)" stroke-width="1.6"/>
  <text x="260" y="70" font-size="10" fill="var(--text-muted)">zátěž</text>
  <text x="260" y="83" font-size="9" fill="var(--text-faint)">(cívka relé)</text>
  <line x1="240" y1="96" x2="240" y2="120" stroke="var(--accent)" stroke-width="1.5"/>
  <!-- flyback dioda paralelně k zátěži -->
  <line x1="320" y1="20" x2="320" y2="40" stroke="var(--line-strong)" stroke-width="1.5"/>
  <path d="M 320 56 L 312 42 L 328 42 Z" fill="var(--bg-card)" stroke="oklch(0.62 0.15 150)" stroke-width="1.4"/>
  <line x1="312" y1="56" x2="328" y2="56" stroke="oklch(0.62 0.15 150)" stroke-width="1.6"/>
  <line x1="320" y1="56" x2="320" y2="120" stroke="oklch(0.62 0.15 150)" stroke-width="1.5"/>
  <text x="335" y="62" font-size="9.5" fill="oklch(0.52 0.15 150)">flyback</text>
  <text x="335" y="74" font-size="9.5" fill="oklch(0.52 0.15 150)">dioda</text>
  <line x1="240" y1="120" x2="320" y2="120" stroke="var(--accent)" stroke-width="1.5"/>
  <!-- MOSFET -->
  <line x1="240" y1="120" x2="240" y2="135" stroke="var(--accent)" stroke-width="1.5"/>
  <line x1="225" y1="135" x2="225" y2="170" stroke="var(--line-strong)" stroke-width="2"/>
  <line x1="225" y1="138" x2="240" y2="138" stroke="var(--line-strong)" stroke-width="1.5"/>
  <line x1="225" y1="167" x2="240" y2="167" stroke="var(--line-strong)" stroke-width="1.5"/>
  <line x1="240" y1="135" x2="240" y2="141" stroke="var(--line-strong)" stroke-width="1.5"/>
  <line x1="240" y1="164" x2="240" y2="170" stroke="var(--line-strong)" stroke-width="1.5"/>
  <line x1="200" y1="152" x2="221" y2="152" stroke="var(--line-strong)" stroke-width="1.5"/>
  <text x="245" y="156" font-size="10" fill="var(--text-muted)">N-MOSFET</text>
  <!-- gate s gate rezistorem -->
  <rect x="155" y="143" width="30" height="16" rx="3" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="170" y="139" text-anchor="middle" font-size="8" fill="var(--text-faint)">R_G</text>
  <line x1="120" y1="152" x2="155" y2="152" stroke="var(--line-strong)" stroke-width="1.5"/>
  <rect x="50" y="140" width="70" height="26" rx="4" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="85" y="157" text-anchor="middle" font-size="10" fill="var(--text)">GPIO</text>
  <!-- source -> GND -->
  <line x1="240" y1="170" x2="240" y2="188" stroke="var(--line-strong)" stroke-width="1.5"/>
  <line x1="228" y1="188" x2="252" y2="188" stroke="var(--line-strong)" stroke-width="1.5"/>
  <line x1="232" y1="193" x2="248" y2="193" stroke="var(--line-strong)" stroke-width="1.5"/>
  <line x1="237" y1="198" x2="243" y2="198" stroke="var(--line-strong)" stroke-width="1.5"/>
  <text x="258" y="192" font-size="9" fill="var(--text-faint)">GND</text>
</svg>
:::

## Darlingtonova pole

Když je třeba spínat víc menších zátěží najednou (relé, krokový motor, displej), hodí se integrované pole. Klasický **ULN2803A** sdružuje *osm* Darlingtonových dvojic v jednom pouzdře; každý kanál unese **až 500 mA** (špička 600 mA) a **až 50 V**, vstupy mají zabudovaný předřadný rezistor pro přímé připojení 5V TTL/CMOS logiky. Zásadní výhoda: pouzdro obsahuje i **integrované nulové diody** (common-cathode clamp), takže pro induktivní zátěž není třeba přidávat externí flyback diody.

```text
  GPIO0 ─►│IN1   OUT1│─► relé 1   (společný COM na +V zátěže,
  GPIO1 ─►│IN2   OUT2│─► relé 2    interní clamp diody na COM)
   ...     │  ...    │
  GPIO7 ─►│IN8   OUT8│─► relé 8
          │   COM    │── +V_LOAD
          │   GND    │── zem
```

Darlingtonova dvojice má vyšší úbytek `U_CE(sat)` (~1 V) než MOSFET, takže pro velké proudy a vysokou účinnost je výkonový MOSFET lepší; ULN2803A vyniká integrací, jednoduchostí a clamp diodami.

## Flyback (nulová) dioda u induktivní zátěže

Induktivní zátěž (motor, cívka relé, solenoid) brání náhlé změně proudu. V okamžiku, kdy tranzistor přeruší proud, indukčnost se snaží proud udržet a generuje napěťovou špičku `u = −L · di/dt` — při strmém vypnutí dosahuje stovek voltů a **prorazí spínací tranzistor**.

Řešením je **flyback dioda** (též nulová / freewheeling dioda) zapojená paralelně k zátěži v *závěrném* směru vůči napájení. Při normálním provozu nevede; po vypnutí tranzistoru poskytne cestu, kterou proud cívky bezpečně dozní (`i` klesá přes diodu a vnitřní odpor), místo aby vyrazil přes tranzistor. Proto je u induktivní zátěže prakticky vždy nutná — buď externí, nebo (jako u ULN2803A) integrovaná.

## Optoizolátory pro síťové napětí a rušení

Když zátěž pracuje se síťovým napětím nebo generuje silné elektromagnetické rušení (jiskřící kontakty, velké spínané proudy), je vhodné **galvanicky oddělit** řídicí a silovou část. Slouží k tomu **optočlen** (LED + fototranzistor v jednom pouzdře): mikrokontrolér rozsvítí LED, světlo otevře fototranzistor na silové straně — mezi stranami není žádné vodivé spojení. Tím se chrání logika před přepětím a rušením a zabraňuje se zemním smyčkám. Pro spínání síťové zátěže se optočlen často kombinuje s triakem (optotriak) nebo s budičem výkonového tranzistoru.

| Posilovací stupeň | Proud / napětí | Řízení | Klíčová vlastnost |
|---|---|---|---|
| BJT (low-side) | desetiny–jednotky A | proud do báze | levný, ale ztráty U_CE(sat)·I |
| MOSFET (logic-level) | jednotky–desítky A | napětí na gate | nízké R_DS(on), bez chladiče |
| ULN2803A | 8× 500 mA / 50 V | 5V logika přímo | integrované clamp diody |
| Optočlen | dle výstupního prvku | proud do LED | galvanické oddělení |

::: quiz "Spínáš cívku relé MOSFETem. Co se stane, když vynecháš flyback diodu?"
- [x] Při vypnutí cívka vygeneruje napěťovou špičku (−L·di/dt) o stovkách voltů, která může prorazit MOSFET.
  > Přesně. Indukčnost brání skokové změně proudu; bez cesty pro doznívající proud se napětí vyžene nad průrazné napětí tranzistoru.
- [ ] Nic — MOSFET má dostatečně vysoké průrazné napětí na jakoukoliv cívku.
  > Špička induktivní zátěže snadno překročí U_DS(max) běžného MOSFETu. Dioda je standardní ochrana.
- [ ] Cívka se přehřeje, protože dioda by jinak omezovala proud za provozu.
  > Za normálního provozu flyback dioda nevede vůbec — uplatní se až v okamžiku vypnutí.
:::

::: link "ST/TI ULN2803A — Eight Darlington array (datasheet, 500 mA / 50 V, clamp diody)" "https://www.ti.com/lit/ds/symlink/uln2803a.pdf"
:::

::: link "Nexperia AN50004 — Using power MOSFETs in DC motor control applications" "https://assets.nexperia.com/documents/application-note/AN50004.pdf"
:::

---

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: TI/ST ULN2803A datasheet, Nexperia AN50004.*
