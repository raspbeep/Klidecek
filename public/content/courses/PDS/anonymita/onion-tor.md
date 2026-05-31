---
title: Mixovací sítě, onion routing a Tor
---

# Rozdělená důvěra: nikdo nesmí vidět oba konce

VPN i proxy ([[vpn-proxy]]) selhávají ze stejného důvodu — *jeden* uzel vidí zdroj i cíl. Mixovací sítě a onion routing tento problém řeší **rozdělením důvěry mezi více nezávislých uzlů**: každý uzel zná jen *kousek* trasy, a teprve spiknutí *všech* uzlů by deanonymizovalo uživatele.

## Chaumovy mix sítě (1981)

Základ položil David Chaum prací *„Untraceable Electronic Mail, Return Addresses, and Digital Pseudonyms"* (CACM, 1981). Zavedl **mix** — uzel, který:

- přijme dávku zpráv, *odstraní jednu vrstvu šifrování* (svým privátním klíčem) a přepošle je dál;
- **přeskupí pořadí** a sjednotí velikost zpráv, takže *vstupní* a *výstupní* zprávu nelze spárovat;
- v **kaskádě** (sérii mixů) stačí, aby byl *jediný* mix poctivý, a vazba vstup↔výstup celé kaskády zůstane skrytá.

Z této práce vycházejí tři dodnes používané myšlenky: **onion routing**, **traffic mixing** (přeskupování) a **dummy/cover traffic** (umělý provoz pro nepozorovatelnost).

## Onion routing — vrstvené šifrování

**Onion routing** posílá zprávu přes **kaskádu anonymních proxy/relayů**. Odesílatel zná veřejné klíče všech relayů na trase a zprávu *zabalí do tolika vrstev šifrování, kolik je relayů* — jako cibuli. Pro tři relaye P1, P2, P3 s veřejnými klíči K_P1, K_P2, K_P3:

::: math
C = E(K_{P1},\; E(K_{P2},\; E(K_{P3},\; M)))
:::

Každý relay na cestě **oloupe právě jednu vrstvu** svým privátním klíčem a uvnitř najde adresu *dalšího* uzlu plus zbytek (stále zašifrované) cibule:

- **P1** dešifruje vnější vrstvu → vidí „pošli tohle na P2", ale obsah pro P2/P3 je dál zašifrovaný;
- **P2** dešifruje další vrstvu → vidí „pošli tohle na P3";
- **P3** (poslední, *exit*) dešifruje poslední vrstvu → získá `M` a pošle ho **cíli**.

Klíčová vlastnost: **každý uzel zná jen svého předchůdce a následníka**, nikdy celou cestu. P1 zná odesílatele, ale ne cíl; P3 zná cíl, ale ne odesílatele; P2 nezná ani jedno. Žádný *jednotlivý* uzel tedy nevidí zdroj i cíl současně — přesně to, co VPN nesplní.

::: viz pds-onion-routing "Klikni „další hop" — zpráva putuje relayi a na každém se oloupe jedna šifrovací vrstva. Sleduj, co který uzel ví. Poslední úsek k cíli je nešifrovaný (exit vidí plaintext)!"
:::

### Poslední úsek je nešifrovaný

Pozor na častou pastu: poslední vrstva odhalí *čistou zprávu* `M`. Úsek **mezi exit relayem a cílem** už onion routing *nešifruje* — pokud aplikace nemá vlastní end-to-end šifrování (HTTPS), **exit relay vidí plaintext**. Onion routing zajišťuje *anonymitu trasy*, ne *důvěrnost obsahu* na posledním skoku.

### Return traffic — odpovědi zpět

Jak se k anonymnímu odesílateli vrátí odpověď, když cíl nezná jeho adresu? Odesílatel **nechá na trase klíče**: při sestavení okruhu předá každému relayi materiál, kterým se zpáteční provoz *postupně zabalí* zpět do vrstev. Odpověď tak putuje stejnou kaskádou opačně a každý relay přidá svou vrstvu; rozbalí ji až odesílatel, který jako jediný má všechny privátní klíče.

## Traffic mixing — obrana proti timing útokům

Samotné vrstvené šifrování nestačí: pasivní pozorovatel by mohl *korelovat časování* — „paket vstoupil do P2 v čase t, vystoupil v t+ε" → spáruje vstup s výstupem. Proto mix **přeskupuje pořadí**: pořadí *odchodu* zpráv se *liší* od pořadí *příchodu* (*arrival order ≠ send order*), často s náhodným zpožděním.

::: viz pds-traffic-mixing "Pusť „smíchej" — uzel nasbírá příchozí pakety a vypustí je v jiném pořadí (a s prodlevou). Pozorovatel ztratí časovou korelaci vstup↔výstup. Cenou je latence a potřeba hustého provozu."
:::

Nevýhody mixingu:

- **vyžaduje hustý provoz** — v řídké dávce je málo co míchat, korelace přežije;
- **přidává zpoždění / latenci** — což je v rozporu s interaktivním provozem (web, chat).

To je důvod, proč nízkolatentní sítě jako **Tor** plné mixování *neprovádějí* — volí kompromis ve prospěch použitelnosti.

## Tor — The Onion Router

**Tor** je nejrozšířenější praktická implementace onion routingu (nízkolatentní, pro interaktivní provoz).

### Okruh (circuit) přes tři relaye

