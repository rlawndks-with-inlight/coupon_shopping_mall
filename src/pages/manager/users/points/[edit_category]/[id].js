
import { Button, Card, Grid, Stack, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { toast } from "react-hot-toast";
import _ from "lodash";
import { useModal } from "src/components/dialog/ModalProvider";
import { apiManager } from "src/utils/api";

const PointEdit = () => {
  const { setModal } = useModal()

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
    user_name: '',
    point: 0,
  })
  const [reviewData, setReviewData] = useState({});

  useEffect(() => {
    settingPage();
  }, [])

  const settingPage = async () => {
    if (router.query?.edit_category == 'edit') {
      let data = await apiManager('points', 'get', {
        id: router.query.id
      })
      setItem(data)
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined
    if (item?.id) {//수정

      result = await apiManager('points', 'update', item);
    } else {//추가
      result = await apiManager('points', 'create', item);
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      window.location.href = '/manager/users/points';
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
                    label='유저아이디'
                    value={item.user_name}
                    placeholder="유저아이디"
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['user_name']: e.target.value
                        }
                      )
                    }} />
                  <TextField
                    label='부여할포인트 (음수시 감소건)'
                    value={item.point}
                    type="number"
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['point']: e.target.value
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
PointEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default PointEdit
