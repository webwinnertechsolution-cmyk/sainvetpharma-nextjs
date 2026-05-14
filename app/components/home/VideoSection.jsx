'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const VideoSection = ({ sectionId }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const [section, setSection]           = useState(null);
  const [videoList, setVideoList]       = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile]         = useState(false);
  const [isDragging, setIsDragging]     = useState(false);
  const [startX, setStartX]             = useState(0);
  const [offset, setOffset]             = useState(0);
  const [playingId, setPlayingId]       = useState(null);
  const trackRef  = useRef(null);

  useEffect(() => {
    if (!sectionId) return;
    fetch(`${API_URL}/api/video-sections/${sectionId}/videos`)
      .then(r => r.json())
      .then(data => {
        if (data.section) setSection(data.section);
        if (data.videos)  setVideoList(data.videos);
      })
      .catch(err => console.error('Video fetch error:', err));
  }, [sectionId]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const GAP          = 14;
  const maxItems     = isMobile ? 1 : 5;
  const itemsVisible = Math.min(maxItems, videoList.length);
  const totalSlides  = Math.max(1, videoList.length - itemsVisible + 1);
  const showArrows   = videoList.length > itemsVisible;

  const getCardWidth = () => {
    const first = trackRef.current?.querySelector('.vs-card');
    return first ? first.offsetWidth + GAP : 0;
  };

  const onMouseDown  = (e) => { setIsDragging(true); setStartX(e.clientX); setOffset(0); };
  const onMouseMove  = (e) => { if (!isDragging) return; setOffset(e.clientX - startX); };
  const onMouseLeave = ()  => { if (isDragging) { setIsDragging(false); setOffset(0); } };
  const onMouseUp    = ()  => {
    if (!isDragging) return;
    setIsDragging(false);
    const slide = Math.round(-offset / getCardWidth());
    if (Math.abs(slide) > 0)
      setCurrentIndex(c => Math.max(0, Math.min(c + slide, totalSlides - 1)));
    setOffset(0);
  };
  const onTouchStart = (e) => { setIsDragging(true); setStartX(e.touches[0].clientX); setOffset(0); };
  const onTouchMove  = (e) => { if (!isDragging) return; setOffset(e.touches[0].clientX - startX); };
  const onTouchEnd   = ()  => {
    if (!isDragging) return;
    setIsDragging(false);
    const slide = Math.round(-offset / getCardWidth());
    if (Math.abs(slide) > 0)
      setCurrentIndex(c => Math.max(0, Math.min(c + slide, totalSlides - 1)));
    setOffset(0);
  };

  const step      = `calc((100% - ${(itemsVisible - 1) * GAP}px) / ${itemsVisible} + ${GAP}px)`;
  const base      = `calc(-${currentIndex} * ${step})`;
  const transform = isDragging ? `calc(${base} + ${offset}px)` : base;

  const videoUrl = (v) => {
    if (!v) return null;
    let c = v.startsWith('/') ? v.substring(1) : v;
    c = c.replace(/\.MOV$/i, '.mp4');
    return `${API_URL}/uploads/video-sections/${c}`;
  };

  const thumbUrl = (t) => {
    if (!t) return null;
    const c = t.startsWith('/') ? t.substring(1) : t;
    return `${API_URL}/uploads/video-sections/thumbnails/${c}`;
  };

  const handlePlay = (e, idx) => {
    e.stopPropagation();
    e.preventDefault();
    setPlayingId(idx);
  };

  // ✅ Video ruke ya khatam ho — play icon wapas aaye
  const handleVideoStop = (e) => {
    e.stopPropagation();
    setPlayingId(null);
  };

  if (!section || !section.is_active || videoList.length === 0) return null;

  return (
    <div className="vs-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@800&family=Nunito:wght@500;600;700;800&display=swap');
        *{box-sizing:border-box}
        .vs-wrap{padding:8px 0 10px}
        .vs-inner{max-width:1400px;margin:0 auto;padding:0 24px}
        .vs-header{display:flex;align-items:center;justify-content:center;margin:15px 0 22px;position:relative}
        .vs-header-left{text-align:center}
        .vs-header-left h2{font-size:27px;font-weight:800;color:#0a214f;font-family:'Sora',sans-serif;margin:0}
        .vs-header-left p{font-size:17px;color:#1872B5;margin:6px 0 0;font-family:'Nunito',sans-serif;font-weight:800}
        .vs-view-all{font-size:14px;font-weight:600;color:#374151;text-decoration:none;display:flex;align-items:center;gap:5px;position:absolute;right:0;transition:color .2s;font-family:'Nunito',sans-serif}
        .vs-view-all:hover{color:#1872B5}
        .vs-view-all:hover svg{transform:translateX(3px)}
        .vs-view-all svg{transition:transform .2s}
        .vs-slider-wrapper{position:relative;display:flex;align-items:center;user-select:none}
        .vs-overflow{overflow:hidden;flex:1;min-width:0;cursor:grab}
        .vs-overflow.drag{cursor:grabbing}
        .vs-track{display:flex;gap:${GAP}px;padding:10px 0 11px;transition:${isDragging?'none':'transform .6s cubic-bezier(.25,.46,.45,.94)'};will-change:transform;transform:translateX(${transform})}
        .vs-card{flex:0 0 calc((100% - ${(itemsVisible-1)*GAP}px) / ${itemsVisible});min-width:0;background:#0a214f;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.15);transition:transform .22s,box-shadow .22s}
        .vs-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(24,114,181,.25)}
        .vs-video-wrap{aspect-ratio:16/9;position:relative;background:#000;overflow:hidden}
        .vs-video-wrap video{width:100%;height:100%;object-fit:cover;display:block}
        .vs-thumb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#0a214f}
        .vs-thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
        .vs-overlay{position:absolute;inset:0;background:rgba(10,33,79,.3);z-index:1}
        .vs-play{position:relative;z-index:3;width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.3);transition:transform .2s,background .2s;cursor:pointer;border:none;outline:none}
        .vs-play:hover{transform:scale(1.12);background:#fff}
        .vs-play svg{width:22px;height:22px;fill:#1872B5;margin-left:3px;pointer-events:none}
        .vs-card-body{padding:10px 14px 14px}
        .vs-title{font-size:13px;font-weight:700;color:#fff;font-family:'Nunito',sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .vs-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.92);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .3s,box-shadow .3s;box-shadow:0 2px 12px rgba(0,0,0,.13);color:#333}
        .vs-slider-wrapper:hover .vs-arrow{opacity:1}
        .vs-arrow:hover:not(:disabled){background:#fff;box-shadow:0 4px 18px rgba(0,0,0,.18)}
        .vs-arrow:disabled{opacity:.4!important;cursor:not-allowed;pointer-events:none}
        .vs-arrow-prev{left:-22px}
        .vs-arrow-next{right:-22px}
        .vs-arrow svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
        .vs-gradient-bg{width:100%;height:100%;background:linear-gradient(135deg,#1872B5 0%,#0a214f 100%);display:flex;align-items:center;justify-content:center;font-size:48px}
       .vs-video-wrap {
    aspect-ratio: 16/26;
    position: relative;
    background: #000;
    overflow: hidden;
}
a.vs-view-all {
    display: none;
}
section.exclusive-offers-wrapper {
    margin-bottom: 36px;
}
.vs-wrap {
    padding: 8px 0 18px;
}

	   @media(max-width:767px){
          .vs-inner{padding:0 14px}
          .vs-arrow{opacity:1!important;width:36px;height:36px}
          .vs-arrow-prev{left:-8px}
          .vs-arrow-next{right:-8px}
          .vs-view-all{display:none}
          .vs-header-left h2{font-size:20px}
        }
      `}</style>

      <div className="vs-inner">
        <div className="vs-header">
          <div className="vs-header-left">
            <h2>{section.heading}</h2>
            {section.sub_heading && <p>{section.sub_heading}</p>}
          </div>
          {section.view_all_url && (
            <Link href={section.view_all_url} className="vs-view-all">
              {section.view_all_text || 'View All'}
              <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          )}
        </div>

        <div
          className="vs-slider-wrapper"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          {showArrows && (
            <button className="vs-arrow vs-arrow-prev" type="button"
              onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
              disabled={currentIndex === 0} aria-label="Previous">
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}

          <div className={`vs-overflow ${isDragging ? 'drag' : ''}`}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <div className="vs-track" ref={trackRef}>
              {videoList.map((vid, idx) => {
                const playing = playingId === idx;
                const vUrl    = videoUrl(vid.video);
                const tUrl    = thumbUrl(vid.thumbnail);

                return (
                  <div key={idx} className="vs-card">
                    <div className="vs-video-wrap">

                      {playing && vUrl ? (
                        <video
                          key={vUrl}
                          src={vUrl}
                          autoPlay
                          controls
                          playsInline
                          onClick={e => e.stopPropagation()}
                          // ✅ Pause karo → play icon wapas
                          onPause={handleVideoStop}
                          // ✅ Video khatam → play icon wapas
                          onEnded={handleVideoStop}
                          style={{ width:'100%', height:'100%', objectFit:'cover' }}
                          onError={(e) => console.error('Video error:', vUrl, e.target.error)}
                        />
                      ) : (
                        <div className="vs-thumb">
                          {tUrl ? (
                            <img src={tUrl} alt={vid.title || 'video'} />
                          ) : vUrl ? (
                            <video
                              src={vUrl}
                              preload="metadata"
                              muted
                              playsInline
                              style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
                              onLoadedMetadata={e => { e.target.currentTime = 1; }}
                            />
                          ) : (
                            <div className="vs-gradient-bg">🎬</div>
                          )}
                          <div className="vs-overlay" />
                          <button
                            className="vs-play"
                            type="button"
                            onClick={(e) => handlePlay(e, idx)}
                            aria-label="Play video"
                          >
                            <svg viewBox="0 0 24 24">
                              <polygon points="5,3 19,12 5,21" />
                            </svg>
                          </button>
                        </div>
                      )}

                    </div>
                    {vid.title && (
                      <div className="vs-card-body">
                        <div className="vs-title">{vid.title}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {showArrows && (
            <button className="vs-arrow vs-arrow-next" type="button"
              onClick={() => setCurrentIndex(c => Math.min(c + 1, totalSlides - 1))}
              disabled={currentIndex >= totalSlides - 1} aria-label="Next">
              <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoSection;