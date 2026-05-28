'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import WishlistHeart from '@/app/components/WishlistHeart';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function CollectionsPageInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [tags, setTags]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [apiError, setApiError]       = useState(null); // ⬅️ NEW: Error tracking
  const [hoveredId, setHoveredId]     = useState(null);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [secOpen, setSecOpen]         = useState({ categories: true, tags: false, price: false });

  const [minInput, setMinInput]   = useState('');
  const [maxInput, setMaxInput]   = useState('');
  const [appliedMin, setAppliedMin] = useState('');
  const [appliedMax, setAppliedMax] = useState('');

  const category = searchParams.get('category');
  const tag      = searchParams.get('tag');
  const sort     = searchParams.get('sort') || 'latest';
  const page     = searchParams.get('page') || '1';

  /* ── Fetch with Better Error Handling ── */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const qs = new URLSearchParams();
        if (category) qs.append('category', category);
        if (tag)      qs.append('tag', tag);
        qs.append('sort', sort);
        qs.append('page', page);

        const fullUrl = `${API_URL}/api/shop?${qs}`;
        
        // 🔍 DEBUGGING: Log the full URL
        console.log('📍 Fetching from:', fullUrl);
        console.log('📍 API_URL env:', process.env.NEXT_PUBLIC_API_URL);

        const res = await fetch(fullUrl);
        
        // 🔍 DEBUGGING: Log response status
        console.log('📍 Response Status:', res.status, res.statusText);

        if (!res.ok) {
          throw new Error(`API returned ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        
        // 🔍 DEBUGGING: Log full response data
        console.log('✅ API Response Data:', data);
        console.log('📊 Products count:', data.products?.length || 0);
        console.log('📂 Categories count:', data.categories?.length || 0);
        console.log('🏷️ Tags count:', data.tags?.length || 0);

        // ⚠️ VALIDATION: Check if data structure is correct
        if (!data.products) {
          console.warn('⚠️ Missing "products" key in response');
        }
        if (!data.categories) {
          console.warn('⚠️ Missing "categories" key in response');
        }
        if (!data.tags) {
          console.warn('⚠️ Missing "tags" key in response');
        }

        setAllProducts(data.products   || []);
        setCategories(data.categories  || []);
        setTags(data.tags              || []);

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('❌ Fetch Error:', errorMsg);
        setApiError(errorMsg);
        setAllProducts([]);
        setCategories([]);
        setTags([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category, tag, sort, page]);

  /* ── Client-side price filter ── */
  useEffect(() => {
    if (!appliedMin && !appliedMax) { setProducts(allProducts); return; }
    const min = appliedMin !== '' ? parseFloat(appliedMin) : -Infinity;
    const max = appliedMax !== '' ? parseFloat(appliedMax) :  Infinity;
    setProducts(allProducts.filter(p => {
      const price = getEffectivePrice(p);
      return price !== null && price >= min && price <= max;
    }));
  }, [allProducts, appliedMin, appliedMax]);

  /* ── Helpers ── */
  function getEffectivePrice(p: any) {
    if (p.sale_price && parseFloat(p.sale_price) > 0) return parseFloat(p.sale_price);
    if (p.price      && parseFloat(p.price)      > 0) return parseFloat(p.price);
    if (p.variants?.length) {
      const v = p.variants[0];
      if (v.price && parseFloat(v.price) > 0) return parseFloat(v.price);
    }
    return null;
  }

  function getDiscount(p: any) {
    let compare = null, selling = null;
    if (p.compare_price && parseFloat(p.compare_price) > 0) compare = parseFloat(p.compare_price);
    if (p.price         && parseFloat(p.price)         > 0) selling = parseFloat(p.price);
    if (p.sale_price    && parseFloat(p.sale_price)    > 0) {
      selling = parseFloat(p.sale_price);
      if (!compare && p.price) compare = parseFloat(p.price);
    }
    if (p.variants?.length) {
      const v = p.variants[0];
      if (!selling && v.price)         selling = parseFloat(v.price);
      if (!compare && v.compare_price) compare = parseFloat(v.compare_price);
    }
    if (!compare || !selling || compare <= selling) return null;
    const pct = Math.round(((compare - selling) / compare) * 100);
    return pct >= 1 ? { pct, compare, selling } : null;
  }

  const imgUrl     = (n) => n ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${n}`         : null;
  const galleryUrl = (n) => n ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/products/gallery/${n}` : null;

  /* ── Nav ── */
  const buildUrl = useCallback((overrides = {}) => {
    const u = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === null || v === '') u.delete(k); else u.set(k, String(v));
    });
    u.delete('page');
    return `/collections?${u.toString()}`;
  }, [searchParams]);

  const applySort     = (val: any)           => router.push(buildUrl({ sort: val }));
  const applyCategory = (slug: any)          => { router.push(buildUrl({ category: slug || null })); setDrawerOpen(false); };
  const applyTag      = (slug: any, checked: any) => { router.push(buildUrl({ tag: checked ? slug : null })); setDrawerOpen(false); };

  const applyPrice = () => { setAppliedMin(minInput); setAppliedMax(maxInput); setDrawerOpen(false); };
  const clearPrice = () => { setMinInput(''); setMaxInput(''); setAppliedMin(''); setAppliedMax(''); };
  const clearAll   = () => { clearPrice(); router.push('/collections'); };
  const toggleSec  = (k: any) => setSecOpen(prev => ({ ...prev, [k]: !prev[k] }));

  useEffect(() => {
    const h = (e: any) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const hasFilters  = category || tag || appliedMin || appliedMax;
  const priceActive = appliedMin || appliedMax;

  const sidebarJSX = (
    <>
      <div className="sb-head">
        <span className="sb-head-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="4" y1="6"  x2="20" y2="6"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
            <line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Filters
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {hasFilters && <button className="sb-clear" onClick={clearAll}>Clear All</button>}
          <button className="sb-close" onClick={() => setDrawerOpen(false)}>✕</button>
        </div>
      </div>

      <div className="filter-sec">
        <button className={`filter-toggle ${secOpen.categories ? 'open' : ''}`} onClick={() => toggleSec('categories')}>
          CATEGORIES <span className="f-arrow">{secOpen.categories ? '▲' : '▼'}</span>
        </button>
        {secOpen.categories && (
          <div className="filter-body">
            <button className={`cat-link ${!category ? 'active' : ''}`} onClick={() => applyCategory(null)}>
              All Products
              <span className="cat-count">{categories.reduce((a: any, c: any) => a + (c.products_count || 0), 0) || '∞'}</span>
            </button>
            {categories.map((cat: any) => (
              <button key={cat.id} className={`cat-link ${category === cat.slug ? 'active' : ''}`} onClick={() => applyCategory(cat.slug)}>
                {cat.name}
                <span className="cat-count">{cat.products_count || 0}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <div className="filter-sec">
          <button className={`filter-toggle ${secOpen.tags ? 'open' : ''}`} onClick={() => toggleSec('tags')}>
            TAGS <span className="f-arrow">{secOpen.tags ? '▲' : '▼'}</span>
          </button>
          {secOpen.tags && (
            <div className="filter-body">
              {tags.map((t: any) => (
                <label key={t.id} className="chk-item">
                  <input type="checkbox" checked={tag === t.slug} style={{ display:'none' }}
                    onChange={(e) => applyTag(t.slug, e.target.checked)} />
                  <span className={`custom-chk ${tag === t.slug ? 'checked' : ''}`}>{tag === t.slug && '✓'}</span>
                  <span className="chk-label">{t.name}</span>
                  <span className="chk-cnt">{t.products_count || 0}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="filter-sec">
        <button className={`filter-toggle ${secOpen.price ? 'open' : ''}`} onClick={() => toggleSec('price')}>
          PRICE {priceActive && <span className="price-active-dot" />}
          <span className="f-arrow">{secOpen.price ? '▲' : '▼'}</span>
        </button>
        {secOpen.price && (
          <div className="filter-body">
            {(minInput || maxInput) && (
              <div className="price-preview">₹{minInput || '0'} — ₹{maxInput || '∞'}</div>
            )}
            <div className="price-row">
              <input type="number" className="price-inp" placeholder="Min ₹" value={minInput} min="0"
                onChange={e => setMinInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyPrice()} />
              <span className="price-sep">—</span>
              <input type="number" className="price-inp" placeholder="Max ₹" value={maxInput} min="0"
                onChange={e => setMaxInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyPrice()} />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="price-go" onClick={applyPrice} style={{ flex:2 }}>Apply</button>
              {priceActive && <button className="price-clear" onClick={clearPrice} style={{ flex:1 }}>Clear</button>}
            </div>
          </div>
        )}
      </div>

      <button className="apply-filter-btn" onClick={() => setDrawerOpen(false)}>✓ Done</button>
    </>
  );

  return (
    <div style={{ background:'#f5f7fa', minHeight:'100vh', fontFamily:"'Nunito', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .col-header { background:#1872B5; padding:20px 0; }
        .col-header-inner { max-width:1400px; margin:0 auto; padding:0 24px; display:flex; align-items:center; justify-content:space-between; }
        .col-title { font-family:'Sora',sans-serif; font-size:19px; font-weight:800; color:#fff; display:flex; align-items:center; gap:10px; }
        .col-bc { font-size:13px; color:rgba(255,255,255,.65); }
        .col-bc a { color:rgba(255,255,255,.65); text-decoration:none; }
        .col-bc a:hover { color:#fff; }
        .col-layout { max-width:1400px; margin:28px auto; padding:0 24px 60px; display:grid; grid-template-columns:250px 1fr; gap:24px; align-items:start; }
        .col-sidebar-desktop { background:#fff; border-radius:14px; border:1.5px solid #e5e7eb; box-shadow:0 2px 10px rgba(0,0,0,.06); overflow:hidden; position:sticky; top:20px; }
        .mob-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.48); z-index:998; opacity:0; transition:opacity .3s; }
        .mob-overlay.open { display:block; opacity:1; }
        .mob-drawer { display:none; position:fixed; top:0; left:-300px; width:285px; height:100%; background:#fff; z-index:999; overflow-y:auto; transition:left .32s cubic-bezier(.4,0,.2,1); }
        .mob-drawer.open { left:0; box-shadow:4px 0 28px rgba(0,0,0,.22); }
        .sb-head { background:#1872B5; padding:14px 18px; display:flex; align-items:center; justify-content:space-between; }
        .sb-head-title { font-family:'Sora',sans-serif; font-size:15px; font-weight:700; color:#fff; display:flex; align-items:center; gap:8px; }
        .sb-clear { font-size:11.5px; color:rgba(255,255,255,.8); background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.3); padding:3px 10px; border-radius:20px; cursor:pointer; font-family:'Nunito',sans-serif; transition:all .2s; }
        .sb-clear:hover { background:rgba(255,255,255,.28); color:#fff; }
        .sb-close { background:rgba(255,255,255,.15); border:none; color:#fff; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:15px; transition:background .2s; }
        .sb-close:hover { background:rgba(255,255,255,.28); }
        .filter-sec { border-bottom:1px solid #e5e7eb; }
        .filter-toggle { width:100%; padding:13px 18px; background:none; border:none; display:flex; align-items:center; justify-content:space-between; font-family:'Nunito',sans-serif; font-size:12px; font-weight:800; color:#1c1c1c; cursor:pointer; text-transform:uppercase; letter-spacing:.06em; transition:background .15s; }
        .filter-toggle:hover { background:#f5f7fa; }
        .f-arrow { font-size:9px; color:#1872B5; }
        .price-active-dot { width:7px; height:7px; border-radius:50%; background:#1872B5; display:inline-block; margin-left:6px; }
        .filter-body { padding:4px 18px 14px; }
        .cat-link { width:100%; display:flex; align-items:center; justify-content:space-between; padding:9px 0; font-size:13px; font-weight:600; color:#374151; background:none; border:none; border-bottom:1px solid #f3f4f6; cursor:pointer; text-align:left; font-family:'Nunito',sans-serif; transition:color .15s; }
        .cat-link:hover { color:#1872B5; }
        .cat-link.active { color:#1872B5; font-weight:800; }
        .cat-count { font-size:11px; font-weight:700; background:#dbeafe; color:#1d4ed8; padding:2px 8px; border-radius:10px; min-width:24px; text-align:center; }
        .cat-link.active .cat-count { background:#1872B5; color:#fff; }
        .chk-item { display:flex; align-items:center; gap:9px; padding:8px 0; cursor:pointer; font-size:13px; color:#374151; border-bottom:1px solid #f9fafb; transition:color .15s; font-family:'Nunito',sans-serif; }
        .chk-item:hover { color:#1872B5; }
        .custom-chk { width:17px; height:17px; border:2px solid #e5e7eb; border-radius:4px; background:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .15s; font-size:10px; font-weight:900; color:#fff; }
        .custom-chk.checked { background:#1872B5; border-color:#1872B5; }
        .chk-label { flex:1; font-weight:600; }
        .chk-cnt { font-size:11px; color:#9ca3af; }
        .price-preview { font-size:12px; font-weight:700; color:#1872B5; background:#eff6ff; padding:5px 10px; border-radius:7px; margin-bottom:10px; font-family:'Nunito',sans-serif; }
        .price-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
        .price-inp { flex:1; padding:6px 8px; height:36px; border:1.5px solid #e5e7eb; border-radius:7px; font-family:'Nunito',sans-serif; font-size:13px; color:#1c1c1c; outline:none; transition:border-color .2s; width:100%; }
        .price-inp:focus { border-color:#1872B5; }
        .price-sep { font-size:13px; color:#9ca3af; flex-shrink:0; }
        .price-go { padding:9px; background:#1872B5; color:#fff; border:none; border-radius:8px; font-family:'Nunito',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:background .2s; }
        .price-go:hover { background:#1560a0; }
        .price-clear { padding:9px; background:#f3f4f6; color:#374151; border:none; border-radius:8px; font-family:'Nunito',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:background .2s; }
        .price-clear:hover { background:#e5e7eb; }
        .apply-filter-btn { display:none; width:calc(100% - 36px); margin:12px 18px 16px; padding:11px; background:#1872B5; color:#fff; border:none; border-radius:9px; font-family:'Sora',sans-serif; font-size:14px; font-weight:700; cursor:pointer; transition:all .2s; box-shadow:0 4px 12px rgba(24,114,181,.25); text-align:center; }
        .apply-filter-btn:hover { background:#1560a0; transform:translateY(-1px); }
        .col-topbar { background:#fff; border-radius:14px; border:1.5px solid #e5e7eb; box-shadow:0 2px 10px rgba(0,0,0,.06); padding:12px 18px; display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:10px; }
        .col-result { font-size:14px; color:#6b7280; font-family:'Nunito',sans-serif; }
        .col-result strong { color:#111827; }
        .topbar-right { display:flex; align-items:center; gap:10px; }
        .mob-filter-btn { display:none; align-items:center; gap:8px; background:#1872B5; color:#fff; border:none; border-radius:9px; padding:9px 16px; font-family:'Sora',sans-serif; font-size:13px; font-weight:700; cursor:pointer; }
        .col-sort { padding:8px 32px 8px 14px; border:1.5px solid #e5e7eb; border-radius:9px; font-family:'Nunito',sans-serif; font-size:13px; font-weight:700; color:#111827; background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b7280'/%3E%3C/svg%3E") no-repeat right 10px center; appearance:none; outline:none; cursor:pointer; height:38px; transition:border-color .2s; }
        .col-sort:focus { border-color:#1872B5; }
        .active-filters { display:flex; flex-wrap:wrap; gap:7px; padding:0 0 14px; }
        .af-chip { display:inline-flex; align-items:center; gap:5px; background:#dbeafe; color:#1872B5; border:none; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:700; font-family:'Nunito',sans-serif; cursor:pointer; transition:background .15s; }
        .af-chip:hover { background:#bfdbfe; }
        .col-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .col-card { background:#fff; border-radius:14px; border:1.5px solid #e5e7eb; box-shadow:0 2px 10px rgba(0,0,0,.07); overflow:hidden; display:flex; flex-direction:column; text-decoration:none; color:inherit; position:relative; transition:all .22s ease; cursor:pointer; }
        .col-card:hover { border-color:#1872B5; box-shadow:0 8px 28px rgba(24,114,181,.18); transform:translateY(-3px); }
        .col-card-img { aspect-ratio:1; background:#f9fafb; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; }
        .col-card-img img { width:100%; height:100%; object-fit:cover; position:absolute; top:0; left:0; transition:opacity .35s ease, transform .35s ease; }
        .col-img-primary   { opacity:1; z-index:1; }
        .col-img-secondary { opacity:0; z-index:2; }
        .col-card:hover .col-img-primary   { opacity:0; }
        .col-card:hover .col-img-secondary { opacity:1; }
        .col-card:hover .col-card-img img  { transform:scale(1.07); }
        .col-no-img { font-size:40px; color:#d1d5db; position:relative; z-index:1; }
        .col-badge { position:absolute; top:10px; left:10px; z-index:10; display:inline-flex; align-items:center; gap:4px; background:#1872B5; color:#fff; font-size:11px; font-weight:800; padding:5px; border-radius:5px; font-family:'Nunito',sans-serif; pointer-events:none; }
        .col-badge::before { content:''; display:inline-block; width:6px; height:6px; background:rgba(255,255,255,.6); border-radius:50%; }
        .col-card-body { padding:12px 14px 14px; flex:1; display:flex; flex-direction:column; }
        .col-card-title { font-size:14px; font-weight:600; color:#0a214f; line-height:1.4; margin-bottom:1px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; transition:color .15s; font-family:'Nunito',sans-serif; }
        .col-card:hover .col-card-title { color:#1872B5; }
        .col-price-row { display:flex; align-items:center; gap:7px; flex-wrap:wrap; margin-top:auto; padding-top:6px; }
        .col-price { font-size:16px; font-weight:800; color:#1872B5; font-family:'Nunito',sans-serif; }
        .col-mrp   { font-size:12px; color:#9ca3af; text-decoration:line-through; font-family:'Nunito',sans-serif; }
        .col-stock-out { font-size:10.5px; font-weight:700; background:#fee2e2; color:#dc2626; padding:2px 8px; border-radius:5px; display:inline-flex; align-items:center; gap:4px; margin-bottom:6px; align-self:flex-start; font-family:'Nunito',sans-serif; }
        .col-empty { grid-column:1/-1; text-align:center; padding:60px 20px; background:#fff; border-radius:14px; border:1.5px solid #e5e7eb; }
        .col-empty-icon { font-size:56px; margin-bottom:16px; }
        .col-empty h3 { font-family:'Sora',sans-serif; font-size:20px; color:#6b7280; margin-bottom:8px; }
        .col-empty p  { font-size:14px; color:#9ca3af; font-family:'Nunito',sans-serif; }
        .col-loader { grid-column:1/-1; text-align:center; padding:60px; }
        .col-spinner { width:44px; height:44px; border-radius:50%; border:4px solid #dbeafe; border-top-color:#1872B5; animation:spin .8s linear infinite; display:inline-block; }
        .error-banner { background:#fee2e2; border:1px solid #fecaca; color:#dc2626; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-family:'Nunito',sans-serif; font-size:13px; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .wh-btn.active { background: #fff; }
        @media(max-width:1100px) { .col-grid { grid-template-columns:repeat(3,1fr); } }
        @media(max-width:900px) {
          .col-layout { grid-template-columns:1fr; }
          .col-sidebar-desktop { display:none !important; }
          .mob-filter-btn { display:flex !important; }
          .mob-drawer { display:block; }
          .col-grid { grid-template-columns:repeat(2,1fr); }
        }
        @media(max-width:480px) {
          .col-grid { gap:10px; }
          .col-layout { padding:0 14px 40px; }
          .col-topbar { padding:10px 14px; }
        }
      `}</style>

      {/* ⚠️ ERROR BANNER */}
      {apiError && (
        <div className="error-banner">
          ❌ <strong>API Error:</strong> {apiError}
        </div>
      )}

      <div className={`mob-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`mob-drawer ${drawerOpen ? 'open' : ''}`}>{sidebarJSX}</div>

      <div className="col-header">
        <div className="col-header-inner">
          <div className="col-title">
            {category ? categories.find((c: any) => c.slug === category)?.name || 'Shop'
              : tag    ? `#${tags.find((t: any) => t.slug === tag)?.name || tag}`
              : 'All Products'}
          </div>
          <div className="col-bc">
            <Link href="/">Home</Link> &nbsp;›&nbsp; <Link href="/collections">Shop</Link>
            {category && <> &nbsp;›&nbsp; {categories.find((c: any) => c.slug === category)?.name}</>}
            {tag      && <> &nbsp;›&nbsp; #{tags.find((t: any) => t.slug === tag)?.name || tag}</>}
          </div>
        </div>
      </div>

      <div className="col-layout">
        <aside className="col-sidebar-desktop">{sidebarJSX}</aside>

        <div>
          <div className="col-topbar">
            <span className="col-result">
              Showing <strong>{products.length}</strong>
              {allProducts.length !== products.length && <> of <strong>{allProducts.length}</strong></>} products
              {category && <> in <strong>{categories.find((c: any) => c.slug === category)?.name}</strong></>}
            </span>
            <div className="topbar-right">
              <button className="mob-filter-btn" onClick={() => setDrawerOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="4" y1="6"  x2="20" y2="6"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                  <line x1="11" y1="18" x2="13" y2="18"/>
                </svg>
                Filters
              </button>
              <select className="col-sort" value={sort} onChange={e => applySort(e.target.value)}>
                <option value="latest">Latest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="name_asc">Name: A–Z</option>
                <option value="featured">Featured First</option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className="active-filters">
              {category && (
                <button className="af-chip" onClick={() => router.push(buildUrl({ category: null }))}>
                  📁 {categories.find((c: any) => c.slug === category)?.name || category} ×
                </button>
              )}
              {tag && (
                <button className="af-chip" onClick={() => router.push(buildUrl({ tag: null }))}>
                  🏷️ #{tags.find((t: any) => t.slug === tag)?.name || tag} ×
                </button>
              )}
              {priceActive && (
                <button className="af-chip" onClick={clearPrice}>
                  💰 ₹{appliedMin || '0'} – ₹{appliedMax || '∞'} ×
                </button>
              )}
            </div>
          )}

          <div className="col-grid">
            {loading && <div className="col-loader"><div className="col-spinner" /></div>}

            {!loading && products.length === 0 && (
              <div className="col-empty">
                <div className="col-empty-icon">📦</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or check the console for API errors.</p>
              </div>
            )}

            {!loading && products.map((product: any) => {
              const disc    = getDiscount(product);
              const inStock = product.stock_quantity > 0;
              const price   = disc?.selling ?? getEffectivePrice(product);
              const compare = disc?.compare  ?? (product.sale_price ? product.price : null);
              const primaryImg   = imgUrl(product.featured_image);
              const galleryImgs  = product.images || [];
              const secondaryImg = galleryImgs.length > 0 ? galleryUrl(galleryImgs[0].image) : null;

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="col-card"
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="col-card-img">
                    {disc && <span className="col-badge">{disc.pct}%</span>}
                    <WishlistHeart productId={product.id} />
                    {primaryImg ? (
                      <>
                        <img src={primaryImg} alt={product.featured_image_alt || product.title} loading="lazy" draggable={false} className="col-img-primary" />
                        {secondaryImg && <img src={secondaryImg} alt={product.title} loading="lazy" draggable={false} className="col-img-secondary" />}
                      </>
                    ) : (
                      <span className="col-no-img">📦</span>
                    )}
                  </div>
                  <div className="col-card-body">
                    <div className="col-card-title">{product.title}</div>
                    {!inStock && (
                      <div className="col-stock-out">
                        <span style={{ width:5, height:5, borderRadius:'50%', background:'#dc2626', display:'inline-block' }} />
                        Out of Stock
                      </div>
                    )}
                    <div className="col-price-row">
                      {compare && <span className="col-mrp">₹{parseFloat(compare).toLocaleString('en-IN')}</span>}
                      {price   && <span className="col-price">₹{parseFloat(price).toLocaleString('en-IN')}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CollectionsPageInner />
    </Suspense>
  );
}
