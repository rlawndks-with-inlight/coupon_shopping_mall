import { Accordion, AccordionDetails, AccordionSummary, Button, Card, Container, IconButton, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row } from "src/components/elements/styled-components";
import { useModal } from "src/components/dialog/ModalProvider";
import PartialCancelDialog from "src/components/manager/PartialCancelDialog";
import { commarNumber } from "src/utils/function";
import toast from "react-hot-toast";
import { apiManager, apiUtil } from "src/utils/api";
import { useSettingsContext } from "src/components/settings";
import { isShopgoMerchant } from "src/utils/is-shopgo";
import { paymentModuleTypeList, forspayMethodList } from "src/utils/format";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { Upload } from "src/components/upload";
import { sha256 } from "js-sha256";
import _ from 'lodash';
import { getOptionLabel } from 'src/utils/shop-util';

// 주문서 추가 입력값을 '주문 줄' 단위로 묶는다(위 열 주석 참고).
const 입력값묶음 = (row) => {
  const 값들 = row?.order_forms ?? []
  if (!값들.length) return []
  const 묶음 = new Map()
  for (const f of 값들) {
    const 키 = String(f?.product_id ?? '')
    if (!묶음.has(키)) 묶음.set(키, [])
    묶음.get(키).push(f)
  }
  // 묶음이 하나뿐이면 상품명을 붙일 이유가 없다
  const 여러줄 = 묶음.size > 1
  return [...묶음.entries()].map(([키, 항목]) => {
    const 줄 = (row?.orders ?? []).find(o => String(o?.product_id) === 키)
    return { 키, 상품명: 여러줄 ? (줄?.order_name ?? '') : '', 항목 }
  })
}


// 택배사 목록 (송장 저장 형식: `택배사-송장번호`, 구매자 주문내역에서 그대로 파싱됨)
const COURIER_LIST = ['CJ대한통운', '우체국택배', '한진택배', '롯데택배', '로젠택배', '경동택배', 'GS Postbox', 'CU 편의점택배', '대신택배', '일양로지스', '기타'];
// 택배사·송장번호로 배송조회 (네이버 통합 택배조회 — 택배사 무관하게 동작)
const courierTrackUrl = (courier, no) =>
  `https://search.naver.com/search.naver?query=${encodeURIComponent(`${courier || ''} ${no || ''} 택배조회`.trim())}`;

