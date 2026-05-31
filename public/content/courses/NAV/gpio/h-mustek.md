---
title: H-můstek a řízení DC motorů
---

Stejnosměrný kartáčový motor se otáčí podle polarity napětí na svorkách. Aby jej mikrokontrolér uměl roztočit *oběma* směry z jediného kladného napájení, používá se **H-můstek**: čtyři spínače (nejčastěji MOSFETy) zapojené do tvaru písmene „H", kde motor tvoří středovou příčku. Dvojice horních spínačů (S1, S2) jsou připojeny na napájení, dvojice dolních (S3, S4) na zem; větev tvoří vždy jeden horní a jeden dolní spínač nad sebou.

::: viz nav-h-bridge "Přepínej režimy můstku (vpřed/vzad/brzda/volnoběh) a sleduj, které spínače sepnou a kudy teče proud motorem. Tlačítkem shoot-through si vyzkoušej zakázaný stav."
:::

## Pracovní režimy

Stav motoru určuje, *která* kombinace spínačů sepne:

| Režim | Sepnuté spínače | Napětí na motoru | Co dělá |
|---|---|---|---|
| **Vpřed** | S1 + S4 (diagonála) | +U_d | proud zleva doprava → točí se jedním směrem |
| **Vzad** | S2 + S3 (druhá diagonála) | −U_d | proud opačně → otáčí se zpět |
| **Brzdění** | S3 + S4 (oba dolní) *nebo* S1 + S2 | svorky zkratovány (0 V) | motor jako generátor do zkratu → rychle se zabrzdí |
| **Volnoběh** | žádný (vše vypnuto) | svorky odpojeny | motor dobíhá vlastní setrvačností |

**Vpřed a vzad** se liší jen tím, kterou *diagonálu* sepneme — tím se otočí polarita a tedy směr otáčení. **Brzdění** (dynamic braking) zkratuje svorky motoru: rotor stále generuje napětí, ale do zkratu, takže indukovaný proud vytvoří brzdný moment a motor se rychle zastaví. **Volnoběh** (coasting) všechny spínače vypne — motor není nijak buzen ani brzděn a volně doběhne.

## Řízení rychlosti pomocí PWM

Rychlost se neřídí změnou napájecího napětí, ale **PWM** (pulzně šířkovou modulací): spínač se rychle (jednotky až desítky kHz) zapíná a vypíná a poměr doby sepnutí (střída, duty cycle) určuje *střední* napětí na motoru a tím i otáčky. Indukčnost vinutí proud vyhladí, takže motor „vidí" jen průměr.

::: math
U_stř = D · U_d        D = t_on / (t_on + t_off) ∈ ⟨0, 1⟩
:::

## Shoot-through a mrtvý čas

Nejnebezpečnější chyba H-můstku: sepnout **horní i dolní spínač téže větve** současně (např. S1 i S3). Tím se přímo zkratuje napájecí zdroj přes oba tranzistory — vznikne **shoot-through** (průstřel větve) s obrovským proudem, který tranzistory okamžitě zničí.

Protože tranzistory se nevypínají nekonečně rychle (gate má kapacitu, vypnutí trvá), nestačí jeden okamžitě vypnout a druhý zapnout — krátce by vedly oba. Řešením je **mrtvý čas (dead-time)**: záměrná prodleva mezi vypnutím jednoho a zapnutím druhého spínače téže větve, po kterou jsou *oba* vypnuté. Volí se delší než vypínací čas tranzistoru; integrované budiče H-můstku ho generují automaticky.

