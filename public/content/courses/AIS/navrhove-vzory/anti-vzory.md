---
title: Návrhové anti-vzory
---

**Anti-vzor** (*anti-pattern*) je opakem návrhového vzoru: běžně se opakující „řešení", které na první pohled vypadá jednoduše a lákavě, ale **dlouhodobě vede ke špatným důsledkům** — neudržitelnému kódu a narůstajícímu technickému dluhu. Termín zpopularizovala kniha *AntiPatterns* (Brown a kol., 1998), která je definuje jako *opakované praktiky, které zprvotně vypadají přínosně, ale výsledné škody převáží nad očekávaným ziskem*.

Význam anti-vzorů je **diagnostický**: stejně jako vzory dávají jméno dobrým řešením, anti-vzory dávají jméno *typickým chybám*. Když je umíme pojmenovat a rozpoznat, slouží jako **varovný signál** — najdeme problém včas, dokud je *refaktoring* (úprava struktury bez změny vnějšího chování) ještě levný. Pojmenovaný problém se v týmu řeší snáz než vágní pocit, že „je to nějak zamotané".

Anti-vzor obvykle porušuje některý ze základních principů dobrého návrhu: **vysokou soudržnost** (*cohesion* — třída dělá jednu věc) a **nízkou provázanost** (*coupling* — třídy na sobě závisí co nejméně).

## God Object (Božský objekt)

Obrovská, nabobtnalá třída s tisíci řádky, která **dělá úplně všechno**: sahá do databáze, řeší uživatelské rozhraní, validace i obchodní logiku najednou. Porušuje **princip jediné odpovědnosti** (*Single Responsibility Principle*) — má nízkou soudržnost a všechno na ni závisí (vysoká provázanost). Důsledek: chybu je extrémně těžké najít, jakákoli změna je riskantní a třída se nedá testovat po částech.

```java
// ❌ God Object — jedna třída řeší vše
public class ApplicationManager {
    public void createUser()      { /* … */ }
    public void saveOrder()       { /* … */ }
    public void sendEmail()       { /* … */ }
    public void generatePdf()     { /* … */ }
    public void connectDatabase() { /* … */ }
}
```

**Refaktoring:** rozdělit odpovědnosti do soudržných tříd, každá s jediným úkolem:

```java
public class UserService    { }
public class OrderService   { }
public class EmailService   { }
public class PdfGenerator   { }
```

::: viz ais-god-object-refactor "Přepínač před/po. Vlevo God Object s pěti odpovědnostmi a vším provázaným; vpravo rozpad do soudržných služeb. Sleduj, jak klesne počet vazeb."
:::

## Spaghetti Code (Špagetový kód)

Kód **bez jakékoli struktury**: tok řízení je „zamotaný", metody se volají přes sebe chaoticky, logické bloky chybí. Změna jedné funkce nečekaně rozbije pět dalších, protože závislosti nejsou vidět. Vzniká typicky rychlým psaním bez plánování a přírůstkovým „lepením" funkcí.

```java
// ❌ jedna metoda míchá nesouvisející kroky a skryté závislosti
public void process() {
    validate();
    connectToDatabase();
    calculatePrice();
    sendEmail();
    generateInvoice();
}
```

**Refaktoring:** rozdělit zodpovědnosti do samostatných tříd se zřetelnými rozhraními a předávat data explicitně (žádný skrytý globální stav):

```java
validator.validate(order);
paymentService.pay(order);
emailService.sendConfirmation(order);
```

## Golden Hammer (Zlaté kladivo)

*„Máš-li jen kladivo, všechno kolem vypadá jako hřebík."* Tým používá jeden **oblíbený nástroj, technologii nebo vzor na úplně všechno**, i tam, kde se zjevně nehodí a existuje jednodušší řešení. Příčinou bývá **neznalost alternativ** a pohodlnost zaběhnutého postupu. Příklad: použít [Singleton](creational-singleton-factory) na každou službu, i když by stačil obyčejný objekt s předanými závislostmi.

```java
// ❌ Golden Hammer — Singleton na vše, i tam, kde nemá být globální stav
UserService.getInstance();
OrderService.getInstance();
EmailService.getInstance();
```

**Refaktoring:** zvolit nástroj podle problému, ne podle zvyku. Místo globálních Singletonů předávat závislosti konstruktorem (*dependency injection*) — objekty pak jdou snadno testovat i nahradit.

## Přehled

| Anti-vzor | Symptom | Porušuje | Náprava (refaktoring) |
|---|---|---|---|
| **God Object** | jedna třída dělá vše | Single Responsibility, soudržnost | rozpad do služeb dle odpovědností |
| **Spaghetti Code** | chaotický tok bez struktury | čitelnost, nízkou provázanost | jasné bloky, explicitní rozhraní |
| **Golden Hammer** | jeden nástroj na vše | „správný nástroj na problém" | volba dle kontextu, DI místo Singletonů |

::: quiz "Proč je užitečné anti-vzory pojmenovat a znát?"
- [x] Slouží jako varovný signál — pojmenovaný problém v kódu včas rozpoznáme a můžeme ho refaktorovat dřív, než naroste technický dluh.
  > Přesně. Anti-vzory dávají jméno typickým chybám; rozpoznání umožní včasnou nápravu a sdílenou řeč v týmu.
- [ ] Protože je máme cíleně používat, když potřebujeme rychlé řešení.
  > Ne. Anti-vzor je špatné řešení; „rychlost teď" se vrátí jako vysoká cena později.
- [ ] Protože nahrazují potřebu znát návrhové vzory.
  > Naopak — anti-vzory se refaktorují *směrem k* dobrým vzorům a principům (SRP, DI, vysoká soudržnost).
:::

::: link "AntiPatterns (Brown a kol., 1998) — přehled na Wikipedii" "https://en.wikipedia.org/wiki/Anti-pattern"
:::

::: link "SourceMaking — AntiPatterns (God Class, Golden Hammer, Spaghetti Code)" "https://sourcemaking.com/antipatterns"
:::

*Zdroj: SZZ NADE — předmět Analýza a návrh informačních systémů, VUT FIT. Externí reference: Brown, Malveau, McCormick, Mowbray — AntiPatterns (1998), SourceMaking, Refactoring.guru.*
