# 카테고리 구조 전면 정규화 — 설계서 (v1)

작성 배경: 현행 카테고리 구조(그룹 facet × 위치컬럼 `category_id0/1/2`)의 근본 부채를 **상용화 전**에 정리.
목표: 네이버/쿠팡식 **단일 카테고리 트리 + 상품↔카테고리 연결테이블 + 브랜드=속성**.
원칙: **설계서 먼저 → 전량 additive(무삭제) 마이그레이션 → 검증 후 컷오버**. 빅뱅 리라이트 금지.

---

## 1. 현행 구조 (요약)

- **`product_category_groups`** = 서로 독립된 '분류 축(facet)' 여러 개(예: 카테고리 축 / 브랜드 축).
- **`product_categories`** = 각 그룹 '내부'의 `parent_id` 무한 트리. 상한은 그룹의 `max_depth`(폼 기본 10).
- **상품↔카테고리** = 연결테이블 없음. `products.category_id0 / category_id1 / category_id2` **위치 컬럼(최대 3개)** 에 '그룹당 리프 1개'를 저장. `그룹 sort_idx DESC 순번 i ↔ category_id{i}` **암묵 매핑**.
- 필터: `/shop/items?category_id{i}=…` + 백엔드 `findChildIds`로 하위 포함.
- 하드코딩: 셀러 필터 `product_category_group_id=195`, `category_id0=카테고리`, `category_id1=브랜드`, 상품상세 브랜드명=`category_id1`.

### 현행의 근본 문제
1. **그룹 최대 3개**(컬럼 0/1/2). 4번째 그룹은 저장/조회 불가.
2. **한 축 안 다중 카테고리 불가**(위치당 값 1개).
3. **그룹 순서 바꾸면 축 의미가 조용히 어긋남**(sort_idx 의존).
4. **헤더/사이드바 클릭이 `category_id0` 하드코딩** → 2번째+ 그룹 카테고리 클릭 시 잘못된 축 필터 → 빈 결과.
5. **개별 카테고리 헤더노출 토글이 서버에서 거부됨**(`changeStatus` 허용컬럼에 `is_show_header_menu` 없음).
6. `is_show_header_menu` 그룹/카테고리 이중 사용(대부분 데모=카테고리, demo-4=그룹), `status` 극성 반대(0=노출/1=숨김).
7. 정규 `CREATE TABLE` 스키마 파일 부재.

---

## 2. 목표 구조

- **단일 카테고리 트리**: `product_categories(id, brand_id, parent_id, category_name, category_en_name, category_img, sort_idx, is_show_header_menu, status …)` — '그룹' 필수 레이어 제거. `makeTree`는 `parent_id=-1` **다중 루트(forest) 이미 지원**.
- **상품↔카테고리 연결테이블 신설**: `products_categories(product_id, category_id)` — 상품이 1개+ 카테고리에 소속. `category_id0/1/2` 폐기.
- **브랜드 등 부가축 = 상품 속성**(`product_property_groups` / `product_properties` / `products_and_properties`) — 기존 인프라 재사용(신규 UI 최소).
- **필터**: `/shop/items?category_id=X` **단일 파라미터** + `findChildIds` 하위 포함 유지.
- **네비**: 단일 트리 순회, 클릭 시 `category_id=X`. `category_id0/1/2` · `group_id=195` · `category_id1=브랜드` 하드코딩 전면 제거.

---

## 3. 핵심 설계 결정 (마이그레이션 에이전트 제안 반영 — 초안보다 개선)

- ★ **'위치 인덱스=축'이 아니라 '그룹 역할(role)' 기반 라우팅**. 각 `category_id{i}` 리프의 `product_category_group_id`를 조인해 그 그룹을 `role ∈ {tree, property}`로 분류 후 분기.
  → 테넌트별 `sort_idx` 순서에 의존하지 않아 **오분류(상품이 트리에서 사라지거나 브랜드가 트리를 오염) 방지**. (초안의 `category_id1=브랜드` 고정 규칙은 테넌트마다 브랜드가 sort 1번이 아니면 깨짐.)
