'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoredUser } from '@/lib/googleAuth';

const ProductSection = ({ section = null, products = [] }) => {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const instanceId = useId().replace(/:/g, '_');

  const [productList] = useState(products);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistLoading, setWishlistLoading] = useState(new Set());
  const trackRef = useRef(null);
  const isWishlistClick = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    fetchWishlist();

    const handleWishlistUpdate = (e) => {
      if (e.detail?.sourceId === instanceId) return;

      if (e.detail && typeof e.detail.productId !== 'undefined') {
        const { productId, isWishlisted } = e.detail;
        setWishlistIds(prev => {
          const next = new Set(prev);
          isWishlisted ? next.add(productId) : next.delete(productId);
          return next;
        });
      } else {
        fetchWishlist();
      }
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, []);

  function getHeaders() {
    const user = getStoredUser();
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(user?.firebase_uid ? { 'X-Firebase-UID': user.firebase_uid } : {}),
    };
  }

  async function fetchWishlist() {
    const user = getStoredUser();
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/api/wishlist`, { headers: getHeaders() });
      const data = await res.json();
      const ids = new Set((data.products || []).map(p => p.id));
      setWishlistIds(ids);
    } catch (err) {
      console.error('Wishlist fetch error:', err);
    }
  }

  async function toggleWishlist(e, productId) {
    e.preventDefault();
    e.stopPropagation();
    
    isWishlistClick.current = true;

    const user = getStoredUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (wishlistLoading.has(productId)) return;
    setWishlistLoading(prev => new Set(prev).add(productId));

    const isWishlisted = wishlistIds.has(productId);
    const endpoint = isWishlisted
      ? `${API_URL}/api/wishlist/remove/${productId}`
      : `${API_URL}/api/wishlist/add`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getHeaders(),
        body: isWishlisted ? undefined : JSON.stringify({ product_id: productId }),
      });
      const data = await res.json();
      if (data.success) {
        setWishlistIds(prev => {
          const next = new Set(prev);
          isWishlisted ? next.delete(productId) : next.add(productId);
          return next;
        });

        window.dispatchEvent(new CustomEvent('wishlistUpdated', {
          detail: { productId, isWishlisted: !isWishlisted, sourceId: instanceId }
        }));
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    } finally {
      setWishlistLoading(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  }

  const GAP = 14;
  const maxItemsToShow = isMobile === true ? 2 : 5;
  const itemsVisible = Math.min(maxItemsToShow, productList.length);
  const totalSlides = Math.max(1, productList.length - itemsVisible + 1);

  const getCardWidth = () => {
    if (!trackRef.current?.parentElement) return 0;
    const firstCard = trackRef.current.querySelector('.ps-card');
    return firstCard ? firstCard.offsetWidth + GAP : 0;
  };

  const handleMouseDown = (e) => {
    if (isWishlistClick.current) {
      isWishlistClick.current = false;
      return;
    }
    
    setIsDragging(true);
    setStartX(e.clientX);
    setOffset(0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset(e.clientX - startX);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setOffset(0);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const cardW = getCardWidth();
    const slideCount = Math.round(-offset / cardW);
    if (Math.abs(slideCount) > 0)
      setCurrentIndex(Math.max(0, Math.min(currentIndex + slideCount, totalSlides - 1)));
    
    // Reset offset after small delay to allow click handler to check
    setTimeout(() => setOffset(0), 50);
  };

  const shouldPreventNavigation = useRef(false);

  const handleCardClick = (detailUrl) => {
    if (Math.abs(offset) > 5) {
      shouldPreventNavigation.current = true;
      return;
    }
    router.push(detailUrl);
  };

  const handleTouchStart = (e) => {
    if (isWishlistClick.current) {
      isWishlistClick.current = false;
      return;
    }
    
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setOffset(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setOffset(e.touches[0].clientX - startX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const cardW = getCardWidth();
    const slideCount = Math.round(-offset / cardW);
    if (Math.abs(slideCount) > 0)
      setCurrentIndex(Math.max(0, Math.min(currentIndex + slideCount, totalSlides - 1)));
    
    // Reset offset after small delay to allow click handler to check
    setTimeout(() => setOffset(0), 50);
  };

  const translateStep = `calc((100% - ${(itemsVisible - 1) * GAP}px) / ${itemsVisible} + ${GAP}px)`;
  const baseTransform = `calc(-${currentIndex} * ${translateStep})`;
  const finalTransform = isDragging ? `calc(${baseTransform} + ${offset}px)` : baseTransform;

  const getImageUrl = (imageName) =>
    imageName ? `${API_URL}/uploads/products/${imageName}` : null;

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

  if (!section || !section.is_active || productList.length === 0) return null;

  const showArrows = productList.length > itemsVisible;

  const cardFlexBasis = isMobile === true
    ? `calc((100vw - 28px - 14px) / 2)`
    : `calc((100% - ${(itemsVisible - 1) * GAP}px) / ${itemsVisible})`;

  return (
    <div className="ps-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Nunito:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }

        .ps-wrap {
          padding: 42px 0 50px;
          background: transparent;
          position: relative;
          z-index: 1;
        }

        .ps-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .ps-header {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 33px;
          margin-top: 10px;
          position: relative;
        }

        .ps-header-left {
          text-align: center;
        }

        .ps-header-left h2 {
          font-size: 30px;
          line-height: 35px;
          font-weight: 800;
          letter-spacing: 0;
          color: #0a214f;
          font-family: 'Sora', sans-serif;
          margin: 0;
        }

        .ps-header-left p {
          font-size: 14px;
          color: #6b7280;
          margin: 6px 0 0;
          font-family: 'Nunito', sans-serif;
          font-size: 17px;
          color: #1872B5;
          font-weight: 800;
        }

        .ps-view-all {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          transition: color 0.2s;
          font-family: 'Nunito', sans-serif;
          position: absolute;
          right: 0;
        }

        .ps-view-all:hover { color: #1872B5; }
        .ps-view-all:hover svg { transform: translateX(3px); }
        .ps-view-all svg { transition: transform 0.2s; }

        .ps-slider-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          user-select: none;
        }

        .ps-overflow {
          overflow: hidden;
          flex: 1;
          min-width: 0;
          cursor: grab;
        }

        .ps-overflow.dragging { cursor: grabbing; }

        .ps-track {
          display: flex;
          gap: ${GAP}px;
          will-change: transform;
          padding-top: 10px;
          padding-bottom: 11px;
        }

        .ps-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s, box-shadow 0.3s, background 0.3s;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.13);
          color: #333;
        }

        .ps-slider-wrapper:hover .ps-arrow { opacity: 1; }
        .ps-arrow:hover:not(:disabled) {
          background: #fff !important;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.18);
        }
        .ps-arrow:disabled {
          opacity: 0.4 !important;
          cursor: not-allowed;
          pointer-events: none;
        }

        .ps-arrow-prev { left: -22px; }
        .ps-arrow-next { right: -22px; }

        .ps-arrow svg {
          width: 18px;
          height: 18px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.5;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .ps-card {
          min-width: 0;
          flex-shrink: 0;
          background: #fff;
          border-radius: 14px;
          border: 1.5px solid #e5e7eb;
          overflow: hidden;
          transition: all 0.22s ease;
          position: relative;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }

        .ps-card:hover {
          border-color: #1872B5;
          box-shadow: 0 8px 28px rgba(24, 114, 181, 0.18);
          transform: translateY(-2px);
        }

        .ps-disc-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 10;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
          font-family: 'Nunito', sans-serif;
          letter-spacing: 0.3px;
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
          line-height: 1;
        }

        .ps-disc-badge.sale {
          background: linear-gradient(135deg, #1872b5 0%, #1872b5 100%);
          color: #fff;
          box-shadow: none;
          font-size: 11px;
          padding: 5px;
          border-radius: 5px;
        }

        .ps-disc-badge.sale::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
        }

        .ps-disc-badge.featured {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #fff;
          box-shadow: 0 3px 10px rgba(59, 130, 246, 0.45);
        }

        .ps-wish-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 10;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          border: 1.5px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.22s ease;
          opacity: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 0;
        }

        .ps-card:hover .ps-wish-btn { opacity: 1; }
        .ps-wish-btn:hover {
          border-color: #f87171;
          background: #fff5f5;
          transform: scale(1.12);
        }
        .ps-wish-btn.active {
          opacity: 1;
          border-color: #ef4444;
          background: #fff5f5;
        }
        .ps-wish-btn svg {
          width: 16px;
          height: 16px;
          stroke: #9ca3af;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          transition: stroke 0.2s, fill 0.2s;
          pointer-events: none;
        }
        .ps-wish-btn.active svg { stroke: #ef4444; fill: #ef4444; }
        .ps-wish-btn:hover svg { stroke: #ef4444; }
        .ps-wish-btn.loading svg { opacity: 0.4; }

        .ps-img {
          aspect-ratio: 1;
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .ps-img img {
          max-width: 100%;
          max-height: 100%;
          object-fit: cover;
          transition: transform 0.35s ease, opacity 0.3s ease;
          user-select: none;
          -webkit-user-drag: none;
          width: 100%;
          height: 100%;
        }

        .ps-card:hover .ps-img img { transform: scale(1.07); }

        .ps-body {
          padding: 12px 14px 14px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .ps-title {
          font-size: 14px;
          font-weight: 600;
          color: #0a214f;
          line-height: 1.4;
          margin-bottom: 3px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-family: 'Nunito';
        }

        .ps-card:hover .ps-title { color: #1872B5; }

        .ps-price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: auto;
          padding-top: 8px;
          flex-wrap: wrap;
        }

        .ps-price {
          font-size: 16px;
          font-weight: 800;
          color: #1872B5;
          font-family: 'Nunito', sans-serif;
        }

        .ps-compare-price {
          font-size: 12px;
          color: #9ca3af;
          text-decoration: line-through;
          font-family: 'Nunito', sans-serif;
        }

        .ps-stock-out {
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 5px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 6px;
          background: #fee2e2;
          color: #dc2626;
          align-self: flex-start;
        }

        @media (max-width: 767px) {
          .ps-wrap { padding-bottom: 29px !important; }
          .ps-inner { padding: 0 14px; }
          .ps-title { font-size: 12px; }
          .ps-price { font-size: 14px; }
          .ps-header-left h2 { font-size: 20px; line-height: 26px; }
          .ps-arrow {
            opacity: 1 !important;
            width: 36px;
            height: 36px;
          }
          .ps-arrow-prev { left: -8px; }
          .ps-arrow-next { right: -8px; }
          .ps-view-all { display: none; }
          .ps-disc-badge { font-size: 11px; padding: 4px 8px; top: 8px; left: 8px; }
          .ps-wish-btn { opacity: 1; width: 28px; height: 28px; }
          .ps-wish-btn svg { width: 14px; height: 14px; }
        }
      `}</style>

      <div className="ps-inner">
        <div className="ps-header">
          <div className="ps-header-left">
            <h2>{section?.heading || 'Products'}</h2>
            {section?.sub_heading && <p>{section.sub_heading}</p>}
          </div>
          {section?.view_all_url && (
            <Link href={section.view_all_url} className="ps-view-all">
              {section.view_all_text || 'View All'}
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        <div
          className="ps-slider-wrapper"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {showArrows && (
            <button
              className="ps-arrow ps-arrow-prev"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              aria-label="Previous"
              type="button"
            >
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}

          <div
            className={`ps-overflow ${isDragging ? 'dragging' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="ps-track"
              ref={trackRef}
              style={{
                transform: `translateX(${finalTransform})`,
                transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            >
              {productList.map((product) => {
                const inStock = product.stock_quantity > 0;
                const imgSrc = getImageUrl(product.featured_image);
                const detailUrl = `/product/${product.slug}`;
                const discInfo = getDiscountInfo(product);
                const isHovering = hoveredProductId === product.id;
                const isWishlisted = wishlistIds.has(product.id);
                const isWishLoading = wishlistLoading.has(product.id);

                const galleryImages = (product.images || []).map(img => ({
                  type: img.type || 'image',
                  src: `${API_URL}/uploads/products/gallery/${img.image}`,
                  alt: img.alt_tag || product.title,
                }));

                const displayImage = isHovering && galleryImages.length > 0
                  ? galleryImages[0]
                  : { src: imgSrc, alt: product.featured_image_alt || product.title };

                const showCompare = discInfo?.comparePrice;
                const showPrice = discInfo?.sellingPrice || product.price;

                return (
                  <div
                    key={product.id}
                    className="ps-card"
                    style={{
                      flex: `0 0 ${cardFlexBasis}`,
                      pointerEvents: isDragging ? 'none' : 'auto',
                      cursor: isDragging ? 'grabbing' : 'pointer',
                    }}
                    onClick={() => handleCardClick(detailUrl)}
                    onMouseEnter={() => setHoveredProductId(product.id)}
                    onMouseLeave={() => setHoveredProductId(null)}
                  >
                    <div className="ps-img">
                      {discInfo ? (
                        <span className="ps-disc-badge sale">{discInfo.pct}%</span>
                      ) : product.is_featured ? (
                        <span className="ps-disc-badge featured">⭐ Featured</span>
                      ) : null}

                      <button
                        className={`ps-wish-btn${isWishlisted ? ' active' : ''}${isWishLoading ? ' loading' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(e, product.id);
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          isWishlistClick.current = true;
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          isWishlistClick.current = true;
                        }}
                        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        type="button"
                      >
                        <svg viewBox="0 0 24 24">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>

                      {displayImage.src ? (
                        <img
                          src={displayImage.src}
                          alt={displayImage.alt}
                          loading="lazy"
                          draggable={false}
                        />
                      ) : (
                        <div style={{ fontSize: 48, color: '#d1d5db' }}>📦</div>
                      )}
                    </div>

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
                  </div>
                );
              })}
            </div>
          </div>

          {showArrows && (
            <button
              className="ps-arrow ps-arrow-next"
              onClick={() => setCurrentIndex(Math.min(currentIndex + 1, totalSlides - 1))}
              disabled={currentIndex >= totalSlides - 1}
              aria-label="Next"
              type="button"
            >
              <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSection;
