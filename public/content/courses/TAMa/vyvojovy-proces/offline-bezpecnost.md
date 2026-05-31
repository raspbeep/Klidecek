---
title: Offline architektura a bezpečnost
---

Mobilní zařízení se připojuje přes proměnlivou síť — signál kolísá, přepíná se mezi Wi-Fi a mobilními daty, občas vypadne úplně. Aplikace, která čeká na každý síťový požadavek, je v takovém prostředí nepoužitelná. Druhým specifikem je, že **zařízení se ztrácí a kradou**, takže data uložená lokálně i přenášená po síti potřebují vlastní ochranu.

## Offline-first architektura

Vzor **offline-first** obrací obvyklé pořadí: aplikace pracuje **primárně s lokálními daty** a síť bere jen jako příležitost k synchronizaci, ne jako podmínku funkčnosti. Skládá se ze tří částí.

### Lokální databáze a mezipaměť

Data se drží v lokální DB jako zrcadlo serveru — typicky **SQLite** (Android, Room je nadstavba) nebo **Core Data** (iOS). UI čte a zapisuje sem, takže nikdy nečeká na síť.

### Write-ahead fronta

Operace, které uživatel provedl offline (zápisy, mazání), se neztratí — zařadí se do **fronty odchozích operací** (write-ahead queue) v pořadí, v jakém vznikly. Fronta přežije i ukončení aplikace.

### Asynchronní synchronizace

Po obnovení sítě se fronta **na pozadí** přehraje na server. Protože dva klienti mohli mezitím změnit totéž, potřebuje synchronizace **politiku řešení konfliktů**:

* **Last-Write-Wins (LWW)** — vyhrává časově poslední zápis. Je triviální na implementaci, ale **tiše zahodí** souběžnou změnu (problém *lost update* — ztracená aktualizace). Příklad: dva uživatelé upraví offline tutéž položku košíku, jedna úprava bez varování zmizí.
* Robustnější alternativy: **CRDT** (Conflict-free Replicated Data Type — datové struktury, které se vždy bezkonfliktně sloučí), **three-way merge** s frontou konfliktů, nebo verzování s ručním řešením. CRDT řeší konflikty *datových struktur*, ne business logiky — „rezervaci posledního místa" dvěma klienty sloučí, aniž by porušení pravidla odhalil.

::: viz tama-offline-sync "Projdi krokově: uživatel pracuje offline, zápisy se řadí do write-ahead fronty, po obnovení sítě se asynchronně odešlou. Zapni konflikt a sleduj, jak LWW tiše přepíše souběžnou změnu serveru."
:::

## Bezpečnost — OWASP MASVS

Standardem pro bezpečnost mobilních aplikací je **OWASP MASVS** (*Mobile Application Security Verification Standard*). Definuje kontrolní skupiny podle plochy útoku; pro vývoj jsou nejdůležitější tyto.

| Skupina | Co řeší | Typické opatření |
|---|---|---|
| **MASVS-STORAGE** | data v klidu na zařízení | šifrování úložiště, žádná citlivá data v plaintextu/logu |
| **MASVS-CRYPTO** | kryptografie | správné algoritmy a správa klíčů (HW keystore) |
| **MASVS-NETWORK** | data při přenosu | TLS + **SSL pinning** |
| **MASVS-PLATFORM** | interakce s OS a okolím | biometrie přes HW, bezpečné meziaplikační rozhraní |
| **MASVS-AUTH** | autentizace a autorizace | správné session a tokeny |

Tři opatření, která examinátoři typicky probírají:

* **Šifrování úložiště** — citlivá data v lokální DB se šifrují; klíče se nedrží v kódu, ale v hardwarovém úložišti (Android Keystore, iOS Keychain / Secure Enclave).
* **SSL pinning** — aplikace si „přibije" očekávaný certifikát (nebo jeho veřejný klíč) serveru a odmítne i jinak platný certifikát od jiné autority. Brání odposlechu typu **man-in-the-middle**, kdy útočník podstrčí vlastní CA.
* **Hardwarová biometrie** — otisk/obličej se vyhodnocuje v zabezpečeném HW (Secure Enclave / TEE), aplikace dostane jen výsledek ano/ne, nikdy biometrický vzorek.

