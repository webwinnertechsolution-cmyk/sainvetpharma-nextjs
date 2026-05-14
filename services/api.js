const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getLogo() {
  const res = await fetch(`${API_URL}/api/logo`);
  if (!res.ok) return null;
  return res.json();
}

export async function getMenus() {
  const res = await fetch(`${API_URL}/api/menus`);
  if (!res.ok) return [];
  return res.json();
}

export async function getFooter() {
  const res = await fetch(`${API_URL}/api/footer`);
  if (!res.ok) return null;
  return res.json();
}

export async function getFooterNew() {
  const res = await fetch(`${API_URL}/api/footer-new`);
  if (!res.ok) return null;
  return res.json();
}

// ← yeh naya add karo
export async function getAnnouncementBar() {
  const res = await fetch(`${API_URL}/api/announcement-bar`);
  if (!res.ok) return null;
  return res.json();
}