# Oddlytics mobile app

Football predictions app for iOS and Android, built with React Native and Expo (SDK 58, TypeScript, Expo Router).
It is a working frontend ported from the clickable web prototype. It runs on **sample data** until a real backend is connected.

> Not real fixtures, odds or model output. 18+ only. The app gives information and probability estimates and does not take bets.

## What's in it

- **Launch:** logo splash, then a first-run flow on first launch only: Welcome, Register / Sign in (Google and Apple are simulated), what you follow, and an 18+ check.
- **Bankers:** Today's Picks (top picks by probability) and the Oddlytics Slip (up to 5 picks where outside sources agree).
- **All matches:** Live now strip, search, filters sheet, Live only, sort by competition / kick-off / estimate, collapsible leagues sorted by competition.
- **Bet Builder:** settings only (day, event type, total odds, number of matches, min/max odd per pick, min probability) with **Clear filter** and **Generate slip**.
- **Favourites:** saved matches, teams and competitions. Team and league pages show standings, form and season stats.
- **Match page:** Overview, Predictions, Stats, **Standings**, Form & H2H and Lineups tabs. Settled matches show the result and settlement.
- **Account:** profile and sign out, Plus paywall, alerts, track record, info pages, "Preview as Plus" demo switch, and Replay welcome.
- Glassmorphism bottom sheets that you drag down to close, frosted locked (Plus) content, and the purple tab pill.

Favourites, follows, settings and the signed-in user are saved on the device with AsyncStorage.

## Run it

