
import { Autocomplete, Avatar, Button, Card, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography, alpha } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import $ from 'jquery';
import Iconify from "src/components/iconify/Iconify";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import _ from "lodash";
import { apiManager, uploadFileByManager } from "src/utils/api";
import { bankCodeList } from "src/utils/format";


const AgentEdit = () => {
    const { setModal } = useModal()
    const { user } = useAuthContext();
    const { themeMode } = useSettingsContext();

    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [productContent, setProductContent] = useState({
        content: [],
    });
    const [item, setItem] = useState({
        user_name: '',
        //nickname: '',
        name: '',//
        //title: '',
        //seller_name: '',
        //addr: '',
        //acct_bank_name: '',
        acct_num: '',
        acct_name: '',
        phone_num: '',//
        //note: '',
        seller_trx_fee: 0,
        /*sns_obj: {
          youtube_channel: '',
          instagram_id: ''
        },*/
        background_file: undefined,
        background_img: '',
        passbook_file: undefined,
        passbook_img: '',
        contract_file: undefined,
        contract_img: '',
        bsin_lic_file: undefined,
        bsin_lic_img: '',
        id_file: undefined,
        id_img: '',
        profile_file: undefined,
        profile_img: '',
        user_pw: '',//
        level: 15,
        oper_id: '',
        oper_trx_fee: '',
    })
    const [productIds, setProductIds] = useState([]);
    const [currentTab, setCurrentTab] = useState(0);
    const [searchTextList, setSearchTextList] = useState([]);

    const [agents, setAgents] = useState([])

    const tab_list = [
        {
            value: 0,
            label: '기본정보'
        },
        /*{
            value: 1,
            label: '파일 설정'
        },*/
        /*...(user?.level >= 40 ? [
          {
            value: 2,
            label: '수수료 설정 및 분양할 상품'
          },
        ] : [])*/
    ]
    useEffect(() => {
        settingPage();
    }, [])
    const settingPage = async () => {
        // let product_content = await getProductsByManager({
        //   page: 1,
        //   page_size: 100000
        // })

        // setProductContent(product_content);
        if (router.query?.edit_category == 'edit') {
            // let product_ids = await getMappingSellerWithProducts({
            //   id: router.query?.id
            // })
            //setProductIds(product_ids.map((item => { return item?.id })))
            let data = await apiManager('users', 'get', { id: router.query?.id });
            if (data) {
                setProductIds((data?.products ?? []).map(item => { return item?.id }))
                setProductContent({ content: data?.products ?? [] })
                setItem(data);
            }
        }

        let agent_data = await apiManager('users', 'list', {
            page: 1,
            page_size: 100,
            s_dt: '',
            e_dt: '',
            search: '',
            category_id: null,
            is_agent: 3,
        })
        if (agent_data) {
            setAgents(agent_data.content)
            //console.log(agent_data.content)
        }

        setLoading(false);
    }
    const addProfileImg = (e) => {
        if (e.target.files[0]) {
            setItem(
                {
                    ...item,
                    ['profile_file']: e.target.files[0],
                }
            );
            $('#profile-img').val("");
        }
    }
    const onSave = async () => {
        let result = undefined;
        let obj = item;
        if (router.query?.edit_category == 'edit') {
            result = await apiManager('users', 'update', { ...obj, id: router.query?.id, });
        } else {
            result = await apiManager('users', 'create', { ...obj, });
        }
        if (result) {
            toast.success("성공적으로 저장 되었습니다.");
            router.push('/manager/users/agents');
        }
    }
    return (
        <>
            {!loading &&
                <>
                    <Row style={{ margin: '0 0 1rem 0', columnGap: '0.5rem' }}>
                        {tab_list.map((tab) => (
                            <Button
                                variant={tab.value == currentTab ? 'contained' : 'outlined'}
                                onClick={() => {
                                    setCurrentTab(tab.value)
                                }}
                            >{tab.label}</Button>
                        ))}
                    </Row>
                    <Grid container spacing={3}>
                        {currentTab == 0 &&
                            <>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <Stack spacing={3}>
                                            <TextField
                                                label='이름'
                                                value={item.name}
                                                onChange={(e) => {
                                                    setItem(
                                                        {
                                                            ...item,
                                                            ['name']: e.target.value
                                                        }
                                                    )
                                                }} />
                                            <Stack spacing={1}>
                                                <TextField
                                                    label='영업자 아이디'
                                                    value={item.user_name}
                                                    onChange={(e) => {
                                                        setItem(
                                                            {
                                                                ...item,
                                                                ['user_name']: e.target.value
                                                            }
                                                        )
                                                    }} />
                                            </Stack>
                                            {
                                                router.query?.edit_category != 'edit' &&
                                                <>
                                                    <Stack spacing={1}>
                                                        <TextField
                                                            label='영업자 비밀번호'
                                                            value={item.user_pw}
                                                            type="password"
                                                            onChange={(e) => {
                                                                setItem(
                                                                    {
                                                                        ...item,
                                                                        ['user_pw']: e.target.value
                                                                    }
                                                                )
                                                            }} />
                                                    </Stack>
                                                </>
                                            }
                                            <Stack spacing={1}>
                                                <FormControl>
                                                    <InputLabel>
                                                        {user?.level >= 40 ? '총판선택' : `총판 : ${user?.name}`}
                                                    </InputLabel>
                                                    <Select
                                                        label='총판선택'
                                                        value={item.oper_id}
                                                        disabled={user?.level >= 40 ? false : true}
                                                        onChange={e => {
                                                            setItem({
                                                                ...item,
                                                                ['oper_id']: e.target.value
                                                            })
                                                        }}
                                                    >
                                                        {/*<MenuItem value={''}>영업자 없음</MenuItem> */}
                                                        {agents.map((agent, idx) => {
                                                            return <MenuItem value={agent.id}>{agent.name}</MenuItem>
                                                        })}
                                                    </Select>
                                                </FormControl>
                                            </Stack>

                                            <Stack spacing={3}>
                                                <TextField
                                                    label='수수료율(예: 0.1로 입력할 시 10%)'
                                                    value={item.oper_trx_fee}
                                                    type="number"
                                                    onChange={(e) => {
                                                        setItem(
                                                            {
                                                                ...item,
                                                                ['oper_trx_fee']: e.target.value
                                                            }
                                                        )
                                                    }} />
                                            </Stack>

                                        </Stack>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ p: 2, height: '100%' }}>
                                        <Stack spacing={3}>
                                            <TextField
                                                label='전화번호'
                                                value={item.phone_num}
                                                placeholder="하이픈(-) 제외 입력"
                                                onChange={(e) => {
                                                    setItem(
                                                        {
                                                            ...item,
                                                            ['phone_num']: e.target.value
                                                        }
                                                    )
                                                }} />
                                            <Stack spacing={1}>
                                                <FormControl>
                                                    <InputLabel>은행선택</InputLabel>
                                                    <Select
                                                        label='은행선택'
                                                        value={item.acct_bank_code}
                                                        onChange={e => {
                                                            setItem({
                                                                ...item,
                                                                ['acct_bank_code']: e.target.value
                                                            })
                                                        }}
                                                    >
                                                        {bankCodeList.map((itm, idx) => {
                                                            return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                                        })}
                                                    </Select>
                                                </FormControl>
                                            </Stack>
                                            <TextField
                                                label='계좌번호'
                                                value={item.acct_num}
                                                onChange={(e) => {
                                                    setItem(
                                                        {
                                                            ...item,
                                                            ['acct_num']: e.target.value
                                                        }
                                                    )
                                                }} />
                                            <TextField
                                                label='예금주명'
                                                value={item.acct_name}
                                                onChange={(e) => {
                                                    setItem(
                                                        {
                                                            ...item,
                                                            ['acct_name']: e.target.value
                                                        }
                                                    )
                                                }} />
                                        </Stack>
                                    </Card>
                                </Grid>
                            </>}
                        <Grid item xs={12} md={12}>
                            <Card sx={{ p: 3 }}>
                                <Stack spacing={1} style={{ display: 'flex' }}>
                                    <Button variant="contained" style={{
                                        height: '48px', width: '120px', marginLeft: 'auto'
                                    }} onClick={() => {
                                        setModal({
                                            func: () => { onSave() },
                                            icon: 'material-symbols:edit-outline',
                                            title: '저장 하시겠습니까?'
                                        })
                                    }}>
                                        저장
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>
                </>}
        </>
    )
}
AgentEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default AgentEdit