- **트리 forest 허용**: 트리 역할 그룹이 한 테넌트에 2개 이상이면 **강제 병합하지 않고 병렬 루트로 유지**(병합은 유실·정합 위험).
- **`is_hidden` 신규 컬럼 만들지 않음**: `product_categories.status`(0=노출/1=숨김)가 이미 동일 의미 → **기존 `status`를 은닉 표준으로 문서화**(중복·정합 위험 최소화).
- **`is_show_header_menu`는 `product_categories`에 이미 존재** → 스키마 추가 불필요. 필요한 건 (a) `changeStatus` 허용목록에 컬럼 추가(코드), (b) demo-4류 그룹레벨 값 → 카테고리레벨 시드(데이터).
- **연결테이블은 리프-only 저장**(상품은 리프만 참조, `findChildIds`가 조회 시 조상 포함 처리 — 현행 모델과 일치).
- **`category_id0/1/2`·`product_category_group_id` 컬럼은 즉시 DROP 안 함** — 컷오버까지 nullable 보존(롤백 안전판) 후 지연 삭제.

---

## 4. 마이그레이션 계획 (전량 additive · 멱등 · 롤백가능)

> 전제: **공유 프로덕션 DB(타 프로젝트 실고객 공존)** → ① 전체 백업 필수 ② 컷오버 동안 상품/카테고리 쓰기 수분 동결. 데이터 소량(상용화 전).

- **Phase 0**: DB 백업 + 원본 스냅샷 `CREATE TABLE _mig_products_snapshot AS SELECT id,category_id0,category_id1,category_id2 FROM products;`
- **Phase 1 (DDL, 가드형)**:
  ```sql
  CREATE TABLE products_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    brand_id INT NOT NULL, product_id BIGINT UNSIGNED NOT NULL, category_id BIGINT UNSIGNED NOT NULL,
    sort_idx BIGINT DEFAULT 0, is_delete TINYINT DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_prodcat (product_id, category_id),   -- 멱등성 핵심
    KEY idx_pc_cat (category_id, product_id), KEY idx_pc_brand (brand_id, is_delete)
  );
  -- products_and_properties 멱등용 유니크는 사전 중복제거 후 추가
  ```
  (MySQL은 `ADD COLUMN IF NOT EXISTS` 미지원 → 신규 컬럼 필요 시 `INFORMATION_SCHEMA` 확인 후 PREPARE 가드.)
- **Phase 2 (그룹 역할 분류)**: 영속 `_mig_group_role(group_id, brand_id, role)` — 기본 전부 `property`, 테넌트별 메인 카테고리 그룹만 `tree`로 승격. **소량·known 테넌트이므로 명시 화이트리스트로 확정 권장**(자동 sort_idx 규칙은 타이 위험). → 진행 전 육안 검토 쿼리 필수.
- **Phase 3 (트리축 백필)**: `category_id0/1/2` UNPIVOT → 리프 그룹이 `tree`인 것만 `INSERT IGNORE INTO products_categories`. 슬롯 위치 무의존, 삭제/미존재 참조 자동 탈락, 중복 dedupe.
- **Phase 4 (브랜드/부가축 → 속성 이전)**: `scripts/category-to-property-backfill.js`(pii-backfill.js 컨벤션). role=`property` 그룹 → `product_property_groups` 생성(영속 매핑 `_mig_group_to_propgroup`), facet 카테고리 → `product_properties`(매핑 `_mig_cat_to_prop`), 상품 링크 → `products_and_properties` INSERT IGNORE. 매핑 조회로 재실행 멱등.
- **Phase 5 (헤더노출 정규화)**: demo-4류(그룹레벨 사용) 테넌트에 한해 그룹 `is_show_header_menu` → 카테고리로 시드. **이미 카테고리레벨 큐레이션한 테넌트엔 실행 금지**(덮어쓰기 유실 R2).
- **Phase 6 (검증)**: V1 보존성(트리 참조쌍 수 = 연결테이블 행수), V2 고아(미존재 category_id=0), V3 분류유실(연결 0행 활성상품 목록), V4 브랜드 커버리지, V5 사전 dup, V6 스냅샷 대비.
- **Phase 7 (컷오버)**: 코드 배포(§5,§6) 원자적 동반.
- **Phase 8 (롤백)**: additive라 **구코드 재배포만으로 즉시 복귀**(기존 컬럼 무손상). 산출물만 정밀 제거(DROP products_categories, `_mig_` 매핑 밖 속성행 삭제, Phase5 스냅샷 복원).

