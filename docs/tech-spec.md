# SH Homepage Renewal Tech Spec

## 1. Stack
- Frontend: React 18 + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Validation: Zod
- Testing: Vitest
- Database: PostgreSQL 16
- Migration: Flyway SQL migrations
- Container runtime: Docker Compose

## 2. Architecture
- Single frontend app with route split
- Public site: `/`
- Admin page: `/admin`
- Backend API server: `http://localhost:8787`
- Vite dev proxy: `/api` -> backend server
- Docker runtime ports
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:8787`
- PostgreSQL: `localhost:5432`
- Production override
- `docker-compose.prod.yml` enables Nginx TLS termination and 80 -> 443 redirect
- Certificates mounted from `docker/certs`

## 3. Data Flow
1. Public page loads `content/resources/notices` via API.
2. Public inquiry form posts to `POST /api/inquiries`.
3. Admin logs in and receives bearer token.
4. Admin updates content/resources/notices/inquiry status via admin APIs.
5. Backend reads/writes PostgreSQL tables.
6. Schema changes are applied through Flyway migrations.

## 4. API Contract
- OpenAPI source of truth: `docs/openapi.yaml`
- Main schema groups
- `SiteContent`
- `ResourceItem`
- `NoticeItem`
- `InquiryItem`
- Backward compatibility strategy
- Keep response shapes stable
- Additive fields preferred
- Breaking changes require OpenAPI version bump

## 5. Backend Modules
- `server/src/app.ts`: route registration and middleware
- `server/src/auth.ts`: token sign/verify
- `server/src/validators.ts`: request and DB schema validation
- `server/src/db.ts`: PostgreSQL query layer and seed logic
- `server/src/index.ts`: server bootstrap

## 6. Frontend Modules
- `src/pages/PublicSite.tsx`: homepage UI + inquiry submit
- `src/pages/AdminPage.tsx`: login + content/resource/notice/inquiry admin tools
- `src/api/client.ts`: API client functions
- `src/data/siteData.ts`: initial fallback/default content

## 7. Security (MVP)
- Bearer token required on admin endpoints
- Credentials from env vars
- `ADMIN_USERNAME` (default: `admin`)
- `ADMIN_PASSWORD` (default: `change-me`)
- `ADMIN_TOKEN_SECRET` for token signing
- CORS policy configurable with `CORS_ORIGIN`
- DB connection via `DATABASE_URL` or `POSTGRES_*` vars

## 8. Test Strategy
- Unit tests
- Product filter utility
- Auth token create/verify
- Validator parsing and failure cases
- OpenAPI contract path existence smoke check

## 9. Runtime Commands
- Frontend dev: `npm run dev`
- Backend dev: `npm run dev:server`
- Tests: `npm run test`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Compose up: `npm run docker:up`
- Compose down: `npm run docker:down`
