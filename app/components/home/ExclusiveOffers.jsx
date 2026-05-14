'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ExclusiveOffers = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const [industries, setIndustries] = useState([]);

  // Color scheme for different categories
  const colorSchemes = [
    { badgeBg: '#FF8C00' },
    { badgeBg: '#E74C3C' },
    { badgeBg: '#27AE60' },
  ];

  useEffect(() => {
    // Fetch industries-we-serve data
    fetch(`${API_URL}/api/industries-we-serve`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setIndustries(data);
        } else if (data && typeof data === 'object') {
          setIndustries([data]);
        }
      })
      .catch((err) => console.error('Industries fetch error:', err));
  }, []);

  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `${API_URL}/uploads/industries/${imageName}`;
  };

  const getColorScheme = (index) => {
    return colorSchemes[index % colorSchemes.length];
  };

  if (industries.length === 0) return null;

  return (
    <section className="exclusive-offers-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        .exclusive-offers-wrapper {
          position: relative;
          width: 100%;
          overflow: hidden;
          margin: 60px 0;
          padding: 0 20px;
        }

        .offers-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .offers-heading {
          text-align: center;
          margin-bottom: 50px;
        }

        .offers-heading h2 {
          font-size: 36px;
          font-weight: 800;
          color: #0a214f;
          margin: 0;
          font-family: 'Sora', sans-serif;
          letter-spacing: -0.8px;
        }

        .offers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          width: 100%;
          max-width: 1400px;
        }

        /* Full Background Image Card */
        .offer-item {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          height: 560px;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          background-size: cover;
          background-position: center;
          color: inherit;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .offer-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          
          z-index: 1;
          transition: all 0.35s ease;
        }

        .offer-item:hover::before {
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(255, 255, 255, 0.7) 30%,
            rgba(255, 255, 255, 0) 100%
          );
        }

        .offer-item:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
          text-decoration: none;
          color: inherit;
        }

        .offer-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          color: white;
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          font-family: 'Sora', sans-serif;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        /* Content Overlay - Bottom */
        .offer-content {
          position: relative;
          z-index: 2;
          padding: 32px 28px 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .offer-title {
          font-size: 24px;
          font-weight: 800;
          color: #0a214f;
          margin: 0;
          line-height: 1.3;
          font-family: 'Sora', sans-serif;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .offer-divider {
          width: 50px;
          height: 3px;
          background: #1872B5!important;
          margin: 0;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .offer-item:hover .offer-divider {
          width: 70px;
        }

        .offer-description {
          font-size: 14px;
          color: #333;
          line-height: 1.6;
          margin: 0;
          font-family: 'Nunito', sans-serif;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ✅ FIX: Style HTML content inside description */
        .offer-description p {
          margin: 0;
          font-size: 14px;
          color: #333;
          line-height: 1.6;
          font-family: 'Nunito', sans-serif;
        }

        .offer-description h3 {
          margin: 0;
          font-size: 14px;
          color: #333;
          line-height: 1.6;
          font-family: 'Nunito', sans-serif;
        }

        .offer-description strong {
          font-weight: 600;
        }

        .offer-button {
          display: inline-flex;
          align-items: center;
          background: linear-gradient(135deg, #FF8C00 0%, #FF6B35 100%);
          color: white;
          padding: 11px 22px;
          border-radius: 6px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-family: 'Sora', sans-serif;
          width: fit-content;
          box-shadow: 0 4px 12px rgba(255, 140, 0, 0.25);
          margin-top: 8px;
        }

        .offer-item:hover .offer-button {
          box-shadow: 0 8px 24px rgba(255, 140, 0, 0.35);
          transform: translateX(4px);
        }

        .offer-button:hover {
          background: linear-gradient(135deg, #FF6B35 0%, #E84C0B 100%);
          text-decoration: none;
          color: white;
        }
		.offer-badge {
    display: none;
}
.offer-item {
    position: relative;
    overflow: hidden;
    border-radius: 16px;
    height: 560px;
    cursor: pointer;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    background-size: cover;
    background-position: center;
    color: inherit;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    text-align: center;
}
.offer-content {
    position: relative;
    z-index: 2;
    padding: 32px 28px 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
}

.offer-button {
    display: none;
}
.offer-content {
    position: relative;
    z-index: 2;
    padding: 32px 28px 28px;
    display: flex;
    flex-direction: column;
    gap: 11px;
    align-items: center;
    padding-top: 46px;
}
.offers-heading h2 {
    font-size: 27px;
    font-weight: 800;
    color: #0a214f;
    margin: 0;
    font-family: 'Sora', sans-serif;
     letter-spacing:normal; 
    margin-bottom: -17px;
}
.offers-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
}
.offers-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0px;
    width: 100%;
    max-width: 1400px;
}
.offer-item {
    position: relative;
    overflow: hidden;
    border-radius: 0px;
    height: 560px;
    cursor: pointer;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    background-size: cover;
    background-position: center;
    color: inherit;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    text-align: center;
}
.offers-heading p {
    font-size: 17px;
    color: #1872B5;
    margin: 6px 0 0;
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
    margin-top: 18px;
    margin-bottom: -19px;
}
.exclusive-offers-wrapper {
    position: relative;
    width: 100%;
    overflow: hidden;
    margin: 37px 0;
    padding: 0 20px;
}
.bs-wrap {
    padding-bottom: 58px;
}
        /* Tablet: 2 columns */
        @media (max-width: 1024px) {
          .offers-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .offer-item {
            height: 350px;
          }

          .offers-heading h2 {
            font-size: 30px;
          }

          .offer-title {
            font-size: 20px;
          }

          .offer-content {
            padding: 28px 24px 24px;
          }
        }

        /* Mobile: 1 column */
        @media (max-width: 767px) {
          .exclusive-offers-wrapper {
            margin: 40px 0;
            padding: 0 12px;
          }

          .offers-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .offer-item {
            height: 300px;
          }

          .offers-heading h2 {
            font-size: 26px;
            margin-bottom: 32px;
          }

          .offer-content {
            padding: 24px 20px 20px;
            gap: 10px;
          }

          .offer-title {
            font-size: 18px;
          }

          .offer-description {
            font-size: 13px;
          }

          .offer-button {
            padding: 9px 18px;
            font-size: 12px;
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .offer-item {
            height: 280px;
          }

          .offers-heading h2 {
            font-size: 22px;
          }

          .offer-title {
            font-size: 16px;
          }

          .offer-content {
            padding: 20px 16px 16px;
          }
        }
      `}</style>

      <div className="offers-container">
        <div className="offers-heading">
          <h2>Exclusive Offers</h2>
		  <p>~ Best deals just for you ~</p>
        </div>

        <div className="offers-grid">
          {industries.map((industry, index) => {
            const colors = getColorScheme(index);
            return (
              <Link
                key={industry.id}
                href={industry.link_url || '#'}
                className="offer-item"
                style={{
                  backgroundImage: `url('${getImageUrl(industry.image)}')`
                }}
              >
                {/* Badge */}
                <div 
                  className="offer-badge"
                  style={{ backgroundColor: colors.badgeBg }}
                >
                  FEATURED
                </div>

                {/* Content Overlay */}
                <div className="offer-content">
                  <h3 className="offer-title">
                    {industry.heading}
                  </h3>

                  <div 
                    className="offer-divider"
                    style={{ backgroundColor: colors.badgeBg }}
                  ></div>

                  {industry.description && (
                    <div 
                      className="offer-description"
                      dangerouslySetInnerHTML={{ __html: industry.description }}
                    />
                  )}

                  <div className="offer-button">
                    Shop Now →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExclusiveOffers;