---
title: Síťový reputační systém a RFC 7070–7072
---

# Síťový reputační systém

Modely výpočtu skóre ([[vypocet-skore]]) lze aplikovat i v *síti*: místo prodejce na tržišti hodnotíme **uzel** (typicky IP adresu). Síťový reputační systém odpovídá na otázku „jak *rizikové* je komunikovat s tímto uzlem?".

## Reputace není černá listina

Klíčový rozdíl oproti blacklistu:

- Reputace je **služba založená na hodnocení** — *není to černá listina* (binární „povoleno / zakázáno").
- Reputace vyjadřuje, **jak „rizikové"** je komunikovat s daným uzlem — spojité skóre, ne ano/ne.
- Reputace je **časově podmíněná** — riziko se v čase mění (viz faktor zapomínání v [[vypocet-skore]]).

Proto skóre vyžaduje **dobře vysvětlenou interpretaci**: tvrzení „uzel A posílá spam s pravděpodobností 54 %" je užitečnější než pouhé „A je na blacklistu".

::: quiz "Čím se síťový reputační systém liší od blacklistu?"
- [x] Vrací spojité, časově podmíněné skóre rizika — ne binární verdikt 'povoleno/zakázáno'.
  > Ano. Reputace je *hodnocení míry rizika*, ne členství v seznamu. Umožní jemnější rozhodnutí (např. greylisting v šedé zóně).
- [ ] Je rychlejší, protože stačí jeden dotaz do seznamu.
  > Rychlost není podstata rozdílu. Reputace naopak typicky koreluje víc dat než prostý lookup do seznamu.
- [ ] Blacklist je vždy přesnější, reputace jen odhaduje.
  > Naopak — blacklist je hrubé binární dělení. Reputace přidává granularitu, confidence a historii, kterou blacklist nemá.
:::

## Architektura síťového reputačního systému

Síťový reputační systém poskytuje platformu pro **monitorování aktivit v síti**: sbírá data ze senzorů, koreluje je a počítá skóre či míru rizika s ohledem na historii. Tok dat:

::: svg "Source Data Processing sbírá vstupy → Entity Database (entita = IP) → Reputation Score Estimation → User interface API"
<svg viewBox="0 0 540 210" font-family="ui-sans-serif, system-ui" font-size="11">
  <!-- input sources -->
  <g>
    <rect x="8" y="18" width="120" height="24" rx="5" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="68" y="34" text-anchor="middle" fill="var(--text)" font-size="10.5">IDS/IPS alerts</text>
    <rect x="8" y="50" width="120" height="24" rx="5" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="68" y="66" text-anchor="middle" fill="var(--text)" font-size="10.5">honeypot / firewall</text>
    <rect x="8" y="82" width="120" height="24" rx="5" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="68" y="98" text-anchor="middle" fill="var(--text)" font-size="10.5">network probes</text>
    <rect x="8" y="114" width="120" height="40" rx="5" fill="var(--bg-card)" stroke="var(--line)"/>
    <text x="68" y="130" text-anchor="middle" fill="var(--text-muted)" font-size="10">blacklisty, AS,</text>
    <text x="68" y="144" text-anchor="middle" fill="var(--text-muted)" font-size="10">geo, DNS, whois</text>
  </g>
  <!-- source data processing -->
  <rect x="150" y="56" width="96" height="60" rx="6" fill="var(--bg-inset)" stroke="var(--accent)" stroke-width="1.4"/>
  <text x="198" y="80" text-anchor="middle" fill="var(--text)" font-size="10.5">Source Data</text>
  <text x="198" y="94" text-anchor="middle" fill="var(--text)" font-size="10.5">Processing</text>
  <g stroke="var(--line-strong)" stroke-width="1.1" marker-end="url(#arNS)">
    <line x1="128" y1="30" x2="150" y2="68"/>
    <line x1="128" y1="62" x2="150" y2="80"/>
    <line x1="128" y1="94" x2="150" y2="92"/>
    <line x1="128" y1="134" x2="150" y2="104"/>
  </g>
  <!-- entity DB -->
  <ellipse cx="320" cy="72" rx="42" ry="9" fill="var(--bg-inset)" stroke="var(--accent)" stroke-width="1.4"/>
  <path d="M278 72 v40 a42 9 0 0 0 84 0 v-40" fill="var(--bg-card)" stroke="var(--accent)" stroke-width="1.4"/>
  <text x="320" y="96" text-anchor="middle" fill="var(--text)" font-size="10.5">Entity DB</text>
  <text x="320" y="132" text-anchor="middle" fill="var(--text-muted)" font-size="10">entity ID = IP adresa</text>
  <line x1="246" y1="86" x2="276" y2="86" stroke="var(--line-strong)" stroke-width="1.1" marker-end="url(#arNS)"/>
  <!-- score estimation -->
  <rect x="384" y="20" width="148" height="40" rx="6" fill="var(--bg-card)" stroke="var(--line)"/>
  <text x="458" y="36" text-anchor="middle" fill="var(--text)" font-size="10.5">Reputation Score</text>
  <text x="458" y="50" text-anchor="middle" fill="var(--text-muted)" font-size="10">ML · weighted sum · Beta</text>
  <line x1="356" y1="64" x2="400" y2="58" stroke="var(--line-strong)" stroke-width="1.1" marker-end="url(#arNS)"/>
  <!-- user API -->
  <rect x="384" y="92" width="148" height="40" rx="6" fill="var(--bg-inset)" stroke="var(--accent)" stroke-width="1.4"/>
  <text x="458" y="108" text-anchor="middle" fill="var(--text)" font-size="10.5">User interface API</text>
  <text x="458" y="122" text-anchor="middle" fill="var(--text-muted)" font-size="10">query / response</text>
  <line x1="362" y1="96" x2="400" y2="106" stroke="var(--line-strong)" stroke-width="1.1" marker-end="url(#arNS)"/>
  <text x="430" y="160" text-anchor="middle" fill="var(--accent)" font-size="11">↑ query / ↓ response</text>
  <defs>
    <marker id="arNS" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--line-strong)"/>
    </marker>
  </defs>
