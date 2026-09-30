# 888 Avenger RCACS Band Portal

Official web application and secure sheet music repository for the **888 Avenger Royal Canadian Air Cadet Squadron (RCACS) Band**, based in Vancouver, British Columbia (meeting at Walter Moberly Elementary School, 1000 East 59th Avenue, Vancouver, BC V5X 1Y7).

---

## 🎖️ Features

- **Royal Canadian Air Cadet Aesthetic:** Styled with deep Royal Blue primary hues (`#060B18`, `#002D62`) and rich Gold accents (`#FFD700`, `#D4AF37`), featuring heraldic squadron crests and ceremonial parade typography.
- **Dual Role Access Control:**
  - `admin`: Band Officers, Civilian Instructors, and Band Cadets-in-Charge (CICs). Full read/write access to squadron roster, attendance roll-call, score uploads, and absence approvals.
  - `member`: Cadet Musicians. Can view **ONLY** their own assigned sheet music parts, their personal attendance log, and submit excused absence requests.
- **Strict Supabase Row-Level Security (RLS):** Cadet personal contact details, emails, phones, and unassigned sheet music are completely shielded from peer members at the database level.
- **My Sheet Music Locker:** Secure PDF viewer with zoom, rotation, and high-fidelity score downloads.
- **Automated Attendance Tracker:** Roll-call interface for Wednesday parade nights with an **"Auto-Mark AE"** workflow that updates attendance to *Absent Excused (AE)* and approves requests in one click.
- **CSV Export:** One-click attendance report export for squadron administration and DND annual reviews.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend / Database:** Supabase (Auth, PostgreSQL Database, Row-Level Security, Storage).
- **Deployment:** Cloudflare Pages (Static Site Generation / SPA).

---

## ⚡ Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Populate your Supabase project credentials:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

The portal starts with an empty local data store. Configure Supabase before creating accounts or operational records.

### 3. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

---

## 📊 Supabase Database & RLS Setup

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** tab.
3. Open `/supabase-schema.sql` (or click the **Supabase SQL** button in the portal header to copy it with 1 click).
4. Paste the entire script into the SQL editor and click **Run**.

The script creates an empty database; it does not insert roster, music, attendance, calendar, or absence records. New accounts are always created as `member` accounts. After creating the first officer account, promote it in the SQL Editor with:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE cadet365_email = 'officer-email@example.com';
```

### Schema Summary
- `profiles`: Linked 1:1 to `auth.users(id)` storing `first_name`, `last_name`, `rank`, `cadet365_email`, `instrument`, `role` ('admin' | 'member'), and `phone`.
- `sheet_music`: Master songs (`id`, `title`, `composer`, `created_at`).
- `song_parts`: Specific instrument parts linked to a song (`id`, `song_id`, `instrument_part`, `file_url`, `created_at`).
- `part_assignments`: Maps song parts to individual cadets (`song_part_id`, `profile_id`).
- `attendance`: Rehearsal logs (`profile_id`, `date`, `status`, `marked_by`, `created_at`).
- `excused_absences`: Cadet absence requests (`profile_id`, `date_of_absence`, `reason`, `status`).
- `storage.buckets`: Public bucket `'sheet-music'` with 50MB file size limit for PDFs.

---

## ☁️ Deploying to Cloudflare Pages

### Option A: Via GitHub Integration (Recommended)
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for 888 Avenger RCACS Band Portal"
   git remote add origin https://github.com/your-org/888-avenger-band.git
   git push -u origin main
   ```
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/):
   - Navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
   - Select the `888-avenger-band` repository.
3. Configure Build Settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add Environment Variables in Cloudflare Pages:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
5. Click **Save and Deploy**. Cloudflare Pages will build and deploy on edge nodes globally with instant SSL.

### Option B: Via Wrangler CLI
1. Install Wrangler globally or run via npx:
   ```bash
   npm run build
   npx wrangler pages deploy dist --project-name=888-avenger-band
   ```
2. Follow prompts to authenticate and publish the site.

---

## 🛡️ Squadron Motto

**Audax et Celer** — *Bold and Swift*  
888 Avenger Royal Canadian Air Cadet Squadron Band  
Walter Moberly Elementary School · 1000 East 59th Ave, Vancouver, BC V5X 1Y7, Canada  
Official Squadron Website: [888aircadets.ca](http://888aircadets.ca/)
