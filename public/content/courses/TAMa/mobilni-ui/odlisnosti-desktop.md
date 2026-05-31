---
title: Odlišnosti od konvenčních rozhraní
---

Mobilní telefon není „malý počítač". Návrh jeho rozhraní se odvíjí od jiného souboru fyzických, kognitivních a technologických omezení, než na jaká byla zvyklá desktopová rozhraní. Když se vzor z desktopu přenese na mobil beze změny (hustá nabídka, široká tabulka, víceslupcový formulář), naráží přesně na tato omezení. Klíčové rozdíly leží ve **velikosti zobrazovací plochy**, v **interakčním modelu**, v **kontextu použití** a ve **stabilitě připojení**.

## Velikost obrazovky a model oken

Konvenční pracovní stanice nabízí velkou plochu (typicky 24–30") a **víceokenní multitasking**: uživatel rozloží vedle sebe několik překrývajících se oken a přepíná mezi nimi pohledem. Mobil má průměrně 5–7" a v daný okamžik vidí uživatel **jen jedno aktivní okno v popředí**. Veškerý obsah se proto musí vejít do jediné úzké svislé plochy a procházet se posuvem (scroll), nikoli rozkládat do plochy.

Důsledek je tvrdý kompromis o místo: každý pixel zabraný ovládacím prvkem je pixel ubraný obsahu. To je důvod, proč mobilní návrh klade tak velký důraz na poměr obsahu k ovládacím prvkům — viz [[principy-navrhu]].

::: svg "Desktop: velká plocha s více okny vedle sebe. Mobil: jedno úzké okno v popředí, obsah se prochází posuvem."
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Desktop -->
  <text x="150" y="18" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Desktop — 24–30", více oken</text>
  <rect x="20" y="28" width="260" height="150" rx="6" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <rect x="34" y="44" width="130" height="80" rx="4" fill="var(--accent)" fill-opacity="0.12" stroke="var(--accent)"/>
  <rect x="78" y="70" width="130" height="80" rx="4" fill="var(--accent)" fill-opacity="0.18" stroke="var(--accent)"/>
  <rect x="120" y="56" width="130" height="90" rx="4" fill="var(--accent)" fill-opacity="0.10" stroke="var(--accent)"/>
  <text x="150" y="170" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">překrývající se okna, multitasking</text>
  <!-- Mobile -->
  <text x="430" y="18" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Mobil — 5–7", jedno okno</text>
  <rect x="392" y="28" width="76" height="150" rx="10" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <rect x="400" y="40" width="60" height="14" rx="2" fill="var(--accent)" fill-opacity="0.30"/>
  <rect x="400" y="60" width="60" height="40" rx="2" fill="var(--accent)" fill-opacity="0.16"/>
  <rect x="400" y="106" width="60" height="20" rx="2" fill="var(--accent)" fill-opacity="0.12"/>
  <rect x="400" y="132" width="60" height="20" rx="2" fill="var(--accent)" fill-opacity="0.12"/>
  <path d="M 478 70 L 478 140" stroke="var(--text-faint)" stroke-width="1.5" marker-end="url(#scrollA)"/>
  <text x="488" y="108" font-size="9" fill="var(--text-faint)">scroll</text>
  <defs>
    <marker id="scrollA" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,2 L5,9 L10,2" fill="none" stroke="var(--text-faint)" stroke-width="1.5"/>
    </marker>
  </defs>
</svg>
:::

## Interakční model: kurzor vs. nepřesný dotyk

Desktop ovládá uživatel **myší a klávesnicí**. Kurzor je pixelově přesný, má stav „hover" (najetí bez kliknutí), pravé tlačítko, kolečko a dvojí klik — bohatá paleta vstupů. Klávesnice je fyzická, psaní je rychlé.

Na mobilu je primárním vstupem **prst na dotykové ploše**. Prst je nepřesný: jeho dotyková stopa má průměr zhruba 7–10 mm, a navíc **cíl při dotyku zakrývá** (okluze). Tomu se říká problém „tlustého prstu" (*fat finger*). Mizí stav hover (na prst se nedá „najet bez kliknutí"), takže rozhraní nemůže spoléhat na to, že uživatel objeví funkci přejetím myší. Softwarová klávesnice navíc zabírá spodní polovinu obrazovky a psaní je pomalejší a chybovější než na fyzické klávesnici.

Z této nepřesnosti plynou konkrétní pravidla o minimální velikosti dotykových cílů a o jejich rozmístění — to rozebírá [[ergonomie-thumb-zone]].

## Kontext a pozornost

Desktop se používá vsedě, ve stabilním prostředí (kancelář, stůl), v **dlouhých soustředěných relacích**. Mobil nás provází všude — v MHD, ve frontě, za chůze — a pozornost uživatele je proto **fragmentovaná a neustále přerušovaná** (příchozí hovor, zastávka, dění v reálném světě). Průměrná délka jedné relace na mobilu se uvádí kolem **~72 sekund**, oproti zhruba **~150 sekundám** na desktopu (jde o řádové, často citované hodnoty, ne o normu).

| Aspekt | Desktop (konvenční) | Mobil |
|---|---|---|
| Plocha | 24–30", více oken | 5–7", jedno okno v popředí |
| Vstup | kurzor + klávesnice, hover | nepřesný dotyk, žádný hover, okluze |
| Přesnost cíle | pixelová | ~7–10 mm bříško prstu |
| Pozornost | dlouhá, soustředěná | fragmentovaná, přerušovaná |
| Délka relace | ~150 s | ~72 s |
| Připojení | stabilní (kabel / Wi-Fi) | proměnlivé, přechody sítí, výpadky |

Kratší a roztříštěné relace přímo motivují požadavek na **uchování stavu**: aplikace musí umět přerušení přežít a vrátit uživatele tam, kde skončil, bez ztráty rozpracovaných dat.

## Stabilita připojení

Desktop je zpravidla na stabilní drátové nebo silné Wi-Fi síti. Mobil naopak **mění sítě za chodu** (Wi-Fi → mobilní data → tunel bez signálu) a zažívá krátké výpadky. Rozhraní proto nesmí předpokládat, že síť je vždy k dispozici: musí počítat s pomalým či přerušeným připojením, ukládat lokálně, dávat zřetelnou zpětnou vazbu o stavu odesílání a umožnit operaci po obnově sítě dokončit.

::: quiz "Proč nelze na mobilu spoléhat na stav „hover" (najetí bez kliknutí) k objevení funkce?"
- [x] Prst nemá mezistav mezi „nedotýká se" a „klepl" — buď je mimo plochu, nebo už spustil akci.
  > Přesně. Myš umí najet bez kliknutí (hover) a tím odhalit nápovědu či nabídku; prst tento mezistav nemá, takže objevitelnost musí být zajištěna jinak (viditelné prvky, ne skryté reakce na hover).
- [ ] Mobilní prohlížeče hover záměrně blokují kvůli bezpečnosti.
  > Není to bezpečnostní omezení — vyplývá to z fyziky dotykového vstupu, který hover nemá.
- [ ] Hover funguje, jen je pomalý.
  > Na čistě dotykovém vstupu hover stav reálně neexistuje; nelze jej tedy „zrychlit".
:::

::: link "NN/g — Mobile UX: Study Findings" "https://www.nngroup.com/articles/mobile-ux/"
:::

::: link "MDN — Touch events" "https://developer.mozilla.org/en-US/docs/Web/API/Touch_events"
:::

---

*Zdroj: SZZ NADE — předmět Tvorba aplikací pro mobilní zařízení, VUT FIT. Externí reference: Nielsen Norman Group, MDN Web Docs.*
