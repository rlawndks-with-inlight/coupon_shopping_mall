import { Card, Container, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { deleteBrandByManager, getBrandsByManager, getProductsByManager } from "src/utils/api-manager";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useModal } from "src/components/dialog/ModalProvider";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
const BrandList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const defaultColumns = [
    {
      id: 'name',
      label: '쇼핑몰명',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'dns',
      label: 'DNS',
      action: (row) => {
        return row['dns'] ?? "---"
      }
    },
    {
      id: 'logo_img',
      label: 'LOGO',
      action: (row) => {
        return <LazyLoadImage src={row['logo_img']} style={{ height: '56px' }} />
      }
    },
    {
      id: 'favicon_img',
      label: 'FAVICON',
      action: (row) => {
        return <LazyLoadImage src={row['favicon_img']} style={{ height: '56px' }} />
      }
    },
    {
      id: 'company_name',
      label: '법인상호',
      action: (row) => {
        return row['company_name'] ?? "---"
      }
    },
    {
      id: 'ceo_name',
      label: '대표자명',
      action: (row) => {
        return row['ceo_name'] ?? "---"
      }
    },
    {
      id: 'business_num',
      label: '사업자번호',
      action: (row) => {
        return row['business_num'] ?? "---"
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
                router.push(`default/${row?.id}`)
              }} />
            </IconButton>
            <IconButton onClick={() => {
              setModal({
                func: () => { deleteBrand(row?.id) },
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
    setData({
      ...data,
      content: undefined
    })
    let data_ = await getBrandsByManager(obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
  }
  const deleteBrand = async (id) => {
    let result = await deleteBrandByManager({ id: id });
    if (result) {
      onChangePage(searchObj);
    }
  }
  console.log(user)
  return (
    <>
      <Stack spacing={3}>
        <Card>
          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={user?.level >= 50 ? '브랜드 추가' : ''}
            add_link={'/manager/settings/default/add'}
          />
        </Card>
      </Stack>
    </>
  )
}
BrandList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default BrandList
