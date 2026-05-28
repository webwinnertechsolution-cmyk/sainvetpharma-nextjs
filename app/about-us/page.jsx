'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import VideoSection from '../components/home/VideoSection';

const API_URL = '';

// ── Fallback/Mock Data ──
const FALLBACK_DATA = {
  offering: {
    heading: 'Our <span>Mission</span>',
    description: '<p>We are committed to delivering innovative solutions that transform businesses and create lasting value.</p><p>With a focus on quality and customer satisfaction, we strive to be the industry leader.</p>',
    image: null,
    alt_tag: 'Our Mission'
  },
  coreValues: [
    { id: 1, heading: 'Innovation', image: null },
    { id: 2, heading: 'Integrity', image: null },
    { id: 3, heading: 'Excellence', image: null },
    { id: 4, heading: 'Collaboration', image: null },
  ],
  experience: {
    heading: 'Experience the <span>Power</span>',
    description: '<p>Discover how our cutting-edge solutions can revolutionize your business operations.</p><p>From implementation to support, we ensure your success every step of the way.</p>',
    sub_heading: 'Why Choose Us',
    image: null,
    alt_tag: 'Experience the Power'
  }
};

export default function AboutPage() {
  const [offering, setOffering] = useState(FALLBACK_DATA.offering);
  const [coreValues, setCoreValues] = useState(FALLBACK_DATA.coreValues);
  const [experience, setExperience] = useState(FALLBACK_DATA.experience);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState({});
  const [visibleSections, setVisibleSections] = useState({});

  // ── Fetch all data on mount ──
  useEffect(() => {
    const fetchAllData = async () => {
      const status = {};

      // Fetch offerings
      try {
        console.log('📍 [1/3] Fetching /api/offerings...');
        const offRes = await fetch(`/api/offerings`, { credentials: 'omit' });
        console.log('Status:', offRes.status);
        if (offRes.ok) {
          const offData = await offRes.json();
          console.log('✅ Offerings data received:', offData);
          setOffering(offData || FALLBACK_DATA.offering);
          status.offerings = { ok: true, status: 200 };
        } else {
          console.warn('⚠️ Offerings API returned', offRes.status);
          status.offerings = { ok: false, status: offRes.status, using: 'fallback' };
        }
      } catch (err) {
        console.error('❌ Offerings Error:', err.message);
        status.offerings = { ok: false, error: err.message, using: 'fallback' };
      }

      // Fetch core values
      try {
        console.log('📍 [2/3] Fetching /api/core-values...');
        const cvRes = await fetch(`/api/core-values`, { credentials: 'omit' });
        console.log('Status:', cvRes.status);
        if (cvRes.ok) {
          const cvData = await cvRes.json();
          console.log('✅ Core Values data received:', cvData);
          if (Array.isArray(cvData) && cvData.length > 0) {
            setCoreValues(cvData);
            status.coreValues = { ok: true, status: 200, count: cvData.length };
          } else {
            console.warn('⚠️ Core Values returned empty array');
            status.coreValues = { ok: false, empty: true, using: 'fallback' };
          }
        } else {
          console.warn('⚠️ Core Values API returned', cvRes.status);
          status.coreValues = { ok: false, status: cvRes.status, using: 'fallback' };
        }
      } catch (err) {
        console.error('❌ Core Values Error:', err.message);
        status.coreValues = { ok: false, error: err.message, using: 'fallback' };
      }

      // Fetch experience
      try {
        console.log('📍 [3/3] Fetching /api/experience-the-power...');
        const expRes = await fetch(`/api/experience-the-power`, { credentials: 'omit' });
        console.log('Status:', expRes.status);
        if (expRes.ok) {
          const expData = await expRes.json();
          console.log('✅ Experience data received:', expData);
          setExperience(expData || FALLBACK_DATA.experience);
          status.experience = { ok: true, status: 200 };
        } else {
          console.warn('⚠️ Experience API returned', expRes.status);
          status.experience = { ok: false, status: expRes.status, using: 'fallback' };
        }
      } catch (err) {
        console.error('❌ Experience Error:', err.message);
        status.experience = { ok: false, error: err.message, using: 'fallback' };
      }

      console.log('\n========== FINAL API STATUS ==========');
      console.log(JSON.stringify(status, null, 2));
      setApiStatus(status);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  // ── Intersection Observer ──
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
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bannerReveal { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(36px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes cardPop { from { opacity: 0; transform: translateY(28px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

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
        }

        .ab-bc a {
          color: rgba(255,255,255,.75);
          text-decoration: none;
        }

        .ab-section {
          max-width: 1400px;
          margin: 0 auto;
          padding: 43px 40px;
        }

        .off-grid, .exp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .off-text-col.revealed, .exp-text-col.revealed { animation: fadeLeft 0.7s ease both; }
        .off-img-col.revealed, .exp-img-col.revealed { animation: fadeRight 0.7s ease both 0.15s; }

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

        .off-heading, .exp-heading {
          font-family: 'Sora', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #0a214f;
          line-height: 1.3;
          margin-bottom: 6px;
        }

        .off-desc, .exp-desc {
          font-size: 14px;
          color: #4b5563;
          line-height: 1.85;
        }

        .off-desc p, .exp-desc p {
          margin-bottom: 14px;
        }

        .off-img-wrap, .exp-img-wrap {
          position: relative;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 20px 56px rgba(24, 114, 181, .18);
        }

        .off-img-wrap img, .exp-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 22px;
          transition: transform 0.6s ease;
          aspect-ratio: 4/3;
        }

        .off-img-wrap:hover img, .exp-img-wrap:hover img { transform: scale(1.04); }

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

        .stat-item { text-align: center; }
        .stat-item.revealed { animation: fadeUp 0.6s ease both; }

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

        .cv-section {
          background: linear-gradient(135deg, #d0edfb 0%, #d0edfb 50%, #d0edfb 100%);
          position: relative;
          overflow: hidden;
          padding: 72px 0;
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

        .cv-heading-wrap { text-align: center; margin-bottom: 28px; }
        .cv-heading-wrap.revealed { animation: fadeUp 0.7s ease both; }

        .cv-main-heading {
          font-family: 'Sora', sans-serif;
          font-size: 29px;
          font-weight: 800;
          color: #0a214f;
          line-height: 1.25;
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

        .cv-card.revealed { animation: cardPop 0.55s ease both; }

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

        .cv-card:hover .cv-icon-wrap { transform: scale(1.1) rotate(6deg); }

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

        .videossss { margin-top: -21px; padding-bottom: 40px; }

        @media (max-width: 768px) {
          .off-grid, .exp-grid { grid-template-columns: 1fr; gap: 10px; }
          .exp-img-col { order: -1; }
          .ab-section { padding: 26px 16px; }
          .cv-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .stats-inner { grid-template-columns: 1fr 1fr; padding: 0 10px; }
          .stat-num { font-size: 28px; }
          .cv-section { padding: 50px 0; }
          .ab-banner-content h1 { font-size: 28px !important; }
        }

        @media (max-width: 480px) {
          .cv-grid { grid-template-columns: 1fr; }
          .stats-inner { grid-template-columns: 1fr; }
          .ab-banner-content h1 { font-size: 18px !important; }
          .off-heading, .exp-heading { font-size: 16px; }
          .stat-num { font-size: 20px; }
        }
      `}</style>

      {/* BANNER */}
      <div className="ab-banner">
        <div className="ab-banner-orb" />
        <div className="ab-banner-content">
          <h1>About Us</h1>
          <p>Innovation • Sustainability • Excellence</p>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="ab-bc-bar">
        <nav className="ab-bc">
          <Link href="/">Home</Link> › <span>About Us</span>
        </nav>
      </div>

      {/* OFFERING SECTION */}
      {offering && (
        <div className="ab-section">
          <div className="off-grid" data-section="offering">
            <div className={`off-text-col ${visibleSections.offering ? 'revealed' : ''}`}>
              <div className="section-tag">Our Mission</div>
              <div className="off-heading" dangerouslySetInnerHTML={{ __html: offering.heading || '' }} />
              <div className="off-desc" dangerouslySetInnerHTML={{ __html: offering.description || '' }} />
            </div>
            <div className={`off-img-col ${visibleSections.offering ? 'revealed' : ''}`}>
              {offering.image ? (
                <div className="off-img-wrap">
                  <img src={`/uploads/offering/${offering.image}`} alt="Offering" />
                </div>
              ) : (
                <div style={{ aspectRatio: '4/3', background: '#e5e7eb', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🏭</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STATS STRIP */}
      <div className="stats-strip">
        <div className="stats-inner" data-section="stats">
          {[
            { num: '10+', label: 'Years of Experience' },
            { num: '500+', label: 'Projects Delivered' },
            { num: '50+', label: 'Expert Team Members' },
            { num: '99%', label: 'Client Satisfaction' },
          ].map((s, i) => (
            <div key={i} className={`stat-item ${visibleSections.stats ? 'revealed' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CORE VALUES SECTION */}
      {coreValues.length > 0 && (
        <div className="cv-section">
          <div className="cv-orb1" />
          <div className="cv-orb2" />
          <div className="cv-inner">
            <div className={`cv-heading-wrap ${visibleSections.corevalues ? 'revealed' : ''}`} data-section="corevalues">
              <div className="cv-tag">TEAM</div>
              <h2 className="cv-main-heading">Meet Our Team</h2>
            </div>
            <div className="cv-grid">
              {coreValues.map((cv, i) => (
                <div key={cv.id} className={`cv-card ${visibleSections.corevalues ? 'revealed' : ''}`} style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                  <div className="cv-icon-wrap">
                    {cv.image ? (
                      <img src={`/uploads/corevalues/${cv.image}`} alt={cv.heading} onError={(e) => e.target.style.display = 'none'} />
                    ) : (
                      <span style={{ fontSize: 36 }}>⭐</span>
                    )}
                  </div>
                  <div className="cv-card-title">{cv.heading}</div>
                  <div className="cv-card-line" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EXPERIENCE SECTION */}
      {experience && (
        <div className="ab-section">
          <div className="exp-grid" data-section="experience">
            <div className={`exp-text-col ${visibleSections.experience ? 'revealed' : ''}`}>
              {experience.sub_heading && <div className="section-tag">{experience.sub_heading}</div>}
              <div className="exp-heading" dangerouslySetInnerHTML={{ __html: experience.heading || '' }} />
              <div className="exp-desc" dangerouslySetInnerHTML={{ __html: experience.description || '' }} />
            </div>
            <div className={`exp-img-col ${visibleSections.experience ? 'revealed' : ''}`}>
              {experience.image ? (
                <div className="exp-img-wrap">
                  <img src={`/uploads/experience-the-power/${experience.image}`} alt="Experience" onError={(e) => e.target.style.display = 'none'} />
                </div>
              ) : (
                <div style={{ aspectRatio: '3/4', background: '#e5e7eb', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🔬</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIDEO SECTION */}
      <div className="videossss">
        <VideoSection sectionId={1} />
      </div>
    </div>
  );
}
