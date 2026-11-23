// 호스트별 RSS — https://<도메인>/rss.xml (2026-11-23)
//
// 왜: 네이버 서치어드바이저는 사이트맵과 별도로 RSS 를 받아 새 글(우리는 새 상품)을 빨리 찾아간다.
//   RSS 가 없어 「RSS 제출」을 못 하고 있었다. 네이버는 채널·글 주소가 등록한 사이트 주소와 같아야 받는다.
//
// 무엇을:
//   · 가맹점 몰 = 최근 상품 50개(지운·숨긴 상품 제외). 제목=상품명, 내용=한 줄 소개+판매가, 날짜=등록일.
//   · 샵고 메인 = 소개 페이지 5개(사이트맵과 같은 목록).
//   · 데모 미리보기·「검색엔진 노출」을 끈 몰·등록 안 된 주소 = 404(사이트맵이 비는 곳과 같다).
//   · 백엔드가 잠시 응답하지 않으면 503 — 빈 목록을 주면 로봇이 상품이 다 없어진 것으로 읽는다.
// <head> 의 <link rel="alternate" type="application/rss+xml"> 는 _app 이 건다.
import { 요청호스트, 메인호스트, 데모호스트, 몰조회, rssXml, rss날짜 } from 'src/utils/seo-host';
import { 검색막힘 } from 'src/utils/seo-head';

const 최대 = 50;

// 샵고 소개 페이지 — 제목은 _app(seo-head 메인제목)과 같게
const 메인글 = [
  { 경로: '/', 제목: 'ShopGo 샵고 | 포스페이 가맹점 무료 쇼핑몰', 내용: '포스페이 가맹점이 제작비 없이 여는 무료 쇼핑몰 서비스입니다.' },
  { 경로: '/manual/', 제목: '이용가이드 | ShopGo 샵고', 내용: '쇼핑몰 기본 정보 설정부터 배송비, 카테고리, 상품 등록, 주문 처리까지 관리자 페이지 사용법입니다.' },
  { 경로: '/frames/', 제목: '쇼핑몰 디자인 | ShopGo 샵고', 내용: '고를 수 있는 쇼핑몰 디자인(프레임) 6종과 미리보기입니다.' },
  { 경로: '/faq/', 제목: '자주 묻는 질문 | ShopGo 샵고', 내용: '결제·정산과 쇼핑몰 운영에 관해 자주 묻는 질문을 모았습니다.' },
  { 경로: '/apply/', 제목: '가맹점 쇼핑몰 신청 | ShopGo 샵고', 내용: '사업자 정보와 쓰실 쇼핑몰 주소, 디자인을 골라 무료 쇼핑몰을 신청합니다.' },
];

const 보내기 = (res, code, body = '') => {
  res.statusCode = code;
  if (code === 200) {
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
  } else if (code === 503) {
    res.setHeader('Retry-After', '600');
  }
  res.end(body);
  return { props: {} };
};

const 천단위 = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const 공백정리 = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

export async function getServerSideProps({ req, res }) {
  const host = 요청호스트(req);
  const base = `https://${host}`;
  if (!host || 데모호스트(host)) return 보내기(res, 404);

  if (메인호스트(host)) {
    // 사이트맵(sitemap-pages.xml)과 같은 목록인지 검사가 본다(scripts/checks/naver-crawl.mjs)
    return 보내기(res, 200, rssXml(
      { title: 메인글[0].제목, link: `${base}/`, description: 메인글[0].내용, self: `${base}/rss.xml` },
      메인글.map((g) => ({ title: g.제목, link: `${base}${g.경로}`, description: g.내용 })),
    ));
  }

  const 몰 = await 몰조회(host);
  if (몰.상태 === '없음' || (몰.상태 === '있음' && 검색막힘(몰.브랜드))) return 보내기(res, 404);
  if (몰.상태 !== '있음' || !몰.쿠키 || !process.env.BACK_URL) return 보내기(res, 503);

  const 몰이름 = 공백정리(몰.브랜드?.name) || host;
  let 상품 = [];
  try {
    const r = await fetch(`${process.env.BACK_URL}/api/products?page=1&page_size=${최대}`, {
      headers: { cookie: 몰.쿠키 },
      signal: AbortSignal.timeout(8000),
    });
    const j = await r.json();
    if (!(j?.result > 0)) return 보내기(res, 503);
    상품 = (j?.data?.content || [])
      // 숨긴 상품(status 5)은 손님 화면에 없다 — 목록 API 는 관리자 화면과 같이 써서 숨긴 상품도 준다(sitemap.xml.js 와 같음)
      .filter((p) => p?.id > 0 && Number(p?.status) !== 5)
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 최대);
  } catch (e) {
    return 보내기(res, 503);
  }

  return 보내기(res, 200, rssXml(
    { title: 몰이름, link: `${base}/`, description: 공백정리(몰.브랜드?.og_description) || `${몰이름} 온라인 쇼핑몰`, self: `${base}/rss.xml` },
    상품.map((p) => {
      const 가격 = Number(p.product_sale_price) > 0 ? `판매가 ${천단위(p.product_sale_price)}원` : '';
      return {
        title: 공백정리(p.product_name),
        link: `${base}/shop/item/${p.id}/`,
        description: [공백정리(p.product_comment).slice(0, 300), 가격].filter(Boolean).join(' | '),
        pubDate: rss날짜(p.created_at),
      };
    }),
  ));
}

export default function Rss() { return null; }