const TrxList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const [chkpic, setChkpic] = useState({
    check_file: undefined
  })
  // ⚠ defaultColumns 안에서 data 를 읽는다(추가 입력정보 열 표시 여부).
  //   const 는 TDZ 라 선언이 아래에 있으면 렌더 중 ReferenceError 가 나고 화면이 백지가 된다.
  //   그래서 컬럼 정의보다 위에 둔다.
  const [data, setData] = useState({});
  // 부분/전체 취소 다이얼로그 대상 주문 id
  const [cancelTrxId, setCancelTrxId] = useState(0);
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
        id: 'ord_num',
        label: '주문번호',
        action: (row) => {
          return row['ord_num'] ?? "---"
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
                                  {/* 선택옵션과 추가상품을 구분한다. 예전엔 둘 다 '그룹명: 값' 으로 똑같이 나와서
                                      필수로 고른 것인지 돈이 붙은 추가상품인지 알 수 없었다.
                                      (group_type 은 주문 시점 스냅샷 order_groups 에 이미 들어 있다) */}
                                  <div style={{ /*minWidth: '62px',*/ marginRight: '0.25rem' }}>
                                    {group?.group_name}
                                    {Number(group?.group_type) === 1 &&
                                      <span style={{
                                        marginLeft: '4px', fontSize: '0.72rem', color: '#5a8a1e',
                                        border: '1px solid #cde3a6', borderRadius: '4px', padding: '0 3px',
                                      }}>추가상품</span>}
                                    {': '}
                                  </div>
                                  {group?.options && group?.options.map((option, idx2) => (
                                    <>
                                      {/* 금액을 다시 보여 준다. 예전엔 주석으로 막혀 있어서 총액만 보이고
                                          그 총액이 어떻게 만들어졌는지는 알 수 없었다 — 30만원짜리 출장이
                                          붙었는지 사이즈만 고른 건지 화면으로 구분이 안 됐다.
                                          0원이면 안 적는다(조합형은 개별가가 0이고 추가금이 따로 붙는다). */}
                                      <div>
                                        {getOptionLabel(option)}
                                        {Number(option?.option_price)
                                          ? ` (${Number(option.option_price) > 0 ? '+' : ''}${commarNumber(option.option_price)}원)`
                                          : ''}
                                      </div>{idx2 == group?.options.length - 1 ? '' : <>&nbsp;/&nbsp;</>}                                    </>
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
    // 주문서 추가 입력항목(행사일·행사장소 등).
    //
    // ⚠ 값은 '주문 줄' 로 묶어서 보여 준다.
    //   저장할 때부터 product_id 가 들어 있는데(transaction_order_forms) 화면이 그걸 안 쓰고
    //   주문 전체를 평평하게 나열했다. 그래서 예약을 두 건 담으면 행사일이 두 개 뜨는데
    //   어느 쪽이 어느 상품인지 알 수 없었다 — 날짜를 잘못 읽으면 그날 못 간다.
    //
    //   줄이 하나뿐이면 상품명을 붙이지 않는다. 대부분의 주문이 그렇고, 붙이면 군더더기다.
    //   예전 주문은 product_id 가 비어 있을 수 있다(줄 단위 저장을 넣기 전에 접수된 것) —
    //   그때는 이름을 못 붙이고 예전처럼 나열된다.
    //
    // **불러온 주문 중에 값이 하나라도 있으면** 열을 만든다.
    //
    // 예전에는 '이 몰에 서식이 걸려 있으면' 으로 판단했다. 항목이 가맹점 단위가 아니라
    // 상품 단위가 되면서 그 기준이 사라졌고, 무엇보다 항목을 나중에 내리면
    // 이미 접수된 주문의 값이 화면에서 통째로 사라졌다.
    // 실제 데이터로 판단하면 그런 일이 없고, 안 쓰는 몰에 빈 열이 생기지도 않는다.
    ...(((data?.content ?? []).some((r) => r?.order_forms?.length > 0)) ? [{
      id: 'order_forms',
      label: '추가 입력정보',
      action: (row) => (
        !(row?.order_forms?.length > 0) ? <div style={{ color: '#bbb' }}>---</div> :
          <Col style={{ gap: '2px', minWidth: '220px' }}>
            {입력값묶음(row).map((덩어리) => (
              <Col key={덩어리.키} style={{ gap: '2px' }}>
                {덩어리.상품명 &&
                  <div style={{ fontWeight: 700, marginTop: '4px' }}>{덩어리.상품명}</div>}
                {덩어리.항목.map((f) => (
                  <Row key={f.id} style={{ alignItems: 'flex-start', gap: '6px' }}>
                    <div style={{ minWidth: '84px', color: '#888', whiteSpace: 'nowrap' }}>{f.label}</div>
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{f.value}</div>
                  </Row>
                ))}
              </Col>
            ))}
          </Col>
      ),
    }] : []),
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

          {/* 받는사람·연락처는 주문서에서 입력받아 transactions 에 저장되는데
              (pay.controller 가 receiver·receiver_phone·zonecode 로 저장한다)
              이 컬럼이 주소만 찍어서 관리자가 볼 수 없었다 — 송장을 쓸 수가 없다. */}
          {(row['receiver'] || row['receiver_phone']) &&
            <div style={{ fontWeight: 600 }}>
              {row['receiver'] ?? ''}{row['receiver_phone'] ? ` · ${row['receiver_phone']}` : ''}
            </div>}
          <div>{row['zonecode'] ? `(${row['zonecode']}) ` : ''}{row['addr'] ?? "---"}</div>
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
        const base = _.find(paymentModuleTypeList, { value: row?.trx_method })?.label ?? "---";
        // 포스페이(41)는 산하 결제수단(카드/카카오 등)까지 표시
        if (row?.trx_method == 41 && row?.pay_method) {
          const sub = _.find(forspayMethodList, { key: row?.pay_method })?.label;
          return sub ? `${base} · ${sub}` : base;
        }
        return base;
      }
    },
    ...(themeDnsData?.id != 74 ? [
      {
        id: 'invoice_num',
        label: '택배사/송장번호',
        action: (row) => {
          // 기존 저장값 파싱: '택배사-송장번호' 형식이고 앞부분이 알려진 택배사일 때만 분리, 아니면 전체를 송장번호로 간주
          const raw = row?.invoice_num ?? '';
          const firstDash = raw.indexOf('-');
          const maybeCourier = firstDash > 0 ? raw.slice(0, firstDash) : '';
          const isCourier = COURIER_LIST.includes(maybeCourier);
          const [courier, setCourier] = useState(isCourier ? maybeCourier : '');
          const [invoice, setInvoice] = useState(isCourier ? raw.slice(firstDash + 1) : raw);
          return <Col style={{ rowGap: '0.5rem', minWidth: '190px' }}>
            <Select
              size={'small'}
              displayEmpty
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
            >
              <MenuItem value={''}>{'택배사 선택'}</MenuItem>
              {COURIER_LIST.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
            <TextField
              size={'small'}
              placeholder={'송장번호'}
              className={`invoice-${row?.id}`}
              value={invoice}
              onChange={(e) => {
                setInvoice(e.target.value);
              }}
            />
            <Button variant="contained" onClick={async () => {
              const num = (invoice || '').trim();
              const joined = num ? (courier ? `${courier}-${num}` : num) : '';
              let result = await apiManager(`transactions/${row?.id}/invoice`, 'create', {
                id: row?.id,
                invoice_num: joined
              })
              if (result) {
                toast.success('성공적으로 저장 되었습니다.')
              }
            }}>저장</Button>
            {invoice ? (
              <a href={courierTrackUrl(courier, invoice)} target="_blank" rel="noreferrer"
                style={{ fontSize: 12, color: '#1a73e8' }}>배송조회</a>
            ) : null}
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
          {/* shopgo 하위 가맹점은 창고 입고 단계를 쓰지 않아 '입고완료'를 숨긴다.
              단, 기존에 입고완료(10)로 저장된 주문은 값이 사라지지 않도록 그 행에서는 노출. */}
          {(!isShopgoMerchant(themeDnsData) || row?.trx_status == 10) &&
            <MenuItem value={10}>{'입고완료'}</MenuItem>}
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
    /*{
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
    },*/
    {
      id: 'cancel',
      label: '취소',
      action: (row) => {
        // 취소를 우리 화면에서 처리해야 DB·재고·포인트가 함께 맞는다.
        // PG 콘솔에서만 취소하면 우리 쪽은 정상 주문으로 남고 매출·재고가 어긋난다.
        if (row?.is_cancel == 1 || row?.is_cancel_trans == 1) return <div style={{ color: '#bbb' }}>취소됨</div>;
        return (
          <Button size='small' variant='outlined' color='error'
            onClick={() => { setCancelTrxId(row?.id); }}>
            부분/전체 취소
          </Button>
        );
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
    // 저장 후 목록 재조회(<Select>가 uncontrolled라 재조회 없으면 값이 이전 상태로 되돌아 보임).
    onChangePage(searchObj);
  }
  const onChangeInvoice = () => {

  }
  return (
    <>
      <Stack spacing={3}>
        <Card>
          <ManagerTable
            data={data}
            // defaultColumns 를 매 렌더 계산본 그대로 넘긴다.
            // 예전엔 columns state 에 마운트 때 한 번만 담아 썼는데, 그 컬럼 정의 안의
            // 삭제·상태변경 핸들러가 '첫 렌더의 searchObj'를 붙든 채 얼어붙었다.
            // 그래서 상태를 바꾸거나 삭제하면 onChangePage(초기 searchObj) 가 나가면서
            // trx_status 가 빈 값이 되어 목록 필터가 '전체'로 되돌아갔다.
            // (adjustments.js 가 같은 이유로 이미 이렇게 고쳐져 있다)
            columns={defaultColumns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={''}
          />
        </Card>
      </Stack>

      {/* 부분/전체 취소 — 표 밖에 **한 번만** 둔다.
          예전엔 '수정/삭제' 컬럼의 action 안에 있었다. 그 컬럼은 브랜드 34·64·84 에서만
          붙는 조건부라, 나머지 가맹점에서는 다이얼로그가 화면에 아예 없었다 —
          취소 버튼을 눌러도 state 만 바뀌고 아무 일도 일어나지 않았다.
          컬럼 안에 두면 행마다 하나씩 생기는 것도 문제다(같은 open 을 보므로 N개가 한꺼번에
          열리고 각자 주문을 불러온다). 표 밖에 한 번만 두면 두 가지가 같이 해결된다. */}
      <PartialCancelDialog
        open={!!cancelTrxId}
        trxId={cancelTrxId}
        onClose={() => setCancelTrxId(0)}
        onDone={() => onChangePage(searchObj)}
      />
    </>
  )
}
TrxList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default TrxList

