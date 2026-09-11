import PropTypes from 'prop-types';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { fCurrency } from 'src/utils/formatNumber';
import { getPriceUnitByLang } from 'src/utils/function';
import { useLocales } from 'src/locales';

// 주문 상품 목록 **바로 아래** 와 고른 결제수단 아래 패널에 붙는 금액 요약.
//
// [왜 — 가맹점 요청 2026-09-08 「주문내역 하단에 최종결제금액 안내」]
// 주문서의 금액 요약(CheckoutSummary)은 PC 에선 오른쪽 사이드바, 휴대폰에선 결제수단 목록
// **아래** 에 있다. 휴대폰에서는 상품 목록을 보고 나서 주문자·배송지·약관·결제수단 7개를
// 다 지나야 얼마를 내는지 나온다. 타 쇼핑몰(예시로 준 화면)은 상품 목록 끝에
// 「총 상품금액 / 할인 / 배송비 / 결제 예정금액」 을 붙인다.
//
// [상품 목록은 넣지 않는다 — 2026-09-11 사장님 결정(안 A)]
// 한때 요약에 상품명·옵션 목록을 넣었는데 상품 카드와 같은 줄이 한 페이지에 세 번 나와 어색했다.
// 목록은 상품 카드 한 곳에만 두고, 여기서는 옵션을 「옵션·추가상품」 금액 한 줄로만 보여 준다
// (아마존·가맹점이 준 타 쇼핑몰 예시와 같은 구조).
//
// ⚠ 여기서 금액을 **계산하지 않는다**. 호출부가 orderAmountBreakdown · calcOrderTotals 로 만든 값을 그대로 받는다.
//   따로 계산하면 사이드바 요약·실제 청구와 언젠가 어긋난다(예전 CheckoutSummary 가 그랬다).
//   포인트 입력란은 두지 않는다 — 입력은 사이드바 한 곳에서만 받고, 여기는 그 결과만 비춘다.

CheckoutTotalsBrief.propTypes = {
  goods: PropTypes.number,      // 상품금액: 본상품 정가 × 수량(할인 전, 옵션 제외)
  options: PropTypes.number,    // 옵션·추가상품: 옵션 가격 × 수량(음수 가능 — 변동가가 음수인 옵션)
  count: PropTypes.number,      // 본상품 개수
  discount: PropTypes.number,
  shipping: PropTypes.number,
  shipActive: PropTypes.bool,   // 브랜드 배송비 정책이 켜져 있는가(0원이면 '무료배송' 으로 읽는다)
  usedPoint: PropTypes.number,
  total: PropTypes.number,      // 실제 청구액(포인트 차감 후)
  dense: PropTypes.bool,        // 바깥 여백·윗줄 없이 — 이미 여백이 있는 상자(결제수단 패널) 안에 넣을 때
  shippingNote: PropTypes.string, // 배송비 줄 아래 한 줄 설명("주문당 1회 · 5만원 이상 무료") — 배송비 값 바로 곁에 둔다
};

const 줄 = ({ label, value, strong, note }) => (
  <Box>
    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
      <Typography variant={strong ? 'subtitle1' : 'body2'} sx={{ color: strong ? 'text.primary' : 'text.secondary' }}>{label}</Typography>
      <Typography variant={strong ? 'subtitle1' : 'subtitle2'} sx={{ color: strong ? 'error.main' : 'text.primary', fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
    </Stack>
    {note && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'right' }}>{note}</Typography>}
  </Box>
);

export default function CheckoutTotalsBrief({ goods = 0, options = 0, count = 0, discount = 0, shipping = 0, shipActive = false, usedPoint = 0, total = 0, dense = false, shippingNote = '' }) {
  const { translate } = useLocales();
  const 단위 = getPriceUnitByLang();
  const 돈 = (n) => `${fCurrency(Number(n) || 0) || '0'}${단위}`;
  // 옵션 금액은 부호를 붙인다 — 상품금액에 '더해지는' 값이라는 게 보여야 한다(음수 변동가도 있다)
  const 부호돈 = (n) => `${Number(n) < 0 ? '-' : '+'}${돈(Math.abs(Number(n) || 0))}`;
  return (
    // 좌우 24px — 카드 제목(CardHeader)·표의 바깥 칸과 같은 선에 맞춘다
    <Box sx={dense ? {} : { px: 3, pb: 3 }}>
      {!dense && <Divider sx={{ mb: 2 }} />}
      <Stack spacing={1}>
        <줄 label={translate('상품금액 · {{n}}개', { n: Number(count) || 0 })} value={돈(goods)} />
        {Number(options) !== 0 && <줄 label={translate('옵션·추가상품')} value={부호돈(options)} />}
        {Number(discount) > 0 && <줄 label={translate('할인')} value={돈(-discount)} />}
        {(shipActive || Number(shipping) > 0) && (
          <줄 label={translate('배송비')} value={Number(shipping) > 0 ? 돈(shipping) : translate('무료배송')} note={shippingNote} />
        )}
        {Number(usedPoint) > 0 && <줄 label={translate('사용할 포인트')} value={`-${fCurrency(usedPoint)}P`} />}
        <Divider sx={{ my: 0.5 }} />
        <줄 strong label={translate('총 결제금액')} value={돈(total)} />
      </Stack>
    </Box>
  );
}
