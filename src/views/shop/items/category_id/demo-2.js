import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { Row, themeObj, Title, Col } from 'src/components/elements/styled-components'
import { useSettingsContext } from 'src/components/settings'
import { test_items } from 'src/data/test-data'
import { getAllIdsWithParents } from 'src/utils/function'
import { Items } from 'src/components/elements/shop/common'
import { Breadcrumbs, Button, Divider } from '@mui/material';
import styled from 'styled-components'
import _ from 'lodash';
const ContentWrapper = styled.div`
max-width: 1200px;
width: 90%;
margin: 0 auto 5rem auto;
display: flex;
flex-direction:column;
`
//카테고리 클릭시 상품 리스트 박이규
const Demo2 = props => {
  const {
    data: { },
    func: {
      router
    }
  } = props
  const { themeCategoryList, themeMode } = useSettingsContext();//themeMode가 다크모드로 바꾸게 하는 세팅같음

  const [parentList, setParentList] = useState([]);//질문 부모 리스트 카테고리는-> tv-> 대형tv 말하는 건가?
  const [curCategories, setCurCategories] = useState([]);//현재 품목 카테고리와 변경할 품목 카테고리
  useEffect(() => {
    if (themeCategoryList.length > 0) {//카테고리에서 골랐다면
      let parent_list = []
      if (parentList.length > 0) {
        parent_list = parentList; //질문 선택한 부모 리스트를 출력시키려고 현재 부모 리스트에 넣는거?
      } else {
        parent_list = getAllIdsWithParents(themeCategoryList);//
      }
      setParentList(parent_list);//질문 선택한 부모 카테고리를 넣은건가?
      let use_list = [];
      for (var i = 0; i < parent_list.length; i++) {//질문 아래 리스트할때?.이 뭘 어떻게 쓰는건지 잘 모르겠음 그냥 . 이랑 어떻게 다른거지
        if (parent_list[i][router.query?.depth]?.id == router.query?.category_id) {
          use_list = parent_list[i];
          break;
        }
      }
      setCurCategories(use_list);
    }
  }, [themeCategoryList, router.query])
  return (
    <>
      <ContentWrapper>
        {curCategories.length > 1 ?
          <>
            <Breadcrumbs separator={<Icon icon='material-symbols:navigate-next' />} style={{
              padding: '0.5rem, 0',
              width: '100%',
              overflowX: 'auto'
            }}>
              {curCategories.map((item, idx) => (
                <>
                  <div style={{
                    color: `${idx == curCategories.length - 1 ? (themeMode == 'dark' ? '#fff' : '#000') : ''}`,//다크모드일때 카테고리 글자색을 흰색으로 아니면 검정색으로
                    fontWeight: `${idx == curCategories.length - 1 ? 'bold' : ''}`,
                    cursor: 'pointer'
                  }}
                    onClick={() => {
                      router.push(`shop/items/${item?.id}?depth=${idx}`)//카테고리 클릭시 해당 카테고리로 들어감 홈스마트, 가구/소품, 가방/잡화 부분
                    }}
                  >{item.category_name}</div>
                </>
              ))}
            </Breadcrumbs>
          </>
          :
          <>
            <div style={{ marginTop: '42px' }} />
          </>}
        <Title style={{ marginTop: '38px' }}>
          {curCategories[curCategories.length - 1]?.category_name}
        </Title>
        <Row style={{ margin: '0 auto', overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }} className='none-scroll'>
          {curCategories[curCategories.length - 1]?.children && curCategories[curCategories.length - 1]?.children.map((item, idx) => (
            <>
              <Button variant="outlined" style={{
                fontSize: themeObj.font_size.size7,//버튼 글자 크기
                height: '36px',//쇼핑몰별/학생가구/주방가구 버튼 높이
                marginRight: `${idx == curCategories[curCategories.length - 1]?.children.length - 1 ? 'auto' : '0.25rem'}`,
                marginLeft: `${idx == 0 ? 'auto' : '0'}`//왼쪽에서의 버튼 간격
              }}
                onClick={() => {
                  router.push(`/shop/items/${item?.id}?depth=${parseInt(router.query?.depth) + 1}`)
                }}
              >{item.category_name}</Button>
            </>//위의 버튼이 가구/소품 누르면 아래에 버튼으로 쇼핑몰별/학생가구/주방가구 나오게 하는것 같음
          ))}
        </Row>
        <div style={{
          marginTop: '1rem'
        }} />
        <Divider />
        <div style={{
          marginTop: '1rem'
        }} />
        {test_items.length > 0 ?
          <>
            <Items items={test_items} router={router} />
          </>
          :
          <>
            <Col>
              <Icon icon={'basil:cancel-outline'} style={{ margin: '8rem auto 1rem auto', fontSize: themeObj.font_size.size1, color: themeObj.grey[300] }} />
              <div style={{ margin: 'auto auto 8rem auto' }}>검색결과가 없습니다.</div>
            </Col>
          </>}
      </ContentWrapper>
    </>
  )
}
export default Demo2
