'use client';
 
import { useEffect, useRef, useState } from 'react';
 
const API_URL = process.env.NEXT_PUBLIC_API_URL;
 
export default function Slider({ sliders }) {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const total = sliders?.length || 0;
 
  const goTo = (index) => {
    setCurrent((index + total) % total);
  };
 
  useEffect(() => {
    if (total <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [total]);
 
  if (!sliders || sliders.length === 0) return null;
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Nunito:wght@400;500;600&display=swap');
 
        .rl-slider-section {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #f5f0eb;
        }
        .rl-slider {
          position: relative;
          width: 100%;
          height: 580px;
        }
        .rl-slide-item {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 0.9s ease;
          pointer-events: none;
        }
        .rl-slide-item.active {
          opacity: 1;
          pointer-events: all;
        }
        .rl-slide-bg {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .rl-bg-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .byron-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          height: 100%;
          display: flex;
          align-items: center;
          position: relative;
          z-index: 2;
        }
        .rl-slide-content {
          max-width: 520px;
        }
        .rl-slide-sub-title {
          color: #444;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-family: 'Nunito', sans-serif;
        }
        .rl-slide-title {
          color: #1a2e44;
          font-size: 52px;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 24px;
          font-family: 'Sora', sans-serif;
        }
        .rl-slide-desc {
          color: #555;
          font-size: 16px;
          line-height: 1.7;
          margin-bottom: 36px;
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
        }
        .rl-slide-desc p { margin: 0; }
        .rl-slide-btn-wrapper {
          display: flex;
          align-items: center;
        }
        .rl-slide-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: #1872B5;
    color: #fff !important;
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 600;
    padding: 14px 28px;
    border-radius: 50px;
    text-decoration: none;
    transition: all 0.3s ease;
    border: 2px solid #1872B5;
}
        .rl-slide-btn:hover {
          background: #1872B5;
          border-color: #1872B5;
          color: #fff !important;
        }
        .rl-slide-btn .btn-arrow {
          width: 30px;
          height: 30px;
          background: rgba(255,255,255,0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
        }
        .rl-slide-btn:hover .btn-arrow {
          background: rgba(255,255,255,0.4);
        }
 
        /* Arrows - white circle, show on hover */
        .rl-slider-section .rl-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.9);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s ease, background 0.3s ease, box-shadow 0.3s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12);
        }
        .rl-slider-section:hover .rl-arrow { opacity: 1; }
        .rl-arrow:hover {
          background: #fff !important;
          box-shadow: 0 4px 18px rgba(0,0,0,0.18);
        }
        .rl-arrow-prev { left: 20px; }
        .rl-arrow-next { right: 20px; }
        .rl-arrow svg {
          width: 18px; height: 18px;
          fill: none;
          stroke: #333;
          stroke-width: 2.5;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
 
        /* Dots */
        .rl-dots {
          position: absolute;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 7px;
          z-index: 10;
        }
        .rl-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: rgba(0,0,0,0.2);
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          padding: 0;
        }
        .rl-dot.active {
          background: #f07c2a;
          width: 24px;
          border-radius: 4px;
        }
 
        /* Animate */
        .rl-slide-item.active .rl-slide-sub-title { animation: fadeUp 0.6s ease forwards; }
        .rl-slide-item.active .rl-slide-title { animation: fadeUp 0.6s ease 0.1s forwards; opacity: 0; }
        .rl-slide-item.active .rl-slide-desc { animation: fadeUp 0.6s ease 0.2s forwards; opacity: 0; }
        .rl-slide-item.active .rl-slide-btn-wrapper { animation: fadeUp 0.6s ease 0.3s forwards; opacity: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
 .rl-slide-btn .btn-arrow {
    width: 30px;
    height: 30px;
    background: rgb(255 255 255 / 85%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s;
}
.rl-slider {
    position: relative;
    width: 100%;
    height: 85vh;
}
.rl-dot.active {
    background: #1872B5;
    width: 24px;
    border-radius: 4px;
} 

 @media (max-width: 767px) {
          .rl-slider { height: 280px; }
          .rl-slide-title { font-size: 24px; }
          .rl-slide-sub-title { font-size: 11px; }
          .rl-slide-desc { display: none; }
          .rl-slide-btn { font-size: 13px; padding: 10px 20px; }
          .rl-arrow { opacity: 1 !important; width: 36px; height: 36px; }
          .byron-container { padding: 0 16px; }
          .rl-slider-section .rl-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 32px!important;
    height: 32px!important;
    background: rgba(255,255,255,0.9);
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s ease, background 0.3s ease, box-shadow 0.3s;
    box-shadow: 0 2px 12px rgba(0,0,0,0.12);
}
        }
        @media (max-width: 1024px) and (min-width: 768px) {
          .rl-slider { height: 420px; }
          .rl-slide-title { font-size: 36px; }
        }
      `}</style>
 
      <section className="rl-slider-section" aria-label="Hero Slider">
        <div className="rl-slider">
          {sliders.map((slider, i) => {
            const isVideo = (slider.slide_type || 'image') === 'video' && slider.video;
            const bgUrl = `/uploads/slider/${slider.image}`;
            const videoUrl = `/uploads/slider/videos/${slider.video}`;
 
            return (
              <div
                key={slider.id}
                className={`rl-slide-item${i === current ? ' active' : ''}`}
                aria-hidden={i !== current}
              >
                {isVideo ? (
                  <div className="rl-slide-bg">
                    <video autoPlay loop muted playsInline className="rl-bg-video">
                      <source src={videoUrl} type="video/mp4" />
                    </video>
                  </div>
                ) : (
                  <div
                    className="rl-slide-bg"
                    style={{ backgroundImage: `url('${bgUrl}')` }}
                    role="img"
                    aria-label={slider.alt_tag || slider.heading || 'Slide image'}
                  />
                )}
 
                <div className="byron-container">
                  <div className="rl-slide-content">
                    {slider.sub_heading && <p className="rl-slide-sub-title">{slider.sub_heading}</p>}
                    {slider.heading && (
                      <h1 className="rl-slide-title" dangerouslySetInnerHTML={{ __html: slider.heading }} />
                    )}
                    {slider.description && (
                      <div className="rl-slide-desc" dangerouslySetInnerHTML={{ __html: slider.description }} />
                    )}
                    {slider.button_url && (
                      <div className="rl-slide-btn-wrapper">
                        <a href={slider.button_url} className="rl-slide-btn" aria-label={slider.button_text || 'Shop Now'}>
                          {slider.button_text || 'Shop Now'}
                          <span className="btn-arrow" aria-hidden="true">
                            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
 
          <button className="rl-arrow rl-arrow-prev" onClick={() => goTo(current - 1)} aria-label="Previous slide">
            <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button className="rl-arrow rl-arrow-next" onClick={() => goTo(current + 1)} aria-label="Next slide">
            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
 
          {total > 1 && (
            <div className="rl-dots" role="tablist" aria-label="Slide indicators">
              {sliders.map((_, i) => (
                <button
                  key={i}
                  className={`rl-dot${i === current ? ' active' : ''}`}
                  onClick={() => goTo(i)}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
