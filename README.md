# BritChat

UK slang dictionary and grammar trainer for the chat team, with a real login per chatter and an admin dashboard of everyone's progress.

## One-time setup

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com), create a free account and a new project (any name/region is fine, pick a strong database password and save it somewhere safe — you won't need it day to day).

### 2. Get your keys
In the new project: **Project Settings → API**. Copy three values into `.env.local` in this folder (a template is already there):
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` — keep this one secret, never commit it or share it, it can read/write everything.

### 3. Run the database migration
In Supabase: **SQL Editor → New query**, paste the entire contents of `supabase/schema.sql`, and click **Run**. This creates the `profiles` and `quiz_progress` tables and their security rules.

### 4. Create your own admin login
```bash
npm install
npm run create-admin
```
Answer the three prompts (username, display name, password). This is the account you'll use to sign in and see the admin dashboard.

### 5. Run it locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000), sign in with the admin account you just created, and use **Admin → Add chatter** to create a login for each of your 20 chatters (share their username/password with them directly, outside this app).

## Deploying it so the team can reach it

1. Push this folder to a new GitHub repository (`git init && git add . && git commit -m "BritChat" && git remote add origin <your repo URL> && git push -u origin main` — or use GitHub's "Create repository" button and follow its instructions for an existing local folder).
2. Go to [vercel.com](https://vercel.com), sign up free, click **Add New → Project**, and import that GitHub repo.
3. In the import screen, expand **Environment Variables** and add the same three values from your `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Click **Deploy**. After a minute you'll get a live link like `britchat-yourname.vercel.app` — that's what you send to the team.
5. Any time you (or I) push a change to the GitHub repo, Vercel redeploys automatically.

## Day-to-day

- **Add a chatter or reset a password**: sign in as admin → **Admin** tab.
- **See who's practicing**: the **Admin** tab's league table ranks chatters by topics completed and average score.
- **Add more slang or grammar questions**: edit `lib/data/content.ts` and redeploy (push to GitHub; Vercel picks it up).
