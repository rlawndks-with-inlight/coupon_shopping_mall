import { Card, Container, Divider, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useModal } from "src/components/dialog/ModalProvider";
import { apiManager } from "src/utils/api";
import { commarNumber } from "src/utils/function";
import { productPropertyCanSelectMultipleList } from "src/utils/format";
import { useSettingsContext } from "src/components/settings";

const ProductPropertyGroupList = () => {
  const { setModal } = useModal()
  const { settingPlatform } = useSettingsContext();
  const defaultColumns = [
    {
      id: 'property_group_name',
      label: '특성그룹명',
      action: (row) => {
        return row['property_group_name'] ?? "---"
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
      id: 'is_can_select_multiple',
      label: '다중선택가능여부',
      action: (row) => {
        return productPropertyCanSelectMultipleList[row['is_can_select_multiple'] ?? 0].label
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
                router.push(`/manager/products/property-groups/edit/${row?.id}`)
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


  useEffect(() => {
    pageSetting();
  }, [])
  const pageSetting = async () => {
    let cols = defaultColumns;
    setColumns(cols)
    onChangePage({ ...searchObj, page: 1, });
  }
  const onChangePage = async (obj) => {
    setSearchObj(obj);
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('product-property-groups', 'list', obj);
    if (data_) {
      setData(data_);
    }
  }
  const deleteProductCategoryGroup = async (id) => {
    let result = await apiManager('product-property-groups', 'delete', { id });
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
            add_button_text={'상품특성 그룹 추가'}
            want_move_card={true}
            table={'product_property_groups'}
          />
        </Card>
      </Stack>
    </>
  )
}
ProductPropertyGroupList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ProductPropertyGroupList
