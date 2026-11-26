# Oddlytics clickable prototype

A single-file Expo (React Native) prototype with sample data. It's for trying out UX ideas before they go into the real app in `src/`. Nothing here talks to a live API.

- `App.tsx`: the whole prototype
- `web/`: the latest web build. Open `web/index.html` through any static server (for example `npx serve prototype/web`) to see it inside a phone frame.
- `build.sh`: rebuilds `web/` (`npm install` in this folder first, then `bash build.sh`)

Live preview: https://claude.ai/artifact/4sdUnj6JhCGR2Z6TDnKZ7n

Latest changes: goal-market tips (Over 1.5 / 2.5, Under 3.5, BTTS yes/no), a Market filter in Bet Builder, Total goals 1.5/2.5/3.5 on the match page, Register / Sign in after Get started, drag-to-close sheets, a match Standings tab, and a glass highlight on the selected bottom tab.
