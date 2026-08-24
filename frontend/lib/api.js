import { supabase } from './supabaseClient';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function authedFetch(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getDashboard: () => authedFetch('/api/dashboard'),
  createLinkToken: () => authedFetch('/api/plaid/link-token', { method: 'POST' }),
  exchangePublicToken: (public_token) =>
    authedFetch('/api/plaid/exchange', { method: 'POST', body: JSON.stringify({ public_token }) }),
  syncPlaid: () => authedFetch('/api/plaid/sync', { method: 'POST' }),
  askIris: (question) => authedFetch('/api/iris/ask', { method: 'POST', body: JSON.stringify({ question }) }),
};
