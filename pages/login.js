import { useState } from 'react';
import { useRouter } from 'next/router';
import { readSessionFromReq } from '../lib/auth';

export async function getServerSideProps({ req }) {
  // If already logged in, skip the login screen.
  if (readSessionFromReq(req)) {
    return { redirect: { destination: '/', permanent: false } };
  }
  return { props: {} };
}

export default function Login() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace('/');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Incorrect password');
        setLoading(false);
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-blob ab1"></div>
        <div className="aurora-blob ab2"></div>
        <div className="aurora-blob ab3"></div>
        <div className="aurora-blob ab4"></div>
        <div className="aurora-blob ab5"></div>
        <div className="aurora-blob ab6"></div>
        <div className="aurora-sheen"></div>
        <div className="aurora-grain"></div>
        <div className="aurora-hairline"></div>
      </div>
      <div className="login-card">
        <p className="login-eyebrow">VerbaFlo.AI · Talent Acquisition</p>
        <h1>VerbaPulse</h1>
        <p>Enter the access password to continue.</p>
        <form onSubmit={submit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading || !password}>
            {loading ? 'Checking…' : 'Enter dashboard'}
          </button>
        </form>
        <div className="login-error">{error}</div>
      </div>
    </div>
  );
}
