import { Button, Card, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Stack, TextField, Typography } from "@mui/material";
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
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import ManagerLayout from "src/layouts/manager";

const Adjustments = () => {
    const router = useRouter();
    const theme = useTheme();
    const { themeStretch, themePostCategoryList, themeDnsData } = useSettingsContext();
    const { user, logout } = useAuthContext();

    const [searchObj, setSearchObj] = useState({
        page: 1,
        page_size: 10,
        s_dt: returnMoment().substring(0, 10),
        e_dt: returnMoment().substring(0, 10),
        search: '',
        trx_status: 5,
        cancel_status: 0,
        state: user?.level >= 20 ? 0 : user?.level == 15 ? 1 : user?.level == 10 ? 2 : ''
    })
    const [sDt, setSDt] = useState(new Date());
    const [eDt, setEDt] = useState(new Date());
    const [data, setData] = useState({});
    const [adjustData, setAdjustData] = useState({});
    const [adjustPopup, setAdjustPopup] = useState(false)
    const [waiting, setWaiting] = useState(false)

    const [amountSum, setAmountSum] = useState()
    const [agentAmountSum, setAgentAmountSum] = useState();

    const [columns, setColumns] = useState([])
    useEffect(() => {
        pageSetting();
    }, [router.query])
    const pageSetting = () => {
        let cols = defaultColumns;
        setColumns(cols)
        onChangePage({ ...searchObj, page: 1 });
    }

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
        //onChangeAmountSum(data)

    }, [searchObj])

    const onChangePage = async (search_obj) => {
        setSearchObj(search_obj);
        //let result = await apiManager(`dashboards`, 'list', search_obj);
        //setData(result);
        let adjust_result = await apiManager(`seller-adjustments`, 'list', search_obj)
        setData(adjust_result)
        setColumns(defaultColumns)
        console.log(adjust_result)
    }

    const onChangeAmountSum = async (data) => {
        const val = data?.trx_amounts_sum ?? [];
        let sum = 0;
        for (let i = 0; i < val?.length; i++) {
            sum += Number(val[i].total_amount);
        }

        const agent_val = data?.trx_agent_amounts_sum ?? [];
        let agent_sum = 0;
        for (let i = 0; i < agent_val?.length; i++) {
            agent_sum += Number(agent_val[i].total_agent_amount);
        }

        setAmountSum(sum)
        setAgentAmountSum(agent_sum)
    }

    const onClickDateButton = (num) => {
        if (typeof num === 'number') {
            setSDt(new Date(returnMoment(-num)));
            setEDt(new Date(returnMoment()));
            onChangePage({
                ...searchObj,
                s_dt: returnMoment(-num).substring(0, 10),
                e_dt: returnMoment().substring(0, 10),
            })
        } else if (num == 'lastMonth') {
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = ('0' + (date.getMonth() + 1)).slice(-2); // 월은 0부터 시작
                const day = ('0' + date.getDate()).slice(-2);
                return `${year}-${month}-${day}`;
            };

            const today = new Date();
            const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

            setSDt(firstDayLastMonth);
            setEDt(lastDayLastMonth);

            onChangePage({
                ...searchObj,
                s_dt: formatDate(firstDayLastMonth),
                e_dt: formatDate(lastDayLastMonth)
            });
        } else if (num == 'thisMonth') {
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = ('0' + (date.getMonth() + 1)).slice(-2); // 월은 0부터 시작
                const day = ('0' + date.getDate()).slice(-2);
                return `${year}-${month}-${day}`;
            };

            const today = new Date();
            const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            setSDt(firstDayThisMonth);
            setEDt(today);
            onChangePage({
                ...searchObj,
                s_dt: formatDate(firstDayThisMonth),
                e_dt: formatDate(today),
            });
        }
    }

    const defaultColumns = [
        {
            id: 'user_name',
            label: `${searchObj?.state == 0 ? '총판' : searchObj?.state == 1 ? '영업자' : searchObj?.state == 2 ? '셀러' : ''}`,
            action: (row) => {
                return <div style={{ display: 'flex' }}>
                    {`${row['name']}`}
                </div>
            },
            sx: (row) => {
                return {
                    //color: `${row?.is_cancel == 1 ? 'red' : ''}`
                }
            }
        },
        {
            id: 'amount_sum',
            label: '정산금액',
            action: (row) => {
                return <div style={{ display: 'flex' }} /*onClick={() => { console.log(searchObj) }}*/>
                    {searchObj?.state == 0 ?
                        `${row['total_amount'] - row['total_card'] - row['total_agent'] - row['total_seller']}`
                        :
                        searchObj?.state == 1 ?
                            `${row['total_agent']}`
                            :
                            searchObj?.state == 2 ?
                                `${row['total_seller']}`
                                :
                                ''
                    }원
                </div>
            },
            sx: (row) => {
                return {
                    //color: `${row?.is_cancel == 1 ? 'red' : ''}`
                }
            }
        },
        {
            id: 'amount_sum',
            label: '총판매금액',
            action: (row) => {
                return <div style={{ display: 'flex' }}>
                    {`${row['total_amount']}`}원
                </div>
            },
            sx: (row) => {
                return {
                    //color: `${row?.is_cancel == 1 ? 'red' : ''}`
                }
            }
        },
        ...((searchObj?.state == 1 || searchObj?.state == 2) ? [
            {
                id: 'amount_sum',
                label: '본사수수료',
                action: (row) => {
                    return <div style={{ display: 'flex' }}>
                        {`${row['total_amount'] - row['total_card'] - row['total_agent'] - row['total_seller']}`}원
                    </div>
                },
                sx: (row) => {
                    return {
                        //color: `${row?.is_cancel == 1 ? 'red' : ''}`
                    }
                }
            },
        ] : []),
        ...((searchObj?.state == 0 || searchObj?.state == 2) ? [
            {
                id: 'amount_sum',
                label: '영업자수수료',
                action: (row) => {
                    return <div style={{ display: 'flex' }}>
                        {`${row['total_agent']}`}원
                    </div>
                },
                sx: (row) => {
                    return {
                        //color: `${row?.is_cancel == 1 ? 'red' : ''}`
                    }
                }
            },
        ] : []),
        ...((searchObj?.state == 0 || searchObj?.state == 1) ? [
            {
                id: 'amount_sum',
                label: '셀러수수료',
                action: (row) => {
                    return <div style={{ display: 'flex' }}>
                        {`${row['total_seller']}`}원
                    </div>
                },
                sx: (row) => {
                    return {
                        //color: `${row?.is_cancel == 1 ? 'red' : ''}`
                    }
                }
            },
        ] : []),
        {
            id: 'amount_sum',
            label: '카드수수료',
            action: (row) => {
                return <div style={{ display: 'flex' }}>
                    {`${row['total_card']}`}원
                </div>
            },
            sx: (row) => {
                return {
                    //color: `${row?.is_cancel == 1 ? 'red' : ''}`
                }
            }
        },
    ]

    return (
        <>
            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Stack spacing={3}>
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
                                <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton('thisMonth')}>이번달</Button>
                                <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton('lastMonth')}>저번달</Button>
                                {
                                    /*
                                                                            <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(15)}>15일</Button>
                                                                        <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(30)}>1개월</Button>
                                                                        <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(90)}>3개월</Button>
                                                                        <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(365)}>1년</Button>
                                    */
                                }
                            </Row>
                        </Row>
                    </Grid>
                    <Card>
                        <Row style={{ margin: '1rem' }}>
                            {
                                user?.level >= 20 &&
                                <>
                                    <Button variant="outlined" style={{ cursor: 'pointer', margin: '0.5rem' }} onClick={() => { onChangePage({ ...searchObj, state: 0 }) }}>
                                        총판 매출확인
                                    </Button>
                                    <Button variant="outlined" style={{ cursor: 'pointer', margin: '0.5rem' }} onClick={() => { onChangePage({ ...searchObj, state: 1 }) }}>
                                        영업자 매출확인
                                    </Button>
                                </>
                            }
                            {
                                user?.level >= 15 &&
                                <>
                                    <Button variant="outlined" style={{ cursor: 'pointer', margin: '0.5rem' }} onClick={() => { onChangePage({ ...searchObj, state: 2 }) }}>
                                        셀러 매출확인
                                    </Button>
                                </>
                            }
                        </Row>
                        <ManagerTable
                            data={data}
                            columns={columns}
                            searchObj={searchObj}
                            onChangePage={onChangePage}
                            add_button_text={''}
                        //minimal
                        />
                    </Card>
                </Stack>

            </Container>
        </>
    )
}

Adjustments.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default Adjustments;


