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
        '& td, & th': { wordBreak: 'keep-all', overflowWrap: 'anywhere' },
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
