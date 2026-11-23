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

// ── /favicon.ico (pages/favicon.ico.js) ─────────────────────────────────────
// 샵고 메인·데모 미리보기에 쓰는 기본 아이콘(메인 헤더 글자 로고 「Shop」흰색+「Go」라임을 줄인 것).
export const 샵고아이콘 = { ico: '/assets/images/shopgo-favicon.ico', png180: '/assets/images/shopgo-icon-180.png' };

// 클라우디너리에 올린 몰 아이콘을 정사각 96px PNG 로 받아 온다. 파비콘 없이 로고로 대신하는 몰은
//   로고가 가로로 길어서 그대로 주면 찌그러진다 — 여백을 채워(c_pad) 정사각으로 맞춘다.
//   이미 변환이 붙은 주소·밖에서 온 주소는 그대로 쓴다.
export const 아이콘배달주소 = (url) => {
  const src = String(url ?? '').trim();
  if (!src.startsWith('https://res.cloudinary.com/') || !/\/upload\/v\d+\//.test(src)) return src;
  return src.replace('/upload/', '/upload/c_pad,b_white,w_96,h_96,f_png/');
};

// ── /rss.xml (pages/rss.xml.js) ────────────────────────────────────────────
// 네이버 서치어드바이저 「RSS 제출」용. 네이버는 채널·글 주소가 등록한 사이트 주소와 같아야 받는다.
// DB 시각(KST, 'YYYY-MM-DD HH:mm:ss') → RSS pubDate(RFC 822, +0900). 모양이 다르면 빈 값.
export const rss날짜 = (v) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(String(v ?? ''));
  if (!m) return '';
  const [, y, mo, d, h, mi, s] = m;
  const 요일 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(Date.UTC(+y, +mo - 1, +d)).getUTCDay()];
  const 달 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+mo - 1];
  return `${요일}, ${d} ${달} ${y} ${h}:${mi}:${s} +0900`;
};

// channel: { title, link, description, self }, items: [{ title, link, description, pubDate }]
//   lastBuildDate 는 가장 최근 글 시각 — 요청 시각으로 하면 읽을 때마다 바뀐 것처럼 보인다.
export const rssXml = (channel, items = []) => {
  const 줄 = (tag, v) => (v ? `<${tag}>${xml글자(v)}</${tag}>` : '');
  const 최근 = items.map((i) => i.pubDate).find(Boolean) || '';
  const 글들 = items.map((i) => `    <item>${줄('title', i.title)}${줄('link', i.link)}<guid isPermaLink="true">${xml글자(i.link)}</guid>${줄('description', i.description)}${줄('pubDate', i.pubDate)}</item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    ${줄('title', channel.title)}
    ${줄('link', channel.link)}
    ${줄('description', channel.description || channel.title)}
    <language>ko</language>
    <atom:link href="${xml글자(channel.self)}" rel="self" type="application/rss+xml"/>
    ${최근 ? 줄('lastBuildDate', 최근) : ''}
${글들}${글들 ? '\n' : ''}  </channel>
</rss>
`;
};

// 사이트맵 <urlset>. urls 는 완성된 주소(https://...), lastmod 는 { 주소: 'YYYY-MM-DD' }.
export const 주소목록xml = (urls, lastmod = {}) => {
  const body = urls.map((u) => `  <url><loc>${xml글자(u)}</loc>${lastmod[u] ? `<lastmod>${lastmod[u]}</lastmod>` : ''}</url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}${body ? '\n' : ''}</urlset>\n`;
};
