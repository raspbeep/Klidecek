---
title: Důvěra a reputace — co znamená věřit entitě
---

# Důvěra a reputace

Na Internetu komunikujeme s entitami, které neznáme: posíláme e-mail neznámému serveru, stahujeme software z neznámého zrcadla, navazujeme spojení s neznámým uzlem. **Problém důvěry** je proto globální — týká se provozu, uživatelů i zdrojů: e-maily (spam, podvodné zprávy, phishing), webové služby (podvržené stránky, malware), sdílený software (zavirované soubory) i samotná síťová spojení (botnety, DDoS). Tato kapitola formalizuje, *co je důvěra*, jak se důvěryhodnost pozná, a jak ji lze měřit přes **reputaci** — svědectví ostatních.

## Co je důvěra

> **Důvěra (trust)** = *asymetrická tranzitivní relace* vyjadřující důvěryhodnost či spolehlivost jedné entity vůči druhé.

Relace má dvě strany:

- **Truster (důvěřující)** — entita, která se rozhoduje, zda bude druhé věřit.
- **Trustee (nositel důvěry)** — entita, jejíž důvěryhodnost se posuzuje.

Podstatou důvěry je **tvrzení (assertion)** o nositeli důvěry. Klasický příklad je *banka a úvěr*: banka (truster) se rozhoduje, zda poskytne zákazníkovi (trustee) úvěr, který zákazník splatí.

- Říkáme, že *truster důvěřuje trustee*, pokud **očekává**, že se peníze vrátí.
- Nositel důvěry je **důvěryhodný (trustworthy)**, pokud půjčku skutečně splatí.

Tyto dvě věci nejsou totéž: *důvěra* je očekávání trustera, *důvěryhodnost* je vlastnost trustee. Truster může věřit nedůvěryhodné entitě (a prohloupit) i nevěřit důvěryhodné (a přijít o příležitost).

### Relace je asymetrická a tranzitivní

- **Asymetrie** — to, že Alice věří Bobovi, *neznamená*, že Bob věří Alici.
- **Tranzitivita** — důvěra se přenáší přes prostředníka, ale ne přímo stejně. Rozlišujeme proto dva druhy:

| Druh důvěry | Význam |
| :--- | :--- |
| **Referral trust** (doporučující) | Důvěra v *doporučení* druhé entity — „věřím Alici, *že umí dobře poradit*, komu věřit." |
| **Derived trust** (odvozená) | Důvěra, kterou si truster *odvodí* skrz prostředníka — „protože Alice doporučuje Claire, věřím Claire." |

::: viz pds-trust-relation
:::

Bob nemůže Claire ohodnotit sám (nemá s ní zkušenost). Důvěřuje ale *doporučení* Alice (referral). Z toho si **odvodí** důvěru ke Claire (derived). Bez referral důvěry by řetězec nešel uzavřít — proto se referral a derived důvěra liší.

## Jak se pozná důvěryhodnost — signál

Truster často **nezjistí důvěryhodnost přímo** (nemá historii, nevidí do nositele). Hledá proto vnější *znaky* důvěryhodnosti:

> **Signál** = aktivita nebo vlastnost, kterou důvěryhodná entita splní *levně*, ale jejíž získání je pro nedůvěryhodnou entitu *příliš drahé*.

Dobrý signál je *separující* — odděluje důvěryhodné od nedůvěryhodných právě tím, že náklad na jeho předstírání je pro podvodníka neúnosný. Příklady ze sítí: dlouhá nepřerušená historie validních transakcí, podepsaný certifikát od důvěryhodné CA, ověřená doména s dlouhou registrací.

### Pozor na prospěcháře

> **Prospěchář (opportunist)** = entita, která *není* důvěryhodná, ale **napodobuje znaky důvěryhodnosti** s cílem vylepšit svou (zdánlivou) důvěryhodnost.

Prospěchář cíleně útočí na signály: pokud lze signál získat levně, ztrácí svou separující schopnost a podvodník jej zneužije. Na eBay například dvojice podvodníků vybudovala dobrou reputaci tím, že se *navzájem* hodnotili pozitivně a předtím poctivě prodávali drobnosti — falešný „dobrý profil" pak použili k podvodu s drahým falzem obrazu. Návrh signálů i reputačních systémů proto musí počítat s tím, že protivník bude signály aktivně falšovat.

::: quiz "Co dělá ze 'signálu' dobrý ukazatel důvěryhodnosti?"
- [x] Je levný pro důvěryhodnou entitu, ale drahý (těžko získatelný) pro nedůvěryhodnou.
  > Přesně tak — separující signál odděluje poctivé od podvodníků právě rozdílem nákladu na jeho napodobení.
- [ ] Je viditelný pro každého, kdo si entitu prohlédne.
  > Viditelnost sama nestačí: pokud je signál levný i pro podvodníka, prospěchář ho snadno napodobí.
- [ ] Vydává ho centrální autorita, takže nelze podvrhnout.
  > Ne nutně — důvěra funguje i bez centrální autority (P2P). Podstata signálu je v *asymetrii nákladu*, ne v tom, kdo ho vydává.
:::

## Co je reputace

> **Reputace (reputation)** = znak důvěryhodnosti vyjádřený **svědectvím dalších entit**.

Zatímco signál je vlastnost samotné entity, reputace agreguje *zkušenosti ostatních*. Je to efektivní rozlišující signál — ale platí důležité podmínky:

- Reputace je založená na **historii, zkušenostech a vztazích** — ne na jednorázovém dojmu.
- Reputace **není dokonalý** rozlišující signál (lze ji manipulovat, viz prospěchář).
- Reputace je efektivní, **jen pokud jsou svědectví nezávislá a důvěryhodná**. Pokud se hodnotitelé domluví (kolize) nebo jeden útočník ovládá mnoho identit ([Sybil útok](https://en.wikipedia.org/wiki/Sybil_attack)), svědectví přestanou být nezávislá a reputace se rozpadá.

### Co je potřeba k reputaci

Aby reputace byla použitelná, systém potřebuje čtyři věci:

1. **Vhodné informace** pro měření důvěry a reputace v daném systému.
2. **Metriku** pro výpočet hodnoty reputace (*reputation score* / *risk rating*) — různé algoritmy; hodnocení závisí na aktuální i historické zkušenosti.
3. **Způsob získání a udržování** těchto informací — *centralizovaný* nebo *distribuovaný* reputační systém.
4. **Odolnost vůči manipulaci** — systém musí počítat s prospěcháři a útoky na svědectví.

Konkrétní architektury (centralizovaná vs. distribuovaná) rozebírá [[architektura-reputace]].

::: link "RFC 7070 — An Architecture for Reputation Reporting" "https://www.rfc-editor.org/rfc/rfc7070.html"
:::

::: link "Jøsang, Ismail: The Beta Reputation System (BECC 2002)" "https://people.cs.vt.edu/~irchen/5984/pdf/Josang-BECC02.pdf"
:::

*Zdroj: PDS — přednáška Reputační systémy, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: [RFC 7070 — An Architecture for Reputation Reporting](https://www.rfc-editor.org/rfc/rfc7070.html); Jøsang, A., Ismail, R.: „The Beta Reputation System" (Bled Electronic Commerce Conference 2002); Jøsang, A., Ismail, R., Boyd, C.: „A Survey of Trust and Reputation Systems for Online Service Provision" (Decision Support Systems 43(2), 2007, [DOI 10.1016/j.dss.2005.05.019](https://doi.org/10.1016/j.dss.2005.05.019)).*
