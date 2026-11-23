import { getDemoBrandDns } from 'src/components/main-site/frameList';

// 지금 접속한 주소가 어느 몰 주소(dns)인지 — /api/domain 조회와 API 머리말(X-Shop-Dns)이 같이 쓴다.
//   · 데모 미리보기(demo-N.*)는 그 프레임에 연결한 실제 몰 주소
//   · 메인 주소(MAIN_FRONT_URL·localhost)는 본사 몰(메인 도메인)
//   · 그 밖엔 접속한 주소 그대로
// 머리말을 붙이는 까닭은 백엔드 utils.js/dns-fallback.js 주석 참고(쿠키를 안 싣는 네이버 검색 로봇).
export const 접속몰주소 = (host) => {
  let dnsHost = process.env.IS_TEST == 1 ? 'localhost' : String(host || '').split(':')[0];
  const mainHosts = [process.env.MAIN_FRONT_URL, 'localhost', '127.0.0.1'].filter(Boolean);
  const rootDomain = (process.env.MAIN_FRONT_URL || '').replace(/^www\./, '');
  const demoBrandDns = getDemoBrandDns(dnsHost);
  if (demoBrandDns) return demoBrandDns;
  if (mainHosts.includes(dnsHost) && rootDomain) return rootDomain;
  return dnsHost;
};
