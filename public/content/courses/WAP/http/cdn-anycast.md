---
title: CDN a Anycast směrování
---

Sebevýkonnější origin server nepřekoná rychlost světla. Putuje-li požadavek z Brna na server v Kalifornii, odhltá si jen samotná cesta tam a zpět desítky milisekund — a žádná optimalizace aplikace s tím nic neudělá. **Fyzická vzdálenost mezi serverem a klientem proto přímo limituje latenci** (a tím i dobu načítání stránky).

## CDN — obsah blízko uživateli

Řešením je **CDN** (*Content Delivery Network*) — síť **globálně rozmístěných serverů** (uzlů, *PoP* — *points of presence*), které drží kopie obsahu **co nejblíž uživatelům**. Místo jedné vzdálené centrály se statické zdroje (obrázky, CSS, JS, videa) servírují z nejbližšího uzlu. Uživatel v Evropě dostane data z evropského uzlu, uživatel v Asii z asijského — latence klesá, protože data urazí kratší cestu. CDN navíc odlehčí origin serveru a zvyšuje odolnost (výpadek jednoho uzlu nezhasne službu).

Zbývá otázka: **jak požadavek nasměrovat na ten správný — nejbližší — uzel?**

## Anycast — mnoho serverů, jedna IP

Klasické směrování je **Unicast**: jedna IP adresa = jeden konkrétní fyzický server. **Anycast** to obrací: **stovky CDN serverů po celém světě sdílejí jednu a tutéž veřejnou IP adresu**. Všechny tuto identickou IP **inzerují** do internetu směrovacím protokolem **BGP** (*Border Gateway Protocol*).

Klíčové je, **jak se najde nejbližší uzel: bez jakékoli znalosti GPS polohy uživatele.** Vyplývá to přirozeně z topologie sítě. Internetové směrovače (routery) vidí pro tutéž cílovou IP více cest a podle BGP metrik (typicky nejmenší počet *přeskoků* mezi autonomními systémy) automaticky zvolí tu **nejkratší**. Paket tak doteče do uzlu, který je síťově nejblíž — což zpravidla koreluje s nejnižší latencí.

::: svg "Unicast vs Anycast: jedna IP inzerovaná z více uzlů"
<svg viewBox="0 0 540 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="14" width="250" height="172" rx="8" fill="var(--bg-inset)" stroke="var(--line)"/>
  <text x="135" y="32" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">Unicast</text>
  <text x="135" y="46" text-anchor="middle" font-size="9" fill="var(--text-muted)">1 IP = 1 server</text>
  <circle cx="50" cy="120" r="13" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.55 0.16 264)"/>
  <text x="50" y="124" text-anchor="middle" font-size="9" fill="var(--text)">U</text>
  <text x="50" y="146" text-anchor="middle" font-size="8" fill="var(--text-muted)">uživatel</text>
  <rect x="200" y="100" width="44" height="40" rx="5" fill="oklch(0.55 0.16 22 / 0.15)" stroke="oklch(0.55 0.16 22)"/>
  <text x="222" y="118" text-anchor="middle" font-size="8.5" fill="var(--text)">server</text>
  <text x="222" y="130" text-anchor="middle" font-size="7.5" font-family="var(--font-mono)" fill="var(--text-muted)">203.0.1.5</text>
  <line x1="63" y1="118" x2="198" y2="118" stroke="var(--text-muted)" stroke-width="1.4" marker-end="url(#caArr)"/>
  <text x="130" y="110" text-anchor="middle" font-size="8" fill="var(--text-faint)">dlouhá cesta</text>
  <rect x="280" y="14" width="250" height="172" rx="8" fill="oklch(0.50 0.16 142 / 0.06)" stroke="oklch(0.50 0.16 142)"/>
  <text x="405" y="32" text-anchor="middle" font-size="12" font-weight="600" fill="oklch(0.42 0.16 142)">Anycast</text>
  <text x="405" y="46" text-anchor="middle" font-size="9" fill="var(--text-muted)">1 IP inzerovaná z N uzlů</text>
  <circle cx="320" cy="120" r="13" fill="oklch(0.62 0.14 264 / 0.18)" stroke="oklch(0.55 0.16 264)"/>
  <text x="320" y="124" text-anchor="middle" font-size="9" fill="var(--text)">U</text>
  <rect x="380" y="58" width="56" height="26" rx="4" fill="var(--bg-card)" stroke="oklch(0.50 0.16 142)"/>
  <text x="408" y="75" text-anchor="middle" font-size="8.5" font-family="var(--font-mono)" fill="var(--text-muted)">198.51.1.1</text>
  <rect x="380" y="106" width="56" height="26" rx="4" fill="oklch(0.50 0.16 142 / 0.18)" stroke="oklch(0.50 0.16 142)"/>
  <text x="408" y="123" text-anchor="middle" font-size="8.5" font-family="var(--font-mono)" fill="var(--text)">198.51.1.1</text>
  <rect x="380" y="152" width="56" height="26" rx="4" fill="var(--bg-card)" stroke="oklch(0.50 0.16 142)"/>
  <text x="408" y="169" text-anchor="middle" font-size="8.5" font-family="var(--font-mono)" fill="var(--text-muted)">198.51.1.1</text>
  <line x1="333" y1="118" x2="378" y2="119" stroke="oklch(0.50 0.16 142)" stroke-width="1.8" marker-end="url(#caArrG)"/>
  <text x="356" y="111" text-anchor="middle" font-size="8" fill="oklch(0.42 0.16 142)">nejbližší (BGP)</text>
  <line x1="333" y1="114" x2="378" y2="73" stroke="var(--line)" stroke-width="0.8" stroke-dasharray="2 2"/>
  <line x1="333" y1="122" x2="378" y2="163" stroke="var(--line)" stroke-width="0.8" stroke-dasharray="2 2"/>
  <defs>
    <marker id="caArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)"/></marker>
    <marker id="caArrG" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="oklch(0.50 0.16 142)"/></marker>
  </defs>
