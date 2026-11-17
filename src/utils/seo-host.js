// 사이트맵·robots.txt 가 같이 쓰는 호스트 판정.
// _app.getInitialProps 와 같은 기준이다(메인 호스트 = MAIN_FRONT_URL, 데모 = demo-N.*).

export const 요청호스트 = (req) =>
  String(req?.headers?.['x-forwarded-host'] || req?.headers?.host || '').split(',')[0].trim().split(':')[0].toLowerCase();

export const 메인호스트 = (host) => {
  const 메인 = String(process.env.MAIN_FRONT_URL || '').trim().toLowerCase();
  if (!메인 || !host) return false;
  const 뿌리 = 메인.replace(/^www\./, '');
  return host === 메인 || host === 뿌리 || host === `www.${뿌리}`;
};

export const 데모호스트 = (host) => /^demo-\d+\./.test(String(host || ''));

// 이 호스트의 몰 정보. robots.txt·사이트맵이 「검색 노출 끔」을 보고, 사이트맵은 dns 쿠키로 상품을 조회한다.
//   { 상태: '있음', 브랜드, 쿠키 } | { 상태: '없음' }(등록 안 된 주소) | { 상태: '실패' }(백엔드 응답 없음)
export const 몰조회 = async (host) => {
  const back = process.env.BACK_URL;
  if (!host || !back) return { 상태: '실패' };
  try {
    const r = await fetch(`${back}/api/domain?dns=${encodeURIComponent(host)}`, { signal: AbortSignal.timeout(5000) });
    const j = await r.json().catch(() => null);
    if (j?.result === -120) return { 상태: '없음' };
    if (!(j?.result > 0) || !j?.data) return { 상태: '실패' };
    const m = /(?:^|,\s*)(dns=[^;]+)/.exec(r.headers.get('set-cookie') || '');
    return { 상태: '있음', 브랜드: j.data, 쿠키: m ? m[1] : '' };
  } catch (e) {
    return { 상태: '실패' };
  }
};

export const xml글자 = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// 사이트맵 <urlset>. urls 는 완성된 주소(https://...), lastmod 는 { 주소: 'YYYY-MM-DD' }.
export const 주소목록xml = (urls, lastmod = {}) => {
  const body = urls.map((u) => `  <url><loc>${xml글자(u)}</loc>${lastmod[u] ? `<lastmod>${lastmod[u]}</lastmod>` : ''}</url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}${body ? '\n' : ''}</urlset>\n`;
};
