# Backend and Admin Analysis

## 1. Why Backend and Admin Are Required
- Marketing and sales content changes are frequent.
- Static-only pages force code edits and redeploys for simple updates.
- Inquiry handling requires status tracking and operational workflow.

## 2. MVP Scope
- Public APIs for content/resources/notices read and inquiry submit
- Admin APIs for content/resources/notices/inquiries management
- Admin page for login and day-to-day operations
- PostgreSQL as persistent store
- Flyway as schema migration system
- Docker Compose for service orchestration

## 3. Admin Operations
1. Update homepage content and CTA text.
2. Add/remove resources and notices.
3. Review incoming inquiries.
4. Move inquiry statuses: `received -> in-review -> done`.

## 4. Data Design
- `site_content`: one JSON payload row for homepage content
- `resources`: downloadable items
- `notices`: public notices with publish date
- `inquiries`: quote/contact submissions and workflow status

## 5. Non-Functional Requirements
- OpenAPI contract as source of truth
- Request payload validation on server
- Auth required for all admin endpoints
- DB constraints to protect invalid status/type values
- Migration consistency via Flyway versioned SQL
- Containerized deployment with stable startup ordering

## 6. Future Extensions
- Role-based access control
- File upload storage integration
- Notification hooks (email/slack)
- Audit log for admin actions
