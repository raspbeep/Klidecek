---
title: Business vrstva — EJB a CDI
---

Business vrstva implementuje **aplikační logiku** — pravidla a operace, které dělají z holé databáze fungující informační systém. V Jakarta EE pro ni existují dva komplementární mechanismy: **EJB** (Enterprise Java Beans) pro „těžké" komponenty s transakcemi a poolingem, a **CDI** (Contexts and Dependency Injection) pro obecnou injekci závislostí mezi libovolnými třídami.

## Enterprise Java Beans (EJB)

EJB jsou **business komponenty spravované EJB kontejnerem**. Zapouzdřují business logiku a poskytují *definované rozhraní* (veřejné metody). Kontejner kolem nich zajišťuje řadu služeb:

* **Dependency injection** mezi EJB navzájem,
* **Správa transakcí** — každé volání metody EJB automaticky tvoří JTA transakci (chování lze upravit anotací `@TransactionAttribute`),
* **Pooling** instancí (stateless beans),
* **Security** — `@RolesAllowed`, `@DenyAll`, kontext bezpečnosti,
* **Vzdálené volání** pro distribuované aplikace (`@Remote`),
* **Concurrency a interceptors**.

### Typy EJB podle životního cyklu

```java
@Stateless          // bezstavový — kontejner drží pool, sdílí mezi klienty
public class OrderService {
    @PersistenceContext
    private EntityManager em;

    public long create(OrderDto input) { … }
}

@Stateful           // jedna instance na klienta, drží stav (např. košík)
public class ShoppingCartBean {
    private final List<Item> items = new ArrayList<>();
    public void add(Item i) { items.add(i); }
}

@Singleton          // jedna instance na celou aplikaci (kontext sdílení)
public class TaxRateCache {
    private volatile Map<String, BigDecimal> rates;
    @Schedule(hour = "3", persistent = false)   // refresh každý den ve 3:00
    public void reload() { rates = fetchFromService(); }
}
```

| Anotace | Životnost | Vhodné pro |
|---|---|---|
| `@Stateless` | krátká, sdílená přes pool | service classes, REST endpointy logiky |
| `@Stateful` | per-klient, ukončí se logoutem | nákupní košík, wizard formuláře |
| `@Singleton` | po celou dobu běhu serveru | cache, počítadla, plánované úlohy |

### Použití EJB v jiné komponentě

V téže aplikaci stačí anotace `@EJB`:

```java
@Stateless
public class OrderResource {
    @EJB
    private OrderService service;

    public Response create(OrderDto input) {
        long id = service.create(input);     // volání běží v transakci
        return Response.created(URI.create("/orders/" + id)).build();
    }
}
```

Pro vzdálené volání mezi aplikacemi se definuje rozhraní anotované `@Remote` (klient se k EJB připojí přes JNDI lookup).

## Contexts and Dependency Injection (CDI)

CDI je *obecný* mechanismus pro DI v Javě, který funguje **i mimo EJB**. Jeho silnou stránkou je, že **téměř libovolná Javovská třída** může být *CDI bean* — stačí mít veřejný bezparametrový konstruktor.

Důvody, proč CDI používat:

* **Volné propojení** mezi třídami (přes rozhraní, ne přes konstruktor `new`),
* **Flexibilní výměna implementace** (test mock, různé implementace pro různé profily),
* **Lepší testovatelnost** (snadné mockování),
* **Bohaté lifecycle hooks** (`@PostConstruct`, `@PreDestroy`, eventy).

Použití je triviální — anotace `@Inject`:

```java
public class ReportingService {
    @Inject
    private OrderService orderService;          // CDI dodá instanci

    @Inject
    private @Named("emailNotifier") Notifier notifier;
}
```

CDI kontejner sám rozhodne, kterou instanci (a v jakém *scope*) dodá. Jediné omezení: cílová třída musí být CDI bean, tj. musí být v archivu, kde existuje `META-INF/beans.xml` nebo jsou splněna implicitní pravidla scanning.

### Scope — životnost CDI beanu

Klíčový koncept CDI je **scope** — kontext, ve kterém instance žije. Stejný typ může mít *různé* životnosti podle anotace.

::: viz cdi-scopes "Klikněte na anotaci a sledujte, jak různé scope reagují na sled HTTP požadavků."
:::