</svg>
:::

Komponenty:

- **Source Data Processing** — sběr a normalizace vstupů.
- **Entity Database** — úložiště entit; **entity ID = IP adresa**.
- **Reputation Score Estimation** — výpočet skóre (machine learning, weighted sum, Beta density function).
- **User interface API** — dotaz/odpověď pro klienta.

### Jaká vstupní data se používají

- Záznamy z logů firewallu či IDS — např. **IP adresa a port útočníka**.
- Velikost IP datagramu, hodnoty z hlavičky TCP (**MSS, options**).
- Počet žádostí o příchozí či odchozí spojení.
- Otisk zprávy, seznam spammerů, **URI**, reverzní záznamy z DNS.
- Doplňková data: **blacklisty, čísla AS, geolokace, DNS, whois, open-proxy** databáze.

## Komunikace dle RFC 7070

Standardizovanou komunikaci popisuje trojice RFC z listopadu 2013. Model je **klient–server**:

- **Reputační klient** — chce ohodnotit daný obsah (např. e-mail) na základě *zájmového identifikátoru* (např. jména domény odesílatele).
- **Reputační služba** — sbírá a ukládá reputační data, počítá skóre, odpovídá klientům.

### Dotaz klienta dle RFC 7072

Dotaz obsahuje **ID klienta, název aplikace (kontext), předmět dotazu a tvrzení**. Reputační služba definuje *šablonu dotazu (template)* ve formátu **HTTP URI**:

```text
http://service/application/subject/assertion
```

Příklad — klient se ptá služby `rep.example.net` v kontextu `email-id`, zda je doména `example.com` hodnocena jako `spam`:

```text
http://rep.example.net/email-id/example.com/spam
```

### Odpověď reputon dle RFC 7071

Služba vrátí **reputon** ve formátu **`application/reputon+json`**. Reputon je jeden nezávislý objekt s reputační informací; na jeden dotaz může přijít *více* reputonů (např. od různých kritérií). Sestav dotaz a podívej se na odpovídající reputon:

::: viz pds-reputon
:::

Význam polí: **rater** (entita poskytující hodnocení), **assertion** (tvrzení, např. „spam"), **rating** (úroveň důvěry, 0,012 ≈ doména hodnocena jako spam s pravděpodobností 1,2 %), **confidence** (jistota hodnocení, 0,95 = 95 %), **sample-size** (počet hodnot použitých k výpočtu skóre). Volitelně i `identity` (způsob ověření, např. DKIM/SPF) a `updated` (čas aktualizace).

::: link "RFC 7070 — An Architecture for Reputation Reporting" "https://www.rfc-editor.org/rfc/rfc7070.html"
:::

::: link "RFC 7071 — A Media Type for Reputation Interchange (reputon)" "https://www.rfc-editor.org/rfc/rfc7071.html"
:::

::: link "RFC 7072 — A Reputation Query Protocol" "https://www.rfc-editor.org/rfc/rfc7072.html"
:::

*Zdroj: PDS — přednáška Reputační systémy, doc. Ing. Petr Matoušek, Ph.D., M.A., FIT VUT v Brně. Externí reference: [RFC 7070 — An Architecture for Reputation Reporting](https://www.rfc-editor.org/rfc/rfc7070.html); [RFC 7071 — A Media Type for Reputation Interchange](https://www.rfc-editor.org/rfc/rfc7071.html); [RFC 7072 — A Reputation Query Protocol](https://www.rfc-editor.org/rfc/rfc7072.html) (vše Borenstein, N., Kucherawy, M., IETF, listopad 2013).*
