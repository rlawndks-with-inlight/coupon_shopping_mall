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
import { paymentModuleTypeList } from "src/utils/format";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { Upload } from "src/components/upload";
import { sha256 } from "js-sha256";

const TrxList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const [chkpic, setChkpic] = useState({
    check_file: undefined
  })
  const defaultColumns = [
    ...(themeDnsData?.setting_obj?.is_use_seller == 2 ? [
      {
        id: 'check_img',
        label: '검품사진',
        action: (row) => {
          return row['check_img'] ?? user?.level >= 40 ?
            <Button variant="outlined"
              onClick={() => {
                setModal({
                  func: () => { updatePicture(row?.id) },
                  title: <Upload file={chkpic?.check_file || chkpic?.check_img}
                    onDrop={(acceptedFiles) => {
                      const newFile = acceptedFiles[0];
                      if (newFile) {
                        setChkpic(
                          {
                            ['check_file']: Object.assign(newFile, {
                              preview: URL.createObjectURL(newFile),
                            })
                          }
                        );
                      }
                    }}
                    onDelete={() => {
                      setChkpic(
                        {
                          ['check_file']: undefined,
                          ['check_img']: '',
                        }
                      );
                    }}
                  />
                })
              }}
            >
              업로드
            </Button>
            :
            "---"
        },
        sx: (row) => {
          return {
            color: `${row?.is_cancel == 1 ? 'red' : ''}`
          }
        },
      },
    ] : [
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
    ]),
    /*{
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
    },*/
    ...(themeDnsData?.setting_obj?.is_use_seller > 0 && user?.level >= 15 ? [
      {
        id: 'seller_mall',
        label: '셀러몰',
        action: (row) => {
          return <div style={{ display: 'flex' }}>
            <div>
              {`${row['seller_user_name']}`}
            </div>
            <div
              style={{ cursor: `${user?.level >= 40 ? 'pointer' : ''}`, color: `${user?.level >= 40 ? 'blue' : ''}` }}
              onClick={() => {
                //console.log(row)
                window.open(`https://${row['seller_dns']}`)
              }}
            >
              {`(${row['seller_dns']})` ?? '---'}
            </div>
          </div>
        },
        sx: (row) => {
          return {
            color: `${row?.is_cancel == 1 ? 'red' : ''}`
          }
        },
      },
    ] : []),
    ...(themeDnsData?.id == 5 ? [
      {
        id: 'product_code',
        label: '상품코드',
        action: (row) => {
          return <div style={{ display: 'flex', flexDirection: 'column' }}>
            {row?.orders && row?.orders.map((order, index) => (
              <div>{order?.product_code}</div>
            ))}
          </div>
        }
      }
    ] : []),
    ...(themeDnsData?.id == 5 ? [
      {
        id: 'product_img',
        label: '상품이미지',
        action: (row) => {
          return <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
            {row?.orders && row?.orders.map((order, index) => (
              <img src={order?.product_img} style={{ maxWidth: '84px' }} onClick={() => { window.open(`/shop/item/${order?.product_id}`) }} />
            ))}
          </div>
        }
      }
    ] : []),
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
                      <div style={{ minWidth: '62px', fontWeight: 'bold' }} >{index + 1}.</div>
                      <div style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}
                        onClick={() => { /*user?.level > 20 &&*/ window.open(`/manager/products/edit/${order?.product_id}`) }}>
                        {order?.order_name}
                      </div>
                    </Row>
                    {order?.groups.length > 0 &&
                      <>
                        <Row>
                          <div style={{ minWidth: '62px' }}>옵션정보 </div>
                          <Col>
                            {order?.groups && order?.groups.map((group, idx) => (
                              <>
                                <Row>
                                  <div style={{ /*minWidth: '62px',*/ marginRight: '0.25rem' }}>{group?.group_name}: </div>
                                  {group?.options && group?.options.map((option, idx2) => (
                                    <>
                                      <div>{option?.option_name ?? option.value} {/*({option?.option_price > 0 ? '+' : ''}{option?.option_price}) */}</div>{idx2 == group?.options.length - 1 ? '' : <>&nbsp;/&nbsp;</>}                                    </>
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
                    {
                      /*
                      <Row>
                      <div style={{ minWidth: '62px' }}>배송비: </div>
                      <div>{commarNumber(order?.delivery_fee)}</div>
                    </Row>
                      */
                    }
                    {order?.seller_id > 0 &&
                      <>
                        <Row>
                          <div style={{ minWidth: '62px' }}>셀러아이디: </div>
                          <div>{order?.seller_user_name}</div>
                        </Row>
                      </>}
                  </Col>
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
    ...(themeDnsData?.id == 74 ? [
      {
        id: 'invoice_num',
        label: '송장번호',
        action: (row) => {
          const [couriers, setCouriers] = useState(() => {
            const raw = row?.invoice_num ?? '';
            const parsed = raw.split(',').map(item => item.trim().split('-')[0]?.trim() || '');
            const orderCount = row?.orders?.length ?? 1;
            while (parsed.length < orderCount) parsed.push('');
            return parsed;
          });

          const [invoices, setInvoices] = useState(() => {
            const raw = row?.invoice_num ?? '';
            const parsed = raw.split(',').map(item => item.trim().split('-')[1]?.trim() || '');
            const orderCount = row?.orders?.length ?? 1;
            while (parsed.length < orderCount) parsed.push('');
            return parsed;
          });

          const handleCourierChange = (value, idx) => {
            const newCouriers = [...couriers];
            newCouriers[idx] = value;
            setCouriers(newCouriers);
          };

          const handleInvoiceChange = (value, idx) => {
            const newInvoices = [...invoices];
            newInvoices[idx] = value;
            setInvoices(newInvoices);
          };

          const handleSave = async () => {
            const joined = couriers.map((courier, idx) => {
              const invoice = invoices[idx]?.trim();
              const courierName = courier?.trim();
              if (!invoice) return ''; // 빈 송장번호는 저장 안함
              return courierName ? `${courierName}-${invoice}` : invoice;
            }).filter(Boolean).join(',');

            let result = await apiManager(`transactions/${row?.id}/invoice`, 'create', {
              id: row?.id,
              invoice_num: joined
            });

            if (result) {
              toast.success('성공적으로 저장 되었습니다.');
            }
          };

          return (
            <Col style={{ rowGap: '0.5rem', minWidth: '200px' }}>
              {(row?.orders || [{}]).map((order, idx) => (
                <Row key={idx} style={{ columnGap: '0.5rem' }}>
                  <TextField
                    size="small"
                    label={row?.orders.length > 1 ? `택배사 ${idx + 1}` : `택배사`}
                    value={couriers[idx]}
                    onChange={(e) => handleCourierChange(e.target.value, idx)}
                  />
                  <TextField
                    size="small"
                    label={row?.orders.length > 1 ? `송장번호 ${idx + 1}` : `송장번호`}
                    value={invoices[idx]}
                    onChange={(e) => handleInvoiceChange(e.target.value, idx)}
                  />
                </Row>
              ))}
              <Button variant="contained" onClick={handleSave}>
                저장
              </Button>
            </Col>
          );
        },
        sx: (row) => ({
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }),
      }
    ] : []),
    ...(themeDnsData?.id == 74 ? [
      {
        id: 'unipass',
        label: '구매자개인통관고유부호',
        action: (row) => {
          return `${row['user_unipass'] ?? "---"}`
        },
        sx: (row) => {
          return {
            color: `${row?.is_cancel == 1 ? 'red' : ''}`
          }
        },
      },
    ] : [
      {
        id: 'created_at',
        label: '구매시간',
        action: (row) => {
          return `${row['trx_dt'] ?? "---"} ${row['trx_tm'] ?? "---"}`
        },
        sx: (row) => {
          return {
            color: `${row?.is_cancel == 1 ? 'red' : ''}`
          }
        },
      },
    ]),
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
        return <Col onClick={() => { /*console.log(row)*/ }}>

          <div>{row['addr'] ?? "---"}</div>
          <div>{row['detail_addr'] ?? ""}</div>
        </Col>
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'trx_method',
      label: '결제타입',
      action: (row) => {
        return _.find(paymentModuleTypeList, { value: row?.trx_method })?.label ?? "---"
      }
    },
    ...(themeDnsData?.id != 74 ? [
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
    ] : []),
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
          <MenuItem value={1}>{'취소요청'}</MenuItem>
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
    ...(themeDnsData?.id == 34 || themeDnsData?.id == 64 || themeDnsData?.id == 84 ? [
      {
        id: 'edit',
        label: `수정 / 삭제`,
        action: (row) => {
          return (
            <>
              {/* <IconButton>
                <Icon icon='material-symbols:edit-outline' onClick={() => {
                  router.push(`default/${row?.id}`)
                }} />
              </IconButton> */}
              <IconButton>
                <Icon icon='material-symbols:edit-outline' onClick={() => {
                  router.push(`/manager/orders/edit/${row?.id}`)
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
    ] : [
      {
        id: 'edit',
        label: `삭제`,
        action: (row) => {
          return (
            <>
              {/* <IconButton>
                <Icon icon='material-symbols:edit-outline' onClick={() => {
                  router.push(`default/${row?.id}`)
                }} />
              </IconButton> */}
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
    ])
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
    trx_status: '',
    cancel_status: 0,
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
    setSearchObj(obj);
    setData({
      ...data,
      content: undefined
    });
    let data_ = await apiManager('transactions', 'list', obj);
    if (data_) {
      setData(data_);
      //console.log(data_)
    }
  }
  const deleteTrx = async (id) => {
    let result = await apiManager('transactions', 'delete', { id: id });
    if (result) {
      onChangePage(searchObj);
    }
  }
  const updatePicture = async (id) => {
    console.log(chkpic)
    //let result = await apiManager('transactions', 'update', { id: id, check_img: chkpic['check_img'] })
    //if (result) {
    //onChangePage(searchObj);
    //}
  }
  const onPayCancel = async (item) => {

    let mid = 'chchhh001m';//'fintrtst1m'
    let shaKey = 'N4COCwG7yR88hkpVEVZydMj7aEZ8Q8p+/kVZIwBpqfJvD+pAEke7a32ytjZXA1RGIgqKjfTSvgfw81EXtM3djA=='//'Lg+QGq2qip/iI2sID1U951W++FLXmFlEM3CvQ8uf7rezi+SE/7ogXUPI1SMQ8chL1VCqOuHgPJLMKOZUTsl17A==' 테스트키

    const ymd = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const his = new Date().toISOString().split('T')[1].slice(0, 8).replace(/:/g, '');

    if (item.trx_method != 4) {
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
    } else {
      let obj = {
        tid: item?.tid,
        canAmt: item?.amount,
        canMsg: '고객요청',
        partCanFlg: '0',
        encData: sha256(mid + ymd + his + String(item?.amount) + shaKey),
        ediDate: ymd + his,
        id: item?.id
      }
      let result = await apiManager('pays/cancel', 'create', obj);
      if (result) {
        toast.success("성공적으로 취소 되었습니다.");
        onChangePage(searchObj);
      }
    }
    //console.log(item)
  }
  const onChangeStatus = async (id, value) => {
    let result = await apiUtil(`transactions/trx_status`, 'update', {
      id,
      value,
    })
    /*console.log(result)*/
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

