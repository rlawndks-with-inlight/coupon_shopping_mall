// 검색엔진용 <head> 값 — _app 이 서버에서 그린다.
//
// 왜: 화면 본문은 아직 브라우저에서만 그려진다(ThemeProvider 가 브랜드 정보를 받은 뒤에야 children 을 그림).
//     그래서 검색엔진(특히 네이버)이 처음 받는 HTML 에는 <head> 밖에 없다. 여기 값이 검색 결과의 제목·설명·가격이 된다.
//     (2026-11-17 점검: 설명이 빈 몰, og:url 이 모든 페이지에서 첫 화면 주소, 상품 정보 구조화 데이터 없음)
//
// 이 파일은 순수 함수만 둔다 — scripts/checks/seo-head.mjs 가 그대로 불러 시험한다.

const 공백정리 = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const 천단위 = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// 경로만 꺼내 끝에 / 를 붙인다(next.config trailingSlash:true 와 같은 모양).
export const 경로만 = (asPath) => {
  let 경로 = String(asPath || '/').split('#')[0].split('?')[0] || '/';
  if (!경로.startsWith('/')) 경로 = `/${경로}`;
  if (!/\.[a-z0-9]+$/i.test(경로) && !경로.endsWith('/')) 경로 += '/';
  return 경로;
};

// 이 페이지의 대표 주소(canonical·og:url).
// 쿼리는 버린다 — 정렬·검색어·필터가 붙은 주소가 같은 페이지로 여러 번 색인되지 않게.
// 단 상품 목록의 category_id 는 분류마다 다른 페이지라 남긴다.
// 가맹점 몰은 루트(/)와 /shop/ 이 같은 첫 화면이다(next.config 의 rewrite) — 대표는 루트로 한다.
export const 페이지주소 = (host, asPath, 메인사이트 = false) => {
  const h = String(host ?? '').trim().replace(/^https?:\/\//, '').replace(/\/+$/, '').split(':')[0];
  if (!h) return '';
  let 경로 = 경로만(asPath);
  if (!메인사이트 && 경로 === '/shop/') 경로 = '/';
  let 쿼리 = '';
  if (경로 === '/shop/items/') {
    const q = String(asPath || '').split('#')[0].split('?')[1] || '';
    const c = new URLSearchParams(q).get('category_id');
    if (c && /^\d+$/.test(c)) 쿼리 = `?category_id=${c}`;
  }
  return `https://${h}${경로}${쿼리}`;
};

// 검색 결과에 안 나와도 되는 화면(로그인·장바구니·마이페이지·결제·검색 결과).
// 본문을 서버에서 그리는 페이지(검색 노출 2단계, 2026-11-17) — 샵고 소개 페이지만. 값은 페이지 파일 경로(router.pathname).
//   몰 화면은 상품·카테고리·결제수단을 브라우저에서 받은 몰 정보로 그리므로 아직 넣지 않는다.
export const 서버본문경로 = ['/', '/manual', '/frames', '/faq', '/apply'];
export const 서버본문 = (메인사이트, pathname) => !!메인사이트 && 서버본문경로.includes(pathname);

// 브라우저에서 i18n 을 처음 만들 때(모듈 로드 시점) 이 페이지가 서버 본문 페이지인지. __NEXT_DATA__ 로 판단한다.
//   _app 의 메인사이트 판정(NEXT_PUBLIC_IS_SHOPGO + head_data.is_main_dns)과 같은 기준이다.
export const 서버본문으로시작 = () => {
  try {
    if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_IS_SHOPGO !== 'true') return false;
    const d = window.__NEXT_DATA__ || JSON.parse(document.getElementById('__NEXT_DATA__')?.textContent || '{}');
    return 서버본문(d?.props?.head_data?.is_main_dns == 1, d?.page);
  } catch (e) {
    return false;
  }
};

// 몰 전체 검색 노출 끔 — 관리자 SEO설정 「검색엔진 노출」(seo_obj.search_hidden). 값이 없으면 노출(새 몰 기본 켜짐).
//   백엔드 domain.controller 의 검색막힘 과 같은 기준이다.
export const 검색막힘 = (hd) => {
  let o = hd?.seo_obj;
  if (typeof o === 'string') { try { o = JSON.parse(o); } catch { o = {}; } }
  const v = o?.search_hidden;
  return v === true || v === 1 || v === '1' || v === 'true';
};

