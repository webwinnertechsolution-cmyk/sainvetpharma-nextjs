'use client';

import { useCart } from '@/app/components/CartContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ShippingMethod {
  rate_id: number;
  method_id: number;
  name: string;
  delivery_time?: string;
  charge: number;
  is_free: boolean;
}

export default function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQty,
    totalItems,
    totalPrice,
    totalSavings,
    drawerOpen,
    setDrawerOpen,
  } = useCart();

  const [freeShippingMin, setFreeShippingMin]   = useState<number | null>(null);
  const [shippingMethods, setShippingMethods]   = useState<ShippingMethod[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [shippingLoading, setShippingLoading]   = useState(false);
  const [shippingError, setShippingError]       = useState(false);
  // Fallback charge jab methods[] empty ho (backend se configured nahi)
  const [fallbackCharge, setFallbackCharge]     = useState<number | null>(null);
  const [itemsWithDiscount, setItemsWithDiscount] = useState<any[]>([]);

  // ── Free shipping threshold — sirf ek baar fetch ──
  // (calculate-shipping API se hi milta hai free_shipping_min)
  useEffect(() => {
    if (freeShippingMin !== null) return; // already fetched
    fetch(`${API_URL}/api/calculate-shipping?cart_total=0&country=india`)
      .then(r => r.json())
      .then(d => {
        if (d.free_shipping_min) setFreeShippingMin(Number(d.free_shipping_min));
      })
      .catch(() => {});
  }, []);

  // ── Items discount display ──
  useEffect(() => {
    if (items.length === 0) { setItemsWithDiscount([]); return; }

    const groupedByProduct = items.reduce((acc, item) => {
      if (!acc[item.id]) acc[item.id] = [];
      acc[item.id].push(item);
      return acc;
    }, {} as Record<number, any[]>);

    const checkDiscounts = async () => {
      const updated = { ...groupedByProduct };
      for (const [productId, productItems] of Object.entries(groupedByProduct)) {
        try {
          const res = await fetch(`${API_URL}/api/product-discount/${productId}`);
          const discount = await res.json();
          if (!discount.has_discount) continue;
          const paidItems = (productItems as any[]).filter(i => !i.variant?.includes('__FREE__'));
          const totalPaidQty = paidItems.reduce((sum: number, i: any) => sum + i.quantity, 0);
          if (discount.type === 'buy_x_get_y') {
            const buyQty = discount.buy_quantity ?? 1;
            const getQty = discount.get_quantity ?? 1;
            const freeQty = Math.floor(totalPaidQty / buyQty) * getQty;
            const originalPrice = paidItems[0]?.price || 0;
            if (discount.get_value_type === 'free') {
              const discountPerItem = freeQty > 0 ? originalPrice * (freeQty / totalPaidQty) : 0;
              (updated as any)[productId] = (productItems as any[]).map((item: any) => ({
                ...item,
                discountedPrice: item.variant?.includes('__FREE__') ? 0 : (originalPrice - discountPerItem),
                discountLabel: item.variant?.includes('__FREE__') ? '🎁 FREE' : `Buy ${buyQty} Get ${getQty}`,
              }));
            }
          }
        } catch {}
      }
      setItemsWithDiscount(Object.values(updated).flat());
    };
    checkDiscounts();
  }, [JSON.stringify(items)]);

  // ── Shipping fetch ──
  useEffect(() => {
    if (!drawerOpen || items.length === 0) return;

    setShippingLoading(true);
    setShippingError(false);
    setShippingMethods([]);
    setSelectedShipping(null);
    setFallbackCharge(null);

    fetch(`${API_URL}/api/calculate-shipping?cart_total=${totalPrice}&country=india`)
      .then(r => r.json())
      .then(data => {
        // free_shipping_min hamesha save karo
        if (data.free_shipping_min) setFreeShippingMin(Number(data.free_shipping_min));

        if (data.is_free_shipping) {
          // Backend ne free shipping confirm kiya
          setFallbackCharge(0);
        } else if (data.success && data.methods?.length > 0) {
          // Normal methods available
          setShippingMethods(data.methods);
          setSelectedShipping(data.methods[0]);
        } else if (data.success && data.methods?.length === 0) {
  const freeMin = data.free_shipping_min ? Number(data.free_shipping_min) : null;
  if (freeMin !== null && totalPrice >= freeMin) {
    setFallbackCharge(0); // sirf free shipping set hogi
  }
  // else: kuch set nahi hoga ← PROBLEM YAH HAI
} 
        } else {
          setShippingError(true);
        }
        setShippingLoading(false);
      })
      .catch(() => {
        setShippingError(true);
        setShippingLoading(false);
      });
  }, [drawerOpen, totalPrice]);

  useEffect(() => {
    if (items.length === 0) {
      setShippingMethods([]);
      setSelectedShipping(null);
      setItemsWithDiscount([]);
    }
  }, [items.length]);

  // ── Calculations ──
  const freeMin      = freeShippingMin ?? 0;
  const remaining    = freeMin > 0 ? Math.max(0, freeMin - totalPrice) : 0;
  const progress     = freeMin > 0 ? Math.min(100, (totalPrice / freeMin) * 100) : 0;
  const freeUnlocked = freeMin > 0 && totalPrice >= freeMin;

  const shippingCharge: number | null = (() => {
    if (items.length === 0)        return 0;
    if (freeUnlocked)              return 0;
    if (shippingLoading)           return null;
    if (shippingError)             return null;
    if (fallbackCharge !== null)   return fallbackCharge;   // ✅ fallback use karo
    if (!selectedShipping)         return null;
    return Number(selectedShipping.charge);
  })();

  const grandTotal = shippingCharge !== null
    ? totalPrice + shippingCharge
    : totalPrice;

  const handleQuantityChange = (itemId: number, variant: string | undefined, newQty: number) => {
    updateQty(itemId, variant, newQty);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Nunito:wght@400;600;700;800&display=swap');

        .cd-overlay{position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,.52);backdrop-filter:blur(4px);opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s;}
        .cd-overlay.open{opacity:1;visibility:visible;}
        .cd-drawer{position:fixed;top:0;right:-460px;width:440px;max-width:100vw;height:100vh;z-index:99999;background:#fff;display:flex;flex-direction:column;box-shadow:-10px 0 50px rgba(0,0,0,.16);transition:right .38s cubic-bezier(.4,0,.2,1);font-family:'Nunito',sans-serif;}
        .cd-drawer.open{right:0;}

        /* ── Header ── */
        .cd-header{background:linear-gradient(135deg,#1872B5,#2596e1);padding:8px 18px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
        .cd-htitle{font-family:'Sora',sans-serif;font-size:14px;font-weight:800;color:#fff;display:flex;align-items:center;gap:9px;}
        .cd-count{background:rgba(255,255,255,.22);color:#fff;font-size:11px;font-weight:800;padding:3px 10px;border-radius:20px;}
        .cd-x{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.18);border:none;color:#fff;font-size:21px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;line-height:1;}
        .cd-x:hover{background:rgba(255,255,255,.32);}

        /* ── Free Shipping Bar ── */
        .cd-fs{flex-shrink:0;padding:10px 18px 12px;background:#f0f9ff;border-bottom:1px solid #bae6fd;transition:background .4s,border-color .4s;}
        .cd-fs.on{background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-bottom-color:#6ee7b7;}
        .cd-fs-txt{font-size:12px;font-weight:700;color:#0369a1;margin-bottom:7px;display:flex;align-items:center;gap:6px;}
        .cd-fs-txt.on{color:#065f46;}
        .cd-fs-track{height:7px;background:#bae6fd;border-radius:10px;overflow:hidden;}
        .cd-fs-track.on{background:#6ee7b7;}
        .cd-fs-fill{height:100%;background:linear-gradient(90deg,#0ea5e9,#2596e1);border-radius:10px;transition:width .6s ease;}
        .cd-fs-fill.on{background:linear-gradient(90deg,#059669,#10b981);}

        /* ── Savings Banner ── */
        .cd-sav{flex-shrink:0;background:linear-gradient(135deg,#d1fae5,#a7f3d0);padding:8px 18px;display:none;align-items:center;justify-content:space-between;border-bottom:1px solid #6ee7b7;}
        .cd-sav-l{font-size:12px;color:#065f46;font-weight:700;}
        .cd-sav-r{font-size:13px;color:#059669;font-weight:800;font-family:'Sora',sans-serif;}

        /* ── Empty ── */
        .cd-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;}
        .cd-empty-ic{font-size:60px;margin-bottom:14px;opacity:.65;}
        .cd-empty h3{font-family:'Sora',sans-serif;font-size:17px;color:#374151;margin-bottom:7px;}
        .cd-empty p{font-size:13px;color:#9ca3af;margin-bottom:22px;}
        .cd-shoplink{background:#1872B5;color:#fff;padding:11px 28px;border-radius:10px;text-decoration:none;font-weight:800;font-size:13px;font-family:'Sora',sans-serif;}

        /* ── Items ── */
        .cd-items{flex:1;overflow-y:auto;padding:10px 14px;scrollbar-width:thin;scrollbar-color:#e5e7eb transparent;}
        .cd-items::-webkit-scrollbar{width:4px;}
        .cd-items::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:4px;}
        .cd-item{display:flex;gap:11px;padding:11px 0;border-bottom:1px solid #f3f4f6;animation:cfade .28s ease;}
        .cd-item:last-child{border-bottom:none;}
        @keyframes cfade{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        .cd-img{width:70px;height:70px;border-radius:10px;border:1.5px solid #e5e7eb;background:#f9fafb;overflow:hidden;flex-shrink:0;position:relative;display:flex;align-items:center;justify-content:center;}
        .cd-img img{width:100%;height:100%;object-fit:contain;padding:4px;}
        .cd-img-ph{font-size:26px;color:#d1d5db;}
        .cd-fbadge{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(135deg,#059669,#10b981);color:#fff;font-size:9px;font-weight:800;padding:2px 4px;border-radius:0 0 8px 8px;text-align:center;}
.cd-dbadge{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;font-size:8px;font-weight:800;padding:2px 4px;border-radius:0 0 8px 8px;text-align:center;line-height:1.3;}
        .cd-info{flex:1;min-width:0;}
        .cd-title{font-size:12px;font-weight:700;color:#0a214f;line-height:1.4;margin-bottom:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .cd-vtag{font-size:10px;color:#6b7280;font-weight:600;background:#f3f4f6;padding:2px 7px;border-radius:4px;display:inline-block;margin-bottom:1px;}
        .cd-ftag{font-size:10px;color:#065f46;font-weight:700;background:#d1fae5;padding:2px 7px;border-radius:4px;display:inline-block;margin-bottom:7px;}
        .cd-bot{display:flex;align-items:center;justify-content:space-between;}
        .cd-pcol {display: flex;flex-direction: row;gap: 8px;align-items: center;}
        .cd-price{font-size:12px;font-weight:800;color:#1872B5;font-family:'Sora',sans-serif;}
        .cd-price.d{color:#059669;}
        .cd-price.f{color:#059669;}
        .cd-orig{font-size:10px;color:#9ca3af;text-decoration:line-through;}
        .cd-dl{font-size:9px;color:#059669;font-weight:800;background:#d1fae5;padding:1px 6px;border-radius:4px;display:inline-block;}
        .qc{display:flex;align-items:center;border:1.5px solid #e5e7eb;border-radius:8px;overflow:hidden;}
        .qb{width:28px;height:28px;border:none;background:#f9fafb;cursor:pointer;font-size:15px;font-weight:700;color:#374151;display:flex;align-items:center;justify-content:center;transition:all .15s;}
        .qb:hover:not(:disabled){background:#1872B5;color:#fff;}
        .qb:disabled{opacity:.35;cursor:not-allowed;}
        .qn{width:28px;text-align:center;font-size:12px;font-weight:800;color:#0a214f;background:#fff;border-left:1.5px solid #e5e7eb;border-right:1.5px solid #e5e7eb;display:flex;align-items:center;justify-content:center;height:28px;font-family:'Sora',sans-serif;}
        .cd-rm{background:none;border:none;cursor:pointer;color:#9ca3af;font-size:14px;padding:3px;transition:color .2s;margin-left:5px;line-height:1;}
        .cd-rm:hover{color:#ef4444;}

        /* ── Shipping Section ── */
        .cd-ship{flex-shrink:0;border-top:1px solid #f3f4f6;padding:10px 16px 0; display:none;}
        .cd-ship-lbl{font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;}
        .cd-ship-list{display:flex;flex-direction:column;gap:6px;margin-bottom:8px;}
        .cd-ship-opt{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;border:1.5px solid #e5e7eb;cursor:pointer;transition:all .18s;background:#fff;}
        .cd-ship-opt:hover,.cd-ship-opt.on{border-color:#1872B5;background:#eff6ff;}
        .cd-sradio{width:16px;height:16px;border-radius:50%;border:2px solid #d1d5db;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:border-color .18s;}
        .cd-ship-opt.on .cd-sradio{border-color:#1872B5;}
        .cd-sdot{width:8px;height:8px;border-radius:50%;background:#1872B5;opacity:0;transition:opacity .18s;}
        .cd-ship-opt.on .cd-sdot{opacity:1;}
        .cd-sinfo{flex:1;min-width:0;}
        .cd-sname{font-size:12px;font-weight:700;color:#0a214f;}
        .cd-stime{font-size:10px;color:#9ca3af;font-weight:600;}
        .cd-sprice{font-size:13px;font-weight:800;color:#1872B5;font-family:'Sora',sans-serif;white-space:nowrap;}
        .cd-sprice.free{color:#059669;}
        .cd-sfree{font-size:11px;color:#065f46;font-weight:700;background:#d1fae5;padding:7px 10px;border-radius:8px;display:flex;align-items:center;gap:5px;margin-bottom:8px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .cd-spinner{width:13px;height:13px;border-radius:50%;border:2px solid #e5e7eb;border-top-color:#1872B5;animation:spin .7s linear infinite;flex-shrink:0;}
        .cd-sloading{font-size:12px;color:#9ca3af;font-weight:600;display:flex;align-items:center;gap:6px;padding:6px 0 10px;}
        .cd-serror{font-size:11px;color:#dc2626;font-weight:600;background:#fee2e2;padding:7px 10px;border-radius:8px;margin-bottom:8px;}

        /* ── Footer / Price Summary ── */
        .cd-foot{padding:10px 18px 18px;border-top:2px solid #f3f4f6;flex-shrink:0;background:#fff;}

        /* Summary table */
        .cd-summary{background:#f8faff;border:1.5px solid #e0eaff;border-radius:12px;padding:12px 14px;margin-bottom:12px;}
        .cd-row{display:flex;justify-content:space-between;align-items:center;padding:4px 0;}
        .cd-row+.cd-row{border-top:1px dashed #e5e7eb;}
        .cd-rl{font-size:12px;color:#6b7280;font-weight:600;display:flex;align-items:center;gap:5px;}
        .cd-rv{font-size:12px;font-weight:700;color:#374151;font-family:'Sora',sans-serif;}
        .cd-rv.g{color:#059669;}
        .cd-rv.r{color:#ef4444;}
        .cd-rv.m{color:#9ca3af;font-size:11px;font-weight:600;}

        /* Grand total */
        .cd-grand{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:linear-gradient(135deg,#0a214f,#1872B5);border-radius:12px;margin-bottom:4px;}
        .cd-grand-l{font-size:12px;font-weight:800;color:#fff;font-family:'Sora',sans-serif;}
        .cd-grand-r{font-size:12px;font-weight:800;color:#fff;font-family:'Sora',sans-serif;}
        .cd-grand-note{font-size:9px;color:#93c5fd;font-weight:600;padding:0 14px;margin-bottom:12px;}

        .cd-btn{width:100%;padding:14px;background:linear-gradient(135deg,#1872B5,#2596e1);color:#fff;border:none;border-radius:11px;font-size:14px;font-weight:800;font-family:'Sora',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .22s;box-shadow:0 4px 14px rgba(24,114,181,.3);text-decoration:none;}
        .cd-btn:hover{background:linear-gradient(135deg,#1560a0,#1872B5);transform:translateY(-1px);}

        @media(max-width:767px){
          .cd-drawer{width:100vw;}
          .cd-title{font-size:12px;line-height:14px;}
        }
      `}</style>

      <div className={`cd-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />

      <div className={`cd-drawer ${drawerOpen ? 'open' : ''}`}>

        {/* Header */}
        <div className="cd-header">
          <div className="cd-htitle">
            🛒 My Cart
            {totalItems > 0 && <span className="cd-count">{totalItems} item{totalItems > 1 ? 's' : ''}</span>}
          </div>
          <button className="cd-x" onClick={() => setDrawerOpen(false)}>×</button>
        </div>

        {/* Free Shipping Bar */}
        {freeShippingMin !== null && (
          <div className={`cd-fs ${freeUnlocked ? 'on' : ''}`}>
            <div className={`cd-fs-txt ${freeUnlocked ? 'on' : ''}`}>
              {freeUnlocked
                ? <><span>🎉</span> Free shipping unlocked!</>
                : <><span>🚚</span> Add <strong style={{ margin: '0 3px' }}>₹{remaining.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong> more for FREE shipping!</>
              }
            </div>
            <div className={`cd-fs-track ${freeUnlocked ? 'on' : ''}`}>
              <div className={`cd-fs-fill ${freeUnlocked ? 'on' : ''}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Savings Banner */}
        {totalSavings > 0 && (
          <div className="cd-sav">
            <span className="cd-sav-l">🎉 You're saving on this order!</span>
            <span className="cd-sav-r">-₹{totalSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="cd-empty">
            <div className="cd-empty-ic">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some products to get started!</p>
            <Link href="/collections" className="cd-shoplink" onClick={() => setDrawerOpen(false)}>Browse Products →</Link>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="cd-items">
              {(itemsWithDiscount.length > 0 ? itemsWithDiscount : items).map((item: any, idx: number) => {
                const isFree = item.variant?.includes('__FREE__');
                const varName = item.variant?.replace(/__FREE__\d*__/g, '').trim() || undefined;
                return (
                  <div className="cd-item" key={`${item.id}-${item.variant || ''}-${idx}`}>
                    <div className="cd-img">
                      {item.image ? <img src={item.image} alt={item.title} /> : <span className="cd-img-ph">📦</span>}
                      {isFree && <span className="cd-fbadge">FREE</span>}
                      {!isFree && item.discountLabel && <span className="cd-dbadge">{item.discountLabel}</span>}
                    </div>
                    <div className="cd-info">
                      <div className="cd-title">{item.title}</div>
                      {isFree
                        ? <span className="cd-ftag">🎁 FREE Item</span>
                        : varName && <span className="cd-vtag">{varName}</span>
                      }
                      <div className="cd-bot">
                        <div className="cd-pcol">
                          {isFree ? (
                            <>
                              <span className="cd-price f">FREE 🎁</span>
                              <span className="cd-orig">₹{item.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                            </>
                          ) : item.discountedPrice != null ? (
                            <>
                              <span className="cd-price d">₹{(item.discountedPrice * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                              <span className="cd-orig">₹{(item.price * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                              {item.discountLabel && <span className="cd-dl">{item.discountLabel}</span>}
                            </>
                          ) : (
                            <span className="cd-price">₹{(item.price * item.quantity).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div className="qc">
                            <button className="qb" onClick={() => handleQuantityChange(item.id, item.variant, item.quantity - 1)} disabled={isFree}>−</button>
                            <span className="qn">{item.quantity}</span>
                            <button className="qb" onClick={() => handleQuantityChange(item.id, item.variant, item.quantity + 1)} disabled={isFree}>+</button>
                          </div>
                          <button className="cd-rm" onClick={() => removeFromCart(item.id, item.variant)}>🗑</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shipping Section */}
            <div className="cd-ship">
              <div className="cd-ship-lbl">🚚 Shipping</div>
              {shippingLoading ? (
                <div className="cd-sloading"><div className="cd-spinner" /> Calculating shipping...</div>
              ) : freeUnlocked || fallbackCharge === 0 ? (
                <div className="cd-sfree">🎉 Free shipping applied automatically!</div>
              ) : shippingError ? (
                <div className="cd-serror">⚠️ Shipping unavailable — calculated at checkout</div>
              ) : fallbackCharge !== null ? (
                // methods[] empty tha — fallback charge show karo
                <div className="cd-ship-list">
                  <div className="cd-ship-opt on">
                    <div className="cd-sradio"><div className="cd-sdot" /></div>
                    <div className="cd-sinfo">
                      <div className="cd-sname">Standard Delivery</div>
                      {freeShippingMin && (
                        <div className="cd-stime">
                          Free above ₹{Number(freeShippingMin).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                      )}
                    </div>
                    <div className={`cd-sprice ${fallbackCharge === 0 ? 'free' : ''}`}>
                      {fallbackCharge === 0 ? 'FREE' : `₹${fallbackCharge.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    </div>
                  </div>
                </div>
              ) : shippingMethods.length > 0 ? (
                <div className="cd-ship-list">
                  {shippingMethods.map((m: ShippingMethod) => (
                    <div
                      key={m.rate_id}
                      className={`cd-ship-opt ${selectedShipping?.rate_id === m.rate_id ? 'on' : ''}`}
                      onClick={() => setSelectedShipping(m)}
                    >
                      <div className="cd-sradio"><div className="cd-sdot" /></div>
                      <div className="cd-sinfo">
                        <div className="cd-sname">{m.name}</div>
                        {m.delivery_time && <div className="cd-stime">⏱ {m.delivery_time}</div>}
                      </div>
                      <div className={`cd-sprice ${m.charge === 0 ? 'free' : ''}`}>
                        {m.charge === 0 ? 'FREE' : `₹${Number(m.charge).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cd-sloading" style={{ paddingBottom: 10 }}>No shipping methods available</div>
              )}
            </div>

            {/* ── Price Summary Footer ── */}
            <div className="cd-foot">
              <div className="cd-summary">
                {/* Subtotal */}
                <div className="cd-row">
                  <span className="cd-rl">🛍️ Subtotal</span>
                  <span className="cd-rv">₹{totalPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>

                {/* Product Discount Savings */}
                {totalSavings > 0 && (
                  <div className="cd-row">
                    <span className="cd-rl">🎁 Product Discount</span>
                    <span className="cd-rv g">-₹{totalSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                )}

                {/* Shipping */}
                <div className="cd-row">
                  <span className="cd-rl">
                    🚚 Shipping
                    {selectedShipping && !freeUnlocked && !shippingLoading && (
                      <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 4, fontWeight: 600 }}>
                        ({selectedShipping.name})
                      </span>
                    )}
                  </span>
                  {shippingLoading ? (
                    <span className="cd-rv m">Calculating...</span>
                  ) : freeUnlocked ? (
                    <span className="cd-rv g">FREE 🎉</span>
                  ) : shippingCharge !== null ? (
                    <span className={`cd-rv ${shippingCharge === 0 ? 'g' : ''}`}>
                      {shippingCharge === 0 ? 'FREE' : `₹${shippingCharge.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    </span>
                  ) : (
                    <span className="cd-rv m">At checkout</span>
                  )}
                </div>
              </div>

              {/* Grand Total */}
              <div className="cd-grand">
                <span className="cd-grand-l">Total{shippingCharge === null ? '*' : ''}</span>
                <span className="cd-grand-r">
                  ₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <p className="cd-grand-note">
                {shippingCharge === null
                  ? '* Shipping will be calculated at checkout · Taxes included'
                  : 'Taxes included · Final price'}
              </p>

              <Link href="/cart" className="cd-btn" onClick={() => setDrawerOpen(false)}>
                🛒 View Cart &amp; Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
