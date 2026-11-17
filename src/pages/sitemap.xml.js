// 호스트별 사이트맵 — https://<도메인>/sitemap.xml
//
// 왜: 출품 전 점검(2026-09-03)에서 sitemap.xml 이 404 였다. 검색엔진이 상품 상세까지 찾아가게
//     몰 첫 화면 + 상품 목록 + 그 브랜드의 상품 상세 주소를 내려준다.
//     위치는 robots.txt(pages/robots.txt.js)의 Sitemap 줄로 알린다.
//
// 메인 사이트(SHOPGO 랜딩)는 쇼핑몰이 아니라 소개·이용가이드·신청 페이지를 낸다.
// 로그인·가입·주문조회 같은 화면은 넣지 않는다 — 검색 결과에 나올 페이지가 아니다(화면에도 noindex).
// 데모 미리보기(demo-N.*)는 실제 몰 내용을 비추는 화면이라 빈 사이트맵을 준다(robots.txt 에서도 막음).
//
// 어떻게: 요청 호스트로 백엔드 /api/domain 을 불러 dns 쿠키를 받고, 그 쿠키로 /api/products 를
//     조회한다(상품 목록 API 는 dns 쿠키로 브랜드를 정한다). 백엔드 호출은 서버 안에서만 일어난다.
//     trailingSlash:true 는 확장자가 있는 경로(/sitemap.xml)에는 붙지 않는다.
import { 요청호스트, 메인호스트, 데모호스트 } from 'src/utils/seo-host';

const 몰_고정경로 = ['/', '/shop/items/']; // 첫 화면은 루트(/) — /shop/ 과 같은 화면이다(next.config rewrite)
const 메인_고정경로 = ['/', '/manual/', '/frames/', '/faq/', '/apply/'];
const MAX_PRODUCTS = 2000;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function getServerSideProps({ req, res }) {
  const host = 요청호스트(req);
  const base = `https://${host}`;
  const back = process.env.BACK_URL;
  const urls = [];
  const lastmod = {};

  if (데모호스트(host)) {
    // 비워 둔다
  } else if (메인호스트(host)) {
    urls.push(...메인_고정경로);
  } else {
    urls.push(...몰_고정경로);
    if (host && back) {
      try {
        const dom = await fetch(`${back}/api/domain?dns=${encodeURIComponent(host)}`, { signal: AbortSignal.timeout(5000) });
        const setCookie = dom.headers.get('set-cookie') || '';
        const m = /(?:^|,\s*)(dns=[^;]+)/.exec(setCookie);
        if (m) {
          const r = await fetch(`${back}/api/products?page=1&page_size=${MAX_PRODUCTS}`, {
            headers: { cookie: m[1] },
            signal: AbortSignal.timeout(8000),
          });
          const j = await r.json();
          const list = j?.data?.content || [];
          for (const p of list) {
            if (!(p?.id > 0)) continue;
            const path = `/shop/item/${p.id}/`;
            urls.push(path);
            if (p?.updated_at || p?.created_at) lastmod[path] = String(p.updated_at || p.created_at).slice(0, 10);
          }
        }
      } catch (e) {
        // 백엔드가 잠시 안 되면 고정 페이지만 내려준다 — 사이트맵은 실패보다 부분 응답이 낫다.
      }
    }
  }

  const body = urls.map((u) => `  <url><loc>${esc(base + u)}</loc>${lastmod[u] ? `<lastmod>${lastmod[u]}</lastmod>` : ''}</url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function Sitemap() { return null; }
