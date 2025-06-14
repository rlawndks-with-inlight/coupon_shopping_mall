import { Button, Card, Container, Divider, IconButton, MenuItem, Select, Stack, Typography, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField } from "@mui/material";
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
import dynamic from "next/dynamic";
import { useLocales } from "src/locales";
import { formatLang } from "src/utils/format";
import toast from "react-hot-toast";

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p></p>,
})

const ProductList = () => {

  const { user } = useAuthContext();
  const { setModal } = useModal()
  const { themeCategoryList, themeDnsData, themePropertyList } = useSettingsContext();
  const { currentLang, translate } = useLocales();

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
            style={{ minWidth: '100px', cursor: /*user?.level > 20 &&*/ 'pointer' }}
            onClick={() => {
              /*user?.level > 20 &&*/ router.push(`edit/${row?.product_code || row?.id}`)
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
          style={{ textDecoration: 'underline', cursor: /*user?.level > 20 &&*/ 'pointer' }}
          onClick={() => {
            /*user?.level > 20 &&*/ router.push(`edit/${row?.id}`)
          }}
        >
          {
            themeDnsData?.id == 34 ?
              formatLang(row, 'product_name', currentLang)
              :
              row['product_name']
          }
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
    ...(themeDnsData?.is_use_seller == 1 ? [
      {
        id: 'product_sale_price',
        label: '가격',
        action: (row) => {
          return (
            <>
              {
                user?.level >= 15 ?
                  <>
                    <div>
                      {commarNumber(row['product_sale_price'] * (1 + (user?.oper_trx_fee ?? 0)))} (본사)
                    </div>
                  </>
                  :
                  <>
                    <div>
                      {commarNumber(row['product_sale_price'] * (1 + (user?.oper_trx_fee ?? 0)) * (1 + user?.seller_trx_fee ?? 0))} (본사)
                    </div>
                  </>
              }
              {
                user?.level == 10 && row?.seller_id > 0 &&
                <>
                  <div onClick={() => { console.log(row) }}>
                    {commarNumber(row['seller_price'])} (셀러)
                  </div>
                </>
              }
            </>
          )
        }
      },
    ] : [
      {
        id: 'product_price',
        label: '정상가',
        sub_id: 'product_sale_price',
        sub_label: '판매가',
        action: (row) => {
          return (
            <>
              <div onClick={() => { /*console.log(row)*/ }}>
                {commarNumber(row['product_price'])}
              </div>
              <div style={{ marginTop: '1rem' }}>
                {commarNumber(row['product_sale_price'])}
              </div>
            </>)
        }
      },
    ]),
    /*{
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
    },*/
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
    ...(user?.level != 10 ? [
      {
        id: 'status',
        label: '상태',
        action: (row) => {
          if (themeDnsData?.id == 5) {
            return <Select
              size="small"
              defaultValue={row?.status}
              disabled={user?.level < 40}
              onChange={(e) => {
                onChangeStatus(row?.id, e.target.value);
              }}
              sx={{ '@media screen and (max-width: 2500px)': { size: 'smaller' } }}
            >
              <MenuItem value={0}>{'판매중'}</MenuItem>
              <MenuItem value={6}>{'예약중'}</MenuItem>
              <MenuItem value={7}>{'매장문의'}</MenuItem>
              <MenuItem value={1}>{'거래진행중'}</MenuItem>
              <MenuItem value={2}>{'품절'}</MenuItem>
              <MenuItem value={3}>{'택배수거'}</MenuItem>
              <MenuItem value={4}>{'방문수거'}</MenuItem>
              <MenuItem value={5}>{'비공개'}</MenuItem>
            </Select>
          }
          else if (themeDnsData?.id == 74) {
            return <Select
              size="small"
              defaultValue={row?.status}
              onChange={(e) => {
                onChangeStatus(row?.id, e.target.value);
              }}
              sx={{ '@media screen and (max-width: 2500px)': { size: 'smaller' } }}
            >
              <MenuItem value={0}>{'판매중'}</MenuItem>
              <MenuItem value={5}>{'비공개'}</MenuItem>
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
              <MenuItem value={1}>{'중단됨'}</MenuItem>
              <MenuItem value={2}>{'품절'}</MenuItem>
              <MenuItem value={3}>{'새상품'}</MenuItem>
            </Select>
          }
        },
        sx: (row) => {
          return {
            color: `${row?.is_cancel == 1 ? 'red' : ''}`
          }
        },
      }
    ] : []),
    /*{
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
    },*/
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
    /*{
      id: 'edit',
      label: '리뷰 확인',
      action: (row) => {
        return (
          <>
            <IconButton onClick={() => {
              router.push(`edit/${row?.id}?type=2`)
            }}>
              <Icon icon='ic:outline-rate-review' />
            </IconButton>
          </>
        )
      }
    },*/
    /*{
      id: 'product_description',
      label: '설명',
      sub_id: 'product_description',
      sub_label: '설명',
      action: (row) => {
        return (
          <ReactQuill
            className='none-padding'
            value={row?.product_description || `<body></body>`}
            readOnly={true}
            theme={"bubble"}
            bounds={'.app'}
          />
        )
      }
    },*/
    ...(user?.level >= 40 ? [
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
    ] : []),
    ...(user?.level == 10 ? [
      {
        id: 'check',
        label: '상품판매체크',
        action: (row) => {
          return (
            <>
              {
                row['seller_id'] > 0 ?
                  <>
                    <IconButton>
                      <Icon icon='material-symbols:content-copy-outline' onClick={() => {
                        setPopup({
                          ...popup,
                          type: 2,
                          seller_product_id: row?.seller_product_id,
                          seller_price: row?.product_sale_price * (1 + (user?.oper_trx_fee ?? 0)) * (1 + user?.seller_trx_fee)
                        });
                      }} />
                    </IconButton>
                    <IconButton onClick={() => {
                      setModal({
                        func: () => { deleteSellerProducts(row?.seller_product_id) },
                        icon: 'material-symbols:delete-outline',
                        title: '정말 셀러몰에서 제외하시겠습니까?'
                      })
                    }}>
                      <Icon icon='material-symbols:delete-outline' />
                    </IconButton>
                  </>
                  :
                  <>
                    <IconButton>
                      <Icon icon='material-symbols:content-copy-outline' onClick={() => {
                        setPopup({
                          ...popup,
                          type: 1,
                          id: row?.id,
                          seller_price: row?.product_sale_price * (1 + (user?.oper_trx_fee ?? 0)) * (1 + user?.seller_trx_fee)
                        });
                      }} />
                    </IconButton>
                  </>
              }
            </>
          )
        }
      }
    ] : [])
  ]
  const router = useRouter();
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState({});

  const params = new URLSearchParams(window.location.search);

  const [searchObj, setSearchObj] = useState({
    page: parseInt(params.get('page') || '1'),
    page_size: parseInt(params.get('page_size') || '10'),
    s_dt: params.get('s_dt') || '',
    e_dt: params.get('e_dt') || '',
    search: params.get('search') || '',
    category_id: params.get('category_id') || '',
    category_id0: params.get('category_id0') || '',
    category_id1: params.get('category_id1') || '',
    property_ids0: params.get('property_ids0') || '',
    seller_id: (user?.level == 10 ? user?.id : -1),
    order: 'id'
  })
  const [categories, setCategories] = useState([]);
  const [curCategories, setCurCategories] = useState({});
  const [curProperties, setCurProperties] = useState({})
  const [categoryChildrenList, setCategoryChildrenList] = useState({});
  const [detailSearchOpen, setDetailSearchOpen] = useState(false)

  const [popup, setPopup] = useState({
    type: '',
    id: '',
    seller_product_id: '',
    seller_price: ''
  })
  const [productPrice, setProductPrice] = useState(0);

  const [allProductPer, setAllProductPer] = useState(0);

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
    onChangePage({ ...searchObj });
  }

  useEffect(() => {
    onChangePage({ ...router.query }, searchObj)
  }, [
    router.query.page,
    router.query.page_size,
    router.query.s_dt,
    router.query.e_dt,
    router.query.search,
    router.query.category_id,
    router.query.seller_id,
    router.query.order,
    router.query.is_asc,
    router.query.category_id0,
    router.query.category_id1,
    router.query.property_id0,
    router.query.property_id1,
    router.query.property_id2,
    router.query.property_id3,
    router.query.property_id4,
    router.query.product_type,
    router.query.status
  ])
  const onChangePage = async (query_ = {}, search_obj_ = {}) => {
    let query = query_;
    let search_obj = search_obj_;

    let query_str = new URLSearchParams(query).toString();
    router.push(`/manager/products/list?${query_str}`);

    setSearchObj({ ...search_obj, ...query });
    setData({
      ...data,
      content: undefined
    })
    let data_ = 0;
    if (user?.level != 10) {
      data_ = await apiManager('products', 'list', {
        ...search_obj,
        ...query
      });
    } else {
      data_ = await apiManager('products', 'list', {
        ...search_obj,
        ...query,
        manager_type: 'seller'
      });
    }
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
  }

  const onClickSeller = async () => {
    setPopup({ ...popup, type: 3 })
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
    console.log(searchObj)
  }

  const onChangeStatus = async (id, value) => {
    let result = await apiUtil(`products/status`, 'update', {
      id,
      value,
    })
  }

  const onSellerProducts = async (id, price, price_low) => {
    if (price < price_low) {
      toast.error('본사 가격보다 낮게 등록할 수 없습니다.');
      return;
    } else {
      let result = await apiManager(`seller-products`, 'create', {
        seller_id: user?.id, product_id: id, seller_price: price, agent_price: price_low
      })
      if (result) {
        window.location.reload()
      }
    }
  }

  const onAllSellerProducts = async (type, per) => {
    if (type == 'create') {
      if (per < 0) {
        toast.error('본사 가격보다 낮게 등록할 수 없습니다.');
        return;
      } else {
        let result = apiManager(`seller-products/all`, 'create', {
          seller_id: user?.id, type: 'create', price_per: parseInt(per * 100),
        })
        toast.promise(result, {
          loading: '처리 중입니다...',
          success: '일괄 등록되었습니다.',
          error: '문제가 발생했습니다.'
        })
        try {
          const result_ = await result;
          if (result_) {
            window.location.reload();
          }
        } catch (e) {
          // 에러는 toast.promise에서 처리되므로 여기서는 추가 처리 필요 없음
        }
      }
    } else if (type == 'delete') {
      let result = apiManager(`seller-products/all`, 'create', {
        seller_id: user?.id, type: 'delete'
      })
      toast.promise(result, {
        loading: '처리 중입니다...',
        success: '일괄 해제되었습니다.',
        error: '문제가 발생했습니다.'
      })
      try {
        const result_ = await result;
        if (result_) {
          window.location.reload();
        }
      } catch (e) {
        // 에러는 toast.promise에서 처리되므로 여기서는 추가 처리 필요 없음
      }
    }
  }

  const deleteSellerProducts = async (id) => {
    let result = await apiManager(`seller-products`, 'delete', { id: id })
    if (result) {
      onChangePage(searchObj);
    }
  }

  const changeSellerProducts = async (id, value, price_low) => {
    if (value < price_low) {
      toast.error('본사 가격보다 낮게 등록할 수 없습니다.');
      return;
    } else {
      let result = await apiUtil(`seller_products/seller_price`, 'update', {
        id, value
      })
      if (result) {
        window.location.reload()
      }
    }
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
                    id={group?.id}
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
                        control={<Checkbox checked={searchObj[`property_ids${index}`] == property?.id ? true : false} />}
                        onChange={(e) => {
                          let property_ids = searchObj[`property_ids${index}`]
                          if (e.target.checked) {
                            property_ids = parseInt(property?.id);
                            //console.log(property_ids)
                          }
                          onChangePage({
                            ...searchObj,
                            [`property_ids${index}`]: property_ids,
                          })
                          //console.log(searchObj)
                        }}
                      />
                    </>
                  ))}
                </Row>
              </div>
            </>
          ))}
          {detailSearchOpen && themeDnsData.id == 5 &&
            <>
              <div style={{ marginLeft: '1rem', marginBottom: '0.25rem', marginTop: '0.25rem' }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  위탁상태
                </Typography>
                <Row style={{ flexWrap: 'wrap' }}>
                  <FormControlLabel
                    label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>그랑파리</Typography>}
                    control={<Checkbox checked={searchObj[`product_type`] == 0 ? true : false} />}
                    onChange={(e) => {
                      let product_type = searchObj[`product_type`]
                      if (e.target.checked) {
                        product_type = 0;
                      }
                      onChangePage({
                        ...searchObj,
                        [`product_type`]: product_type,
                      })
                    }}
                  />
                  <FormControlLabel
                    label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>위탁(회원)</Typography>}
                    control={<Checkbox checked={searchObj[`product_type`] == 1 ? true : false} />}
                    onChange={(e) => {
                      let product_type = searchObj[`product_type`];
                      if (e.target.checked) {
                        product_type = 1;
                      }
                      onChangePage({
                        ...searchObj,
                        [`product_type`]: product_type,
                      })
                    }}
                  />
                  <FormControlLabel
                    label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>위탁(비회원)</Typography>}
                    control={<Checkbox checked={searchObj[`product_type`] == 2 ? true : false} />}
                    onChange={(e) => {
                      let product_type = searchObj[`product_type`]
                      if (e.target.checked) {
                        product_type = 2;
                      }
                      onChangePage({
                        ...searchObj,
                        [`product_type`]: product_type,
                      })
                    }}
                  />
                </Row>
              </div>
              <div style={{ marginLeft: '1rem', marginBottom: '0.25rem', marginTop: '0.25rem' }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  상태
                </Typography>
                <Row style={{ flexWrap: 'wrap' }}>
                  <FormControlLabel
                    label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>판매중</Typography>}
                    control={<Checkbox checked={searchObj[`status`] == 0 ? true : false} />}
                    onChange={(e) => {
                      let status = searchObj[`status`]
                      if (e.target.checked) {
                        status = 0;
                      }
                      onChangePage({
                        ...searchObj,
                        [`status`]: status,
                      })
                    }}
                  />
                  <FormControlLabel
                    label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>예약중</Typography>}
                    control={<Checkbox checked={searchObj[`status`] == 6 ? true : false} />}
                    onChange={(e) => {
                      let status = searchObj[`status`]
                      if (e.target.checked) {
                        status = 6;
                      }
                      onChangePage({
                        ...searchObj,
                        [`status`]: status,
                      })
                    }}
                  />
                  <FormControlLabel
                    label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>매장문의</Typography>}
                    control={<Checkbox checked={searchObj[`status`] == 7 ? true : false} />}
                    onChange={(e) => {
                      let status = searchObj[`status`]
                      if (e.target.checked) {
                        status = 7;
                      }
                      onChangePage({
                        ...searchObj,
                        [`status`]: status,
                      })
                    }}
                  />
                  <FormControlLabel
                    label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>거래진행중</Typography>}
                    control={<Checkbox checked={searchObj[`status`] == 1 ? true : false} />}
                    onChange={(e) => {
                      let status = searchObj[`status`]
                      if (e.target.checked) {
                        status = 1;
                      }
                      onChangePage({
                        ...searchObj,
                        [`status`]: status,
                      })
                    }}
                  />
                  <FormControlLabel
                    label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>품절</Typography>}
                    control={<Checkbox checked={searchObj[`status`] == 2 ? true : false} />}
                    onChange={(e) => {
                      let status = searchObj[`status`]
                      if (e.target.checked) {
                        status = 2;
                      }
                      onChangePage({
                        ...searchObj,
                        [`status`]: status,
                      })
                    }}
                  />
                  <FormControlLabel
                    label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>택배수거</Typography>}
                    control={<Checkbox checked={searchObj[`status`] == 3 ? true : false} />}
                    onChange={(e) => {
                      let status = searchObj[`status`]
                      if (e.target.checked) {
                        status = 3;
                      }
                      onChangePage({
                        ...searchObj,
                        [`status`]: status,
                      })
                    }}
                  />
                  <FormControlLabel
                    label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>방문수거</Typography>}
                    control={<Checkbox checked={searchObj[`status`] == 4 ? true : false} />}
                    onChange={(e) => {
                      let status = searchObj[`status`]
                      if (e.target.checked) {
                        status = 4;
                      }
                      onChangePage({
                        ...searchObj,
                        [`status`]: status,
                      })
                    }}
                  />
                  <FormControlLabel
                    label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>비공개</Typography>}
                    control={<Checkbox checked={searchObj[`status`] == 5 ? true : false} />}
                    onChange={(e) => {
                      let status = searchObj[`status`]
                      if (e.target.checked) {
                        status = 5;
                      }
                      onChangePage({
                        ...searchObj,
                        [`status`]: status,
                      })
                    }}
                  />
                </Row>
              </div>
            </>
          }
          <Divider />
          <Dialog
            open={popup['type'] == 1}
          >
            <DialogTitle>{`상품판매체크 및 가격설정`}</DialogTitle>
            <DialogContent>
              <DialogContentText style={{ marginBottom: '0.5rem' }}>
                셀러몰에 해당 상품을 등록합니다.
              </DialogContentText>
              <TextField
                autoFocus
                fullWidth
                value={productPrice}
                margin="dense"
                type="number"
                label="가격설정"
                onChange={(e) => {
                  setProductPrice(e.target.value)
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={() => { onSellerProducts(popup['id'], productPrice, popup['seller_price']) }}>
                요청
              </Button>
              <Button color="inherit" onClick={() => {
                window.location.reload()
              }}>
                취소
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={popup['type'] == 2}
          >
            <DialogTitle>{`상품가격변경`}</DialogTitle>
            <DialogContent>
              <DialogContentText style={{ marginBottom: '0.5rem' }}>
                등록된 상품의 가격을 변경합니다.
              </DialogContentText>
              <TextField
                autoFocus
                fullWidth
                value={productPrice}
                margin="dense"
                type="number"
                label="가격설정"
                onChange={(e) => {
                  setProductPrice(e.target.value)
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={() => { changeSellerProducts(popup['seller_product_id'], productPrice, popup['seller_price']) }}>
                요청
              </Button>
              <Button color="inherit" onClick={() => {
                window.location.reload()
              }}>
                취소
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={popup['type'] == 3}
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {`상품일괄설정`}
              <Button variant="outlined" onClick={() => {
                window.location.reload()
              }}>
                취소
              </Button>
            </DialogTitle>
            <DialogActions>
              <Button variant="contained" onClick={() => { setPopup({ ...popup, type: 4 }) }}>
                상품일괄판매
              </Button>
              <Button variant="outlined" onClick={() => { setPopup({ ...popup, type: 5 }) }}>
                상품일괄해제
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={popup['type'] == 4}
          >
            <DialogTitle>{`상품일괄판매체크 및 가격설정`}</DialogTitle>
            <DialogContent>
              <DialogContentText style={{ marginBottom: '0.5rem' }}>
                셀러몰에 모든 상품을 일괄 등록합니다.
                <br />
                상품가격에 적용할 퍼센트를 설정해주세요.
                <br />
                <br />
                예{')'} 0.1로 입력할 시 본사가격의 10%가 추가됩니다.
                <br />
                본사가격 10000 {'=>'} 셀러가격 11000
              </DialogContentText>
              <TextField
                sx={{ minWidth: '400px' }}
                autoFocus
                fullWidth
                value={allProductPer}
                margin="dense"
                type="number"
                label="퍼센트설정"
                onChange={(e) => {
                  setAllProductPer(e.target.value)
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={() => { onAllSellerProducts('create', allProductPer) }}>
                요청
              </Button>
              <Button color="inherit" onClick={() => {
                window.location.reload()
              }}>
                취소
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={popup['type'] == 5}
          >
            <DialogTitle>{`상품일괄판매해제`}</DialogTitle>
            <DialogContent>
              <DialogContentText style={{ marginBottom: '0.5rem' }}>
                셀러몰의 모든 상품을 일괄 해제합니다.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={() => { onAllSellerProducts('delete') }}>
                요청
              </Button>
              <Button color="inherit" onClick={() => {
                window.location.reload()
              }}>
                취소
              </Button>
            </DialogActions>
          </Dialog>
          <ManagerTable
            data={data}
            setData={setData}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={user?.level >= 40 ? '상품 추가' : user?.level == 10 ? '상품일괄선택' : ''}
            onClickSeller={onClickSeller}
            type={'product'}
            want_move_card={false}
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
