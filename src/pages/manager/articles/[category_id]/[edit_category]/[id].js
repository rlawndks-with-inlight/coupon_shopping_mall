
import { Button, Card, Grid, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})
import { useModal } from "src/components/dialog/ModalProvider";
import ReactQuillComponent from "src/views/manager/react-quill";
import { apiManager } from "src/utils/api";
const ArticleEdit = () => {
  const { setModal } = useModal()
  const { themeMode } = useSettingsContext();

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState({})
  const [item, setItem] = useState({
    category_id: router.query?.category_id,
    parent_id: -1,
    post_title: '',
    post_content: '',
    is_reply: 0,
    reply: '',
    post_title_file: undefined,
  })
  const [reply, setReply] = useState({
    post_title: '',
    post_content: '',
    is_reply: 1,
  })
  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {
    let category = await apiManager('post-categories', 'get', {
      id: router.query.category_id
    })
    setCategory(category)
    if (router.query?.edit_category == 'edit') {
      let data = await apiManager('posts', 'get', {
        id: router.query.id
      })
      setItem(data);
      setReply({ ...reply, ...data?.replies[0] })
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined;
    let result2 = undefined;
    if (router.query?.edit_category == 'edit') {
      result = await apiManager('posts', 'update', { ...item, id: router.query?.id });
      if (category?.is_able_user_add == 1 && result) {
        if (reply?.id > 0) {
          result2 = await apiManager('posts', 'update', { ...reply, category_id: category?.id, parent_id: router.query?.id ?? -1 });
        } else {
          result2 = await apiManager('posts', 'create', { ...reply, category_id: category?.id, parent_id: router.query?.id ?? -1 });
        }
      } else {
        result2 = true;
      }
    } else {
      result = await apiManager('posts', 'create', { ...item });
      result2 = true;
    }
    if (result && result2) {
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
                  {category?.children.length > 0 &&
                    <>
                      <Select value={item.category_id} onChange={(e) => {
                        setItem({
                          ...item,
                          category_id: e.target.value
                        })
                      }}>
                        <MenuItem value={category?.id}>{`${category.post_category_title} 카테고리 전체`}</MenuItem>
                        {category?.children.map((cate, idx) => {
                          return <MenuItem value={cate?.id}>{cate?.post_category_title}</MenuItem>
                        })}
                      </Select>
                    </>}
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      대표이미지등록
                    </Typography>
                    <Upload file={item.post_title_file || item.post_title_img} onDrop={(acceptedFiles) => {
                      const newFile = acceptedFiles[0];
                      if (newFile) {
                        setItem(
                          {
                            ...item,
                            ['post_title_file']: Object.assign(newFile, {
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
                            ['post_title_file']: undefined,
                            ['post_title_img']: '',
                          }
                        )
                      }}
                      fileExplain={{
                        width: '(512x512 추천)'//파일 사이즈 설명
                      }}
                    />
                  </Stack>
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
                    <ReactQuillComponent
                      disabled
                      value={item.post_content}
                      setValue={(value) => {
                        setItem({
                          ...item,
                          ['post_content']: value
                        });
                      }}
                    />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
            {(category?.is_able_user_add == 1 && category?.post_category_read_type == 1) &&
              <>
                <Grid item xs={12} md={12}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        label='답변제목'
                        value={reply?.post_title}
                        onChange={(e) => {
                          setReply(
                            {
                              ...reply,
                              ['post_title']: e.target.value
                            }
                          )
                        }} />
                      <Stack spacing={1}>

                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          답변내용
                        </Typography>
                        <ReactQuillComponent
                          value={reply?.post_content}
                          setValue={(value) => {
                            setReply({
                              ...reply,
                              ['post_content']: value
                            });
                          }}
                        />
                      </Stack>
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
ArticleEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ArticleEdit
