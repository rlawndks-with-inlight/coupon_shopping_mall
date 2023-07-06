import styled from 'styled-components'
import { Tab, Tabs, TextField, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import Iconify from 'src/components/iconify/Iconify';
import { Icon } from '@iconify/react';

const Wrappers = styled.div`
max-width:840px;
display:flex;
flex-direction:column;
margin: 56px auto 0 auto;
width: 100%;
@media (max-width:840px){
    padding: 0 5% 0 5%;
}
`

const Title = styled.h2`
font-size:1.5rem;
font-weight:bold;
line-height:1.38462;
padding:1rem 0 0.5rem 0;
`

const ContentWrappers =styled.div`
display:flex;
flex-direction:column;
margin:0 auto;
width:100%;
background-color:lightgray;
`

// 장바구니 김인욱
const Demo1 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    return (
        <>
            <Wrappers>
                <Title>장바구니</Title>
                <ContentWrappers>
                    df
                </ContentWrappers>
            </Wrappers>
        </>
    )
}
export default Demo1
