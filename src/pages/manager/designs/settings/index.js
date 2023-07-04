import { Card, Container, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Row } from "src/components/elements/styled-components";

const Settings = () => {

  return (
    <>

    </>
  )
}
Settings.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default Settings
