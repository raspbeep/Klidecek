---
title: "Sémantická segmentace a U-Net"
---

# Sémantická segmentace a U-Net

[[detekce-rcnn|Detekce objektů]] řekne jen *přibližně* „tady v tomhle obdélníku je auto". **Sémantická segmentace** jde na nejjemnější úroveň: přiřadí **třídu každému jednotlivému pixelu** obrázku. Výstupem není seznam boxů, ale **segmentační mapa** — obrázek stejné velikosti jako vstup, kde má každý pixel nálepku své třídy (silnice, auto, chodec, pozadí).

Rozdíl jedním obrázkem: detekce nakreslí kolem auta obdélník (a v něm zůstane i kus silnice), zatímco segmentace obarví **přesně ty pixely**, které k autu patří, podle jeho obrysu.

::: math
\text{vstup } H \times W \times 3 \;\xrightarrow{\;\text{síť}\;}\; \text{mapa } H \times W \times C \;\xrightarrow{\;\arg\max\;}\; \text{třída pro každý pixel}
:::

kde `C` je počet tříd. Pro každý pixel síť vydá vektor `C` skóre (softmax přes třídy) a vítězná třída je výsledek toho pixelu.

## Sémantická vs. instanční segmentace

Pozor na důležitý rozdíl:

- **Sémantická** segmentace rozlišuje jen **třídy**, ne jednotlivé objekty. Tři auta vedle sebe dostanou všechna stejnou nálepku „auto" — splynou do jedné barevné plochy.
- **Instanční** segmentace navíc odliší **jednotlivé instance**: auto #1, auto #2, auto #3 jako tři samostatné masky. (Typický model: Mask R-CNN, který k Faster R-CNN přidá hlavu predikující masku v každém boxu.)

U-Net, o kterém je zbytek podtématu, řeší **sémantickou** segmentaci.

## Plně konvoluční sítě (FCN)

Klasická klasifikační CNN končí **plně propojenými (fully-connected) vrstvami**, které prostorovou informaci „rozplácnou" do jednoho vektoru — pro segmentaci nepoužitelné, protože potřebujeme výstup tvaru obrázku.

**Plně konvoluční síť (FCN)** fully-connected vrstvy nahradí konvolucemi, takže výstup zůstane **prostorová mapa**. Problém je rozlišení: páteřní CNN obrázek **zmenšuje** (pooling), takže na konci máme hrubou mapu. Tu je třeba zvětšit (**upsampling**) zpět na rozlišení vstupu. Naivní upsampling ale dává **rozmazané hranice** — jemné detaily se při zmenšování ztratily a chybí informace, jak je obnovit. Přesně tohle řeší U-Net.

## U-Net — encoder–decoder se skip spoji

**U-Net** (Ronneberger et al., 2015, původně pro biomedicínské snímky) má charakteristický tvar písmene **U** a skládá se ze dvou symetrických cest:

**Encoder (kontrahující cesta)** — levá větev U. Opakuje bloky `konvoluce → ReLU → max-pooling`. Pooling **půlí prostorové rozlišení** a každý blok zhruba **zdvojnásobuje počet kanálů**. Síť se tu učí **„co je na obraze"** (sémantiku), ale poolingem **ztrácí přesnou polohu** detailů.

**Decoder (expandující cesta)** — pravá větev U. Zrcadlově **zvětšuje rozlišení** zpět pomocí **upsamplingu / transponovaných konvolucí** (učí se, jak zvětšovat). Tady se síť učí **„kde přesně"** objekt je, aby vytvořila ostrou masku.

