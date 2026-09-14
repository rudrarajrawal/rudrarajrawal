# Gym Home Planner

A single-page, no-build web app: a home gym dashboard with a live clock, multiple guided workout programs, a rest timer, workout logging with a streak counter, and Apple Health data import.

## Run it

No build step needed — just open `index.html` in a browser, or serve the folder statically (e.g. `npx serve gym-planner`, or enable GitHub Pages for this repo pointed at `/gym-planner`).

## Features

- **Dashboard** — live digital clock, today's date, a rotating "today's plan" workout, a rest timer, and quick stats (steps / active energy from an Apple Health import, workouts logged, streak).
- **Workouts** — six built-in programs (Push, Pull, Legs, Full Body Beginner, HIIT Cardio, Core & Abs) in `workouts.js`. Each exercise has sets/reps/rest and a check-off list; finishing a session logs it to your Progress tab (saved in `localStorage`).
- **Progress** — history table of logged workouts and a day streak counter.
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

## About the exercise "videos"

There's no AI video-generation service wired into this build. Instead, each exercise shows a small animated SVG "move guide" (`renderMoveGuide` in `app.js`, animations in `style.css`) categorized by movement pattern (push / pull / squat / hinge / core / cardio). The code is structured so a real text-to-video API call could replace `renderMoveGuide()` later without touching the rest of the app — swap in a fetched video URL per exercise and render a `<video>` tag instead of the SVG.

## File structure

```
gym-planner/
├── index.html        # markup for all views
├── style.css          # theme, layout, move-guide animations
├── workouts.js         # workout/exercise data
├── health-import.js    # Apple Health export.zip parsing
├── app.js              # clock, nav, timer, workout logging, wiring
└── README.md
```
