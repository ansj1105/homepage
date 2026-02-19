# Reference Design Analysis (2026-02-19)

## 1. Source Set
- SH baseline: http://www.shinhotek.com/main
- User-provided references:
  - https://uniotech.kr/
  - https://www.coreray.kr/
  - https://www.mjlinc.com/
  - http://www.smtech.co.kr/
  - http://www.lasernet.co.kr/shop/index.php
  - https://jinsunginst.com/
  - https://bmlaser.co.kr/
  - http://qbiclaser.com/
  - http://www.wizoptics.com/
  - https://www.domun.co.kr/
  - https://enclony.com/
  - https://www.altechna.com/
  - https://www.trumpf.com/
  - https://www.coherent.com/
  - https://3sae.com/
  - https://www.alliedvision.com/

## 2. Common UX Patterns Found
- 신뢰형 헤더
  - 상단 고정 내비게이션, 회사/제품/문의 중심 IA, 드롭다운으로 하위 페이지 접근.
- 강한 첫 화면 메시지
  - 한 줄 가치제안 + 즉시 CTA(제품 보기, 문의하기) 배치.
- 카탈로그 탐색 최적화
  - 카테고리 카드 -> 하위 품목 -> 상세 흐름이 명확.
- 파트너/브랜드 신뢰 노출
  - 제조사 또는 협력사 로고/브랜드 벽 형태로 신뢰를 빠르게 전달.
- 빠른 문의 동선
  - 고정형 퀵 버튼(전화/문의) 또는 눈에 띄는 CTA 버튼 반복 노출.
- B2B 톤앤매너
  - 과한 감성보다는 정보 밀도, 기술 신뢰, 행동 유도 중심 구성.

## 3. Applied to This Project
## 3.1 Design
- 공통 Hero Band 추가
  - 가치제안 문구 + 2개 CTA(제품 카테고리, 견적요청).
- Trust Strip 추가
  - 파트너 수, 제품 카테고리 수, 기술상담 연락처 노출.
- Floating Quick Actions 추가
  - 빠른 견적, 전화 문의, 외부 채널 링크를 고정 버튼으로 제공.

## 3.2 IA / Composition
- 대형 단일 페이지 구조를 라우팅 기반 멀티페이지로 유지/정리.
- `PublicLayout`와 페이지 컴포넌트를 분리해 유지보수성 향상.
- 공통 컨텍스트(`PublicOutletContext`)와 도우미 함수(`helpers`) 분리.

## 3.3 Data
- 파트너 목록을 사용자 제공 레퍼런스 기준으로 확장.
- 벤치마크 링크 목록은 공개 UI에서 미노출 유지(데이터는 호환성 위해 유지).

## 4. Accessibility / Responsive Considerations
- 모바일 메뉴 토글 유지 및 드롭다운 모바일 폴백 제공.
- CTA 버튼/링크의 명확한 라벨과 키보드 접근 가능한 구조 유지.
- 860px 이하에서 레이아웃 단일 컬럼으로 전환.

## 5. Next Refactor Candidates
- 파트너 섹션에 실제 로고 이미지 에셋 도입.
- 제품 상세 페이지에 제조사/스펙 필터 패널 고도화.
- 관리자에서 파트너 목록 및 순서를 직접 관리하는 CMS 항목 추가.