export const 색인제외 = (asPath) => {
  const 경로 = 경로만(asPath);
  return 경로.startsWith('/shop/auth/') || 경로.startsWith('/shop/search/') || 경로.startsWith('/manager/');
};

// SHOPGO 메인 사이트(랜딩) 페이지별 제목. 몰 이름(ShopGo) 한 단어만 나가던 것을 바꾼다.
const 메인제목 = {
  '/': 'ShopGo 샵고 | 포스페이 가맹점 무료 쇼핑몰',
  '/manual/': '이용가이드 | ShopGo 샵고',
  '/frames/': '쇼핑몰 디자인 | ShopGo 샵고',
  '/faq/': '자주 묻는 질문 | ShopGo 샵고',
  '/apply/': '가맹점 쇼핑몰 신청 | ShopGo 샵고',
};
export const 제목 = (hd, asPath, 메인사이트) => {
  if (메인사이트) {
    const t = 메인제목[경로만(asPath)];
    if (t) return t;
  }
  return 공백정리(hd?.name);
};

export const 설명문 = (hd) => {
  const p = hd?.ssr_content?.product;
  if (p?.name) {
    const 소개 = 공백정리(p.comment);
    const 가격 = Number(p.price) > 0 ? `판매가 ${천단위(p.price)}원` : '';
    return [소개 || 공백정리(p.name), 가격, 공백정리(p.shop_name)].filter(Boolean).join(' | ').slice(0, 160);
  }
  const 몰소개 = 공백정리(hd?.og_description);
  if (몰소개) return 몰소개.slice(0, 160);
  const 이름 = 공백정리(hd?.name);
  return 이름 ? `${이름} 온라인 쇼핑몰` : '';
};

// 공유·검색 미리보기 이미지. 대표 이미지(og_img)가 없으면 로고라도 쓴다.
// SHOPGO 메인 사이트는 둘 다 비어 있어 랜딩 첫 화면 그림을 쓴다(관리자에서 대표 이미지를 넣으면 그게 우선).
export const 메인기본이미지 = '/assets/images/hero-mockup.png';
export const 대표이미지 = (hd, 메인사이트 = false, host = '') => {
  const 값 = String(hd?.og_img || hd?.logo_img || '').trim();
  if (값) return 값;
  return 메인사이트 && host ? `https://${host}${메인기본이미지}` : '';
};

const 판매상태 = { 0: 'InStock', 3: 'InStock', 2: 'OutOfStock', 1: 'Discontinued' };

// schema.org 구조화 데이터. 상품 상세면 Product, 몰 첫 화면이면 Organization, 그 밖엔 없음.
export const 구조화데이터 = (hd, 주소, asPath) => {
  const p = hd?.ssr_content?.product;
  if (p?.name && 주소) {
    const 상품 = { '@context': 'https://schema.org', '@type': 'Product', name: 공백정리(p.name), url: 주소 };
    if (p.img) 상품.image = [String(p.img)];
    if (공백정리(p.comment)) 상품.description = 공백정리(p.comment);
    if (Number(p.price) > 0) {
      상품.offers = {
        '@type': 'Offer',
        price: String(Math.round(Number(p.price))),
        priceCurrency: 'KRW',
        url: 주소,
      };
      const 상태 = 판매상태[Number(p.status)];
      if (상태) 상품.offers.availability = `https://schema.org/${상태}`;
      if (공백정리(p.shop_name)) 상품.offers.seller = { '@type': 'Organization', name: 공백정리(p.shop_name) };
    }
    return 상품;
  }
  const 경로 = 경로만(asPath);
  if ((경로 === '/' || 경로 === '/shop/') && 주소 && 공백정리(hd?.name)) {
    const 몰 = { '@context': 'https://schema.org', '@type': 'Organization', name: 공백정리(hd.name), url: 주소 };
    if (hd?.logo_img) 몰.logo = String(hd.logo_img);
    return 몰;
  }
  return null;
};

// <script type="application/ld+json"> 안에 넣을 문자열. </script> 로 닫히지 않게 < 를 막는다.
export const 구조화데이터문자열 = (obj) => (obj ? JSON.stringify(obj).replace(/</g, '\\u003c') : '');
