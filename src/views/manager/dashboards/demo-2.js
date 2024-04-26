import { Button, Container, Grid, TextField, Typography } from "@mui/material";
import { useSettingsContext } from "src/components/settings";
import { AppWidget, AppWidgetSummary } from "src/views/@dashboard/general/app";
import { useTheme } from '@mui/material/styles';
import { Row } from "src/components/elements/styled-components";
import {
    DatePicker,
    StaticDatePicker,
    MobileDatePicker,
    DesktopDatePicker,
} from '@mui/x-date-pickers';
import { useEffect, useState } from "react";
import { commarNumber, getPercentByNumber, returnMoment } from "src/utils/function";
import { apiManager } from "src/utils/api";
import { useRouter } from "next/router";

export const DashboardDemo2 = () => {

    const router = useRouter();
    const theme = useTheme();
    const { themeStretch, themePostCategoryList, themeDnsData } = useSettingsContext();

    const [searchObj, setSearchObj] = useState({
        s_dt: returnMoment().substring(0, 10),
        e_dt: returnMoment().substring(0, 10),
    })
    const [sDt, setSDt] = useState(new Date());
    const [eDt, setEDt] = useState(new Date());
    const [data, setData] = useState({});

    useEffect(() => {
        onChangePage(searchObj)
    }, [])

    const onChangePage = async (search_obj) => {
        setSearchObj(search_obj);
        let result = await apiManager(`dashboards`, 'list', search_obj);
        setData(result);
    }
    const onClickDateButton = (num) => {
        setSDt(new Date(returnMoment(-num)));
        setEDt(new Date(returnMoment()));
        onChangePage({
            ...searchObj,
            s_dt: returnMoment(-num).substring(0, 10),
            e_dt: returnMoment().substring(0, 10),
        })
    }
    return (
        <>
            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Row style={{ rowGap: '1rem', flexWrap: 'wrap', columnGap: '1rem' }}>
                            {window.innerWidth > 1000 ?
                                <>
                                    <DesktopDatePicker
                                        label="시작일 선택"
                                        value={sDt}
                                        format='yyyy-MM-dd'
                                        onChange={(newValue) => {
                                            setSDt(newValue);
                                            onChangePage({ ...searchObj, s_dt: returnMoment(false, new Date(newValue)).substring(0, 10) })
                                        }}
                                        renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                                        sx={{ width: '180px', height: '32px' }}
                                        slotProps={{ textField: { size: 'small' } }}
                                    />
                                    <DesktopDatePicker
                                        label="종료일 선택"
                                        value={eDt}
                                        format='yyyy-MM-dd'
                                        onChange={(newValue) => {
                                            setEDt(newValue);
                                            onChangePage({ ...searchObj, e_dt: returnMoment(false, new Date(newValue)).substring(0, 10) })
                                        }}
                                        renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                                        sx={{ width: '180px' }}
                                        slotProps={{ textField: { size: 'small' } }}
                                    />
                                </>
                                :
                                <>
                                    <Row style={{ columnGap: '0.5rem' }}>
                                        <MobileDatePicker
                                            label="시작일 선택"
                                            value={sDt}
                                            format='yyyy-MM-dd'
                                            onChange={(newValue) => {
                                                setSDt(newValue);
                                                onChangePage({ ...searchObj, s_dt: returnMoment(false, new Date(newValue)).substring(0, 10) })
                                            }}
                                            renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                                            sx={{ width: '50%' }}
                                            slotProps={{ textField: { size: 'small' } }}
                                        />
                                        <MobileDatePicker
                                            label="종료일 선택"
                                            value={eDt}
                                            format='yyyy-MM-dd'
                                            onChange={(newValue) => {
                                                setEDt(newValue);
                                                onChangePage({ ...searchObj, e_dt: returnMoment(false, new Date(newValue)).substring(0, 10) })
                                            }}
                                            renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                                            sx={{ width: '50%' }}
                                            slotProps={{ textField: { size: 'small' } }}
                                        />
                                    </Row>
                                </>}
                            <Row style={{ columnGap: '0.5rem' }}>
                                <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(0)}>오늘</Button>
                                <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(7)}>7일</Button>
                                <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(15)}>15일</Button>
                                <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(30)}>1개월</Button>
                                <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(90)}>3개월</Button>
                                <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(365)}>1년</Button>
                            </Row>
                        </Row>

                    </Grid>
                    <Grid item xs={12} md={12}>
                        <Typography variant="subtitle1" >주문관리</Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <AppWidget
                            title="결제대기"
                            total={data?.trx?.trx_0 ?? 0}
                            icon="medical-icon:waiting-area"
                            color="info"
                            sx={{ cursor: 'pointer' }}
                            chart={{
                                series: getPercentByNumber(data?.trx_sum, data?.trx?.trx_0),
                            }}
                            onClick={() => {
                                router.push(`/manager/orders/trx/0`)
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <AppWidget
                            title="결제완료"
                            total={data?.trx?.trx_5 ?? 0}
                            icon="line-md:confirm-circle"
                            color="success"
                            sx={{ cursor: 'pointer' }}
                            chart={{
                                series: getPercentByNumber(data?.trx_sum, data?.trx?.trx_5),
                            }}
                            onClick={() => {
                                router.push(`/manager/orders/trx/5`)
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <AppWidget
                            title="입고완료"
                            total={data?.trx?.trx_10 ?? 0}
                            icon="ic:baseline-store"
                            color="success"
                            sx={{ cursor: 'pointer' }}
                            chart={{
                                series: getPercentByNumber(data?.trx_sum, data?.trx?.trx_10),
                            }}
                            onClick={() => {
                                router.push(`/manager/orders/trx/10`)
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <AppWidget
                            title="출고완료"
                            total={data?.trx?.trx_15 ?? 0}
                            icon="fluent-mdl2:release-gate"
                            color="success"
                            sx={{ cursor: 'pointer' }}
                            chart={{
                                series: getPercentByNumber(data?.trx_sum, data?.trx?.trx_15),
                            }}
                            onClick={() => {
                                router.push(`/manager/orders/trx/15`)
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <AppWidget
                            title="배송중"
                            total={data?.trx?.trx_20 ?? 0}
                            icon="iconamoon:delivery-fast"
                            color="success"
                            sx={{ cursor: 'pointer' }}
                            chart={{
                                series: getPercentByNumber(data?.trx_sum, data?.trx?.trx_20),
                            }}
                            onClick={() => {
                                router.push(`/manager/orders/trx/20`)
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <AppWidget
                            title="배송완료"
                            total={data?.trx?.trx_25 ?? 0}
                            icon="icon-park-solid:delivery"
                            color="success"
                            sx={{ cursor: 'pointer' }}
                            chart={{
                                series: getPercentByNumber(data?.trx_sum, data?.trx?.trx_25),
                            }}
                            onClick={() => {
                                router.push(`/manager/orders/trx/25`)
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <AppWidget
                            title="취소요청"
                            total={data?.trx?.trx_1 ?? 0}
                            icon="solar:call-cancel-bold"
                            color="warning"
                            sx={{ cursor: 'pointer' }}
                            chart={{
                                series: getPercentByNumber(data?.trx_sum, data?.trx?.trx_1),
                            }}
                            onClick={() => {
                                router.push(`/manager/orders/trx-cancel/1`)
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <AppWidget
                            title="취소완료"
                            total={data?.is_cancel ?? 0}
                            icon="ic:outline-cancel"
                            color="error"
                            sx={{ cursor: 'pointer' }}
                            chart={{
                                series: getPercentByNumber(data?.trx_sum, data?.is_cancel),
                            }}
                            onClick={() => {
                                router.push(`/manager/orders/trx-cancel/5`)
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <Typography variant="subtitle1" >문의관리</Typography>
                    </Grid>
                    {themePostCategoryList.map((category) => (
                        <>
                            {(category?.post_category_read_type == 1 && category?.is_able_user_add == 1) &&
                                <>
                                    <Grid item xs={12} md={12}>
                                        <Row style={{ alignItems: 'center', width: '100%', justifyContent: 'space-between', maxWidth: `300px` }}>
                                            <Button variant="outlined" style={{cursor:'pointer'}} onClick={() => {router.push(`/manager/articles/${category?.id}`, console.log(data))}}>
                                                {category?.post_category_title}
                                                </Button>
                                            <Row style={{ fontWeight: 'bold' }}>
                                                <div style={{marginRight:'1rem'}}>답변대기 : </div>
                                                <div 
                                                style={{ color: themeDnsData?.theme_css?.main_color}}
                                                >{commarNumber(data[`request_${category?.id}`])}</div>
                                                <div>건</div>
                                            </Row>
                                        </Row>
                                    </Grid>
                                </>}
                        </>
                    ))}
                </Grid>
            </Container>
        </>
    )
}
export default DashboardDemo2;