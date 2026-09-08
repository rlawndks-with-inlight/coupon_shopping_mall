import { commarNumberWithUnit } from 'src/utils/function';
import PropTypes from 'prop-types';
// @mui
import { Box, Table, TableBody, TableContainer } from '@mui/material';
// components
import Scrollbar from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
//
import CheckoutCartProduct from './CheckoutCartProduct';
import { calculatorPrice, cartLineSignature, calcOrderTotals, 배송정책 } from 'src/utils/shop-util';
import { useLocales } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------



// 휴대폰에서는 표를 버리고 줄마다 카드로 쌓는다.
//
// [왜 — 2026-09-08 가맹점 제보(mbc01예시.pptx): "옵션내용에 대한 내역 보여줬으면 좋겠음"]
// 이 표는 칸이 여섯 개(상품·옵션·배송비·가격·수량·총액)다. 휴대폰(폭 359px)에서 재 보니
// 표가 930px 로 벌어지고 **상품 칸 하나가 352px** 을 먹어 나머지가 전부 화면 밖으로 나갔다.
// 가로로 밀면 볼 수는 있었지만(overflow-x:auto) 밀 수 있다는 표시가 없어 아무도 밀지 않는다.
//   → 손님이 주문서에서 보는 것은 위쪽 '상품 이름' 하나와 아래쪽 '총 결제금액' 하나뿐이었다.
//     자기가 고른 옵션도, 거기 붙은 추가금도 주문서 어디에서도 확인할 수 없었다.
//
// ⚠ 값을 새로 그리지 않는다. 칸(td)은 그대로 두고 배치만 세로로 바꾼다 —
//   옵션명·추가금·개당금액·총액을 다시 계산하는 코드를 만들면 표와 카드가 언젠가 어긋난다.
//   각 칸의 data-label 을 :before 로 앞에 세워 '무엇의 값인지' 만 보탠다.
// ⚠ 라벨은 translate 를 거친 값이라 언어마다 다르다. 그래서 총액만 data-total 로 따로 잡는다
//   (라벨 글자로 고르면 영어·중국어 화면에서 굵게가 안 먹는다).
const 모바일카드 = {
  '@media (max-width:599.95px)': {
    minWidth: 0,
    display: 'block',
    '& thead': { display: 'none' },
    '& tbody': { display: 'block' },
    '& tr': {
      display: 'block',
      position: 'relative',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      p: 1.5,
      mb: 1.5,
    },
    '& td': {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1.5,
      border: 0,
      px: 0,
      py: 0.5,
      textAlign: 'left',
    },
    '& td[data-label]:before': {
      content: 'attr(data-label)',
      flex: '0 0 64px',
      fontSize: 12.5,
      lineHeight: 1.9,
      color: 'text.secondary',
    },
    '& td[data-total]': { fontWeight: 700 },
    // 삭제 버튼은 라벨이 없다 — 카드 오른쪽 위 모서리로 뺀다.
    '& td:last-of-type': { position: 'absolute', top: 4, right: 4, p: 0, display: 'block' },
  },
};

export default function CheckoutCartProductList({
  products,
  onDelete,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onChangeQuantity,
}) {
  const { translate, currentLang } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const TABLE_HEAD = [
    { id: 'product', label: translate('상품') },
    { id: 'option', label: translate('옵션') },
    { id: 'delivery_fee', label: translate('배송비') },
    { id: 'price', label: translate('가격') },
    ...(themeDnsData?.id != 74 ? [
      { id: 'count', label: translate('수량') },
    ] : []),
    { id: 'totalPrice', label: translate('총액'), align: 'right' },
    { id: '' },
  ];
  // 배송비는 주문 단위로 정해진다(정책이 켜진 몰). 합계와 같은 함수로 계산해야
  // 표의 줄과 아래 요약이 어긋나지 않는다.
  const totals = calcOrderTotals(products);
  const 정책 = 배송정책();
  return (
    <TableContainer>
      {/* 720px 을 강제하면 노트북 창을 조금만 줄여도 가로 스크롤이 생긴다.
          칸이 여섯 개뿐이라 그만큼 필요하지 않다 — 글은 줄바꿈으로 접는다.
          (긴 상품명이 표를 늘리지 않도록 상품 칸에 keep-all 을 건다) */}
      <Table sx={{
        minWidth: 560,
        overflowX: 'auto',
        '& td, & th': { wordBreak: 'keep-all', overflowWrap: 'break-word' },
        ...모바일카드,
      }}>
        <TableHeadCustom headLabel={TABLE_HEAD} />
        <TableBody>
          {products.map((row, idx) => (
            <CheckoutCartProduct
              // 같은 상품을 옵션만 다르게 담으면 row.id 가 겹쳐 React key 가 중복된다.
              // key 가 겹치면 수량 변경·삭제가 엉뚱한 줄에 먹는다. 옵션까지 포함한 시그니처를 쓴다.
              key={`${cartLineSignature(row)}#${idx}`}
              row={row}
              onDelete={() => onDelete(idx)}
              onDecrease={() => onDecreaseQuantity(idx)}
              onIncrease={() => onIncreaseQuantity(idx)}
              onChangeQuantity={(val) => onChangeQuantity(idx, val)}
              calculatorPrice={calculatorPrice}
              ship_active={totals.shipActive}
              line_delivery={totals.lineDeliveries?.[idx] ?? 0}
              is_first_line={idx === 0}
            />
          ))}
        </TableBody>
      </Table>
      {/* 줄마다 0원으로 보이던 배송비의 근거를 표 바로 아래에 적는다.
          '왜 상품엔 0원인데 합계엔 3,000원인가'가 가맹점·손님 양쪽의 물음이었다. */}
      {totals.shipActive && (
        <Box sx={{ px: 1, py: 1.25, fontSize: 12.5, color: 'text.secondary' }}>
          {translate('배송비는 주문당 1회 부과됩니다.')}
          {정책.freeMin > 0 && ` ${translate('{{amount}} 이상 무료배송', { amount: commarNumberWithUnit(정책.freeMin, currentLang?.value) })}`}
        </Box>
      )}
    </TableContainer>
  );
}
