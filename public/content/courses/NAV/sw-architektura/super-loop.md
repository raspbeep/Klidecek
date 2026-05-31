---
title: Hlavní smyčka (super-loop)
---

Nejjednodušší a zároveň nejrozšířenější způsob, jak zorganizovat program ve vestavěném systému bez operačního systému, je **hlavní smyčka** — anglicky *super-loop* nebo *bare-metal architektura*. Program se po startu skládá ze dvou částí: jednorázové **inicializace** a následujícího **nekonečného cyklu**, který se vykonává znovu a znovu po celou dobu běhu zařízení.

Jeden průchod smyčkou typicky postupuje sekvenčně ve třech krocích: **přečtení vstupů** (tlačítka, senzory, příchozí data), **zpracování logiky** (rozhodnutí, výpočty, stavové přechody) a **zápis výstupů** (aktuátory, LED, odesílaná data). Po dokončení se cyklus okamžitě opakuje.

```c
int main(void) {
    hw_init();              // hodiny, GPIO, periferie, přerušení — jen jednou
    app_init();

    for (;;) {              // nekonečná hlavní smyčka
        read_inputs();      // 1) čtení vstupů
        update_logic();     // 2) zpracování logiky
        write_outputs();    // 3) zápis výstupů
    }
    /* sem se program nikdy nedostane */
}
```

::: svg "Dvě fáze programu: jednorázová inicializace a nekonečná hlavní smyčka"
<svg viewBox="0 0 520 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="16" y="50" width="120" height="46" rx="8" fill="oklch(0.62 0.14 264 / 0.12)" stroke="oklch(0.6 0.14 264)"/>
  <text x="76" y="70" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text)">init()</text>
  <text x="76" y="86" text-anchor="middle" font-size="9.5" fill="var(--text-muted)">jen jednou</text>
  <line x1="136" y1="73" x2="172" y2="73" stroke="var(--line-strong)" stroke-width="1.4" marker-end="url(#slmA)"/>
  <rect x="176" y="24" width="318" height="100" rx="10" fill="var(--bg-inset)" stroke="var(--line)" stroke-dasharray="4 3"/>
  <text x="335" y="42" text-anchor="middle" font-size="10.5" fill="var(--text-muted)" font-family="var(--font-mono)">for (;;) { … }</text>
  <rect x="192" y="56" width="92" height="44" rx="6" fill="oklch(0.65 0.13 264 / 0.4)" stroke="oklch(0.6 0.14 264)"/>
  <text x="238" y="82" text-anchor="middle" font-size="10" fill="var(--text)">čtení vstupů</text>
  <rect x="294" y="56" width="92" height="44" rx="6" fill="oklch(0.65 0.13 22 / 0.4)" stroke="oklch(0.6 0.14 22)"/>
  <text x="340" y="82" text-anchor="middle" font-size="10" fill="var(--text)">logika</text>
  <rect x="396" y="56" width="92" height="44" rx="6" fill="oklch(0.65 0.13 142 / 0.4)" stroke="oklch(0.6 0.14 142)"/>
  <text x="442" y="82" text-anchor="middle" font-size="10" fill="var(--text)">zápis výstupů</text>
  <path d="M 442 100 L 442 116 L 238 116 L 238 100" fill="none" stroke="var(--line-strong)" stroke-width="1.2" marker-end="url(#slmA)"/>
  <defs>
    <marker id="slmA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="var(--line-strong)"/>
    </marker>
  </defs>
</svg>
:::

## Proč je super-loop tak oblíbený

Síla tohoto modelu je v jeho minimalismu. Celý program běží v **jediném vlákně řízení** — neexistuje preemptivní plánovač, který by mezi úlohami přepínal. Z toho plyne celá řada vlastností, které jsou pro malá zařízení s omezenými zdroji ideální.

* **Žádná souběžnost mezi úlohami.** Protože se v každém okamžiku vykonává právě jeden úsek kódu a další úloha začne až po dokončení té předchozí, nemohou nastat klasické problémy paralelismu jako **uváznutí** (deadlock) nebo **inverze priorit**. (Sdílení dat s obsluhou přerušení je samostatná kapitola — viz [[preruseni-isr]].)
* **Nulová režie plánovače.** Není co plánovat, takže odpadá **přepínání kontextu** (ukládání a obnova registrů při změně úlohy). Procesor tráví čas užitečnou prací, ne správou běhu.
* **Jediný zásobník.** Celý program si vystačí s **jedním společným zásobníkem (stack)**. Operační systém reálného času (RTOS) naopak potřebuje samostatný zásobník pro každý task, což na zařízení s pár kilobajty RAM rychle dojde.
* **Snadná předvídatelnost a ladění.** Tok řízení je lineární; chování je dáno pořadím volání ve smyčce.

