
import { Button, Card, Grid, Stack, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { toast } from "react-hot-toast";
import _ from "lodash";
import { useModal } from "src/components/dialog/ModalProvider";
import { apiManager } from "src/utils/api";

const ProductCategoryGroupEdit = () => {
  const { setModal } = useModal()

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
    category_group_name: '',
    max_depth: 10,
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