---

## 5. 백엔드 변경 목록 (파일:라인)

- `utils.js/util.js:350` `categoryDepth=3` 삭제 + 이를 도는 루프 제거. `findChildIds`/`makeTree` 유지(호출대상만 '브랜드 전체 트리'로).
- `controllers/product.controller.js` — 리스트 필터 144-170(그룹매핑·`category_id{i}` → 단일 `category_id` + `products.id IN (SELECT product_id FROM products_categories WHERE category_id IN(…))` **IN-서브쿼리**), 셀러 하드코딩 211-298(`group195`/`category_id1=브랜드` → 속성·트리), 상품상세 브랜드명 557-569/316(`category_id1` → 브랜드 속성 조회), 저장 661-665/874-878(위치컬럼 write → 연결테이블 upsert).
- `controllers/shop.controller.js` — 79-106(위치조인 제거), 135-140/236-238(그룹 조회·조립 제거), 337-350(그룹 래퍼 → `makeTree(전체 트리)` 단일).
- `controllers/product_category.controller.js` — 그룹 파라미터 제거, `brand_id` 기준. create/update에서 `product_category_group_id` 드롭.
- `controllers/product_category_group.controller.js` + route + index 등록 — **컨트롤러/라우트 삭제**(그룹 레이어 폐지).
- `controllers/seller_products.controller.js` 112-190 — product.controller와 동일 재배선.
- `controllers/util.controller.js` — `changeStatus` 허용컬럼에 **`is_show_header_menu` 추가**(58), `ALLOWED_SORT/STATUS_TABLES`에서 `product_category_groups` 제거, `copy(is_copy_product)` 170-300 위치컬럼 → 연결테이블 링크 복사.
- `utils.js/corps/arfighter.js`(외부피드) — 그룹 조회·`category_id0` write → 트리 조회·연결테이블 링크.
- `utils.js/schedules/lang-process.js:15-17` — `product_category_groups` 엔트리 제거.
- `sql/indexes_for_scale.sql:9,42` — 위치컬럼 인덱스 드롭, 연결테이블/트리 인덱스 신설.
- `controllers/column.controller.js:36` — allowedTables에서 `product_category_groups` 제거.
- `controllers/auth.controller.js`·`seller.controller.js` — `seller_brand`→property_id, `seller_category`→트리 category_id (코드 소폭 + **셀러 저장 CSV 데이터 마이그레이션 필요**).

## 6. 프론트 변경 목록 (파일:라인)

- **상품 편집** `products/[edit_category]/[id].js` — `SelectCategoryComponent` 검색 그룹종속 제거, `curCategories`(그룹 index 키) → 단일/배열, 저장·로드 `category_id{i}` → 연결테이블 payload, 렌더 `themeCategoryList.map` → 단일 컴포넌트. (브랜드→속성은 기존 `themePropertyList` 레일이 흡수.)
- **상품목록** `products/list.js` — `category_id0/1` 필터·컬럼·경로 → 단일 `category_id`.
- **매니저 카테고리관리** `categories/[id].js` — 라우트 `[id]=group_id` 전제 제거 → 전역 단일 트리. `categoryGroup.*`(max_depth/sort_type/is_use_en_name/is_show_header_menu/라벨) 의존 정리.
- **카테고리그룹 관리 화면 폐기** `category-groups/*`, `config-navigation.js`(69-73,236-237: per-group 링크 → '카테고리 관리' 1개), `manager-data.js` 경로.
- **스토어 헤더 10종** — `category_id0` 하드코딩(클릭)·`category_id{index}`(사이드)·`category_group_name`(그룹제목) 전부 단일 `category_id`/단일 트리. **demo-4가 최고 위험**(문자열 분기 `=='카테고리'/'브랜드'`, 하드코딩 ID 1002/1007/501~533, 그룹레벨 `is_show_header_menu` — 사실상 재작성 수준).
- **스토어 items 뷰** — Family A(브레드크럼: demo-1/2/3/7/8)는 `category_id0&depth` → `category_id`; Family B(다축 탭: demo-4/5/6/9)는 축별 탭 UI가 '브랜드 축' 전제 → 단일 트리 자식 탭으로 재설계.
- **셀러 관리** `users/sellers/[edit_category]/[id].js` — `index==0=카테고리/index==1=브랜드` 하드코딩 → 트리 서브트리 선택 + 브랜드 속성 선택.
- **공용 유틸** `function.js`(getAllIdsWithParents 등) 유지 — 호출부만 단일 트리 전달. `SettingsContext.js:179-180` 응답형태 조정.
- 검색(keyword 기반)은 구조 변경과 무관.

