import { apiManager } from 'src/utils/api';
import { commarNumber } from 'src/utils/function';

// 저장하면 셀러 공급가·판매가가 함께 바뀌는 경우(본사 판매가 변경, 셀러의 영업자·수수료 변경) 미리 알린다.
//
// 서버(seller-products/impact)가 저장과 **같은 계산**(utils.js/seller-price.js — 셀러 마진 유지)으로
// 바뀌는 건수와 예시를 돌려준다. 바뀌는 게 없으면 묻지 않고 바로 저장한다.
// 미리보기를 못 불러와도 저장은 막지 않는다 — 확인창은 안내일 뿐, 실제 반영은 서버가 한다.
const 줄 = (s) => `${s?.name ? `${s.name}: ` : ''}공급가 ${commarNumber(s?.from?.agent_price)}→${commarNumber(s?.to?.agent_price)}원 · 판매가 ${commarNumber(s?.from?.seller_price)}→${commarNumber(s?.to?.seller_price)}원`;

export const confirmSellerPriceImpact = async ({ params, setModal, onConfirm, 대상 = 'product' }) => {
  let r = null;
  try { r = await apiManager('seller-products/impact', 'list', params); } catch (e) { r = null; }
  if (!r || !(Number(r?.changed) > 0)) return onConfirm();
  const title = 대상 === 'product'
    ? `이 상품을 판매 중인 셀러 ${r.sellers}명의 가격이 함께 바뀝니다`
    : `이 셀러의 상품 ${commarNumber(r.changed)}개 가격이 함께 바뀝니다`;
  const content = [
    '셀러 공급가가 다시 계산되고, 셀러 판매가는 셀러 마진을 유지한 채 함께 움직입니다.',
    '',
    ...(r.samples ?? []).map(줄),
    ...(r.changed > (r.samples ?? []).length ? [`… 외 ${commarNumber(r.changed - (r.samples ?? []).length)}건`] : []),
    '',
    '계속 저장할까요?',
  ].join('\n');
  setModal({ icon: 'mdi:alert-outline', title, content, func: onConfirm });
};
