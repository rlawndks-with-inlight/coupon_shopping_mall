import {
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import ManagerLayout from 'src/layouts/manager/ManagerLayout'
import ManagerTable from 'src/views/manager/mui/table/ManagerTable'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/router'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useModal } from 'src/components/dialog/ModalProvider'
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext'
import { apiManager, apiUtil } from 'src/utils/api'
import { Col, Row, themeObj } from 'src/components/elements/styled-components'
import toast from 'react-hot-toast'
import axios from 'axios'
const BrandList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext()
  const [settingConfirmObj, setSettingConfirmObj] = useState({
    letsencrypt_files: [],
    nginx_files: [],
  })
  const defaultColumns = [
    {
      id: 'name',
      label: '쇼핑몰명',
      action: row => {
        return row['name'] ?? '---'
      }
    },
    {
      id: 'dns',
      label: 'DNS',
      action: row => {
        return (
          <div
            style={{ cursor: 'pointer', color: 'blue' }}
            onClick={() => {
              window.open('https://' + row['dns'] ?? '---')
            }}
          >
            {row['dns'] ?? '---'}
          </div>
        )
      }
    },
    {
      id: 'logo_img',
      label: 'LOGO',
      action: row => {
        return <LazyLoadImage src={row['logo_img']} style={{ height: '56px' }} />
      }
    },
    {
      id: 'favicon_img',
      label: 'FAVICON',
      action: row => {
        return <LazyLoadImage src={row['favicon_img']} style={{ height: '56px' }} />
      }
    },
    {
      id: 'company_name',
      label: '법인상호',
      action: row => {
        return row['company_name'] ?? '---'
      }
    },
    {
      id: 'ceo_name',
      label: '대표자명',
      action: row => {
        return row['ceo_name'] ?? '---'
      }
    },
    {
      id: 'business_num',
      label: '사업자번호',
      action: row => {
        return row['business_num'] ?? '---'
      }
    },
    {
      id: 'created_at',
      label: '생성시간',
      action: row => {
        return row['created_at'] ?? '---'
      }
    },
    {
      id: 'updated_at',
      label: '최종수정시간',
      action: row => {
        return row['updated_at'] ?? '---'
      }
    },
    ...(user?.level >= 50
      ? [
        {
          id: 'cody_brand',
          label: `브랜드카피`,
          action: row => {
            return (
              <>
                <IconButton>
                  <Icon
                    icon='bi:copy'
                    onClick={() => {
                      setCopyObj({
                        sender_brand_id: row?.id,
                        sender_brand: row
                      })
                      setCopyOpen(true)
                    }}
                  />
                </IconButton>
              </>
            )
          }
        }
      ]
      : []),
    ...(user?.level >= 50
      ? [
        {
          id: 'setting_ssl',
          label: `리눅스 세팅`,
          action: (row) => {
            return (
              <>
                <IconButton
                  disabled={row?.is_linux_setting_confirm == 1 || process.env.NODE_ENV == 'development'}
                >
                  <Icon
                    icon='uil:setting'
                    onClick={() => {
                      setModal({
                        func: () => {
                          settingSslBrand(row)
                        },
                        icon: 'uil:setting',
                        title: '리눅스 세팅 하시겠습니까?'
                      })
                    }}
                  />
                </IconButton >
              </>
            )
          }
        }
      ]
      : []),
    ...(user?.level >= 50
      ? [
        {
          id: 'sitemap',
          label: `사이트맵 링크이동`,
          action: (row) => {
            return (
              <>
                <IconButton
                >
                  <Icon
                    icon='cil:sitemap'
                    onClick={() => {
                      window.open(`https://${row?.dns}/sitemap-${row?.id}.xml`)
                    }}
                  />
                </IconButton >
              </>
            )
          }
        }
      ]
      : []),
    ...(user?.level >= 50
      ? [
        {
          id: 'main_edit',
          label: `메인페이지 수정`,
          action: row => {
            return (
              <>
                <IconButton>
                  <Icon
                    icon='material-symbols:edit-outline'
                    onClick={() => {
                      router.push(`/manager/designs/main/${row?.id}`)
                    }}
                  />
                </IconButton>
              </>
            )
          }
        }
      ]
      : []),
    {
      id: 'edit',
      label: `수정${user?.level >= 50 ? '/삭제' : ''}`,
      action: row => {
        return (
          <>
            <IconButton>
              <Icon
                icon='material-symbols:edit-outline'
                onClick={() => {
                  router.push(`default/${row?.id}`)
                }}
              />
            </IconButton>
            {user?.level >= 50 && (
              <>
                <IconButton
                  onClick={() => {
                    setModal({
                      func: () => {
                        deleteBrand(row?.id)
                      },
                      icon: 'material-symbols:delete-outline',
                      title: '정말 삭제하시겠습니까?'
                    })
                  }}
                >
                  <Icon icon='material-symbols:delete-outline' />
                </IconButton>
              </>
            )}
          </>
        )
      }
    }
  ]
  const router = useRouter()
  const [columns, setColumns] = useState([])
  const [data, setData] = useState({})
  const [copyLoading, setCopyLoading] = useState(false)

  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
    s_dt: '',
    e_dt: '',
    search: '',
    category_id: null
  })
  useEffect(() => {
    pageSetting()
  }, [])
  const pageSetting = () => {
    let cols = defaultColumns
    setColumns(cols)
    onChangePage({ ...searchObj, page: 1 })
  }
  const onChangePage = async (obj) => {
    setSearchObj(obj)
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('brands', 'list', obj)

    if (data_) {
      setData(data_)
    }
  }
  const deleteBrand = async id => {
    let result = await apiManager('brands', 'delete', { id: id })
    if (result) {
      onChangePage(searchObj)
    }
  }
  const [copyOpen, setCopyOpen] = useState(false)
  const [copyObj, setCopyObj] = useState({
    sender_brand_id: 0, //카피할 브랜드
    dns: '', //카피한 데이터를 받을 도메인
    is_copy_brand_setting: 0,
    is_copy_product: 0,
    is_copy_post: 0
  })
  const onCopyBrand = async () => {
    setCopyLoading(true)
    let result = await apiUtil('copy', 'update', copyObj)
    if (result) {
      toast.success('성공적으로 저장 되었습니다.')
      window.location.reload()
    }
  }
  const settingSslBrand = async (item) => {
    try {
      const { data: response } = await axios.post(`${process.env.SETTING_SITEMAP_URL}/api/setting-linux`, {
        brand_id: item?.id,
      })
      toast.success("성공적으로 세팅 되었습니다.")
      window.location.reload();
    } catch (err) {
      console.log(err)
      toast.error(err?.message);
    }
  }
  return (
    <>
      <Dialog
        open={copyLoading}
        onClose={() => {
          setCopyLoading(false)
        }}
        PaperProps={{
          style: {
            background: 'transparent',
            overflow: 'hidden'
          }
        }}
      >
        <CircularProgress />
      </Dialog>
      <Dialog
        open={copyOpen}
        onClose={() => {
          setCopyOpen(false)
          setCopyObj({})
        }}
      >
        <DialogTitle>{`${copyObj?.sender_brand?.name} 브랜드 카피 (${copyObj?.sender_brand?.dns})`}</DialogTitle>

        <DialogContent>
          <DialogContentText>카피한 데이터를 받을 브랜드 도메인을 입력해 주세요.</DialogContentText>
          <TextField
            autoFocus
            fullWidth
            value={copyObj.dns}
            margin='dense'
            label='도메인'
            onChange={e => {
              setCopyObj({
                ...copyObj,
                dns: e.target.value
              })
            }}
          />
          <Col>
            <FormControlLabel
              label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>도메인기본세팅 카피</Typography>}
              control={
                <Checkbox
                  checked={copyObj.is_copy_brand_setting == 1}
                  onChange={e => {
                    if (e.target.checked) {
                      setCopyObj({
                        ...copyObj,
                        is_copy_brand_setting: 1
                      })
                    } else {
                      setCopyObj({
                        ...copyObj,
                        is_copy_brand_setting: 0
                      })
                    }
                  }}
                />
              }
            />
            <FormControlLabel
              label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>상품정보 카피</Typography>}
              control={
                <Checkbox
                  checked={copyObj.is_copy_product == 1}
                  onChange={e => {
                    if (e.target.checked) {
                      setCopyObj({
                        ...copyObj,
                        is_copy_product: 1
                      })
                    } else {
                      setCopyObj({
                        ...copyObj,
                        is_copy_product: 0
                      })
                    }
                  }}
                />
              }
            />
            <FormControlLabel
              label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>게시글 카피</Typography>}
              control={
                <Checkbox
                  checked={copyObj.is_copy_post == 1}
                  onChange={e => {
                    if (e.target.checked) {
                      setCopyObj({
                        ...copyObj,
                        is_copy_post: 1
                      })
                    } else {
                      setCopyObj({
                        ...copyObj,
                        is_copy_post: 0
                      })
                    }
                  }}
                />
              }
            />
          </Col>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            onClick={() => {
              setModal({
                func: () => {
                  onCopyBrand()
                },
                icon: 'material-symbols:edit-outline',
                title: '저장 하시겠습니까?'
              })
            }}
          >
            저장
          </Button>
          <Button
            color='inherit'
            onClick={() => {
              setCopyOpen(false)
              setCopyObj({})
            }}
          >
            취소
          </Button>
        </DialogActions>
      </Dialog>
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
BrandList.getLayout = page => <ManagerLayout>{page}</ManagerLayout>
export default BrandList
