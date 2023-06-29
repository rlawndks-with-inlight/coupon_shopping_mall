import styled from 'styled-components'
import { useTheme } from "@emotion/react";
import { Box, Tab, Tabs, Card, Grid, Divider, Container, Typography, Button } from '@mui/material';
import { commarNumber } from 'src/utils/function';
import { test_categories, test_items } from 'src/data/test-data';
import { themeObj } from 'src/components/elements/styled-components';
import 'react-quill/dist/quill.snow.css';
import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Skeleton, Stack } from '@mui/material'
import { Item } from 'src/components/elements/blog/demo-1';

const Wrapper = styled.div`
display:flex;
flex-direction:column;
min-height:76vh;
`

const ContentWrapper = styled.div`
max-width:1200px;
width:100%;
`

const NavBar = styled.div`
display:flex;
justify-content:space-around;
align-items:center;
background-color:white;
padding:50px;
cursor:pointer;
margin:0 auto;
`

const NavBarMenu = styled.div`
margin-top:2rem;
border-top: 1px solid ;
`

const Banner = styled.div`
margin=bottom:-120px;
background-color:gray;
`

const BannerMessage1 = styled.h2`
font-weight=bold;
color=white;
`

const BannerMessage2 = styled.p`
font-weight=regular;
color=gray400;
margin-top=16px;
`

const BannerLink = styled.a`
target=_blank;
rel=nofollow;
`

const BannerImage = styled.span`
box-sizing:border-box;
display:block;
overflow:hidden;
width:initial;
background:none;
opacity:1;
border:0px;
margin:0px;
padding:0px;
position:relative;
`

const ContentTitle = styled.p`
font-weight=bold;
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
                        <img src={column?.src} href='./login/demo-1.js'/>
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
            autoplay: true,
            autoplaySpeed: 2500,
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
          title: '핫한상품',
          sub_title: '가장 인기있는 상품을 만나 보세요 !',
          sort_type: '',
          side_img: '',
          item_slide_auto: true,
          item_type: 1
        },
        {
          type: 'items',
          list: test_items,
          title: '멋진상품',
          sub_title: '가장 멋있는 상품을 만나 보세요 !',
          sort_type: '',
          side_img: '',
          item_slide_auto: true,
          item_type: 1
        },
        {
          type: 'reviews'
        }
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
