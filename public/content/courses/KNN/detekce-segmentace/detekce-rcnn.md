---
title: "Detekce objektů: R-CNN → Faster R-CNN"
---

# Detekce objektů: R-CNN → Faster R-CNN

Klasifikace obrázku odpoví na otázku „**co** je na obrázku" — jedna třída pro celý snímek. **Detekce objektů** jde dál a řeší dvě věci najednou pro *každý* objekt zvlášť:

- **kde** objekt je — vrátí **bounding box**, tedy obdélník `(x, y, šířka, výška)` kolem objektu (to je úloha *lokalizace*, řešená regresí čtyř čísel),
- **co** to je — přiřadí boxu **třídu** (auto, člověk, pes) plus *confidence* skóre (to je *klasifikace*).

Výstupem detektoru je tedy seznam dvojic *(box, třída + skóre)* — typicky pro jeden snímek desítky boxů. Příklad výstupu: `(box=[34,12,80,140], třída="člověk", skóre=0.93)`.

Historicky se detektory dělí na dvě rodiny. **Two-stage** detektory napřed navrhnou kandidátní oblasti (*region proposals*) a teprve pak je klasifikují — sem patří R-CNN i Faster R-CNN. **One-stage** detektory dělají lokalizaci i klasifikaci v jednom průchodu (YOLO, SSD — o těch je [[detekce-ssd-yolo|další podtéma]]). Two-stage bývají přesnější, one-stage rychlejší.

## R-CNN — region proposals + CNN zvlášť na každém výřezu

**R-CNN** (*Regions with CNN features*, 2014) byl jedním z prvních úspěšných hlubokých detektorů. Myšlenka je přímočará a jde po krocích:

1. **Návrh oblastí.** Externí (ne-naučená) metoda **Selective Search** prohledá obrázek a vrátí asi **2000** kandidátních výřezů — oblastí, které *vypadají* jako objekt (souvislé barvy, textury, hrany).
2. **Warp + CNN.** Každý výřez se ořízne, **deformuje (warp)** na pevnou velikost (227×227) a *samostatně* prožene konvoluční sítí (CNN), která z něj spočítá příznakový vektor.
3. **Klasifikace + zpřesnění boxu.** Nad příznaky rozhodne klasifikátor (v původním R-CNN lineární **SVM**) o třídě a samostatný **lineární regresor boxu** posune a zvětší/zmenší box, aby těsněji obepnul objekt.

Přesnost byla na svou dobu vynikající. Háček je v **rychlosti**: CNN se pouští **2000×** na jeden obrázek (jednou za každý výřez), výřezy se navíc překrývají, takže se tytéž pixely zpracovávají pořád dokola. Jeden snímek se detekoval desítky sekund — nepoužitelné v reálném čase. Selective Search navíc běží na CPU a nelze ho trénovat společně se sítí.

## Fast R-CNN — sdílené příznaky a RoI pooling

**Fast R-CNN** (2015) odstraní hlavní plýtvání: místo aby CNN běžela 2000× na výřezech, proběhne **jen jednou na celém obrázku** a vznikne jediná sdílená **feature mapa** (mřížka příznaků, prostorově odpovídající vstupu).

Region proposals (pořád ze Selective Search) se pak **promítnou na tuto mapu** jako obdélníky. Aby z různě velkých oblastí vznikly příznaky pevné velikosti (klasifikátor potřebuje pevný vstup), použije se **RoI pooling**: oblast na mapě se rozdělí na pevnou mřížku (např. 7×7) a v každé buňce se vezme **maximum** příznaků. Z libovolně velké oblasti tak vždy vypadne tenzor `7×7×kanály`.

::: math
\text{RoI pooling}: \quad \underbrace{(h \times w)}_{\text{libovolná oblast}} \;\longrightarrow\; \underbrace{(7 \times 7)}_{\text{pevný výstup}}
:::

Tyto pevné příznaky jdou do dvou „hlav" naráz: **klasifikační hlavy** (softmax přes třídy + třída *pozadí*) a **regresní hlavy** boxu. Celá síť (kromě Selective Search) se trénuje **end-to-end** jednou ztrátovou funkcí. Výsledek: řádově rychlejší trénink i inference než R-CNN — drahá CNN běží jednou, ne 2000×. **Pořád** ale zbývá pomalý externí Selective Search jako úzké hrdlo.

## Faster R-CNN — Region Proposal Network místo Selective Search

**Faster R-CNN** (2015) udělá poslední krok: nahradí Selective Search malou naučenou sítí **RPN (Region Proposal Network)**, která navrhuje oblasti **přímo z té samé feature mapy**. Tím zmizí externí krok i přenos dat na CPU a *celý* detektor je jedna trénovatelná síť.

RPN přejíždí feature mapu malým **posuvným oknem**. Na každé pozici si představí několik **anchor boxů** — předem definovaných obdélníků různých velikostí a poměrů stran (typicky 3 měřítka × 3 poměry = **9 anchorů** na pozici). Pro každý anchor RPN predikuje dvě věci:

