'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { api } from '../../lib/api';
import PlaidLinkButton from '../../components/PlaidLinkButton';
import IrisPanel from '../../components/IrisPanel';

export default function Dashboard() {
  const router = useRouter();
  const [bundle, setBundle] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboard();
      setBundle(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        router.replace('/login');
        return;
      }
      loadDashboard();
    });
  }, [loadDashboard, router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (loading) return <div className="dashboard-page">Loading your bag…</div>;

  return (
    <div className="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Your Bag</h1>
        <button onClick={handleSignOut}>Sign out</button>
      </div>

      {error && <p className="error">{error}</p>}

      {bundle && bundle.items.length === 0 && (
        <div className="card">
          <p>No bank connected yet. Connect a Sandbox institution to populate your dashboard.</p>
          <PlaidLinkButton onConnected={loadDashboard} />
        </div>
      )}

      {bundle && bundle.items.length > 0 && (
        <>
          <div className="grid-2">
            <div className="card">
              <h2>Accounts</h2>
              <p className="muted">Total balance across all connected accounts</p>
              <h3>${bundle.total_balance.toFixed(2)}</h3>
              <ul>
                {bundle.accounts.map((a) => (
                  <li key={a.id}>
                    {a.name} ({a.subtype}) — ${Number(a.current_balance).toFixed(2)}
                  </li>
                ))}
              </ul>
              <PlaidLinkButton onConnected={loadDashboard} />
              <button onClick={() => api.syncPlaid().then(loadDashboard)} style={{ marginTop: '0.5rem' }}>
                Re-sync
              </button>
            </div>

            <div className="card">
              <h2>Round-ups (intelligence-only)</h2>
              <p className="muted">Here's what you would have saved — no money movement yet.</p>
              <h3>${Number(bundle.roundup_vault.total_roundups).toFixed(2)}</h3>
            </div>
          </div>

          <div className="card">
            <h2>Recent transactions</h2>
            <ul>
              {bundle.transactions.slice(0, 15).map((t) => (
                <li key={t.id}>
                  {t.posted_date} — {t.merchant_name || t.name} — ${Number(t.amount).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2>Synced Plaid products</h2>
            <p className="muted">
              {bundle.product_snapshots.length > 0
                ? bundle.product_snapshots.map((p) => p.product).join(', ')
                : 'None synced yet beyond core accounts/transactions.'}
            </p>
          </div>

          <IrisPanel bundle={bundle} />
        </>
      )}
    </div>
  );
}
