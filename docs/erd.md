# DB ERD (2026-02-20)

## Tables

### `site_content`
- `id` (PK, SMALLINT, singleton `1`)
- `payload` (JSONB)
- `updated_at` (TIMESTAMPTZ)

### `public_site_settings`
- `id` (PK, SMALLINT, singleton `1`)
- `payload` (JSONB)
  - `routeMeta[]`: 페이지 메타(title/favicon/og 이미지/sub 배너 이미지)
  - `headerTopMenu[]`: 헤더 1depth/2depth 메뉴
  - `headerProductMega[]`: 제품 메가메뉴/하위메뉴
- `updated_at` (TIMESTAMPTZ)

### `main_page_settings`
- `id` (PK, SMALLINT, singleton `1`)
- `hero_copy_top`, `hero_copy_mid`, `hero_copy_bottom`
- `hero_cta_label`, `hero_cta_href`
- `about_title`, `about_body_1`, `about_body_2`, `about_image_url`
- `solution_title`, `solution_body_1`, `solution_body_2`
- `solution_step_image_1`, `solution_step_image_2`, `solution_step_image_3`
- `footer_address`, `footer_copyright`
- `updated_at` (TIMESTAMPTZ)

### `main_page_slides`
- `id` (PK, UUID)
- `image_url` (TEXT)
- `sort_order` (UNIQUE, INTEGER)
- `created_at` (TIMESTAMPTZ)

### `main_page_application_cards`
- `id` (PK, UUID)
- `label` (TEXT)
- `image_url` (TEXT)
- `link_url` (TEXT)
- `sort_order` (UNIQUE, INTEGER)
- `created_at` (TIMESTAMPTZ)

### `cms_pages`
- `slug` (PK, TEXT)
- `title` (TEXT)
- `image_url` (TEXT)
- `markdown` (TEXT)
- `updated_at` (TIMESTAMPTZ)

### `resources`
- `id` (PK, UUID)
- `title` (TEXT)
- `type` (TEXT, CHECK)
- `file_url` (TEXT)
- `markdown` (TEXT)
- `updated_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

### `notices`
- `id` (PK, UUID)
- `title` (TEXT)
- `published_at` (DATE)
- `markdown` (TEXT)
- `updated_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

### `inquiries`
- `id` (PK, UUID)
- `inquiry_type` (TEXT, CHECK: `quote|test-demo`)
- `company`, `position`, `name`, `email`, `contact_number`
- `requirements` (TEXT)
- `consent` (BOOLEAN)
- `status` (TEXT, CHECK: `in-review|done`)
- `is_read` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

## Relationship Notes
- 본 스키마는 운영 편의를 위해 대부분 독립 엔터티로 구성됩니다.
- 메인페이지는 `main_page_settings`(1행) + `main_page_slides`(1:N) + `main_page_application_cards`(1:N) 조합으로 렌더링됩니다.
- 공통 메타/헤더는 `public_site_settings`(1행 JSON)에서 로드됩니다.
- 대표소개/비전소개/CORE PARTNER 본문은 `cms_pages`로 관리됩니다.
- 공지/자료/문의는 별도 게시성 엔터티로 관리됩니다.
