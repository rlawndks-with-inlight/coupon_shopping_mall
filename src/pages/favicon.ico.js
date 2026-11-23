// 호스트별 /favicon.ico
//
// 왜(2026-11-23): 세 곳(샵고 메인·포스몰·해담수산) 모두 /favicon.ico 가 404 였다. 브라우저는 <head> 의
//   아이콘 링크를 쓰지만, 검색 결과 옆 아이콘을 모으는 로봇은 이 주소를 직접 찾기도 한다(네이버 로봇 기록에 404).
//   샵고 메인은 아이콘 링크도 아예 없었다(브랜드에 파비콘·로고가 없음 — _app 이 이제 기본 아이콘을 건다).
//
// 무엇을: 몰 = 관리자에 올린 파비콘(없으면 로고, _app 과 같은 faviconUrl)을 받아 그대로 내준다.
//         샵고 메인·데모 미리보기 = 샵고 기본 아이콘(public/assets/images/shopgo-favicon.ico).
//         몰에 둘 다 없거나 등록 안 된 주소 = 404(남의 몰에 샵고 아이콘을 붙이지 않는다).
//   리다이렉트 대신 내용을 직접 내준다 — 아이콘을 모으는 로봇이 다른 도메인으로 넘어가는 걸 따라가는지 알 수 없다.
import fs from 'fs';
import path from 'path';
import { 요청호스트, 메인호스트, 데모호스트, 몰조회, 샵고아이콘, 아이콘배달주소 } from 'src/utils/seo-host';
import { faviconUrl } from 'src/data/data';

const 하루 = 'public, max-age=86400';

const 없음 = (res) => {
  res.statusCode = 404;
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.end();
  return { props: {} };
};

const 샵고아이콘보내기 = (res) => {
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), 'public', 샵고아이콘.ico));
    res.setHeader('Content-Type', 'image/x-icon');
    res.setHeader('Cache-Control', 하루);
    res.end(buf);
    return { props: {} };
  } catch (e) {
    return 없음(res);
  }
};

export async function getServerSideProps({ req, res }) {
  const host = 요청호스트(req);
  if (데모호스트(host)) return 샵고아이콘보내기(res);

  const 몰 = await 몰조회(host);
  const 주소 = 몰.상태 === '있음' ? faviconUrl(몰.브랜드) : '';
  if (!주소) return 메인호스트(host) ? 샵고아이콘보내기(res) : 없음(res);

  try {
    const r = await fetch(아이콘배달주소(주소), { signal: AbortSignal.timeout(5000) });
    const 종류 = String(r.headers.get('content-type') || '');
    if (!r.ok || !종류.startsWith('image/')) return 메인호스트(host) ? 샵고아이콘보내기(res) : 없음(res);
    res.setHeader('Content-Type', 종류);
    res.setHeader('Cache-Control', 하루);
    res.end(Buffer.from(await r.arrayBuffer()));
    return { props: {} };
  } catch (e) {
    return 메인호스트(host) ? 샵고아이콘보내기(res) : 없음(res);
  }
}

export default function Favicon() { return null; }