## Cena za jednoduchost: jitter a doba reakce

Sekvenční povaha smyčky je zároveň jejím největším omezením. Úlohy se vykonávají jedna po druhé, takže pokud jedna úloha trvá déle než obvykle — třeba kvůli složitějšímu výpočtu nebo **blokujícímu čekání** na periferii — zdrží se i *všechny následující* úlohy. Tomuto rozptylu okamžiku, kdy se úloha skutečně spustí, se říká **jitter**.

::: viz nav-super-loop-timeline "Zapni blokující úlohu a posouvej okamžik vzniku události. Doba reakce je zdola omezena délkou celého cyklu — událost se přečte až při dalším průchodu blokem „čtení vstupů"."
:::

Klíčový důsledek pro časování: událost na vstupu se nezpracuje hned, ale až **při dalším průchodu** příslušnou částí smyčky. Nejhorší doba reakce proto závisí na **součtu nejhorších možných dob vykonání všech úloh** ve smyčce. Ten nejhorší možný čas se značí **WCET** (*Worst-Case Execution Time*):

::: math
t_reakce(worst) ≈ Σ WCET_i  (celý zbytek cyklu + opětovné přečtení vstupu)
:::

Pro **měkký reálný čas** (*soft real-time*) — kde občasné překročení termínu jen sníží kvalitu, ale nezpůsobí havárii — to obvykle stačí. Pro **tvrdý reálný čas** (*hard real-time*), kde zmeškání termínu znamená selhání systému (např. řízení motoru, airbagu, lékařského přístroje), je čistý super-loop nevhodný: jediná pomalá úloha rozhodí časování všech ostatních. Časově kritické události se proto přesouvají do obsluhy přerušení a delší úlohy se rozdělují tak, aby nikdy neblokovaly — k tomu slouží neblokující stavové automaty popsané v [[stavovy-automat]].

| Vlastnost | Super-loop | Preemptivní RTOS |
|---|---|---|
| Plánovač | žádný | preemptivní, prioritní |
| Přepínání kontextu | žádné | při každém přepnutí úlohy |
| Zásobník | jeden společný | jeden na každý task |
| Riziko deadlocku / inverze priorit | mezi úlohami nehrozí | hrozí, nutná synchronizace |
| Reakce na časově kritickou úlohu | omezena délkou cyklu (jitter) | dle priority, s preempcí |
| Vhodnost pro hard real-time | omezená | dobrá |

::: quiz "Proč není čistý super-loop vhodný pro tvrdý reálný čas (hard real-time)?"
- [ ] Protože vyžaduje příliš mnoho operační paměti kvůli mnoha zásobníkům.
  > Naopak — super-loop si vystačí s jediným zásobníkem a má minimální paměťové nároky. To je jeho výhoda.
- [x] Protože doba reakce závisí na součtu WCET všech úloh a jedna pomalá úloha zdrží všechny ostatní (jitter).
  > Přesně. Sekvenční vykonávání znamená, že nejhorší doba reakce je omezena délkou celého cyklu; bez preempce nelze garantovat krátké, přesné termíny.
- [ ] Protože v něm pravidelně dochází k uváznutí (deadlock).
  > Mezi úlohami super-loopu deadlock nehrozí — vždy běží jen jedna úloha. Problém je v časování (jitter), ne v souběžnosti.
:::

::: link "Arm — Beginner guide on interrupt latency (Cortex-M)" "https://developer.arm.com/community/arm-community-blogs/b/architectures-and-processors-blog/posts/beginner-guide-on-interrupt-latency-and-interrupt-latency-of-the-arm-cortex-m-processors"
:::

::: link "Worst-case execution time (WCET) — přehled" "https://www.rapitasystems.com/worst-case-execution-time"
:::

---

*Zdroj: SZZ NADE — předmět Návrh vestavěných systémů, VUT FIT. Externí reference: Arm Developer (Cortex-M), Rapita Systems (WCET).*
