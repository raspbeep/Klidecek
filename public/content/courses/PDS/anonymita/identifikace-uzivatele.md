---
title: Identifikace uživatele a otisky (fingerprinting)
---

# Co znamená „anonymita" na síti

Anonymita není totéž co utajení obsahu. Provoz může být dokonale zašifrovaný, a přesto pozorovatel ví, *kdo* s *kým* komunikuje, *jak často* a *kdy*. Než se začneme bavit o nástrojích (VPN, Tor, mixovací sítě), je potřeba definovat, *co přesně* chceme skrýt. Standardní terminologie (Pfitzmann–Hansen) rozkládá pojem na dvě ortogonální vlastnosti — **unlinkability** a **unobservability**.

## Unlinkability — nemožnost spojit dvě události

**Unlinkability** znamená, že pozorovatel *nedokáže spojit dvě události* (dva pakety, dva přístupy na web, osobu a akci) silněji, než kdyby je hádal náhodně. „Událostí" může být cokoliv: paket, webový požadavek, člověk, akce. Z hlediska komunikace se nespojitelnost dělí na tři dílčí cíle:

| Typ anonymity | Otázka pozorovatele | Co se skrývá |
| :--- | :--- | :--- |
| **Sender anonymity** | „Kdo poslal tuto zprávu?" | identita *odesílatele* |
| **Receiver anonymity** | „Kdo je příjemcem?" | identita *příjemce* |
| **Relationship anonymity** | „Jsou A a B ve vzájemném spojení?" | *vztah* mezi A a B |

Relationship anonymity je *slabší* požadavek než plná sender/receiver anonymity: pozorovatel může klidně vědět, že *A někomu* posílá data a že *B od někoho* data dostává — jen nesmí umět spojit konkrétní A s konkrétním B. Mixovací sítě ([[onion-tor]]) cílí přesně sem.

## Unobservability — událost nelze odlišit od ostatních

**Unobservability** je silnější: sledované události *nelze odlišit od běžného šumu*. Nejde jen o to, že útočník neví, kdo poslal zprávu — útočník nepozná, jestli *vůbec nějaká* zpráva proběhla. Toho se dosahuje například **dummy/cover traffic** (umělý provoz vyplňující ticho), takže odeslání reálné zprávy je nerozlišitelné od jejího neodeslání.

::: viz pds-anonymity-properties "Klikni na typ anonymity — diagram zvýrazní, co přesně se před pozorovatelem skrývá (odesílatel, příjemce, nebo jen jejich vztah). Unobservability schová i existenci provozu samotného."
:::

## Identifikace uživatele přes IP

Nejpřímější identifikátor je **IP adresa**. Lze ji svázat přímo s konkrétním uživatelem:

- **ISP ukládá komunikační údaje** — kdo měl jakou adresu a kdy. Tyto záznamy drží téměř vždy (kvůli účtování a řešení provozních problémů), nezávisle na legislativě o uchovávání dat (*data retention*).
- **Data retention** — legislativa v řadě zemí *navíc* nařizuje provozní a lokalizační údaje uchovávat po stanovenou dobu.
- **Orgány činné v trestním řízení** si na základě IP a časového razítka vyžádají od ISP identitu účastníka.

Detailně se přidělování a dohledatelnost IP řeší v [[ip-geolokace]]. Důležité: i krátkodobě přidělená (dynamická) adresa je dohledatelná, protože ISP ví, *komu* a *kdy* ji vydal.

## Otisky — fingerprinting

I bez IP lze uživatele rozpoznat podle *charakteristických rysů*, které jeho zařízení a software vyzařují. Tomu se říká **fingerprinting** a má několik vrstev.

### Browser fingerprinting

Prohlížeč při každém požadavku odhaluje řadu drobností, jejichž *kombinace* bývá unikátní. Klasické stavové identifikátory:

- **Cookies** — explicitní stavový identifikátor uložený serverem.
- **Flash cookies** (Local Shared Objects), **HTML5 storage** (`localStorage`, IndexedDB) — alternativní úložiště, která přežijí smazání běžných cookies („zombie cookies").
- **E-Tags** — hlavička pro cache validaci se dá zneužít jako skrytý identifikátor: server vrátí unikátní E-Tag, prohlížeč ho při dalším požadavku pošle zpět.

Ale i *bez* uloženého stavu je prohlížeč rozpoznatelný podle **pasivního otisku** — kombinace User-Agent, jazyk, časové pásmo, rozlišení a hloubka barev, seznam fontů, instalované pluginy, Canvas/WebGL rendering. Měření projektu *Panopticlick* (EFF, 2010) ukázalo, že tato kombinace nese typicky **přes 18 bitů entropie** — pro srovnání, identita náhodného člověka z ~7 miliard lidí má necelých **33 bitů**. Drtivá většina prohlížečů má tedy *prakticky unikátní* otisk, aniž by potřebovala jedinou cookie.

::: quiz "Stačí pravidelně mazat cookies, abych byl na webu nesledovatelný?"
- [ ] Ano — bez cookies mě server nemá podle čeho rozpoznat.
  > Ne. Mazání cookies neřeší pasivní *browser fingerprint* (User-Agent, fonty, Canvas, rozlišení…), který bývá sám o sobě téměř unikátní. Navíc existují perzistentní úložiště (Flash cookies, HTML5 storage, E-Tags), která přežijí smazání běžných cookies.
- [x] Ne — kombinace vlastností prohlížeče je často unikátní i bez cookies.
  > Správně. Studie Panopticlick naměřila >18 bitů entropie z pasivního otisku; ~84 % prohlížečů bylo jednoznačně identifikovatelných i bez jakéhokoliv uloženého stavu.
- [ ] Ano, pokud k tomu používám i anonymní režim prohlížeče.
  > Anonymní (inkognito) režim jen nezachovává *lokální* historii a cookies. Server přesto vidí celý pasivní otisk i IP adresu.
:::

### OS a aplikační otisky přes DNS

I šifrovaný provoz prozradí operační systém a aplikace přes **charakteristické DNS dotazy**, které software dělá *na pozadí* (aktualizace, telemetrie, kontrola revokace, „safe browsing"). Tyto dotazy tvoří rozpoznatelný vzor:

| Prostředí | Typické pozaďové DNS dotazy |
| :--- | :--- |
| **Windows** | `*.windowsupdate.com`, `watson.microsoft.com`, `*.telemetry.microsoft.com`, `*.msn.com` |
| **macOS** | `swscan.apple.com`, `time.*.apple.com`, `*.icloud.com`, `*.itunes.apple.com` |
| **Linux (Ubuntu/CentOS)** | `*.ubuntu.com`, `mirrorlist.centos.org`, `*.pool.ntp.org` |
| **Firefox** | `aus3.mozilla.org`, `*.addons.mozilla.org`, `safebrowsing.*.google.com` |
| **Chrome / Safari** | `clients[x].google.com`, `safebrowsing-cache.google.com`, `ssl.gstatic.com` |
| **Internet Explorer** | `ctldl.windowsupdate.com`, `iecvlist.microsoft.com`, `t.urs.microsoft.com` |

Pasivní pozorovatel (nebo provozovatel DNS resolveru) tak rozpozná OS a prohlížeč, *aniž* by viděl jediný byte obsahu. To je důvod, proč šifrování samotné nestačí — strana, která vidí *metadata* (kam se dotazuji), o mně ví překvapivě hodně.

### User-behavior tracking

Nejjemnější vrstva sleduje **vzory chování napříč relacemi**. Uživatel navštěvuje stále stejnou množinu webů (mail, banka, oblíbené portály) — a tato množina hostnames se mezi relacemi *opakuje*. I když se mu při každém připojení změní IP adresa, jeho *profil DNS dotazů* zůstává podobný, takže ho lze znovu rozpoznat. Tuto behaviorální vazbu napříč relacemi a měnícími se IP popsali Herrmann et al. v práci o *behavior-based tracking* (viz reference).

::: svg "Behavior-based tracking: stejný uživatel ve čtyřech relacích s různými IP. Množina dotazovaných hostnames se opakuje → relace lze spojit do jednoho profilu."
<svg viewBox="0 0 520 200" font-family="ui-sans-serif, system-ui" font-size="11">
  <rect width="520" height="200" fill="var(--bg-inset)"/>
  <g fill="var(--text-muted)" text-anchor="end" font-size="10">
    <text x="92" y="38">mail.x</text>
    <text x="92" y="68">bank.y</text>
    <text x="92" y="98">news.z</text>
    <text x="92" y="128">forum.w</text>
  </g>
  <g stroke="var(--line)" stroke-width="0.6" stroke-dasharray="2 3">
    <line x1="100" y1="34" x2="500" y2="34"/>
    <line x1="100" y1="64" x2="500" y2="64"/>
    <line x1="100" y1="94" x2="500" y2="94"/>
    <line x1="100" y1="124" x2="500" y2="124"/>
  </g>
  <!-- session separators -->
  <g stroke="var(--line-strong)" stroke-width="0.8">
    <line x1="200" y1="20" x2="200" y2="150"/>
    <line x1="300" y1="20" x2="300" y2="150"/>
    <line x1="400" y1="20" x2="400" y2="150"/>
  </g>
  <g fill="var(--text-muted)" text-anchor="middle" font-size="9.5">
    <text x="150" y="166">Relace 1 · IP₁</text>
    <text x="250" y="166">Relace 2 · IP₂</text>
    <text x="350" y="166">Relace 3 · IP₃</text>
    <text x="450" y="166">Relace 4 · IP₄</text>
  </g>
  <!-- same hostnames hit across sessions -->
  <g fill="var(--accent)">
    <circle cx="140" cy="34" r="4"/><circle cx="165" cy="64" r="4"/><circle cx="180" cy="98" r="4"/>
    <circle cx="245" cy="34" r="4"/><circle cx="270" cy="64" r="4"/>
    <circle cx="330" cy="34" r="4"/><circle cx="355" cy="98" r="4"/><circle cx="375" cy="124" r="4"/>
    <circle cx="430" cy="34" r="4"/><circle cx="455" cy="64" r="4"/><circle cx="470" cy="98" r="4"/>
  </g>
  <text x="260" y="190" text-anchor="middle" fill="var(--text-faint)" font-size="9.5">opakující se profil hostnames → propojení relací i přes měnící se IP</text>
</svg>
:::

## Anonymita v davu — fyzický svět

Stejný princip identifikace platí i mimo síť: kamerové systémy s rozpoznáváním obličejů (cloudové „face recognition" služby, plošný státní dohled) dokáží v davu označit konkrétní osoby jménem. Anonymita „ztracením se v davu" přestává fungovat ve chvíli, kdy dav umí stroj rozpoznat po jednotlivcích — což je přesně paralela k browser/behavior fingerprintingu: i „obyčejný" uživatel v moři provozu je rozlišitelný podle svých rysů.

::: link "EFF — Cover Your Tracks (nástupce Panopticlick): otestujte unikátnost svého prohlížeče" "https://coveryourtracks.eff.org/"
:::

::: link "P. Eckersley: How Unique Is Your Web Browser? (PETS 2010)" "https://coveryourtracks.eff.org/static/browser-uniqueness.pdf"
:::

::: link "Herrmann, Banse, Federrath: Behavior-based tracking — Exploiting characteristic patterns in DNS traffic (2013)" "https://doi.org/10.1016/j.cose.2012.12.004"
:::

*Zdroj: PDS — přednáška Anonymity, Ing. Matěj Grégr, Ph.D., FIT VUT v Brně. Externí reference: A. Pfitzmann, M. Hansen: „A terminology for talking about privacy by data minimization" (v0.34, 2010); P. Eckersley: „How Unique Is Your Web Browser?" (PETS 2010, [EFF](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf)); D. Herrmann, C. Banse, H. Federrath: „Behavior-based tracking: Exploiting characteristic patterns in DNS traffic" (Computers & Security 2013, [DOI 10.1016/j.cose.2012.12.004](https://doi.org/10.1016/j.cose.2012.12.004)).*