Klient sestaví **okruh** (circuit) typicky přes **tři relaye**:

| Relay | Role | Co ví |
| :--- | :--- | :--- |
| **Guard / entry** | první skok | zná *reálnou IP klienta*, ne cíl |
| **Middle** | prostřední skok | nezná ani klienta, ani cíl |
| **Exit** | poslední skok | zná *cíl*, ne klienta; vidí plaintext (nemá-li aplikace vlastní šifrování) |

**Guard** se volí ze stabilní množiny a klient u něj nějakou dobu *zůstává* — to omezuje šanci útočníka, že se časem *náhodou* stane prvním skokem a propojí klienta s provozem. **Žádný jednotlivý relay** nevidí klienta i cíl zároveň; deanonymizace by vyžadovala spolupráci guardu i exitu (a korelaci provozu).

### Directory authorities

Aby klient věděl, *které relaye existují* a jaké mají klíče, udržuje malá množina **directory authorities** podepsaný **konsensus** — seznam relayů, jejich klíčů, vlastností (`Guard`, `Exit`, `Fast`, `Stable`) a vah. Klient si konsensus stáhne a z něj vybírá uzly pro okruh.

### Skryté služby (.onion)

Tor umožňuje i **receiver anonymity** přes **onion services** (skryté služby) s adresou `.onion`. Server svou polohu (IP) nezveřejní:

- služba si zvolí několik **introduction points** (přes vlastní anonymní okruhy) a publikuje *deskriptor* do distribuovaného adresáře (**HSDir**);
- klient deskriptor najde, dohodne se přes introduction point na **rendezvous pointu** a obě strany se k němu připojí *vlastními* tříhopovými okruhy.

Spojení klient↔skrytá služba tak vede přes ~6 relayů (3+3) a **ani jedna strana nezná IP té druhé** — anonymní je odesílatel *i* příjemce.

### K čemu anonymní přístup slouží

Argument „kdo nic nezákonného nedělá, nemá co skrývat" je zavádějící — anonymní přístup využívají:

- **žurnalisté** a jejich zdroje (whistlebloweři);
- aktivisté za **lidská práva** v represivních režimech;
- lidé **obcházející cenzuru** tam, kde není svoboda projevu;
- kdokoliv, kdo se chce vyhnout **„chilling effects"** — sebecenzuře kvůli strachu z dohledu (nepopulární či kontroverzní názory).

::: quiz "Tor šifruje provoz přes tři relaye. Vidí poslední (exit) relay obsah mé komunikace?"
- [ ] Ne — Tor šifruje vrstvami, takže obsah je chráněný po celé cestě až k cíli.
  > Ne. Vrstvené šifrování pokrývá jen cestu *mezi relayi*. Exit relay oloupe poslední vrstvu a úsek exit → cíl je už nešifrovaný — pokud aplikace nemá vlastní HTTPS, **exit vidí plaintext**.
- [x] Ano — pokud aplikace nepoužívá vlastní end-to-end šifrování (HTTPS), exit vidí plaintext.
  > Správně. Tor zajišťuje *anonymitu trasy* (kdo s kým), ne *důvěrnost obsahu* na posledním skoku. Proto se k Toru přidává HTTPS — jinak může škodlivý exit relay obsah číst i měnit.
- [ ] Ano, ale jen guard relay, ne exit.
  > Opačně. Guard zná vaši IP, ale obsah pro něj zůstává zašifrovaný (oloupe jen vnější vrstvu). Plaintext získá až *exit* po oloupání poslední vrstvy.
:::

## Garlic routing — I2P

**Garlic routing** (česky „česnekové směrování"), použité v síti **I2P**, je variantou onion routingu, kde se do jednoho šifrovaného „svazku" (*garlic message*) **sdruží více zpráv** (*cloves* — stroužky) najednou. Bundlování více zpráv dohromady dále ztěžuje analýzu provozu a umožňuje doručit více logických zpráv jediným průchodem. I2P je primárně navrženo jako *uzavřená* anonymní síť (skryté služby uvnitř), zatímco Tor cílí hlavně na *anonymní přístup do otevřeného internetu*.

::: link "Tor Project — A short introduction to Tor (specifikace)" "https://spec.torproject.org/intro/index.html"
:::

::: link "Tor — How do Onion Services work? (.onion, rendezvous, HSDir)" "https://community.torproject.org/onion-services/overview/"
:::

::: link "D. Chaum — Untraceable Electronic Mail, Return Addresses, and Digital Pseudonyms (CACM 1981)" "https://dl.acm.org/doi/10.1145/358549.358563"
:::

::: link "I2P — Garlic Routing and Garlic Terminology" "https://geti2p.net/en/docs/how/garlic-routing"
:::

*Zdroj: PDS — přednáška Anonymity, Ing. Matěj Grégr, Ph.D., FIT VUT v Brně. Externí reference: D. Chaum: „Untraceable Electronic Mail, Return Addresses, and Digital Pseudonyms" (CACM 24(2), 1981, [DOI 10.1145/358549.358563](https://dl.acm.org/doi/10.1145/358549.358563)); R. Dingledine, N. Mathewson, P. Syverson: „Tor: The Second-Generation Onion Router" (USENIX Security 2004); [Tor specifications](https://spec.torproject.org/); [I2P — Garlic Routing](https://geti2p.net/en/docs/how/garlic-routing).*
