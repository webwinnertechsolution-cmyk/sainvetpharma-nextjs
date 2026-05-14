'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ─── Helpers ────────────────────────────────────────────────
function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: '2-digit',
  });
}
function getImage(blog) {
  if (!blog.featured_image) return null;
  return `${API_URL}/uploads/blogs/${blog.featured_image}`;
}

// ─── Skeleton Card ───────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 16px rgba(24,114,181,.07)' }}>
      <div style={{ height: 200, background: 'linear-gradient(90deg,#eff6ff 25%,#dbeafe 50%,#eff6ff 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
      <div style={{ padding: 22 }}>
        {[80, 60, 90, 40].map((w, i) => (
          <div key={i} style={{ height: i === 0 ? 18 : 13, width: `${w}%`, background: '#eff6ff', borderRadius: 6, marginBottom: 10, animation: 'shimmer 1.4s infinite' }} />
        ))}
      </div>
    </div>
  );
}

// ─── Blog Card ───────────────────────────────────────────────
function BlogCard({ blog, index }) {
  const [hover, setHover] = useState(false);
  const img      = getImage(blog);
  const date     = formatDate(blog.published_at || blog.created_at);
  const excerpt  = stripHtml(blog.excerpt || blog.content).slice(0, 110) + '…';
  const category = blog.categories?.[0]?.name;

  return (
    <Link
      href={`/blog/${blog.slug}`}
      style={{ textDecoration: 'none', display: 'block', animationDelay: `${index * 80}ms` }}
      className="blog-card-anim"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{
        background: '#fff', borderRadius: 18, overflow: 'hidden',
        boxShadow: hover ? '0 20px 48px rgba(24,114,181,.20)' : '0 4px 20px rgba(24,114,181,.08)',
        transform: hover ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all .35s cubic-bezier(.4,0,.2,1)',
        height: '100%', display: 'flex', flexDirection: 'column',
        border: hover ? '1.5px solid #bfdbfe' : '1.5px solid transparent',
      }}>
        {/* Image */}
        <div style={{ position: 'relative', height: 210, overflow: 'hidden', flexShrink: 0 }}>
          {img ? (
            <img src={img} alt={blog.image_alt_tag || blog.title} style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hover ? 'scale(1.07)' : 'scale(1)',
              transition: 'transform .5s cubic-bezier(.4,0,.2,1)',
            }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#0a214f 0%,#1872B5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
              </svg>
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,33,79,.4) 0%, transparent 60%)', opacity: hover ? 1 : 0, transition: 'opacity .3s' }} />
          {category && (
            <div style={{ position: 'absolute', top: 14, left: 14, background: '#1872B5', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              {category}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '22px 22px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1872B5" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span style={{ fontSize: 12, color: '#1872B5', fontWeight: 600 }}>{date}</span>
          </div>

          <h3 style={{
            fontSize: 16, fontWeight: 700, lineHeight: 1.45, margin: '0 0 10px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            transition: 'color .2s', color: hover ? '#1872B5' : '#0a214f',
          }}>
            {blog.title}
          </h3>

          <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.7, margin: '0 0 12px', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {excerpt}
          </p>

          {(blog.tags || []).length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
              {blog.tags.slice(0, 3).map(t => (
                <span key={t.id} style={{ background: '#eff6ff', color: '#1872B5', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                  #{t.name}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1872B5', fontSize: 13, fontWeight: 700, paddingTop: 14, borderTop: '1px solid #dbeafe' }}>
            Read More
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: hover ? 'translateX(4px)' : 'translateX(0)', transition: 'transform .3s' }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page Inner ───────────────────────────────────────────────
function BlogPageInner() {
  const searchParams = useSearchParams();
  const [blogs, setBlogs]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags]             = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTag, setActiveTag]   = useState(null);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [filterTab, setFilterTab]   = useState('category');
  const PER_PAGE = 9;

  useEffect(() => {
    fetch(`${API_URL}/api/blogs`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || []);
        setBlogs(list);

        const cats = {};
        list.forEach(b => (b.categories || []).forEach(c => { cats[c.id] = c; }));
        const categoriesArray = Object.values(cats);
        setCategories(categoriesArray);

        const tgs = {};
        list.forEach(b => (b.tags || []).forEach(t => { tgs[t.id] = t; }));
        const tagsArray = Object.values(tgs);
        setTags(tagsArray);

        const urlCategory = searchParams.get('category');
        const urlTag = searchParams.get('tag');

        if (urlCategory) {
          const foundCat = categoriesArray.find(c => c.slug === urlCategory || c.id.toString() === urlCategory);
          if (foundCat) {
            setActiveCategory(foundCat.id);
            setFilterTab('category');
            setActiveTag(null);
          }
        }

        if (urlTag) {
          const foundTag = tagsArray.find(t => t.slug === urlTag || t.id.toString() === urlTag);
          if (foundTag) {
            setActiveTag(foundTag.id);
            setFilterTab('tag');
            setActiveCategory(null);
          }
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchParams]);

  const filtered = blogs.filter(b => {
    const matchCat    = !activeCategory || (b.categories || []).some(c => c.id === activeCategory);
    const matchTag    = !activeTag       || (b.tags       || []).some(t => t.id === activeTag);
    const matchSearch = !search          || b.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchTag && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCategory  = (id)  => { setActiveCategory(id); setActiveTag(null); setPage(1); };
  const handleTag       = (id)  => { setActiveTag(id); setActiveCategory(null); setPage(1); };
  const handleSearch    = (e)   => { setSearch(e.target.value); setPage(1); };
  const handleFilterTab = (tab) => { setFilterTab(tab); setActiveCategory(null); setActiveTag(null); setPage(1); };
  const clearAll        = ()    => { setActiveCategory(null); setActiveTag(null); setSearch(''); setPage(1); };

  const activeLabel = activeCategory
    ? `in category "${categories.find(c => c.id === activeCategory)?.name}"`
    : activeTag
    ? `tagged "#${tags.find(t => t.id === activeTag)?.name}"`
    : '';

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', fontFamily: "'Nunito',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Nunito:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bannerIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        .blog-card-anim{animation:fadeUp .55s ease both;}
        .blog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px;}
        @media(max-width:1024px){.blog-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:640px){.blog-grid{grid-template-columns:1fr;}}
        .ftab{background:transparent;border:none;font-size:13px;font-weight:700;padding:7px 16px;border-radius:26px;cursor:pointer;transition:all .2s;font-family:'Nunito',sans-serif;color:#6b7280;}
        .ftab.on{background:#1872B5;color:#fff;}
        .ftab:hover:not(.on){color:#1872B5;}
        .chip{background:#fff;border:1.5px solid #dbeafe;color:#555;font-size:13px;font-weight:700;padding:7px 16px;border-radius:30px;cursor:pointer;transition:all .22s;white-space:nowrap;font-family:'Nunito',sans-serif;}
        .chip:hover{border-color:#1872B5;color:#1872B5;}
        .chip.on{background:#1872B5;border-color:#1872B5;color:#fff;}
        .tchip{background:#fff;border:1.5px solid #dbeafe;color:#555;font-size:12px;font-weight:700;padding:5px 13px;border-radius:30px;cursor:pointer;transition:all .22s;white-space:nowrap;font-family:'Nunito',sans-serif;}
        .tchip:hover{border-color:#1872B5;color:#1872B5;}
        .tchip.on{background:#1872B5;border-color:#1872B5;color:#fff;}
        .search-box{display:flex;align-items:center;gap:10px;background:#fff;border:1.5px solid #dbeafe;border-radius:30px;padding:10px 20px;transition:border-color .2s;}
        .search-box:focus-within{border-color:#1872B5;box-shadow:0 0 0 3px rgba(24,114,181,.1);}
        .search-box input{border:none;outline:none;background:transparent;font-size:14px;font-family:'Nunito',sans-serif;color:#0a214f;width:200px;}
        .search-box input::placeholder{color:#9ca3af;}
        .page-btn{width:38px;height:38px;border-radius:50%;border:1.5px solid #dbeafe;background:#fff;color:#555;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;font-family:'Nunito',sans-serif;}
        .page-btn:hover{border-color:#1872B5;color:#1872B5;}
        .page-btn.on{background:#1872B5;border-color:#1872B5;color:#fff;}
        .page-btn:disabled{opacity:.35;cursor:not-allowed;}
        .blog-banner{position:relative;height:180px;background:linear-gradient(135deg,#0a214f 0%,#1872B5 55%,#2596e1 100%);display:flex;align-items:center;justify-content:center;overflow:hidden;}
        .blog-banner::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E") repeat;}
        .blog-banner-orb{position:absolute;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.07) 0%,transparent 70%);left:-70px;bottom:-70px;}
        .blog-banner-orb2{position:absolute;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.05) 0%,transparent 70%);right:-50px;top:-50px;}
        .blog-banner-content{position:relative;z-index:2;text-align:center;animation:bannerIn .6s ease both;}
        .blog-banner-content h1{font-size:34px !important;font-weight:700 !important;}
        .chips-row{display:flex;gap:8px;flex-wrap:wrap;}
        @media(max-width:640px){.chips-row{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px;}.chips-row::-webkit-scrollbar{height:3px;}.chips-row::-webkit-scrollbar-thumb{background:#bfdbfe;border-radius:4px;}}
        .cnt{display:inline-block;margin-left:5px;font-size:10px;font-weight:800;padding:1px 6px;border-radius:10px;}
      `}</style>

      <div className="blog-banner">
        <div className="blog-banner-orb" />
        <div className="blog-banner-orb2" />
        <div className="blog-banner-content">
          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 13, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>Our Journal</p>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0, textShadow: '0 2px 20px rgba(0,0,0,.25)' }}>
            Blog & Insights
          </h1>
        </div>
      </div>

      <div style={{ background: '#1872B5', padding: '10px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 6, fontSize: 13, color: 'rgba(255,255,255,.75)', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,.75)', textDecoration: 'none' }}>Home</Link>
          <span style={{ opacity: .5, margin: '0 2px' }}>›</span>
          <span style={{ color: '#fff', fontWeight: 700 }}>Blog</span>
        </div>
      </div>

      <div style={{ background: '#fff', borderBottom: '1px solid #dbeafe', padding: '12px 0', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 12px rgba(24,114,181,.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
            <div className="search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input placeholder="Search articles…" value={search} onChange={handleSearch} />
            </div>
            <div style={{ width: 1, height: 28, background: '#dbeafe', flexShrink: 0 }} />
            <div style={{ display: 'flex', background: '#f0f7ff', borderRadius: 30, padding: 3, gap: 2 }}>
              <button className={`ftab ${filterTab === 'category' ? 'on' : ''}`} onClick={() => handleFilterTab('category')}>
                🗂 Categories
                <span className="cnt" style={{ background: filterTab === 'category' ? 'rgba(255,255,255,.25)' : '#dbeafe', color: filterTab === 'category' ? '#fff' : '#1872B5' }}>
                  {categories.length}
                </span>
              </button>
              <button className={`ftab ${filterTab === 'tag' ? 'on' : ''}`} onClick={() => handleFilterTab('tag')}>
                🏷 Tags
                <span className="cnt" style={{ background: filterTab === 'tag' ? 'rgba(255,255,255,.25)' : '#dbeafe', color: filterTab === 'tag' ? '#fff' : '#1872B5' }}>
                  {tags.length}
                </span>
              </button>
            </div>
          </div>

          <div className="chips-row">
            {filterTab === 'category' ? (
              <>
                <button className={`chip ${!activeCategory ? 'on' : ''}`} onClick={() => handleCategory(null)}>All Posts</button>
                {categories.map(c => {
                  const count = blogs.filter(b => (b.categories || []).some(bc => bc.id === c.id)).length;
                  return (
                    <button key={c.id} className={`chip ${activeCategory === c.id ? 'on' : ''}`} onClick={() => handleCategory(c.id)}>
                      {c.name}
                      <span className="cnt" style={{ background: activeCategory === c.id ? 'rgba(255,255,255,.2)' : '#eff6ff', color: activeCategory === c.id ? '#fff' : '#1872B5' }}>{count}</span>
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                <button className={`tchip ${!activeTag ? 'on' : ''}`} onClick={() => handleTag(null)}>All Tags</button>
                {tags.map(t => {
                  const count = blogs.filter(b => (b.tags || []).some(bt => bt.id === t.id)).length;
                  return (
                    <button key={t.id} className={`tchip ${activeTag === t.id ? 'on' : ''}`} onClick={() => handleTag(t.id)}>
                      #{t.name}
                      <span className="cnt" style={{ background: activeTag === t.id ? 'rgba(255,255,255,.2)' : '#eff6ff', color: activeTag === t.id ? '#fff' : '#1872B5' }}>{count}</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 24px 60px' }}>
        {!loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600, margin: 0 }}>
              Showing <strong style={{ color: '#1872B5' }}>{filtered.length}</strong> article{filtered.length !== 1 ? 's' : ''}
              {activeLabel && <span style={{ color: '#6b7280' }}> {activeLabel}</span>}
              {search && <span style={{ color: '#6b7280' }}> matching "<strong style={{ color: '#1872B5' }}>{search}</strong>"</span>}
            </p>
            {(activeCategory || activeTag || search) && (
              <button onClick={clearAll} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1872B5', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, cursor: 'pointer', fontFamily: 'Nunito,sans-serif' }}>
                ✕ Clear
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="blog-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: 18, boxShadow: '0 8px 40px rgba(24,114,181,.10)', border: '1.5px solid #dbeafe' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📝</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0a214f', marginBottom: 8 }}>No Articles Found</h3>
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>Try a different keyword, category or tag.</p>
            <button onClick={clearAll} style={{ background: '#1872B5', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 30, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Nunito,sans-serif' }}>
              Show All Posts
            </button>
          </div>
        ) : (
          <div className="blog-grid">
            {paginated.map((blog, i) => <BlogCard key={blog.id} blog={blog} index={i} />)}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 48 }}>
            <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn ${p === page ? 'on' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Export with Suspense ─────────────────────────────────────
export default function BlogPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogPageInner />
    </Suspense>
  );
}