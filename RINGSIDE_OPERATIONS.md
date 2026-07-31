# RINGSIDE operations checklist

This is the day-to-day process for keeping RINGSIDE current without changing code every time boxing moves.

## Weekly live-data routine

Do this once a week, and again during fight week for major cards.

1. Open **Fight Cards** and check the public schedule.
2. Open **Card Admin** and update each card:
   - fight date
   - venue
   - broadcast/platform
   - status: `scheduled`, `postponed`, `cancelled`, or `completed`
   - `source_checked_at`
   - `expires_at`
   - source links
3. If the matchup already happened, mark the card completed and add the official result in **History**.
4. Open **Roster** and update any fighters who changed division, record, image, or best-version note.
5. Refresh the public site and confirm the homepage count and Fight Cards page look right.

## After a real fight happens

Use this order so the simulator stops guessing as soon as possible.

1. **Update the fighter/version**
   - Open **Roster**.
   - Pick the fighter.
   - Update record, image, division, fight weight, best performance, and ratings if needed.
   - If the fight creates a meaningful new version, add it as a new version instead of overwriting a classic one.

2. **Add the verified fight**
   - Open **History**.
   - Add winner, method, scheduled rounds, ended round, official scorecards, knockdowns, deductions, and sources.
   - Use honest data quality:
     - `official_replay` when cards/events are entered
     - `enhanced_replay` when cards/events/stats/round context are strong
     - `verified_outcome` when only the official result is confirmed
     - `scouted_reconstruction` when exact round detail is incomplete

3. **Update the card**
   - Open **Card Admin**.
   - Set the matching upcoming fight to `completed` or remove it if it was cancelled.

4. **Check the public app**
   - Select the same two fighters in Fight Lab.
   - The app should show a verified matchup and replay the real result.

## Fighter image process

RINGSIDE uses three layers for fighter images:

1. Supabase image URL from the Roster Manager.
2. Wikipedia / Wikimedia live portrait lookup.
3. Local placeholder fallback.

Best practice:

- Use the **Roster** tab for important fighters first.
- Prefer stable public URLs from official fighter/team/promoter pages or Wikimedia.
- Avoid hotlinking random social-media images that may disappear.
- If a portrait flashes and reverts, the URL is probably blocked, expired, or failing image validation. Replace it with a cleaner direct image URL.

## Verified-history expansion process

The app already has a broad starter archive. The next quality jump is not just adding more names — it is upgrading records from outcome-only to full replay.

Priority order:

1. Popular controversial fights:
   - Haney vs Lomachenko
   - Whitaker vs De La Hoya
   - Chávez vs Whitaker
   - Taylor vs Catterall I
2. Mega fights users will test first:
   - Mayweather vs Pacquiao
   - Mayweather vs Canelo
   - Canelo vs Golovkin trilogy
   - Crawford vs Spence
   - Fury vs Wilder trilogy
3. Current active fighters:
   - Shakur Stevenson
   - Devin Haney
   - Ryan Garcia
   - Teófimo López
   - Gervonta Davis
   - Jaron Ennis
   - Vergil Ortiz Jr.
   - David Benavidez
   - Jesse “Bam” Rodriguez

For each upgraded fight, collect:

- official result
- exact scorecards
- knockdowns
- point deductions
- stoppage round/time, if any
- official or reputable punch stats when available
- fan/public consensus notes
- source links

## No-cost domain path

You do not need to buy a custom domain for the demo.

Current free path:

- keep the Vercel production URL
- optionally rename the Vercel project to get the cleanest free `*.vercel.app` address available
- do not add a custom domain unless you actually own it

If you later want `ringside.app` or another custom domain, you must buy/own that domain first and then point DNS records to Vercel.

## Demo-readiness checklist

Before sending the app to someone:

1. Open it on laptop.
2. Open it on phone.
3. Run one historical fight and confirm it says verified replay.
4. Run one hypothetical fight and confirm it says hypothetical simulation.
5. Save a fight while signed in.
6. Open **My Fights** and confirm only that profile’s saved fights appear.
7. Copy a share link and open it in a private/incognito window.
8. Open **Fight Cards** and confirm no stale or cancelled card is being promoted as live.

