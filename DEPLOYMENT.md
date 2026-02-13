# Scentsmiths Deployment Guide

This guide walks you through deploying the Scentsmiths app to **Supabase** (database), **Render** (backend API), and **Vercel** (frontend PWA).

---

## 📁 Project Structure

```
Scent/
├── backend/              ← Deploy to Render
│   ├── server.js
│   ├── package.json
│   ├── schema.sql        ← Run in Supabase SQL Editor
│   └── routes/...
├── src/                  ← Frontend source (compiled by Vite)
│   ├── ScentsmithsApp.tsx
│   ├── ScentsmithsAdmin.tsx
│   ├── api.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json          ← Frontend dependencies
├── vite.config.ts
├── vercel.json           ← Vercel SPA routing config
└── DEPLOYMENT.md         ← This file
```

> [!IMPORTANT]
> You will need **two separate Git repositories** (or two root directories in a monorepo):
> - One for the **frontend** (`Scent/` root, excluding `backend/`)
> - One for the **backend** (`Scent/backend/`)
>
> The simplest approach: push the entire `Scent/` folder as one repo for the frontend (Vercel will ignore `backend/`), and push `backend/` as a separate repo for Render.

---

## Step 1: Supabase Setup (Database)

### 1.1 Create a Supabase project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**, choose a name and password, pick a region close to you
3. Wait for the project to finish provisioning

### 1.2 Run the schema migration
1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `backend/schema.sql` from your project
3. Paste the entire contents into the editor
4. Click **Run** — this creates all tables and inserts seed data

### 1.3 Copy your credentials
From the Supabase dashboard, go to **Settings → API** and copy:

| What | Where to find it | You'll use it in |
|------|-------------------|------------------|
| **Project URL** | Settings → API → Project URL | Backend `.env` as `SUPABASE_URL` |
| **Service Role Key** | Settings → API → `service_role` (secret!) | Backend `.env` as `SUPABASE_SERVICE_KEY` |

> [!CAUTION]
> The **service_role** key has full database access. Never expose it in frontend code or commit it to Git.

---

## Step 2: Deploy Backend to Render

### 2.1 Prepare the backend repo
1. Create a new Git repository (e.g., on GitHub) named `scentsmiths-api`
2. Push only the `backend/` folder contents (not the folder itself) to this repo:
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend"
   git remote add origin https://github.com/YOUR_USERNAME/scentsmiths-api.git
   git push -u origin main
   ```

### 2.2 Create a Render Web Service
1. Go to [render.com](https://render.com) and sign in
2. Click **New → Web Service**
3. Connect your `scentsmiths-api` GitHub repo
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `scentsmiths-api` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### 2.3 Set environment variables in Render
In the Render service dashboard, go to **Environment** and add:

| Variable | Value |
|----------|-------|
| `PORT` | `5000` |
| `JWT_SECRET` | Any random secret string (e.g., `my-super-secret-jwt-key-2026`) |
| `SUPABASE_URL` | Your Supabase Project URL from Step 1.3 |
| `SUPABASE_SERVICE_KEY` | Your Supabase service_role key from Step 1.3 |

### 2.4 Deploy
Click **Deploy** (or it auto-deploys on push). Render will give you a URL like:
```
https://scentsmiths-api.onrender.com
```

**Save this URL** — you'll need it for the frontend.

### 2.5 Test the backend
```bash
curl https://scentsmiths-api.onrender.com
# Should return: {"status":"ok","service":"Scentsmiths API"}

curl https://scentsmiths-api.onrender.com/api/products
# Should return the seed products from your database
```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Prepare the frontend repo
1. Create a new Git repository (e.g., `scentsmiths-pwa`)
2. Push the entire `Scent/` folder (the root with `package.json`, `src/`, etc.):
   ```bash
   cd Scent
   git init
   git add .
   git commit -m "Initial frontend"
   git remote add origin https://github.com/YOUR_USERNAME/scentsmiths-pwa.git
   git push -u origin main
   ```

> [!TIP]
> If you push from the `Scent/` root, the `backend/` folder will be included but Vercel ignores it — Vercel only builds the frontend using `vite build`.

### 3.2 Import to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Import your `scentsmiths-pwa` repository
4. Vercel should auto-detect **Vite** — verify these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 3.3 Set environment variables in Vercel
In the Vercel project settings, go to **Settings → Environment Variables** and add:

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_API_URL` | Your Render backend URL | `https://scentsmiths-api.onrender.com` |

> [!IMPORTANT]
> Vite environment variables **must** start with `VITE_` to be accessible in the browser. This is the only env var the frontend needs.

### 3.4 Deploy
Click **Deploy**. Vercel will build and give you a URL like:
```
https://scentsmiths-pwa.vercel.app
```

### 3.5 Access your app
- **Consumer PWA**: `https://scentsmiths-pwa.vercel.app/`
- **Admin Dashboard**: `https://scentsmiths-pwa.vercel.app/admin`

---

## Step 4: Verify Everything Works

| Test | How |
|------|-----|
| Products load | Open the consumer app — you should see perfumes from the database |
| Sign up works | Create an account — data goes to Supabase `users` table |
| Login works | Log in — you get a JWT, session persists on refresh |
| Admin loads | Go to `/admin` — dashboard shows stats |
| Offline fallback | If the API is unreachable, the app shows mock data |

---

## 🔧 Local Development

To run everything locally before deploying:

```bash
# Terminal 1: Start the backend
cd backend
cp .env.example .env          # Edit with your Supabase credentials
npm install
npm run dev                    # Runs on http://localhost:5000

# Terminal 2: Start the frontend
cd Scent
npm install
npm run dev                    # Runs on http://localhost:3000
```

The Vite dev server proxies `/api` and `/auth` requests to `localhost:5000`, so you don't need to set `VITE_API_URL` during development.

---

## 📝 Quick Reference: All Environment Variables

### Backend (Render)
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Optional | Default: 5000 |
| `JWT_SECRET` | ✅ | Any secret string for signing tokens |
| `SUPABASE_URL` | ✅ | From Supabase Settings → API |
| `SUPABASE_SERVICE_KEY` | ✅ | From Supabase Settings → API (service_role) |

### Frontend (Vercel)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Your Render backend URL (e.g., `https://scentsmiths-api.onrender.com`) |

---

## ⚠️ Common Issues

| Issue | Fix |
|-------|-----|
| Products don't load | Check that `schema.sql` was run in Supabase and `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` are correct in Render |
| 401 errors on login | Make sure `JWT_SECRET` is set in Render env vars |
| Frontend shows mock data | Verify `VITE_API_URL` is set correctly in Vercel env vars (no trailing slash) |
| `/admin` returns 404 on Vercel | Make sure `vercel.json` is in the repo root — it handles SPA routing |
| Render free tier sleeps | First request after 15min of inactivity takes ~30s to wake up — this is normal |

---

## 🌐 Changing Your Domain

If you want to use a custom domain (e.g., `www.myscentstore.com`) instead of `vercel.app`:

1.  **Vercel (Frontend)**:
    -   Go to Settings → Domains and add your custom domain.
    -   Vercel will give you DNS records to add to your domain registrar.

2.  **Supabase (Auth)**:
    -   Go to **Authentication → URL Configuration**.
    -   Update **Site URL** to your new domain (e.g., `https://www.myscentstore.com`).
    -   *Why?* This ensures "Forgot Password" and email confirmation links point to your custom domain, not the old Vercel one.

3.  **Render (Backend)**:
    -   **No changes needed.** The backend is configured to accept requests from any domain.
