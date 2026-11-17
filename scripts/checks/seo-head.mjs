import { readFileSync, existsSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';

// 검색 노출 1단계(2026-11-17).
//   본문은 아직 브라우저에서만 그려지므로, 검색엔진이 처음 받는 <head> 에 제목·설명·대표 주소·상품 정보를 채운다.
// 붙잡아 두는 것:
//   ① 대표 주소: 쿼리 버림(분류 category_id 만 남김), 가맹점 /shop/ → 루트, 메인 사이트는 그대로
//   ② 설명이 빈 몰·상품도 설명이 나간다, 상품은 가격 포함
//   ③ 상품 상세는 schema.org Product(가격·KRW·판매상태), 몰 첫 화면은 Organization
//   ④ 로그인·장바구니·마이페이지·검색은 noindex
//   ⑤ 사이트맵: 메인=소개 페이지, 몰=첫 화면·목록·상품, 로그인류 없음, 데모 호스트는 비움 / robots 는 호스트별 Sitemap 줄
//   ⑥ 백엔드: 지운·숨긴 상품은 제목·검색 정보 안 만듦, 한 줄 소개 null 이 "null" 로 안 나감
//   ⑦ 「검색엔진 노출」 끈 몰(seo_obj.search_hidden, 2026-11-17): noindex·robots 전부 막기·빈 사이트맵,
//      값 없으면 켜짐(새 몰 기본), 메인 sitemap.xml 은 켜진 몰을 묶는 sitemapindex

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };
const eq = (name, got, want) => t(`${name}${JSON.stringify(got) === JSON.stringify(want) ? '' : `\n       got  ${JSON.stringify(got)}\n       want ${JSON.stringify(want)}`}`, JSON.stringify(got) === JSON.stringify(want));
const 읽기 = (root, p) => readFileSync(root + p, 'utf8').replace(/\r/g, '');

const s = await import('file:///' + FRONT_ROOT + 'src/utils/seo-head.js');

// ①
eq('상품 상세 주소', s.페이지주소('mbc02.shopgo.co.kr', '/shop/item/123?ref=x#a'), 'https://mbc02.shopgo.co.kr/shop/item/123/');
eq('분류 목록은 category_id 만 남김', s.페이지주소('a.kr', '/shop/items/?category_id=5&sort=2'), 'https://a.kr/shop/items/?category_id=5');
eq('목록 정렬·필터만 있으면 쿼리 없음', s.페이지주소('a.kr', '/shop/items/?sort=2'), 'https://a.kr/shop/items/');
eq('가맹점 /shop/ → 루트', s.페이지주소('a.kr', '/shop'), 'https://a.kr/');
eq('가맹점 루트', s.페이지주소('a.kr', '/'), 'https://a.kr/');
eq('메인 사이트 경로는 그대로', s.페이지주소('shopgo.co.kr', '/manual', true), 'https://shopgo.co.kr/manual/');
eq('포트·스킴 떼기', s.페이지주소('http://a.kr:3000/', '/'), 'https://a.kr/');
eq('호스트 없으면 빈 값', s.페이지주소('', '/'), '');

// ②
const 몰 = { name: '포항과메기', og_description: '  청정 바다 ', logo_img: 'https://x/logo.png' };
eq('몰 소개 있으면 그대로(공백 정리)', s.설명문(몰), '청정 바다');
eq('몰 소개 없으면 이름으로', s.설명문({ name: 'mbc02' }), 'mbc02 온라인 쇼핑몰');
const 상품몰 = { name: 'mbc02 - 광어회', ssr_content: { product: { id: 1, name: '광어회', comment: '', price: 12000, list_price: 15000, status: 0, shop_name: 'mbc02', img: 'https://x/p.jpg' } } };
eq('상품 설명: 소개 없으면 상품명+가격+몰', s.설명문(상품몰), '광어회 | 판매가 12,000원 | mbc02');
eq('상품 설명: 소개 있으면 소개', s.설명문({ ssr_content: { product: { name: 'A', comment: '맛있는 회', price: 0, shop_name: 'B' } } }), '맛있는 회 | B');
t('설명은 160자 이내', s.설명문({ og_description: '가'.repeat(300) }).length === 160);
eq('대표 이미지 없으면 로고', s.대표이미지(몰), 'https://x/logo.png');
eq('메인 사이트는 둘 다 없으면 랜딩 그림', s.대표이미지({}, true, 'shopgo.co.kr'), 'https://shopgo.co.kr/assets/images/hero-mockup.png');
eq('가맹점은 없으면 빈 값', s.대표이미지({}, false, 'a.kr'), '');
t('랜딩 그림 파일이 있다', existsSync(FRONT_ROOT + 'public' + s.메인기본이미지));
eq('메인 사이트 첫 화면 제목', s.제목({ name: 'ShopGo' }, '/', true), 'ShopGo 샵고 | 포스페이 가맹점 무료 쇼핑몰');
eq('가맹점 제목은 몰 이름', s.제목({ name: '포항과메기' }, '/', false), '포항과메기');

