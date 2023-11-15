import { Icon } from "@iconify/react";
import { Card, Grid } from "@mui/material";
import { useEffect } from "react";
import { Col, Row, Title } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import styled from "styled-components";


const Wrappers = styled.div`
max-width:1500px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`


const PayResultDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeDnsData } = useSettingsContext();

  const getResultContent = (type) => {
    if (type == 0) {
      return {
        icon: <Icon icon={'mdi:success-circle-outline'} style={{ margin: 'auto', fontSize: '8rem', color: themeDnsData?.theme_css?.main_color }} />,
        title: '결제에 성공하였습니다.',
        content: '',
      }
    } else if (type == 1) {
      return {
        icon: <Icon icon={'material-symbols:cancel-outline'} style={{ margin: 'auto', fontSize: '8rem', color: themeDnsData?.theme_css?.main_color }} />,
        title: '결제에 실패하였습니다.',
        content: '',
      }
    }
  }

  return (
    <>
      <Wrappers>
        <Title>{getResultContent(router.query?.type).title}</Title>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card>
              <Col style={{ minHeight: '18rem' }}>
                <div style={{ margin: 'auto' }}>
                  {getResultContent(router.query?.type).icon}
                </div>
                <Row style={{ margin: '1rem auto auto auto', columnGap: '1rem' }}>
                  <div>주문번호:</div>
                  <div>{router.query?.ord_num}</div>
                </Row>
              </Col>
            </Card>
          </Grid>
        </Grid>
      </Wrappers>
    </>
  )
}
export default PayResultDemo