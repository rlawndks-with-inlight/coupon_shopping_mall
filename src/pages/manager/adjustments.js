import { Accordion, AccordionDetails, AccordionSummary, Button, Card, Container, IconButton, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row } from "src/components/elements/styled-components";
import { useModal } from "src/components/dialog/ModalProvider";
import { commarNumber } from "src/utils/function";
import toast from "react-hot-toast";
import { apiManager, apiUtil } from "src/utils/api";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { bankCodeList } from "src/utils/format";

const Adjustments = () => {
    const { setModal } = useModal()
    const { user } = useAuthContext();
    const { themeDnsData } = useSettingsContext();
    const defaultColumns = [
        /*{
            id: 'seller_mall',
            label: '정산요청자',
            action: (row) => {
                return <div
                    style={{ cursor: `${user?.level >= 40 ? 'pointer' : ''}`, color: `${user?.level >= 40 ? 'blue' : ''}` }}
                    onClick={() => {
                        if (user?.level >= 40) {
                            window.open('https://' + row['seller_dns'] ?? '---')
                        } else {
                            return;
                        }
                    }}
                >
                    {`${row['seller_mall']}(${row['seller_dns']})` ?? '---'}
                </div>
            },
            sx: (row) => {
                return {
                    color: `${row?.is_cancel == 1 ? 'red' : ''}`
                }
            },
        },*/
        {
            id: 'adjustment_name',
            label: '정산요청자명',
            action: (row) => {
                return <div
                    style={{ cursor: `${user?.level >= 40 ? 'pointer' : ''}`, color: `${user?.level >= 40 ? 'blue' : ''}` }}
                    onClick={() => {
                        if (user?.level >= 40) {
                            if (row['seller_id'] == 0) {
                                router.push('users/agents/edit/' + row['oper_id'] ?? '---')
                            } else {
                                router.push('users/sellers/edit/' + row['seller_id'] ?? '---')
                            }
                        } else {
                            return;
                        }
                    }}
                >
                    {row['seller_name']}{row['seller_id'] == 0 ? '(영업자)' : '(셀러)'}
                </div>
            },
            sx: (row) => {
                return {
                    color: `${row?.is_cancel == 1 ? 'red' : ''}`
                }
            },
        },
        {
            id: 'bank',
            label: '은행',
            action: (row) => {
                return <div>
                    {
                        bankCodeList.find(item => item.value === row['seller_acct_bank_code'])?.label
                    }
                </div>
            },
            sx: (row) => {
                return {
                    color: `${row?.is_cancel == 1 ? 'red' : ''}`
                }
            },
        },
        {
            id: 'seller_acct_num',
            label: '계좌번호',
            action: (row) => {
                return row['seller_acct_num']
            },
            sx: (row) => {
                return {
                    color: `${row?.is_cancel == 1 ? 'red' : ''}`
                }
            },
        },
        {
            id: 'seller_phone',
            label: '전화번호',
            action: (row) => {
                return row['seller_phone']
            },
            sx: (row) => {
                return {
                    color: `${row?.is_cancel == 1 ? 'red' : ''}`
                }
            },
        },
        {
            id: 'created_at',
            label: '요청시간',
            action: (row) => {
                return row['created_at']
            },
            sx: (row) => {
                return {
                    color: `${row?.is_cancel == 1 ? 'red' : ''}`
                }
            },
        },
        {
            id: 'updated_at',
            label: '업데이트시간',
            action: (row) => {
                return row['updated_at'] ?? "---"
            },
            sx: (row) => {
                return {
                    color: `${row?.is_cancel == 1 ? 'red' : ''}`
                }
            },
        },
        {
            id: 'trx_status',
            label: '상태',
            action: (row) => {
                return <Select
                    size="small"
                    defaultValue={row?.state}
                    disabled={user?.level < 40}
                    onChange={(e) => {
                        onChangeState(row?.id, e.target.value);
                    }}
                >
                    <MenuItem value={0}>{'요청대기'}</MenuItem>
                    <MenuItem value={1}>{'지급완료'}</MenuItem>
                    <MenuItem value={2}>{'요청거절'}</MenuItem>
                </Select>
            },
            sx: (row) => {
                return {
                    color: `${row?.is_cancel == 1 ? 'red' : ''}`
                }
            },
        },
        {
            id: 'amount',
            label: '정산금액',
            action: (row) => {
                return <TextField
                    size="small"
                    defaultValue={row?.amount}
                    disabled={user?.level < 40}
                    onChange={(e) => {
                        onChangeAmount(row?.id, e.target.value);
                    }}
                />
            },
            sx: (row) => {
                return {
                    color: `${row?.is_cancel == 1 ? 'red' : ''}`
                }
            },
        },
        /*{
            id: 'edit',
            label: `삭제`,
            action: (row) => {
                return (
                    <>
                        <IconButton onClick={() => {
                            setModal({
                                func: () => { deleteAdj(row?.id) },
                                icon: 'material-symbols:delete-outline',
                                title: '정말 삭제하시겠습니까?'
                            })
                        }}>
                            <Icon icon='material-symbols:delete-outline' />
                        </IconButton>
                    </>
                )
            }
        },
        */
    ]
    const router = useRouter();
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState({});
    const [searchObj, setSearchObj] = useState({
        page: 1,
        page_size: 10,
        s_dt: '',
        e_dt: '',
        search: '',
        state: '',
    })
    useEffect(() => {
        pageSetting();
    }, [router.query])
    const pageSetting = () => {
        let cols = defaultColumns;
        setColumns(cols)
        onChangePage({ ...searchObj, state: '0,1,2' });
    }
    const onChangePage = async (obj) => {
        setSearchObj(obj);
        setData({
            ...data,
            content: undefined
        });
        let data_ = await apiManager('seller-adjustments', 'list', obj);
        if (data_) {
            setData(data_);
        }
        //console.log(data_)
    }
    const deleteAdj = async (id) => {
        let result = await apiManager('seller-adjustments', 'delete', { id: id });
        if (result) {
            onChangePage(searchObj);
        }
    }

    const onChangeState = async (id, value) => {
        let result = await apiUtil(`seller_adjustments/state`, 'update', {
            id, value
        })
        //console.log(id, value)
    }

    const onChangeAmount = async (id, value) => {
        let result = await apiUtil(`seller_adjustments/amount`, 'update', {
            id, value
        })
        //console.log(id, value)
    }


    return (
        <>
            <Stack spacing={3}>
                <Card>
                    <Row style={{ margin: '1rem' }}>
                        <Button variant="outlined" style={{ cursor: 'pointer', margin: '0.5rem' }} onClick={() => { onChangePage({ ...searchObj, state: '0' }) }}>
                            대기중인 요청만 보기
                        </Button>
                        <Button variant="outlined" style={{ cursor: 'pointer', margin: '0.5rem' }} onClick={() => { onChangePage({ ...searchObj, state: '1' }) }}>
                            지급완료된 요청만 보기
                        </Button>
                        <Button variant="outlined" style={{ cursor: 'pointer', margin: '0.5rem' }} onClick={() => { onChangePage({ ...searchObj, state: '2' }) }}>
                            거절된 요청만 보기
                        </Button>
                    </Row>
                    <ManagerTable
                        data={data}
                        columns={columns}
                        searchObj={searchObj}
                        onChangePage={onChangePage}
                        add_button_text={''}
                    />
                </Card>
            </Stack>
        </>
    )
}

Adjustments.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default Adjustments;


