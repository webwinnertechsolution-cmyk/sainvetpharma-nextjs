'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/googleAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function WishlistPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProductId, setHoveredProductId] = useState(null); // ✅ ProductSection wala hover state

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    loadWishlist();
  }, []);

  function getHeaders() {
    const user = getStoredUser();
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(user?.firebase_uid ? { 'X-Firebase-UID': user.firebase_uid } : {}),
    };
  }

  async function loadWishlist() {
    try {
      const res = await fetch(`${API_URL}/api/wishlist`, { headers: getHeaders() });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Wishlist load error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromWishlist(productId) {
    if (!confirm('Remove from wishlist?')) return;
    try {
      const res = await fetch(`${API_URL}/api/wishlist/remove/${productId}`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        loadWishlist();
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
    } catch (err) {
      console.error('Remove error:', err);
    }
  }

  // ✅ ProductSection jaisi getImageUrl — featured_image primary, gallery secondary
  function getImageUrl(imageName, isGallery = false) {
    if (!imageName) return null;
    if (isGallery) return `${API_URL}/uploads/products/gallery/${imageName}`;
    return `${API_URL}/uploads/products/${imageName}`;
  }

  // ✅ ProductSection ka exact getDiscountInfo
  const getDiscountInfo = (product) => {
    let comparePrice = null;
    let sellingPrice = null;

    if (product.compare_price && parseFloat(product.compare_price) > 0)
      comparePrice = parseFloat(product.compare_price);
    if (product.price && parseFloat(product.price) > 0)
      sellingPrice = parseFloat(product.price);
    if (product.sale_price && parseFloat(product.sale_price) > 0) {
      sellingPrice = parseFloat(product.sale_price);
      if (!comparePrice && product.price) comparePrice = parseFloat(product.price);
    }

    if (product.variants && product.variants.length > 0) {
      const v = product.variants[0];
      if (!sellingPrice && v.price) sellingPrice = parseFloat(v.price);
      if (!comparePrice && v.compare_price) comparePrice = parseFloat(v.compare_price);
    }

    if (!comparePrice || !sellingPrice || comparePrice <= sellingPrice) return null;
    const pct = Math.round(((comparePrice - sellingPrice) / comparePrice) * 100);
    return pct >= 1 ? { pct, comparePrice, sellingPrice } : null;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#f5f7fa'
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '4px solid #dbeafe', borderTopColor: '#1872B5',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: "'Nunito', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Nunito:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Breadcrumb ── */
        .wl-breadcrumb { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 10px 0; }
        .wl-breadcrumb-inner {
          max-width: 1300px; margin: 0 auto; padding: 0 20px;
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #6b7280;
        }
        .wl-breadcrumb-inner a { color: #6b7280; text-decoration: none; transition: color 0.2s; }
        .wl-breadcrumb-inner a:hover { color: #1872B5; }
        .wl-breadcrumb-sep { color: #d1d5db; font-size: 12px; }
        .wl-breadcrumb-current { color: #111827; font-weight: 600; }

        /* ── Hero ── */
        .wl-hero {
          background: linear-gradient(135deg, #1872B5 0%, #0f4c7f 100%);
          padding: 30px 0 26px; color: white;
        }
        .wl-hero-inner {
          max-width: 1300px; margin: 0 auto; padding: 0 20px;
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .wl-hero h1 { font-family: 'Sora', sans-serif; font-size: 26px; font-weight: 800; margin: 0; }
        .wl-hero p { font-size: 13.5px; opacity: 0.8; margin: 4px 0 0; }
        .wl-count-badge {
          background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3);
          color: white; padding: 6px 16px; border-radius: 20px;
          font-size: 13px; font-weight: 700; white-space: nowrap;
        }

        /* ── Container & Grid ── */
        .wl-container { max-width: 1300px; margin: 28px auto; padding: 0 20px; }
        .wl-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
          padding-top: 10px;
          padding-bottom: 11px;
        }

        /* ── Card — exact ProductSection styles ── */
        .ps-card {
          background: #fff;
          border-radius: 14px;
          border: 1.5px solid #e5e7eb;
          overflow: hidden;
          transition: all .22s ease;
          position: relative;
          box-shadow: 0 2px 10px rgba(0,0,0,.07);
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }
        .ps-card:hover {
          border-color: #1872B5;
          box-shadow: 0 8px 28px rgba(24,114,181,.18);
          transform: translateY(-2px);
        }

        /* ── Discount Badge — exact ProductSection style ── */
        .ps-disc-badge {
          position: absolute; top: 10px; left: 10px; z-index: 10;
          display: inline-flex; align-items: center; gap: 4px;
          padding: 5px 10px; border-radius: 20px;
          font-size: 12px; font-weight: 800;
          font-family: 'Nunito', sans-serif;
          letter-spacing: .3px; white-space: nowrap;
          pointer-events: none; box-shadow: 0 3px 10px rgba(0,0,0,.18);
          line-height: 1;
        }
        .ps-disc-badge.sale {
          background: linear-gradient(135deg, #1872b5 0%, #1872b5 100%);
          color: #fff; box-shadow: none;
          font-size: 11px; padding: 5px; border-radius: 5px;
        }
        .ps-disc-badge.sale::before {
          content: ''; display: inline-block;
          width: 6px; height: 6px;
          background: rgba(255,255,255,.6);
          border-radius: 50%;
        }
        .ps-disc-badge.featured {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #fff; box-shadow: 0 3px 10px rgba(59,130,246,.45);
        }

        /* ── Remove button ── */
        .wl-remove {
          position: absolute; top: 8px; right: 8px;
          width: 28px; height: 28px; background: white;
          color: #dc2626; border: 1.5px solid #fca5a5;
          border-radius: 50%; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; transition: all 0.2s; z-index: 10; opacity: 0;
        }
        .ps-card:hover .wl-remove { opacity: 1; }
        .wl-remove:hover {
          background: #dc2626; color: white;
          border-color: #dc2626; transform: scale(1.1);
        }

        /* ── Image — exact ProductSection style ── */
        .ps-img {
          aspect-ratio: 1; background: #f9fafb;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; position: relative;
        }
        .ps-img img {
          max-width: 100%; max-height: 100%; object-fit: cover;
          transition: transform .35s ease, opacity .3s ease;
          user-select: none; -webkit-user-drag: none;
          width: 100%; height: 100%;
        }
        .ps-card:hover .ps-img img { transform: scale(1.07); }

        /* ── Body — exact ProductSection style ── */
        .ps-body { padding: 12px 14px 14px; flex: 1; display: flex; flex-direction: column; }
        .ps-title {
          font-size: 14px; font-weight: 600; color: #0a214f;
          line-height: 1.4; margin-bottom: 3px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          font-family: 'Nunito';
        }
        .ps-card:hover .ps-title { color: #1872B5; }

        .ps-stock-out {
          font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 5px;
          display: inline-flex; align-items: center; gap: 4px; margin-bottom: 6px;
          background: #fee2e2; color: #dc2626; align-self: flex-start;
        }

        .ps-price-row {
          display: flex; align-items: center; gap: 8px;
          margin-top: auto; padding-top: 8px; flex-wrap: wrap;
        }
        .ps-price { font-size: 16px; font-weight: 800; color: #1872B5; font-family: 'Nunito', sans-serif; }
        .ps-compare-price { font-size: 12px; color: #9ca3af; text-decoration: line-through; font-family: 'Nunito', sans-serif; }

        /* ── Empty state ── */
        .wl-empty {
          text-align: center; padding: 80px 20px; background: white;
          border-radius: 14px; border: 1.5px solid #e5e7eb;
        }
        .wl-empty-icon { font-size: 60px; margin-bottom: 14px; }
        .wl-empty-title {
          font-family: 'Sora', sans-serif; font-size: 22px;
          font-weight: 800; color: #111827; margin-bottom: 8px;
        }
        .wl-empty-text { font-size: 14px; color: #6b7280; margin-bottom: 22px; }
        .wl-empty-btn {
          display: inline-block; padding: 11px 30px;
          background: #1872B5; color: white;
          border-radius: 8px; text-decoration: none; font-weight: 700;
        }
        .wl-empty-btn:hover { background: #1560a0; }

        /* ── Responsive ── */
        @media(max-width: 1100px) { .wl-grid { grid-template-columns: repeat(4, 1fr); } }
        @media(max-width: 800px) {
          .wl-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .wl-hero h1 { font-size: 20px; }
          .ps-title { font-size: 12px; }
          .ps-price { font-size: 14px; }
        }
        @media(max-width: 540px) {
          .wl-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .wl-container { margin: 18px auto; }
          .wl-remove { opacity: 1; }
          .ps-disc-badge { font-size: 11px; padding: 4px 8px; top: 8px; left: 8px; }
        }
      `}</style>

      {/* BREADCRUMB */}
      <div className="wl-breadcrumb">
        <div className="wl-breadcrumb-inner">
          <Link href="/">Home</Link>
          <span className="wl-breadcrumb-sep">›</span>
          <Link href="/account">My Account</Link>
          <span className="wl-breadcrumb-sep">›</span>
          <span className="wl-breadcrumb-current">Wishlist</span>
        </div>
      </div>

      {/* HERO */}
      <div className="wl-hero">
        <div className="wl-hero-inner">
          <div>
            <h1>❤️ My Wishlist</h1>
            <p>Your favourite products in one place</p>
          </div>
          {products.length > 0 && (
            <div className="wl-count-badge">
              {products.length} {products.length === 1 ? 'Item' : 'Items'} saved
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="wl-container">
        {products.length === 0 ? (
          <div className="wl-empty">
            <div className="wl-empty-icon">💔</div>
            <h2 className="wl-empty-title">Your wishlist is empty</h2>
            <p className="wl-empty-text">Start adding your favourite products!</p>
            <Link href="/collections" className="wl-empty-btn">Continue Shopping</Link>
          </div>
        ) : (
          <div className="wl-grid">
            {products.map((product) => {
              const inStock   = product.stock_quantity > 0;
              const discInfo  = getDiscountInfo(product);
              const isHovering = hoveredProductId === product.id;

              // ✅ ProductSection jaisi logic — featured_image primary, gallery[0] secondary
              const primaryImg = getImageUrl(product.featured_image);
              const galleryImages = (product.images || []).map(img =>
                getImageUrl(img.image, true)
              ).filter(Boolean);

              const displayImg = isHovering && galleryImages.length > 0
                ? galleryImages[0]
                : primaryImg;

              const showCompare = discInfo?.comparePrice;
              const showPrice   = discInfo?.sellingPrice || product.price;

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="ps-card"
                  onMouseEnter={() => setHoveredProductId(product.id)}
                  onMouseLeave={() => setHoveredProductId(null)}
                >
                  {/* IMAGE */}
                  <div className="ps-img">
                    {/* ✅ Blue badge — same as ProductSection */}
                    {discInfo ? (
                      <span className="ps-disc-badge sale">
                        {discInfo.pct}%
                      </span>
                    ) : product.is_featured ? (
                      <span className="ps-disc-badge featured">
                        ⭐ Featured
                      </span>
                    ) : null}

                    {/* ✅ Remove button — top right */}
                    <button
                      className="wl-remove"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromWishlist(product.id); }}
                      title="Remove from wishlist"
                    >✕</button>

                    {displayImg ? (
                      <img
                        src={displayImg}
                        alt={product.featured_image_alt || product.title}
                        loading="lazy"
                        draggable={false}
                      />
                    ) : (
                      <div style={{ fontSize: 48, color: '#d1d5db' }}>📦</div>
                    )}
                  </div>

                  {/* BODY */}
                  <div className="ps-body">
                    <div className="ps-title">{product.title}</div>

                    {!inStock && (
                      <div className="ps-stock-out">
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
                        Out of Stock
                      </div>
                    )}

                    <div className="ps-price-row">
                      {showCompare && (
                        <span className="ps-compare-price">
                          ₹{parseFloat(showCompare).toLocaleString('en-IN')}
                        </span>
                      )}
                      {showPrice && (
                        <span className="ps-price">
                          ₹{parseFloat(showPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}