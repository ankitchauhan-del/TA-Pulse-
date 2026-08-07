import { readSessionFromReq } from '../lib/auth';
import { useEffect } from 'react';

export async function getServerSideProps({ req }) {
  const authed = readSessionFromReq(req);
  if (!authed) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: {} };
}

const BODY_HTML = `

<div id="loading">
  <div class="pulse-dot"></div>
  <div>Loading pulse…</div>
</div>

<div class="aurora-bg" aria-hidden="true">
  <div class="aurora-blob ab1"></div>
  <div class="aurora-blob ab2"></div>
  <div class="aurora-blob ab3"></div>
  <div class="aurora-blob ab4"></div>
  <div class="aurora-blob ab5"></div>
  <div class="aurora-blob ab6"></div>
  <div class="aurora-sheen"></div>
  <div class="aurora-grain"></div>
  <div class="aurora-hairline"></div>
</div>

<div id="app" style="display:none;">

  <header class="hero">
    <div class="container hero-grid">
      <div class="hero-left">
        <p class="eyebrow">VerbaFlo.AI · Talent Acquisition</p>
        <h1>VerbaPulse</h1>
        <div class="hero-meta">
          <span class="meta-item">Week of
            <input type="text" class="hero-field e-field" id="week-label-edit" placeholder="e.g. Jul 20–24, 2026">
            <strong class="v-field" id="week-label-view">—</strong>
          </span>
          <span class="meta-item">Prepared by
            <input type="text" class="hero-field e-field" id="prepared-by-edit" placeholder="your name">
            <strong class="v-field" id="prepared-by-view">—</strong>
          </span>
          <span class="meta-item" id="last-updated-wrap">Updated <strong id="last-updated-view">—</strong></span>
        </div>
      </div>
      <div class="offers-panel" id="offers-panel"></div>
    </div>
  </header>

  <div class="container">

    <div class="storage-banner" id="storage-banner" style="display:none;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.3 3.9L2.6 17.5a1.8 1.8 0 001.6 2.7h15.6a1.8 1.8 0 001.6-2.7L13.7 3.9a1.8 1.8 0 00-3.4 0z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span id="storage-banner-text"><strong>Can't reach the database.</strong> Check that the Upstash Redis storage integration is connected in your Vercel project and redeploy.</span>
    </div>

    <div class="kpi-wrap">
      <div class="kpi-grid" id="kpi-grid"></div>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <input type="text" id="search-input" placeholder="Search roles or candidates…">
      </div>
      <div class="chips" id="filter-chips">
        <button class="chip is-active" data-status="All">All</button>
        <button class="chip" data-status="Open">Open</button>
        <button class="chip" data-status="On hold">On hold</button>
        <button class="chip" data-status="Offer stage">Offer stage</button>
        <button class="chip" data-status="Closed">Closed</button>
      </div>
      <div class="spacer"></div>
      <button class="icon-btn" id="refresh-btn" title="Refresh from shared data">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 4v6h6M20 20v-6h-6M4.5 15a8 8 0 0013.9 3.4M19.5 9A8 8 0 005.6 5.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="btn btn-primary edit-only" id="add-role-btn">+ Add role</button>
      <div class="mode-toggle">
        <span id="mode-label">Viewing</span>
        <button class="switch" id="mode-switch" aria-label="Toggle edit mode"></button>
      </div>
    </div>

    <div class="narrative-grid">
      <div class="narrative-card is-focus">
        <span class="narrative-label">Focused on</span>
        <textarea id="narrative-focus" placeholder="What you're actively working on this week…"></textarea>
      </div>
      <div class="narrative-card">
        <span class="narrative-label">Progress</span>
        <textarea id="narrative-progress" placeholder="Wins and movement since last update…"></textarea>
      </div>
      <div class="narrative-card is-blockers">
        <span class="narrative-label">Blockers &amp; need from you</span>
        <textarea id="narrative-blockers" placeholder="Anything stuck, or a decision you need…"></textarea>
      </div>
    </div>

    <div class="section-head">
      <h2>Roles</h2>
      <div style="display:flex;align-items:center;gap:10px;">
        <button class="filter-clear-pill" id="filter-clear-pill" style="display:none;"></button>
        <span class="section-count" id="section-count"></span>
      </div>
    </div>

    <div class="role-list" id="role-list"></div>

  </div>

  <div class="container">
    <div class="footer">
      <span id="sync-status">Synced</span> <button class="logout-btn" id="logout-btn" style="margin-left:12px;">Log out</button>
      <span>Only people with this link can view it</span>
    </div>
  </div>

</div>

<!-- Add role modal -->
<div class="modal-overlay" id="modal-overlay">
  <div class="modal">
    <h3>Add a role</h3>
    <form id="add-role-form">
      <div class="form-row">
        <label>Role title</label>
        <input type="text" id="f-title" required placeholder="e.g. Senior Backend Engineer">
      </div>
      <div class="form-grid-2">
        <div class="form-row">
          <label>Status</label>
          <select id="f-status">
            <option>Open</option>
            <option selected>On hold</option>
            <option>Offer stage</option>
            <option>Closed</option>
          </select>
        </div>
        <div class="form-row">
          <label>Target offer date</label>
          <input type="text" id="f-target-date" placeholder="e.g. 15th Aug 2026">
        </div>
      </div>
      <div class="form-grid-2">
        <div class="form-row">
          <label>Approved reqs</label>
          <input type="number" id="f-reqs" min="0" value="1">
        </div>
        <div class="form-row">
          <label>Open positions</label>
          <input type="number" id="f-open" min="0" value="1">
        </div>
      </div>
      <div class="form-row">
        <label>Candidates submitted so far</label>
        <input type="number" id="f-sourced" min="0" value="0">
      </div>
      <div class="form-row">
        <label>Google Sheet link (optional)</label>
        <input type="text" id="f-sheet" placeholder="Paste the Google Sheet share link">
      </div>
      <div class="form-row">
        <label>First note (optional)</label>
        <textarea id="f-note" placeholder="e.g. Kicked off sourcing, JD approved…"></textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" id="modal-cancel">Cancel</button>
        <button type="submit" class="btn btn-primary">Add role</button>
      </div>
    </form>
  </div>
</div>

<div class="toast" id="toast"><span class="toast-dot"></span><span id="toast-text">Saved</span></div>


`;

export default function Dashboard() {
  useEffect(() => {
    // Load the dashboard logic once, after the DOM scaffolding is present.
    if (document.getElementById('dashboard-logic')) return;
    const s = document.createElement('script');
    s.id = 'dashboard-logic';
    s.src = '/dashboard.js';
    s.async = false;
    document.body.appendChild(s);
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: BODY_HTML }} />;
}
