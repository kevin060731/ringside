# Supabase setup for RINGSIDE

This is the backend foundation. The app still works without Supabase, but once this is connected it can save private fight simulations, support sign-in, open share links, and pull updated roster data without a full code change.

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

When configured, finished simulations are saved into `saved_fights` under the signed-in user with:

- selected fighters and versions
- fight settings
- result
- scorecards
- punch totals
- round-by-round fight data
- Research Desk context

## Roster Sync

Roster Sync lets Supabase override or add fighters after real fights happen. The app still ships with a local roster, but when it opens it checks Supabase tables first:

Supabase `fighters` + `fighter_versions` → app roster merge → fighter card updates → simulator uses the new version data.

### Updating an existing fighter

Use the fighter's existing `id`, then update the main fighter row and one or more version rows.

Example:

```sql
insert into public.fighters (
  id,
  name,
  last_name,
  country,
  stance,
  primary_division,
  image_url,
  active,
  model_data
) values (
  'ennis',
  'Jaron Ennis',
  'Ennis',
  'USA',
  'Orthodox',
  'Junior Middleweight',
  'https://example.com/boots.jpg',
  true,
  '{"nickname":"Boots","wiki":"Jaron Ennis","updated":"2026-07-18"}'::jsonb
)
on conflict (id) do update set
  name = excluded.name,
  last_name = excluded.last_name,
  country = excluded.country,
  stance = excluded.stance,
  primary_division = excluded.primary_division,
  image_url = excluded.image_url,
  active = excluded.active,
  model_data = excluded.model_data,
  updated_at = now();
```

Then add or update a version:

```sql
insert into public.fighter_versions (
  fighter_id,
  label,
  year,
  division,
  weight_lbs,
  ratings,
  best_performance,
  source_notes,
  is_default
) values (
  'ennis',
  '2026 · 154-LB CAMPAIGN',
  2026,
  'Junior Middleweight',
  154,
  '{"power":93,"speed":95,"chin":92,"defense":93,"iq":94,"footwork":94,"cardio":95,"accuracy":94,"aggression":90}'::jsonb,
  '{"opponent":"Latest opponent","result":"UD 12","note":"Update this with the fighter version’s best performance."}'::jsonb,
  '{"source":"manual roster sync","simulation":{"handRisk":1,"cutRisk":1}}'::jsonb,
  true
);
```

If Supabase has fighter version rows for a fighter, those synced versions become the source of truth for that fighter in the app.

## What comes next

Good next backend features:

1. Admin fighter editor
2. Verified fight history sync
3. Community voting
4. Supabase storage for fighter images
5. Automated research queue for new real fights
