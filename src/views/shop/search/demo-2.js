import { Divider, InputAdornment, TextField, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { Col, Title, themeObj } from "src/components/elements/styled-components";
import { test_items } from "src/data/test-data";
import { Icon } from '@iconify/react';
import { Items } from 'src/components/elements/shop/common';
import _ from 'lodash';
import styled from "styled-components";

const Wrappers = styled.div`
display: flex;
flex-direction: column;
margin: 0 auto;
width: 90%;
min-height: 50vh;//최소 높이를 전체화면 높이의 90%로 함(스크롤바 포함x)
margin-bottom: 10vh;
`
//검색 후 결과 페이지 박이규
const Demo2 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const [keyword, setKeyword] = useState("")
  useEffect(() => {
    if (router.query?.keyword) {
      setKeyword(router.query?.keyword)
    }
  }, [router.query])
  return (
    <>
      <Wrappers>
        <Title>
          상품검색
        </Title>
        <TextField
          label=''//여기부터 검색하는 부분
          variant="standard"
          onChange={(e) => {
            setKeyword(e.target.value)
          }}
          value={keyword}
          style={{ width: '50%', margin: '0 auto 1rem auto' }}//검색창 길이, 위치
          autoComplete='new-password'

          onKeyPress={(e) => {
            if (e.key == 'Enter') {
              router.push(`/shop/search?keyword=${keyword}`)
            }
          }}
          InputProps={{
            sx: {
              padding: '0.5em 0'//검색창 위쪽?
            },
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  edge='end'
                  onClick={() => {
                    router.push(`/shop/search?keyword=${keyword}`)
                  }}
                  aria-label='toggle password visibility'
                  style={{
                    padding: '0.5rem'
                  }}
                ><Icon icon={'tabler:search'} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
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
      </Wrappers>
    </>
  )
}
export default Demo2
