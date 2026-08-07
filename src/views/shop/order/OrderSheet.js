import {
  Box, Button, Card, CardContent, CardHeader, Checkbox, CircularProgress,
  Dialog, Divider, FormControlLabel, Grid, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
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
import { calculatorPrice, getCartDataUtil, makePayData, onPayProductsByAuth, onPayProductsByHand, onPayProductsByPayletter, onPayProductsByForspay } from 'src/utils/shop-util';
import { forspayMethodList } from 'src/utils/format';
import { sanitizePhoneInput, isValidPhoneNumber } from 'src/utils/function';
import Policy from 'src/pages/shop/auth/policy';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { formatCreditCardNumber, formatExpirationDate } from 'src/utils/formatCard';
import { useModal } from 'src/components/dialog/ModalProvider';
import { apiManager } from 'src/utils/api';
import DialogAddAddress from 'src/components/dialog/DialogAddAddress';
import DaumPostcode from 'react-daum-postcode';
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

export default function OrderSheet({ router }) {
  const { setModal } = useModal();
  const { user } = useAuthContext();
  const { themeCartData, onChangeCartData, themeDnsData } = useSettingsContext();
  const setting_obj = themeDnsData?.setting_obj || {};
  const { max_use_point = 0, point_rate = 0, use_point_min_price = 0 } = setting_obj;

  const [products, setProducts] = useState([]);
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

  const getCart = async () => {
    let items = [];
    if (typeof window !== 'undefined' && window.location.search.includes('buynow')) {
      // 바로구매: sessionStorage의 단일 상품 사용(장바구니 무관)
      try {
        const raw = sessionStorage.getItem('buyNowItem');
        if (raw) items = [JSON.parse(raw)];
      } catch (e) { /* noop */ }
    } else {
      items = await getCartDataUtil(themeCartData);
    }
    setProducts(items);
    onChangeAddressPage(addressSearchObj);
  };

  // ── 주문상품 수량/삭제 ──
  const onDelete = (idx) => {
    const list = [...products];
    list.splice(idx, 1);
    onChangeCartData(list);
    setProducts(list);
  };
  const onDecreaseQuantity = (idx) => {
    const list = [...products];
    if (list[idx].order_count > 1) list[idx].order_count--;
    setProducts(list);
  };
  const onIncreaseQuantity = (idx) => {
    const list = [...products];
    list[idx].order_count++;
    setProducts(list);
  };
  const onChangeQuantity = (idx, val) => {
    const list = [...products];
    list[idx].order_count = val;
    setProducts(list);
  };

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
    });
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
    if (!agreeAll) {
      toast.error('주문 내용 및 약관에 동의해 주세요.');
      return false;
    }
    if (!payData.addr) {
      toast.error('배송지를 선택하거나 입력해 주세요.');
      return false;
    }
    if (!user && !payData.password) {
      toast.error('비회원 주문 비밀번호를 입력해 주세요.');
      return false;
    }
    if (!user && (payData.password.length < GUEST_PW_MIN || payData.password.length > GUEST_PW_MAX)) {
      toast.error(`비회원 주문 비밀번호는 ${GUEST_PW_MIN}~${GUEST_PW_MAX}자로 입력해 주세요.`);
      return false;
    }
    // 전화번호는 배송 연락·주문 확인의 유일한 수단이라 결제 전에 반드시 성립해야 한다.
    // 입력창에서 숫자·하이픈만 받도록 필터링하지만, 빈 값이나 자릿수 미달은 여기서 막는다.
    if (!isValidPhoneNumber(payData.buyer_phone)) {
      toast.error('구매자 휴대폰번호를 정확히 입력해 주세요.');
      return false;
    }
    if (payData.addr_phone && !isValidPhoneNumber(payData.addr_phone)) {
      toast.error('받는 분 연락처를 정확히 입력해 주세요.');
      return false;
    }
    if (parseFloat(max_use_point) < parseFloat(payData.use_point || 0)) {
      toast.error('최대사용가능 포인트를 초과하였습니다.');
      return false;
    }
    if (parseFloat(user?.point ?? 0) < parseFloat(payData.use_point || 0)) {
      toast.error('보유포인트가 부족합니다.');
      return false;
    }
    return true;
  };

  // ── 결제수단 선택 (demo-9 selectPayType 이식, sms_pay 제외) ──
  const selectPayType = async (item) => {
    if (!guardBeforePay()) return;
    setBuyPayMethod(item?.pay_method); // 클릭한 결제수단 기억(포스페이 수단별 하이라이트)
    if (item?.type == 'card') {
      setBuyType('card');
      setPayData({ ...payData, payment_modules: item });
    } else if (item?.type == 'certification') {
      setPayLoading(true);
      await onPayProductsByAuth(products.map((p) => ({ ...p })), { ...payData, payment_modules: item }, 'payvery');
    } else if (item?.type == 'card_fintree') {
      setBuyType('card_fintree');
      setPayData({ ...payData, payment_modules: item });
    } else if (item?.type == 'certification_fintree') {
      setBuyType('certification_fintree');
      setPayData({ ...payData, payment_modules: item });
    } else if (item?.type == 'virtual_account') {
      setBuyType('virtual_account');
      // makePayData가 배열을 in-place 변형하므로 사본을 넘겨 화면 상태(products)를 보호한다.
      const pay_data = await makePayData(products.map((p) => ({ ...p })), payData);
      delete pay_data.payment_modules;
      const ord_num = `${pay_data?.user_id || pay_data?.password}${new Date().getTime().toString().substring(0, 11)}`;
      pay_data.ord_num = ord_num;
      pay_data.item_name = pay_data?.products?.length > 1 ? `${pay_data?.products[0]?.order_name} 외 ${pay_data?.products?.length - 1}건` : (pay_data?.products[0]?.order_name || '상품');
      const module = _.find(themeDnsData?.payment_modules, { type: 'virtual_account' });
      if (module?.virtual_acct_url) {
        const link = module.virtual_acct_url + `?amount=${pay_data?.amount}`;
        const popup = window.open(link, '');
        if (popup) popup.location.href = link;
      }
      await apiManager('pays/virtual', 'create', pay_data);
      setPayData(pay_data);
    } else if (item?.type == 'gift_certificate') {
      setBuyType('gift_certificate');
      // makePayData가 배열을 in-place 변형하므로 사본을 넘겨 화면 상태(products)를 보호한다.
      const pay_data = await makePayData(products.map((p) => ({ ...p })), payData);
      delete pay_data.payment_modules;
      const ord_num = `${pay_data?.user_id || pay_data?.password}${new Date().getTime().toString().substring(0, 11)}`;
      pay_data.ord_num = ord_num;
      pay_data.item_name = pay_data?.products?.length > 1 ? `${pay_data?.products[0]?.order_name} 외 ${pay_data?.products?.length - 1}건` : (pay_data?.products[0]?.order_name || '상품');
      const module = _.find(themeDnsData?.payment_modules, { type: 'gift_certificate' });
      if (module?.gift_certificate_url) {
        const link = module.gift_certificate_url + `?amount=${pay_data?.amount}&name=${user?.name ?? ''}&phone_num=${user?.phone_num ?? ''}`;
        const popup = window.open(link, '');
        if (popup) popup.location.href = link;
      }
      await apiManager('pays/gift_certificate', 'create', pay_data);
      setPayData(pay_data);
    } else if (item?.type == 'certification_weroute') {
      setBuyType('certification_weroute');
      setPayLoading(true);
      await onPayProductsByAuth(products.map((p) => ({ ...p })), { ...payData, payment_modules: item }, 'weroute');
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
    try {
      if (buyType == 'auth_forspay') {
        await onPayProductsByForspay(products.map((p) => ({ ...p })), payData);
      } else if (buyType == 'card_payletter') {
        await onPayProductsByPayletter(products.map((p) => ({ ...p })), payData);
      }
    } finally {
      setPayLoading(false);
    }
  };

  // 수기 카드결제 확정
  const onPayByHand = async () => {
    if (buyType != 'card') return;
    if (!guardBeforePay()) return;
    if (!payData.card_num || !payData.yymm || String(payData.yymm).length < 5 || !payData.card_pw) {
      toast.error('카드 정보를 정확히 입력해 주세요.');
      return;
    }
    setPayLoading(true);
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
      toast.success('주문이 완료되었습니다.');
      router.push('/shop/auth/order-complete');
    }
  };

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
          <Box sx={{ fontWeight: 700 }}>우편번호 검색</Box>
          <Button size="small" color="inherit" onClick={() => setPostOpen(false)}>닫기</Button>
        </Box>
        <DaumPostcode style={postCodeStyle} onComplete={onCompletePost} />
      </Dialog>

      <Wrappers>
        <Title style={{ marginBottom: '1.5rem' }}>주문 / 결제</Title>
        {products.length == 0 ? (
          <Card sx={{ p: 2 }}>
            <EmptyContent title="주문할 상품이 없습니다." description="장바구니에 상품을 담아 주세요."
              img="/assets/illustrations/illustration_empty_cart.svg" />
          </Card>
        ) : (
          <Grid container spacing={3}>
            {/* ── 좌: 주문 정보 ── */}
            <Grid item xs={12} md={8}>
              {/* 주문상품 */}
              <Card sx={{ mb: 3 }}>
                <CardHeader title="주문 상품" />
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
                <CardHeader title="주문자 정보" subheader={isMember ? '계정 정보가 자동 표시됩니다.' : '비회원 주문 정보를 입력해 주세요.'} />
                <CardContent>
                  {isMember ? (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField fullWidth size="small" label="이름" value={user?.name ?? user?.nickname ?? ''} InputProps={{ readOnly: true }} />
                      {/* 계정에 저장된 휴대폰이 있으면 읽기전용으로 보여주고,
                          없는 계정(구 데이터·개발자 생성 계정 등)은 직접 입력받는다.
                          읽기전용 고정이면 번호 없는 회원이 결제를 진행할 방법이 없다. */}
                      {user?.phone_num ? (
                        <TextField fullWidth size="small" label="휴대폰" value={user?.phone_num} InputProps={{ readOnly: true }} />
                      ) : (
                        <TextField fullWidth size="small" label="휴대폰" value={payData.buyer_phone}
                          inputMode="tel" placeholder="010-1234-5678"
                          helperText="계정에 등록된 번호가 없어 직접 입력이 필요합니다."
                          onChange={(e) => setPayData({ ...payData, buyer_phone: sanitizePhoneInput(e.target.value) })} />
                      )}
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField fullWidth size="small" label="이름" value={payData.buyer_name}
                          onChange={(e) => setPayData({ ...payData, buyer_name: e.target.value })} />
                        <TextField fullWidth size="small" label="휴대폰" value={payData.buyer_phone}
                          inputMode="tel" placeholder="010-1234-5678"
                          onChange={(e) => setPayData({ ...payData, buyer_phone: sanitizePhoneInput(e.target.value) })} />
                      </Stack>
                      {/* DB 컬럼이 varchar(8) 이었는데 여기 maxLength 가 20 이라
                          9자 이상 입력하면 주문 INSERT 가 'Data too long' 으로 실패했다.
                          컬럼을 넉넉히 넓히고(마이그레이션), 입력은 6~16자로 안내·제한한다. */}
                      <TextField fullWidth size="small" type="password"
                        label="비회원 주문 비밀번호 (주문조회 시 사용)"
                        value={payData.password} inputProps={{ maxLength: GUEST_PW_MAX }}
                        error={!!payData.password && payData.password.length < GUEST_PW_MIN}
                        helperText={`${GUEST_PW_MIN}~${GUEST_PW_MAX}자로 입력해 주세요. 주문조회 시 필요하니 꼭 기억해 두세요.`}
                        onChange={(e) => setPayData({ ...payData, password: e.target.value })} />
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* 배송지 */}
              <Card sx={{ mb: 3 }}>
                <CardHeader title="배송지"
                  action={isMember && addressList.length > 0 ? (
                    <Button size="small" variant="soft"
                      startIcon={<Iconify icon={directMode ? 'eva:list-fill' : 'eva:edit-2-fill'} />}
                      onClick={() => setDirectMode(!directMode)}>
                      {directMode ? '주소록에서 선택' : '직접 입력'}
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
                                {!!item?.is_default && <Label color="info">기본</Label>}
                              </Stack>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{item?.addr} {item?.detail_addr}</Typography>
                              {item?.phone && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{item?.phone}</Typography>}
                            </Box>
                            <Stack direction="row" spacing={1}>
                              <Button size="small" variant={selectedAddrId == item?.id ? 'contained' : 'outlined'}
                                onClick={(e) => { e.stopPropagation(); onSelectAddress(item); }}>선택</Button>
                              <Button size="small" color="inherit" variant="outlined"
                                onClick={(e) => { e.stopPropagation(); onUpdateAddress(item?.id); }}>수정</Button>
                              <Button size="small" color="inherit" variant="outlined"
                                onClick={(e) => { e.stopPropagation(); onDeleteAddress(item?.id); }}>삭제</Button>
                            </Stack>
                          </Stack>
                        </Paper>
                      ))}
                      <Button size="small" variant="soft" startIcon={<Iconify icon="eva:plus-fill" />}
                        onClick={() => setAddAddressOpen(true)} sx={{ alignSelf: 'flex-start' }}>주소록에 배송지 추가</Button>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField fullWidth size="small" label="받는 사람" value={payData.receiver || ''}
                          onChange={(e) => setPayData({ ...payData, receiver: e.target.value })} />
                        <TextField fullWidth size="small" label="연락처" value={payData.addr_phone || ''}
                          inputMode="tel" placeholder="010-1234-5678"
                          onChange={(e) => setPayData({ ...payData, addr_phone: sanitizePhoneInput(e.target.value) })} />
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <TextField size="small" label="우편번호" value={payData.zonecode || ''} InputProps={{ readOnly: true }} sx={{ width: 140 }} />
                        <Button variant="outlined" sx={{ height: 40 }} onClick={() => setPostOpen(true)}>우편번호 검색</Button>
                      </Stack>
                      <TextField fullWidth size="small" label="주소" value={payData.addr || ''} InputProps={{ readOnly: true }} placeholder="우편번호 검색으로 입력" />
                      <TextField fullWidth size="small" label="상세주소" value={payData.detail_addr || ''}
                        onChange={(e) => setPayData({ ...payData, detail_addr: e.target.value })} />
                      {isMember && addressList.length > 0 && (
                        <Button size="small" variant="text" onClick={() => setDirectMode(false)} sx={{ alignSelf: 'flex-start' }}>← 주소록에서 선택</Button>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* 결제수단 (약관 동의 후 선택) */}
              <Card sx={{ mb: 3 }}>
                <CardHeader title="결제수단" />
                <CardContent>
                  <Box sx={{ mb: 2, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <FormControlLabel
                      control={<Checkbox checked={agreeAll} onChange={(e) => toggleAgreeAll(e.target.checked)} />}
                      label={<Typography variant="subtitle2">주문 내용을 확인하였으며, 아래 약관에 모두 동의합니다.</Typography>}
                    />
                    <Divider sx={{ my: 1 }} />
                    <Stack sx={{ pl: 1 }}>
                      {/* 항목별 개별 동의 — '전체 동의'는 아래 두 개를 켜고 끄는 편의 장치일 뿐이고,
                          실제 결제 통과 조건은 두 항목이 각각 체크됐는지다. */}
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <FormControlLabel
                          control={<Checkbox size="small" checked={agree1} onChange={(e) => setAgree1(e.target.checked)} />}
                          label={<Typography variant="body2">이용약관 동의 <Box component="span" sx={{ color: 'error.main' }}>(필수)</Box></Typography>}
                        />
                        <Button size="small" variant="text" onClick={() => setOpenPolicy(openPolicy === 1 ? 0 : 1)}>
                          {openPolicy === 1 ? '접기' : '보기'}
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
                          label={<Typography variant="body2">개인정보 수집 및 이용 동의 <Box component="span" sx={{ color: 'error.main' }}>(필수)</Box></Typography>}
                        />
                        <Button size="small" variant="text" onClick={() => setOpenPolicy(openPolicy === 2 ? 0 : 2)}>
                          {openPolicy === 2 ? '접기' : '보기'}
                        </Button>
                      </Stack>
                      {openPolicy === 2 && (
                        <Box sx={{ height: '12rem', overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                          <Policy type={1} />
                        </Box>
                      )}
                    </Stack>
                    {!agreeAll && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', pl: 1, mt: 1, display: 'block' }}>
                        필수 항목에 모두 동의하셔야 결제를 진행할 수 있습니다.
                      </Typography>
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
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>등록된 결제수단이 없습니다.</Typography>
                    )}
                  </Stack>

                  {/* 카드 수기결제 입력 */}
                  {buyType == 'card' && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Stack spacing={2}>
                        <Cards cvc={''} focused={undefined} expiry={payData.yymm} name={payData.buyer_name} number={payData.card_num} />
                        <TextField size="small" label="카드 번호" value={payData.card_num} placeholder="0000 0000 0000 0000"
                          onChange={(e) => setPayData({ ...payData, card_num: formatCreditCardNumber(e.target.value, Payment) })} />
                        <TextField size="small" label="카드 사용자명" value={payData.buyer_name}
                          onChange={(e) => setPayData({ ...payData, buyer_name: e.target.value })} />
                        <TextField size="small" label="만료일" value={payData.yymm} inputProps={{ maxLength: '5' }}
                          onChange={(e) => setPayData({ ...payData, yymm: formatExpirationDate(e.target.value, Payment) })} />
                        <TextField size="small" label="카드비밀번호 앞 두자리" type="password" value={payData.card_pw} inputProps={{ maxLength: '2' }}
                          onChange={(e) => setPayData({ ...payData, card_pw: e.target.value })} />
                        <TextField size="small" label="구매자 휴대폰번호" value={payData.buyer_phone}
                          inputMode="tel" placeholder="010-1234-5678"
                          onChange={(e) => setPayData({ ...payData, buyer_phone: sanitizePhoneInput(e.target.value) })} />
                        <TextField size="small" label="주민번호 또는 사업자등록번호" value={payData.auth_num}
                          onChange={(e) => setPayData({ ...payData, auth_num: e.target.value })} />
                        <Button variant="contained" size="large" onClick={() => setModal({
                          func: () => { onPayByHand(); }, icon: 'ion:card-outline', title: '정말로 결제 하시겠습니까?',
                        })}>결제하기</Button>
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
                            <Typography variant="body2">은행 : {m.virtual_acct_bank}</Typography>
                            <Typography variant="body2">예금주 : {m.virtual_acct_name}</Typography>
                            <Typography variant="body2">계좌번호 : {m.virtual_acct_num}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>입금 후 1일 안에 구매처리됩니다.</Typography>
                          </Stack>
                        ) : <Typography variant="body2">무통장입금을 준비중입니다...</Typography>;
                      })()}
                    </Box>
                  )}

                  {/* 핀트리 카드결제 */}
                  {buyType == 'card_fintree' && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>{payData?.payment_modules?.title}</Typography>
                      <Stack spacing={2}>
                        <Cards cvc={''} focused={undefined} expiry={payData.yymm} name={payData.buyer_name} number={payData.card_num} />
                        <TextField size="small" label="카드 번호" value={payData.card_num} placeholder="0000 0000 0000 0000"
                          onChange={(e) => setPayData({ ...payData, card_num: formatCreditCardNumber(e.target.value, Payment) })} />
                        <TextField size="small" label="카드 사용자명" value={payData.buyer_name}
                          onChange={(e) => setPayData({ ...payData, buyer_name: e.target.value })} />
                        <TextField size="small" label="만료일" value={payData.yymm} inputProps={{ maxLength: '5' }}
                          onChange={(e) => setPayData({ ...payData, yymm: formatExpirationDate(e.target.value, Payment) })} />
                        <TextField size="small" label="카드비밀번호 앞 두자리" type="password" value={payData.card_pw} inputProps={{ maxLength: '2' }}
                          onChange={(e) => setPayData({ ...payData, card_pw: e.target.value })} />
                        <TextField size="small" label="구매자 휴대폰번호" value={payData.buyer_phone}
                          inputMode="tel" placeholder="010-1234-5678"
                          onChange={(e) => setPayData({ ...payData, buyer_phone: sanitizePhoneInput(e.target.value) })} />
                        <TextField size="small" label="주민번호 또는 사업자등록번호" value={payData.auth_num}
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
                  total={_.sum(_.map(products, (item) => calculatorPrice(item, payData).total)) - (payData?.use_point || 0)}
                  discount={_.sum(_.map(products, (item) => calculatorPrice(item, payData).discount))}
                  subtotal={_.sum(_.map(products, (item) => calculatorPrice(item, payData).subtotal))}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1, textAlign: 'center' }}>
                  결제수단을 선택한 뒤 결제 방법(결제하기 버튼 또는 입력란)에 따라 진행하세요.
                </Typography>
                {(buyType == 'auth_forspay' || buyType == 'card_payletter') && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
                      선택한 결제수단: <b>{_.find(paymentModules, (m) => m?.type == buyType && (buyType != 'auth_forspay' || m?.pay_method == buyPayMethod))?.title || '-'}</b>
                    </Typography>
                    <Button fullWidth variant="contained" size="large" disabled={payLoading}
                      onClick={() => setModal({
                        func: () => { onPaySelectedRedirect(); },
                        icon: 'ion:card-outline',
                        title: '결제를 진행하시겠습니까?',
                      })}>
                      결제하기
                    </Button>
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
