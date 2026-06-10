// GRASP — přidělování zodpovědností. Uživatel vybere otázku o návrhu e-shopu;
// viz ukáže, který princip ji řeší, které třídě zodpovědnost padne a kontrast
// špatného (anti-vzor) vs. dobrého umístění.
import { useState } from "react";

const QUESTIONS = [
  {
    q: "Kdo má spočítat celkovou cenu objednávky?",
    principle: "Information Expert",
    answer: "Order",
    bad: "OrderService.calculateTotal(order) — leze přes gettery do položek a produktů",
    good: "order.getTotalPrice() — Order zná své položky, tak je sečte",
    color: 142,
  },
  {
    q: "Kdo má vytvořit položku objednávky (OrderLine)?",
    principle: "Creator",
    answer: "Order",
    bad: "new OrderLine(...) venku + ruční přidání do seznamu",
    good: "order.addProduct(product, 2) — tvorbu schová vlastník položek",
    color: 100,
  },
  {
    q: "Kdo přijme HTTP požadavek na vytvoření objednávky?",
    principle: "Controller",
    answer: "OrderController",
    bad: "controller sám počítá ceny, validuje a sahá na DB",
    good: "controller jen deleguje na orderService.createOrder(req)",
    color: 264,
  },
  {
    q: "Jak řešit slevu lišící se podle typu zákazníka?",
    principle: "Polymorphism",
    answer: "DiscountPolicy",
    bad: "if (type==STUDENT) … else if (type==VIP) … ve velkém switchi",
    good: "StudentDiscount / VipDiscount implements DiscountPolicy",
    color: 200,
  },
  {
    q: "Kam dát ukládání objednávky do databáze?",
    principle: "Pure Fabrication",
    answer: "OrderRepository",
    bad: "order.saveToDatabase() — doména míchaná s perzistencí",
    good: "OrderRepository.save(order) — umělá technická třída",
    color: 22,
  },
  {
    q: "Co se stane, když chci vyměnit Stripe za PayPal?",
    principle: "Low Coupling / Protected Variations",
    answer: "PaymentGateway",
    bad: "OrderService závisí přímo na StripePaymentGateway",
    good: "OrderService závisí na rozhraní PaymentGateway",
    color: 320,
  },
];

export default function AisGraspAssign() {
  const [idx, setIdx] = useState(0);
  const item = QUESTIONS[idx];
  const accent = `oklch(0.62 0.14 ${item.color})`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <select
        className="viz-select"
        value={idx}
        onChange={(e) => setIdx(+e.target.value)}
      >
        {QUESTIONS.map((qq, i) => <option key={i} value={i}>{qq.q}</option>)}
      </select>

      {/* principle + answer badges */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>princip:</span>
        <span style={{ padding: "3px 10px", borderRadius: 999, background: `oklch(0.62 0.14 ${item.color} / 0.16)`, border: `1px solid ${accent}`, color: `oklch(0.45 0.14 ${item.color})`, fontWeight: 600, fontSize: 12 }}>
          {item.principle}
        </span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>zodpovědnost dostane:</span>
        <span style={{ padding: "3px 10px", borderRadius: 6, background: "var(--bg-inset)", border: "1px solid var(--line-strong)", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 12, color: "var(--text)" }}>
          {item.answer}
        </span>
      </div>

      {/* bad vs good */}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "oklch(0.62 0.18 22 / 0.10)", border: "1px solid oklch(0.62 0.18 22 / 0.5)" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "oklch(0.5 0.18 22)", marginBottom: 4 }}>✗ anti-vzor</div>
          <div style={{ fontSize: 11.5, color: "var(--text)", lineHeight: 1.5, fontFamily: "var(--font-mono)" }}>{item.bad}</div>
        </div>
        <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "oklch(0.62 0.14 142 / 0.10)", border: "1px solid oklch(0.62 0.14 142 / 0.5)" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "oklch(0.42 0.14 142)", marginBottom: 4 }}>✓ podle GRASP</div>
          <div style={{ fontSize: 11.5, color: "var(--text)", lineHeight: 1.5, fontFamily: "var(--font-mono)" }}>{item.good}</div>
        </div>
      </div>
    </div>
  );
}
