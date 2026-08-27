import { Button, Card, Checkbox, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, InputLabel, Menu, MenuItem, OutlinedInput, Rating, Select, Stack, TextField, Typography, Dialog, DialogTitle, Autocomplete, Tabs, Tab, Divider, Box } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Col, Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { Icon } from "@iconify/react";
import { commarNumber, getAllIdsWithParents } from "src/utils/function";
import styled from "styled-components";
import $ from 'jquery';
import { toast } from "react-hot-toast";
import { useTheme } from "@emotion/react";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import _ from "lodash";
import { useModal } from "src/components/dialog/ModalProvider";
import ReactQuillComponent from "src/views/manager/react-quill";
import { apiManager, uploadFilesByManager } from "src/utils/api";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { styled as muiStyle } from '@mui/material'
import dynamic from 'next/dynamic'
import { ProductDetailsCarousel } from "src/views/@dashboard/e-commerce/details";
import { SkeletonProductDetails } from "src/components/skeleton";
import ProductOptionEditor from 'src/components/manager/ProductOptionEditor';
import { 금액표시, 금액입력 } from 'src/utils/money-input'

// 옵션 개편분을 저장 요청에 싣는다.
//
// apiManager 는 FormData 로 보내므로 배열은 문자열이 되어야 한다(백엔드가 JSON.parse 한다).
// 재고는 빈 문자열이면 '무제한'이라는 뜻이라 그대로 보낸다 — 0 으로 접으면 저장하자마자 품절이 된다.
const 옵션페이로드 = (item) => ({
  option_mode: Number(item?.option_mode) === 1 ? 1 : 0,
  stock_qty: item?.stock_qty ?? '',
  purchase_limit: item?.purchase_limit ?? '',
  combinations: JSON.stringify((item?.combinations ?? []).filter((c) => (c?.option_names?.length ?? 0) > 0)),
  order_form_fields: JSON.stringify(item?.order_form_fields ?? []),
});

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const CategoryWrappers = styled.div`
display:flex;
flex-direction:column;
border-radius: 8px;
`
const CategoryContainer = styled.div`
height:200px;
overflow-y:auto;
width:200px;
`
const CategoryHeader = styled.div`
background:${themeObj.grey[200]};
padding:0.5rem 1rem;
border-top-right-radius: 8px;
border-top-left-radius: 8px;
`
const Category = styled.div`
padding:0.5rem 1rem;
display:flex;
justify-content:space-between;
cursor:pointer;
&:hover{
  background:${props => props.hoverColor};
}
`

const Wrapper = styled.div`
display:flex;
flex-direction:column;
min-height:76vh;
width:100%;
`
const ContentWrapper = styled.div`
max-width:1200px;
width:90%;
margin: 1rem auto;
`
const ItemName = muiStyle(Typography)`
font-size:16px;
`

const StyledReactQuill = styled(ReactQuill)`
.ql-editor {
  font-size: 16px;
  font-family: 'Noto Sans KR';
}
`
const ItemCharacter = (props) => {
  const { key_name, value, type = 0 } = props;
  if (type == 0) {
    return (
      <>
        <Row style={{ columnGap: '0.25rem', marginTop: '1rem', fontSize: '14px' }}>
          <Typography style={{ width: '6rem', }}>{key_name}</Typography>
          <Typography>{value}</Typography>
        </Row>
      </>
    )
  }
}

