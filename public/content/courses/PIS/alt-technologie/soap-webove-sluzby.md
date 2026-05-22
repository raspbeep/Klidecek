---
title: SOAP / Webové služby a XML-RPC
---

Předchozí podkapitoly probraly **prezentační vrstvu** ([[prezentacni-vrstva]]) a **alternativní platformy** ([[alt-platformy]]) — *jak* postavit IS a *na čem*. Teď se přesouváme k *komunikaci mezi komponentami* — kterými protokoly si IS posílá data.

REST a GraphQL ([[rest-design]], [[graphql]]) jsou pro většinu aplikací dnešní praxí. **Před nimi** ale existovala bohatá generace standardů, které se snažily *maximálně formalizovat* volání serverových služeb přes HTTP. Tyto technologie stále **běží v provozu** — banky, státní správa, B2B integrace, legacy enterprise systémy. Proto je dobré jim rozumět.

## Vývoj standardizace API

::: svg "Historický vývoj API protokolů — od jednoduchého RPC k pragmatickému REST a zpět k typovaným RPC"
<svg viewBox="0 0 540 180" xmlns="http://www.w3.org/2000/svg">
  <line x1="20" y1="100" x2="520" y2="100" stroke="var(--line)" stroke-width="1"/>
  <text x="60" y="125" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">XML-RPC</text>
  <text x="60" y="140" text-anchor="middle" font-size="9" fill="var(--text-muted)">1998</text>
  <circle cx="60" cy="100" r="5" fill="oklch(0.55 0.18 264)"/>
  <text x="180" y="125" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">SOAP/WSDL</text>
  <text x="180" y="140" text-anchor="middle" font-size="9" fill="var(--text-muted)">2000–2007</text>
  <circle cx="180" cy="100" r="5" fill="oklch(0.55 0.18 22)"/>
  <text x="300" y="125" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">REST</text>
  <text x="300" y="140" text-anchor="middle" font-size="9" fill="var(--text-muted)">2000+ (mainstream ~2010)</text>
  <circle cx="300" cy="100" r="5" fill="oklch(0.55 0.18 142)"/>
  <text x="410" y="125" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">GraphQL</text>
  <text x="410" y="140" text-anchor="middle" font-size="9" fill="var(--text-muted)">2015</text>
  <circle cx="410" cy="100" r="5" fill="oklch(0.55 0.18 340)"/>
  <text x="490" y="125" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text)">gRPC</text>
  <text x="490" y="140" text-anchor="middle" font-size="9" fill="var(--text-muted)">2016</text>
  <circle cx="490" cy="100" r="5" fill="oklch(0.55 0.18 80)"/>
  <text x="60" y="70" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-style="italic">jednoduché</text>
  <text x="180" y="70" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-style="italic">silně typované</text>
  <text x="300" y="70" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-style="italic">flexibilní</text>
  <text x="410" y="70" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-style="italic">tvarované</text>
  <text x="490" y="70" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-style="italic">binární RPC</text>
  <text x="270" y="170" text-anchor="middle" font-size="10" fill="var(--text-faint)" font-style="italic">Pendulum: standardizace → flexibilita → znovu standardizace.</text>
</svg>
:::

Vidíme cyklus: jednoduché RPC → komplikovaný SOAP → reakce v podobě REST (radikální zjednodušení) → ad-hoc problémy REST → zpět ke striktně typovaným formátům (gRPC, GraphQL).

## XML-RPC — předchůdce webových služeb

