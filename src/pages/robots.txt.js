// 호스트별 robots.txt — https://<도메인>/robots.txt
//
// 왜: 예전엔 public/robots.txt 정적 파일이라 모든 몰이 같은 내용이었고, 사이트맵 위치(Sitemap 줄)를
//     호스트마다 적을 수 없었다. 검색엔진이 사이트맵을 스스로 찾게 몰마다 자기 주소를 적어 준다.
//     데모 미리보기(demo-N.*)는 실제 몰 내용을 그대로 비추는 화면이라 통째로 막는다(같은 내용 중복 색인 방지).
import { 요청호스트, 데모호스트 } from 'src/utils/seo-host';

export async function getServerSideProps({ req, res }) {
  const host = 요청호스트(req);
  const lines = ['User-agent: *'];
  if (데모호스트(host)) {
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
