import { useState } from 'react';
import { Col } from 'src/components/elements/styled-components';
import { commarNumber, 포스페이미승인 } from 'src/utils/function';
import { getOptionLabel, 섬추가비 } from 'src/utils/shop-util';

// 주문관리·주문취소관리 표가 같이 쓰는 칸(가맹점 요청 2026-11-12).
// 칸 순서: 구매자 → 상품명·수량·금액 → 주문번호/승인번호 → 구매시간 → 받는사람 → 주소.
//   예전엔 「구매금액」을 눌러야 상품명이 펼쳐졌다. 주문 거의 전부가 상품 한 줄이라 상품명을 바로 보인다.
//   이름과 연락처는 한 칸에 두 줄로 둔다 — 칸이 늘면 가로 스크롤이 길어진다.
// 두 화면이 같은 주문을 다르게 보여 주면 서로 다르게 읽게 되므로 칸 정의는 여기 한 곳에 둔다.
//
// 취소완료 탭의 줄은 취소 원장 줄이다(is_cancel=1, 원주문을 복사하고 금액만 음수). 상품 줄(orders)은
// 서버가 원주문의 것을 붙여 준다.

// 취소 원장 줄은 글자를 빨갛게(다른 칸들과 같은 규칙)
export const 취소빨강 = (row) => ({ color: `${row?.is_cancel == 1 ? 'red' : ''}` });

const 작은글 = { fontSize: '12px', color: '#888' };
const 옵션글자 = { fontSize: '12.5px', color: '#777', wordBreak: 'keep-all' };

// 주문 한 줄 — 상품명(누르면 상품 수정 화면), 그 아래 옵션·추가상품을 작은 글씨로.
// 금액이 붙은 옵션은 금액도 적는다. 0원이면 안 적는다(조합형은 개별가가 0이고 추가금이 따로 붙는다).
const 주문줄 = ({ order, 여러줄 }) => (
  <Col style={{ gap: '2px' }}>
    <div style={{ cursor: 'pointer', wordBreak: 'keep-all' }}
      onClick={() => { window.open(`/manager/products/edit/${order?.product_id}`) }}>
      {order?.order_name}
    </div>
    {(order?.groups ?? []).map((group, gi) => (
      <div key={gi} style={옵션글자}>
        {/* 선택옵션과 추가상품을 구분한다 — 필수로 고른 것인지 돈이 붙은 추가상품인지 보이게 */}
        {group?.group_name}
        {Number(group?.group_type) === 1 &&
          <span style={{ marginLeft: '4px', fontSize: '0.72rem', color: '#5a8a1e', border: '1px solid #cde3a6', borderRadius: '4px', padding: '0 3px' }}>추가상품</span>}
        {': '}
        {(group?.options ?? []).map((option) => `${getOptionLabel(option)}${Number(option?.option_price)
          ? ` (${Number(option.option_price) > 0 ? '+' : ''}${commarNumber(option.option_price)}원)` : ''}`).join(' / ')}
      </div>
    ))}
    {여러줄 &&
      <div style={옵션글자}>{commarNumber(order?.order_count ?? 1)}개 · {commarNumber(order?.order_amount)}원</div>}
    {order?.seller_id > 0 &&
      <div style={옵션글자}>셀러 {order?.seller_user_name}</div>}
  </Col>
);

// 상품명 칸 — 먼저 담은 줄 하나를 보이고, 줄이 여럿이면 「외 N건」을 눌러 펼친다.
// 훅을 쓰므로 action 안에서 바로 부르지 말고 컴포넌트로 그린다(<상품칸 key row />).
const 상품칸 = ({ row }) => {
  const [펼침, set펼침] = useState(false);
  // 서버는 줄을 최신순(id 내림차순)으로 준다 — 담은 순서로 돌려 본상품이 먼저 오게 한다
  const 줄들 = [...(row?.orders ?? [])].sort((a, b) => Number(a?.id) - Number(b?.id));
  if (!줄들.length) return <div style={{ color: '#bbb' }}>---</div>;
  const 여러줄 = 줄들.length > 1;
  return (
    <Col style={{ gap: '6px', minWidth: '180px', maxWidth: '300px' }}>
      {(펼침 ? 줄들 : 줄들.slice(0, 1)).map((order, i) => <주문줄 key={order?.id ?? i} order={order} 여러줄={여러줄} />)}
      {여러줄 &&
        <button type="button" onClick={() => set펼침((v) => !v)}
          style={{ alignSelf: 'flex-start', padding: 0, border: 0, background: 'none', color: '#1976d2', cursor: 'pointer', fontSize: '12.5px' }}>
          {펼침 ? '접기' : `외 ${줄들.length - 1}건 보기`}
        </button>}
    </Col>
  );
};

const 이름과번호 = (이름, 번호) => (
  <div style={{ whiteSpace: 'nowrap' }}>
    <div>{이름 || '---'}</div>
    {번호 ? <div style={작은글}>{번호}</div> : null}
  </div>
);

export const 구매자칸 = {
  id: 'buyer_name',
  label: '구매자명 / 연락처',
  action: (row) => 이름과번호(row['buyer_name'], row['buyer_phone']),
  sx: 취소빨강,
};

export const 상품명칸 = {
  id: 'orders',
  label: '상품명',
  action: (row) => <상품칸 key={row?.id} row={row} />,
  sx: 취소빨강,
};

export const 수량칸 = {
  id: 'order_count',
  label: '수량',
  action: (row) => {
    const 줄들 = row?.orders ?? [];
    if (!줄들.length) return '---';
    const 합 = 줄들.reduce((s, o) => s + (Number(o?.order_count) || 0), 0);
    return (
      <div style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
        <div>{commarNumber(합)}</div>
        {줄들.length > 1 ? <div style={작은글}>상품 {줄들.length}줄</div> : null}
      </div>
    );
  },
  sx: 취소빨강,
};

