import { Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, TextField, Typography } from "@mui/material";
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
import toast from "react-hot-toast";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";

export const DashboardDemo4 = () => {

    const router = useRouter();
    const theme = useTheme();
    const { themeStretch, themePostCategoryList, themeDnsData } = useSettingsContext();
    const { user, logout } = useAuthContext();

    const [searchObj, setSearchObj] = useState({
        s_dt: returnMoment().substring(0, 10),
        e_dt: returnMoment().substring(0, 10),
    })
    const [sDt, setSDt] = useState(new Date());
    const [eDt, setEDt] = useState(new Date());
    const [data, setData] = useState({});
    const [adjustData, setAdjustData] = useState({});
    //const [adjustMoney, setAdjustMoney] = useState(0)
    const [adjustPopup, setAdjustPopup] = useState(false)
    const [waiting, setWaiting] = useState(false)

    const [amountSum, setAmountSum] = useState()

    const onLogout = async () => {
        let result = await logout();
        router.push('/shop');
    }

    useEffect(() => {
        if (themeDnsData?.seller_id > 0) {
            onLogout();
        }
    }, [themeDnsData])

    useEffect(() => {
        onChangePage(searchObj)
        onChangeAmountSum(data)
        //console.log(user)
    }, [data])

    const onChangePage = async (search_obj) => {
        setSearchObj(search_obj);
        let result = await apiManager(`dashboards`, 'list', search_obj);
        setData(result);
        let adjust_result = await apiManager(`seller-adjustments`, 'list', { ...search_obj, state: '0' })
        setAdjustData(adjust_result)
        //console.log(adjust_result)
    }

    const onChangeAmountSum = async (data) => {
        const val = data?.trx_amounts_sum ?? [];
        let sum = 0;
        for (let i = 0; i < val?.length; i++) {
            sum += val[i].total_amount;
        }
        setAmountSum(sum)
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

    const sellerAdjustment = async () => {
        /*let e_dt = returnMoment().substring(0, 10)
        let result = await apiManager(`dashboards`, 'list', { s_dt: '2000-01-01', e_dt: e_dt });

        const val = result?.trx_amounts_sum ?? [];
        let sum = 0;
        for (let i = 0; i < val?.length; i++) {
            sum += val[i].total_amount;
        }
        setAdjustMoney(sum)

        console.log(sum)*/

        setAdjustPopup(true)
    }

    const onAdjustment = async () => {
        let brand_id = themeDnsData?.id;
        let seller_id = user?.level == 10 ? user.id : user?.level == 20 ? 0 : '';
        let oper_id = user?.level == 10 ? user?.oper_id : user?.level == 20 ? user?.id : '';
        /*let amount = adjustMoney

        if (amount < 10000) {
            toast.error("10000원 이상의 금액만 요청 가능합니다.")
            return;
        }*/

        let result = await apiManager(`seller-adjustments`, 'create', { brand_id: brand_id, seller_id: seller_id, oper_id: oper_id })
        if (result) {
            toast.success("정상적으로 요청되었습니다.");
            window.location.reload()
        } else {
            toast.error("문제가 발생했습니다.")
            return;
        }
    }

    return (
        <>
            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Grid container spacing={3}>
                    {
                        user?.level != 20 &&
                        <>
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
                            <Grid item xs={12} md={12}>
                                <Typography variant="subtitle1" >기간 매출액 : {commarNumber(amountSum ?? 0)} 원</Typography>
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
                            {/*
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
                    */}
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
                        </>
                    }
                    {
                        themeDnsData?.setting_obj?.is_use_seller > 0 && user?.level >= 40 ?
                            <>
                                <Grid item xs={12} md={12}>
                                    <Typography variant="subtitle1" >정산관리</Typography>
                                </Grid>
                                <Grid item xs={12} md={12}>
                                    <Row style={{ alignItems: 'center', width: '100%', justifyContent: 'space-between', maxWidth: `300px` }}>
                                        <Row style={{ fontWeight: 'bold' }}>
                                            <div style={{ marginRight: '1rem' }}>정산대기 : </div>
                                            <div
                                                style={{ color: themeDnsData?.theme_css?.main_color }}
                                            >{commarNumber(adjustData?.total)}</div>
                                            <div>건</div>
                                        </Row>
                                        <Button variant="outlined" style={{ cursor: 'pointer' }} onClick={() => { router.push(`/manager/adjustments`) }}>
                                            이동하기
                                        </Button>
                                    </Row>
                                </Grid>
                            </>
                            :
                            <>
                                <Grid item xs={12} md={12}>
                                    <Typography variant="subtitle1" >정산관리</Typography>
                                </Grid>
                                <Grid item xs={12} md={12}>
                                    <Row style={{ alignItems: 'center', width: '100%', justifyContent: 'space-between', maxWidth: `300px` }}>
                                        <Button variant="outlined" style={{ cursor: 'pointer' }} onClick={() => { sellerAdjustment(); /*setWaiting(true);*/ }}>
                                            누적매출 정산요청
                                        </Button>
                                    </Row>
                                    {/*
                                    waiting &&
                                    <>
                                        <Row style={{ alignItems: 'center', width: '100%', justifyContent: 'space-between', marginTop: '1rem', maxWidth: `300px` }}>
                                            누적매출 금액을 계산 중입니다...
                                        </Row>
                                    </>
                                */}
                                </Grid>
                            </>
                    }
                    <Dialog
                        open={adjustPopup}
                    >
                        <DialogTitle>{`누적매출 정산요청`}</DialogTitle>

                        {
                            /*
                            <DialogContent>
                            총 {commarNumber(adjustMoney)}원의 누적금액을 정산합니다.
                        </DialogContent>
                            */
                        }
                        <DialogContent>
                            <DialogContentText style={{ marginBottom: '0.5rem' }}>
                                정산요청을 하시겠습니까?
                            </DialogContentText>
                            {
                                /*
                                <TextField
                                autoFocus
                                fullWidth
                                value={adjustMoney}
                                margin="dense"
                                type="number"
                                label="정산요청금액"
                                onChange={(e) => {
                                    setAdjustMoney(e.target.value)
                                }}
                            />
                                */
                            }
                        </DialogContent>
                        <DialogActions>
                            <Button variant="contained" onClick={() => { onAdjustment() }}>
                                요청
                            </Button>
                            <Button color="inherit" onClick={() => {
                                window.location.reload()
                            }}>
                                취소
                            </Button>
                        </DialogActions>
                    </Dialog>
                    {
                        /*
                         <Grid item xs={12} md={12}>
                            <Typography variant="subtitle1" >문의관리</Typography>
                        </Grid>
                        {themePostCategoryList.map((category) => (
                            <>
                                {(category?.post_category_read_type == 1 && category?.is_able_user_add == 1) &&
                                    <>
                                        <Grid item xs={12} md={12}>
                                            <Row style={{ alignItems: 'center', width: '100%', justifyContent: 'space-between', maxWidth: `300px` }}>
                                                <Button variant="outlined" style={{ cursor: 'pointer' }} onClick={() => { router.push(`/manager/articles/${category?.id}`) }}>
                                                    {category?.post_category_title}
                                                </Button>
                                                <Row style={{ fontWeight: 'bold' }}>
                                                    <div style={{ marginRight: '1rem' }}>답변대기 : </div>
                                                    <div
                                                        style={{ color: themeDnsData?.theme_css?.main_color }}
                                                    >{commarNumber(data[`request_${category?.id}`])}</div>
                                                    <div>건</div>
                                                </Row>
                                            </Row>
                                        </Grid>
                                    </>}
                            </>
                        ))}
                        */
                    }
                </Grid>
            </Container>
        </>
    )
}
export default DashboardDemo4;