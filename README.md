# Padel Bootcamp Tracker

Shared scoreboard for 6 players with per-player buttons:

- `Win` / `Tie` / `Loss` button on every player row
- configurable `winPoints` and `tiePoints`
- explicit `Save` button
- `Reload` and `Reset` controls
- online shared persistence on Vercel when Redis env vars are configured

## Scoring

- Win = `winPoints` (default `1`)
- Tie = `tiePoints` (default `0.5`)
- Loss = `0`

The app shows both per-player points and overall totals.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

## Storage Modes

The backend route `src/app/api/scoreboard/route.ts` supports two modes:

1. `redis` mode (recommended for Vercel production)
: Uses Upstash Redis via env vars and is shared across devices.
2. `json` mode (fallback)
: Uses `data/scoreboard.json` for local/simple testing.

## Shared Online Persistence (Recommended)

Use Upstash Redis on Vercel:

1. Create a Redis database (Upstash integration in Vercel marketplace).
2. Add env vars in Vercel project settings:
	- `UPSTASH_REDIS_REST_URL`
	- `UPSTASH_REDIS_REST_TOKEN`
3. For local testing, copy `.env.example` to `.env.local` and fill values.

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the repo in Vercel.
3. Set environment variables listed above.
4. Deploy.

After deploy, all users/devices share the same scoreboard when Redis vars are configured.

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server locally
- `npm run lint` - run lint checks
