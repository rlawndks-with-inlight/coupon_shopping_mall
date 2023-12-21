
import { Avatar, Button, Card, CardHeader, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import dynamic from "next/dynamic";

import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiManager } from "src/utils/api";
const Tour = dynamic(
  () => import('reactour'),
  { ssr: false },
);
const ArticleCategoryEdit = () => {
  const { setModal } = useModal()
  const { themeMode } = useSettingsContext();
  const { user } = useAuthContext();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
    post_category_title: '',
    parent_id: router.query?.parent_id,
    is_able_user_add: 0,
    post_category_type: 0,
    post_category_read_type: 0,
  })
  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {
    if (router.query?.edit_category == 'edit') {
      let data = await apiManager('post-categories', 'get', {
        id: router.query.id
      })
      if (data) {
        if (!data?.children.length > 0) {
          openTour('add-children', "하위 카테고리가 필요하면 '추가' 버튼을 클릭하여 하위 카테고리를 추가해 주세요.")
        }
        setItem(data);
      }
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined;
    if (router.query?.edit_category == 'edit') {
      for (var i = 0; i < item?.children.length; i++) {
        if (!item?.children[i]?.id) {
          let children_result = await apiManager('post-categories', 'create', item?.children[i]);
        } else {
          if (item?.children[i]?.is_edit) {
            let children_result = await apiManager('post-categories', 'update', { ...item?.children[i] });
          }
        }
      }
      result = await apiManager('post-categories', 'update', item);
    } else {
      result = await apiManager('post-categories', 'create', item);
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      window.location.href = '/manager/articles/categories';
    }
  }
  const [tourOpen, setTourOpen] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);

  const openTour = (class_name, text,) => {
    setTourSteps([
      {
        selector: `.${class_name}`,
        content: text,
      },
    ])
    setTourOpen(true);
  }
  const closeTour = () => {
    setTourOpen(false);
    setTourSteps([]);
  };
  return (
    <>
      <Tour
        steps={tourSteps}
        isOpen={tourOpen}
        disableInteraction={false}
        onRequestClose={closeTour}
      />
      {!loading &&
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack spacing={3}>
                  <TextField
                    label='카테고리명'
                    placeholder="ex) 공지사항"
                    value={item.post_category_title}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['post_category_title']: e.target.value
                        }
                      )
                    }} />
                  {user?.level >= 50 &&
                    <>
                      <FormControl>
                        <InputLabel>유저 추가 가능여부</InputLabel>
                        <Select label='유저 추가 가능여부' value={item.is_able_user_add} onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['is_able_user_add']: e.target.value
                            }
                          )
                        }}>
                          <MenuItem value={0}>가능 X</MenuItem>
                          <MenuItem value={1}>가능 O</MenuItem>
                        </Select>
                      </FormControl>
                    </>}
                  {user?.level >= 50 &&
                    <>
                      <FormControl>
                        <InputLabel>볼수 있는 대상</InputLabel>
                        <Select label='볼수 있는 대상' value={item.post_category_read_type} onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['post_category_read_type']: e.target.value
                            }
                          )
                        }}>
                          <MenuItem value={0}>모두</MenuItem>
                          <MenuItem value={1}>자신 및 관리자만</MenuItem>
                        </Select>
                      </FormControl>
                    </>}
                  {user?.level >= 50 &&
                    <>
                      <FormControl>
                        <InputLabel>게시물 카테고리 타입</InputLabel>
                        <Select label='게시물 카테고리 타입' value={item.post_category_type} onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['post_category_type']: e.target.value
                            }
                          )
                        }}>
                          <MenuItem value={0}>일반형</MenuItem>
                          <MenuItem value={1}>갤러리형</MenuItem>
                        </Select>
                      </FormControl>
                    </>}

                </Stack>
              </Card>
            </Grid>
            {router.query?.edit_category == 'edit' &&
              <>
                <Grid item xs={12} md={12}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <CardHeader title="하위 카테고리" sx={{ padding: '0' }} />
                      {item?.children && item?.children.map((category, idx) => (
                        <>
                          <TextField
                            label='카테고리명'
                            placeholder="ex) 문의"
                            value={category?.post_category_title}
                            defaultValue={category?.post_category_title}
                            onChange={(e) => {
                              let children_list = [...item?.children];
                              children_list[idx].post_category_title = e.target.value;
                              children_list[idx].is_edit = true;
                              setItem({
                                ...item,
                                children: children_list
                              })
                            }} />
                        </>
                      ))}
                      <Button variant="contained" style={{ height: '56px' }} className="add-children" onClick={() => {
                        let children_list = [...item?.children];
                        children_list.push({
                          ...item,
                          id: undefined,
                          post_category_title: '',
                          parent_id: router.query?.id
                        })
                        setItem({
                          ...item,
                          children: children_list
                        })
                        closeTour();
                      }}>
                        + 추가
                      </Button>
                    </Stack>
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
ArticleCategoryEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ArticleCategoryEdit
