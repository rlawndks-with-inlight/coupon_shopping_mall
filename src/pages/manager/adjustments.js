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

const Adjustments = () => {
    const { setModal } = useModal()
    const { themeDnsData } = useSettingsContext();
    const defaultColumns = [
        {
            id: 'seller_mall',
            label: '정산요청몰',
            action: (row) => {
                return <div
                    style={{ cursor: `${themeDnsData?.is_head == 1 ? 'pointer' : ''}`, color: `${themeDnsData?.is_head == 1 ? 'blue' : ''}` }}
                    onClick={() => {
                        if (themeDnsData?.is_head == 1) {
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
        },
        {
            id: 'seller_name',
            label: '셀러명',
            action: (row) => {
                return <div
                    style={{ cursor: `${themeDnsData?.is_head == 1 ? 'pointer' : ''}`, color: `${themeDnsData?.is_head == 1 ? 'blue' : ''}` }}
                    onClick={() => {
                        if (themeDnsData?.is_head == 1) {
                            router.push('users/sellers/edit/' + row['seller_id'] ?? '---')
                        } else {
                            return;
                        }
                    }}
                >
                    {row['seller_name']}
                </div>
            },
            sx: (row) => {
                return {
                    color: `${row?.is_cancel == 1 ? 'red' : ''}`
                }
            },
        },
        {
            id: 'amount',
            label: '정산요청금액',
            action: (row) => {
                return `${commarNumber(row['amount'])}원`
            },
            sx: (row) => {
                return {
                    color: `${row?.is_cancel == 1 ? 'red' : ''}`
                }
            },
        },
        {
            id: 'seller_acct_num',
            label: '셀러계좌번호',
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
            label: '셀러전화번호',
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
                    disabled={themeDnsData?.is_head != 1}
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
        console.log(data_)
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
        console.log(id, value)
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


