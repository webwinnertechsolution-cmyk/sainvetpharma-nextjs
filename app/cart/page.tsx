'use client';

import { useCart } from '@/app/components/CartContext';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

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

  const shipping   = totalPrice > 999 ? 0 : 99;
  const grandTotal = totalPrice + shipping;
  const freeShipProgress = Math.min((totalPrice / 999) * 100, 100);

  /* ── Empty State ── */
  if (items.length === 0) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito,sans-serif', background: '#f5f7fa' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Nunito:wght@400;600;700;800&display=swap');`}</style>
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 84, marginBottom: 20 }}>🛒</div>
        <h2 style={{ fontFamily: 'Sora,sans-serif', fontSize: 26, color: '#0a214f', marginBottom: 10 }}>Your cart is empty</h2>
        <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 30 }}>Looks like you haven't added anything yet.</p>
        <Link href="/collections" style={{
          background: 'linear-gradient(135deg,#1872B5,#2596e1)',
          color: '#fff', padding: '14px 34px', borderRadius: 12,
          textDecoration: 'none', fontWeight: 800, fontSize: 15,
          fontFamily: 'Sora,sans-serif', boxShadow: '0 4px 18px rgba(24,114,181,.32)',
          display: 'inline-block',
        }}>
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

        /* ── Header ── */
        .cart-header { background: linear-gradient(135deg,#1872B5,#1560a0); padding: 18px 0; }
        .cart-header-inner { max-width:1200px; margin:0 auto; padding:0 24px; display:flex; align-items:center; justify-content:space-between; }
        .cart-bc { font-size:13px; color:rgba(255,255,255,.75); display:flex; align-items:center; gap:5px; flex-wrap:wrap; }
        .cart-bc a { color:rgba(255,255,255,.75); text-decoration:none; transition:color .2s; }
        .cart-bc a:hover { color:#fff; }
        .cart-page-title { font-family:'Sora',sans-serif; font-size:20px; font-weight:800; color:#fff; display:flex; align-items:center; gap:10px; }
        .cart-count-pill { background:rgba(255,255,255,.2); padding:3px 13px; border-radius:20px; font-size:13px; }

        /* ── Layout ── */
        .cart-layout { max-width:1200px; margin:28px auto; padding:0 24px 60px; display:grid; grid-template-columns:1fr 360px; gap:22px; align-items:start; }

        /* ── Items Card ── */
        .cart-items-card { background:#fff; border-radius:18px; border:1.5px solid #e5e7eb; box-shadow:0 2px 14px rgba(0,0,0,.07); overflow:hidden; }
        .cart-items-head { padding:16px 22px; border-bottom:1.5px solid #f3f4f6; display:flex; align-items:center; justify-content:space-between; }
        .cart-items-head h2 { font-family:'Sora',sans-serif; font-size:16px; font-weight:800; color:#0a214f; }
        .clear-btn { background:none; border:1.5px solid #fee2e2; color:#dc2626; padding:7px 14px; border-radius:9px; font-size:12px; font-weight:700; cursor:pointer; font-family:'Nunito',sans-serif; transition:all .2s; }
        .clear-btn:hover { background:#fee2e2; }

        /* ── Single Item ── */
        .cart-item { display:flex; gap:16px; padding:18px 22px; border-bottom:1px solid #f3f4f6; animation:fadeIn .3s ease; }
        .cart-item:last-child { border-bottom:none; }

        .ci-img { width:90px; height:90px; border-radius:14px; border:1.5px solid #e5e7eb; background:#f9fafb; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center; position:relative; }
        .ci-img img { width:100%; height:100%; object-fit:contain; padding:6px; }
        .ci-no-img { font-size:36px; color:#d1d5db; }
        .ci-disc-badge { position:absolute; top:-5px; right:-5px; background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; font-size:9px; font-weight:800; padding:3px 7px; border-radius:8px; box-shadow:0 2px 6px rgba(220,38,38,.3); white-space:nowrap; }

        .ci-info { flex:1; min-width:0; }
        .ci-title { font-size:15px; font-weight:700; color:#0a214f; line-height:1.4; margin-bottom:5px; cursor:pointer; transition:color .2s; }
        .ci-title:hover { color:#1872B5; }
        .ci-variant { font-size:11px; color:#6b7280; background:#f3f4f6; padding:3px 10px; border-radius:5px; display:inline-block; margin-bottom:8px; font-weight:600; }
        .ci-unit-price { font-size:12px; margin-bottom:10px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .ci-unit-orig  { color:#9ca3af; text-decoration:line-through; }
        .ci-unit-disc  { color:#059669; font-weight:700; }
        .ci-unit-label { background:#d1fae5; color:#059669; font-size:10px; font-weight:800; padding:2px 7px; border-radius:4px; }

        .ci-bottom { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
        .ci-total-col  { display:flex; flex-direction:column; gap:3px; }
        .ci-total      { font-size:19px; font-weight:800; color:#1872B5; font-family:'Sora',sans-serif; }
        .ci-total.saved { color:#059669; }
        .ci-total-orig { font-size:12px; color:#9ca3af; text-decoration:line-through; }
        .ci-savings-chip { font-size:11px; color:#059669; font-weight:800; background:#d1fae5; padding:2px 9px; border-radius:5px; }

        /* ── Qty Control ── */
        .qty-ctrl { display:flex; align-items:center; border:1.5px solid #e5e7eb; border-radius:11px; overflow:hidden; }
        .qty-btn  { width:36px; height:36px; border:none; background:#f9fafb; cursor:pointer; font-size:18px; font-weight:700; color:#374151; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .qty-btn:hover { background:#1872B5; color:#fff; }
        .qty-num  { width:40px; text-align:center; font-size:15px; font-weight:800; color:#0a214f; background:#fff; border-left:1.5px solid #e5e7eb; border-right:1.5px solid #e5e7eb; height:36px; display:flex; align-items:center; justify-content:center; font-family:'Sora',sans-serif; }
        .ci-remove { background:none; border:none; cursor:pointer; color:#9ca3af; font-size:18px; padding:6px; transition:color .2s; margin-left:8px; }
        .ci-remove:hover { color:#ef4444; }

        /* ── Summary Card ── */
        .summary-card { background:#fff; border-radius:18px; border:1.5px solid #e5e7eb; box-shadow:0 2px 14px rgba(0,0,0,.07); overflow:hidden; position:sticky; top:24px; }
        .summary-head { padding:16px 22px; border-bottom:1.5px solid #f3f4f6; }
        .summary-head h2 { font-family:'Sora',sans-serif; font-size:16px; font-weight:800; color:#0a214f; }
        .summary-body { padding:20px 22px; }

        .sum-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:13px; font-size:14px; }
        .sum-label { color:#6b7280; font-weight:600; }
        .sum-val   { color:#0a214f; font-weight:700; }
        .sum-free  { color:#10b981; font-weight:800; }

        /* Savings row */
        .sum-savings-row { display:flex; justify-content:space-between; align-items:center; background:#d1fae5; padding:11px 14px; border-radius:12px; margin-bottom:14px; border:1px solid #a7f3d0; }
        .sum-savings-label { color:#065f46; font-weight:700; font-size:13px; display:flex; align-items:center; gap:6px; }
        .sum-savings-val   { color:#059669; font-weight:800; font-size:14px; font-family:'Sora',sans-serif; }

        .sum-divider { border:none; border-top:1.5px solid #f3f4f6; margin:14px 0; }
        .sum-total-row  { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
        .sum-total-label { font-family:'Sora',sans-serif; font-size:15px; font-weight:800; color:#0a214f; }
        .sum-total-val   { font-family:'Sora',sans-serif; font-size:26px; font-weight:800; color:#1872B5; }
        .sum-incl { font-size:11px; color:#9ca3af; margin-bottom:18px; }

        /* Free shipping progress */
        .free-ship-banner { background:#d1fae5; border:1px solid #a7f3d0; border-radius:12px; padding:10px 14px; font-size:12px; color:#065f46; font-weight:700; display:flex; align-items:center; gap:8px; margin-bottom:16px; }
        .ship-progress { width:100%; height:6px; background:#e5e7eb; border-radius:10px; overflow:hidden; margin-top:7px; }
        .ship-progress-bar { height:100%; background:linear-gradient(90deg,#10b981,#059669); border-radius:10px; transition:width .5s ease; }
        .ship-progress-text { font-size:12px; color:#6b7280; font-weight:600; margin-bottom:6px; }
        .ship-progress-text strong { color:#1872B5; }

        /* Checkout buttons */
        .checkout-btn { width:100%; padding:15px; background:linear-gradient(135deg,#1872B5,#2596e1); color:#fff; border:none; border-radius:13px; font-size:16px; font-weight:800; font-family:'Sora',sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:9px; transition:all .22s; box-shadow:0 4px 18px rgba(24,114,181,.32); margin-bottom:10px; text-decoration:none; }
        .checkout-btn:hover { background:linear-gradient(135deg,#1560a0,#1872B5); transform:translateY(-1px); box-shadow:0 6px 26px rgba(24,114,181,.42); }
        .continue-btn { width:100%; padding:12px; background:#f9fafb; color:#374151; border:1.5px solid #e5e7eb; border-radius:12px; font-size:14px; font-weight:700; font-family:'Sora',sans-serif; cursor:pointer; transition:all .2s; text-decoration:none; display:block; text-align:center; }
        .continue-btn:hover { background:#f3f4f6; border-color:#1872B5; color:#1872B5; }

        /* Secure badges */
        .secure-badges { display:flex; align-items:center; justify-content:center; gap:14px; margin-top:16px; padding-top:14px; border-top:1px solid #f3f4f6; }
        .sec-badge { font-size:11px; color:#9ca3af; display:flex; align-items:center; gap:4px; font-weight:600; }

        /* Responsive */
        @media(max-width:900px) {
          .cart-layout { grid-template-columns:1fr; }
          .summary-card { position:static; }
        }
        @media(max-width:480px) {
          .cart-layout { padding:0 14px 48px; margin:20px auto; }
          .ci-img { width:72px; height:72px; }
          .cart-item { padding:16px 16px; gap:12px; }
        }
      `}</style>

      {/* ── Header ── */}
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
            const effectivePrice = item.discountedPrice ?? item.price;
            const itemTotal      = effectivePrice * item.quantity;
            const origTotal      = item.price * item.quantity;
            const itemSavings    = item.discountedPrice
              ? (item.price - item.discountedPrice) * item.quantity
              : 0;

            return (
              <div className="cart-item" key={`${item.id}-${item.variant || ''}-${idx}`}>

                {/* Image */}
                <div className="ci-img">
                  {item.image
                    ? <img src={item.image} alt={item.title} />
                    : <span className="ci-no-img">📦</span>
                  }
                  {item.discountLabel && (
                    <span className="ci-disc-badge">{item.discountLabel}</span>
                  )}
                </div>

                {/* Info */}
                <div className="ci-info">
                  <Link href={`/product/${item.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="ci-title">{item.title}</div>
                  </Link>
                  {item.variant && <span className="ci-variant">{item.variant}</span>}

                  {/* Unit price */}
                  <div className="ci-unit-price">
                    {item.discountedPrice ? (
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
                    {/* Total */}
                    <div className="ci-total-col">
                      <span className={`ci-total ${item.discountedPrice ? 'saved' : ''}`}>
                        ₹{itemTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                      {item.discountedPrice && (
                        <>
                          <span className="ci-total-orig">₹{origTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                          <span className="ci-savings-chip">Save ₹{itemSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </>
                      )}
                    </div>

                    {/* Qty + Remove */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="qty-ctrl">
                        <button className="qty-btn" onClick={() => updateQty(item.id, item.variant, item.quantity - 1)}>−</button>
                        <span className="qty-num">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.id, item.variant, item.quantity + 1)}>+</button>
                      </div>
                      <button className="ci-remove" onClick={() => removeFromCart(item.id, item.variant)} title="Remove item">🗑</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── RIGHT: Summary ── */}
        <div className="summary-card">
          <div className="summary-head"><h2>Order Summary</h2></div>
          <div className="summary-body">

            {/* Free shipping progress */}
            {shipping > 0 ? (
              <div style={{ marginBottom: 16 }}>
                <div className="ship-progress-text">
                  Add <strong>₹{(999 - totalPrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> more for free shipping!
                </div>
                <div className="ship-progress">
                  <div className="ship-progress-bar" style={{ width: `${freeShipProgress}%` }} />
                </div>
              </div>
            ) : (
              <div className="free-ship-banner">🎉 You've unlocked FREE shipping!</div>
            )}

            {/* Subtotal */}
            <div className="sum-row">
              <span className="sum-label">Subtotal ({totalItems} items)</span>
              <span className="sum-val">₹{totalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>

            {/* Savings */}
            {totalSavings > 0 && (
              <div className="sum-savings-row">
                <span className="sum-savings-label">🎉 Total Savings</span>
                <span className="sum-savings-val">-₹{totalSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            )}

            {/* Shipping */}
            <div className="sum-row">
              <span className="sum-label">Shipping</span>
              {shipping === 0
                ? <span className="sum-free">FREE</span>
                : <span className="sum-val">₹{shipping}</span>
              }
            </div>

            <hr className="sum-divider" />

            {/* Grand Total */}
            <div className="sum-total-row">
              <span className="sum-total-label">Total</span>
              <span className="sum-total-val">₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
            <p className="sum-incl">Inclusive of all taxes</p>

            {/* Checkout */}
            <Link href="/checkout" className="checkout-btn">
              <span>✓</span> Proceed to Checkout
            </Link>

            <Link href="/collections" className="continue-btn">← Continue Shopping</Link>

            {/* Secure badges */}
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