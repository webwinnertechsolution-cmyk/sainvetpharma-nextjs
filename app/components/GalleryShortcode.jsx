'use client';

import { useEffect, useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ════════════════════════════════════════════════════════
// GalleryShortcode Component — use karo kisi bhi page pe:
// <GalleryShortcode imageGalleryId={3} videoGalleryId={4} />
// ════════════════════════════════════════════════════════

export default function GalleryShortcode({ imageGalleryId = 3, videoGalleryId = 4 }) {
  const [activeTab, setActiveTab]   = useState('images');
  const [images, setImages]         = useState([]);
  const [videos, setVideos]         = useState([]);
  const [imgTitle, setImgTitle]     = useState('Images');
  const [vidTitle, setVidTitle]     = useState('Videos');
  const [loading, setLoading]       = useState(true);
  const [lightbox, setLightbox]     = useState(null); // { type, url, title, index }
  const [visible, setVisible]       = useState(false);

  // Fetch both galleries
  useEffect(() => {
    const fetchGallery = async (id, type) => {
      try {
        const res = await fetch(`${API_URL}/api/gallery/${id}/media`);
        if (!res.ok) return;
        const data = await res.json();
        if (type === 'images') {
          setImages(data.images || []);
          setImgTitle(data.title || 'Images');
        } else {
          setVideos(data.videos || []);
          setVidTitle(data.title || 'Videos');
        }
      } catch (e) {
        console.error(e);
      }
    };

    Promise.all([
      fetchGallery(imageGalleryId, 'images'),
      fetchGallery(videoGalleryId, 'videos'),
    ]).finally(() => {
      setLoading(false);
      setTimeout(() => setVisible(true), 50);
    });
  }, [imageGalleryId, videoGalleryId]);

  // Keyboard lightbox navigation
  const handleKey = useCallback((e) => {
    if (!lightbox) return;
    const list = activeTab === 'images' ? images : videos;
    if (e.key === 'Escape') setLightbox(null);
    if (e.key === 'ArrowRight') {
      const next = (lightbox.index + 1) % list.length;
      setLightbox({ ...list[next], index: next });
    }
    if (e.key === 'ArrowLeft') {
      const prev = (lightbox.index - 1 + list.length) % list.length;
      setLightbox({ ...list[prev], index: prev });
    }
  }, [lightbox, activeTab, images, videos]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const openLightbox = (item, index) => setLightbox({ ...item, index });

  const currentList = activeTab === 'images' ? images : videos;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;}

        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}

        .gal-wrap{
          font-family:'Nunito',sans-serif;
          background:#f5f7fa;
          min-height:60vh;
          padding:56px 0 80px;
        }

        /* ── Header ── */
        .gal-header{
          text-align:center;
          margin-bottom:44px;
          animation:fadeUp .6s ease both;
        }
        .gal-tag{
          display:inline-flex;align-items:center;gap:8px;
          background:linear-gradient(135deg,#eff6ff,#dbeafe);
          color:#1872B5;font-size:11px;font-weight:800;
          text-transform:uppercase;letter-spacing:.12em;
          padding:6px 18px;border-radius:20px;
          border:1px solid #bfdbfe;margin-bottom:16px;
        }
        .gal-tag::before{content:'';width:6px;height:6px;border-radius:50%;background:#1872B5;}
        .gal-title{
          font-family:'Sora',sans-serif;
          font-size:32px;font-weight:800;color:#0a214f;
          margin:0 0 10px;letter-spacing:-.02em;
        }
        .gal-subtitle{color:#6b7280;font-size:15px;font-weight:500;margin:0;}

        /* ── Tabs ── */
        .gal-tabs{
          display:flex;justify-content:center;gap:0;
          margin-bottom:40px;
          animation:fadeUp .6s .1s ease both;
          opacity:0;
        }
        .gal-tabs.show{opacity:1;}
        .gal-tab{
          display:flex;align-items:center;gap:10px;
          padding:13px 32px;
          font-size:14px;font-weight:700;
          cursor:pointer;border:none;outline:none;
          background:#fff;
          color:#6b7280;
          transition:all .25s;
          border:1.5px solid #e5e7eb;
          position:relative;
          user-select:none;
        }
        .gal-tab:first-child{border-radius:12px 0 0 12px;}
        .gal-tab:last-child{border-radius:0 12px 12px 0;border-left:none;}
        .gal-tab.active{
          background:linear-gradient(135deg,#1872B5,#2596e1);
          color:#fff;
          border-color:transparent;
          box-shadow:0 4px 20px rgba(24,114,181,.35);
          z-index:1;
        }
        .gal-tab:hover:not(.active){background:#f0f7ff;color:#1872B5;}
        .gal-tab-icon{font-size:18px;line-height:1;}
        .gal-tab-count{
          background:rgba(255,255,255,.25);
          color:inherit;
          font-size:11px;font-weight:800;
          padding:2px 8px;border-radius:20px;
        }
        .gal-tab:not(.active) .gal-tab-count{background:#f0f4f8;color:#9ca3af;}

        /* ── Grid ── */
        .gal-container{max-width:1400px;margin:0 auto;padding:0 24px;}
        .gal-grid{
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:16px;
        }
        @media(max-width:1100px){.gal-grid{grid-template-columns:repeat(3,1fr);}}
        @media(max-width:720px){.gal-grid{grid-template-columns:repeat(2,1fr);gap:10px;}}
        @media(max-width:480px){.gal-grid{grid-template-columns:1fr;}}

        /* ── Card ── */
        .gal-card{
          position:relative;
          border-radius:14px;
          overflow:hidden;
          background:#e5e7eb;
          cursor:pointer;
          aspect-ratio:4/3;
          box-shadow:0 2px 12px rgba(0,0,0,.08);
          transition:transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s;
        }
        .gal-card:hover{
          transform:translateY(-5px) scale(1.01);
          box-shadow:0 12px 40px rgba(24,114,181,.22);
        }
        .gal-card img,.gal-card video{
          width:100%;height:100%;
          object-fit:cover;
          display:block;
          transition:transform .4s ease;
        }
        .gal-card:hover img,.gal-card:hover video{transform:scale(1.06);}

        /* overlay */
        .gal-card-overlay{
          position:absolute;inset:0;
          background:linear-gradient(to top,rgba(10,33,79,.7) 0%,transparent 55%);
          opacity:0;
          transition:opacity .25s;
          display:flex;align-items:flex-end;
          padding:14px;
        }
        .gal-card:hover .gal-card-overlay{opacity:1;}
        .gal-card-title{
          color:#fff;font-size:13px;font-weight:700;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
          flex:1;
        }
        .gal-card-zoom{
          width:32px;height:32px;border-radius:50%;
          background:rgba(255,255,255,.25);
          backdrop-filter:blur(4px);
          display:flex;align-items:center;justify-content:center;
          color:#fff;font-size:16px;flex-shrink:0;margin-left:8px;
          transition:background .2s;
        }
        .gal-card:hover .gal-card-zoom{background:rgba(255,255,255,.4);}

        /* video play badge */
        .gal-play-badge{
          position:absolute;top:50%;left:50%;
          transform:translate(-50%,-50%);
          width:52px;height:52px;border-radius:50%;
          background:rgba(255,255,255,.88);
          display:flex;align-items:center;justify-content:center;
          font-size:20px;
          box-shadow:0 4px 20px rgba(0,0,0,.25);
          transition:transform .25s,background .25s;
          pointer-events:none;
        }
        .gal-card:hover .gal-play-badge{
          transform:translate(-50%,-50%) scale(1.12);
          background:#fff;
        }

        /* type badge */
        .gal-type-badge{
          position:absolute;top:10px;left:10px;
          background:rgba(10,33,79,.65);backdrop-filter:blur(6px);
          color:#fff;font-size:10px;font-weight:800;
          padding:3px 10px;border-radius:20px;
          text-transform:uppercase;letter-spacing:.06em;
        }

        /* ── Empty state ── */
        .gal-empty{
          grid-column:1/-1;
          text-align:center;
          padding:80px 20px;
          color:#9ca3af;
        }
        .gal-empty-icon{font-size:56px;margin-bottom:16px;opacity:.4;}
        .gal-empty-text{font-size:16px;font-weight:600;}

        /* ── Loading skeletons ── */
        .gal-skeleton{
          border-radius:14px;
          aspect-ratio:4/3;
          background:linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%);
          background-size:200% 100%;
          animation:shimmer 1.4s ease infinite;
        }

        /* ── Animate in ── */
        .gal-card-anim{
          opacity:0;
          animation:fadeUp .5s ease both;
        }

        /* ══════════════════════════════
           LIGHTBOX
        ══════════════════════════════ */
        .lb-overlay{
          position:fixed;inset:0;z-index:9999;
          background:rgba(0,0,0,.92);
          display:flex;align-items:center;justify-content:center;
          animation:fadeIn .2s ease;
          padding:20px;
        }
        .lb-inner{
          position:relative;
          max-width:1000px;width:100%;
          animation:scaleIn .25s ease;
        }
        .lb-media{
          width:100%;max-height:80vh;
          border-radius:12px;
          object-fit:contain;
          background:#000;
          display:block;
        }
        .lb-title{
          text-align:center;
          color:rgba(255,255,255,.75);
          font-size:14px;font-weight:600;
          margin-top:14px;
          font-family:'Nunito',sans-serif;
        }
        .lb-close{
          position:fixed;top:20px;right:24px;
          width:44px;height:44px;border-radius:50%;
          background:rgba(255,255,255,.15);
          border:none;cursor:pointer;
          color:#fff;font-size:20px;
          display:flex;align-items:center;justify-content:center;
          transition:background .2s;z-index:10000;
        }
        .lb-close:hover{background:rgba(255,255,255,.3);}
        .lb-nav{
          position:fixed;top:50%;transform:translateY(-50%);
          width:48px;height:48px;border-radius:50%;
          background:rgba(255,255,255,.15);
          border:none;cursor:pointer;
          color:#fff;font-size:22px;
          display:flex;align-items:center;justify-content:center;
          transition:background .2s;z-index:10000;
        }
        .lb-nav:hover{background:rgba(255,255,255,.3);}
        .lb-nav-prev{left:20px;}
        .lb-nav-next{right:20px;}
        .lb-counter{
          position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
          color:rgba(255,255,255,.5);font-size:13px;font-weight:700;
          font-family:'Nunito',sans-serif;z-index:10000;
        }
.gal-title {
    font-family: 'Sora',sans-serif;
    font-size: 32px;
    font-weight: 800;
    color: #0a214f;
    margin: 0 0 -18px;
    letter-spacing: -.02em;
}
        @media(max-width:768px){
          .gal-title{font-size:24px;}
          .gal-tab{padding:10px 20px;font-size:13px;}
          .lb-nav{display:none;}
        }
      `}</style>

      <div className="gal-wrap">
        <div className="gal-container">

          {/* Header */}
          <div className="gal-header">
            <div className="gal-tag">Our Gallery</div>
            <h2 className="gal-title">Explore Our Work</h2>
          </div>

          {/* Tabs */}
          <div className={`gal-tabs ${visible ? 'show' : ''}`}>
            <button
              className={`gal-tab ${activeTab === 'images' ? 'active' : ''}`}
              onClick={() => setActiveTab('images')}
            >
              <span className="gal-tab-icon">🖼️</span>
              {imgTitle}
              <span className="gal-tab-count">{images.length}</span>
            </button>
            <button
              className={`gal-tab ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              <span className="gal-tab-icon">🎬</span>
              {vidTitle}
              <span className="gal-tab-count">{videos.length}</span>
            </button>
          </div>

          {/* Grid */}
          <div className="gal-grid">
            {loading ? (
              // Skeletons
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="gal-skeleton" />
              ))
            ) : currentList.length === 0 ? (
              <div className="gal-empty">
                <div className="gal-empty-icon">{activeTab === 'images' ? '🖼️' : '🎬'}</div>
                <div className="gal-empty-text">No {activeTab} found</div>
              </div>
            ) : (
              currentList.map((item, i) => (
                <div
                  key={item.id}
                  className="gal-card gal-card-anim"
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => openLightbox(item, i)}
                >
                  {/* Type badge */}
                  <div className="gal-type-badge">
                    {item.type === 'image' ? '📸 Photo' : '🎬 Video'}
                  </div>

                  {/* Media */}
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.alt || item.title || ''}
                      loading="lazy"
                    />
                  ) : (
                    <>
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title || 'Video'} loading="lazy" />
                      ) : (
                        <video muted preload="metadata" playsInline>
                          <source src={item.url} />
                        </video>
                      )}
                      <div className="gal-play-badge">▶</div>
                    </>
                  )}

                  {/* Hover overlay */}
                  <div className="gal-card-overlay">
                    <span className="gal-card-title">{item.title || 'View'}</span>
                    <div className="gal-card-zoom">⤢</div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="lb-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setLightbox(null); }}
        >
          <button className="lb-close" onClick={() => setLightbox(null)}>✕</button>

          {currentList.length > 1 && (
            <>
              <button
                className="lb-nav lb-nav-prev"
                onClick={() => {
                  const prev = (lightbox.index - 1 + currentList.length) % currentList.length;
                  setLightbox({ ...currentList[prev], index: prev });
                }}
              >‹</button>
              <button
                className="lb-nav lb-nav-next"
                onClick={() => {
                  const next = (lightbox.index + 1) % currentList.length;
                  setLightbox({ ...currentList[next], index: next });
                }}
              >›</button>
            </>
          )}

          <div className="lb-inner">
            {lightbox.type === 'image' ? (
              <img
                src={lightbox.url}
                alt={lightbox.alt || lightbox.title || ''}
                className="lb-media"
              />
            ) : (
              <video
                src={lightbox.url}
                className="lb-media"
                controls
                autoPlay
                playsInline
              />
            )}
            {lightbox.title && (
              <div className="lb-title">{lightbox.title}</div>
            )}
          </div>

          {currentList.length > 1 && (
            <div className="lb-counter">
              {lightbox.index + 1} / {currentList.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}