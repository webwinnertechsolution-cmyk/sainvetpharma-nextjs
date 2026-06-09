
'use client';

import { useCart } from '@/app/components/CartContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ShippingMethod {
  rate_id: number;
  name: string;
  delivery_time?: string;
  charge: number;
}

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQty,
    clearCart,
    totalItems,
    totalPrice,
    totalSavings,
  } = useCart();

  const [shippingMethods, setShippingMethods]   = useState<ShippingMethod[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [shippingLoading, setShippingLoading]   = useState(false);
  const [freeShippingMin, setFreeShippingMin]   = useState<number>(999);
  const [fallbackCharge, setFallbackCharge]     = useState<number | null>(null);

  // ── Shipping fetch ──
  useEffect(() => {
    if (items.length === 0) return;
    setShippingLoading(true);
    setShippingMethods([]);
    setSelectedShipping(null);
    setFallbackCharge(null);

    fetch(`${API_URL}/api/calculate-shipping?cart_total=${totalPrice}&country=india`)
      .then(r => r.json())
      .then(data => {
        if (data.free_shipping_min) setFreeShippingMin(Number(data.free_shipping_min));

        if (data.is_free_shipping) {
          setFallbackCharge(0);
        } else if (data.success && data.methods?.length > 0) {
          setShippingMethods(data.methods);
          setSelectedShipping(data.methods[0]);
        } else if (data.success && data.methods?.length === 0) {
          const freeMin = data.free_shipping_min ? Number(data.free_shipping_min) : 999;
          setFreeShippingMin(freeMin);
          setFallbackCharge(totalPrice >= freeMin ? 0 : 99);
        }
        setShippingLoading(false);
      })
      .catch(() => {
        setFallbackCharge(99);
        setShippingLoading(false);
      });
  }, [totalPrice]);

  // ── Calculations ──
  const freeUnlocked = totalPrice >= freeShippingMin;
  const freeProgress = Math.min((totalPrice / freeShippingMin) * 100, 100);
  const remaining    = Math.max(0, freeShippingMin - totalPrice);

  const shippingCharge: number = (() => {
    if (freeUnlocked)             return 0;
    if (fallbackCharge !== null)  return fallbackCharge;
    if (selectedShipping)         return Number(selectedShipping.charge);
    return 0;
  })();

  const grandTotal = totalPrice + shippingCharge;

  /* ── Empty State ── */
  if (items.length === 0) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito,sans-serif', background: '#f5f7fa' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Nunito:wght@400;600;700;800&display=swap');`}</style>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 84, marginBottom: 20 }}>🛒</div>
        <h2 style={{ fontFamily: 'Sora,sans-serif', fontSize: 26, color: '#0a214f', marginBottom: 10 }}>Your cart is empty</h2>
        <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 30 }}>Looks like you haven't added anything yet.</p>
        <Link href="/collections" style={{ background: 'linear-gradient(135deg,#1872B5,#2596e1)', color: '#fff', padding: '14px 34px', borderRadius: 12, textDecoration: 'none', fontWeight: 800, fontSize: 15, fontFamily: 'Sora,sans-serif', boxShadow: '0 4px 18px rgba(24,114,181,.32)', display: 'inline-block' }}>
          Browse Products →
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: "'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Nunito:wght@400;600;700;800&display=swap');
        *{ box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }

        .cart-header { background: linear-gradient(135deg,#1872B5,#1560a0); padding: 18px 0; }
        .cart-header-inner { max-width:1200px; margin:0 auto; padding:0 24px; display:flex; align-items:center; justify-content:space-between; }
        .cart-bc { font-size:13px; color:rgba(255,255,255,.75); display:flex; align-items:center; gap:5px; flex-wrap:wrap; }
        .cart-bc a { color:rgba(255,255,255,.75); text-decoration:none; }
        .cart-bc a:hover { color:#fff; }
        .cart-page-title { font-family:'Sora',sans-serif; font-size:20px; font-weight:800; color:#fff; display:flex; align-items:center; gap:10px; }
        .cart-count-pill { background:rgba(255,255,255,.2); padding:3px 13px; border-radius:20px; font-size:13px; }

        .cart-layout { max-width:1200px; margin:28px auto; padding:0 24px 60px; display:grid; grid-template-columns:1fr 380px; gap:22px; align-items:start; }

        /* ── Items Card ── */
        .cart-items-card { background:#fff; border-radius:18px; border:1.5px solid #e5e7eb; box-shadow:0 2px 14px rgba(0,0,0,.07); overflow:hidden; }
        .cart-items-head { padding:16px 22px; border-bottom:1.5px solid #f3f4f6; display:flex; align-items:center; justify-content:space-between; }
        .cart-items-head h2 { font-family:'Sora',sans-serif; font-size:16px; font-weight:800; color:#0a214f; }
        .clear-btn { background:none; border:1.5px solid #fee2e2; color:#dc2626; padding:7px 14px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; transition:all .2s; }
        .clear-btn:hover { background:#fee2e2; }

        .cart-item { display:flex; gap:16px; padding:18px 22px; border-bottom:1px solid #f3f4f6; animation:fadeIn .3s ease; }
        .cart-item:last-child { border-bottom:none; }
        .ci-img { width:90px; height:90px; border-radius:14px; border:1.5px solid #e5e7eb; background:#f9fafb; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center; position:relative; }
        .ci-img img { width:100%; height:100%; object-fit:contain; padding:6px; }
        .ci-no-img { font-size:36px; color:#d1d5db; }
        .ci-free-badge { position:absolute; top:-5px; left:-5px; background:linear-gradient(135deg,#059669,#10b981); color:#fff; font-size:9px; font-weight:800; padding:3px 7px; border-radius:8px; }
        .ci-disc-badge { position:absolute; top:-5px; right:-5px; background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; font-size:9px; font-weight:800; padding:3px 7px; border-radius:8px; white-space:nowrap; }

        .ci-info { flex:1; min-width:0; }
        .ci-title { font-size:15px; font-weight:700; color:#0a214f; line-height:1.4; margin-bottom:5px; transition:color .2s; text-decoration:none; display:block; }
        .ci-title:hover { color:#1872B5; }
        .ci-variant { font-size:11px; color:#6b7280; background:#f3f4f6; padding:3px 10px; border-radius:5px; display:inline-block; margin-bottom:8px; font-weight:600; }
        .ci-free-tag { font-size:11px; color:#065f46; background:#d1fae5; padding:3px 10px; border-radius:5px; display:inline-block; margin-bottom:8px; font-weight:700; }
        .ci-unit-price { font-size:12px; margin-bottom:10px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .ci-unit-orig  { color:#9ca3af; text-decoration:line-through; }
        .ci-unit-disc  { color:#059669; font-weight:700; }
        .ci-unit-label { background:#d1fae5; color:#059669; font-size:10px; font-weight:800; padding:2px 7px; border-radius:4px; }
        .ci-bottom { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
        .ci-total-col  { display:flex; flex-direction:column; gap:3px; }
        .ci-total      { font-size:19px; font-weight:800; color:#1872B5; font-family:'Sora',sans-serif; }
        .ci-total.free { color:#059669; }
        .ci-total.saved { color:#059669; }
        .ci-total-orig { font-size:12px; color:#9ca3af; text-decoration:line-through; }
        .ci-savings-chip { font-size:11px; color:#059669; font-weight:800; background:#d1fae5; padding:2px 9px; border-radius:5px; }

        .qty-ctrl { display:flex; align-items:center; border:1.5px solid #e5e7eb; border-radius:11px; overflow:hidden; }
        .qty-btn  { width:36px; height:36px; border:none; background:#f9fafb; cursor:pointer; font-size:18px; font-weight:700; color:#374151; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .qty-btn:hover:not(:disabled) { background:#1872B5; color:#fff; }
        .qty-btn:disabled { opacity:.35; cursor:not-allowed; }
        .qty-num  { width:40px; text-align:center; font-size:15px; font-weight:800; color:#0a214f; background:#fff; border-left:1.5px solid #e5e7eb; border-right:1.5px solid #e5e7eb; height:36px; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; }
        .ci-remove { background:none; border:none; cursor:pointer; color:#9ca3af; font-size:18px; padding:6px; transition:color .2s; margin-left:8px; }
        .ci-remove:hover { color:#ef4444; }

        /* ── Summary Card ── */
        .summary-card { background:#fff; border-radius:18px; border:1.5px solid #e5e7eb; box-shadow:0 2px 14px rgba(0,0,0,.07); overflow:hidden; position:sticky; top:24px; }
        .summary-head { padding:16px 22px; border-bottom:1.5px solid #f3f4f6; }
        .summary-head h2 { font-family:'Sora',sans-serif; font-size:16px; font-weight:800; color:#0a214f; }
        .summary-body { padding:20px 22px; }

        /* Free shipping progress */
        .fs-unlocked { background:#d1fae5; border:1px solid #a7f3d0; border-radius:12px; padding:10px 14px; font-size:13px; color:#065f46; font-weight:700; display:flex; align-items:center; gap:8px; margin-bottom:16px; }
        .fs-progress-wrap { margin-bottom:16px; }
        .fs-progress-txt { font-size:12px; color:#6b7280; font-weight:600; margin-bottom:7px; }
        .fs-progress-txt strong { color:#1872B5; }
        .fs-bar { width:100%; height:7px; background:#e5e7eb; border-radius:10px; overflow:hidden; }
        .fs-bar-fill { height:100%; background:linear-gradient(90deg,#0ea5e9,#1872B5); border-radius:10px; transition:width .5s ease; }

        /* Summary rows */
        .sum-table { background:#f8faff; border:1.5px solid #e0eaff; border-radius:12px; padding:12px 14px; margin-bottom:12px; }
        .sum-row { display:flex; justify-content:space-between; align-items:center; padding:5px 0; }
        .sum-row + .sum-row { border-top:1px dashed #e5e7eb; }
        .sum-label { font-size:13px; color:#6b7280; font-weight:600; display:flex; align-items:center; gap:5px; }
        .sum-val   { font-size:13px; color:#374151; font-weight:700; font-family:'Sora',sans-serif; }
        .sum-val.green { color:#059669; }
        .sum-val.free  { color:#059669; font-weight:800; }
        .sum-val.loading { color:#9ca3af; font-size:11px; }

        /* Savings highlight */
        .sum-savings { display:flex; justify-content:space-between; align-items:center; background:#d1fae5; padding:10px 14px; border-radius:10px; margin-bottom:10px; border:1px solid #a7f3d0; }
        .sum-savings-l { color:#065f46; font-weight:700; font-size:13px; }
        .sum-savings-r { color:#059669; font-weight:800; font-size:14px; font-family:'Sora',sans-serif; }

        /* Shipping methods */
        .ship-methods { margin-top:8px; display:flex; flex-direction:column; gap:6px; }
        .ship-opt { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:10px; border:1.5px solid #e5e7eb; cursor:pointer; transition:all .18s; background:#fff; }
        .ship-opt:hover, .ship-opt.on { border-color:#1872B5; background:#eff6ff; }
        .ship-radio { width:16px; height:16px; border-radius:50%; border:2px solid #d1d5db; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
        .ship-opt.on .ship-radio { border-color:#1872B5; }
        .ship-dot { width:8px; height:8px; border-radius:50%; background:#1872B5; opacity:0; }
        .ship-opt.on .ship-dot { opacity:1; }
        .ship-info { flex:1; }
        .ship-name { font-size:12px; font-weight:700; color:#0a214f; }
        .ship-time { font-size:10px; color:#9ca3af; font-weight:600; }
        .ship-price { font-size:13px; font-weight:800; color:#1872B5; font-family:'Sora',sans-serif; }
        .ship-price.free { color:#059669; }
        .ship-spinner { width:13px; height:13px; border-radius:50%; border:2px solid #e5e7eb; border-top-color:#1872B5; animation:spin .7s linear infinite; display:inline-block; vertical-align:middle; margin-right:6px; }

        /* Grand Total */
        .grand-total { display:flex; justify-content:space-between; align-items:center; background:linear-gradient(135deg,#0a214f,#1872B5); border-radius:12px; padding:12px 16px; margin-bottom:4px; }
        .gt-label { font-family:'Sora',sans-serif; font-size:14px; font-weight:800; color:#fff; }
        .gt-val   { font-family:'Sora',sans-serif; font-size:22px; font-weight:800; color:#fff; }
        .gt-note  { font-size:10px; color:#6b7280; margin-bottom:14px; padding:0 2px; }

        .checkout-btn { width:100%; padding:15px; background:linear-gradient(135deg,#1872B5,#2596e1); color:#fff; border:none; border-radius:13px; font-size:16px; font-weight:800; font-family:'Sora',sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:9px; transition:all .22s; box-shadow:0 4px 18px rgba(24,114,181,.32); margin-bottom:10px; text-decoration:none; }
        .checkout-btn:hover { background:linear-gradient(135deg,#1560a0,#1872B5); transform:translateY(-1px); }
        .continue-btn { width:100%; padding:12px; background:#f9fafb; color:#374151; border:1.5px solid #e5e7eb; border-radius:12px; font-size:14px; font-weight:700; font-family:'Sora',sans-serif; cursor:pointer; transition:all .2s; text-decoration:none; display:block; text-align:center; }
        .continue-btn:hover { background:#f3f4f6; border-color:#1872B5; color:#1872B5; }
        .secure-badges { display:flex; align-items:center; justify-content:center; gap:14px; margin-top:16px; padding-top:14px; border-top:1px solid #f3f4f6; }
        .sec-badge { font-size:11px; color:#9ca3af; display:flex; align-items:center; gap:4px; font-weight:600; }

        @media(max-width:900px) {
          .cart-layout { grid-template-columns:1fr; }
          .summary-card { position:static; }
        }
        @media(max-width:480px) {
          .cart-layout { padding:0 14px 48px; margin:20px auto; }
          .ci-img { width:72px; height:72px; }
          .cart-item { padding:14px 14px; gap:12px; }
        }
      `}</style>

      {/* Header */}
      <div className="cart-header">
        <div className="cart-header-inner">
          <nav className="cart-bc">
            <Link href="/">Home</Link><span>›</span>
            <Link href="/collections">Shop</Link><span>›</span>
            <span style={{ color: '#fff', fontWeight: 700 }}>Cart</span>
          </nav>
          <div className="cart-page-title">
            🛒 Shopping Cart
            <span className="cart-count-pill">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="cart-layout">

        {/* ── LEFT: Items ── */}
        <div className="cart-items-card">
          <div className="cart-items-head">
            <h2>Cart Items ({totalItems})</h2>
            <button className="clear-btn" onClick={clearCart}>🗑 Clear All</button>
          </div>

          {items.map((item, idx) => {
            const isFree = item.variant?.includes('__FREE__');
            // Clean variant name — __FREE__2__1 Kg → 1 Kg
            const cleanVariant = item.variant?.replace(/__FREE__\d*__/g, '').trim() || undefined;

            const effectivePrice = isFree ? 0 : (item.discountedPrice ?? item.price);
            const itemTotal      = effectivePrice * item.quantity;
            const origTotal      = item.price * item.quantity;
            const itemSavings    = isFree
              ? item.price * item.quantity
              : item.discountedPrice
                ? (item.price - item.discountedPrice) * item.quantity
                : 0;

            return (
              <div className="cart-item" key={`${item.id}-${item.variant || ''}-${idx}`}>
                <div className="ci-img">
                  {item.image ? <img src={item.image} alt={item.title} /> : <span className="ci-no-img">📦</span>}
                  {isFree && <span className="ci-free-badge">FREE</span>}
                  {!isFree && item.discountLabel && <span className="ci-disc-badge">{item.discountLabel}</span>}
                </div>

                <div className="ci-info">
                  <Link href={`/product/${item.slug}`} className="ci-title">{item.title}</Link>

                  {/* Variant / Free tag */}
                  {isFree
                    ? <span className="ci-free-tag">🎁 FREE Item{cleanVariant ? ` — ${cleanVariant}` : ''}</span>
                    : cleanVariant && <span className="ci-variant">{cleanVariant}</span>
                  }

                  {/* Unit price */}
                  <div className="ci-unit-price">
                    {isFree ? (
                      <span style={{ color: '#059669', fontWeight: 700 }}>Free (worth ₹{item.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })})</span>
                    ) : item.discountedPrice ? (
                      <>
                        <span className="ci-unit-orig">₹{item.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })} each</span>
                        <span className="ci-unit-disc">₹{item.discountedPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })} each</span>
                        {item.discountLabel && <span className="ci-unit-label">{item.discountLabel}</span>}
                      </>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>₹{item.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })} each</span>
                    )}
                  </div>

                  <div className="ci-bottom">
                    <div className="ci-total-col">
                      <span className={`ci-total ${isFree ? 'free' : item.discountedPrice ? 'saved' : ''}`}>
                        {isFree ? 'FREE 🎁' : `₹${itemTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                      </span>
                      {(isFree || item.discountedPrice) && (
                        <>
                          <span className="ci-total-orig">₹{origTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                          <span className="ci-savings-chip">Save ₹{itemSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="qty-ctrl">
                        <button className="qty-btn" disabled={isFree} onClick={() => updateQty(item.id, item.variant, item.quantity - 1)}>−</button>
                        <span className="qty-num">{item.quantity}</span>
                        <button className="qty-btn" disabled={isFree} onClick={() => updateQty(item.id, item.variant, item.quantity + 1)}>+</button>
                      </div>
                      <button className="ci-remove" onClick={() => removeFromCart(item.id, item.variant)}>🗑</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div className="summary-card">
          <div className="summary-head"><h2>Order Summary</h2></div>
          <div className="summary-body">

            {/* Free Shipping Progress */}
            {freeUnlocked ? (
              <div className="fs-unlocked">🎉 You've unlocked FREE shipping!</div>
            ) : (
              <div className="fs-progress-wrap">
                <div className="fs-progress-txt">
                  Add <strong>₹{remaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> more for free shipping!
                </div>
                <div className="fs-bar">
                  <div className="fs-bar-fill" style={{ width: `${freeProgress}%` }} />
                </div>
              </div>
            )}

            {/* Savings Banner */}
            {totalSavings > 0 && (
              <div className="sum-savings">
                <span className="sum-savings-l">🎉 Total Savings</span>
                <span className="sum-savings-r">-₹{totalSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="sum-table">
              <div className="sum-row">
                <span className="sum-label">🛍️ Subtotal ({totalItems} items)</span>
                <span className="sum-val">₹{totalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              {totalSavings > 0 && (
                <div className="sum-row">
                  <span className="sum-label">🎁 Product Discount</span>
                  <span className="sum-val green">-₹{totalSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
              <div className="sum-row">
                <span className="sum-label">
                  🚚 Shipping
                  {selectedShipping && !freeUnlocked && (
                    <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 4 }}>({selectedShipping.name})</span>
                  )}
                </span>
                {shippingLoading ? (
                  <span className="sum-val loading"><span className="ship-spinner" />Calculating...</span>
                ) : freeUnlocked || shippingCharge === 0 ? (
                  <span className="sum-val free">FREE 🎉</span>
                ) : (
                  <span className="sum-val">₹{shippingCharge.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                )}
              </div>
            </div>

            {/* Shipping Method Selection (agar multiple methods hain) */}
            {!freeUnlocked && shippingMethods.length > 1 && (
              <div className="ship-methods">
                {shippingMethods.map(m => (
                  <div
                    key={m.rate_id}
                    className={`ship-opt ${selectedShipping?.rate_id === m.rate_id ? 'on' : ''}`}
                    onClick={() => setSelectedShipping(m)}
                  >
                    <div className="ship-radio"><div className="ship-dot" /></div>
                    <div className="ship-info">
                      <div className="ship-name">{m.name}</div>
                      {m.delivery_time && <div className="ship-time">⏱ {m.delivery_time}</div>}
                    </div>
                    <div className={`ship-price ${m.charge === 0 ? 'free' : ''}`}>
                      {m.charge === 0 ? 'FREE' : `₹${Number(m.charge).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grand Total */}
            <div className="grand-total">
              <span className="gt-label">Total</span>
              <span className="gt-val">₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
            <p className="gt-note">Inclusive of all taxes · Final price</p>

            <Link href="/checkout" className="checkout-btn">
              <span>✓</span> Proceed to Checkout
            </Link>
            <Link href="/collections" className="continue-btn">← Continue Shopping</Link>

            <div className="secure-badges">
              <span className="sec-badge">🔒 Secure</span>
              <span className="sec-badge">✓ Easy Returns</span>
              <span className="sec-badge">🚚 Fast Delivery</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
