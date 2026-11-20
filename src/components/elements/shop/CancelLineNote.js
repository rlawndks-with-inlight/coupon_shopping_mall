import { useLocales } from 'src/locales';
import { commarNumber, commarNumberWithUnit } from 'src/utils/function';

// 손님 주문내역의 상품 줄 옆에 붙이는 취소 표시(2026-11-20) — 「1개 취소됨」, 「취소요청 1개」.
//
// 부분취소를 해도 주문 줄 수량은 그대로라, 손님 화면은 처음 주문한 수량만 보여 줬다.
// 일부만 취소된 손님은 무엇이 취소됐는지 알 수 없었다. 프레임마다 주문내역 화면이 따로 있어 표시는 여기 한 곳에 둔다.
//
// line: 주문 줄(cancel_count·requested_count — 서버 부분취소정보붙이기가 싣는다)
// cancelled: 주문 전체가 취소됐는지(그때는 줄 표시가 필요 없다 — 주문 상태가 「취소완료」다)
const CancelLineNote = ({ line, cancelled = false, style }) => {
  const { translate } = useLocales();
  if (cancelled) return null;
  const 취소 = Number(line?.cancel_count) || 0;
  const 요청 = Number(line?.requested_count) || 0;
  if (!취소 && !요청) return null;
  return (
    <span style={{ color: '#c23b3b', fontWeight: 600, fontSize: '0.92em', ...style }}>
      {취소 > 0 && ` (${translate('{{n}}개 취소됨', { n: 취소 })})`}
      {요청 > 0 && ` (${translate('취소요청 {{n}}개', { n: 요청 })})`}
    </span>
  );
};

export default CancelLineNote;

// 결제금액 아래 「환불 33,000원 · 남은 결제금액 72,000원」(2026-11-20). 일부만 취소된 주문에만.
//   partial_refund 는 돌려준 현금(서버 부분취소정보붙이기), partial_refund_point 는 포인트로 돌려준 몫.
export const PartialRefundNote = ({ row, style }) => {
  const { translate, currentLang } = useLocales();
  if (Number(row?.is_cancel) === 1 || Number(row?.is_cancel_trans) === 1) return null;
  const 환불 = Number(row?.partial_refund) || 0;
  if (!(환불 > 0)) return null;
  const 포인트 = Number(row?.partial_refund_point) || 0;
  const 남은 = Math.max(0, (Number(row?.amount) || 0) - 환불);
  return (
    <div style={{ fontSize: '0.85em', lineHeight: 1.5, ...style }}>
      <span style={{ color: '#c23b3b' }}>{translate('환불')} {commarNumberWithUnit(환불, currentLang?.value)}{포인트 > 0 ? ` + ${commarNumber(포인트)}P` : ''}</span>
      {' · '}
      <span style={{ fontWeight: 700 }}>{translate('남은 결제금액')} {commarNumberWithUnit(남은, currentLang?.value)}</span>
    </div>
  );
};
