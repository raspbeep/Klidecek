---
title: Správa identit a OAuth 2.0
---

Až dosud jsme implementovali autentizaci *uvnitř* aplikace — uživatel zadává heslo, aplikace ho ověří proti DB, [[rest-autentizace|vydává JWT]]. To je jednoduché, ale má problémy:

* **Každá aplikace spravuje vlastní uživatele** — duplicita, bezpečnostní riziko, údržba.
* **Uživatel si pamatuje mnoho hesel** — recyklace, slabá hesla, frustrace.

Řešení: **federovaná identita** — identita je spravována centrálně (jedním serverem), aplikace ji *sdílí*. Z toho plyne **Single Sign-On (SSO)** — přihlásíte se jednou, funguje to všude.

## Základní koncepty

* **Identity Provider (IdP)** — server, který *spravuje* identity a *vydává* tokeny. Příklady: Google, Facebook, Microsoft Entra ID, Keycloak.
* **Service Provider / Relying Party (SP/RP)** — aplikace, která *spoléhá* na IdP (vaše business aplikace).
* **Token** — doklad o prokázané identitě nebo oprávnění. Přenáší se mezi stranami, ověřitelný *bez* dotazu na IdP (díky podpisu).
* **Claim** — *tvrzení* o uživateli obsažené v tokenu (jméno, e-mail, role, organizace).

## Přehled standardů

V této oblasti spolu žije několik standardů, které se doplňují:

| Standard | Účel | Vrstva |
|---|---|---|
| **OAuth 2.0** | Delegovaná autorizace | Přístup ke zdrojům |
| **OpenID Connect (OIDC)** | Autentizace nad OAuth2 | Identita uživatele |
| **SAML 2.0** | Autentizace + autorizace | SSO v podnicích |
| **JWT** | Formát tokenu | Datový nosič |

OAuth 2.0 a OIDC se používají v *moderním webu*; SAML je *enterprise* standard rozšířený v podnicích. JWT je *formát* tokenu — používá se v OIDC, lze i v OAuth, ale OAuth ho nestandardizuje.

## OAuth 2.0 — delegovaná autorizace

