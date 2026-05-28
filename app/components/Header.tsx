'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getStoredUser } from '@/lib/googleAuth';
import { useCart } from '@/app/components/CartContext';  // ← ADD

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function EnhancedHeader({ logo, menus }) {
  const [mobileOpen, setMobileOpen]                 = useState(false);
  const [searchQuery, setSearchQuery]               = useState('');
  const [searchResults, setSearchResults]           = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [wishlistCount, setWishlistCount]           = useState(0);
  const [user, setUser]                             = useState(null);
  const searchRef = useRef(null);

  // ← Cart context se liya — localStorage nahi
  const { totalItems, setDrawerOpen } = useCart();

  const logoUrl = logo?.image ? `${API_URL}/uploads/logo/${logo.image}` : null;

  /* ── Search ── */
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      fetch(`${API_URL}/api/products`)
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(filtered.slice(0, 5));
          setShowSearchDropdown(true);
        })
        .catch(err => console.error('Search error:', err));
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery]);

  /* ── Wishlist count ── */
  const fetchWishlistCount = () => {
    const currentUser = getStoredUser();
    if (!currentUser?.firebase_uid) { setWishlistCount(0); return; }
    fetch(`${API_URL}/api/wishlist`, {
      headers: { 'Accept': 'application/json', 'X-Firebase-UID': currentUser.firebase_uid },
    })
      .then(res => res.json())
      .then(data => setWishlistCount(data.count || data.products?.length || 0))
      .catch(() => setWishlistCount(0));
  };

  /* ── Init ── */
  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    fetchWishlistCount();
    window.addEventListener('wishlistUpdated', fetchWishlistCount);
    return () => window.removeEventListener('wishlistUpdated', fetchWishlistCount);
  }, []);

  /* ── Outside click — close search ── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSearchDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSelect = (product) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    window.location.href = `/product/${product.slug}`;
  };

  const productImageUrl = (product) =>
    product.featured_image ? `${API_URL}/uploads/products/${product.featured_image}` : '/placeholder-product.png';

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .header-wrap {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-bottom: 2px solid #e9ecef;
          position: sticky; top: 0; z-index: 1000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .header-inner {
          max-width: 1400px; margin: 0 auto; padding: 0 24px;
          display: flex; align-items: center; height: 80px; gap: 15px;
        }

        .logo { flex-shrink: 0; }
        .logo a { display: flex; align-items: center; text-decoration: none; }
        .logo img { height: 87px; width: auto; object-fit: contain; }
        .logo span { font-size: 24px; font-weight: 700; color: #0a214f; font-family: 'Sora', sans-serif; }

        nav.desktop-nav { width: 59%; }
        .nav-menu { display: flex; list-style: none; justify-content: end; gap: 12px; flex: 1; }
        .nav-item { position: relative; }
        .nav-item > a {
          color: #0a214f; text-decoration: none; font-size: 14px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.5px; padding: 8px;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.3s ease; font-family: 'Sora', sans-serif; position: relative;
        }
        .nav-item > a:hover { color: #30674d; background: rgba(48,103,77,0.08); border-radius: 6px; }
        .nav-item > a::after {
          content: ''; position: absolute; bottom: 0; left: 0;
          width: 0; height: 2px; background: #30674d; transition: width 0.3s ease;
        }
        .nav-item > a:hover::after { width: 100%; }

        .sub-menu {
          display: none; position: absolute; top: 100%; left: 0;
          background: #fff; min-width: 220px; list-style: none; padding: 12px 0;
          margin-top: 8px; border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12); z-index: 999;
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-item:hover .sub-menu { display: block; }
        .sub-menu li a {
          color: #0a214f !important; padding: 12px 20px; font-size: 13px;
          display: block; transition: all 0.2s ease; font-family: 'Sora', sans-serif;
        }
        .sub-menu li a:hover { background: #f0f0f0; color: #30674d !important; padding-left: 24px; }

        .search-container { flex: 1; max-width: 288px; position: relative; }
        .search-input {
          width: 100%; padding: 10px 44px 10px 16px;
          border: 1px solid #dfe0e1; border-radius: 50px; font-size: 14px;
          font-family: 'Sora', sans-serif; transition: all 0.3s ease;
          background: #fff; color: #0a214f;
        }
        .search-input::placeholder { color: #adb5bd; }
        .search-input:focus { outline: none; border-color: #1872B5; box-shadow: 0 0 0 3px rgba(24,114,181,0.1); }
        .search-icon {
          position: absolute; right: 0; top: 50%; transform: translateY(-50%);
          width: 48px; height: 40px; display: flex; align-items: center; justify-content: center;
          pointer-events: none; background: #1872B5; color: white; border-radius: 0 50px 50px 0;
        }
        .search-icon svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }

        .search-dropdown {
          position: absolute; top: calc(100% + 4px); left: 0; right: 0;
          background: #fff; border: 2px solid #e9ecef; border-radius: 12px;
          max-height: 400px; overflow-y: auto; z-index: 998;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
        }
        .search-result-item {
          padding: 12px 16px; display: flex; gap: 12px; align-items: center;
          border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: background 0.2s;
        }
        .search-result-item:hover { background: #f8f9fa; }
        .search-result-image { width: 50px; height: 50px; border-radius: 6px; object-fit: cover; background: #f0f0f0; flex-shrink: 0; }
        .search-result-content { flex: 1; min-width: 0; }
        .search-result-title { font-size: 13px; font-weight: 600; color: #0a214f; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: 'Sora', sans-serif; }
        .search-result-price { font-size: 12px; color: #1872B5; font-weight: 700; }
        .search-no-results { padding: 20px; text-align: center; color: #666; font-size: 13px; font-family: 'Sora', sans-serif; }
        .search-view-all {
          padding: 12px 16px; text-align: center; background: #f8f9fa;
          border-top: 1px solid #e9ecef; color: #1872B5; font-size: 13px;
          font-weight: 600; cursor: pointer; transition: all 0.2s;
          border-radius: 0 0 10px 10px; font-family: 'Sora', sans-serif;
        }
        .search-view-all:hover { background: #1872B5; color: #fff; }

        .icons-container { display: flex; align-items: center; gap: 9px; flex-shrink: 0; }
        .icon-button {
          position: relative; width: 40px; height: 40px; border: none;
          background: #1872B5; cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          transition: all 0.3s ease; border-radius: 50px; color: #fff;
        }
        .icon-button:hover { background: #1560a0; transform: translateY(-1px); }
        .icon-button svg { width: 22px; height: 22px; stroke: currentColor; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }

        .badge {
          position: absolute; top: -5px; right: -5px;
          background: #ff6b35; color: #fff; border-radius: 50%;
          width: 20px; height: 20px; display: flex; align-items: center;
          justify-content: center; font-size: 10px; font-weight: 800;
          border: 2px solid #fff; box-shadow: 0 2px 6px rgba(255,107,53,0.4);
          font-family: 'Sora', sans-serif; animation: badgePop .3s ease;
        }
        @keyframes badgePop {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .badge-green {
          position: absolute; top: -4px; right: -4px;
          background: #22c55e; color: #fff; border-radius: 50%;
          width: 14px; height: 14px; display: flex;
          align-items: center; justify-content: center;
          font-size: 8px; font-weight: 700; border: 1.5px solid #fff;
        }

        /* Cart button special */
        .cart-icon-btn {
          position: relative; width: 40px; height: 40px; border: none;
          background: #1872B5; cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          transition: all 0.3s ease; border-radius: 50px; color: #fff;
        }
        .cart-icon-btn:hover { background: #1560a0; transform: translateY(-1px); }
        .cart-icon-btn svg { width: 22px; height: 22px; stroke: currentColor; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }

        .mobile-toggle {
          display: none; width: 44px; height: 44px; border: none;
          background: transparent; cursor: pointer; flex-direction: column;
          justify-content: center; gap: 5px; padding: 8px; flex-shrink: 0;
        }
        .mobile-toggle span { display: block; width: 22px; height: 2px; background: #0a214f; transition: all 0.3s; border-radius: 2px; }
        .mobile-toggle.active span:nth-child(1) { transform: rotate(45deg) translate(5px,5px); }
        .mobile-toggle.active span:nth-child(2) { opacity: 0; transform: translateX(-8px); }
        .mobile-toggle.active span:nth-child(3) { transform: rotate(-45deg) translate(5px,-5px); }

        .mobile-nav {
          background: #fff; border-top: 2px solid #e9ecef; padding: 16px 24px 24px;
          position: absolute; top: 80px; left: 0; right: 0;
          max-height: calc(100vh - 80px); overflow-y: auto; z-index: 999;
          box-shadow: 0 10px 20px rgba(0,0,0,0.08);
        }
        .mobile-nav ul { list-style: none; margin: 0; padding: 0; }
        .mobile-nav > ul > li > a {
          color: #0a214f; text-decoration: none; padding: 14px 0; display: block;
          font-size: 14px; font-weight: 600; border-bottom: 1px solid #f0f0f0;
          text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Sora', sans-serif;
        }
        .mobile-nav li ul { list-style: none; padding: 4px 0; }
        .mobile-nav li ul li a {
          padding: 10px 0 10px 20px; font-size: 13px; text-transform: none;
          font-weight: 500; color: #444; font-family: 'Sora', sans-serif;
          display: block; text-decoration: none;
        }



        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
          .search-container { max-width: 260px; }
          .header-inner { gap: 16px; height: 70px; padding: 0 16px; }
          .mobile-nav { top: 70px; }
        }
        @media (max-width: 767px) {
          .search-container { display: none; }
          .header-inner { gap: 8px; }

.icon-button {
    position: relative;
    width: 32px;
    height: 32px;
    border: none;
    background: #1872B5;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border-radius: 50px;
    color: #fff;
}
.cart-icon-btn {
    position: relative;
    width: 32px;
    height: 32px;
    border: none;
    background: #1872B5;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border-radius: 50px;
    color: #fff;
}
.badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #ff6b35;
    color: #fff;
    border-radius: 50%;
    width: 15px;
    height: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 800;
    border: 2px solid #fff;
    box-shadow: 0 2px 6px rgba(255,107,53,0.4);
    font-family: 'Sora', sans-serif;
    animation: badgePop .3s ease;
}
.icons-container {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
}
.logo img {
    height: 68px;
    width: auto;
    object-fit: contain;
}
.logo {
    width: 53%;
}
.icon-button svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
}
.cart-icon-btn svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
}
    .logo img {
    height: 68px;
    width: auto;
    object-fit: contain;
}  
.logo a {
    display: flex;
    align-items: center;
    text-decoration: none;
    justify-content: left;
}
.mobile-nav {
    background: #fff;
    border-top: 2px solid #e9ecef;
    padding: 16px 24px 24px;
    position: absolute;
    top: 80px;
    left: 0;
    right: 0;
    max-height: calc(100vh - 80px);
    overflow-y: auto;
    z-index: 999;
    box-shadow: 0 10px 20px rgba(0,0,0,0.08);
    min-height: 100vh;
}
.mobile-nav > ul > li > a {
    color: #0a214f;
    text-decoration: none;
    padding: 10px 0;
    display: block;
    font-size: 12px;
    font-weight: 600;
    border-bottom: 1px solid #f0f0f0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: 'Sora', sans-serif;
}
        }
      `}</style>

      <header className="header-wrap">
        <div className="header-inner">

          {/* Logo */}
          <div className="logo">
            <Link href="/">
              {logoUrl ? <img src={logoUrl} alt="Logo" /> : <span>SainiVet</span>}
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="desktop-nav">
            <ul className="nav-menu">
              {menus?.map((menu) => (
                <li key={menu.id} className="nav-item">
                  <a href={menu.url === '#' ? '#' : menu.url}>{menu.title}</a>
                  {menu.children?.length > 0 && (
                    <ul className="sub-menu">
                      {menu.children.map((child) => (
                        <li key={child.id}><a href={child.url}>{child.title}</a></li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Search */}
          <div className="search-container" ref={searchRef}>
            <input
              type="text" className="search-input" placeholder="Search products..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSearchDropdown(true)}
            />
            <div className="search-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            {showSearchDropdown && (
              <div className="search-dropdown">
                {searchResults.length > 0 ? (
                  <>
                    {searchResults.map((product) => (
                      <div key={product.id} className="search-result-item" onClick={() => handleSearchSelect(product)}>
                        <img src={productImageUrl(product)} alt={product.title} className="search-result-image" />
                        <div className="search-result-content">
                          <div className="search-result-title">{product.title}</div>
                          <div className="search-result-price">
                            ₹{product.sale_price || product.price || '0.00'}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="search-view-all" onClick={() => { window.location.href = `/collections?search=${searchQuery}`; }}>
                      View all results ({searchResults.length}+)
                    </div>
                  </>
                ) : searchQuery ? (
                  <div className="search-no-results">No products found</div>
                ) : null}
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="icons-container">

            {/* Account */}
            <Link href={user ? "/account" : "/login"}>
              <button className="icon-button" title={user ? "My Account" : "Login"}>
                <svg viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {user && <span className="badge-green">✓</span>}
              </button>
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist">
              <button className="icon-button" title="Wishlist">
                <svg viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
              </button>
            </Link>

            {/* ← CART BUTTON — drawer open karta hai */}
            <button
              className="cart-icon-btn"
              title="Shopping Cart"
              onClick={() => setDrawerOpen(true)}
            >
              <svg viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {totalItems > 0 && <span className="badge">{totalItems}</span>}
            </button>

          </div>

          {/* Mobile Toggle */}
          <button
            className={`mobile-toggle ${mobileOpen ? 'active' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="mobile-nav">
            <ul>
              {menus?.map((menu) => (
                <li key={menu.id}>
                  <a href={menu.url === '#' ? '#' : menu.url}>{menu.title}</a>
                  {menu.children?.length > 0 && (
                    <ul>
                      {menu.children.map((child) => (
                        <li key={child.id}><a href={child.url}>{child.title}</a></li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </>
  );
}
