import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AnnouncementBar from "./components/AnnouncementBar";
import CartDrawer from "./components/CartDrawer";  // ← ADD THIS
import Providers from "./components/Providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SainiVet Pharma",
  description: "SainiVet Pharma Website",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getLogo() {
  try {
    const res = await fetch(`${API_URL}/api/logo`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getMenus() {
  try {
    const res = await fetch(`${API_URL}/api/menus`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

async function getFooterNew() {
  try {
    const res = await fetch(`${API_URL}/api/footer-new`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getAnnouncementBar() {
  try {
    const res = await fetch(`${API_URL}/api/announcement-bar`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [logo, menus, footerNew, announcementBar] = await Promise.all([
    getLogo(),
    getMenus(),
    getFooterNew(),
    getAnnouncementBar(),
  ]);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Providers>
          <AnnouncementBar data={announcementBar} />
          <Header logo={logo} menus={menus} />
          <CartDrawer />  {/* ← ADD THIS */}
          <main>{children}</main>
          <Footer footerNew={footerNew} />
        </Providers>
      </body>
    </html>
  );
}