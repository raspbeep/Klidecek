---
title: Principy MapReduce
---

**MapReduce** je programovací model a běhový framework pro paralelní zpracování velmi rozsáhlých dat (TB až PB) na clusteru z běžného, levného hardwaru. Vznikl uvnitř Googlu a byl popsán v práci Deana a Ghemawata (*MapReduce: Simplified Data Processing on Large Clusters*, OSDI 2004); jeho open-source realizace v Apache Hadoop pak myšlenku rozšířila do celého oboru zpracování velkých dat.

Klíčová idea je oddělit *co se počítá* od *jak se to distribuuje*. Vývojář napíše pouze dvě čisté funkce — **Map** a **Reduce** — a framework se postará o vše ostatní: rozdělení vstupu, rozvržení úloh na uzly, přesun mezivýsledků po síti, řazení, synchronizaci a zotavení po selhání. Programátor tak nemusí řešit ani jednu řádku síťového či synchronizačního kódu.

## Rozděl a panuj nad páry klíč–hodnota

MapReduce je aplikace strategie *rozděl a panuj* (divide and conquer): velký problém se rozdělí na nezávislé podproblémy (Map), které se vyřeší paralelně, a jejich dílčí výsledky se zkombinují (Reduce). Veškerá data v celém procesu mají jednotný tvar — jsou to **páry `(klíč, hodnota)`**. To je jediný datový kontrakt, který obě funkce sdílejí:

::: math
Map:    (k₁, v₁) → list(k₂, v₂)
Reduce: (k₂, list(v₂)) → list(k₃, v₃)
:::

* **Map** dostane jeden vstupní pár a vyprodukuje 0..N *mezilehlých* (intermediate) párů. Volá se nezávisle nad každým záznamem — proto je *trapně paralelní* (embarrassingly parallel).
* **Reduce** dostane jeden mezilehlý klíč a *seznam* všech hodnot, které k němu byly vyprodukovány libovolným mapperem. Pro každý klíč se Reduce volá nezávisle, takže i agregace běží paralelně.

Mezi Map a Reduce framework provede **shuffle & sort** — přeskupí mezilehlé páry tak, aby všechny hodnoty se stejným klíčem skončily u téhož reduceru. Tato fáze je popsána samostatně v [[mapreduce-faze]].

## Datová lokalita — výpočet za daty, ne data za výpočtem

V clusteru o tisících uzlech je síť nejvzácnější zdroj. Vstupní data jsou navíc obrovská a uložená v blocích rozprostřených po uzlech. Naivní přístup „stáhnout data tam, kde běží program" by zahltil síť. MapReduce proto dělá opak: **plánovač se snaží spustit map task na tom uzlu (nebo aspoň v té racku), kde už příslušný blok dat fyzicky leží.** Program (zkompilovaný map task) je oproti datovému bloku zanedbatelně malý, takže stěhovat se vyplatí kód, ne data.

::: viz pdi-data-locality "Přepni strategii. 'Výpočet za daty' pošle po síti jen malý program k blokům; 'data za výpočtem' tahá celé bloky na jeden uzel a zahltí síť."
:::

Této vlastnosti se říká **datová lokalita** (data locality) a je hlavním důvodem, proč se výpočetní vrstva (MapReduce) a úložná vrstva (distribuovaný souborový systém) nasazují na *tytéž* uzly. Detaily uložení a replikace bloků řeší [[hadoop-spark]].

## Odolnost proti selhání

Na clusteru ze stovek či tisíců komoditních strojů není selhání uzlu výjimka, ale **běžná, očekávaná událost**. Framework je proto postaven na předpokladu, že kdykoli může cokoli spadnout, a musí to ustát bez zásahu programátora. Architektura je typu **master–worker**: jeden řídicí proces (master) přiděluje tasky a sleduje jejich stav, ostatní uzly (workery) tasky vykonávají.

Master dostává od workerů periodické **heartbeaty**. Mechanismy zotavení jsou dva:

* **Re-spuštění při pádu.** Pokud heartbeat od workeru přestane chodit (vyprší timeout), master jej prohlásí za mrtvý a *přeplánuje jeho tasky na zdravé uzly*. Map tasky se musí spustit znovu od začátku — i ty už dokončené — protože jejich mezivýsledky byly uloženy jen lokálně na padlém uzlu a jsou nedostupné. Protože jsou Map i Reduce *deterministické* funkce nad neměnným vstupem, je výsledek re-exekuce identický.
* **Spekulativní exekuce stragglerů.** Některý task může být *pomalý* (straggler), aniž by spadl — třeba kvůli vadnému disku nebo sdílenému zatížení uzlu. Protože celá úloha čeká na poslední task, master ke konci běhu spustí *záložní (spekulativní) kopii* pomalého tasku na jiném uzlu. Task je hotový, jakmile dokončí kterákoli kopie; druhá se zruší. Tím se zkracuje *ocas latence* (tail latency) za cenu několika procent přebytečné práce.

::: viz pdi-fault-tolerance "Vyber scénář (pád uzlu / straggler) a krokuj. Sleduj heartbeaty k masterovi, re-exekuci spadlého tasku a spekulativní záložní kopii."
:::

::: quiz "Proč se při pádu workeru re-spouštějí i ty map tasky, které už na něm doběhly?"
- [x] Jejich mezilehlé výstupy byly uloženy jen lokálně na padlém uzlu a jsou tím nedostupné.
  > Přesně. Map výstup se nepíše do distribuovaného úložiště, ale na lokální disk workeru. Když uzel zmizí, zmizí i tato data, takže task musí proběhnout znovu jinde.
- [ ] Protože Map funkce není deterministická a pokaždé dá jiný výsledek.
  > Naopak — Map a Reduce jsou deterministické, právě to umožňuje bezpečné přepočítání se stejným výsledkem.
- [ ] Protože reducery už ta data zahodily.
  > Reduce ještě nemusel proběhnout; problém je v nedostupnosti lokálních mezivýsledků padlého uzlu, ne v reduceru.
:::

::: quiz "Jaký je rozdíl mezi pádem uzlu a stragglerem z pohledu masteru?"
- [x] Straggler stále žije (heartbeat chodí), jen je pomalý — řeší se spekulativní kopií; padlý uzel neodpovídá a jeho tasky se přeplánují.
  > Správně. Detekce je odlišná (timeout vs. sledování postupu) a reakce také (re-exekuce vs. souběžná záložní kopie).
- [ ] Není rozdíl, oba případy se řeší úplným restartem celé úlohy.
  > MapReduce nikdy nerestartuje celou úlohu — vždy jen dotčené tasky.
- [ ] Straggler se ignoruje, protože nakonec doběhne.
  > Čekání na stragglera by zdržovalo celou úlohu; proto existuje spekulativní exekuce.
:::

::: link "Dean, J., Ghemawat, S.: MapReduce — Simplified Data Processing on Large Clusters (OSDI 2004)" "https://research.google/pubs/pub62/"
:::

::: link "Apache Hadoop — MapReduce Tutorial" "https://hadoop.apache.org/docs/stable/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html"
:::

---

*Zdroj: SZZ NADE — předmět Prostředí distribuovaných aplikací, VUT FIT. Externí reference: Dean, J., Ghemawat, S.: MapReduce — Simplified Data Processing on Large Clusters, OSDI 2004; Apache Hadoop dokumentace.*
