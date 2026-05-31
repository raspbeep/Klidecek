---
title: Chandy–Lamportův algoritmus
---

Konzistentní řez (viz [[konzistentni-rez]]) je definice toho, *jaký* globální stav je platný. Zbývá otázka *jak* takový stav v běžícím systému skutečně pořídit, když procesy nemají společné hodiny a žádný z nich nevidí celý systém najednou. Klasickou odpovědí je **Chandy–Lamportův algoritmus** (publikovaný 1985 jako *Distributed Snapshots: Determining Global States of Distributed Systems*). Pořídí konzistentní snímek **za běhu, aniž by se systém zastavil** — výpočet pokračuje normálně dál.

## Předpoklady

Algoritmus stojí na třech předpokladech o komunikaci:

* kanály jsou **jednosměrné a spolehlivé** — zprávy se neztrácejí, neduplikují ani nepřeskakují;
* doručování je **FIFO** (*First-In-First-Out*) — zprávy v každém kanálu dorazí v tom pořadí, v jakém byly odeslány;
* během snímkování **nedochází k pádům procesů**.

FIFO je zde naprosto klíčové — je to vlastnost, díky níž bude jeden řídicí znak stačit k oddělení „minulosti“ od „budoucnosti“ na celém kanálu.

## Marker jako oddělovač času

Algoritmus zavádí speciální řídicí zprávu — **marker**. Není to aplikační zpráva; její jediný úkol je posloužit jako *oddělovač* v kanálu. Jakmile proces pořídí svůj lokální snímek, vyšle marker. Díky FIFO platí: každá aplikační zpráva *před* markerem v kanálu patří do **minulosti** odesílatele (byla poslána před snímkem), každá *za* markerem patří do **budoucnosti** (poslána po snímku).

::: math
\underbrace{m_1\ m_2\ m_3}_{\text{minulost (před snímkem)}}\ \big|\!\!\big|\ \text{MARKER}\ \big|\!\!\big|\ \underbrace{m_4\ m_5}_{\text{budoucnost (po snímku)}}
:::

Tím marker přesně vyznačí hranici řezu uvnitř každého kanálu — a právě to umožní splnit podmínky C1 a C2.

## Tři fáze algoritmu

Snímek může zahájit kterýkoli proces (i více najednou). Průběh se dělí na tři fáze.

::: viz pdi-chandy-lamport "Krokuj snímkování. Sleduj, jak iniciátor zaznamená stav a rozešle markery, jak se markery šíří a jak se nahrávají kanály. Vpravo se skládá výsledný snímek."
:::

### 1. Iniciace

Iniciátor provede atomicky tři kroky:

1. **zaznamená svůj lokální stav** $LS_i$;
2. **vyšle marker na všechny své odchozí kanály** — a to *dříve*, než po nich pošle jakoukoli další aplikační zprávu;
3. **začne nahrávat všechny své příchozí kanály**, aby zachytil zprávy, které jsou právě v tranzitu.

### 2. Propagace

Když proces přijme marker na nějakém příchozím kanálu, jeho reakce závisí na tom, zda už v rámci tohoto snímku svůj stav zaznamenal.

**První marker** (proces ještě svůj stav nezaznamenal):

* zaznamená svůj lokální stav $LS_i$;
* stav kanálu, *kterým marker dorazil*, označí jako **prázdný** — všechny zprávy z tohoto kanálu, jež přišly před markerem, totiž proces zpracoval ještě před pořízením svého stavu, takže do tranzitu nepatří;
* rozešle marker na všechny své odchozí kanály;
* začne nahrávat **všechny ostatní** příchozí kanály.

**Opakovaný marker** (proces svůj stav už zaznamenal):

* lokální stav už nemění;
* zastaví nahrávání na kanálu, *kterým tento marker přišel*;
* zaznamenaný stav tohoto kanálu = právě ta množina aplikačních zpráv, které proces přijal od chvíle, kdy pořídil svůj snímek, do okamžiku příchodu markeru. To jsou přesně zprávy, které byly v tranzitu.

### 3. Terminace

