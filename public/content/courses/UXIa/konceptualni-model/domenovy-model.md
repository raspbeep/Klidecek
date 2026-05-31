---
title: Konceptuální / doménový model
---

**Konceptuální model** (též *deskriptivní model*) je zjednodušený popis té části reálného světa, kterou aplikace nebo služba řeší — tzv. **problémové domény**. Není to návrh kódu ani databáze; je to dohoda o tom, *co* věci znamenají. Jeho úkolem je vyjádřit přesný **význam termínů a jejich vztahů**, sjednotit jazyk vývojářů, doménových expertů a uživatelů a tím eliminovat riziko, že každý si stejný požadavek vyloží jinak.

Klíčová vlastnost je **nezávislost na technologii**. Model se tvoří dřív, než padne rozhodnutí o platformě, databázovém systému, frameworku či síťové infrastruktuře — a tato rozhodnutí do něj nesmí prosakovat. Když do konceptuálního modelu pronikne pojem jako *tabulka*, *REST endpoint* nebo *index*, model přestal popisovat doménu a začal popisovat řešení.

## Doménový model v objektové analýze

V objektově orientované analýze (OOA) je typickou realizací konceptuálního modelu **doménový model**. Vizuálně reprezentuje entity z reálného světa — *konceptuální třídy* jako Zákazník, Objednávka, Produkt — a na rozdíl od čistě datového modelu k nim přiřazuje i **chování a byznys logiku**, ne jen statická data. Objekt tedy v sobě nese atributy *i* odpovědnosti.

::: svg "Konceptuální třída = data + chování, nezávislá na implementaci"
<svg viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="200" height="140" rx="8" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5"/>
  <line x1="20" y1="50" x2="220" y2="50" stroke="var(--accent)" strokeWidth="1.5"/>
  <line x1="20" y1="110" x2="220" y2="110" stroke="var(--line)" strokeWidth="1"/>
  <text x="120" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">Objednávka</text>
  <text x="34" y="68" fontSize="12" fill="var(--text-muted)">datum: Datum</text>
  <text x="34" y="86" fontSize="12" fill="var(--text-muted)">stav: StavObj</text>
  <text x="34" y="104" fontSize="12" fill="var(--text-muted)">položky: [..]</text>
  <text x="34" y="130" fontSize="12" fill="var(--accent)">celkováCena()</text>
  <text x="34" y="148" fontSize="12" fill="var(--accent)">potvrď()</text>
  <text x="300" y="46" fontSize="12.5" fontWeight="600" fill="var(--text)">horní pruh = atributy (data)</text>
  <text x="300" y="100" fontSize="12.5" fontWeight="600" fill="var(--text)">dolní pruh = chování</text>
  <text x="300" y="118" fontSize="11.5" fill="var(--text-muted)">(byznys logika, odpovědnosti)</text>
  <text x="300" y="150" fontSize="11.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">žádný SQL, žádný framework</text>
</svg>
:::

## Místo v MDA — model je první vrstva, ne poslední

Pro vizuální zápis je standardem jazyk **UML** (Unified Modeling Language). V přístupu **MDA** (Model-Driven Architecture organizace OMG) tvoří konceptuální model úplně první úroveň abstrakce zvanou **CIM** (Computation Independent Model) — popisuje systém *konceptuálně*, spojuje požadavky a doménu a modeluje, jak systém interaguje se svým okolím, bez jakékoli zmínky o výpočtu.

Na CIM navazují postupně konkrétnější modely. Smysl rozvrstvení je, že rozhodnutí o technologii se odkládají co nejdéle a každá vrstva přidá právě jednu úroveň detailu:

| Úroveň | Otázka, na kterou odpovídá | Závisí na… |
|--------|----------------------------|------------|
| **CIM** | *Co* je doména a co od systému okolí potřebuje? | na ničem technickém |
| **PIM** | *Jak* systém funguje uvnitř (logika, struktura)? | nezávislý na platformě |
| **PSM** | *Čím* se to implementuje (konkrétní platforma)? | vázaný na platformu |

