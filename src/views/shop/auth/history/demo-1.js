import { Title } from 'src/components/elements/styled-components';
import styled from 'styled-components'
import PropTypes from 'prop-types';
// @mui
import { Box, Card, Pagination, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
// components
import { TableHeadCustom } from 'src/components/table';
//
import { CheckoutCartProduct } from 'src/views/@dashboard/e-commerce/checkout';
import { useEffect, useState } from 'react';
import { test_items } from 'src/data/test-data';
import Image from 'src/components/image/Image';
import { fCurrency } from 'src/utils/formatNumber';
const Wrappers = styled.div`
max-width:1200px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`
const TABLE_HEAD = [
  { id: 'product', label: '상품' },
  { id: 'price', label: '가격' },
  { id: 'quantity', label: '수량' },
  { id: 'totalPrice', label: '총액' },
  { id: 'date', label: '날짜', align: 'right' },
  { id: '' },
];
const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const [historyList, setHistoryList] = useState([]);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(10);
  useEffect(() => {
    setHistoryList(test_items)
  }, [])

  const onChangePage = (num) =>{
    setPage(num)
  }
  return (
    <>
      <Wrappers>
        <Title>주문조회</Title>
        <Card sx={{ marginBottom: '2rem' }}>
          <TableContainer>
            <Table sx={{ minWidth: 720, overflowX: 'auto' }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />
              <TableBody>
                {historyList.map((row) => (
                  <>
                    <TableRow>
                      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                        <Image
                          alt="product image"
                          src={row.product_img}
                          sx={{ width: 64, height: 64, borderRadius: 1.5, mr: 2 }}
                        />
                        <Typography noWrap variant="subtitle2" sx={{ maxWidth: 240 }}>
                          {row.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {row.product_price > row.product_sale_price && (
                          <Box
                            component="span"
                            sx={{ color: 'text.disabled', textDecoration: 'line-through', mr: 0.5 }}
                          >
                            {fCurrency(row.product_price)}
                          </Box>
                        )}
                        {fCurrency(row.product_sale_price)}원
                      </TableCell>
                      <TableCell>
                        {16}개
                      </TableCell>
                      <TableCell>
                        {fCurrency(row.product_sale_price * 16)}원
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ textAlign: 'right', color: 'text.secondary', }}
                        >
                          2023-07-10 17:36:10
                        </Box>
                      </TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        <Pagination
          sx={{ margin: 'auto' }}
          size={window.innerWidth > 700 ? 'medium' : 'small'}
          count={maxPage}
          page={page}
          variant='outlined' shape='rounded'
          color='primary'
          onChange={(_, num) => {
            onChangePage(num)
          }} />
      </Wrappers>
    </>
  )
}
export default Demo1
