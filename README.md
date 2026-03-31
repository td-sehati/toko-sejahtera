<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LunasKas / Kasir2

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create `.env` from `.env.example`, then fill:
   `VITE_SUPABASE_URL`
   `VITE_SUPABASE_ANON_KEY`
3. Run the database schema in Supabase SQL Editor:
   [`supabase/schema.sql`](d:/PROJECT/KASIR2/supabase/schema.sql)
4. Run the app:
   `npm run dev`

## Supabase Setup

1. Create a new Supabase project.
2. Open `SQL Editor`.
3. Paste the contents of [`supabase/schema.sql`](d:/PROJECT/KASIR2/supabase/schema.sql) and run it.
4. Copy Project URL and anon key into `.env`.
5. Restart `npm run dev`.

The schema file already includes:
- all required tables
- indexes
- starter seed data
- permissive RLS policies for development

## Deploy to GitHub + Cloudflare Pages

1. Push this project to GitHub.
2. In Cloudflare Dashboard, open `Workers & Pages` -> `Create application` -> `Pages` -> `Connect to Git`.
3. Select your repository.
4. Use these build settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Add environment variables in Cloudflare Pages:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy.

If the app is updated later:
- push changes to GitHub
- Cloudflare Pages will redeploy automatically
