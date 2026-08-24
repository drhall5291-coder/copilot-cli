'use client';
import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { api } from '../lib/api';

export default function PlaidLinkButton({ onConnected }) {
  const [linkToken, setLinkToken] = useState(null);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    api.createLinkToken().then((r) => setLinkToken(r.link_token)).catch((e) => setError(e.message));
  }, []);

  const onSuccess = useCallback(
    async (public_token) => {
      setConnecting(true);
      setError(null);
      try {
        await api.exchangePublicToken(public_token);
        onConnected?.();
      } catch (e) {
        setError(e.message);
      } finally {
        setConnecting(false);
      }
    },
    [onConnected]
  );

  const { open, ready } = usePlaidLink({ token: linkToken, onSuccess });

  return (
    <div>
      <button onClick={() => open()} disabled={!ready || connecting}>
        {connecting ? 'Connecting…' : 'Connect a bank (Sandbox)'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
