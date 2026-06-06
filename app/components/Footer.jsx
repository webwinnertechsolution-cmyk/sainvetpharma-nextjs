const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Footer({ footerNew }) {
  const f = footerNew;
  const logoUrl = f?.col1_logo
    ? `${API_URL}/uploads/footer/${f.col1_logo}`
    : null;

  return (
    <>
      <style>{`
        .footer-wrap {
          background-color: #030f27;
          padding: 60px 0 0;
        }
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
        }
        .footer-row {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -15px;
        }
        .footer-col-1 { width: 50%; padding: 0 15px 40px; box-sizing: border-box; }
        .footer-col-2 { width: 20%; padding: 0 15px 40px; box-sizing: border-box; }
        .footer-col-3 { width: 30%; padding: 0 15px 40px; box-sizing: border-box; }
        .footer-heading {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 12px;
          position: relative;
          font-family: 'Inter', sans-serif;
        }
        .footer-heading::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 107px; height: 1px;
          background: #fff;
        }
        .footer-content {
          color: rgba(255,255,255,0.75);
          font-size: 14px;
          line-height: 21px;
          font-family: 'Inter', sans-serif;
        }
        .footer-content a { color: #fff !important; text-decoration: none; }
        .footer-logo { margin-bottom: 16px; }
        .footer-logo img { max-height: 82px; max-width: 199px; object-fit: contain; }
        .footer-social {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 20px;
        }
        .footer-social a {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 15px;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s;
        }
        .footer-social a:hover { opacity: 0.8; transform: translateY(-2px); }
        .s-fb  { background: #1877f2; }
        .s-ig  { background: linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888); }
        .s-tw  { background: #000; }
        .s-yt  { background: #ff0000; }
        .s-li  { background: #0a66c2; }
        .s-wa  { background: #25d366; }
        .footer-links { list-style: none; padding: 0; margin: 0; }
        .footer-links li { margin-bottom: 3px; }
        .footer-links li a {
          color: rgba(255,255,255,0.75) !important;
          text-decoration: none;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s;
          padding: 5px 0;
        }
        .footer-links li a:hover { color: #fff !important; }
        .footer-copyright {
          background: rgba(0,0,0,0.3);
          margin-top: 10px;
          padding: 18px 0;
          text-align: center;
        }
        .footer-copyright p {
          color: rgba(255,255,255,0.6);
          margin: 0;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
        }
		.footer-wrap {
    background-color: #1872B5;
    padding: 60px 0 0;
}
.footer-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
}
.footer-logo img {
    max-height: 120px;
    max-width: 260px;
    object-fit: contain;
    margin-bottom: -16px;
}
.footer-copyright a {
    color: #86c036;
    text-decoration: none;
}.footer-copyright a {
    color: #86c036;
    text-decoration: none;
}
		.footer-col-1 {
    width: 50%;
    padding: 0 15px 40px;
    box-sizing: border-box;
    padding-right: 86px;
}
        @media (max-width: 767px) {
          .footer-col-1, .footer-col-2, .footer-col-3 {
            width: 100%;
            padding-bottom: 25px;
          }
		  .footer-wrap {
    background-color: #1872B5;
    padding: 27px 0 0;
}

.footer-col-1 {
    width: 50%;
    padding: 0;
    box-sizing: border-box;
    padding-right: 0px;
}
.footer-content {
    color: rgba(255,255,255,0.75);
    font-size: 12px;
    line-height: 17px;
    font-family: 'Inter', sans-serif;
}
.footer-col-1, .footer-col-2, .footer-col-3 {
    width: 100%;
    padding-bottom: 15px;
}
.footer-col-1, .footer-col-2, .footer-col-3 {
    width: 100%;
    padding-bottom: 12px;
}
.footer-heading {
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 12px;
    padding-bottom: 5px;
    position: relative;
    font-family: 'Inter', sans-serif;
}
.footer-links li a {
    color: rgba(255,255,255,0.75) !important;
    text-decoration: none;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: color 0.2s;
    padding: 1px 0;
}
.footer-col-3 {
    width: 30%;
    padding: 0;
    box-sizing: border-box;
}
.footer-row {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -15px;
    padding-inline: 10px;
}

.footer-col-1, .footer-col-2, .footer-col-3 {
    width: 100%;
    padding-bottom: 12px;
    padding-inline: 0;
}
.footer-col-3 {
    width: 1oo;
    padding: 0;
    box-sizing: border-box;
}


        }
      `}</style>

      <footer className="footer-wrap">
        <div className="footer-container">
          <div className="footer-row">

            {/* Column 1 */}
            <div className="footer-col-1">
              {logoUrl && (
                <div className="footer-logo">
                  <img src={logoUrl} alt="Logo" />
                </div>
              )}
              {f?.col1_content && (
                <div
                  className="footer-content"
                  dangerouslySetInnerHTML={{ __html: f.col1_content }}
                />
              )}
              
            </div>

            {/* Column 2 */}
            <div className="footer-col-2">
              {f?.col2_heading && (
                <h5 className="footer-heading">{f.col2_heading}</h5>
              )}
              {f?.col2_links?.length > 0 && (
                <ul className="footer-links">
                  {f.col2_links.map((link, i) => (
                    link.title && (
                      <li key={i}>
                        <a href={link.url || '#'}>
                          › {link.title}
                        </a>
                      </li>
                    )
                  ))}
                </ul>
              )}
            </div>

            {/* Column 3 */}
           <div className="footer-col-3">
  {f?.col3_heading && (
    <h5 className="footer-heading">{f.col3_heading}</h5>
  )}
  {f?.col3_content && (
    <div
      className="footer-content"
      dangerouslySetInnerHTML={{ __html: f.col3_content }}
    />
  )}
  <div className="footer-social">
    {f?.col1_social_facebook && (
      <a href={f.col1_social_facebook} target="_blank" rel="noopener" className="s-fb" title="Facebook">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
      </a>
    )}
    {f?.col1_social_instagram && (
      <a href={f.col1_social_instagram} target="_blank" rel="noopener" className="s-ig" title="Instagram">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      </a>
    )}
    {f?.col1_social_twitter && (
      <a href={f.col1_social_twitter} target="_blank" rel="noopener" className="s-tw" title="X">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
    )}
    {f?.col1_social_youtube && (
      <a href={f.col1_social_youtube} target="_blank" rel="noopener" className="s-yt" title="YouTube">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="white" d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
          <polygon fill="#ff0000" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
          <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
        </svg>
      </a>
    )}
    {f?.col1_social_linkedin && (
      <a href={f.col1_social_linkedin} target="_blank" rel="noopener" className="s-li" title="LinkedIn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect x="2" y="9" width="4" height="12"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
      </a>
    )}
    {f?.col1_social_whatsapp && (
      
        href={`https://wa.me/${f.col1_social_whatsapp.replace(/[^0-9]/g, '')}`}
        target="_blank" rel="noopener" className="s-wa" title="WhatsApp"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      </a>
    )}
  </div>
</div>

          </div>
        </div>

        {/* Copyright */}
        <div className="footer-copyright">
          <p>
            © {new Date().getFullYear()} Design & Developed by{' '}
            <a href="https://web-winners.com/" target="_blank" rel="noopener">
              Web Winners
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
