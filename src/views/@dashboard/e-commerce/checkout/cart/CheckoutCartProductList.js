import PropTypes from 'prop-types';
// @mui
import { Table, TableBody, TableContainer } from '@mui/material';
// components
import Scrollbar from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
//
import CheckoutCartProduct from './CheckoutCartProduct';
import { calculatorPrice } from 'src/utils/shop-util';
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
              key={row.id}
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
