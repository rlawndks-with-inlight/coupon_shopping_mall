import { useRouter } from "next/router";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import styled from "styled-components";
import { HomeDemo1 } from "../demo-1";

const HomeDemo = (props) => {

  return (
    <>
      <HomeDemo1 {...props} />
    </>
  )
}
export default HomeDemo