Proces s vlastním snímkováním končí, jakmile obdrží marker **ze všech** svých příchozích kanálů — pak má zaznamenaný svůj lokální stav i stav všech příchozích kanálů. Celý algoritmus skončí, když takto zterminují všechny procesy. Zaznamenané lokální stavy a stavy kanálů se mohou poslat centrálnímu monitoru, který je spojí do finálního konzistentního globálního stavu.

| Událost u procesu | Stav procesu | Reakce |
| :--- | :--- | :--- |
| iniciace | zaznamená $LS$ | marker na všechny odchozí kanály, nahrávej příchozí |
| **první** marker (kanál $c$) | zaznamená $LS$ | $SC_c = \emptyset$, marker na odchozí, nahrávej ostatní příchozí |
| **opakovaný** marker (kanál $c$) | beze změny | $SC_c$ = zprávy nahrané na $c$, zastav nahrávání $c$ |
| marker ze všech příchozích | hotovo | lokální terminace, odešli snímek monitoru |

## Proč snímek splňuje C1 a C2

Korektnost plyne ze dvou pravidel — *marker se vysílá ihned po záznamu stavu, před jakoukoli další zprávou* — a z *FIFO* kanálů.

* **C1 (zachycení zpráv z minulosti).** Zpráva odeslaná před snímkem odesílatele je v kanálu *před* markerem. Příjemce ji buď stihl přijmout před svým snímkem (je v jeho $LS_j$), nebo ji nahraje jako zprávu v tranzitu na cestě před markerem (je v $SC_{ij}$). Tak či tak je ve snímku zachycena.
* **C2 (zákaz efektu bez příčiny).** Zpráva odeslaná až po snímku odesílatele jde do kanálu *za* markerem. Díky FIFO marker dorazí k příjemci dřív než tato zpráva, takže nahrávání kanálu je už ukončeno a zpráva se do snímku nedostane — nemůže tedy vzniknout přijetí bez odpovídajícího odeslání.

::: math
\text{FIFO} \ \wedge \ (\text{marker před každou další zprávou}) \ \Rightarrow\ \text{žádná zpráva z budoucnosti nepředběhne marker}
:::

Jinými slovy: marker vždy dorazí k příjemci přesně na rozhraní mezi minulostí a budoucností odesílatele, takže výsledný řez je kauzálně uzavřený.

::: quiz "Proč musí proces vyslat marker na odchozí kanály ještě dříve, než po nich pošle jakoukoli další aplikační zprávu?"
- [x] Aby žádná zpráva odeslaná po snímku nepředběhla marker — díky FIFO tím zaručí splnění C2.
  > Správně. Marker je oddělovač minulost/budoucnost. Kdyby ho předběhla aplikační zpráva z budoucnosti, dorazila by před markerem a byla by chybně nahrána jako tranzit z minulosti.
- [ ] Aby se marker doručil rychleji než aplikační data.
  > O rychlost nejde — kanály jsou FIFO, pořadí je dané pořadím odeslání, ne prioritou. Jde právě o to udržet marker před budoucími zprávami.
- [ ] Aby se snížil počet zpráv v kanálu.
  > Algoritmus počet zpráv neoptimalizuje; jeho cílem je korektní oddělení minulosti od budoucnosti.
:::

V reálných nasazeních se klasický model rozšiřuje o odolnost vůči výpadkům: při ztrátě markeru by se původní algoritmus zablokoval, proto se přidávají potvrzování (acknowledgments), časové limity pro opětovné zaslání a sledování stavu na straně odesílatele. Tyto principy stojí i za moderními variantami — například asynchronní snímkování ve streamovacích systémech (Apache Flink staví na variantě Chandy–Lamport).

::: link "Chandy, K. M., Lamport, L. — Distributed Snapshots: Determining Global States of Distributed Systems (ACM TOCS, 1985)" "https://lamport.azurewebsites.net/pubs/chandy.pdf"
:::

::: link "Chandy–Lamport algorithm — Wikipedia" "https://en.wikipedia.org/wiki/Chandy%E2%80%93Lamport_algorithm"
:::

---

*Zdroj: SZZ NADE — předmět Prostředí distribuovaných aplikací, VUT FIT. Externí reference: Chandy & Lamport (Distributed Snapshots, ACM TOCS 3(1), 1985), Kshemkalyani & Singhal (Distributed Computing, kap. 4), Coulouris et al. (Distributed Systems, 5. vyd., kap. 14.5).*
