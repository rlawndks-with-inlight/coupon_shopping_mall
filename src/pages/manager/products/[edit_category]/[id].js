
import { Avatar, Box, Breadcrumbs, Button, Card, CardHeader, Chip, FormControl, Grid, IconButton, InputAdornment, InputLabel, Menu, MenuItem, OutlinedInput, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import Iconify from "src/components/iconify/Iconify";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import { test_categories } from "src/data/test-data";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { Icon } from "@iconify/react";
import { base64toFile, commarNumber, getAllIdsWithParents } from "src/utils/function";
import styled from "styled-components";
import $ from 'jquery';
import dynamic from "next/dynamic";

import { addProductByManager, getCategoriesByManager, getProductByManager, getProductReviewsByManager, updateProductByManager, uploadFileByManager } from "src/utils/api-manager";
import { toast } from "react-hot-toast";
import { useTheme } from "@emotion/react";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import _ from "lodash";
import { useModal } from "src/components/dialog/ModalProvider";
import ReactQuillComponent from "src/views/manager/react-quill";


const tab_list = [
  {
    value: 0,
    label: '상품정보'
  },
  {
    value: 1,
    label: '상품리뷰 관리'
  }
]
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
export const SelectCategoryComponent = (props) => {

  const {
    curCategories,
    categories,
    categoryChildrenList,
    onClickCategory,
    noneSelectText
  } = props;
  const theme = useTheme();
  return (
    <>
      <CategoryWrappers style={{ border: `1px solid ${theme.palette.mode == 'dark' ? themeObj.grey[700] : themeObj.grey[300]}` }}>
        <CategoryHeader style={{
          background: `${theme.palette.mode == 'dark' ? '#919eab29' : ''}`,
          borderBottom: `1px solid ${theme.palette.mode == 'dark' ? themeObj.grey[700] : themeObj.grey[300]}`
        }}>
          {curCategories.length > 0 ?
            <>
              <Row>
                {curCategories.map((item, idx) => (
                  <>
                    <div style={{ marginRight: '0.25rem' }}>
                      {item.category_name}
                    </div>
                    {idx != curCategories.length - 1 &&
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
              {noneSelectText}
            </>}
        </CategoryHeader>
        <div style={{ overflowX: 'auto', width: '100%', display: '-webkit-box' }} className="category-container">
          <CategoryContainer>
            {categories.map((category, idx) => (
              <>
                <Category hoverColor={theme.palette?.mode == 'dark' ? themeObj.grey[700] : themeObj.grey[200]} style={{
                  color: `${curCategories.map(item => { return item?.id }).includes(category?.id) ? '' : themeObj.grey[500]}`,
                  fontWeight: `${curCategories.map(item => { return item?.id }).includes(category?.id) ? 'bold' : ''}`,
                }} onClick={() => {
                  onClickCategory(category, 0)
                }}>
                  <div>{category.category_name}</div>
                  <div>{category?.children && category?.children.length > 0 ? '>' : ''}</div>
                </Category>
              </>
            ))}
          </CategoryContainer>
          {categoryChildrenList.map((category_list, index) => (
            <>
              {category_list.length > 0 &&
                <>
                  <CategoryContainer>
                    {category_list.map((category, idx) => (
                      <>
                        <Category style={{
                          color: `${curCategories.map(item => { return item?.id }).includes(category?.id) ? '' : themeObj.grey[500]}`,
                          fontWeight: `${curCategories.map(item => { return item?.id }).includes(category?.id) ? 'bold' : ''}`,
                        }}
                          onClick={() => {
                            onClickCategory(category, index + 1)
                          }}><div>{category.category_name}</div>
                          <div>{category?.children && category?.children.length > 0 ? '>' : ''}</div>
                        </Category>
                      </>
                    ))}
                  </CategoryContainer>
                </>}
            </>
          ))}
        </div>
      </CategoryWrappers>
    </>
  )
}
const ProductEdit = () => {
  const { setModal } = useModal()
  const defaultReviewColumns = [
    {
      id: 'product_name',
      label: '작성자',
      action: (row) => {
        return row['product_name'] ?? "---"
      }
    },

    {
      id: 'product_price',
      label: '코멘트',
      action: (row) => {
        return commarNumber(row['product_price'])
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
      label: '삭제',
      action: (row) => {
        return (
          <>
            <IconButton onClick={() => deleteProduct(row?.id)}>
              <Icon icon='material-symbols:delete-outline' />
            </IconButton>
          </>
        )
      }
    },
  ]
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [curCategories, setCurCategories] = useState([]);
  const [categoryChildrenList, setCategoryChildrenList] = useState([]);
  const [item, setItem] = useState({
    category_id: undefined,
    product_name: '',
    product_comment: '',
    product_price: 0,
    product_sale_price: 0,
    brand_name: '',
    origin_name: '',
    mfg_name: '',
    model_name: '',
    product_description: '',
    product_file: undefined,
    sub_images: [],
    groups: [],
    characters: [],
  })
  const [reviewData, setReviewData] = useState({});
  const [reviewSearchObj, setReviewSearchObj] = useState({
    page: 1,
    page_size: 10,
    s_dt: '',
    e_dt: '',
    search: '',
    product_id: ''
  })
  const [reviewColumns, setReviewColumns] = useState([]);
  useEffect(() => {
    settingPage();
  }, [])

  useEffect(() => {
    if (currentTab == 1) {
      onChangeReviewsPage({ ...reviewSearchObj, product_id: router.query.id });
    }
  }, [currentTab])
  const onChangeReviewsPage = async (obj) => {
    setReviewData({
      ...reviewData,
      content: undefined
    })
    let data_ = await getProductReviewsByManager(obj);
    if (data_) {
      setReviewData(data_);
    }
    setReviewSearchObj(obj);
  }


  const settingPage = async () => {
    let cols = defaultReviewColumns;
    setReviewColumns(cols)
    let category_list = await getCategoriesByManager({ page: 1, page_size: 100000 });
    category_list = category_list?.content;
    if (!category_list.length > 0) {
      toast.error("카테고리 생성 후 상품 등록 가능합니다.");
    }
    setCategories(category_list);
    if (router.query?.edit_category == 'edit') {
      setCurrentTab(router.query?.type ?? 0)
      let product = await getProductByManager({
        id: router.query.id
      })
      product = Object.assign(item, product)
      setItem(product)
      let parent_list = getAllIdsWithParents(category_list);
      let use_list = [];
      for (var i = 0; i < parent_list.length; i++) {
        if (parent_list[i][parent_list[i].length - 1]?.id == product?.category_id) {
          use_list = parent_list[i];
          break;
        }
      }
      setCurCategories(use_list);
      let children_list = [];
      for (var i = 0; i < use_list.length; i++) {
        children_list.push(use_list[i]?.children);
      }
      setCategoryChildrenList(children_list);
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

  const handleRemoveAllFiles = () => {
    let sub_images = [...item.sub_images];
    sub_images = [];
    setItem({ ...item, ['sub_images']: sub_images })
  };
  const onClickCategory = (category, depth) => {
    setItem(
      {
        ...item,
        ['category_id']: category?.id
      }
    )
    let parent_list = getAllIdsWithParents(categories);
    let use_list = [];
    for (var i = 0; i < parent_list.length; i++) {
      if (parent_list[i][depth]?.id == category?.id) {
        use_list = parent_list[i];
        break;
      }
    }
    setCurCategories(use_list);
    let children_list = [];
    for (var i = 0; i < use_list.length; i++) {
      children_list.push(use_list[i]?.children);
    }
    setCategoryChildrenList(children_list);
    $('.category-container').scrollLeft(100000);
  }
  const onSave = async () => {
    let result = undefined
    if (item?.id) {//수정

      result = await updateProductByManager({ ...item, id: item?.id })
    } else {//추가
      result = await addProductByManager({ ...item })
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push('/manager/products/list');
    }
  }
  return (
    <>
      {!loading &&
        <>
          {router.query?.edit_category == 'edit' &&
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
            </>}

          <Grid container spacing={3}>
            {(router.query?.edit_category == 'add' || (router.query?.edit_category == 'edit' && currentTab == 0)) &&
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
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          카테고리
                        </Typography>
                        <SelectCategoryComponent
                          curCategories={curCategories}
                          categories={categories}
                          categoryChildrenList={categoryChildrenList}
                          onClickCategory={onClickCategory}
                          noneSelectText={'상품분류를 선택 후 상품분류 적용 버튼을 눌러주세요'}
                        />
                        {item?.category_id ?
                          <>

                          </>
                          :
                          <>
                          </>}
                      </Stack>
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
                      <FormControl variant="outlined">
                        <InputLabel>상품가</InputLabel>
                        <OutlinedInput
                          label='상품가'
                          type="number"
                          value={item.product_price}
                          endAdornment={<InputAdornment position="end">원</InputAdornment>}
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['product_price']: e.target.value
                              }
                            )
                          }} />
                      </FormControl>

                      <FormControl variant="outlined">
                        <InputLabel>상품 할인가</InputLabel>
                        <OutlinedInput
                          label='상품 할인가'
                          type="number"
                          value={item.product_sale_price}
                          endAdornment={<InputAdornment position="end">원</InputAdornment>}
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['product_sale_price']: e.target.value
                              }
                            )
                          }} />
                      </FormControl>

                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          상품설명
                        </Typography>
                        <ReactQuillComponent
                          value={item.product_description}
                          setValue={(value) => {
                            setItem({
                              ...item,
                              product_description: value,
                            })
                          }}
                        />
                      </Stack>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          상품특성
                        </Typography>
                        {item.characters.map((character, index) => (
                          <>
                            <Row style={{ columnGap: '0.5rem' }}>
                              <TextField
                                sx={{ flexGrow: 1 }}
                                label='옵션명'
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
                                <InputLabel>변동가</InputLabel>
                                <OutlinedInput
                                  label='변동가'
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
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 1 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <ManagerTable
                      data={reviewData}
                      columns={reviewColumns}
                      searchObj={reviewSearchObj}
                      onChangePage={onChangeReviewsPage}
                      add_button_text={''}
                    />
                  </Card>
                </Grid>
              </>}
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={1} style={{ display: 'flex' }}>
                  <Button variant="contained" style={{
                    height: '48px', width: '120px', marginLeft: 'auto'
                  }} onClick={() => {
                    setModal({
                      func: () => { onSave() },
                      icon: 'material-symbols:edit-outline',
                      title: '저장 하시겠습니까?'
                    })
                  }}>
                    저장
                  </Button>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </>}
    </>
  )
}
ProductEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ProductEdit