::: svg "U-Net: encoder vlevo zmenšuje, decoder vpravo zvětšuje, skip spoje (vodorovné šipky) přenášejí detaily z encoderu do decoderu."
<svg viewBox="0 0 300 200">
  <rect width="300" height="200" fill="var(--bg-inset)" />
  <!-- encoder blocks (left, descending) -->
  <rect x="22"  y="24"  width="34" height="20" fill="var(--accent)" opacity="0.85"/>
  <rect x="40"  y="62"  width="28" height="16" fill="var(--accent)" opacity="0.65"/>
  <rect x="56"  y="96"  width="22" height="13" fill="var(--accent)" opacity="0.50"/>
  <rect x="70"  y="126" width="16" height="11" fill="var(--accent)" opacity="0.38"/>
  <!-- bottleneck -->
  <rect x="120" y="150" width="60" height="14" fill="var(--accent-line)" opacity="0.7"/>
  <text x="150" y="180" text-anchor="middle" font-size="8.5" font-family="var(--font-mono)" fill="var(--text-muted)">bottleneck</text>
  <!-- decoder blocks (right, ascending) -->
  <rect x="214" y="126" width="16" height="11" fill="var(--accent)" opacity="0.38"/>
  <rect x="222" y="96"  width="22" height="13" fill="var(--accent)" opacity="0.50"/>
  <rect x="232" y="62"  width="28" height="16" fill="var(--accent)" opacity="0.65"/>
  <rect x="244" y="24"  width="34" height="20" fill="var(--accent)" opacity="0.85"/>
  <!-- down arrows -->
  <g stroke="var(--text-muted)" stroke-width="1.2" fill="none">
    <path d="M48 44 L52 60" marker-end="url(#a)"/>
    <path d="M58 78 L65 94" marker-end="url(#a)"/>
    <path d="M70 109 L76 124" marker-end="url(#a)"/>
    <path d="M85 137 L120 152" marker-end="url(#a)"/>
  </g>
  <!-- up arrows -->
  <g stroke="var(--text-muted)" stroke-width="1.2" fill="none">
    <path d="M180 152 L218 134" marker-end="url(#a)"/>
    <path d="M226 124 L234 109" marker-end="url(#a)"/>
    <path d="M242 94 L249 78" marker-end="url(#a)"/>
    <path d="M256 60 L260 44" marker-end="url(#a)"/>
  </g>
  <!-- skip connections -->
  <g stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="4 3" fill="none">
    <path d="M56 34 L244 34" marker-end="url(#s)"/>
    <path d="M68 70 L232 70" marker-end="url(#s)"/>
    <path d="M78 102 L222 102" marker-end="url(#s)"/>
    <path d="M86 131 L214 131" marker-end="url(#s)"/>
  </g>
  <defs>
    <marker id="a" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
      <path d="M0 0 L6 3 L0 6 z" fill="var(--text-muted)"/>
    </marker>
    <marker id="s" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
      <path d="M0 0 L6 3 L0 6 z" fill="var(--accent)"/>
    </marker>
  </defs>
  <text x="22" y="16" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">encoder ↓ (co)</text>
  <text x="278" y="16" text-anchor="end" font-size="9" font-family="var(--font-mono)" fill="var(--text-faint)">decoder ↑ (kde)</text>
  <text x="150" y="58" text-anchor="middle" font-size="8.5" font-family="var(--font-mono)" fill="var(--accent)">skip spoje (kopie + concat)</text>
</svg>
:::

## Skip spoje — klíč U-Netu

**Skip connections** (přeskakující spoje) jsou srdce U-Netu. Feature mapa z každé úrovně encoderu se **zkopíruje a napojí (konkatenuje)** k odpovídající úrovni decoderu — vodorovné šipky v U.

Proč to je důležité: encoder při poolingu **zahodil jemnou prostorovou informaci** (kde přesně byla hrana). Decoder ji sám nedokáže obnovit z hrubé mapy. Skip spoj mu ji **dodá zpět** přímo z encoderu, kde ještě byla v plném rozlišení. Decoder tak zkombinuje **sémantiku** (z hluboké, zvětšené mapy) s **přesnou polohou** (ze skip spoje).

Výsledkem jsou **ostré hranice objektů**, detailní masky a přesná lokalizace **na úrovni jednotlivých pixelů** — proto U-Net dominuje v medicínské i obecné segmentaci. Bonus: skip spoje vytvoří kratší cestu pro gradient, což usnadní trénink hluboké sítě.

::: quiz "K čemu slouží skip connections v U-Netu?"
- [ ] Zrychlují inferenci tím, že přeskočí část výpočtu
  > Ne — kopírují a konkatenují feature mapy, samy o sobě nic nepřeskakují kvůli rychlosti.
- [x] Přenášejí jemné prostorové detaily z encoderu do decoderu, které pooling jinak ztratil
  > Přesně tak — decoder spojí sémantiku z hloubky s přesnou polohou ze skip spoje, takže masky mají ostré hranice.
- [ ] Nahrazují pooling vrstvy v encoderu
  > Pooling v encoderu zůstává; skip spoj jen kopíruje mapu *před* dalším poolingem do decoderu.
- [ ] Klasifikují celý obrázek do jedné třídy
  > To je klasifikace, ne segmentace. U-Net klasifikuje každý pixel zvlášť.
:::

::: link "Ronneberger et al. — U-Net: Convolutional Networks for Biomedical Image Segmentation (2015)" "https://arxiv.org/abs/1505.04597"
:::

::: link "Long et al. — Fully Convolutional Networks for Semantic Segmentation (2015)" "https://arxiv.org/abs/1411.4038"
:::

---

*Zdroj: KNN státnicové okruhy NMAL, VUT FIT. Externí reference: Ronneberger, O., Fischer, P., Brox, T.: „U-Net: Convolutional Networks for Biomedical Image Segmentation" (MICCAI 2015, [arXiv:1505.04597](https://arxiv.org/abs/1505.04597)); Long, J., Shelhamer, E., Darrell, T.: „Fully Convolutional Networks for Semantic Segmentation" (CVPR 2015, [arXiv:1411.4038](https://arxiv.org/abs/1411.4038)).*
