# Media Path / Permission Policy

## 1) Supported image path types
- `public/` 정적 파일: `/assets/...`, `/favicon.ico`
- 외부 CDN URL: `https://...`

## 2) 권장 저장 위치
- 메인/서브 배너: `public/assets/legacy/images/`
- 아이콘/파비콘: `public/`

## 3) 권한 및 운영 원칙
- 관리자 페이지는 현재 **파일 업로드 기능 없이 URL/경로만 저장**합니다.
- 따라서 파일 업로드/삭제 권한은 서버가 아니라 배포 파이프라인(또는 리포지토리 커밋 권한)에서 관리합니다.
- 관리자 권한은 설정값(DB) 변경 권한만 가집니다.
- 자료실 파일은 `resources.file_url`에 등록된 경로/URL을 사용합니다.
- CMS 이미지(대표/비전/파트너)는 `cms_pages.image_url`에 등록된 경로/URL을 사용합니다.

## 4) Fallback 정책
- `routeMeta.subBannerImageUrl`가 비어 있으면 기존 CSS 기본 배너 이미지를 사용합니다.
- 값이 있으면 해당 이미지가 우선 적용됩니다.

## 5) 체크리스트
- 경로가 `/`로 시작하는지 확인 (`/assets/...`)
- 외부 URL이면 HTTPS 사용
- 배포 후 캐시 무효화 필요 시 파일명 해시 또는 쿼리스트링 사용

## 6) 문의 운영 정책
- 문의는 `inquiry_type`으로 `quote`/`test-demo`를 구분합니다.
- 관리자 페이지 알림은 `is_read=false` 건수로 계산합니다.
- 상태는 `in-review`(처리중), `done`(처리완료) 2단계로 운영합니다.
