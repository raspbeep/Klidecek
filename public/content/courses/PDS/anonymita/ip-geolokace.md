---
title: IP adresa, alokace a geolokace
---

# IP adresa jako globální identifikátor

IP adresa je **globálně unikátní identifikátor** a *vstupní bod* uživatele do sítě — jakýkoliv jeho provoz nese tuto adresu jako zdroj. To z ní dělá nejcennější jednotlivý údaj pro deanonymizaci. Z IP adresy lze odvodit:

- **ISP** (poskytovatele připojení) — přes registrační databáze (viz níže);
- **zemi a město** — *geolokace* podle alokačních záznamů a měření latencí;
- **prohlížeč a OS** — ne přímo z adresy, ale z *doprovodných informací*, které klient k požadavku přibalí (User-Agent, referer, jazyk — viz [[identifikace-uzivatele]]).

Typický „what is my IP" web tak zobrazí nejen adresu, ale i ISP (např. *Brno University of Technology*), zemi (CZ), kraj, město, časové pásmo, prohlížeč, OS, rozlišení a referer — vše odvozené z jediného připojení.

## Alokace adres: IANA → RIR → LIR → ISP

Adresní prostor se nepřiděluje náhodně. Existuje **hierarchie autorit**, díky které lze z bloku adres dohledat odpovědnou organizaci:

::: viz pds-ip-allocation "Klikni na úroveň hierarchie (IANA → RIR → LIR → ISP → uživatel) — zvýrazní se její role a co o adrese ví. Vpravo se rozsvítí odpovídající whois pole."
:::

1. **IANA** (Internet Assigned Numbers Authority) — spravuje celý adresní prostor a přiděluje velké bloky regionálním registrům.
2. **RIR** (Regional Internet Registry) — pět regionálních registrů pokrývá svět:

| RIR | Region |
| :--- | :--- |
| **ARIN** | Severní Amerika |
| **RIPE NCC** | Evropa, Blízký východ, část Asie |
| **APNIC** | Asie a Pacifik |
| **AfriNIC** | Afrika |
| **LACNIC** | Latinská Amerika a Karibik |

3. **LIR** (Local Internet Registry) — typicky velký ISP, který od RIR dostává adresní bloky a dál je rozděluje.
4. **ISP** — koncový poskytovatel, který přiděluje adresy uživatelům.

### Whois databáze

Každý RIR vede veřejnou **whois** databázi. Dotaz na IP vrátí strukturované záznamy, ze kterých lze zjistit držitele bloku, zemi i autonomní systém:

```text
inetnum:   147.229.0.0 - 147.229.255.255
netname:   VUTBR-TCZ
descr:     Brno University of Technology
country:   CZ
status:    ASSIGNED PI
mnt-by:    VUTBR-MNT
source:    RIPE # Filtered

route:     147.229.0.0/16
origin:    AS197451
```

Klíčová pole: **`inetnum`** (rozsah adres), **`netname`** a `descr` (kdo blok drží), **`country`**, **`route`** (oznamovaný prefix) a **`origin`** (číslo autonomního systému, který prefix v BGP inzeruje). Z whois tedy zjistíme *organizaci a zemi* — ne ale konkrétního uživatele uvnitř sítě.

## Přidělení adresy konkrétnímu uživateli

Whois končí u ISP. *Kdo* uvnitř sítě měl adresu v daný okamžik, ví jen ISP — z protokolů, kterými adresu přiděluje.

### IPv4 — DHCP a PPPoE

U IPv4 se adresa typicky přiděluje dynamicky:

- **DHCP** — čtyřkrokový handshake DISCOVER → OFFER → REQUEST → ACK. Server si zaznamenává **MAC adresu** klienta, přidělenou adresu a *lease time*. V přístupových sítích bývá zapnuta **DHCP option 82** (*relay agent information*), která doplní *fyzický port / okruh*, ze kterého žádost přišla — tedy přesně identifikuje přípojku.
- **PPPoE** — *PPP over Ethernet* (typické pro xDSL): klient se autentizuje **uživatelským jménem**, takže ISP přímo páruje *username ↔ přidělená adresa ↔ čas*.

