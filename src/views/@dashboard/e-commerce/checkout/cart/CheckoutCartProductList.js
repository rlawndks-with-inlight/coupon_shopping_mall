import PropTypes from 'prop-types';
// @mui
import { Table, TableBody, TableContainer } from '@mui/material';
// components
import Scrollbar from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
//
import CheckoutCartProduct from './CheckoutCartProduct';
import { calculatorPrice } from 'src/utils/shop-util';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'product', label: '상품' },
  { id: 'option', label: '옵션' },
  { id: 'delivery_fee', label: '배송비' },
  { id: 'price', label: '가격' },
  { id: 'count', label: '수량' },
  { id: 'totalPrice', label: '총액', align: 'right' },
  { id: '' },
];

export default function CheckoutCartProductList({
  products,
  onDelete,
  onIncreaseQuantity,
  onDecreaseQuantity,
}) {
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
                calculatorPrice={calculatorPrice}
              />
            ))}
          </TableBody>
        </Table>
    </TableContainer>
  );
}
