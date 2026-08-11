import { Button, Stack, TextField, Typography } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import _ from "lodash";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import GuestInquiryFields, { GUEST_INQUIRY_EMPTY, validateGuestInquiry } from 'src/components/elements/shop/GuestInquiryFields';
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
const Wrappers = styled.div`
max-width:1500px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
padding-bottom: 4rem;
`
const PageHeader = styled.div`
display:flex;
flex-direction:column;
row-gap:0.5rem;
margin: 2.5rem 0 2rem 0;
padding-bottom: 1rem;
border-bottom: 2px solid ${props => props.theme?.palette?.primary?.main ?? themeObj.grey[800]};
`
const PageTitle = styled.div`
margin:0;
font-size:${themeObj.font_size.size2};
font-weight:bold;
text-transform:uppercase;
letter-spacing:0.02em;
`
const ArticleView = styled.div`
display:flex;
flex-direction:column;
row-gap:1.25rem;
`
const FieldLabel = styled.div`
font-size:${themeObj.font_size.size9};
font-weight:bold;
text-transform:uppercase;
letter-spacing:0.04em;
color:${themeObj.grey[600]};
white-space:nowrap;
`
const PostTitle = styled.h1`
margin:0;
font-size:${themeObj.font_size.size5};
font-weight:bold;
`
const TitleImg = styled.img`
width:100%;
border-radius:8px;
border:1px solid ${themeObj.grey[300]};
`
const ReplyBlock = styled.div`
display:flex;
flex-direction:column;
row-gap:1rem;
padding:1.5rem;
border:1px solid ${themeObj.grey[300]};
border-radius:8px;
background:${themeObj.grey[100]};
`

const ArticleDemo = (props) => {

  const theme = useTheme();
  const { user } = useAuthContext();
  // 비회원 1:1문의 입력값(이름·연락처·글비밀번호). 로그인 상태면 쓰지 않는다.
  const [guestObj, setGuestObj] = useState({ ...GUEST_INQUIRY_EMPTY });
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
      // 비회원이 조회 화면(/shop/auth/inquiry-check)에서 넘어온 경우 연락처·글비밀번호를 함께 보낸다.
      // 백엔드 post.get 이 이 두 값으로 '작성자 본인' 을 인정한다(계정이 없어 이것뿐이다).
      // 회원이거나 일반 게시판이면 router.query 에 없으므로 아무 영향이 없다.
      let data = await apiShop('post', 'get', {
        id: router.query?.id,
        none_user_phone: router.query?.none_user_phone,
        password: router.query?.password,
      })
      setItem(data);
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined;
    // 비회원은 이름·연락처·글비밀번호가 있어야 저장할 수 있다.
    // (백엔드 shop.controller post.create 와 같은 기준 — 여기서 먼저 걸러 왕복을 줄인다)
    if (!user && router.query?.id == 'add') {
      const invalid = validateGuestInquiry(guestObj);
      if (invalid) { toast.error(translate(invalid)); return; }
    }
    if (router.query?.id == 'add') {
      result = await apiShop('post', 'create', {
        ...item,
        category_id: router.query?.article_category,
        ...(user ? {} : guestObj),
      });
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
      <Wrappers>
        <PageHeader theme={theme}>
          <PageTitle>{formatLang(postCategory, 'post_category_title', currentLang)} {router.query?.id == 'add' ? '작성' : ''}</PageTitle>
        </PageHeader>
        {!loading &&
          <>
            <Stack spacing={3}>
              {/* ⚠ 느슨한 비교(==)면 비회원 글(user_id=null)을 비로그인(user=undefined)으로 열 때
                  null == undefined 가 true 가 되어 읽기 화면 대신 수정 폼이 뜬다.
                  '로그인했고 + 본인 글' 을 양성 조건으로 둔다. */}
              {(router.query?.id == 'add' || (user?.id > 0 && item?.user_id == user?.id)) ?
                <>
                  {/* 비회원 작성 칸. 로그인 상태면 그리지 않는다. */}
                  {!user && router.query?.id == 'add' &&
                    <GuestInquiryFields value={guestObj} onChange={setGuestObj} />}
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

                  <Button variant="contained" style={{
                    height: '48px', width: '120px', margin: '1rem 0 1rem auto'
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
                <ArticleView>
                  <Row style={{ columnGap: '0.75rem', alignItems: 'center' }}>
                    <FieldLabel>{translate('제목')}</FieldLabel>
                    <PostTitle>{formatLang(item, 'post_title', currentLang)}</PostTitle>
                  </Row>
                  <PostDate value={item?.created_at} />
                  <TitleImg src={item?.post_title_img} />
                  <ReactQuill
                    className='none-padding'
                    value={formatLang(item, 'post_content', currentLang) ?? `<body></body>`}
                    readOnly={true}
                    theme={"bubble"}
                    bounds={'.app'}
                  />
                  {item?.replies && item?.replies.map((reply, idx) => (
                    <ReplyBlock key={idx}>
                      <Row style={{ columnGap: '0.75rem', alignItems: 'center' }}>
                        <FieldLabel>{translate('답변제목')}</FieldLabel>
                        <PostTitle>{formatLang(reply, 'post_title', currentLang)}</PostTitle>
                      </Row>
                      <ReactQuill
                        className='none-padding'
                        value={formatLang(reply, 'post_content', currentLang) ?? `<body></body>`}
                        readOnly={true}
                        theme={"bubble"}
                        bounds={'.app'}
                      />
                    </ReplyBlock>
                  ))}
                </ArticleView>}
            </Stack>
          </>}
      </Wrappers>
    </>
  )
}
export default ArticleDemo
