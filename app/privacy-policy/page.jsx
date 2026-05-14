'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function PrivacyPolicyPage() {
  const [page, setPage]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/privacy-policy`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(data => { setPage(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    const el = document.querySelector('[data-section="content"]');
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, [loading]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', flexDirection: 'column', gap: 16, fontFamily: 'Nunito,sans-serif' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #dbeafe', borderTopColor: '#1872B5', animation: 'spin .8s linear infinite' }} />
      <p style={{ color: '#6b7280', fontSize: 14 }}>Loading...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', fontFamily: 'Nunito,sans-serif' }}>
      <p style={{ color: '#9ca3af', fontSize: 18 }}>404 — Page not found</p>
    </div>
  );

  const lastUpdated = page?.updated_at
    ? new Date(page.updated_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: '2-digit' })
    : null;

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: "'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}

        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bannerReveal{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}

        .pp-banner{
          position:relative;height:210px;
          background:linear-gradient(135deg,#0a214f 0%,#1872B5 55%,#2596e1 100%);
          display:flex;align-items:center;justify-content:center;overflow:hidden;
        }
        .pp-banner::before{
          content:'';position:absolute;inset:0;
          background:url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E") repeat;
          animation:shimmer 8s linear infinite;
        }
        .pp-banner-orb{
          position:absolute;width:200px;height:200px;border-radius:50%;
          background:radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 70%);
          left:-60px;bottom:-60px;
        }
        .pp-banner-orb2{
          position:absolute;width:160px;height:160px;border-radius:50%;
          background:radial-gradient(circle,rgba(255,255,255,.05) 0%,transparent 70%);
          right:-40px;top:-40px;
        }
        .pp-banner-content{position:relative;z-index:2;text-align:center;animation:bannerReveal .7s ease both;}

        .pp-bc-bar{background:#1872B5;padding:10px 0;}
        .pp-bc{max-width:1400px;margin:0 auto;padding:0 24px;font-size:13px;color:rgba(255,255,255,.75);display:flex;align-items:center;gap:4px;flex-wrap:wrap;}
        .pp-bc a{color:rgba(255,255,255,.75);text-decoration:none;transition:color .2s;}
        .pp-bc a:hover{color:#fff;}
        .pp-bc-sep{opacity:.5;margin:0 2px;}
        .pp-bc-cur{color:#fff;font-weight:700;}

        .section-tag{
          display:inline-flex;align-items:center;gap:8px;
          background:linear-gradient(135deg,#eff6ff,#dbeafe);
          color:#1872B5;font-size:11px;font-weight:800;
          text-transform:uppercase;letter-spacing:.1em;
          padding:6px 16px;border-radius:20px;
          border:1px solid #bfdbfe;margin-bottom:18px;
        }
        .section-tag::before{content:'';width:6px;height:6px;border-radius:50%;background:#1872B5;flex-shrink:0;}

        .pp-section{max-width:1400px;margin:0 auto;padding:56px 24px 60px;}

        .pp-header{margin-bottom:32px;}
        .pp-main-heading{
          font-family:'Sora',sans-serif;font-size:30px;font-weight:800;
          color:#0a214f;line-height:1.3;margin-bottom:10px;
        }
        .pp-divider{width:40px;height:3px;background:linear-gradient(135deg,#1872B5,#2596e1);border-radius:2px;}

        .pp-card{
          background:#fff;border-radius:18px;
          box-shadow:0 8px 40px rgba(24,114,181,.10);
          padding:48px 52px;
        }
        .pp-reveal{opacity:0;}
        .pp-reveal.revealed{animation:fadeUp .7s ease both;}

        .pp-body h2{
          font-family:'Sora',sans-serif;
          font-size:20px;color:#0a214f;font-weight:700;
          margin-top:32px;margin-bottom:12px;
          padding-bottom:8px;
          border-bottom:1.5px solid #dbeafe;
        }
        .pp-body h3{
          font-family:'Sora',sans-serif;
          font-size:17px;color:#1872B5;font-weight:700;
          margin-top:24px;margin-bottom:10px;
        }
        .pp-body p{
          font-size:14px;color:#374151;line-height:1.85;
          margin-bottom:14px;text-align:left;
        }
        .pp-body ul,.pp-body ol{margin-bottom:14px;padding-left:28px;}
        .pp-body li{font-size:14px;color:#374151;line-height:1.8;margin-bottom:6px;}
        .pp-body strong,.pp-body b{color:#0a214f;font-weight:700;}
        .pp-body a{color:#1872B5;text-decoration:underline;}
        .pp-body a:hover{color:#0a214f;}

        .pp-last-updated{
          display:flex;align-items:center;justify-content:center;gap:10px;
          margin-top:36px;padding-top:24px;
          border-top:1px solid #e5e7eb;
          font-size:13px;color:#9ca3af;
        }
        .pp-last-updated span{
          background:#eff6ff;color:#1872B5;
          font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;
          padding:4px 12px;border-radius:20px;border:1px solid #bfdbfe;
        }

	.pp-banner-content h1 {
    font-size: 34px !important;
    font-weight: 700 !important;
}	  
	
.pp-main-heading {
    font-family: 'Sora',sans-serif;
    font-size: 26px;
    font-weight: 800;
    color: #0a214f;
    line-height: 1.3;
    margin-bottom: 8px;
}
.section-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg,#eff6ff,#dbeafe);
    color: #1872B5;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .1em;
    padding: 6px 16px;
    border-radius: 20px;
    border: 1px solid #bfdbfe;
    margin-bottom: 18px;
}
.pp-header {
    margin-bottom: 24px;
}
.pp-main-heading {
    font-size: 18px;
}




        @media(max-width:768px){
          .pp-banner{height:150px;}
          .pp-main-heading{font-size:22px;}
          .pp-section{padding:36px 16px 48px;}
          .pp-card{padding:28px 20px;}
          .pp-body h2{font-size:17px;}
          .pp-body h3{font-size:15px;}
		  


.pp-banner-content h1 {
    /* font-size: 34px !important; */
    /* font-weight: 700 !important; */
    font-size: 28px !important;
    font-weight: 700 !important;
    margin-bottom: 3px !important;
}
.pp-banner {
    height: 121px;
}


        }
      `}</style>

      {/* Banner */}
      <div className="pp-banner">
        <div className="pp-banner-orb" />
        <div className="pp-banner-orb2" />
        <div className="pp-banner-content">
          <h1 style={{
            fontFamily: "'Sora',sans-serif", fontSize: '42px', fontWeight: 800,
            color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em',
            textShadow: '0 2px 20px rgba(0,0,0,.25)'
          }}>
            {page?.heading || 'Privacy Policy'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, fontWeight: 600, margin: 0 }}>
            Your privacy matters to us
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="pp-bc-bar">
        <nav className="pp-bc">
          <Link href="/">Home</Link>
          <span className="pp-bc-sep">›</span>
          <span className="pp-bc-cur">{page?.heading || 'Privacy Policy'}</span>
        </nav>
      </div>

      {/* Content */}
      <div className="pp-section">
        <div className="pp-header">
          <div className="section-tag">Legal</div>
          <h2 className="pp-main-heading">{page?.heading || 'Privacy Policy'}</h2>
          <div className="pp-divider" />
        </div>

        <div
          className={`pp-card pp-reveal ${visible ? 'revealed' : ''}`}
          data-section="content"
        >
          <div
            className="pp-body"
            dangerouslySetInnerHTML={{ __html: page?.description || '' }}
          />

          {lastUpdated && (
            <div className="pp-last-updated">
              <span>Last Updated</span>
              {lastUpdated}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}