**XML-RPC** ([specifikace 1998](http://xmlrpc.com/spec.md)) je nejjednodušší ze všech: *zpráva = XML s názvem metody a parametry*. Podporuje primitivní typy (`int`, `double`, `string`, `boolean`, `dateTime.iso8601`, `base64`) + složené (`<array>`, `<struct>`).

### Volání

```xml
<?xml version="1.0"?>
<methodCall>
    <methodName>trida.jePrvocislo</methodName>
    <params>
        <param>
            <value><int>1345</int></value>
        </param>
    </params>
</methodCall>
```

### Odpověď

```xml
<?xml version="1.0"?>
<methodResponse>
    <params>
        <param>
            <value><boolean>0</boolean></value>
        </param>
    </params>
</methodResponse>
```

### Volání z PHP

```php
function xmlrpc($url, $method, $params, $types = [], $encoding = 'utf-8') {
    foreach ($types as $key => $val) {
        xmlrpc_set_type($params[$key], $val);
    }
    $context = stream_context_create([
        'http' => [
            'method'  => "POST",
            'header'  => "Content-Type: text/xml",
            'content' => xmlrpc_encode_request($method, $params, ['encoding' => $encoding])
        ]
    ]);
    $response = file_get_contents($url, false, $context);
    return xmlrpc_decode($response);
}
```

XML-RPC je **stále používaný** — WordPress, Pingback protocol, některé blogging API.

## SOAP / WSDL — „enterprise" webové služby

**SOAP** (Simple Object Access Protocol) a **WSDL** (Web Services Description Language) byly W3C standardy, které se snažily o *plně formalizovaný* RPC nad HTTP s XML zprávami.

Tři pilíře této generace:

* **WSDL** — XML popis rozhraní služby (jaké metody, parametry, návratové typy, URL).
* **SOAP** — XML obalený do *envelope* + *body* pro volání samotné.
* **UDDI** / **WSIL** — adresáře/seznamy služeb (málo přijato v praxi).

### WSDL — popis rozhraní

Platformově nezávislý XML dokument využívající *XML Namespaces* a *XML Schema*. Definuje:

* **Messages** — strukturu vstupních a výstupních dat,
* **PortType** — operace (metody) + jejich vstupy/výstupy,
* **Binding** — jak zprávy přenášet (typicky SOAP nad HTTP),
* **Service** + **port** — konkrétní URL.

Příklad:

```xml
<message name="jePrvocisloRequest">
    <part name="cislo" type="xsd:long"/>
</message>
<message name="jePrvocisloResponse">
    <part name="return" type="xsd:boolean"/>
</message>

<portType name="Cisla">
    <operation name="jePrvocislo" parameterOrder="cislo">
        <input  message="m:jePrvocisloRequest"  name="jePrvocisloRequest"/>
        <output message="m:jePrvocisloResponse" name="jePrvocisloResponse"/>
    </operation>
</portType>

<binding name="cislaSoapBinding" type="m:Cisla">
    ...
</binding>
<service name="CislaService">
    <port binding="m:cislaSoapBinding" name="cisla">
        <wsdlsoap:address location="http://nekde.cz/cisla"/>
    </port>
</service>
```

### Použití WSDL

Hlavní výhoda WSDL: **automatické generování klienta i serveru** v cílovém jazyce.

* **Stub** — zástupná metoda, která vypadá jako normální lokální metoda, ale uvnitř posílá SOAP přes HTTP.
* **Skeleton** — server-side zástupná třída, kterou doplníte business logikou.

Vývojové nástroje (Eclipse, Visual Studio) dokáží **„jedním kliknutím"** vygenerovat WS z anotované třídy/rozhraní.

### SOAP volání — XML envelope

```xml
<env:Envelope
    xmlns:env="http://schemas.xmlsoap.org/soap/envelope/"
    env:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"
    xmlns:xs="http://www.w3.org/1999/XMLSchema"
    xmlns:xsi="http://www.w3.org/1999/XMLSchema-instance">
  <env:Header/>
  <env:Body>
    <m:jePrvocislo xmlns:m="urn:mojeURI">
      <cislo xsi:type="xs:long">1987</cislo>
    </m:jePrvocislo>
  </env:Body>
</env:Envelope>
```

### SOAP odpověď

```xml
<env:Envelope ...>
  <env:Body>
    <ns1:jePrvocisloResponse xmlns:ns1="urn:mojeURI"
        env:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
      <return xsi:type="xsd:boolean">true</return>
    </ns1:jePrvocisloResponse>
  </env:Body>
</env:Envelope>
```

Vidíte rychle, proč REST zvítězil — SOAP je *mnohonásobně víc bytů*, *mnohonásobně víc XML obalování* a *vyžaduje speciální klienty*. Curl test je nemožný.

## UDDI a WSIL — vyhledávání služeb

**UDDI** (Universal Description, Discovery and Integration) — idea *centrálního registru*, kam poskytovatelé ukládají WSDL popisy a klienti je prohledávají. V praxi se neujalo (málokterá firma chtěla být v public adresáři).

**WSIL** (Web Services Inspection Language) — alternativa: poskytovatel zveřejní seznam svých služeb v souboru `/inspection.wsil`. Klient ten soubor stáhne a najde, co je k dispozici.

## Implementace SOAP

### Jakarta EE — JAX-WS

```java
package helloservice.endpoint;

import javax.jws.WebService;
import javax.jws.WebMethod;

@WebService
public class Hello {
    public Hello() {}

    @WebMethod
    public String sayHello(String name) {
        return "Hello, " + name;
    }
}
```

Kontejner **automaticky vygeneruje WSDL** z anotací třídy. Klient ho stáhne a vygeneruje proxy třídu.

### PHP — SoapServer / SoapClient

PHP má SOAP rozšíření přímo v jádře. Server:

```php
<?php
function sayHello($name) {
    return "Hello, " . $name;
}
$server = new SoapServer(null,
    ['uri' => "urn://helloservice/endpoint"]);
$server->addFunction('sayHello');
$server->handle();
```

Klient:

```php
$client = new SoapClient(null,
    ['location' => "http://.../simple_server.php",
     'uri'      => "urn://my/namespace"]);
$result = $client->__soapCall("sayHello", ['Karel']);
print $result;        // "Hello, Karel"
```

S WSDL klient *automaticky zveřejní vzdálené metody*:

```php
$soap = new SoapClient('http://api.search.live.net/search.wsdl');
print_r($soap->__getFunctions());      // seznam dostupných metod
$ret = $soap->Search(...);
```

## Kdy SOAP dnes ještě potkáte

* Veřejné správní rozhraní (např. *EPO portál*, ARES, daňová správa),
* Bankovní B2B integrace (SWIFT, ISO 20022),
* Legacy enterprise systémy (SAP, Oracle ERP),
* Java-Java integrace, kde WSDL→stub je velmi pohodlný,
* Tam, kde *vyžadují kontrakt* a *garantovanou typovou integritu*.

## Co si odnést

* SOAP byl pokusem o *plnou standardizaci* RPC — naprogramujte rozhraní, vygenerujte WSDL, klient si vygeneruje stub, vše je strongly-typed.
* Cena: extrémní *XML balónky*, kterým je obtížné ručně rozumět, nutnost speciálních klientů, špatná čitelnost.
* REST tu cenu nezaplatil — místo silné typovosti dostal *uniformní rozhraní* a *čitelnost*. Cenou je *žádný kontrakt*. Z toho pak vznikly novější odpovědi: **OpenAPI** (kontrakt pro REST), **GraphQL** (typový schema), **gRPC** (binární strongly-typed RPC).

::: link "WSDL 2.0 primer" "https://www.w3.org/TR/wsdl20-primer/"
:::

::: link "SOAP 1.2 part 0 primer" "https://www.w3.org/TR/soap12-part0/"
:::

::: link "W3C Web Services Activity (historický přehled)" "https://www.w3.org/2002/ws/"
:::

::: link "Jakarta XML Web Services (JAX-WS) — specifikace" "https://jakarta.ee/specifications/xml-web-services/"
:::

::: quiz "Proč REST vyhrál nad SOAP pro veřejné webové API?"
- [x] Jednodušší zprávy (JSON), bez nutnosti speciálního klienta, snadná čitelnost a debug přes curl.
  > Ano. SOAP byl typo-formálně lepší, ale praktická bariéra vstupu (XML envelope, WSDL toolchain) byla příliš vysoká.
- [ ] REST je rychlejší než SOAP (binárně menší).
  > Ano, ale to byl důsledek, ne příčina. Klíčové bylo *vývojářské UX*.
- [ ] SOAP nepodporuje HTTPS.
  > Podporuje — to není ten problém.
:::

::: quiz "Co je `WSDL` v rámci SOAP architektury?"
- [x] XML popis rozhraní webové služby — definuje metody, parametry, URL endpointy.
  > Ano. WSDL je *kontrakt*, podle kterého klient generuje proxy a server validuje volání.
- [ ] Šifrovací protokol nad SOAP.
  > Ne, to je WS-Security.
- [ ] Adresář služeb (jako DNS).
  > Ne, to je UDDI nebo WSIL.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, prof. T. Hruška, VUT FIT, část „Standardizace API — předchůdci REST" v přednášce „Alternativní technologie a architektury" (slidy 42–63).*
