'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import VideoSection from '../components/home/VideoSection';

// ── API URLs (Empty - proxy will handle) ──
const API_URL = '';
const IMAGE_BASE_URL = '';

export default function AboutPage() {
  const [offering, setOffering] = useState(null);
  const [coreValuesMain, setCoreValuesMain] = useState(null);
  const [coreValues, setCoreValues] = useState([]);
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState({});

  // ── Fetch all data on mount ──
  useEffect(() => {
    Promise.all([
      fetch(`/api/offerings`, { credentials: 'omit' })
        .then(r => r.json())
        .catch(() => null),
      fetch(`/api/core-values-main`, { credentials: 'omit' })
        .then(r => r.json())
        .catch(() => null),
      fetch(`/api/core-values`, { credentials: 'omit' })
        .then(r => r.json())
        .catch(() => []),
      fetch(`/api/experience-the-power`, { credentials: 'omit' })
        .then(r => r.json())
        .catch(() => null),
    ]).then(([off, cvm, cv, exp]) => {
      setOffering(off);
      setCoreValuesMain(cvm);
      setCoreValues(Array.isArray(cv) ? cv : []);
      setExperience(exp);
      setLoading(false);
    });
  }, []);

  // ── Intersection Observer for scroll-reveal animations ──
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setVisibleSections(prev => ({
              ...prev,
              [e.target.dataset.section]: true
            }));
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('[data-section]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [loading]);

  // ── Icon/Image Renderer ──
  const renderIcon = (iconStr, heading) => {
    const imgExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];
    const isImg = imgExts.some(ext => iconStr?.toLowerCase().includes(ext));

    if (isImg) {
      return (
        <img
          src={`/uploads/corevalues/${iconStr}`}
          alt={heading}
          style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: '50%' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    }

    return (
      <i
        className={iconStr}
        style={{ fontSize: 34, color: '#fff' }}
      />
    );
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        flexDirection: 'column',
        gap: 16,
        fontFamily: 'Nunito, sans-serif'
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '4px solid #dbeafe',
          borderTopColor: '#1872B5',
          animation: 'spin .8s linear infinite'
        }} />
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: "'Nunito', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* ════════════════════════════════ ANIMATIONS ════════════════════════════════ */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes bannerReveal {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(36px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes cardPop {
          from {
            opacity: 0;
            transform: translateY(28px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* ════════════════════════════════ BANNER ════════════════════════════════ */
        .ab-banner {
          position: relative;
          height: 210px;
          background: linear-gradient(135deg, #0a214f 0%, #1872B5 55%, #2596e1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .ab-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E") repeat;
          animation: shimmer 8s linear infinite;
        }

        .ab-banner::after {
          content: '';
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,.08) 0%, transparent 70%);
          right: -80px;
          top: -80px;
        }

        .ab-banner-orb {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 70%);
          left: -60px;
          bottom: -60px;
        }

        .ab-banner-content {
          position: relative;
          z-index: 2;
          text-align: center;
          animation: bannerReveal 0.7s ease both;
        }

        .ab-banner-content h1 {
          font-family: 'Sora', sans-serif;
          font-size: 42px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 10px;
          letter-spacing: -0.02em;
          text-shadow: 0 2px 20px rgba(0,0,0,.25);
        }

        .ab-banner-content p {
          color: rgba(255,255,255,.7);
          font-size: 15px;
          font-weight: 600;
          margin: 0;
        }

        /* ════════════════════════════════ BREADCRUMB ════════════════════════════════ */
        .ab-bc-bar {
          background: #1872B5;
          padding: 10px 0;
        }

        .ab-bc {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          font-size: 13px;
          color: rgba(255,255,255,.75);
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }

        .ab-bc a {
          color: rgba(255,255,255,.75);
          text-decoration: none;
          transition: color 0.2s;
        }

        .ab-bc a:hover {
          color: #fff;
        }

        .ab-bc-sep {
          opacity: 0.5;
          margin: 0 2px;
        }

        .ab-bc-cur {
          color: #fff;
          font-weight: 700;
        }

        /* ════════════════════════════════ SECTIONS ════════════════════════════════ */
        .ab-section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 64px 40px;
        }

        .ab-section-sm {
          max-width: 1400px;
          margin: 0 auto;
          padding: 48px 24px;
        }

        /* ════════════════════════════════ OFFERING SECTION ════════════════════════════════ */
        .off-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .off-text-col.revealed {
          animation: fadeLeft 0.7s ease both;
        }

        .off-img-col.revealed {
          animation: fadeRight 0.7s ease both 0.15s;
        }

        .section-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          color: #1872B5;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 6px 16px;
          border-radius: 20px;
          border: 1px solid #bfdbfe;
          margin-bottom: 18px;
        }

        .section-tag::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1872B5;
          flex-shrink: 0;
        }

        .off-heading {
          font-family: 'Sora', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #0a214f;
          line-height: 1.3;
          margin-bottom: 8px;
        }

        .off-heading span {
          background: linear-gradient(135deg, #1872B5, #2596e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .off-desc {
          font-size: 15px;
          color: #4b5563;
          line-height: 1.85;
        }

        .off-desc p {
          margin-bottom: 14px;
        }

        .off-desc ul {
          padding-left: 20px;
        }

        .off-desc ul li {
          margin-bottom: 8px;
        }

        .off-img-wrap {
          position: relative;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 20px 56px rgba(24, 114, 181, .18);
        }

        .off-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 22px;
          transition: transform 0.6s ease;
          aspect-ratio: 4/3;
        }

        .off-img-wrap:hover img {
          transform: scale(1.04);
        }

        .off-img-deco {
          position: absolute;
          bottom: -20px;
          right: -20px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1872B5, #2596e1);
          opacity: 0.15;
          pointer-events: none;
        }

        .off-img-deco2 {
          position: absolute;
          top: -16px;
          left: -16px;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0a214f, #1872B5);
          opacity: 0.12;
          pointer-events: none;
        }

        /* ════════════════════════════════ STATS STRIP ════════════════════════════════ */
        .stats-strip {
          background: #fff;
          border-top: 1.5px solid #e5e7eb;
          border-bottom: 1.5px solid #e5e7eb;
          padding: 36px 0;
        }

        .stats-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 60px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-item.revealed {
          animation: fadeUp 0.6s ease both;
        }

        .stat-num {
          font-family: 'Sora', sans-serif;
          font-size: 38px;
          font-weight: 800;
          background: linear-gradient(135deg, #1872B5, #2596e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 13px;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ════════════════════════════════ CORE VALUES SECTION ════════════════════════════════ */
        .cv-section {
          background: linear-gradient(135deg, #d0edfb 0%, #d0edfb 50%, #d0edfb 100%);
          position: relative;
          overflow: hidden;
          padding: 72px 0;
        }

        .cv-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='1.5' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E") repeat;
        }

        .cv-orb1 {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 70%);
          top: -200px;
          right: -100px;
          pointer-events: none;
        }

        .cv-orb2 {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,.05) 0%, transparent 70%);
          bottom: -100px;
          left: -80px;
          pointer-events: none;
        }

        .cv-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 2;
        }

        .cv-heading-wrap {
          text-align: center;
          margin-bottom: 28px;
          margin-top: -19px;
        }

        .cv-heading-wrap.revealed {
          animation: fadeUp 0.7s ease both;
        }

        .cv-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,.12);
          color: rgba(255,255,255,.9);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 6px 16px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,.2);
          margin-bottom: 16px;
          backdrop-filter: blur(8px);
        }

        .cv-tag::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,.8);
          flex-shrink: 0;
        }

        .cv-main-heading {
          font-family: 'Sora', sans-serif;
          font-size: 29px;
          font-weight: 800;
          color: #0a214f;
          line-height: 1.25;
        }

        .cv-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .cv-card {
          background: rgba(255,255,255,.54);
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 20px;
          padding: 19px;
          text-align: center;
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
          cursor: default;
          opacity: 0;
        }

        .cv-card.revealed {
          animation: cardPop 0.55s ease both;
        }

        .cv-card:hover {
          background: rgba(255,255,255,.15);
          border-color: rgba(255,255,255,.3);
          transform: translateY(-8px);
          box-shadow: 0 24px 48px rgba(0,0,0,.25);
        }

        .cv-icon-wrap {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: none;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          transition: all 0.3s ease;
        }

        .cv-icon-wrap img {
          width: 88px;
          height: 88px;
          object-fit: cover;
          border-radius: 50%;
        }

        .cv-card:hover .cv-icon-wrap {
          transform: scale(1.1) rotate(6deg);
        }

        .cv-card-title {
          font-family: 'Sora', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #0a214f;
          line-height: 1.3;
        }

        .cv-card-line {
          width: 32px;
          height: 3px;
          background: linear-gradient(135deg, #1872B5, #2596e1);
          border-radius: 2px;
          margin: 12px auto 0;
          transition: width 0.3s ease;
        }

        .cv-card:hover .cv-card-line {
          width: 56px;
          background: rgba(24, 114, 181, 1);
        }

        /* ════════════════════════════════ EXPERIENCE SECTION ════════════════════════════════ */
        .exp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .exp-text-col.revealed {
          animation: fadeRight 0.7s ease both;
        }

        .exp-img-col.revealed {
          animation: fadeLeft 0.7s ease both 0.15s;
        }

        .exp-img-wrap {
          position: relative;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 20px 56px rgba(10, 33, 79, .14);
        }

        .exp-img-wrap img {
          width: 100%;
          object-fit: cover;
          display: block;
          border-radius: 22px;
          transition: transform 0.6s ease;
        }

        .exp-img-wrap:hover img {
          transform: scale(1.04);
        }

        .exp-img-accent {
          position: absolute;
          inset: 0;
          border-radius: 22px;
          background: linear-gradient(160deg, transparent 60%, rgba(24, 114, 181, .12));
          pointer-events: none;
        }

        .exp-ring {
          position: absolute;
          bottom: -24px;
          right: -24px;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 3px solid rgba(24, 114, 181, .18);
          pointer-events: none;
        }

        .exp-ring2 {
          position: absolute;
          bottom: -12px;
          right: -12px;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid rgba(24, 114, 181, .28);
          pointer-events: none;
        }

        .exp-heading {
          font-family: 'Sora', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #0a214f;
          line-height: 1.3;
          margin-bottom: 8px;
        }

        .exp-heading span {
          background: linear-gradient(135deg, #1872B5, #2596e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .exp-desc {
          font-size: 14.5px;
          color: #4b5563;
          line-height: 1.85;
        }

        .exp-desc p {
          margin-bottom: 14px;
        }

        .exp-desc ul {
          padding-left: 20px;
        }

        .exp-desc ul li {
          margin-bottom: 8px;
        }

        .exp-desc h2,
        .exp-desc h3 {
          color: #0a214f;
          font-family: 'Sora', sans-serif;
          margin: 16px 0 8px;
        }

        .exp-desc strong {
          color: #0a214f;
        }

        /* ════════════════════════════════ VIDEO SECTION ════════════════════════════════ */
        .videossss {
          margin-top: -21px;
          padding-bottom: 40px;
        }

.ab-banner-content h1 {
    font-family: 'Sora', sans-serif;
    font-size: 33px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 0px;
    letter-spacing: -0.02em;
    text-shadow: 0 2px 20px rgba(0,0,0,.25);
}
.ab-section {
    max-width: 1400px;
    margin: 0 auto;
    padding: 43px 40px;
}
.section-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    color: #1872B5;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 4px 10px;
    border-radius: 20px;
    border: 1px solid #bfdbfe;
    margin-bottom: 11px;
}
.off-heading {
    font-family: 'Sora', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: #0a214f;
    line-height: 1.3;
    margin-bottom: 6px;
}
.off-desc {
    font-size: 15px;
    color: #4b5563;
    line-height: 1.85;
}
.exp-heading {
    font-family: 'Sora', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: #0a214f;
    line-height: 1.3;
    margin-bottom: 6px;
}
.exp-desc p {
    margin-bottom: 14px;
    font-size: 14px;
    line-height: 20px;
}
        /* ════════════════════════════════ RESPONSIVE ════════════════════════════════ */
        @media (max-width: 1024px) {
          .cv-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats-inner {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .off-grid,
          .exp-grid {
            grid-template-columns: 1fr;
          }

          .exp-img-col {
            order: -1;
          }

          .off-heading,
          .exp-heading {
            font-size: 22px;
          }

          .cv-main-heading {
            font-size: 24px;
          }

          .ab-banner {
            height: 150px;
          }

          .ab-banner-content h1 {
            font-size: 28px !important;
          }

          .ab-section,
          .ab-section-sm {
            padding: 40px 16px;
          }

          .cv-section {
            padding: 50px 0;
          }

          .cv-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }

          .cv-card {
            padding: 26px 14px;
          }

          .stats-inner {
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            padding: 0 10px;
          }

          .stat-num {
            font-size: 28px;
          }

          .off-grid {
            gap: 10px;
          }

          .cv-inner {
            padding: 0 10px;
          }

          .exp-grid {
            gap: 37px;
          }

          .ab-banner {
            height: 121px;
          }

          .videossss {
            margin-top: -32px;
            padding-bottom: 21px;
          }
        }

        @media (max-width: 767px) {
          .cv-grid {
            grid-template-columns: 1fr;
          }

          .stats-inner {
            grid-template-columns: 1fr;
          }

          .ab-section {
            padding: 40px 16px;
          }
          .ab-banner-content h1 {
    font-size: 18px !important;
}
.ab-banner-content p {
    color: rgba(255,255,255,.7);
    font-size: 12px;
    font-weight: 600;
    margin: 0;
}
.ab-section {
    padding: 26px 16px;
}
.section-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    color: #1872B5;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 3px 5px;
    border-radius: 20px;
    border: 1px solid #bfdbfe;
    margin-bottom: 8px;
}
.off-heading, .exp-heading {
    font-size: 16px;
}
.off-heading {
    font-family: 'Sora', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: #0a214f;
    line-height: 1.3;
    margin-bottom: 4px;
}
.off-desc p {
    margin-bottom: 14px;
    font-size: 14px;
    line-height: 20px;
}
.stats-inner {
    grid-template-columns: 1fr 1fr;
}
.stat-num {
    font-size: 20px;
}
.stat-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}
.exp-grid {
    gap: 20px;
}
        }
      `}</style>

      {/* ══════════════════════════════════════ BANNER ══════════════════════════════════════ */}
      <div className="ab-banner">
        <div className="ab-banner-orb" />
        <div className="ab-banner-content">
          <h1>About Us</h1>
          <p>Innovation • Sustainability • Excellence</p>
        </div>
      </div>

      {/* ══════════════════════════════════════ BREADCRUMB ══════════════════════════════════════ */}
      <div className="ab-bc-bar">
        <nav className="ab-bc">
          <Link href="/">Home</Link>
          <span className="ab-bc-sep">›</span>
          <span className="ab-bc-cur">About Us</span>
        </nav>
      </div>

      {/* ══════════════════════════════════════ OFFERING SECTION ══════════════════════════════════════ */}
      {offering && (
        <div className="ab-section">
          <div className="off-grid" data-section="offering">
            {/* Text Column */}
            <div className={`off-text-col ${visibleSections.offering ? 'revealed' : ''}`}>
              <div className="section-tag">Our Mission</div>
              <div
                className="off-heading"
                dangerouslySetInnerHTML={{ __html: offering.heading || '' }}
              />
              <div
                className="off-desc"
                dangerouslySetInnerHTML={{ __html: offering.description || '' }}
              />
            </div>

            {/* Image Column */}
            <div className={`off-img-col ${visibleSections.offering ? 'revealed' : ''}`}>
              {offering.image ? (
                <div className="off-img-wrap">
                  <img
                    src={`/uploads/offering/${offering.image}`}
                    alt={offering.alt_tag || 'Offering'}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div
                    style={{
                      display: 'none',
                      aspectRatio: '4/3',
                      background: '#e5e7eb',
                      borderRadius: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 60,
                      color: '#d1d5db'
                    }}
                  >
                    🏭
                  </div>
                  <div className="off-img-deco" />
                  <div className="off-img-deco2" />
                </div>
              ) : (
                <div
                  style={{
                    aspectRatio: '4/3',
                    background: '#e5e7eb',
                    borderRadius: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 60,
                    color: '#d1d5db'
                  }}
                >
                  🏭
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ STATS STRIP ══════════════════════════════════════ */}
      <div className="stats-strip">
        <div className="stats-inner" data-section="stats">
          {[
            { num: '10+', label: 'Years of Experience' },
            { num: '500+', label: 'Projects Delivered' },
            { num: '50+', label: 'Expert Team Members' },
            { num: '99%', label: 'Client Satisfaction' },
          ].map((s, i) => (
            <div
              key={i}
              className={`stat-item ${visibleSections.stats ? 'revealed' : ''}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════ CORE VALUES SECTION ══════════════════════════════════════ */}
      {(coreValuesMain || coreValues.length > 0) && (
        <div className="cv-section">
          <div className="cv-orb1" />
          <div className="cv-orb2" />
          <div className="cv-inner">
            {/* Heading */}
            <div className={`cv-heading-wrap ${visibleSections.corevalues ? 'revealed' : ''}`} data-section="corevalues">
              {coreValuesMain?.heading1 && (
                <h2 className="cv-main-heading">Meet our Team</h2>
              )}
            </div>

            {/* Grid */}
            {coreValues.length > 0 && (
              <div className="cv-grid">
                {coreValues.map((cv, i) => (
                  <div
                    key={cv.id}
                    className={`cv-card ${visibleSections.corevalues ? 'revealed' : ''}`}
                    style={{ animationDelay: `${0.1 + i * 0.08}s` }}
                  >
                    <div className="cv-icon-wrap">
                      {cv.image ? (
                        <img
                          src={`/uploads/corevalues/${cv.image}`}
                          alt={cv.heading}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 36 }}>⭐</span>
                      )}
                    </div>
                    <div className="cv-card-title">{cv.heading}</div>
                    <div className="cv-card-line" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ EXPERIENCE THE POWER SECTION ══════════════════════════════════════ */}
      {experience && (
        <div className="ab-section">
          <div className="exp-grid" data-section="experience">
            {/* Text Column */}
            <div className={`exp-text-col ${visibleSections.experience ? 'revealed' : ''}`}>
              {experience.sub_heading && (
                <div className="section-tag">{experience.sub_heading}</div>
              )}
              <div
                className="exp-heading"
                dangerouslySetInnerHTML={{ __html: experience.heading || '' }}
              />
              <div
                className="exp-desc"
                dangerouslySetInnerHTML={{ __html: experience.description || '' }}
              />
            </div>

            {/* Image Column */}
            <div className={`exp-img-col ${visibleSections.experience ? 'revealed' : ''}`}>
              {experience.image ? (
                <div className="exp-img-wrap">
                  <img
                    src={`/uploads/experience-the-power/${experience.image}`}
                    alt={experience.alt_tag || 'Experience the Power'}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="exp-img-accent" />
                  <div className="exp-ring" />
                  <div className="exp-ring2" />
                </div>
              ) : (
                <div
                  style={{
                    aspectRatio: '3/4',
                    background: '#e5e7eb',
                    borderRadius: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 60,
                    color: '#d1d5db'
                  }}
                >
                  🔬
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════ VIDEO SECTION ══════════════════════════════════════ */}
      <div className="videossss">
        <VideoSection sectionId={1} />
      </div>
    </div>
  );
}
