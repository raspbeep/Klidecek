---
title: Známé útoky v IoT prostředí
---

# Známé útoky v IoT prostředí

Teoretické zranitelnosti ([[topologicke-utoky]], [[lorawan]], [[zigbee-802154]], [[ble-bluetooth]]) v IoT se v posledních dekádách měnily v *praktické* útoky s reálným dopadem — destrukce kritické infrastruktury, vyřazení internetu, ohrožení lidských životů, mass-surveillance. Tato kapitola shrnuje *kanonické* případy, které ovlivnily vývoj bezpečnosti IoT.

## Stuxnet (2010) — útok na ICS

[Stuxnet](https://www.langner.com/wp-content/uploads/2017/03/to-kill-a-centrifuge.pdf) — *první státem sponzorovaný* malware proti **industriálním řídicím systémům (ICS)**. Pravděpodobně vyvinut USA + Izrael (Operace Olympic Games). Cíl: zničit íránské centrifugy v Natanzu pro obohacení uranu.

### Architektura útoku

* **Air-gapped target** — íránské zařízení nebylo připojeno k internetu.
* **Initial infection** přes USB klíče (insider, supply chain, social engineering).
* **0-day exploity v Windows** — 4 najednou (rekordní), včetně *Windows printer spool service* (CVE-2010-2729), .LNK shortcut (CVE-2010-2568).
* **Šíření po síti** přes RPC, MS08-067, SMB shares.
* **Cíl: Siemens SIMATIC WinCC / Step 7 PLC.** Stuxnet hledal *specifické* PLC configurations:
  * Programmable Logic Controllers Siemens S7-300/S7-400.
  * Connected to *variable frequency drives* (VFDs) — Vacon (Finland) nebo Fararo Paya (Iran).
  * Frequency range 807–1210 Hz — *typický* pro uranové centrifugy.

### Payload

Když Stuxnet našel správnou konfiguraci:

1. *Loggoval* normální provoz centrifug po několik týdnů.
2. Periodicky měnil frekvenci centrifug (z 1064 Hz na 1410 Hz, pak na 2 Hz, pak zpět).
3. *Současně* přehrával zaznamenaný normální provoz na monitoring systému (HMI) — operátoři neviděli problém.
4. Centrifugy se mechanicky destruovaly nesprávným frekvenčním provozem.

### Dopad

* Odhadováno **1 000+ centrifug zničeno** (z ~9 000 v Natanzu).
* Zpoždění íránského jaderného programu o 1–2 roky.
* **Otevření Pandořiny krabice** — státy začaly vyvíjet podobné útoky (Duqu, Flame, Equation Group, Industroyer, Triton).
* Stuxnet binárka unikla, byla *zreverzována* (Symantec, Kaspersky), inspirovala mnoho derivátů.

### Lekce

* **Air gap** *není* dostatečná ochrana (USB jako vektor).
* **ICS bezpečnost** byla zoufalá — Siemens default passwords v systému uvedené **přímo v dokumentaci**.
* **Targeted attacks** s 0-day exploity jsou *de facto* nedetekovatelné konvenčními AV.

## Mirai (2016) — botnet z IoT

[Mirai](https://krebsonsecurity.com/2016/10/source-code-for-iot-botnet-mirai-released/) — Mass IoT botnet vytvořený studenty v USA (Paras Jha, Josiah White, Dalton Norman; všichni jsou identifikovaní, odsouzeni 2017).

### Mechanismus

1. **Scanování internetu** pro IoT zařízení s otevřeným **Telnet (TCP 23)**.
2. **Brute force login** s ~60 *default credentials* (admin/admin, root/xc3511, root/vizxv, ...).
3. Po úspěšném loginu *uploadl* malware (různé varianty pro různé architektury: MIPS, ARM, x86, SH4, ...).
4. *Persistance* — žádná. Bot žil v RAM; restart zařízení ho vyřadil. Ale infikované zařízení bylo *rychle* re-infectováno.
5. **C2 communication** s botmaster servery.

### Dopad

* **Mirai zasáhl pravděpodobně 600 000+ IoT zařízení** ve špičce — IP kamery (Hikvision, Dahua), DVR, routery, baby monitors.
* **21. září 2016** — DDoS útok na Brian Krebs blog (KrebsOnSecurity.com) — 620 Gb/s, *najvětší DDoS v té době*.
* **21. října 2016** — DDoS na **Dyn DNS** provider — 1.2 Tb/s. Vyřadil Twitter, Reddit, GitHub, Spotify, Netflix, PayPal na hodiny.
* **1. listopadu 2016** — útok na Liberian internet infrastrukturu.

Po zveřejnění sourcekódu (autoři ho leakovali pro distance themselves od FBI) vzniklo *dlouhé* portfolio variant: Satori, Reaper, Mukashi, Echobot, Hajime, ...

### Lekce

* **Default credentials** ve IoT je *catastrophic* problém — útočník nemusí žádný 0-day.
* **Telnet** v internetu v roce 2016+ je *non-existence* security.
* **IoT scale** mění DDoS dynamiku — místo bot networks z PC (10 000–100 000 boty) máme *miliony*.
* **Patchování retroaktivně** — výrobci neposkytovali updates; uživatelé je neuměli aplikovat.

Důsledek: regulace (UK PSTI Act 2022 zakazuje default passwords), Mirai-inspired prevencery.

## St. Jude pacemakers (2016)

[Muddy Waters Research + MedSec](https://www.muddywatersresearch.com/research/sjm/mw-is-short-stj/) — short-selling pochybnosti o St. Jude Medical (výrobce pacemakers a defibrillátorů).

* **St. Jude Merlin@home** — domácí monitoring stanice pro pacemakers. Komunikuje s implantovaným zařízením přes proprietary RF link.
* **MedSec discovered:**
  * Komunikace *nešifrovaná* — replay útok možný.
  * **Battery depletion attack** — útočník v dosahu mohl *opakovaně* aktivovat zařízení, vyčerpat baterii.
  * **Programming** — *přeprogramovat* tlukot, vyvolat fibrilaci.
* **FDA Recall** v r. 2017 pro >465 000 implantovaných pacemakerů.

### Lekce

* **Medical IoT** je *cíl s nejvyšším rizikem* — útok může způsobit *smrt*.
* **Proprietary RF protocols** ne jsou *security by obscurity*; *jsou* reverz-engineered s SDR + reasonable budget.
* **FDA v r. 2014–2018** zavedla povinné security reviews pro nové medical devices (Premarket Cybersecurity Guidance).

## Carjacking via Jeep Cherokee (2015)

[Charlie Miller, Chris Valasek](https://illmatics.com/Remote%20Car%20Hacking.pdf) — známý hack 2014 Jeep Cherokee:

* **Sprint cellular link** v UConnect infotainment systému Jeep.
* Sprint vlastní *open port 6667* (IRC) v jejich síti → attackable from anywhere.
* Po komunikaci s UConnect, *write* into firmware → modified instructions for CAN bus.
* CAN bus připojené k *všechny* systémy: brakes, steering, transmission, lights.
* **WIRED reporter** Andy Greenberg zažil *vzdálené* ovládání auta v provozu — sliding off highway demonstration.

### Dopad

* **Recall 1,4 milionů vehicles** od FCA (Fiat Chrysler Automobiles).
* Plus regulační reakce: NHTSA + Federal CyberSec Guidelines pro automotive.

### Lekce

* **Mixed-criticality systems** — infotainment a safety-critical (brakes, steering) na *stejné sběrnici* → exploit v jednom = exploit ve všech.
* **OTA updates** musí být *secure* a *signed*.
* **Defense in depth** — gateway mezi infotainment a CAN bus.

Trend 2025: nové auta mají *zone* architekturu s separací; safety-critical má vlastní LIN/CAN s message authentication (AUTOSAR SecOC).

## IoT Worm — Hue lights (Ronen-Shamir 2016)

[*IoT Goes Nuclear: Creating a ZigBee Chain Reaction*](https://iotworm.eyalro.net/) — Ronen, O'Flynn, Shamir, Weingarten:

* Útok ZigBee Light Link Touchlink ([[zigbee-802154|Touchlink slabost]]).
* Z **drone v dosahu** (kvadrokoptéra s ZigBee radio) hijack Philips Hue žárovku.
* Hijackovaná žárovka *propagovala* malware na další žárovky v okolí.
* **Worm v fyzickém prostoru** — z jediného starting point se mohl rozšířit přes celé město.

### Dopad

* **Philips patchnoval** ZLL ve firmware update.
* Demonstrace, že **fyzická IoT může mít fyzické dopady** — Ronen *navíc* demonstroval, že malicious firmware mohl Hue žárovku přimět *flickering* na frekvenci, která způsobuje *epileptické záchvaty*.

## Botnet Mozi (2019–2021)

Mass IoT botnet podobný Mirai, ale s **P2P** komunikací (nahradil Mirai's centralized C2):

* Cíl: SOHO routery (Netgear, D-Link), DVRs.
* P2P komunikace přes *BitTorrent DHT*.
* **Resilient** vůči takedowns C2.

Kaspersky odhadovala 1,5+ milionů aktivních botů v 2020. V r. 2021 *creator se vzdal* (zatčen v Číně), což botnet skomplikovalo.

## Verkada (2021) — surveillance cameras

[Verkada hack](https://www.bloomberg.com/news/articles/2021-03-09/hackers-expose-tesla-jails-in-breach-of-150-000-security-cameras) — útočníci získali přístup k cca **150 000 IP kameram** Verkada zákazníků:

* **Cíle:** Tesla továrny, věznice (Madison Cty AL), nemocnice, školy, policejní stanice.
* **Vektor:** *super-admin credentials* Verkada employee, *unprotected*, nalezeny v public Jenkins logs.
* Důsledek: real-time video streams, *full root access* na kamerách (cz: možnost dalšího jumping).

## Belkin Wemo Insights (2018+)

Mnoho komerčních smart plugs (Belkin Wemo, Tuya, Geeni) komunikuje *nešifrovaně* s vlastním cloud:

* Útočník na stejné LAN může *intercept* control commands.
* *Replay* commands → ovládání zařízení v cizí domácnosti.

## Cybersecurity ve zdravotnictví — ransomware na nemocnice (2017+)

* **WannaCry** (Mai 2017) — vyřadil ~70 nemocnic v UK NHS na den nebo více. Pacienti přesměrováni, plánované operace zrušeny.
* **Düsseldorf hospital ransomware** (Září 2020) — *první potvrzené* úmrtí spojené s ransomware útokem (pacientka přesměrována na vzdálenější nemocnici, zemřela během transportu).
* IoT zdravotní zařízení (infusion pumps, MRI, ventilators) běžící na *Windows XP* + nepatchované — nejsou cíle ransomware *přímo*, ale stávají se nedostupné při výpadku nemocniční sítě.

## Trendy 2025 — útoky na chytré domácnosti

* **Tuya zařízení** (~50 % low-cost smart home produktů: smart plugs, bulbs, locks, cameras za nízké ceny) — nedostatečná pairing security, default cloud accounts.
* **Cheap Chinese cameras** (Hikvision, Dahua re-branded) — backdoors discovered (BetterCAP analysis 2024).
* **Smart locks** (August, Igloohome) — relay attacks demonstrované [Pen Test Partners](https://www.pentestpartners.com/security-blog/category/iot/) (UK consultancy specializovaná na IoT).
* **EV chargers** (ChargePoint, EVgo) — credit card skimming, denial-of-charge.

## Společné lekce

1. **Default credentials = no credentials.** *Pravidlo č. 1*: každé zařízení musí mít unique credential per device, vygenerované at factory.
2. **OTA security updates jsou povinné.** Bez updates je dlouhodobá bezpečnost nemožná.
3. **Defense in depth.** Single-point security (např. firewall) je nedostatečné v IoT, kde dlouhý lifecycle a heterogeneita znamenají, že *něco* vždy padne.
4. **Privacy ≠ Security.** I bezpečné zařízení může unikat data.
5. **Regulace pomáhá.** Voluntary security selhává — trh nekoreluje cenou s bezpečností. Mandates (CRA, PSTI) jsou nezbytné.
6. **IoT impact je fyzický.** Auto, pacemaker, smart lock — útoky mají *kinetic* dopad. Stakes jsou vyšší než klasická IT bezpečnost.

---

*Zdroj: BZA přednášky 2025/26, BZA 08 — Bezpečnost IoT (Hujňák). Externí reference: Langner, R.: *To Kill a Centrifuge: A Technical Analysis of What Stuxnet's Creators Tried to Achieve* (2013) — [PDF](https://www.langner.com/wp-content/uploads/2017/03/to-kill-a-centrifuge.pdf); Antonakakis, M. et al.: *Understanding the Mirai Botnet* (USENIX Security 2017) — [PDF](https://www.usenix.org/system/files/conference/usenixsecurity17/sec17-antonakakis.pdf); Miller, C., Valasek, C.: *Remote Exploitation of an Unaltered Passenger Vehicle* (Black Hat 2015) — [PDF](https://illmatics.com/Remote%20Car%20Hacking.pdf); Ronen, E. et al.: *IoT Goes Nuclear: Creating a ZigBee Chain Reaction* (IEEE S&P 2017) — [project page](https://iotworm.eyalro.net/).*
