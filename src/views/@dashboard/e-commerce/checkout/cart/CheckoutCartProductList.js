import PropTypes from 'prop-types';
// @mui
import { Table, TableBody, TableContainer } from '@mui/material';
// components
import Scrollbar from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
//
import CheckoutCartProduct from './CheckoutCartProduct';
import { calculatorPrice, cartLineSignature } from 'src/utils/shop-util';
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
  const { translate } = useLocales();
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
  return (
    <TableContainer>
      <Table sx={{ minWidth: 720, overflowX: 'auto' }}>
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
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