::: svg "Bez pinningu projde MITM s platným certifikátem cizí CA; s pinningem aplikace odmítne vše kromě přibitého klíče"
<svg viewBox="0 0 520 130" xmlns="http://www.w3.org/2000/svg">
  <!-- bez pinningu -->
  <text x="130" y="16" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--text)">bez pinningu</text>
  <rect x="14" y="24" width="64" height="34" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="46" y="44" text-anchor="middle" font-size="9" fill="var(--text)">app</text>
  <rect x="98" y="24" width="64" height="34" rx="5" fill="oklch(0.6 0.16 22 / 0.15)" stroke="oklch(0.6 0.16 22)"/>
  <text x="130" y="40" text-anchor="middle" font-size="8.5" fill="oklch(0.55 0.16 22)">MITM</text>
  <text x="130" y="52" text-anchor="middle" font-size="7.5" fill="oklch(0.55 0.16 22)">cizí CA</text>
  <rect x="182" y="24" width="64" height="34" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="214" y="44" text-anchor="middle" font-size="9" fill="var(--text)">server</text>
  <path d="M78 41 L98 41 M162 41 L182 41" stroke="oklch(0.6 0.16 22)" stroke-width="1.4" marker-end="url(#a2)"/>
  <text x="130" y="74" text-anchor="middle" font-size="8" fill="oklch(0.55 0.16 22)">cert je „platný" → projde</text>

  <!-- s pinningem -->
  <text x="400" y="16" text-anchor="middle" font-size="10.5" font-weight="600" fill="var(--text)">s pinningem</text>
  <rect x="284" y="24" width="64" height="34" rx="5" fill="var(--bg-card)" stroke="oklch(0.6 0.14 142)"/>
  <text x="316" y="40" text-anchor="middle" font-size="9" fill="var(--text)">app</text>
  <text x="316" y="51" text-anchor="middle" font-size="7" fill="oklch(0.5 0.14 142)">📌 pin</text>
  <rect x="368" y="24" width="64" height="34" rx="5" fill="oklch(0.6 0.16 22 / 0.10)" stroke="oklch(0.6 0.16 22)" stroke-dasharray="3 3"/>
  <text x="400" y="44" text-anchor="middle" font-size="8.5" fill="oklch(0.55 0.16 22)">MITM</text>
  <rect x="452" y="24" width="56" height="34" rx="5" fill="var(--bg-card)" stroke="var(--line-strong)"/>
  <text x="480" y="44" text-anchor="middle" font-size="9" fill="var(--text)">server</text>
  <path d="M348 41 L368 41" stroke="oklch(0.6 0.16 22)" stroke-width="1.4"/>
  <line x1="357" y1="34" x2="363" y2="48" stroke="oklch(0.6 0.16 22)" stroke-width="2"/>
  <line x1="363" y1="34" x2="357" y2="48" stroke="oklch(0.6 0.16 22)" stroke-width="2"/>
  <text x="396" y="74" text-anchor="middle" font-size="8" fill="oklch(0.5 0.14 142)">klíč nesedí → odmítnuto</text>
  <defs><marker id="a2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.6 0.16 22)"/></marker></defs>
</svg>
:::

::: quiz "Jaké je hlavní riziko strategie Last-Write-Wins při synchronizaci?"
- [ ] Je výpočetně náročná a zpomaluje synchronizaci.
  > Naopak, LWW je nejlevnější strategie. Problém je jinde.
- [x] Tiše zahodí souběžnou změnu druhého klienta (lost update).
  > Ano. Vyhrává jen časově poslední zápis, dřívější změna zmizí bez varování — proto se u kritických dat volí CRDT nebo merge s frontou konfliktů.
- [ ] Vyžaduje stálé připojení k síti.
  > Žádná strategie řešení konfliktů nevyžaduje stálé připojení; konflikt se řeší až při synchronizaci.
:::

::: link "OWASP MASVS — Mobile Application Security Verification Standard" "https://mas.owasp.org/MASVS/"
:::

::: link "OWASP MASTG — Network Communication / Certificate Pinning" "https://mas.owasp.org/MASTG/0x04f-Testing-Network-Communication/"
:::

::: link "DZone — Conflict Resolution: Last-Write-Wins vs. CRDTs" "https://dzone.com/articles/conflict-resolution-using-last-write-wins-vs-crdts"
:::

---

*Zdroj: SZZ NADE — předmět Tvorba aplikací pro mobilní zařízení, VUT FIT. Externí reference: OWASP MASVS / MASTG, dokumentace SQLite a Apple Core Data, Android Developers (offline-first), literatura k CRDT a eventual consistency.*
