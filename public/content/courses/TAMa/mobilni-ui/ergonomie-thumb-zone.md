---
title: Ergonomie: palcová zóna a Fittsův zákon
---

To, **jak fyzicky držíme telefon**, určuje, kam na obrazovku dosáhneme pohodlně a kam jen s námahou. Návrh, který tento dosah ignoruje, nutí uživatele k přehmatům a zvyšuje chybovost. Dvě ergonomická pravidla zde vystupují do popředí: rozdělení obrazovky na **palcovou zónu** podle dosahu a **Fittsův zákon**, který kvantifikuje, jak velký a jak daleký musí cíl být, aby se na něj dalo rychle a spolehlivě klepnout.

## Modely úchopu

Pozorování velkého počtu uživatelů (přes 1300 v původním výzkumu) ukazuje tři typické způsoby držení telefonu:

| Úchop | Podíl | Popis |
|---|---|---|
| Jednoruční | ~49 % | telefon drží i ovládá jedna ruka, klepe palec téže ruky |
| Kolébkový (*cradle*) | ~36 % | telefon spočívá v jedné ruce, ovládá prst nebo palec druhé ruky |
| Obouruční | ~15 % | telefon drží obě ruce, klepou oba palce |

Napříč všemi úchopy je **přibližně 75 % všech interakcí poháněno palcem**. Palec je tedy primárním vstupním „nástrojem" — a jeho dosah je omezený, protože se ohýbá z jednoho rohu po oblouku. Návrh proto vychází z nejnáročnějšího, ale nejčastějšího případu: jednoruční obsluhy palcem.

## Zóny dosahu palce

Při jednoruční obsluze se obrazovka dělí na tři zóny podle pohodlí dosahu palce:

* **Zelená zóna** (pohodlná) — zhruba spodní třetina obrazovky. Palec sem dosáhne bez napětí a bez přehmatu. Sem patří **hlavní navigace** a nejdůležitější **výzvy k akci (CTA)**.
* **Žlutá zóna** (dosažitelná) — střední část. Vyžaduje mírné natažení palce. Vhodná pro obsah a méně frekventované ovládací prvky.
* **Červená zóna** (nepohodlná) — horní rohy, zejména roh na protilehlé straně než držící ruka. Dosáhnout sem znamená přehmátnout úchop nebo zapojit druhou ruku. Vyhrazuje se **destruktivním a vzácným akcím** (smazat, odhlásit), aby se předešlo náhodným klepnutím.

::: viz tama-thumb-zone "Přepni držící ruku a změň úhlopříčku. Zelená zóna se zrcadlí podle ruky; větší telefon zvětšuje červenou zónu, protože oblouk dosahu palce zůstává stejný."
:::

Mapa zón se **zrcadlí podle ruky**: u praváka leží červená zóna v levém horním rohu, u leváka v pravém. Návrh proto raději umisťuje kritické prvky symetricky dolů (do zelené zóny), kde jsou pohodlné pro obě ruce, než do jednoho horního rohu.

## Fittsův zákon

Fittsův zákon je prediktivní model času pohybu k cíli. Říká, že čas potřebný k zasažení cíle roste se **vzdáleností** k němu a klesá s jeho **velikostí**:

::: math
MT = a + b · log₂(D / W + 1)
:::

kde **MT** je čas pohybu, **D** vzdálenost od výchozího bodu k cíli, **W** šířka cíle ve směru pohybu a **a, b** empirické konstanty zařízení/uživatele. Člen log₂(D / W + 1) je **index obtížnosti** (v bitech). Vztah je logaritmický: zdvojnásobení vzdálenosti čas nezdvojnásobí, ale **zvětšení cíle čas spolehlivě zkracuje**.

### Okraj obrazovky: desktop má nekonečné cíle, mobil ne

Na desktopu fungují fyzické okraje obrazovky jako tzv. **„nekonečné cíle"**: prudce hozený kurzor se na hraně zastaví a cíl u okraje nemůže minout — efektivní šířka W je tím prakticky nekonečná, MT klesá k minimu. Proto se na desktop ke krajům umisťují důležité prvky (menu bar nahoře, dock).

Na mobilu tento efekt **neplatí**. Prst se pohybuje ve volném prostoru, displej ho nezastaví, a navíc **prst cíl při dotyku zakrývá** (okluze). Cíl u okraje není „nekonečný" — naopak je hůře viditelný a snadno se mine. Mobilní návrh proto musí garantovat dostatečnou velikost cílů jinak.