- **objectness skóre** — pravděpodobnost „tady je *nějaký* objekt" (zatím bez určení třídy),
- **4 čísla regrese** — jak posunout a roztáhnout anchor, aby těsně obepnul objekt.

Nejlepší navržené oblasti pak projdou (stejně jako ve Fast R-CNN) RoI poolingem a klasifikační + regresní hlavou, která už určí konkrétní třídu. Celý systém je tedy **dvoustupňový sdílený**: jedna páteřní CNN, nad ní RPN (návrhy) i detekční hlava (klasifikace) sdílejí příznaky.

| Model | Návrh oblastí | CNN běží | Trénink | Rychlost |
|---|---|---|---|---|
| R-CNN | Selective Search | 2000× / snímek | po částech (SVM zvlášť) | velmi pomalá |
| Fast R-CNN | Selective Search | 1× / snímek | end-to-end (mimo SS) | střední |
| Faster R-CNN | **RPN** (v síti) | 1× / snímek | plně end-to-end | rychlá |

## IoU — jak měřit překryv boxů

Abychom poznali, zda predikovaný box „sedí" na objekt, potřebujeme míru překryvu dvou obdélníků. Tou je **IoU (Intersection over Union)** — poměr plochy **průniku** ku ploše **sjednocení**:

::: math
\text{IoU}(A, B) = \frac{\text{plocha}(A \cap B)}{\text{plocha}(A \cup B)} \in [0, 1]
:::

IoU = 1 znamená dokonalý překryv, IoU = 0 žádný společný pixel. Při vyhodnocení se predikce typicky počítá jako **správná**, pokud má s pravdivým boxem `IoU ≥ 0.5`. Stejná míra slouží i v dalším kroku.

## NMS — potlačení duplicitních boxů

Detektor (zvlášť anchor-based) vrátí na jeden objekt často **víc překrývajících se boxů**. **Non-Maximum Suppression (NMS)** je nechá zredukovat na jeden box na objekt. Algoritmus je hladový:

1. Seber všechny boxy jedné třídy, seřaď je podle skóre **od nejvyššího**.
2. Vezmi box s **nejvyšším skóre**, ulož ho do výstupu.
3. Smaž všechny zbylé boxy, které s ním mají **`IoU > práh`** (typicky 0.5) — to jsou jeho duplikáty.
4. Opakuj 2–3 na zbytku, dokud nějaké boxy zbývají.

Výsledkem je jeden „vítězný" box na každý objekt. Pohni v demu níže boxy a sleduj, jak se mění IoU; přepínačem spustíš NMS a uvidíš, který box se potlačí.

::: viz iou-nms "Táhni dva bounding boxy a sleduj jejich IoU (průnik ÷ sjednocení). Přepínačem zapni NMS: box s nižším skóre se potlačí, když je IoU nad prahem (slider)."
:::

::: quiz "Co je hlavní rozdíl mezi Fast R-CNN a Faster R-CNN?"
- [ ] Fast R-CNN je one-stage, Faster R-CNN je two-stage detektor
  > Oba jsou two-stage. Liší se v tom, jak vznikají region proposals.
- [x] Faster R-CNN nahradí externí Selective Search naučenou Region Proposal Network uvnitř sítě
  > Přesně tak — RPN navrhuje oblasti přímo z feature mapy, takže celý detektor je end-to-end trénovatelný a rychlejší.
- [ ] Fast R-CNN nepoužívá CNN, Faster R-CNN ano
  > CNN používají oba. Fast R-CNN ji navíc pouští jen jednou na celém snímku (sdílené příznaky).
- [ ] Faster R-CNN klasifikuje každý pixel zvlášť
  > To je sémantická segmentace (U-Net), ne detekce boxů.
:::

::: link "Girshick et al. — Rich feature hierarchies (R-CNN, 2014)" "https://arxiv.org/abs/1311.2524"
:::

::: link "Girshick — Fast R-CNN (2015)" "https://arxiv.org/abs/1504.08083"
:::

::: link "Ren et al. — Faster R-CNN: Towards Real-Time Object Detection with RPNs (2015)" "https://arxiv.org/abs/1506.01497"
:::

---

*Zdroj: KNN státnicové okruhy NMAL, VUT FIT. Externí reference: Girshick, R. et al.: „Rich Feature Hierarchies for Accurate Object Detection" (CVPR 2014, [arXiv:1311.2524](https://arxiv.org/abs/1311.2524)) — R-CNN; Girshick, R.: „Fast R-CNN" (ICCV 2015, [arXiv:1504.08083](https://arxiv.org/abs/1504.08083)); Ren, S. et al.: „Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks" (NeurIPS 2015, [arXiv:1506.01497](https://arxiv.org/abs/1506.01497)).*
