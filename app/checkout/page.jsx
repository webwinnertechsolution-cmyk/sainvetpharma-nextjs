"use client";
import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// CONFIG — apna API URL .env.local mein set karo:
// NEXT_PUBLIC_API_URL=https://yoursite.com/api
// ─────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || "https://yoursite.com/api";

const BANK_DETAILS = {
  bank_name: "HDFC Bank",
  account_name: "Pashmodaint Pvt Ltd",
  account_number: "XXXX XXXX XXXX 1234",
  ifsc: "HDFC0001234",
  swift: "HDFCINBBXXX",
  note: "Order number ko reference mein zaroor likhein. Payment ke baad screenshot WhatsApp pe bhejein.",
};

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada",
  "Australia", "Germany", "France", "UAE", "Singapore",
];

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  // ── Replace with your cart context/state ──────────────────
  const [cartItems] = useState([
    {
      product_id: 1,
      quantity: 1,
      variant_id: null,
      name: "Gift Box of Gulbahar Kaani Wool Blend Kashmiri Shawl",
      variant: "Size: 101x203 CM",
      image: null,
      price: 2695,
    },
  ]);

  const [step, setStep]           = useState(0); // 0=Contact 1=Delivery 2=Payment
  const [loading, setLoading]     = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [errors, setErrors]       = useState({});

  // ── Form ──────────────────────────────────────────────────
  const [form, setForm] = useState({
    email:       "",
    emailOffers: false,
    first_name:  "",
    last_name:   "",
    address:     "",
    apartment:   "",
    city:        "",
    state:       "",
    zip:         "",
    country:     "India",
    phone:       "",
    saveInfo:    false,
    billingSame: true,
    payment_method: "cod",   // "cod" | "bank_transfer"
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // ── Summary ───────────────────────────────────────────────
  const initSubtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const [summary, setSummary] = useState({
    subtotal:        initSubtotal,
    discount_amount: 0,
    shipping_cost:   0,
    shipping_discount: 0,
    tax_amount:      0,
    total:           initSubtotal,
    is_free_shipping: false,
  });
  const [shippingMethods,  setShippingMethods]  = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [calcLoading,      setCalcLoading]      = useState(false);

  // ── Discount ──────────────────────────────────────────────
  const [discountCode, setDiscountCode] = useState("");
  const [appliedCode,  setAppliedCode]  = useState("");
  const [discountMsg,  setDiscountMsg]  = useState(null);

  // ─────────────────────────────────────────────────────────
  // CALCULATE from backend
  // ─────────────────────────────────────────────────────────
  const calculate = useCallback(async (code = appliedCode) => {
    setCalcLoading(true);
    try {
      const res = await fetch(`${API}/checkout/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((i) => ({
            product_id: i.product_id,
            quantity:   i.quantity,
            variant_id: i.variant_id ?? null,
          })),
          country:       form.country,
          discount_code: code || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        const methods = data.shipping_methods ?? [];
        setShippingMethods(methods);
        if (!selectedShipping && methods.length) setSelectedShipping(methods[0]);
        return { success: true, data };
      }
    } catch (_) {}
    finally { setCalcLoading(false); }
    return { success: false };
  }, [form.country, cartItems, appliedCode, selectedShipping]);

  // Recalculate when country or step changes to Delivery
  useEffect(() => {
    if (step >= 1) calculate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.country, step]);

  // ─────────────────────────────────────────────────────────
  // APPLY DISCOUNT
  // ─────────────────────────────────────────────────────────
  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    const result = await calculate(discountCode.trim());
    if (result.success && result.data.summary.discount_amount > 0) {
      setAppliedCode(discountCode.trim());
      setDiscountMsg({ type: "success", text: `Discount applied! -${fmt(result.data.summary.discount_amount)}` });
    } else {
      setDiscountMsg({ type: "error", text: "Invalid or expired discount code." });
    }
  };

  // ─────────────────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.email)                     e.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email address";
    }
    if (step === 1) {
      if (!form.first_name) e.first_name = "Required";
      if (!form.last_name)  e.last_name  = "Required";
      if (!form.address)    e.address    = "Required";
      if (!form.city)       e.city       = "Required";
      if (!form.state)      e.state      = "Required";
      if (!form.zip)        e.zip        = "Required";
      if (!form.phone)      e.phone      = "Phone number required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validate()) setStep((s) => s + 1); };

  // ─────────────────────────────────────────────────────────
  // PLACE ORDER
  // ─────────────────────────────────────────────────────────
  const placeOrder = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${API}/checkout/place-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:              form.email,
          phone:              form.phone,
          shipping_first_name: form.first_name,
          shipping_last_name:  form.last_name,
          shipping_address:    form.address,
          shipping_apartment:  form.apartment,
          shipping_city:       form.city,
          shipping_state:      form.state,
          shipping_country:    form.country,
          shipping_zip:        form.zip,
          billing_same_as_shipping: form.billingSame ? 1 : 0,
          items: cartItems.map((i) => ({
            product_id: i.product_id,
            quantity:   i.quantity,
            variant_id: i.variant_id ?? null,
          })),
          subtotal:          summary.subtotal,
          discount_amount:   summary.discount_amount,
          discount_code:     appliedCode || null,
          shipping_cost:     summary.shipping_cost,
          shipping_discount: summary.shipping_discount ?? 0,
          shipping_rate_id:  selectedShipping?.rate_id   ?? null,
          shipping_method:   selectedShipping?.name      ?? null,
          is_free_shipping:  summary.is_free_shipping ? 1 : 0,
          tax_amount:        summary.tax_amount,
          total:             summary.total,
          payment_method:    form.payment_method,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderPlaced(data.order);
      } else {
        setErrors({ submit: data.message || "Order place nahi hua. Dobara try karein." });
      }
    } catch (_) {
      setErrors({ submit: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────
  if (orderPlaced) {
    const isBankTransfer = form.payment_method === "bank_transfer";
    return (
      <div style={s.page}>
        <Header />
        <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 20px" }}>
          <div style={s.successCard}>
            <div style={s.successCheck}>✓</div>
            <p style={{ color: "#4caf50", fontWeight: 600, fontSize: 13, letterSpacing: 1, marginBottom: 6 }}>
              ORDER CONFIRMED
            </p>
            <h2 style={s.successTitle}>Thank you, {form.first_name}!</h2>
            <p style={{ color: "#666", fontSize: 14, marginBottom: 4 }}>
              Order <strong>#{orderPlaced.order_number}</strong> has been placed.
            </p>
            <p style={{ color: "#666", fontSize: 13 }}>
              Confirmation will be sent to <strong>{form.email}</strong>
            </p>

            {/* Bank Transfer Instructions */}
            {isBankTransfer && (
              <div style={s.bankBox}>
                <p style={s.bankTitle}>📋 Bank Transfer Instructions</p>
                <p style={{ fontSize: 13, color: "#555", marginBottom: 14 }}>
                  Apna order confirm karne ke liye neeche diye account mein payment karein:
                </p>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  {[
                    ["Bank Name",      BANK_DETAILS.bank_name],
                    ["Account Name",   BANK_DETAILS.account_name],
                    ["Account Number", BANK_DETAILS.account_number],
                    ["IFSC Code",      BANK_DETAILS.ifsc],
                    ["SWIFT Code",     BANK_DETAILS.swift],
                    ["Amount",         fmt(orderPlaced.total)],
                    ["Reference",      `Order #${orderPlaced.order_number}`],
                  ].map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: "1px solid #f0ebe4" }}>
                      <td style={{ padding: "7px 0", color: "#888", width: "40%" }}>{k}</td>
                      <td style={{ padding: "7px 0", fontWeight: 600, color: "#1a1a1a" }}>{v}</td>
                    </tr>
                  ))}
                </table>
                <p style={{ fontSize: 12, color: "#888", marginTop: 12, lineHeight: 1.6 }}>
                  ⚠️ {BANK_DETAILS.note}
                </p>
              </div>
            )}

            {/* COD note */}
            {!isBankTransfer && (
              <div style={{ ...s.bankBox, background: "#f1f8e9", borderColor: "#c5e1a5" }}>
                <p style={{ fontSize: 14, color: "#33691e", margin: 0 }}>
                  🚚 <strong>Cash on Delivery</strong> — Delivery ke waqt cash payment karein.
                  Estimated delivery: 5–7 business days.
                </p>
              </div>
            )}

            <div style={s.successMeta}>
              <span>Total: <strong>{fmt(orderPlaced.total)}</strong></span>
              <span>Payment: <strong>{isBankTransfer ? "Bank Transfer" : "Cash on Delivery"}</strong></span>
            </div>
            <button style={s.btn} onClick={() => (window.location.href = "/")}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // MAIN LAYOUT
  // ─────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <Header />

      <div style={s.layout}>
        {/* ══════════════════════════════
            LEFT COLUMN — FORM
        ══════════════════════════════ */}
        <div style={s.formCol}>
          {/* Breadcrumb */}
          <Breadcrumb step={step} setStep={setStep} />

          {/* ── STEP 0: CONTACT ── */}
          {step === 0 && (
            <div>
              <SectionHead title="Contact" right={<a href="/login" style={s.link}>Sign in</a>} />
              <FloatField label="Email" value={form.email} onChange={(v) => set("email", v)}
                error={errors.email} type="email" />
              <CheckRow checked={form.emailOffers} onChange={(v) => set("emailOffers", v)}
                label="Email me with news and offers" />
              <button style={s.btn} onClick={nextStep}>
                Continue to delivery →
              </button>
            </div>
          )}

          {/* ── STEP 1: DELIVERY ── */}
          {step === 1 && (
            <div>
              <SectionHead title="Delivery" />

              {/* Country */}
              <div style={s.fieldWrap}>
                <label style={s.selectLabel}>Country / Region</label>
                <select value={form.country} onChange={(e) => set("country", e.target.value)} style={s.select}>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Name */}
              <div style={s.grid2}>
                <FloatField label="First name" value={form.first_name}
                  onChange={(v) => set("first_name", v)} error={errors.first_name} />
                <FloatField label="Last name" value={form.last_name}
                  onChange={(v) => set("last_name", v)} error={errors.last_name} />
              </div>

              <FloatField label="Address" value={form.address}
                onChange={(v) => set("address", v)} error={errors.address} />
              <FloatField label="Apartment, suite, etc. (optional)"
                value={form.apartment} onChange={(v) => set("apartment", v)} />

              {/* City / State / ZIP */}
              <div style={s.grid3}>
                <FloatField label="City"     value={form.city} onChange={(v) => set("city", v)} error={errors.city} />
                <FloatField label="State"    value={form.state} onChange={(v) => set("state", v)} error={errors.state} />
                <FloatField label="ZIP code" value={form.zip} onChange={(v) => set("zip", v)} error={errors.zip} />
              </div>

              <FloatField label="Phone" value={form.phone}
                onChange={(v) => set("phone", v)} error={errors.phone} type="tel" />

              <CheckRow checked={form.saveInfo} onChange={(v) => set("saveInfo", v)}
                label="Save this information for next time" />

              {/* Shipping Methods */}
              <h3 style={s.subTitle}>Shipping method</h3>
              {calcLoading ? (
                <Placeholder text="Calculating shipping options…" />
              ) : shippingMethods.length === 0 ? (
                <Placeholder text="Enter your shipping address to view available shipping methods." />
              ) : (
                <div style={s.methodList}>
                  {shippingMethods.map((m) => (
                    <label key={m.rate_id} style={{
                      ...s.methodRow,
                      borderColor: selectedShipping?.rate_id === m.rate_id ? "#1a1a1a" : "#ddd",
                      background:  selectedShipping?.rate_id === m.rate_id ? "#fafaf7" : "#fff",
                    }}>
                      <input type="radio" name="ship" checked={selectedShipping?.rate_id === m.rate_id}
                        onChange={() => setSelectedShipping(m)} style={{ marginRight: 10 }} />
                      <span style={{ flex: 1 }}>
                        <span style={{ fontWeight: 500 }}>{m.name}</span>
                        {m.delivery_time && (
                          <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>{m.delivery_time}</span>
                        )}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {m.charge === 0
                          ? <span style={{ color: "#388e3c" }}>FREE</span>
                          : fmt(m.charge)}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <button style={s.btn} onClick={nextStep}>Continue to payment →</button>
              <BackBtn onClick={() => setStep(0)} label="Return to contact" />
            </div>
          )}

          {/* ── STEP 2: PAYMENT ── */}
          {step === 2 && (
            <div>
              <SectionHead title="Payment" />
              <p style={{ color: "#888", fontSize: 13, marginTop: -8, marginBottom: 16 }}>
                🔒 All transactions are secure and encrypted.
              </p>

              {/* Payment Methods */}
              <div style={s.methodList}>

                {/* COD */}
                <label style={{
                  ...s.methodRow,
                  borderColor: form.payment_method === "cod" ? "#1a1a1a" : "#ddd",
                  background:  form.payment_method === "cod" ? "#fafaf7" : "#fff",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0,
                }}>
                  <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <input type="radio" name="pay" value="cod" checked={form.payment_method === "cod"}
                      onChange={() => set("payment_method", "cod")} style={{ marginRight: 10 }} />
                    <span style={{ flex: 1, fontWeight: 500 }}>Cash on Delivery (COD)</span>
                    <span style={{ fontSize: 20 }}>💵</span>
                  </div>
                  {form.payment_method === "cod" && (
                    <p style={{ fontSize: 12, color: "#666", margin: "10px 0 4px 24px", lineHeight: 1.6 }}>
                      Delivery ke waqt courier ko cash payment karein. Order confirm hone ke baad
                      estimated delivery 5–7 business days hai.
                    </p>
                  )}
                </label>

                {/* Bank Transfer */}
                <label style={{
                  ...s.methodRow,
                  borderColor: form.payment_method === "bank_transfer" ? "#1a1a1a" : "#ddd",
                  background:  form.payment_method === "bank_transfer" ? "#fafaf7" : "#fff",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0,
                }}>
                  <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <input type="radio" name="pay" value="bank_transfer"
                      checked={form.payment_method === "bank_transfer"}
                      onChange={() => set("payment_method", "bank_transfer")} style={{ marginRight: 10 }} />
                    <span style={{ flex: 1, fontWeight: 500 }}>Bank Transfer / NEFT / RTGS</span>
                    <span style={{ fontSize: 20 }}>🏦</span>
                  </div>
                  {form.payment_method === "bank_transfer" && (
                    <div style={{ margin: "10px 0 4px 24px", width: "calc(100% - 24px)" }}>
                      <p style={{ fontSize: 12, color: "#666", marginBottom: 10, lineHeight: 1.6 }}>
                        Order place karne ke baad neeche diye account mein payment karein. Payment
                        confirm hone ke baad order process hoga.
                      </p>
                      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                        {[
                          ["Bank",       BANK_DETAILS.bank_name],
                          ["Account",    BANK_DETAILS.account_name],
                          ["Acc No.",    BANK_DETAILS.account_number],
                          ["IFSC",       BANK_DETAILS.ifsc],
                        ].map(([k, v]) => (
                          <tr key={k}>
                            <td style={{ color: "#999", paddingBottom: 4, width: "35%" }}>{k}</td>
                            <td style={{ fontWeight: 600, paddingBottom: 4, color: "#1a1a1a" }}>{v}</td>
                          </tr>
                        ))}
                      </table>
                    </div>
                  )}
                </label>
              </div>

              {/* Billing address */}
              <h3 style={{ ...s.subTitle, marginTop: 24 }}>Billing address</h3>
              <div style={s.methodList}>
                <label style={{ ...s.methodRow, borderColor: form.billingSame ? "#1a1a1a" : "#ddd" }}>
                  <input type="radio" name="bill" checked={form.billingSame}
                    onChange={() => set("billingSame", true)} style={{ marginRight: 10 }} />
                  Same as shipping address
                </label>
                <label style={{ ...s.methodRow, borderColor: !form.billingSame ? "#1a1a1a" : "#ddd" }}>
                  <input type="radio" name="bill" checked={!form.billingSame}
                    onChange={() => set("billingSame", false)} style={{ marginRight: 10 }} />
                  Use a different billing address
                </label>
              </div>

              {errors.submit && <ErrorBanner msg={errors.submit} />}

              <button
                style={{ ...s.btn, opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                onClick={placeOrder}
                disabled={loading}
              >
                {loading ? "Placing order…" : "Place Order →"}
              </button>
              <BackBtn onClick={() => setStep(1)} label="Return to delivery" />
            </div>
          )}
        </div>

        {/* ══════════════════════════════
            RIGHT COLUMN — ORDER SUMMARY
        ══════════════════════════════ */}
        <aside style={s.summaryCol}>

          {/* Items */}
          <div style={{ borderBottom: "1px solid #ede8e0", paddingBottom: 18, marginBottom: 18 }}>
            {cartItems.map((item, i) => (
              <div key={i} style={s.itemRow}>
                <div style={s.imgWrap}>
                  {item.image
                    ? <img src={item.image} alt={item.name} style={s.img} />
                    : <div style={s.imgPlaceholder}>{item.name[0]}</div>}
                  <span style={s.qtyBadge}>{item.quantity}</span>
                </div>
                <div style={{ flex: 1, paddingLeft: 12 }}>
                  <p style={{ fontWeight: 500, fontSize: 13, margin: 0, lineHeight: 1.4 }}>{item.name}</p>
                  {item.variant && <p style={{ fontSize: 12, color: "#999", margin: "3px 0 0" }}>{item.variant}</p>}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{fmt(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Discount code */}
          <div style={s.discountRow}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                placeholder="Discount code"
                value={discountCode}
                onChange={(e) => { setDiscountCode(e.target.value); setDiscountMsg(null); }}
                onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
                style={{ ...s.discountInput, borderColor: discountMsg?.type === "error" ? "#c62828" : "#ddd" }}
              />
            </div>
            <button
              style={{ ...s.btnApply, opacity: (!discountCode || calcLoading) ? 0.5 : 1 }}
              onClick={applyDiscount}
              disabled={!discountCode || calcLoading}
            >
              Apply
            </button>
          </div>
          {discountMsg && (
            <p style={{ fontSize: 12, color: discountMsg.type === "success" ? "#388e3c" : "#c62828", marginTop: 6 }}>
              {discountMsg.text}
            </p>
          )}

          {/* Totals */}
          <div style={{ borderTop: "1px solid #ede8e0", paddingTop: 16, marginTop: 16 }}>
            <Row label="Subtotal" value={fmt(summary.subtotal)} />
            {summary.discount_amount > 0 && (
              <Row label={`Discount${appliedCode ? ` (${appliedCode})` : ""}`}
                value={`−${fmt(summary.discount_amount)}`} valueColor="#388e3c" />
            )}
            <Row
              label="Shipping"
              value={
                calcLoading ? "…" :
                summary.is_free_shipping ? <GreenText>FREE</GreenText> :
                summary.shipping_cost > 0 ? fmt(summary.shipping_cost) :
                <span style={{ color: "#aaa", fontSize: 12 }}>Enter address</span>
              }
            />
            {summary.tax_amount > 0 && <Row label="Tax" value={fmt(summary.tax_amount)} />}

            <div style={s.grandTotal}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>Total</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 11, color: "#aaa", marginRight: 4 }}>USD</span>
                <strong style={{ fontSize: 22 }}>{fmt(summary.total)}</strong>
              </div>
            </div>
          </div>

          <a href="/privacy-policy" style={s.privacyLink}>Privacy policy</a>
        </aside>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

function Header() {
  return (
    <header style={s.header}>
      <span style={s.logo}>pashmodaint</span>
      <span style={{ fontSize: 22 }}>🛒</span>
    </header>
  );
}

function Breadcrumb({ step, setStep }) {
  const steps = ["Contact", "Delivery", "Payment"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 28, fontSize: 13 }}>
      {steps.map((label, i) => (
        <span key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            onClick={() => i < step && setStep(i)}
            style={{
              background: "none", border: "none", padding: 0, fontSize: 13,
              fontWeight: i === step ? 700 : 400,
              color: i === step ? "#1a1a1a" : i < step ? "#8b6f47" : "#bbb",
              cursor: i < step ? "pointer" : "default",
              textDecoration: i < step ? "underline" : "none",
              fontFamily: "inherit",
            }}
          >{label}</button>
          {i < steps.length - 1 && <span style={{ color: "#ccc", fontSize: 16 }}>›</span>}
        </span>
      ))}
    </div>
  );
}

function SectionHead({ title, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
      <h2 style={s.sectionTitle}>{title}</h2>
      {right}
    </div>
  );
}

function FloatField({ label, value, onChange, error, type = "text" }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || !!value;
  return (
    <div style={{ ...s.fieldWrap, marginBottom: error ? 6 : 12 }}>
      <label style={{
        ...s.floatLabel,
        top:      lifted ? 7  : "50%",
        fontSize: lifted ? 10 : 14,
        color:    focused ? "#8b6f47" : "#aaa",
      }}>{label}</label>
      <input
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={()  => setFocused(false)}
        style={{
          ...s.input,
          borderColor: error ? "#c62828" : focused ? "#8b6f47" : "#ddd",
          boxShadow:   focused ? "0 0 0 3px rgba(139,111,71,0.1)" : "none",
        }}
      />
      {error && <span style={s.fieldError}>{error}</span>}
    </div>
  );
}

function CheckRow({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#666",
      cursor: "pointer", margin: "8px 0 18px" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function Placeholder({ text }) {
  return (
    <div style={{ background: "#fafaf7", border: "1.5px solid #e8e0d5", borderRadius: 7,
      padding: "14px 16px", fontSize: 13, color: "#888", marginBottom: 16 }}>
      {text}
    </div>
  );
}

function BackBtn({ onClick, label }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", color: "#888",
      fontSize: 13, cursor: "pointer", display: "block", marginTop: 12,
      padding: "4px 0", fontFamily: "inherit" }}>
      ← {label}
    </button>
  );
}

function ErrorBanner({ msg }) {
  return (
    <div style={{ background: "#ffebee", border: "1px solid #ef9a9a", borderRadius: 6,
      padding: "10px 14px", color: "#c62828", fontSize: 13, marginTop: 12 }}>
      ⚠️ {msg}
    </div>
  );
}

function Row({ label, value, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between",
      marginBottom: 10, fontSize: 13 }}>
      <span style={{ color: "#777" }}>{label}</span>
      <span style={{ fontWeight: 500, color: valueColor || "#1a1a1a" }}>{value}</span>
    </div>
  );
}

const GreenText = ({ children }) => <span style={{ color: "#388e3c" }}>{children}</span>;

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#f7f4ef",
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
    color: "#1a1a1a",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 40px", background: "#fff",
    borderBottom: "1px solid #ede8e0",
  },
  logo: { fontSize: 21, fontWeight: 700, letterSpacing: "-0.5px" },

  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 400px",
    maxWidth: 1060,
    margin: "0 auto",
    padding: "36px 24px",
    gap: 36,
  },

  formCol: {
    background: "#fff", borderRadius: 10,
    padding: "36px 40px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
  },
  summaryCol: {
    background: "#fff", borderRadius: 10,
    padding: "28px 26px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    height: "fit-content",
    position: "sticky",
    top: 24,
  },

  sectionTitle: { fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.3px" },
  subTitle: { fontSize: 15, fontWeight: 600, margin: "24px 0 12px" },
  link: { fontSize: 13, color: "#8b6f47", textDecoration: "none" },

  fieldWrap: { position: "relative" },
  floatLabel: {
    position: "absolute", left: 13,
    transform: "translateY(-50%)",
    transition: "all 0.15s ease",
    pointerEvents: "none", zIndex: 1,
    lineHeight: 1,
  },
  input: {
    width: "100%", padding: "20px 13px 8px",
    border: "1.5px solid #ddd", borderRadius: 7,
    fontSize: 14, background: "#fafaf7",
    outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  fieldError: { color: "#c62828", fontSize: 11, display: "block", marginBottom: 6, marginTop: 2 },

  selectLabel: {
    display: "block", fontSize: 11,
    color: "#aaa", marginBottom: 0,
    padding: "7px 13px 0",
    position: "absolute", top: 0, left: 0, zIndex: 1,
  },
  select: {
    width: "100%", padding: "20px 13px 8px",
    border: "1.5px solid #ddd", borderRadius: 7,
    fontSize: 14, background: "#fafaf7",
    outline: "none", fontFamily: "inherit",
    appearance: "none",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23aaa' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    marginBottom: 12,
    boxSizing: "border-box",
    cursor: "pointer",
  },

  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  grid3: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 },

  methodList: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 },
  methodRow: {
    display: "flex", alignItems: "center",
    padding: "13px 14px",
    border: "1.5px solid #ddd", borderRadius: 7,
    cursor: "pointer", fontSize: 14,
    transition: "border-color 0.15s, background 0.15s",
  },

  btn: {
    width: "100%", padding: "14px",
    background: "#1a1a1a", color: "#fff",
    border: "none", borderRadius: 7,
    fontSize: 15, fontWeight: 600,
    cursor: "pointer", marginTop: 20,
    letterSpacing: "0.2px",
    fontFamily: "inherit",
    transition: "background 0.2s",
  },

  // Summary
  itemRow: { display: "flex", alignItems: "center", marginBottom: 16 },
  imgWrap: { position: "relative", width: 58, height: 58, flexShrink: 0 },
  img: { width: "100%", height: "100%", objectFit: "cover", borderRadius: 7, border: "1px solid #e8e0d5" },
  imgPlaceholder: {
    width: "100%", height: "100%", borderRadius: 7,
    background: "#ede0ce", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 20, color: "#9e7e5a",
    border: "1px solid #ddd2c2",
  },
  qtyBadge: {
    position: "absolute", top: -7, right: -7,
    background: "#1a1a1a", color: "#fff",
    borderRadius: "50%", width: 20, height: 20,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 700,
  },
  discountRow: { display: "flex", gap: 8 },
  discountInput: {
    width: "100%", padding: "11px 12px",
    border: "1.5px solid #ddd", borderRadius: 7,
    fontSize: 13, outline: "none",
    fontFamily: "inherit", background: "#fafaf7",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  },
  btnApply: {
    padding: "0 16px", flexShrink: 0,
    background: "#1a1a1a", color: "#fff",
    border: "none", borderRadius: 7,
    fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
    transition: "opacity 0.15s",
  },
  grandTotal: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    borderTop: "1px solid #ede8e0",
    paddingTop: 14, marginTop: 6,
  },
  privacyLink: {
    display: "block", textAlign: "center",
    marginTop: 20, fontSize: 12, color: "#bbb",
    textDecoration: "none",
  },

  // Success page
  successCard: {
    background: "#fff", borderRadius: 12,
    padding: "44px 40px", textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
  },
  successCheck: {
    width: 68, height: 68, borderRadius: "50%",
    background: "#e8f5e9", color: "#388e3c",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 30, margin: "0 auto 18px", fontWeight: 700,
  },
  successTitle: { fontSize: 26, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.5px" },
  bankBox: {
    background: "#fdf8f0",
    border: "1.5px solid #e8d8b8",
    borderRadius: 8,
    padding: "18px 20px",
    marginTop: 20,
    textAlign: "left",
  },
  bankTitle: { fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#1a1a1a" },
  successMeta: {
    display: "flex", justifyContent: "center", gap: 28,
    padding: "16px 0", margin: "20px 0 0",
    borderTop: "1px solid #f0ece4", borderBottom: "1px solid #f0ece4",
    fontSize: 14, color: "#555",
  },
};
