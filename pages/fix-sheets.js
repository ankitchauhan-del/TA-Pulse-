import { useState } from 'react';
import { readSessionFromReq } from '../lib/auth';

export async function getServerSideProps({ req }) {
  if (!readSessionFromReq(req)) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: {} };
}

export default function FixSheets() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function run(method) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/fix-sheets', { method });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif', color: '#1C1836' }}>
      <h1 style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Fix sheet links (one-time)</h1>
      <p style={{ color: '#5B5678', lineHeight: 1.6 }}>
        This updates the Excel/Sheet links in your saved data to the Google Sheets URLs.
        It only touches the links — every role, number, and log entry stays exactly as it is.
      </p>
      <ol style={{ color: '#5B5678', lineHeight: 1.8 }}>
        <li>Click <b>Preview</b> first to see what will change (nothing is saved).</li>
        <li>If it looks right, click <b>Apply &amp; Save</b>.</li>
        <li>Go back to the dashboard and test a sheet link. Then you can ignore this page.</li>
      </ol>
      <div style={{ display: 'flex', gap: 12, margin: '20px 0' }}>
        <button onClick={() => run('GET')} disabled={loading}
          style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #C7C2DE', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
          Preview
        </button>
        <button onClick={() => run('POST')} disabled={loading}
          style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#544AD6', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
          Apply &amp; Save
        </button>
      </div>
      {loading && <p>Working…</p>}
      {result && (
        <pre style={{ background: '#F1F0F8', padding: 16, borderRadius: 10, overflow: 'auto', fontSize: 13, lineHeight: 1.5 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
