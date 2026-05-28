'use client';
import GalleryShortcode from '../components/GalleryShortcode';
import Link from 'next/link';

export default function GalleryPage() {
  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: "'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}

        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes bannerReveal{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}

        /* ── Banner ── */
        .gallery-banner{
          position:relative;height:210px;
          background:linear-gradient(135deg,#0a214f 0%,#1872B5 55%,#2596e1 100%);
          display:flex;align-items:center;justify-content:center;overflow:hidden;
        }
        .gallery-banner::before{
          content:'';position:absolute;inset:0;
          background:url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E") repeat;
          animation:shimmer 8s linear infinite;
        }
        .gallery-banner-orb{
          position:absolute;width:200px;height:200px;border-radius:50%;
          background:radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 70%);
          left:-60px;bottom:-60px;
        }
        .gallery-banner-content{position:relative;z-index:2;text-align:center;animation:bannerReveal .7s ease both;}

        /* ── Breadcrumb ── */
        .gallery-bc-bar{background:#1872B5;padding:10px 0;}
        .gallery-bc{max-width:1400px;margin:0 auto;padding:0 24px;font-size:13px;color:rgba(255,255,255,.75);display:flex;align-items:center;gap:4px;flex-wrap:wrap;}
        .gallery-bc a{color:rgba(255,255,255,.75);text-decoration:none;transition:color .2s;}
        .gallery-bc a:hover{color:#fff;}
        .gallery-bc-sep{opacity:.5;margin:0 2px;}
        .gallery-bc-cur{color:#fff;font-weight:700;}
.gal-wrap {
    font-family: 'Nunito',sans-serif;
    background: #f5f7fa;
    min-height: 60vh;
    padding: 0px 0 10px!important;
}
        /* ── Content Section ── */
        .gallery-section{max-width:1400px;margin:0 auto;padding:60px 24px;}



.gallery-banner-content h1 {
    font-size: 34px !important;
    font-weight: 700 !important;
}
.gal-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg,#eff6ff,#dbeafe);
    color: #1872B5;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .12em;
    padding: 6px 18px;
    border-radius: 20px;
    border: 1px solid #bfdbfe;
    margin-bottom: 11px;
}
.gal-title {
    font-family: 'Sora',sans-serif;
    font-size: 27px;
    font-weight: 800;
    color: #0a214f;
    margin: 0 0 -31px;
    letter-spacing: -.02em;
}
.gal-type-badge {
    display: none;
}
.gallery-banner-content h1 {
    font-size: 30px !important;
    font-weight: 700 !important;
    margin-bottom: 0!important;
}
.gal-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg,#eff6ff,#dbeafe);
    color: #1872B5;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .12em;
    padding: 3px 7px;
    border-radius: 20px;
    border: 1px solid #bfdbfe;
    margin-bottom: 8px;
}

.gal-title {
    font-family: 'Sora',sans-serif;
    font-size: 30px;
    font-weight: 800;
    color: #0a214f;
    margin: 0 0 -31px;
    letter-spacing: -.02em;
}
.gal-tab {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 19px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    outline: none;
    background: #fff;
    color: #6b7280;
    transition: all .25s;
    border: 1.5px solid #e5e7eb;
    position: relative;
    user-select: none;
}
.gallery-section {
    max-width: 1400px;
    margin: 0 auto;
    padding: 42px 24px;
}




        /* ── Responsive ── */
        @media(max-width:768px){
          .gallery-banner{height:150px;}
          .gallery-section{padding:40px 16px;}
		  .gallery-banner-content h1 {
    /* font-size: 34px !important; */
    /* font-weight: 700 !important; */
    font-size: 28px !important;
    font-weight: 700 !important;
    margin-bottom: 3px !important;
}

.gal-grid {
    grid-template-columns: 1fr 1fr !important;
}

.gal-container {
    padding-inline: 0 !important;
}

.gallery-banner-content h1 {
    /* font-size: 34px !important; */
    /* font-weight: 700 !important; */
    font-size: 20px !important;
    font-weight: 700 !important;
    margin-bottom: 0px !important;
}

.gal-title {
    font-size: 20px !important;
}

.gal-grid {
    grid-template-columns: 1fr 1fr !important;
}

.gal-container {
    margin: 0 auto !important;
    padding: 0 0px !important;
}

.gal-tabs {
    display: flex !important;
    justify-content: center !important;
    gap: 0 !important;
    margin-bottom: 27px !important;
    animation: fadeUp .6s .1s ease both !important;
    opacity: 0 !important;
}

.gallery-banner-content p {
    font-size: 12px !important;
}


        }
		
		
      `}</style>

      {/* ── Banner ── */}
      <div className="gallery-banner">
        <div className="gallery-banner-orb" />
        <div className="gallery-banner-content">
          <h1 style={{
            fontFamily: "'Sora',sans-serif", fontSize: '42px', fontWeight: 800,
            color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em',
            textShadow: '0 2px 20px rgba(0,0,0,.25)'
          }}>
            Gallery
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, fontWeight: 600, margin: 0 }}>
            Explore our amazing collection
          </p>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="gallery-bc-bar">
        <nav className="gallery-bc">
          <Link href="/">Home</Link>
          <span className="gallery-bc-sep">›</span>
          <span className="gallery-bc-cur">Gallery</span>
        </nav>
      </div>

      {/* ── Gallery Content ── */}
      <div className="gallery-section">
        <GalleryShortcode imageGalleryId={3} videoGalleryId={4} />
      </div>
    </div>
  );
}
