'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function ReturnRefundPolicyPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // ✅ Debug: API URL check
    console.log('API_URL:', API_URL);
    console.log('Full URL:', `${API_URL}/api/return-refund-policy`);

    fetch(`${API_URL}/api/return-refund-policy`)
      .then(r => {
        console.log('Response status:', r.status);
        if (!r.ok) throw new Error(`API Error: ${r.status}`);
        return r.json();
      })
      .then(data => {
        console.log('Data received:', data);
        setPage(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching return & refund policy:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) setVisible(true);
      },
      { threshold: 0.08 }
    );
    const el = document.querySelector('[data-section="content"]');
    if (el) obs.observe(el);
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
        fontFamily: 'Nunito,sans-serif'
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '4px solid #dbeafe',
          borderTopColor: '#1872B5',
          animation: 'spin .8s linear infinite'
        }} />
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading return &amp; refund policy...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Error State ──
  if (error || !page) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        fontFamily: 'Nunito,sans-serif',
        flexDirection: 'column',
        gap: 16,
        padding: '24px'
      }}>
        <div style={{ fontSize: 64 }}>⚠️</div>
        <p style={{ color: '#9ca3af', fontSize: 16, marginBottom: 8 }}>
          {error ? `Error: ${error}` : '404 — Return & Refund Policy not found'}
        </p>
        <Link href="/" style={{
          marginTop: 12,
          background: '#1872B5',
          color: '#fff',
          padding: '12px 28px',
          borderRadius: 30,
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: 14
        }}>
          ← Back to Home
        </Link>
      </div>
    );
  }

  const lastUpdated = page?.updated_at
    ? new Date(page.updated_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
      })
    : null;

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: "'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{width:100%;overflow-x:hidden;}

        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bannerReveal{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}

        /* ── Banner ── */
        .rrp-banner{
          position:relative;height:210px;
          background:linear-gradient(135deg,#0a214f 0%,#1872B5 55%,#2596e1 100%);
          display:flex;align-items:center;justify-content:center;overflow:hidden;
        }
        .rrp-banner::before{
          content:'';position:absolute;inset:0;
          background:url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E") repeat;
          animation:shimmer 8s linear infinite;
        }
        .rrp-banner__orb{
          position:absolute;width:200px;height:200px;border-radius:50%;
          background:radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 70%);
          left:-60px;bottom:-60px;
        }
        .rrp-banner__orb-2{
          position:absolute;width:160px;height:160px;border-radius:50%;
          background:radial-gradient(circle,rgba(255,255,255,.05) 0%,transparent 70%);
          right:-40px;top:-40px;
        }
        .rrp-banner__content{position:relative;z-index:2;text-align:center;animation:bannerReveal .7s ease both;}
        .rrp-banner__title{
          font-family:'Sora',sans-serif;font-size:34px;font-weight:800;
          color:#fff;margin:0 0 0px;letter-spacing:-0.02em;
          text-shadow:0 2px 20px rgba(0,0,0,.25);
        }
        .rrp-banner__subtitle{color:rgba(255,255,255,.7);font-size:15px;font-weight:600;margin:0;}

        /* ── Breadcrumb ── */
        .rrp-breadcrumb{background:#1872B5;padding:10px 0;}
        .rrp-breadcrumb__nav{
          max-width:1400px;margin:0 auto;padding:0 24px;
          font-size:13px;color:rgba(255,255,255,.75);
          display:flex;align-items:center;gap:4px;flex-wrap:wrap;
        }
        .rrp-breadcrumb__link{color:rgba(255,255,255,.75);text-decoration:none;transition:color .2s;}
        .rrp-breadcrumb__link:hover{color:#fff;}
        .rrp-breadcrumb__separator{opacity:.5;margin:0 2px;}
        .rrp-breadcrumb__current{color:#fff;font-weight:700;}

        /* ── Section Tag ── */
        .rrp-section-tag{
          display:inline-flex;align-items:center;gap:8px;
          background:linear-gradient(135deg,#eff6ff,#dbeafe);
          color:#1872B5;font-size:9px;font-weight:800;
          text-transform:uppercase;letter-spacing:.1em;
          padding:6px 16px;border-radius:20px;
          border:1px solid #bfdbfe;margin-bottom:12px;
        }
        .rrp-section-tag::before{content:'';width:6px;height:6px;border-radius:50%;background:#1872B5;flex-shrink:0;}

        /* ── Main Content ── */
        .rrp-section{max-width:1400px;margin:0 auto;padding:48px 24px 60px;}
        .rrp-header{margin-bottom:32px;}
        .rrp-title{
          font-family:'Sora',sans-serif;font-size:20px;font-weight:800;
          color:#0a214f;line-height:1.3;margin-bottom:7px;
        }
        .rrp-divider{width:40px;height:3px;background:linear-gradient(135deg,#1872B5,#2596e1);border-radius:2px;}

        /* ── Card ── */
        .rrp-card{
          background:#fff;border-radius:18px;
          box-shadow:0 8px 40px rgba(24,114,181,.10);
          padding:48px 52px;
        }
        .rrp-reveal{opacity:0;}
        .rrp-reveal.revealed{animation:fadeUp .7s ease both;}

        /* ── Prose ── */
        .rrp-prose h2{
          font-family:'Sora',sans-serif;
          font-size:20px;color:#0a214f;font-weight:700;
          margin-top:32px;margin-bottom:12px;
          padding-bottom:8px;
          border-bottom:1.5px solid #dbeafe;
        }
        .rrp-prose h3{
          font-family:'Sora',sans-serif;
          font-size:17px;color:#1872B5;font-weight:700;
          margin-top:24px;margin-bottom:10px;
        }
        .rrp-prose p{
          font-size:14px;color:#374151;line-height:20px;
          margin-bottom:14px;text-align:left;
        }
        .rrp-prose ul,.rrp-prose ol{margin-bottom:14px;padding-left:28px;}
        .rrp-prose li{font-size:14px;color:#374151;line-height:1.8;margin-bottom:6px;}
        .rrp-prose strong,.rrp-prose b{color:#0a214f;font-weight:700;}
        .rrp-prose a{color:#1872B5;text-decoration:underline;transition:color .2s;}
        .rrp-prose a:hover{color:#0a214f;}

        /* ── Last Updated ── */
        .rrp-footer{
          display:flex;align-items:center;justify-content:center;gap:10px;
          margin-top:36px;padding-top:24px;
          border-top:1px solid #e5e7eb;
          font-size:13px;color:#9ca3af;
        }
        .rrp-footer__label{
          background:#eff6ff;color:#1872B5;
          font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;
          padding:4px 12px;border-radius:20px;border:1px solid #bfdbfe;
        }

        /* ── Responsive ── */
        @media(max-width:768px){
          .rrp-banner{height:150px;}
          .rrp-banner__title{font-size:28px;margin-bottom:5px;}
          .rrp-banner__subtitle{font-size:13px;}
          .rrp-section{padding:36px 16px 48px;}
          .rrp-card{padding:28px 20px;}
          .rrp-title{font-size:22px;}
          .rrp-prose h2{font-size:17px;}
          .rrp-prose h3{font-size:15px;}
          .rrp-prose p,.rrp-prose li{font-size:13px;line-height:1.7;}
        }

        @media(max-width:767px){
          .rrp-banner{height:120px;}
          .rrp-banner__title{font-size:20px;margin-bottom:0;}
          .rrp-section{padding:24px 12px 40px;}
          .rrp-card{padding:20px 16px;}
          .rrp-title{font-size:16px;}
          .rrp-prose p,.rrp-prose li{font-size:13px;}
          .rrp-header{margin-bottom:20px;}
        }
      `}</style>

      {/* ── Banner ── */}
      <div className="rrp-banner">
        <div className="rrp-banner__orb" />
        <div className="rrp-banner__orb-2" />
        <div className="rrp-banner__content">
          <h1 className="rrp-banner__title">
            {page?.heading || 'Return and Refund Policy'}
          </h1>
          <p className="rrp-banner__subtitle">How returns, exchanges &amp; refunds work</p>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="rrp-breadcrumb">
        <nav className="rrp-breadcrumb__nav">
          <Link href="/" className="rrp-breadcrumb__link">Home</Link>
          <span className="rrp-breadcrumb__separator">›</span>
          <span className="rrp-breadcrumb__current">{page?.heading || 'Return and Refund Policy'}</span>
        </nav>
      </div>

      {/* ── Content ── */}
      <div className="rrp-section">
        <div className="rrp-header">
          <div className="rrp-section-tag">Legal</div>
          <h2 className="rrp-title">{page?.heading || 'Return and Refund Policy'}</h2>
          <div className="rrp-divider" />
        </div>

        <div
          className={`rrp-card rrp-reveal ${visible ? 'revealed' : ''}`}
          data-section="content"
        >
          <div
            className="rrp-prose"
            dangerouslySetInnerHTML={{ __html: page?.description || '' }}
          />

          {lastUpdated && (
            <div className="rrp-footer">
              <span className="rrp-footer__label">Last Updated</span>
              {lastUpdated}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
