---
title: "Jednoprůchodové detektory (SSD, YOLO)"
---

# Jednoprůchodové detektory (SSD, YOLO)

Two-stage detektory jako [[detekce-rcnn|Faster R-CNN]] mají dva oddělené kroky: nejdřív síť navrhne kandidátní oblasti, pak je druhá hlava klasifikuje. To je přesné, ale pomalé — pro objekt se počítá „dvakrát".

**One-stage** (jednoprůchodové) detektory tenhle mezikrok vynechají: **v jednom průchodu** sítí naráz určí boxy *i* jejich třídy. Není žádná samostatná fáze region proposals. Zástupci jsou **YOLO** (*You Only Look Once*) a **SSD** (*Single Shot MultiBox Detector*). Cena za rychlost bývá o trochu nižší přesnost, hlavně na malých objektech — proto se hodí do **real-time** aplikací (kamera, robotika, autonomní řízení).

## Mřížka buněk a anchor boxy

Klíčový trik: obrázek se po průchodu páteřní CNN reprezentuje jako **feature mapa**, kterou si představíme jako pravidelnou **mřížku buněk** (např. 7×7 nebo 13×13). Každá buňka „dohlíží" na svou výseč obrazu.

Aby jedna buňka uměla detekovat objekty různých tvarů (ležící pes vs. stojící člověk), přiřadí se jí několik **anchor boxů** (v SSD se jim říká *default boxes*) — předem definovaných obdélníků s různými **poměry stran** a **velikostmi**, vystředěných na buňce. Anchor je jen *šablona*: síť se neučí box od nuly, ale jen **odchylku** od nejbližší vhodné šablony, což trénink výrazně usnadní.

::: svg "Buňka mřížky a její anchor boxy: každý anchor je šablona jiného tvaru."
<svg viewBox="0 0 280 170">
  <rect width="280" height="170" fill="var(--bg-inset)" />
  <!-- grid -->
  <g stroke="var(--line)" stroke-width="1">
    <line x1="40" y1="20" x2="40" y2="150"/>
    <line x1="100" y1="20" x2="100" y2="150"/>
    <line x1="160" y1="20" x2="160" y2="150"/>
    <line x1="220" y1="20" x2="220" y2="150"/>
    <line x1="20" y1="20" x2="240" y2="20"/>
    <line x1="20" y1="63" x2="240" y2="63"/>
    <line x1="20" y1="106" x2="240" y2="106"/>
    <line x1="20" y1="150" x2="240" y2="150"/>
  </g>
  <!-- highlighted cell -->
  <rect x="100" y="63" width="60" height="43" fill="var(--accent)" opacity="0.12" />
  <circle cx="130" cy="84.5" r="2.5" fill="var(--accent)" />
  <!-- anchors centered on the cell -->
  <rect x="106" y="70" width="48" height="29" fill="none" stroke="var(--accent)" stroke-width="1.6"/>
  <rect x="118" y="58" width="24" height="53" fill="none" stroke="var(--accent-line)" stroke-width="1.6" stroke-dasharray="3 2"/>
  <rect x="112" y="68" width="36" height="33" fill="none" stroke="var(--text-muted)" stroke-width="1.4" stroke-dasharray="1 2"/>
  <text x="250" y="40" font-size="9" font-family="var(--font-mono)" fill="var(--text-muted)">anchory</text>
  <text x="250" y="52" font-size="9" font-family="var(--font-mono)" fill="var(--text-muted)">jedné</text>
  <text x="250" y="64" font-size="9" font-family="var(--font-mono)" fill="var(--text-muted)">buňky</text>
  <text x="20" y="14" font-size="9.5" font-family="var(--font-mono)" fill="var(--text-faint)">mřížka feature mapy</text>
</svg>
:::

## Co buňka predikuje v jednom průchodu

Pro **každý anchor v každé buňce** vyplivne síť naráz dvě věci:

