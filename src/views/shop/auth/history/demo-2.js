import { HistoryTable } from "src/components/elements/shop/common";
import Pagination from "src/theme/overrides/Pagination";
import { getPayHistoriesByUser } from "src/utils/api-shop";
import { makeMaxPage } from "src/utils/function";
import styled from "styled-components";

const Wrappers = styled.div`
max-width: 1600px;
display: flex;
flex-direction: column;
margin: 0 auto;
width: 90%;
min-height: 90vh;
margin-bottom: 10vh;
`

const TABLE_HEAD = [
  { id: 'product', label: '상품' },
  { id: 'amout', label: '총액' },
  { id: 'buyer_name', label: '구매자명' },
  { id: 'trx_status', label: '배송상태' },
  { id: 'date', label: '업데이트일', align: 'right' },
  { id: '', label: '' },
];
//주문내역 박이규

const Demo2 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const onChangePage = async (num) => {
    setPage(num);
    setHistoryContent({
      ...historyContent,
      content: undefined,
    })
    let data = await getPayHistoriesByUser({
      page: num
    })
    if (data) {
      setHistoryContent(data);
    }
  }
  return (
    <>
      <Wrappers>
        <Title>주문조회</Title>
        <Card sx={{ marginBottom: '2rem' }}>
          <HistoryTable historyContent={historyContent} headLabel={TABLE_HEAD} />
        </Card>
        <Pagination
          sx={{ margin: 'auto' }}
          size={window.innerWidth > 700 ? 'medium' : 'small'}
          count={makeMaxPage(historyContent?.total, historyContent?.page_size)}
          page={page}
          variant="outlined" shape='rounded'
          color='primary'
          onChange={(_, num) => {
            onChangePage(num)
          }} />
      </Wrappers>
    </>
  )
}
export default Demo2
