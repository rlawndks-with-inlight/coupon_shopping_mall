import { useRouter } from "next/router";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import styled from "styled-components";

const PayResultDemo = (props) => {

  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();

  return (
    <>

    </>
  )
}
export default PayResultDemo