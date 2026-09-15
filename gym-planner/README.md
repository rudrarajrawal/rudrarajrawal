# Gym Home Planner

A single-page, no-build web app: a home gym dashboard with a live clock, multiple guided workout programs, a rest timer, workout logging with a streak counter, a pure-vegetarian meal & calorie counter, a shared leaderboard to compete with friends, and Apple Health data import.

## Run it

No build step needed — just open `index.html` in a browser, or serve the folder statically (e.g. `npx serve gym-planner`, or enable GitHub Pages for this repo pointed at `/gym-planner`).

## Features

- **Dashboard** — live digital clock, today's date, a **Quick Log** free-text box (type what you did, no forms), a rotating "today's plan" workout, a rest timer, and quick stats (steps / active energy from an Apple Health import, workouts logged, streak).
- **Workouts** — six built-in programs (Push, Pull, Legs, Full Body Beginner, HIIT Cardio, Core & Abs) in `workouts.js`. Each exercise has sets/reps/rest and a check-off list; finishing a session logs it to your Progress tab (saved in `localStorage`).
- **Progress** — history table of logged workouts and a day streak counter.
- **Meals** — a pure-vegetarian meal database (no egg, no meat, no fish) in `meals.js`, organized into Breakfast / Lunch-Dinner / Snacks, each with kcal/protein/carbs/fat per serving and a "High Protein" tag (≥12g protein) for gym goals. Log a meal at 0.5x–2x servings to track it against a daily calorie target (editable, saved in `localStorage`); the dashboard shows calories consumed vs. target.
- **Compete** — a shared leaderboard so a few gym friends can compete against each other, even on separate devices/Claude accounts. See below.
- **Apple Health import** — see below.
- **Settings** — dark/light theme, unit preference, and a data-reset button.

## About the Apple Health integration

Apple does not provide a public, live web API for HealthKit — no website, from any vendor, can hold an always-on connection to the Health app. That level of integration only exists for native iOS/watchOS apps built against Apple's HealthKit framework with the user's explicit permission inside that app.

What this app does instead, and what actually works today:

1. On your iPhone: **Health app → profile icon (top right) → Export All Health Data** → this produces `export.zip`.
2. Save/share that zip to whatever device you're using this planner on.
3. Drop it on the **Apple Health** tab. The app unzips and parses `export.xml` entirely in your browser using [JSZip](https://stuk.github.io/jszip/) and the DOM XML parser — the file is never uploaded anywhere.
4. It pulls today's step count, active energy burned, average resting heart rate, and your recent workouts, and reflects them on the dashboard.

If you later want a *live* sync instead of an import, that requires a native iOS companion app using HealthKit (Swift/SwiftUI + `HKHealthStore`), which could push data to this same web dashboard via your own backend — that's a separate, much larger project outside what a browser alone can do.

## About the Compete leaderboard

Everything else in this app is local to one browser (`localStorage`), which doesn't work for a group leaderboard — your friends need to see *your* logged workouts, not just their own. This is backed by a small shared Postgres database (Supabase project `htparsqqsrbyygbvjvqf`), talked to directly from the browser via its REST API (`supabase-client.js`) — no server code to run or deploy.

A Claude Artifact's built-in shared database was considered instead, but it's restricted to viewers signed into the *same* Claude organization — it won't work across friends on separate personal Claude accounts, which is why this uses a real backend instead.

How it works:
1. Each person opens the same deployed copy of this site and picks a name on the **Compete** tab — that's their identity, stored in `localStorage` on their device (no login).
2. Finishing a preset workout, logging a custom exercise, or hitting your daily calorie target all sync points to the shared `gym_activity_logs` table.
3. Scoring (resets every calendar month): **+10** per finished workout, **+5** per custom exercise logged, **+5** once per day for landing within 85–110% of your calorie target, **+3** per Quick Log entry, plus a live streak bonus of **+2/day** (capped at 14 days) for consecutive active days.
4. The **Add Exercise** form (on the Compete tab) is for anything not in the six preset programs — name, sets, reps, weight, and notes, logged with full detail and worth points just like a preset workout. The **Quick Log** box on the dashboard is the fastest path — just type what you did in plain words.

The database's row-level security allows any visitor to read the leaderboard and insert their own log rows (there's no per-user auth) — fine for a small group of friends competing casually, but don't put anything sensitive in it, and note that anyone with the link could technically log entries under any name.

## About the exercise "videos"

There's no AI video-generation service wired into this build. Instead, each exercise shows a small animated SVG "move guide" (`renderMoveGuide` in `app.js`, animations in `style.css`) categorized by movement pattern (push / pull / squat / hinge / core / cardio). The code is structured so a real text-to-video API call could replace `renderMoveGuide()` later without touching the rest of the app — swap in a fetched video URL per exercise and render a `<video>` tag instead of the SVG.

## File structure

```
gym-planner/
├── index.html        # markup for all views
├── style.css          # theme, layout, move-guide animations
├── workouts.js         # workout/exercise data
├── meals.js             # pure-veg meal database (kcal/protein/carbs/fat)
├── supabase-client.js   # minimal fetch-based Supabase REST client
├── compete.js            # join flow, custom exercise log, leaderboard
├── health-import.js    # Apple Health export.zip parsing
├── app.js              # clock, nav, timer, workout logging, wiring
└── README.md
```
