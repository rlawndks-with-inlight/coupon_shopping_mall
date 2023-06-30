import { Card, Container, Grid, MenuItem, Select, Stack, Typography } from "@mui/material";
import { useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";

//메인화면

const Main = () => {

  const [contentList, setContentList] = useState([]);
  const [sectionType, setSectionType] = useState(0);
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={1}>
              {contentList.length == 0 &&
                <>

                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    콘텐츠가 없습니다.
                  </Typography>
                </>}
                {contentList.map((item, idx)=>(
                  <>

                  </>
                ))}
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                추가할 섹션
              </Typography>
              <Select sx={{ width: '100%' }} value={sectionType} onChange={(e)=>{
                setSectionType(e.target.value)
              }}>
                <MenuItem value={0}>배너슬라이드</MenuItem>
                <MenuItem value={1}>상품슬라이드</MenuItem>
                <MenuItem value={2}>에디터</MenuItem>
              </Select>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}
Main.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default Main;
