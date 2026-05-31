---
title: Principy návrhu mobilního UI
---

Omezení mobilní platformy — malá plocha, nepřesný dotyk, fragmentovaná pozornost a proměnlivé připojení — se přetavují do několika opakujících se návrhových principů. Společným jmenovatelem je **šetřit místem, pozorností i vstupem** uživatele a počítat s tím, že relace může být kdykoli přerušena.

## Vysoký poměr obsahu k ovládacím prvkům

Na úzké obrazovce soutěží obsah a ovládací prvky (*chrome* — lišty, tlačítka, dekorace) o tytéž pixely. Princip **vysokého content-to-chrome poměru** říká, že do popředí má vystoupit samotný obsah, kdežto ovládání má ustoupit do pozadí a nesmí „parazitovat" na ploše. Prakticky to znamená skrývat nepotřebné lišty při scrollu, sdružovat akce do jediného plovoucího tlačítka a vyhýbat se ozdobnému rámování, které nenese informaci.

## Uchování stavu

Protože jsou mobilní relace často přerušovány (příchozí hovor, zastávka, přepnutí aplikace), nesmí přerušení znamenat ztrátu rozpracovaných dat. Systém musí **na pozadí průběžně ukládat stav** (rozepsaný text, pozici ve formuláři, scroll, vybrané položky) a po návratu uživatele vrátit přesně tam, kde skončil. Tím se kompenzuje krátká a roztříštěná povaha mobilních relací popsaná v [[odlisnosti-desktop]].

## Progresivní odhalování a chunking

Malá obrazovka snadno zahltí. **Progresivní odhalování (*progressive disclosure*)** zobrazí nejprve jen nejnutnější možnosti a detaily odkryje až na vyžádání (rozbalovací sekce, „zobrazit více", druhá úroveň nastavení). Pro dlouhé úkoly — třeba rozsáhlý formulář — se používá **chunking**: rozdělení do několika logických, stravitelných kroků s indikací postupu, místo jediné nekonečné stránky.

## Minimalizace vstupu

Psaní na softwarové klávesnici je pomalé a chybové. Dobré rozhraní psaní **nahrazuje, ne usnadňuje**: využívá senzory a kontext telefonu, aby uživatel zadával co nejméně ručně.

* **GPS** — předvyplnění adresy / polohy místo ručního opisu.
* **Fotoaparát** — skenování platební karty, QR kódu nebo dokladu místo opisování čísel.
* **Biometrie (Touch ID / Face ID)** — přihlášení a potvrzení místo psaní hesla.
* **Našeptávání (*autocomplete*), výběr z historie, předvyplnění** z dříve zadaných údajů.

## Navigační vzory

Volba navigačního vzoru je přímou aplikací palcové zóny z [[ergonomie-thumb-zone]]: kritická navigace patří do zelené zóny a má být objevitelná, nikoli skrytá.

::: viz tama-nav-patterns "Vlevo bottom navigation (trvale v zelené zóně), vpravo hamburger. Klepnutím otevři hamburger menu — funkce jsou do té chvíle skryté a ikona leží v červené zóně horního rohu."
:::

* **Spodní navigační panel / tab bar** — považuje se za **zlatý standard**. Umisťuje 3–5 hlavních funkcí přímo do **zelené palcové zóny** a drží je **trvale na očích** → perfektní objevitelnost.
* **Hamburger menu (*side drawer*)** — ikona ☰, která po klepnutí vysune nabídku z boku. Snižuje vizuální zmatek, ale **skrývá funkce z očí** (zhoršuje objevitelnost) a sama bývá v ergonomicky nepohodlném **horním rohu (červená zóna)**. Vhodné jen pro **sekundární, méně důležité** funkce.
* **Gesta (swipe, pinch, pull-to-refresh)** — šetří místo a jsou pro pokročilé uživatele rychlá, ale jsou **skrytá s nulovou vizuální objevitelností**. Gesto je proto nutné **doplnit viditelnou alternativou** (tlačítkem) a po jeho provedení dát **zpětnou vazbu** — haptickou (vibrace) nebo vizuální (animace) — aby uživatel poznal, že akce proběhla.

::: quiz "Kdy je hamburger menu obhajitelná volba?"
- [x] Pro sekundární, méně frekventované funkce, kde úspora místa převáží nad objevitelností.
  > Ano. Hamburger schová položky za klepnutí a obvykle sedí v červené zóně; hlavní, často používané funkce proto patří do trvale viditelné spodní navigace, hamburger jen pro to ostatní.
- [ ] Vždy — šetří nejvíc místa, a to je na mobilu priorita.
  > Úspora místa nesmí jít proti objevitelnosti hlavních funkcí. Pro klíčovou navigaci je tab bar lepší.
- [ ] Když chceme hlavní funkce schovat, aby rozhraní vypadalo čistěji.
  > Skrýt hlavní funkce zhoršuje použitelnost; čistoty se dosahuje content-to-chrome poměrem, ne ukrýváním klíčové navigace.
:::

::: link "NN/g — Bottom Navigation vs. Hamburger Menu (mobile navigation)" "https://www.nngroup.com/articles/mobile-navigation-patterns/"
:::

::: link "NN/g — Progressive Disclosure" "https://www.nngroup.com/articles/progressive-disclosure/"
:::

---

*Zdroj: SZZ NADE — předmět Tvorba aplikací pro mobilní zařízení, VUT FIT. Externí reference: Nielsen Norman Group, Apple Human Interface Guidelines, Google Material Design.*
