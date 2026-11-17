// 샵고 메인 사이트의 소개 페이지 목록 — https://shopgo.co.kr/sitemap-pages.xml
//
// 메인 sitemap.xml 은 사이트맵 묶음(sitemapindex)이라 페이지 주소를 직접 담을 수 없다(형식이 다르다).
// 그 묶음의 첫 칸이 이 파일이다. 몰 주소에서는 빈 목록을 낸다(몰은 자기 sitemap.xml 이 있다).
import { 요청호스트, 메인호스트, 주소목록xml } from 'src/utils/seo-host';

const 메인_고정경로 = ['/', '/manual/', '/frames/', '/faq/', '/apply/'];

export async function getServerSideProps({ req, res }) {
  const host = 요청호스트(req);
  const urls = 메인호스트(host) ? 메인_고정경로.map((p) => `https://${host}${p}`) : [];
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.write(주소목록xml(urls));
  res.end();
  return { props: {} };
}

export default function SitemapPages() { return null; }
