
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

import { addCategoryGroupByManager, addProductByManager, getCategoriesByManager, getCategoryGroupByManager, getProductByManager, getProductReviewsByManager, updateCategoryGroupByManager, updateProductByManager, uploadFileByManager } from "src/utils/api-manager";
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
const ProductCategoryGroupEdit = () => {
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
    category_group_name:'',
  })
  const [reviewData, setReviewData] = useState({});

  useEffect(() => {
    settingPage();
  }, [])

  const settingPage = async () => {
    if (router.query?.edit_category == 'edit') {
      setCurrentTab(router.query?.type ?? 0)
      let product = await getCategoryGroupByManager({
        id: router.query.id
      })
      setItem(product)
    }
    setLoading(false);
  }


  const onSave = async () => {
    let result = undefined
    if (item?.id) {//수정

      result = await updateCategoryGroupByManager({ ...item, id: item?.id })
    } else {//추가
      result = await addCategoryGroupByManager({ ...item })
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      window.location.href = '/manager/products/category-groups/list';
    }
  }
  return (
    <>
      {!loading &&
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack spacing={3}>
                  <TextField
                    label='상품카테고리 그룹명'
                    value={item.category_group_name}
                    placeholder="예시) 카테고리, 성별, 국가"
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['category_group_name']: e.target.value
                        }
                      )
                    }} />
                </Stack>
              </Card>
            </Grid>
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
ProductCategoryGroupEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ProductCategoryGroupEdit
