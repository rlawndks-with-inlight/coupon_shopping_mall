import { Card, Container, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Row } from "src/components/elements/styled-components";

const DefaultSetting = () => {

  return (
    <>
    
    </>
  )
}
DefaultSetting.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default DefaultSetting
