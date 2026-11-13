import { Button, Card, Checkbox, Container, FormControlLabel, IconButton, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { COURIER_LIST, 기본택배사 } from 'src/data/couriers';
import { useEffect, useRef, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row } from "src/components/elements/styled-components";
import { useModal } from "src/components/dialog/ModalProvider";
import PartialCancelDialog from "src/components/manager/PartialCancelDialog";
import TrxHistoryDialog from "src/components/manager/TrxHistoryDialog";
import { commarNumber, getOrderStatusText, 포스페이미승인 } from "src/utils/function";
import toast from "react-hot-toast";
import { apiManager, apiUtil } from "src/utils/api";
import { useSettingsContext } from "src/components/settings";
import { isShopgoMerchant } from "src/utils/is-shopgo";
import { trxMethodLabel, forspayMethodList } from "src/utils/format";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { Upload } from "src/components/upload";
import { sha256 } from "js-sha256";
import _ from 'lodash';
import { getOptionLabel } from 'src/utils/shop-util';
import { 엑셀내려받기 } from 'src/utils/excel';
import OrderExcelDialog from 'src/components/manager/OrderExcelDialog';
import { 구매자칸, 상품명칸, 수량칸, 금액칸, 주문번호칸, 구매시간칸, 받는사람칸, 주소칸 } from 'src/components/manager/OrderColumns';
import { 메뉴상태 } from 'src/utils/order-excel-filter';
import InvoiceExcelDialog, { 송장엑셀사용 } from 'src/components/manager/InvoiceExcelDialog';
import axios from 'axios';

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

// 택배사·송장번호로 배송조회 (네이버 통합 택배조회 — 택배사 무관하게 동작)
const courierTrackUrl = (courier, no) =>
  `https://search.naver.com/search.naver?query=${encodeURIComponent(`${courier || ''} ${no || ''} 택배조회`.trim())}`;

// 취소요청은 가맹점이 처리해야 할 건이라 상태 칸을 눈에 띄게 칠한다(가맹점 문의 2026-11-06).
const 취소요청강조 = { bgcolor: '#ffebee', color: '#d32f2f', fontWeight: 700, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ef9a9a' } };

// 확인 팝업·일괄 변경에 쓰는 상태 이름(드롭다운과 같은 이름)
const 상태이름 = { 0: '결제대기', 1: '취소요청', 5: '결제완료', 10: '입고완료', 15: '출고완료', 20: '배송중', 25: '배송완료' };
// 일괄로 고를 수 있는 상태 — 취소요청은 한 건씩만(서버 util.controller 일괄상태와 같다)
const 일괄상태 = [5, 10, 15, 20, 25];
const 일괄최대 = 100;

// 취소완료 탭의 줄은 원래 주문이 아니라 취소 원장 줄(is_cancel=1, 금액 음수, transaction_id → 원래 주문)이다.
// 이력은 원래 주문에 쌓이므로 원장 줄이면 원래 주문의 이력을 연다(2026-11-06 미리보기에서 빈 이력으로 발견).
const 이력주문 = (row) => (row?.is_cancel == 1 && Number(row?.transaction_id) > 0 ? row.transaction_id : row?.id);

const TrxList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  // ⚠ defaultColumns 안에서 data 를 읽는다(추가 입력정보 열 표시 여부).
  //   const 는 TDZ 라 선언이 아래에 있으면 렌더 중 ReferenceError 가 나고 화면이 백지가 된다.
  //   그래서 컬럼 정의보다 위에 둔다.
  const [data, setData] = useState({});
  // 부분/전체 취소 다이얼로그 대상 주문 id
  const [cancelTrxId, setCancelTrxId] = useState(0);
  // 상태 변경 이력 창 대상 주문 id
  const [historyTrxId, setHistoryTrxId] = useState(0);
  // 일괄 상태 변경(가맹점 요청 2026-11-06): 체크한 주문 id 와 고른 상태
  const [선택, set선택] = useState([]);
  const [일괄값, set일괄값] = useState('');
  const [일괄중, set일괄중] = useState(false);
  // 거래 수정·삭제는 마스터(본사, level 50)만 — 가맹점 요청서 2026-09-11 ①② → 사장님 결정. 서버(transaction.controller)도 50 을 요구한다.
  const 마스터 = Number(user?.level) >= 50;
  const 실패목록 = useRouter().query?.type == 'failed';
  // 상태를 사람이 바꿀 수 있는 줄인지 — 드롭다운이 열리는 조건과 같다(서버도 같은 규칙으로 다시 본다)
  const 바꿀수있음 = (row) => !(row?.is_cancel == 1 || row?.is_cancel_trans == 1) && Number(row?.trx_status) >= 0 && (마스터 || !포스페이미승인(row));
  // 일괄 변경에 고를 수 있는 줄 — 취소요청(1)은 손님이 취소를 원한 주문이라 한 건씩만 바꾼다(서버도 건너뛴다)
  const 일괄가능 = (row) => 바꿀수있음(row) && Number(row?.trx_status) !== 1;
  const defaultColumns = [
    // 체크칸 — 일괄 상태 변경용. 결제실패/미완료 목록은 바꿀 수 있는 주문이 없어 두지 않는다.
    ...(실패목록 ? [] : [{
      id: 'select',
      label: '',
      action: (row) => (
        <Checkbox size="small" sx={{ p: 0.5 }}
          disabled={!일괄가능(row)}
          checked={선택.includes(row?.id)}
          onChange={(e) => set선택((앞) => e.target.checked ? [...앞, row.id] : 앞.filter((x) => x !== row.id))} />
      ),
    }]),
    // 번호 — 게시판식 역순(맨 위 최신이 가장 큰 번호). 새 주문이 들어와도 기존 주문 번호는 그대로다(가맹점 요청 2026-11-06).
    {
      id: 'no',
      label: '번호',
      action: (row) => {
        const 줄 = (data?.content ?? []).findIndex((r) => r?.id === row?.id);
        const 번호 = Number(data?.total ?? 0) - (Number(searchObj?.page || 1) - 1) * Number(searchObj?.page_size || 10) - 줄;
        return <div style={{ color: '#888', whiteSpace: 'nowrap' }}>{줄 >= 0 && 번호 > 0 ? 번호 : ''}</div>;
      },
    },
    // 칸 정의는 OrderColumns.js(주문취소관리와 같이 쓴다). 순서: 구매자 → 상품명·수량·금액 → 주문번호/승인번호 → 구매시간 → 받는사람 → 주소(2026-11-12).
    구매자칸,
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
    상품명칸,
    수량칸,
    금액칸,
    ...(themeDnsData?.setting_obj?.is_use_seller == 2 ? [
      /* 검품사진(check_img) 열을 없앤다.
         업로드 창은 떴지만 저장하는 함수(updatePicture)의 본문이 통째로 주석 처리돼 있었다 —
         console.log 만 남아 있어서, 사진을 올리고 확인을 눌러도 아무 일도 일어나지 않았다.
         고객 화면은 물론 관리자 표에서도 그 값을 다시 보여주는 곳이 없다.
         되살리려면 저장 경로(transactions update)부터 다시 이어야 한다. */
    ] : [
      주문번호칸,
    ]),
    // 구매시간은 주문번호 바로 오른쪽(가맹점 요청 2026-11-06).
    ...(themeDnsData?.id == 74 ? [] : [
      구매시간칸,
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
    받는사람칸,
    주소칸,
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
    ] : []),
    // 「처리시간」 칸은 없앴다 — 언제 누가 무엇을 바꿨는지는 「이력」에 다 있다(가맹점 요청 2026-11-06).
    {
      id: 'trx_method',
      label: '결제타입',
      action: (row) => {
        const base = trxMethodLabel(row?.trx_method) ?? "---";
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
          // 아직 택배사를 안 고른 주문은 설정관리에 넣어 둔 기본 택배사로 시작한다.
          // 늘 같은 택배사를 쓰는 가맹점이 주문마다 같은 값을 고르고 있었다.
          // (저장은 '저장' 을 눌러야 된다 — 미리 골라 두는 것뿐이고, 주문마다 바꿀 수 있다)
          const [courier, setCourier] = useState(isCourier ? maybeCourier : 기본택배사(themeDnsData));
          const [invoice, setInvoice] = useState(isCourier ? raw.slice(firstDash + 1) : raw);
          // 취소됐거나 결제가 안 된 주문은 발송할 일이 없다 — 입력칸 대신 저장된 값만 보여 준다.
          // ⚠ 위 useState 보다 앞으로 옮기면 안 된다(행마다 훅 개수가 달라진다).
          if (row?.is_cancel == 1 || row?.is_cancel_trans == 1 || Number(row?.trx_status) < 0 || (!마스터 && 포스페이미승인(row))) {
            return <div style={{ color: '#999', whiteSpace: 'nowrap' }}>{raw || '---'}</div>;
          }
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
        // 전체 목록에 남는 취소 건 — 진행 상태를 다시 매길 일이 없다.
        if (row?.is_cancel == 1 || row?.is_cancel_trans == 1) return <div style={{ color: '#d32f2f', whiteSpace: 'nowrap' }}>취소완료</div>;
        // 결제실패/미완료(-1) — 시스템이 정리한 건. 사람이 상태를 정할 일이 없다.
        if (Number(row?.trx_status) < 0) return <div style={{ color: '#999', whiteSpace: 'nowrap' }}>결제실패/미완료</div>;
        // 포스페이 승인 전 — 예전엔 드롭다운이 열려 있어 결제된 주문과 구분되지 않았다(본사 50 이상은 그대로 둔다).
        if (!마스터 && 포스페이미승인(row)) return <div style={{ color: '#999', whiteSpace: 'nowrap' }}>결제 미완료</div>;
        return <Select
          size="small"
          // 값은 저장된 상태 그대로(확인 팝업에서 취소하면 그대로 남는다). 바꾸면 저장 뒤 목록을 다시 읽는다.
          value={row?.trx_status}
          sx={row?.trx_status == 1 ? 취소요청강조 : undefined}
          onChange={(e) => {
            const 새값 = Number(e.target.value);
            if (새값 === Number(row?.trx_status)) return;
            // 바꾸기 전에 한 번 더 묻는다(가맹점 요청 2026-11-06)
            setModal({
              func: () => { onChangeStatus(row?.id, 새값) },
              icon: 'material-symbols:published-with-changes',
              title: '주문 상태를 바꿀까요?',
              content: `${row?.ord_num || `주문 #${row?.id}`}\n${상태이름[Number(row?.trx_status)] ?? row?.trx_status} → ${상태이름[새값] ?? 새값}`,
            });
          }}
        >
          {/* 결제대기(0)로는 되돌릴 수 없다(가맹점 요청서 2026-09-11 ④, 서버도 거부).
              지금 결제대기인 행(무통장 입금 대기 등)만 현재값 표시용으로 남긴다 — 고를 수는 없다. */}
          {row?.trx_status == 0 && <MenuItem value={0} disabled>{'결제대기'}</MenuItem>}
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
    // 결제창이 알려 준 사유(포스페이 요청 2026-11-04 ④). 결제창을 그냥 닫은 건이나 이 기능 전 주문은 비어 있다.
    ...(실패목록 ? [{
      id: 'fail_reason',
      label: '실패 사유',
      action: (row) => <div style={{ minWidth: '150px', fontSize: '13px', wordBreak: 'keep-all' }}>{row?.fail_reason ?? '---'}</div>,
    }] : []),
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
        if (Number(row?.trx_status) < 0) return <div style={{ color: '#bbb', whiteSpace: 'nowrap' }}>결제 안 됨</div>;
        if (!마스터 && 포스페이미승인(row)) return <div style={{ color: '#bbb', whiteSpace: 'nowrap' }}>결제 안 됨</div>;
        return (
          // 글씨가 두 줄로 접히면 버튼 상자 밖으로 삐져나온다(칸이 좁을 때).
          // 조작 요소는 줄을 바꾸지 않는다 — 표 규칙은 ManagerTable 의 sx 참고.
          <Button size='small' variant='outlined' color='error'
            sx={{ whiteSpace: 'nowrap', px: 1 }}
            onClick={() => { setCancelTrxId(row?.id); }}>
            부분/전체 취소
          </Button>
        );
      },
    },
    {
      id: 'history',
      label: '이력',
      action: (row) => (
        <Button size='small' variant='text' sx={{ whiteSpace: 'nowrap', px: 1 }} onClick={() => setHistoryTrxId(이력주문(row))}>이력</Button>
      ),
    },
    // 수정·삭제 열은 마스터 계정에만 붙는다. 가맹점 관리자 화면에는 열 자체가 없다.
    ...(!마스터 ? [] : themeDnsData?.id == 34 || themeDnsData?.id == 64 || themeDnsData?.id == 84 ? [
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
    // 메뉴 → 조회 조건(가맹점 요청서 2026-09-11 ①):
    //   failed  : 「결제실패/미완료」 — 시스템이 정리한 -1 + 아직 정리 전인 버려진 결제대기(카드/간편 창만 열고 승인 안 남)
    //   0       : 샵고 가맹점은 진짜 대기(무통장·상품권)만(kind=waiting), 그 밖 가맹점은 예전처럼 결제대기 전부
    //   all     : 샵고 가맹점은 결제된 주문 + 취소된 주문만(kind=settled, 포스페이 요청 2026-11-04 ④⑤), 그 밖 가맹점은 예전처럼 전부
    const type = router.query?.type;
    const 샵고 = isShopgoMerchant(themeDnsData);
    const kind = type == 'failed' ? 'failed'
      : (type == '0' && 샵고) ? 'waiting'
        : ((type == 'all' || !type) && 샵고) ? 'settled' : '';
    onChangePage({ ...searchObj, kind, trx_status: (type == 'all' || !type || type == 'failed') ? '' : type, page: 1 });
  }
  // 탭을 빨리 옮기면 앞 탭의 늦은 응답이 지금 탭 목록을 덮어쓴다(취소요청 탭에 취소완료 건이 보임) — 마지막 요청의 응답만 쓴다.
  const 조회번호 = useRef(0);
  const onChangePage = async (obj) => {
    const 이번 = ++조회번호.current;
    setSearchObj(obj);
    setData({
      ...data,
      content: undefined
    });
    let data_ = await apiManager('transactions', 'list', obj);
    if (data_ && 이번 === 조회번호.current) {
      setData(data_);
      //console.log(data_)
    }
  }
  // ── 엑셀 내려받기 ─────────────────────────────────────────────────────
  //
  // 버튼을 누르면 창(OrderExcelDialog)이 열린다. 기간·상태를 고르거나(처음엔 지금 보는 조건이 채워져 있다),
  // 표에서 체크한 주문만 받는다(가맹점 요청 2026-11-12).
  // 화면은 한 페이지(10건)만 보여주지만 조건으로 받으면 **조건에 맞는 주문 전체**를 받는다 —
  // 페이지마다 눌러 이어붙이게 하면 그게 곧 실수가 된다.
  //
  // ⚠ 이 파일에는 이름·전화·주소가 평문으로 들어간다. DB 는 암호화해 두지만
  //   엑셀로 나가는 순간 그 보호가 사라진다. 화면에 보이는 값만 담는다(가리지 않는다는 뜻이 아니라,
  //   화면에서 이미 볼 수 있는 것 이상은 담지 않는다는 뜻이다).
  const [엑셀중, set엑셀중] = useState(false);
  const [엑셀창, set엑셀창] = useState(false);
  const [송장창, set송장창] = useState(false);

  const 줄글 = (row) => (row?.orders ?? []).map((o, i) => {
    const 옵션 = (o?.groups ?? [])
      .map((g) => `${g?.group_name}: ${(g?.options ?? []).map(getOptionLabel).filter(Boolean).join(' / ')}`)
      .filter(Boolean).join(' | ');
    return `${i + 1}. ${o?.order_name ?? ''}${옵션 ? ` (${옵션})` : ''} × ${o?.order_count ?? 1}`;
  }).join('\n');

  const 입력정보글 = (row) => (row?.order_forms ?? [])
    .map((v) => `${v?.label ?? ''}: ${v?.value ?? ''}`).join('\n');

  // 열 순서는 위 표(OrderColumns.js)와 같다 — 구매자 → 상품·수량·금액 → 주문번호·승인번호 → 구매시간 →
  // 받는사람 → 주소·배송요청 → 추가 입력정보 → 결제타입 → 송장번호 → 상태(사장님 요청 2026-11-12, 표 순서를 바꾼 d519c62f 에 맞춤).
  // 표 칸 순서를 바꾸면 여기도 같이 바꾼다. 송장 엑셀 등록은 열 이름으로 찾으므로 순서와 무관하다(invoice-excel.js).
  const 엑셀열 = (실패사유열) => [
    { label: '구매자명', width: 12, value: (r) => r?.buyer_name ?? '' },
    { label: '구매자연락처', width: 16, value: (r) => r?.buyer_phone ?? '' },
    { label: '주문상품', width: 46, value: 줄글 },
    // 표의 「수량」 칸처럼 주문 줄 수량의 합
    { label: '수량', width: 8, value: (r) => (r?.orders ?? []).reduce((s, o) => s + (Number(o?.order_count) || 0), 0) },
    { label: '결제금액', width: 12, value: (r) => Number(r?.amount) || 0 },
    { label: '주문번호', width: 22, value: (r) => r?.ord_num ?? '' },
    { label: '승인번호', width: 14, value: (r) => r?.appr_num ?? '' },
    // 표의 「구매시간」과 같은 값 — 승인 시각, 승인 전(결제대기 등)이면 주문 접수 시각(OrderColumns.js 구매시간칸)
    { label: '구매시간', width: 20, value: (r) => `${r?.trx_dt ?? ''} ${r?.trx_tm ?? ''}`.trim() || (r?.created_at ?? '') },
    { label: '받는사람', width: 12, value: (r) => r?.receiver ?? '' },
    { label: '받는사람연락처', width: 16, value: (r) => r?.receiver_phone ?? '' },
    { label: '주소', width: 40, value: (r) => `${r?.addr ?? ''} ${r?.detail_addr ?? ''}`.trim() },
    // 표에서는 주소 바로 아래 노란 칸
    { label: '배송요청사항', width: 30, value: (r) => r?.delivery_memo ?? '' },
    { label: '추가 입력정보', width: 28, value: 입력정보글 },
    { label: '결제타입', width: 16, value: (r) => trxMethodLabel(r?.trx_method) ?? '' },
    { label: '송장번호', width: 18, value: (r) => r?.invoice_num ?? '' },
    { label: '상태', width: 12, value: (r) => (포스페이미승인(r) ? '결제 미완료' : getOrderStatusText(r)) },
    { label: '취소여부', width: 10, value: (r) => (r?.is_cancel == 1 || r?.is_cancel_trans == 1 ? '취소' : '') },
    { label: '취소시간', width: 20, value: (r) => r?.cancelled_at ?? '' },
    // 제주·도서산간 추가배송비(2026-11-12) — 주문할 때 저장된 값. 금액 열의 배송비에 이미 들어 있다.
    { label: '추가배송비 지역', width: 14, value: (r) => (Number(r?.island_fee) > 0 ? (r?.island_region === 'jeju' ? '제주' : r?.island_region === 'island' ? '도서산간' : '') : '') },
    { label: '추가배송비', width: 12, value: (r) => (Number(r?.island_fee) > 0 ? Number(r.island_fee) : '') },
    // 「결제실패/미완료」를 넣어 받을 때만, 표처럼 상태 뒤 맨 끝에
    ...(실패사유열 ? [{ label: '실패 사유', width: 34, value: (r) => r?.fail_reason ?? '' }] : []),
  ];

  // { 조건 } — 창에서 고른 기간·상태로 서버에서 다 받는다 / { 선택: true } — 표에서 체크한 줄만
  const onExcel = async ({ 조건, 선택: 체크만 } = {}) => {
    set엑셀중(true);
    try {
      let 모은것 = [];
      let 잘림 = false;
      if (체크만) {
        // 체크는 목록이 바뀌면 풀리므로(아래 useEffect) 체크한 줄은 모두 지금 불러온 목록 안에 있다
        모은것 = (data?.content ?? []).filter((r) => 선택.includes(r?.id));
      } else {
        const 한번에 = 500;
        let page = 1;
        let 전체 = 0;
        // 무한루프 방지로 20바퀴(=1만건)에서 끊고 알린다 — 조용히 잘라 내려주면 안 된다.
        for (; page <= 20; page++) {
          const 결과 = await apiManager('transactions', 'list', { ...조건, page, page_size: 한번에 });
          // 중간에 한 번이라도 실패하면 받다 만 파일을 내주지 않는다 — 빈 응답을 '마지막 쪽'으로 읽으면 조용히 빠진다
          if (!결과) { toast.error('주문을 다 불러오지 못했습니다. 잠시 뒤 다시 받아 주세요.'); return; }
          const 줄 = 결과?.content ?? [];
          전체 = Number(결과?.total) || 전체;
          모은것 = [...모은것, ...줄];
          if (줄.length < 한번에) break;
        }
        // 20바퀴를 다 돌았어도 실제로 남은 주문이 있을 때만 「잘렸다」고 알린다(딱 10,000건이면 다 받은 것, 11/12 점검).
        //   서버가 전체 건수를 안 주면 예전처럼 잘린 것으로 본다.
        잘림 = page > 20 && !(전체 > 0 && 전체 <= 모은것.length);
      }
      if (!모은것.length) { toast.error('내려받을 주문이 없습니다.'); return; }
      if (잘림) toast.error('건수가 많아 10,000건까지만 받았습니다. 기간을 좁혀 다시 받아 주세요.');
      const 실패사유열 = 체크만 ? 실패목록 : String(조건?.statuses ?? '').split(',').includes('failed');
      엑셀내려받기('주문내역', 엑셀열(실패사유열), 모은것, '주문내역');
      // 내려받기 기록(최상위 관리자만 봄, 2026-11-12) — 사람은 서버가 로그인으로 정한다. 기록이 실패해도 파일은 이미 받았으니 조용히 넘어간다.
      axios.post('/api/excel-logs', { kind: 'orders', scope: 체크만 ? 'selected' : 'condition', conditions: 체크만 ? undefined : 조건, row_count: 모은것.length }).catch(() => {});
      set엑셀창(false);
    } finally {
      set엑셀중(false);
    }
  };

  const deleteTrx = async (id) => {
    let result = await apiManager('transactions', 'delete', { id: id });
    if (result) {
      onChangePage(searchObj);
    }
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
  // 목록이 바뀌면(페이지·탭·검색·저장 후 다시 읽기) 체크를 비운다 — 안 보이는 주문이 선택된 채 남지 않게
  useEffect(() => { set선택([]); }, [data?.content]);
  const onBulkStatus = async () => {
    const ids = 선택.slice(0, 일괄최대);
    if (!ids.length || 일괄값 === '') return;
    set일괄중(true);
    const r = await apiUtil(`transactions/trx_status/bulk`, 'update', { ids, value: Number(일괄값) });
    set일괄중(false);
    if (r) {
      const 건너뜀 = Array.isArray(r?.skipped) ? r.skipped : [];
      if (건너뜀.length) {
        const 사유 = [...new Set(건너뜀.map((x) => x?.사유).filter(Boolean))].slice(0, 2).join(' / ');
        toast(`${r?.changed ?? 0}건 변경, ${건너뜀.length}건 건너뜀${사유 ? ` — ${사유}` : ''}`, { duration: 6000 });
      } else {
        toast.success(`${r?.changed ?? 0}건을 ${상태이름[Number(일괄값)]}(으)로 바꿨습니다.`);
      }
      set일괄값('');
    }
    onChangePage(searchObj);
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
        {/* 엑셀 내려받기 — 창에서 기간·상태를 고르거나 체크한 주문만 받는다.
            이 파일에는 이름·전화·주소가 평문으로 들어간다. */}
        <Row style={{ justifyContent: 'flex-end', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
          {/* 송장 엑셀 등록 — 내려받은 엑셀에 송장번호를 적어 올린다(가맹점 요청 2026-11-12). 서버도 관리자(40 이상)만 받는다.
              지금은 보류(송장엑셀사용 = false, InvoiceExcelDialog.js 참고). */}
          {송장엑셀사용 && !실패목록 && Number(user?.level) >= 40 &&
            <Button variant="outlined" onClick={() => set송장창(true)}
              startIcon={<Icon icon="material-symbols:upload" />}>
              송장 엑셀 등록
            </Button>}
          <Button variant="outlined" disabled={엑셀중} onClick={() => set엑셀창(true)}
            startIcon={<Icon icon="material-symbols:download" />}>
            {엑셀중 ? '내려받는 중…' : '엑셀 내려받기'}
          </Button>
        </Row>
        {송장엑셀사용 && <InvoiceExcelDialog open={송장창} onClose={() => set송장창(false)} onDone={() => onChangePage(searchObj)} dns={themeDnsData} />}
        <OrderExcelDialog
          open={엑셀창}
          onClose={() => set엑셀창(false)}
          dns={themeDnsData}
          처음조건={{ s_dt: searchObj?.s_dt, e_dt: searchObj?.e_dt, search: searchObj?.search, statuses: 메뉴상태(router.query?.type, themeDnsData) }}
          선택수={선택.length}
          받는중={엑셀중}
          onDownload={onExcel}
        />
        <Card>
          {!실패목록 && (() => {
            const 보이는 = (data?.content ?? []).filter(일괄가능).map((r) => r.id);
            const 다고름 = 보이는.length > 0 && 보이는.every((id) => 선택.includes(id));
            return (
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap
                sx={{ px: 2, pt: 2, pb: 0.5 }}>
                <FormControlLabel sx={{ mr: 0 }}
                  control={<Checkbox size="small" checked={다고름} indeterminate={!다고름 && 선택.length > 0}
                    disabled={!보이는.length}
                    onChange={(e) => set선택(e.target.checked ? 보이는 : [])} />}
                  label={<Typography variant="body2">이 화면 전체 선택</Typography>} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 선택.length ? 'primary.main' : 'text.disabled' }}>
                  선택 {선택.length}건
                </Typography>
                <Select size="small" displayEmpty value={일괄값} onChange={(e) => set일괄값(e.target.value)} sx={{ minWidth: 150 }}>
                  <MenuItem value="">바꿀 상태 선택</MenuItem>
                  {일괄상태.filter((v) => v !== 10 || !isShopgoMerchant(themeDnsData)).map((v) => <MenuItem key={v} value={v}>{상태이름[v]}</MenuItem>)}
                </Select>
                <Button variant="contained" size="small" disabled={!선택.length || 일괄값 === '' || 일괄중}
                  onClick={() => setModal({
                    func: onBulkStatus,
                    icon: 'material-symbols:published-with-changes',
                    title: `선택한 ${선택.length}건의 상태를 바꿀까요?`,
                    content: `→ ${상태이름[일괄값]}\n취소된 주문, 취소요청 주문, 결제가 확인되지 않은 주문, 그 사이 상태가 바뀐 주문은 건너뜁니다.`,
                  })}>
                  {일괄중 ? '바꾸는 중…' : '선택한 주문 상태 변경'}
                </Button>
              </Stack>
            );
          })()}
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
            date_presets
            // 옆으로 밀어도 체크칸·번호·주문번호가 붙어 있게(결제실패/미완료 목록엔 체크칸이 없다)
            sticky_lead={실패목록 ? [64] : [44, 64]}
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
        // thegrazia(74) 만 연다 — 다른 몰은 옛 전체취소가 이미 막혀 있던 상태 그대로 둔다(2026-10-10 범위 결정).
        onFullCancel={themeDnsData?.id != 74 ? undefined : () => {
          // 부분취소 미지원 결제수단 — 기존 전체취소(onPayCancel) 흐름으로 넘긴다.
          const row = (data?.content ?? []).find((r) => r?.id == cancelTrxId);
          setCancelTrxId(0);
          if (!row) return;
          setModal({
            func: () => { onPayCancel(row) },
            icon: 'material-symbols:cancel-outline',
            title: '결제를 전체 취소하시겠습니까? 취소한 결제는 되돌릴 수 없습니다.'
          })
        }}
      />
      <TrxHistoryDialog open={!!historyTrxId} trxId={historyTrxId} onClose={() => setHistoryTrxId(0)} />
    </>
  )
}
TrxList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default TrxList

