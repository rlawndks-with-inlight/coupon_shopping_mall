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
          page_size: 100000,
          product_category_group_id: id,
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
          display: `${hasChildCategories ? 'none' : ''}`
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
        placeholder='3글자 이상 입력해 주세요.'
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
        <CategoryContainer>
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
          <CategoryContainer key={index}>
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
      id: 'nickname',
      label: '작성자닉네임',
      action: (row) => {
        return row['nickname'] ?? "---"
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
  const [point, setPoint] = useState('')
  const [defPoint, setDefPoint] = useState(0)
  const [showStatus, setShowStatus] = useState()

  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [curCategories, setCurCategories] = useState({});
  const [categoryChildrenList, setCategoryChildrenList] = useState({});
  const [item, setItem] = useState({
    category_ids: [],
    product_name: '',
    product_code: '',
    product_comment: '',
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
      setItem(product)
      setPrice(product?.product_price.toLocaleString('ko-KR'))
      setSalePrice(product?.product_sale_price.toLocaleString('ko-KR'))
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
  }
  const onSave = async (type, sort) => {
    let result = undefined
    let category_ids = {};
    for (var i = 0; i < themeCategoryList.length; i++) {
      if (!curCategories[i]) {
        toast.error(`${themeCategoryList[i]?.category_group_name}를 선택해 주세요.`);
        return;
      } else {
        category_ids[`category_id${i}`] = curCategories[i][curCategories[i].length - 1]?.id;
      }
    }
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
            result = await apiManager('products', 'update', { ...obj, id: obj?.id, ...category_ids, sub_images, description_images, properties: JSON.stringify(item.properties), sort_idx: sort })
            :
            result = await apiManager('products', 'update', { ...obj, id: obj?.id, ...category_ids, sub_images, description_images, properties: JSON.stringify(item.properties) })
          : //추가
          result = await apiManager('products', 'create', { ...obj, ...category_ids, sub_images, description_images, user_id: user?.id, properties: JSON.stringify(item.properties) })
        :
        result = await apiManager('products', 'create', { ...obj, ...category_ids, sub_images, description_images, user_id: user?.id, properties: JSON.stringify(item.properties) })
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
    ...(router.query?.edit_category == 'edit' && themeDnsData.id != 5 ? [
      {
        value: 2,
        label: '상품리뷰 관리'
      }
    ] : []),
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
                        <Upload file={item.product_file || item.product_img} onDrop={(acceptedFiles) => {
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
                            handleDropMultiFile(acceptedFiles)
                          }}
                          onRemove={(inputFile) => {
                            handleRemoveFile(inputFile)
                          }}
                          onRemoveAll={() => {
                            handleRemoveAllFiles();
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
                                    label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>{property?.property_name}</Typography>}
                                    control={
                                      <Checkbox
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
                      <TextField
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
                        }} />
                      <TextField
                        label='상품명'
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
                                <InputLabel>상품가</InputLabel>
                                <OutlinedInput
                                  label='상품가'
                                  type="text"
                                  value={price}
                                  endAdornment={<InputAdornment position="end">원</InputAdornment>}
                                  onChange={(e) => {
                                    let value = parseInt(e.target.value.replace(/,/g, ''))
                                    //console.log(value)
                                    setItem(
                                      {
                                        ...item,
                                        ['product_price']: value
                                      }
                                    )
                                    setPrice(value.toLocaleString('ko-KR'))
                                    //console.log(price)
                                  }} />
                              </FormControl>
                              <FormControl variant="outlined">
                                <InputLabel>상품 할인가</InputLabel>
                                <OutlinedInput
                                  label='상품 할인가'
                                  type="text"
                                  value={salePrice}
                                  endAdornment={<InputAdornment position="end">원</InputAdornment>}
                                  onChange={(e) => {
                                    let value = parseInt(e.target.value.replace(/,/g, ''))
                                    setItem(
                                      {
                                        ...item,
                                        ['product_sale_price']: value
                                      }
                                    )
                                    setSalePrice(value.toLocaleString('ko-KR'))
                                  }} />
                              </FormControl>
                            </>
                            :
                            <>
                              <FormControl variant="outlined">
                                <InputLabel>상품가</InputLabel>
                                <OutlinedInput
                                  label='상품가'
                                  type="text"
                                  value={salePrice}
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
                          type="number"
                          value={item.delivery_fee}
                          endAdornment={<InputAdornment position="end">원</InputAdornment>}
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['delivery_fee']: e.target.value
                              }
                            )
                          }} />
                      </FormControl>*/}
                      {
                        themeDnsData.id == 5 &&
                        <>
                          <Row style={{ justifyContent: 'space-between' }}>
                            <FormControlLabel
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
                      {!themeDnsData?.none_use_column_obj['products']?.includes('characters') &&
                        <>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                              상품특성
                            </Typography>
                            {item.characters.map((character, index) => (
                              <>
                                {character?.is_delete != 1 &&
                                  <>
                                    <Row style={{ columnGap: '0.5rem' }}>
                                      <TextField
                                        sx={{ flexGrow: 1 }}
                                        label='특성키명'
                                        placeholder="예시) 원산지"
                                        value={character.character_name}
                                        onChange={(e) => {
                                          let character_list = item?.characters;
                                          character_list[index].character_name = e.target.value;
                                          setItem(
                                            {
                                              ...item,
                                              ['characters']: character_list
                                            }
                                          )
                                        }} />
                                      <FormControl variant="outlined" sx={{ flexGrow: 1 }}>
                                        <InputLabel>특성값</InputLabel>
                                        <OutlinedInput
                                          label='특성값'
                                          placeholder="예시) 국내산"
                                          value={character.character_value}
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
                                      <IconButton onClick={() => {
                                        let character_list = item?.characters;
                                        if (character_list[index]?.id) {
                                          character_list[index].is_delete = 1;
                                        } else {
                                          character_list.splice(index, 1);
                                        }
                                        setItem(
                                          {
                                            ...item,
                                            ['characters']: character_list
                                          }
                                        )
                                      }}>
                                        <Icon icon='material-symbols:delete-outline' />
                                      </IconButton>
                                    </Row>
                                  </>}
                              </>
                            ))}
                            <Button variant="outlined" sx={{ height: '48px' }} onClick={() => {
                              let character_list = [...item.characters];
                              character_list.push({
                                character_name: '',
                                character_value: '',
                              })
                              setItem({
                                ...item,
                                ['characters']: character_list
                              })
                            }}>새 특성 추가</Button>
                          </Stack>
                        </>}
                      {!themeDnsData?.none_use_column_obj['products']?.includes('options') &&
                        <>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                              상품옵션
                            </Typography>
                            {item.groups.map((group, index) => (
                              <>
                                {group?.is_delete != 1 &&
                                  <>
                                    <Row style={{ columnGap: '0.5rem', width: '100%' }}>
                                      <FormControl variant="outlined" style={{ width: '100%' }}>
                                        <InputLabel>옵션그룹명</InputLabel>
                                        <OutlinedInput
                                          label='옵션그룹명'
                                          placeholder="예시) 색상"
                                          value={group.group_name}
                                          endAdornment={<>
                                            <Button style={{ width: '114px', height: '56px', transform: 'translateX(14px)' }}
                                              variant="contained"
                                              onClick={() => {
                                                let option_list = item?.groups;
                                                option_list[index].options.push({
                                                  option_name: '',
                                                  option_price: 0,
                                                  option_description: '',
                                                  option_file: undefined,
                                                })
                                                setItem(
                                                  {
                                                    ...item,
                                                    ['groups']: option_list
                                                  }
                                                )
                                              }}
                                            >옵션추가</Button>
                                          </>}
                                          onChange={(e) => {
                                            let option_list = item?.groups;
                                            option_list[index].group_name = e.target.value;
                                            setItem(
                                              {
                                                ...item,
                                                ['groups']: option_list
                                              }
                                            )
                                          }} />
                                      </FormControl>
                                      <IconButton onClick={() => {
                                        let option_list = item?.groups;
                                        if (option_list[index]?.id) {
                                          option_list[index].is_delete = 1;
                                        } else {
                                          option_list.splice(index, 1);
                                        }
                                        setItem(
                                          {
                                            ...item,
                                            ['groups']: option_list
                                          }
                                        )
                                      }}>
                                        <Icon icon='material-symbols:delete-outline' />
                                      </IconButton>
                                    </Row>
                                    {group?.options && group?.options.map((option, idx) => (
                                      <>
                                        {option?.is_delete != 1 &&
                                          <>
                                            <Row style={{ columnGap: '0.5rem' }}>
                                              <TextField
                                                sx={{ flexGrow: 1 }}
                                                label='옵션명'
                                                placeholder="예시) 블랙"
                                                value={option.option_name}
                                                onChange={(e) => {
                                                  let option_list = item?.groups;
                                                  option_list[index].options[idx].option_name = e.target.value;
                                                  setItem(
                                                    {
                                                      ...item,
                                                      ['groups']: option_list
                                                    }
                                                  )
                                                }} />
                                              <FormControl variant="outlined" sx={{ flexGrow: 1 }}>
                                                <InputLabel>변동가</InputLabel>
                                                <OutlinedInput
                                                  label='변동가'
                                                  type="number"
                                                  value={option.option_price}
                                                  endAdornment={<InputAdornment position="end">원</InputAdornment>}
                                                  onChange={(e) => {
                                                    let option_list = item?.groups;
                                                    option_list[index].options[idx].option_price = e.target.value;
                                                    setItem(
                                                      {
                                                        ...item,
                                                        ['groups']: option_list
                                                      }
                                                    )
                                                  }} />
                                              </FormControl>
                                              <IconButton onClick={() => {
                                                let option_list = item?.groups;
                                                if (option_list[index].options[idx]?.id) {
                                                  option_list[index].options[idx].is_delete = 1;
                                                } else {
                                                  option_list[index].options.splice(idx, 1);
                                                }
                                                setItem(
                                                  {
                                                    ...item,
                                                    ['groups']: option_list
                                                  }
                                                )
                                              }}>
                                                <Icon icon='material-symbols:delete-outline' />
                                              </IconButton>
                                            </Row>
                                          </>}
                                      </>
                                    ))}
                                  </>}

                              </>
                            ))}
                            <Button variant="outlined" sx={{ height: '48px' }} onClick={() => {
                              let option_list = [...item.groups];
                              option_list.push({
                                group_name: '',
                                group_description: '',
                                group_file: undefined,
                                is_able_duplicate_select: 0,
                                options: []
                              })
                              setItem({
                                ...item,
                                ['groups']: option_list
                              })
                            }}>옵션그룹 추가</Button>
                          </Stack>
                        </>}
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
                          type="number"
                          value={item.consignment_fee}
                          endAdornment={<InputAdornment position="end">{item.consignment_fee_type == 0 ? "원" : '%'}</InputAdornment>}
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['consignment_fee']: e.target.value
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
                <Stack spacing={0} style={{ display: 'flex', flexDirection: 'row' }}>
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
                                  {item?.product_code &&
                                    <>
                                      <ItemCharacter key_name={'상품코드'} value={item?.product_code} />
                                    </>}
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
