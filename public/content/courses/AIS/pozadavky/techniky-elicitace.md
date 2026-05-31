---
title: Techniky získávání požadavků
---

Získávání požadavků (*elicitation*) je systematický přístup k objevování, zjišťování a dokumentování potřeb uživatelů a dalších zúčastněných stran. Nejde jen o pasivní zapisování přání: tým aktivně vyhledává požadavky tam, kde si je sami zadavatelé dosud neuvědomili, a zároveň **odhaluje a řeší vzájemně si odporující požadavky** různých skupin. Právě konflikt zájmů — co chce uživatel proti tomu, co chce provozovatel nebo regulátor — je častým zdrojem dosud skrytých požadavků, a proto je jeho včasné odhalení jedním z hlavních cílů elicitace.

Žádná jednotlivá technika nepokryje všechny situace, proto se v praxi kombinují. Volba závisí na počtu a dostupnosti zúčastněných stran, na fázi projektu a na míře nejistoty v zadání.

## Rozhovory (interviews)

Vedení strukturovaných nebo nestrukturovaných diskusí s jednotlivými **zúčastněnými stranami** (*stakeholders*) — uživateli, zadavateli, doménovými experty. Strukturovaný rozhovor postupuje podle připravené sady otázek a je snáze porovnatelný mezi respondenty; nestrukturovaný dává prostor volnému vyprávění a hodí se k objevení neočekávaných potřeb. Rozhovory pomáhají odhalit nové požadavky a vyjasnit protichůdné názory mezi jednotlivci.

## Workshopy

Společná, kolaborativní setkání vývojářů se zákazníky s cílem požadavky přímo *identifikovat a sepsat*. Na rozdíl od série individuálních rozhovorů svádějí workshopy zúčastněné strany dohromady, takže konflikty zájmů se vyjeví okamžitě a lze je řešit v reálném čase za přítomnosti všech stran. *Requirements workshop* je v Unified Process doporučenou technikou právě pro počáteční detailní specifikaci klíčových případů užití.

## Průzkumy (surveys)

Návrh a rozeslání dotazníku je efektivní způsob sběru dat od širší skupiny uživatelů, kterou není možné individuálně zpovídat. Průzkumy se hodí ke kvantitativnímu ověření hypotéz (kolik uživatelů určitou funkci potřebuje), ale samy o sobě hůře odhalují nové, dosud nevyslovené potřeby — bývají proto doplňkem rozhovorů a workshopů.

## Prototypování

Vytvoření ukázkového modelu aplikace, typicky **HTML modelu uživatelského rozhraní** nebo jiného nízkonákladového náčrtu, výrazně zlepšuje komunikaci. Uživatel si na konkrétní, byť nefunkční ukázce udělá hmatatelnou představu a může navrhované řešení validovat mnohem dříve, než vznikne skutečná implementace. Tím se zmenšuje množství pozdějších, drahých změn — chyba odhalená nad prototypem stojí zlomek toho, co by stála po implementaci.

## Persony a mapování cest

Tyto dvě navzájem propojené techniky pocházejí z návrhu zaměřeného na uživatele (UCD). **Persona** je archetypální zástupce reálné skupiny uživatelů definovaný především svými *cíli* — má jméno, roli, kontext, motivace a frustrace. Mapování cesty (*journey mapping*) pak zaznamenává **end-to-end cestu** této persony systémem: jednotlivé kroky, dotykové body a místa, kde naráží na problémy. Tím vývojáři uvažují o reálných cílech a bolestech uživatelů, a nikoli o abstraktním „uživateli".

