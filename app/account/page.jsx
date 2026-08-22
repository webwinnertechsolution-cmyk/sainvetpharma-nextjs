"use client";

import { useState, useEffect } from "react";
import { logoutGoogle, getStoredUser } from "@/lib/googleAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function AccountPage() {
  const [user, setUser] = useState(null);

  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("profile");

  const router = useRouter();

  useEffect(() => {
    const storedUser = getStoredUser();

    if (storedUser) {
      setUser(storedUser);

      fetchWishlist();

      if (storedUser.email) {
        fetchOrders(storedUser.email);
      }
    } else {
      router.replace("/login");
    }
  }, []);

  // ================================
  // WISHLIST
  // ================================
  const fetchWishlist = async () => {
    setWishlistLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/wishlist`);
      const data = await res.json();

      setWishlist(data.products || []);
    } catch (err) {
      console.error("Wishlist fetch error:", err);
      setWishlist([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  // ================================
  // ORDERS
  // ================================
  const fetchOrders = async (email) => {
    setOrdersLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/checkout/my-orders?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        console.error("Orders API error:", data);
        setOrders([]);
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // ================================
  // LOGOUT
  // ================================
  const handleLogout = async () => {
    await logoutGoogle();
    router.replace("/login");
  };

  // ================================
  // REMOVE WISHLIST
  // ================================
  const removeFromWishlist = async (productId) => {
    try {
      await fetch(`${API_URL}/api/wishlist/remove/${productId}`, {
        method: "POST",
      });

      setWishlist((prev) =>
        prev.filter((product) => product.id !== productId)
      );
    } catch (err) {
      console.error("Wishlist remove error:", err);
    }
  };

  // ================================
  // PRODUCT IMAGE
  // ================================
  function getImageUrl(product, index = 0) {
    if (product.images && product.images.length > index) {
      const img = product.images[index];

      const path =
        img.image_path ||
        img.image ||
        img.path ||
        img.url ||
        img.filename;

      if (path) {
        if (path.startsWith("http")) {
          return path;
        }

        return `${API_URL}/uploads/products/gallery/${path}`;
      }
    }

    if (index === 0 && product.featured_image) {
      return `${API_URL}/uploads/products/${product.featured_image}`;
    }

    return null;
  }

  // ================================
  // ORDER ITEM IMAGE
  // ================================
  function getOrderItemImage(item) {
    if (!item?.product_image) {
      return null;
    }

    if (item.product_image.startsWith("http")) {
      return item.product_image;
    }

    return `${API_URL}/uploads/products/${item.product_image}`;
  }

  // ================================
  // DATE FORMAT
  // ================================
  function formatOrderDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // ================================
  // PAYMENT METHOD
  // ================================
  function getPaymentMethod(method) {
    if (method === "razorpay") {
      return "Card / UPI / Netbanking";
    }

    if (method === "cod") {
      return "Cash on Delivery";
    }

    if (method === "bank") {
      return "Bank Transfer";
    }

    return method?.replaceAll("_", " ") || "-";
  }

  // ================================
  // LOADING USER
  // ================================
  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fa",
        }}
      >
        <div className="acc-spinner" />

        <style>{`
          .acc-spinner {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 4px solid #dbeafe;
            border-top-color: #1872B5;
            animation: acc-spin 0.8s linear infinite;
          }

          @keyframes acc-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="account-page">
      <style>{`

        * {
          box-sizing: border-box;
        }

        .account-page {
          background: #f5f7fa;
          min-height: 100vh;
          font-family: 'Nunito', sans-serif;
        }

        /* =====================================
           BREADCRUMB
        ===================================== */

        .acc-breadcrumb {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          padding: 10px 0;
        }

        .acc-breadcrumb-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6b7280;
        }

        .acc-breadcrumb-inner a {
          color: #6b7280;
          text-decoration: none;
        }

        .acc-breadcrumb-inner a:hover {
          color: #1872B5;
        }

        .acc-breadcrumb-sep {
          color: #d1d5db;
        }

        .acc-breadcrumb-current {
          color: #111827;
          font-weight: 600;
        }

        /* =====================================
           HERO
        ===================================== */

        .acc-hero {
          background: linear-gradient(
            135deg,
            #1872B5 0%,
            #0f4c7f 100%
          );
          padding: 28px 0;
          color: white;
        }

        .acc-hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .acc-hero-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .acc-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.4);
          object-fit: cover;
        }

        .acc-avatar-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          border: 3px solid rgba(255,255,255,0.4);
        }

        .acc-hero-name {
          font-family: 'Sora', sans-serif;
          font-size: 20px;
          font-weight: 800;
          margin: 0 0 2px;
        }

        .acc-hero-email {
          font-size: 13px;
          opacity: 0.8;
          margin: 0 0 4px;
        }

        .acc-google-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.3);
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .acc-logout-btn {
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.35);
          color: white;
          padding: 9px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          font-family: inherit;
          transition: all 0.2s;
        }

        .acc-logout-btn:hover {
          background: rgba(255,255,255,0.25);
        }

        /* =====================================
           MAIN
        ===================================== */

        .acc-container {
          max-width: 1200px;
          margin: 28px auto;
          padding: 0 20px 40px;
        }

        /* =====================================
           TABS
        ===================================== */

        .acc-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }

        .acc-tab {
          padding: 10px 22px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border: 1.5px solid #e5e7eb;
          background: white;
          color: #6b7280;
          font-family: inherit;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .acc-tab:hover {
          border-color: #1872B5;
          color: #1872B5;
        }

        .acc-tab.active {
          background: #1872B5;
          color: white;
          border-color: #1872B5;
        }

        .acc-tab-count {
          background: rgba(255,255,255,0.25);
          padding: 1px 7px;
          border-radius: 10px;
          font-size: 11px;
        }

        .acc-tab:not(.active) .acc-tab-count {
          background: #f3f4f6;
          color: #374151;
        }

        /* =====================================
           PROFILE
        ===================================== */

        .acc-profile-card {
          background: white;
          border-radius: 16px;
          border: 1.5px solid #e5e7eb;
          overflow: hidden;
        }

        .acc-profile-header {
          background: linear-gradient(
            135deg,
            #eff6ff,
            #dbeafe
          );
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .acc-profile-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .acc-profile-avatar-ph {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #1872B5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .acc-profile-name {
          font-family: 'Sora', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 3px;
        }

        .acc-profile-email {
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 8px;
        }

        .acc-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #dcfce7;
          color: #16a34a;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .acc-info-list {
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .acc-info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 14px;
          gap: 20px;
        }

        .acc-info-item:last-child {
          border-bottom: none;
        }

        .acc-info-label {
          color: #6b7280;
        }

        .acc-info-value {
          font-weight: 700;
          color: #111827;
          text-align: right;
        }

        /* =====================================
           WISHLIST
        ===================================== */

        .acc-wl-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }

        .acc-wl-card {
          background: white;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.25s;
          display: flex;
          flex-direction: column;
        }

        .acc-wl-card:hover {
          border-color: #1872B5;
          box-shadow: 0 6px 20px rgba(24,114,181,0.13);
          transform: translateY(-3px);
        }

        .acc-wl-img-wrap {
          aspect-ratio: 1 / 1;
          background: #f9fafb;
          position: relative;
          overflow: hidden;
        }

        .acc-wl-img-p,
        .acc-wl-img-s {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.38s;
        }

        .acc-wl-img-s {
          opacity: 0;
        }

        .acc-wl-card:hover .acc-wl-img-p {
          opacity: 0;
        }

        .acc-wl-card:hover .acc-wl-img-s {
          opacity: 1;
        }

        .acc-wl-discount {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 3px 7px;
          border-radius: 4px;
          z-index: 5;
        }

        .acc-wl-remove {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          background: white;
          color: #dc2626;
          border: 1.5px solid #fca5a5;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          z-index: 10;
          opacity: 0;
        }

        .acc-wl-card:hover .acc-wl-remove {
          opacity: 1;
        }

        .acc-wl-remove:hover {
          background: #dc2626;
          color: white;
        }

        .acc-wl-body {
          padding: 10px 12px 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .acc-wl-title {
          font-size: 12.5px;
          font-weight: 700;
          color: #111827;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-decoration: none;
        }

        .acc-wl-title:hover {
          color: #1872B5;
        }

        .acc-wl-price-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .acc-wl-price {
          font-size: 14px;
          font-weight: 800;
          color: #1872B5;
        }

        .acc-wl-mrp {
          font-size: 11px;
          color: #9ca3af;
          text-decoration: line-through;
        }

        .acc-wl-btn {
          display: block;
          text-align: center;
          padding: 8px;
          background: #1872B5;
          color: white;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          margin-top: auto;
        }

        .acc-wl-img-ph {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          color: #d1d5db;
        }

        /* =====================================
           ORDERS
        ===================================== */

        .acc-orders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .acc-order-card {
          background: white;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
        }

        .acc-order-header {
          padding: 15px 18px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .acc-order-number {
          font-family: 'Sora', sans-serif;
          font-weight: 800;
          font-size: 15px;
          color: #0a214f;
        }

        .acc-order-date {
          font-size: 11px;
          color: #6b7280;
          margin-top: 3px;
        }

        .acc-order-statuses {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
        }

        .acc-status-badge {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-confirmed {
          background: #dcfce7;
          color: #166534;
        }

        .status-processing {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-shipped {
          background: #e0e7ff;
          color: #3730a3;
        }

        .status-delivered {
          background: #d1fae5;
          color: #065f46;
        }

        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .payment-paid {
          background: #dcfce7;
          color: #166534;
        }

        .payment-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .payment-failed {
          background: #fee2e2;
          color: #991b1b;
        }

        .payment-refunded {
          background: #f3f4f6;
          color: #4b5563;
        }

        .acc-order-items {
          padding: 4px 18px;
        }

        .acc-order-item {
          padding: 14px 0;
          border-bottom: 1px solid #f3f4f6;
          display: grid;
          grid-template-columns: 65px 1fr auto;
          gap: 14px;
          align-items: center;
        }

        .acc-order-item:last-child {
          border-bottom: none;
        }

        .acc-order-img {
          width: 65px;
          height: 65px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #e5e7eb;
          background: #f5f7fa;
        }

        .acc-order-img-ph {
          width: 65px;
          height: 65px;
          border-radius: 8px;
          background: #f5f7fa;
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .acc-order-product-name {
          font-size: 13px;
          font-weight: 700;
          color: #111827;
        }

        .acc-order-product-meta {
          font-size: 11px;
          color: #6b7280;
          margin-top: 3px;
        }

        .acc-order-item-total {
          font-size: 13px;
          font-weight: 800;
          color: #0a214f;
        }

        .acc-order-footer {
          padding: 14px 18px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .acc-order-payment-title {
          font-size: 10px;
          color: #6b7280;
        }

        .acc-order-payment-value {
          font-size: 12px;
          font-weight: 700;
          color: #111827;
        }

        .acc-order-total-title {
          font-size: 10px;
          color: #6b7280;
        }

        .acc-order-total-value {
          font-family: 'Sora', sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: #1872B5;
        }

        /* =====================================
           EMPTY / LOADER
        ===================================== */

        .acc-empty {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 16px;
          border: 1.5px solid #e5e7eb;
        }

        .acc-empty-icon {
          font-size: 56px;
          margin-bottom: 12px;
        }

        .acc-empty-title {
          font-family: 'Sora', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
        }

        .acc-empty-text {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 20px;
        }

        .acc-empty-btn {
          display: inline-block;
          padding: 11px 28px;
          background: #1872B5;
          color: white;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
        }

        .acc-loader {
          text-align: center;
          padding: 50px;
        }

        .acc-spinner {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 4px solid #dbeafe;
          border-top-color: #1872B5;
          animation: acc-spin 0.8s linear infinite;
          margin: 0 auto;
        }

        @keyframes acc-spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =====================================
           RESPONSIVE
        ===================================== */

        @media(max-width: 1100px) {
          .acc-wl-grid {
            grid-template-columns: repeat(4,1fr);
          }
        }

        @media(max-width: 800px) {
          .acc-wl-grid {
            grid-template-columns: repeat(3,1fr);
          }

          .acc-hero-name {
            font-size: 16px;
          }
        }

        @media(max-width: 600px) {
          .acc-order-item {
            grid-template-columns: 55px 1fr;
          }

          .acc-order-img,
          .acc-order-img-ph {
            width: 55px;
            height: 55px;
          }

          .acc-order-item-total {
            grid-column: 2;
          }

          .acc-order-footer {
            align-items: flex-end;
          }

          .acc-info-item {
            align-items: flex-start;
          }
        }

        @media(max-width: 540px) {
          .acc-wl-grid {
            grid-template-columns: repeat(2,1fr);
          }

          .acc-wl-remove {
            opacity: 1;
          }

          .acc-tab {
            padding: 8px 14px;
            font-size: 13px;
          }
        }

      `}</style>

      {/* BREADCRUMB */}
      <div className="acc-breadcrumb">
        <div className="acc-breadcrumb-inner">
          <Link href="/">Home</Link>

          <span className="acc-breadcrumb-sep">
            ›
          </span>

          <span className="acc-breadcrumb-current">
            My Account
          </span>
        </div>
      </div>

      {/* HERO */}
      <div className="acc-hero">
        <div className="acc-hero-inner">

          <div className="acc-hero-left">

            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="acc-avatar"
              />
            ) : (
              <div className="acc-avatar-placeholder">
                👤
              </div>
            )}

            <div>

              <h1 className="acc-hero-name">
                Hi, {user.name?.split(" ")[0]}! 👋
              </h1>

              <p className="acc-hero-email">
                {user.email}
              </p>

              <span className="acc-google-badge">
                Google Account
              </span>

            </div>

          </div>

          <button
            onClick={handleLogout}
            className="acc-logout-btn"
          >
            🚪 Sign Out
          </button>

        </div>
      </div>

      {/* CONTENT */}
      <div className="acc-container">

        {/* TABS */}
        <div className="acc-tabs">

          <button
            className={`acc-tab ${
              activeTab === "profile" ? "active" : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            👤 Profile
          </button>

          <button
            className={`acc-tab ${
              activeTab === "wishlist" ? "active" : ""
            }`}
            onClick={() => setActiveTab("wishlist")}
          >
            ❤️ Wishlist

            <span className="acc-tab-count">
              {wishlist.length}
            </span>
          </button>

          <button
            className={`acc-tab ${
              activeTab === "orders" ? "active" : ""
            }`}
            onClick={() => setActiveTab("orders")}
          >
            📦 My Orders

            <span className="acc-tab-count">
              {orders.length}
            </span>
          </button>

        </div>

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="acc-profile-card">

            <div className="acc-profile-header">

              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="acc-profile-avatar"
                />
              ) : (
                <div className="acc-profile-avatar-ph">
                  👤
                </div>
              )}

              <div>

                <h2 className="acc-profile-name">
                  {user.name}
                </h2>

                <p className="acc-profile-email">
                  {user.email}
                </p>

                <span className="acc-verified-badge">
                  ✓ Verified Account
                </span>

              </div>

            </div>

            <ul className="acc-info-list">

              <li className="acc-info-item">
                <span className="acc-info-label">
                  👤 Full Name
                </span>

                <span className="acc-info-value">
                  {user.name}
                </span>
              </li>

              <li className="acc-info-item">
                <span className="acc-info-label">
                  📧 Email
                </span>

                <span className="acc-info-value">
                  {user.email}
                </span>
              </li>

              <li className="acc-info-item">
                <span className="acc-info-label">
                  🔑 Login Method
                </span>

                <span className="acc-info-value">
                  {user.provider}
                </span>
              </li>

              {user.created_at && (
                <li className="acc-info-item">
                  <span className="acc-info-label">
                    📅 Member Since
                  </span>

                  <span className="acc-info-value">
                    {new Date(
                      user.created_at
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </li>
              )}

              <li className="acc-info-item">
                <span className="acc-info-label">
                  ❤️ Wishlist Items
                </span>

                <span className="acc-info-value">
                  {wishlist.length} Products
                </span>
              </li>

              <li className="acc-info-item">
                <span className="acc-info-label">
                  📦 Total Orders
                </span>

                <span className="acc-info-value">
                  {orders.length} Orders
                </span>
              </li>

            </ul>

          </div>
        )}

        {/* WISHLIST */}
        {activeTab === "wishlist" && (
          <>
            {wishlistLoading ? (

              <div className="acc-loader">
                <div className="acc-spinner" />
              </div>

            ) : wishlist.length === 0 ? (

              <div className="acc-empty">

                <div className="acc-empty-icon">
                  💔
                </div>

                <h2 className="acc-empty-title">
                  Wishlist is empty
                </h2>

                <p className="acc-empty-text">
                  Start saving your favourite products!
                </p>

                <Link
                  href="/collections"
                  className="acc-empty-btn"
                >
                  Browse Products
                </Link>

              </div>

            ) : (

              <div className="acc-wl-grid">

                {wishlist.map((product) => {

                  const price =
                    product.sale_price &&
                    parseFloat(product.sale_price) > 0
                      ? parseFloat(product.sale_price)
                      : parseFloat(product.price || 0);

                  const compare =
                    product.sale_price &&
                    parseFloat(product.sale_price) > 0
                      ? parseFloat(product.price)
                      : null;

                  const discount =
                    compare && compare > price
                      ? Math.round(
                          ((compare - price) / compare) * 100
                        )
                      : null;

                  const img1 = getImageUrl(product, 0);
                  const img2 = getImageUrl(product, 1);
                  const hasSecond =
                    img2 && img2 !== img1;

                  return (
                    <div
                      key={product.id}
                      className="acc-wl-card"
                    >

                      <div className="acc-wl-img-wrap">

                        {img1 ? (
                          <>
                            <img
                              src={img1}
                              alt={product.title}
                              className="acc-wl-img-p"
                              loading="lazy"
                            />

                            <img
                              src={
                                hasSecond
                                  ? img2
                                  : img1
                              }
                              alt={product.title}
                              className="acc-wl-img-s"
                              loading="lazy"
                            />
                          </>
                        ) : (
                          <div className="acc-wl-img-ph">
                            📦
                          </div>
                        )}

                        {discount > 0 && (
                          <div className="acc-wl-discount">
                            {discount}% OFF
                          </div>
                        )}

                        <button
                          className="acc-wl-remove"
                          onClick={(e) => {
                            e.preventDefault();
                            removeFromWishlist(
                              product.id
                            );
                          }}
                        >
                          ✕
                        </button>

                      </div>

                      <div className="acc-wl-body">

                        <Link
                          href={`/product/${product.slug}`}
                          className="acc-wl-title"
                        >
                          {product.title}
                        </Link>

                        <div className="acc-wl-price-row">

                          <span className="acc-wl-price">
                            {price > 0
                              ? `₹${price.toLocaleString(
                                  "en-IN"
                                )}`
                              : "Price on request"}
                          </span>

                          {compare && (
                            <span className="acc-wl-mrp">
                              ₹
                              {compare.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          )}

                        </div>

                        <Link
                          href={`/product/${product.slug}`}
                          className="acc-wl-btn"
                        >
                          View Product
                        </Link>

                      </div>

                    </div>
                  );
                })}

              </div>

            )}
          </>
        )}

        {/* MY ORDERS */}
        {activeTab === "orders" && (
          <>
            {ordersLoading ? (

              <div className="acc-loader">
                <div className="acc-spinner" />
              </div>

            ) : orders.length === 0 ? (

              <div className="acc-empty">

                <div className="acc-empty-icon">
                  📦
                </div>

                <h2 className="acc-empty-title">
                  No orders yet
                </h2>

                <p className="acc-empty-text">
                  Your placed orders will appear here.
                </p>

                <Link
                  href="/collections"
                  className="acc-empty-btn"
                >
                  Start Shopping
                </Link>

              </div>

            ) : (

              <div className="acc-orders-list">

                {orders.map((order) => (

                  <div
                    key={order.id}
                    className="acc-order-card"
                  >

                    {/* ORDER HEADER */}
                    <div className="acc-order-header">

                      <div>

                        <div className="acc-order-number">
                          Order #{order.order_number}
                        </div>

                        <div className="acc-order-date">
                          {formatOrderDate(
                            order.created_at
                          )}
                        </div>

                      </div>

                      <div className="acc-order-statuses">

                        <span
                          className={`acc-status-badge status-${
                            order.order_status ||
                            "pending"
                          }`}
                        >
                          {order.order_status ||
                            "pending"}
                        </span>

                        <span
                          className={`acc-status-badge payment-${
                            order.payment_status ||
                            "pending"
                          }`}
                        >
                          Payment:{" "}
                          {order.payment_status ||
                            "pending"}
                        </span>

                      </div>

                    </div>

                    {/* ORDER ITEMS */}
                    <div className="acc-order-items">

                      {(order.items || []).map(
                        (item) => {

                          const image =
                            getOrderItemImage(
                              item
                            );

                          return (
                            <div
                              key={item.id}
                              className="acc-order-item"
                            >

                              {image ? (
                                <img
                                  src={image}
                                  alt={
                                    item.product_name ||
                                    "Product"
                                  }
                                  className="acc-order-img"
                                />
                              ) : (
                                <div className="acc-order-img-ph">
                                  📦
                                </div>
                              )}

                              <div>

                                <div className="acc-order-product-name">
                                  {
                                    item.product_name
                                  }
                                </div>

                                <div className="acc-order-product-meta">
                                  Qty:{" "}
                                  {item.quantity}
                                </div>

                                {item.product_sku && (
                                  <div className="acc-order-product-meta">
                                    SKU:{" "}
                                    {
                                      item.product_sku
                                    }
                                  </div>
                                )}

                                <div className="acc-order-product-meta">
                                  ₹
                                  {Number(
                                    item.unit_price ||
                                      0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}{" "}
                                  each
                                </div>

                              </div>

                              <div className="acc-order-item-total">
                                ₹
                                {Number(
                                  item.total_price ||
                                    0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                    {/* FOOTER */}
                    <div className="acc-order-footer">

                      <div>

                        <div className="acc-order-payment-title">
                          Payment Method
                        </div>

                        <div className="acc-order-payment-value">
                          {getPaymentMethod(
                            order.payment_method
                          )}
                        </div>

                      </div>

                      <div
                        style={{
                          textAlign: "right",
                        }}
                      >

                        <div className="acc-order-total-title">
                          Order Total
                        </div>

                        <div className="acc-order-total-value">
                          ₹
                          {Number(
                            order.total || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </div>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}
          </>
        )}

      </div>
    </div>
  );
}
