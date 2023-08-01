import PropTypes from 'prop-types';
// @mui
import { Table, TableBody, TableContainer } from '@mui/material';
// components
import Scrollbar from '../../../../../components/scrollbar';
import { TableHeadCustom } from '../../../../../components/table';
//
import CheckoutCartProduct from './CheckoutCartProduct';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'product', label: '상품' },
  { id: 'price', label: '가격' },
  { id: 'option', label: '옵션' },
  { id: 'quantity', label: '수량' },
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
            {products.map((row) => (
              <CheckoutCartProduct
                key={row.id}
                row={row}
                onDelete={() => onDelete(row.id)}
                onDecrease={() => onDecreaseQuantity(row.id)}
                onIncrease={() => onIncreaseQuantity(row.id)}
              />
            ))}
          </TableBody>
        </Table>
    </TableContainer>
  );
}
