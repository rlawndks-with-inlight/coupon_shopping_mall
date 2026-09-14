import { isShopgoBrand } from 'src/utils/is-shopgo';

// 상품후기 규칙 — 프론트 쪽 사본.
//
// 백엔드(utils.js/review-policy.js)와 **같은 규칙**이어야 한다. 화면은 '보여 줄지·버튼을 둘지'를
// 이걸로 정하고, 서버는 같은 규칙으로 요청을 다시 판정한다. 두 벌이 어긋나면
// '버튼은 있는데 누르면 거절되는' 일이 나므로 검사(scripts/checks/review-policy.mjs)가 대조한다.
//
// 설계 문서: ShopGo 후기·별점 설계(2026-09-07, 결정 반영 09-14).

// shopgo 산하 몰의 is_use_review 가 비어 있을 때의 기본값. 백엔드 REVIEW_DEFAULT_ON_SHOPGO 와 같아야 한다.
// 배포 첫날은 꺼짐(false)으로 올려 forsmall·mbc01 에서 확인한 뒤 true 로 바꾼다.
export const REVIEW_DEFAULT_ON_SHOPGO = false;

// 비어 있으면(미설정) 기본값 d. ⚠ Number('') 은 0 이라 그냥 Number 로 읽으면 '미설정' 이 0 이 된다.
const 수 = (v, d) => {
  if (v === undefined || v === null || String(v).trim() === '') return d;
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : d;
};
const 설정 = (dns) => {
  let s = dns?.setting_obj ?? {};
  if (typeof s === 'string') { try { s = JSON.parse(s); } catch (e) { s = {}; } }
  return s ?? {};
};

// 이 몰이 후기를 쓰는가. 예전엔 isShopgoBrand 로 산하 몰을 통째로 막았다(2026-08-07) —
// 이제는 가맹점이 「후기설정」 탭에서 켜고 끈다. 다른 배포 브랜드는 늘 켜져 있던 그대로.
export const isReviewEnabled = (dns) => {
  const raw = 설정(dns).is_use_review;
  if (raw === undefined || raw === null || raw === '') return isShopgoBrand(dns) ? REVIEW_DEFAULT_ON_SHOPGO : true;
  return Number(raw) === 1;
};

// 화면이 미리 알아야 하는 값(글자 수 안내·사진 허용·안내문). 서버가 최종 판정한다.
export const reviewSettings = (dns) => {
  const s = 설정(dns);
  return {
    enabled: isReviewEnabled(dns),
    allow_photo: (s.review_allow_photo === undefined || s.review_allow_photo === null || s.review_allow_photo === '') ? true : Number(s.review_allow_photo) === 1,
    // 「도움돼요」 버튼(+도움순 정렬). 백엔드 review-policy.js 와 같은 기본값(켜짐).
    use_helpful: (s.review_use_helpful === undefined || s.review_use_helpful === null || s.review_use_helpful === '') ? true : Number(s.review_use_helpful) === 1,
    min_length: Math.min(200, Math.max(1, Math.floor(수(s.review_min_length, 10)))),
    max_length: 1000,
    max_images: 5,
    window_days: Math.min(365, Math.max(7, Math.floor(수(s.review_window_days, 90)))),
    edit_days: Math.min(90, Math.max(0, Math.floor(수(s.review_edit_days, 7)))),
    best_max: Math.min(10, Math.max(0, Math.floor(수(s.review_best_max, 3)))),
    notice: String(s.review_notice ?? '').slice(0, 300),
  };
};

// 남은 날짜(마감 표시용). 마감이 없거나 지났으면 null.
export const daysLeft = (deadline) => {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms < 0) return null;
  return Math.ceil(ms / 86400000);
};

// 후기 한 건의 첫 사진. 새 열(images JSON)이 우선, 예전 한 장짜리(content_img·profile_img)도 살린다.
export const reviewImageOf = (item) => {
  let list = item?.images;
  if (typeof list === 'string') { try { list = JSON.parse(list); } catch (e) { list = []; } }
  if (Array.isArray(list) && list.length) return list[0];
  return item?.content_img || item?.profile_img || '';
};

// 상품 상세 주소. 쇼핑몰형(shop_demo_num>0)은 /shop/item, 블로그형은 /blog/product.
export const productPath = (dns, productId) =>
  Number(dns?.shop_demo_num) > 0 ? `/shop/item/${productId}` : `/blog/product/${productId}`;

// 날짜만(YYYY-MM-DD). 후기 목록은 시각까지 보여 줄 이유가 없다.
export const dateOnly = (v) => {
  if (!v) return '';
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

// 프레임(계열)별 후기 옷. 안의 내용은 같고 놓이는 자리·톤만 다르다(설계 §7.5).
//   full    프레임1·2  — 탭/섹션, 큰 평균 + 분포 막대 + 사진 모아보기
//   compact 프레임3·4  — 접이식 한 줄, 좁은 폭용 목록(분포 막대 없음)
//   panel   프레임5    — 「REVIEWS N — 4.7」 한 줄, 옆에서 열리는 패널, 별 없이 숫자
//   pastel  프레임6    — 둥근 카드, 사진 캐러셀, 핑크 별
export const REVIEW_VARIANTS = ['full', 'compact', 'panel', 'pastel'];
