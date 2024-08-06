import { useEffect, useState } from 'react';
import { test_items } from 'src/data/test-data';
import styled from 'styled-components'
import { Col, Row, Title, themeObj } from 'src/components/elements/styled-components';
import { Item, Items } from 'src/components/elements/shop/common';
import _ from 'lodash';
import { Button, CircularProgress, Divider, IconButton, InputAdornment, TextField } from '@mui/material';
import { Icon } from '@iconify/react';
import { useSettingsContext } from 'src/components/settings';
import { useRef } from 'react';
import { Spinner } from 'evergreen-ui';
import $ from 'jquery';
import { apiShop } from 'src/utils/api';
import { useLocales } from 'src/locales';

const Wrappers = styled.div`
max-width:1200px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`
const SearchDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const [keyword, setKeyword] = useState("")
  const [products, setProducts] = useState([]);
  const [productContent, setProductContent] = useState({});
  const [moreLoading, setMoreLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 15,
    search: "",
  })
  const handleScroll = () => {
    if (!scrollRef.current) {
      return;
    }
    const { top, bottom } = scrollRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    if (top < windowHeight && bottom >= 0 && !moreLoading) {
      setMoreLoading(true);
      $('.more-page').trigger("click");
    }
  };
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  useEffect(() => {
    if (router.query?.keyword) {
      setKeyword(router.query?.keyword);
      settingPage({
        page: 1,
        page_size: 15,
        search: router.query?.keyword,
      }, true);
    }
  }, [router.query])
  const settingPage = async (search_obj, is_first) => {
    if (is_first) {
      setLoading(true);
      setProducts([]);
    }
    let product_list = await apiShop('product', 'list', {
      ...search_obj,
      brand_id: themeDnsData?.id,
    })
    setSearchObj(search_obj);
    if (is_first) {
      setProducts(product_list.content ?? []);
      setLoading(false);
    } else {
      setProducts([...products, ...product_list.content ?? []]);
    }
    setProductContent(product_list);
  }
  useEffect(() => {
    if (products.length > 0) {
      setMoreLoading(false);
    }
  }, [products])
  return (
    <>
      <Wrappers>
        <Title>
          {translate('상품검색')}
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
        {products ?
          <>
            {loading ?
              <>
                <Row style={{ width: '100%', height: '300px' }}>
                  <div style={{ margin: 'auto' }}>
                    <CircularProgress />
                  </div>
                </Row>
              </>
              :
              <>
                {products.length > 0 ?
                  <>
                    <Items items={products} router={router} />
                  </>
                  :
                  <>
                    <Col>
                      <Icon icon={'basil:cancel-outline'} style={{ margin: '8rem auto 1rem auto', fontSize: themeObj.font_size.size1, color: themeObj.grey[300] }} />
                      <div style={{ margin: 'auto auto 8rem auto' }}>{translate('검색결과가 없습니다.')}</div>
                    </Col>
                  </>}
              </>}
            {moreLoading ?
              <>
                {productContent?.total > products.length &&
                  <>
                    <Row style={{ width: '100%' }}>
                      <div style={{ margin: '0 auto' }}>
                        <CircularProgress />
                      </div>
                    </Row>
                  </>}
              </>
              :
              <>
                <Button className='more-page' onClick={() => {
                  settingPage({
                    ...searchObj,
                    page: searchObj?.page + 1
                  })
                }} ref={scrollRef} />
              </>}
          </>
          :
          <>
          </>}
      </Wrappers>
    </>
  )
}
export default SearchDemo