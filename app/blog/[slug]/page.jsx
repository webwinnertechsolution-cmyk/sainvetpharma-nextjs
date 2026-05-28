'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format date to en-IN locale
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
}

/**
 * Strip HTML tags from string
 */
function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Calculate read time based on word count
 */
function calculateReadTime(content) {
  const words = stripHtml(content).split(' ').length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Get featured image URL
 */
function getImageUrl(imageName) {
  if (!imageName) return null;
  return `${API_URL}/uploads/blogs/${imageName}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Recent Post Card Component (Sidebar)
 */
function RecentPostCard({ post }) {
  const [hover, setHover] = useState(false);
  const imageUrl = getImageUrl(post.featured_image);

  return (
    <Link href={`/blog/${post.slug}`} className="recent-post-card">
      <div
        className={`recent-post-card__wrapper ${hover ? 'recent-post-card__wrapper--hover' : ''}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={post.title}
            className="recent-post-card__image"
          />
        )}
        <div className="recent-post-card__content">
          <h4 className="recent-post-card__title">{post.title}</h4>
          <p className="recent-post-card__date">
            {formatDate(post.published_at || post.created_at)}
          </p>
        </div>
      </div>
    </Link>
  );
}

/**
 * Article Info Box Component
 */
function ArticleInfoBox({ date, readTime, categories }) {
  return (
    <div className="sidebar-card">
      <h4 className="sidebar-card__title">Article Info</h4>
      <div className="article-info">
        {/* Published Date */}
        <div className="article-info__item">
          <div className="article-info__icon">📅</div>
          <div className="article-info__content">
            <p className="article-info__label">Published</p>
            <p className="article-info__value">{date}</p>
          </div>
        </div>

        {/* Read Time */}
        <div className="article-info__item">
          <div className="article-info__icon">⏱</div>
          <div className="article-info__content">
            <p className="article-info__label">Read Time</p>
            <p className="article-info__value">{readTime} min read</p>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="article-info__item">
            <div className="article-info__icon">🏷</div>
            <div className="article-info__content">
              <p className="article-info__label">Category</p>
              <div className="article-info__categories">
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    href="/blog"
                    className="article-info__category-badge"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Recent Posts Section Component
 */
function RecentPostsSection({ posts }) {
  if (posts.length === 0) return null;

  return (
    <div className="sidebar-card">
      <h4 className="sidebar-card__title">Recent Posts</h4>
      <div className="recent-posts-list">
        {posts.map(post => (
          <RecentPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

/**
 * Categories Section Component
 */
function CategoriesSection({ categories }) {
  if (categories.length === 0) return null;

  return (
    <div className="sidebar-card">
      <h4 className="sidebar-card__title">📂 Categories</h4>
      <div className="categories-list">
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/blog?category=${cat.slug || cat.id}`}
            className="categories-list__item"
          >
            → {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Tags Section Component
 */
function TagsSection({ tags }) {
  if (tags.length === 0) return null;

  return (
    <div className="sidebar-card">
      <h4 className="sidebar-card__title">🏷 Tags</h4>
      <div className="tags-list">
        {tags.map(tag => (
          <Link
            key={tag.id}
            href={`/blog?tag=${tag.slug || tag.id}`}
            className="tags-list__item"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Sidebar Content Component
 */
function SidebarContent({ blog, recentPosts, date, readTime }) {
  return (
    <>
      <ArticleInfoBox
        date={date}
        readTime={readTime}
        categories={blog.categories || []}
      />
      <RecentPostsSection posts={recentPosts} />
      <CategoriesSection categories={blog.categories || []} />
      <TagsSection tags={blog.tags || []} />
    </>
  );
}

/**
 * Loading State Component
 */
function LoadingState() {
  return (
    <div className="loading-state">
      <div className="loading-state__spinner" />
      <p className="loading-state__text">Loading article…</p>
    </div>
  );
}

/**
 * Not Found State Component
 */
function NotFoundState() {
  return (
    <div className="not-found-state">
      <div className="not-found-state__icon">📄</div>
      <h2 className="not-found-state__title">Article Not Found</h2>
      <p className="not-found-state__description">
        This post may have been removed or the URL is incorrect.
      </p>
      <Link href="/blog" className="not-found-state__button">
        ← Back to Blog
      </Link>
    </div>
  );
}

/**
 * Blog Meta Bar Component (categories, date, read time)
 */
function BlogMetaBar({ categories, date, readTime }) {
  return (
    <div className="blog-meta-bar">
      {categories.map(cat => (
        <Link
          key={cat.id}
          href={`/blog?category=${cat.slug}`}
          className="blog-meta-bar__category"
        >
          {cat.name}
        </Link>
      ))}
      <span className="blog-meta-bar__date">📅 {date}</span>
      <span className="blog-meta-bar__read-time">⏱ {readTime} min read</span>
    </div>
  );
}

/**
 * Tags Footer Component
 */
function TagsFooter({ tags }) {
  if (tags.length === 0) return null;

  return (
    <div className="tags-footer">
      <span className="tags-footer__label">TAGS:</span>
      <div className="tags-footer__list">
        {tags.map(tag => (
          <Link
            key={tag.id}
            href={`/blog?tag=${tag.slug}`}
            className="tags-footer__tag"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Article Footer Component (Back, Share, Copy)
 */
function ArticleFooter({ blog }) {
  const handleShare = () => {
    const url = window.location.href;
    const text = blog.title;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  return (
    <div className="article-footer">
      <Link href="/blog" className="article-footer__back-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Blog
      </Link>

      <div className="article-footer__actions">
        <button onClick={handleShare} className="article-footer__action-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.23H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63z" />
          </svg>
          Share
        </button>
        <button onClick={handleCopyLink} className="article-footer__action-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Copy Link
        </button>
      </div>
    </div>
  );
}

/**
 * Related Posts Section Component
 */
function RelatedPostsSection({ posts }) {
  if (posts.length === 0) return null;

  return (
    <div className="related-posts-section">
      <div className="section-tag">More Articles</div>
      <div className="related-posts-grid">
        {posts.slice(0, 3).map(post => {
          const imageUrl = getImageUrl(post.featured_image);
          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="related-post-card"
            >
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="related-post-card__image"
                />
              )}
              <div className="related-post-card__content">
                <p className="related-post-card__date">
                  {formatDate(post.published_at || post.created_at)}
                </p>
                <p className="related-post-card__title">{post.title}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Mobile Drawer Component
 */
function MobileDrawer({ isOpen, onClose, blog, recentPosts, date, readTime }) {
  return (
    <>
      {isOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div className={`mobile-drawer ${isOpen ? 'mobile-drawer--open' : ''}`}>
        <div className="mobile-drawer__header">
          <h3 className="mobile-drawer__title">📋 Filters & Info</h3>
          <button
            className="mobile-drawer__close-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>
        <div className="mobile-drawer__content">
          <div className="section-tag">📋 Article Info & More</div>
          <SidebarContent
            blog={blog}
            recentPosts={recentPosts}
            date={date}
            readTime={readTime}
          />
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Fetch Blog Data ──
  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setNotFound(false);

    fetch(`${API_URL}/api/blogs`)
      .then(res => res.json())
      .then(data => {
        const blogs = Array.isArray(data) ? data : (data.data || []);
        const foundBlog = blogs.find(b => b.slug === slug);

        if (!foundBlog) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setBlog(foundBlog);
        setRecentPosts(blogs.filter(b => b.slug !== slug).slice(0, 5));
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [slug]);

  // ── Scroll to Top ──
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // ── Intersection Observer for Content Animation ──
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setContentVisible(true);
        }
      },
      { threshold: 0.05 }
    );

    const contentElement = document.querySelector('[data-section="content"]');
    if (contentElement) {
      observer.observe(contentElement);
    }

    return () => observer.disconnect();
  }, [loading]);

  // ── Loading State ──
  if (loading) {
    return <LoadingState />;
  }

  // ── Not Found State ──
  if (notFound) {
    return <NotFoundState />;
  }

  const imageUrl = getImageUrl(blog.featured_image);
  const date = formatDate(blog.published_at || blog.created_at);
  const readTime = calculateReadTime(blog.content);

  return (
    <div className="blog-detail-page">
      <style>{`
        /* ═══════════════════════════════════════════════════════════════════ */
        /* GLOBAL STYLES */
        /* ═══════════════════════════════════════════════════════════════════ */

        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Nunito:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body {
          width: 100%;
          overflow-x: hidden;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* ANIMATIONS */
        /* ═══════════════════════════════════════════════════════════════════ */

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bannerIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* CONTAINER */
        /* ═══════════════════════════════════════════════════════════════════ */

        .blog-detail-page {
          background: #f5f7fa;
          min-height: 100vh;
          font-family: 'Nunito', sans-serif;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* BANNER SECTION */
        /* ═══════════════════════════════════════════════════════════════════ */

        .blog-banner {
          position: relative;
          height: 210px;
          background: linear-gradient(135deg, #0a214f 0%, #1872B5 55%, #2596e1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .blog-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E") repeat;
          animation: shimmer 8s linear infinite;
        }

        .blog-banner__orb {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 70%);
          left: -60px;
          bottom: -60px;
        }

        .blog-banner__orb-2 {
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
          right: -40px;
          top: -40px;
        }

        .blog-banner__content {
          position: relative;
          z-index: 2;
          text-align: center;
          animation: bannerIn 0.7s ease both;
          padding: 0 24px;
        }

        .blog-banner__subtitle {
          color: rgba(255, 255, 255, 0.65);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .blog-banner__title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(22px, 4vw, 36px);
          font-weight: 800;
          color: #fff;
          line-height: 1.3;
          margin: 0;
          text-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
          max-width: 700px;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* BREADCRUMB SECTION */
        /* ═══════════════════════════════════════════════════════════════════ */

        .breadcrumb-section {
          background: #1872B5;
          padding: 10px 0;
        }

        .breadcrumb {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.75);
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }

        .breadcrumb__link {
          color: rgba(255, 255, 255, 0.75);
          text-decoration: none;
          transition: color 0.2s;
        }

        .breadcrumb__link:hover {
          color: #fff;
        }

        .breadcrumb__separator {
          opacity: 0.5;
          margin: 0 2px;
        }

        .breadcrumb__current {
          color: #fff;
          font-weight: 700;
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* SECTION TAG */
        /* ═══════════════════════════════════════════════════════════════════ */

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

        /* ═══════════════════════════════════════════════════════════════════ */
        /* LAYOUT */
        /* ═══════════════════════════════════════════════════════════════════ */

        .blog-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px 60px;
        }

        .blog-layout__main {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .blog-layout__sidebar {
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 900px) {
          .blog-layout {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 28px 16px 48px;
          }

          .blog-layout__sidebar {
            display: none;
          }
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* ARTICLE HEADER */
        /* ═══════════════════════════════════════════════════════════════════ */

        .article-header {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
        }

        .article-header__tag {
          align-self: flex-start;
        }

        .article-header__title {
          font-family: 'Sora', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #0a214f;
          line-height: 1.35;
          margin: 0;
        }

        .article-header__divider {
          width: 40px;
          height: 3px;
          background: linear-gradient(135deg, #1872B5, #2596e1);
          border-radius: 2px;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* ARTICLE CARD */
        /* ═══════════════════════════════════════════════════════════════════ */

        .article-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 40px rgba(24, 114, 181, 0.1);
          overflow: hidden;
          animation: fadeUp 0.7s ease both;
        }

        .article-card.article-card--reveal {
          opacity: 0;
        }

        .article-card.article-card--revealed {
          animation: fadeUp 0.7s ease both;
        }

        .article-card__image {
          width: 100%;
          max-height: 420px;
          object-fit: cover;
          display: block;
          animation: bannerIn 0.8s ease both;
        }

        .article-card__meta {
          padding: 20px 36px 0;
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          align-items: center;
        }

        .article-card__body {
          padding: 28px 36px;
        }

        .article-card__footer {
          padding: 20px 36px;
          border-top: 1px solid #dbeafe;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* BLOG META BAR */
        /* ═══════════════════════════════════════════════════════════════════ */

        .blog-meta-bar {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          align-items: center;
        }

        .blog-meta-bar__category {
          background: #1872B5;
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 14px;
          border-radius: 20px;
          text-decoration: none;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: background 0.2s;
        }

        .blog-meta-bar__category:hover {
          background: #0a5c9f;
        }

        .blog-meta-bar__date,
        .blog-meta-bar__read-time {
          font-size: 13px;
          font-weight: 700;
        }

        .blog-meta-bar__date {
          color: #1872B5;
        }

        .blog-meta-bar__read-time {
          color: #6b7280;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* BLOG PROSE (CONTENT) */
        /* ═══════════════════════════════════════════════════════════════════ */

        .blog-prose {
          line-height: 1.85;
          color: #374151;
        }

        .blog-prose h1,
        .blog-prose h2,
        .blog-prose h3,
        .blog-prose h4,
        .blog-prose h5,
        .blog-prose h6 {
          font-family: 'Sora', sans-serif;
          color: #0a214f;
          font-weight: 700;
          margin: 2em 0 0.75em;
          line-height: 1.35;
        }

        .blog-prose h1 { font-size: 28px; }
        .blog-prose h2 {
          font-size: 22px;
          padding-bottom: 10px;
          border-bottom: 2px solid #dbeafe;
        }
        .blog-prose h3 {
          font-size: 18px;
          color: #1872B5;
        }
        .blog-prose h4 { font-size: 16px; }

        .blog-prose p {
          font-size: 15.5px;
          margin-bottom: 1.2em;
        }

        .blog-prose ul,
        .blog-prose ol {
          padding-left: 28px;
          margin-bottom: 1.2em;
        }

        .blog-prose li {
          font-size: 15.5px;
          margin-bottom: 0.4em;
        }

        .blog-prose strong,
        .blog-prose b {
          color: #0a214f;
          font-weight: 700;
        }

        .blog-prose a {
          color: #1872B5;
          text-decoration: underline;
          transition: color 0.2s;
        }

        .blog-prose a:hover {
          color: #0a214f;
        }

        .blog-prose img {
          max-width: 100%;
          border-radius: 12px;
          margin: 1.5em 0;
        }

        .blog-prose blockquote {
          border-left: 4px solid #1872B5;
          padding: 12px 20px;
          margin: 1.5em 0;
          background: #eff6ff;
          border-radius: 0 8px 8px 0;
        }

        .blog-prose blockquote p {
          color: #1872B5;
          font-style: italic;
          margin: 0;
        }

        .blog-prose pre {
          background: #0a214f;
          color: #e5e7eb;
          padding: 20px;
          border-radius: 10px;
          overflow-x: auto;
          margin: 1.2em 0;
          font-size: 14px;
        }

        .blog-prose code {
          background: #eff6ff;
          color: #1872B5;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 14px;
        }

        .blog-prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.2em 0;
        }

        .blog-prose th,
        .blog-prose td {
          border: 1px solid #dbeafe;
          padding: 10px 14px;
          text-align: left;
          font-size: 14px;
        }

        .blog-prose th {
          background: #eff6ff;
          font-weight: 700;
          color: #0a214f;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* TAGS FOOTER */
        /* ═══════════════════════════════════════════════════════════════════ */

        .tags-footer {
          padding: 0 36px 28px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .tags-footer__label {
          font-size: 12px;
          color: #9ca3af;
          font-weight: 700;
          margin-right: 4px;
        }

        .tags-footer__list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tags-footer__tag {
          background: #eff6ff;
          color: #1872B5;
          font-size: 12px;
          font-weight: 700;
          padding: 5px 14px;
          border-radius: 20px;
          border: 1px solid #bfdbfe;
          text-decoration: none;
          transition: all 0.2s;
        }

        .tags-footer__tag:hover {
          background: #1872B5;
          color: #fff;
          border-color: #1872B5;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* ARTICLE FOOTER */
        /* ═══════════════════════════════════════════════════════════════════ */

        .article-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding: 20px 36px;
          border-top: 1px solid #dbeafe;
        }

        .article-footer__back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1872B5;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          transition: gap 0.2s;
        }

        .article-footer__back-btn:hover {
          gap: 12px;
        }

        .article-footer__actions {
          display: flex;
          gap: 8px;
        }

        .article-footer__action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1.5px solid #dbeafe;
          color: #555;
          font-size: 13px;
          font-weight: 700;
          padding: 9px 18px;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Nunito', sans-serif;
        }

        .article-footer__action-btn:hover {
          border-color: #1872B5;
          color: #1872B5;
        }

        .article-footer__action-btn:active {
          transform: scale(0.98);
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* RELATED POSTS SECTION */
        /* ═══════════════════════════════════════════════════════════════════ */

        .related-posts-section {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 40px rgba(24, 114, 181, 0.1);
          padding: 28px;
          animation: fadeUp 0.7s ease both;
        }

        .related-posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        .related-post-card {
          border: 1.5px solid #dbeafe;
          border-radius: 14px;
          overflow: hidden;
          text-decoration: none;
          transition: all 0.25s;
          display: flex;
          flex-direction: column;
        }

        .related-post-card:hover {
          border-color: #1872B5;
          box-shadow: 0 4px 20px rgba(24, 114, 181, 0.15);
        }

        .related-post-card__image {
          width: 100%;
          height: 140px;
          object-fit: cover;
        }

        .related-post-card__content {
          padding: 14px 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .related-post-card__date {
          font-size: 12px;
          color: #1872B5;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .related-post-card__title {
          font-size: 14px;
          font-weight: 700;
          color: #0a214f;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* SIDEBAR */
        /* ═══════════════════════════════════════════════════════════════════ */

        .sidebar-wrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sidebar-back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #1872B5;
          color: #fff;
          padding: 12px 20px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
          transition: background 0.2s;
        }

        .sidebar-back-btn:hover {
          background: #0a5c9f;
        }

        .sidebar-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(24, 114, 181, 0.1);
          padding: 22px;
        }

        .sidebar-card__title {
          font-family: 'Sora', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #0a214f;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid #dbeafe;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* ARTICLE INFO */
        /* ═══════════════════════════════════════════════════════════════════ */

        .article-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .article-info__item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .article-info__icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: #eff6ff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .article-info__content {
          flex: 1;
          min-width: 0;
        }

        .article-info__label {
          font-size: 10px;
          color: #9ca3af;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 0 0 4px;
        }

        .article-info__value {
          font-size: 13px;
          color: #0a214f;
          font-weight: 700;
          margin: 0;
        }

        .article-info__categories {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .article-info__category-badge {
          background: #1872B5;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 12px;
          text-decoration: none;
          transition: background 0.2s;
        }

        .article-info__category-badge:hover {
          background: #0a5c9f;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* RECENT POSTS LIST */
        /* ═══════════════════════════════════════════════════════════════════ */

        .recent-posts-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .recent-post-card {
          text-decoration: none;
          display: block;
          border-bottom: 1px solid #dbeafe;
          padding: 12px 0;
          transition: opacity 0.2s;
        }

        .recent-post-card:last-child {
          border-bottom: none;
        }

        .recent-post-card:hover {
          opacity: 0.75;
        }

        .recent-post-card__wrapper {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .recent-post-card__image {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .recent-post-card__content {
          flex: 1;
          min-width: 0;
        }

        .recent-post-card__title {
          font-size: 12.5px;
          font-weight: 700;
          color: #0a214f;
          line-height: 1.45;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .recent-post-card__date {
          font-size: 11px;
          color: #1872B5;
          font-weight: 600;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* CATEGORIES LIST */
        /* ═══════════════════════════════════════════════════════════════════ */

        .categories-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .categories-list__item {
          padding: 10px 14px;
          background: #f0f7ff;
          border: 1px solid #bfdbfe;
          border-radius: 10px;
          color: #1872B5;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
          display: block;
        }

        .categories-list__item:hover {
          background: #1872B5;
          color: #fff;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* TAGS LIST */
        /* ═══════════════════════════════════════════════════════════════════ */

        .tags-list {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .tags-list__item {
          padding: 5px 12px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 14px;
          color: #1872B5;
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          transition: all 0.2s;
          display: inline-block;
        }

        .tags-list__item:hover {
          background: #1872B5;
          color: #fff;
          border-color: #1872B5;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* LOADING STATE */
        /* ═══════════════════════════════════════════════════════════════════ */

        .loading-state {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 16px;
          font-family: 'Nunito', sans-serif;
        }

        .loading-state__spinner {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 4px solid #dbeafe;
          border-top-color: #1872B5;
          animation: spin 0.8s linear infinite;
        }

        .loading-state__text {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* NOT FOUND STATE */
        /* ═══════════════════════════════════════════════════════════════════ */

        .not-found-state {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          font-family: 'Nunito', sans-serif;
        }

        .not-found-state__icon {
          font-size: 64px;
        }

        .not-found-state__title {
          font-size: 22px;
          font-weight: 800;
          color: #0a214f;
          margin: 0;
        }

        .not-found-state__description {
          color: #9ca3af;
          font-size: 14px;
          margin: 0;
        }

        .not-found-state__button {
          margin-top: 12px;
          background: #1872B5;
          color: #fff;
          padding: 12px 28px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
          transition: background 0.2s;
          display: inline-block;
        }

        .not-found-state__button:hover {
          background: #0a5c9f;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* MOBILE FILTER BUTTON */
        /* ═══════════════════════════════════════════════════════════════════ */

        .mobile-filter-btn {
          display: none;
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 12px 18px;
          border-radius: 50px;
          background: #1872B5;
          color: #fff;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Nunito', sans-serif;
          z-index: 40;
          box-shadow: 0 4px 20px rgba(24, 114, 181, 0.3);
          transition: all 0.3s;
        }

        .mobile-filter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 28px rgba(24, 114, 181, 0.4);
        }

        .mobile-filter-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 900px) {
          .mobile-filter-btn {
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* MOBILE DRAWER */
        /* ═══════════════════════════════════════════════════════════════════ */

        .mobile-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 33, 79, 0.5);
          z-index: 98;
          animation: fadeInOverlay 0.3s ease;
          backdrop-filter: blur(2px);
        }

        .mobile-drawer {
          position: fixed;
          right: -100%;
          top: 0;
          bottom: 0;
          width: 320px;
          background: #fff;
          z-index: 99;
          overflow-y: auto;
          transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
        }

        .mobile-drawer--open {
          right: 0;
        }

        .mobile-drawer__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #dbeafe;
          position: sticky;
          top: 0;
          background: #fff;
          z-index: 101;
        }

        .mobile-drawer__title {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          color: #0a214f;
          font-family: 'Sora', sans-serif;
        }

        .mobile-drawer__close-btn {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .mobile-drawer__close-btn:hover {
          background: #f0f7ff;
          color: #1872B5;
        }

        .mobile-drawer__content {
          padding: 20px;
        }

        /* ═══════════════════════════════════════════════════════════════════ */
        /* RESPONSIVE DESIGN */
        /* ═══════════════════════════════════════════════════════════════════ */
.blog-banner__title {
    font-family: 'Sora', sans-serif;
    font-size: clamp(22px, 4vw, 36px);
    font-weight: 800;
    color: #fff;
    line-height: 1.3;
    margin: 0;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
    max-width: 700px;
    font-size: 30px;
}
.section-tag {
    width: auto;
    display: none;
}
.article-header__title {
    font-family: 'Sora', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: #0a214f;
    line-height: 1.35;
    margin: 0;
}
.article-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: -11px;
}
.blog-meta-bar {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
    align-items: center;
}
.article-card__body {
    padding: 15px 36px;
}
.blog-prose p {
    font-size: 14px;
    margin-bottom: 10px;
    line-height: 20px;
}
.tags-footer {
    padding: 0 36px 14px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
}
.article-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 9px 36px;
    border-top: 1px solid #dbeafe;
}
.related-post-card__title {
    font-size: 11px;
    font-weight: 700;
    color: #0a214f;
    line-height: 14px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
}
.related-post-card__date {
    font-size: 12px;
    color: #1872B5;
    font-weight: 700;
    margin-bottom: 1px;
}


        @media (max-width: 768px) {
          .blog-banner {
            height: 155px;
          }

          .blog-banner__title {
            font-size: clamp(18px, 3vw, 28px);
          }

          .blog-banner__subtitle {
            font-size: 12px;
          }

          .article-card__meta,
          .article-card__body,
          .article-card__footer,
          .tags-footer {
            padding-left: 24px;
            padding-right: 24px;
          }

          .article-footer {
            padding-left: 24px;
            padding-right: 24px;
          }

          .related-posts-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 16px;
          }
        }

        @media (max-width: 640px) {
          .blog-banner {
            height: 140px;
          }

          .blog-banner__title {
            font-size: clamp(16px, 2.5vw, 24px);
          }

          .breadcrumb {
            font-size: 12px;
            padding: 0 16px;
          }

          .blog-layout {
            padding: 24px 16px 40px;
          }

          .article-header__title {
            font-size: 20px;
          }

          .article-card__meta {
            padding: 16px 20px 0;
            gap: 12px;
          }

          .article-card__body {
            padding: 20px;
            font-size: 14.5px;
          }

          .article-card__footer,
          .tags-footer {
            padding: 16px 20px;
          }

          .article-footer {
            padding: 16px 20px;
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .article-footer__back-btn,
          .article-footer__actions {
            width: 100%;
          }

          .article-footer__actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .article-footer__action-btn {
            padding: 8px 12px;
            font-size: 12px;
          }

          .related-posts-section {
            padding: 20px;
          }

          .related-posts-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .related-post-card__image {
            height: 120px;
          }

          .sidebar-card {
            padding: 18px;
          }

          .sidebar-card__title {
            font-size: 14px;
            margin-bottom: 12px;
          }

          .blog-prose h2 {
            font-size: 18px;
          }

          .blog-prose h3 {
            font-size: 16px;
          }

          .blog-prose p {
            font-size: 14.5px;
          }

          .mobile-drawer {
            width: 280px;
          }
        }

        @media (max-width: 767px) {
          .blog-banner {
            height: 120px;
          }

          .blog-banner__title {
            font-size: clamp(14px, 2vw, 20px);
          }

          .blog-banner__subtitle {
            font-size: 10px;
            margin-bottom: 4px;
          }

          .blog-layout {
            padding: 16px 12px 32px;
          }

          .article-header__title {
            font-size: 18px;
          }

          .article-card__meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .article-card__body {
            padding: 16px;
          }

          .blog-prose {
            font-size: 14px;
          }

          .mobile-drawer {
            width: 100%;
            max-width: 320px;
          }

          .related-posts-grid {
            grid-template-columns: 1fr;
          }

          .mobile-filter-btn {
            bottom: 16px;
            right: 16px;
            padding: 10px 14px;
            font-size: 12px;
          }
          .article-header__title {
    font-size: 14px;
}

.blog-meta-bar__category {
    background: #1872B5;
    color: #fff;
    font-size: 7px;
    font-weight: 800;
    padding: 4px 5px;
    border-radius: 20px;
    text-decoration: none;
    letter-spacing: normal;
    text-transform: uppercase;
    transition: background 0.2s;
}
.blog-meta-bar__date, .blog-meta-bar__read-time {
    font-size: 11px;
    font-weight: 700;
}
.blog-prose p {
    font-size: 14px;
}
.tags-footer__tag {
    background: #eff6ff;
    color: #1872B5;
    font-size: 9px;
    font-weight: 700;
    padding: 1px 8px;
    border-radius: 20px;
    border: 1px solid #bfdbfe;
    text-decoration: none;
    transition: all 0.2s;
}
.mobile-drawer {
    position: fixed;
    right: -100%;
    top: 0;
    bottom: 0;
    width: 320px;
    background: #fff;
    z-index: 99999;
    overflow-y: auto;
    transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
}
        }
      `}</style>

      {/* ── Banner ── */}
      <div className="blog-banner">
        <div className="blog-banner__orb" />
        <div className="blog-banner__orb-2" />
        <div className="blog-banner__content">
          <p className="blog-banner__subtitle">Our Journal</p>
          <h1 className="blog-banner__title">{blog.title}</h1>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="breadcrumb-section">
        <nav className="breadcrumb">
          <Link href="/" className="breadcrumb__link">Home</Link>
          <span className="breadcrumb__separator">›</span>
          <Link href="/blog" className="breadcrumb__link">Blog</Link>
          <span className="breadcrumb__separator">›</span>
          <span className="breadcrumb__current">{blog.title}</span>
        </nav>
      </div>

      {/* ── Main Layout ── */}
      <div className="blog-layout">

        {/* ── Main Content ── */}
        <main className="blog-layout__main">

          {/* Article Header */}
          <div className="article-header">
            <div className="section-tag">Article</div>
            <h2 className="article-header__title">{blog.title}</h2>
            <div className="article-header__divider" />
          </div>

          {/* Article Card */}
          <article
            className={`article-card article-card--reveal ${contentVisible ? 'article-card--revealed' : ''}`}
            data-section="content"
          >
            {/* Featured Image */}
            {imageUrl && (
              <img
                src={imageUrl}
                alt={blog.image_alt_tag || blog.title}
                className="article-card__image"
              />
            )}

            {/* Meta Bar */}
            <div className="article-card__meta">
              <BlogMetaBar
                categories={blog.categories || []}
                date={date}
                readTime={readTime}
              />
            </div>

            {/* Article Body */}
            <div
              className="article-card__body blog-prose"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Tags Footer */}
            <TagsFooter tags={blog.tags || []} />

            {/* Article Footer */}
            <ArticleFooter blog={blog} />
          </article>

          {/* Related Posts */}
          <RelatedPostsSection posts={recentPosts} />

        </main>

        {/* ── Sidebar (Desktop) ── */}
        <aside className="blog-layout__sidebar">
          <div className="sidebar-wrapper">
            <Link href="/blog" className="sidebar-back-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to All Posts
            </Link>

            <SidebarContent
              blog={blog}
              recentPosts={recentPosts}
              date={date}
              readTime={readTime}
            />
          </div>
        </aside>

      </div>

      {/* ── Mobile Filter Button ── */}
      <button
        className="mobile-filter-btn"
        onClick={() => setDrawerOpen(true)}
        title="Open Filters"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
        Filter
      </button>

      {/* ── Mobile Drawer ── */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        blog={blog}
        recentPosts={recentPosts}
        date={date}
        readTime={readTime}
      />

    </div>
  );
}
