// 호스트별 robots.txt — https://<도메인>/robots.txt
//
// 왜: 예전엔 public/robots.txt 정적 파일이라 모든 몰이 같은 내용이었고, 사이트맵 위치(Sitemap 줄)를
//     호스트마다 적을 수 없었다. 검색엔진이 사이트맵을 스스로 찾게 몰마다 자기 주소를 적어 준다.
//
// 통째로 막는 곳(Disallow: /):
//   · 데모 미리보기(demo-N.*) — 실제 몰 내용을 그대로 비추는 화면이라 같은 내용이 중복 색인된다.
//   · 「검색엔진 노출」을 끈 몰(관리자 SEO설정, seo_obj.search_hidden) — 시험·견본 몰(2026-11-17 사장님 결정).
//   · 등록 안 된 주소 — 프론트는 아무 부주소에나 200 을 낸다(안내 화면). 검색에 남길 것이 없다.
// 백엔드가 잠시 응답하지 않으면 막지 않는다. 검색엔진은 robots.txt 를 하루쯤 기억하므로,
//   잠깐의 장애로 운영 몰이 통째로 막히는 쪽이 시험 몰이 잠시 열리는 쪽보다 훨씬 손해다.
import { 요청호스트, 메인호스트, 데모호스트, 몰조회 } from 'src/utils/seo-host';
import { 검색막힘 } from 'src/utils/seo-head';

export async function getServerSideProps({ req, res }) {
  const host = 요청호스트(req);
  let 막기 = 데모호스트(host);
  if (!막기 && !메인호스트(host)) {
    const 몰 = await 몰조회(host);
    막기 = 몰.상태 === '없음' || (몰.상태 === '있음' && 검색막힘(몰.브랜드));
  }
  const lines = ['User-agent: *'];
  if (막기) {
    lines.push('Disallow: /');
  } else {
    lines.push('Allow: /', 'Disallow: /manager/');
    if (host) lines.push('', `Sitemap: https://${host}/sitemap.xml`);
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.write(lines.join('\n') + '\n');
  res.end();
  return { props: {} };
}

export default function Robots() { return null; }
