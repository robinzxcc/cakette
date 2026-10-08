# cakette

Soft Y2K-inspired custom cake shop — full-stack finals project (React + Express + MongoDB).

Customers browse cakes, customize size/flavor/filling/design/add-ons, apply promo codes, reserve pickup capacity, and track orders. Studio tools show real data processing against MongoDB.

**Members:** Merner Magtoto, Jhenile Feliciano  
**Repository:** https://github.com/robinzxcc/cakette  

> Defense walkthrough: see [`DEFENSE.md`](./DEFENSE.md)

## Concept

cakette is more than a CRUD catalog. Orders compute live pricing and discounts, pickup slots enforce capacity, stock decreases on place and restores on cancel, order status follows a controlled workflow, and reviews produce ranked averages per cake.

## App functionality

- Landing page + cake collection (search / filter / sort)
- Cake customizer with live totals and promo codes
- Pickup availability with capacity bars
- Authenticated checkout, order tracking, cancel with confirmation
- Studio dashboard (revenue, stock, status distribution, pickup utilization)
- Menu CRUD (`/manage/cakes`) and promotions CRUD (`/manage/promotions`)
- Reviews + ranking stats
- Profile, about, auth (login / register / forgot password)

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React (Vite) + TypeScript, Tailwind CSS, React Router, React Hook Form, Zod, axios |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |

## Repository structure

```
react-finals/
├── client/              # React Vite + TypeScript frontend
│   ├── .env.example
│   └── src/
├── server/              # Express + Mongoose API
│   ├── .env.example
│   ├── models/
│   ├── routes/
│   └── middleware/
├── docs/screenshots/    # README screenshots
├── start-defense.bat    # Optional: local demo launcher
├── open-error-tabs.bat  # Optional: 404 / health tabs
├── README.md
├── DEFENSE.md
└── .env.example
```

## Setup

### 1. MongoDB Atlas (required for submission)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user (username + password).
3. Network Access → allow `0.0.0.0/0` for class demos (or your IP).
4. Connect → Drivers → copy the SRV connection string.
5. Put it in `server/.env`:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/cakette?retryWrites=true&w=majority
ALLOW_MEMORY_FALLBACK=false
```

6. Confirm grading readiness: `GET http://localhost:8000/api/health` → `"gradingReady": true`.

Local fallback: if Atlas/local Mongo is unavailable and `ALLOW_MEMORY_FALLBACK=true`, the server can use an in-memory Mongo for demos. **For grading, use Atlas and set `ALLOW_MEMORY_FALLBACK=false`.**

### 2. Server

```bash
cd server
cp .env.example .env
# edit MONGO_URI to your Atlas string
npm install
npm run seed
npm run dev
```

API: `http://localhost:8000/api`

Demo accounts after seed:

| Email | Password | Role |
| --- | --- | --- |
| `aya@cakette.test` | `password123` | customer |
| `admin@cakette.test` | `admin123` | admin |

### 3. Client

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173` (Vite also proxies `/api` → port 8000)

### Quick local demo (Windows)

```bat
start-defense.bat
```

Opens the app + API and the main rubric UI tabs. For 404 / health tabs only, run `open-error-tabs.bat`.

## Required environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `MONGO_URI` | `server/.env` | MongoDB Atlas connection string |
| `PORT` | `server/.env` | API port (default `8000`) |
| `CLIENT_ORIGIN` | `server/.env` | CORS origin (`http://localhost:5173`) |
| `VITE_API_URL` | `client/.env` | axios base URL (default `/api`) |

Do **not** commit real `.env` files or `node_modules`.

## API documentation

Base URL: `/api`  
Error format: `{ "message": "…" }`  
Middleware order: request logger → routes → JSON 404 → error handler  

### Auth & profile

| Method | Path | Purpose | Sample request | Sample response |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | Create account | `{ "name","email","password" }` | `201 { token, user }` |
| POST | `/auth/login` | Log in | `{ "email","password" }` | `200 { token, user }` |
| POST | `/auth/forgot-password` | Reset stub | `{ "email" }` | `200 { message }` |
| GET | `/auth/me` | Current user | Bearer token | `200 { user }` |
| PUT | `/users/me` | Update profile | `{ "name","phone" }` | `200 { user }` |

### Cakes (CRUD + processing)

| Method | Path | Purpose | Sample response |
| --- | --- | --- | --- |
| GET | `/cakes` | List | `200 { cakes }` |
| GET | `/cakes/:id` | Get one | `200 { cake }` / `404` |
| POST | `/cakes` | Create | `201 { cake }` |
| PUT | `/cakes/:id` | Update | `200 { cake }` |
| DELETE | `/cakes/:id` | Delete | `200 { message, cake }` |
| GET | `/cakes/search` | **Processing** search/filter/sort | `200 { count, cakes }` |
| GET | `/cakes/stats/summary` | **Processing** catalog stats | `200 { byCategory, lowStock… }` |

### Customers (CRUD)

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/customers` | List / create |
| GET/PUT/DELETE | `/customers/:id` | Read / update / delete |

### Orders (CRUD + processing)

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/orders` | List / place (auth on create) |
| GET/PUT/DELETE | `/orders/:id` | Read / update / delete |
| GET | `/orders/me` | My orders (auth) |
| PATCH | `/orders/:id/cancel` | Cancel + restore stock |
| PATCH | `/orders/:id/status` | **Processing** status transition |
| POST | `/orders/quote` | **Processing** price quote |
| GET | `/orders/stats/summary` | **Processing** revenue / statuses |

### Promotions (CRUD + processing)

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/promotions` | List / create |
| GET/PUT/DELETE | `/promotions/:id` | Read / update / delete |
| POST | `/promotions/validate` | **Processing** promo eligibility |

### Reviews (CRUD + processing)

| Method | Path | Purpose |
| --- | --- | --- |
| GET/POST | `/reviews` | List / create (auth) |
| GET/PUT/DELETE | `/reviews/:id` | Read / update / delete |
| GET | `/reviews/stats/by-cake` | **Processing** rankings |

### Misc processing

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/pickup-slots` | Capacity / availability |
| GET | `/dashboard/overview` | Multi-collection overview |
| GET | `/health` | Health check |

**40+ endpoints** total, including **8 processing endpoints**.

## Features

- Five related Mongoose collections with validation + timestamps
- Seeded demo data for defense
- Capacity-aware pickup booking and stock adjustments
- Promo math, status workflow, review rankings, studio dashboard
- React Hook Form + Zod forms (per-field errors, gated submit)
- Loading / error / empty / success feedback on data screens
- Custom hook (`usePageTitle`, `useCakes`)
- Responsive UI (mobile 375px + desktop)

## Known limitations

- Auth sessions are stored in MongoDB (survive API restarts)
- Cake images live under `client/src/assets` (optional; placeholders if missing)
- Password reset is a stub (extra credit only)
- Payments / cloud deploy not required

## Screenshots

![Landing](docs/screenshots/landing.png)

More captures live in [`docs/screenshots/`](docs/screenshots/).

## Member contributions

| Member | Contributions |
| --- | --- |
| Merner Magtoto | Backend API, Mongoose models, seed data, processing endpoints, health/db checks |
| Jhenile Feliciano | React UI, forms, routing, Tailwind design, client API integration |