OAuth 2.0 ([RFC 6749](https://www.rfc-editor.org/rfc/rfc6749)) je standard pro **delegovanou autorizaci**: aplikace získá *omezený* přístup ke zdrojům *jménem uživatele*, aniž by uživatel musel sdělit heslo třetí aplikaci.

Klasický příklad: **„Přihlásit přes Google"** v jiné aplikaci.

* Aplikace nepoznáte heslo k vašemu Google účtu.
* Google se zeptá: „Chcete aplikaci umožnit číst váš profil a e-mail?".
* Po souhlasu Google vydá *token*, aplikace ho použije.

> **Klíčová myšlenka**: uživatel nikdy nesděluje heslo třetí aplikaci.

### Role v OAuth 2.0

OAuth definuje *čtyři* role:

* **Resource Owner** — uživatel, který *vlastní* data (váš účet, vaše fotky, vaše dokumenty).
* **Client** — aplikace, která *žádá* o přístup (nová aplikace „SuperPhotoEditor").
* **Authorization Server** — vydává tokeny po ověření identity (např. Google Auth Server).
* **Resource Server** — API chráněné tokeny (Google Photos API).

::: viz oauth2-flow "Procházejte krok po kroku Authorization Code Flow — klasický OAuth 2.0 tok pro webové aplikace."
:::

### Typy tokenů

* **Access Token** — *krátkodobý* (minuty), opravňuje k přístupu na Resource Server.
* **Refresh Token** — *dlouhodobý* (hodiny–dny), slouží k získání nového Access Tokenu bez opětovného přihlášení uživatele. Detailně v subtopicu [[identity-java]].
* **Authorization Code** — *dočasný* kód vyměněný za tokeny (přenášen přes prohlížeč v Authorization Code Flow).

**Doporučený formát Access Tokenu**: JWT. Pozn.: OAuth 2.0 formát Access Tokenu *nestandardizuje* — někteří providery používají opaque random strings, ale JWT je rozšířený a praktický (self-contained).

## Authorization Code Flow

Nejbezpečnější a nejčastější OAuth 2.0 flow pro **webové a mobilní aplikace**:

```
Uživatel              Klient             Auth Server        Resource Server
   |                     |                    |                    |
   |-- přihlásit se ---->|                    |                    |
   |                     |---- redirect ----->|                    |
   |<------ login page --------------------- |                    |
   |--- přihlásí se + souhlas ------------->  |                    |
   |<------ redirect + auth_code -----------  |                    |
   |                     |<-- auth_code -----|                    |
   |                     |-- code + secret ->|                    |
   |                     |<-- access_token --|                    |
   |                     |-- access_token --------------------- ->|
   |                     |<-- data ----------------------------- |
```

Klíčové vlastnosti:

* **Authorization Code** se přenáší přes prohlížeč (URL parametr) — krátkodobý, jednorázový.
* **Access Token** se vyměňuje *za zády* prohlížeče (back-channel) — nikdy se neukáže uživateli.
* Mezi *frontend* (uživatelův prohlížeč) a *backend* klienta probíhá výměna `code + client_secret` → `access_token`.

V mobilních aplikacích / SPA nelze bezpečně mít `client_secret` (kdokoliv by ho mohl dekompilovat) — pro ně existuje rozšíření **PKCE** (viz níže).

## Grant typy (flows)

OAuth 2.0 definuje několik *grant typů* — variant výměny tokenů podle scénáře:

| Grant | Pro koho | Status |
|---|---|---|
| **Authorization Code** | Webové a mobilní aplikace s back-end | ✅ Doporučené (s PKCE) |
| **Client Credentials** | Server-server komunikace bez uživatele | ✅ |
| **Device Code** | Zařízení bez prohlížeče (SmartTV, IoT) | ✅ |
| ~~**Implicit**~~ | SPA bez back-end (historicky) | ❌ Zastaralé — nahrazeno Authorization Code + PKCE |
| ~~**Resource Owner Password**~~ | Trusted aplikace | ❌ Zastaralé — heslo putuje ke klientovi |

V moderní praxi se používají hlavně první tři. Implicit a Password jsou *deprecated* z bezpečnostních důvodů.

### Client Credentials Flow — server-server

Když není v hře žádný uživatel (např. mikroslužba A volá mikroslužbu B), Client Credentials:

1. Klient pošle své ID + secret na Auth Server.
2. Dostane Access Token.
3. Volá Resource Server.

Žádný browser, žádný redirect, žádný uživatel.

### Device Code Flow — TV, IoT

Pro zařízení bez klávesnice/prohlížeče:

1. Zařízení požádá Auth Server o krátký kód (např. `WXYZ-1234`).
2. Server zobrazí: „Zadejte WXYZ-1234 na google.com/device z mobilu/PC".
3. Uživatel se na druhém zařízení přihlásí + zadá kód.
4. Zařízení polluje Auth Server, dostane token.

## PKCE — Proof Key for Code Exchange

**PKCE** ([RFC 7636](https://www.rfc-editor.org/rfc/rfc7636)) je rozšíření Authorization Code Flow pro **veřejné klienty** — *mobilní aplikace*, *SPA* — které **nemohou bezpečně uchovat `client_secret`**.

Princip ochrany proti zachycení `authorization_code` při přesměrování:

1. **Klient vygeneruje náhodný `code_verifier`** (kryptografický náhodný řetězec).
2. **Odešle hash `code_challenge = SHA256(code_verifier)`** s prvotním požadavkem (`/authorize`).
3. **Auth Server si uloží `code_challenge`** vázaný k vydávanému `authorization_code`.
4. **Při výměně kódu** (`/token`) klient pošle původní `code_verifier`.
5. **Server ověří**: `SHA256(code_verifier) == code_challenge` (uložený). Pokud souhlasí, vydá tokeny.

Co tím získáme: pokud útočník zachytí `authorization_code` (např. odposlechem redirect URL), **nemůže ho použít** — nemá `code_verifier`, který klient generoval a nesdílel s nikým.

::: svg "PKCE — code_verifier zůstává u klienta, jen hash putuje na server"
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="20" width="160" height="160" rx="6" fill="oklch(0.62 0.14 264 / 0.10)" stroke="oklch(0.62 0.14 264)"/>
  <text x="90" y="42" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.40 0.14 264)">Klient (mobile/SPA)</text>
  <text x="22" y="65" font-size="11" fill="var(--text)" font-family="var(--font-mono)">code_verifier</text>
  <text x="22" y="82" font-size="11" fill="var(--text-faint)">= náhoda</text>
  <text x="22" y="108" font-size="11" fill="var(--text)" font-family="var(--font-mono)">code_challenge</text>
  <text x="22" y="124" font-size="11" fill="var(--text-faint)">= SHA256(verifier)</text>
  <text x="22" y="160" font-size="11" fill="oklch(0.40 0.14 142)" font-style="italic">verifier nikdy</text>
  <text x="22" y="174" font-size="11" fill="oklch(0.40 0.14 142)" font-style="italic">neopouští klienta</text>
  <rect x="370" y="20" width="160" height="160" rx="6" fill="oklch(0.62 0.14 22 / 0.10)" stroke="oklch(0.62 0.14 22)"/>
  <text x="450" y="42" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.42 0.14 22)">Auth Server</text>
  <text x="382" y="65" font-size="11" fill="var(--text)" font-family="var(--font-mono)">uloží:</text>
  <text x="382" y="82" font-size="11" fill="var(--text)" font-family="var(--font-mono)">code_challenge</text>
  <text x="382" y="108" font-size="11" fill="var(--text)" font-family="var(--font-mono)">ověří při exchange:</text>
  <text x="382" y="124" font-size="11" fill="var(--text)" font-family="var(--font-mono)">SHA256(verifier)</text>
  <text x="382" y="140" font-size="11" fill="var(--text)" font-family="var(--font-mono)">== challenge?</text>
  <path d="M 170 80 L 370 80" stroke="oklch(0.62 0.14 264)" stroke-width="1.4" marker-end="url(#aP)"/>
  <text x="270" y="74" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">challenge →</text>
  <path d="M 170 130 L 370 130" stroke="oklch(0.62 0.14 142)" stroke-width="1.4" marker-end="url(#aP)"/>
  <text x="270" y="124" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-family="var(--font-mono)">verifier →</text>
  <defs>
    <marker id="aP" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="var(--text)"/></marker>
  </defs>
</svg>
:::

V současnosti je **PKCE doporučeno pro VŠECHNY OAuth 2.0 klienty** — nejen veřejné. OAuth 2.1 (návrh) ho dokonce vyžaduje.

## Scopes — co aplikace žádá

**Scope** je rozsah oprávnění, o která aplikace žádá. Definuje Resource Server, *uživatel musí souhlasit*.

Příklady (Google):

* `openid` — základní identita,
* `email` — přístup k e-mailové adrese,
* `profile` — jméno, fotka,
* `https://www.googleapis.com/auth/calendar` — kalendář.

**Princip nejmenšího oprávnění** — žádáme **jen co potřebujeme**. Když aplikace potřebuje jen e-mail uživatele, neměla by žádat o `calendar` — uživatel by to mohl odmítnout a aplikace by ztratila důvěru.

## Endpointy OAuth 2.0

Auth Server obvykle vystavuje endpointy:

* **`/authorize`** — uživatel sem přijde z prohlížeče (Authorization Code Flow start).
* **`/token`** — výměna `code` za `access_token` (back-channel).
* **`/userinfo`** — info o aktuálním uživateli (přibyl s OIDC).
* **`/revoke`** ([RFC 7009](https://www.rfc-editor.org/rfc/rfc7009)) — explicitní zneplatnění tokenu.
* **`/.well-known/openid-configuration`** — discovery dokument (OIDC), URL ostatních endpointů.

## OAuth 2.0 vs. autentizace

Pozor: **OAuth 2.0 sám o sobě řeší autorizaci, ne autentizaci**. Token *opravňuje přístup* — ale *nepopisuje, kdo uživatel je*. K přidání identity nad OAuth slouží [[oidc-saml|OpenID Connect]] — *tenká autentizační vrstva* nad OAuth 2.0.

::: link "RFC 6749 — The OAuth 2.0 Authorization Framework" "https://www.rfc-editor.org/rfc/rfc6749"
:::

::: link "RFC 7636 — Proof Key for Code Exchange (PKCE)" "https://www.rfc-editor.org/rfc/rfc7636"
:::

::: link "oauth.net/2 — komunitní portál pro OAuth 2.0" "https://oauth.net/2/"
:::

::: link "Aaron Parecki — OAuth 2.0 Simplified (skvělý úvod)" "https://www.oauth.com/"
:::

::: quiz "Mobilní aplikace na Androidu chce použít OAuth 2.0 pro přihlášení přes Google. Co je správná volba flow?"
- [x] Authorization Code Flow + PKCE — kód je vyměněn za token, ale `client_secret` se nepoužívá (nelze bezpečně uchovat). PKCE chrání před zachycením kódu.
  > Ano. Toto je *moderní standard* pro mobilní/SPA klienty. Implicit Flow (starší alternativa) je deprecated, protože vystavuje token přímo v URL.
- [ ] Implicit Flow — vrátí token přímo, žádná výměna kódu.
  > Implicit je zastaralý kvůli bezpečnostním rizikům (token v URL fragmentu může uniknout). Použijte Authorization Code + PKCE.
- [ ] Resource Owner Password Grant — uživatel zadá Google heslo do aplikace.
  > **Nikdy** — uživatel nesmí sdělit Google heslo třetí aplikaci. Tento grant je zastaralý a porušuje hlavní princip OAuth.
:::

::: quiz "Aplikace žádá scope `openid email profile calendar`. Uživatel může v Google dialogu jednotlivé scopes …"
- [x] Schválit nebo odmítnout — aplikace dostane jen ty scopes, se kterými uživatel souhlasil. Princip *informed consent*.
  > Ano. Uživatel by měl chápat, co aplikace dostane, a měl by mít právo část odmítnout.
- [ ] Musí všechny schválit najednou — buď vše, nebo nic.
  > Toto je *anti-pattern* (forced consent). Google a další moderní IdP umožňují granularní souhlas — uživatel může například povolit `openid email`, ale odmítnout `calendar`.
- [ ] Nemůže ovlivnit — aplikace dostane vše, co žádá.
  > V OAuth 2.0 *vždy* je dotaz na uživatele s zobrazením scopes (consent screen). Bez explicitního souhlasu uživatele Auth Server token nevydá.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, VUT FIT, část „Správa identit, OAuth 2.0" v přednášce „Business vrstva a API" (slidy 45–57). Doplněno o praxi best practices podle OWASP a OAuth 2.1 návrhu.*
