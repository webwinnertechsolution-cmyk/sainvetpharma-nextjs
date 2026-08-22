"use client";

import { useState, useEffect } from "react";
// Google Auth kept for future use (currently disabled)
// import { logoutGoogle, getStoredUser } from "@/lib/googleAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [phoneLoginLoading, setPhoneLoginLoading] = useState(false);
  const [loginPopup, setLoginPopup] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("profile");

  const router = useRouter();

  useEffect(() => {
    // ============================================
    // PHONE CUSTOMER SESSION
    // ============================================
    try {
      const storedPhoneCustomer = localStorage.getItem("phone_customer");

      if (storedPhoneCustomer) {
        const customer = JSON.parse(storedPhoneCustomer);

        const normalizedUser = {
          ...customer,
          name:
            customer.name ||
            `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
          provider: "phone",
          login_type: "phone",
        };

        setUser(normalizedUser);
        setPhone(customer.phone || "");
        fetchWishlist();

        if (customer.phone) {
          fetchOrders(customer.phone);
        }

        return;
      }
    } catch (error) {
      console.error("Phone customer read error:", error);
      localStorage.removeItem("phone_customer");
    }

    // ============================================
    // GOOGLE AUTH - FUTURE USE ONLY
    // Keep this code commented. Google auth is not
    // being used for the current phone-account flow.
    // ============================================
    /*
    const storedUser = getStoredUser();

    if (storedUser) {
      setUser(storedUser);
      fetchWishlist();

      if (storedUser.email) {
        // Old Google/email order lookup can be restored later if needed.
      }
    }
    */
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
  const fetchOrders = async (customerPhone) => {
    if (!customerPhone) return;

    setOrdersLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/checkout/my-orders?phone=${encodeURIComponent(customerPhone)}`,
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
        return data;
      }

      console.error("Orders API error:", data);
      setOrders([]);
      return data;
    } catch (err) {
      console.error("Orders fetch error:", err);
      setOrders([]);
      return { success: false };
    } finally {
      setOrdersLoading(false);
    }
  };

  // ================================
  // LOGIN WITH PHONE NUMBER
  // ================================
  const handlePhoneLogin = async (e) => {
    e?.preventDefault();
    setLoginError("");

    const cleanedPhone = phone.replace(/\D/g, "");
    let finalPhone = cleanedPhone;

    if (cleanedPhone.length > 10 && cleanedPhone.startsWith("91")) {
      finalPhone = cleanedPhone.slice(-10);
    }

    if (finalPhone.length !== 10) {
      setLoginError("Please enter a valid 10-digit phone number.");
      return;
    }

    setPhoneLoginLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/checkout/my-orders?phone=${encodeURIComponent(finalPhone)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!data.success || !data.customer) {
        setLoginPopup(true);
        return;
      }

      const customer = {
        ...data.customer,
        name:
          data.customer.name ||
          `${data.customer.first_name || ""} ${data.customer.last_name || ""}`.trim(),
        provider: "phone",
        login_type: "phone",
      };

      localStorage.setItem("phone_customer", JSON.stringify(customer));
      setUser(customer);
      setPhone(customer.phone || finalPhone);
      setOrders(data.orders || []);
      fetchWishlist();
      window.dispatchEvent(new Event("phoneCustomerUpdated"));
    } catch (error) {
      console.error("Phone login error:", error);
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setPhoneLoginLoading(false);
    }
  };

  // ================================
  // LOGOUT
  // ================================
  const handleLogout = async () => {
    localStorage.removeItem("phone_customer");
    setUser(null);
    setOrders([]);
    setPhone("");

    window.dispatchEvent(new Event("phoneCustomerUpdated"));

    // Google Auth - future use only
    // await logoutGoogle();
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
  // PHONE LOGIN SCREEN
  // ================================
  if (!user) {
    return (
      <div className="phone-login-page">
        <style>{`
          * { box-sizing: border-box; }

          .phone-login-page {
            min-height: 75vh;
            background: #f5f7fa;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px 20px;
            font-family: 'Nunito', sans-serif;
          }

          .phone-login-card {
            width: 100%;
            max-width: 440px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 18px;
            padding: 36px;
            box-shadow: 0 10px 35px rgba(0,0,0,0.07);
          }

          .phone-login-icon {
            width: 62px;
            height: 62px;
            border-radius: 50%;
            background: #eff6ff;
            color: #1872B5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            margin: 0 auto 18px;
          }

          .phone-login-title {
            font-size: 25px;
            font-weight: 800;
            color: #111827;
            text-align: center;
            margin: 0 0 8px;
          }

          .phone-login-description {
            font-size: 13px;
            color: #6b7280;
            line-height: 1.6;
            text-align: center;
            margin: 0 0 25px;
          }

          .phone-login-label {
            display: block;
            font-size: 13px;
            color: #374151;
            font-weight: 700;
            margin-bottom: 7px;
          }

          .phone-login-input {
            width: 100%;
            height: 48px;
            border: 1.5px solid #d1d5db;
            border-radius: 10px;
            padding: 0 14px;
            font-size: 14px;
            outline: none;
            font-family: inherit;
          }

          .phone-login-input:focus { border-color: #1872B5; }

          .phone-login-error {
            color: #dc2626;
            font-size: 12px;
            margin-top: 6px;
          }

          .phone-login-btn {
            width: 100%;
            height: 48px;
            border: 0;
            border-radius: 10px;
            background: #1872B5;
            color: #fff;
            font-size: 14px;
            font-weight: 800;
            cursor: pointer;
            margin-top: 16px;
            font-family: inherit;
          }

          .phone-login-btn:disabled { opacity: .6; cursor: not-allowed; }

          .phone-login-note {
            font-size: 11px;
            color: #9ca3af;
            text-align: center;
            line-height: 1.5;
            margin-top: 15px;
          }

          .customer-popup-overlay {
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: rgba(17,24,39,.62);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .customer-popup {
            width: 100%;
            max-width: 430px;
            background: #fff;
            border-radius: 18px;
            padding: 32px;
            text-align: center;
            box-shadow: 0 20px 70px rgba(0,0,0,.22);
          }

          .customer-popup-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 16px;
            border-radius: 50%;
            background: #fff7ed;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
          }

          .customer-popup h2 {
            color: #111827;
            font-size: 21px;
            margin: 0 0 10px;
          }

          .customer-popup p {
            color: #6b7280;
            font-size: 13px;
            line-height: 1.7;
            margin: 0 0 22px;
          }

          .customer-popup-shop {
            display: block;
            background: #1872B5;
            color: #fff;
            padding: 12px 20px;
            border-radius: 9px;
            text-decoration: none;
            font-size: 13px;
            font-weight: 800;
            margin-bottom: 9px;
          }

          .customer-popup-close {
            border: 0;
            background: transparent;
            color: #6b7280;
            font-size: 12px;
            cursor: pointer;
          }

          @media(max-width: 500px) {
            .phone-login-card { padding: 28px 20px; }
          }
        `}</style>

        <form className="phone-login-card" onSubmit={handlePhoneLogin}>
          <div className="phone-login-icon">👤</div>

          <h1 className="phone-login-title">My Account</h1>

          <p className="phone-login-description">
            Enter the phone number you used during checkout to access your account and view your orders.
          </p>

          <label className="phone-login-label">Phone Number</label>

          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setLoginError("");
            }}
            placeholder="Enter your phone number"
            className="phone-login-input"
            inputMode="numeric"
          />

          {loginError && <div className="phone-login-error">{loginError}</div>}

          <button
            type="submit"
            className="phone-login-btn"
            disabled={phoneLoginLoading}
          >
            {phoneLoginLoading ? "Checking..." : "Login to My Account"}
          </button>

          <p className="phone-login-note">
            Your account is automatically created after you complete your first purchase.
          </p>
        </form>

        {loginPopup && (
          <div
            className="customer-popup-overlay"
            onClick={() => setLoginPopup(false)}
          >
            <div className="customer-popup" onClick={(e) => e.stopPropagation()}>
              <div className="customer-popup-icon">🛍️</div>

              <h2>No Account Found</h2>

              <p>
                We couldn't find an account associated with this phone number.
                Your account is automatically created after you complete your first purchase.
                Please purchase a product first, then return here using the same phone number.
              </p>

              <Link href="/collections" className="customer-popup-shop">
                Start Shopping
              </Link>

              <button
                type="button"
                className="customer-popup-close"
                onClick={() => setLoginPopup(false)}
              >
                Try Another Number
              </button>
            </div>
          </div>
        )}
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
                {user.phone ? `+91 ${user.phone}` : user.email}
              </p>

              <span className="acc-google-badge">
                Phone Account
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
                  Customer Account
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

              {user.phone && (
                <li className="acc-info-item">
                  <span className="acc-info-label">
                    📱 Phone
                  </span>

                  <span className="acc-info-value">
                    +91 {user.phone}
                  </span>
                </li>
              )}

              <li className="acc-info-item">
                <span className="acc-info-label">
                  🔑 Login Method
                </span>

                <span className="acc-info-value">
                  {user.login_type === "phone" ? "Phone Number" : user.provider}
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
