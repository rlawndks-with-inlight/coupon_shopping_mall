import { CardContent, CardHeader, RadioGroup, Button, Grid } from "@mui/material";
import { Stack } from "evergreen-ui";
import { useEffect } from "react";
import EmptyContent from "src/components/empty-content/EmptyContent";
import { useSettingsContext } from "src/components/settings";
import { test_address_list, test_pay_list } from "src/data/test-data";
import Iconify from 'src/components/iconify/Iconify';
import Card from "src/theme/overrides/Card";
import Paper from "src/theme/overrides/Paper";
import Typography from "src/theme/overrides/Typography";
import { getProductByUser } from "src/utils/api-shop";
import styled from "styled-components";
import { useState } from "react";
import { Title } from "src/components/elements/styled-components";
const Wrappers = styled.div`
max-width: 1500px;
display: flex;
flex-direction: column;
margin: 0 auto;
width: 90%;
min-height: 90vh;
margin-bottom: 10vh;
`

//장바구니 박이규
const Demo2 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeCartData, onChangeCartData } = useSettingsContext();

  return (
    <>
      <Wrappers>
       
      </Wrappers >
    </>
  )
}
export default Demo2
