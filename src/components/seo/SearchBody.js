// 검색엔진용 본문 — 가맹점 몰의 서버 HTML 에 그 페이지의 실제 내용을 글로 싣는다(검색 노출 2단계-②, 2026-11-17).
//
// 왜: 몰 화면(디자인 6종)은 브라우저에서 몰 정보를 받은 뒤에야 그려져서, 서버 HTML 에는 본문이 없다.
//     디자인을 서버에서 그리려면 18개 화면의 데이터 흐름을 바꿔야 해서(사장님 결정) 대신 이 글을 싣는다.
// 어떻게: ThemeProvider 가 몰 정보를 기다리는 동안(지금까지는 빈 화면) 이 블록을 그린다.
//     서버와 브라우저 첫 화면이 같은 값(head_data·router.pathname)으로 그리므로 어긋나지 않고,
//     몰 정보가 오면 실제 디자인으로 바뀐다. 손님 눈에는 보이지 않게 숨긴다(손님 화면은 그대로).
// 내용은 손님이 보는 화면과 같은 것만 싣는다 — 몰 이름·소개, 상품명·판매가·한 줄 소개, 상품 목록, 사업자 정보(화면 아래와 같은 값).
//   그 밖의 글(광고 문구 등)을 더하면 검색엔진이 「숨긴 글」로 볼 수 있다.
// 한국어 고정 — 가맹점이 넣은 값 그대로라 번역하지 않는다(i18n 을 쓰면 첫 화면 언어가 서버와 어긋난다).
import { 검색본문종류 } from 'src/utils/seo-head';

const 숨김 = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0,
};
const 원 = (n) => `${Number(n || 0).toLocaleString('ko-KR')}원`;
const 상태글 = (s) => (Number(s) === 2 ? '품절' : Number(s) === 1 ? '판매 중단' : '');

export default function SearchBody({ hd, pathname }) {
  const 종류 = 검색본문종류(pathname);
  if (!종류 || !hd?.id) return null;
  const 상품 = hd?.ssr_content?.product;
  const 목록 = Array.isArray(hd?.ssr_content?.products) ? hd.ssr_content.products : [];
  const 몰이름 = (종류 === 'product' && 상품?.shop_name) || hd?.name || '';
  const 소개 = String(hd?.og_description || '').trim();
  const 사업자 = [
    hd?.company_name && `상호 ${hd.company_name}`,
    hd?.ceo_name && `대표 ${hd.ceo_name}`,
    hd?.business_num && `사업자등록번호 ${hd.business_num}`,
    hd?.mail_order_num && `통신판매업신고 ${hd.mail_order_num}`,
    hd?.addr && `주소 ${hd.addr}`,
    hd?.phone_num && `고객센터 ${hd.phone_num}`,
  ].filter(Boolean);

  return (
    <div style={숨김} aria-hidden='true' data-search-body=''>
      {종류 === 'product' && 상품 ? (
        <article>
          <h1>{상품.name}</h1>
          <p>
            판매가 {원(상품.price)}
            {상품.list_price > 상품.price ? ` (정가 ${원(상품.list_price)})` : ''}
            {상태글(상품.status) ? ` · ${상태글(상품.status)}` : ''}
          </p>
          {상품.comment && <p>{상품.comment}</p>}
          <p><a href='/' tabIndex={-1}>{몰이름}</a> · <a href='/shop/items/' tabIndex={-1}>전체 상품</a></p>
        </article>
      ) : (
        <>
          <h1>{몰이름}</h1>
          {소개 && <p>{소개}</p>}
          {목록.length > 0 && (
            <section>
              <h2>상품</h2>
              <ul>
                {목록.map((p) => (
                  <li key={p.id}>
                    <a href={`/shop/item/${p.id}/`} tabIndex={-1}>{p.name}</a>
                    {' '}판매가 {원(p.price)}{상태글(p.status) ? ` · ${상태글(p.status)}` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
      {사업자.length > 0 && <footer><p>{몰이름}</p><p>{사업자.join(' · ')}</p></footer>}
    </div>
  );
}
