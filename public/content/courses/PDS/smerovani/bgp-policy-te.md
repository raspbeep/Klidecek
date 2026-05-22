---
title: BGP policy a traffic engineering
---

# BGP policy — když nejde o nejkratší cestu

Předchozí sekce ([[bgp-zaklady]]) ustanovila *mechaniku* BGP. Skutečný důvod, proč BGP vypadá *jak vypadá* — atributy, MED, LOCAL_PREF, communities — je **policy**. Internet není shortest-path graf; je to *obchodní mapa*. Tato kapitola probere, jak operátoři BGP politiky řídí *kudy paket teče*, kdo platí komu, a proč traffic engineering rozdělujeme na *inbound* a *outbound*.

## Obchodní vztahy mezi AS

Tři archetypy:

| Typ | Popis | Tok peněz |
| :--- | :--- | :--- |
| **Customer ↔ Provider** | Customer kupuje connectivity. | C platí P |
| **Peer ↔ Peer** | Dvě AS si vyměňují *vlastní* traffic. | nikomu |
| **Sibling** | Dvě AS jednoho korporátu | nikomu |

**Valley-free principle**: paket nesmí cestovat *customer → peer → provider* nebo *provider → peer → customer* — to by jeden účastník platil za traffic druhého bez rekompenzace. Tato pravidla se vynucují *BGP politikou*.

::: svg "Valley-free routing — povolené a zakázané cesty"
<svg viewBox="0 0 540 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <g stroke="var(--line-strong)" stroke-width="1.5" fill="var(--bg-card)">
    <circle cx="270" cy="50" r="22"/>
    <circle cx="170" cy="120" r="22"/>
    <circle cx="370" cy="120" r="22"/>
    <circle cx="100" cy="180" r="18"/>
    <circle cx="440" cy="180" r="18"/>
  </g>
  <g fill="var(--text)" text-anchor="middle" font-size="10">
    <text x="270" y="54">Tier-1</text>
    <text x="170" y="124">Tier-2 A</text>
    <text x="370" y="124">Tier-2 B</text>
    <text x="100" y="183">SME</text>
    <text x="440" y="183">SME</text>
  </g>
  <g stroke="var(--accent)" stroke-width="1.5">
    <line x1="248" y1="55" x2="190" y2="105"/>
    <line x1="292" y1="55" x2="350" y2="105"/>
    <line x1="155" y1="138" x2="115" y2="170"/>
    <line x1="385" y1="138" x2="425" y2="170"/>
  </g>
  <line x1="192" y1="120" x2="348" y2="120" stroke="var(--text-faint)" stroke-width="1.2" stroke-dasharray="4 4"/>
  <text x="270" y="115" fill="var(--text-muted)" font-size="9">peer</text>
  <text x="195" y="80" fill="var(--text-muted)" font-size="9">provider</text>
  <text x="345" y="80" fill="var(--text-muted)" font-size="9">provider</text>
  <text x="40" y="195" fill="var(--text-muted)" font-size="9">customer</text>
  <text x="490" y="195" fill="var(--text-muted)" font-size="9">customer</text>
</svg>
:::

Tier-2 A *neinzeruje* trasy Tier-2 B (peer) svým customer SME — to by SME mohl posílat traffic přes A, B (peer), a A by nic neplatil. *Není to* zakázáno technicky, je to BGP policy.

## LOCAL_PREF — preference uvnitř AS

`LOCAL_PREF` (vyšší = lepší) říká iBGP sousedům uvnitř AS, *kterou* externí trasu preferovat. **Default 100.**

Typické nastavení:

| Origin trasy | LOCAL_PREF |
| :--- | :---: |
| **From customer** | 200 (preferuj — customer platí) |
| **From peer** | 100 (default, balanced) |
| **From provider** | 50 (poslední možnost) |

Důsledek: pokud existují tři cesty do prefixu, AS vybere customer-cestu i kdyby byla 5× delší — protože je to *výnosné*.

## MED — Multi-Exit Discriminator

`MED` (nižší = lepší) je hint *sousední AS*, kterou cestou *ke mně* (= do mého AS) preferovat. Použití: peer má víc fyzických linků (např. NYC i LA), inzeruje stejný prefix z obou. **MED** říká: *"Preferuj LA exit."* Tím odlehčí NYC.

