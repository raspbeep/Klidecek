---
title: Proces UCD (ISO 9241-210)
---

Norma **ISO 9241-210** (Ergonomie systémové interakce — část 210: Návrh interaktivních systémů zaměřený na člověka) definuje *proces*, kterým se použitelnost a uživatelská zkušenost do produktu skutečně dostanou. Není to jednorázový krok ani fáze na konci vývoje — je to **rámec aktivit**, které se prolínají celým životním cyklem. Norma vznikla revizí staršího ISO 13407 a ponechává jeho jádro: čtyři vzájemně provázané aktivity uspořádané do **iterativního cyklu**.

## Tři principy, na kterých proces stojí

Než se popíší jednotlivé kroky, norma vyžaduje dodržet několik zásad. Tři z nich zkoušející nejčastěji probírá:

* **Iterativnost.** Proces není lineární „od shora dolů". Cyklus se opakuje a vrací do dřívějších aktivit, **dokud nejsou splněny definované cíle použitelnosti**. Iterace se navíc netýká jen evaluace — zpřesňuje se chápání kontextu i požadavků v každém kole.
* **Multidisciplinární tým.** Návrh nevzniká rukou jednoho grafika. Spolupracují designéři, vývojáři, doménoví experti, výzkumníci a samozřejmě zástupci uživatelů — různé perspektivy odhalí různé problémy.
* **Aktivní zapojení uživatelů.** Skuteční uživatelé (ne jen představa o nich) jsou zapojeni od nejranějších fází, ne až při finálním testu. Návrh je explicitně postaven na **pochopení uživatelů, úkolů a prostředí**.

## Aktivity procesu

Norma popisuje čtyři jádrové aktivity; v praxi je obvyklé předřadit jim ještě **plánování**, takže se mluví o 4 až 5 krocích. Po vstupu z plánování se čtyři aktivity zacyklí: kontext → požadavky → designová řešení → evaluace, a evaluace buď cyklus uzavře (cíle splněny), nebo jej vrací zpět.

::: viz uxia-ucd-cyklus "Projděte cyklus krok po kroku. Po první evaluaci nejsou cíle splněny — sledujte, jak se proces vrací zpět a opakuje, dokud návrh nevyhoví."
:::

### Plánování (Plan the human-centred process)

Na začátku se konají schůzky se zúčastněnými stranami (*stakeholdery*). Definují se cíle projektu, zúčastněné strany, rozpočet a **kritéria úspěchu**. Vytváří se plán, jakou roli bude hrát použitelnost a jak se UCD aktivity integrují do celého vývoje. Bez tohoto kroku se snadno stane, že se evaluace dělá „naoko", protože nikdo neví, proti čemu se má měřit.

### Specifikace kontextu použití (Understand and specify the context of use)

Analýza stávající situace: **kdo jsou uživatelé**, jaké úkoly plní, v jakém **prostředí** se nacházejí a jaká mají **omezení**. Tady se nestačí ptát od stolu — sbírají se data v terénu metodami jako **stínování** (*shadowing*, výzkumník nenápadně doprovází uživatele při běžné práci) a **přímé pozorování**. Výstupem je popis kontextu, z něhož vyrostou persony a scénáře.

### Specifikace uživatelských požadavků (Specify the user requirements)

Data z kontextu se převedou do **formálních, inženýrsky testovatelných požadavků** na uživatele a organizaci. Určí se funkce a formy interakce, které uživatelé potřebují, a co je kritériem, že požadavek je splněn. „Systém má být rychlý" není požadavek; „uživatel dokončí objednávku do 90 sekund a bez chyby v 95 % případů" už ano — protože proti tomu lze evaluovat.

### Tvorba designových řešení (Produce design solutions)

Vznikají vizuální a interaktivní koncepty: skici, scénáře a **prototypy** — od nejjednodušších papírových (*low-fidelity*) až po plně funkční modely (*high-fidelity*). Cíleně se začíná levně: čím dřív se chyba odhalí na papírovém prototypu, tím méně stojí oprava.

### Evaluace návrhu (Evaluate the design)

Hotové prototypy nebo celá rozhraní se **testují proti specifikovaným požadavkům** z předchozí aktivity. Toto je rozhodovací bod celého cyklu:

* návrh **splňuje** cíle → cyklus se uzavírá, řešení postupuje dál;
* návrh **nesplňuje** cíle → proces se **vrací** do dřívější aktivity (nejčastěji k požadavkům nebo dokonce ke kontextu) a návrh se zpřesňuje.

Právě tento návrat dělá z UCD iterativní proces. Metodami evaluace se podrobně zabývá [[evaluace-metody]].

## Proč právě iterace (a ne vodopád)

Vodopádový vývoj („naprojektuj jednou, postav jednou") předpokládá, že požadavky známe na začátku přesně. U interaktivních systémů to neplatí — uživatelé sami často nevědí, co potřebují, dokud něco nevyzkouší. Iterativní cyklus mění *riziko*: každé kolo je levná sázka, jejíž výsledek (evaluace) zpřesní zadání pro kolo další. Náklad na opravu chyby roste s tím, jak hluboko ve vývoji se odhalí, takže opakované levné evaluace na prototypech jsou systematicky výhodnější než jedna drahá na konci.

::: quiz "Při evaluaci high-fidelity prototypu se ukáže, že uživatelé nedosahují cílové úspěšnosti úkolu. Co diktuje proces podle ISO 9241-210?"
- [ ] Pokračovat do produkce — prototyp už je téměř hotový, drobnosti se doladí v provozu.
  > To je vodopádové myšlení. Proces je iterativní právě proto, aby se neúspěšná evaluace promítla zpět do návrhu, ne aby se obešla.
- [x] Vrátit se do dřívější aktivity (požadavky / kontext / design), návrh upravit a evaluaci zopakovat.
  > Ano. Evaluace je rozhodovací bod: dokud nejsou splněny cíle použitelnosti, cyklus se vrací a opakuje.
- [ ] Zahodit projekt — neúspěšná evaluace znamená, že koncept je vadný.
  > Neúspěšná evaluace je očekávaný a žádoucí výstup iterace; jejím smyslem je odhalit problém včas a levně, ne projekt ukončit.
:::

::: link "ISO 9241-210:2019 — Human-centred design for interactive systems" "https://www.iso.org/standard/77520.html"
:::

::: link "Interaction Design Foundation — User-Centered Design" "https://www.interaction-design.org/literature/topics/user-centered-design"
:::

---

*Zdroj: SZZ NADE — předmět User Experience a návrh uživatelských rozhraní, VUT FIT. Externí reference: ISO 9241-210:2019, ISO 13407:1999, Interaction Design Foundation.*