::: svg "Persona a mapování její cesty: kroky, dotykové body a body bolesti"
<svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="520" height="200" fill="var(--bg-inset)" rx="6"/>
  <!-- persona card -->
  <rect x="14" y="20" width="120" height="160" rx="8" fill="var(--bg-card)" stroke="var(--accent)"/>
  <circle cx="74" cy="58" r="20" fill="oklch(0.62 0.14 264 / 0.25)" stroke="var(--accent)"/>
  <circle cx="74" cy="52" r="7" fill="var(--accent)"/>
  <path d="M58 74 Q74 60 90 74" fill="none" stroke="var(--accent)" stroke-width="2"/>
  <text x="74" y="100" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Persona</text>
  <text x="74" y="120" text-anchor="middle" font-size="10" fill="var(--text-muted)">cíle</text>
  <text x="74" y="135" text-anchor="middle" font-size="10" fill="var(--text-muted)">kontext</text>
  <text x="74" y="150" text-anchor="middle" font-size="10" fill="var(--text-muted)">motivace</text>
  <text x="74" y="165" text-anchor="middle" font-size="10" fill="var(--text-muted)">frustrace</text>
  <!-- journey steps -->
  <g font-size="10.5" font-family="var(--font-mono)">
    <rect x="160" y="62" width="74" height="40" rx="6" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.52 0.13 142)"/>
    <text x="197" y="86" text-anchor="middle" fill="var(--text)">objeví</text>
    <rect x="250" y="62" width="74" height="40" rx="6" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.52 0.13 142)"/>
    <text x="287" y="86" text-anchor="middle" fill="var(--text)">vybere</text>
    <rect x="340" y="62" width="74" height="40" rx="6" fill="oklch(0.62 0.16 22 / 0.20)" stroke="oklch(0.55 0.18 22)"/>
    <text x="377" y="80" text-anchor="middle" fill="var(--text)">zaplatí</text>
    <text x="377" y="95" text-anchor="middle" font-size="9" fill="oklch(0.55 0.18 22)">⚡ bolest</text>
    <rect x="430" y="62" width="74" height="40" rx="6" fill="oklch(0.62 0.14 142 / 0.18)" stroke="oklch(0.52 0.13 142)"/>
    <text x="467" y="86" text-anchor="middle" fill="var(--text)">použije</text>
  </g>
  <!-- arrows -->
  <g stroke="var(--text-muted)" stroke-width="1.4" fill="none" marker-end="url(#jm-arr)">
    <line x1="134" y1="82" x2="156" y2="82"/>
    <line x1="234" y1="82" x2="246" y2="82"/>
    <line x1="324" y1="82" x2="336" y2="82"/>
    <line x1="414" y1="82" x2="426" y2="82"/>
  </g>
  <text x="332" y="40" text-anchor="middle" font-size="11" fill="var(--text-muted)">cesta personou systémem (journey map)</text>
  <text x="332" y="140" text-anchor="middle" font-size="10.5" fill="var(--text-faint)">Bod bolesti v kroku „zaplatí" odhaluje skrytý požadavek na jednodušší platbu.</text>
  <defs>
    <marker id="jm-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

## Porovnání technik

| Technika | Dosah | Silná stránka | Slabina |
|----------|-------|---------------|---------|
| Rozhovor | jednotlivci | hloubka, odhalení skrytých potřeb | časově náročné, subjektivní |
| Workshop | skupina najednou | konflikty se řeší v reálném čase | náročné na organizaci |
| Průzkum | široká skupina | kvantitativní data, škálovatelnost | hůře odhalí nové potřeby |
| Prototypování | uživatelé i tým | hmatatelná validace, levné změny | riziko ulpění na konkrétním designu |
| Persony + cesty | celý tým | empatie, reálné cíle a bolesti | vyžaduje předchozí výzkum uživatelů |

::: quiz "Tři oddělení popsala neslučitelné požadavky na stejnou obrazovku. Která technika je nejvhodnější k odhalení a vyřešení tohoto konfliktu?"
- [x] Společný workshop, který svede všechna oddělení dohromady a umožní konflikt řešit v reálném čase.
  > Správně. Workshop staví konfliktní strany k jednomu stolu, takže rozpory vyplynou najevo hned a lze je společně vyřešit.
- [ ] Rozeslat dotazník a sečíst, které oddělení má většinu.
  > Průzkum konflikt změří, ale nevyřeší — odporující si požadavky je potřeba sladit, ne přehlasovat.
- [ ] Postavit prototyp podle požadavku prvního oddělení.
  > Prototyp pomáhá validovat řešení, ale sám o sobě konflikt mezi stranami nevyřeší.
:::

::: link "Larman — Understanding Requirements: elicitace a workshopy (kap. 5)" "https://sites.cs.ucsb.edu/~mikec/cs48/project/RequirementsLarman.pdf"
:::

::: link "Personas a customer journey mapping v analýze požadavků (přehled)" "https://www.adaptiveus.com/blog/developing-personas"
:::

---

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: C. Larman — Applying UML and Patterns (kap. 5); A. Cooper — The Inmates Are Running the Asylum (persony); standardy návrhu zaměřeného na uživatele (UCD).*
