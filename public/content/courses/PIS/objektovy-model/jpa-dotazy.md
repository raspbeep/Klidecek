---
title: JPA dotazy — JPQL, TypedQuery, NamedQuery, Criteria
---

JPA poskytuje **dva základní dotazovací jazyky**:

* **JPQL** (*Java Persistence Query Language*) — textový jazyk podobný SQL, ale **pracuje s entitami a jejich vlastnostmi**, ne s tabulkami a sloupci. Implementace přeloží JPQL do SQL podle konkrétního dialektu.
* **Criteria API** — typově bezpečné, programátorsky sestavované dotazy. Mírně upovídané, ale ideální pro **dynamické dotazy** (where klauzule se mění podle uživatelského vstupu).

V této přednášce se zaměříme na JPQL, který je v 90 % případů to, co stačí.

## JPQL — základy

JPQL píšeme nad **entitami**, ne nad tabulkami:

```jpql
SELECT p FROM Person p WHERE p.name = "John"
```

* `Person` je *jméno entity* (typicky se shoduje s názvem třídy).
* `p` je *alias* pro instanci entity.
* `p.name` je *jméno property* (Java field) — nepoužívá se název sloupce v DB.

JPA implementace tento dotaz přeloží do SQL přibližně takto:

```sql
SELECT * FROM person WHERE name = 'John'
```

Klíčový rozdíl od SQL: výsledkem **není záznam, ale objekt** — `Person`, který je hned po načtení v *managed* stavu.

### Parametry v JPQL

Hodnoty se předávají pojmenovanými (`:name`) nebo poziční (`?1`) parametry — *nikdy nezakomponovávat řetězce přímo*:

```jpql
SELECT c FROM Car c WHERE c.reg LIKE :pref
```

```java
TypedQuery<Car> q = em.createQuery(
    "SELECT c FROM Car c WHERE c.reg LIKE :pref", Car.class);
q.setParameter("pref", "BVA%");
List<Car> cars = q.getResultList();
```

Pojmenované parametry jsou *bezpečné proti SQL injection* — implementace je přeloží na `PreparedStatement` placeholdery.

### Konstrukce nových objektů — `SELECT NEW`

JPQL umí vytvořit instance DTO (libovolné Java třídy, ne nutně entity) přímo v projekci:

```jpql
SELECT NEW cz.vutbr.fit.CarStats(c.type, COUNT(c))
FROM Car c
GROUP BY c.type
```

To je velmi praktické pro reporty a agregace — výsledkem dotazu je `List<CarStats>`, ne `List<Object[]>`. Třída `CarStats` musí mít konstruktor s odpovídajícími parametry. Pozor — musí se uvádět **plně kvalifikované jméno** třídy.

### Další konstrukce JPQL

| Konstrukce | Příklad | Význam |
|---|---|---|
| `JOIN` | `SELECT p FROM Person p JOIN p.cars c WHERE c.year > 2020` | Spojení přes vztah (ne přes JoinColumn) |
| `LEFT JOIN FETCH` | `SELECT p FROM Person p LEFT JOIN FETCH p.cars` | Eager fetch — zabraňuje N+1 problému |
| `IN` | `WHERE c.color IN ('red', 'blue')` | Množinová příslušnost |
| Agregace | `SELECT COUNT(p), AVG(p.salary) FROM Person p` | `COUNT`, `SUM`, `AVG`, `MAX`, `MIN` |
| `GROUP BY` / `HAVING` | `… GROUP BY p.dept HAVING COUNT(p) > 5` | Skupinové dotazy |
| `ORDER BY` | `… ORDER BY p.surname ASC, p.name ASC` | Řazení |
| Podotaz | `WHERE p.age > (SELECT AVG(x.age) FROM Person x)` | Skalární / korelované podotazy |

## TypedQuery — typově bezpečné výsledky

Místo netypovaného `Query`, který vrací `List<Object>`, používáme generickou variantu **`TypedQuery<T>`**:

```java
TypedQuery<Person> q = em.createQuery(
    "SELECT p FROM Person p WHERE p.name = :name", Person.class);
q.setParameter("name", "Alice");
q.setFirstResult(0);                  // offset (paging)
q.setMaxResults(50);                  // limit  (paging)
List<Person> result = q.getResultList();
```

Hlavní metody:

| Metoda | Význam |
|---|---|
| `setParameter(name, value)` | Předání hodnoty parametru. |
| `setFirstResult(n)` | Offset — počet záznamů, které se mají přeskočit (pro stránkování). |
| `setMaxResults(n)` | Maximální počet vrácených záznamů. |
| `getResultList()` | Vrátí `List<T>` — i prázdný, pokud nic neodpovídá. |
| `getSingleResult()` | Vrátí *jeden* objekt; vyhodí `NoResultException` (žádný) nebo `NonUniqueResultException` (více). |
| `getResultStream()` | Vrátí `Stream<T>` (lazy iterace přes výsledky). |

## Pojmenované dotazy — `@NamedQuery`

Pokud se týž dotaz používá na více místech, vyplatí se ho **pojmenovat** přímo u entity:

```java
@Entity
@Table(name = "person")
@NamedQuery(name = "Person.findAll",
            query = "SELECT p FROM Person p")
public class Person {

    @Id @GeneratedValue(strategy = IDENTITY)
    private long id;
    // …
}
```

Pro více dotazů použijeme `@NamedQueries`:

```java
@Entity
@NamedQueries({
    @NamedQuery(name = "Person.findAll",
                query = "SELECT p FROM Person p"),
    @NamedQuery(name = "Person.findByName",
                query = "SELECT p FROM Person p WHERE p.name = :name")
})
public class Person { … }
```

Použití:

