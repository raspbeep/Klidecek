---
title: OpenID Connect a SAML — autentizační vrstva
---

[[identita-oauth2|OAuth 2.0]] sám o sobě řeší pouze **autorizaci** — vydává tokeny, které opravňují přístup ke zdrojům. Ale nedává *standardní způsob*, jak aplikace pozná, **kdo uživatel je** — žádné standardizované claims, žádné endpointy pro identity. Dvě klíčové technologie tento problém řeší:

* **OpenID Connect (OIDC)** — *tenká autentizační vrstva* nad OAuth 2.0. Dnešní standard pro moderní web a mobile.
* **SAML 2.0** — *starší* XML-based standard, rozšířený v podnicích pro federované SSO.

## OpenID Connect (OIDC)

**[OpenID Connect](https://openid.net/connect/)** je vrstva přidaná **nad OAuth 2.0**, která doplňuje autentizační aspekt:

* **OAuth 2.0** řeší autorizaci (klient získá přístup ke zdrojům).
* **OIDC přidává autentizaci** — *klient se dozví, kdo je uživatel*, nejen že má přístup.

OIDC byl vyvinut, protože OAuth 2.0 sám stačí pro „autorizační" případy (typu „pusť mě k mým fotkám"), ale ne pro „kdo se přihlásil" (typu „přihlásit přes Google" — kdy aplikace chce vědět jméno, e-mail, fotku).

### Co OIDC přidává nad OAuth 2.0

* **ID Token** — JWT s informacemi o uživateli (*identity claims*).
* **UserInfo Endpoint** — dotaz na další claims (rozšířená data, která se nevejdou do tokenu).
* **Standardizované claims**: `sub` (subject = uživatel), `name`, `email`, `picture`, `email_verified`, …
* **Discovery Dokument** — popis IdP na `/.well-known/openid-configuration`. Klient z něj sám zjistí URL všech endpointů.

### OIDC — ID Token

ID Token je JWT, který vydá Auth Server **po úspěšném přihlášení**. Standardní claims:

| Claim | Význam |
|---|---|
| `iss` | vydavatel — URL IdP |
| `sub` | *subject* — unikátní identifikátor uživatele u IdP |
| `aud` | *audience* — Client ID aplikace (komu je token určen) |
| `exp` | expirace (Unix timestamp) |
| `iat` | *issued at* — čas vydání |
| `name`, `email`, `picture` | rozšířené claims (pokud aplikace má scope) |

Příklad payloadu:

```json
{
  "iss": "https://accounts.google.com",
  "sub": "110169484474386276334",
  "aud": "812741506391",
  "email": "jan.novak@gmail.com",
  "name": "Jan Novák",
  "exp": 1748435212,
  "iat": 1748431612
}
```

Klient ID Token *přečte* a získá identitu uživatele bez dalších volání. Pokud chce *čerstvější* nebo *podrobnější* data, zavolá UserInfo Endpoint.

### OIDC — tok přihlášení

Standardní *Authorization Code Flow s OIDC* (rozšiřuje OAuth tak, aby vrátil i ID Token):

```
1. Klient přesměruje uživatele na IdP s parametry:
   response_type=code, scope=openid email, client_id, redirect_uri, nonce

2. Uživatel se přihlásí u IdP (zadá heslo, MFA, atd.).

3. IdP přesměruje zpět na klientovo redirect_uri s parametrem ?code=...

4. Klient (back-end) vymění code za access_token + id_token na /token endpointu.

5. Klient ověří podpis id_token a claims (iss, aud, exp, nonce).

6. Volitelně: klient dotáží /userinfo endpoint pro další claims.
```

Důležité je **`scope=openid`** — bez něj IdP považuje request za čistě OAuth 2.0 a nevydává ID Token. **`nonce`** je náhodný řetězec, který aplikace generuje a očekává v `id_token`, jako ochrana proti replay-attack.

### Discovery Dokument

OIDC standardizuje endpoint **`/.well-known/openid-configuration`** — JSON s metadaty IdP:

```json
{
  "issuer": "https://accounts.google.com",
  "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
  "token_endpoint": "https://oauth2.googleapis.com/token",
  "userinfo_endpoint": "https://openidconnect.googleapis.com/v1/userinfo",
  "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs",
  "scopes_supported": ["openid", "email", "profile"],
  "response_types_supported": ["code", "token", "id_token", ...],
  ...
}
```

Klient si discovery dokument stáhne *jednou* a má všechny URL — nemusíte je hard-codovat.

## SAML 2.0

