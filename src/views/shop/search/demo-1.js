import { useEffect, useState } from 'react';
import { test_items } from 'src/data/test-data';
import styled from 'styled-components'
import { Col, Row, Title, themeObj } from 'src/components/elements/styled-components';
import { Item, Items } from 'src/components/elements/shop/common';
import _ from 'lodash';
import { Divider, IconButton, InputAdornment, TextField } from '@mui/material';
import { Icon } from '@iconify/react';

const Wrappers = styled.div`
max-width:1200px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`
const Demo1 = (props) => {
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
          label=''
          variant="standard"
          onChange={(e) => {
            setKeyword(e.target.value)
          }}
          value={keyword}
          style={{ width: '50%', margin: '0 auto 1rem auto' }}
          autoComplete='new-password'

          onKeyPress={(e) => {
            if (e.key == 'Enter') {
              router.push(`/shop/search?keyword=${keyword}`)
            }
          }}
          InputProps={{
            sx: {
              padding: '0.5rem 0'
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
                >
                  <Icon icon={'tabler:search'} />
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
export default Demo1
