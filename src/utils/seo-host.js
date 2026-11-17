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
