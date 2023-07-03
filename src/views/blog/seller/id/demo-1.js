import { Icon } from '@iconify/react';
import { Drawer } from '@mui/material';
import { useEffect, useState } from 'react';
import { SellerItem } from 'src/components/elements/blog/demo-1';
import { Row, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { test_categories, test_items, test_seller } from 'src/data/test-data';
import styled from 'styled-components'

const Wrappers = styled.div`
max-width: 840px;
width:100%;
margin: 0 auto;
display:flex;
flex-direction:column;
position:relative;
`
const BannerImg = styled.div`
width:100%;
height:400px;
display:flex;
flex-direction:column;
align-items:center;

`
const Title = styled.div`
color:#fff;
margin-top:auto;
margin-bottom:0.5rem;
font-size:${themeObj.font_size.size4};
font-weight:bold;
`
const SubTitle = styled.div`
color:#fff;
font-size:${themeObj.font_size.size9};
text-align:center;
`
const CategoryWrapper = styled.div`
position:absolute;
top:350px;
display:flex;
flex-direction:column;
padding:2.25rem 1rem 1rem 1rem;
width:100%;
border-top-left-radius: 24px;
border-top-right-radius: 24px;
`
const CategoryContainer = styled.div`
display:flex;
width:100%;
overflow-x:auto;
white-space:nowrap;
margin-top:1rem;
`
const Category = styled.div`
padding:0.25rem;
font-size:${themeObj.font_size.size9};
`
const ItemContainer = styled.div`
width:calc(100% - 32px);
margin: 5rem auto 0 auto;
display:flex;
flex-wrap:wrap;
column-gap:4%;
row-gap:1rem;
`
// 셀러별 메인페이지 김인욱
const Demo1 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;
    const { themeMode } = useSettingsContext();
    const test_seller_data = {
        seller: test_seller[0],
        banner: 'https://d32rratnkhh4zp.cloudfront.net/media/images/2022/1/11/thumb@1080_1641873353-1ecca7c0-00a5-42fe-9d2a-8e79c7b29f75.jpeg',
        categories: test_categories,
    }

    const [sellerData, setSellerData] = useState({});
    const [categoryId, setCategoryId] = useState(0);
    const [scrollY, setScrollY] = useState(0);
    const [cartOpen, setCartOpen] = useState(false);
    useEffect(() => {
        setSellerData(test_seller_data);
    }, [])
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollHeight = window.scrollY;
            setScrollY(currentScrollHeight)
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    const onClickCartButton = (item) =>{
        setCartOpen(true);
    }
    return (
        <>
            <Wrappers>
                <BannerImg style={{
                    backgroundImage: `url(${test_seller_data?.banner})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                }}>
                    <Title>{sellerData?.seller?.title}</Title>
                    <SubTitle>{sellerData?.seller?.sub_title}</SubTitle>
                    <Icon icon='fe:instagram' style={{
                        margin: '1rem',
                        fontSize: themeObj.font_size.size4,
                        color: '#fff'
                    }} />
                    <Row style={{
                        marginBottom: 'auto',
                    }}>
                        <SubTitle style={{ borderRight: '1px solid #fff', width: '65px' }}>공지사항</SubTitle>
                        <SubTitle style={{ width: '64px' }}>1:1문의</SubTitle>
                    </Row>
                </BannerImg>
                <CategoryWrapper style={{
                    background: `${themeMode == 'dark' ? '#000' : '#fff'}`,
                    borderRadius:`${scrollY >=350?'0':''}`,
                    position:`${scrollY >=350?'fixed':''}`,
                    top:`${scrollY >=350?'0':''}`,
                    zIndex:9
                }}>
                    {scrollY < 350 &&
                    <>
                    <div style={{ margin: '0 auto', fontSize: themeObj.font_size.size8 }}>Product</div>
                    <Icon icon='mdi:dot' style={{ margin: '0 auto' }} />
                    </>}
                    <CategoryContainer className='none-scroll'>
                        <Category onClick={() => { setCategoryId(0) }}
                            style={{
                                fontWeight: `${categoryId == 0 ? 'bold' : ''}`,
                                color: `${categoryId == 0 ? '' : themeObj.grey[500]}`,
                                borderBottom: `2px solid ${categoryId == 0 ? `${themeMode == 'dark' ? '#fff' : '#000'}` : 'transparent'}`,
                            }}
                        >All</Category>
                        {sellerData?.categories && sellerData?.categories.map((item, idx) => (
                            <>
                                <Category
                                    onClick={() => { setCategoryId(item?.id) }}
                                    style={{
                                        fontWeight: `${categoryId == item?.id ? 'bold' : ''}`,
                                        color: `${categoryId == item?.id ? '' : themeObj.grey[500]}`,
                                        borderBottom: `2px solid ${categoryId == item?.id ? `${themeMode == 'dark' ? '#fff' : '#000'}` : 'transparent'}`,
                                    }}
                                >{item.category_name}</Category>
                            </>
                        ))}
                    </CategoryContainer>
                </CategoryWrapper>
                <ItemContainer>
                    {test_items.map((item, idx) => (
                        <>
                            <SellerItem router={router} item={item} onClickCartButton={onClickCartButton} />
                        </>
                    ))}
                </ItemContainer>
            </Wrappers>
            <Drawer
            anchor={'bottom'}
            open={cartOpen}
            onClose={() => {
              setCartOpen(false);
            }}
            style={{
            }}
            >
                <div style={{padding:'5rem'}}>
                    asd
                </div>
            </Drawer>
        </>
    )
}
export default Demo1
