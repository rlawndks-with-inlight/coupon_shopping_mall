import { Box, Button, Card, Divider, Stack, TextField, Typography } from "@mui/material";
import _ from "lodash";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import { Col, Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { useLocales } from "src/locales";
import { apiShop } from "src/utils/api";
import { formatLang } from "src/utils/format";
import ReactQuillComponent from "src/views/manager/react-quill";
import styled from "styled-components";
import PostDate from 'src/components/elements/shop/PostDate';
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})
const Wrapper = styled.div`
display:flex;
flex-direction:column;
min-height:76vh;
`
const ContentWrapper = styled.div`
max-width:900px;
width:90%;
margin: 3rem auto 5rem auto;
display:flex;
flex-direction:column;
`

const ArticleDemo = (props) => {

  const { user } = useAuthContext();
  const { setModal } = useModal()
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { translate, currentLang } = useLocales();
  const { themePostCategoryList, themeDnsData } = useSettingsContext();
  const mainColor = themeDnsData?.theme_css?.main_color;
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
      toast.success(translate("성공적으로 저장 되었습니다."));
      router.push(`/shop/service/${router.query?.article_category}`);
    }
  }
  return (
    <>
      <Head>
        <title>{themeDnsData?.name} {item?.post_title ? ` - ${formatLang(item, 'post_title', currentLang)}` : ''}</title>
      </Head>
      <Wrapper>
        <ContentWrapper>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant='h4' sx={{ fontWeight: 700, letterSpacing: '0.05em' }}>
              {formatLang(postCategory, 'post_category_title', currentLang)} {router.query?.id == 'add' ? '작성' : ''}
            </Typography>
            <Box sx={{ width: '40px', height: '2px', margin: '1rem auto 0 auto', backgroundColor: mainColor || themeObj.grey[800] }} />
          </Box>
          {!loading &&
            <>
              <Card variant='outlined' sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: '4px' }}>
                <Stack spacing={3}>
                  {(router.query?.id == 'add' || item?.user_id == user?.id) ?
                    <>
                      {postCategory.post_category_type == 1 &&
                        <>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                            {translate('대표이미지등록')}
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
                              width: translate('(512x512 추천)')//파일 사이즈 설명
                            }}
                          />
                        </>}
                      <TextField
                        fullWidth
                        label={translate('제목')}
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

                      <Button variant="contained" color="inherit" style={{
                        height: '48px', width: '120px', margin: '1rem 0 1rem auto', fontWeight: 600
                      }} onClick={() => {
                        setModal({
                          func: () => { onSave() },
                          icon: 'material-symbols:edit-outline',
                          title: translate('저장 하시겠습니까?')
                        })
                      }}>
                        {translate('저장')}
                      </Button>
                    </>
                    :
                    <>
                      <Box>
                        <Typography variant='h5' sx={{ fontWeight: 700, wordBreak: 'break-all' }}>
                          {formatLang(item, 'post_title', currentLang)}
                        </Typography>
                        <PostDate value={item?.created_at} style={{ marginTop: '0.35rem' }} />
                      </Box>
                      <Divider />
                      {item?.post_title_img &&
                        <img src={item?.post_title_img} style={{ width: '100%', borderRadius: '4px' }} />}
                      <ReactQuill
                        className='none-padding'
                        value={formatLang(item, 'post_content', currentLang) ?? `<body></body>`}
                        readOnly={true}
                        theme={"bubble"}
                        bounds={'.app'}
                      />
                    </>}
                  {/* 답변은 위 삼항의 '읽기' 분기 안에만 있었다. 그래서 작성자 본인이 자기 글을 열면
                      '수정폼' 분기로 빠져 관리자 답변이 화면에 아예 나오지 않았다(1:1문의 답변 안 보임).
                      분기 밖으로 빼서 본인/타인 모두 답변을 보게 한다. 새 글(add)에는 답변이 없다.
                      블로그형(blog/service/.../id/demo-1~5)은 이미 이렇게 동작한다. */}
                  {router.query?.id != 'add' && (item?.replies ?? []).map((reply, idx) => (
                    <Box key={reply?.id ?? idx} sx={{ backgroundColor: themeObj.grey[100], borderRadius: '4px', p: { xs: 2, sm: 3 }, mt: 1 }}>
                      <Col style={{ rowGap: '0.5rem' }}>
                        <Row style={{ columnGap: '0.5rem', alignItems: 'center' }}>
                          <Typography variant='caption' sx={{ color: 'text.secondary' }}>{translate('답변제목')}</Typography>
                          <Typography variant='subtitle1' sx={{ fontWeight: 700, wordBreak: 'break-all' }}>
                            {formatLang(reply, 'post_title', currentLang)}
                          </Typography>
                        </Row>
                        <ReactQuill
                          className='none-padding'
                          value={formatLang(reply, 'post_content', currentLang) ?? `<body></body>`}
                          readOnly={true}
                          theme={"bubble"}
                          bounds={'.app'}
                        />
                      </Col>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </>}
        </ContentWrapper>
      </Wrapper>
    </>
  )
}
export default ArticleDemo
