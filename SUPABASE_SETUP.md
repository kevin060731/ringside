# Supabase setup for RINGSIDE

This is the backend foundation. The app still works without Supabase, but once this is connected it can start saving fight simulations and later support accounts, shared fights, voting, and editable fighter data.

## 1. Create the Supabase project

Go to Supabase, create a new project, and choose a region close to most users.

## 2. Create the tables

In Supabase, open SQL Editor, paste everything from:

`supabase/schema.sql`

Run it once.

## 3. Copy the public app keys

In Supabase:

Project Settings → API

Copy:

- Project URL
- anon public key

## 4. Connect the app

Open `supabase-config.js` and change it to:

```js
global.RINGSIDE_SUPABASE_CONFIG={
 enabled:true,
 url:"https://YOUR-PROJECT.supabase.co",
 anonKey:"YOUR-ANON-PUBLIC-KEY"
};
```

The anon key is designed to be used in browser apps. Security comes from the Row Level Security policies in `supabase/schema.sql`.

## 5. Deploy

Commit and push the changed `supabase-config.js`. Vercel will redeploy.

## What this first version stores

When configured, finished simulations can be saved into `saved_fights` with:

- selected fighters and versions
- fight settings
- result
- scorecards
- punch totals
- round-by-round fight data
- Research Desk context

## What comes next

Good next backend features:

1. Shareable fight-result URLs using `share_slug`
2. User accounts
3. “My Fights”
4. Community voting
5. Admin fighter editor
6. Moving roster and verified fight history from JS files into Supabase tables
