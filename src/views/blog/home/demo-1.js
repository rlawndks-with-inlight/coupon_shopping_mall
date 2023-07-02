import styled from 'styled-components'
import { test_categories, test_items } from 'src/data/test-data';
import 'react-quill/dist/quill.snow.css';
import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Skeleton, Stack } from '@mui/material'
import { Item } from 'src/components/elements/blog/demo-1';

// const signed = useContext(SignedContext);

const Wrapper = styled.div`
display:flex;
flex-direction:column;
position:relative; 
min-height:17vh;
max-width:1000px;
margin: 0 auto;
`

const ContentWrapper = styled.div`
position:relative;
width:100%;
`


const NavBar = styled.div`
display:flex;
margin:0 auto;
font-weight:bold;
justify-content:space-around;
align-items:center;
text-align:center;
position:fixed;
left:0;
right:0;
max-width:1000px;
background-color:white;
padding:30px;
cursor:pointer;
border-bottom:1px solid lightgray;
z-index:1;
`

const NavBarMenu = styled.span`
margin-top:2rem;
`

const Banner = styled.div`
display:flex;
flex-direction:column;
background-color:gray;
max-width:1000px;
max-height:800px;
padding:30px;
`

const BannerMessage1 = styled.h2`
font-weight:bold;
color:white;
`

const BannerMessage2 = styled.p`
font-weight:regular;
color:black;
margin-top:16px;
`

const BannerLink = styled.a`
target:_blank;
rel:nofollow;
`

const BannerImage = styled.a`
box-sizing:content-box;
overflow:hidden;
width:auto;
background:none;
border:0px;
margin:0px;
padding:0px;
position:relative;
cursor:pointer;
`

const ContentTitle = styled.p`
font-weight:bold;
`

const contents = (column, func) => {
    const { router } = func;
    let type = column?.type;
    let content = undefined;
  
    if (type == 'banner') {
        content = <>
        <Wrapper>
            <Banner>
                <BannerMessage1>테스트 문구 1<br />테스트 문구 1</BannerMessage1>
                <BannerMessage2>테스트 문구 2<br />테스트 문구 2</BannerMessage2>
                <BannerLink>
                    <BannerImage>
                        <img src={column?.src} />
                    </BannerImage>
                </BannerLink>
            </Banner>
        </Wrapper>
      </>
    }
  
    if (type == 'items') {
        let slide_setting = {
            infinite: true,
            speed: 500,
            autoplay: false,
            slidesToScroll: 1,
            dots: false,
        }
    content = <>
    <ContentWrapper>
        <ContentTitle>{column?.title}</ContentTitle>
        <Slider {...slide_setting}>
        {column?.list && column?.list.map((item, idx) => (
            <>
              <Item item={item} router={router} />
            </>
          ))}
        </Slider>
    </ContentWrapper>
      </>
      }
      return content
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
      const [loading, setLoading] = useState(true)

      const pageLoad = () => {
        setTimeout(() => {
            setLoading(false)
        }, 500)
      }

      useEffect(() => {
        pageLoad()
      }, [])
      
      let category = test_categories.map(function(element){
        return <NavBarMenu>{element.category_name}</NavBarMenu>;
      })

      const home_content_list = [
        {
            type: 'banner',
            src: 'https://backend.comagain.kr/storage/images/advertisements/1682780973e13c43e720132a9575ff3b6f8f88fec6.webp'
        },
        {
          type: 'items',
          list: test_items,
          title: 'HOT ITEMS',
          sub_title: '가장 핫한 상품들을 만나 보세요',
        },
        {
          type: 'items',
          list: test_items,
          title: 'NEW ITEMS',
          sub_title: '새로 나온 상품들을 만나 보세요',
        },
      ];

      const returnContentsByColumn = (column) => {
        return contents(
            column,
            {
                router
            })
        }

      return (
        <>
          <Wrapper>
            <ContentWrapper>
                <NavBar>{category}</NavBar>
            </ContentWrapper>
          </Wrapper>
          {loading ?
        <>
          <Stack spacing={'1rem'}>
            <Skeleton variant='rectangular' style={{
              height: '40vw'
            }} />
            <Skeleton variant='rounded' style={{
              height: '34vw',
              maxWidth: '1200px',
              width: '90%',
              height:'70vh',
              margin: '1rem auto'
            }} />
          </Stack>
        </>
        :
        <>
          {home_content_list.map((column, idx) => (
            <>
              {returnContentsByColumn(column)}
            </>
          ))}
        </>}
        </>
      )
}
export default Demo1
