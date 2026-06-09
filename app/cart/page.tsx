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

  const freeUnlocked = totalPrice >= freeShippingMin;
  const freeProgress = Math.min((totalPrice / freeShippingMin) * 100, 100);
  const remaining    = Math.max(0, freeShippingMin - totalPrice);

  const shippingCharge: number = (() => {
    if (freeUnlocked)            return 0;
    if (fallbackCharge !== null) return fallbackCharge;
    if (selectedShipping)        return Number(selectedShipping.charge);
    return 0;
  })();

  const grandTotal = totalPrice + shippingCharge;

  if (items.length === 0) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FC', fontFamily: "'Nunito',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');`}</style>
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 44 }}>🛒</div>
        <h2 style={{ fontFamily: 'Sora,sans-serif', fontSize: 24, color: '#0B1E3D', marginBottom: 10, fontWeight: 800 }}>Your cart is empty</h2>
        <p style={{ color: '#6B7280', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>Looks like you haven't added anything yet.</p>
        <Link href="/collections" style={{ background: 'linear-gradient(135deg,#1A6FCC,#2B7FE0)', color: '#fff', padding: '14px 36px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15, fontFamily: 'Sora,sans-serif', display: 'inline-block', letterSpacing: '0.01em' }}>
          Browse Products
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#F0F4FA', minHeight: '100vh', fontFamily: "'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

        /* ─── Page Header ─── */
        .ch { background: #fff; border-bottom: 1px solid #E5EAF2; padding: 14px 0; }
        .ch-inner { max-width: 1160px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; }
        .ch-bc { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #9CA3AF; }
        .ch-bc a { color: #9CA3AF; text-decoration: none; transition: color .15s; }
        .ch-bc a:hover { color: #2B7FE0; }
        .ch-bc-sep { color: #D1D5DB; font-size: 11px; }
        .ch-bc-cur { color: #0B1E3D; font-weight: 700; }
        .ch-title { display: flex; align-items: center; gap: 10px; font-family: 'Sora',sans-serif; font-size: 17px; font-weight: 800; color: #0B1E3D; }
        .ch-pill { background: #EEF4FF; color: #2B7FE0; font-size: 12px; font-weight: 700; padding: 3px 12px; border-radius: 20px; font-family: 'Nunito',sans-serif; }

        /* ─── Full-width Shipping Bar (drawer style) ─── */
        .page-fs-bar { padding: 10px 0 12px; transition: background .4s, border-color .4s; }
        .page-fs-bar.unlocked { background: linear-gradient(135deg,#d1fae5,#a7f3d0); border-bottom-color: #6ee7b7; }
        .page-fs-bar:not(.unlocked) { background: #EFF6FF; border-bottom: 1px solid #BFDBFE; }
        .page-fs-inner { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
        .page-fs-txt { font-size: 13px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 7px; }
        .page-fs-bar:not(.unlocked) .page-fs-txt { color: #1D4ED8; }
        .page-fs-bar.unlocked .page-fs-txt { color: #065F46; }
        .page-fs-track { height: 7px; background: rgba(0,0,0,.1); border-radius: 10px; overflow: hidden; }
        .page-fs-fill { height: 100%; border-radius: 10px; transition: width .6s ease; }
        .page-fs-bar:not(.unlocked) .page-fs-fill { background: linear-gradient(90deg,#3B82F6,#2B7FE0); }
        .page-fs-bar.unlocked .page-fs-fill { background: linear-gradient(90deg,#059669,#10b981); }

        /* ─── Layout ─── */
        .cart-wrap { max-width: 1160px; margin: 28px auto 72px; padding: 0 24px; display: grid; grid-template-columns: 1fr 368px; gap: 20px; align-items: start; }

        /* ─── Items Card ─── */
        .items-card { background: #fff; border-radius: 16px; border: 1px solid #E5EAF2; box-shadow: 0 1px 8px rgba(0,0,0,.05); overflow: hidden; }
        .items-head { padding: 16px 22px; border-bottom: 1px solid #F0F2F7; display: flex; align-items: center; justify-content: space-between; }
        .items-head-title { font-family: 'Sora',sans-serif; font-size: 15px; font-weight: 800; color: #0B1E3D; }
        .clear-btn { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid #FECACA; color: #DC2626; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .18s; font-family: 'Nunito',sans-serif; }
        .clear-btn:hover { background: #FEF2F2; border-color: #DC2626; }

        /* ─── Cart Item ─── */
        .ci{display:flex;gap:12px;padding:14px 22px;border-bottom:1px solid #f5f6fa;align-items:flex-start;transition:background .15s;}
.ci:last-child{border-bottom:none;}
.ci:hover{background:#fafbff;}
.ci-img{width:76px;height:76px;border-radius:12px;border:1.5px solid #e8edf5;background:#f8fafc;overflow:hidden;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;}
.ci-img img{width:100%;height:100%;object-fit:contain;padding:6px;}
.ci-badge{position:absolute;bottom:0;left:0;right:0;font-size:8px;font-weight:800;text-align:center;padding:2px 0;border-radius:0 0 10px 10px;text-transform:uppercase;letter-spacing:.04em;}
.ci-badge.free{background:#059669;color:#fff;}
.ci-badge.disc{background:#7c3aed;color:#fff;}
.ci-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;}
.ci-name{font-size:13.5px;font-weight:700;color:#0a214f;line-height:1.35;text-decoration:none;display:block;transition:color .15s;}
.ci-name:hover{color:#1872B5;}
.ci-tag{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:2px 9px;border-radius:6px;width:fit-content;margin-bottom:4px;}
.ci-tag.variant{background:#f3f4f6;color:#6b7280;}
.ci-tag.free-item{background:#d1fae5;color:#065f46;}
.ci-meta{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:2px;}
.ci-prices{display:flex;flex-direction:column;gap:1px;}
.ci-price-each{font-size:11px;color:#9ca3af;font-weight:600;}
.ci-total-val{font-size:18px;font-weight:800;color:#0a214f;font-family:'Sora',sans-serif;line-height:1;}
.ci-total-val.free-val{color:#059669;font-size:15px;}
.ci-total-slashed{font-size:11px;color:#9ca3af;text-decoration:line-through;}
.ci-total-saved{font-size:10px;font-weight:700;color:#059669;}
.ci-actions{display:flex;align-items:center;gap:8px;}
.qty-wrap{display:flex;align-items:center;border:1.5px solid #e5eaf2;border-radius:9px;overflow:hidden;background:#f8fafc;}
.qty-btn{width:32px;height:32px;border:none;background:transparent;cursor:pointer;font-size:16px;font-weight:600;color:#374151;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.qty-btn:hover:not(:disabled){background:#eff6ff;color:#1872B5;}
.qty-btn:disabled{opacity:.3;cursor:not-allowed;}
.qty-num{width:34px;height:32px;text-align:center;font-size:13px;font-weight:800;color:#0a214f;background:#fff;border-left:1.5px solid #e5eaf2;border-right:1.5px solid #e5eaf2;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;}
.del-btn{width:32px;height:32px;border:1.5px solid #e5eaf2;border-radius:8px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .18s;}
.del-btn:hover{border-color:#fca5a5;background:#fef2f2;color:#dc2626;}

        /* ─── Summary Card ─── */
        .sum-card{background:#fff;border-radius:16px;border:1px solid #e5eaf2;overflow:hidden;position:sticky;top:24px;}
.sum-head{padding:14px 20px;border-bottom:1px solid #f0f2f7;}
.sum-head h2{font-family:'Sora',sans-serif;font-size:15px;font-weight:800;color:#0a214f;}
.sum-body{padding:18px 20px;display:flex;flex-direction:column;gap:12px;}
.savings-banner{display:flex;justify-content:space-between;align-items:center;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:10px;padding:10px 14px;}
.savings-l{font-size:12px;color:#14532d;font-weight:700;}
.savings-r{font-size:14px;font-weight:800;color:#16a34a;font-family:'Sora',sans-serif;}
.price-table{border:1px solid #e8edf5;border-radius:11px;overflow:hidden;}
.pt-row{display:flex;justify-content:space-between;align-items:center;padding:10px 13px;border-bottom:1px solid #f0f2f7;}
.pt-row:last-child{border-bottom:none;}
.pt-label{font-size:12px;color:#6b7280;font-weight:600;display:flex;align-items:center;gap:5px;}
.pt-val{font-size:13px;font-weight:800;color:#0a214f;font-family:'Sora',sans-serif;}
.pt-val.green{color:#059669;}
.pt-val.free-ship{color:#059669;}
.pt-val.loading{color:#9ca3af;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px;}
.grand-total-block{background:#0a214f;border-radius:12px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;}
.gt-label{font-family:'Sora',sans-serif;font-size:11px;font-weight:700;color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:.07em;}
.gt-amount{font-family:'Sora',sans-serif;font-size:24px;font-weight:800;color:#fff;line-height:1;}
.gt-note{font-size:10px;color:#9ca3af;padding:0 2px;}
.checkout-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px;background:#1872B5;color:#fff;border:none;border-radius:11px;font-size:14px;font-weight:800;font-family:'Sora',sans-serif;cursor:pointer;text-decoration:none;transition:all .2s;letter-spacing:.01em;}
.checkout-btn:hover{background:#1560a0;transform:translateY(-1px);}
.continue-btn{display:block;width:100%;padding:11px;background:#f0f4fa;color:#374151;border:1.5px solid #e5eaf2;border-radius:11px;font-size:13px;font-weight:700;font-family:'Nunito',sans-serif;cursor:pointer;text-decoration:none;text-align:center;transition:all .18s;}
.continue-btn:hover{background:#eff6ff;border-color:#1872B5;color:#1872B5;}
.trust-strip{display:flex;align-items:center;justify-content:center;gap:16px;padding-top:12px;border-top:1px solid #f0f2f7;}
.trust-item{font-size:11px;color:#9ca3af;font-weight:600;display:flex;align-items:center;gap:4px;}

        /* Shipping methods */
        .ship-methods { display: flex; flex-direction: column; gap: 6px; }
        .ship-opt { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1.5px solid #E5EAF2; cursor: pointer; transition: all .18s; background: #FAFBFF; }
        .ship-opt:hover, .ship-opt.sel { border-color: #2B7FE0; background: #EEF4FF; }
        .ship-radio-wrap { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #D1D5DB; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: border-color .15s; }
        .ship-opt.sel .ship-radio-wrap { border-color: #2B7FE0; }
        .ship-dot { width: 8px; height: 8px; border-radius: 50%; background: #2B7FE0; opacity: 0; transition: opacity .15s; }
        .ship-opt.sel .ship-dot { opacity: 1; }
        .ship-info { flex: 1; }
        .ship-name { font-size: 12.5px; font-weight: 700; color: #0B1E3D; }
        .ship-time { font-size: 11px; color: #9CA3AF; font-weight: 600; margin-top: 1px; }
        .ship-charge { font-size: 13px; font-weight: 800; color: #2B7FE0; font-family: 'Sora',sans-serif; }
        .ship-charge.free { color: #059669; }

        /* Grand total */
        .grand-total-block { background: linear-gradient(135deg,#0B1E3D 0%,#1A4A8A 100%); border-radius: 13px; padding: 16px 18px; display: flex; justify-content: space-between; align-items: center; }
        .gt-label { font-family: 'Sora',sans-serif; font-size: 13px; font-weight: 700; color: rgba(255,255,255,.8); letter-spacing: .02em; text-transform: uppercase; }
        .gt-amount { font-family: 'Sora',sans-serif; font-size: 26px; font-weight: 800; color: #fff; line-height: 1; }
        .gt-note { font-size: 11px; color: #9CA3AF; padding: 0 2px; }

        /* CTAs */
        .checkout-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 15px; background: linear-gradient(135deg,#1A6FCC,#2B7FE0); color: #fff; border: none; border-radius: 11px; font-size: 15px; font-weight: 800; font-family: 'Sora',sans-serif; cursor: pointer; text-decoration: none; transition: all .2s; box-shadow: 0 4px 16px rgba(43,127,224,.3); letter-spacing: .01em; }
        .checkout-btn:hover { background: linear-gradient(135deg,#155EA8,#1A6FCC); transform: translateY(-1px); box-shadow: 0 6px 22px rgba(43,127,224,.38); }
        .continue-btn { display: block; width: 100%; padding: 12px; background: #F8F9FC; color: #374151; border: 1.5px solid #E5EAF2; border-radius: 11px; font-size: 13.5px; font-weight: 700; font-family: 'Nunito',sans-serif; cursor: pointer; text-decoration: none; text-align: center; transition: all .18s; }
        .continue-btn:hover { background: #EEF4FF; border-color: #2B7FE0; color: #2B7FE0; }

        /* Trust strip */
        .trust-strip { display: flex; align-items: center; justify-content: center; gap: 18px; padding-top: 14px; border-top: 1px solid #F0F2F7; }
        .trust-item { font-size: 11.5px; color: #9CA3AF; font-weight: 600; display: flex; align-items: center; gap: 4px; }

        @media(max-width:900px) {
          .cart-wrap { grid-template-columns: 1fr; }
          .sum-card { position: static; }
        }
        @media(max-width:520px) {
          .cart-wrap { padding: 0 14px 56px; margin: 18px auto; }
          .ci { padding: 16px 14px; gap: 12px; }
          .ci-img { width: 76px; height: 76px; }
          .gt-amount { font-size: 22px; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="ch">
        <div className="ch-inner">
          <nav className="ch-bc">
            <Link href="/" className="">Home</Link>
            <span className="ch-bc-sep">›</span>
            <Link href="/collections" className="">Shop</Link>
            <span className="ch-bc-sep">›</span>
            <span className="ch-bc-cur">Cart</span>
          </nav>
          <div className="ch-title">
            <span>🛒</span>
            Shopping Cart
            <span className="ch-pill">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* ── Full-width Free Shipping Bar (drawer style) ── */}
      <div className={`page-fs-bar ${freeUnlocked ? 'unlocked' : ''}`}>
        <div className="page-fs-inner">
          <div className="page-fs-txt">
            {freeUnlocked ? (
              <><span>🎉</span> You've unlocked FREE shipping on this order!</>
            ) : (
              <><span>🚚</span> Add <strong style={{ margin: '0 4px' }}>₹{remaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> more for FREE shipping!</>
            )}
          </div>
          <div className="page-fs-track">
            <div className="page-fs-fill" style={{ width: `${freeProgress}%` }} />
          </div>
        </div>
      </div>

      <div className="cart-wrap">

        {/* ── LEFT: Items ── */}
        <div className="items-card">
          <div className="items-head">
            <span className="items-head-title">Cart Items ({totalItems})</span>
            <button className="clear-btn" onClick={clearCart}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              Clear All
            </button>
          </div>

          {items.map((item, idx) => {
            const isFree = item.variant?.includes('__FREE__');
            const cleanVariant = item.variant?.replace(/__FREE__\d*__/g, '').trim() || undefined;
            const effectivePrice = isFree ? 0 : (item.discountedPrice ?? item.price);
            const itemTotal   = effectivePrice * item.quantity;
            const origTotal   = item.price * item.quantity;
            const itemSavings = isFree
              ? item.price * item.quantity
              : item.discountedPrice ? (item.price - item.discountedPrice) * item.quantity : 0;

            return (
              <div className="ci" key={`${item.id}-${item.variant || ''}-${idx}`}>
                <div className="ci-img">
  {item.image ? <img src={item.image} alt={item.title} /> : <span style={{fontSize:28,color:'#d1d5db'}}>📦</span>}
  {isFree && <span className="ci-badge free">FREE</span>}
  {!isFree && item.discountLabel && <span className="ci-badge disc">{item.discountLabel}</span>}
</div>

                <div className="ci-body">
                  <Link href={`/product/${item.slug}`} className="ci-name">{item.title}</Link>

                  {isFree
                    ? <span className="ci-tag free-item">🎁 Free Item{cleanVariant ? ` · ${cleanVariant}` : ''}</span>
                    : cleanVariant && <span className="ci-tag variant">{cleanVariant}</span>
                  }

                  <div className="ci-price-row">
                    {isFree ? (
                      <span className="ci-free-note">Free — worth ₹{item.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    ) : item.discountedPrice ? (
                      <>
                        <span className="ci-orig">₹{item.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        <span className="ci-final">₹{item.discountedPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })} each</span>
                        {item.discountLabel && <span className="ci-save-chip">{item.discountLabel}</span>}
                      </>
                    ) : (
                      <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>₹{item.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })} each</span>
                    )}
                  </div>

                  <div className="ci-meta">
  <div className="ci-prices">
    <span className="ci-price-each">
      {isFree ? '' : `₹${item.price.toLocaleString('en-IN')} × ${item.quantity}`}
    </span>
    <span className={`ci-total-val ${isFree ? 'free-val' : ''}`}>
      {isFree ? 'FREE 🎁' : `₹${itemTotal.toLocaleString('en-IN',{maximumFractionDigits:0})}`}
    </span>
    {itemSavings > 0 && <span className="ci-total-saved">You save ₹{itemSavings.toLocaleString('en-IN',{maximumFractionDigits:0})}</span>}
    {isFree && <span className="ci-total-slashed">₹{origTotal.toLocaleString('en-IN',{maximumFractionDigits:0})}</span>}
  </div>
  <div className="ci-actions">
    <div className="qty-wrap">
      <button className="qty-btn" disabled={isFree} onClick={() => updateQty(item.id, item.variant, item.quantity - 1)}>−</button>
      <span className="qty-num">{item.quantity}</span>
      <button className="qty-btn" disabled={isFree} onClick={() => updateQty(item.id, item.variant, item.quantity + 1)}>+</button>
    </div>
    <button className="del-btn" onClick={() => removeFromCart(item.id, item.variant)}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
    </button>
  </div>
</div>
            );
          })}
        </div>

        {/* ── RIGHT: Summary ── */}
        <div className="sum-card">
          <div className="sum-head"><h2>Order Summary</h2></div>
          <div className="sum-body">

            {/* Savings */}
            {totalSavings > 0 && (
              <div className="savings-banner">
                <span className="savings-l">Total Savings</span>
                <span className="savings-r">−₹{totalSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            )}

            {/* Price breakdown */}
            <div className="price-table">
              <div className="pt-row">
                <span className="pt-label"><span className="pt-label-icon">🛍️</span> Subtotal ({totalItems} items)</span>
                <span className="pt-val">₹{totalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              {totalSavings > 0 && (
                <div className="pt-row">
                  <span className="pt-label"><span className="pt-label-icon">🏷️</span> Discount</span>
                  <span className="pt-val green">−₹{totalSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
              <div className="pt-row">
                <span className="pt-label">
                  <span className="pt-label-icon">🚚</span>
                  Shipping
                  {selectedShipping && !freeUnlocked && (
                    <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 4 }}>({selectedShipping.name})</span>
                  )}
                </span>
                {shippingLoading ? (
                  <span className="pt-val loading"><span className="spin-ring" /> Calculating…</span>
                ) : freeUnlocked || shippingCharge === 0 ? (
                  <span className="pt-val free-ship">FREE</span>
                ) : (
                  <span className="pt-val">₹{shippingCharge.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                )}
              </div>
            </div>

            {/* Multiple shipping methods */}
            {!freeUnlocked && shippingMethods.length > 1 && (
              <div className="ship-methods">
                {shippingMethods.map(m => (
                  <div key={m.rate_id} className={`ship-opt ${selectedShipping?.rate_id === m.rate_id ? 'sel' : ''}`} onClick={() => setSelectedShipping(m)}>
                    <div className="ship-radio-wrap"><div className="ship-dot" /></div>
                    <div className="ship-info">
                      <div className="ship-name">{m.name}</div>
                      {m.delivery_time && <div className="ship-time">⏱ {m.delivery_time}</div>}
                    </div>
                    <div className={`ship-charge ${m.charge === 0 ? 'free' : ''}`}>
                      {m.charge === 0 ? 'FREE' : `₹${Number(m.charge).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grand Total */}
            <div className="grand-total-block">
              <div>
                <div className="gt-label">Total Payable</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 2 }}>Incl. all taxes</div>
              </div>
              <div className="gt-amount">₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>

            <Link href="/checkout" className="checkout-btn">
              Proceed to Checkout
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </Link>
            <Link href="/collections" className="continue-btn">← Continue Shopping</Link>

            <div className="trust-strip">
              <span className="trust-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Secure Checkout
              </span>
              <span className="trust-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.18-7.58"/></svg>
                Easy Returns
              </span>
              <span className="trust-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                Fast Delivery
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
