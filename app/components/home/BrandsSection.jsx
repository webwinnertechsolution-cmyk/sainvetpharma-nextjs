'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const BrandsSection = ({ section = null, brands = [] }) => {
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost/sainivetpharma/public').replace(/\/$/, '');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile]         = useState(false);
  const [isDragging, setIsDragging]     = useState(false);
  const [startX, setStartX]             = useState(0);
  const [offset, setOffset]             = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const GAP          = 20;
  const maxVisible   = isMobile ? 2 : 7;  // Mobile mein 2 slides
  const itemsVisible = Math.min(maxVisible, brands.length);
  const totalSlides  = brands.length > itemsVisible ? brands.length - itemsVisible + 1 : 1;
  const showArrows   = brands.length > itemsVisible;

  /* ── Drag helpers ── */
  const getCardWidth = () => {
    const firstCard = trackRef.current?.querySelector('.br-card');
    return firstCard ? firstCard.offsetWidth + GAP : 0;
  };

  const handleMouseDown  = (e) => { setIsDragging(true); setStartX(e.clientX); setOffset(0); };
  const handleMouseMove  = (e) => { if (!isDragging) return; setOffset(e.clientX - startX); };
  const handleMouseLeave = ()  => { if (isDragging) { setIsDragging(false); setOffset(0); } };
  const handleMouseUp    = ()  => {
    if (!isDragging) return;
    setIsDragging(false);
    const cardW = getCardWidth();
    const slide = Math.round(-offset / cardW);
    if (Math.abs(slide) > 0)
      setCurrentIndex(Math.max(0, Math.min(currentIndex + slide, totalSlides - 1)));
    setOffset(0);
  };

  const handleTouchStart = (e) => { setIsDragging(true); setStartX(e.touches[0].clientX); setOffset(0); };
  const handleTouchMove  = (e) => { if (!isDragging) return; setOffset(e.touches[0].clientX - startX); };
  const handleTouchEnd   = ()  => {
    if (!isDragging) return;
    setIsDragging(false);
    const cardW = getCardWidth();
    const slide = Math.round(-offset / cardW);
    if (Math.abs(slide) > 0)
      setCurrentIndex(Math.max(0, Math.min(currentIndex + slide, totalSlides - 1)));
    setOffset(0);
  };

  /* ── Transform ── */
  const translateStep  = `calc((100% - ${(itemsVisible - 1) * GAP}px) / ${itemsVisible} + ${GAP}px)`;
  const baseTransform  = `calc(-${currentIndex} * ${translateStep})`;
  const finalTransform = isDragging ? `calc(${baseTransform} + ${offset}px)` : baseTransform;

  const getImageUrl = (name) =>
    name ? `${API_URL}/uploads/brands/${name}` : null;

  if (!brands || brands.length === 0) return null;

  return (
    <div className="br-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Nunito:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        .br-wrap {
          padding: 40px 0;
          background: transparent;
        }
        .br-inner {
          max-width: 1400px; margin: 0 auto; padding: 0 24px;
        }

        /* ── Header ── */
        .br-header {
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
        }
        .br-header h2 {
          font-size: 24px; font-weight: 700; color: #0a214f;
          font-family: 'Sora', sans-serif; margin: 0;
        }
        .br-view-all { display: none; }

        /* ── Slider wrapper ── */
        .br-slider-wrapper {
          position: relative; display: flex; align-items: center; user-select: none;
        }
        .br-overflow { overflow: hidden; flex: 1; min-width: 0; cursor: grab; }
        .br-overflow.dragging { cursor: grabbing; }
        .br-track {
          display: flex; gap: ${GAP}px; padding: 6px 0;
          transition: ${isDragging ? 'none' : 'transform .6s cubic-bezier(.25,.46,.45,.94)'};
          will-change: transform;
          transform: translateX(${finalTransform});
        }

        /* ── Arrows ── */
        .br-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
          width: 36px; height: 36px; border-radius: 50%;
          background: #fff; border: 1.5px solid #e5e7eb;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0;
          transition: opacity .3s, box-shadow .3s;
          box-shadow: 0 2px 8px rgba(0,0,0,.1); color: #374151;
        }
        .br-slider-wrapper:hover .br-arrow { opacity: 1; }
        .br-arrow:hover:not(:disabled) {
          box-shadow: 0 4px 16px rgba(0,0,0,.18);
        }
        .br-arrow:disabled { opacity: .3 !important; cursor: not-allowed; pointer-events: none; }
        .br-arrow-prev { left: -18px; }
        .br-arrow-next { right: -18px; }
        .br-arrow svg {
          width: 16px; height: 16px; fill: none; stroke: currentColor;
          stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;
        }

        /* ── Brand Card ── */
        .br-card {
          flex: 0 0 calc((100% - ${(itemsVisible - 1) * GAP}px) / ${itemsVisible});
          max-width: 150px;
          height: 80px;
          display: flex; align-items: center; justify-content: center;
          transition: transform .22s ease;
          text-decoration: none; cursor: pointer;
          pointer-events: ${isDragging ? 'none' : 'auto'};
          background: transparent;
        }
        .br-card:hover {
          transform: translateY(-3px);
        }
        .br-card img {
          max-width: 100%;
          max-height: 80px;
          width: 150px;
          height: 80px;
          object-fit: contain;
          filter: grayscale(30%); opacity: 0.85;
          transition: all .22s ease;
          user-select: none; -webkit-user-drag: none;
        }
        .br-card:hover img { filter: grayscale(0%); opacity: 1; }

        .br-placeholder {
          width: 40px; height: 40px; background: #f3f4f6;
          border-radius: 8px; display: flex; align-items: center;
          justify-content: center; color: #d1d5db; font-size: 20px;
        }

        /* ── Mobile ── */
        @media (max-width: 767px) {
          .br-wrap { padding: 24px 0; }
          .br-inner { padding: 0 14px; }
          .br-header { margin-bottom: 16px; }
          .br-header h2 { font-size: 18px; }

          .br-card {
            flex: 0 0 calc((100% - ${1 * GAP}px) / 2) !important;  /* 2 cards with 1 gap */
            height: 70px;
            max-width: none;
          }
          .br-card img { 
            max-height: 70px; 
            width: 100%; 
            height: 70px; 
          }

          .br-arrow { 
            opacity: 1 !important; 
            width: 28px; 
            height: 28px; 
          }
          .br-arrow-prev { left: -6px; }
          .br-arrow-next { right: -6px; }
        }
      `}</style>

      <div className="br-inner">
        {/* Header */}
        <div className="br-header">
          <h2>{section?.heading || 'Our Brands'}</h2>
        </div>

        {/* Slider */}
        <div
          className="br-slider-wrapper"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {showArrows && (
            <button
              className="br-arrow br-arrow-prev"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              aria-label="Previous"
              type="button"
            >
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}

          <div
            className={`br-overflow ${isDragging ? 'dragging' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="br-track" ref={trackRef}>
              {brands.map((brand) => {
                const imgSrc = getImageUrl(brand.image);
                const CardTag = brand.url ? 'a' : 'div';
                const cardProps = brand.url
                  ? { href: brand.url, target: '_blank', rel: 'noopener noreferrer' }
                  : {};

                return (
                  <CardTag
                    key={brand.id}
                    className="br-card"
                    onClick={(e) => isDragging && e.preventDefault()}
                    {...cardProps}
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={brand.alt_tag || 'Brand'}
                        loading="lazy"
                        draggable={false}
                      />
                    ) : (
                      <div className="br-placeholder">🏷️</div>
                    )}
                  </CardTag>
                );
              })}
            </div>
          </div>

          {showArrows && (
            <button
              className="br-arrow br-arrow-next"
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

export default BrandsSection;
