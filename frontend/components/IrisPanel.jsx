'use client';
import { useState } from 'react';
import { api } from '../lib/api';

export default function IrisPanel({ bundle }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function ask(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await api.askIris(question);
      setAnswer(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const anomalies = bundle?.evidence?.anomalies || [];

  return (
    <div className="card">
      <h2>Iris</h2>
      <p className="muted">
        Grounded entirely in your synced Plaid data — never fabricates a number, merchant, or trend that isn't in the evidence below.
      </p>

      {anomalies.length > 0 ? (
        <div style={{ marginBottom: '1rem' }}>
          <strong>Detected anomalies</strong>
          <ul>
            {anomalies.map((a, i) => (
              <li key={i}>
                <strong>{a.merchant}</strong>: ${a.amount} vs. expected ~${a.expected_baseline} ({a.deviation_pct > 0 ? '+' : ''}{a.deviation_pct}%)
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="muted">No anomalies detected yet — need more transaction history per merchant.</p>
      )}

      <form onSubmit={ask}>
        <input
          placeholder="Ask Iris about your finances…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button type="submit" disabled={loading}>{loading ? 'Thinking…' : 'Ask Iris'}</button>
      </form>

      {error && <p className="error">{error}</p>}

      {answer && (
        <div style={{ marginTop: '1rem' }}>
          {answer.mode === 'stub' && <span className="badge">Stub mode — no ANTHROPIC_API_KEY configured yet</span>}
          {answer.narrative && <p>{answer.narrative}</p>}
          {!answer.narrative && <p className="muted">{answer.note}</p>}
        </div>
      )}
    </div>
  );
}
