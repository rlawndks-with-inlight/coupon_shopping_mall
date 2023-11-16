import { Card, Container, Divider, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useModal } from "src/components/dialog/ModalProvider";
import { apiManager } from "src/utils/api";
import { commarNumber } from "src/utils/function";
import { productSortTypeList } from "src/utils/format";

const ProductCategoryGroupList = () => {
  const { setModal } = useModal()
  const defaultColumns = [
    {
      id: 'category_group_name',
      label: '카테고리그룹명',
      action: (row) => {
        return row['category_group_name'] ?? "---"
      }
    },
    {
      id: 'max_depth',
      label: '최대깊이',
      action: (row) => {
        return row['max_depth'] == -1 ? '무한' : commarNumber(row['max_depth'] ?? 0)
      }
    },
    {
      id: 'status',
      label: '상태',
      action: (row) => {
        return row['status'] ?? "---"
      }
    },
    {
      id: 'sort_type',
      label: '정렬타입',
      action: (row) => {
        return productSortTypeList[row['sort_type'] ?? 0].label
      }
    },
    {
      id: 'created_at',
      label: '생성시간',
      action: (row) => {
        return row['created_at'] ?? "---"
      }
    },
    {
      id: 'updated_at',
      label: '최종수정시간',
      action: (row) => {
        return row['updated_at'] ?? "---"
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
                router.push(`/manager/products/category-groups/edit/${row?.id}`)
              }} />
            </IconButton>
            <IconButton onClick={() => {
              setModal({
                func: () => { deleteProductCategoryGroup(row?.id) },
                icon: 'material-symbols:delete-outline',
                title: '정말 삭제하시겠습니까?'
              })
            }}>
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
  })
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    pageSetting();
  }, [])
  const pageSetting = async () => {
    let cols = defaultColumns;
    setColumns(cols)
    onChangePage({ ...searchObj, page: 1, });
  }
  const onChangePage = async (obj) => {
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('product-category-groups', 'list', obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
  }
  const deleteProductCategoryGroup = async (id) => {
    let result = await apiManager('product-category-groups', 'delete', { id });
    if (result) {
      onChangePage(searchObj);
    }
  }

  return (
    <>
      <Stack spacing={3}>
        <Card>
          <ManagerTable
            data={data}
            setData={setData}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={'상품카테고리 그룹 추가'}
            want_move_card={true}
            table={'product_category_groups'}
          />
        </Card>
      </Stack>
    </>
  )
}
ProductCategoryGroupList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ProductCategoryGroupList