You need [Node.js](https://nodejs.org) 20 or newer (LTS is fine).

```bash
cd oddlytics-mobile
npm install
npx expo start
```

Then:

- **Phone:** install **Expo Go** from the App Store or Play Store and scan the QR code shown in the terminal. Your phone and computer must be on the same Wi-Fi.
- **Android emulator:** press `a` (needs Android Studio).
- **iOS simulator:** press `i` (needs a Mac with Xcode).
- **Browser preview:** press `w`.

If Expo Go says the project needs a newer SDK, update Expo Go from the store.

Useful commands:

```bash
npm run typecheck      # TypeScript check
npx expo-doctor        # checks dependency versions and config
npx expo install --fix # aligns package versions with the Expo SDK
```

## Project layout

```
src/
  app/                  Screens as routes (Expo Router)
    (tabs)/             Bankers, All matches, Bet Builder, Favourites, Account
    match/[id].tsx      Match page
    team/[id].tsx       Team page
    competition/[id].tsx League page (?tab=Standings)
    record.tsx, premium.tsx, competitions.tsx, info/[page].tsx
    _layout.tsx         Providers, splash, onboarding, sheets, toast
  features/             Screen implementations, one folder per area
  components/           Shared UI: MatchCard, DateRail, DragSheet, Glass, StandingsTable, Header, BottomNav...
  state/                DataProvider (loads data) and AppProvider (favourites, filters, builder, auth state)
  services/             api.ts (the backend seam), sampleApi.ts, httpApi.ts, auth.ts, storage.ts
  data/sample/          Sample fixtures, teams, stats and track record
  config/               brand.ts (app name), plans.ts (prices)
  theme/                Colours and styles
  types/                Data shapes the UI expects
```

## Real football data (API-Football)

The app can load real fixtures, predictions, odds, lineups, events and match stats from
[API-Football](https://www.api-football.com/) (v3.football.api-sports.io). Code: `src/services/apiFootball/`.

**The API key never goes in the app.** Anything built into an app can be pulled out of it, and a leaked key
lets anyone use up your daily requests. So the app talks to a small proxy that adds the key on the server:

```
phone app  ->  proxy (holds the key, caches answers)  ->  API-Football
```

### Run it on your computer (development)

1. Copy `.env.example` to `.env` and set `APIFOOTBALL_KEY=` to your key (no `EXPO_PUBLIC_` prefix, so Expo never bundles it).
2. `npm run proxy`. It prints a line like `EXPO_PUBLIC_FOOTBALL_PROXY_URL=http://192.168.1.20:8787`.
3. Put that line in `.env` (use `http://localhost:8787` for the web build), then restart `npx expo start -c`.

Your phone and computer must be on the same Wi-Fi. The proxy caches to `server/.cache/` so restarts don't spend requests.

### For the store release (Supabase)

The same proxy as a Supabase Edge Function, with the cache in a database table so every user shares it:

```
supabase secrets set APIFOOTBALL_KEY=<your key>
supabase db push                        # creates api_football_cache
supabase functions deploy football
```

Then set `EXPO_PUBLIC_FOOTBALL_PROXY_URL=https://<project-ref>.supabase.co/functions/v1/football` and
`EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>` (the anon key is public by design).

### What the free plan allows (checked 26 Nov 2026)

- 100 requests a day, 10 a minute.
- Fixtures only for yesterday, today and tomorrow (`EXPO_PUBLIC_FOOTBALL_DAY_RANGE=1`). Other days come back empty.
- No league tables for the current season. The app hides the table and stops asking for 12 hours.
- Predictions, odds, lineups, events and match stats all work.

How the app stays inside 100 a day: every answer is cached on the phone and in the proxy (today's fixtures 20 min,
other days 3 to 24 h, predictions 12 h, odds 3 h, finished matches 7 days). About 20 predictions load in the
background per start (`EXPO_PUBLIC_FOOTBALL_PREFETCH_PREDICTIONS`); the rest load when a match is opened. Live
scores every minute, more days, league tables and "every league" (`EXPO_PUBLIC_FOOTBALL_LEAGUES=all`) need a paid plan.

How picks are made: API-Football gives home/draw/away percentages and an advice line. Goal markets (O/U, BTTS, team
goals) come from a Poisson model on both teams' season scoring. The pick is the provider's advice when it has 55%+,
otherwise the likeliest market under 88%. See `src/services/apiFootball/model.ts`.

If the proxy can't be reached on first load, the app falls back to the sample data (Account shows which is in use).

## Connecting your own backend

All data goes through one interface, `OddlyticsApi` in `src/services/api.ts`:

```ts
getCompetitions(): Promise<Competition[]>
getTeams(): Promise<Team[]>
getMatches(fromDay, toDay): Promise<Match[]>
getStandings(compId): Promise<StandingRow[]>
```

1. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL=https://your-api.example.com`.
2. Make your server return the shapes in `src/types/index.ts` from the endpoints listed in `src/services/httpApi.ts`, or edit `httpApi.ts` to map your provider's format.
3. Restart `npx expo start`. When the variable is set, the app stops using sample data.

Still sample-only (with either source), and where to replace it:

- Team and league page season stats: `src/data/sample/insights.ts` (match pages use API-Football when it's connected).
- Track record figures: `src/data/sample/trackRecord.ts`.
- Sign in / register: `src/services/auth.ts` (swap in Firebase Auth, Supabase, Auth0 or your own API; keep the function signatures).
- Plus purchases: the button in `src/features/premium/PremiumScreen.tsx` (use App Store / Google Play billing, for example RevenueCat).
- "Sources agree" consensus on the Oddlytics Slip needs licensed data (`Match.consensus`).

## Renaming the app

The name lives in two places:

1. `src/config/brand.ts`: display name, wordmark, Plus and Slip names.
2. `app.json`: `name`, `slug`, `scheme`, `ios.bundleIdentifier` and `android.package`.

Replace the icons in `assets/` (they are simple placeholders).

## Publishing to the App Store and Play Store

Use [EAS Build](https://docs.expo.dev/build/introduction/) (an `eas.json` is included):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview   # installable APK for testing
eas build --platform all --profile production    # store builds
eas submit --platform ios
eas submit --platform android
```

You need an Apple Developer account and a Google Play Console account. Before submitting, set your real bundle identifiers in `app.json`, replace the icons, and add a privacy policy URL. Betting-related apps get extra review on both stores: keep the 18+ gate and responsible-play pages, and check the rules for each country you launch in.

## Pushing to GitHub

```bash
cd oddlytics-mobile
git init
git add .
git commit -m "Oddlytics mobile app"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

`node_modules/` and `.env` are already in `.gitignore`.

## Notes

- Web preview: async routes are turned off in `app.json` because route code-splitting left one screen blank in the web build. Native builds are unaffected.
- Kick-off times are shown as sample local times with a WAT label. With a real API, send ISO times and format them on the device.
