# Media Path / Permission Policy

## 1) Supported image path types
- `public/` 정적 파일: `/assets/...`, `/favicon.ico`
- 외부 CDN URL: `https://...`

## 2) 권장 저장 위치
- 메인/서브 배너: `public/assets/legacy/images/`
- 아이콘/파비콘: `public/`

## 3) 권한 및 운영 원칙
- 관리자 페이지는 자료실 파일 업로드를 지원합니다.
  - 업로드 API: `POST /api/admin/uploads/resource` (관리자 토큰 필요)
  - 저장 경로: `uploads/resource/*` (컨테이너 내부 `/app/uploads/resource/*`)
  - DB 반영: 업로드 완료 시 `resources.file_url`에 `/api/files/resource/{filename}` 저장
- 공개 문의(견적요청/TEST&DEMO) 첨부파일 업로드를 지원합니다.
  - 업로드 API: `POST /api/uploads/inquiry` (비로그인 허용)
  - 저장 경로: `uploads/inquiry/*`
  - DB 반영: `inquiries.attachment_*` 컬럼에 메타데이터 저장
- CMS 이미지(대표/비전/파트너)는 `cms_pages.image_url` 또는 마크다운 이미지 경로를 사용합니다.

## 4) Fallback 정책
- `routeMeta.subBannerImageUrl`가 비어 있으면 기존 CSS 기본 배너 이미지를 사용합니다.
- 값이 있으면 해당 이미지가 우선 적용됩니다.

## 5) 체크리스트
- 경로가 `/`로 시작하는지 확인 (`/assets/...`)
- 외부 URL이면 HTTPS 사용
- 배포 후 캐시 무효화 필요 시 파일명 해시 또는 쿼리스트링 사용
- 업로드 크기 제한 확인
  - 앱(백엔드): `MAX_INQUIRY_FILE_BYTES` 기본 10MB, `MAX_RESOURCE_FILE_BYTES` 기본 30MB
  - Nginx: `client_max_body_size 32m`
  - Compose: `./uploads:/app/uploads` 볼륨 마운트로 파일 영속성 유지

## 6) 문의 운영 정책
- 문의는 `inquiry_type`으로 `quote`/`test-demo`를 구분합니다.
- 관리자 페이지 알림은 `is_read=false` 건수로 계산합니다.
- 상태는 `in-review`(처리중), `done`(처리완료) 2단계로 운영합니다.
