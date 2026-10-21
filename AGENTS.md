# Project Guidelines (AGENTS.md)

<!--
  Single source of truth for AI assistant instructions in this repo.
  CLAUDE.md is a thin pointer to this file — edit HERE.
-->

## Project Overview

**Sky** is a location-aware celestial-event discovery app: what's visible tonight and in
the coming days at the user's location, constellations, aurora forecasts with Kp-index
alerts, a compass/AR view and dark-sky viewing spots. Product spec: `PRD.md`.
(`README.md` is still the stock GitHub Spark template text.)

Early stage. Built on the **GitHub Spark** template and runs on the Spark runtime
(`@github/spark`: KV storage via `useKV`, LLM calls via `spark.llm`).

## Stack

- React 19 + TypeScript 5.9 + Vite 7 (SWC), Tailwind CSS 4, Radix/shadcn UI
  (`src/components/ui/`), Phosphor icons, Framer Motion (imported as `framer-motion`;
  the declared dependency is `motion`), sonner toasts. `three` and `d3` are declared but
  not imported yet; `recharts` is only used by the shadcn `ui/chart.tsx`.
- **npm** (`package-lock.json`), Node `24.22.0` (`.nvmrc`)
- Spark Vite plugins in `vite.config.ts` (`sparkPlugin`, `createIconImportProxy`) are
  marked **DO NOT REMOVE**

## Layout

```
src/
  App.tsx                 # tabs: events · constellations · aurora · compass; holds location/events/spots in useKV
  components/             # EventCard/Dialog, SkyView, StarMap, ARView, Compass, AuroraDashboard,
                          # LightPollutionMap, ViewingSpotCard/Dialog, NotificationSettings, AlertHistory
  components/ui/          # shadcn primitives — regenerate rather than hand-edit
  hooks/                  # use-compass, use-kp-alert (Kp alert polling + history), use-mobile
  lib/
    celestial.ts          # geolocation, reverse geocoding (Nominatim), astronomical events
    nasaApi.ts            # NASA APOD + DONKI (uses the public DEMO_KEY)
    auroraApi.ts          # NOAA SWPC Kp index / solar wind, NASA CCMC DONKI CMEs
    lightPollution.ts     # viewing-spot suggestions via spark.llm
    constellations.ts     # static constellation data
    notificationService.ts# browser Notification API wrapper
    types.ts, utils.ts
  styles/theme.css        # theme CSS variables
```

## Commands

```bash
npm install
npm run dev       # Vite dev server (Spark plugin)
npm run lint      # eslint
npm run build     # tsc -b --noCheck && vite build — note: does NOT type-check
npx tsc --noEmit  # actual type check (no script for it yet)
npm run preview
```

There is no test suite or CI build workflow yet; verify changes in the browser
(`npm run dev`), plus lint and `tsc --noEmit`. `CONTRIBUTING.md` still has template
`TODO` commands — trust `package.json`, not that file.

## Conventions

- Persistent state goes through `useKV<T>(key, default)` from `@github/spark/hooks`
  (keys in use: `user-location`, `celestial-events`, `viewing-spots`,
  `notification-preferences`, `kp-alert-history`). Types live in `src/lib/types.ts`.
- External calls are browser `fetch` to public APIs; keep them in `src/lib/*Api.ts`, handle
  failures with a fallback, never add secrets to the client bundle.
- `@/` alias → `src/`. Tailwind classes only; theme colors from `theme.css`.
- Conventional commits enforced by commitlint (`.husky/commit-msg`).

## Deployment

Runs as a GitHub Spark app (`runtime.config.json`, `spark.meta.json`, KV db type). No
wrangler config in this repo. Never deploy, commit or push unless explicitly asked.
