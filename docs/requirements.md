# SH Homepage Renewal Requirements

## 1. Scope
- Source: `SH 홈페이지 기안서 V2.pptx`
- Goal: public homepage + backend API + admin page
- Delivery mode: production-ready MVP

## 2. Public Homepage Information Architecture
## 2.1 Top Menu Tree
- 회사소개
- CEO 인사말: `/company/ceo`
- 회사비전: `/company/vision`
- 찾아오시는 길: `/company/location`
- 파트너
- CORE PARTNER: `/partner/core`
- 제품
- PRODUCT 카테고리: `/product`
- 카테고리별 하위 페이지: `/product/{category}`
- 하위 품목 페이지: `/product/{category}/{item}`
- 제품문의
- 견적요청: `/inquiry/quote`
- TEST 및 DEMO: `/inquiry/test-demo`
- 자료실(메뉴얼): `/inquiry/library`
- 공지사항
- 공지사항 목록: `/notice`

## 2.2 Product Taxonomy (from planning)
- Laser
- Nanosecond
- Picosecond/Femtosecond
- CO2
- Excimer
- Diode laser
- Optics
- 모노클
- ULO Optics
- 그린광학
- 옌옵틱
- Laser scanner
- Scanlab
- Custom solution
- Meopta
- FEMTOPRINT
- Laser measurement
- Laser point
- Metrolux
- SHINHOTEK
- Others
- Others
- Beam shaper
- Adloptica
- Power photonic
- Silios

## 2.3 Functional Requirements
- Responsive UI for desktop/tablet/mobile
- Favicon configured and served in build output
- i18n support (ko/en language switch)
- Quote inquiry form submission and success/failure feedback
- Resource list and notice board read from API
- Product pages expose category -> subcategory -> detail navigation

## 3. Backend API Requirements
## 3.1 Public APIs
- `GET /api/content`
- `GET /api/resources`
- `GET /api/notices`
- `POST /api/inquiries`

## 3.2 Admin APIs (auth required)
- `POST /api/auth/login`
- `PUT /api/admin/content`
- `POST|PUT|DELETE /api/admin/resources`
- `POST|PUT|DELETE /api/admin/notices`
- `GET /api/admin/inquiries`
- `PUT /api/admin/inquiries/{id}/status`

## 3.3 Validation and Error Shape
- Input validation on every write endpoint
- Invalid payload returns `400 { message, issues? }`
- Unauthorized returns `401 { message }`

## 4. Admin Page Requirements
- Login with admin id/password
- Content JSON editor and save action
- Resource create/delete
- Notice create/delete
- Inquiry status workflow
- `received`
- `in-review`
- `done`

## 5. Non-Functional Requirements
- Environment variables managed by `.env`
- Required keys documented in `.env.example` for `sdsaasddf1.com`
- PostgreSQL schema versioning with Flyway
- Docker Compose for reproducible deployment
- Production Nginx HTTPS deployment with `80 -> 443` redirect
- TLS certificate files mounted from `docker/certs`

## 6. Out of Current MVP
- File upload/storage integration (S3 etc.)
- Email/CRM webhook integration
- Multi-role RBAC and audit trail
