import { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import Iconify from 'src/components/iconify/Iconify';
import { useLocales } from 'src/locales';
import { calcOrderTotals, isAddonLine, getOptionLabel, 배송정책, 섬안내문 } from 'src/utils/shop-util';
import { commarNumberWithUnit, sanitizePhoneInput, 이름최대 } from 'src/utils/function';
import { formatLang } from 'src/utils/format';

// 여러 곳으로 배송 — 주문서의 배송지 칸(2026-11-20).
//
// 한 번 결제하고 상품을 최대 10곳에 보낸다. 주문은 배송지마다 따로 만들어진다(서버 pay.controller 여러곳주문).
// 배송비·무료배송 기준·제주 추가비는 **배송지마다** 따로 계산한다(사장님 결정) — 여기 보이는 금액이 곧 청구액이다
// (서버도 배송지마다 같은 함수로 다시 계산한다).
// 「선물하기」라고 부르지 않는다(사장님 11/20) — 선물이 아니어도(거래처·가족에게 보내기) 쓰는 기능이다.
//
// 보내는 방식 두 가지(11/20 사장님 「손님 입장에서 불편하지 않게」 — 아마존 비즈니스·우커머스·빅커머스 참고):
//   same  : 담은 상품이 받는 분 한 명 몫이다. 배송지를 더하면 수량·금액이 그만큼 곱해진다(기본).
//           가장 흔한 경우(10명에게 하나씩)에 수량을 나누는 일이 없다.
//   split : 담은 수량을 배송지에 나눈다(A 는 서울로, B 는 부산으로).
// 다 쓴 배송지는 한 줄로 접는다 — 10곳이어도 화면이 길어지지 않게. 회원은 주소록에서 고른다.
// 접는 것은 손님이 「입력 완료」나 「배송지 추가」를 눌렀을 때뿐이다(11/23 포스몰 지적). 필수칸이 차는 순간 접었더니
// 배송지 2 에서 주소를 고르자마자 상세주소·배송 요청사항을 쓰기도 전에 접혀 버렸다.
// 켤 때 한 곳 배송 칸에서 옮겨 온 1번도 접지 않는다 — 상세주소 없이 접혀 「다 쓴 것」처럼 보였다.
// 접었는지는 배송지 안(접음)에 둔다 — 새로고침·결제 실패 뒤 되살릴 때(orderDraft) 손님이 접은 그대로 돌아온다.

export const 최대곳 = 10;
const 빈곳 = () => ({ 키: Math.random().toString(36).slice(2), receiver: '', addr_phone: '', zonecode: '', addr: '', detail_addr: '', delivery_memo: '', 수량: {} });

// 처음 켰을 때: 지금 배송지(있으면)를 1번에 두고 빈 2번을 연다. 나눠 보내기용 수량은 모두 1번에 담아 둔다.
export const 처음곳들 = (payData, products) => {
  const 첫 = { ...빈곳(), receiver: payData?.receiver || '', addr_phone: payData?.addr_phone || '', zonecode: payData?.zonecode || '',
    addr: payData?.addr || '', detail_addr: payData?.detail_addr || '', delivery_memo: payData?.delivery_memo || '' };
  (products ?? []).forEach((p, i) => { 첫.수량[i] = Number(p?.order_count) || 0; });
  return [첫, 빈곳()];
};

// 배송지 한 곳의 주문 줄. same 이면 담은 상품 그대로, split 이면 그 곳에 나눈 수량(0 인 줄은 뺀다).
export const 곳의줄 = (곳, products, 방식 = 'split') => (products ?? [])
  .map((p, i) => ({ ...p, order_count: 방식 === 'same' ? (Number(p?.order_count) || 0) : (Number(곳?.수량?.[i]) || 0) }))
  .filter((p) => p.order_count > 0);

// 배송지마다 금액 — calcOrderTotals 를 배송지 주소로(무료배송·제주 추가비 모두 배송지별)
export const 곳별금액 = (곳들, products, 방식 = 'split') => (곳들 ?? []).map((곳) => calcOrderTotals(곳의줄(곳, products, 방식), 0, { ...곳, country_code: 'KR' }));

// 줄마다 아직 안 나눈 수량(주문 수량 − 배송지에 담은 합) — 나눠 보내기에서만 쓴다
export const 남은수량 = (곳들, products) => (products ?? []).map((p, i) =>
  (Number(p?.order_count) || 0) - (곳들 ?? []).reduce((s, 곳) => s + (Number(곳?.수량?.[i]) || 0), 0));

// 배송지 칸을 다 썼나(받는 분·연락처·주소) — 「입력 완료」 단추를 보일지. 접는 것은 손님이 정한다(곳.접음)
export const 곳완성 = (곳, isValidPhone) => !!String(곳?.receiver ?? '').trim() && isValidPhone(곳?.addr_phone)
  && !!String(곳?.addr ?? '').trim() && !!String(곳?.zonecode ?? '').trim();

// 결제 전 검사. 문제가 있으면 [손님에게 보일 문장(번역 키), 값, 자리]를, 없으면 null.
//   자리 — 주문서가 그곳으로 화면을 옮기고 펼친다(11/23: 결제수단을 누르면 맨 아래에 토스트만 떠서
//   위쪽 어느 배송지가 문제인지 찾아 올라가야 했다). { 남음: true } | { 곳: k, 칸: 'receiver'|'addr_phone'|'addr'|'items' }
export const 여러곳검사 = (곳들, products, isValidPhone, 방식 = 'split') => {
  if (!Array.isArray(곳들) || 곳들.length < 2) return ['배송지를 2곳 이상 입력해 주세요.', undefined, null];
  if (곳들.length > 최대곳) return ['배송지는 최대 {{n}}곳까지 입력할 수 있습니다.', { n: 최대곳 }, null];
  if (방식 !== 'same') {
    const 남음 = 남은수량(곳들, products);
    const i = 남음.findIndex((n) => n !== 0);
    if (i >= 0) return [남음[i] > 0 ? '「{{name}}」 {{n}}개를 아직 배송지에 나누지 않았습니다.' : '「{{name}}」을(를) 주문 수량보다 많이 나눴습니다.',
      { name: products[i]?.product_name ?? '', n: Math.abs(남음[i]) }, { 남음: true }];
  }
  for (let k = 0; k < 곳들.length; k++) {
    const 곳 = 곳들[k];
    if (!String(곳.receiver ?? '').trim()) return ['{{n}}번째 배송지의 받는 분을 입력해 주세요.', { n: k + 1 }, { 곳: k, 칸: 'receiver' }];
    if (!isValidPhone(곳.addr_phone)) return ['{{n}}번째 배송지의 연락처를 정확히 입력해 주세요.', { n: k + 1 }, { 곳: k, 칸: 'addr_phone' }];
    if (!String(곳.addr ?? '').trim() || !String(곳.zonecode ?? '').trim()) return ['{{n}}번째 배송지의 주소를 입력해 주세요.', { n: k + 1 }, { 곳: k, 칸: 'addr' }];
    const 줄 = 곳의줄(곳, products, 방식);
    if (!줄.length) return ['{{n}}번째 배송지에 보낼 상품을 담아 주세요.', { n: k + 1 }, { 곳: k, 칸: 'items' }];
    // 추가상품은 본상품 없이 못 산다 — 배송지마다 같은 규칙(서버도 배송지마다 본다)
    if (줄.some((p) => isAddonLine(p) && !줄.some((m) => !isAddonLine(m) && m?.id == p?.id))) {
      return ['{{n}}번째 배송지: 추가상품은 본상품과 같은 곳으로 보내 주세요.', { n: k + 1 }, { 곳: k, 칸: 'items' }];
    }
  }
  return null;
};

// 나눠 보내기 수량 바꾸기(11/23 다시 짬). 배송지 1 이 「아직 다른 곳으로 안 옮긴 것」을 들고 있는 기본 자리다
// (나눠보내기를 고르면 전부 배송지 1 에 담긴다).
//   다른 배송지에서 늘리면 → 아직 안 나눈 수량에서 먼저, 모자라면 배송지 1 에서 옮겨 온다.
//   다른 배송지에서 줄이면 → 배송지 1 로 돌려놓는다(안 나눈 수량이 생기지 않게).
//   배송지 1 에서 늘리면 → 아직 안 나눈 수량에서만. 줄이면 → 안 나눈 수량으로 남고 노란 안내가 뜬다(어디로 보낼지는 손님이 정한다).
// 예전엔 배송지 2 의 「+」가 막혀 있어(남은 수량 0) 배송지 1 에서 먼저 빼야 한다는 걸 손님이 알아야 했다.
// 숫자 칸에 바로 적어도 같은 규칙이고, 옮길 수 있는 만큼까지만 들어간다.
export const 수량옮기기 = (곳들, products, k, i, v) => {
  const 남음 = 남은수량(곳들, products);
  const 지금 = Number(곳들[k]?.수량?.[i]) || 0;
  const 첫 = Number(곳들[0]?.수량?.[i]) || 0;
  const 안나눔 = Math.max(0, 남음[i]);
  const 최대 = 지금 + 안나눔 + (k > 0 ? 첫 : 0);
  const n = Math.max(0, Math.min(최대, Number(String(v).replace(/[^0-9]/g, '')) || 0));
  const 차 = n - 지금;
  let 첫새 = 첫;
  if (k > 0 && 차 > 0) 첫새 = 첫 - Math.max(0, 차 - 안나눔);
  if (k > 0 && 차 < 0) 첫새 = 첫 - 차;
  return (곳들 ?? []).map((곳, j) => {
    if (j === k) return { ...곳, 수량: { ...곳.수량, [i]: n } };
    if (j === 0 && 첫새 !== 첫) return { ...곳, 수량: { ...곳.수량, [i]: 첫새 } };
    return 곳;
  });
};
// 이 배송지에서 「+」를 누를 수 있나(옮겨 올 것이 있나)
export const 더담기가능 = (곳들, products, k, i) => {
  const 남음 = 남은수량(곳들, products);
  return Math.max(0, 남음[i]) + (k > 0 ? (Number(곳들[0]?.수량?.[i]) || 0) : 0) > 0;
};
// 위 상품 목록에서 수량만 바꾸면 그 차이를 배송지 1 에서 더하고 뺀다(주문서 OrderSheet 가 부른다).
//   늘면 배송지 1 에 더한다. 줄면 배송지 1 에서 먼저 빼고, 모자라면 뒤 배송지부터 뺀다(손님이 마지막에 나눈 곳부터).
export const 주문수량반영 = (곳들, 전수량, 새수량) => (새수량 ?? []).reduce((acc, n, i) => {
  const 차 = (Number(n) || 0) - (Number(전수량?.[i]) || 0);
  if (!차) return acc;
  const 수 = acc.map((곳) => Number(곳?.수량?.[i]) || 0);
  if (차 > 0) 수[0] += 차;
  else {
    let 뺄 = -차;
    for (const k of [0, ...수.map((_, j) => 수.length - 1 - j).filter((j) => j > 0)]) {
      const 빼기 = Math.min(뺄, 수[k]);
      수[k] -= 빼기; 뺄 -= 빼기;
      if (!뺄) break;
    }
  }
  return acc.map((곳, k) => ({ ...곳, 수량: { ...(곳?.수량 ?? {}), [i]: 수[k] } }));
}, 곳들 ?? []);
// 배송지를 지우면 그곳에 나눠 둔 수량은 배송지 1 로 돌려놓는다(지운 곳 몫이 「안 나눈 수량」으로 떠돌지 않게)
export const 배송지빼기 = (곳들, products, k) => {
  const 남길 = (곳들 ?? []).filter((_, j) => j !== k);
  if (!남길.length) return 남길;
  const 뺀 = 곳들[k]?.수량 ?? {};
  if (!Object.values(뺀).some((n) => Number(n) > 0)) return 남길;
  남길[0] = { ...남길[0], 수량: Object.fromEntries((products ?? []).map((_, i) => [i, (Number(남길[0]?.수량?.[i]) || 0) + (Number(뺀[i]) || 0)])) };
  return 남길;
};

// 줄 이름 — 상품명 · 고른 옵션. 추가상품 표시는 화면 언어로(t = translate).
//   상품명도 화면 언어로(장바구니 CheckoutCartProduct 와 같은 formatLang, 2026-11-22) — 외국어 화면에서 이 칸만 한국어였다.
const 줄이름 = (p, t = (x) => x, lang) => {
  const 옵션 = (p?.groups ?? []).flatMap((g) => (g?.options ?? []).map(getOptionLabel)).filter(Boolean).join(' / ');
  return `${formatLang(p, 'product_name', lang) ?? p?.product_name ?? ''}${isAddonLine(p) ? ` (${t('추가상품')})` : ''}${옵션 ? ` · ${옵션}` : ''}`;
};

export default function MultiShipEditor({ products, 곳들, set곳들, 방식, set방식, on우편번호, isValidPhone, addressList = [] }) {
  const { translate, currentLang } = useLocales();
  const 원 = (v) => commarNumberWithUnit(v, currentLang?.value);
  const 금액 = 곳별금액(곳들, products, 방식);
  const 남음 = 남은수량(곳들, products);
  const [주소록대상, set주소록대상] = useState(null);
  const 고치기 = (k, 바꿀) => set곳들(곳들.map((곳, i) => (i === k ? { ...곳, ...바꿀 } : 곳)));
  // 접기·펴기는 손님이 누를 때만(「입력 완료」·「수정」·「배송지 추가」). 칸이 다 찼다고 저절로 접지 않는다.
  const 접기 = (k) => 고치기(k, { 접음: true });
  const 펴기 = (k) => 고치기(k, { 접음: false });
  const 수량바꾸기 = (k, i, v) => set곳들(수량옮기기(곳들, products, k, i, v));
  // 나눠 보내기에서 지우면 그 곳 수량은 배송지 1 로(같은 상품 보내기는 수량을 안 쓴다)
  const 지우기 = (k) => set곳들(방식 === 'split' ? 배송지빼기(곳들, products, k) : 곳들.filter((_, j) => j !== k));
  const 담은개수 = products.reduce((s, p) => s + (Number(p?.order_count) || 0), 0);
  // 1개만 담았으면 나눌 것이 없다(사장님 11/20) — 나눠 보내기 단추를 막고, 나눠 보내기 중에 1개가 되면 같은 상품 보내기로 돌린다
  const 나눔가능 = 담은개수 >= 2;
  useEffect(() => { if (!나눔가능 && 방식 === 'split') set방식('same'); }, [나눔가능, 방식]);
  // 배송비 규칙을 이 몰의 실제 금액으로 적는다
  const 정책 = 배송정책();
  const 배송비글 = !정책.active
    ? translate('배송비는 배송지마다 따로 계산됩니다.')
    : 정책.freeMin > 0
      ? translate('배송비는 배송지마다 {{fee}}이고, 한 곳에 {{min}} 이상 보내면 그 곳은 무료입니다.', { fee: 원(정책.base), min: 원(정책.freeMin) })
      : translate('배송비는 배송지마다 {{fee}}입니다.', { fee: 원(정책.base) });
  const 섬글 = 섬안내문(currentLang?.value);
  const 국내주소록 = (addressList ?? []).filter((a) => !a?.country_code || String(a.country_code).toUpperCase() === 'KR');

  return (
    <Stack spacing={2}>
      {/* 두 탭 사이를 살짝 띄운다(사장님 11/21). MUI 기본은 둘째 단추를 왼쪽으로 1px 당겨 붙이고,
          고르지 않은 단추는 테두리가 없어 글자와 고른 탭이 붙어 보였다 — 탭마다 옅은 테두리를 두고 8px 띄운다. */}
      <ToggleButtonGroup exclusive size="small" value={방식}
        sx={{
          flexWrap: 'wrap',
          '& .MuiToggleButtonGroup-grouped': { border: '1px solid', borderColor: (t) => `${t.palette.divider} !important`, px: 1.5 },
          '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': { ml: 1, borderLeft: '1px solid' },
          // 고르지 않은 단추도 진한 글자로 — 옅은 회색이라 막힌 단추와 똑같이 꺼져 보였다(11/23 포스몰).
          //   고른 단추는 진한 테두리, 막힌 단추는 점선 테두리로 셋을 가른다.
          '& .MuiToggleButtonGroup-grouped:not(.Mui-selected):not(.Mui-disabled)': { color: 'text.primary' },
          '& .MuiToggleButtonGroup-grouped.Mui-selected': { borderColor: (t) => `${t.palette.text.primary} !important` },
          '& .MuiToggleButtonGroup-grouped.Mui-disabled': { borderStyle: 'dashed' },
        }}
        onChange={(e, v) => {
          if (!v || v === 방식) return;
          // 나눠 보내기로 바꿀 때 아직 나눈 적이 없으면 모두 1번 배송지에 담아 둔다
          if (v === 'split' && 남음.every((n, i) => n === (Number(products[i]?.order_count) || 0))) {
            set곳들(곳들.map((곳, k) => ({ ...곳, 수량: k === 0 ? Object.fromEntries(products.map((p, i) => [i, Number(p?.order_count) || 0])) : {} })));
          }
          set방식(v);
        }}>
        {/* 나눠보내기를 앞에(사장님 11/21). 기본 선택은 그대로 묶어보내기(same). 단추 이름은 11/21 팀장 통화로 정함. */}
        <ToggleButton value="split" disabled={!나눔가능}>{translate('주문 상품 나눠보내기')}</ToggleButton>
        <ToggleButton value="same">{translate('주문 상품 묶어보내기')}</ToggleButton>
      </ToggleButtonGroup>
      {/* 1개만 담고 배송지를 2곳으로 하면 오른쪽 요약이 「상품금액 · 2개」(묶어보내기는 배송지 수만큼 곱한다)라
          2개 이상인데 왜 막혔는지 알 수 없었다(11/23 포스몰) — 담은 수량 기준이라는 것과 푸는 방법을 적는다. */}
      {!나눔가능 && (
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: -1.25, wordBreak: 'keep-all' }}>
          {translate('주문 상품 나눠보내기')}: {translate('담은 수량이 1개라 나눠 보낼 수 없습니다. 위 상품 목록에서 수량을 2개 이상으로 늘리면 쓸 수 있습니다.')}
        </Typography>
      )}
      <Box>
        <Typography variant="body2" sx={{ wordBreak: 'keep-all' }}>
          {방식 === 'same'
            ? translate('위에 담은 상품({{count}}개)을 받는 분마다 똑같이 보냅니다. 배송지 {{n}}곳이면 {{total}}개를 결제합니다.', { count: 담은개수, n: 곳들.length, total: 담은개수 * 곳들.length })
            : translate('위에 담은 상품({{count}}개)을 배송지에 나눠 보냅니다. 배송지마다 보낼 수량을 정해 주세요.', { count: 담은개수 })}
        </Typography>
        {/* 나눠 보내기가 어떻게 움직이는지 한 줄로(11/23) — 「+」가 어디서 가져오는지 몰라 배송지 1 에서 먼저 빼야 하나 헤맸다 */}
        {방식 === 'split' && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, wordBreak: 'keep-all' }}>
            {translate('처음엔 모두 배송지 1에 담겨 있습니다. 다른 배송지에서 +를 누르면 배송지 1에서 하나씩 옮겨 오고, −를 누르면 배송지 1로 돌아갑니다.')}
          </Typography>
        )}
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, wordBreak: 'keep-all' }}>
          {배송비글}{섬글 ? ` ${섬글}` : ''}
        </Typography>
      </Box>

      {/* 나눠 보내기: 아직 나누지 않은 수량 — 0 이 아니면 결제할 수 없다.
          「똑같이 나누기」 단추는 뺐다(11/23 사장님). 남는 개수가 상품마다 늘 1번 배송지로 가서 상품이 여러 종류면
          뒤 배송지가 비거나(1개씩 3종류 → 3곳이면 3/0/0) 추가상품만 따로 가 결제가 막혔다. 다른 곳(우커머스·쇼피파이 앱 등)도
          손님이 배송지마다 수량을 직접 정한다 — 나눠보내기를 고르는 손님은 어디로 몇 개 보낼지 이미 정해 둔 경우가 대부분이다. */}
      {방식 === 'split' && (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          {남음.some((n) => n !== 0) && (
            <Box id="multi-split-remain" sx={{ p: 1, borderRadius: 1, bgcolor: 'warning.lighter', flexGrow: 1, scrollMarginTop: 160 }}>
              {products.map((p, i) => 남음[i] !== 0 && (
                <Typography key={i} variant="body2" sx={{ color: 'warning.darker' }}>
                  {남음[i] > 0
                    ? translate('「{{name}}」 {{n}}개를 아직 배송지에 나누지 않았습니다.', { name: 줄이름(p, translate, currentLang), n: 남음[i] })
                    : translate('「{{name}}」을(를) 주문 수량보다 많이 나눴습니다.', { name: 줄이름(p, translate, currentLang) })}
                </Typography>
              ))}
            </Box>
          )}
        </Stack>
      )}

      {곳들.map((곳, k) => {
        const 줄 = 곳의줄(곳, products, 방식);
        const 개수 = 줄.reduce((s, p) => s + p.order_count, 0);
        const 배송비말 = `${금액[k].delivery > 0 ? `${translate('배송비')} ${원(금액[k].delivery)}` : translate('배송비 무료')}`
          + (Number(금액[k].island?.fee) > 0 ? ` + ${translate(금액[k].island.region === 'jeju' ? '제주 추가배송비' : '도서산간 추가배송비')} ${원(금액[k].island.fee)}` : '');
        const 막힘 = 금액[k].island?.blocked;
        // 손님이 접은 배송지는 한 줄로 보인다(그사이 칸이 비면 다시 편다)
        if (곳.접음 && 곳완성(곳, isValidPhone)) {
          return (
            <Paper key={곳.키} id={`multi-dest-${k}`} variant="outlined" sx={{ p: 1.5, scrollMarginTop: 160, ...(막힘 || (방식 === 'split' && !개수) ? { borderColor: 'error.main' } : {}) }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ wordBreak: 'keep-all' }}>{k + 1}. {곳.receiver} <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>{곳.addr_phone}</Box></Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'keep-all' }}>{곳.addr} {곳.detail_addr}</Typography>
                  <Typography variant="caption" sx={{ color: 막힘 || !개수 ? 'error.main' : 'text.secondary' }}>
                    {막힘 ? translate('이 지역으로는 배송하지 않습니다.')
                      : `${translate('상품 {{n}}개', { n: 개수 })} · ${배송비말} · ${translate('결제금액')} ${원(금액[k].amount)}`}
                  </Typography>
                </Box>
                <Button size="small" onClick={() => 펴기(k)}>{translate('수정')}</Button>
                {곳들.length > 2 && (
                  <IconButton size="small" aria-label={translate('이 배송지 삭제')} onClick={() => 지우기(k)}>
                    <Iconify icon="eva:trash-2-outline" />
                  </IconButton>
                )}
              </Stack>
            </Paper>
          );
        }
        return (
          <Paper key={곳.키} id={`multi-dest-${k}`} variant="outlined" sx={{ p: 2, borderColor: 'primary.main', scrollMarginTop: 160 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2">{translate('배송지 {{n}}', { n: k + 1 })}</Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {국내주소록.length > 0 && (
                    <Button size="small" variant="soft" startIcon={<Iconify icon="eva:list-fill" />} onClick={() => set주소록대상(k)}>{translate('주소록에서 선택')}</Button>
                  )}
                  {곳들.length > 2 && (
                    <IconButton size="small" aria-label={translate('이 배송지 삭제')} onClick={() => 지우기(k)}>
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>
                  )}
                </Stack>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField fullWidth size="small" id={`multi-receiver-${k}`} label={translate('받는 사람')} value={곳.receiver} inputProps={{ maxLength: 이름최대 }}
                  onChange={(e) => 고치기(k, { receiver: e.target.value })} />
                <TextField fullWidth size="small" id={`multi-addr_phone-${k}`} label={translate('연락처')} value={곳.addr_phone} inputMode="tel" placeholder="010-1234-5678"
                  error={!!곳.addr_phone && !isValidPhone(곳.addr_phone)}
                  onChange={(e) => 고치기(k, { addr_phone: sanitizePhoneInput(e.target.value) })} />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField size="small" label={translate('우편번호')} value={곳.zonecode} InputProps={{ readOnly: true }} sx={{ width: 140 }} />
                <Button id={`multi-addr-${k}`} variant="outlined" sx={{ height: 40 }} onClick={() => on우편번호(k)}>{translate('우편번호 검색')}</Button>
              </Stack>
              <TextField fullWidth size="small" label={translate('주소')} value={곳.addr} InputProps={{ readOnly: true }} placeholder={translate('우편번호 검색으로 입력')} />
              {/* id — 우편번호 검색이 끝나면 주문서가 이 칸으로 커서를 옮긴다(OrderSheet onCompletePost) */}
              <TextField fullWidth size="small" id={`multi-detail-addr-${k}`} label={translate('상세주소')} value={곳.detail_addr}
                onChange={(e) => 고치기(k, { detail_addr: e.target.value })} />
              <TextField fullWidth size="small" label={translate('배송 요청사항 (선택)')} value={곳.delivery_memo} inputProps={{ maxLength: 200 }}
                onChange={(e) => 고치기(k, { delivery_memo: e.target.value })} />
              {/* 나눠 보내기: 이 곳에 보낼 상품과 수량 */}
              {방식 === 'split' && (
                <Box id={`multi-items-${k}`} sx={{ borderTop: '1px dashed', borderColor: 'divider', pt: 1.25 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{translate('이 곳에 보낼 상품')}</Typography>
                  <Stack spacing={0.75} sx={{ mt: 0.75 }}>
                    {products.map((p, i) => {
                      const 지금 = Number(곳.수량?.[i]) || 0;
                      return (
                        <Stack key={i} direction="row" alignItems="center" spacing={0.5} sx={{ ...(isAddonLine(p) ? { pl: 1.5 } : {}) }}>
                          <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0, wordBreak: 'keep-all', color: 지금 ? 'text.primary' : 'text.secondary' }}>{줄이름(p, translate, currentLang)}</Typography>
                          <IconButton size="small" disabled={지금 <= 0} onClick={() => 수량바꾸기(k, i, 지금 - 1)} aria-label={translate('빼기')}><Iconify icon="eva:minus-fill" /></IconButton>
                          {/* 숫자를 바로 칠 수 있다 — 30개를 +로 서른 번 누르게 하지 않는다 */}
                          <TextField size="small" value={지금} onChange={(e) => 수량바꾸기(k, i, e.target.value)}
                            inputProps={{ inputMode: 'numeric', 'aria-label': translate('수량'), style: { textAlign: 'center', padding: '4px 0', width: 44 } }} />
                          <IconButton size="small" disabled={!더담기가능(곳들, products, k, i)} onClick={() => 수량바꾸기(k, i, 지금 + 1)} aria-label={translate('더하기')}><Iconify icon="eva:plus-fill" /></IconButton>
                        </Stack>
                      );
                    })}
                  </Stack>
                </Box>
              )}
              {막힘 ? (
                <Typography variant="caption" sx={{ color: 'error.main' }}>
                  {translate(금액[k].island.region === 'jeju' ? '이 쇼핑몰은 제주 지역으로 배송하지 않습니다. 다른 주소를 선택해 주세요.' : '이 쇼핑몰은 도서산간 지역으로 배송하지 않습니다. 다른 주소를 선택해 주세요.')}
                </Typography>
              ) : 줄.length > 0 && (
                <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'right' }}>
                  {translate('상품 {{n}}개', { n: 개수 })} · {배송비말} · {translate('결제금액')} {원(금액[k].amount)}
                </Typography>
              )}
              {곳완성(곳, isValidPhone) && (
                <Button size="small" variant="outlined" sx={{ alignSelf: 'flex-end' }} onClick={() => 접기(k)}>{translate('입력 완료')}</Button>
              )}
            </Stack>
          </Paper>
        );
      })}
      {곳들.length < 최대곳 && (
        <Button variant="soft" startIcon={<Iconify icon="eva:plus-fill" />} sx={{ alignSelf: 'flex-start' }}
          onClick={() => {
            // 새 배송지로 넘어가면 다 쓴 배송지는 접는다(덜 쓴 곳은 펼친 채로 둔다) — 한 번에 바꾼다(두 번 부르면 앞의 것이 덮인다)
            set곳들([...곳들.map((곳) => (곳완성(곳, isValidPhone) ? { ...곳, 접음: true } : 곳)), 빈곳()]);
          }}>
          {translate('배송지 추가 ({{n}}/{{max}})', { n: 곳들.length, max: 최대곳 })}
        </Button>
      )}

      {/* 회원 주소록에서 고르기 — 10곳을 다 타이핑하게 하지 않는다 */}
      <Dialog open={주소록대상 !== null} onClose={() => set주소록대상(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{translate('주소록에서 선택')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            {국내주소록.map((a, i) => (
              <Paper key={a?.id ?? i} variant="outlined" sx={{ p: 1.5, cursor: 'pointer' }}
                onClick={() => {
                  고치기(주소록대상, { receiver: a?.receiver || '', addr_phone: a?.phone || '', zonecode: a?.zonecode || '', addr: a?.addr || '', detail_addr: a?.detail_addr || '' });
                  set주소록대상(null);
                }}>
                <Typography variant="subtitle2">{a?.receiver || a?.addr}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'keep-all' }}>{a?.addr} {a?.detail_addr}</Typography>
                {a?.phone && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{a.phone}</Typography>}
              </Paper>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

// 「빈곳」을 OrderSheet 가 쓸 일은 없지만 검사에서 모양을 확인하려고 내보낸다
export { 빈곳 };
