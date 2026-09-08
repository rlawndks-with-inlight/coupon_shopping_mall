import { commarNumberWithUnit } from 'src/utils/function';
import PropTypes from 'prop-types';
import { useState } from 'react';
import DialogProductPeek from 'src/components/dialog/DialogProductPeek';
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
// 표가 들어갈 만큼 넓을 때만 표로 보여준다.
//
// [왜 폭을 재나 — 2026-09-08]
// 600px 이라는 화면 폭으로 가르고 있었는데, 실제로 재 보니 **휴대폰만 빼고 전부 잘려 있었다.**
//     화면  600px  표 930 / 본문 552   총액 안 보임
//     화면  900px  표 930 / 본문 544   총액 안 보임   (여기서부터 오른쪽에 요약이 붙어 본문이 더 좁다)
//     화면 1200px  표 930 / 본문 712   총액 안 보임
//     화면 1440px  표 930 / 본문 712   총액 안 보임   (페이지 폭이 1200 으로 묶여 더 안 넓어진다)
// 기준이 화면 폭이 아니라 **그 칸이 표를 담을 만큼 넓은가** 이기 때문이다.
// 그래서 컨테이너 폭으로 가른다 — 요약이 옆에 붙든, 창을 반으로 쪼개든 알아서 맞는다.
//
// ⚠ 컨테이너 질의를 모르는 옛 브라우저는 **카드로 남는다**(아래 max-width 미디어 규칙).
//   안전한 쪽으로 떨어지는 것이다 — 카드는 좁아도 값이 다 보이고, 표는 잘린다.
const 들어가는폭 = 700;

const 카드배치 = {
    minWidth: 0,
    display: 'block',
    // 카드도 카드 제목(CardHeader 24px)과 같은 선에서 시작한다
    boxSizing: 'border-box',
    px: 3,
    '& thead': { display: 'none' },
    '& tbody': { display: 'block' },
    // 표에서 바깥 칸에 준 24px 여백은 카드에선 필요 없다(카드 자체가 안쪽 여백을 가진다)
    '& td:first-of-type': { pl: 0 },
    '& td:last-of-type': { pr: 0 },
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
      // ⚠ MUI 는 align="right" 칸에 flex-direction: row-reverse 를 건다(.MuiTableCell-alignRight).
      //   그대로 두면 카드에서 라벨이 값 **뒤로** 밀려 '37,000원 총액' 처럼 거꾸로 읽힌다.
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    '& td[data-label]:before': {
      content: 'attr(data-label)',
      flex: '0 0 64px',
      fontSize: 12.5,
      lineHeight: 1.9,
      color: 'text.secondary',
    },
    '& td[data-total]': { fontWeight: 700 },
};

const 모바일카드 = {
  // 휴대폰 — 컨테이너 질의를 모르는 브라우저에서도 이 규칙은 먹는다.
  [`@media (max-width:599.95px)`]: 카드배치,
  // 그 위 구간 — 본문이 표를 담기엔 좁을 때(태블릿·작은 노트북·요약이 옆에 붙은 화면).
  [`@container (max-width:${들어가는폭 - 1}px)`]: 카드배치,
};

export default function CheckoutCartProductList({
  products,
  onDelete,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onChangeQuantity,
  // 표 아래 '배송비는 주문당 1회…' 안내. 주문서는 이 안내를 금액 요약의 배송비 줄 곁으로 옮기므로 끈다 —
  // 표와 요약 사이에 홀로 떠 있으면 어디에 붙은 말인지 애매하다(가맹점 지적 2026-09-09). 카트는 그대로 둔다.
  showShippingNote = true,
}) {
  const { translate, currentLang } = useLocales();
  const { themeDnsData } = useSettingsContext();
  // 배송비 칸과 삭제 칸을 뺐다(2026-09-08). 왜인지는 아래 '들어가는폭' 주석 참고.
  const TABLE_HEAD = [
    { id: 'product', label: translate('상품') },
    { id: 'option', label: translate('옵션') },
    { id: 'price', label: translate('가격') },
    ...(themeDnsData?.id != 74 ? [
      { id: 'count', label: translate('수량') },
    ] : []),
    { id: 'totalPrice', label: translate('총액'), align: 'right' },
  ];
  // 배송비는 주문 단위로 정해진다(정책이 켜진 몰). 합계와 같은 함수로 계산해야
  // 표의 줄과 아래 요약이 어긋나지 않는다.
  const totals = calcOrderTotals(products);
  const 정책 = 배송정책();
  // 줄의 사진·이름을 누르면 여는 「상품 정보」 창. 주문서·장바구니가 같은 목록을 쓰므로 둘 다 같은 창이다.
  const [peek, setPeek] = useState(null);
  return (
    <>
    <DialogProductPeek open={!!peek} row={peek} onClose={() => setPeek(null)} />
    <TableContainer sx={{ containerType: 'inline-size' }}>
      {/* 720px 을 강제하면 노트북 창을 조금만 줄여도 가로 스크롤이 생긴다.
          칸이 여섯 개뿐이라 그만큼 필요하지 않다 — 글은 줄바꿈으로 접는다.
          (긴 상품명이 표를 늘리지 않도록 상품 칸에 keep-all 을 건다) */}
      <Table sx={{
        minWidth: 560,
        overflowX: 'auto',
        // 칸 좌우 여백 16 → 8. 칸을 둘 줄이고도 66px 이 모자랐다(실측) —
        // 여백까지 줄여야 본문 폭 안에 들어간다. 글이 붙어 보일 만큼 좁지는 않다.
        '& td, & th': { wordBreak: 'keep-all', overflowWrap: 'break-word', px: 1 },
        // 바깥 칸만 24px — 카드 제목(CardHeader)·아래 금액 요약과 같은 선에 맞춘다.
        // 예전엔 '상품' 이 8px, 제목이 24px 에서 시작해 제목만 안쪽으로 밀려 보였다(가맹점 지적 2026-09-09).
        '& td:first-of-type, & th:first-of-type': { pl: 3 },
        '& td:last-of-type, & th:last-of-type': { pr: 3 },
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
              onPeek={() => setPeek(row)}
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
      {showShippingNote && totals.shipActive && (
        <Box sx={{ px: 3, py: 1.25, fontSize: 12.5, color: 'text.secondary' }}>
          {translate('배송비는 주문당 1회 부과됩니다.')}
          {정책.freeMin > 0 && ` ${translate('{{amount}} 이상 무료배송', { amount: commarNumberWithUnit(정책.freeMin, currentLang?.value) })}`}
        </Box>
      )}
    </TableContainer>
    </>
  );
}
