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

const TrxList = () => {
  const { setModal } = useModal()
  const {themeDnsData} = useSettingsContext();
  const defaultColumns = [
    {
      id: 'appr_num',
      label: '승인번호',
      action: (row) => {
        return row['appr_num'] ?? "---"
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'card_num',
      label: '카드번호',
      action: (row) => {
        return row['card_num'] ?? "---"
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'buyer_name',
      label: '구매자명',
      action: (row) => {
        return row['buyer_name'] ?? "---"
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'buyer_phone',
      label: '구매자휴대폰번호',
      action: (row) => {
        return row['buyer_phone'] ?? "---"
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'orders',
      label: '구매금액',
      action: (row) => {
        return <Accordion key={row?.id} style={{ boxShadow: "none", background: 'transparent' }} disabled={!(row?.orders?.length > 0)}>
          <AccordionSummary expandIcon={<Icon icon="eva:arrow-ios-downward-fill" />}>
            <Typography variant="subtitle1">{commarNumber(row['amount'])}원</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Col>
              {row?.orders && row?.orders.map((order, index) => (
                <>
                  <Col>
                    <Row>
                      <div style={{ minWidth: '62px', fontWeight: 'bold' }}>No.{index + 1}</div>
                    </Row>
                    <Row style={{ flexWrap: 'wrap' }}>
                      <div style={{ minWidth: '62px' }}>주문명: </div>
                      <div style={{ wordBreak: 'break-all' }}>{order?.order_name}</div>
                    </Row>
                    {order?.groups.length > 0 &&
                      <>
                        <Row>
                          <div style={{ minWidth: '62px' }}>옵션정보: </div>
                          <Col>
                            {order?.groups && order?.groups.map((group, idx) => (
                              <>
                                <Row>
                                  <div style={{ minWidth: '62px', marginRight: '0.25rem' }}>{group?.group_name}: </div>
                                  {group?.options && group?.options.map((option, idx2) => (
                                    <>
                                      <div>{option?.option_name} ({option?.option_price > 0 ? '+' : ''}{option?.option_price})</div>{idx2 == group?.options.length - 1 ? '' : <>&nbsp;/&nbsp;</>}
                                    </>
                                  ))}
                                </Row>
                              </>
                            ))}
                          </Col>
                        </Row>
                      </>}
                    <Row>
                      <div style={{ minWidth: '62px' }}>가격: </div>
                      <div>{commarNumber(order?.order_amount)}</div>
                    </Row>
                  </Col>
                  <br />
                </>
              ))}
            </Col>
          </AccordionDetails>
        </Accordion>
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'created_at',
      label: '구매시간',
      action: (row) => {
        return `${row['trx_dt']} ${row['trx_tm']}`
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
      id: 'addr',
      label: '주소',
      action: (row) => {
        return row['addr'] ?? "---"
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'invoice_num',
      label: '송장번호',
      action: (row) => {
        const [invoice, setInvoice] = useState(row?.invoice_num);
        return <Col style={{ rowGap: '0.5rem' }}>
          <TextField
            size={'small'}
            className={`invoice-${row?.id}`}
            value={invoice}
            onChange={(e) => {
              setInvoice(e.target.value);
            }}
          />
          <Button variant="contained" onClick={async () => {
            let result = await apiManager(`transactions/${row?.id}/invoice`, 'create', {
              id: row?.id,
              invoice_num: invoice
            })
            if (result) {
              toast.success('성공적으로 저장 되었습니다.')
            }
          }}>저장</Button>
        </Col>
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
          defaultValue={row?.trx_status}
          onChange={(e) => {
            onChangeStatus(row?.id, e.target.value);
          }}
        >
          <MenuItem value={0}>{'결제대기'}</MenuItem>
          <MenuItem value={5}>{'결제완료'}</MenuItem>
          <MenuItem value={10}>{'입고완료'}</MenuItem>
          <MenuItem value={15}>{'출고완료'}</MenuItem>
          <MenuItem value={20}>{'배송중'}</MenuItem>
          <MenuItem value={25}>{'배송완료'}</MenuItem>
        </Select>
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'created_at',
      label: '결제취소',
      action: (row) => {
        return <>
          {row?.is_cancel == 1 ?
            '---'
            :
            <>
              <IconButton>
                <Icon icon='material-symbols:cancel-outline' onClick={() => {
                  setModal({
                    func: () => { onPayCancel(row) },
                    icon: 'material-symbols:cancel-outline',
                    title: '결제취소 하시겠습니까?'
                  })
                }} />
              </IconButton>
            </>}
        </>
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'edit',
      label: `수정/삭제`,
      action: (row) => {
        return (
          <>
            <IconButton>
              <Icon icon='material-symbols:edit-outline' onClick={() => {
                router.push(`default/${row?.id}`)
              }} />
            </IconButton>
            <IconButton onClick={() => {
              setModal({
                func: () => { deleteTrx(row?.id) },
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
    trx_status: ''
  })
  useEffect(() => {
    pageSetting();
  }, [router.query])
  const pageSetting = () => {
    let cols = defaultColumns;
    setColumns(cols)
    onChangePage({ ...searchObj, trx_status: (router.query?.type == 'all' || !router.query?.type) ? '' : router.query?.type, page: 1 });
  }
  const onChangePage = async (obj) => {
    setData({
      ...data,
      content: undefined
    });
    let data_ = await apiManager('transactions', 'list', obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
  }
  const deleteTrx = async (id) => {
    let result = await apiManager('transactions', 'delete', { id: id });
    if (result) {
      onChangePage(searchObj);
    }
  }
  const onPayCancel = async (item) => {
    let obj = {
      trx_id: item?.trx_id,
      pay_key: item?.pay_key,
      amount: item?.amount,
      mid: item?.mid,
      tid: item?.tid,
      id: item?.id
    }
    if (item?.user_id) {
      obj['user_id'] = item?.user_id;
    } else {
      obj['password'] = item?.password;
    }
    let result = await apiManager('pays/cancel', 'create', obj);
    if (result) {
      toast.success("성공적으로 취소 되었습니다.");
      onChangePage(searchObj);
    }
  }
  const onChangeStatus = async (id, value) => {
    let result = await apiUtil(`transactions/trx_status`, 'update', {
      id,
      value,
    })
  }
  const onChangeInvoice = () => {

  }
  return (
    <>
      <Stack spacing={3}>
        <Card>
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
TrxList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default TrxList

