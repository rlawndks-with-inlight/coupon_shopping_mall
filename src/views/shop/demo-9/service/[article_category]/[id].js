import { Button, Stack, TextField, Typography } from "@mui/material";
import _ from "lodash";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import { AuthMenuSideComponent, ContentWrappers, TitleComponent } from "src/components/elements/shop/demo-4";
import { Row, RowMobileReverceColumn } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiShop } from "src/utils/api";
import styled from "styled-components";
import { Upload } from "src/components/upload";
import ReactQuillComponent from "src/views/manager/react-quill";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})
const Wrappers = styled.div`
max-width:1400px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-top: 2rem;
`
const ArticleDemo = (props) => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeDnsData, themePostCategoryList } = useSettingsContext();
  const router = useRouter();
  const [postCategory, setPostCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
    parent_id: -1,
    post_title: '',
    post_content: '',
    is_reply: 0,
    post_title_file: undefined,
  })
  useEffect(() => {
    settingPage();
  }, [router.query?.article_category, themePostCategoryList])
  const settingPage = async () => {
    setPostCategory(_.find(themePostCategoryList, { id: parseInt(router.query?.article_category) }))
    if (router.query?.id > 0) {
      let data = await apiShop('post', 'get', {
        id: router.query?.id
      })
      setItem(data);
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined;
    if (router.query?.id == 'add') {
      result = await apiShop('post', 'create', { ...item, category_id: router.query?.article_category });
    } else {
      result = await apiShop('post', 'update', { ...item });
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push(`/shop/service/${router.query?.article_category}`);
    }
  }
  return (
    <>
      <Wrappers>
        <RowMobileReverceColumn>
          <AuthMenuSideComponent />
          <ContentWrappers>
            <TitleComponent>{_.find(themePostCategoryList, { id: parseInt(router.query?.article_category) })?.post_category_title}</TitleComponent>
            {!loading &&
              <>
                <Stack spacing={3}>
                  {(router.query?.id == 'add' || item?.user_id != user?.id) ? //item?.user_id == user?.id에서 바꿈
                    <>
                      {postCategory.post_category_type == 1 &&
                        <>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                            대표이미지등록
                          </Typography>
                          <Upload file={item.post_title_file || item.post_title_img} onDrop={(acceptedFiles) => {
                            const newFile = acceptedFiles[0];
                            if (!newFile.type.includes('image')) {
                              toast.error('이미지 형식만 가능합니다.');
                              return;
                            }
                            if (newFile.size >= 3 * 1024 * 1024) {
                              toast.error('이미지 용량은 3MB 이내만 가능합니다.');
                              return;
                            }
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
                        </>}
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
                      <ReactQuillComponent
                        value={item.post_content}
                        setValue={(value) => {
                          setItem({
                            ...item,
                            ['post_content']: value
                          });
                        }}
                      />

                      <Button variant="contained" style={{
                        height: '48px', width: '120px', margin: '1rem 0 1rem auto'
                      }} onClick={() => {
                        setModal({
                          func: () => { onSave() },
                          icon: 'material-symbols:edit-outline',
                          title: '저장 하시겠습니까?'
                        })
                      }}>
                        저장
                      </Button>
                    </>
                    :
                    <>
                      <Row style={{ columnGap: '0.5rem', fontSize: '1rem', alignItems: 'center' }}>
                        <div>제목: </div>
                        <h1 style={{ fontSize: '1rem' }}>{item?.post_title}</h1>
                      </Row>
                      <img src={item?.post_title_img} style={{ width: '100%' }} />
                      <ReactQuill
                        className='none-padding'
                        value={item?.post_content ?? `<body></body>`}
                        readOnly={true}
                        theme={"bubble"}
                        bounds={'.app'}
                      />
                      {item?.replies && item?.replies.map((reply, idx) => (
                        <>
                          <Row style={{ columnGap: '0.5rem', fontSize: '1rem', alignItems: 'center' }}>
                            <div>답변제목: </div>
                            <h1 style={{ fontSize: '1rem' }}>{reply?.post_title}</h1>
                          </Row>
                          <ReactQuill
                            className='none-padding'
                            value={reply?.post_content ?? `<body></body>`}
                            readOnly={true}
                            theme={"bubble"}
                            bounds={'.app'}
                          />
                        </>
                      ))}
                    </>}
                </Stack>
              </>}
          </ContentWrappers>
        </RowMobileReverceColumn>
      </Wrappers>
    </>
  )
}
export default ArticleDemo