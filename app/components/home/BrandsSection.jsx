'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const BrandsSection = ({ section = null, brands = [] }) => {
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost/sainivetpharma/public').replace(/\/$/, '');

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const getImageUrl = (name) =>
    name ? `${API_URL}/uploads/brands/${name}` : null;

  if (!brands || brands.length === 0) return null;

  // Duplicate brands for seamless infinite loop
  const loopBrands = [...brands, ...brands];

  return (
    <div className="br-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Nunito:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        .br-wrap {
          padding: 40px 0;
          background: #1872b514;
        }

        .br-inner {
    max-width: 100%;
    margin: 0 auto;
    padding: 0px;
}

        .br-header {
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
        }
        .br-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #0a214f;
          font-family: 'Sora', sans-serif;
          margin: 0;
        }

        .br-slider-wrapper {
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .br-track {
          display: flex;
          gap: 12px;
          width: max-content;
          animation: br-scroll 30s linear infinite;
        }

        .br-slider-wrapper:hover .br-track {
          animation-play-state: paused;
        }

        @keyframes br-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .br-card {
          flex: 0 0 150px;
          height: 80px;
          display: flex; align-items: center; justify-content: center;
          transition: transform .22s ease;
          text-decoration: none; cursor: pointer;
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
  .br-header h2{
  font-size:27px;
  }
  .br-header{
  font-size: 17px;
    color: #1872B5;
    margin: 6px 0 0;
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
    margin-top: 18px;
    margin-bottom: -19px;
        }
        @media (max-width: 767px) {
          .br-wrap { padding: 20px 0; }
          .br-inner { padding: 0 10px; }
          .br-header { margin-bottom: 12px; }
          .br-header h2 { font-size: 18px; }

          .br-card {
            flex: 0 0 110px;
            height: 60px;
          }
          .br-card img {
            max-height: 60px;
            width: 110px;
            height: 60px;
          }

          .br-track {
            animation-duration: 20s;
          }
        }
      `}</style>

      <div className="br-inner">
        <div className="br-header">
          <h2>{section?.heading || 'Our Brands'}</h2>
          <P>~ Trusted by leading brands and businesses ~</P>
        </div>

        <div className="br-slider-wrapper">
          <div className="br-track">
            {loopBrands.map((brand, idx) => {
              const imgSrc = getImageUrl(brand.image);
              const CardTag = brand.url ? 'a' : 'div';
              const cardProps = brand.url
                ? { href: brand.url, target: '_blank', rel: 'noopener noreferrer' }
                : {};

              return (
                <CardTag
                  key={`${brand.id}-${idx}`}
                  className="br-card"
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
      </div>
    </div>
  );
};

export default BrandsSection;
