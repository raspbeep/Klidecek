---
title: VPN a proxy — pseudoanonymita s jediným bodem důvěry
---

# Jak vůbec získat anonymitu

Z [[ip-geolokace]] plyne, že samotné šifrování anonymitu nezajistí — zdroj a cíl zůstávají viditelné. Existuje přehled možných přístupů, jak skutečně rozbít vazbu *zdroj ↔ cíl*:

- **VPN** — šifrovaný tunel k bráně, pod jejíž IP uživatel vystupuje;
- **Proxy** (HTTP, SOCKS) — prostředník, přes kterého teče provoz;
- **Onion / garlic routing** — kaskáda relayů s vrstveným šifrováním ([[onion-tor]]);
- **P2P síť** — provoz „rozpuštěný" mezi mnoha uzly ([[p2p-uvod]]);
- **End-to-end šifrování** — řeší *obsah*, ne anonymitu.

Tato kapitola probere první dva — **VPN a proxy**. Jsou nejjednodušší, nejrozšířenější a typicky nabízené jako „anonymizační" služby — ale jak uvidíme, *skutečnou* anonymitu neposkytují.

## VPN — šifrovaný tunel k bráně

**VPN** (Virtual Private Network) vytvoří mezi uživatelem a *bránou* (VPN gateway) šifrovaný tunel. Veškerý provoz jde tunelem k bráně, ta ho rozbalí a pošle do internetu *svým jménem*. Vlastnosti:

- **ISP nevidí obsah** — vidí jen šifrovaný tunel k bráně, ne cílové služby uvnitř.
- **Uživatel vystupuje pod IP brány** — pro cílové weby vypadá, že přichází z brány (často *v jiné zemi* → „odemčení" geograficky blokovaných služeb).
- **Transparentní pro aplikace** — VPN běží pod nimi (na úrovni rozhraní / routovací tabulky), takže aplikace o ní nemusí vědět.
- **Platba i anonymní** — někteří provideři přijímají i Bitcoin, aby snížili vazbu na platební identitu.

To vše zní jako anonymita — ale není.

### Proč VPN neznamená anonymitu

::: viz pds-vpn-anonymity "Přepni pozorovatele (ISP před bránou / provozovatel brány / pozorovatel za bránou) a sleduj, co každý z nich vidí. Provozovatel brány vidí ZÁROVEŇ zdroj i cíl — to je jediný bod důvěry."
:::

Zásadní problém: **VPN provider zná, kdo se připojil a odkud** — vidí *současně* vaši reálnou (zdrojovou) IP *i* cíl, na který provoz posíláte. Stává se tak **jediným bodem důvěry** (*single point of trust*). Anonymita vůči webu se mění za nutnost *bezvýhradně věřit provideru*, že provoz neloguje a nepředá. Logování přitom mívá ze stejných provozních a právních důvodů jako u ISP ([[ip-geolokace]]).

Z pohledu *pozorovatelů na trase* se situace dělí na dvě poloviny brány:

| Segment | Zdroj | Cíl |
| :--- | :--- | :--- |
| **Před bránou** (uživatel → gateway) | *známý* (reálná IP) | *neznámý* (jen IP brány) |
| **Za bránou** (gateway → internet) | *neznámý* (jen IP brány) | *známý* (cílová služba) |

Žádná *jedna strana trasy* tedy nevidí oba konce — *kromě samotné brány*. Pravá anonymita by vyžadovala, aby **žádný jednotlivý uzel** neviděl zdroj i cíl zároveň. To je přesně to, co řeší onion routing rozdělením důvěry mezi více nezávislých relayů ([[onion-tor]]).

## Proxy server

**Proxy** funguje na podobném principu jako VPN: klient nasměruje provoz na *proxy server*, ten ho přepošle k cíli a odpověď vrátí zpět. Cíl vidí jako zdroj proxy. Typy:

- **HTTP proxy** — pracuje na aplikační vrstvě, rozumí HTTP(S) (často jako forward/CONNECT proxy);
- **SOCKS proxy** — pracuje níž, tuneluje libovolný TCP/UDP provoz, je obsahově „hloupý".

Stejně jako u VPN platí **„no anonymity"**: provozovatel proxy vidí zdroj i cíl. Z hlediska pozorovatelů je obrázek identický — známý zdroj / neznámý cíl *před* proxy, neznámý zdroj / známý cíl *za* proxy. „Anonymní proxy" zdarma jsou navíc rizikové: provozovatel může provoz odposlouchávat, podstrkovat reklamy nebo malware.

### VPN vs proxy — srovnání

| Aspekt | VPN | Proxy |
| :--- | :--- | :--- |
| **Rozsah** | celé zařízení (všechen provoz) | typicky jen daná aplikace/protokol |
| **Šifrování tunelu** | ano (k bráně) | ne nutně (zvlášť HTTP proxy) |
| **Transparentnost** | transparentní pro aplikace | aplikaci je často nutno nastavit |
| **Pracovní vrstva** | síťová / linková (rozhraní) | aplikační (HTTP) nebo session (SOCKS) |
| **Anonymita** | žádná — provider zná zdroj i cíl | žádná — provozovatel zná zdroj i cíl |
| **Bod důvěry** | jeden (provider) | jeden (provozovatel) |

::: quiz "Připojím se přes komerční VPN se servery v jiné zemi. Jsem teď anonymní?"
- [ ] Ano — weby vidí jako zdroj IP brány, takže nikdo nezjistí, kdo jsem.
  > Ne. Cílové weby sice vidí jen IP brány, ale *VPN provider* vidí současně vaši reálnou IP i cíl. Je to jediný bod důvěry — anonymita stojí a padá s tím, že neloguje a nepředá data.
- [x] Ne — VPN provider (a kdokoliv, kdo ho přinutí logovat) vidí zdroj i cíl současně.
  > Správně. VPN přesouvá důvěru z ISP na providera, ale nerozbíjí vazbu zdroj↔cíl globálně. K tomu je potřeba více nezávislých uzlů — onion routing ([[onion-tor]]).
- [ ] Ano, pokud platím Bitcoinem.
  > Anonymní platba jen ztěžuje propojení účtu s identitou. Provozní logy (zdrojová IP, časy, cíle) na úrovni provideru tím nezmizí.
:::

VPN a proxy tedy poskytují *pseudoanonymitu* vůči koncovému webu a soukromí vůči ISP, ale ne anonymitu vůči prostředníkovi. Řešení s **rozdělenou důvěrou** — kde žádný jednotlivý uzel nevidí oba konce — popisuje [[onion-tor]].

::: link "Mozilla VPN — How a VPN works (přehled principu a limitů)" "https://www.mozilla.org/en-US/products/vpn/more/what-is-a-vpn/"
:::

::: link "RFC 1928 — SOCKS Protocol Version 5" "https://www.rfc-editor.org/rfc/rfc1928"
:::

*Zdroj: PDS — přednáška Anonymity, Ing. Matěj Grégr, Ph.D., FIT VUT v Brně. Externí reference: [RFC 1928 — SOCKS5](https://www.rfc-editor.org/rfc/rfc1928); [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446); [Mozilla — What is a VPN](https://www.mozilla.org/en-US/products/vpn/more/what-is-a-vpn/).*
