// SHOPGO 본사 브랜드 판별.
// SHOPGO 무료쇼핑몰 전용으로 추가된 기능(이용가이드·온보딩 체크리스트·매출 조회 등)은
// 다른 클라이언트(별도 포크) 가맹점에는 노출되면 안 되므로, 여기 판별로 노출을 제한한다.
export const SHOPGO_MASTER_ID = 98; // shopgo 본사 브랜드 id

// shopgo 본사(98) 또는 그 산하 가맹점(parent_id=98)
export const isShopgoBrand = (dns) =>
  Number(dns?.id) === SHOPGO_MASTER_ID || Number(dns?.parent_id) === SHOPGO_MASTER_ID;

// shopgo 산하 '가맹점'만 (본사 제외) — 가맹점 전용 기능(온보딩·매출 조회 등)에 사용
export const isShopgoMerchant = (dns) => Number(dns?.parent_id) === SHOPGO_MASTER_ID;
