import { Card, Container, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Row } from "src/components/elements/styled-components";
import { getProductsByManager } from "src/utils/api-manager";
const test_data = [
  {
    id: 1,
    user_name: 'test1',
    phone_num: '01000000000',
  },
  {
    id: 2,
    user_name: 'test2',
    phone_num: '01000000000',
  }
]
const PopupList = () => {
  const defaultColumns = [
    {
      id: 'id',
      label: 'No.',
      action: (row) => {
        return row['id']
      }
    },
    {
      id: 'product_img',
      label: '상품이미지',
      action: (row) => {
        return row['product_img'] ?? "---"
      }
    },
    {
      id: 'product_name',
      label: '상품명',
      action: (row) => {
        return row['user_name'] ?? "---"
      }
    },
    {
      id: 'category',
      label: '카테고리',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'product_price',
      label: '시장가',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'product_sale_price',
      label: '판매가',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'inventory',
      label: '재고',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'status',
      label: '상태',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'created_at',
      label: '생성시간',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'updated_at',
      label: '최종수정시간',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'edit',
      label: '수정/삭제',
      action: (row) => {
        return (
          <>
            <IconButton>
              <Icon icon='material-symbols:edit-outline' onClick={() => {
                router.push(`edit/${row?.id}`)
              }} />
            </IconButton>
            <IconButton>
              <Icon icon='material-symbols:delete-outline' />
            </IconButton>
          </>
        )
      }
    },
  ]
  const router = useRouter();
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
    s_dt: '',
    e_dt: '',
    search: '',
    category_id: null
  })
  useEffect(() => {
    pageSetting();
  }, [])
  const pageSetting = () => {
    let cols = defaultColumns;
    setColumns(cols)
    onChangePage(searchObj);
  }
  const onChangePage = async (obj) => {
    let data_ = await getProductsByManager(obj);
    if(data_){
      setData(data_);
    }
    setSearchObj(obj);
  }
  return (
    <>
      <Stack spacing={3}>
        <Card>
          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={'상품 추가'}
          />
        </Card>
      </Stack>
    </>
  )
}
PopupList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default PopupList

