// 호스트별 사이트맵 — https://<도메인>/sitemap.xml
//
// 왜: 출품 전 점검(2026-09-03)에서 sitemap.xml 이 404 였다. 검색엔진이 상품 상세까지 찾아가게
//     몰 첫 화면 + 상품 목록 + 그 브랜드의 상품 상세 주소를 내려준다.
//     위치는 robots.txt(pages/robots.txt.js)의 Sitemap 줄로 알린다.
//
// 메인 사이트(SHOPGO)는 사이트맵 묶음(sitemapindex)을 낸다:
//   샵고 소개 페이지 목록(sitemap-pages.xml) + 「검색엔진 노출」이 켜진 몰들의 sitemap.xml.
//   그래서 구글 서치콘솔(도메인 속성 shopgo.co.kr)에는 이 주소 하나만 제출하면 몰까지 다 알려진다.
//   새 몰은 기본 켜짐이라 따로 제출하지 않아도 여기 붙는다(백엔드 /api/domain/search-brands).
//   ※ 네이버 서치어드바이저는 사이트(호스트)마다 등록·제출해야 한다 — 묶음이 다른 호스트로 넘어가는 걸 받지 않는다.
//
// 몰: 로그인·가입·주문조회 같은 화면은 넣지 않는다 — 검색 결과에 나올 페이지가 아니다(화면에도 noindex).
// 빈 사이트맵: 데모 미리보기(demo-N.*), 「검색엔진 노출」을 끈 몰, 등록 안 된 주소(robots.txt 에서도 막음).
//
// 어떻게: 요청 호스트로 백엔드 /api/domain 을 불러 dns 쿠키를 받고, 그 쿠키로 /api/products 를
//     조회한다(상품 목록 API 는 dns 쿠키로 브랜드를 정한다). 백엔드 호출은 서버 안에서만 일어난다.
//     trailingSlash:true 는 확장자가 있는 경로(/sitemap.xml)에는 붙지 않는다.
import { 요청호스트, 메인호스트, 데모호스트, 몰조회, 주소목록xml, xml글자 as esc } from 'src/utils/seo-host';
import { 검색막힘 } from 'src/utils/seo-head';

const 몰_고정경로 = ['/', '/shop/items/']; // 첫 화면은 루트(/) — /shop/ 과 같은 화면이다(next.config rewrite)
const MAX_PRODUCTS = 2000;

const 보내기 = (res, xml) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.write(xml);
  res.end();
  return { props: {} };
};

const 묶음xml = (sitemaps) => {
  const body = sitemaps.map((u) => `  <sitemap><loc>${esc(u)}</loc></sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
};

export async function getServerSideProps({ req, res }) {
  const host = 요청호스트(req);
  const base = `https://${host}`;
  const back = process.env.BACK_URL;

  if (데모호스트(host)) return 보내기(res, 주소목록xml([]));

  if (메인호스트(host)) {
    const 묶음 = [`${base}/sitemap-pages.xml`];
    if (back) {
      try {
        const r = await fetch(`${back}/api/domain/search-brands`, { signal: AbortSignal.timeout(5000) });
        const j = await r.json();
        for (const d of Array.isArray(j?.data) ? j.data : []) {
          if (d && d !== host && !데모호스트(d)) 묶음.push(`https://${d}/sitemap.xml`);
        }
      } catch (e) {
        // 백엔드가 잠시 안 되면 샵고 소개 페이지만 — 사이트맵은 실패보다 부분 응답이 낫다.
      }
    }
    return 보내기(res, 묶음xml(묶음));
  }

  const 몰 = await 몰조회(host);
  if (몰.상태 === '없음' || (몰.상태 === '있음' && 검색막힘(몰.브랜드))) return 보내기(res, 주소목록xml([]));

  const urls = 몰_고정경로.map((p) => base + p);
  const lastmod = {};
  if (몰.상태 === '있음' && 몰.쿠키 && back) {
    try {
      const r = await fetch(`${back}/api/products?page=1&page_size=${MAX_PRODUCTS}`, {
        headers: { cookie: 몰.쿠키 },
        signal: AbortSignal.timeout(8000),
      });
      const j = await r.json();
      for (const p of j?.data?.content || []) {
        if (!(p?.id > 0)) continue;
        const u = `${base}/shop/item/${p.id}/`;
        urls.push(u);
        if (p?.updated_at || p?.created_at) lastmod[u] = String(p.updated_at || p.created_at).slice(0, 10);
      }
    } catch (e) {
      // 백엔드가 잠시 안 되면 고정 페이지만 내려준다 — 사이트맵은 실패보다 부분 응답이 낫다.
    }
  }
  return 보내기(res, 주소목록xml(urls, lastmod));
}

export default function Sitemap() { return null; }
