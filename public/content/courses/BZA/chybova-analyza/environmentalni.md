---
title: Environmentální útoky — teplota, napětí, záření
---

# Environmentální útoky — teplota, napětí, záření

Vedle [[glitch-utoky|krátkodobých glitch]] útoků existuje rodina *environmentálních* útoků — útočník drží zařízení v nestandardních podmínkách *trvale* nebo *dlouhodobě*. Cílem je vyřadit specifické obvody (RNG, paměťová ochrana, sensors) nebo využít *neúmyslné* projevy materiálů.

## Teplotní útoky

### Cíl útoku

Nastavením teploty mimo dovolené meze obvodu způsobit:

* **Nefunkčnost obvodů pro mazání paměti** (zeroization circuitry) — při fyzickém útoku by mělo dojít k smazání klíčů, ale obvod při extrémní teplotě selže.
* **Nefunkčnost obvodu pro ochranu proti čtení paměti** — read-protect logic vyřazena.
* **Znemožnění zápisu do paměti EEPROM** — programovací cyklus vyžaduje specifickou teplotu (typicky 0–60 °C).
* **Generátory náhodných čísel** — TRNG založené na šumových diodách nebo ring oscillator jitter mohou při nízké teplotě *přestat fungovat správně*, výstup se stane predikovatelnějším.

### Memory remanence (paměťová zbytkovost)

Klíčový fenomén: **SRAM data přežívají** několik sekund až minut *po odpojení napájení*, zejména při nízkých teplotách. Mechanismus:

* SRAM cell je dvojice cross-coupled inverters; uchovává hodnotu díky aktivnímu napájení.
* Po odpojení napájení se uloží energie v parazitních kapacitách brány.
* Při normální teplotě cells "zapomenou" během ~milisekund.
* Při nízké teplotě (např. -50 °C) může uchovat data **desítky sekund až minuty**.

### Cold Boot Attack

