---
title: Enterprise Integration Patterns (směrování)
---

Cestu a pravidla zpracování zpráv uvnitř sběrnice popisují standardizované vzory **Enterprise Integration Patterns (EIP)** — katalog řešení pro spolehlivou výměnu zpráv mezi systémy (Hohpe & Woolf, 2003). Stavějí na zasílání zpráv přes kanály (viz [[mom]]) a kombinují se do integračních tras. Tato sekce probere strukturální vzor *Pipes and Filters* a čtyři klíčové směrovací vzory: router, filtr, splitter a aggregator.

## Pipes and Filters — strukturální základ

Základním stavebním principem je **Pipes and Filters** (roury a filtry): složitý integrační proces se rozloží na řadu malých, **samostatných a nezávislých kroků (filtrů)**, propojených **rourami (kanály/frontami)**. Každý filtr dělá jednu věc, čte z jedné roury a píše do další.

Výhody plynou z nezávislosti kroků: filtry lze **přeskládat, vyměnit nebo škálovat samostatně**, a protože komunikují jen přes roury (zprávy), nemají sdílený stav. Směrovací vzory níže jsou právě takové filtry.

::: svg "Pipes and Filters: nezávislé kroky (filtry) propojené rourami (kanály); každý filtr čte z jedné roury a zapisuje do další."
<svg viewBox="0 0 520 110" font-family="var(--font-mono)" font-size="10">
  <rect x="14" y="40" width="66" height="34" rx="6" fill="oklch(0.62 0.14 264 / 0.14)" stroke="oklch(0.62 0.14 264)"/>
  <text x="47" y="61" text-anchor="middle" fill="var(--text)">filtr A</text>
  <rect x="160" y="40" width="66" height="34" rx="6" fill="oklch(0.62 0.14 142 / 0.14)" stroke="oklch(0.6 0.14 142)"/>
  <text x="193" y="61" text-anchor="middle" fill="var(--text)">filtr B</text>
  <rect x="306" y="40" width="66" height="34" rx="6" fill="oklch(0.7 0.13 90 / 0.16)" stroke="oklch(0.6 0.13 90)"/>
  <text x="339" y="61" text-anchor="middle" fill="var(--text)">filtr C</text>
  <rect x="452" y="40" width="56" height="34" rx="6" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="480" y="61" text-anchor="middle" fill="var(--text-muted)">výstup</text>
  <line x1="80"  y1="57" x2="160" y2="57" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#pf-a)"/>
  <line x1="226" y1="57" x2="306" y2="57" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#pf-a)"/>
  <line x1="372" y1="57" x2="452" y2="57" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#pf-a)"/>
  <text x="120" y="50" text-anchor="middle" font-size="8" fill="var(--text-faint)">roura</text>
  <text x="266" y="50" text-anchor="middle" font-size="8" fill="var(--text-faint)">roura</text>
  <text x="412" y="50" text-anchor="middle" font-size="8" fill="var(--text-faint)">roura</text>
  <defs>
    <marker id="pf-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)"/>
    </marker>
  </defs>
</svg>
:::

## Content-Based Router — směrování podle obsahu

**Content-Based Router** zkoumá **obsah zprávy** — tělo nebo hlavičku (např. druh objednaného zboží) — a podle něj zprávu **přepošle na správný cílový kanál**. Sám zprávu nemění, jen rozhoduje *kam*.

Zásadní je ošetřit situaci **„No-Match"**: zprávu, která neodpovídá žádnému kanálu, nesmí router *tiše zahodit*. Standardním řešením je přesměrovat ji do **Dead Letter Queue (DLQ)** — sběrné fronty pro nedoručitelné/neplatné zprávy. Bez DLQ by neznámá zpráva zmizela bez stopy a chyba by se nedala dohledat. (Souvisí s tím i vzor *Invalid Message Channel* pro syntakticky chybné zprávy.)

## Message Filter — predikát

**Message Filter** je speciální případ routeru s **jediným výstupem**. Vyhodnotí nad zprávou **predikát**: vyhovuje-li, zpráva pokračuje dál; nevyhovuje-li, je **trvale zahozena** (nikam se nepřeposílá). Rozdíl proti routeru: router *vybírá kam*, filtr *rozhoduje zda*.

Typický příklad: před předáním do analytického nástroje odfiltrovat zprávy obsahující osobní údaje (PII). Pozor — zahozená zpráva u filtru je *záměrně* pryč; není to chyba jako No-Match u routeru, takže nemíří do DLQ.

## Splitter a Correlation ID

**Splitter** (rozdělovač) zachytí jednu velkou složenou zprávu a **roztříští ji na několik samostatných**. Příklad: velká objednávka v e-shopu se rozdělí na jednotlivé položky, aby se mohly zpracovat **paralelně** a nezávisle.

