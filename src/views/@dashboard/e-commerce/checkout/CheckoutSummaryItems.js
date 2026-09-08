import PropTypes from 'prop-types';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { fCurrency } from 'src/utils/formatNumber';
import { getPriceUnitByLang } from 'src/utils/function';

// 주문 요약정보 안의 '무엇을 몇 개' 목록.
//
// [왜 — 가맹점 요청 2026-09-09 「주문 요약정보에 총액만 넣지 말고 옵션도 정리할 것」
//       (mbc01예시.pptx 「옵션내용에 대한 내역 보여줬으면 좋겠음」 과 같은 요구)]
// 요약 상자에는 금액 네 줄뿐이라, 휴대폰에서 결제 직전에 보는 것이 '얼마' 뿐이고 '무엇을' 이 없었다.
// 상품명·옵션·수량·줄 금액을 금액 줄 위에 둔다. 사이드바 요약과 결제수단 패널이 같이 쓴다.
//
// ⚠ 글과 금액을 여기서 만들지 않는다. 호출부가 orderLineOptionTexts(표의 옵션 칸과 같은 글)와
//   calcOrderTotals(줄 상품가)로 만든 것을 그대로 받는다 — 표·요약·청구가 서로 다른 값을 보이면 안 된다.

CheckoutSummaryItems.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    name: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
    count: PropTypes.number,
    amount: PropTypes.number,   // 줄 상품가(배송비 제외, 수량 곱한 값)
  })),
};

export default function CheckoutSummaryItems({ items = [] }) {
  if (!items.length) return null;
  const 단위 = getPriceUnitByLang();
  return (
    <>
      <Stack spacing={1.25}>
        {items.map((it, i) => (
          <Stack key={it.key ?? i} direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
            <Box sx={{ minWidth: 0 }}>
              {/* 이름은 두 줄까지만. 자르지 않으면 긴 상품명이 요약 상자를 세로로 길게 늘인다 */}
              <Typography variant="body2" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {it.name}
              </Typography>
              {(it.options ?? []).map((text, j) => (
                <Typography key={j} variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{text}</Typography>
              ))}
            </Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>{fCurrency(Number(it.amount) || 0) || '0'}{단위}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>× {Number(it.count) || 1}</Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
      <Divider />
    </>
  );
}
