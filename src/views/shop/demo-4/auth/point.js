import { useRouter } from "next/router";
import { AuthMenuSideComponent } from "src/components/elements/shop/demo-4";
import { Col, RowMobileColumn, Title } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import styled from "styled-components";

const Wrappers = styled.div`
max-width:1600px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-top: 2rem;
`

const PointDemo = (props) => {

  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();

  return (
    <>
      <Wrappers>
        <RowMobileColumn>
          <AuthMenuSideComponent />
          <Col style={{ width: '100%' }}>
            <Title style={{ margin: '1rem auto' }}>{'마일리지'}</Title>
          </Col>
        </RowMobileColumn>
      </Wrappers>
    </>
  )
}
export default PointDemo