Klíčový detail: každá vzniklá zpráva dostane **Correlation ID** — identifikátor odkazující na původní zprávu. Bez něj by později nešlo zjistit, které dílčí výsledky patří k sobě. Correlation ID je most ke vzoru, který rozdělené části zase **spojí**.

## Aggregator — stavové sloučení

**Aggregator** (agregátor) je opakem splitteru: sbírá související zprávy a **slévá je zpět do jedné**. Ze směrovacích vzorů je **nejsložitější, protože je stavový** — musí si udržovat částečně nasbírané zprávy. Návrh agregátoru vyžaduje rozhodnout **tři věci**:

| Rozhodnutí | Otázka | Příklady strategií |
| :--- | :--- | :--- |
| **Korelace** | Které zprávy patří k sobě? | shoda **Correlation ID** |
| **Podmínka kompletnosti** | Kdy je agregace hotová? | *Wait for All* (čekej na všechny / **počet**), *Time Out* (do vypršení **timeoutu**), *First Best*, *Time Out with Override*, externí událost |
| **Strategie kompletace** | Jak těla zpráv reálně spojit? | konkatenace, výpočet souhrnu, výběr nejlepší nabídky |

Podmínka kompletnosti řeší dilema: čekat na **počet** očekávaných zpráv je přesné, ale uvázne, když jedna nikdy nedorazí; **timeout** uvíznutí předejde, ale může agregovat neúplně. Praxe často kombinuje obojí (*Time Out with Override*).

## Řetězení vzorů — objednávka „dovolená"

Vzory se efektivně **řetězí**. Hromadná objednávka (letenka + hotel + auto + …) projde celou tratí: **Splitter** ji rozpadne na samostatné poptávky s Correlation ID, **Content-Based Router** každou nasměruje na API příslušného rezervačního systému (a neznámou položku do DLQ), **Message Filter** vyřadí nerelevantní nabídky a stavový **Aggregator** finální vybrané segmenty podle Correlation ID složí zpět do jediné nabídky a jediné účtenky.

::: viz pdi-eip-chain "Krokuj řetězec na příkladu objednávky: Splitter (Correlation ID #42) → Content-Based Router (No-Match → DLQ) → Message Filter (zahodí spam) → stavový Aggregator (sloučí podle #42 do jedné účtenky)."
:::

::: quiz "Content-Based Router dostane zprávu, která neodpovídá žádnému cílovému kanálu. Jaké je správné chování?"
- [x] Přesměrovat ji do Dead Letter Queue (No-Match), aby šla dohledat.
  > Správně. Tiché zahození by zprávu nenávratně ztratilo a chybu skrylo; DLQ je sběrné místo pro nedoručitelné zprávy.
- [ ] Tiše ji zahodit — pro to je router určen.
  > Ne. Zahazování je práce Message Filtru (záměrné, podle predikátu). U routeru je nenalezení cíle chyba/anomálie, ne běžný odfiltr.
- [ ] Vrátit ji odesílateli jako synchronní chybu.
  > V asynchronním MOM odesílatel už dávno nečeká (synchronizační dekoupling). Anomálie se řeší přes DLQ, ne návratovou hodnotou.
:::

::: quiz "Proč je Aggregator označován za nejsložitější ze směrovacích vzorů?"
- [x] Je stavový — musí držet částečně nasbírané zprávy a rozhodnout korelaci, podmínku kompletnosti a strategii sloučení.
  > Přesně. Router/filtr/splitter zpracují každou zprávu nezávisle (bezstavově); Aggregator naopak akumuluje stav a musí vědět, kdy je „hotovo".
- [ ] Protože jako jediný mění tělo zprávy.
  > Tělo upravují i jiné vzory (translator, content enricher). Náročnost Aggregatoru plyne ze stavu a podmínky kompletnosti, ne z úpravy těla.
- [ ] Protože pracuje synchronně a blokuje odesílatele.
  > Aggregator je naopak typicky asynchronní stavový filtr; blokování s tím nesouvisí.
:::

::: link "Enterprise Integration Patterns — Content-Based Router (Hohpe & Woolf)" "https://www.enterpriseintegrationpatterns.com/patterns/messaging/ContentBasedRouter.html"
:::

::: link "Enterprise Integration Patterns — Aggregator (korelace, podmínka kompletnosti, strategie)" "https://www.enterpriseintegrationpatterns.com/patterns/messaging/Aggregator.html"
:::

::: link "Enterprise Integration Patterns — Splitter & Message Filter" "https://www.enterpriseintegrationpatterns.com/patterns/messaging/Sequencer.html"
:::

---

*Zdroj: SZZ NADE — předmět Prostředí distribuovaných aplikací, VUT FIT. Externí reference: Hohpe, G. & Woolf, B.: Enterprise Integration Patterns (Addison-Wesley, 2003) — Pipes and Filters, Content-Based Router, Message Filter, Splitter, Aggregator, Dead Letter Channel, Correlation Identifier; Apache Camel EIP dokumentace.*
