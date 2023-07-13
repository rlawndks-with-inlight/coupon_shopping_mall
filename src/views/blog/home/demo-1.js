import styled from 'styled-components'
import { test_categories, test_items, test_seller } from 'src/data/test-data';
import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { useSettingsContext } from 'src/components/settings';
import { themeObj } from 'src/components/elements/styled-components';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { Item, Seller } from 'src/components/elements/blog/demo-1';

const Wrappers = styled.div`
max-width: 840px;
width:100%;
margin: 56px auto;
display:flex;
flex-direction:column;
`
const BannerContainer = styled.div`
padding: 1rem 1rem 10rem 1rem;
display:flex;
flex-direction:column;
position:relative;
@media (max-width:840px){
    padding: 5% 5% 22vw 5%;
}
`
const Title = styled.div`
font-size:${themeObj.font_size.size5};
font-weight:bold;
color:#fff;
`
const SubTitle = styled.div`
color:${themeObj.grey[400]};
`
const CardImg = styled.img`
position: absolute;
width:calc(100% - 32px);
left:1rem;
bottom:-280px;
height:424px;
@media (max-width:840px){
    width:90%;
    height:45vw;
    left:5%;
    bottom:-25vw;
}
`
const test_home_data = [
    {
        title: '마켓 오픈했어요 ✨',
        list: test_seller,
        type: 'seller'
    },
    {
        title: '인기있는 상품 🔥',
        list: test_items,
        type: 'items'
    },
    {
        title: '인기있는 셀러 ❤️',
        list: test_items,
        type: 'items'
    },
    {
        title: '# Food',
        list: test_items,
        type: 'items'
    },
    {
        title: '# Beauty',
        list: test_items,
        type: 'items'
    },
    {
        title: '# Top',
        list: test_items,
        type: 'items'
    },
    {
        title: '# Pants',
        list: test_items,
        type: 'items'
    },
    {
        title: '# Blouse/Shirts',
        list: test_items,
        type: 'items'
    },
]
const ItemWrapper = styled.div`
display:flex;
flex-direction:column;
width:calc(100% - 32px);
margin: 300px auto 0 auto;
@media (max-width:840px){
    margin: 30vw auto 0 auto;
    width:90%;
}
`
const SectionTitle = styled.div`
font-weight:bold;
`
const ItemContainer = styled.div`
display:flex;
flex-wrap:wrap;
column-gap: 2%;
row-gap: 1rem;
margin:1rem 0 4rem 0;
@media (max-width:840px){
    display:none;
}
`
const SlideContainer = styled.div`
display: none;
@media (max-width:840px){
    margin:1rem 0 4rem 0;
    display: block;
}
`

const ItemSectionContent = (props) => {
    const { data, router } = props;
    const item_list_setting = {
        infinite: true,
        speed: 500,
        autoplay: false,
        autoplaySpeed: 2500,
        slidesToShow: 2,
        slidesToScroll: 1,
        dots: false,
    }
    return (
        <>
            <SectionTitle>{data?.title}</SectionTitle>
            <ItemContainer>
                {data?.list && data?.list.slice(0, 8).map((item, idx) => (
                    <>
                        {data?.type == 'seller' &&
                            <>
                                <Seller item={item} router={router} type={data?.type} />
                            </>}
                        {data?.type == 'items' &&
                            <>
                                <Item item={item} router={router} type={data?.type} />
                            </>}
                    </>
                ))}
            </ItemContainer>
            <SlideContainer>
                <Slider {...item_list_setting}>
                    {data?.list && data?.list.map((item, idx) => (
                        <>
                            {data?.type == 'seller' &&
                                <>
                                    <Seller item={item} router={router} type={data?.type} />
                                </>}
                            {data?.type == 'items' &&
                                <>
                                    <Item item={item} router={router} type={data?.type} />
                                </>}
                        </>
                    ))}
                </Slider>
            </SlideContainer>

        </>
    )
}
// 메인화면 김인욱
const Demo1 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;
    const { themeDnsData } = useSettingsContext();
    const { user } = useAuthContext();
    const [homeContent, setHomeContent] = useState({});
    useEffect(() => {
    }, [themeDnsData])

    return (
        <>
            <Wrappers>
                <BannerContainer style={{
                    background: `${themeDnsData?.theme_css?.main_color}`
                }}>
                    <Title>아직도 일일이</Title>
                    <Title>주문받는 당신에게</Title>
                    <SubTitle style={{ marginTop: '1rem' }}>판매, 주문관리, 송장, 현금영수증, 고객관리</SubTitle>
                    <SubTitle>모든 기능이 100% 무료</SubTitle>
                    <CardImg
                        src={'https://www.inpock.co.kr/_next/image?url=https%3A%2F%2Fstorage.googleapis.com%2Finpock-store-asset-prod%2Fclient%2Fimg%2Finpock-image-thumbnail-store.60df99b.png&w=3840&q=75'} />
                </BannerContainer>
                <ItemWrapper>
                    {test_home_data.map((data, idx) => (
                        <>
                            <ItemSectionContent data={data} router={router} />
                        </>
                    ))}
                </ItemWrapper>
            </Wrappers>
        </>
    )
}
export default Demo1
