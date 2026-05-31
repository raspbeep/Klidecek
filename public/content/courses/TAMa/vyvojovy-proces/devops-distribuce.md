---
title: Mobilní DevOps a distribuce
---

Dostat hotový kód k uživatelům je u mobilu samostatná disciplína. Na rozdíl od webu, kde se nasazuje na vlastní server, naráží mobilní vývoj na **bariéry platforem Apple a Google**: aplikace se distribuuje jen přes obchody a veškerý spustitelný kód musí být **kryptograficky podepsán**.

## Code signing — podepisování kódu

Apple i Google vyžadují, aby byl kód podepsán certifikátem vydaným platformou. Bez korektního podpisu se aplikace ani nenainstaluje na zařízení, natož aby prošla do obchodu. U iOS jde o souhru tří artefaktů, jejichž záměna je častou příčinou selhání buildu.

| Artefakt | Odpovídá na otázku | Obsah |
|---|---|---|
| **Certifikát** (+ privátní klíč) | *kdo* podepisuje | identita vývojáře, řetěz důvěry od Apple |
| **Provisioning profile** | *kde a co* smí běžet | Bundle ID, certifikát, *entitlements*, seznam zařízení |
| **Entitlements** | *co* aplikace smí | oprávnění (push notifikace, Apple Pay, App Groups…) |

::: svg "Tři role iOS code signingu: kdo / kde a co / co aplikace smí"
<svg viewBox="0 0 520 120" xmlns="http://www.w3.org/2000/svg">
  <rect x="14" y="24" width="156" height="78" rx="7" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.62 0.14 264)"/>
  <text x="92" y="44" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Certifikát</text>
  <text x="92" y="62" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">kdo podepisuje</text>
  <text x="92" y="84" text-anchor="middle" font-size="9" fill="var(--text-faint)" font-family="var(--font-mono)">identita + klíč</text>

  <rect x="182" y="24" width="156" height="78" rx="7" fill="oklch(0.6 0.14 142 / 0.10)" stroke="oklch(0.6 0.14 142)"/>
  <text x="260" y="44" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Provisioning profile</text>
  <text x="260" y="62" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">kde a co smí běžet</text>
  <text x="260" y="84" text-anchor="middle" font-size="9" fill="var(--text-faint)" font-family="var(--font-mono)">Bundle ID + zařízení</text>

  <rect x="350" y="24" width="156" height="78" rx="7" fill="oklch(0.62 0.14 80 / 0.12)" stroke="oklch(0.62 0.14 80)"/>
  <text x="428" y="44" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">Entitlements</text>
  <text x="428" y="62" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">co aplikace smí</text>
  <text x="428" y="84" text-anchor="middle" font-size="9" fill="var(--text-faint)" font-family="var(--font-mono)">push, Pay, Groups…</text>
</svg>
:::

## CI/CD pro mobil

Ruční podepisování a build na lokálním Macu se v týmu nestíhá. Pomáhá automatizovaná **CI/CD** infrastruktura — pro iOS nutně na **macOS strojích** (kompilace vyžaduje Xcode), typicky v cloudu (**Bitrise** poskytuje dedikované macOS runnery), s **Fastlane** jako nástrojem pro automatizaci jednotlivých kroků.

```bash
# Fastlane lane: build a podpis iOS aplikace v CI
lane :beta do
  match(type: "appstore")     # stáhne podepisovací cert + profil ze šifrovaného úložiště
  build_app(scheme: "MyApp")  # kompilace přes Xcode → .ipa
  upload_to_testflight        # zkušební distribuce testerům
end
```

Pipeline řeší tři kroky:

1. **Kompilace** nativních binárek (`.ipa` pro iOS, `.aab`/`.apk` pro Android) na cloudových strojích.
2. **Automatické podepisování** kryptografickým klíčem ze šifrovaného úložiště (Fastlane *match* drží certifikáty a profily v zašifrovaném gitu).
3. **Zkušební distribuce** testerům — **TestFlight** (iOS) a **Google Play Console** (interní/uzavřené testovací kanály) ještě před produkcí.

## Staged Rollout — postupné uvolňování

Aktualizace se do produkce nepouští všem najednou. **Staged rollout** (postupné uvolňování) ji zavádí postupně k rostoucímu procentu uživatelů, takže kritický pád se odhalí na malém vzorku a lze rychle **zastavit (halt)** a nasadit hotfix dřív, než zasáhne všechny.

Obě platformy se zásadně liší v tom, *kdo řídí tempo*:

* **Apple App Store** — pevný **7denní rozvrh** s automatickým postupem: **1 %, 2 %, 5 %, 10 %, 20 %, 50 %, 100 %**. Vývojář může release pozastavit (až 30 dní), ale procenta ani délku nemění.
* **Google Play** — vývojář si **volí procenta i tempo sám** (žádný pevný rozvrh ani strop délky), rollout může kdykoliv zvýšit, zastavit i obnovit.

V obou případech je staged rollout dostupný jen pro **aktualizace**, ne pro první vydání aplikace.

::: viz tama-staged-rollout "Přepni mezi App Store (pevný 7denní rozvrh) a Play (volená procenta). Posuvníkem postupuj rolloutem; zaškrtni „kritický pád" a sleduj halt — zbylí uživatelé zůstanou na staré verzi."
:::

## OTA aktualizace

Pojem **OTA** (*Over-the-Air*) znamená, že si zařízení stahují a instalují balíčky **bez připojení k počítači** — což je u mobilů standard (na rozdíl od historických instalací přes kabel). Pozor na rozsah: distribuce *nové verze přes obchod* je OTA, ale projde schvalovacím procesem; některé frameworky (např. React Native s CodePush / Expo Updates) navíc umí **OTA aktualizovat jen JavaScriptový balíček** mimo obchod, ovšem **pouze pokud se nemění nativní kód** — jinak je nové vydání přes obchod nevyhnutelné.

::: quiz "Čím se liší staged rollout na App Store a na Google Play?"
- [ ] Na obou si vývojář volí procenta i délku libovolně.
  > To platí jen pro Google Play. Apple má pevný rozvrh.
- [x] Apple má pevný 7denní rozvrh (1/2/5/10/20/50/100 %), Google Play si tempo i procenta volí vývojář.
  > Přesně. Apple postup automatizuje a dovolí jen pozastavení; Google nechává plnou kontrolu nad procenty i tempem.
- [ ] Staged rollout lze použít i pro úplně první vydání aplikace.
  > Ne — na obou platformách je dostupný jen pro aktualizace, ne pro první publikaci.
:::

::: link "App Store Connect — Release a version update in phases" "https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases/"
:::

::: link "Play Console — Release app updates with staged rollouts" "https://support.google.com/googleplay/android-developer/answer/6346149?hl=en"
:::

::: link "Fastlane — automatizace buildu a podpisu (docs)" "https://docs.fastlane.tools/"
:::

---

*Zdroj: SZZ NADE — předmět Tvorba aplikací pro mobilní zařízení, VUT FIT. Externí reference: Apple App Store Connect Help, Google Play Console Help, Fastlane a Bitrise dokumentace, Apple Developer (code signing).*