::: svg "Desktop: kurzor se zastaví o okraj — cíl u hrany je fakticky „nekonečný". Mobil: prst přejede ve volném prostoru a cíl navíc zakrývá (okluze)."
<svg viewBox="0 0 540 170" xmlns="http://www.w3.org/2000/svg">
  <!-- Desktop -->
  <text x="135" y="16" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Desktop — okraj zastaví kurzor</text>
  <rect x="20" y="26" width="230" height="110" rx="4" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <rect x="20" y="26" width="230" height="20" fill="var(--accent)" fill-opacity="0.18"/>
  <text x="135" y="40" text-anchor="middle" font-size="9.5" fill="var(--text)">cílový pruh u okraje</text>
  <path d="M 120 110 L 30 36" stroke="var(--accent)" stroke-width="1.6" marker-end="url(#fz1)"/>
  <circle cx="120" cy="110" r="3" fill="var(--accent)"/>
  <text x="125" y="124" font-size="9" fill="var(--text-muted)">kurzor narazí a stojí</text>
  <!-- Mobile -->
  <text x="405" y="16" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Mobil — prst přejede + okluze</text>
  <rect x="330" y="26" width="150" height="120" rx="10" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <rect x="346" y="40" width="118" height="22" rx="3" fill="var(--accent)" fill-opacity="0.18" stroke="var(--accent)"/>
  <text x="405" y="55" text-anchor="middle" font-size="9.5" fill="var(--text)">dotykový cíl</text>
  <circle cx="430" cy="51" r="16" fill="var(--text-faint)" fill-opacity="0.55"/>
  <text x="455" y="86" font-size="9" fill="var(--text-muted)">prst zakrývá</text>
  <path d="M 405 120 L 405 70" stroke="var(--text-faint)" stroke-width="1.6" marker-end="url(#fz2)"/>
  <defs>
    <marker id="fz1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="var(--accent)"/></marker>
    <marker id="fz2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="var(--text-faint)"/></marker>
  </defs>
</svg>
:::

## Minimální velikost dotykového cíle

Aby cíl odpovídal velikosti bříška prstu (cca 7–10 mm) a Fittsův člen W byl dostatečný, platforma předepisuje minimální rozměry:

* **iOS (Apple HIG):** doporučená cílová plocha minimálně **44 × 44 pt**.
* **Android (Material Design):** dotykový cíl minimálně **48 × 48 dp** (≈ 9 mm fyzicky bez ohledu na hustotu displeje).

Stejně důležité jako velikost samotného cíle jsou **rozestupy** mezi prvky: i dostatečně velká tlačítka natěsnaná k sobě vedou k překlepům, protože okluze prstu znemožní rozlišit, na které z nich uživatel míří. Vizuální rozměr prvku přitom může být menší než jeho dotyková plocha — tlačítko může vypadat drobně, ale mít okolo sebe „neviditelný" klikací okraj do předepsaných 44 pt / 48 dp.

::: quiz "Proč na desktopu umisťujeme menu k okraji obrazovky, ale na mobilu to neplatí?"
- [x] Okraj desktopové obrazovky zastaví kurzor (W je efektivně nekonečné), kdežto prst na mobilu okraj nezastaví a cíl navíc zakryje.
  > Správně. „Nekonečný cíl" u okraje minimalizuje Fittsův člen MT na desktopu. Prst se ve volném prostoru nezastaví a okluzí cíl zakrývá, takže výhoda okraje na mobilu mizí.
- [ ] Na mobilu je menu u okraje zakázáno operačním systémem.
  > Není zakázáno; jen není ergonomicky výhodné ze stejného důvodu jako na desktopu.
- [ ] Protože mobilní obrazovky nemají okraje.
  > Okraje mají, ale dotykový vstup z nich netěží jako kurzor z hrany monitoru.
:::

::: link "Apple HIG — Layout (tap target ~44 pt)" "https://developer.apple.com/design/human-interface-guidelines/layout"
:::

::: link "Material Design — Accessibility: touch targets (48 dp)" "https://m3.material.io/foundations/designing/structure"
:::

::: link "NN/g — Fitts's Law and Its Applications in UX" "https://www.nngroup.com/articles/fitts-law/"
:::

---

*Zdroj: SZZ NADE — předmět Tvorba aplikací pro mobilní zařízení, VUT FIT. Externí reference: Apple Human Interface Guidelines, Google Material Design, Nielsen Norman Group.*
