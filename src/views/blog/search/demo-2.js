import { useEffect, useState } from 'react';
import EmptyResult from 'src/components/elements/shop/EmptyResult';
import { test_items } from 'src/data/test-data';
import styled from 'styled-components'
import { Col, Row, Title, themeObj } from 'src/components/elements/styled-components';
import { Item, Items } from 'src/components/elements/blog/common';
import _ from 'lodash';
import { Button, CircularProgress, Divider, IconButton, InputAdornment, TextField } from '@mui/material';
import { Icon } from '@iconify/react';
import { useSettingsContext } from 'src/components/settings';
import { useRef } from 'react';
import { Spinner } from 'evergreen-ui';
import $ from 'jquery';
import { apiShop } from 'src/utils/api';
import { useLocales } from 'src/locales';
import CategoryChips, { 카테고리경로, 카테고리칩쓰는프레임 } from 'src/components/elements/shop/CategoryChips';
import { formatLang } from 'src/utils/format';

const Wrappers = styled.div`
max-width:720px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`
const Demo2 = (props) => {
    const {
        // 전체보기(/shop/items)로 쓸 때 true. 제목과 '없을 때' 문구만 달라지고 나머지는 같다.
        전체보기 = false,
        data: {

        },
        func: {
            router
        },
    } = props;
    const { translate, currentLang } = useLocales();
    const { themeDnsData, themeCategoryList } = useSettingsContext();
    const [keyword, setKeyword] = useState("")
    const [products, setProducts] = useState([]);
    const [productContent, setProductContent] = useState({});
    const [moreLoading, setMoreLoading] = useState(false);
    const moreLoadingRef = useRef(false);
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
        // ⚠ moreLoading(state) 이 아니라 ref 를 본다. 이 핸들러는 deps [] 로 한 번만 등록되므로
        //   state 를 읽으면 등록 시점의 값(false)에 영원히 묶여 가드가 무의미해진다(바닥에서 반복 발사 → 흔들림).
        if (top < windowHeight && bottom >= 0 && !moreLoadingRef.current) {
            moreLoadingRef.current = true;
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
        if (!router.isReady) return;
        setKeyword(router.query?.keyword ?? '');
        // 키워드 없이 들어오면(헤더 검색 아이콘 → 빈 검색) 전체 상품을 보여준다.
        // 기존엔 keyword 가 있을 때만 조회해서, 없으면 loading=true 인 채로 스피너가 영구 표시됐다.
        settingPage({
            page: 1,
            page_size: 15,
            // 전체보기는 검색어를 쓰지 않는다 — 주소에 keyword 가 남아 있으면 목록이 걸러진다.
            search: 전체보기 ? '' : (router.query?.keyword ?? ''),
            // 전체보기에서 카테고리 칩을 누르면 주소에 category_id 가 붙는다.
            // 검색 화면에서는 안 붙인다 — 검색은 카테고리를 가리지 않는다.
            ...(전체보기 && 카테고리칩쓰는프레임(themeDnsData) && router.query?.category_id
                ? { category_id: router.query?.category_id } : {}),
        }, true);
        // ⚠ category_id 를 의존성에 안 넣으면 주소만 바뀌고 목록은 그대로 남는다.
    }, [router.isReady, router.query?.keyword, router.query?.category_id])
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
            // 함수형 갱신 — 이 함수는 async 라 낡은 클로저의 products 를 읽으면 앞 페이지가 사라진다.
            setProducts((prev) => [...prev, ...(product_list?.content ?? [])]);
        }
        setProductContent(product_list);
        // 결과가 비었든 실패했든 무조건 푼다(가드 ref 포함). 예전엔 products 가 늘었을 때만 풀어서
        // 마지막 페이지(빈 응답)에서 스피너가 영영 돌았고, 가드가 안 풀려 이후 로드도 막혔다.
        moreLoadingRef.current = false;
        setMoreLoading(false);
    }
    // 카테고리를 고른 상태면 제목도 그 이름으로 바꾼다 —
    // '전체상품' 인 채로 개수만 줄면 고객은 걸러진 줄 모르고 '상품이 없는 가게' 로 읽는다.
    // 칩을 안 그리는 프레임(5·6)에서는 제목도 건드리지 않는다 — 주소에 옛 id 가 남아 있을 수 있다.
    const 칩쓴다 = 전체보기 && 카테고리칩쓰는프레임(themeDnsData);
    const 경로 = 카테고리경로(themeCategoryList, 칩쓴다 ? router.query?.category_id : null);
    const 선택카테고리 = 경로[경로.length - 1];
    return (
        <>
            <Wrappers>
                {/* 전체보기(/shop/items)도 이 화면을 쓴다.
                    블로그 프레임에는 전용 상품목록 화면이 없어서, 전체보기가 쇼핑몰 프레임1 목록으로
                    떨어지고 있었다 — 헤더·카드 폭이 그 레이아웃 기준이라 디자인이 무너져 보였다.
                    검색은 멀쩡했으므로 그 화면을 그대로 목록으로도 쓴다(제목·빈 문구만 바뀐다). */}
                <Title>
                    {전체보기
                        ? (선택카테고리 ? formatLang(선택카테고리, 'category_name', currentLang) : translate('전체상품'))
                        : translate('상품검색')}
                </Title>
                {/* 카테고리 이동 수단. 헤더가 아니라 이 화면에 두는 이유는 CategoryChips 주석 참고. */}
                {칩쓴다 &&
                    <div style={{ marginTop: '0.75rem' }}>
                        <CategoryChips router={router} />
                    </div>}
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
                                        <Items items={products} router={router} type={2} />
                                    </>
                                    :
                                    <>
                                        <Col>
                                            <Icon icon={'basil:cancel-outline'} style={{ margin: '8rem auto 1rem auto', fontSize: themeObj.font_size.size1, color: themeObj.grey[300] }} />
                                            <div style={{ margin: 'auto auto 8rem auto' }}>
                                                <EmptyResult 전체보기={전체보기} />
                                            </div>
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
                                    // 가드 없으면 마지막 페이지 바닥에서 빈 페이지를 무한 요청하며
                                    // moreLoading·센티넬이 껌뻑여 화면이 흔들린다(서버도 계속 때린다).
                                    if (products.length < productContent?.total) {
                                        settingPage({
                                            ...searchObj,
                                            page: searchObj?.page + 1
                                        })
                                    }
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
export default Demo2
