"use client";
import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://yoursite.com/api";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const STEPS = ["Contact", "Delivery", "Payment"];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function CheckoutPage() {
  // Cart items passed from cart/context — for demo we use mock data
  const [cartItems] = useState([
    {
      product_id: 1,
      quantity: 1,
      name: "Gift Box of Gulbahar Kaani Wool Blend Kashmiri Shawl",
      variant: "Size: 101x203 CM",
      image: null,
      price: 2695,
    },
  ]);

  const [step, setStep] = useState(0); // 0=Contact, 1=Delivery, 2=Payment
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [errors, setErrors] = useState({});

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    email: "",
    emailOffers: false,
    first_name: "",
    last_name: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    phone: "",
    saveInfo: false,
    billingSame: true,
    payment_method: "cod",
  });

  // ── Checkout summary state ────────────────────────────────────────────────
  const [summary, setSummary] = useState({
    subtotal: cartItems.reduce((s, i) => s + i.price * i.quantity, 0),
    discount_amount: 0,
    shipping_cost: 0,
    tax_amount: 0,
    total: cartItems.reduce((s, i) => s + i.price * i.quantity, 0),
    is_free_shipping: false,
  });
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountMsg, setDiscountMsg] = useState(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  // ── Field updater ─────────────────────────────────────────────────────────
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // ── Validate step ─────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.email) e.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    }
    if (step === 1) {
      if (!form.first_name) e.first_name = "Required";
      if (!form.last_name) e.last_name = "Required";
      if (!form.address) e.address = "Required";
      if (!form.city) e.city = "Required";
      if (!form.state) e.state = "Required";
      if (!form.zip) e.zip = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Calculate shipping when address is complete ───────────────────────────
  const fetchCalculation = useCallback(async (code = "") => {
    if (!form.country) return;
    setCalculatingShipping(true);
    try {
      const payload = {
        items: cartItems.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          variant_id: i.variant_id ?? null,
        })),
        country: form.country,
        discount_code: code || undefined,
      };

      const res = await fetch(`${API_BASE}/checkout/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setSummary(data.summary);
        setShippingMethods(data.shipping_methods ?? []);
        if (data.shipping_methods?.length) {
          setSelectedShipping(data.shipping_methods[0]);
        }
        if (code && data.summary.discount_amount > 0) {
          setDiscountMsg({ type: "success", text: `Discount applied: -${fmt(data.summary.discount_amount)}` });
        } else if (code) {
          setDiscountMsg({ type: "error", text: "Invalid or expired discount code" });
        }
      }
    } catch (_) {
      // silent — keep existing summary
    } finally {
      setCalculatingShipping(false);
    }
  }, [form.country, cartItems]);

  useEffect(() => {
    if (step >= 1 && form.country) fetchCalculation();
  }, [form.country, step]);

  // ── Next step ─────────────────────────────────────────────────────────────
  const nextStep = () => {
    if (!validate()) return;
    setStep((s) => Math.min(s + 1, 2));
  };

  // ── Place Order ───────────────────────────────────────────────────────────
  const placeOrder = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        email: form.email,
        phone: form.phone || "N/A",
        shipping_first_name: form.first_name,
        shipping_last_name: form.last_name,
        shipping_address: form.address,
        shipping_apartment: form.apartment,
        shipping_city: form.city,
        shipping_state: form.state,
        shipping_country: form.country,
        shipping_zip: form.zip,
        billing_same_as_shipping: form.billingSame ? 1 : 0,
        items: cartItems.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          variant_id: i.variant_id ?? null,
        })),
        subtotal: summary.subtotal,
        discount_amount: summary.discount_amount,
        discount_code: discountCode || null,
        shipping_cost: summary.shipping_cost,
        shipping_discount: summary.shipping_discount ?? 0,
        shipping_rate_id: selectedShipping?.rate_id ?? null,
        shipping_method: selectedShipping?.name ?? null,
        is_free_shipping: summary.is_free_shipping ? 1 : 0,
        tax_amount: summary.tax_amount,
        total: summary.total,
        payment_method: form.payment_method,
      };

      const res = await fetch(`${API_BASE}/checkout/place-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setOrderPlaced(data.order);
      } else {
        setErrors({ submit: data.message || "Order failed. Please try again." });
      }
    } catch (_) {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // ─── ORDER SUCCESS ────────────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div style={styles.page}>
        <div style={styles.successBox}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Order Confirmed!</h2>
          <p style={styles.successSub}>Order #{orderPlaced.order_number}</p>
          <p style={{ color: "#555", marginTop: 8 }}>
            We&apos;ve received your order. A confirmation will be sent to <strong>{form.email}</strong>.
          </p>
          <div style={styles.successMeta}>
            <span>Total: <strong>{fmt(orderPlaced.total)}</strong></span>
            <span>Payment: <strong style={{ textTransform: "capitalize" }}>{form.payment_method.replace("_", " ")}</strong></span>
          </div>
          <button style={styles.btnPrimary} onClick={() => window.location.href = "/"}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // ─── MAIN CHECKOUT UI ─────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* ── Header ── */}
      <header style={styles.header}>
        <span style={styles.storeName}>pashmodaint</span>
        <span style={styles.cartIcon}>🛒</span>
      </header>

      <div style={styles.layout}>
        {/* ════════════════════════════════════════
            LEFT: FORM
        ════════════════════════════════════════ */}
        <div style={styles.formCol}>
          {/* Breadcrumb */}
          <div style={styles.breadcrumb}>
            {STEPS.map((s, i) => (
              <span key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => i < step && setStep(i)}
                  style={{
                    ...styles.breadLink,
                    color: i === step ? "#1a1a1a" : i < step ? "#006fbb" : "#aaa",
                    fontWeight: i === step ? 600 : 400,
                    cursor: i < step ? "pointer" : "default",
                  }}
                >
                  {s}
                </button>
                {i < STEPS.length - 1 && <span style={{ color: "#ccc" }}>›</span>}
              </span>
            ))}
          </div>

          {/* ── STEP 0: CONTACT ── */}
          {step === 0 && (
            <section>
              <div style={styles.sectionHead}>
                <h2 style={styles.sectionTitle}>Contact</h2>
                <a href="/login" style={styles.signInLink}>Sign in</a>
              </div>
              <Field
                placeholder="Email"
                value={form.email}
                onChange={(v) => set("email", v)}
                error={errors.email}
                type="email"
              />
              <label style={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={form.emailOffers}
                  onChange={(e) => set("emailOffers", e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                Email me with news and offers
              </label>
              <button style={styles.btnPrimary} onClick={nextStep}>
                Continue to delivery
              </button>
            </section>
          )}

          {/* ── STEP 1: DELIVERY ── */}
          {step === 1 && (
            <section>
              <h2 style={styles.sectionTitle}>Delivery</h2>

              {/* Country */}
              <div style={styles.fieldWrap}>
                <label style={styles.floatLabel}>Country / Region</label>
                <select
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  style={{ ...styles.input, paddingTop: 18 }}
                >
                  {["United States", "India", "United Kingdom", "Canada", "Australia", "Germany", "France"].map(
                    (c) => <option key={c}>{c}</option>
                  )}
                </select>
              </div>

              {/* Name row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field placeholder="First name" value={form.first_name} onChange={(v) => set("first_name", v)} error={errors.first_name} />
                <Field placeholder="Last name" value={form.last_name} onChange={(v) => set("last_name", v)} error={errors.last_name} />
              </div>

              <Field placeholder="Address" value={form.address} onChange={(v) => set("address", v)} error={errors.address} />
              <Field placeholder="Apartment, suite, etc. (optional)" value={form.apartment} onChange={(v) => set("apartment", v)} />

              {/* City / State / ZIP */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10 }}>
                <Field placeholder="City" value={form.city} onChange={(v) => set("city", v)} error={errors.city} />
                <Field placeholder="State" value={form.state} onChange={(v) => set("state", v)} error={errors.state} />
                <Field placeholder="ZIP code" value={form.zip} onChange={(v) => set("zip", v)} error={errors.zip} />
              </div>

              <Field placeholder="Phone (optional)" value={form.phone} onChange={(v) => set("phone", v)} type="tel" />

              <label style={styles.checkLabel}>
                <input type="checkbox" checked={form.saveInfo} onChange={(e) => set("saveInfo", e.target.checked)} style={{ marginRight: 8 }} />
                Save this information for next time
              </label>

              {/* Shipping Methods */}
              <h3 style={{ ...styles.sectionTitle, marginTop: 24, fontSize: 16 }}>Shipping method</h3>
              {calculatingShipping ? (
                <div style={styles.shippingPlaceholder}>Calculating shipping…</div>
              ) : shippingMethods.length === 0 ? (
                <div style={styles.shippingPlaceholder}>
                  Enter your shipping address to view available shipping methods.
                </div>
              ) : (
                <div style={styles.methodList}>
                  {shippingMethods.map((m) => (
                    <label key={m.rate_id} style={{
                      ...styles.methodRow,
                      border: selectedShipping?.rate_id === m.rate_id ? "1.5px solid #1a1a1a" : "1.5px solid #e0e0e0",
                    }}>
                      <input
                        type="radio"
                        name="shipping"
                        checked={selectedShipping?.rate_id === m.rate_id}
                        onChange={() => setSelectedShipping(m)}
                        style={{ marginRight: 10 }}
                      />
                      <span style={{ flex: 1 }}>
                        <span style={{ fontWeight: 500 }}>{m.name}</span>
                        {m.delivery_time && <span style={{ color: "#777", fontSize: 12, marginLeft: 6 }}>{m.delivery_time}</span>}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {m.charge === 0 ? <span style={{ color: "#2e7d32" }}>FREE</span> : fmt(m.charge)}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <button style={styles.btnPrimary} onClick={nextStep}>
                Continue to payment
              </button>
              <button style={styles.btnBack} onClick={() => setStep(0)}>← Return to contact</button>
            </section>
          )}

          {/* ── STEP 2: PAYMENT ── */}
          {step === 2 && (
            <section>
              <h2 style={styles.sectionTitle}>Payment</h2>
              <p style={{ color: "#777", fontSize: 13, marginBottom: 16 }}>All transactions are secure and encrypted.</p>

              <div style={styles.paymentMethods}>
                {[
                  { value: "cod", label: "Cash on Delivery (COD)" },
                  { value: "bank_transfer", label: "Bank Transfer" },
                  { value: "card", label: "Credit / Debit Card" },
                ].map((pm) => (
                  <label key={pm.value} style={{
                    ...styles.methodRow,
                    border: form.payment_method === pm.value ? "1.5px solid #1a1a1a" : "1.5px solid #e0e0e0",
                  }}>
                    <input
                      type="radio"
                      name="payment"
                      value={pm.value}
                      checked={form.payment_method === pm.value}
                      onChange={() => set("payment_method", pm.value)}
                      style={{ marginRight: 10 }}
                    />
                    {pm.label}
                  </label>
                ))}
              </div>

              {/* Billing address toggle */}
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Billing address</h3>
                <label style={styles.methodRow}>
                  <input type="radio" checked={form.billingSame} onChange={() => set("billingSame", true)} style={{ marginRight: 10 }} />
                  Same as shipping address
                </label>
                <label style={styles.methodRow}>
                  <input type="radio" checked={!form.billingSame} onChange={() => set("billingSame", false)} style={{ marginRight: 10 }} />
                  Use a different billing address
                </label>
              </div>

              {errors.submit && (
                <div style={styles.errorBanner}>{errors.submit}</div>
              )}

              <button
                style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}
                onClick={placeOrder}
                disabled={loading}
              >
                {loading ? "Placing order…" : "Pay now"}
              </button>
              <button style={styles.btnBack} onClick={() => setStep(1)}>← Return to delivery</button>
            </section>
          )}
        </div>

        {/* ════════════════════════════════════════
            RIGHT: ORDER SUMMARY
        ════════════════════════════════════════ */}
        <div style={styles.summaryCol}>
          {/* Cart items */}
          <div style={styles.itemsList}>
            {cartItems.map((item, i) => (
              <div key={i} style={styles.itemRow}>
                <div style={styles.itemImgWrap}>
                  {item.image
                    ? <img src={item.image} alt={item.name} style={styles.itemImg} />
                    : <div style={styles.itemImgPlaceholder}>{item.name[0]}</div>
                  }
                  <span style={styles.qtyBadge}>{item.quantity}</span>
                </div>
                <div style={{ flex: 1, paddingLeft: 12 }}>
                  <p style={{ fontWeight: 500, fontSize: 14, margin: 0 }}>{item.name}</p>
                  {item.variant && <p style={{ fontSize: 12, color: "#777", margin: "2px 0 0" }}>{item.variant}</p>}
                </div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{fmt(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Discount code */}
          <div style={styles.discountRow}>
            <input
              placeholder="Discount code"
              value={discountCode}
              onChange={(e) => { setDiscountCode(e.target.value); setDiscountMsg(null); }}
              style={{ ...styles.input, flex: 1, marginBottom: 0 }}
            />
            <button
              style={styles.btnApply}
              onClick={() => fetchCalculation(discountCode)}
              disabled={calculatingShipping || !discountCode}
            >
              Apply
            </button>
          </div>
          {discountMsg && (
            <p style={{ fontSize: 13, color: discountMsg.type === "success" ? "#2e7d32" : "#c62828", marginTop: 6 }}>
              {discountMsg.text}
            </p>
          )}

          {/* Totals */}
          <div style={styles.totalsBox}>
            <TotalRow label="Subtotal" value={fmt(summary.subtotal)} />
            {summary.discount_amount > 0 && (
              <TotalRow label="Discount" value={`-${fmt(summary.discount_amount)}`} accent="#2e7d32" />
            )}
            <TotalRow
              label="Shipping"
              value={
                summary.is_free_shipping
                  ? <span style={{ color: "#2e7d32" }}>FREE</span>
                  : summary.shipping_cost > 0
                  ? fmt(summary.shipping_cost)
                  : <span style={{ color: "#777", fontSize: 13 }}>Enter shipping address</span>
              }
            />
            {summary.tax_amount > 0 && <TotalRow label="Tax" value={fmt(summary.tax_amount)} />}
            <div style={styles.totalFinalRow}>
              <span>Total</span>
              <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 11, color: "#777" }}>USD</span>
                <strong style={{ fontSize: 20 }}>{fmt(summary.total)}</strong>
              </span>
            </div>
          </div>

          {/* Privacy link */}
          <a href="/privacy-policy" style={styles.privacyLink}>Privacy policy</a>
        </div>
      </div>
    </div>
  );
}

// ─── SUB COMPONENTS ───────────────────────────────────────────────────────────
function Field({ placeholder, value, onChange, error, type = "text" }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value;
  return (
    <div style={styles.fieldWrap}>
      <label style={{ ...styles.floatLabel, top: active ? 6 : "50%", fontSize: active ? 11 : 14, color: active ? "#555" : "#999" }}>
        {placeholder}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...styles.input, borderColor: error ? "#c62828" : focused ? "#1a1a1a" : "#d0d0d0" }}
      />
      {error && <span style={styles.fieldError}>{error}</span>}
    </div>
  );
}

function TotalRow({ label, value, accent }) {
  return (
    <div style={styles.totalRow}>
      <span style={{ color: "#555", fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 500, fontSize: 14, color: accent || "#1a1a1a" }}>{value}</span>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f0",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: "#1a1a1a",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 40px",
    background: "#fff",
    borderBottom: "1px solid #e8e8e8",
  },
  storeName: { fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" },
  cartIcon: { fontSize: 20 },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 420px",
    maxWidth: 1100,
    margin: "0 auto",
    padding: "32px 24px",
    gap: 40,
    "@media (max-width: 768px)": { gridTemplateColumns: "1fr" },
  },
  formCol: {
    background: "#fff",
    borderRadius: 8,
    padding: "32px 36px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
  },
  summaryCol: {
    background: "#fff",
    borderRadius: 8,
    padding: "28px 28px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
    height: "fit-content",
    position: "sticky",
    top: 24,
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    marginBottom: 24,
    fontSize: 13,
  },
  breadLink: {
    background: "none",
    border: "none",
    padding: 0,
    fontSize: 13,
    textDecoration: "none",
  },
  sectionHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 600, marginBottom: 16, letterSpacing: "-0.3px" },
  signInLink: { fontSize: 13, color: "#006fbb", textDecoration: "none" },
  fieldWrap: { position: "relative", marginBottom: 12 },
  floatLabel: {
    position: "absolute",
    left: 14,
    transform: "translateY(-50%)",
    transition: "all 0.15s ease",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "20px 14px 8px",
    border: "1.5px solid #d0d0d0",
    borderRadius: 6,
    fontSize: 14,
    background: "#fafafa",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  fieldError: { color: "#c62828", fontSize: 12, marginTop: 3, display: "block" },
  checkLabel: { display: "flex", alignItems: "center", fontSize: 13, color: "#555", margin: "8px 0 16px", cursor: "pointer" },
  btnPrimary: {
    width: "100%",
    padding: "14px",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 16,
    letterSpacing: "0.2px",
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  btnBack: {
    background: "none",
    border: "none",
    color: "#555",
    fontSize: 13,
    cursor: "pointer",
    marginTop: 10,
    display: "block",
    fontFamily: "inherit",
    padding: "6px 0",
  },
  shippingPlaceholder: {
    background: "#f8f8f8",
    border: "1.5px solid #e0e0e0",
    borderRadius: 6,
    padding: "16px 14px",
    fontSize: 13,
    color: "#777",
    marginBottom: 16,
  },
  methodList: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 },
  methodRow: {
    display: "flex",
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    transition: "border 0.15s",
    background: "#fafafa",
  },
  paymentMethods: { display: "flex", flexDirection: "column", gap: 8 },
  errorBanner: {
    background: "#ffebee",
    border: "1px solid #ef9a9a",
    borderRadius: 6,
    padding: "10px 14px",
    color: "#c62828",
    fontSize: 13,
    marginTop: 12,
  },
  // Summary
  itemsList: { borderBottom: "1px solid #f0f0f0", paddingBottom: 16, marginBottom: 16 },
  itemRow: { display: "flex", alignItems: "center", marginBottom: 14 },
  itemImgWrap: { position: "relative", width: 56, height: 56, flexShrink: 0 },
  itemImg: { width: "100%", height: "100%", objectFit: "cover", borderRadius: 6, border: "1px solid #e0e0e0" },
  itemImgPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
    background: "#e8e0d5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 18,
    color: "#8a7a6a",
    border: "1px solid #d0c8c0",
  },
  qtyBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    background: "#1a1a1a",
    color: "#fff",
    borderRadius: "50%",
    width: 20,
    height: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
  },
  discountRow: { display: "flex", gap: 8, marginBottom: 4 },
  btnApply: {
    padding: "0 18px",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    opacity: 1,
    fontFamily: "inherit",
    flexShrink: 0,
  },
  totalsBox: { borderTop: "1px solid #f0f0f0", paddingTop: 16, marginTop: 16 },
  totalRow: { display: "flex", justifyContent: "space-between", marginBottom: 10 },
  totalFinalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #f0f0f0",
    paddingTop: 14,
    marginTop: 8,
    fontWeight: 600,
    fontSize: 16,
  },
  privacyLink: { display: "block", textAlign: "center", marginTop: 20, fontSize: 12, color: "#777", textDecoration: "none" },
  // Success
  successBox: {
    maxWidth: 480,
    margin: "80px auto",
    background: "#fff",
    borderRadius: 12,
    padding: 48,
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "#e8f5e9",
    color: "#2e7d32",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    margin: "0 auto 20px",
    fontWeight: 700,
  },
  successTitle: { fontSize: 24, fontWeight: 700, margin: "0 0 6px" },
  successSub: { color: "#777", fontSize: 14 },
  successMeta: {
    display: "flex",
    justifyContent: "center",
    gap: 24,
    marginTop: 20,
    padding: "16px 0",
    borderTop: "1px solid #f0f0f0",
    borderBottom: "1px solid #f0f0f0",
    fontSize: 14,
    color: "#555",
  },
};