::: svg "Dead-time: krátká prodleva, kdy jsou oba spínače větve vypnuté, brání zkratu (shoot-through) zdroje při přepnutí"
<svg viewBox="0 0 500 170" xmlns="http://www.w3.org/2000/svg">
  <!-- horní spínač -->
  <text x="8" y="40" font-size="10.5" font-weight="600" fill="var(--text)">horní (S1)</text>
  <path d="M 100 50 L 230 50 L 230 22 L 360 22 L 360 50 L 480 50"
        fill="none" stroke="var(--accent)" stroke-width="1.6"/>
  <text x="80" y="25" font-size="8" fill="var(--text-faint)">on</text>
  <text x="80" y="53" font-size="8" fill="var(--text-faint)">off</text>
  <!-- dolní spínač -->
  <text x="8" y="110" font-size="10.5" font-weight="600" fill="var(--text)">dolní (S3)</text>
  <path d="M 100 92 L 200 92 L 200 120 L 100 120"
        fill="none" stroke="var(--accent)" stroke-width="1.6" transform="translate(0,0)"/>
  <path d="M 100 92 L 200 92 L 200 120 L 390 120 L 390 92 L 480 92"
        fill="none" stroke="oklch(0.62 0.15 230)" stroke-width="1.6"/>
  <text x="80" y="95" font-size="8" fill="var(--text-faint)">on</text>
  <text x="80" y="123" font-size="8" fill="var(--text-faint)">off</text>
  <!-- dead-time pásma -->
  <rect x="200" y="14" width="30" height="116" fill="oklch(0.62 0.19 25 / 0.14)" stroke="oklch(0.62 0.19 25)" stroke-dasharray="3 3" stroke-width="0.8"/>
  <rect x="360" y="14" width="30" height="116" fill="oklch(0.62 0.19 25 / 0.14)" stroke="oklch(0.62 0.19 25)" stroke-dasharray="3 3" stroke-width="0.8"/>
  <text x="215" y="148" text-anchor="middle" font-size="9" fill="oklch(0.6 0.19 25)">dead-time</text>
  <text x="375" y="148" text-anchor="middle" font-size="9" fill="oklch(0.6 0.19 25)">dead-time</text>
  <text x="215" y="162" text-anchor="middle" font-size="8" fill="var(--text-muted)">oba off</text>
  <text x="375" y="162" text-anchor="middle" font-size="8" fill="var(--text-muted)">oba off</text>
</svg>
:::

## Bipolární vs. unipolární řízení

Při PWM lze spínat dvěma topologiemi, které se liší tím, jaké napětí motor vidí v „mezerách" mezi pulzy:

* **Bipolární řízení.** Spíná se vždy striktně celá diagonála (S1+S4 ↔ S2+S3). Napětí na motoru se mění mezi `+U_d` a `−U_d` — dvouúrovňově. Řízení je jednoduché a usnadňuje měření proudu, ale velký rozkmik napětí způsobuje **vysoké zvlnění proudu** (a tím vyšší ztráty a zahřívání motoru vyššími harmonickými).

* **Unipolární řízení.** Spínače se v každé větvi řídí samostatně, takže kromě `+U_d` lze do motoru přivést i **nulový vektor** (0 V — oba horní nebo oba dolní sepnuté), kdy energie vinutí cirkuluje uvnitř můstku. Napětí na motoru se mění jen mezi `0` a `+U_d` (tříúrovňově `+U_d / 0 / −U_d` při změně směru). Menší rozkmik a **zdvojnásobení efektivní spínací frekvence** viděné motorem výrazně **snižují zvlnění proudu** (řádově na polovinu) — motor běží klidněji a chladněji za cenu složitějšího řízení.

::: math
zvlnění proudu (unipolární) ≈ ½ · zvlnění proudu (bipolární)
:::

::: quiz "Proč unipolární PWM řízení H-můstku snižuje zvlnění proudu motoru oproti bipolárnímu?"
- [x] Napětí se mění jen mezi 0 a U_d (menší rozkmik) a efektivní spínací frekvence na motoru se zdvojnásobí.
  > Přesně. Nulový vektor (0 V) místo přepólování zmenší rozkmik a tříúrovňové spínání zvýší frekvenci viděnou motorem, takže indukčnost proud lépe vyhladí.
- [ ] Unipolární řízení spíná pomaleji, takže tranzistory méně hřejí.
  > Naopak — efektivní frekvence viděná motorem je vyšší. Nižší je rozkmik napětí, ne frekvence.
- [ ] Unipolární řízení nepoužívá PWM, takže žádné zvlnění nevzniká.
  > PWM se používá v obou případech; liší se jen úrovně napětí v mezerách mezi pulzy.
:::

::: link "Nexperia AN50004 — Using power MOSFETs in DC motor control (H-bridge, dead-time, uni/bipolar)" "https://assets.nexperia.com/documents/application-note/AN50004.pdf"
:::

::: link "All About Circuits — H-Bridge DC Motor Control: complementary PWM, shoot-through, dead-time" "https://www.allaboutcircuits.com/technical-articles/h-bridge-dc-motor-control-complementary-pulse-width-modulation-pwm-shoot-through-dead-time-pwm/"
:::

---

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: Nexperia AN50004, All About Circuits „H-Bridge DC Motor Control".*
