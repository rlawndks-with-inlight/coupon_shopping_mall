import {
  Box, Button, Card, CardContent, CardHeader, Checkbox, CircularProgress,
  Dialog, Divider, FormControlLabel, Grid, MenuItem, Paper, Stack, TextField,
  ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Cards from 'react-credit-cards';
import Payment from 'payment';
import { Title, postCodeStyle } from 'src/components/elements/styled-components';
import { CheckoutCartProductList, CheckoutSummary } from 'src/views/@dashboard/e-commerce/checkout';
import Label from 'src/components/label/Label';
import EmptyContent from 'src/components/empty-content/EmptyContent';
import Iconify from 'src/components/iconify/Iconify';
import { useSettingsContext } from 'src/components/settings';
import { calcOrderTotals, calculatorPrice, getCartDataUtil, makePayData, onPayProductsByAuth, onPayProductsByHand, onPayProductsByPayletter, onPayProductsByForspay } from 'src/utils/shop-util';
import { syncCartWithServer, makeUnavailableMessage, filterUnavailableByProducts } from 'src/utils/cart-sync';
import { forspayMethodList } from 'src/utils/format';
import { sanitizePhoneInput, isValidPhoneNumber, makeOrdNum } from 'src/utils/function';
import { KOREA_CODE, OVERSEAS_CODE, formatOverseasAddress, isDomestic } from 'src/data/countries';
import Policy from 'src/pages/shop/auth/policy';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { formatCreditCardNumber, formatExpirationDate } from 'src/utils/formatCard';
import { useModal } from 'src/components/dialog/ModalProvider';
import { apiManager, getLastApiError } from 'src/utils/api';
import DialogAddAddress from 'src/components/dialog/DialogAddAddress';
import DaumPostcode from 'react-daum-postcode';
import { useLocales } from 'src/locales';
import PayProductsByAuthHecto from 'src/utils/hecto-auth';
import PayProductsByPhoneHecto from 'src/utils/hecto-phone';
import PayProductsByAuthFintree from 'src/utils/fintree-auth';
import PayProductsByHandFintree from 'src/utils/fintree-hand';
import PayProductsByAuthWayup from 'src/utils/wayup-auth';

const Wrappers = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  width: 92%;
  min-height: 80vh;
  margin-bottom: 8vh;
`;

// 공용 주문서(주문/결제) — 단일 페이지. demo-9 카트의 결제 로직을 그대로 이식하되
// 스텝퍼가 아니라 모든 섹션(주문상품·주문자·배송지·결제수단·약관·요약)을 한 화면에 표시한다.
// 결제모듈(payment_modules)에 설정된 수단만 노출. 가짜 sms_pay는 이식 대상에서 제외.
// 비회원 주문 비밀번호 길이. DB transactions.password 컬럼 크기와 함께 관리한다.
// (마이그레이션 2026-08-07_widen_transactions_password.sql 로 컬럼을 넓혔다)
const GUEST_PW_MIN = 6;
const GUEST_PW_MAX = 16;

// 서버(pay.controller)가 금액 불일치로 거절할 때 돌려주는 문구의 앞부분.
// "결제금액이 변경되었습니다. 주문서를 새로고침한 뒤 다시 시도해 주세요."
// 이 경우에만 낡은 장바구니 값을 다시 받아온다 — 네트워크 오류·데모 호스트 차단 등
// 금액과 무관한 실패까지 재동기화를 돌리면, 원인과 상관없는 안내가 하나 더 뜨고
// 고객은 무엇을 고쳐야 하는지 더 헷갈린다.
const AMOUNT_MISMATCH_HINT = '결제금액이 변경';

export default function OrderSheet({ router }) {
  const { setModal } = useModal();
  // 주문서는 다국어를 전혀 거치지 않았다 — 결제 직전 화면인데 라벨이 전부 한국어였다.
  const { translate } = useLocales();
  // ⚠ 배송 방식은 country_code 로 판정하면 안 된다.
  //    isDomestic('') 는 true 다(빈 값을 KR 로 보정). 해외를 고르면 country_code 를 비우는데
  //    그게 다시 '국내'로 읽혀 토글이 즉시 되돌아왔다 — 눌리지 않는 것처럼 보였다.
  //    '아직 국가를 안 고름('')' 과 '국내(KR)' 는 다른 상태다.
  const [addrMode, setAddrMode] = useState('KR'); // 'KR' | 'OVERSEAS'
  const isKR = addrMode === 'KR';
  const { user } = useAuthContext();
  const { themeCartData, onChangeCartData, themeDnsData } = useSettingsContext();
  const setting_obj = themeDnsData?.setting_obj || {};
  const { max_use_point = 0, point_rate = 0, use_point_min_price = 0 } = setting_obj;

  const [products, setProducts] = useState([]);
  // 서버 동기화가 알려준 '구매할 수 없는 상품' 목록(원본).
  // 이 값을 그대로 결제 차단에 쓰면 안 된다 — 아래 unavailable 참고.
  const [unavailableRaw, setUnavailableRaw] = useState([]);
  // 실제로 결제를 막는 목록 — '지금 주문서에 남아 있는 라인'만 남긴다.
  //
  // 예전엔 동기화 때 만든 목록을 state 에 그대로 들고 결제를 막았다. 안내를 보고
  // 문제 상품을 지워도 그 목록은 다시 계산되지 않아 차단이 영영 풀리지 않았다
  // (지웠는데 계속 "구매할 수 없는 상품" 이라며 막히는 막다른 길).
  // products 에서 파생시키면 라인을 지우는 순간 자동으로 사라진다.
  const unavailable = useMemo(
    () => filterUnavailableByProducts(unavailableRaw, products),
    [unavailableRaw, products]
  );

  const [buyType, setBuyType] = useState(undefined);
  const [buyPayMethod, setBuyPayMethod] = useState(undefined); // 포스페이 수단별 선택 표시용(같은 type 구분)
  const [payLoading, setPayLoading] = useState(false);

  // 배송지(주소록)
  const [addressContent, setAddressContent] = useState({});
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [updateAddressOpen, setUpdatedAddressOpen] = useState(false);
  const [addressID, setAddressID] = useState();
  const [selectedAddrId, setSelectedAddrId] = useState(undefined);
  const [directMode, setDirectMode] = useState(false); // 직접 입력(비회원/신규 배송지)
  const [postOpen, setPostOpen] = useState(false);     // 우편번호 검색 팝업
  const [addressSearchObj, setAddressSearchObj] = useState({
    page: 1, page_size: 10, search: '', user_id: user?.id,
  });

  // 결제 동의 — 전자상거래법상 필수 2종을 개별 항목으로 받는다.
  // (기존엔 '모두 동의' 체크박스 1개에 약관 본문이 연결되지 않은 자리표시자였다)
  // agree1: 이용약관 / agree2: 개인정보 수집·이용. 둘 다 있어야 결제가 진행된다.
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [openPolicy, setOpenPolicy] = useState(0); // 0=닫힘, 1=이용약관, 2=개인정보
  const agreeAll = agree1 && agree2;
  const toggleAgreeAll = (checked) => { setAgree1(checked); setAgree2(checked); };

  const [payData, setPayData] = useState({
    brand_id: themeDnsData?.id,
    user_id: user?.id ?? undefined,
    buyer_name: user?.name ?? user?.nickname ?? '',
    ord_num: '',
    installment: 0,
    buyer_phone: user?.phone_num ?? '',
    card_num: '',
    yymm: '',
    auth_num: '',
    card_pw: '',
    addr: '',
    detail_addr: '',
    password: '',
    use_point: 0,
  });

  useEffect(() => {
    getCart();
  }, []);

  // 동의를 해제하면 이미 펼쳐진 결제수단 영역을 닫는다.
  // 핀트리·헥토·웨이업 결제 컴포넌트는 자기 결제 버튼을 갖고 있어 guardBeforePay를 타지 않는다.
  // 그래서 '동의 → 결제수단 선택 → 동의 해제 → 자식 버튼 클릭'으로 동의 없이 결제가 가능했다.
  // buyType을 비우면 그 자식 컴포넌트 자체가 렌더되지 않으므로 우회 경로가 사라진다.
  useEffect(() => {
    if (!agreeAll && buyType) {
      setBuyType(undefined);
      setBuyPayMethod(undefined);
    }
  }, [agreeAll]);

  // 로그인 정보는 JwtContext가 비동기로 채운다(초기 user=null).
  // payData의 useState 초기값은 첫 렌더 1회만 계산되므로 그 시점엔 user가 없어
  // user_id·buyer_name·buyer_phone이 전부 비어 있는 채로 결제까지 갔다.
  // (회원 주문인데 user_id 없이 저장 → 주문내역에서 안 보이고, 휴대폰도 빈 값)
  // user가 도착하면 아직 사용자가 직접 고치지 않은 값만 채워 넣는다.
  useEffect(() => {
    if (!user?.id) return;
    setPayData((prev) => ({
      ...prev,
      user_id: prev.user_id ?? user?.id,
      buyer_name: prev.buyer_name || user?.name || user?.nickname || '',
      buyer_phone: prev.buyer_phone || sanitizePhoneInput(user?.phone_num ?? ''),
    }));
  }, [user?.id]);

  const isBuyNow = () => (typeof window !== 'undefined' && window.location.search.includes('buynow'));

  // 서버의 현재 상품정보로 주문 라인을 갱신한다.
  //
  // 장바구니는 '담을 때의 가격'을 localStorage 에 그대로 들고 있다. 그 사이 관리자가
  // 판매가·배송비·옵션 추가금액을 바꾸면, 결제 직전 서버 재계산(recalcOrderAmount)과
  // 값이 어긋나 "결제금액이 변경되었습니다. 주문서를 새로고침한 뒤 다시 시도해 주세요."로 거절된다.
  // 그런데 새로고침해도 같은 localStorage 를 다시 읽으니 낡은 값이 그대로 복원돼
  // 안내대로 해도 영원히 풀리지 않았다. 여기서 실제로 최신값을 받아 저장소까지 갱신한다.
  // (금액 계산식은 건드리지 않는다 — 계산에 들어가는 입력값만 최신으로 바꾼다)
  const runSync = async (items, changed_message) => {
    // 빈 주문서에서 저장소를 덮어쓰지 않는다(바로구매 항목을 날려버릴 수 있다).
    if (!Array.isArray(items) || items.length == 0) return items;
    const sync = await syncCartWithServer(items);
    if (sync.failed) return items; // 아무것도 확인하지 못했다 — 기존 값을 그대로 둔다
    setProducts(sync.items);
    // 조회에 실패한 라인은 sync.unavailable 에 들어오지 않는다(실패는 차단 사유가 아니다).
    setUnavailableRaw(sync.unavailable);
    if (isBuyNow()) {
      try { sessionStorage.setItem('buyNowItem', JSON.stringify(sync.items[0] ?? null)); } catch (e) { /* noop */ }
    } else {
      onChangeCartData(sync.items);
    }
    if (sync.unavailable.length > 0) {
      toast.error(makeUnavailableMessage(sync.unavailable));
    } else if (sync.priceChanged && changed_message) {
      toast(changed_message);
    }
    return sync.items;
  };

  // 결제가 거절된 뒤의 후처리.
  // 서버가 '금액 불일치'로 거절했을 때만 최신 금액을 다시 받아온다.
  // since 는 결제 시도 직전 시각 — 그 이후에 기록된 실패만 이번 결제의 사유로 인정한다.
  const resyncIfAmountMismatch = async (since, changed_message) => {
    const err = getLastApiError();
    if (!(err?.at >= since)) return;
    if (!String(err?.message || '').includes(AMOUNT_MISMATCH_HINT)) return;
    await runSync(products, changed_message);
  };

  const getCart = async () => {
    let items = [];
    if (isBuyNow()) {
      // 바로구매: sessionStorage의 단일 상품 사용(장바구니 무관)
      try {
        const raw = sessionStorage.getItem('buyNowItem');
        if (raw) items = [JSON.parse(raw)];
      } catch (e) { /* noop */ }
    } else {
      items = await getCartDataUtil(themeCartData);
    }
    setProducts(items);
    await runSync(items, translate("상품 가격이 변경되어 최신 금액으로 갱신했습니다."));
    onChangeAddressPage(addressSearchObj);
  };

  // ── 주문상품 수량/삭제 ──
  // 구매불가 안내를 보고 상품을 지우는 통로다. 여기서 저장소까지 같이 정리하지 않으면
  // 새로고침할 때 지운 상품이 되살아나 다시 결제가 막힌다.
  // 바로구매(?buynow)는 장바구니와 무관한 sessionStorage 를 쓴다 —
  // 예전엔 여기서도 onChangeCartData 를 불러, 바로구매 상품을 지우면
  // 엉뚱하게 고객의 진짜 장바구니가 비워졌다.
  const onDelete = (idx) => {
    const list = [...products];
    list.splice(idx, 1);
    if (isBuyNow()) {
      try {
        if (list.length > 0) sessionStorage.setItem('buyNowItem', JSON.stringify(list[0]));
        else sessionStorage.removeItem('buyNowItem');
      } catch (e) { /* noop */ }
    } else {
      onChangeCartData(list);
    }
    setProducts(list);
  };
  // 수량 변경도 저장소에 반영한다(onDelete 와 같은 분기).
  // 예전엔 setProducts 만 해서, 새로고침하거나 동기화가 한 번 돌면 바꾼 수량이
  // 원래대로 되돌아갔다. 요소는 in-place 대신 새 객체로 교체한다.
  const setQuantity = (idx, next) => {
    const count = Math.max(1, parseInt(next) || 1);
    const list = products.map((item, i) => (i == idx ? { ...item, order_count: count } : item));
    if (isBuyNow()) {
      try { sessionStorage.setItem('buyNowItem', JSON.stringify(list[0] ?? null)); } catch (e) { /* noop */ }
    } else {
      onChangeCartData(list);
    }
    setProducts(list);
  };
  const onDecreaseQuantity = (idx) => setQuantity(idx, (products[idx]?.order_count ?? 1) - 1);
  const onIncreaseQuantity = (idx) => setQuantity(idx, (products[idx]?.order_count ?? 1) + 1);
  const onChangeQuantity = (idx, val) => setQuantity(idx, val);

  // ── 배송지(주소록) ──
  const onChangeAddressPage = async (search_obj) => {
    setAddressContent({ ...addressContent, content: undefined });
    const data = await apiManager('user-addresses', 'list', search_obj);
    setAddressSearchObj(search_obj);
    if (data) setAddressContent(data);
  };
  const onSelectAddress = (item) => {
    setSelectedAddrId(item?.id);
    setPayData({
      ...payData,
      addr: item?.addr,
      detail_addr: item?.detail_addr,
      // 확장 필드(있으면 반영)
      receiver: item?.receiver ?? undefined,
      addr_phone: item?.phone ?? undefined,
      zonecode: item?.zonecode ?? undefined,
      // 국가 정보도 주문에 함께 남긴다 — 주소록 행은 나중에 바뀌거나 지워질 수 있다.
      country_code: item?.country_code || 'KR',
      country_name: item?.country_name ?? undefined,
      // 주소록에서 고른 배송지가 해외면 화면도 해외 모드로 맞춘다.
      city: item?.city ?? undefined,
      state_region: item?.state_region ?? undefined,
    });
    setAddrMode(isDomestic(item?.country_code) ? 'KR' : 'OVERSEAS');
  };
  const onAddAddress = async (address_obj) => {
    const result = await apiManager('user-addresses', (address_obj?.id > 0 ? 'update' : 'create'), { ...address_obj, user_id: user?.id });
    if (result) {
      setAddAddressOpen(false);
      onChangeAddressPage(addressSearchObj);
    }
  };
  const onDeleteAddress = async (id) => {
    const result = await apiManager('user-addresses', 'delete', { id });
    if (result) onChangeAddressPage(addressSearchObj);
  };
  const onUpdateAddress = (id) => {
    setAddressID(id);
    setUpdatedAddressOpen(true);
  };
  // 우편번호 검색 완료 → 주소/우편번호 반영(직접 입력 모드)
  const onCompletePost = (data) => {
    setPayData({ ...payData, zonecode: data?.zonecode, addr: data?.roadAddress || data?.address || '' });
    setPostOpen(false);
  };

  // ── 결제 진행 전 공통 검증(포인트·약관) ──
  const guardBeforePay = () => {
    // 이미 접수된 주문이 있으면 다른 결제수단으로 하나 더 만들지 못하게 막는다.
    //
    // 무통장입금·상품권결제는 '수단을 고르는 순간' 주문이 만들어지고 화면에 그대로 머문다.
    // 그 상태에서 카드결제나 포스페이를 누르면 두 번째 주문이 또 생성됐다 —
    // 같은 장바구니로 결제대기 주문이 두 건 쌓이고, 가맹점은 어느 것이 진짜인지 알 수 없다.
    // (수단별 중복 방지는 있었지만 '교차 수단' 차단이 없었다)
    if (Object.keys(createdOrderRef.current).length > 0) {
      toast.error(translate("이미 접수된 주문이 있습니다. 주문내역에서 확인해 주세요."));
      return false;
    }
    if (!agreeAll) {
      toast.error(translate("주문 내용 및 약관에 동의해 주세요."));
      return false;
    }
    // 어느 상품이 문제인지 이름으로 알려준다.
    // 예전엔 백엔드 하드블록이 "구매할 수 없는 상품이 포함되어 있습니다."만 돌려줘
    // 여러 건을 담은 고객은 무엇을 빼야 하는지 알 수 없었다.
    if (unavailable.length > 0) {
      toast.error(makeUnavailableMessage(unavailable));
      return false;
    }
    if (!payData.addr) {
      toast.error(translate("배송지를 선택하거나 입력해 주세요."));
      return false;
    }
    if (!user && !payData.password) {
      toast.error(translate("비회원 주문 비밀번호를 입력해 주세요."));
      return false;
    }
    if (!user && (payData.password.length < GUEST_PW_MIN || payData.password.length > GUEST_PW_MAX)) {
      // 자릿수를 문장 밖에서 이어붙이지 않고 i18next 보간에 맡긴다 —
      // 언어마다 숫자가 들어가는 자리가 다르다.
      toast.error(translate('비회원 주문 비밀번호는 {{min}}~{{max}}자로 입력해 주세요.', { min: GUEST_PW_MIN, max: GUEST_PW_MAX }));
      return false;
    }
    // 전화번호는 배송 연락·주문 확인의 유일한 수단이라 결제 전에 반드시 성립해야 한다.
    // 입력창에서 숫자·하이픈만 받도록 필터링하지만, 빈 값이나 자릿수 미달은 여기서 막는다.
    if (!isValidPhoneNumber(payData.buyer_phone)) {
      toast.error(translate("구매자 휴대폰번호를 정확히 입력해 주세요."));
      return false;
    }
    // 해외 연락처는 국가번호(+81 …)가 붙어 국내 자릿수 규칙에 안 맞는다 — 국내일 때만 형식을 본다.
    if (isKR && payData.addr_phone && !isValidPhoneNumber(payData.addr_phone)) {
      toast.error(translate("받는 분 연락처를 정확히 입력해 주세요."));
      return false;
    }
    // 주문자 이름은 주문 확인·배송·CS 의 기준값이다. 비회원은 이 값이 유일한 식별 수단인데
    // 검증이 없어 빈 이름으로 결제까지 갔다(백엔드도 비회원 비밀번호 길이만 봤다).
    if (!user && !String(payData.buyer_name ?? '').trim()) {
      toast.error(translate("주문자 이름을 입력해 주세요."));
      return false;
    }
    // 주소록을 쓰지 않고 직접 입력하는 경우, 받는 분 성함이 비면 송장을 쓸 수 없다.
    if (directMode && !String(payData.receiver ?? '').trim()) {
      toast.error(translate("받는 분 성함을 입력해 주세요."));
      return false;
    }
    // 주소 자체가 비어 있으면 배송이 불가능하다.
    // 국내는 우편번호 검색을 거쳐야 addr 이 채워지지만, 해외는 전부 직접 입력이라
    // 아무것도 안 쓰고도 결제까지 갈 수 있었다.
    if (directMode && !String(payData.addr ?? '').trim()) {
      toast.error(translate("배송지 주소를 입력해 주세요."));
      return false;
    }
    if (directMode && !isKR && !String(payData.country_name ?? '').trim()) {
      toast.error(translate("배송 국가를 입력해 주세요."));
      return false;
    }
    if (parseFloat(max_use_point) < parseFloat(payData.use_point || 0)) {
      toast.error(translate("최대사용가능 포인트를 초과하였습니다."));
      return false;
    }
    if (parseFloat(user?.point ?? 0) < parseFloat(payData.use_point || 0)) {
      toast.error(translate("보유포인트가 부족합니다."));
      return false;
    }
    return true;
  };

  // ── 결제수단 선택 (demo-9 selectPayType 이식, sms_pay 제외) ──
  // 무통장입금·상품권처럼 '선택하는 순간 주문이 만들어지는' 결제수단의 중복 생성 방지.
  // 결제수단 카드를 다시 누를 때마다 새 주문이 쌓이던 것을 막는다.
  const createdOrderRef = useRef({});

  // 주문이 만들어졌지만 아직 입금 전인 상태를 마무리한다.
  //
  // 예전엔 apiManager 호출로 끝나서 — 주문번호도 안 알려주고, 장바구니도 그대로고,
  // 어디로도 이동하지 않았다. 고객 입장에선 '접수됐다'는 신호가 전혀 없어
  // 카드를 다시 누르게 되고 그때마다 주문이 하나씩 더 생겼다.
  // 비회원은 주문번호를 못 받았으니 주문조회도 어려웠다.
  const finishPendingOrder = async (pay_data) => {
    if (typeof window !== 'undefined' && window.location.search.includes('buynow')) {
      try { sessionStorage.removeItem('buyNowItem'); } catch (e) { /* noop */ }
    } else {
      await onChangeCartData([]);
    }
    // 결제완료 화면 전달용 — 민감정보는 담지 않는다(수기결제 경로와 동일 규칙).
    const { card_num, card_pw, yymm, auth_num, pay_key, mid, tid, payment_modules, password, ...safe } = pay_data;
    try { sessionStorage.setItem('lastOrder', JSON.stringify(safe)); } catch (e) { /* noop */ }
    toast.success(translate("주문이 접수되었습니다. 입금 확인 후 처리됩니다."));
  };

  const selectPayType = async (item) => {
    if (!guardBeforePay()) return;
    setBuyPayMethod(item?.pay_method); // 클릭한 결제수단 기억(포스페이 수단별 하이라이트)
    if (item?.type == 'card') {
      setBuyType('card');
      setPayData({ ...payData, payment_modules: item });
    } else if (item?.type == 'certification') {
      // 예전엔 setPayLoading(true) 만 하고 되돌리지 않았다. 결제창은 새 창으로 뜨는데
      // 이 화면에는 전체화면 로딩 다이얼로그가 계속 떠 있어서, 결제를 마치거나 취소하고
      // 돌아와도 화면이 잠긴 채였다(백드롭 클릭 말고는 닫을 방법이 없다).
      setPayLoading(true);
      try {
        await onPayProductsByAuth(products.map((p) => ({ ...p })), { ...payData, payment_modules: item }, 'payvery');
      } finally {
        setPayLoading(false);
      }
    } else if (item?.type == 'card_fintree') {
      setBuyType('card_fintree');
      setPayData({ ...payData, payment_modules: item });
    } else if (item?.type == 'certification_fintree') {
      setBuyType('certification_fintree');
      setPayData({ ...payData, payment_modules: item });
    } else if (item?.type == 'virtual_account') {
      setBuyType('virtual_account');
      // 이미 만든 주문이 있으면 다시 만들지 않는다.
      // 예전엔 카드를 누를 때마다 pays/virtual 이 재실행돼 transactions 행이 계속 쌓였다.
      // 화면에 '접수됐다'는 신호가 없어 고객이 반복해서 누르기 쉬웠다.
      if (createdOrderRef.current.virtual_account) {
        setBuyType('virtual_account');
        return;
      }
      const module = _.find(themeDnsData?.payment_modules, { type: 'virtual_account' });
      // ⚠ 계좌 확인을 주문 생성보다 먼저 한다.
      //   예전엔 주문부터 만들고 나서 계좌가 없으면 '무통장입금을 준비중입니다...' 만 띄웠다.
      //   고객은 어디로 입금해야 할지 모르는데 장바구니는 비워졌고, 결제대기 주문만 쌓였다.
      //   입금할 곳이 없으면 주문 자체를 만들지 않는다.
      if (!(module?.virtual_acct_bank && module?.virtual_acct_name && module?.virtual_acct_num)) {
        toast.error(translate("무통장입금 계좌 정보가 등록되어 있지 않습니다. 판매자에게 문의해 주세요."));
        setBuyType(undefined);
        return;
      }
      // makePayData가 배열을 in-place 변형하므로 사본을 넘겨 화면 상태(products)를 보호한다.
      const pay_data = await makePayData(products.map((p) => ({ ...p })), payData);
      delete pay_data.payment_modules;
      const ord_num = makeOrdNum();
      pay_data.ord_num = ord_num;
      pay_data.item_name = pay_data?.products?.length > 1 ? `${pay_data?.products[0]?.order_name} 외 ${pay_data?.products?.length - 1}건` : (pay_data?.products[0]?.order_name || translate('상품'));
      if (module?.virtual_acct_url) {
        const link = module.virtual_acct_url + `?amount=${pay_data?.amount}`;
        const popup = window.open(link, '');
        if (popup) popup.location.href = link;
      }
      const started_at = Date.now();
      const created = await apiManager('pays/virtual', 'create', pay_data);
      if (created) {
        createdOrderRef.current.virtual_account = ord_num;
        await finishPendingOrder(pay_data);
      } else {
        // 금액검증 불일치로 거절됐을 때만 낡은 장바구니 값을 실제로 갱신한다.
        await resyncIfAmountMismatch(started_at, translate("가격이 변경되어 최신 금액으로 갱신했습니다. 금액을 확인하고 다시 시도해 주세요."));
      }
      setPayData(pay_data);
    } else if (item?.type == 'gift_certificate') {
      setBuyType('gift_certificate');
      if (createdOrderRef.current.gift_certificate) {
        setBuyType('gift_certificate');
        return;
      }
      const module = _.find(themeDnsData?.payment_modules, { type: 'gift_certificate' });
      // ⚠ 상품권결제 주소 확인을 주문 생성보다 먼저 한다.
      //   주소가 없으면 결제창도 안 열리고 이 화면에 안내도 없어서, 토스트 하나만 뜨고
      //   화면은 그대로인데 장바구니만 비워졌다(주문은 결제대기로 남는다).
      if (!module?.gift_certificate_url) {
        toast.error(translate("상품권결제 정보가 등록되어 있지 않습니다. 판매자에게 문의해 주세요."));
        setBuyType(undefined);
        return;
      }
      // makePayData가 배열을 in-place 변형하므로 사본을 넘겨 화면 상태(products)를 보호한다.
      const pay_data = await makePayData(products.map((p) => ({ ...p })), payData);
      delete pay_data.payment_modules;
      const ord_num = makeOrdNum();
      pay_data.ord_num = ord_num;
      pay_data.item_name = pay_data?.products?.length > 1 ? `${pay_data?.products[0]?.order_name} 외 ${pay_data?.products?.length - 1}건` : (pay_data?.products[0]?.order_name || translate('상품'));
      if (module?.gift_certificate_url) {
        const link = module.gift_certificate_url + `?amount=${pay_data?.amount}&name=${user?.name ?? ''}&phone_num=${user?.phone_num ?? ''}`;
        const popup = window.open(link, '');
        if (popup) popup.location.href = link;
      }
      const started_at = Date.now();
      const created_gift = await apiManager('pays/gift_certificate', 'create', pay_data);
      if (created_gift) {
        createdOrderRef.current.gift_certificate = ord_num;
        await finishPendingOrder(pay_data);
      } else {
        // 금액검증 불일치로 거절됐을 때만 낡은 장바구니 값을 실제로 갱신한다.
        await resyncIfAmountMismatch(started_at, translate("가격이 변경되어 최신 금액으로 갱신했습니다. 금액을 확인하고 다시 시도해 주세요."));
      }
      setPayData(pay_data);
    } else if (item?.type == 'certification_weroute') {
      setBuyType('certification_weroute');
      // payvery 와 같은 이유 — 로딩 다이얼로그를 반드시 되돌린다.
      setPayLoading(true);
      try {
        await onPayProductsByAuth(products.map((p) => ({ ...p })), { ...payData, payment_modules: item }, 'weroute');
      } finally {
        setPayLoading(false);
      }
    } else if (item?.type == 'card_hecto') {
      setBuyType('card_hecto');
      setPayData({ ...payData, payment_modules: item });
    } else if (item?.type == 'phone_hecto') {
      setBuyType('phone_hecto');
      setPayData({ ...payData, payment_modules: item });
    } else if (item?.type == 'certification_wayup') {
      setBuyType('certification_wayup');
      setPayData({ ...payData, payment_modules: item });
    } else if (item?.type == 'card_payletter') {
      setBuyType('card_payletter');
      setPayData({ ...payData, payment_modules: item }); // 선택만 — 결제는 하단 '결제하기' 버튼에서
    } else if (item?.type == 'auth_forspay') {
      setBuyType('auth_forspay');
      setPayData({ ...payData, payment_modules: item }); // 선택만 — 결제는 하단 '결제하기' 버튼에서
    }
  };

  // 리다이렉트형 결제(포스페이/페이레터): 수단 선택 후 '결제하기'를 눌러야 결제창으로 이동
  const onPaySelectedRedirect = async () => {
    if (!guardBeforePay()) return;
    setPayLoading(true);
    const started_at = Date.now();
    try {
      let result = false;
      if (buyType == 'auth_forspay') {
        result = await onPayProductsByForspay(products.map((p) => ({ ...p })), payData);
      } else if (buyType == 'card_payletter') {
        result = await onPayProductsByPayletter(products.map((p) => ({ ...p })), payData);
      }
      // 성공하면 결제창으로 이동한다. 실패 사유가 '금액이 바뀌었다'일 때만
      // 안내에 그치지 말고 실제로 최신 정보를 다시 받아 곧바로 재시도할 수 있게 한다.
      // (네트워크 오류·데모 미리보기 차단 등은 재동기화로 해결되지 않는다 — 사유 안내만 남긴다)
      if (!result) await resyncIfAmountMismatch(started_at, translate("가격이 변경되어 최신 금액으로 갱신했습니다. 금액을 확인하고 다시 결제해 주세요."));
    } finally {
      setPayLoading(false);
    }
  };

  // 수기 카드결제 확정
  const onPayByHand = async () => {
    if (buyType != 'card') return;
    if (!guardBeforePay()) return;
    if (!payData.card_num || !payData.yymm || String(payData.yymm).length < 5 || !payData.card_pw) {
      toast.error(translate("카드 정보를 정확히 입력해 주세요."));
      return;
    }
    setPayLoading(true);
    const started_at = Date.now();
    // makePayData가 배열을 in-place 변형하므로 사본을 넘겨 화면 상태(products)를 보호한다.
    const result = await onPayProductsByHand(products.map((p) => ({ ...p })), payData);
    setPayLoading(false);
    if (result) {
      // 바로구매면 buyNowItem만 정리(장바구니 유지), 일반 주문이면 장바구니 비움
      if (typeof window !== 'undefined' && window.location.search.includes('buynow')) {
        try { sessionStorage.removeItem('buyNowItem'); } catch (e) { /* noop */ }
      } else {
        await onChangeCartData([]);
      }
      // 결제완료 화면 전달용 — 카드번호/카드비번/만료일/주민번호/PG키 등 민감정보는 저장하지 않는다.
      const { card_num, card_pw, yymm, auth_num, pay_key, mid, tid, payment_modules, ...safe } = result;
      try { sessionStorage.setItem('lastOrder', JSON.stringify(safe)); } catch (e) { /* noop */ }
      toast.success(translate("주문이 완료되었습니다."));
      router.push('/shop/auth/order-complete');
    } else {
      // 서버 금액검증 불일치일 때만 낡은 장바구니 값을 실제로 갱신해 준다.
      // 카드 승인 거절·네트워크 오류는 재동기화 대상이 아니다(사유는 이미 안내됐다).
      await resyncIfAmountMismatch(started_at, translate("가격이 변경되어 최신 금액으로 갱신했습니다. 금액을 확인하고 다시 결제해 주세요."));
    }
  };

  // 화면에 보여줄 금액. 실제 청구(makePayData)와 같은 규칙으로 계산한다.
  // 예전엔 요약 카드가 자체 계산했고, 상품별 배송비가 포함된 합계에 브랜드 배송비를
  // 한 번 더 얹었다. 무료배송 판정 기준도 서로 달라서(화면 '상품가+배송비' / 청구 '상품가만')
  // 배송비 정책을 켠 브랜드에서 고객이 본 금액과 결제되는 금액이 어긋났다.
  const orderTotals = calcOrderTotals(products, payData?.use_point);

  const paymentModules = (themeDnsData?.payment_modules || []).filter((m) => m?.type != 'sms_pay');
  const addressList = addressContent?.content || [];
  const isMember = !!user;

  return (
    <>
      <Dialog open={payLoading} onClose={() => setPayLoading(false)}
        PaperProps={{ style: { background: 'transparent', overflow: 'hidden', boxShadow: 'none' } }}>
        <CircularProgress />
      </Dialog>
      <DialogAddAddress addAddressOpen={addAddressOpen} setAddAddressOpen={setAddAddressOpen} onAddAddress={onAddAddress} />
      <DialogAddAddress addAddressOpen={updateAddressOpen} setAddAddressOpen={setUpdatedAddressOpen}
        onAddAddress={onAddAddress} type={'update'} id={addressID} onDeleteAddress={onDeleteAddress} />
      <Dialog open={postOpen} onClose={() => setPostOpen(false)}
        fullScreen={typeof window !== 'undefined' && window.innerWidth < 700}
        PaperProps={{ style: { width: typeof window !== 'undefined' && window.innerWidth >= 700 ? '600px' : '100%', maxWidth: '100%' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25, borderBottom: '1px solid #eee' }}>
          <Box sx={{ fontWeight: 700 }}>{translate('우편번호 검색')}</Box>
          <Button size="small" color="inherit" onClick={() => setPostOpen(false)}>{translate('닫기')}</Button>
        </Box>
        <DaumPostcode style={postCodeStyle} onComplete={onCompletePost} />
      </Dialog>

      <Wrappers>
        <Title style={{ marginBottom: '1.5rem' }}>{translate('주문 / 결제')}</Title>
        {products.length == 0 ? (
          <Card sx={{ p: 2 }}>
            <EmptyContent title={translate('주문할 상품이 없습니다.')} description={translate("장바구니에 상품을 담아 주세요.")}
              img="/assets/illustrations/illustration_empty_cart.svg" />
          </Card>
        ) : (
          <Grid container spacing={3}>
            {/* ── 좌: 주문 정보 ── */}
            <Grid item xs={12} md={8}>
              {/* 주문상품 */}
              <Card sx={{ mb: 3 }}>
                <CardHeader title={translate('주문 상품')} />
                {unavailable.length > 0 && (
                  // 토스트는 사라지므로, 결제가 막힌 이유는 화면에 계속 남겨 둔다.
                  <Box sx={{ mx: 2, mb: 1, p: 1.5, borderRadius: 1, bgcolor: 'error.lighter' }}>
                    <Typography variant="body2" sx={{ color: 'error.main' }}>
                      {makeUnavailableMessage(unavailable)}
                    </Typography>
                  </Box>
                )}
                <CheckoutCartProductList
                  products={products}
                  onDelete={onDelete}
                  onDecreaseQuantity={onDecreaseQuantity}
                  onIncreaseQuantity={onIncreaseQuantity}
                  onChangeQuantity={onChangeQuantity}
                />
              </Card>

              {/* 주문자 정보 */}
              <Card sx={{ mb: 3 }}>
                <CardHeader title={translate('주문자 정보')} subheader={isMember ? translate("계정 정보가 자동 표시됩니다.") : translate("비회원 주문 정보를 입력해 주세요.")} />
                <CardContent>
                  {isMember ? (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField fullWidth size="small" label={translate('이름')} value={user?.name ?? user?.nickname ?? ''} InputProps={{ readOnly: true }} />
                      {/* 계정에 저장된 휴대폰이 있으면 읽기전용으로 보여주고,
                          없는 계정(구 데이터·개발자 생성 계정 등)은 직접 입력받는다.
                          읽기전용 고정이면 번호 없는 회원이 결제를 진행할 방법이 없다. */}
                      {user?.phone_num ? (
                        <TextField fullWidth size="small" label={translate('휴대폰')} value={user?.phone_num} InputProps={{ readOnly: true }} />
                      ) : (
                        <TextField fullWidth size="small" label={translate('휴대폰')} value={payData.buyer_phone}
                          inputMode="tel" placeholder="010-1234-5678"
                          helperText={translate("계정에 등록된 번호가 없어 직접 입력이 필요합니다.")}
                          onChange={(e) => setPayData({ ...payData, buyer_phone: sanitizePhoneInput(e.target.value) })} />
                      )}
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField fullWidth size="small" label={translate('이름')} value={payData.buyer_name}
                          onChange={(e) => setPayData({ ...payData, buyer_name: e.target.value })} />
                        <TextField fullWidth size="small" label={translate('휴대폰')} value={payData.buyer_phone}
                          inputMode="tel" placeholder="010-1234-5678"
                          onChange={(e) => setPayData({ ...payData, buyer_phone: sanitizePhoneInput(e.target.value) })} />
                      </Stack>
                      {/* DB 컬럼이 varchar(8) 이었는데 여기 maxLength 가 20 이라
                          9자 이상 입력하면 주문 INSERT 가 'Data too long' 으로 실패했다.
                          컬럼을 넉넉히 넓히고(마이그레이션), 입력은 6~16자로 안내·제한한다. */}
                      <TextField fullWidth size="small" type="password"
                        label={translate('비회원 주문 비밀번호 (주문조회 시 사용)')}
                        value={payData.password} inputProps={{ maxLength: GUEST_PW_MAX }}
                        error={!!payData.password && payData.password.length < GUEST_PW_MIN}
                        helperText={translate('{{min}}~{{max}}자로 입력해 주세요. 주문조회 시 필요하니 꼭 기억해 두세요.', { min: GUEST_PW_MIN, max: GUEST_PW_MAX })}
                        onChange={(e) => setPayData({ ...payData, password: e.target.value })} />
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* 배송지 */}
              <Card sx={{ mb: 3 }}>
                <CardHeader title={translate('배송지')}
                  action={isMember && addressList.length > 0 ? (
                    <Button size="small" variant="soft"
                      startIcon={<Iconify icon={directMode ? 'eva:list-fill' : 'eva:edit-2-fill'} />}
                      onClick={() => setDirectMode(!directMode)}>
                      {directMode ? translate("주소록에서 선택") : translate("직접 입력")}
                    </Button>
                  ) : null} />
                <CardContent>
                  {isMember && addressList.length > 0 && !directMode ? (
                    <Stack spacing={1.5}>
                      {addressList.map((item, idx) => (
                        <Paper key={idx} variant="outlined"
                          sx={{ p: 2, cursor: 'pointer', borderColor: selectedAddrId == item?.id ? 'primary.main' : 'divider', borderWidth: selectedAddrId == item?.id ? 2 : 1 }}
                          onClick={() => onSelectAddress(item)}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="subtitle2">{item?.receiver || item?.addr}</Typography>
                                {!!item?.is_default && <Label color="info">{translate('기본')}</Label>}
                              </Stack>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {/* 해외 배송지는 도시·주·국가까지 보여야 어디로 가는 주소인지 알 수 있다.
                                    국내는 지금까지처럼 도로명주소 + 상세주소만 붙인다. */}
                                {isDomestic(item?.country_code)
                                  ? `${item?.addr ?? ''} ${item?.detail_addr ?? ''}`
                                  : formatOverseasAddress(item)}
                              </Typography>
                              {item?.phone && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{item?.phone}</Typography>}
                            </Box>
                            <Stack direction="row" spacing={1}>
                              <Button size="small" variant={selectedAddrId == item?.id ? 'contained' : 'outlined'}
                                onClick={(e) => { e.stopPropagation(); onSelectAddress(item); }}>{translate('선택')}</Button>
                              <Button size="small" color="inherit" variant="outlined"
                                onClick={(e) => { e.stopPropagation(); onUpdateAddress(item?.id); }}>{translate('수정')}</Button>
                              <Button size="small" color="inherit" variant="outlined"
                                onClick={(e) => { e.stopPropagation(); onDeleteAddress(item?.id); }}>{translate('삭제')}</Button>
                            </Stack>
                          </Stack>
                        </Paper>
                      ))}
                      <Button size="small" variant="soft" startIcon={<Iconify icon="eva:plus-fill" />}
                        onClick={() => setAddAddressOpen(true)} sx={{ alignSelf: 'flex-start' }}>{translate('주소록에 배송지 추가')}</Button>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      {/* 국내/해외 전환.
                          주소록 다이얼로그(DialogAddAddress)에는 넣었는데 이 직접입력 폼에는 없었다.
                          비회원은 주소록 자체가 없어서, 여기 없으면 **해외 주문을 넣을 방법이 아예 없다**. */}
                      <ToggleButtonGroup
                        exclusive size="small"
                        value={addrMode}
                        onChange={(e, v) => {
                          if (!v) return;
                          // 전환하면 이전 방식으로 채운 주소를 비운다 — 국내 도로명주소가
                          // 해외 주문에 그대로 남아 나가는 것을 막는다.
                          setAddrMode(v);
                          setPayData({
                            ...payData,
                            // 해외는 국가 미선택('')으로 두고 아래 국가 선택에서 고르게 한다.
                            country_code: v === 'KR' ? KOREA_CODE : '',
                            country_name: '',
                            addr: '', detail_addr: '', zonecode: '', city: '', state_region: '',
                          });
                        }}
                      >
                        <ToggleButton value="KR">{translate('국내배송')}</ToggleButton>
                        <ToggleButton value="OVERSEAS">{translate('해외배송')}</ToggleButton>
                      </ToggleButtonGroup>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField fullWidth size="small" label={translate('받는 사람')} value={payData.receiver || ''}
                          onChange={(e) => setPayData({ ...payData, receiver: e.target.value })} />
                        <TextField fullWidth size="small" label={translate('연락처')} value={payData.addr_phone || ''}
                          inputMode="tel" placeholder={isKR ? '010-1234-5678' : '+81 90-1234-5678'}
                          // 해외 번호는 국가번호(+)와 공백이 들어간다 — 국내 형식으로 걸러내면 입력이 막힌다.
                          onChange={(e) => setPayData({ ...payData, addr_phone: isKR ? sanitizePhoneInput(e.target.value) : e.target.value })} />
                      </Stack>

                      {isKR ? (
                        <>
                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            <TextField size="small" label={translate('우편번호')} value={payData.zonecode || ''} InputProps={{ readOnly: true }} sx={{ width: 140 }} />
                            <Button variant="outlined" sx={{ height: 40 }} onClick={() => setPostOpen(true)}>{translate('우편번호 검색')}</Button>
                          </Stack>
                          <TextField fullWidth size="small" label={translate('주소')} value={payData.addr || ''} InputProps={{ readOnly: true }} placeholder={translate('우편번호 검색으로 입력')} />
                        </>
                      ) : (
                        <>
                          {/* 해외는 우편번호 검색(다음 우편번호 서비스)이 국내 전용이라 쓸 수 없다 — 직접 입력받는다. */}
                          {/* 국가는 목록에서 고르지 않고 직접 입력받는다 — 목록(27개국)에 없는
                              나라로는 아예 주문할 수 없었다. country_code 는 VARCHAR(2) 라
                              이름을 못 담으므로 해외 표식(ZZ)만 두고 이름은 country_name 에 담는다. */}
                          <TextField
                            fullWidth size="small"
                            label={translate('국가')}
                            placeholder={translate('예: 일본 / Japan')}
                            value={payData.country_name || ''}
                            inputProps={{ maxLength: 60 }}
                            onChange={(e) => setPayData({
                              ...payData,
                              country_name: e.target.value,
                              country_code: String(e.target.value).trim() ? OVERSEAS_CODE : '',
                            })}
                          />
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField fullWidth size="small" label={translate('도시')} value={payData.city || ''}
                              onChange={(e) => setPayData({ ...payData, city: e.target.value })} />
                            <TextField fullWidth size="small" label={translate('주/지역')} value={payData.state_region || ''}
                              onChange={(e) => setPayData({ ...payData, state_region: e.target.value })} />
                          </Stack>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField fullWidth size="small" label={translate('주소')} value={payData.addr || ''}
                              onChange={(e) => setPayData({ ...payData, addr: e.target.value })} />
                            <TextField size="small" label={translate('우편번호')} value={payData.zonecode || ''} sx={{ width: { xs: '100%', sm: 160 } }}
                              onChange={(e) => setPayData({ ...payData, zonecode: e.target.value })} />
                          </Stack>
                        </>
                      )}
                      <TextField fullWidth size="small" label={translate('상세주소')} value={payData.detail_addr || ''}
                        onChange={(e) => setPayData({ ...payData, detail_addr: e.target.value })} />
                      {isMember && addressList.length > 0 && (
                        <Button size="small" variant="text" onClick={() => setDirectMode(false)} sx={{ alignSelf: 'flex-start' }}>{translate('← 주소록에서 선택')}</Button>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* 결제수단 (약관 동의 후 선택) */}
              <Card sx={{ mb: 3 }}>
                <CardHeader title={translate('결제수단')} />
                <CardContent>
                  <Box sx={{ mb: 2, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <FormControlLabel
                      control={<Checkbox checked={agreeAll} onChange={(e) => toggleAgreeAll(e.target.checked)} />}
                      label={<Typography variant="subtitle2">{translate('주문 내용을 확인하였으며, 아래 약관에 모두 동의합니다.')}</Typography>}
                    />
                    <Divider sx={{ my: 1 }} />
                    <Stack sx={{ pl: 1 }}>
                      {/* 항목별 개별 동의 — '전체 동의'는 아래 두 개를 켜고 끄는 편의 장치일 뿐이고,
                          실제 결제 통과 조건은 두 항목이 각각 체크됐는지다. */}
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <FormControlLabel
                          control={<Checkbox size="small" checked={agree1} onChange={(e) => setAgree1(e.target.checked)} />}
                          label={<Typography variant="body2">{translate('이용약관 동의')}<Box component="span" sx={{ color: 'error.main' }}>{translate('(필수)')}</Box></Typography>}
                        />
                        <Button size="small" variant="text" onClick={() => setOpenPolicy(openPolicy === 1 ? 0 : 1)}>
                          {openPolicy === 1 ? translate("접기") : translate("보기")}
                        </Button>
                      </Stack>
                      {openPolicy === 1 && (
                        <Box sx={{ height: '12rem', overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                          <Policy type={0} />
                        </Box>
                      )}
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <FormControlLabel
                          control={<Checkbox size="small" checked={agree2} onChange={(e) => setAgree2(e.target.checked)} />}
                          label={<Typography variant="body2">{translate('개인정보 수집 및 이용 동의')}<Box component="span" sx={{ color: 'error.main' }}>{translate('(필수)')}</Box></Typography>}
                        />
                        <Button size="small" variant="text" onClick={() => setOpenPolicy(openPolicy === 2 ? 0 : 2)}>
                          {openPolicy === 2 ? translate("접기") : translate("보기")}
                        </Button>
                      </Stack>
                      {openPolicy === 2 && (
                        <Box sx={{ height: '12rem', overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                          <Policy type={1} />
                        </Box>
                      )}
                    </Stack>
                    {!agreeAll && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', pl: 1, mt: 1, display: 'block' }}>{translate('필수 항목에 모두 동의하셔야 결제를 진행할 수 있습니다.')}</Typography>
                    )}
                  </Box>
                  <Stack spacing={1.5}>
                    {paymentModules.map((item, idx) => {
                      // 포스페이는 8개 옵션이 모두 type='auth_forspay'라, pay_method까지 봐야 클릭한 하나만 선택 표시됨
                      const selected = buyType == item?.type && (item?.type != 'auth_forspay' || buyPayMethod == item?.pay_method);
                      const fm = item?.pay_method ? _.find(forspayMethodList, { key: item.pay_method }) : null; // 결제수단 로고
                      return (
                        <Paper key={idx} variant="outlined"
                          sx={{ p: 2, cursor: 'pointer', borderColor: selected ? 'primary.main' : 'divider', borderWidth: selected ? 2 : 1 }}
                          onClick={() => selectPayType(item)}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            {fm?.icon && <Iconify icon={fm.icon} width={26} sx={{ color: fm.color, flexShrink: 0 }} />}
                            <Box>
                              <Typography variant="subtitle2">{item.title}</Typography>
                              {item.description && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{item.description}</Typography>}
                            </Box>
                          </Stack>
                        </Paper>
                      );
                    })}
                    {paymentModules.length == 0 && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{translate('등록된 결제수단이 없습니다.')}</Typography>
                    )}
                  </Stack>

                  {/* 카드 수기결제 입력 */}
                  {buyType == 'card' && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={2}>
                        <Cards cvc={''} focused={undefined} expiry={payData.yymm} name={payData.buyer_name} number={payData.card_num} />
                        <TextField size="small" label={translate('카드 번호')} value={payData.card_num} placeholder="0000 0000 0000 0000"
                          onChange={(e) => setPayData({ ...payData, card_num: formatCreditCardNumber(e.target.value, Payment) })} />
                        <TextField size="small" label={translate('카드 사용자명')} value={payData.buyer_name}
                          onChange={(e) => setPayData({ ...payData, buyer_name: e.target.value })} />
                        <TextField size="small" label={translate('만료일')} value={payData.yymm} inputProps={{ maxLength: '5' }}
                          onChange={(e) => setPayData({ ...payData, yymm: formatExpirationDate(e.target.value, Payment) })} />
                        <TextField size="small" label={translate('카드비밀번호 앞 두자리')} type="password" value={payData.card_pw} inputProps={{ maxLength: '2' }}
                          onChange={(e) => setPayData({ ...payData, card_pw: e.target.value })} />
                        <TextField size="small" label={translate('구매자 휴대폰번호')} value={payData.buyer_phone}
                          inputMode="tel" placeholder="010-1234-5678"
                          onChange={(e) => setPayData({ ...payData, buyer_phone: sanitizePhoneInput(e.target.value) })} />
                        <TextField size="small" label={translate('주민번호 또는 사업자등록번호')} value={payData.auth_num}
                          onChange={(e) => setPayData({ ...payData, auth_num: e.target.value })} />
                        <Button variant="contained" size="large" onClick={() => setModal({
                          func: () => { onPayByHand(); }, icon: 'ion:card-outline', title: translate('정말로 결제 하시겠습니까?'),
                        })}>{translate('결제하기')}</Button>
                      </Stack>
                    </Box>
                  )}

                  {/* 무통장/가상계좌 안내 */}
                  {buyType == 'virtual_account' && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }} />
                      {(() => {
                        const m = _.find(themeDnsData?.payment_modules, { type: 'virtual_account' });
                        return (m?.virtual_acct_bank && m?.virtual_acct_name && m?.virtual_acct_num) ? (
                          <Stack spacing={1}>
                            <Typography variant="body2">{translate('은행')} : {m.virtual_acct_bank}</Typography>
                            <Typography variant="body2">{translate('예금주')} : {m.virtual_acct_name}</Typography>
                            <Typography variant="body2">{translate('계좌번호')} : {m.virtual_acct_num}</Typography>
                            {/* 주문번호를 보여준다. 예전엔 알려주지 않아 비회원은 주문조회조차 못 했다. */}
                            {payData?.ord_num && (
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{translate('주문번호')} : {payData.ord_num}</Typography>
                            )}
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{translate('입금 후 1일 안에 구매처리됩니다.')}</Typography>
                          </Stack>
                        ) : <Typography variant="body2">{translate('무통장입금을 준비중입니다...')}</Typography>;
                      })()}
                    </Box>
                  )}

                  {/* 상품권결제 안내.
                      예전엔 이 블록이 아예 없었다. 상품권결제를 고르면 주문만 만들어지고
                      토스트 하나 뜬 뒤 화면은 그대로였다 — 장바구니는 비워졌는데 고객은
                      무엇을 해야 하는지 알 수 없었고, 결제창 팝업이 차단되면 완전히 막혔다. */}
                  {buyType == 'gift_certificate' && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={1}>
                        <Typography variant="body2">{translate('상품권결제 창에서 결제를 완료해 주세요.')}</Typography>
                        {payData?.ord_num && (
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{translate('주문번호')} : {payData.ord_num}</Typography>
                        )}
                        {(() => {
                          const m = _.find(themeDnsData?.payment_modules, { type: 'gift_certificate' });
                          // 팝업이 차단되면 위에서 연 창이 안 뜬다. 직접 열 수 있는 링크를 남긴다.
                          return m?.gift_certificate_url ? (
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ alignSelf: 'flex-start' }}
                              onClick={() => {
                                const link = m.gift_certificate_url
                                  + `?amount=${payData?.amount}&name=${user?.name ?? ''}&phone_num=${user?.phone_num ?? ''}`;
                                window.open(link, '');
                              }}>{translate('결제창 다시 열기')}</Button>
                          ) : null;
                        })()}
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{translate('결제 확인 후 구매처리됩니다.')}</Typography>
                      </Stack>
                    </Box>
                  )}

                  {/* 핀트리 카드결제 */}
                  {buyType == 'card_fintree' && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>{payData?.payment_modules?.title}</Typography>
                      <Stack spacing={2}>
                        <Cards cvc={''} focused={undefined} expiry={payData.yymm} name={payData.buyer_name} number={payData.card_num} />
                        <TextField size="small" label={translate('카드 번호')} value={payData.card_num} placeholder="0000 0000 0000 0000"
                          onChange={(e) => setPayData({ ...payData, card_num: formatCreditCardNumber(e.target.value, Payment) })} />
                        <TextField size="small" label={translate('카드 사용자명')} value={payData.buyer_name}
                          onChange={(e) => setPayData({ ...payData, buyer_name: e.target.value })} />
                        <TextField size="small" label={translate('만료일')} value={payData.yymm} inputProps={{ maxLength: '5' }}
                          onChange={(e) => setPayData({ ...payData, yymm: formatExpirationDate(e.target.value, Payment) })} />
                        <TextField size="small" label={translate('카드비밀번호 앞 두자리')} type="password" value={payData.card_pw} inputProps={{ maxLength: '2' }}
                          onChange={(e) => setPayData({ ...payData, card_pw: e.target.value })} />
                        <TextField size="small" label={translate('구매자 휴대폰번호')} value={payData.buyer_phone}
                          inputMode="tel" placeholder="010-1234-5678"
                          onChange={(e) => setPayData({ ...payData, buyer_phone: sanitizePhoneInput(e.target.value) })} />
                        <TextField size="small" label={translate('주민번호 또는 사업자등록번호')} value={payData.auth_num}
                          onChange={(e) => setPayData({ ...payData, auth_num: e.target.value })} />
                        <PayProductsByHandFintree props={[products, payData]} />
                      </Stack>
                    </Box>
                  )}

                  {buyType == 'certification_fintree' && (
                    <Box sx={{ mt: 3 }}><Divider sx={{ mb: 2 }} /><PayProductsByAuthFintree props={[products, payData]} /></Box>
                  )}
                  {buyType == 'card_hecto' && (
                    <Box sx={{ mt: 3 }}><Divider sx={{ mb: 2 }} /><PayProductsByAuthHecto props={[products, payData]} /></Box>
                  )}
                  {buyType == 'phone_hecto' && (
                    <Box sx={{ mt: 3 }}><Divider sx={{ mb: 2 }} /><PayProductsByPhoneHecto props={[products, payData]} /></Box>
                  )}
                  {buyType == 'certification_wayup' && (
                    <Box sx={{ mt: 3 }}><Divider sx={{ mb: 2 }} /><PayProductsByAuthWayup props={[products, payData]} /></Box>
                  )}
                </CardContent>
              </Card>

            </Grid>

            {/* ── 우: 결제 요약 ── */}
            <Grid item xs={12} md={4}>
              <Box sx={{ position: { md: 'sticky' }, top: 24 }}>
                <CheckoutSummary
                  enableDiscount
                  themeDnsData={themeDnsData}
                  payData={payData}
                  setPayData={setPayData}
                  total={orderTotals.amount}
                  shipping={orderTotals.delivery}
                  shipActive={orderTotals.shipActive}
                  discount={_.sum(_.map(products, (item) => calculatorPrice(item, payData).discount))}
                  // '총액'은 할인 전 상품가(배송비 제외)로 넘긴다 = merchTotal(할인가) + 할인액.
                  // (1) 화면에서 '총액 − 할인 + 배송비 − 포인트 = 총 결제금액' 이 맞아떨어진다.
                  //     merchTotal 만 넘기면 이미 할인이 반영된 값이라 할인 행을 또 빼는 셈이 돼 계산이 안 맞았다.
                  // (2) CheckoutSummary 의 포인트 입력 잠금 기준이 subtotal - discount 인데,
                  //     merchTotal 을 넘기면 할인이 이중 차감돼 기준금액이 실제보다 작게 나온다.
                  //     그래서 카트에선 포인트를 넣을 수 있는데 주문서에선 잠기는 불일치가 있었다. 같이 해소된다.
                  subtotal={orderTotals.merchTotal + _.sum(_.map(products, (item) => calculatorPrice(item).discount))}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1, textAlign: 'center' }}>{translate('결제수단을 선택한 뒤 결제 방법(결제하기 버튼 또는 입력란)에 따라 진행하세요.')}</Typography>
                {(buyType == 'auth_forspay' || buyType == 'card_payletter') && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>{translate('선택한 결제수단:')}<b>{_.find(paymentModules, (m) => m?.type == buyType && (buyType != 'auth_forspay' || m?.pay_method == buyPayMethod))?.title || '-'}</b>
                    </Typography>
                    <Button fullWidth variant="contained" size="large" disabled={payLoading}
                      onClick={() => setModal({
                        func: () => { onPaySelectedRedirect(); },
                        icon: 'ion:card-outline',
                        title: translate('결제를 진행하시겠습니까?'),
                      })}>{translate('결제하기')}</Button>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        )}
      </Wrappers>
    </>
  );
}
