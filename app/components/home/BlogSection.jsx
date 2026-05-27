'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const BlogSection = ({ blogs = [] }) => {
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

  const GAP          = 14;
  const maxVisible   = isMobile ? 2 : 5;
  const itemsVisible = Math.min(maxVisible, blogs.length);
  const totalSlides  = Math.max(1, blogs.length - itemsVisible + 1);
  const showArrows   = blogs.length > itemsVisible;

  /* ── Drag helpers ── */
  const getCardWidth = () => {
    const firstCard = trackRef.current?.querySelector('.bs-card');
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
    name ? `${API_URL}/uploads/blogs/${name}` : null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  if (!blogs || blogs.length === 0) return null;

  return (
    <div className="bs-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Nunito:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        .bs-wrap  { padding: 8px 0 30px; background: transparent; }
        .bs-inner { max-width: 1400px; margin: 0 auto; padding: 0 24px; }

        /* ── Header ── */
        .bs-header {
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 22px; margin-top: 15px; position: relative;
        }
        .bs-header-left { text-align: center; }
        .bs-header-left h2 {
          font-size: 27px; line-height: 32px; font-weight: 800;
          color: #0a214f; font-family: 'Sora', sans-serif; margin: 0;
        }
        .bs-header-left p {
          font-size: 17px; color: #1872B5; margin: 6px 0 0;
          font-family: 'Nunito', sans-serif; font-weight: 800;
        }
        .bs-view-all {
          font-size: 14px; font-weight: 600; color: #374151; text-decoration: none;
          display: flex; align-items: center; gap: 5px; white-space: nowrap;
          transition: color .2s; font-family: 'Nunito', sans-serif; position: absolute; right: 0;
        }
        .bs-view-all:hover { color: #1872B5; }
        .bs-view-all:hover svg { transform: translateX(3px); }
        .bs-view-all svg { transition: transform .2s; }

        /* ── Slider wrapper ── */
        .bs-slider-wrapper { position: relative; display: flex; align-items: center; user-select: none; }
        .bs-overflow { overflow: hidden; flex: 1; min-width: 0; cursor: grab; }
        .bs-overflow.dragging { cursor: grabbing; }
        .bs-track {
          display: flex; gap: ${GAP}px; padding: 10px 0 11px;
          transition: ${isDragging ? 'none' : 'transform .6s cubic-bezier(.25,.46,.45,.94)'};
          will-change: transform;
          transform: translateX(${finalTransform});
        }

        /* ── Arrows ── */
        .bs-arrow {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(255,255,255,.92); border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; opacity: 0;
          transition: opacity .3s, box-shadow .3s, background .3s;
          box-shadow: 0 2px 12px rgba(0,0,0,.13); color: #333;
        }
        .bs-slider-wrapper:hover .bs-arrow { opacity: 1; }
        .bs-arrow:hover:not(:disabled) { background: #fff !important; box-shadow: 0 4px 18px rgba(0,0,0,.18); }
        .bs-arrow:disabled { opacity: .4 !important; cursor: not-allowed; pointer-events: none; }
        .bs-arrow-prev { left: -22px; }
        .bs-arrow-next { right: -22px; }
        .bs-arrow svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }

        /* ── Card ── */
        .bs-card {
          flex: 0 0 calc((100% - ${(itemsVisible - 1) * GAP}px) / ${itemsVisible});
          min-width: 0; background: #fff; border-radius: 14px;
          border: 1.5px solid #e5e7eb; overflow: hidden;
          transition: all .22s ease; position: relative;
          box-shadow: 0 2px 10px rgba(0,0,0,.07);
          display: flex; flex-direction: column;
          text-decoration: none; color: inherit; cursor: pointer;
          pointer-events: ${isDragging ? 'none' : 'auto'};
        }
        .bs-card:hover {
          border-color: #1872B5;
          box-shadow: 0 8px 28px rgba(24,114,181,.18);
          transform: translateY(-2px);
        }

        /* ── Image ── */
        .bs-img {
          aspect-ratio: 1; background: #f0f7f0; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          border-bottom: 2.5px solid #f5a623;
        }
        .bs-img img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .35s ease;
          user-select: none; -webkit-user-drag: none;
        }
        .bs-card:hover .bs-img img { transform: scale(1.07); }
        .bs-img-placeholder {
          width: 100%; height: 100%; background: linear-gradient(135deg, #f0f7f0, #e0ede0);
          display: flex; align-items: center; justify-content: center; color: #bbb; font-size: 40px;
        }

        /* ── Body ── */
        .bs-body { padding: 12px 14px 14px; flex: 1; display: flex; flex-direction: column; }

        .bs-category {
          display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: .5px;
          text-transform: uppercase; color: #1872B5; margin-bottom: 6px;
          font-family: 'Nunito', sans-serif;
        }

        .bs-title {
          font-size: 14px; font-weight: 600; color: #0a214f; line-height: 1.45;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; font-family: 'Nunito', sans-serif; margin-bottom: 0;
        }
        .bs-card:hover .bs-title { color: #1872B5; }

        .bs-date {
          margin-top: auto; padding-top: 8px; font-size: 11px; color: #9ca3af;
          font-family: 'Nunito', sans-serif;
        }
a.bs-view-all {
    display: none;
}
.bs-header-left p {
    font-size: 17px;
    color: #1872B5;
    margin: 0px 0 -5px;
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
}
.bs-category {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: normal;
    text-transform: uppercase;
    color: #1872B5;
    margin-bottom: 1px;
    font-family: 'Nunito', sans-serif;
}
.bs-title {
    font-size: 12px;
    font-weight: 600;
    color: #0a214f;
    line-height: 15px;
    display: -webkit-box;
    -webkit-line-clamp: normal;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-family: 'Nunito', sans-serif;
    margin-bottom: -6px;
}
.bs-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    margin-top: 8px;
    position: relative;
}
        /* ── Mobile ── */
        @media (max-width: 767px) {
          .bs-wrap { padding-bottom: 29px !important; }
          .bs-inner { padding: 0 14px; }
          .bs-card { flex: 0 0 calc((100vw - 28px - 14px) / 2) !important; }
          .bs-title { font-size: 12px; }
          .bs-header-left h2 { font-size: 20px; line-height: 26px; }
          .bs-arrow { opacity: 1 !important; width: 36px; height: 36px; }
          .bs-arrow-prev { left: -8px; }
          .bs-arrow-next { right: -8px; }
          .bs-view-all { display: none; }
          .bs-header-left p {
    font-size: 14px;
    color: #1872B5;
    margin: -1px 0 -17px;
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
}
.bs-category {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: normal;
    text-transform: uppercase;
    color: #1872B5;
    margin-bottom: 0px;
    font-family: 'Nunito', sans-serif;
}
.bs-title {
    font-size: 14px;
    font-weight: 600;
    color: #0a214f;
    line-height: 14px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-family: 'Nunito', sans-serif;
    margin-bottom: -6px;
}
.bs-title {
    font-size: 12px;
}
.bs-body {
    padding: 10px 8px 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
}
.bs-arrow {
    opacity: 1 !important;
    width: 30px;
    height: 30px;
}
        }
      `}</style>

      <div className="bs-inner">
        {/* Header */}
        <div className="bs-header">
          <div className="bs-header-left">
           <h2>Articles</h2>
            <p>~ Trusted pet care advice ~</p>
          </div>
          <Link href="/blog" className="bs-view-all">
            View All
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Slider */}
        <div
          className="bs-slider-wrapper"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {showArrows && (
            <button
              className="bs-arrow bs-arrow-prev"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              aria-label="Previous"
              type="button"
            >
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}

          <div
            className={`bs-overflow ${isDragging ? 'dragging' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="bs-track" ref={trackRef}>
              {blogs.map((blog) => {
                const imgSrc   = getImageUrl(blog.featured_image);
                const category = blog.categories?.[0]?.name || '';

                return (
                  <Link
                    key={blog.id}
                    href={`/blog/${blog.slug}`}
                    className="bs-card"
                    onClick={(e) => isDragging && e.preventDefault()}
                  >
                    <div className="bs-img">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={blog.image_alt_tag || blog.title}
                          loading="lazy"
                          draggable={false}
                        />
                      ) : (
                        <div className="bs-img-placeholder">📝</div>
                      )}
                    </div>

                    <div className="bs-body">
                      {category && <span className="bs-category">{category}</span>}
                      <div className="bs-title">{blog.title}</div>
                      {blog.published_at && (
                        <div className="bs-date">{formatDate(blog.published_at)}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {showArrows && (
            <button
              className="bs-arrow bs-arrow-next"
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

export default BlogSection;
