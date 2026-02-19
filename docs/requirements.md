# SH Homepage Renewal Requirements

## 1. Scope
- Source: `SH homepage proposal V2.pptx`
- Goal: deliver public homepage + backend + admin page
- Delivery mode: MVP for operational use

## 2. Public Homepage Requirements
## 2.1 Main
- Hero slider (3 slides)
- CTA order: Partner -> Product -> Inquiry
- Quick links: KakaoTalk, WeChat, LinkedIn
- Product integrated search entry point

## 2.2 Company
- CEO message and vision in one page block
- Partner brand grid with external links
- Location map embed + address/contact

## 2.3 Application
- 6 categories
- Semiconductor
- Solar Cell
- Medical & Bio
- Automotive (Second battery, LiDAR)
- OLED Display
- AOI (new)
- Each category includes summary, process, recommended product mapping

## 2.4 Product
- Integrated search and filter (keyword/category/manufacturer/spec)
- Product card and detail panel
- Datasheet/CAD download links
- Direct quote CTA

## 2.5 SH Solution
- 3 areas: Optical Design, Mechanical Design, SW Design
- Process steps: consulting -> design -> simulation -> build -> verification
- Capability/portfolio guidance sections

## 2.6 Inquiry / Resource / Notice
- Quote form fields
- Company, position, name, email, contact, requirements
- Privacy consent required
- Resource list and notice board

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
- Responsive for desktop/tablet/mobile
- Basic accessibility: semantic tags, labels, keyboard reachability
- Data contract managed by OpenAPI (`docs/openapi.yaml`)
- Test coverage for validator and core logic
- Environment configuration through `.env`
- Required environment keys documented in `.env.example`
- PostgreSQL schema versioning with Flyway migrations
- Docker Compose support for reproducible local/server startup
- Production web tier with Nginx 80 -> 443 redirect and TLS termination

## 6. Out of Current MVP
- File storage integration (S3, etc.)
- Email/CRM webhook integration
- Multi-role RBAC and audit trail