---

## 7. 리스크 & 완화

- **R1 데이터 유실(dangling ref)**: 삭제/미존재 카테고리를 가리키던 `category_id{i}`는 조인에서 드롭 → 스냅샷+V2/V6로 사전 목록화 후 의사결정.
- **R2 큐레이션 덮어쓰기**: Phase5 그룹→카테고리 시드 시 이미 큐레이션한 테넌트 제외(화이트리스트).
- **R3 역할 오분류**: 트리↔property 잘못 분류 → Phase2 육안검토 + 화이트리스트.
- **R4 유니크키 추가 실패**: 기존 중복행 있으면 → V5로 사전 dedupe.
- **R5 공유 DB**: 백업 + 쓰기동결 창 필수.
- **R6 브랜드 계층 flatten**: 브랜드는 통상 평면이라 허용, 문서화.
- **R7 전환기 정합**: 백엔드 마이그레이션 없이 프론트만 바꾸면 '미분류'/데이터 소실 → **원자적 동반 배포**.
- **demo-4/셀러 커플링**: 재매핑 없이는 헤더/상세/브랜드 패널 통째 사라짐 → 별도 집중 작업.

---

## 8. 결정 사항 (2026-08-03 사장님 확정) ✅

1. **브랜드 모델링** → **(A) 상품 속성으로 이전** 확정. 브랜드=`product_property_groups`/`product_properties`/`products_and_properties`로 이전, 카테고리 트리는 순수 분류만. 향후 수요 시 전용 `brands_catalog`로 승격 가능(비파괴). ※ `products.brand_id`는 '몰(DNS)'이라 제조사 브랜드로 재사용 불가.
2. **상품↔카테고리 카디널리티** → **1상품 N카테고리 허용** 확정. `products_categories`에 다중 행, 상품등록 UI는 카테고리 다중선택.
3. **트리 forest** → **병렬 루트 유지**(합성 루트 병합 안 함). *안전 기본값.*
4. **`is_hidden` 신규 컬럼** → **만들지 않고 기존 `status`(0=노출/1=숨김) 표준화**. *안전 기본값.*
5. **레거시 URL**(`category_id0&depth`) → **하위호환 리다이렉트 적용**(구 링크·북마크·검색 유입 보호). *안전 기본값.*

---

## 9. 권장 실행 순서

1. **결정(§8) 확정** → 이 설계서 확정.
2. **백엔드**: 스키마+백필 스크립트 작성 → 스테이징(또는 백업 후)에서 Phase 0~6 리허설 + 검증쿼리.
3. **코드(백+프론트) 동시 준비**: §5/§6 변경을 브랜치에서 완성(원자적 배포 대상).
4. **컷오버**: 백업 → 쓰기동결 → 마이그레이션 실행 → 코드 배포 → 검증 → 해제. 문제 시 §8 롤백.
5. **정리**: 검증 안정 후 `category_id0/1/2`·`product_category_group_id`·그룹 테이블 지연 삭제.

> 규모 감: 백엔드 ~11파일 + 마이그레이션 SQL + Node 백필 스크립트, 프론트 ~20파일(전 데모). 바운디드하나 **demo-4 헤더/items와 셀러 관리가 집중 작업 구간**.
