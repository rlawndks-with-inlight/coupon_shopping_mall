import styled from 'styled-components'
import { useTheme } from "@emotion/react";
import { Box, Tab, Tabs, Card, Grid, Divider, Container, Typography, Stack, Button } from '@mui/material';
import { commarNumber } from 'src/utils/function';
import { test_categories } from 'src/data/test-data';
import { themeObj } from 'src/components/elements/styled-components';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic'
import { useSettingsContext } from 'src/components/settings';
import { useRouter } from 'next/router';
import { ProductDetailsCarousel, ProductDetailsReview, ProductDetailsSummary } from 'src/views/e-commerce/details';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import Markdown from 'src/components/markdown/Markdown';
import CartWidget from 'src/views/e-commerce/CartWidget';
import Iconify from 'src/components/iconify/Iconify';
import { SkeletonProductDetails } from 'src/components/skeleton';

const Wrapper = styled.div`
display:flex;
flex-direction:column;
min-height:76vh;
`
const ContentWrapper = styled.div`
max-width:1200px;
width:90%;
margin: 1rem auto;
`
const NavBar = styled.div`
display:flex;
justify-content:space-around;
align-items:center;
background-color:white;
padding:50px;
cursor:pointer;
`
const NavBarMenu = styled.div`
margin-top:2rem;
border-top: 1px solid ;
`

const Contents = styled.div`
width:100%;
display:flex;
align-items:flex-start;
@media (max-width: 900px) {
  flex-direction: column;
}
`
const ProductImgContainer = styled.div`
width:50%;
display:flex;
padding-top:2rem;
@media (max-width: 900px) {
  width:100%;
  padding-top:0rem;
}
`
const ProductImg = styled.img`
margin:auto;
width:300px;
height:auto;
@media (max-width: 900px) {
  width:80%;
}
`
const ExampleContainer = styled.div`
width:50%;
padding-top:1.1rem;
@media (max-width: 900px) {
  width:100%;
}
`
const Name = styled.div`
font-weight:bold;
font-size:${themeObj.font_size.size2};
border-bottom: 1px solid ${themeObj.grey[300]};
`
const PriceContainer = styled.div`
border-bottom: 1px solid ${themeObj.grey[300]};
padding:2rem 0;
font-size:${themeObj.font_size.size6};
`

const KeyContent = styled.div`
width: 100px;
`
const Row = styled.div`
display: flex;
margin:0.5rem 0;
`

// 메인화면 김인욱
const Demo1 = (props) => {
    const {
        data: {
    
        },
        func: {
          router
        },
      } = props;
      const { themeStretch } = useSettingsContext();
    
      const {
        query: { name },
      } = useRouter();
    
      //const product = test_categories
    
      const [currentTab, setCurrentTab] = useState('description');
    
    
     /* const TABS = [
        {
          value: 'description',
          label: 'description',
          component: product ? <Markdown children={product?.description} /> : null,
        },
        {
          value: 'reviews',
          label: `Reviews (100)`,
          component: product ? <ProductDetailsReview product={product} /> : null,
        },
      ];
      const SUMMARY = [
        {
          title: '100% Original',
          description: 'Chocolate bar candy canes ice cream toffee cookie halvah.',
          icon: 'ic:round-verified',
        },
        {
          title: '10 Day Replacement',
          description: 'Marshmallow biscuit donut dragée fruitcake wafer.',
          icon: 'eva:clock-fill',
        },
        {
          title: 'Year Warranty',
          description: 'Cotton candy gingerbread cake I love sugar sweet.',
          icon: 'ic:round-verified-user',
        },
      ];*/
      
      let category = test_categories.map(function(element){
        return <NavBarMenu>{element.category_name}</NavBarMenu>;
      })

      let content = test_categories.flatMap(function(element){
        return <Contents>{element.category_name}{element.category_img}</Contents>
      })

      return (
        <>
          <Wrapper>
            <ContentWrapper>
                <NavBar>{category}</NavBar>
                <div>{content}</div>
            </ContentWrapper>
          </Wrapper>
        </>
      )
}
export default Demo1
