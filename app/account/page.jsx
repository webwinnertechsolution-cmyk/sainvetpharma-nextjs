"use client";
import { useState, useEffect } from "react";
import { logoutGoogle, getStoredUser } from "@/lib/googleAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      fetchWishlist();
    } else {
      router.replace("/login"); // ← Logged out hai to login pe bhejo
    }
  }, []);

  const fetchWishlist = async () => {
    setWishlistLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/wishlist`);
      const data = await res.json();
      setWishlist(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    router.replace("/login"); // ← Logout ke baad login pe bhejo
  };

  const removeFromWishlist = async (productId) => {
    try {
      await fetch(`${API_URL}/api/wishlist/remove/${productId}`, {
        method: "POST",
      });
      setWishlist(wishlist.filter((p) => p.id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  function getImageUrl(product, index = 0) {
    if (product.images && product.images.length > index) {
      const img = product.images[index];
      const path = img.image_path || img.image || img.path || img.url || img.filename;
      if (path) {
        if (path.startsWith("http")) return path;
        return `${API_URL}/uploads/products/gallery/${path}`;
      }
    }
    if (index === 0 && product.featured_image) {
      return `${API_URL}/uploads/products/${product.featured_image}`;
    }
    return null;
  }

  // ── Loading state (redirect hone tak) ─────────────
  if (!user) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#f5f7fa"
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "4px solid #dbeafe", borderTopColor: "#1872B5",
          animation: "spin 0.8s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── ACCOUNT DASHBOARD ──────────────────────────────
  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh", fontFamily: "'Nunito', sans-serif" }}>
      <style>{`
        .acc-breadcrumb {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 10px 0;
        }
        .acc-breadcrumb-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6b7280;
        }
        .acc-breadcrumb-inner a { color: #6b7280; text-decoration: none; }
        .acc-breadcrumb-inner a:hover { color: #1872B5; }
        .acc-breadcrumb-sep { color: #d1d5db; }
        .acc-breadcrumb-current { color: #111827; font-weight: 600; }

        .acc-hero {
          background: linear-gradient(135deg, #1872B5 0%, #0f4c7f 100%);
          padding: 28px 0;
          color: white;
        }
        .acc-hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .acc-hero-left { display: flex; align-items: center; gap: 16px; }
        .acc-avatar {
          width: 60px; height: 60px;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.4);
          object-fit: cover;
        }
        .acc-avatar-placeholder {
          width: 60px; height: 60px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
          border: 3px solid rgba(255,255,255,0.4);
        }
        .acc-hero-name {
          font-family: 'Sora', sans-serif;
          font-size: 20px; font-weight: 800; margin: 0 0 2px;
        }
        .acc-hero-email { font-size: 13px; opacity: 0.8; margin: 0 0 4px; }
        .acc-google-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.3);
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700;
        }
        .acc-logout-btn {
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.35);
          color: white; padding: 9px 20px; border-radius: 10px;
          cursor: pointer; font-size: 13px; font-weight: 700;
          font-family: inherit; transition: all 0.2s;
          display: flex; align-items: center; gap: 6px;
        }
        .acc-logout-btn:hover { background: rgba(255,255,255,0.25); }

        .acc-container { max-width: 1200px; margin: 28px auto; padding: 0 20px; }

        .acc-tabs { display: flex; gap: 8px; margin-bottom: 22px; flex-wrap: wrap; }
        .acc-tab {
          padding: 10px 22px; border-radius: 10px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          border: 1.5px solid #e5e7eb; background: white;
          color: #6b7280; font-family: inherit; transition: all 0.2s;
          display: flex; align-items: center; gap: 7px;
        }
        .acc-tab:hover { border-color: #1872B5; color: #1872B5; }
        .acc-tab.active { background: #1872B5; color: white; border-color: #1872B5; }
        .acc-tab-count {
          background: rgba(255,255,255,0.25);
          padding: 1px 7px; border-radius: 10px; font-size: 11px;
        }
        .acc-tab:not(.active) .acc-tab-count { background: #f3f4f6; color: #374151; }

        .acc-profile-card {
          background: white; border-radius: 16px;
          border: 1.5px solid #e5e7eb; overflow: hidden;
        }
        .acc-profile-header {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          padding: 24px; display: flex; align-items: center;
          gap: 16px; border-bottom: 1px solid #e5e7eb;
        }
        .acc-profile-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          object-fit: cover; border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .acc-profile-avatar-ph {
          width: 72px; height: 72px; border-radius: 50%;
          background: #1872B5; display: flex;
          align-items: center; justify-content: center;
          font-size: 30px; border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .acc-profile-name {
          font-family: 'Sora', sans-serif;
          font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 3px;
        }
        .acc-profile-email { font-size: 13px; color: #6b7280; margin: 0 0 8px; }
        .acc-verified-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: #dcfce7; color: #16a34a;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700;
        }
        .acc-info-list { padding: 0; margin: 0; list-style: none; }
        .acc-info-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 24px; border-bottom: 1px solid #f3f4f6; font-size: 14px;
        }
        .acc-info-item:last-child { border-bottom: none; }
        .acc-info-label { color: #6b7280; display: flex; align-items: center; gap: 8px; }
        .acc-info-value { font-weight: 700; color: #111827; }

        .acc-orders-coming {
          background: white; border-radius: 16px;
          border: 1.5px solid #e5e7eb; padding: 70px 20px; text-align: center;
        }
        .acc-orders-icon { font-size: 70px; margin-bottom: 20px; }
        .acc-orders-title {
          font-family: 'Sora', sans-serif;
          font-size: 24px; font-weight: 800; color: #111827; margin-bottom: 10px;
        }
        .acc-orders-text { font-size: 14px; color: #6b7280; margin-bottom: 28px; line-height: 1.7; }
        .acc-orders-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: #eff6ff; border: 1.5px solid #bfdbfe;
          color: #1872B5; padding: 12px 24px;
          border-radius: 12px; font-size: 14px; font-weight: 700;
          margin-bottom: 30px;
        }
        .acc-orders-steps {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px; max-width: 600px; margin: 0 auto;
        }
        .acc-orders-step {
          background: #f9fafb; border-radius: 12px;
          padding: 20px 12px; text-align: center;
        }
        .acc-orders-step-icon { font-size: 28px; margin-bottom: 8px; }
        .acc-orders-step-title { font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 4px; }
        .acc-orders-step-text { font-size: 11px; color: #6b7280; line-height: 1.5; }

        .acc-wl-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }
        .acc-wl-card {
          background: white; border: 1.5px solid #e5e7eb;
          border-radius: 12px; overflow: hidden;
          transition: all 0.25s; display: flex; flex-direction: column;
        }
        .acc-wl-card:hover {
          border-color: #1872B5;
          box-shadow: 0 6px 20px rgba(24,114,181,0.13);
          transform: translateY(-3px);
        }
        .acc-wl-img-wrap {
          aspect-ratio: 1/1; background: #f9fafb;
          position: relative; overflow: hidden;
        }
        .acc-wl-img-p, .acc-wl-img-s {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; transition: opacity 0.38s;
        }
        .acc-wl-img-s { opacity: 0; }
        .acc-wl-card:hover .acc-wl-img-p { opacity: 0; }
        .acc-wl-card:hover .acc-wl-img-s { opacity: 1; }
        .acc-wl-discount {
          position: absolute; top: 8px; left: 8px;
          background: #ef4444; color: white;
          font-size: 10px; font-weight: 800;
          padding: 3px 7px; border-radius: 4px; z-index: 5;
        }
        .acc-wl-remove {
          position: absolute; top: 8px; right: 8px;
          width: 28px; height: 28px;
          background: white; color: #dc2626;
          border: 1.5px solid #fca5a5; border-radius: 50%;
          cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          font-size: 12px; transition: all 0.2s; z-index: 10; opacity: 0;
        }
        .acc-wl-card:hover .acc-wl-remove { opacity: 1; }
        .acc-wl-remove:hover { background: #dc2626; color: white; border-color: #dc2626; }
        .acc-wl-body {
          padding: 10px 12px 12px; flex: 1;
          display: flex; flex-direction: column; gap: 5px;
        }
        .acc-wl-title {
          font-size: 12.5px; font-weight: 700; color: #111827;
          line-height: 1.4; display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; text-decoration: none;
        }
        .acc-wl-title:hover { color: #1872B5; }
        .acc-wl-price-row { display: flex; align-items: center; gap: 6px; }
        .acc-wl-price { font-size: 14px; font-weight: 800; color: #1872B5; }
        .acc-wl-mrp { font-size: 11px; color: #9ca3af; text-decoration: line-through; }
        .acc-wl-btn {
          display: block; text-align: center; padding: 8px;
          background: #1872B5; color: white; border-radius: 8px;
          font-size: 12px; font-weight: 700; text-decoration: none;
          margin-top: auto; transition: background 0.2s;
        }
        .acc-wl-btn:hover { background: #1560a0; }
        .acc-wl-img-ph {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 40px; color: #d1d5db;
        }
        .acc-empty {
          text-align: center; padding: 60px 20px;
          background: white; border-radius: 16px; border: 1.5px solid #e5e7eb;
        }
        .acc-empty-icon { font-size: 56px; margin-bottom: 12px; }
        .acc-empty-title {
          font-family: 'Sora', sans-serif; font-size: 20px;
          font-weight: 800; color: #111827; margin-bottom: 8px;
        }
        .acc-empty-text { font-size: 14px; color: #6b7280; margin-bottom: 20px; }
        .acc-empty-btn {
          display: inline-block; padding: 11px 28px;
          background: #1872B5; color: white; border-radius: 10px;
          text-decoration: none; font-weight: 700; font-size: 14px;
        }
        .acc-empty-btn:hover { background: #1560a0; }
        .acc-loader { text-align: center; padding: 50px; }
        .acc-spinner {
          width: 40px; height: 40px; border-radius: 50%;
          border: 4px solid #dbeafe; border-top-color: #1872B5;
          animation: acc-spin 0.8s linear infinite; margin: 0 auto;
        }
        @keyframes acc-spin { to { transform: rotate(360deg); } }

        @media(max-width: 1100px) { .acc-wl-grid { grid-template-columns: repeat(4,1fr); } }
        @media(max-width: 800px) {
          .acc-wl-grid { grid-template-columns: repeat(3,1fr); }
          .acc-hero-name { font-size: 16px; }
          .acc-orders-steps { grid-template-columns: 1fr; max-width: 280px; }
        }
        @media(max-width: 540px) {
          .acc-wl-grid { grid-template-columns: repeat(2,1fr); }
          .acc-wl-remove { opacity: 1; }
          .acc-tab { padding: 8px 14px; font-size: 13px; }
        }
      `}</style>

      {/* BREADCRUMB */}
      <div className="acc-breadcrumb">
        <div className="acc-breadcrumb-inner">
          <Link href="/">Home</Link>
          <span className="acc-breadcrumb-sep">›</span>
          <span className="acc-breadcrumb-current">My Account</span>
        </div>
      </div>

      {/* HERO */}
      <div className="acc-hero">
        <div className="acc-hero-inner">
          <div className="acc-hero-left">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="acc-avatar" />
            ) : (
              <div className="acc-avatar-placeholder">👤</div>
            )}
            <div>
              <h1 className="acc-hero-name">Hi, {user.name?.split(" ")[0]}! 👋</h1>
              <p className="acc-hero-email">{user.email}</p>
              <span className="acc-google-badge">
                <img src="https://www.google.com/favicon.ico" width={12} height={12} alt="G" />
                Google Account
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="acc-logout-btn">
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="acc-container">

        {/* TABS */}
        <div className="acc-tabs">
          <button
            className={`acc-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            👤 Profile
          </button>
          <button
            className={`acc-tab ${activeTab === "wishlist" ? "active" : ""}`}
            onClick={() => setActiveTab("wishlist")}
          >
            ❤️ Wishlist
            <span className="acc-tab-count">{wishlist.length}</span>
          </button>
          <button
            className={`acc-tab ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            📦 My Orders
          </button>
        </div>

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="acc-profile-card">
            <div className="acc-profile-header">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="acc-profile-avatar" />
              ) : (
                <div className="acc-profile-avatar-ph">👤</div>
              )}
              <div>
                <h2 className="acc-profile-name">{user.name}</h2>
                <p className="acc-profile-email">{user.email}</p>
                <span className="acc-verified-badge">✓ Verified Account</span>
              </div>
            </div>
            <ul className="acc-info-list">
              <li className="acc-info-item">
                <span className="acc-info-label">👤 Full Name</span>
                <span className="acc-info-value">{user.name}</span>
              </li>
              <li className="acc-info-item">
                <span className="acc-info-label">📧 Email</span>
                <span className="acc-info-value">{user.email}</span>
              </li>
              <li className="acc-info-item">
                <span className="acc-info-label">🔑 Login Method</span>
                <span className="acc-info-value">{user.provider}</span>
              </li>
              <li className="acc-info-item">
                <span className="acc-info-label">📅 Member Since</span>
                <span className="acc-info-value">
                  {new Date(user.created_at).toLocaleDateString("en-IN", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </span>
              </li>
              <li className="acc-info-item">
                <span className="acc-info-label">❤️ Wishlist Items</span>
                <span className="acc-info-value">{wishlist.length} Products</span>
              </li>
            </ul>
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === "wishlist" && (
          <>
            {wishlistLoading ? (
              <div className="acc-loader"><div className="acc-spinner" /></div>
            ) : wishlist.length === 0 ? (
              <div className="acc-empty">
                <div className="acc-empty-icon">💔</div>
                <h2 className="acc-empty-title">Wishlist is empty</h2>
                <p className="acc-empty-text">Start saving your favourite products!</p>
                <Link href="/collections" className="acc-empty-btn">Browse Products</Link>
              </div>
            ) : (
              <div className="acc-wl-grid">
                {wishlist.map((product) => {
                  const price = product.sale_price && parseFloat(product.sale_price) > 0
                    ? parseFloat(product.sale_price)
                    : parseFloat(product.price || 0);
                  const compare = product.sale_price && parseFloat(product.sale_price) > 0
                    ? parseFloat(product.price) : null;
                  const discount = compare && compare > price
                    ? Math.round(((compare - price) / compare) * 100) : null;
                  const img1 = getImageUrl(product, 0);
                  const img2 = getImageUrl(product, 1);
                  const hasSecond = img2 && img2 !== img1;

                  return (
                    <div key={product.id} className="acc-wl-card">
                      <div className="acc-wl-img-wrap">
                        {img1 ? (
                          <>
                            <img src={img1} alt={product.title} className="acc-wl-img-p" loading="lazy" />
                            <img src={hasSecond ? img2 : img1} alt={product.title} className="acc-wl-img-s" loading="lazy" />
                          </>
                        ) : (
                          <div className="acc-wl-img-ph">📦</div>
                        )}
                        {discount > 0 && <div className="acc-wl-discount">{discount}% OFF</div>}
                        <button
                          className="acc-wl-remove"
                          onClick={(e) => { e.preventDefault(); removeFromWishlist(product.id); }}
                        >✕</button>
                      </div>
                      <div className="acc-wl-body">
                        <Link href={`/product/${product.slug}`} className="acc-wl-title">
                          {product.title}
                        </Link>
                        <div className="acc-wl-price-row">
                          <span className="acc-wl-price">
                            {price > 0 ? `₹${price.toLocaleString("en-IN")}` : "Price on request"}
                          </span>
                          {compare && <span className="acc-wl-mrp">₹{compare.toLocaleString("en-IN")}</span>}
                        </div>
                        <Link href={`/product/${product.slug}`} className="acc-wl-btn">
                          View Product
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="acc-orders-coming">
            <div className="acc-orders-icon">📦</div>
            <h2 className="acc-orders-title">Orders Coming Soon!</h2>
            <p className="acc-orders-text">
              We are working hard to bring you a<br />
              complete order tracking experience.
            </p>
            <div className="acc-orders-badge">
              🚀 Feature Under Development
            </div>
            <div className="acc-orders-steps">
              <div className="acc-orders-step">
                <div className="acc-orders-step-icon">🛒</div>
                <div className="acc-orders-step-title">Place Order</div>
                <div className="acc-orders-step-text">Add products to cart & checkout</div>
              </div>
              <div className="acc-orders-step">
                <div className="acc-orders-step-icon">📍</div>
                <div className="acc-orders-step-title">Track Status</div>
                <div className="acc-orders-step-text">Real-time order tracking</div>
              </div>
              <div className="acc-orders-step">
                <div className="acc-orders-step-icon">🎉</div>
                <div className="acc-orders-step-title">Get Delivered</div>
                <div className="acc-orders-step-text">Fast & secure delivery</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}