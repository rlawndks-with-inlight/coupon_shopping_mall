
import { Button, Card, Grid, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { base64toFile, getAllIdsWithParents } from "src/utils/function";
import styled from "styled-components";
import dynamic from "next/dynamic";
import { react_quill_data } from "src/data/manager-data";
import { axiosIns } from "src/utils/axios";
import { addPostByManager, getPostByManager, updatePostByManager, uploadFileByManager } from "src/utils/api-manager";
import { toast } from "react-hot-toast";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const ArticleEdit = () => {

  const { themeMode } = useSettingsContext();

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
    category_id: null,
    parent_id: null,
    post_title: '',
    post_content: '',
    is_reply: true,
  })

  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {
    if (router.query?.edit_category == 'edit') {
      let item = await getPostByManager({
        id: router.query.id
      })
      setItem(item);
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined;
    if (router.query?.edit_category == 'edit') {
      result = await updatePostByManager({ ...item, category_id: router.query?.category_id, id: router.query?.id });
    } else {
      result = await addPostByManager({ ...item, category_id: router.query?.category_id });
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push(`/manager/articles/${router.query?.category_id}`);
    }
  }
  return (
    <>
      {!loading &&
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack spacing={3}>
                  <TextField
                    label='제목'
                    value={item.post_title}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['post_title']: e.target.value
                        }
                      )
                    }} />
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack spacing={3}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      상세설명
                    </Typography>
                    <ReactQuill
                      className="max-height-editor"
                      theme={'snow'}
                      id={'content'}
                      placeholder={''}
                      value={item.post_content}
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
                              const response = await uploadFileByManager({
                                formData
                              });
                              note = await note.replace(base64, response?.data?.url)
                            }
                          }
                        }
                        setItem({
                          ...item,
                          ['post_content']: note
                        });
                      }} />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={1} style={{ display: 'flex' }}>
                  <Button variant="contained" style={{
                    height: '48px', width: '120px', marginLeft: 'auto'
                  }} onClick={onSave}>
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
ArticleEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ArticleEdit
