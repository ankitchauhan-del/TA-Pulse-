# The Hiring Pulse — password-protected version

This is the same dashboard you've been using, now behind a password login. It's a small
Next.js app (still 100% free to host on Vercel). Everything — your Upstash data, the Google
Sheet links, the whole UI — carries over unchanged. The only new thing is the login gate.

## Why this is a NEW deployment (not a file swap)

Login has to be enforced on the server, so the project is now a proper app rather than a
single `index.html`. That means you deploy it as a **new Vercel project** (keep your old one
running until this one is confirmed working, then just share the new link instead).

Your existing Upstash database is reused as-is — no data migration, nothing to re-enter.

---

## Step 1 — Put this code on GitHub

1. Create a new repo (e.g. `ta-pulse-secure`) — Private is fine.
2. Upload **everything in this folder**, keeping the folder structure intact:
   `package.json`, `next.config.js`, `.gitignore`, and the `pages`, `lib`, `styles`,
   `public` folders.
   - Easiest reliable way: use GitHub Desktop, or on the web uploader drag the whole set in.
     The folders must stay as folders (e.g. `pages/api/login.js` must keep that path).

## Step 2 — Create the Vercel project

1. Vercel → **Add New → Project** → import the new repo.
2. Vercel auto-detects Next.js — leave all build settings at their defaults.
3. **Before clicking Deploy**, add the environment variables (next step). If you already
   deployed, that's fine — just add them after and redeploy.

## Step 3 — Add environment variables (this is where the password lives)

In the Vercel project → **Settings → Environment Variables**, add these THREE:

| Name | Value | Notes |
|---|---|---|
| `DASHBOARD_PASSWORD` | *whatever password you want* | This is the login password. Pick it yourself. |
| `SESSION_SECRET` | *a long random string* | Used to sign the login session. Just mash 40+ random characters, or generate one (see below). It's not shown to anyone; you never type it again. |
| `UPSTASH_REDIS_REST_URL` | *(copy from your existing project)* | Same value your current dashboard already uses. |
| `UPSTASH_REDIS_REST_TOKEN` | *(copy from your existing project)* | Same value your current dashboard already uses. |

- For each: paste the value, make sure **Production** (and ideally Preview + Development) is
  checked, and Save.
- To get the two `UPSTASH_...` values: open your OLD Vercel project → Settings →
  Environment Variables → reveal and copy each one. (Or copy them from the Upstash console.)
- For `SESSION_SECRET`, any long random string works. If you want a strong one, you can type
  a jumble of letters/numbers — length matters more than cleverness. Don't reuse the password.

## Step 4 — Deploy / redeploy

- Deployments tab → Redeploy the latest (or it deploys automatically after the repo import).
- Wait for **Ready**.

## Step 5 — Test

1. Open your new `.vercel.app` link in an incognito window.
2. You should see the **password screen**, not the dashboard.
3. Enter the password you set in `DASHBOARD_PASSWORD` → the dashboard loads.
4. The little **Log out** button is in the footer.

## Sharing with your 2 managers

Just give them the link + the password. They enter it once; their browser stays logged in
for 30 days before asking again. No accounts, no Google, nothing to install.

## Changing the password later

Vercel → Settings → Environment Variables → edit `DASHBOARD_PASSWORD` → Save → redeploy.
Everyone currently logged in stays logged in until their 30 days lapse; new logins need the
new password. (If you ever need to force everyone out immediately, change `SESSION_SECRET`
instead — that instantly invalidates all existing sessions.)

## What this login does and doesn't do

- **Does:** stops anyone without the password from seeing the dashboard OR its data. The data
  API is checked on the server, so nothing loads in the browser until the password is right.
- **Doesn't:** track who logged in (it's one shared password), and doesn't protect the Google
  Sheets themselves — those are still governed by their own Google sharing settings, so keep
  them limited to the right people there too.