// ③
const p = s.구조화데이터(상품몰, 'https://mbc02.shopgo.co.kr/shop/item/1/', '/shop/item/1');
eq('Product 형식', p?.['@type'], 'Product');
eq('가격·통화', [p?.offers?.price, p?.offers?.priceCurrency], ['12000', 'KRW']);
eq('판매중=InStock', p?.offers?.availability, 'https://schema.org/InStock');
eq('품절=OutOfStock', s.구조화데이터({ ssr_content: { product: { name: 'a', price: 1, status: 2 } } }, 'https://a/', '/')?.offers?.availability, 'https://schema.org/OutOfStock');
t('가격 0 이면 offers 없음', !s.구조화데이터({ ssr_content: { product: { name: 'a', price: 0, status: 0 } } }, 'https://a/', '/').offers);
eq('몰 첫 화면 = Organization', s.구조화데이터(몰, 'https://a.kr/', '/')?.['@type'], 'Organization');
eq('그 밖의 화면은 없음', s.구조화데이터(몰, 'https://a.kr/shop/items/', '/shop/items/'), null);
t('</script> 로 닫히지 않음', !s.구조화데이터문자열({ name: '</script><b>' }).includes('<'));

// ④
t('로그인 noindex', s.색인제외('/shop/auth/login'));
t('검색 noindex', s.색인제외('/shop/search/?keyword=a'));
t('상품 상세는 색인', !s.색인제외('/shop/item/3'));

// _app 이 실제로 쓰는지
const app = 주석제거(읽기(FRONT_ROOT, 'src/pages/_app.js'));
t('_app: canonical·noindex·ld+json 을 그린다', app.includes("rel='canonical'") && app.includes("content='noindex'") && app.includes('application/ld+json'));
t('_app: 인증 메타는 값 있을 때만', /seo_obj\?\.naver_token \|\| ''\)\.trim\(\) &&/.test(app));
t('_app: 요청 호스트를 page_host 로 넘긴다', app.includes('page_host: host'));

