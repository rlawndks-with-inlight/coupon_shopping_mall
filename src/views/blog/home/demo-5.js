import styled from 'styled-components'
import { test_categories, test_items, test_seller } from 'src/data/test-data';
import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { useSettingsContext } from 'src/components/settings';
import { themeObj } from 'src/components/elements/styled-components';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { Item5, Seller5 } from 'src/components/elements/blog/demo-5';
import HomeBanner from 'src/views/section/blog/HomeBanner'
import HomeEditor from 'src/views/section/blog/HomeEditor'
import HomeItems from 'src/views/section/blog/HomeItems'
import HomeButtonBanner from 'src/views/section/blog/HomeButtonBanner'
import HomeItemsWithCategories from 'src/views/section/blog/HomeItemsWithCategories'
import HomeVideoSlide from 'src/views/section/blog/HomeVideoSlide'
import HomePost from 'src/views/section/blog/HomePost'
import HomeProductReview from 'src/views/section/blog/HomeProductReview'
import HomeSellers from 'src/views/section/blog/HomeSellers'
import { getMainObjType } from 'src/utils/function'
import HomeItemsPropertyGroups from 'src/views/section/blog/HomeItemsPropertyGroups'


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
margin: 0 auto;
@media (max-width:840px){
    margin: 0 auto;
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
const returnHomeContent = (column, data, func) => {
    let type = getMainObjType(column?.type);

    if (type == 'banner') return <HomeBanner column={column} data={data} func={func} />
    else if (type == 'editor') return <HomeEditor column={column} data={data} func={func} />
    else if (type == 'items' || type == 'items-ids') {
        return <HomeItems column={column} data={data} func={func} />
    }
    else if (type == 'items-property-group-:num') return <HomeItemsPropertyGroups column={column} data={data} func={func} />
    else if (type == 'button-banner') return <HomeButtonBanner column={column} data={data} func={func} />
    else if (type == 'items-with-categories') return <HomeItemsWithCategories column={column} data={data} func={func} />
    else if (type == 'video-slide') return <HomeVideoSlide column={column} data={data} func={func} />
    else if (type == 'post') return <HomePost column={column} data={data} func={func} />
    else if (type == 'sellers') return <HomeSellers column={column} data={data} func={func} />
    else if (type == 'item-reviews') return <HomeProductReview column={column} data={data} func={func} />
    else if (type == 'item-reviews-select') return <HomeProductReview column={column} data={data} func={func} />
    return '';
}



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
                                <Seller5 item={item} router={router} type={data?.type} />
                            </>}
                        {data?.type == 'items' &&
                            <>
                                <Item5 item={item} router={router} type={data?.type} />
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
                                    <Seller5 item={item} router={router} type={data?.type} />
                                </>}
                            {data?.type == 'items' &&
                                <>
                                    <Item5 item={item} router={router} type={data?.type} />
                                </>}
                        </>
                    ))}
                </Slider>
            </SlideContainer>
        </>
    )
}


// 메인화면 김인욱
const Demo5 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;
    const { themeDnsData, themeSellerList } = useSettingsContext();
    const { user } = useAuthContext();
    const [homeContent, setHomeContent] = useState({});
    const [data, setData] = useState([]);
    const [contentList, setContentList] = useState([]);
    useEffect(() => {
        if (themeDnsData?.id > 0) {
            pageSetting();
        }
    }, [themeDnsData])
    const pageSetting = async () => {

        let dns_data = themeDnsData;
        let content_list = (dns_data?.blog_obj) ?? [];
        setContentList(content_list)
        setData([
            ...[{
                title: '마켓 오픈했어요 ✨',
                list: themeSellerList,
                type: 'seller'
            },],

        ])
    }

    const returnHomeContentByColumn = (column, idx) => {
        return returnHomeContent(
            column,
            {
                windowWidth: window.innerWidth,
                themeDnsData: themeDnsData,
                idx,
            },
            {
                router,
            })
    }

    return (
        <>
            <Wrappers>
                {/*<BannerContainer style={{
                    background: `${themeDnsData?.theme_css?.main_color}`
                }}>
                    <Title>아직도 일일이</Title>
                    <Title>주문받는 당신에게</Title>
                    <SubTitle style={{ marginTop: '1rem' }}>판매, 주문관리, 송장, 현금영수증, 고객관리</SubTitle>
                    <SubTitle>모든 기능이 100% 무료</SubTitle>
                    <CardImg
                        src={'https://www.inpock.co.kr/_next/image?url=https%3A%2F%2Fstorage.googleapis.com%2Finpock-store-asset-prod%2Fclient%2Fimg%2Finpock-image-thumbnail-store.60df99b.png&w=3840&q=75'} />
            </BannerContainer>*/}
                <ItemWrapper>
                    {contentList && contentList.map((column, idx) => (
                        <>
                            {returnHomeContentByColumn(column, idx)}
                        </>
                    ))}
                </ItemWrapper>
            </Wrappers>
        </>
    )
}
export default Demo5
