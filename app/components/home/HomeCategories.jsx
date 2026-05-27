'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const HomeCategories = ({ categories = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const GAP = 20;
  const itemsVisible = isMobile ? 2 : 5;
  const totalSlides = Math.max(1, categories.length - itemsVisible + 1);

  const handlePrev = () => setCurrentIndex((p) => Math.max(0, p - 1));
  const handleNext = () => setCurrentIndex((p) => Math.min(p + 1, totalSlides - 1));

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? handleNext() : handlePrev();
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${apiUrl}/uploads/home-categories/${imageName}`;
  };

  const colorPalette = ['#DBEAFE','#FCE7F3','#FEF9C3','#DCFCE7','#F3E8FF','#FEE2E2','#ECFDF5','#FEF3C7'];
  const getCategoryColor = (i) => colorPalette[i % colorPalette.length];

  const translateStep = `calc((100% - ${(itemsVisible - 1) * GAP}px) / ${itemsVisible} + ${GAP}px)`;
  const trackTransform = `translateX(calc(-${currentIndex} * ${translateStep}))`;

  if (categories.length === 0) return null;

  return (
    <div className="hc-section">
      <style>{`
        @keyframes hc-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .hc-section { padding: 20px 0 50px; background: #fff; }
        .hc-container { max-width: 1400px; margin: 0 auto; padding: 0 24px; }
        .hc-header { display: flex; align-items: center; justify-content: center; margin-bottom: 33px; margin-top: 30px; }
        .hc-header-left h2 { font-size: 30px; line-height: 35px; font-weight: 800; letter-spacing: 0px; color: #0a214f; font-family: 'Sora', sans-serif; margin: 0; }
        .hc-slider-wrapper { display: flex; align-items: center; gap: 10px; position: relative; }
        .hc-overflow { overflow: hidden; padding-top: 52px; margin-top: -52px; flex: 1; min-width: 0; }
        .hc-track { display: flex; gap: ${GAP}px; transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); will-change: transform; }
        .hc-card { flex: 0 0 calc((100% - ${(itemsVisible - 1) * GAP}px) / ${itemsVisible}); min-width: 0; text-decoration: none; color: inherit; display: block; position: relative; padding-top: 48px; }
        .hc-card::before { content: ''; position: absolute; top: 0px; left: 50%; transform: translateX(-50%); width: 111px; height: 112px; border-radius: 50%; border: 3px dashed rgb(150 150 150 / 22%); z-index: 1; pointer-events: none; }
        .hc-card:hover::before { animation: hc-spin 4s linear infinite; width: 122px; height: 118px; }
        .hc-card-body { background: #1872b514; border-radius: 16px; padding: 87px 16px 22px; display: flex; flex-direction: column; align-items: center; text-align: center; transition: transform 0.35s ease, box-shadow 0.35s ease; cursor: pointer; position: relative; }
        .hc-card:hover .hc-card-body { transform: translateY(-5px); box-shadow: 0 14px 32px rgba(0,0,0,0.12); }
        .hc-img-wrap { position: absolute; top: 5px; left: 48%; transform: translateX(-50%); width: 94px; height: 90px; z-index: 2; pointer-events: none; }
        .hc-img-circle { width: 104px; height: 102px; border-radius: 50%; overflow: hidden; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: 0 6px 18px rgba(0,0,0,0.13); transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); position: relative; }
        .hc-card:hover .hc-img-circle { transform: scale(1.08); }
        .hc-img-circle img { width: 100%; height: 100%; object-fit: contain; }
        .hc-title { font-family: 'Sora', sans-serif; font-size: 18px; line-height: 24px; font-weight: 800; color: #1a2e44; margin: 0; transition: color 0.2s; }
        .hc-card:hover .hc-title { color: #1872B5; }
        
        /* Hover arrows (hidden by default on desktop, visible on hover) */
        .hc-arrow-side {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
          width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,.92);
          border: none; display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0; transition: opacity .3s, box-shadow .3s, background .3s;
          box-shadow: 0 2px 12px rgba(0,0,0,.13); color: #333;
        }
        .hc-slider-wrapper:hover .hc-arrow-side { opacity: 1; }
        .hc-arrow-side:hover:not(:disabled) { background: #fff !important; box-shadow: 0 4px 18px rgba(0,0,0,.18); }
        .hc-arrow-side:disabled { opacity: .4 !important; cursor: not-allowed; pointer-events: none; }
        .hc-arrow-side-prev { left: -22px; }
        .hc-arrow-side-next { right: -22px; }
        .hc-arrow-side svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
        
        /* Original side arrows (always visible) */
        .hc-arrow { flex-shrink: 0; width: 38px; height: 38px; border-radius: 50%; background: #fff; border: 2px solid #1a2e44; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.25s ease; color: #555; box-shadow: 0 3px 10px rgba(0,0,0,0.09); margin-top: 24px; }
        .hc-arrow:hover:not(:disabled) { background: #f3f4f6; box-shadow: 0 5px 14px rgba(0,0,0,0.13); color: #111; }
        .hc-arrow:disabled { opacity: 0.3; cursor: not-allowed; }
        button.hc-arrow {
    display: none;
}
p.sabdj {
    font-size: 17px;
    color: #1872B5;
    margin: 6px 0 0;
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
}
.hc-header-left h2 {
    font-size: 30px;
    line-height: 35px;
    font-weight: 800;
    letter-spacing: 0px;
    color: #0a214f;
    font-family: 'Sora', sans-serif;
    margin: 0;
    text-align: center;
}
.hc-section {
    padding: 20px 0 37px;
    background: #fff;
}
.hc-card::before {
    display: none;
}
        @media (max-width: 767px) {
          .hc-section { padding: 16px 0 36px; }
          .hc-container { padding: 0 14px; }
          .hc-overflow { padding-top: 42px; margin-top: -42px; }
          .hc-img-wrap { width: 76px; height: 76px; top: 0; }
          .hc-img-circle { width: 64px; height: 64px; font-size: 28px; }
          .hc-card { padding-top: 38px; }
          .hc-card::before { width: 76px; height: 76px; top: 0; }
          .hc-card-body { padding: 46px 10px 16px; border-radius: 12px; }
          .hc-title { font-size: 13px; }
          .hc-arrow { width: 32px; height: 32px; margin-top: 20px; display: none; }
          .hc-arrow-side { opacity: 1 !important; width: 36px; height: 36px; }
          .hc-arrow-side-prev { left: -8px; }
          .hc-arrow-side-next { right: -8px; }
		  .hc-card::before {
    display: none;
}
.hc-img-circle {
    width: 102px;
    height: 102px;
    border-radius: 50%;
    overflow: hidden;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.13);
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
}
.hc-img-circle {
    border: dashed 2px #1872B5;
}


        }
        @media (min-width: 768px) and (max-width: 1024px) {
          .hc-img-wrap { width: 86px; height: 86px; }
          .hc-img-circle { width: 72px; height: 72px; }
          .hc-card { padding-top: 44px; }
          .hc-card::before { width: 86px; height: 86px; }
          .hc-card-body { padding: 52px 14px 20px; }
          .hc-title { font-size: 14px; }
        }
      `}</style>

      <div className="hc-container">
        <div className="hc-header">
          <div className="hc-header-left">
            <h2>Categories</h2>
			<p class="sabdj"> ~ Explore our collections ~</p>
          </div>
        </div>

        <div className="hc-slider-wrapper" ref={containerRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {/* Side arrows (always visible) */}
          <button className="hc-arrow" onClick={handlePrev} disabled={currentIndex === 0} aria-label="Previous" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          {/* Hover arrows (hidden by default, visible on hover) */}
          <button className="hc-arrow-side hc-arrow-side-prev" onClick={handlePrev} disabled={currentIndex === 0} aria-label="Previous" type="button">
            <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          <div className="hc-overflow">
            <div className="hc-track" style={{ transform: trackTransform }}>
              {categories.map((item, index) => {
                const Comp = item.url ? Link : 'div';
                const props = item.url ? { href: item.url } : {};
                return (
                  <Comp key={item.id} className="hc-card" {...props}>
                    <div className="hc-img-wrap">
                      <div className="hc-img-circle">
                        {item.image ? (
                          <img src={getImageUrl(item.image)} alt={item.alt_tag || item.title} onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : '📦'}
                      </div>
                    </div>
                    <div className="hc-card-body" style={{ '--card-bg': item.color || getCategoryColor(index) }}>
                      <h3 className="hc-title">{item.title}</h3>
                    </div>
                  </Comp>
                );
              })}
            </div>
          </div>

          {/* Hover arrows (hidden by default, visible on hover) */}
          <button className="hc-arrow-side hc-arrow-side-next" onClick={handleNext} disabled={currentIndex >= totalSlides - 1} aria-label="Next" type="button">
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
          </button>

          {/* Side arrows (always visible) */}
          <button className="hc-arrow" onClick={handleNext} disabled={currentIndex >= totalSlides - 1} aria-label="Next" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeCategories;