// ⑤
const sm = 읽기(FRONT_ROOT, 'src/pages/sitemap.xml.js');
t('사이트맵: 로그인·가입·주문조회 없음', !/\/shop\/auth\//.test(주석제거(sm)));
const smp = 읽기(FRONT_ROOT, 'src/pages/sitemap-pages.xml.js');
t('사이트맵: 메인=소개·가이드(sitemap-pages.xml)', smp.includes("'/manual/'") && smp.includes('메인호스트(host)'));
t('사이트맵: 메인 sitemap.xml 은 묶음(sitemapindex) — 소개 목록 + 켜진 몰', sm.includes('<sitemapindex') && sm.includes('/sitemap-pages.xml') && sm.includes('/api/domain/search-brands'));
t('사이트맵: 끈 몰·없는 주소는 빈 목록', /몰\.상태 === '없음' \|\| \(몰\.상태 === '있음' && 검색막힘\(몰\.브랜드\)\)\) return 보내기\(res, 주소목록xml\(\[\]\)\)/.test(sm));
t('사이트맵: 데모 호스트 비움', sm.includes('데모호스트(host)'));
t('정적 robots.txt 없음(호스트별 페이지와 충돌)', !existsSync(FRONT_ROOT + 'public/robots.txt'));
const rb = 읽기(FRONT_ROOT, 'src/pages/robots.txt.js');
t('robots: Sitemap 줄·데모 전부 막기', rb.includes('Sitemap: https://${host}/sitemap.xml') && rb.includes("'Disallow: /'"));
const h = await import('file:///' + FRONT_ROOT + 'src/utils/seo-host.js');
t('데모 호스트 판정', h.데모호스트('demo-3.shopgo.co.kr') && !h.데모호스트('mbc02.shopgo.co.kr'));
t('robots: 끈 몰·없는 주소는 전부 막기, 백엔드 실패는 안 막음', rb.includes("몰.상태 === '없음' || (몰.상태 === '있음' && 검색막힘(몰.브랜드))"));
eq('사이트맵 목록 비면 빈 urlset', h.주소목록xml([]), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n');
t('사이트맵 주소 & 이스케이프', h.주소목록xml(['https://a/?x=1&y=2']).includes('<loc>https://a/?x=1&amp;y=2</loc>'));

// ⑦
t('검색막힘: 값 없으면 노출(새 몰 기본 켜짐)', !s.검색막힘({}) && !s.검색막힘({ seo_obj: { naver_token: '' } }) && !s.검색막힘(undefined));
t('검색막힘: 참이면 막힘(객체·문자열 저장 모두)', s.검색막힘({ seo_obj: { search_hidden: true } }) && s.검색막힘({ seo_obj: '{"search_hidden": true}' }) && s.검색막힘({ seo_obj: { search_hidden: 1 } }));
t('검색막힘: 거짓·깨진 값은 노출', !s.검색막힘({ seo_obj: { search_hidden: false } }) && !s.검색막힘({ seo_obj: '{깨짐' }));
t('_app: 끈 몰은 모든 페이지 noindex', app.includes('(색인제외(router.asPath) || 검색막힘(hd))'));
const 설정 = 읽기(FRONT_ROOT, 'src/pages/manager/settings/default/[brand_id].js');
t('관리자 SEO설정: 「검색엔진 노출」 스위치(seo_obj.search_hidden)', 설정.includes("label='검색엔진 노출'") && 설정.includes("['search_hidden']: !e.target.checked"));
t('관리자 브랜드 목록: 검색 노출 칸', 읽기(FRONT_ROOT, 'src/pages/manager/settings/brands/index.js').includes("id: 'search_open'"));

// ⑧ 2단계(2026-11-17): 샵고 소개 페이지는 본문을 서버에서 그린다
t('서버본문: 메인 사이트 소개 페이지 5개만', s.서버본문(true, '/') && s.서버본문(true, '/manual') && s.서버본문(true, '/apply') && !s.서버본문(true, '/shop') && !s.서버본문(false, '/') && !s.서버본문(true, '/manager/settings'));
const 테마 = 주석제거(읽기(FRONT_ROOT, 'src/theme/index.js'));
t('ThemeProvider: bodyWithoutDns 면 몰 정보 없이 그린다', 테마.includes('(paletteObj?.is_dns_data || bodyWithoutDns) &&'));
t('ThemeProvider: injectFirst 안 씀(서버 캐시를 건너뛰므로)', !/StyledEngineProvider injectFirst/.test(테마));
t('_app: 서버본문 판정을 ThemeProvider 에 넘긴다', app.includes('<ThemeProvider bodyWithoutDns={본문서버}>') && app.includes('서버본문(메인사이트, router.pathname)'));
const 문서 = 주석제거(읽기(FRONT_ROOT, 'src/pages/_document.js'));
t('_document: emotion 스타일을 요청마다 모아 head 에 담는다', 문서.includes('createEmotionServer(emotionCache)') && 문서.includes('<App emotionCache={emotionCache} {...props} />') && 문서.includes('{this.props.emotionStyleTags}'));
t('_document: 스타일 자리(emotion-insertion-point)가 스타일보다 앞', 문서.indexOf('emotion-insertion-point') > 0 && 문서.indexOf('emotion-insertion-point') < 문서.indexOf('{this.props.emotionStyleTags}'));
t('ThemeRtlLayout: 왼쪽→오른쪽 언어는 바깥 캐시 그대로', 주석제거(읽기(FRONT_ROOT, 'src/components/settings/ThemeRtlLayout.js')).includes("if (theme.direction !== 'rtl') return <>{children}</>;"));
const 언어 = 주석제거(읽기(FRONT_ROOT, 'src/locales/i18n.js'));
t('i18n: 서버본문 페이지는 서버 언어로 시작, 고른 언어는 미뤘다가 되돌림', 언어.includes('if (서버본문으로시작()) 미룬언어 = 저장언어') && 언어.includes("localStorage.setItem('i18nextLng', 미룬언어)"));
t('_app: 미룬 언어로 전환', app.includes('const 미룬 = 미룬언어가져오기();'));

// ⑥
if (백엔드있음) {
  const dc = 주석제거(읽기(BACK_ROOT, 'controllers/domain.controller.js'));
  t('백: 지운·숨긴 상품 제외', /FROM products WHERE id = \? AND brand_id = \? AND is_delete = 0 AND status != 5/.test(dc));
  t('백: 소개 빈칸이면 og_description 안 덮음', dc.includes("if (String(product.product_comment ?? '').trim()) brand.og_description"));
  t('백: ssr_content.product 채움', dc.includes('brand.ssr_content.product = {'));
  t('백: search-brands 는 본사 아래·안 지움·안 닫음·검색 켜짐만', dc.includes('searchBrands: async') && dc.includes('m.is_main_dns = 1') && dc.includes('b.is_closure = 0') && dc.includes('!검색막힘(r.seo_obj)'));
  t('백: search-brands 경로', 읽기(BACK_ROOT, 'routes/domain.route.js').includes("route('/search-brands')"));
  const dcm = await import('file:///' + BACK_ROOT + 'controllers/domain.controller.js').catch(() => null);
  if (dcm?.검색막힘) {
    t('백 검색막힘: 프론트와 같은 기준', dcm.검색막힘('{"search_hidden":true}') && !dcm.검색막힘('{"naver_token":""}') && !dcm.검색막힘(null) && !dcm.검색막힘('깨짐'));
  }
  const mg = 읽기(BACK_ROOT, 'migrations/2026-11-17_search_hidden.sql');
  const 끌몰 = (mg.match(/WHERE is_delete = 0\s+AND id IN \(([^)]+)\)/) || [])[1]?.split(',').map((x) => Number(x.trim())) || [];
  t('마이그레이션: 98·99·141 은 안 끔, 포항과메기(130)·첫돌공방(105)은 끔', 끌몰.length > 30 && ![98, 99, 141].some((i) => 끌몰.includes(i)) && 끌몰.includes(130) && 끌몰.includes(105));
  t('마이그레이션: 다른 프로젝트 브랜드(2~97) 안 건드림', 끌몰.every((i) => i >= 100));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
