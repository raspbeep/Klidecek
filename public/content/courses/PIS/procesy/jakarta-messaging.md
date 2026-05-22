# Jakarta Messaging — JMS, @MessageDriven, MicroProfile Reactive Messaging

Když známe teorii zotavitelných front ([[zotavitelne-fronty]]), zbývá ukázat, jak je realizovat v Jakarta EE. Standardní cestou je **Jakarta Messaging (JMS)** — historické JMS rozhraní, dnes součást Jakarta EE. Pro reaktivní mikroslužby existuje modernější alternativa **MicroProfile Reactive Messaging** (viz [[microprofile]]).

## Jakarta Messaging (JMS)

**Jakarta Messaging** (balíček `jakarta.jms`) je standardní Jakarta EE API pro práci s **message brokery**. Poskytuje **jednotné rozhraní** pro různé brokery: ActiveMQ Artemis, IBM MQ, Oracle AQ, … (pro RabbitMQ existuje adaptér).

JMS rozlišuje **dva komunikační modely**:

- **Point-to-Point (Queue)** — zpráva jde *právě jednomu konzumentovi*. Odpovídá **zotavitelné frontě** z [[zotavitelne-fronty]] — typický scénář pro úlohy (order processing, image conversion).
- **Publish/Subscribe (Topic)** — zpráva jde *všem přihlášeným konzumentům*. Vhodné pro broadcastovou notifikaci (změny katalogu, statusové události).

JMS tedy realizuje vrstvu *„odděleného aplikačního modulu (message broker)”* z [[zotavitelne-fronty]].

## JMS XA — atomicky DB + fronta

**Centrální problém,** který motivoval celou cestu od reálných událostí: provést atomicky *„ulož do DB”* a *„vlož do fronty”*. JMS to řeší díky **JMS XA** — broker se chová jako **XA resource**, koordinovaný JTA pomocí 2PC (viz [[distribuovane-transakce]]).

| Výsledek transakce | Co se stane se zprávou |
| :--- | :--- |
| **Rollback** | Zpráva se *neodešle* — záznam je odstraněn z fronty. |
| **Commit** | Zpráva je *jistě doručena* — přežije i restart systému. |

Tím **odpadá nutnost explicitního čítače** pro detekci stavu fyzické události — XA protokol zajistí konzistenci automaticky.

### Příklad producenta s JMS XA

```java
@Stateless
public class ObjednavkaService {

    @PersistenceContext
    EntityManager em;

    @Resource(lookup = "java:app/jms/ConnectionFactory")
    ConnectionFactory cf;            // musí být XA-aware

    @Resource(lookup = "java:app/jms/ExpediceQueue")
    Queue expediceQueue;

    @Transactional
    public void vytvorObjednavku(Objednavka o) {
        em.persist(o);                          // DB část
        try (JMSContext ctx = cf.createContext()) {
            ctx.createProducer()
               .send(expediceQueue, o.getId()); // fronta část
        }
        // JTA: 2PC → DB + broker commitují atomicky
    }
}
```

Připojení `ConnectionFactory` **musí být XA-aware** (např. `ArtemisXAConnectionFactory` u ActiveMQ Artemis), jinak by JTA nedokázalo brokera zapojit do 2PC.

## @MessageDriven — EJB konzument

Pro asynchronní konzumaci zpráv definuje Jakarta EE speciální typ EJB: **Message-Driven Bean (MDB)**. Anotuje se `@MessageDriven` a implementuje `MessageListener.onMessage()`. Kontejner volá `onMessage()` pro každou došlou zprávu, asynchronně a transakčně.

```java
@MessageDriven(activationConfig = {
    @ActivationConfigProperty(
        propertyName  = "destination",
        propertyValue = "java:app/jms/ExpediceQueue")
})
public class ExpediceMDB implements MessageListener {

    @Override
    @Transactional
    public void onMessage(Message msg) {
        long objednavkaId = msg.getBody(Long.class);
        // zpracuj expedici — v nové transakci
    }
}
```

`@MessageDriven` bean je **EJB konzument zotavitelné fronty** — odpovídá *„Vyber”* operaci v terminologii z [[zotavitelne-fronty]]. Kontejner zajistí transakční koordinaci: pokud `onMessage()` skončí výjimkou, transakce se rollbackne a *zpráva se vrátí do fronty* (viz vlastnosti zotavitelné fronty).

## MicroProfile Reactive Messaging — alternativa pro mikroslužby

V mikroservisové architektuře (viz [[mikrosluzby]]) je klasické JMS s blokujícím threading-modelem často nevhodné. **MicroProfile Reactive Messaging** přináší neblokující reaktivní API postavené nad **Reactive Streams**.

```java
@ApplicationScoped
public class ObjednavkaProducer {

    @Inject
    @Channel("objednavky-out")
    Emitter<Long> emitter;

    public void vytvorObjednavku(Objednavka o) {
        em.persist(o);
        emitter.send(o.getId());      // async odeslání na kanál
    }
}
```

- **Kanál** (`objednavky-out`) je namapován v konfiguraci (`microprofile-config.properties`) na konkrétní broker — Kafka, RabbitMQ, AMQP, MQTT, …
- **`@Outgoing` / `@Incoming`** odpovídají rolím *producenta* a *konzumenta* fronty.
- Implementace: **SmallRye Reactive Messaging** (v Quarkus, Open Liberty, Helidon).

## JMS vs. MicroProfile Reactive Messaging

| Aspekt | Jakarta Messaging (JMS) | MP Reactive Messaging |
| :--- | :--- | :--- |
| **Threading** | Blokující | Neblokující (Reactive Streams) |
| **Typický kontext** | Jakarta EE aplikace | Mikroslužby |
| **Transakce** | JTA (XA) — silná atomicity | Závisí na brokeru a konfiguraci (často idempotentní konzumace) |
| **Konzument** | `@MessageDriven` MDB | CDI bean s `@Incoming` |
| **Broker** | ActiveMQ Artemis, IBM MQ, Oracle AQ, … | Kafka, RabbitMQ, AMQP, MQTT, … |

Obě řeší **stejný problém**: asynchronní zpracování zpráv přes broker. Volba mezi nimi je především otázkou *architektonického stylu*: pro klasický Jakarta EE monolit s JTA → JMS; pro mikroslužby s vysokou propustností → MP Reactive Messaging.

> **MP Reactive Messaging je podrobněji rozebráno v přednášce p05** ([[messaging-fault-tolerance]]) — zde se omezujeme na principiální srovnání s JMS.

Workflow systémy — BPMN, BPEL, Camunda, Temporal — jsou *aplikační vrstvou nad* zotavitelnými frontami a kompenzujícími transakcemi. Implementačně využívají všechny mechanismy probrané v této kapitole.

---

*Zdroj: PIS přednáška 6, doc. Ing. Radek Burget, Ph.D., FIT VUT v Brně. Externí reference: [Jakarta Messaging 3.1 specifikace](https://jakarta.ee/specifications/messaging/3.1/), [MicroProfile Reactive Messaging](https://download.eclipse.org/microprofile/microprofile-reactive-messaging-3.0/microprofile-reactive-messaging-spec-3.0.html), [SmallRye Reactive Messaging](https://smallrye.io/smallrye-reactive-messaging/); Hohpe, G., Woolf, B.: *Enterprise Integration Patterns* (Addison-Wesley 2003).*