ISP si tedy v obou případech ukládá dvojici *„kdo (MAC / port / username) měl jakou adresu a kdy"*.

### IPv6 — Router Advertisement a SLAAC

U IPv6 se adresa typicky netvoří přes server, ale **bezstavově (SLAAC)**:

1. Router posílá **Router Advertisement (RA)** s *prefixem* (např. `/64`) a příznakem `A=1` (autonomní konfigurace).
2. Klient si k prefixu sám doplní **interface identifier** a vznikne mu globální adresa.

Pro ISP to znamená, že *prefix* je dohledatelný stejně jako u IPv4 (přidělen přípojce), ale *konkrétní adresa* uvnitř `/64` je volena klientem — proto je u IPv6 (zejména v metro Ethernet sítích) dohledání *konkrétní* adresy o něco *problematičtější*. Prefix ale zúží okruh na jednu přípojku.

## ISP tyto údaje drží téměř vždy

Klíčový poznatek pro anonymitu: **ISP uchovává mapování „uživatel ↔ adresa ↔ čas" téměř vždy, i bez legislativy o data retention.** Důvody jsou ryze provozní:

- **tracing** — řešení provozních problémů, stížností, zneužití (abuse) z dané adresy;
- **billing** — účtování provozu a služeb.

Data retention tyto záznamy pouze *prodlužuje a formalizuje*. Pro pozorovatele uvnitř infrastruktury (a tím spíš pro ISP) je tak běžný uživatel plně dohledatelný.

::: quiz "Když všechen provoz zašifruji (HTTPS, VPN tunel po obsahové stránce), jsem na síti anonymní?"
- [ ] Ano — pokud útočník nepřečte obsah, nepozná, co dělám, takže jsem anonymní.
  > Ne. Šifrování řeší *důvěrnost obsahu*, ne anonymitu. Zdrojová a cílová IP zůstávají v hlavičkách čitelné — pozorovatel ví, *kdo* s *kým* komunikuje, i když neví *co*.
- [x] Ne — šifrování skryje obsah, ale zdroj i cíl (IP adresy) zůstávají viditelné.
  > Správně. To je přesně rozdíl mezi *confidentiality* a *anonymity*. K nespojitelnosti zdroje a cíle je potřeba něco navíc — VPN/proxy ([[vpn-proxy]]) nebo onion/mix routing ([[onion-tor]]).
- [ ] Ano, ale jen pokud používám TLS 1.3 s šifrovaným SNI.
  > Šifrovaný SNI (ECH) skryje *jméno cílové služby* před prostředníkem, ale cílovou IP a vaši zdrojovou IP nikoliv. Anonymitu to neřeší.
:::

Tento rozdíl mezi **utajením obsahu** a **anonymitou** je leitmotivem celé kapitoly. Šifrování je nutné, ale zdaleka ne dostatečné — proto následují techniky, které řeší přímo *zdroj a cíl*: [[vpn-proxy]] a [[onion-tor]].

::: link "IANA — IPv4 Address Space Registry" "https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.xhtml"
:::

::: link "RIPE NCC — Database (whois) dokumentace" "https://www.ripe.net/manage-ips-and-asns/db/"
:::

::: link "RFC 3046 — DHCP Relay Agent Information Option (option 82)" "https://www.rfc-editor.org/rfc/rfc3046"
:::

*Zdroj: PDS — přednáška Anonymity, Ing. Matěj Grégr, Ph.D., FIT VUT v Brně. Externí reference: [IANA IPv4 Address Space](https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.xhtml); [RIPE Database](https://www.ripe.net/manage-ips-and-asns/db/); [RFC 3046 — DHCP Option 82](https://www.rfc-editor.org/rfc/rfc3046); [RFC 4862 — IPv6 Stateless Address Autoconfiguration](https://www.rfc-editor.org/rfc/rfc4862).*
