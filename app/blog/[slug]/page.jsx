'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: '2-digit',
  });
}
function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// ─── Recent Post Card (sidebar) ──────────────────────────────
function RecentCard({ post }) {
  const [hover, setHover] = useState(false);
  const img = post.featured_image ? `${API_URL}/uploads/blogs/${post.featured_image}` : null;

  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          padding: '12px 0', borderBottom: '1px solid #dbeafe',
          transition: 'opacity .2s',
          opacity: hover ? .75 : 1,
        }}
      >
        {img && (
          <img src={img} alt={post.title}
            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
        )}
        <div>
          <p style={{
            fontSize: 12.5, fontWeight: 700, color: '#0a214f', lineHeight: 1.45, marginBottom: 4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.title}
          </p>
          <span style={{ fontSize: 11, color: '#1872B5', fontWeight: 600 }}>
            {formatDate(post.published_at || post.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Sidebar Content Component ──────────────────────────────
function SidebarContent({ blog, recent, date, readTime }) {
  return (
    <>
      {/* Article Info */}
      <div className="sidebar-card">
        <h4 className="sidebar-title">Article Info</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📅</div>
            <div>
              <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Published</p>
              <p style={{ fontSize: 13, color: '#0a214f', fontWeight: 700 }}>{date}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏱</div>
            <div>
              <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Read Time</p>
              <p style={{ fontSize: 13, color: '#0a214f', fontWeight: 700 }}>{readTime} min read</p>
            </div>
          </div>
          {(blog.categories || []).length > 0 && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🏷</div>
              <div>
                <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Category</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {blog.categories.map(c => (
                    <Link key={c.id} href="/blog"
                      style={{ background: '#1872B5', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, textDecoration: 'none' }}>
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Posts */}
      {recent.length > 0 && (
        <div className="sidebar-card">
          <h4 className="sidebar-title">Recent Posts</h4>
          {recent.map(post => <RecentCard key={post.id} post={post} />)}
        </div>
      )}

      {/* Categories */}
      {(blog.categories || []).length > 0 && (
        <div className="sidebar-card">
          <h4 className="sidebar-title">📂 Categories</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {blog.categories.map(c => (
              <Link
                key={c.id}
                href={`/blog?category=${c.slug || c.id}`}
                style={{
                  padding: '10px 14px',
                  background: '#f0f7ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 10,
                  color: '#1872B5',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1872B5';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f0f7ff';
                  e.currentTarget.style.color = '#1872B5';
                }}
              >
                → {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {(blog.tags || []).length > 0 && (
        <div className="sidebar-card">
          <h4 className="sidebar-title">🏷 Tags</h4>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {blog.tags.map(t => (
              <Link
                key={t.id}
                href={`/blog?tag=${t.slug || t.id}`}
                style={{
                  padding: '5px 12px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 14,
                  color: '#1872B5',
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1872B5';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = '#1872B5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#eff6ff';
                  e.currentTarget.style.color = '#1872B5';
                  e.currentTarget.style.borderColor = '#bfdbfe';
                }}
              >
                #{t.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function BlogSinglePage() {
  const { slug } = useParams();
  const [blog, setBlog]     = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [visible, setVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    fetch(`${API_URL}/api/blogs`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || []);
        const found = list.find(b => b.slug === slug);
        if (!found) { setNotFound(true); setLoading(false); return; }
        setBlog(found);
        setRecent(list.filter(b => b.slug !== slug).slice(0, 5));
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [slug]);

  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    const el = document.querySelector('[data-section="content"]');
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, [loading]);

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: 'Nunito,sans-serif' }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid #dbeafe', borderTopColor: '#1872B5', animation: 'spin .8s linear infinite' }} />
      <p style={{ color: '#6b7280', fontSize: 14 }}>Loading article…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Not Found ──
  if (notFound) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, fontFamily: 'Nunito,sans-serif' }}>
      <div style={{ fontSize: 64 }}>📄</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0a214f' }}>Article Not Found</h2>
      <p style={{ color: '#9ca3af', fontSize: 14 }}>This post may have been removed or the URL is incorrect.</p>
      <Link href="/blog" style={{ marginTop: 12, background: '#1872B5', color: '#fff', padding: '12px 28px', borderRadius: 30, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
        ← Back to Blog
      </Link>
    </div>
  );

  const img      = blog.featured_image ? `${API_URL}/uploads/blogs/${blog.featured_image}` : null;
  const date     = formatDate(blog.published_at || blog.created_at);
  const readTime = Math.max(1, Math.ceil(stripHtml(blog.content).split(' ').length / 200));

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: "'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}

        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bannerIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes fadeInOverlay{from{opacity:0}to{opacity:1}}

        /* ── Banner ── */
        .blog-banner{
          position:relative;height:210px;
          background:linear-gradient(135deg,#0a214f 0%,#1872B5 55%,#2596e1 100%);
          display:flex;align-items:center;justify-content:center;overflow:hidden;
        }
        .blog-banner::before{
          content:'';position:absolute;inset:0;
          background:url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E") repeat;
          animation:shimmer 8s linear infinite;
        }
        .blog-banner-orb{position:absolute;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 70%);left:-60px;bottom:-60px;}
        .blog-banner-orb2{position:absolute;width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.05) 0%,transparent 70%);right:-40px;top:-40px;}
        .blog-banner-content{position:relative;z-index:2;text-align:center;animation:bannerIn .7s ease both;padding:0 24px;}

        /* ── Breadcrumb ── */
        .blog-bc-bar{background:#1872B5;padding:10px 0;}
        .blog-bc{max-width:1200px;margin:0 auto;padding:0 24px;font-size:13px;color:rgba(255,255,255,.75);display:flex;align-items:center;gap:4px;flex-wrap:wrap;}
        .blog-bc a{color:rgba(255,255,255,.75);text-decoration:none;transition:color .2s;}
        .blog-bc a:hover{color:#fff;}
        .blog-bc-sep{opacity:.5;margin:0 2px;}
        .blog-bc-cur{color:#fff;font-weight:700;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

        /* ── Section tag ── */
        .section-tag{
          display:inline-flex;align-items:center;gap:8px;
          background:linear-gradient(135deg,#eff6ff,#dbeafe);
          color:#1872B5;font-size:11px;font-weight:800;
          text-transform:uppercase;letter-spacing:.1em;
          padding:6px 16px;border-radius:20px;
          border:1px solid #bfdbfe;margin-bottom:18px;
        }
        .section-tag::before{content:'';width:6px;height:6px;border-radius:50%;background:#1872B5;flex-shrink:0;}

        /* ── Layout ── */
        .blog-layout{
          display:grid;
          grid-template-columns:1fr 300px;
          gap:32px;
          max-width:1200px;
          margin:0 auto;
          padding:40px 24px 60px;
        }
        @media(max-width:900px){
          .blog-layout{grid-template-columns:1fr;padding:28px 16px 48px;}
          .blog-sidebar{display:none;}
        }

        /* ── Mobile Filter Button ── */
        .mobile-filter-btn{
          display:none;
          position:fixed;
          bottom:24px;
          right:24px;
          padding:12px 18px;
          border-radius:50px;
          background:#1872B5;
          color:#fff;
          border:none;
          cursor:pointer;
          font-size:14px;
          font-weight:700;
          font-family:'Nunito',sans-serif;
          z-index:40;
          box-shadow:0 4px 20px rgba(24,114,181,.3);
          transition:all .3s;
          display:flex;
          align-items:center;
          gap:8px;
        }
        .mobile-filter-btn:hover{transform:translateY(-2px);box-shadow:0 6px 28px rgba(24,114,181,.4);}
        .mobile-filter-btn:active{transform:translateY(0);}

        @media(max-width:900px){
          .mobile-filter-btn{display:flex;}
        }

        /* ── Drawer Overlay ── */
        .drawer-overlay{
          position:fixed;
          inset:0;
          background:rgba(10,33,79,.5);
          z-index:98;
          animation:fadeInOverlay .3s ease;
          backdrop-filter:blur(2px);
        }

        /* ── Drawer ── */
        .drawer{
          position:fixed;
          right:0;
          top:0;
          bottom:0;
          width:320px;
          background:#fff;
          z-index:99;
          overflow-y:auto;
          animation:slideInRight .35s cubic-bezier(.4,0,.2,1);
          box-shadow:-4px 0 20px rgba(0,0,0,.15);
        }

        .drawer-header{
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:20px 20px;
          border-bottom:1px solid #dbeafe;
          position:sticky;
          top:0;
          background:#fff;
          z-index:101;
        }

        .drawer-header h3{
          margin:0;
          font-size:18px;
          font-weight:800;
          color:#0a214f;
          font-family:'Sora',sans-serif;
        }

        .drawer-close-btn{
          background:none;
          border:none;
          color:#6b7280;
          font-size:24px;
          cursor:pointer;
          padding:0;
          width:40px;
          height:40px;
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:8px;
          transition:all .2s;
        }

        .drawer-close-btn:hover{background:#f0f7ff;color:#1872B5;}

        .drawer-content{
          padding:20px;
        }

        /* ── Card ── */
        .blog-card{
          background:#fff;border-radius:18px;
          box-shadow:0 8px 40px rgba(24,114,181,.10);
          overflow:hidden;
        }
        .blog-reveal{opacity:0;}
        .blog-reveal.revealed{animation:fadeUp .7s ease both;}

        /* ── Featured Image inside card ── */
        .blog-featured-img{
          width:100%;
          max-height:420px;
          object-fit:cover;
          display:block;
          border-radius:0;
          animation:bannerIn .8s ease both;
        }

        /* ── Blog prose ── */
        .blog-prose h1,.blog-prose h2,.blog-prose h3,.blog-prose h4{
          font-family:'Sora',sans-serif;color:#0a214f;font-weight:700;
          margin:2em 0 .75em;line-height:1.35;
        }
        .blog-prose h1{font-size:28px;}
        .blog-prose h2{font-size:22px;padding-bottom:10px;border-bottom:2px solid #dbeafe;}
        .blog-prose h3{font-size:18px;color:#1872B5;}
        .blog-prose h4{font-size:16px;}
        .blog-prose p{font-size:15.5px;line-height:1.85;color:#374151;margin-bottom:1.2em;}
        .blog-prose ul,.blog-prose ol{padding-left:28px;margin-bottom:1.2em;}
        .blog-prose li{font-size:15.5px;line-height:1.8;color:#374151;margin-bottom:.4em;}
        .blog-prose strong,.blog-prose b{color:#0a214f;font-weight:700;}
        .blog-prose a{color:#1872B5;text-decoration:underline;}
        .blog-prose a:hover{color:#0a214f;}
        .blog-prose img{max-width:100%;border-radius:12px;margin:1.5em 0;}
        .blog-prose blockquote{
          border-left:4px solid #1872B5;padding:12px 20px;margin:1.5em 0;
          background:#eff6ff;border-radius:0 8px 8px 0;
        }
        .blog-prose blockquote p{color:#1872B5;font-style:italic;margin:0;}
        .blog-prose pre{background:#0a214f;color:#e5e7eb;padding:20px;border-radius:10px;overflow-x:auto;margin:1.2em 0;}
        .blog-prose code{background:#eff6ff;color:#1872B5;padding:2px 8px;border-radius:4px;font-size:14px;}
        .blog-prose table{width:100%;border-collapse:collapse;margin:1.2em 0;}
        .blog-prose th,.blog-prose td{border:1px solid #dbeafe;padding:10px 14px;text-align:left;font-size:14px;}
        .blog-prose th{background:#eff6ff;font-weight:700;color:#0a214f;}

        /* ── Tags ── */
        .tag-chip{
          background:#eff6ff;color:#1872B5;font-size:12px;font-weight:700;
          padding:5px 14px;border-radius:20px;border:1px solid #bfdbfe;
          text-decoration:none;transition:all .2s;
        }
        .tag-chip:hover{background:#1872B5;color:#fff;}

        /* ── Share ── */
        .share-btn{
          display:flex;align-items:center;gap:8px;
          background:#fff;border:1.5px solid #dbeafe;
          color:#555;font-size:13px;font-weight:700;
          padding:9px 18px;border-radius:30px;cursor:pointer;
          transition:all .2s;font-family:'Nunito',sans-serif;
        }
        .share-btn:hover{border-color:#1872B5;color:#1872B5;}

        /* ── Divider ── */
        .blue-divider{width:40px;height:3px;background:linear-gradient(135deg,#1872B5,#2596e1);border-radius:2px;margin-top:10px;}

        /* ── Sidebar card ── */
        .sidebar-card{background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(24,114,181,.10);padding:22px;margin-bottom:24px;}
        .sidebar-title{font-family:'Sora',sans-serif;font-size:15px;font-weight:800;color:#0a214f;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #dbeafe;}

        /* ── Related grid ── */
        @media(max-width:900px){
          .related-section{display:block !important;}
        }
      `}</style>

      {/* ── Top Banner ── */}
      <div className="blog-banner">
        <div className="blog-banner-orb" />
        <div className="blog-banner-orb2" />
        <div className="blog-banner-content">
          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 13, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Our Journal
          </p>
          <h1 style={{
            fontFamily: "'Sora',sans-serif", fontSize: 'clamp(22px,4vw,36px)',
            fontWeight: 800, color: '#fff', lineHeight: 1.3, margin: 0,
            textShadow: '0 2px 16px rgba(0,0,0,.3)', maxWidth: 700,
          }}>
            {blog.title}
          </h1>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="blog-bc-bar">
        <nav className="blog-bc">
          <Link href="/">Home</Link>
          <span className="blog-bc-sep">›</span>
          <Link href="/blog">Blog</Link>
          <span className="blog-bc-sep">›</span>
          <span className="blog-bc-cur">{blog.title}</span>
        </nav>
      </div>

      {/* ── Layout ── */}
      <div className="blog-layout">

        {/* ── Main Content ── */}
        <main>
          {/* Section heading above card */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-tag">Article</div>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color: '#0a214f', lineHeight: 1.35, marginBottom: 10 }}>
              {blog.title}
            </h2>
            <div className="blue-divider" />
          </div>

          <div
            className={`blog-card blog-reveal ${visible ? 'revealed' : ''}`}
            data-section="content"
          >
            {/* ── Featured Image INSIDE card, above content ── */}
            {img && (
              <img
                src={img}
                alt={blog.image_alt_tag || blog.title}
                className="blog-featured-img"
              />
            )}

            {/* Meta bar */}
            <div style={{ padding: '20px 36px 0', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              {(blog.categories || []).map(c => (
                <Link key={c.id} href={`/blog?category=${c.slug}`}
                  style={{
                    background: '#1872B5', color: '#fff',
                    fontSize: 11, fontWeight: 800, padding: '4px 14px',
                    borderRadius: 20, textDecoration: 'none', letterSpacing: '.06em', textTransform: 'uppercase',
                  }}>
                  {c.name}
                </Link>
              ))}
              <span style={{ fontSize: 13, color: '#1872B5', fontWeight: 700 }}>📅 {date}</span>
              <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>⏱ {readTime} min read</span>
            </div>

            {/* ── Article body ── */}
            <div
              className="blog-prose"
              style={{ padding: '28px 36px 36px' }}
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags */}
            {(blog.tags || []).length > 0 && (
              <div style={{ padding: '0 36px 28px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 700, marginRight: 4 }}>TAGS:</span>
                {blog.tags.map(t => (
                  <Link key={t.id} href={`/blog?tag=${t.slug}`} className="tag-chip">
                    #{t.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Last updated bar */}
            <div style={{
              padding: '20px 36px', borderTop: '1px solid #dbeafe',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            }}>
              <Link href="/blog" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: '#1872B5', fontWeight: 700, fontSize: 14, textDecoration: 'none',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Blog
              </Link>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="share-btn" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.23H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63z"/></svg>
                  Share
                </button>
                <button className="share-btn" onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'))}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  Copy Link
                </button>
              </div>
            </div>
          </div>

          {/* ── Related Posts ── */}
          {recent.length > 0 && (
            <div style={{ marginTop: 32, background: '#fff', borderRadius: 18, boxShadow: '0 8px 40px rgba(24,114,181,.10)', padding: 28 }}>
              <div className="section-tag" style={{ marginBottom: 12 }}>More Articles</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
                {recent.slice(0, 3).map(post => {
                  const pImg = post.featured_image ? `${API_URL}/uploads/blogs/${post.featured_image}` : null;
                  return (
                    <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        border: '1.5px solid #dbeafe', borderRadius: 14, overflow: 'hidden',
                        transition: 'all .25s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#1872B5'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(24,114,181,.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#dbeafe'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        {pImg && <img src={pImg} alt={post.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />}
                        <div style={{ padding: '14px 16px' }}>
                          <p style={{ fontSize: 12, color: '#1872B5', fontWeight: 700, marginBottom: 6 }}>
                            {formatDate(post.published_at || post.created_at)}
                          </p>
                          <p style={{
                            fontSize: 14, fontWeight: 700, color: '#0a214f', lineHeight: 1.4,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>
                            {post.title}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* ── Sidebar (Desktop) ── */}
        <aside className="blog-sidebar">
          {/* Back Button */}
          <Link href="/blog" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#1872B5', color: '#fff',
            padding: '12px 20px', borderRadius: 12,
            textDecoration: 'none', fontWeight: 700, fontSize: 14,
            marginBottom: 24, transition: 'background .2s',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to All Posts
          </Link>

          <SidebarContent blog={blog} recent={recent} date={date} readTime={readTime} />
        </aside>
      </div>

      {/* ── Mobile Filter Button ── */}
      <button className="mobile-filter-btn" onClick={() => setDrawerOpen(true)} title="Open Filters">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
        Filter
      </button>

      {/* ── Mobile Drawer ── */}
      {drawerOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="drawer">
            <div className="drawer-header">
              <h3>📋 Filters & Info</h3>
              <button className="drawer-close-btn" onClick={() => setDrawerOpen(false)}>✕</button>
            </div>
            <div className="drawer-content">
              <div className="section-tag" style={{ marginBottom: 20 }}>📋 Article Info & More</div>
              <SidebarContent blog={blog} recent={recent} date={date} readTime={readTime} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