</svg>
:::

## Odolnost proti DDoS

Princip „jedna IP rozprostřená přes mnoho uzlů" je zároveň zásadní pro **mitigaci** (zmírnění) **DDoS útoků**. U klasického unicastu míří masivní záplava z botnetu na jeden cílový server, který se pod náporem zhroutí. U anycastu **nemá útok kam soustředit sílu**: směrovače rozprostřou škodlivý provoz podle stejného pravidla nejbližší cesty napříč **všemi** uzly globální sítě. Každý uzel pohltí jen svůj zlomek — útok se *rozředí* mezi obrovskou souhrnnou kapacitu sítě a žádný jednotlivý uzel se nezahltí. Čím víc uzlů, tím větší celková „nasávací" kapacita.

::: viz wap-anycast "Přepni mezi Unicast a Anycast a pošli buď normální požadavek, nebo DDoS záplavu. Sleduj, jak se u Anycastu provoz rozprostře mezi uzly a žádný se nezahltí."
:::

::: quiz "Jak Anycast pozná, na který z mnoha uzlů sdílejících jednu IP požadavek poslat?"
- [ ] Server zjistí GPS polohu uživatele a vrátí adresu nejbližšího uzlu.
  > Ne. Anycast žádnou GPS polohu nezjišťuje — funguje čistě na úrovni síťové topologie.
- [x] Routery podle BGP zvolí pro sdílenou IP nejkratší cestu, takže paket doteče do síťově nejbližšího uzlu.
  > Správně. Všechny uzly inzerují tutéž IP; BGP vybere nejkratší trasu, čímž se přirozeně dostaneme k nejbližšímu uzlu — bez znalosti polohy uživatele.
- [ ] Každému uživateli se přidělí vlastní unikátní IP konkrétního uzlu.
  > To by byl unicast. Podstatou anycastu je, že jednu IP sdílí mnoho uzlů.
:::

::: link "Cloudflare — What is Anycast?" "https://www.cloudflare.com/learning/cdn/glossary/anycast-network/"
:::

::: link "Cloudflare — What is a CDN?" "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/"
:::

::: link "MDN — Content delivery network (CDN)" "https://developer.mozilla.org/en-US/docs/Glossary/CDN"
:::

*Zdroj: SZZ NADE — předmět WAP — Internetové aplikace, VUT FIT. Externí reference: Cloudflare Learning Center, MDN Web Docs, RFC 4271 (BGP-4).*