// 결제금액(배송비 포함). 배송비가 붙었으면 아래에 작게 적는다. 취소 원장 줄은 음수(돌려준 금액)다.
// 제주·도서산간 추가배송비(island_fee)는 줄 배송비에 들어 있다 — 나눠 적는다(「배송비 3,000원 + 제주 3,000원」).
const 섬이름 = (region) => (region === 'jeju' ? '제주' : region === 'island' ? '도서산간' : '');
export const 금액칸 = {
  id: 'amount',
  label: '금액',
  action: (row) => {
    const 배송비 = (row?.orders ?? []).reduce((s, o) => s + (Number(o?.delivery_fee) || 0), 0);
    const 섬비 = Math.max(0, Number(row?.island_fee) || 0);
    const 기본 = Math.max(0, 배송비 - 섬비);
    const 글 = 섬비 > 0
      ? `${기본 > 0 ? `배송비 ${commarNumber(기본)}원` : '무료배송'} + ${섬이름(row?.island_region) || '추가'} ${commarNumber(섬비)}원`
      : (배송비 > 0 ? `배송비 ${commarNumber(배송비)}원 포함` : '');
    return (
      <div style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
        <div style={{ fontWeight: 600 }}>{commarNumber(row['amount'])}원</div>
        {글 ? <div style={작은글}>{글}</div> : null}
      </div>
    );
  },
  sx: 취소빨강,
};

// 주문관리는 주문번호만, 주문취소관리는 승인번호만 보여서 두 화면에서 같은 주문을 맞춰 볼 수 없었다(2026-11-06) — 두 화면 모두 둘 다.
export const 주문번호칸 = {
  id: 'ord_num',
  label: '주문번호 / 승인번호',
  action: (row) => (
    <div style={{ whiteSpace: 'nowrap' }}>
      <div>{row['ord_num'] || '---'}</div>
      {row['appr_num'] ? <div style={작은글}>승인 {row['appr_num']}</div> : null}
    </div>
  ),
  sx: 취소빨강,
};

// trx_dt·trx_tm 은 PG 승인 시각이라 결제완료된 건에만 있다. 승인 전(결제대기·무통장)에는
// 비어서 가맹점은 '주문시간이 안 찍힌다'고 읽었다. 승인 전에는 주문 접수시각(created_at)을 보여준다.
export const 구매시간칸 = {
  id: 'created_at',
  label: '구매시간',
  action: (row) => {
    const 승인 = `${row['trx_dt'] ?? ''} ${row['trx_tm'] ?? ''}`.trim();
    return 승인 || (row['created_at'] ?? '---');
  },
  sx: 취소빨강,
};

// 받는사람·연락처는 주문서에서 입력받아 transactions 에 저장된다(pay.controller 가 receiver·receiver_phone·zonecode 로 저장).
export const 받는사람칸 = {
  id: 'receiver',
  label: '받는사람 / 연락처',
  action: (row) => 이름과번호(row['receiver'], row['receiver_phone']),
  sx: 취소빨강,
};

// 주소 칸의 제주·도서산간 표시 — 주문할 때 저장된 판정(island_region)을 쓰고,
// 지금 몰 설정이 그 지역 「배송 안 함」이면 빨갛게 알린다(설정을 바꾸기 전에 들어온 주문 — 손님과 연락하거나 전체 취소).
const 섬표시 = ({ row }) => {
  if (row?.is_cancel == 1) return null;
  const 지금 = 섬추가비({ zonecode: row?.zonecode, addr: row?.addr, country_code: row?.country_code, country_name: row?.country_name });
  const region = row?.island_region || ((지금.region === 'jeju' || 지금.region === 'island') ? 지금.region : '');
  if (!region) return null;
  // 「배송 안 함 지역」은 가맹점이 손댈 주문에만 붙인다 — 결제대기(입금 전)·결제완료·입고.
  //   이미 출고·배송된 주문, 취소요청, 결제실패, 포스페이 승인 전(돈이 안 들어옴), 취소 원장 줄에는 붙이지 않는다(11/12 점검).
  const 손댈주문 = [0, 5, 10].includes(Number(row?.trx_status)) && !포스페이미승인(row) && !(Number(row?.amount) < 0);
  const 막힘 = 손댈주문 && 지금.blocked && 지금.region === region;
  return (
    <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '12px', fontWeight: 600, padding: '0 6px', borderRadius: '10px', background: region === 'jeju' ? '#e6f0fa' : '#fff4dd', color: region === 'jeju' ? '#1f6fb2' : '#a15c00' }}>{섬이름(region)}</span>
      {막힘 && <span style={{ fontSize: '12px', fontWeight: 600, padding: '0 6px', borderRadius: '10px', background: '#fde9e9', color: '#c23b3b' }}>배송 안 함 지역</span>}
    </div>
  );
};

export const 주소칸 = {
  id: 'addr',
  label: '주소',
  action: (row) => (
    <Col style={{ minWidth: '200px' }}>
      <div>{row['zonecode'] ? `(${row['zonecode']}) ` : ''}{row['addr'] ?? '---'}</div>
      <div>{row['detail_addr'] ?? ''}</div>
      <섬표시 row={row} />
      {/* 배송 요청사항 — 송장에 옮겨 적어야 하는 값이라 주소 바로 아래에 붙인다. */}
      {row['delivery_memo'] &&
        <div style={{ marginTop: '4px', padding: '4px 8px', background: '#fff8e1', borderRadius: '4px', fontSize: '12.5px', whiteSpace: 'pre-line' }}>
          요청: {row['delivery_memo']}
        </div>}
    </Col>
  ),
  sx: 취소빨강,
};