- **4 čísla regrese boxu** — posun středu `(Δx, Δy)` a změnu rozměrů `(Δw, Δh)` vůči anchoru (kam a jak ten anchor „dotáhnout"),
- **skóre tříd** — pravděpodobnosti přes všechny třídy *včetně třídy „pozadí"*; pozadí znamená „v tomhle anchoru žádný objekt není".

Pro mřížku `S×S` buněk a `k` anchorů na buňku tak vznikne `S·S·k` predikcí naráz. Velká část z nich vyjde jako „pozadí" a zahodí se.

::: viz anchor-grid "Klikni do mřížky a vyber buňku; přepínej anchory (tvar/velikost) a sleduj, jak se posun a třída predikují právě z této buňky. Ukazatel objectness se mění podle toho, jak dobře anchor sedí na objekt."
:::

## SSD: predikce z více měřítek

YOLO (v základní verzi) dělá všechny predikce z **jediné** mřížky na konci sítě — rychlé, ale malé objekty mu utíkají, protože v hrubé mřížce „zaniknou".

**SSD** přidává **multiscale detekci**: predikuje z **několika feature map různých rozlišení** zároveň. To využívá přirozenou hierarchii CNN:

- **mělčí vrstvy** mají **vysoké rozlišení** (jemná mřížka) → dobře chytají **malé** objekty,
- **hlubší vrstvy** mají **nízké rozlišení** (hrubá mřížka, velký receptive field) → dobře chytají **velké** objekty.

Každá z těchto map má vlastní sadu default boxů. Díky tomu SSD pokrývá široký rozsah velikostí objektů a bývá na malých objektech přesnější než jednoškálové YOLO, přitom zůstává jednoprůchodové a rychlé.

## NMS na výstupu — pořád potřeba

Mřížka × anchory generuje na jeden objekt **mnoho překrývajících se boxů** (sousední buňky i různé anchory ho „vidí" zároveň). Proto i one-stage detektory nakonec proženou kandidáty přes **Non-Max Suppression** — pro každou třídu nechají box s nejvyšším skóre a potlačí ty, které s ním mají `IoU > práh`. NMS je tedy společný **postprocessing** pro two-stage i one-stage detektory (princip viz [[detekce-rcnn|R-CNN podtéma]]).

| | Two-stage (Faster R-CNN) | One-stage (YOLO, SSD) |
|---|---|---|
| Proposals | zvlášť (RPN), pak klasifikace | žádné — vše naráz |
| Průchody | dva (návrh + klasifikace) | jeden |
| Rychlost | nižší | vysoká (real-time) |
| Přesnost | vyšší | o něco nižší (hlavně malé objekty) |
| Výstupní NMS | ano | ano |

::: quiz "Proč potřebují i jednoprůchodové detektory (YOLO, SSD) na výstupu Non-Max Suppression?"
- [ ] Protože nepoužívají anchor boxy a musí boxy dopočítat
  > Naopak — anchory používají (SSD jim říká default boxes). NMS s tím nesouvisí.
- [x] Protože mřížka × anchory vygeneruje na jeden objekt mnoho překrývajících se boxů, NMS je zredukuje na jeden
  > Ano — sousední buňky i různé anchory detekují tentýž objekt; NMS nechá box s nejvyšším skóre a potlačí jeho duplikáty s vysokým IoU.
- [ ] Aby se obrázek převedl do mřížky buněk
  > Mřížka vzniká už uvnitř sítě (feature mapa), ne v NMS.
- [ ] Aby klasifikovaly každý pixel
  > To je sémantická segmentace, ne detekce boxů.
:::

::: link "Liu et al. — SSD: Single Shot MultiBox Detector (2016)" "https://arxiv.org/abs/1512.02325"
:::

::: link "Redmon et al. — You Only Look Once: Unified, Real-Time Object Detection (YOLO, 2016)" "https://arxiv.org/abs/1506.02640"
:::

---

*Zdroj: KNN státnicové okruhy NMAL, VUT FIT. Externí reference: Liu, W. et al.: „SSD: Single Shot MultiBox Detector" (ECCV 2016, [arXiv:1512.02325](https://arxiv.org/abs/1512.02325)); Redmon, J. et al.: „You Only Look Once: Unified, Real-Time Object Detection" (CVPR 2016, [arXiv:1506.02640](https://arxiv.org/abs/1506.02640)).*
