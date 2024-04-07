import { Button, Card, Container, Divider, IconButton, MenuItem, Select, Stack, Typography, FormControlLabel, Checkbox } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row, themeObj } from "src/components/elements/styled-components";
import { commarNumber, getAllIdsWithParents } from "src/utils/function";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { SelectCategoryComponent } from "./[edit_category]/[id]";
import $ from 'jquery';
import { useModal } from "src/components/dialog/ModalProvider";
import { useSettingsContext } from "src/components/settings";
import { apiManager, apiUtil } from "src/utils/api";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import _ from "lodash";

const ProductList = () => {

  const { user } = useAuthContext();
  const { setModal } = useModal()
  const { themeCategoryList, themeDnsData, themePropertyList } = useSettingsContext();
  const defaultColumns = [
    /*{
      id: 'id',
      label: 'No.',
      action: (row) => {
        return commarNumber(row['id'] ?? "---")
      }
    },*/
    {
      id: 'product_img',
      label: '상품이미지',
      action: (row) => {
        if (row['product_img']) {
          return <div 
          style={{ minWidth: '100px', cursor:'pointer' }}
          onClick={() => {
            router.push(`edit/${row?.product_code || row?.id}`)
          }}
          >
            <LazyLoadImage src={row['product_img'] ?? "---"} style={{ height: '84px', width: 'auto' }} />
          </div>
        } else {
          return "---";
        }
      }
    },
    {
      id: 'product_code',
      label: '상품코드',
      action: (row) => {
        return row['product_code'] ?? "---"
      }
    },
    {
      id: 'product_name',
      label: '상품명',
      action: (row) => {
        return <div 
        style={{textDecoration:'underline', cursor:'pointer'}}
        onClick={() => {
          router.push(`edit/${row?.product_code || row?.id}`)
        }}
        >
          {row['product_name']}
          </div> ?? "---"
      }
    },
    ...themeCategoryList.map((group, index) => {
      return {
        id: `category_group_${group?.id}`,
        label: `${group?.category_group_name}`,
        action: (row) => {
          return (
            <>
              {row[`category_root_${index}`] && row[`category_root_${index}`].length > 0 ?
                <>
                  <Row>
                    {row[`category_root_${index}`].map((item, idx) => (
                      <>
                        <div style={{ marginRight: '0.25rem' }}>
                          {item.category_name}
                        </div>
                        {idx != row[`category_root_${index}`].length - 1 &&
                          <>
                            <div style={{ marginRight: '0.25rem' }}>
                              {'>'}
                            </div>
                          </>}
                      </>
                    ))}
                  </Row>
                </>
                :
                <>
                  {'---'}
                </>}
            </>
          )
        }
      }
    }),
    {
      id: 'product_price',
      label: '정상가',
      sub_id: 'product_sale_price',
      sub_label: '판매가',
      action: (row) => {
        return (
          <>
            <div>
              {commarNumber(row['product_price'])}
            </div>
            <div style={{ marginTop: '1rem' }}>
              {commarNumber(row['product_sale_price'])}
            </div>
          </>)
      }
    },
    /*{
      id: 'product_sale_price',
      label: '상품 할인가',
      action: (row) => {
        return commarNumber(row['product_sale_price'])
      }
    },*/
    {
      id: 'user_name',
      label: '생성한유저 아이디',
      sub_id: 'seller_name',
      sub_label: '셀러명',
      action: (row) => {
        return (
          <>
            <div>
              {row['user_name'] ?? "---"}
            </div>
            <div style={{ marginTop: '1rem' }}>
              {row['seller_name'] ?? "---"}
            </div>
          </>
        )
      }
    },
    /*{
      id: 'seller_name',
      label: '생성한유저셀러명',
      action: (row) => {
        return row['seller_name'] ?? "---"
      }
    },*/
    ...(themeDnsData?.setting_obj?.is_use_consignment == 1 ? [
      /*{
        id: 'consignment',
        label: '위탁자정보',
        action: (row) => {
          return <Col>
            {row?.product_type == 0 &&
              <>
                ---
              </>}
            {row?.product_type == 1 &&
              <>
                <Typography variant="subtitle2">유저아이디</Typography>
                <Typography variant="body2">{row?.consignment_user_name}</Typography>
                <Typography variant="subtitle2">유저휴대폰번호</Typography>
                <Typography variant="body2">{row?.consignment_user_phone_num}</Typography>
              </>}
            {row?.product_type == 2 &&
              <>
                <Typography variant="subtitle2">비회원판매자명</Typography>
                <Typography variant="body2">{row?.consignment_none_user_name}</Typography>
                <Typography variant="subtitle2">비회원판매자연락처</Typography>
                <Typography variant="body2">{row?.consignment_none_user_phone_num}</Typography>
              </>}

          </Col>
        }
      },*/
    ] : []),
    {
      id: 'status',
      label: '상태',
      action: (row) => {
        if ( themeDnsData?.id != 5 ) {
          return <Select
          size="small"
          defaultValue={row?.status}
          onChange={(e) => {
            onChangeStatus(row?.id, e.target.value);
          }}
          sx={{ '@media screen and (max-width: 2500px)': { size: 'smaller' } }}
        >
          <MenuItem value={0}>{'판매중'}</MenuItem>
          <MenuItem value={1}>{'중단됨'}</MenuItem>
          <MenuItem value={2}>{'품절'}</MenuItem>
          <MenuItem value={3}>{'새상품'}</MenuItem>
        </Select>
        }
        else {
          return <Select
          size="small"
          defaultValue={row?.status}
          onChange={(e) => {
            onChangeStatus(row?.id, e.target.value);
          }}
          sx={{ '@media screen and (max-width: 2500px)': { size: 'smaller' } }}
        >
          <MenuItem value={0}>{'판매중'}</MenuItem>
          <MenuItem value={-1}>{'예약중'}</MenuItem>
          <MenuItem value={1}>{'거래진행중'}</MenuItem>
          <MenuItem value={2}>{'품절'}</MenuItem>
          <MenuItem value={3}>{'택배수거'}</MenuItem>
          <MenuItem value={4}>{'방문수거'}</MenuItem>
          <MenuItem value={5}>{'비공개'}</MenuItem>    
        </Select>
        }
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'order_count',
      label: '주문',
      sub_id: 'review_count',
      sub_label: '리뷰',
      action: (row) => {
        return (
          <>
            <div style={{ minWidth: '3rem' }}>
              {commarNumber(row['order_count'])} / {commarNumber(row['review_count'])}
            </div>
          </>
        )
      }
    },
    /*{
      id: 'review_count',
      label: '리뷰',
      action: (row) => {
        return commarNumber(row['review_count'])
      }
    },*/
    {
      id: 'created_at',
      label: '생성시간',
      sub_id: 'updated_at',
      sub_label: '최종수정시간',
      action: (row) => {
        return (
          <>
            <div>
              {row['created_at'] ?? "---"}
            </div>
            <div style={{ marginTop: '1rem' }}>
              {row['updated_at'] ?? "---"}
            </div>
          </>
        )
      }
    },
    /*{
      id: 'updated_at',
      label: '최종 수정시간',
      action: (row) => {
        return row['updated_at'] ?? "---"
      }
    },*/
    {
      id: 'edit',
      label: '리뷰 확인',
      action: (row) => {
        return (
          <>
            <IconButton onClick={() => {
              router.push(`edit/${row?.id}?type=1`)
            }}>
              <Icon icon='ic:outline-rate-review' />
            </IconButton>
          </>
        )
      }
    },
    {
      id: 'edit',
      label: '수정(복사) / 삭제', //수정/복사/삭제
      action: (row) => {
        return (
          <>
            <IconButton>
              <Icon icon='material-symbols:edit-outline' onClick={() => {
                router.push(`edit/${row?.id}`)
              }} />
            </IconButton>
            {/*<IconButton>
              <Icon icon='material-symbols:content-copy-outline' onClick={() => {
                router.push(`edit/${row?.product_code || row?.id}`)
              }} />
            </IconButton> */}
            <IconButton onClick={() => {
              setModal({
                func: () => { deleteProduct(row?.id) },
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
    category_id: null,
    seller_id: (user?.level == 10 ? user?.id : -1)
  })
  const [categories, setCategories] = useState([]);
  const [curCategories, setCurCategories] = useState({});
  const [curProperties, setCurProperties] = useState({})
  const [categoryChildrenList, setCategoryChildrenList] = useState({});
  const [detailSearchOpen, setDetailSearchOpen] = useState(false)
  useEffect(() => {
    pageSetting();
  }, [])

  /*useEffect(() => {
    if (!detailSearchOpen) {
      onChangePage({...searchObj, page: 1})
    }
  }, [detailSearchOpen])*/

  const pageSetting = async () => {

    let cols = defaultColumns;
    setColumns(cols)
    onChangePage({ ...searchObj, page: 1 });
  }
  const onChangePage = async (obj) => {
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('products', 'list', obj);
    if (data_) {
      for (var i = 0; i < themeCategoryList.length; i++) {
        let parent_list = await getAllIdsWithParents(themeCategoryList[i]?.product_categories);
        for (var j = 0; j < data_.content.length; j++) {
          let data_item = data_.content[j];
          let category_root = await returnCurCategories(data_item[`category_id${i}`] ?? 0, parent_list);
          if (category_root?.length > 0) {
            data_.content[j][`category_root_${i}`] = category_root ?? [];
          }
        }
      }
      setData(data_);
    }
    setSearchObj(obj);
  }

  const deleteProduct = async (id) => {
    let result = await apiManager('products', 'delete', { id: id });
    if (result) {
      onChangePage(searchObj);
    }
  }
  const returnCurCategories = async (category_id, parent_list) => {
    let use_list = [];
    for (var i = 0; i < parent_list.length; i++) {
      if (parent_list[i][parent_list[i].length - 1]?.id == category_id) {
        use_list = parent_list[i];
        break;
      }
    }
    return use_list
  }
  const onClickCategory = (category, depth, idx) => {

    let parent_list = getAllIdsWithParents(themeCategoryList[idx]?.product_categories);
    let use_list = [];
    for (var i = 0; i < parent_list.length; i++) {
      if (parent_list[i][depth]?.id == category?.id) {
        use_list = parent_list[i];
        break;
      }
    }
    let category_ids = {};
    let cur_categories = {
      ...curCategories,
      [idx]: use_list
    };
    for (var i = 0; i < themeCategoryList.length; i++) {
      if (cur_categories[i]) {
        category_ids[`category_id${i}`] = cur_categories[i][cur_categories[i].length - 1]?.id;
      }
    }
    onChangePage({ ...searchObj, ...category_ids, page: 1 })
    setCurCategories(cur_categories);
    let children_list = [];
    for (var i = 0; i < use_list.length; i++) {
      children_list.push(use_list[i]?.children);
    }
    setCategoryChildrenList({
      ...categoryChildrenList,
      [idx]: children_list
    });
    $(`.category-container-${idx}`).scrollLeft(100000);
  }

  const onChangeStatus = async (id, value) => {
    let result = await apiUtil(`products/status`, 'update', {
      id,
      value,
    })
  }


  return (
    <>
      <Stack spacing={3}>
        <Card>
          <div style={{ display: 'flex' }}>
            {detailSearchOpen && themeCategoryList.map((group, idx) => (
              <>
                <div style={{
                  width: '100%',
                  padding: '0.75rem',
                }}>
                  <SelectCategoryComponent
                    curCategories={curCategories[idx] ?? []}
                    categories={group?.product_categories}
                    categoryChildrenList={categoryChildrenList[idx] ?? []}
                    onClickCategory={onClickCategory}
                    noneSelectText={`${group?.category_group_name} 선택`}
                    sort_idx={idx}
                  />
                </div>
              </>
            ))}
          </div>
          {detailSearchOpen && themePropertyList.map((group, index) => (
            <>
              <div style={{ marginLeft: '1rem', marginBottom: '0.25rem', marginTop: '0.25rem' }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  {group?.property_group_name}
                </Typography>
                <Row style={{ flexWrap: 'wrap' }}>
                  {group?.product_properties && group?.product_properties.map((property, idx) => (
                    <>
                      <FormControlLabel
                        label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>{property?.property_name}</Typography>}
                        control={<Checkbox />}
                        onChange={(e) => {
                          let property_ids = searchObj[`property_ids${index}`] ?? [];
                          if (e.target.checked) {
                            property_ids.push(parseInt(property?.id));
                          } else {
                            let find_idx = _.findIndex(property_ids, parseInt(property?.id));
                            property_ids.splice(find_idx, 1);
                          }
                          onChangePage({
                            ...searchObj,
                            [`property_ids${index}`]: property_ids,
                          })
                          console.log(searchObj)
                        }}
                      />
                    </>
                  ))}
                </Row>
              </div>
            </>
          ))}
          <Divider />
          <ManagerTable
            data={data}
            setData={setData}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={'상품 추가'}
            want_move_card={true}
            table={'products'}
            detail_search={'상세검색'}
            onToggle={() => setDetailSearchOpen(!detailSearchOpen)}
          />
        </Card>
      </Stack>
    </>
  )
}
ProductList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ProductList
