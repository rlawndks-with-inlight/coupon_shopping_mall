
import { Avatar, Button, Card, CardHeader, Grid, IconButton, Stack, TextField, Tooltip, Typography, alpha } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { base64toFile, getAllIdsWithParents } from "src/utils/function";
import styled from "styled-components";
import dynamic from "next/dynamic";
import { react_quill_data } from "src/data/manager-data";
import { axiosIns } from "src/utils/axios";
import $ from 'jquery';
import Iconify from "src/components/iconify/Iconify";
import { addPostCategoryByManager, getPostCategoriesByManager, getPostCategoryByManager, updatePostCategoryByManager } from "src/utils/api-manager";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})
const Tour = dynamic(
  () => import('reactour'),
  { ssr: false },
);
const ArticleCategoryEdit = () => {
  const { setModal } = useModal()
  const { themeMode } = useSettingsContext();

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
    post_category_title: '',
    parent_id: router.query?.parent_id
  })
  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {
    if (router.query?.edit_category == 'edit') {
      let data = await getPostCategoryByManager({ id: router.query?.id });
      if (data) {
        if(!data?.children.length > 0){
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
      for(var i= 0;i<item?.children.length;i++){
        if(!item?.children[i]?.id){
          let children_result = await addPostCategoryByManager(item?.children[i]);
        }else{
          if(item?.children[i]?.is_edit){
            let children_result = await updatePostCategoryByManager({...item?.children[i]});
          }
        }
      }
      result = await updatePostCategoryByManager({ ...item, id: router.query?.id });
    } else {
      result = await addPostCategoryByManager(item);
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