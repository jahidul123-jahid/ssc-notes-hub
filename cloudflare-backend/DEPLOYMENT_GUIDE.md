# SSC Note Box — Cloudflare Deployment & Migration Guide

## 1. Overview
This backend completely replaces Supabase with:
- **Cloudflare D1**: SQL database for all note records, reports, and admin sessions.
- **Cloudflare R2**: Object storage for all uploaded handwritten notes and PDFs.
- **Cloudflare Workers**: High-performance REST API with Hono.
- **Better Auth / Secure Admin Auth**: Role-based authentication with session tokens.

---

## 2. One-Time Setup (2 Minutes)

### Step 1: Login to Cloudflare in Terminal
Run in your terminal:
```powershell
npx wrangler login
```
*(Your browser will open to log in with your Cloudflare account and click 'Allow'.)*

### Step 2: Create Cloudflare D1 Database
Run:
```powershell
cd "e:\edit metarial\wabite\cloudflare-backend"
npx wrangler d1 create ssc-notebox-db
```
Copy the `database_id` shown in the terminal output and paste it into `wrangler.jsonc` replacing `ssc-notebox-db-placeholder`.

### Step 3: Initialize D1 Schema & Seed All 52 Notes
Run:
```powershell
npx wrangler d1 execute ssc-notebox-db --remote --file=./schema.sql
npx wrangler d1 execute ssc-notebox-db --remote --file=./d1_seed_notes.sql
```

### Step 4: Create Cloudflare R2 Storage Bucket
Run:
```powershell
npx wrangler r2 bucket create ssc-notebox-files
```

### Step 5: Upload All 49 Backed-Up Note PDFs to R2
Run:
```powershell
node sync_to_r2.js
```

### Step 6: Deploy the Worker to Cloudflare
Run:
```powershell
npx wrangler deploy
```
It will output your live API URL (e.g., `https://ssc-notebox-api.<your-subdomain>.workers.dev`).

---

## 3. Connect to Website
1. Open your website's **Owner Control Panel** (`/owner` or Settings).
2. Go to **সিস্টেম সেটিংস (System)**.
3. Under **ক্লাউডফ্লেয়ার (Cloudflare D1 & R2) হাই-স্পিড ব্যাকএন্ড**, paste your Worker API URL.
4. Click **সংরক্ষণ ও সংযোগ পরীক্ষা (Save & Test Connection)**.

Done! Your website is now fully powered by Cloudflare with zero data loss!
