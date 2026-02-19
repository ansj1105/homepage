# SH Homepage Renewal Tech Spec

## 1. Stack
- Frontend: React 18 + TypeScript + Vite
- Routing: React Router DOM v6
- Backend: Node.js + Express + TypeScript
- Validation: Zod
- Testing: Vitest
- Database: PostgreSQL 16
- Migration: Flyway SQL migrations
- Container runtime: Docker Compose

## 2. Runtime Architecture
- SPA routes served by Nginx with fallback to `index.html`
- Public site routes and admin route in one frontend app
- Admin route: `/admin`
- Backend API: `/api/*`
- Vite dev proxy forwards `/api` -> `http://localhost:8787`

## 3. Route Map
- `/company/ceo`
- `/company/vision`
- `/company/location`
- `/partner/core`
- `/product`
- `/product/:categorySlug`
- `/product/:categorySlug/:itemSlug`
- `/inquiry/quote`
- `/inquiry/test-demo`
- `/inquiry/library`
- `/notice`
- `/admin`

## 4. Data Flow
1. Public layout loads `content/resources/notices` from API.
2. Product pages read static taxonomy and cross-reference registered products.
3. Quote form posts inquiry payload to `POST /api/inquiries`.
4. Admin logs in and receives bearer token.
5. Admin updates content/resources/notices/inquiry status.
6. Backend persists data into PostgreSQL.
7. Flyway applies schema migrations before app start.

## 5. Backend Modules
- `server/src/app.ts`: routes + middleware
- `server/src/auth.ts`: token create/verify
- `server/src/validators.ts`: request validation
- `server/src/db.ts`: query layer + seed logic
- `server/src/index.ts`: bootstrap

## 6. Frontend Modules
- `src/App.tsx`: router tree
- `src/pages/PublicSite.tsx`: public layout + all page components
- `src/pages/AdminPage.tsx`: admin UI and operations
- `src/data/productTaxonomy.ts`: product category/subcategory tree
- `src/i18n/*`: locale context and message catalogs
- `src/api/client.ts`: API client

## 7. Security and Config
- Bearer token auth on admin APIs
- Credentials and secrets from `.env`
- CORS origin from `CORS_ORIGIN`
- DB connection from `DATABASE_URL` or `POSTGRES_*`

## 8. Deployment
- Base compose: app + backend + db + flyway
- Production compose override enables:
- Nginx TLS termination (`443`)
- HTTP to HTTPS redirect (`80 -> 443`)
- Certificate mount from `docker/certs/fullchain.pem` and `docker/certs/privkey.pem`
- Deployment scripts:
- `scripts/deploy-prod.sh` (Ubuntu/Linux)
- `scripts/deploy-prod.ps1` (Windows)

## 9. Verification Commands
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run deploy:prod:linux` (server)