[*Lest We Remember: Cold Boot Attacks on Encryption Keys*](https://citp.princeton.edu/our-work/memory/) (Halderman et al. 2008):

* Útočník odpojí napájení (powered laptop with FDE).
* Okamžitě sprej tekutý dusík nebo *freeze spray* na RAM moduly.
* Přesune RAM do *vlastního* počítače.
* Bootuje minimalistický OS, který *před* RAM clear čte obsah.
* Z RAM extrahuje **AES klíče** Full Disk Encryption (BitLocker, FileVault, dm-crypt).

Demonstrované v laboratoři Princetonu — keys recovery po **30+ minutách** off-time při dostatečně nízké teplotě.

### Útok přes vychlazení smartcard

Klasický útok na *zálohovanou SRAM* uvnitř smart card:

1. Smart card má baterii (např. CR2032) pro retention SRAM s klíči.
2. Útočník vystaví kartu nízké teplotě (-50 °C).
3. Odstraní baterii — SRAM má díky chladu **dlouhou retention time**.
4. Vyjme čip, umístí do *vlastního* readeru s vlastní baterií.
5. Přečte SRAM přes microprobing nebo testovací režim.

### Protiopatření — teplotní senzory

* **Tepelné senzory na čipu** — bandgap reference s diodami, měří teplotu ±5 °C.
* **Active zeroization při alarmu** — pokud teplota mimo $-25 \ldots +85$ °C (komerční) nebo $-40 \ldots +125$ °C (industrial/automotive), spustí zeroization.
* **Aktivní mazání zálohované SRAM** — nestačí jen odpojit napájení, *aktivně přepsat* obsah náhodnými hodnotami. Vyžaduje baterii nebo kondenzátor.
* **FIPS 140-3 Level 4** vyžaduje resistenci proti teplotnímu útoku do *libovolné* teploty (i kapalný dusík).

## Napěťové útoky

Analogické principy:

### Cíle

* **Obvody pro mazání paměti** — selhání při napětí mimo specifikaci.
* **"Security bits", "Security locks"** — bity v EEPROM, které zakazují čtení obsahu. Pokus o jejich smazání při netradičních napětích.
* **Generátory náhodných čísel** — některé TRNG při nízkém Vcc produkují *nenáhodný* výstup (např. konstantní 0).

### PIC 16C84 — Microchip — slavný útok

V druhé polovině 90. let byl objeven útok na *Microchip PIC 16C84* (běžně používaný v elektronických zařízeních, hardlocks, satellite TV dekodéry):

* Mikrokontrolér měl **lock bit** v EEPROM, který zakazoval externí čtení programu.
* **Postup útoku:**
  1. Nastavit Vcc na hodnotu **Vpp − 0.5 V** (typicky 20.5 V).
  2. Opakovaně volat instrukci *zápis lock bitu*.
  3. Tato kombinace způsobí, že lock bit se *smaže*, ale programová paměť zůstane nedotčená.
* **Výsledek:** firmware lze přečíst standardním programátorem.

Klíčové ponaučení: *kombinované* extrémy fyzikálních parametrů mohou rozbít obrany, které jednotlivě fungují.

### Protiopatření

* **Senzory napětí** — band-gap reference detekuje mimo-mezní hodnoty.
* **Brown-out detector** — při poklesu Vcc resetování CPU + zeroization.
* **Independent power for security bits** — security bity napájeny z izolovaného obvodu.

## Záření a single event upsets (SEU)

### Kosmické záření

* Vysokoenergetické částice (alpha, neutrony) z kosmického záření procházejí čipem a *přemíchávají* energii do tranzistorů.
* Důsledek: **bit flip** v paměti, registru, nebo gate. Klasický fenomén v satelitech, letadlech, jaderných reaktorech.
* Pravděpodobnost na sea level: ~1 SEU per 1 GB DRAM per měsíc. V satelitech mnohem vyšší.

### Účelová radiace

Útočník může simulovat kosmické záření:

* **Alpha emitery** (americium, plutonium) — emise alpha částic do čipu.
* **Neutron source** — neutronový zdroj (např. AmBe), high-energy neutrony.
* **X-ray** — ionizující záření z laboratorního zdroje.

Tyto útoky **chybové** ale ne triviálně cílené — útočník nemůže snadno specifikovat *který bit* flipnout.

### Protiopatření — ECC paměť

* **Single Error Correction, Double Error Detection (SECDED)** — Hamming kód, *Reed-Solomon* na DRAM/Flash.
* **Total Ionizing Dose (TID) tolerance** — pro vesmírnou aplikaci speciální *rad-hard* procesy.
* **Triple Modular Redundancy (TMR)** — tři kopie logiky, hlasování. *Standardní* v rad-hard FPGAs (Xilinx Virtex 5QV pro space).

### Rowhammer

Specifický fenomén v DDR DRAM (~2014): opakovaný přístup do jedné row paměti způsobí, že *sousední rows* "vyteklou" náboj a změní hodnotu. *Bez ohledu na ACL* — útočník bez práv může *přepsat* paměť mimo svůj address space.

* [*Flipping Bits in Memory Without Accessing Them: An Experimental Study of DRAM Disturbance Errors*](https://users.ece.cmu.edu/~yoonguk/papers/kim-isca14.pdf) (Kim et al. 2014).
* Implikace bezpečnosti: bity v kernel page tables, sandbox boundaries, crypto keys.
* Mitigace: **DDR4 with TRR** (Target Row Refresh), **ECC DRAM** (chyba se opraví), **lower refresh interval**.

## Elektromagnetic Pulse (EMP)

* **Disrupting EMP** — krátký EM pulse může resetovat zařízení nebo destruovat čipy.
* **Cíl:** *fyzicky* zničit zařízení (jednou-použití útok), nebo způsobit *reset* před zeroization.
* **Mitigace:** Faradayova klec, EM shielding, surge protectors.

## Útoky na RNG přes environment

[*Cryptographic Engineering*](https://link.springer.com/book/10.1007/978-0-387-71817-0), kap. 1:

* TRNG na šumových diodách — při nízké teplotě se *šum sníží*, výstup se stane predikovatelnějším.
* Ring oscillator TRNG — při napětí mimo specifikaci *oscillátor přestane oscilovat* nebo se zaseknete na pevné frekvenci.
* **Vystavení RF rušení** — EMI na vstupu RNG může způsobit *synchronizaci* fáze RNG na RF zdroj.

Protiopatření: **online RNG testy** ([[nist-testy|NIST SP 800-90B]]) detekují degradaci a zablokují výstup.

## Útok přes ESD (Electrostatic Discharge)

* Statická elektřina (kV pulse) na pinech karty může způsobit *random flips* v EEPROM.
* Standard: ISO/IEC 7816-1 vyžaduje testování na ESD do ±2 kV (CDM), ±8 kV (HBM).
* Útočník generuje vyšší ESD pulses pro destruktivní útok.

## Sensors v moderním BH

Soudobé certifikované smart cards (CC EAL5+, FIPS 140-3 Level 3+) mají *všechny* tyto sensors:

* Teplotní (band-gap)
* Napěťové (brown-out + high-voltage)
* Frekvenční (PLL lock detect)
* Optické (back-side photodiodes)
* Mesh tamper-detect
* EM sensors (impedance changes)

Při alarmu od *libovolného* sensors:

1. **Immediate zeroization** — random data přes všechny tajemství v RAM, EEPROM.
2. **Lock card** — bit v OTP fuse, který *neresetovatelně* zakáže další operace.
3. **Hostí notification** — vrátit specifický error code (FIPS 140-3 vyžaduje *log* události).

## Cost-effectiveness útoků

Environmentální útoky jsou *levné* (teplota → freeze spray $20, napětí → upravený programátor $50) a *rychlé* (sekundy). Proto:

* **Low-end zařízení** (smart cards $0.50) — *velmi citlivá*; není ekonomicky možné implementovat všechny obrany.
* **Mid-range zařízení** (smart cards $2) — typicky teplotní a napěťové sensors.
* **High-end zařízení** (eID cards, HSM) — *všechny* sensors, redundantní logika, post-attack zeroization.

---

*Zdroj: BZA přednášky 2025/26, BZA 06 — Chybová analýza. Externí reference: Halderman, J. A. et al.: *Lest We Remember: Cold Boot Attacks on Encryption Keys* (USENIX Security 2008) — [paper](https://citp.princeton.edu/our-work/memory/); Skorobogatov, S.: *Low-temperature data remanence in static RAM* (UCAM-CL-TR-536, 2002) — [PDF](https://www.cl.cam.ac.uk/techreports/UCAM-CL-TR-536.pdf); Kim, Y. et al.: *Flipping Bits in Memory Without Accessing Them: An Experimental Study of DRAM Disturbance Errors* (ISCA 2014) — [PDF](https://users.ece.cmu.edu/~yoonguk/papers/kim-isca14.pdf); FIPS 140-3 — *Security Requirements for Cryptographic Modules*, Section 7.7 (Environmental Failure Protection).*
