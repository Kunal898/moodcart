# MoodCart — Production Deployment Guide

This guide details the complete, production-ready deployment procedure for MoodCart across **Vercel** (Frontend), **Render** (Backend), **Supabase** (Database, Auth, Storage), and **GitHub** (Source Control).

---

## 🏗️ Architecture Overview

```text
┌─────────────────────────────────┐
│     Client Browser              │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Frontend: Vercel (SPA)         │
│  - React 19 + Vite 8            │
│  - Client routing via vercel.json│
└──────────────┬──────────────────┘
               │  REST API (CORS enabled)
               ▼
┌─────────────────────────────────┐
│  Backend: Render Web Service    │
│  - Node.js + Express 5          │
│  - In-memory upload buffer      │
│  - Auto-confirm auth endpoints  │
└──────────────┬──────────────────┘
               │  Service Role (Bypass RLS)
               ▼
┌────────────────────────────────────────────────────────┐
│  Database, Auth & Storage: Supabase                    │
│  - PostgreSQL 15 + Row Level Security (RLS)            │
│  - Auth.users + Profiles table                         │
│  - Public Storage Bucket: 'products'                   │
└────────────────────────────────────────────────────────┘
```

---

## 1. GitHub Repository Preparation

### 1.1 Verify `.gitignore`
Make sure no sensitive environment files are committed. The root [.gitignore](file:///c:/Users/Kunal/OneDrive/Desktop/E-commeres/.gitignore) is configured to ignore all `.env` and `.env.local` files while preserving `.env.example`.

### 1.2 Push to GitHub
```bash
git add .
git commit -m "chore: prepare for production deployment to Vercel and Render"
git branch -M main
git remote add origin https://github.com/<your-username>/moodcart.git
git push -u origin main
```

---

## 2. Supabase Setup (Database, Auth & Storage)

### 2.1 Run Production Schema & Policies
1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Navigate to **SQL Editor** in the left sidebar.
3. Open or copy the contents of [supabase/production_schema.sql](file:///c:/Users/Kunal/OneDrive/Desktop/E-commeres/supabase/production_schema.sql).
4. Click **Run**. This will create/verify:
   - `profiles` with automatic trigger on new user signup
   - `categories`, `products`, `cart_items`, `orders`, `order_items`, `wishlist`
   - Complete Row Level Security (RLS) policies for all tables
   - `storage.buckets` record for the `products` bucket

### 2.2 Configure Public Storage Bucket for Image Uploads
1. Go to **Storage** in the Supabase Dashboard.
2. Confirm the **`products`** bucket exists.
3. If it does not exist, click **New bucket**:
   - Bucket name: `products`
   - **Public bucket**: Toggle **ON** (Required for images to be publicly viewable)
   - Click **Save**.

### 2.3 Configure Supabase Authentication
1. Go to **Authentication** -> **URL Configuration**:
   - **Site URL**: Enter your production Vercel URL (e.g., `https://moodcart.vercel.app`).
   - **Redirect URLs**: Add your production Vercel URL and wildcard preview URLs:
     - `https://moodcart.vercel.app/**`
     - `https://*.vercel.app/**`
     - `http://localhost:5173/**` (for local development)
2. Go to **Authentication** -> **Providers** -> **Email**:
   - Ensure **Enable Email provider** is ON.
   - Note: MoodCart has a custom backend auto-approval endpoint (`/api/auth/register`), so users are instantly active and approved without email confirmation barriers.

### 2.4 Collect Supabase Credentials
Go to **Project Settings** -> **API**:
* **Project URL**: `https://<project-ref>.supabase.co`
* **anon public key**: `eyJhbGciOi...`
* **service_role secret key**: `eyJhbGciOi...` (Keep secret! Only used on Render backend)

---

## 3. Backend Deployment on Render

### 3.1 Create Render Web Service
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`moodcart`).
4. Configure the service settings:
   * **Name**: `moodcart-backend` (or your preferred name)
   * **Region**: Choose the region closest to your users / Supabase region (e.g., Singapore, Frankfurt, Oregon)
   * **Branch**: `main`
   * **Root Directory**: `backend` *(Crucial: Set this to `backend`)*
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start` *(or `node server.js`)*
   * **Instance Type**: `Free` (or higher)

### 3.2 Add Environment Variables in Render
In the **Environment** tab on Render, add the following variables:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode |
| `PORT` | `10000` *(Render sets this automatically)* | Port Express listens on |
| `SUPABASE_URL` | `https://<your-project-ref>.supabase.co` | Supabase Project URL |
| `SUPABASE_ANON_KEY` | `<your-supabase-anon-key>` | Public Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | `<your-supabase-service-role-key>` | Secret Service Role Key (Bypasses RLS on server) |
| `FRONTEND_URL` | `https://moodcart.vercel.app` *(update once Vercel URL is generated)* | Allowed origin for CORS |
| `ALLOW_VERCEL_PREVIEWS` | `true` | Allows all `*.vercel.app` branches |

Click **Create Web Service** (or **Save Changes**).

### 3.3 Verify Backend Deployment
Once deployed, Render provides a URL (e.g., `https://moodcart-backend.onrender.com`).
Test the health endpoint in your browser:
```text
https://moodcart-backend.onrender.com/api/health
```
Expected response:
```json
{ "status": "ok", "message": "MoodCart API is running" }
```

---

## 4. Frontend Deployment on Vercel

### 4.1 Import Repository on Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your `moodcart` GitHub repository.

### 4.2 Configure Build & Output Settings
* **Framework Preset**: `Vite`
* **Root Directory**: Click **Edit** and select **`frontend`** *(Crucial: Set this to `frontend`)*
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Install Command**: `npm install`

### 4.3 Configure Environment Variables on Vercel
In the **Environment Variables** section, enter:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://moodcart-backend.onrender.com` | Your Render Backend URL (no trailing slash) |
| `VITE_SUPABASE_URL` | `https://<your-project-ref>.supabase.co` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | `<your-supabase-anon-key>` | Your Supabase Anon Public Key |

> ⚠️ **SECURITY WARNING**: NEVER put `SUPABASE_SERVICE_ROLE_KEY` in Vercel. Only the public anon key belongs on the frontend.

### 4.4 Deploy
Click **Deploy**.
Vercel will build the frontend in ~30-45 seconds and provide your live production URL (e.g., `https://moodcart.vercel.app`).

### 4.5 Verify Client-Side Routing
MoodCart includes [frontend/vercel.json](file:///c:/Users/Kunal/OneDrive/Desktop/E-commeres/frontend/vercel.json) with client-side rewrites:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Directly open and refresh deep routes like `/products`, `/cart`, `/orders`, `/admin` to verify that **no 404 error occurs**.

---

## 5. Synchronize CORS (Render ↔ Vercel)

Now that Vercel has generated your frontend domain:
1. Open your **Render Dashboard** -> `moodcart-backend` -> **Environment**.
2. Update `FRONTEND_URL` to match your exact Vercel URL:
   ```text
   FRONTEND_URL=https://moodcart.vercel.app,http://localhost:5173
   ```
3. Click **Save Changes**. Render will automatically redeploy with the updated CORS policy.

---

## 6. End-to-End Production Testing Checklist

Open your live Vercel URL and verify each flow:

- [ ] **Home Page**: Hero slider auto-advances, animated header is active, Trust & Value perks strip renders below hero ads with zero blank space.
- [ ] **Registration**: Register a new account (e.g. `testuser@moodcart.com`). Verification should be **instant and auto-approved**, and you should be automatically logged in without email verification errors.
- [ ] **Login / Logout**: Log out and log back in with your newly registered credentials.
- [ ] **Product Catalog**: Browse `/products`, filter by category and mood.
- [ ] **Mood Finder**: Click "Find Mood", answer questions, and view recommendations.
- [ ] **Product Details**: Open any product, click thumbnail selectors, check match score.
- [ ] **Wishlist**: Click the heart button on a product; verify it reflects in `/wishlist`.
- [ ] **Cart**: Add products to cart; verify count badge pulses in navbar; update quantity in `/cart`.
- [ ] **Checkout**: Fill in shipping details and place an order; verify redirect to confirmation page.
- [ ] **My Orders**: Navigate to `/orders` and view your placed order details.
- [ ] **Admin Panel**: Log in with an admin account (role `admin` in `profiles`), navigate to `/admin`, create a new product, and upload an image (verifying memory-to-Supabase Storage streaming).

---

## 7. Master Environment Variables Reference

### Render (Backend) Settings

```env
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-app.vercel.app
ALLOW_VERCEL_PREVIEWS=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

### Vercel (Frontend) Settings

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```
