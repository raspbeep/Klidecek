---
title: Strukturní diagramy
---

**Strukturní diagramy** (structure diagrams) zachycují *statickou* stránku systému — z jakých prvků se skládá a jak spolu souvisejí, nezávisle na čase. Specifikace UML 2.5 jich definuje sedm; pro analýzu a návrh informačních systémů jsou klíčové tři: diagram tříd, diagram komponent a diagram nasazení. (Dynamiku — co se v systému *děje v čase* — pokrývají [[diagramy-chovani]].)

## Diagram tříd

Nejdůležitější diagram objektového návrhu. Modeluje **třídy** (abstrakce objektů) a vztahy mezi nimi. Třída se kreslí jako obdélník o **třech oddílech**:

::: svg "Třída = tři oddíly: název, atributy, operace"
<svg viewBox="0 0 260 184" xmlns="http://www.w3.org/2000/svg">
  <rect x="48" y="16" width="164" height="28" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="130" y="35" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">Account</text>
  <rect x="48" y="44" width="164" height="62" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <text x="56" y="62" font-size="11" font-family="ui-monospace, monospace" fill="var(--text-muted)">- id: Long</text>
  <text x="56" y="80" font-size="11" font-family="ui-monospace, monospace" fill="var(--text-muted)">- owner: String</text>
  <text x="56" y="98" font-size="11" font-family="ui-monospace, monospace" fill="var(--text-muted)">- balance: Money</text>
  <rect x="48" y="106" width="164" height="62" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <text x="56" y="124" font-size="11" font-family="ui-monospace, monospace" fill="var(--text-muted)">+ deposit(m): void</text>
  <text x="56" y="142" font-size="11" font-family="ui-monospace, monospace" fill="var(--text-muted)">+ withdraw(m): void</text>
  <text x="56" y="160" font-size="11" font-family="ui-monospace, monospace" fill="var(--text-muted)">+ getBalance(): Money</text>
  <text x="20" y="34" font-size="9.5" fill="var(--text-faint)">název</text>
  <text x="6" y="78" font-size="9.5" fill="var(--text-faint)">atributy</text>
  <text x="2" y="140" font-size="9.5" fill="var(--text-faint)">operace</text>
</svg>
:::

Horní oddíl nese **název** (volitelně se stereotypem), prostřední **atributy**, dolní **operace (metody)**. Znaky viditelnosti před prvkem: `+` public, `-` private, `#` protected, `~` package.

### Vztahy mezi třídami

Čtyři vztahy, které examinátoři zkoušejí nejčastěji, se liší *notací zakončení čáry* i *sémantikou*. Přepínejte mezi nimi:

::: viz ais-uml-class-relations "Přepínej vztah a sleduj, jak se mění zakončení čáry (kosočtverec/trojúhelník) i význam."
:::

* **Asociace** — obecný vztah „zná / používá". Prostá čára, často s **multiplicitou** (kolik instancí se účastní): `1`, `0..1`, `1..*`, `*` (= 0 a více).
* **Agregace** — slabý vztah „celek–část" s **prázdným kosočtvercem u celku**. Část *může existovat nezávisle* na celku (tým–hráč).
* **Kompozice** — silný vztah „celek–část" s **plným kosočtvercem u celku**. Se zánikem celku **zaniká i část** (faktura–řádek). Část patří právě jednomu celku.
* **Generalizace (dědičnost)** — vztah „je-druhem" s **prázdným trojúhelníkem mířícím na předka**. Potomek dědí atributy a operace předka.

> **Past u zkoušky:** kosočtverec se vždy kreslí na straně **celku** (agregátu), ne části. A jediný rozdíl mezi agregací a kompozicí je, *zda část přežije zánik celku* — prázdný kosočtverec = ano, plný = ne.

```text
   Tým ◇──── Hráč        agregace  (hráč přežije rozpuštění týmu)
   Faktura ◆──── Řádek    kompozice (řádek zaniká s fakturou)
   Osoba △──── Zaměstnanec generalizace (Zaměstnanec JE Osoba)
```

## Diagram komponent

Zachycuje **nahraditelné fyzické části softwaru** (moduly, knihovny, služby) a jejich závislosti. Klíčová je komunikace přes **rozhraní**: notace „lízátko a zásuvka" (lollipop & socket) zviditelní, kdo rozhraní *poskytuje* a kdo ho *vyžaduje*.

::: svg "Komponenty komunikují přes poskytované (lízátko ○) a požadované (zásuvka ⊃) rozhraní"
<svg viewBox="0 0 460 150" xmlns="http://www.w3.org/2000/svg">
  <!-- komponenta A: poskytuje -->
  <rect x="24" y="44" width="150" height="62" rx="3" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <rect x="14" y="54" width="16" height="12" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <rect x="14" y="80" width="16" height="12" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="99" y="70" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">«component»</text>
  <text x="99" y="86" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text)">Platby</text>
  <!-- lízátko (poskytované rozhraní) -->
  <line x1="174" y1="75" x2="214" y2="75" stroke="var(--accent)" strokeWidth="1.6"/>
  <circle cx="222" cy="75" r="8" fill="var(--bg-inset)" stroke="var(--accent)" strokeWidth="1.6"/>
  <!-- zásuvka (požadované rozhraní) -->
  <path d="M252 60 A 15 15 0 0 1 252 90" fill="none" stroke="var(--accent)" strokeWidth="1.6"/>
  <line x1="252" y1="75" x2="286" y2="75" stroke="var(--accent)" strokeWidth="1.6"/>
  <!-- komponenta B: vyžaduje -->
  <rect x="286" y="44" width="150" height="62" rx="3" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <rect x="276" y="54" width="16" height="12" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <rect x="276" y="80" width="16" height="12" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="361" y="70" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">«component»</text>
  <text x="361" y="86" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text)">Objednávky</text>
  <text x="230" y="116" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">IPayment</text>
  <text x="99" y="130" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">poskytuje ○ (lízátko)</text>
  <text x="361" y="130" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">vyžaduje ⊃ (zásuvka)</text>
