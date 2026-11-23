import { readFileSync, existsSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';

// 네이버 수집 대응(2026-11-23).
//   네이버 검색 로봇(Yeti)은 자바스크립트를 돌리지만 쿠키를 싣지 않는다 → 몰 화면이 빈 몰로 보였다.
// 붙잡아 두는 것:
//   ① 프론트: 모든 API 요청에 접속한 몰 주소(X-Shop-Dns)를 붙인다 — instance 를 만들기 전에 기본값에
//      /api/domain 조회 주소와 같은 함수(접속몰주소)로 정한다
//   ② 백엔드: 쿠키 없는 GET 만 머리말로 몰을 정하고, 「몰 불일치」 검사보다 앞에 있다
//      /api/domain 과 같은 몰찾기를 쓴다(셀러몰 포함)
//   ③ /favicon.ico: 몰 아이콘(없으면 로고)·메인은 샵고 아이콘·몰에 없으면 404, 클라우디너리는 정사각으로
//   ④ /rss.xml: 채널·글 주소가 그 호스트, 숨긴 상품 제외, 검색 노출 끈 몰·데모는 404, 백엔드 실패는 503
//   ⑤ <head>: 메인 아이콘 링크, RSS alternate 링크(데모·검색 끔 제외)

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };
const eq = (name, got, want) => t(`${name}${JSON.stringify(got) === JSON.stringify(want) ? '' : `\n       got  ${JSON.stringify(got)}\n       want ${JSON.stringify(want)}`}`, JSON.stringify(got) === JSON.stringify(want));
const 읽기 = (root, p) => readFileSync(root + p, 'utf8').replace(/\r/g, '');

// ① 프론트 머리말
const ax = 주석제거(읽기(FRONT_ROOT, 'src/utils/axios.js'));
t('axios: X-Shop-Dns 를 기본값에 넣는다', /axios\.defaults\.headers\.common\['X-Shop-Dns'\]\s*=/.test(ax));
t('axios: instance 를 만들기 전에 넣는다', ax.indexOf("headers.common['X-Shop-Dns']") < ax.indexOf('axios.create('));
t('axios: 접속몰주소 로 정한다', /접속몰주소\(window\.location\.host\)/.test(ax));
const sc = 주석제거(읽기(FRONT_ROOT, 'src/components/settings/SettingsContext.js'));
t('몰 정보 조회도 같은 함수(접속몰주소)', /const dnsHost = 접속몰주소\(window\.location\.host\)/.test(sc) && /\/api\/domain\?dns=\$\{dnsHost\}/.test(sc));
const vd = 읽기(FRONT_ROOT, 'src/utils/visit-dns.js');
t('접속몰주소: 데모→연결 몰, 메인→본사 몰', /getDemoBrandDns\(dnsHost\)/.test(vd) && /mainHosts\.includes\(dnsHost\) && rootDomain/.test(vd));

// ② 백엔드
if (백엔드있음) {
  const idx = 주석제거(읽기(BACK_ROOT, 'index.js'));
  const 대체 = idx.indexOf("app.use('/api', 쿠키없는조회)");
  const 불일치 = idx.indexOf('[몰 불일치]');
  const 라우트 = idx.indexOf("app.use('/api', upload.fields");
  t('백: 쿠키없는조회 를 붙였다', 대체 > 0);
  t('백: 「몰 불일치」 검사보다 앞, 라우트보다 앞', 대체 > 0 && 대체 < 불일치 && 대체 < 라우트);
  const fb = 주석제거(읽기(BACK_ROOT, 'utils.js/dns-fallback.js'));
  t('백: GET·HEAD 만', /req\.method !== 'GET' && req\.method !== 'HEAD'/.test(fb));
  t('백: 쓸 수 있는 dns 쿠키가 있으면 손대지 않는다', /if \(checkDns\(req\.cookies\?\.dns\)\) return next\(\)/.test(fb));
  t('백: 주소 모양 검사', /주소모양\.test\(dns\)/.test(fb));
  t('백: /api/domain 과 같은 몰찾기·캐시 키', /몰찾기\(dns\)/.test(fb) && /`domain:\$\{dns\}`/.test(fb));
  t('백: 비공개 칸 빼고 dns 토큰', /공개용브랜드/.test(fb) && /makeDnsToken\(brand\)/.test(fb));
  t('백: 실패해도 요청은 그대로 흘려보낸다', /catch \(e\) \{\s*\}\s*return next\(\);/.test(fb));
  const dc = 주석제거(읽기(BACK_ROOT, 'controllers/domain.controller.js'));
  t('백: /api/domain 도 몰찾기 를 쓴다(셀러몰 포함 한 곳)', /let brand = await 몰찾기\(dns\)/.test(dc) && /FROM users WHERE dns = \? AND is_delete = 0/.test(dc));
} else {
  console.log('  (백엔드 없음 — 백엔드 검사 건너뜀)');
}

