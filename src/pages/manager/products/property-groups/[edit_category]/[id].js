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

const ProductPropertyGroupEdit = () => {
  const { setModal } = useModal()

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
    property_group_name: '',
    is_can_select_multiple: 0,
  })
  const [reviewData, setReviewData] = useState({});

  useEffect(() => {
    settingPage();
  }, [])

  const settingPage = async () => {
    if (router.query?.edit_category == 'edit') {
      let data = await apiManager('product-property-groups', 'get', {
        id: router.query.id
      })
      setItem(data)
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined
    if (item?.id) {//수정

      result = await apiManager('product-property-groups', 'update', item);
    } else {//추가
      result = await apiManager('product-property-groups', 'create', item);
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      window.location.href = '/manager/products/property-groups/list';
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
                    label='상품특성 그룹명'
                    value={item.property_group_name}
                    placeholder="등급, 편의시설"
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['property_group_name']: e.target.value
                        }
                      )
                    }} />
                  <FormControl>
                    <InputLabel>다중체크가능여부</InputLabel>
                    <Select label='다중체크가능여부' value={item.is_can_select_multiple} onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['is_can_select_multiple']: e.target.value
                        }
                      )
                    }}>
                      <MenuItem value={1}>가능(여러개)</MenuItem>
                      <MenuItem value={0}>불가능(단일)</MenuItem>
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
ProductPropertyGroupEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ProductPropertyGroupEdit
