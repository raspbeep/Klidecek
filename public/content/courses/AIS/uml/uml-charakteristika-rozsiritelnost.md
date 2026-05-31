---
title: Charakteristika UML a rozšiřitelnost
---

**UML (Unified Modeling Language)** je standardní grafický jazyk pro vizualizaci, specifikaci, návrh a dokumentaci softwarových (i nesoftwarových) systémů. Vznikl v polovině 90. let *sjednocením* tří dříve konkurujících objektově orientovaných přístupů: **Boochovy metody**, **OMT** (Object Modeling Technique, J. Rumbaugh) a **OOSE** (Object-Oriented Software Engineering, I. Jacobson). Dnes je spravován jako otevřený standard konsorciem **OMG (Object Management Group)**; aktuální verze je UML 2.5.1.

## UML je notace, ne metodika

Nejčastější zkouškové nedorozumění: UML *neříká*, jaké kroky v projektu dělat, v jakém pořadí ani kdy. Je to **jazyk (notace)** — definuje *slovník* (co je třída, aktér, stav) a *gramatiku* (jak je smět zakreslit), nikoli proces. Otázku „jak vést projekt" řeší **metodika** (RUP, Scrum, Larmanův UP), která UML používá jako vyjadřovací prostředek. UML lze proto kombinovat s libovolnou metodikou.

Stejný diagram navíc může v projektu sloužit ve **třech různých režimech použití** — od neformální skici po zdroj generování kódu:

::: svg "Tři režimy použití UML: náčrt, plán, jazyk"
<svg viewBox="0 0 520 168" xmlns="http://www.w3.org/2000/svg">
  <rect x="14" y="22" width="156" height="124" rx="8" fill="var(--bg-inset)" stroke="var(--accent)"/>
  <text x="92" y="44" text-anchor="middle" font-size="13" font-weight="700" fill="var(--accent)">Náčrt</text>
  <text x="92" y="60" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">sketch</text>
  <text x="92" y="86" text-anchor="middle" font-size="10.5" fill="var(--text)">neúplný, rychlý</text>
  <text x="92" y="103" text-anchor="middle" font-size="10.5" fill="var(--text)">komunikace v týmu</text>
  <text x="92" y="120" text-anchor="middle" font-size="10.5" fill="var(--text)">na tabuli / papír</text>
  <text x="92" y="138" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">selektivní detail</text>

  <rect x="182" y="22" width="156" height="124" rx="8" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <text x="260" y="44" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">Plán</text>
  <text x="260" y="60" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">blueprint</text>
  <text x="260" y="86" text-anchor="middle" font-size="10.5" fill="var(--text)">úplný, detailní</text>
  <text x="260" y="103" text-anchor="middle" font-size="10.5" fill="var(--text)">předloha pro kód</text>
  <text x="260" y="120" text-anchor="middle" font-size="10.5" fill="var(--text)">před implementací</text>
  <text x="260" y="138" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">CASE nástroj</text>

  <rect x="350" y="22" width="156" height="124" rx="8" fill="var(--bg-inset)" stroke="var(--line-strong)"/>
  <text x="428" y="44" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">Jazyk</text>
  <text x="428" y="60" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">programming language</text>
  <text x="428" y="86" text-anchor="middle" font-size="10.5" fill="var(--text)">model = program</text>
  <text x="428" y="103" text-anchor="middle" font-size="10.5" fill="var(--text)">generování kódu</text>
  <text x="428" y="120" text-anchor="middle" font-size="10.5" fill="var(--text)">MDA / MDD</text>
  <text x="428" y="138" text-anchor="middle" font-size="9.5" fill="var(--text-faint)">spustitelný model</text>
</svg>
:::

* **Náčrt (sketch)** — rychlá, neúplná kresba k *prodiskutování* návrhu. Zachytí se jen to podstatné; cílem je domluva, ne úplnost.
* **Plán (blueprint)** — relativně úplný, detailní model jako *předloha* pro programátory; vzniká typicky v CASE nástroji.
* **Jazyk (programming language)** — model je natolik detailní, že z něj lze *generovat spustitelný kód*. Tento režim předpokládá přístup **MDA (Model Driven Architecture)** od OMG, kde je model primárním artefaktem.

