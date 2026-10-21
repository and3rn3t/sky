# CLAUDE.md — Sky

**Read `AGENTS.md` first** — it holds the stack, layout, data sources and conventions.
This file only adds Claude-specific notes.

Celestial-event discovery app on the GitHub Spark template (React 19 + Vite, npm). Early stage.

## Claude-specific notes

- Done gate: `npm run lint && npx tsc --noEmit && npm run build` (the build script skips
  type checking). No tests exist yet — say so rather than claiming tests pass.
- Don't remove the Spark Vite plugins or swap `useKV` for localStorage; the app depends on
  the Spark runtime.
- Treat `README.md` and `CONTRIBUTING.md` as template boilerplate; `PRD.md` is the spec.
- Don't commit, push or deploy unless asked.
