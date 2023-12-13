import { useRouter } from "next/router";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import styled from "styled-components";
import { HomeDemo1 } from "../demo-1";
import { Dialog } from "@mui/material";
import { useEffect, useState } from "react";

const HomeDemo = (props) => {

  const { themeDnsData } = useSettingsContext();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (themeDnsData?.id > 0) {
      setLoading(false);
    }
  }, [themeDnsData])
  return (
    <>
      <Dialog fullScreen open={loading}>
        <img src={'/images/gifs/grandpris-loading.gif'} style={{ width: '100px', margin: 'auto' }} />
      </Dialog>
      <HomeDemo1 {...props} />
    </>
  )
}
export default HomeDemo