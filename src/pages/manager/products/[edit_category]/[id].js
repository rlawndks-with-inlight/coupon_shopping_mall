
import { Avatar, Box, Breadcrumbs, Button, Card, CardHeader, Chip, FormControl, Grid, Icon, InputAdornment, InputLabel, Menu, MenuItem, OutlinedInput, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import Iconify from "src/components/iconify/Iconify";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import { test_categories } from "src/data/test-data";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { base64toFile, getAllIdsWithParents } from "src/utils/function";
import styled from "styled-components";
import $ from 'jquery';
import dynamic from "next/dynamic";
import { react_quill_data } from "src/data/manager-data";
import { axiosIns } from "src/utils/axios";
import { getCategoriesByManager } from "src/utils/api-manager";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})
const CategoryWrappers = styled.div`
border:1px solid ${themeObj.grey[300]};
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
border-bottom:1px solid ${themeObj.grey[300]};
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
  background:${themeObj.grey[200]};
}
`
const ProductEdit = () => {

  const { themeMode } = useSettingsContext();

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [curCategories, setCurCategories] = useState([]);
  const [categoryChildrenList, setCategoryChildrenList] = useState([]);
  const [item, setItem] = useState({
    category_id: undefined,
    product_name: '',
    product_price: 0,
    product_sale_price: 0,
    brand_name: '',
    origin_name: '',
    mfg_name: '',
    model_name: '',
    product_description: '',
    category_file: undefined,
    options:[]
  })
  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {
    let category_list = await getCategoriesByManager({ page: 1, page_size: 100000 });
    category_list = category_list?.content;
    setCategories(category_list);
    if (router.query?.edit_category == 'edit') {
      let parent_list = getAllIdsWithParents(category_list);
      let use_list = [];
      for (var i = 0; i < parent_list.length; i++) {
        if (parent_list[i][parent_list[i].length - 1]?.id == 112) {
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
    let images = [...item.images];
    for (var i = 0; i < acceptedFiles.length; i++) {
      images.push({ ...acceptedFiles[i], preview: URL.createObjectURL(acceptedFiles[i]) })
    }
    setItem({ ...item, ['images']: images })
  };

  const handleRemoveFile = (inputFile) => {
    let images = [...item.images];
    const filesFiltered = images.filter((fileFiltered) => fileFiltered !== inputFile);
    images = filesFiltered;
    setItem({ ...item, ['images']: images })
  };

  const handleRemoveAllFiles = () => {
    let images = [...item.images];
    images = [];
    setItem({ ...item, ['images']: images })
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
  return (
    <>
      {!loading &&
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack spacing={3}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      대표이미지등록
                    </Typography>
                    <Upload file={item.category_file} onDrop={(acceptedFiles) => {
                      const newFile = acceptedFiles[0];
                      if (newFile) {
                        setItem(
                          {
                            ...item,
                            ['category_file']: Object.assign(newFile, {
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
                            ['category_file']: ''
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
                      files={item.images}
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
                    <CategoryWrappers>
                      <CategoryHeader>
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
                            상품분류를 선택 후 상품분류 적용 버튼을 눌러주세요
                          </>}
                      </CategoryHeader>
                      <div style={{ overflowX: 'auto', width: '100%', display: '-webkit-box' }} className="category-container">
                        <CategoryContainer>
                          {categories.map((category, idx) => (
                            <>
                              <Category style={{
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
                    value={item.product_name}
                    placeholder="예시) 주문폭주!! 다양한 디자인으로 어떠한 룩도 소화!"
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['product_name']: e.target.value
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
                    <ReactQuill
                      className="max-height-editor"
                      theme={'snow'}
                      id={'content'}
                      placeholder={''}
                      value={item.product_description}
                      modules={react_quill_data.modules}
                      formats={react_quill_data.formats}
                      onChange={async (e) => {
                        let note = e;
                        if (e.includes('<img src="') && e.includes('base64,')) {
                          let base64_list = e.split('<img src="');
                          for (var i = 0; i < base64_list.length; i++) {
                            if (base64_list[i].includes('base64,')) {
                              let img_src = base64_list[i];
                              img_src = await img_src.split(`"></p>`);
                              let base64 = img_src[0];
                              img_src = await base64toFile(img_src[0], 'note.png');
                              let formData = new FormData();
                              formData.append('file', img_src);
                              let config = {
                                headers: {
                                  'Content-Type': "multipart/form-data",
                                }
                              };
                              const response = await axiosIns().post('/api/v1/manager/posts/upload', formData, config);
                              note = await note.replace(base64, response?.data?.file)
                            }
                          }
                        }
                        setItem({
                          ...item,
                          ['product_description']: note
                        });
                      }} />
                  </Stack>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      상품옵션
                    </Typography>
                    {item.options.map((group, index) => (
                      <>
                        <FormControl variant="outlined">
                          <InputLabel>옵션그룹명</InputLabel>
                          <OutlinedInput
                            label='옵션그룹명'
                            placeholder="예시) 색상"
                            value={group.group_name}
                            endAdornment={<>
                              <Button style={{ width: '94px', height: '56px', transform: 'translateX(14px)' }}
                                variant="contained"
                                onClick={() => {
                                  let option_list = item?.options;
                                  option_list[index].list.push({
                                    option_name: '',
                                    var_price: 0,
                                  })
                                  setItem(
                                    {
                                      ...item,
                                      ['options']: option_list
                                    }
                                  )
                                }}
                              >옵션추가</Button>
                            </>}
                            onChange={(e) => {
                              let option_list = item?.options;
                              option_list[index].group_name = e.target.value;
                              setItem(
                                {
                                  ...item,
                                  ['options']: option_list
                                }
                              )
                            }} />
                        </FormControl>
                        {group?.list && group?.list.map((option, idx) => (
                          <>
                            <Row style={{ columnGap: '0.5rem' }}>
                              <TextField
                                sx={{ flexGrow: 1 }}
                                label='옵션명'
                                placeholder="예시) 블랙"
                                value={option.option_name}
                                onChange={(e) => {
                                  let option_list = item?.options;
                                  option_list[index].list[idx].option_name = e.target.value;
                                  setItem(
                                    {
                                      ...item,
                                      ['options']: option_list
                                    }
                                  )
                                }} />
                              <FormControl variant="outlined" sx={{ flexGrow: 1 }}>
                                <InputLabel>변동가</InputLabel>
                                <OutlinedInput
                                  label='변동가'
                                  type="number"
                                  value={option.var_price}
                                  endAdornment={<InputAdornment position="end">원</InputAdornment>}
                                  onChange={(e) => {
                                    let option_list = item?.options;
                                    option_list[index].list[idx].var_price = e.target.value;
                                    setItem(
                                      {
                                        ...item,
                                        ['options']: option_list
                                      }
                                    )
                                  }} />
                              </FormControl>
                            </Row>

                          </>
                        ))}
                      </>
                    ))}
                    <Button variant="outlined" sx={{ height: '48px' }} onClick={() => {
                      let option_list = [...item.options];
                      option_list.push({
                        group_name: '',
                        list: []
                      })
                      setItem({
                        ...item,
                        ['options']: option_list
                      })
                    }}>옵션그룹 추가</Button>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={1} style={{ display: 'flex' }}>
                  <Button variant="contained" style={{
                    height: '48px', width: '120px', marginLeft: 'auto'
                  }} onClick={() => {
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
