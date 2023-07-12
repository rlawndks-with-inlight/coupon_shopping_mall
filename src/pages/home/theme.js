import { Button, Chip, MenuItem, Select } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { Row, Title, themeObj } from "src/components/elements/styled-components";
import MainLayout from "src/layouts/main/MainLayout";
import styled from 'styled-components'

const Wrappers = styled.div`
max-width:1200px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`
const SubTitle = styled.div`
margin:0 auto;
color:${themeObj.grey[500]};
`
const TemplateWrappers = styled.div`
display:flex;
width:100%;
column-gap:2%;
margin:2rem auto;
flex-wrap:wrap;
`
const TemplateContainer = styled.div`
width: 32%;
display:flex;
flex-direction:column;
cursor:pointer;
`
const TemplateImg = styled.div`
width:100%;
height:288px;
`

const Template = (props) => {
  const { item, router } = props;

  const [isMouseOver, setIsMouseOver] = useState(false)
  return (
    <>
      <TemplateContainer>
        <TemplateImg
          style={{
            backgroundImage: `url(${item.img_src})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
          onMouseOver={() => setIsMouseOver(true)}
          onMouseLeave={() => { setIsMouseOver(false) }}
        >
          <Row style={{ opacity: `${isMouseOver ? 1 : 0}`, flexDirection: 'column', height: '100%', background: '#00000099', transition: '0.3s' }}>
            <Button variant="contained" sx={{ width: '120px', margin: 'auto auto 0.25rem auto' }} onClick={()=>{
              router.push('/manager/login?is_first=1')
            }}>개설하기</Button>
            <Button variant="outlined" sx={{ width: '120px', margin: '0.25rem auto auto auto', background: '#fff', '&:hover': { background: '#fff' } }}>미리보기</Button>
          </Row>
        </TemplateImg>
        <Row style={{ marginTop: '1rem', alignItems: 'center', fontWeight: 'bold' }}>
          <div>{item.title}</div>
          {item.badge_title &&
            <>
              <Chip label={item.badge_title} color="error" sx={{ marginLeft: '0.5rem' }} />
            </>}
        </Row>
      </TemplateContainer>
    </>
  )
}
const test_template_list = [// type = 1 -> 일반 쇼핑몰, type = 2 -> 블로그 쇼핑몰,
  {
    type: 1,
    title: '일반쇼핑몰 1',
    badge_title: '쇼핑',
    img_src: 'https://cdn.imweb.me/upload/S20230221d506734a1624d/0e520d8699208.png'
  },
  {
    type: 1,
    title: '일반쇼핑몰 2',
    badge_title: '',
    img_src: 'https://cdn.imweb.me/upload/c455cd5074187.jpg'
  },
  {
    type: 2,
    title: '블로그쇼핑몰 1',
    badge_title: '',
    img_src: 'https://cdn.imweb.me/upload/8ed049ef7eaee.jpg'
  },
]
const Theme = () => { //디자인 미리보기

  const router = useRouter();

  const [selectTemplateType, setSelectTemplateType] = useState(0);
  return (
    <>
      <Wrappers>
        <Title>디자인 미리보기</Title>
        <SubTitle>사용할 템플릿을 선택해 주세요.</SubTitle>
        <Row>
          <Select
            size="small"
            value={selectTemplateType}
            onChange={(e) => setSelectTemplateType(e.target.value)}
            sx={{ minWidth: '130px', marginLeft: 'auto' }}

          >
            <MenuItem value={0}>전체</MenuItem>
            <MenuItem value={1}>일반쇼핑몰</MenuItem>
            <MenuItem value={2}>블로그쇼핑몰</MenuItem>
          </Select>
        </Row>
        <TemplateWrappers>
          {test_template_list.map((template, idx) => (
            <>
              {(selectTemplateType == 0 || selectTemplateType == template.type) &&
                <>
                  <Template item={template} router={router} />
                </>}
            </>
          ))}
        </TemplateWrappers>
      </Wrappers>
    </>
  )
}

Theme.getLayout = (page) => <MainLayout> {page} </MainLayout>;
export default Theme;