```java
List<Person> people =
    em.createNamedQuery("Person.findByName", Person.class)
      .setParameter("name", "Alice")
      .setFirstResult(0)
      .setMaxResults(50)
      .getResultList();
```

Výhody pojmenovaných dotazů:

* **JPQL se kontroluje při startu aplikace** — chyby v dotazu se projeví ihned, ne až za běhu.
* Dotaz se v paměti **parsuje jen jednou**.
* Centrální místo pro evidenci — když chcete vědět, jak se s entitou pracuje, koukněte na její `@NamedQueries`.
* Konvence pojmenování `Entity.action` (např. `Person.findByName`) je velmi rozšířená a usnadňuje navigaci.

## Criteria API — typově bezpečné dynamické dotazy

Pokud potřebujete dotaz **složit dynamicky** (např. uživatel vyplní 0–N filtrů ve formuláři), psát to konkatenací řetězců JPQL je nebezpečné. Pro to slouží **Criteria API**:

```java
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<Person> cq = cb.createQuery(Person.class);
Root<Person> p = cq.from(Person.class);

List<Predicate> filters = new ArrayList<>();
if (nameFilter != null) {
    filters.add(cb.equal(p.get("name"), nameFilter));
}
if (minAge != null) {
    filters.add(cb.greaterThanOrEqualTo(p.get("age"), minAge));
}
if (!filters.isEmpty()) {
    cq.where(filters.toArray(new Predicate[0]));
}

cq.orderBy(cb.asc(p.get("surname")));

List<Person> result = em.createQuery(cq)
                        .setMaxResults(50)
                        .getResultList();
```

Criteria je *upovídanější* než JPQL, ale:

* **typově bezpečné** (s metamodelovými třídami `Person_` má kontrolu i nad jmény properties),
* **kompozovatelné** (predikáty si můžete uložit do proměnných a kombinovat),
* **nehrozí SQL injection** (vše jsou parametry).

Pro statické dotazy je JPQL stručnější a čitelnější — Criteria volte tam, kde se *struktura dotazu* za běhu mění.

## Native SQL — únikové dveře

Pokud potřebujete *něco speciálního z konkrétní DB* (windowing funkce, `WITH RECURSIVE`, full-text index…), JPQL/Criteria nestačí. Pak existuje **native SQL**:

```java
List<Person> result =
    em.createNativeQuery("SELECT * FROM person WHERE name ~ :rx", Person.class)
      .setParameter("rx", "^A.*")          // PostgreSQL regex
      .getResultList();
```

Pozor — *přenositelnost* je v tu chvíli pryč, protože nativní SQL je vázané na konkrétní DB dialekt.

## Co si odnést

* **JPQL** je SQL-like jazyk nad entitami, ne nad tabulkami. Implementace ho přeloží do dialekt-specifického SQL.
* **`TypedQuery<T>`** dává typovou bezpečnost; `setFirstResult` + `setMaxResults` pro stránkování.
* **`@NamedQuery`** centralizuje a validuje dotazy při startu; konvence `Entity.action`.
* **Criteria API** pro dynamické dotazy se měnící strukturou.
* **Native SQL** existuje, ale lépe se mu vyhnout — porušuje přenositelnost.

::: link "Jakarta Persistence (JPA) Query Language — referenční specifikace" "https://jakarta.ee/specifications/persistence/"
:::

::: link "Vlado Mihalcea — JPQL JOIN FETCH a N+1 problém (vynikající blog post)" "https://vladmihalcea.com/jpql-join-fetch/"
:::

::: link "Baeldung — Introduction to JPA Criteria API" "https://www.baeldung.com/hibernate-criteria-queries"
:::

::: link "Thoughts on Java — JPA Native Queries" "https://thorben-janssen.com/jpa-native-queries/"
:::

::: quiz "Chcete vrátit prvních 50 osob seřazených podle příjmení. Který kód je správně?"
- [x] `em.createQuery("SELECT p FROM Person p ORDER BY p.surname", Person.class).setMaxResults(50).getResultList()`
  > Ano. `setMaxResults` je standardní způsob, jak omezit počet výsledků v JPQL/JPA — implementace si sama doplní `LIMIT` (nebo ekvivalent) do generovaného SQL.
- [ ] `em.createQuery("SELECT p FROM Person p ORDER BY p.surname LIMIT 50", Person.class).getResultList()`
  > Ne — JPQL klauzuli `LIMIT` nemá. Použijte `setMaxResults`. Stejně tak nemá `OFFSET`.
- [ ] `em.createQuery("SELECT TOP 50 p FROM Person p ORDER BY p.surname", Person.class).getResultList()`
  > `TOP` je proprietární syntaxe SQL Serveru a v JPQL ji najdete nikdy. Použijte `setMaxResults`.
:::

::: quiz "Kdy se vyplatí použít `@NamedQuery` místo dotazu přímo v kódu?"
- [x] Pro **opakovaně používané** dotazy a tam, kde chceme **validaci JPQL při startu** aplikace.
  > Ano. Hlavní výhoda je včasná detekce chyb (před nasazením) a centralizace dotazů u entity. Pro jednorázové ad-hoc dotazy je inline JPQL OK.
- [ ] Vždy — inline `createQuery` se nepoužívá.
  > Naopak, inline `createQuery` je legitimní pro místně specifické dotazy. `@NamedQuery` jen pro opakovaně použité.
- [ ] Jen pokud DB vyžaduje stored procedure.
  > To je něco úplně jiného — JPA má anotaci `@NamedStoredProcedureQuery` pro volání procedur, ale s běžnými `@NamedQuery` to nesouvisí.
:::

---

*Zdroj: přednášky PIS — prof. T. Hruška & doc. R. Burget, VUT FIT, přednáška „Objektový model dat", část „Dotazování, JPQL dotazy, pojmenované dotazy" (slidy 59–63).*
