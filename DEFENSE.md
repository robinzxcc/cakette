# Defense day script — max-points checklist

Keep the app **already running and seeded** before you enter the room.

```bat
start-defense.bat
```

Or:

```bash
cd server && npm run dev
cd client && npm run dev
```

- App: http://localhost:5173  
- API: http://localhost:8000/api/health → must show `"gradingReady": true`  
- Repo: https://github.com/robinzxcc/cakette  

## Logins (say them clearly)

| Email | Password | Role |
| --- | --- | --- |
| `magtotomb@students.nu-clark.edu.ph` | `merner123!` | admin |
| `mernermagtoto55@gmail.com` | `merner123!` | customer |
| `aya@cakette.test` | `password123` | customer |
| `admin@cakette.test` | `admin123` | admin |

Promo: `WELCOME10`

---

## Say this out loud (Technical Explanation — 5 pts)

> React axios calls our Express REST API. Routes use Mongoose models. Data lives permanently in **MongoDB Atlas**. Responses return JSON and the UI shows loading, error, empty, and success states.

Point at folders while speaking:

- `client/src/api.ts` → axios instance  
- `server/routes/` → Express routers  
- `server/models/` → Mongoose schemas  
- Atlas cluster `cakette` / database `cakette`

---

## Live demo path (smooth + rubric moments)

Do these in order. Do **not** skip the bold items.

1. **Landing** — brand, CTAs, popular cakes from Mongo  
2. **Cakes** — search/filter → say `GET /cakes/search` (processing)  
3. **Customize** — change size/flavor → live total → say `POST /orders/quote`  
4. Apply **`WELCOME10`** → say `POST /promotions/validate`  
5. **Pickup** — capacity bars → say `GET /pickup-slots`  
6. **Login** (customer) → place order → confirmation (`201`)  
7. **My Orders / Details** — status timeline  
8. **Cancel with confirmation modal** → success feedback  
9. **Login as admin** → Studio dashboard → say `GET /dashboard/overview` + order/cake stats  
10. **Manage cakes** — create/edit + **delete with confirmation**  
11. **Reviews** — rankings → say `GET /reviews/stats/by-cake`  
12. Admin order → **Advance status** → say `PATCH /orders/:id/status`

### Required rubric demos (do these on camera)

**Validation / 400**

- Login with blank email → Zod per-field errors, submit disabled  
- Or Manage cakes → empty name / short description → client + server 400  

**Not found / 404**

- UI: http://localhost:5173/this-page-does-not-exist  
- API: http://localhost:8000/api/cakes/this-cake-does-not-exist  
- Or run `open-error-tabs.bat`

**Atlas proof**

- Open http://localhost:8000/api/health  
- Read aloud: `"gradingReady": true` and mode is **not** `memory`

### Status codes to name

- `201` create order / create cake  
- `400` validation (Zod UI + Mongoose)  
- `404` missing cake / route  
- `409` overbooked pickup  

### Processing endpoints to name (pick 5+)

1. `POST /orders/quote`  
2. `GET /pickup-slots`  
3. `PATCH /orders/:id/status`  
4. `GET /orders/stats/summary`  
5. `GET /cakes/stats/summary`  
6. `POST /promotions/validate`  
7. `GET /reviews/stats/by-cake`  
8. `GET /dashboard/overview`  
9. `GET /cakes/search`  

---

## Individual Q&A (each member)

Be ready for any of these:

- Where do routes vs models live?  
- Middleware order: request logger → routes → JSON 404 → error handler  
- Why totals are computed (quote/pricing), not fake UI state only  
- Which files you personally committed (show GitHub history)  
- How Atlas connects: `server/.env` → `MONGO_URI` → `connectMongo` on boot  

Never say “the AI wrote it.” Explain the code you show.
