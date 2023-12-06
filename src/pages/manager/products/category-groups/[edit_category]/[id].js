3
import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { toast } from "react-hot-toast";
import _ from "lodash";
import { useModal } from "src/components/dialog/ModalProvider";
import { apiManager } from "src/utils/api";
import { productSortTypeList } from "src/utils/format";

const ProductCategoryGroupEdit = () => {
  const { setModal } = useModal()

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
    category_group_name: '',
    max_depth: 10,
    sort_type: 0,
    is_show_header_menu: 1,
    is_use_en_name: 0,
  })
  const [reviewData, setReviewData] = useState({});

  useEffect(() => {
    settingPage();
  }, [])

  const settingPage = async () => {
    if (router.query?.edit_category == 'edit') {
      let data = await apiManager('product-category-groups', 'get', {
        id: router.query.id
      })
      setItem(data)
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined
    if (item?.id) {//수정

      result = await apiManager('product-category-groups', 'update', item);
    } else {//추가
      result = await apiManager('product-category-groups', 'create', item);
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
                  <TextField
                    label='트리 최대깊이'
                    value={item.max_depth}
                    type="number"
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['max_depth']: e.target.value
                        }
                      )
                    }} />
                  <FormControl>
                    <InputLabel>정렬기준</InputLabel>
                    <Select label='정렬기준' value={item.sort_type} onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['sort_type']: e.target.value
                        }
                      )
                    }}>
                      {productSortTypeList.map(itm => {
                        return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                      })}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>헤더메뉴 노출여부</InputLabel>
                    <Select label='헤더메뉴 노출여부' value={item.is_show_header_menu} onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['is_show_header_menu']: e.target.value
                        }
                      )
                    }}>
                      <MenuItem value={1}>노출</MenuItem>
                      <MenuItem value={0}>노출안함</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>영문이름 사용여부</InputLabel>
                    <Select label='영문이름 사용여부' value={item.is_use_en_name} onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['is_use_en_name']: e.target.value
                        }
                      )
                    }}>
                      <MenuItem value={1}>사용</MenuItem>
                      <MenuItem value={0}>사용안함</MenuItem>
                    </Select>
                  </FormControl>
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