</svg>
:::

**Lízátko** (kolečko na konci čáry, ○) = rozhraní, které komponenta *poskytuje*. **Zásuvka** (polokruh, ⊃) = rozhraní, které komponenta *vyžaduje*. Když zásuvka „zapadne" na lízátko se shodným rozhraním, komponenty jsou propojené (assembly connector). **Port** je pojmenovaný bod na hranici komponenty, přes který interakce prochází — seskupuje poskytovaná i požadovaná rozhraní do jednoho přípojného místa.

## Diagram nasazení

Modeluje **fyzickou topologii** běhu systému: kde co reálně poběží. Dva základní prvky:

* **Uzel (node)** — výpočetní zdroj zakreslený jako **3D kvádr** (krabice). Buď *device* (HW — server, mobil) nebo *execution environment* (běhové prostředí — aplikační server, JVM).
* **Artefakt (artifact)** — konkrétní *nasaditelná část* softwaru, která na uzlu běží (soubor `.war`, `.jar`, kontejner, skript). Kreslí se jako obdélník se stereotypem `«artifact»`. Vztah „artefakt je nasazen na uzel" se značí závislostí `«deploy»` nebo vnořením artefaktu do kvádru.

::: svg "Diagram nasazení: artefakty (.war, schéma) na uzlech (server, DB) spojených komunikační cestou"
<svg viewBox="0 0 480 158" xmlns="http://www.w3.org/2000/svg">
  <!-- uzel 1: app server (3D kvádr) -->
  <path d="M40 50 L40 124 L172 124 L172 50 Z" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <path d="M40 50 L58 36 L190 36 L172 50 Z" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <path d="M172 50 L190 36 L190 110 L172 124 Z" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="106" y="64" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--text)">«device»</text>
  <text x="106" y="79" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--text)">AppServer</text>
  <rect x="58" y="90" width="86" height="26" fill="var(--bg-card)" stroke="var(--accent)"/>
  <text x="101" y="106" text-anchor="middle" font-size="9.5" font-family="ui-monospace, monospace" fill="var(--accent)">app.war</text>
  <!-- spojnice (komunikační cesta) -->
  <line x1="190" y1="80" x2="290" y2="80" stroke="var(--text)" strokeWidth="1.4"/>
  <text x="240" y="73" text-anchor="middle" font-size="9" fill="var(--text-faint)">«TCP/IP»</text>
  <!-- uzel 2: DB -->
  <path d="M290 50 L290 124 L422 124 L422 50 Z" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <path d="M290 50 L308 36 L440 36 L422 50 Z" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <path d="M422 50 L440 36 L440 110 L422 124 Z" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="356" y="64" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--text)">«device»</text>
  <text x="356" y="79" text-anchor="middle" font-size="11.5" font-weight="700" fill="var(--text)">DBServer</text>
  <rect x="308" y="90" width="86" height="26" fill="var(--bg-card)" stroke="var(--accent)"/>
  <text x="351" y="106" text-anchor="middle" font-size="9.5" font-family="ui-monospace, monospace" fill="var(--accent)">schema.sql</text>
  <text x="240" y="146" text-anchor="middle" font-size="9" fill="var(--text-faint)">uzly = kvádry · artefakty = vnořené obdélníky</text>
</svg>
:::

::: quiz "Faktura má řádky; smazáním faktury mají zaniknout i všechny její řádky. Který vztah a notace?"
- [ ] Agregace — prázdný kosočtverec u třídy Řádek.
  > Dvě chyby: agregace značí, že část přežije celek (to nechceme), a kosočtverec patří na stranu *celku* (Faktura), ne části.
- [x] Kompozice — plný kosočtverec u třídy Faktura.
  > Správně. Kompozice = silný „celek–část", se zánikem celku zaniká část; plný kosočtverec se kreslí u celku (Faktura).
- [ ] Generalizace — prázdný trojúhelník mířící na Fakturu.
  > Generalizace je „je-druhem" (dědičnost), ne „má". Řádek není druh Faktury.
:::

::: link "UML Class Diagrams — Association, Aggregation, Composition (uml-diagrams.org)" "https://www.uml-diagrams.org/association.html"
:::

::: link "UML Component Diagrams — provided & required interfaces (uml-diagrams.org)" "https://www.uml-diagrams.org/component-diagrams.html"
:::

::: link "UML Deployment Diagrams — nodes & artifacts (uml-diagrams.org)" "https://www.uml-diagrams.org/deployment-diagrams.html"
:::

---

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: OMG UML 2.5.1, uml-diagrams.org.*
