/**
 * API client helper with relative paths for seamless Vercel same-origin routing.
 */

export async function submitContact(data) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.detail || 'Gagal mengirim pesan kontak.');
  }
  return json;
}

export async function getGuestbook() {
  const response = await fetch('/api/guestbook');
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.detail || 'Gagal memuat buku tamu.');
  }
  return json.entries || [];
}

export async function submitGuestbook(data) {
  const response = await fetch('/api/guestbook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.detail || 'Gagal mengirim pesan buku tamu.');
  }
  return json;
}

export async function getGitHubRepos() {
  try {
    const response = await fetch('/api/github');
    if (!response.ok) return null;
    const json = await response.json();
    return json.success ? json.repos : null;
  } catch (err) {
    return null;
  }
}
