// 브랜드별 사이트맵 — https://<가맹점도메인>/sitemap.xml
//
// 왜: 출품 전 점검(2026-09-03)에서 sitemap.xml 이 404 였다. 검색엔진이 상품 상세까지 찾아가게
//     고정 페이지 + 그 브랜드의 상품 상세 주소를 내려준다. (robots.txt 는 public/ 의 정적 파일이라
//     호스트별 Sitemap 줄을 못 넣는다 — 서치콘솔에 /sitemap.xml 을 직접 등록하면 된다)
//
// 어떻게: 요청 호스트로 백엔드 /api/domain 을 불러 dns 쿠키를 받고, 그 쿠키로 /api/products 를
//     조회한다(상품 목록 API 는 dns 쿠키로 브랜드를 정한다). 백엔드 호출은 서버 안에서만 일어난다.
//     trailingSlash:true 는 확장자가 있는 경로(/sitemap.xml)에는 붙지 않는다.
const STATIC_PATHS = ['/shop/main/', '/shop/items/', '/shop/auth/login/', '/shop/auth/sign-up/', '/shop/auth/order-check/'];
const MAX_PRODUCTS = 2000;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function getServerSideProps({ req, res }) {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim().split(':')[0];
  const base = `https://${host}`;
  const back = process.env.BACK_URL;
  const urls = [...STATIC_PATHS];
  const lastmod = {};

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

  const body = urls.map((u) => `  <url><loc>${esc(base + u)}</loc>${lastmod[u] ? `<lastmod>${lastmod[u]}</lastmod>` : ''}</url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function Sitemap() { return null; }