## Rozšiřitelnost jazyka

UML je jazyk *pro obecné účely*. Aby ho šlo přizpůsobit konkrétní technologii (např. Jakarta EE, .NET) nebo doméně (zdravotnictví, finance) bez zásahu do samotného **metamodelu** jazyka, nabízí tři tzv. *lehké mechanismy rozšíření* (lightweight extension mechanisms). Slovník i sémantiku rozšiřují „zvenčí", jádro UML zůstává nedotčené.

| Mechanismus | Co rozšiřuje | Zápis | Příklad |
|---|---|---|---|
| **Stereotyp** | slovník — nový druh prvku | guillemets `«…»` | `«entity»`, `«boundary»`, `«controller»` |
| **Označená hodnota** (tagged value) | vlastnosti prvku — metadata | `{klíč = hodnota}` | `{author = "Joe", version = 1.1}` |
| **Omezení** (constraint) | sémantiku — vždy platné pravidlo | `{podmínka}`, často OCL | `{balance >= 0}` |

**Stereotyp** vytváří nový stavební blok odvozený z existujícího (např. třída s významem „hraniční objekt"). Zapisuje se do *lomených (francouzských) uvozovek* `«…»` — pozor, jde o jediné znaky `«` a `»`, ne o dvojici `<<` a `>>`. Stereotypu lze přiřadit i vlastní ikonu.

**Označená hodnota** připojí k prvku dodatečné metadatum jako dvojici klíč–hodnota ve složených závorkách `{author = "Joe"}`. **Omezení** připojí *podmínku, která musí vždy platit* — buď slovně, nebo formálně v jazyce **OCL (Object Constraint Language)**, což je textový dotazovací a omezovací jazyk standardizovaný OMG vedle UML.

```text
                «entity»
            ┌──────────────────┐
            │      Account     │   ← stereotyp v guillemets
            ├──────────────────┤
            │ - balance: Money │
            ├──────────────────┤
            │ + withdraw(m)    │
            └──────────────────┘
              {balance >= 0}        ← omezení (invariant)
              {version = 1.1}       ← označená hodnota
```

### Profily

Soubor souvisejících stereotypů, označených hodnot a omezení se sdružuje do **profilu (UML Profile)** — pojmenovaného balíčku, který UML jako celek přizpůsobí pro určitou platformu nebo doménu. Profil je „dialekt" UML: např. profil pro modelování webových aplikací nebo profil **SysML** pro systémové inženýrství. Diagram profilů je jedním ze strukturních diagramů (viz [[strukturni-diagramy]]) a slouží právě k definici těchto rozšíření.

::: quiz "Která tvrzení o UML je správné?"
- [ ] UML je metodika, která předepisuje pořadí kroků ve vývoji.
  > Ne — to je nejčastější chyba. UML je *notace* (jazyk). Pořadí kroků řeší metodika (RUP, UP, Scrum), která UML používá.
- [x] UML je notace; lze ji použít jako náčrt, plán nebo zdroj generování kódu.
  > Správně. UML definuje slovník a gramatiku, nikoli proces. Tři režimy použití jsou náčrt, plán a (v MDA) programovací jazyk.
- [ ] Rozšíření UML přes stereotypy vyžaduje změnu metamodelu jazyka.
  > Naopak — stereotypy, označené hodnoty a omezení jsou *lehké* mechanismy, které jádro (metamodel) nemění.
:::

::: link "OMG — Unified Modeling Language Specification 2.5.1" "https://www.omg.org/spec/UML/2.5.1/About-UML"
:::

::: link "OMG — Object Constraint Language (OCL)" "https://www.omg.org/spec/OCL/"
:::

::: link "UML 2.5 Diagrams Overview (uml-diagrams.org)" "https://www.uml-diagrams.org/uml-25-diagrams.html"
:::

---

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: OMG UML 2.5.1, OMG OCL, uml-diagrams.org.*