Důležité: MED se *nepropaguje dále* — *non-transitive* atribut.

## COMMUNITY — tag-based policy

`COMMUNITY` je 32-bitový tag (nebo 64-bit *large* community v moderním BGP). Operátor jej *přilepí* k trase a *kolega downstream* může na něj reagovat.

Standardní communities:

| Hodnota | Význam |
| :--- | :--- |
| `NO_EXPORT` (`0xFFFFFF01`) | neexportuj mimo AS |
| `NO_ADVERTISE` (`0xFFFFFF02`) | neoznamuj žádnému peer |
| `NO_PEER` ([RFC 3765](https://www.rfc-editor.org/rfc/rfc3765)) | neoznamuj non-customer peers |

Custom communities (`AS:VALUE`):

- `2852:100` u CESNET = "selektor pro NREN-only prefixy".
- `15169:520` u Google = "interní tag, ignoruj uvnitř".

ISP zveřejňují **community policy** — co tag způsobí. Customer pak může v BGP konfiguraci říct *"prepend AS_PATH 3x v sousední AS"* tím, že trasu otaguje příslušnou community.

## Route maps — implementace politiky

V Cisco IOS / Juniper Junos / FRR je **route map** seznam pravidel `match → set`:

```
route-map CUSTOMER_IN permit 10
  match ip address prefix-list ALLOWED
  set local-preference 200
  set community 65001:1000

route-map CUSTOMER_IN deny 20
  match as-path 100
  ! reject any path through AS 100
```

Aplikuje se na **neighbor**:

```
neighbor 192.0.2.1 route-map CUSTOMER_IN in
neighbor 192.0.2.1 route-map CUSTOMER_OUT out
```

In-direction: filtruje *přijaté* prefixy.
Out-direction: filtruje *odeslané* prefixy.

Typické actions:

- **Permit/deny** — propustit nebo zahodit.
- **Set local-preference** — pro iBGP propagaci.
- **Set community** — tagging.
- **Set as-path prepend** — *uměle prodlouž* AS_PATH (přidej vlastní AS Nx).
- **Set MED** — nastav exit hint.
- **Set next-hop** — přesměruj na specifický router.

## Prefix-lists a AS-path filters

- **Prefix-list** — povolovaný / blokovaný *seznam IP prefixů*.

  ```
  ip prefix-list ALLOWED seq 10 permit 185.10.0.0/16
  ip prefix-list ALLOWED seq 20 deny 0.0.0.0/0 le 32
  ```

- **AS-path filter** — regex over AS_PATH.

  ```
  ip as-path access-list 100 permit ^65100$       # jen přímo z AS 65100
  ip as-path access-list 200 deny _666_           # blokuj kdekoli přes AS 666
  ```

Tyto se používají v *route-map match* clauses.

## Outbound traffic engineering

> **Outbound TE** — kterým směrem můj traffic *odchází* z mé AS.

**Lehký případ** — kontroluju vlastní routery. Použiju `LOCAL_PREF`:

```
! preferuj cestu přes ISP_A
route-map FROM_ISP_A_IN permit 10
  set local-preference 200
neighbor ISP_A route-map FROM_ISP_A_IN in
```

Můj traffic pojede *přes ISP_A* (vyšší LOCAL_PREF). Pokud ISP_A padne, fallback na ISP_B (default 100).

Granularita: `match prefix-list` mě omezí na *určité* destinace.

## Inbound traffic engineering

> **Inbound TE** — kterým směrem traffic *přichází* do mé AS.

**Těžký případ** — *neovládám* cizí routery. Pošťák je jiný admin; ten může moji rade ignorovat. Nástroje:

### 1. AS_PATH prepending

Inzeruj prefix s *uměle prodlouženým* AS_PATH přes nepreferovaný exit:

```
! přes ISP_B prepend 3x — vypadám "vzdáleně"
route-map TO_ISP_B_OUT permit 10
  set as-path prepend 65001 65001 65001
neighbor ISP_B route-map TO_ISP_B_OUT out
```

Sousedi vidí AS_PATH = `[65001, 65001, 65001, 65001, …]` přes ISP_B vs `[65001, …]` přes ISP_A → vyberou ISP_A.

**Cave**: AS_PATH prepending *není* respektován všemi peer — některé dají vyšší prioritu LOCAL_PREF a ignorují délku AS_PATH. Pak nepomáhá.

### 2. MED

Pro **stejného** peer s víc exit body:

```
! NYC: MED 100; LA: MED 50 → peer preferuje LA
route-map NYC permit 10
  set metric 100
route-map LA permit 10
  set metric 50
```

### 3. Community-based steering

Peer publikuje *community menu* (např. Hurricane Electric AS 6939):

```
6939:1010 — depref NA -10
6939:2010 — depref EU -10
```

Customer trasu otaguje, peer reaguje vlastním LOCAL_PREF úpravou. Méně intrusive než prepending.

### 4. Selective announcement

Inzeruj **deagregované** prefixy přes preferovaný exit:

```
! přes ISP_A: 185.10.0.0/16
! přes ISP_B: jen 185.10.0.0/17 + 185.10.128.0/17 (dvě /17)
```

Longest prefix match → svět vyberé /17 přes ISP_B (specifičtější), ale /16 přes ISP_A jako fallback.

Cena: navyšuje *DFZ table size* — peers nesouhlasí s deaggregating beyond `/24`.

## Peering versus tranzit

**Tranzit** (customer-provider) — provider hlásí customer *celou tabulku internetu*. Customer platí.

**Peering** (mutual) — dva AS si vyměňují *jen vlastní* prefixy a prefixy svých customer. Nikdo neplatí.

Peering ekonomika:

- Settlement-free peering ratio: typicky 2:1 v traffic volume (ne moc nesymetrické).
- Internet Exchange (IX) hosts peering — NIX.cz v Praze, AMS-IX v Amsterdamu, DE-CIX ve Frankfurtu.
- ČR — NIX.cz měl v 2024 přes 200 členů, peak traffic >2 Tbps.

Veřejný IX vs privátní peering — větší volumes obvykle do *Private Network Interconnect* (PNI), přímý kabel mezi dvěma páry routerů.

## RPKI a ROV — bezpečnostní vrstva

[RFC 6480 — RPKI](https://www.rfc-editor.org/rfc/rfc6480). Kryptografická vrstva nad BGP:

1. **IRR** + **RPKI** publikuje **ROA** (Route Origin Authorization) — "AS X opravdu drží prefix P".
2. Router při příjmu BGP update *validuje* origin AS proti ROA databázi.
3. Tři výsledky:
   - **Valid** — origin AS v ROA → akceptuj.
   - **Invalid** — origin AS *není* v ROA → *zahoď* (route hijack defence).
   - **NotFound** — žádné ROA → akceptuj (transitional).

V 2026 ~50 % světových prefixů má ROA; *většina* tier-1 ISP dělá ROV (Route Origin Validation). Klíčová obrana proti hijacks typu Pakistan-YouTube 2008 nebo Telstra-Google 2017.

## Praktická konfigurace — výpis BGP

Cisco IOS `show ip bgp`:

```
*>i185.10.0.0/16    192.0.2.5    0    100    50    0 6939 2852 i
*  i                 192.0.2.7    0    100   200    0 12350 2852 i
```

- `*>` — best path (instalována do RIB).
- `i` — naučená z iBGP.
- 50 / 200 — LOCAL_PREF.
- `6939 2852` — AS_PATH.
- `i` na konci — ORIGIN (IGP).

Pro internet-wide pohled: [bgp.he.net](https://bgp.he.net/), `whois -h whois.radb.net`.

## Co dál

BGP řeší *směrování*, ale ne *přepravu samotnou*. Tier-1 ISPové dnes neperují IP forwarding přes BGP-naučené trasy — používají **MPLS** ([[mpls]]) pro core switching s label switched paths. Tam jde další sekce.

---

*Zdroj: PDS přednáška 3 (Směrování), Ing. Vladimír Veselý, Ph.D., FIT VUT v Brně. Externí reference: [RFC 7454 — BGP Operations and Security](https://www.rfc-editor.org/rfc/rfc7454); [RFC 6811 — BGP Prefix Origin Validation](https://www.rfc-editor.org/rfc/rfc6811); Caesar, M., Rexford, J.: „BGP Routing Policies in ISP Networks" (IEEE Network 19(6), 2005); [Hurricane Electric BGP Toolkit](https://bgp.he.net/); [MANRS — Mutually Agreed Norms for Routing Security](https://www.manrs.org/); [NIX.cz — Czech IX](https://www.nix.cz/).*
