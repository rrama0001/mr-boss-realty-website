# Mr. Boss Realty Website

Public Vue 3 site for browsing properties, units, and contacting Mr. Boss Realty.

## Tech stack

| Area | Technology |
| --- | --- |
| UI framework | Vue 3 |
| Routing | Vue Router |
| Build tool | Vite |
| Language / styles | JavaScript, Sass/SCSS |
| UI kit / icons | Tabler Core, Tabler Icons |
| HTTP client | Axios |
| Markdown (AI chat) | marked |
| HTML sanitization | DOMPurify |
| Events | mitt |
| Production static server | Node `server.js` (Open Graph meta injection) |
| Backend | Mr. Boss Realty API (Express + Prisma + PostgreSQL/Neon) |
| Hosting notes | Cloudflare Pages–friendly (`VITE_*` build env); optional Facebook App ID for Messenger share |

## Requirements

- **Node.js** 18+ (LTS recommended)
- **npm**
- **Mr. Boss Realty API** running locally (default: `http://localhost:3000`) for live listing data
- PostgreSQL set up for the API (website talks to the API only, not the DB directly)

## Setup

```bash
cd mr-boss-realty-website
npm install
cp .env.example .env
```

Edit `.env` if your API, admin, or site URLs differ from the defaults.

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Public API base URL (includes `/api`) |
| `VITE_SITE_URL` | Canonical website URL |
| `VITE_APP_NAME` | App / brand name |
| `VITE_ADMIN_URL` | Admin login URL (header Login link) |
| `VITE_FACEBOOK_APP_ID` | Optional; Messenger share on desktop |

## Start the website (development)

```bash
npm run dev
```

Open **http://localhost:5174**.

API requests to `/api` and `/uploads` are proxied to the host derived from `VITE_API_URL`.

## Production build & server

Build static assets into `dist/`:

```bash
npm run build
```

Serve the built site with the Node static server (Open Graph meta injection included):

```bash
npm start
```

The server listens on `PORT` if set, otherwise **5174**.

```bash
PORT=8080 npm start
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite development server |
| `npm run build` | Production build to `dist/` |
| `npm start` | Serve `dist/` with `server.js` |

## Local checklist

1. API is running (`npm run dev` in `mr-boss-realty-api`) at **http://localhost:3000**
2. Database has listing data (`npm run seed` in the API, or inventory from the admin app)
3. Website `.env` has `VITE_API_URL=http://localhost:3000/api`
4. `npm run dev` in this folder opens **http://localhost:5174**

If the homepage loads but Featured / Sale / Rent sections are empty, the API is reachable but the database has no public/featured listings yet.

## Related apps

| App | Default URL |
| --- | --- |
| API | http://localhost:3000 |
| Admin | http://localhost:5173 |
| Website | http://localhost:5174 |