CIM je tedy „slovník a pravidla domény", PIM „logický návrh" a PSM „implementační model" pro zvolenou technologii.

## Dva pohledy: statický a dynamický

Úplný návrh funkčnosti musí vždy pokrýt **dva základní pohledy** — strukturu *i* chování. Žádný z nich sám o sobě nestačí: statický pohled neřekne, *kdy* a *v jakém pořadí* se věci dějí; dynamický pohled neřekne, *z čeho* je systém složen.

| Pohled | Co zachycuje | Typické UML diagramy |
|--------|--------------|----------------------|
| **Statický (strukturní)** | strukturální uspořádání systému, z čeho se skládá | diagram tříd (konceptuální třídy, atributy, asociace), diagram objektů, diagram balíčků, diagram komponent |
| **Dynamický (behaviorální)** | chování a interakce v čase | diagram případů užití (funkční požadavky z pohledu aktérů), sekvenční diagram (časová posloupnost zpráv), diagram aktivit (algoritmy, byznys procesy), stavový diagram (životní cyklus objektu, reakce na události) |

Mezi pohledy existuje vazba: aktér a případ užití z dynamického pohledu se musí promítnout do konceptuálních tříd statického pohledu, jinak je model nekonzistentní.

::: quiz "Do konceptuálního (doménového) modelu omylem přidáte třídu `OrderRepository` s metodou `save()` mapující na SQL tabulku. Co je na tom špatně?"
- [x] Porušuje nezávislost na technologii — `Repository`/`save()`/SQL jsou pojmy řešení, ne domény.
  > Přesně. Konceptuální model (CIM) popisuje *co* doména znamená; perzistence a tabulky patří až do PSM. Doménová třída je `Objednávka`, ne její ukládací mechanismus.
- [ ] Nic — repozitář je přece doménová entita.
  > Repozitář je vzor pro přístup k datům, tedy implementační rozhodnutí. V doméně „objednávky" žádný repozitář neexistuje.
- [ ] Chyba je jen v názvu, stačí ho přeložit do češtiny.
  > Problém není jazyk, ale úroveň abstrakce: zaváníte technologickým detailem do modelu, který má být na technologii nezávislý.
:::

## Postup návrhu v pěti iteračních krocích

Konceptuální model nevzniká jedním tahem — buduje se iterativně a po validaci se vrací a upravuje. Následující stepper provede pěti kroky a ukazuje, jak se mezi nimi cyklí.

::: viz uxi-domain-iterace "Projděte pěti iteračními kroky návrhu doménového modelu. Po validaci se postup vrací k refaktorizaci a znovu."
:::

První dva kroky často využijí jednoduchou jazykovou heuristiku: **podstatná jména** v požadavcích jsou kandidáti na konceptuální třídy a atributy, **slovesa** na asociace a operace. Cílem prvního kroku je vybrat optimálně **5–10 klíčových entit** — víc znamená, že model míchá různé úrovni abstrakce a je třeba ho rozdělit.

Při dokumentaci pravidel je nutné striktně oddělit **pevná technická omezení** (např. „identifikátor je celé číslo") od **flexibilních byznys pravidel** (např. „sleva platí jen pro registrované"). Záměna obojího vede k modelu, který se buď nedá změnit, nebo se mění při každém rozmaru.

::: link "OMG — MDA Guide rev. 2.0 (CIM / PIM / PSM)" "https://www.omg.org/cgi-bin/doc?ormsc/14-06-01"
:::

::: link "Model-driven architecture — přehled (Wikipedia)" "https://en.wikipedia.org/wiki/Model-driven_architecture"
:::

::: link "UML — oficiální specifikace (OMG)" "https://www.omg.org/spec/UML/"
:::

---

*Zdroj: SZZ NADE — předmět UXIa (User Experience a návrh uživatelských rozhraní), VUT FIT. Externí reference: OMG MDA Guide, OMG UML Specification, Larman — Applying UML and Patterns.*