export const SelectCategoryComponent = (props) => {
  const {
    curCategories,
    categories,
    categoryChildrenList,
    onClickCategory,
    noneSelectText,
    sort_idx,
    id,
    onChange,
    type = 'product',
    disabled
  } = props;
  const theme = useTheme();
  const { themeDnsData } = useSettingsContext();

  const [searchText, setSearchText] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [categoryContent, setCategoryContent] = useState({
    total: 100,
    content: []
  });

  const [selectedCategoryIds, setSelectedCategoryIds] = useState(
    curCategories.map(cat => cat.id) || []
  );

  const handleCategoryToggle = (category, depth, sortIdx) => {
    setSelectedCategoryIds(prevIds => {
      // 이미 선택된 카테고리인 경우 해제
      if (prevIds.includes(category.id)) {
        const updatedIds = prevIds.filter(id => id !== category.id);

        // 부모 컴포넌트에 변경 사항 알림
        const updatedCategories = updatedIds.map(id => {
          // 모든 가능한 카테고리에서 id와 일치하는 항목 찾기
          const allCategories = [
            ...categories,
            ...categoryChildrenList.flat()
          ];
          return allCategories.find(cat => cat.id === id) || {};
        });

        if (onChange) {
          onChange(updatedCategories);
        }

        return updatedIds;
      }
      // 선택되지 않은 카테고리인 경우 추가
      else {
        const updatedIds = [...prevIds, category.id];

        // 부모 컴포넌트에 변경 사항 알림
        const updatedCategories = updatedIds.map(id => {
          // 모든 가능한 카테고리에서 id와 일치하는 항목 찾기
          const allCategories = [
            ...categories,
            ...categoryChildrenList.flat()
          ];
          return allCategories.find(cat => cat.id === id) || {};
        });

        if (onChange) {
          onChange(updatedCategories);
        }

        return updatedIds;
      }
    });

    // 기존 onClickCategory 함수도 호출 (기존 기능 유지)
    if (onClickCategory) {
      onClickCategory(category, depth, sortIdx);
    }
  };

  const hasChildCategories = categories.some(category =>
    category.children && category.children.length > 0
  );

  const filterCategories = (searchValue) => {
    if (!searchValue /*|| searchValue.length < 3*/) { //기능 개선 여지 있음
      setFilteredCategories([]);
      return;
    }

    const searchLower = searchValue.toLowerCase();
    const filtered = categoryContent.content.filter(category =>
      category.category_name.toLowerCase().includes(searchLower) ||
      (category.category_en_name && category.category_en_name.toLowerCase().includes(searchLower))
    );
    setFilteredCategories(filtered);
  };

  const onSearchCategories = async (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (value/*.length >= 1*/) { //기능 개선 여지 있음
      try {
        const category_content = await apiManager('product-categories', 'list', {
          page: 1,
          page_size: 1000,
          // 마이그레이션된 브랜드의 합성 그룹은 id 가 0 이다. 그대로 보내면
          // 백엔드에서 `AND product_category_group_id=0` 이 붙어 검색이 항상 0건이 된다.
          ...(id > 0 ? { product_category_group_id: id } : {}),
          search: value
        });

        setCategoryContent(prev => ({
          ...prev,
          content: _.uniqBy([...prev.content, ...category_content.content], 'id')
        }));

        filterCategories(value);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    } else {
      setFilteredCategories([]);
    }
  };

  const isCategorySelected = (categoryId) => {
    return selectedCategoryIds.includes(categoryId);
  };

  return (
    <CategoryWrappers style={{ border: `1px solid ${theme.palette.mode == 'dark' ? themeObj.grey[700] : themeObj.grey[300]}` }}>
      <TextField
        style={{
          // ⚠ hasChildCategories 일 때 검색창을 숨긴다 — 하위 카테고리가 있을 때, 즉
          //    검색이 가장 필요한 상황에서 정확히 사라진다. 열어주는 게 맞지만 그전에
          //    검색결과 클릭 경로를 먼저 고쳐야 한다: type=='product' 분기는
          //    onClickCategory(category, 0, ...) 로 depth 를 0 으로 고정해 넘기는데,
          //    호출부(products/list.js 의 returnCurCategories)가
          //    `parent_list[i][depth]?.id == category?.id` 로 찾기 때문에
          //    하위 카테고리 검색결과를 누르면 경로를 못 찾아 필터가 빈 값이 된다.
          //    (반대쪽 분기의 handleCategoryToggle 은 depth 를 안 쓰므로 영향 없다)
          //    지금 열면 '검색은 되는데 눌러도 안 걸리는' 상태가 되어 더 나쁘다.
          display: `${hasChildCategories || disabled ? 'none' : ''}`
        }}
        fullWidth
        label='검색'
        value={searchText}
        onChange={onSearchCategories}
        onKeyPress={(e) => {
          if (e.key == 'Enter') {
            onSearchCategories
          }
        }}
        // 안내는 '3글자 이상'이었는데 실제로는 1글자부터 검색한다
        // (filterCategories 의 길이조건이 주석 처리돼 있다).
        // 문구를 실제 동작에 맞춘다 — 3글자를 채워야 하는 줄 알고 기다리게 된다.
        placeholder='카테고리명을 입력해 주세요.'
      />
      <CategoryHeader style={{
        background: `${theme.palette.mode == 'dark' ? '#919eab29' : ''}`,
        borderBottom: `1px solid ${theme.palette.mode == 'dark' ? themeObj.grey[700] : themeObj.grey[300]}`,
        display: 'flex'
      }}>
        {type == 'product' ?
          <>
            {curCategories.length > 0 ?
              <Row>
                {curCategories.map((item, idx) => (
                  <>
                    <div style={{ marginRight: '0.25rem' }}>
                      {item.category_name}
                    </div>
                    {idx != curCategories.length - 1 &&
                      <div style={{ marginRight: '0.25rem' }}>{'>'}</div>
                    }
                  </>
                ))}
              </Row>
              :
              <>{noneSelectText}</>
            }
          </>
          :
          <>
            {selectedCategoryIds.length > 0 ? (
              <Row style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                {/* 선택된 카테고리들을 표시 (태그 형태로) */}
                {selectedCategoryIds.map(id => {
                  const allCategories = [
                    ...categories,
                    ...categoryChildrenList.flat(),
                    ...categoryContent.content
                  ];
                  const category = allCategories.find(cat => cat.id === id);

                  return category ? (
                    <div key={id} style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      border: `1px solid ${theme.palette.primary.main}`,
                      borderRadius: '4px',
                      marginRight: '4px',
                      marginBottom: '4px',
                      background: theme.palette.primary.lighter,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span>{category.category_name}</span>
                      <Icon
                        icon="mdi:close"
                        width={16}
                        height={16}
                        style={{ marginLeft: '4px', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryToggle(category, 0, sort_idx);
                        }}
                      />
                    </div>
                  ) : null;
                })}
              </Row>
            ) : (
              <>{noneSelectText}</>
            )}
          </>
        }
      </CategoryHeader>
      <div style={{ overflowX: 'auto', width: '100%', display: '-webkit-box' }} className={`category-container-${sort_idx}`}>
        <CategoryContainer style={{ display: `${disabled && 'none'}` }}>
          {type == 'product' ?
            <>
              {filteredCategories.length > 0 ?
                filteredCategories.map((category) => (
                  <Category
                    key={category.id}
                    hoverColor={theme.palette?.mode == 'dark' ? themeObj.grey[700] : themeObj.grey[200]}
                    style={{
                      color: `${curCategories.map(item => item?.id).includes(category?.id) ? '' : themeObj.grey[500]}`,
                      fontWeight: `${curCategories.map(item => item?.id).includes(category?.id) ? 'bold' : ''}`
                    }}
                    onClick={() => onClickCategory(category, 0, sort_idx)}
                  >
                    <div>{category.category_name}</div>
                    <div>{category?.children && category?.children.length > 0 ? '>' : ''}</div>
                  </Category>
                ))
                :
                categories.map((category) => (
                  <Category
                    key={category.id}
                    hoverColor={theme.palette?.mode == 'dark' ? themeObj.grey[700] : themeObj.grey[200]}
                    style={{
                      color: `${curCategories.map(item => item?.id).includes(category?.id) ? '' : themeObj.grey[500]}`,
                      fontWeight: `${curCategories.map(item => item?.id).includes(category?.id) ? 'bold' : ''}`
                    }}
                    onClick={() => onClickCategory(category, 0, sort_idx)}
                  >
                    <div>{category.category_name}</div>
                    <div>{category?.children && category?.children.length > 0 ? '>' : ''}</div>
                  </Category>
                ))
              }
            </>
            :
            <>
              {filteredCategories.length > 0 ?
                filteredCategories.map((category) => (
                  <Category
                    key={category.id}
                    hoverColor={theme.palette?.mode == 'dark' ? themeObj.grey[700] : themeObj.grey[200]}
                    style={{
                      color: isCategorySelected(category.id) ? theme.palette.primary.main : theme.palette.mode === 'dark' ? '#fff' : '#000',
                      fontWeight: isCategorySelected(category.id) ? 'bold' : 'normal',
                      backgroundColor: isCategorySelected(category.id) ? theme.palette.primary.lighter : 'transparent',
                    }}
                    onClick={() => handleCategoryToggle(category, 0, sort_idx)}
                  >
                    <div>{category.category_name}</div>
                    <div>
                      {isCategorySelected(category.id) ? (
                        <Icon icon="mdi:check" width={16} height={16} />
                      ) : (
                        category?.children && category?.children.length > 0 ? '>' : ''
                      )}
                    </div>
                  </Category>
                ))
                :
                categories.map((category) => (
                  <Category
                    key={category.id}
                    hoverColor={theme.palette?.mode == 'dark' ? themeObj.grey[700] : themeObj.grey[200]}
                    style={{
                      color: isCategorySelected(category.id) ? theme.palette.primary.main : theme.palette.mode === 'dark' ? '#fff' : '#000',
                      fontWeight: isCategorySelected(category.id) ? 'bold' : 'normal',
                      backgroundColor: isCategorySelected(category.id) ? theme.palette.primary.lighter : 'transparent',
                    }}
                    onClick={() => handleCategoryToggle(category, 0, sort_idx)}
                  >
                    <div>{category.category_name}</div>
                    <div>
                      {isCategorySelected(category.id) ? (
                        <Icon icon="mdi:check" width={16} height={16} />
                      ) : (
                        category?.children && category?.children.length > 0 ? '>' : ''
                      )}
                    </div>
                  </Category>
                ))
              }
            </>
          }
        </CategoryContainer>
        {filteredCategories.length === 0 && categoryChildrenList.map((category_list, index) => (
          category_list.length > 0 &&
          <CategoryContainer style={{ display: `${disabled && 'none'}` }} key={index}>
            {category_list.map((category) => (
              type == 'product' ?
                <Category
                  key={category.id}
                  style={{
                    color: `${curCategories.map(item => item?.id).includes(category?.id) ? '' : themeObj.grey[500]}`,
                    fontWeight: `${curCategories.map(item => item?.id).includes(category?.id) ? 'bold' : ''}`
                  }}
                  onClick={() => onClickCategory(category, index + 1, sort_idx)}
                >
                  <div>{category.category_name}</div>
                  <div>{category?.children && category?.children.length > 0 ? '>' : ''}</div>
                </Category>
                :
                <Category
                  key={category.id}
                  hoverColor={theme.palette?.mode == 'dark' ? themeObj.grey[700] : themeObj.grey[200]}
                  style={{
                    color: isCategorySelected(category.id) ? theme.palette.primary.main : theme.palette.mode === 'dark' ? '#fff' : '#000',
                    fontWeight: isCategorySelected(category.id) ? 'bold' : 'normal',
                    backgroundColor: isCategorySelected(category.id) ? theme.palette.primary.lighter : 'transparent',
                  }}
                  onClick={() => handleCategoryToggle(category, index + 1, sort_idx)}
                >
                  <div>{category.category_name}</div>
                  <div>
                    {isCategorySelected(category.id) ? (
                      <Icon icon="mdi:check" width={16} height={16} />
                    ) : (
                      category?.children && category?.children.length > 0 ? '>' : ''
                    )}
                  </div>
                </Category>
            ))}
          </CategoryContainer>
        ))}
      </div>
    </CategoryWrappers>
  );
};


export const SelectPropertyComponent = (props) => {
  const { a } = props;
  const theme = useTheme();

  return (
    <>

    </>
  )
}



const ProductEdit = () => {
  const { user } = useAuthContext();
  const { setModal } = useModal()
  const { themeCategoryList, themeDnsData, themePropertyList } = useSettingsContext();

  const defaultUserColumns = [
    {
      id: 'user_name',
      label: '유저아이디',
      action: (row) => {
        return <div
          style={{ textDecoration: 'underline', cursor: 'pointer' }}
          onClick={() => {
            consignmentSet(row)
          }}
        >
          {row['user_name']}
        </div> ?? "---"
      }
    },
    {
      id: 'name',
      label: '이름',
      action: (row) => {
        return <div
          style={{ textDecoration: 'underline', cursor: 'pointer' }}
          onClick={() => {
            consignmentSet(row)
          }}
        >
          {row['name']}
        </div> ?? "---"
      }
    },
    {
      id: 'phone_num',
      label: '휴대폰번호',
      action: (row) => {
        return <div
          style={{ textDecoration: 'underline', cursor: 'pointer' }}
          onClick={() => {
            consignmentSet(row)
          }}
        >
          {row['phone_num']}
        </div> ?? "---"
      }
    },
  ]

  const defaultReviewColumns = [
    {
      id: 'user_name',
      label: '작성자아이디',
      action: (row) => {
        return row['user_name'] ?? "---"
      }
    },
    {
      id: 'writer_name',
      label: '작성자',
      action: (row) => {
        return row['writer_name'] || row['nickname'] || "---"
      }
    },
    {
      id: 'title',
      label: '제목',
      action: (row) => {
        return commarNumber(row['title'])
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
                setReview(row);
                setReviewAction(true);
              }} />
            </IconButton>
            <IconButton onClick={() => {
              setModal({
                func: async () => {
                  let result = await apiManager('product-reviews', 'delete', { id: row?.id });
                  if (result) {
                    setReviewAction(false);
                    setReview({});
                    onChangeReviewsPage(reviewSearchObj);
                  }
                },
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

  const defaultItemCharacter = [
    {
      name: '성별',
    },
    {
      name: '사이즈',
    },
    {
      name: '색상',
    }
  ]

  const [price, setPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [useDiscount, setUseDiscount] = useState(false) // 할인 표시 사용 여부(정가를 판매가보다 높게 별도 입력)
  const [point, setPoint] = useState('')
  const [defPoint, setDefPoint] = useState(0)
  const [showStatus, setShowStatus] = useState()

  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [curCategories, setCurCategories] = useState({});
  const [categoryChildrenList, setCategoryChildrenList] = useState({});
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]); // 1상품 N카테고리 다중선택(연결테이블)
  const [item, setItem] = useState({
    category_ids: [],
    product_name: '',
    product_code: '',
    product_comment: '',
    product_spec: '',
    product_price: 0,
    product_sale_price: 0,
    product_type: 0,
    product_description: '',
    consignment_user_name: '',
    consignment_none_user_name: '',
    consignment_none_user_phone_num: '',
    consignment_fee: 0,
    consignment_fee_type: 0,
    product_file: undefined,
    sub_images: [],
    description_images: [],
    groups: [],
    characters: [],
    properties: {},
    // 옵션 개편분. 조합/입력항목은 배열, option_mode 는 0=따로고르기 1=조합
    combinations: [],
    order_form_fields: [],
    option_mode: 0,
    stock_qty: '',
    purchase_limit: '',
    point_save: 0,
    point_usable: 1,
    cash_usable: 1,
    pg_usable: 1,
    status: 0,
    show_status: 0,
  })

  const [userColumns, setUserColumns] = useState([]);
  const [userData, setUserData] = useState({});
  const [userSearchObj, setUserSearchObj] = useState({
    page: 1,
    page_size: 10,
    s_dt: '',
    e_dt: '',
    search: '',
    is_user: 1,
  })
  const [consignmentUser, setConsignmentUser] = useState()

  const [reviewData, setReviewData] = useState({});
  const [review, setReview] = useState({});
  const [reviewAction, setReviewAction] = useState(false);
  const [defaultCorner, setDefaultCorner] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false);

  const [reviewSearchObj, setReviewSearchObj] = useState({
    page: 1,
    page_size: 10,
    s_dt: '',
    e_dt: '',
    search: '',
    product_id: '',
  })
  const [reviewColumns, setReviewColumns] = useState([]);
  useEffect(() => {
    settingPage();
    //console.log(themeDnsData)
  }, [])
  useEffect(() => {
    //console.log(item)
  }, [item])
  useEffect(() => {
    if (currentTab == 2) {
      onChangeReviewsPage({ ...reviewSearchObj, product_id: item?.id });
    }
  }, [currentTab])
  const onChangeReviewsPage = async (obj) => {
    setReviewData({
      ...reviewData,
      content: undefined
    })
    let data_ = await apiManager('product-reviews', 'list', obj);
    if (data_) {
      setReviewData(data_);
    }
    setReviewSearchObj(obj);
  }

  useEffect(() => {
    if (dialogOpen) {
      onChangeUserPage({ ...userSearchObj, page: 1 })
    }
  }, [dialogOpen])
  const onChangeUserPage = async (obj) => {
    setUserSearchObj(obj);
    setUserData({
      ...userData,
      content: undefined
    })
    let data_ = await apiManager('users', 'list', obj);
    if (data_) {
      setUserData(data_);
    }
  }


  const settingPage = async () => {
    let cols = defaultReviewColumns;
    setReviewColumns(cols)
    let cols2 = defaultUserColumns;
    setUserColumns(cols2)

    if (router.query?.edit_category == 'edit') {
      setCurrentTab(router.query?.type ?? 0)
      let product = await apiManager('products', 'get', {
        id: router.query.id
      })
      product = Object.assign(item, product)
      let property_obj = {};
      for (var i = 0; i < product?.properties?.length; i++) {
        if (!property_obj[product.properties[i]?.property_group_id]) {
          property_obj[product.properties[i].property_group_id] = [];
        }
        property_obj[product.properties[i].property_group_id].push(product.properties[i].property_id)
      }
      product.properties = property_obj;
      // 재고는 NULL 이 '무제한'이다. null 을 그대로 넣으면 MUI 입력칸이 비제어로 바뀌며 경고가 뜬다.
      product.stock_qty = product?.stock_qty ?? '';
      product.purchase_limit = product?.purchase_limit ?? '';
      product.option_mode = Number(product?.option_mode) || 0;
      product.combinations = product?.combinations ?? [];
      product.order_form_fields = product?.order_form_fields ?? [];
      setItem(product)
      setPrice(product?.product_price.toLocaleString('ko-KR'))
      setSalePrice(product?.product_sale_price.toLocaleString('ko-KR'))
      // 정가(product_price)가 판매가(product_sale_price)보다 클 때만 '할인 표시' 사용으로 간주
      setUseDiscount((product?.product_price || 0) > (product?.product_sale_price || 0))
      setPoint(product?.point_save?.toLocaleString('ko-KR'))
      let cur_categories = {};
      let category_children_list = {};
      for (var i = 0; i < themeCategoryList.length; i++) {
        let parent_list = getAllIdsWithParents(themeCategoryList[i]?.product_categories);
        let use_list = [];
        for (var j = 0; j < parent_list.length; j++) {
          if (parent_list[j][parent_list[j].length - 1]?.id == product[`category_id${i}`]) {
            use_list = parent_list[j];
            break;
          }
        }
        cur_categories[i] = use_list;
        let children_list = [];
        for (var j = 0; j < use_list.length; j++) {
          children_list.push(use_list[j]?.children);
        }
        category_children_list[i] = children_list;
      }
      setCurCategories(cur_categories);
      setCategoryChildrenList(category_children_list);
      // 다중선택 초기화: 백엔드 category_ids(연결테이블) 우선, 없으면 레거시 category_id0 폴백
      let init_selected = (Array.isArray(product?.category_ids) && product.category_ids.length > 0)
        ? product.category_ids
        : (product?.category_id0 ? [product.category_id0] : []);
      setSelectedCategoryIds([...new Set(init_selected.map(Number).filter((v) => v > 0))]);
    }
    setLoading(false);
  }
  const handleDropMultiFile = (acceptedFiles) => {
    let sub_images = [...item.sub_images];
    for (var i = 0; i < acceptedFiles.length; i++) {
      sub_images.push({
        product_sub_file: Object.assign(acceptedFiles[i], {
          preview: URL.createObjectURL(acceptedFiles[i])
        }),
      })
    }
    setItem({ ...item, ['sub_images']: sub_images })
  };

  const handleDropMultiDescription = (acceptedFiles) => {
    let description_images = [...item.description_images];
    for (var i = 0; i < acceptedFiles.length; i++) {
      description_images.push({
        product_description_file: Object.assign(acceptedFiles[i], {
          preview: URL.createObjectURL(acceptedFiles[i])
        }),
      })
    }
    setItem({ ...item, ['description_images']: description_images })
  }

  const handleRemoveFile = (inputFile) => {
    let sub_images = [...item.sub_images];
    let find_index = _.findIndex(sub_images.map(img => { return img.product_sub_file }), {
      path: inputFile.path,
      preview: inputFile.preview
    });
    if (find_index < 0) {
      for (var i = 0; i < sub_images.length; i++) {
        if (sub_images[i]?.product_sub_img == inputFile) {
          find_index = i;
        }
      }
    }
    if (find_index >= 0) {
      if (sub_images[find_index]?.id) {
        sub_images[find_index].is_delete = 1;
      } else {
        sub_images.splice(find_index, 1);
      }
      setItem({ ...item, ['sub_images']: sub_images })
    }
  };

  const handleRemoveDescription = (inputFile) => {
    let description_images = [...item.description_images];
    let find_index = _.findIndex(description_images.map(img => { return img.product_description_file }), {
      path: inputFile.path,
      preview: inputFile.preview
    });
    if (find_index < 0) {
      for (var i = 0; i < description_images.length; i++) {
        if (description_images[i]?.product_description_img == inputFile) {
          find_index = i;
        }
      }
    }
    if (find_index >= 0) {
      if (description_images[find_index]?.id) {
        description_images[find_index].is_delete = 1;
      } else {
        description_images.splice(find_index, 1);
      }
      setItem({ ...item, ['description_images']: description_images })
    }
  };

  const handleRemoveAllFiles = () => {
    let sub_images = [...item.sub_images];
    sub_images = [];
    setItem({ ...item, ['sub_images']: sub_images })
  };

  const handleRemoveAllDescriptionFiles = () => {
    let description_images = [...item.description_images];
    description_images = [];
    setItem({ ...item, ['description_images']: description_images })
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
    setCurCategories({
      ...curCategories,
      [idx]: use_list
    });
    let children_list = [];
    for (var i = 0; i < use_list.length; i++) {
      children_list.push(use_list[i]?.children);
    }
    setCategoryChildrenList({
      ...categoryChildrenList,
      [idx]: children_list
    });
    $(`.category-container-${idx}`).scrollLeft(100000);
    // 클릭한 카테고리를 선택목록에 토글(추가/제거) — 버튼 없이 클릭만으로 담기. 1상품 N카테고리.
    setSelectedCategoryIds((prev) => {
      const cid = Number(category?.id);
      if (!cid) return prev;
      return prev.map(Number).includes(cid) ? prev.filter((x) => Number(x) !== cid) : [...prev, cid];
    });
  }
  // 1상품 N카테고리 다중선택 헬퍼
  const flatCategoryList = _.uniqBy(
    (themeCategoryList ?? []).flatMap((g) => getAllIdsWithParents(g?.product_categories ?? []).flat()),
    'id'
  );
  const findCategoryById = (id) => _.find(flatCategoryList, { id: Number(id) });
  const onAddSelectedCategory = (index) => {
    const nav = curCategories[index] ?? [];
    const leaf = nav[nav.length - 1]?.id;
    if (!leaf) { toast.error('추가할 카테고리를 먼저 탐색·선택해 주세요.'); return; }
    if (selectedCategoryIds.map(Number).includes(Number(leaf))) return;
    setSelectedCategoryIds([...selectedCategoryIds, Number(leaf)]);
  };
  const onRemoveSelectedCategory = (cid) => {
    setSelectedCategoryIds(selectedCategoryIds.filter((x) => Number(x) !== Number(cid)));
  };

  const onSave = async (type, sort) => {
    // 필수값 검증.
    //
    // 예전엔 옵션 변동가 NaN 검사 하나뿐이라, 상품명이 비고 판매가가 0 인 상품이 그대로
    // 저장됐다. 라벨에는 '(필수)'라고 써 있는데 아무것도 막지 않았다.
    // 그렇게 만들어진 상품은 고객 목록에 이름 없이 뜨고 카드가 SOLD OUT 으로 보인다
    // (가격 0 이면 구매 버튼도 비활성이다).
    if (!String(item?.product_name ?? '').trim()) {
      toast.error('상품명을 입력해 주세요.');
      return;
    }
    if (!(parseFloat(item?.product_sale_price) > 0)) {
      toast.error('판매가를 입력해 주세요.');
      return;
    }
    if ((selectedCategoryIds ?? []).length == 0) {
      toast.error('카테고리를 한 개 이상 선택해 주세요.');
      return;
    }
    // 할인 표시를 켰는데 정가가 판매가보다 높지 않으면 할인이 성립하지 않는다.
    // 그대로 저장하면 정가가 화면에서 사라진 채 DB 에 남아, 나중에 값만 어긋나 보인다.
    if (useDiscount && !(parseFloat(item?.product_price) > parseFloat(item?.product_sale_price))) {
      toast.error('할인 전 가격(정가)은 판매가보다 높아야 합니다. 할인이 없다면 「할인 표시하기」를 꺼 주세요.');
      return;
    }
    // 손님이 적는 항목 — 이름 없는 항목은 서버가 버린다. 조용히 버리면 왜 사라졌는지 모른다.
    for (const f of (item?.order_form_fields ?? []).filter((x) => x?.is_delete != 1)) {
      if (!String(f?.label ?? '').trim()) {
        toast.error('손님이 적는 항목의 이름을 입력해 주세요. (비워두면 저장되지 않습니다)');
        return;
      }
    }
    // 옵션·특성의 '빈 껍데기' 검사.
    //
    // 줄만 추가하고 이름을 안 채우면 예전엔 그대로 저장돼 고객 화면에 라벨 없는 빈 버튼이 떴다.
    // 서버도 이제 걸러내지만(product.controller cleanOptionGroups), 조용히 버리면 가맹점은
    // 자기가 넣은 옵션이 왜 사라졌는지 모른다 — 저장 전에 알려준다.
    //
    // ⚠ 특히 '고를 옵션이 하나도 없는 옵션그룹' 은 그냥 보기 싫은 정도가 아니다.
    //   고객 화면은 '옵션그룹이 있으면 그룹마다 하나 이상 골라야' 구매가 되는데,
    //   고를 게 없으면 그 상품은 장바구니·바로구매가 통째로 막힌다.
    const liveGroups = (item?.groups ?? []).filter((g) => g?.is_delete != 1);
    for (const g of liveGroups) {
      if (!String(g?.group_name ?? '').trim()) {
        toast.error('옵션 그룹의 이름을 입력해 주세요. (비워두면 저장되지 않습니다)');
        return;
      }
      const liveOptions = (g?.options ?? []).filter((o) => o?.is_delete != 1);
      if (liveOptions.length == 0) {
        toast.error(`'${g.group_name}' 옵션을 한 개 이상 추가해 주세요. 고를 옵션이 없으면 고객이 이 상품을 구매할 수 없습니다.`);
        return;
      }
      if (liveOptions.some((o) => !String(o?.option_name ?? '').trim())) {
        toast.error(`'${g.group_name}' 의 옵션 이름을 입력해 주세요.`);
        return;
      }
    }
    const liveCharacters = (item?.characters ?? []).filter((c) => c?.is_delete != 1);
    for (const c of liveCharacters) {
      if (!String(c?.character_name ?? '').trim() || !String(c?.character_value ?? '').trim()) {
        toast.error('특성의 이름과 값을 모두 입력해 주세요. (비워두면 저장되지 않습니다)');
        return;
      }
    }
    let result = undefined
    // 1상품 N카테고리: 다중선택된 카테고리들을 연결테이블용 배열로. 대표(첫번째)는 category_id0 dual-write.
    let category_ids_arr = [...new Set((selectedCategoryIds ?? []).map(Number).filter((v) => v > 0))];
    // category_id0 은 '항상' 보낸다. 선택이 하나도 없으면 0 을 명시해 비운다.
    //
    // 예전엔 선택이 없으면 키 자체를 안 보냈는데, 백엔드가 온 필드만 UPDATE 하므로
    // (product.controller.js 의 `if (req.body[`category_id${i}`])`) 옛 값이 그대로 남았다.
    // 연결테이블(products_categories)은 비워지는데 category_id0 만 살아남고,
    // 목록·스토어 필터가 `OR category_id0 IN (...)` 로 그걸 읽어서
    // '카테고리를 다 뺐는데 예전 카테고리에 계속 보이는' 상태가 됐다.
    //
    // category_id1/2 는 건드리지 않는다. 옛 '그룹 facet' 시절 값이 남아 있는 브랜드가 있고,
    // 그중 일부는 이미 soft-delete 된 카테고리를 가리켜 화면상 무해하다.
    // 게다가 is_category_migrated=0 으로 되돌리는 롤백 경로가 아직 살아 있어
    // 위치컬럼을 지우면 복구가 불가능해진다.
    let category_ids = {
      category_id0: category_ids_arr.length > 0 ? category_ids_arr[0] : 0,
    };
    /*for (var i = 0; i < themePropertyList.length; i++) {
      if (!((item.properties[themePropertyList[i]?.id] ?? [])?.length > 0)) {
        toast.error(`${themePropertyList[i]?.property_group_name}를 선택해 주세요.`);
        return;
      }
    }*/
    let obj = item;
    //console.log(obj)
    if (sort) {
      //console.log(sort)
    }
    let sub_images = [];
    let description_images = [];
    let upload_files = [];
    let upload_files_d = [];
    for (var i = 0; i < item.sub_images.length; i++) {
      //console.log(item?.sub_images)
      if (item.sub_images[i]?.product_sub_file) {
        upload_files.push({
          image: item.sub_images[i]?.product_sub_file,
        })
      }
    }
    upload_files = await uploadFilesByManager({
      images: upload_files,
    })
    for (var i = 0; i < item.description_images.length; i++) {
      if (item.description_images[i]?.product_description_file) {
        //console.log(item?.description_images)
        upload_files_d.push({
          image: item.description_images[i]?.product_description_file,
        })
      }
    }
    upload_files_d = await uploadFilesByManager({
      images: upload_files_d,
    })
    let upload_idx = 0;
    let upload_idx_d = 0;
    for (var i = 0; i < obj.sub_images.length; i++) {
      if (obj.sub_images[i]?.product_sub_file) {
        sub_images.push({
          product_sub_img: upload_files[upload_idx]?.url,
        });
        upload_idx++;
      } else {
        sub_images.push(obj.sub_images[i]);
      }
    }
    for (var i = 0; i < obj.description_images.length; i++) {
      if (obj.description_images[i]?.product_description_file) {
        description_images.push({
          product_description_img: upload_files_d[upload_idx_d]?.url,
        });
        upload_idx_d++;
      } else {
        description_images.push(obj.description_images[i]);
      }
    }
    for (var i = 0; i < item.groups.length; i++) {
      if (item.groups[i].is_delete != 1) {
        let is_exist_null_value = (item.groups[i]?.options ?? []).filter(item => isNaN(parseInt(item?.option_price)));
        if (is_exist_null_value.length > 0) {
          toast.error('옵션 변동가는 필수 입니다.');
          return;
        }
      }
    }


    {
      type == 'edit' ?
        obj?.id ? //수정
          sort ?
            result = await apiManager('products', 'update', { ...obj, id: obj?.id, ...category_ids, category_ids: JSON.stringify(category_ids_arr), sub_images, description_images, properties: JSON.stringify(item.properties), ...옵션페이로드(item), sort_idx: sort })
            :
            result = await apiManager('products', 'update', { ...obj, id: obj?.id, ...category_ids, category_ids: JSON.stringify(category_ids_arr), sub_images, description_images, properties: JSON.stringify(item.properties), ...옵션페이로드(item) })
          : //추가
          result = await apiManager('products', 'create', { ...obj, ...category_ids, category_ids: JSON.stringify(category_ids_arr), sub_images, description_images, user_id: user?.id, properties: JSON.stringify(item.properties), ...옵션페이로드(item) })
        :
        result = await apiManager('products', 'create', { ...obj, ...category_ids, category_ids: JSON.stringify(category_ids_arr), sub_images, description_images, user_id: user?.id, properties: JSON.stringify(item.properties), ...옵션페이로드(item) })
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      window.history.back();
    }
  }
  const onSaveReview = async () => {
    let result = undefined;
    let obj = review;
    obj['product_id'] = item?.id;
    obj['user_id'] = user?.id;

    if (obj?.id) {
      result = await apiManager('product-reviews', 'update', { ...obj })
    } else {
      result = await apiManager('product-reviews', 'create', { ...obj })
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      setReview({});
      setReviewAction(false);
      onChangeReviewsPage({
        ...reviewSearchObj,
        page: 1,
      })
    }
  }
  const tab_list = [
    {
      value: 0,
      label: '상품정보'
    },
    ...(themeDnsData?.setting_obj?.is_use_consignment == 1 && themeDnsData.id != 5 ? [
      {
        value: 1,
        label: '위탁정보'
      }
    ] : []),
    /*...(router.query?.edit_category == 'edit' && themeDnsData.id != 5 ? [
      {
        value: 2,
        label: '상품리뷰 관리'
      }
    ] : []),*/
  ]

  useEffect(() => {
    //console.log(item)

  }, [])

  useEffect(() => {
    let point_ = parseInt(item.product_sale_price * 0.005)
    if (defPoint == 1) {
      setPoint(point_.toLocaleString('ko-KR'))
    }
  }, [item.product_sale_price, defPoint])

  /*useEffect(() => { //이 코드 실행시 point가 없으면 point_save가 NaN 되는 문제 발생
    let value = parseInt(point?.replace(/,/g, ''))
    setItem({
      ...item,
      ['point_save']: value
    })
    //console.log(item)
  }, [point])*/

  const consignmentSet = (row) => {
    setItem((prevItem) => ({  //비동기 문제 방지용
      ...prevItem,
      ['consignment_user_name']: row['user_name'],
      ['consignment_name']: row['name'],
      ['consignment_user_phone_num']: row['phone_num'],
      ['product_type']: 1
    }))
    setDialogOpen(false)
  }



  const TABS = [
    {
      value: 'description',
      label: 'Detail',
      component: themeDnsData?.id != 74 ? item?.product_description ?
        <StyledReactQuill
          className='none-scroll'
          value={`
    ${item?.product_description ?? ''}
    ${themeDnsData?.basic_info}
  `}
          readOnly={true}
          theme={"bubble"}
          bounds={'.app'}
        />
        :
        null
        :
        <>
          <div>
            {item?.description_images?.map((img, index) => {
              if (img?.product_description_file) {
                return <img
                  key={index}
                  src={img?.product_description_file?.preview}
                  alt="Product Image"
                  style={{ maxWidth: '100%', height: 'auto', margin: '0 auto' }}
                />
              } else if (img?.product_description_img) {
                return <img
                  key={index}
                  src={img?.product_description_img}
                  alt="Product Image"
                  style={{ maxWidth: '100%', height: 'auto', margin: '0 auto' }}
                />
              }
            })}
          </div>
        </>,
    },

  ];


  return (
    <>
      {!loading &&
        <>

          <Row style={{ margin: '0 0 1rem 0', columnGap: '0.5rem' }}>
            {tab_list.map((tab) => (
              <Button
                variant={tab.value == currentTab ? 'contained' : 'outlined'}
                onClick={() => {
                  setCurrentTab(tab.value)
                }}
              >{tab.label}</Button>
            ))}
          </Row>
          <Grid container spacing={3}>
            {currentTab == 0 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          대표이미지등록
                        </Typography>
                        <Upload disabled={user?.level < 40} file={item.product_file || item.product_img} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['product_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }}
                          onDelete={() => {
                            setItem(
                              {
                                ...item,
                                ['product_file']: undefined,
                                ['product_img']: '',
                              }
                            )
                          }}
                          fileExplain={{
                            width: '(512x512 추천)'//파일 사이즈 설명
                          }}
                        />
                      </Stack>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          개별이미지등록 (여러장 업로드)
                        </Typography>
                        <Upload
                          disabled={user?.level < 40}
                          multiple
                          thumbnail={true}
                          files={item.sub_images.map(img => {
                            if (img.is_delete == 1) {
                              return undefined;
                            }
                            if (img.product_sub_img) {
                              return img.product_sub_img
                            } else {
                              return img.product_sub_file
                            }
                          }).filter(e => e)}
                          onDrop={(acceptedFiles) => {
                            if (user?.level >= 40) {
                              handleDropMultiFile(acceptedFiles)
                            }
                          }}
                          onRemove={(inputFile) => {
                            if (user?.level >= 40) {
                              handleRemoveFile(inputFile)
                            }
                          }}
                          onRemoveAll={() => {
                            if (user?.level >= 40) {
                              handleRemoveAllFiles();
                            }
                          }}
                          fileExplain={{
                            width: '(512x512 추천)'//파일 사이즈 설명
                          }}
                          imageSize={{ //썸네일 사이즈
                            width: 200,
                            height: 200
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      {themeCategoryList.map((group, index) => (
                        <>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                              {group?.category_group_name}
                            </Typography>
                            <SelectCategoryComponent
                              disabled={user?.level < 40}
                              curCategories={curCategories[index] ?? []}
                              categories={group?.product_categories}
                              categoryChildrenList={categoryChildrenList[index] ?? []}
                              onClickCategory={onClickCategory}
                              noneSelectText={`${group?.category_group_name}를 선택해 주세요`}
                              sort_idx={index}
                              id={group?.id}
                            />
                          </Stack>
                        </>
                      ))}

                      {/* 선택된 카테고리(1상품 N카테고리) — 칩으로 표시/삭제 */}
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          선택된 카테고리 ({selectedCategoryIds.length})
                        </Typography>
                        {selectedCategoryIds.length > 0 ? (
                          <Row style={{ flexWrap: 'wrap', gap: '6px' }}>
                            {selectedCategoryIds.map((cid) => {
                              const cat = findCategoryById(cid);
                              return (
                                <Box key={cid} sx={{ display: 'inline-flex', alignItems: 'center', px: 1, py: 0.25, border: '1px solid', borderColor: 'primary.main', borderRadius: 1, bgcolor: 'primary.lighter' }}>
                                  <span style={{ fontSize: 13 }}>{cat?.category_name ?? `#${cid}`}</span>
                                  <Icon icon="mdi:close" width={16} height={16} style={{ marginLeft: 4, cursor: 'pointer' }} onClick={() => onRemoveSelectedCategory(cid)} />
                                </Box>
                              );
                            })}
                          </Row>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            위 목록에서 카테고리를 클릭하면 담깁니다. 다시 클릭하면 제거. (여러 개 선택 가능)
                          </Typography>
                        )}
                      </Stack>

                      {themePropertyList.map((group, index) => (
                        <>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                              {group?.property_group_name}
                            </Typography>
                            <Row style={{ flexWrap: 'wrap' }}>
                              {group?.product_properties && group?.product_properties.map((property, idx) => (
                                <>
                                  <FormControlLabel
                                    sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                                    label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>{property?.property_name}</Typography>}
                                    control={
                                      <Checkbox
                                        disabled={user?.level < 40}
                                        checked={
                                          group?.brand_id == 5 && property?.property_name == '특가(PRICE DOWN)'
                                            ?
                                            item?.product_price > item?.product_sale_price
                                            :
                                            item.properties[`${group?.id}`] && (item.properties[`${group?.id}`] ?? [])?.includes(property?.id)}
                                      />}
                                    onChange={(e) => {
                                      let property_obj = { ...item.properties };
                                      let show_status_ = 0
                                      if (!property_obj[`${group?.id}`] || group?.is_can_select_multiple == 0) {
                                        property_obj[`${group?.id}`] = [];
                                      }
                                      if (e.target.checked) {
                                        property_obj[`${group?.id}`].push(property?.id);
                                      } else {
                                        let find_idx = property_obj[`${group?.id}`].indexOf(property?.id);
                                        if (find_idx >= 0) {
                                          property_obj[`${group?.id}`].splice(find_idx, 1);
                                        }
                                      }
                                      /*if (group?.brand_id == 5 && property?.property_name == 'NEW UP-DATE' && router.query?.edit_category == 'add') {
                                        setDefaultCorner(!defaultCorner)
                                      }*/
                                      let properties_ = Object.values(property_obj).flat();
                                      if (properties_.includes(12) || properties_.includes(13) || properties_.includes(14) || properties_.includes(15) || properties_.includes(24)) {
                                        show_status_ = 1
                                      }
                                      setItem({
                                        ...item,
                                        properties: property_obj,
                                        show_status: show_status_
                                      })
                                      //console.log(item.properties)
                                    }}
                                  />
                                </>
                              ))}
                            </Row>
                          </Stack>
                        </>
                      ))}
                      {
                        themeDnsData?.id == 5 &&
                        <>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                              상태
                            </Typography>
                            <Row style={{ flexWrap: 'wrap' }}>
                              <FormControlLabel
                                sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                                label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>판매중</Typography>}
                                control={
                                  <Checkbox
                                    checked={
                                      item.status == 0 ? true : false
                                    }
                                    onChange={(e) => {
                                      let status_ = item.status;

                                      if (e.target.checked) {
                                        status_ = 0;
                                      }

                                      setItem({
                                        ...item,
                                        status: status_
                                      })
                                    }}
                                  />}
                              />
                              <FormControlLabel
                                sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                                label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>예약중</Typography>}
                                control={
                                  <Checkbox
                                    checked={
                                      item.status == 6 ? true : false
                                    }
                                    onChange={(e) => {
                                      let status_ = item.status;

                                      if (e.target.checked) {
                                        status_ = 6;
                                      }

                                      setItem({
                                        ...item,
                                        status: status_
                                      })
                                    }}
                                  />}
                              />
                              <FormControlLabel
                                sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                                label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>매장문의</Typography>}
                                control={
                                  <Checkbox
                                    checked={
                                      item.status == 7 ? true : false
                                    }
                                    onChange={(e) => {
                                      let status_ = item.status;

                                      if (e.target.checked) {
                                        status_ = 7;
                                      }

                                      setItem({
                                        ...item,
                                        status: status_
                                      })
                                    }}
                                  />}
                              />
                              <FormControlLabel
                                sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                                label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>거래진행중</Typography>}
                                control={
                                  <Checkbox
                                    checked={
                                      item.status == 1 ? true : false
                                    }
                                    onChange={(e) => {
                                      let status_ = item.status;

                                      if (e.target.checked) {
                                        status_ = 1;
                                      }

                                      setItem({
                                        ...item,
                                        status: status_
                                      })
                                    }}
                                  />}
                              />
                            </Row>
                            <Row style={{ flexWrap: 'wrap' }}>
                              <FormControlLabel
                                sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                                label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>품절</Typography>}
                                control={
                                  <Checkbox
                                    checked={
                                      item.status == 2 ? true : false
                                    }
                                    onChange={(e) => {
                                      let status_ = item.status;

                                      if (e.target.checked) {
                                        status_ = 2;
                                      }

                                      setItem({
                                        ...item,
                                        status: status_
                                      })
                                    }}
                                  />}
                              />
                              <FormControlLabel
                                sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                                label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>택배수거</Typography>}
                                control={
                                  <Checkbox
                                    checked={
                                      item.status == 3 ? true : false
                                    }
                                    onChange={(e) => {
                                      let status_ = item.status;

                                      if (e.target.checked) {
                                        status_ = 3;
                                      }

                                      setItem({
                                        ...item,
                                        status: status_
                                      })
                                    }}
                                  />}
                              />
                              <FormControlLabel
                                sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                                label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>방문수거</Typography>}
                                control={
                                  <Checkbox
                                    checked={
                                      item.status == 4 ? true : false
                                    }
                                    onChange={(e) => {
                                      let status_ = item.status;

                                      if (e.target.checked) {
                                        status_ = 4;
                                      }

                                      setItem({
                                        ...item,
                                        status: status_
                                      })
                                    }}
                                  />}
                              />
                              <FormControlLabel
                                sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                                label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>비공개</Typography>}
                                control={
                                  <Checkbox
                                    checked={
                                      item.status == 5 ? true : false
                                    }
                                    onChange={(e) => {
                                      let status_ = item.status;

                                      if (e.target.checked) {
                                        status_ = 5;
                                      }

                                      setItem({
                                        ...item,
                                        status: status_
                                      })
                                    }}
                                  />}
                              />
                            </Row>
                          </Stack>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                              판매자 구분
                            </Typography>
                            <Row style={{ flexWrap: 'wrap' }}>
                              <FormControlLabel
                                sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                                label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>그랑파리</Typography>}
                                control={
                                  <Checkbox
                                    checked={
                                      item.product_type == 0 ? true : false
                                    }
                                    onChange={(e) => {
                                      let productType = item.product_type;

                                      if (e.target.checked) {
                                        productType = 0;
                                      }

                                      setItem({
                                        ...item,
                                        product_type: productType
                                      })
                                    }}
                                  />}
                              />
                              <FormControlLabel
                                sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                                label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>위탁(회원)</Typography>}
                                control={
                                  <Checkbox
                                    checked={
                                      item.product_type == 1 ? true : false
                                    }
                                    onChange={(e) => {
                                      let productType = item.product_type;

                                      if (e.target.checked) {
                                        productType = 1;
                                      }
                                      setItem({
                                        ...item,
                                        product_type: productType
                                      })
                                    }}
                                  />}
                              />
                              <FormControlLabel
                                sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                                label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>위탁(비회원)</Typography>}
                                control={
                                  <Checkbox
                                    checked={
                                      item.product_type == 2 ? true : false
                                    }
                                    onChange={(e) => {
                                      let productType = item.product_type;

                                      if (e.target.checked) {
                                        productType = 2;
                                      }

                                      setItem({
                                        ...item,
                                        product_type: productType
                                      })
                                    }}
                                  />}
                              />
                            </Row>
                          </Stack>
                          {
                            item?.product_type == 1 &&
                            <>
                              <Row>
                                <Button
                                  variant="contained"
                                  size="large"
                                  style={{ height: '56px', marginRight: '1rem' }}
                                  onClick={() => {
                                    setDialogOpen(true)
                                  }}
                                >
                                  회원 검색
                                </Button>
                                <TextField
                                  style={{ flexGrow: 1 }}
                                  value={`${item?.consignment_name}(${item?.consignment_user_name})`}
                                  disabled
                                />
                              </Row>
                              <Dialog
                                onClose={() => { setDialogOpen(false) }}
                                open={dialogOpen}
                                sx={{
                                }}
                                PaperProps={{
                                  sx: {
                                    minWidth: '300px'
                                  }
                                }}
                              >
                                <DialogTitle>회원 검색</DialogTitle>
                                <Stack spacing={3}>
                                  <Card>
                                    <ManagerTable
                                      data={userData}
                                      columns={userColumns}
                                      searchObj={userSearchObj}
                                      onChangePage={onChangeUserPage}
                                      minimal={true}
                                    />
                                  </Card>
                                </Stack>
                              </Dialog>
                            </>
                          }
                          {
                            item?.product_type == 2 &&
                            <>
                              <TextField
                                label='판매자 이름'
                                value={item.consignment_none_user_name}
                                placeholder=""
                                onChange={(e) => {
                                  setItem(
                                    {
                                      ...item,
                                      ['consignment_none_user_name']: e.target.value
                                    }
                                  )
                                }} />
                              <TextField
                                label='판매자 연락처'
                                value={item.consignment_none_user_phone_num}
                                placeholder=""
                                onChange={(e) => {
                                  setItem(
                                    {
                                      ...item,
                                      ['consignment_none_user_phone_num']: e.target.value
                                    }
                                  )
                                }} />
                            </>
                          }
                        </>
                      }
                      {/*<TextField
                        disabled={user?.level < 40}
                        label='상품코드'
                        value={item.product_code}
                        placeholder="선택"
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['product_code']: e.target.value
                            }
                          )
                        }} />*/}
                      <TextField
                        disabled={user?.level < 40}
                        label='상품명 (필수)'
                        value={item.product_name}
                        placeholder="예시) 블랙 럭셔리 팔찌, 팔찌 1위 상품"
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['product_name']: e.target.value
                            }
                          )
                        }} />
                      {/*<TextField
                        label='상품사이즈'
                        value={item.product_size}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['product_size']: e.target.value
                            }
                          )
                        }} />
                        <TextField
                        label='상품컬러'
                        value={item.product_color}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['product_color']: e.target.value
                            }
                          )
                        }} />*/}
                      {!themeDnsData?.none_use_column_obj['products']?.includes('product_comment') &&
                        <>
                          <TextField
                            disabled={user?.level < 40}
                            label='상품 간단한 설명'
                            value={item.product_comment}
                            placeholder="예시) 주문폭주!! 다양한 디자인으로 어떠한 룩도 소화!"
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['product_comment']: e.target.value
                                }
                              )
                            }} />
                          <TextField
                            disabled={user?.level < 40}
                            label='제품 특징 / 사양'
                            value={item.product_spec}
                            multiline
                            minRows={4}
                            placeholder={"제품 상단(가격 옆)에 표시됩니다. 줄바꿈으로 여러 줄 입력 가능."}
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['product_spec']: e.target.value
                                }
                              )
                            }} />
                        </>}

                      {
                        themeDnsData.id == 5 &&
                        <>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                              상품특성
                            </Typography>

                            {defaultItemCharacter.map((character, index) => (
                              <>
                                <Row style={{ columnGap: '0.5rem' }}>
                                  <FormControl variant="outlined" sx={{ flexGrow: 1 }}>
                                    <InputLabel>{character.name}</InputLabel>
                                    <OutlinedInput
                                      label={character.name}
                                      value={item?.characters[index]?.character_value ?? ''}
                                      onClick={() => {
                                        let character_list = [...item.characters];
                                        if (character_list.length == 0) {
                                          defaultItemCharacter.map((character) => {
                                            character_list.push({
                                              character_name: character.name,
                                              character_value: '',
                                            })
                                          })
                                          setItem(
                                            {
                                              ...item,
                                              ['characters']: character_list
                                            }
                                          )
                                        }
                                      }}
                                      onChange={(e) => {
                                        let character_list = item?.characters;
                                        character_list[index].character_value = e.target.value;
                                        setItem(
                                          {
                                            ...item,
                                            ['characters']: character_list
                                          }
                                        )
                                      }} />
                                  </FormControl>
                                </Row>
                              </>
                            ))}
                          </Stack>
                        </>
                      }
                      <>

                        {
                          themeDnsData?.is_use_seller != 1 ?
                            <>
                              <FormControl variant="outlined">
                                <InputLabel>판매가 (필수)</InputLabel>
                                <OutlinedInput
                                  label='판매가 (필수)'
                                  type="text"
                                  value={salePrice}
                                  endAdornment={<InputAdornment position="end">원</InputAdornment>}
                                  onChange={(e) => {
                                    let value = Math.max(0, parseInt(e.target.value.replace(/,/g, '')) || 0)
                                    // 정가(product_price)를 언제 따라 올릴 것인가.
                                    //
                                    // 예전 규칙은 '할인 표시가 꺼져 있을 때만' 이었다. 그런데 이 체크는
                                    // 저장되는 값이 아니라 열 때마다 `정가 > 판매가` 로 되짚은 추측이다.
                                    // 그래서 할인 중이던 상품은 **열자마자 체크가 켜져 있고**, 거기서 판매가만
                                    // 고치면 정가가 옛 값에 남았다 — 사람이 체크를 누른 적이 없어도 그렇게 된다
                                    // (2026-08-27 확인, 295건).
                                    //   · 새 판매가가 옛 정가보다 높으면 → 주문서에 음수 할인이 뜬다
                                    //   · 낮으면 → 가맹점이 설정한 적 없는 할인율이 고객 화면에 뜬다
                                    //
                                    // 기준을 체크가 아니라 **값**으로 바꾼다. 판매가가 정가 이상이 되면
                                    // 할인은 성립하지 않으므로 정가도 함께 올린다.
                                    const 정가 = item?.product_price || 0
                                    const 할인성립 = useDiscount && 정가 > value
                                    setItem({
                                      ...item,
                                      ['product_sale_price']: value,
                                      ...(할인성립 ? {} : { ['product_price']: value }),
                                    })
                                    setSalePrice(value.toLocaleString('ko-KR'))
                                    if (!할인성립) {
                                      setPrice(value.toLocaleString('ko-KR'))
                                      // 할인이 깨졌으면 체크도 내려 화면과 값이 어긋나지 않게 한다.
                                      if (useDiscount) setUseDiscount(false)
                                    }
                                  }} />
                              </FormControl>
                              <FormControlLabel
                                sx={{ ml: 0, alignSelf: 'flex-start', width: 'fit-content' }}
                                control={<Checkbox
                                  checked={useDiscount}
                                  onChange={(e) => {
                                    const on = e.target.checked
                                    setUseDiscount(on)
                                    if (!on) {
                                      // 할인 표시 해제: 정가를 판매가와 동일하게 되돌려 취소선/할인율이 사라지게 한다
                                      setItem({ ...item, ['product_price']: item?.product_sale_price || 0 })
                                      setPrice((item?.product_sale_price || 0).toLocaleString('ko-KR'))
                                    }
                                  }}
                                />}
                                label="할인 표시하기 (할인 전 가격 별도 입력)"
                              />
                              {useDiscount &&
                                <FormControl variant="outlined">
                                  <InputLabel>할인 전 가격(정가)</InputLabel>
                                  <OutlinedInput
                                    label='할인 전 가격(정가)'
                                    type="text"
                                    value={price}
                                    endAdornment={<InputAdornment position="end">원</InputAdornment>}
                                    onChange={(e) => {
                                      let value = Math.max(0, parseInt(e.target.value.replace(/,/g, '')) || 0)
                                      setItem({ ...item, ['product_price']: value })
                                      setPrice(value.toLocaleString('ko-KR'))
                                    }} />
                                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                    판매가보다 높게 입력하세요. 쇼핑몰에 정가는 취소선, 할인율(%)이 함께 표시됩니다.
                                  </Typography>
                                </FormControl>
                              }
                            </>
                            :
                            <>
                              <FormControl variant="outlined">
                                <InputLabel>상품가</InputLabel>
                                <OutlinedInput
                                  disabled={user?.level < 40}
                                  label='상품가'
                                  type="text"
                                  value={user?.level >= 20 ? salePrice : (() => { const base = item?.product_sale_price; const aO = user?.oper_trx_fee_type == 1 ? base + (user?.oper_trx_fee ?? 0) : base * (1 + (user?.oper_trx_fee ?? 0)); if (user?.level == 15) return parseInt(Math.round(Math.floor(Number(aO.toFixed(6))) / 1000) * 1000); const aS = user?.seller_trx_fee_type == 1 ? aO + (user?.seller_trx_fee ?? 0) : aO * (1 + (user?.seller_trx_fee ?? 0)); return parseInt(Math.round(Math.floor(Number(aS.toFixed(6))) / 1000) * 1000); })()}
                                  endAdornment={<InputAdornment position="end">원</InputAdornment>}
                                  onChange={(e) => {
                                    let value = parseInt(e.target.value.replace(/,/g, ''))
                                    //console.log(value)
                                    setItem(
                                      {
                                        ...item,
                                        ['product_price']: value,
                                        ['product_sale_price']: value
                                      }
                                    )
                                    setSalePrice(value.toLocaleString('ko-KR'))
                                    //console.log(price)
                                  }} />
                              </FormControl>
                            </>
                        }
                      </>
                      {/*<FormControl variant="outlined">
                        <InputLabel>배송비</InputLabel>
                        <OutlinedInput
                          label='배송비'
                          type='text'
                          inputProps={{ inputMode: 'numeric' }}
                          value={금액표시(item.delivery_fee)}
                          endAdornment={<InputAdornment position="end">원</InputAdornment>}
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['delivery_fee']: 금액입력(e)
                              }
                            )
                          }} />
                      </FormControl>*/}
                      {
                        themeDnsData.id == 5 &&
                        <>
                          <Row style={{ justifyContent: 'space-between' }}>
                            <FormControlLabel
                              sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                              label={<div>마일리지 기본적용<br />(판매가의 0.5%)</div>}
                              control={
                                <Checkbox
                                  checked={defPoint}
                                  onChange={() => {
                                    setDefPoint(!defPoint)
                                  }}
                                />
                              }
                            />
                            <FormControl variant="outlined" style={{ flexGrow: '1' }}>

                              <OutlinedInput

                                type="text"
                                disabled={defPoint}
                                value={point}
                                endAdornment={<InputAdornment position="end">원</InputAdornment>}
                                onChange={(e) => {
                                  let value = parseInt(e.target.value.replace(/,/g, ''))
                                  setItem(
                                    {
                                      ...item,
                                      ['point_save']: value
                                    }
                                  )
                                  //console.log(item.point_save)
                                  setPoint(value.toLocaleString('ko-KR'))
                                }} />
                            </FormControl>
                          </Row>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                              결제수단
                            </Typography>
                            <Row style={{ flexWrap: 'wrap' }}>
                              <FormControlLabel
                                sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                                label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>마일리지 사용 가능</Typography>}
                                control={
                                  <Checkbox
                                    checked={
                                      item.point_usable == 1 ? true : false
                                    }
                                    onChange={(e) => {
                                      let pointUsable = item.point_usable;

                                      if (e.target.checked) {
                                        pointUsable = 1;
                                      } else {
                                        pointUsable = 0;
                                      }

                                      setItem({
                                        ...item,
                                        point_usable: pointUsable
                                      })
                                    }}
                                  />}
                              />
                              <FormControlLabel
                                sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                                label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>현금 사용 가능</Typography>}
                                control={
                                  <Checkbox
                                    checked={
                                      item.cash_usable == 1 ? true : false
                                    }
                                    onChange={(e) => {
                                      let cashUsable = item.cash_usable;

                                      if (e.target.checked) {
                                        cashUsable = 1;
                                      } else {
                                        cashUsable = 0;
                                      }

                                      setItem({
                                        ...item,
                                        cash_usable: cashUsable
                                      })
                                    }}
                                  />}
                              />
                              <FormControlLabel
                                sx={{ alignSelf: 'flex-start', width: 'fit-content' }}
                                label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>PG사 이용 가능</Typography>}
                                control={
                                  <Checkbox
                                    checked={
                                      item.pg_usable == 1 ? true : false
                                    }
                                    onChange={(e) => {
                                      let pgUsable = item.pg_usable;

                                      if (e.target.checked) {
                                        pgUsable = 1;
                                      } else {
                                        pgUsable = 0;
                                      }

                                      setItem({
                                        ...item,
                                        pg_usable: pgUsable
                                      })
                                    }}
                                  />}
                              />
                            </Row>
                          </Stack>
                        </>
                      }
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          상품설명
                        </Typography>

                        {
                          themeDnsData?.id != 74 ?
                            <>
                              <ReactQuillComponent
                                value={item.product_description}
                                setValue={(value) => {
                                  setItem({
                                    ...item,
                                    product_description: value,
                                  })
                                }}
                              />
                            </>
                            :
                            <>
                              <Upload
                                multiple
                                thumbnail={true}
                                files={item.description_images.map(img => {
                                  if (img.is_delete == 1) {
                                    return undefined;
                                  }
                                  if (img.product_description_img) {
                                    return img.product_description_img
                                  } else {
                                    return img.product_description_file
                                  }
                                }).filter(e => e)}
                                onDrop={(acceptedFiles) => {
                                  handleDropMultiDescription(acceptedFiles)
                                }}
                                onRemove={(inputFile) => {
                                  handleRemoveDescription(inputFile)
                                }}
                                onRemoveAll={() => {
                                  handleRemoveAllDescriptionFiles();
                                }}
                                fileExplain={{
                                  //width: '(512x512 추천)'
                                }}
                                imageSize={{ //썸네일 사이즈
                                  width: 200,
                                  height: 200
                                }}
                              />
                            </>
                        }
                      </Stack>
                      {/* 옵션 통합 편집 — 선택옵션 · 추가상품 · 조합형 · 재고 · 손님 입력항목 · 상품정보.
                          예전엔 '상품특성'과 '상품옵션' 두 덩어리가 여기 펼쳐져 있었고 뜻이 겹쳤다.
                          (가맹점이 넣은 특성 6건 중 5건이 오용이었다 — 키·값 뒤집기, 특성값에 가격 기입) */}
                      <ProductOptionEditor item={item} setItem={setItem} disabled={user?.level < 40} />
                      {
                        themeDnsData?.id == 74 && user?.level >= 40 && <>
                          <Stack spacing={1}>
                            <TextField
                              fullWidth
                              label="상품메모"
                              multiline
                              rows={4}
                              value={item.memo}
                              onChange={(e) => {
                                setItem({
                                  ...item,
                                  ['memo']: e.target.value
                                })
                              }}
                            />
                          </Stack>
                        </>
                      }
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 1 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      판매자
                    </Typography>
                    <FormControlLabel label={<Typography style={{ fontWeight: 'bold', fontSize: themeObj.font_size.size5 }}>{themeDnsData?.name}</Typography>} control={<Checkbox checked={item?.product_type == 0}
                      onChange={(e) => {
                        setItem({
                          ...item,
                          product_type: 0,
                          consignment_user_name: '',
                          consignment_none_user_name: '',
                          consignment_none_user_phone_num: '',
                          consignment_fee: 0,
                          consignment_fee_type: 0,
                        })

                      }} />} />
                    <FormControlLabel label={<Typography style={{ fontWeight: 'bold', fontSize: themeObj.font_size.size5 }}>회원</Typography>} control={<Checkbox checked={item?.product_type == 1} />}
                      onChange={(e) => {
                        setItem({
                          ...item,
                          product_type: 1,
                          consignment_user_name: '',
                          consignment_none_user_name: '',
                          consignment_none_user_phone_num: '',
                        })
                      }} />
                    <FormControlLabel label={<Typography style={{ fontWeight: 'bold', fontSize: themeObj.font_size.size5 }}>비회원</Typography>} control={<Checkbox checked={item?.product_type == 2} />}
                      onChange={(e) => {
                        setItem({
                          ...item,
                          product_type: 2,
                          consignment_user_name: '',
                          consignment_none_user_name: '',
                          consignment_none_user_phone_num: '',
                        })
                      }} />
                    <Stack spacing={3} style={{ marginTop: '1rem' }}>
                      {item?.product_type == 1 &&
                        <>
                          <TextField
                            label='유저아이디'
                            value={item.consignment_user_name}
                            placeholder="유저아이디"
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['consignment_user_name']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      {item?.product_type == 2 &&
                        <>
                          <TextField
                            label='판매자이름'
                            value={item.consignment_none_user_name}
                            placeholder="판매자이름"
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['consignment_none_user_name']: e.target.value
                                }
                              )
                            }} />
                          <TextField
                            label='판매자연락처'
                            value={item.consignment_none_user_phone_num}
                            placeholder="판매자연락처"
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['consignment_none_user_phone_num']: e.target.value
                                }
                              )
                            }} />
                        </>}
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <FormControl>
                        <InputLabel>수수료타입</InputLabel>
                        <Select label='수수료타입' value={item.consignment_fee_type}
                          disabled={item?.product_type == 0}
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['consignment_fee_type']: e.target.value
                              }
                            )
                          }}>
                          <MenuItem value={0}>{'금액단위'}</MenuItem>
                          <MenuItem value={1}>{'퍼센트단위'}</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl variant="outlined" sx={{ flexGrow: 1 }}>
                        <InputLabel>수수료</InputLabel>
                        <OutlinedInput
                          disabled={item?.product_type == 0}
                          label='수수료'
                          type='text'
                          inputProps={{ inputMode: 'numeric' }}
                          value={금액표시(item.consignment_fee)}
                          endAdornment={<InputAdornment position="end">{item.consignment_fee_type == 0 ? "원" : '%'}</InputAdornment>}
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['consignment_fee']: 금액입력(e)
                              }
                            )
                          }} />
                      </FormControl>
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 2 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <div style={{ padding: '0 0.75rem' }}>
                      <Button style={{ width: '100%', }} variant="outlined" onClick={() => {
                        setReview({
                          title: '',
                          content: '',
                        });
                        setReviewAction(true);
                      }}>
                        + 리뷰 추가하기
                      </Button>
                    </div>
                    <ManagerTable
                      data={reviewData}
                      columns={reviewColumns}
                      searchObj={reviewSearchObj}
                      onChangePage={onChangeReviewsPage}
                      add_button_text={''}
                    />
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      {reviewAction ?
                        <>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                              대표이미지등록
                            </Typography>
                            <Upload file={review.profile_file || review.profile_img} onDrop={(acceptedFiles) => {
                              const newFile = acceptedFiles[0];
                              if (newFile) {
                                setReview(
                                  {
                                    ...review,
                                    ['profile_file']: Object.assign(newFile, {
                                      preview: URL.createObjectURL(newFile),
                                    })
                                  }
                                );
                              }
                            }}
                              onDelete={() => {
                                setReview(
                                  {
                                    ...review,
                                    ['profile_file']: undefined,
                                    ['profile_img']: '',
                                  }
                                )
                              }}
                              fileExplain={{
                                width: '(512x512 추천)'//파일 사이즈 설명
                              }}
                            />
                          </Stack>
                          <Stack spacing={1}>
                            <TextField
                              label='제목'
                              value={review.title}
                              onChange={(e) => {
                                setReview(
                                  {
                                    ...review,
                                    ['title']: e.target.value
                                  }
                                )
                              }} />
                          </Stack>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                              별점
                            </Typography>
                            <Rating value={review?.scope / 2} precision={0.5} style={{ marginTop: '0' }} onChange={(e) => {
                              setReview(
                                {
                                  ...review,
                                  ['scope']: e.target.value * 2
                                }
                              )
                            }} />
                          </Stack>
                          <Stack spacing={1}>
                            <TextField
                              fullWidth
                              label="내용"
                              multiline
                              rows={4}
                              value={review.content}
                              onChange={(e) => {
                                setReview({
                                  ...review,
                                  ['content']: e.target.value
                                })
                              }}
                            />
                          </Stack>
                          <Stack spacing={1}>
                            <Button variant="contained" style={{ marginTop: 'auto', height: '56px' }} onClick={() => {
                              setModal({
                                func: () => { onSaveReview() },
                                icon: 'material-symbols:edit-outline',
                                title: '저장 하시겠습니까?'
                              })
                            }}>{review?.id > 0 ? '수정' : '추가'}</Button>
                          </Stack>

                        </>
                        :
                        <>

                        </>}

                    </Stack>
                  </Card>
                </Grid>
              </>}
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={0} style={{ display: `${user?.level < 40 ? 'none' : 'flex'}`, flexDirection: 'row' }}>
                  {router.query?.edit_category == 'edit' ?
                    <>
                      {/*
                      <Button variant="contained" style={{
                        height: '48px', width: '180px', marginLeft: 'auto',
                      }} onClick={() => {
                        const updatedItem = {
                          ...item,
                          sort_idx: item?.max_sort_idx + 1
                        }
                        setItem(updatedItem)
                        setModal({
                          func: () => { onSave('edit', updatedItem.sort_idx) },
                          icon: 'material-symbols:edit-outline',
                          title: '변경 사항을 저장 하시겠습니까?'
                        })
                      }}>
                        저장(최상단 노출)
                      </Button>
                      */}
                      {
                        themeDnsData?.id == 74 &&
                        <>
                          <Button variant="outlined" style={{
                            height: '48px', width: '180px',
                          }} onClick={() => {
                            setPopupOpen(true);
                          }}>
                            미리보기
                          </Button>
                        </>
                      }
                      <Button variant="contained" style={{
                        height: '48px', width: '180px', marginLeft: 'auto',
                      }} onClick={() => {
                        setModal({
                          func: () => { onSave('edit') },
                          icon: 'material-symbols:edit-outline',
                          title: '변경 사항을 저장 하시겠습니까?'
                        })
                      }}>
                        저장
                      </Button>
                      <Button variant="outlined" style={{
                        height: '48px', width: '180px', marginLeft: '1rem'
                      }} onClick={() => {
                        setModal({
                          func: () => { onSave('copy') },
                          icon: 'material-symbols:edit-outline',
                          title: '신규 상품으로 등록 하시겠습니까?'
                        })
                      }}>
                        신규 상품으로 등록
                      </Button>
                    </>
                    :
                    <>
                      {
                        themeDnsData?.id == 74 &&
                        <>
                          <Button variant="outlined" style={{
                            height: '48px', width: '180px',
                          }} onClick={() => {
                            setPopupOpen(true);
                          }}>
                            미리보기
                          </Button>
                        </>
                      }
                      <Button variant="contained" style={{
                        height: '48px', width: '120px', marginLeft: 'auto',
                      }} onClick={() => {
                        //console.log(item)
                        setModal({
                          func: () => { onSave() },
                          icon: 'material-symbols:edit-outline',
                          title: '저장 하시겠습니까?'
                        })
                      }}>
                        저장
                      </Button>
                    </>
                  }
                </Stack>
              </Card>
            </Grid>
          </Grid>










          {
            popupOpen &&
            <>
              <Dialog fullScreen open={popupOpen} onClose={() => setPopupOpen(false)} sx={{ width: '100vw', height: '100vh', zIndex: '9999', position: 'relative' }}>
                <div style={{ width: '100%', height: '5vh', color: 'magenta', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>화면 어느 곳이든 클릭하면 돌아갑니다.</div>
                <Wrapper onClick={() => { setPopupOpen(false); /*console.log(item)*/ }}>
                  <ContentWrapper>
                    {loading ?
                      <SkeletonProductDetails />
                      :
                      <>
                        {item && (
                          <>
                            <Grid container spacing={3}>
                              <Grid item xs={12} md={6} lg={6}>
                                <ProductDetailsCarousel product={item} type={'early'} />
                              </Grid>

                              <Grid item xs={12} md={6} lg={6} style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

                                <div style={{}}>
                                  {item?.brand_name &&
                                    <>
                                      <div style={{ fontSize: '30px', fontFamily: 'Playfair Display', fontWeight: 'bold', borderTop: '1px solid #ccc', padding: '1rem 0' }}>
                                        {item?.brand_name[0].category_en_name}
                                      </div>
                                    </>
                                  }
                                  <ItemName style={{ whiteSpace: 'wrap', fontFamily: 'Noto Sans KR', fontSize: '25px' }}>{item?.product_name}</ItemName>
                                  {/* 상품코드 표시 숨김
                                  {item?.product_code &&
                                    <>
                                      <ItemCharacter key_name={'상품코드'} value={item?.product_code} />
                                    </>}
                                  */}
                                  {/*themePropertyList.map((group, index) => {
                                    let property_list = (item?.properties ?? []).filter(el => el?.property_group_id == group?.id);
                                    property_list = property_list.map(property => {
                                      return property?.property_name
                                    })
                                    if (group?.property_group_name == '등급') {
                                      return <ItemCharacter key_name={group?.property_group_name} value={`${property_list.join(', ')}`} />
                                    }
                                  })*/}
                                  {themeDnsData?.id != 74 && item?.characters && item?.characters.map((character) => (
                                    <>
                                      <ItemCharacter key_name={character?.character_name} value={character?.character_value} />
                                    </>
                                  ))}
                                </div>
                                <div style={{ width: '100%' }}>
                                  <div style={{ borderTop: '1px solid #ccc', width: '100%', }} onClick={() => { }}>
                                    <ItemCharacter
                                      key_name={'판매가'}
                                      value={<>
                                        {commarNumber(parseInt(item?.product_sale_price))}원
                                      </>
                                      }
                                    />
                                    <div style={{ textAlign: 'right', color: 'gray' }}>
                                      구매시 {commarNumber(item?.product_sale_price * themeDnsData?.seller_point)}원 적립
                                    </div>
                                  </div>
                                  <div style={{ borderTop: '1px solid #ccc', width: '100%', padding: '1rem 0' }} onClick={() => { }}>
                                    <ItemCharacter
                                      key_name={'배송기간'}
                                      value={<div style={{}}>10-14일 내 도착 예정(검수 후 배송)</div>}
                                    />
                                  </div>
                                  <div style={{ width: '100%', padding: '1rem 0' }} onClick={() => { }}>
                                    <div style={{ color: 'gray' }}>
                                      모든 상품은 배송 전 검수를 거칩니다
                                    </div>
                                  </div>
                                  <Button
                                    disabled={item?.status != 0 || !(item?.product_sale_price > 0)}
                                    sx={{
                                      width: '100%',
                                      height: '60px',
                                      backgroundColor: 'black',
                                      borderRadius: '0',
                                      fontWeight: 'bold',
                                      fontSize: '18px',
                                      fontFamily: 'Playfair Display',
                                      color: 'white',
                                      border: '1px solid #999999',
                                      '&:hover': {
                                        backgroundColor: 'black',
                                      }
                                    }}

                                    onClick={() => {
                                    }}
                                  >구매하기</Button>
                                  <Row style={{ columnGap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                    <Button
                                      disabled={item?.status != 0 || !(item?.product_sale_price > 0)}
                                      sx={{
                                        width: '90%',
                                        height: '60px',
                                        //backgroundColor: 'white',
                                        borderRadius: '0',
                                        fontWeight: 'bold',
                                        fontSize: '18px',
                                        fontFamily: 'Playfair Display',
                                        color: '#999999',
                                        border: '1px solid #999999',
                                        '&:hover': {
                                          backgroundColor: 'transparent',
                                        }
                                      }}
                                      //variant='outlined'
                                      /*startIcon={<>
                                        <Icon icon={'mdi:cart'} />
                                      </>}*/
                                      onClick={() => {

                                      }}
                                    >장바구니</Button>
                                    <Icon
                                      icon='ph:heart-light'
                                      style={{
                                        width: '30px',
                                        height: '30px',
                                        color: `${themeDnsData?.theme_css.main_color}`,
                                        cursor: 'pointer',
                                        margin: '0 1rem'
                                      }}
                                      onClick={async () => {
                                      }}
                                    />
                                  </Row>
                                </div>
                              </Grid>
                            </Grid>
                            <Card style={{
                              marginTop: '2rem'
                            }}>
                              <Tabs
                                value={currentTab}
                                onChange={(event, newValue) => setCurrentTab(newValue)}
                                sx={{ px: 3, bgcolor: 'background.neutral' }}
                              >
                                {themeDnsData?.show_basic_info ?
                                  TABS.map((tab, index) => (
                                    <Tab key={tab.value} value={tab.value} label={tab.label} />
                                  ))
                                  :
                                  TABS.map((tab, index) => {
                                    if (index !== 1) {
                                      return (
                                        <Tab key={tab.value} value={tab.value} label={tab.label} />
                                      )
                                    }
                                  })
                                }
                              </Tabs>
                              <Divider />

                              {TABS.map(
                                (tab) =>
                                  tab.value === 'description' && (
                                    <Box
                                      key={tab.value}
                                      sx={{
                                        p: 3
                                      }}
                                    >
                                      {tab.component}
                                    </Box>
                                  )
                              )}
                            </Card>
                          </>
                        )}
                      </>}
                  </ContentWrapper>
                </Wrapper>
              </Dialog>
            </>
          }
        </>}
    </>
  )
}
ProductEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ProductEdit