| Scope | Životnost | Typické použití |
|---|---|---|
| `@Dependent` (default) | shoduje se s vlastníkem (např. zaniká s tím, kdo ji injektoval) | pomocné objekty bez vlastního stavu |
| `@RequestScoped` | po dobu jednoho HTTP požadavku | per-request kontext (request-scoped DAO, audit) |
| `@SessionScoped` | po dobu uživatelské HTTP session | košík, přihlášený uživatel (vyžaduje `Serializable`) |
| `@ApplicationScoped` | po celou dobu běhu aplikace (singleton-like) | konfigurace, cache, sdílené prostředky |
| `@ConversationScoped` | déle než request, kratší než session — řízeno programátorem | wizardy přes více obrazovek (s JSF) |

Pokud má být bean dostupný z výrazového jazyka (EL — `#{cart.total}` v JSF/Facelets), přidá se ještě anotace **`@Named`**:

```java
@SessionScoped
@Named                  // dostupné v JSF jako #{shoppingCart}
public class ShoppingCart implements Serializable { … }
```

**Pozor** na kolize: anotace `@RequestScoped`, `@SessionScoped` a `@ApplicationScoped` existují ve dvou „rodinách" — starší v `jakarta.faces.bean.*` (zastaralé) a CDI v `jakarta.enterprise.context.*`. Vždy importujte z CDI balíčku.

## CDI vs. EJB — kdy co?

CDI a EJB se nevylučují; *EJB je vlastně specializovaný typ CDI beanu*. Praktická volba:

* **CDI** stačí pro většinu business logiky bez transakcí (pomocné služby, validace, helpery).
* **EJB** (typicky `@Stateless`) volte tam, kde chcete **deklarativní transakce, security, pooling** nebo **vzdálené volání** zadarmo od kontejneru.
* V *MicroProfile* aplikacích se EJB obvykle vůbec nepoužívá — vystačíte si s CDI plus `@Transactional` (z Jakarta Transactions API), které dnes funguje i nad CDI beany.

::: link "Jakarta Enterprise Beans (EJB) — specifikace" "https://jakarta.ee/specifications/enterprise-beans/"
:::

::: link "Jakarta Contexts and Dependency Injection (CDI) — specifikace" "https://jakarta.ee/specifications/cdi/"
:::

::: link "Weld — referenční implementace CDI (Red Hat)" "https://weld.cdi-spec.org/"
:::

::: link "Adam Bien — „Real World Jakarta EE" (kniha)" "https://adambien.blog/"
:::

::: quiz "V mikroslužbě potřebujete službu, která pro celou aplikaci drží předpočítaný kurzovní lístek a aktualizuje ho 1× za hodinu. Která anotace je nejvhodnější?"
- [x] `@ApplicationScoped` (CDI) nebo `@Singleton` (EJB) — jedna sdílená instance na celou aplikaci.
  > Přesně. Singleton kontext zajistí, že kurzovní lístek se počítá jen jednou a všichni klienti čtou totéž.
- [ ] `@RequestScoped` — bezpečnější.
  > Naopak — request-scoped by znamenalo načítat kurzovní lístek znovu pro každý HTTP request. Pomalé a zbytečné.
- [ ] `@SessionScoped` — uživatel chce vidět stejné kurzy.
  > Session-scoped duplikuje stav per uživatel; pro globální kurzovní lístek nevhodné.
:::

::: quiz "Která dvojice tvrzení o EJB a CDI je správná?"
- [x] EJB poskytuje navíc deklarativní transakce, pooling a security; CDI je obecnější a lehčí, používá se i mimo EE.
  > Ano. EJB lze chápat jako CDI bean s extra službami od kontejneru.
- [ ] EJB i CDI mají identickou funkcionalitu a liší se jen názvem.
  > Ne, EJB má řadu extra služeb (transakce, security, pooling, remote).
- [ ] CDI nelze používat dohromady s EJB.
  > Naopak — `@Inject` funguje pro CDI beany i pro EJB; EJB navíc lze injektovat přes `@EJB`.
:::

---

*Zdroj: přednášky PIS — doc. R. Burget, VUT FIT, část „Business vrstva — EJB a CDI" v přednášce „Backend a platforma Jakarta EE".*