**SAML** (*Security Assertion Markup Language*) je *starší* standard z roku 2005 ([OASIS](https://www.oasis-open.org/committees/security/)). Charakteristiky:

* **XML-based** — assertions jsou XML dokumenty s digitálním podpisem.
* **Rozšířený v podnicích** — typicky firemní SSO do externích SaaS aplikací (Salesforce, Workday, Slack, …).
* **Zaměřený na SSO mezi organizacemi** (*federace*).

### Role

* **Identity Provider (IdP)** — spravuje uživatele, vydává *assertions*.
* **Service Provider (SP)** — aplikace, přijímá *assertions*.

### SAML 2.0 — tok přihlášení (SP-initiated)

```
1. Uživatel přistoupí na SP (aplikaci).

2. SP přesměruje na IdP s AuthnRequest (XML).

3. Uživatel se přihlásí u IdP.

4. IdP pošle SAML Response s podepsanou Assertion na SP (přes prohlížeč, POST).

5. SP ověří podpis a zpracuje assertions.

6. Uživatel je přihlášen.
```

Assertion je *XML dokument* podepsaný privátním klíčem IdP. SP ověřuje veřejným klíčem (sdíleným při založení federace).

### SAML vs. OIDC — co volit

| | OIDC | SAML |
|---|---|---|
| Formát | JSON / JWT | XML |
| Vzhled | Moderní, lightweight | Verbose, enterprise feel |
| Mobile-friendly | Ano | Špatně |
| Diskové místo | Token ~1–2 KB | Assertion 5–10 KB |
| Komplexita | Středně složité | Velmi složité |
| Rozšířenost | Web/mobile, Google, Microsoft (Entra) | Podniky, Workday, Salesforce |
| Stáří | 2014 | 2005 |
| Volba pro nový projekt | ✅ | Pouze pokud máte enterprise SAML IdP |

V novém projektu volte OIDC. SAML zachováte v interakci s legacy enterprise systémy.

## Keycloak — open-source IAM server

[**Keycloak**](https://www.keycloak.org/) je open-source **Identity and Access Management** server vyvinutý Red Hatem. Často používaný v Java enterprise světě:

* **Implementuje OAuth 2.0, OIDC, SAML 2.0** najednou,
* **Správa uživatelů, rolí, skupin** — vlastní DB, nebo federovaná s LDAP/Active Directory,
* **Sociální přihlášení** (Google, GitHub, Facebook…) — jako broker pro externí providery,
* **Administrátorská konzole, REST API pro správu** — kompletní self-service,
* **Realms** — multi-tenancy, oddělení mezi aplikacemi/zákazníky.

### Architektura Keycloak deployment

```
[Browser/Mobile] ──redirect──> [Keycloak (IdP)] ──auth──> [LDAP/Google/...]
                                      │
                                      │ token (OIDC ID Token + OAuth Access Token)
                                      ▼
[Vaše Java aplikace] ←── verify ──── [JWT]
       │
       │ access
       ▼
[Resource Server / DB]
```

Keycloak je „all-in-one" — IdP + Auth Server + (volitelně) User Federation. Aplikace se na něj připojuje přes standardní OIDC/SAML.

### Alternativy Keycloak

| Produkt | Charakter |
|---|---|
| **Auth0** (Okta) | Cloud-only, SaaS, freemium |
| **Microsoft Entra ID** (Azure AD) | Cloud, integrace s Microsoft 365 |
| **Okta** | Cloud, enterprise-fokus |
| **AWS Cognito** | AWS-native |
| **Ory Kratos/Hydra** | Lightweight, open-source, microservices-friendly |
| **Authentik** | Open-source, web-first, alternativa Keycloaku |

V akademickém / open-source projektu obvykle **Keycloak**. V cloud / SaaS projektu obvykle **Auth0** nebo **Entra ID**.

## OIDC a SAML — kdy co

* **Nový projekt, web/mobile** → OIDC. Standardní, lightweight, dnešní best practice.
* **Federace s enterprise IdP** (firemní AD/ADFS) → SAML může být *vynucený* (firma má SAML, jiné nepodporuje).
* **Integrace s SaaS aplikacemi** (Salesforce, Workday, Slack, …) → SAML pro „login s firemním účtem".
* **SPA + REST API** → OIDC + Authorization Code + PKCE.

V mnoha case-ech se podporují *obě* — IdP (Keycloak) vystavuje SAML i OIDC, aplikace zvolí co se hodí.

::: link "OpenID Connect Core 1.0" "https://openid.net/specs/openid-connect-core-1_0.html"
:::

::: link "openid.net/connect — komunitní portál" "https://openid.net/connect/"
:::

::: link "SAML 2.0 Technical Overview (OASIS)" "https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html"
:::

::: link "Keycloak — open-source IAM server" "https://www.keycloak.org/"
:::

::: link "Aaron Parecki — OIDC vs OAuth 2.0 — co je rozdíl" "https://www.oauth.com/oauth2-servers/openid-connect/"
:::

::: quiz "Webová aplikace chce „přihlásit přes Google" pro získání jména a e-mailu uživatele. Co je správný protokol?"
- [x] OpenID Connect (OIDC) — Google jako IdP. Aplikace pošle `scope=openid email profile`, dostane ID Token s identitou.
  > Ano. To je standardní *authentication* use case — nejde jen o autorizaci přístupu ke zdrojům, ale o poznání identity uživatele.
- [ ] OAuth 2.0 bez OIDC — stačí Access Token.
  > OAuth 2.0 sám neposkytuje standardizovaný způsob, jak číst identitu uživatele. ID Token z OIDC je k tomu určen.
- [ ] SAML 2.0 — federace s Google.
  > Google podporuje OIDC i SAML, ale pro novou webovou aplikaci je OIDC mnohem lehčí a moderní volba.
:::

::: quiz "Firma vyžaduje, aby přihlášení do nové aplikace probíhalo přes jejich existující SAML 2.0 IdP (Active Directory Federation Services). Co volíte?"
- [x] Aplikace bude SAML Service Provider; přijme SAML Response, ověří podpis. Volitelně může vystavovat *vlastní* OIDC API pro mobile klienty (Keycloak může brokerovat).
  > Ano. Když IdP je SAML, aplikace se musí přizpůsobit. Brokering přes Keycloak (SAML in, OIDC out) je častý vzorec.
- [ ] Nepoužívat SAML; donutit firmu nasadit OIDC.
  > V enterprise prostředí nemůžete diktovat IT oddělení změnu IdP. Adaptace k existujícímu standardu je správný přístup.
- [ ] Implementovat vlastní login s heslem, ignorovat SAML.
  > Porušuje SSO požadavek a uživatelé by museli mít další heslo. Hlavní výhoda federace by zmizela.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, VUT FIT, část „OpenID Connect, SAML, Keycloak" v přednášce „Business vrstva a API" (slidy 54–60).*