// ③ 아이콘
const h = await import('file:///' + FRONT_ROOT + 'src/utils/seo-host.js');
eq('클라우디너리 아이콘은 정사각 96px PNG', h.아이콘배달주소('https://res.cloudinary.com/x/image/upload/v123/a.jpg'), 'https://res.cloudinary.com/x/image/upload/c_pad,b_white,w_96,h_96,f_png/v123/a.jpg');
eq('이미 변환 붙은 주소는 그대로', h.아이콘배달주소('https://res.cloudinary.com/x/image/upload/c_fill,w_8/v1/a.jpg'), 'https://res.cloudinary.com/x/image/upload/c_fill,w_8/v1/a.jpg');
eq('밖에서 온 주소는 그대로', h.아이콘배달주소('https://example.com/i.png'), 'https://example.com/i.png');
t('샵고 아이콘 파일이 있다', existsSync(FRONT_ROOT + 'public' + h.샵고아이콘.ico) && existsSync(FRONT_ROOT + 'public' + h.샵고아이콘.png180));
t('public/favicon.ico 가 없다(있으면 페이지와 겹쳐 모든 몰이 같은 아이콘)', !existsSync(FRONT_ROOT + 'public/favicon.ico'));
const fv = 주석제거(읽기(FRONT_ROOT, 'src/pages/favicon.ico.js'));
t('favicon: 몰은 faviconUrl(파비콘→로고)', /faviconUrl\(몰\.브랜드\)/.test(fv));
t('favicon: 몰에 없으면 404, 메인만 샵고 아이콘', /메인호스트\(host\) \? 샵고아이콘보내기\(res\) : 없음\(res\)/.test(fv));
t('favicon: 그림이 아닌 응답은 내주지 않는다', /종류\.startsWith\('image\/'\)/.test(fv));

// ④ RSS
eq('RSS 날짜(KST → RFC 822)', h.rss날짜('2026-11-22 21:37:14'), 'Sun, 22 Nov 2026 21:37:14 +0900');
eq('RSS 날짜 모양이 다르면 빈 값', h.rss날짜(null), '');
const x = h.rssXml({ title: 'A&B', link: 'https://m.kr/', description: '', self: 'https://m.kr/rss.xml' },
  [{ title: '<상품>', link: 'https://m.kr/shop/item/1/', description: '소개 | 판매가 1,000원', pubDate: 'Sun, 22 Nov 2026 21:37:14 +0900' }]);
t('RSS: 글자 이스케이프', x.includes('<title>A&amp;B</title>') && x.includes('<title>&lt;상품&gt;</title>'));
t('RSS: 설명이 비면 제목', x.includes('<description>A&amp;B</description>'));
t('RSS: self 링크·guid·최근 글 시각', x.includes('rel="self"') && x.includes('<guid isPermaLink="true">https://m.kr/shop/item/1/</guid>') && x.includes('<lastBuildDate>Sun, 22 Nov 2026 21:37:14 +0900</lastBuildDate>'));
t('RSS: 글이 없어도 형식이 맞다', /<channel>[\s\S]*<\/channel>/.test(h.rssXml({ title: 't', link: 'https://m.kr/', self: 'https://m.kr/rss.xml' }, [])));
const rs = 주석제거(읽기(FRONT_ROOT, 'src/pages/rss.xml.js'));
t('RSS: 숨긴 상품(status 5) 제외', /Number\(p\?\.status\) !== 5/.test(rs));
t('RSS: 데모·없는 주소·검색 끔은 404', /데모호스트\(host\)\) return 보내기\(res, 404\)/.test(rs) && /검색막힘\(몰\.브랜드\)\)\) return 보내기\(res, 404\)/.test(rs));
t('RSS: 백엔드 실패는 503', /return 보내기\(res, 503\)/.test(rs));
t('RSS: 글 주소는 요청 호스트', /link: `\$\{base\}\/shop\/item\/\$\{p\.id\}\/`/.test(rs));
const sp = 읽기(FRONT_ROOT, 'src/pages/sitemap-pages.xml.js');
const 사이트맵경로 = JSON.parse(sp.match(/메인_고정경로 = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
const 메인rss경로 = [...rs.matchAll(/경로: '([^']+)'/g)].map((m) => m[1]);
eq('RSS 메인 글 = 메인 사이트맵 목록', 메인rss경로, 사이트맵경로);

// ⑤ head
const app = 주석제거(읽기(FRONT_ROOT, 'src/pages/_app.js'));
t('head: 메인은 샵고 아이콘', /메인사이트 \? \([\s\S]{0,80}href='\/favicon\.ico'/.test(app) && /샵고아이콘\.png180/.test(app));
t('head: RSS 링크(데모·검색 끔 제외)', /rss주소 = \(호스트 && !데모호스트\(호스트\) && !검색막힘\(hd\)\)/.test(app) && /type='application\/rss\+xml'/.test(app));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
