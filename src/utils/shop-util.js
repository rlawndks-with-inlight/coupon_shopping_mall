import _ from "lodash";
import { axiosIns } from "./axios";
import { apiManager } from "./api";
import axios from "axios";
import toast from "react-hot-toast";
import i18n from "src/locales/i18n";

import { returnMoment, isPurchasable, getProductStatus } from "./function";
import { getLocalStorage } from "./local-storage";
import { isDemoHost } from "src/components/main-site/frameList";
import { findMissingRequired } from "src/data/order-form-types";
import { requiredGroups, isComboMode, findCombination, optionExtraPrice, maxOrderable, isAddon } from "src/data/product-options";
import { makeOrdNum } from 'src/utils/function';

// 손님에게 뜨는 안내는 반드시 이걸 거친다.
//
// 이 파일은 컴포넌트가 아니라 useLocales() 를 쓸 수 없다. 그래서 예전엔 toast 에
// 한국어를 그대로 박아 뒀는데, 담기·구매가 막히는 순간의 안내가 전부 한국어로 떴다.
// 해외 판매가 이 서비스의 소구점인데 정작 '왜 막혔는지'를 못 읽는 셈이었다.
//
// api.js 의 serverMessage 와 같은 방식이다 — i18n 을 직접 부르고, 사전 키는
// 한국어 원문 그대로 쓴다(이 저장소 규칙). i18next 는 못 찾은 키를 원문으로 돌려주므로
// 사전에 없는 문구도 예전과 똑같이 동작한다.
// try/catch 는 안전장치다 — 안내 한 줄 때문에 구매 흐름이 끊기면 안 된다.
const 번역 = (문구, 값) => {
    try { return i18n.t(문구, 값); } catch { return 문구; }
};

// 브랜드 공통 배송비 정책 (설정 > 배송비설정). 정책이 설정된 경우에만 활성.
// - delivery_fee_default: 주문당 기본 배송비
// - free_ship_min: 이 금액 이상이면 무료배송(0=미사용)
// 정책 미설정(둘 다 0) 브랜드는 active:false → 기존 상품별 배송비 동작을 그대로 유지(하위호환).
// 이 상품에 걸린 손님 입력항목. 없으면 빈 배열.
//
// 상품 상세 응답(product.order_form_fields)에 실려 오고, 장바구니 줄에도 그대로 남는다.
// 예전엔 몰 설정(themeDnsData.order_form)에서 읽어 **그 몰의 모든 상품**에 같은 칸이 떴다 —
// 답례품만 사는 손님에게도 행사날짜를 물었다.
export const getOrderFormFields = (product) => {
    const fields = product?.order_form_fields;
    return Array.isArray(fields) ? fields : [];
};

export const getBrandShipping = (merchandiseSubtotal = 0) => {
    try {
        const dns = JSON.parse(getLocalStorage('themeDnsData') || '{}');
        const s = dns?.setting_obj || {};
        const base = parseInt(s.delivery_fee_default || 0) || 0;
        const freeMin = parseInt(s.free_ship_min || 0) || 0;
        const active = base > 0 || freeMin > 0;
        if (!active) return { active: false, fee: 0 };
        const fee = (freeMin > 0 && Number(merchandiseSubtotal) >= freeMin) ? 0 : base;
        return { active: true, fee };
    } catch (e) {
        return { active: false, fee: 0 };
    }
}

export const calculatorPrice = (item) => {// 상품별로 가격
    if (!item) {
        return 0;
    }
    let { product_sale_price, product_price, groups = [], order_count, delivery_fee } = item;
    // 조합형이면 선택옵션의 개별 가격 대신 조합 추가금을 쓴다.
    // 장바구니 줄은 상품을 통째로 복사하므로 combinations/option_mode 가 줄에 그대로 남아 있다.
    // 백엔드 recalcOrderAmount 와 규칙이 같아야 한다 — 어긋나면 화면과 청구 금액이 달라진다.
    const product_option_price = optionExtraPrice(item, { groups });

    return {
        subtotal: (product_price + product_option_price) * order_count + delivery_fee,//할인전가격
        total: (product_sale_price + product_option_price) * order_count + delivery_fee,//결과
        discount: (product_price - product_sale_price) * order_count//할인가
    }
}
// 주문 금액 계산 — '화면에 보여줄 값'과 '실제로 청구할 값'이 같은 함수를 쓰게 한다.
//
// 예전엔 두 곳이 각자 계산했다. 주문서 요약(CheckoutSummary)은 상품별 배송비가 포함된
// 합계에 브랜드 배송비를 한 번 더 얹어 보여줬고, 실제 청구는 상품별 배송비를 버리고
// 브랜드 배송비만 1회 부과했다. 그래서 배송비 정책을 켠 브랜드에서
// 고객이 본 금액과 결제되는 금액이 어긋났다. 무료배송 판정 기준도 서로 달랐다
// (화면은 '상품가+배송비', 청구는 '상품가만')。
//
// makePayData 와 같은 규칙이다:
//   라인 상품가 = calculatorPrice(item).total - 그 라인의 delivery_fee
//   배송비      = 브랜드 정책이 켜져 있으면 주문당 1회, 아니면 상품별 delivery_fee 합
//   결제금액    = 상품가 합 + 배송비 - 사용포인트
export const calcOrderTotals = (products_, use_point = 0) => {
    const products = Array.isArray(products_) ? products_ : [];
    const merchByIdx = [];
    let merchTotal = 0;
    for (let i = 0; i < products.length; i++) {
        const calc = calculatorPrice(products[i]);
        const lineDelivery = products[i]?.delivery_fee ?? 0;
        const lineMerch = (calc?.total ?? 0) - lineDelivery;
        merchByIdx[i] = lineMerch;
        merchTotal += lineMerch;
    }
    const ship = getBrandShipping(merchTotal);
    let delivery = 0;
    const lineDeliveries = [];
    for (let i = 0; i < products.length; i++) {
        const d = ship.active ? (i === 0 ? ship.fee : 0) : (products[i]?.delivery_fee ?? 0);
        lineDeliveries[i] = d;
        delivery += d;
    }
    const point = Math.max(0, parseInt(use_point) || 0);
    return {
        merchTotal,
        delivery,
        shipActive: ship.active,
        usedPoint: point,
        amount: merchTotal + delivery - point,
        merchByIdx,
        lineDeliveries,
    };
};

export const makePayData = async (products_, payData_) => {
    let products = products_;
    let amount = 0;
    let payData = { ...payData_ };

    // 1) 각 라인 상품금액(배송비 제외) 계산
    let merchTotal = 0;
    const merchByIdx = [];
    for (var i = 0; i < products.length; i++) {
        products[i].order_name = products[i]?.product_name;
        const calc = await calculatorPrice(products[i]);
        const lineDelivery = products[i]?.delivery_fee ?? 0;
        const lineMerch = (calc?.total ?? 0) - lineDelivery;
        merchByIdx[i] = lineMerch;
        merchTotal += lineMerch;
    }

    // 2) 브랜드 배송비 정책이 설정돼 있으면 주문단위 배송비로 대체(첫 상품에 1회 부과),
    //    미설정이면 기존 상품별 배송비를 그대로 사용(하위호환).
    const ship = getBrandShipping(merchTotal);

    for (var i = 0; i < products.length; i++) {
        const lineDelivery = ship.active
            ? (i === 0 ? ship.fee : 0)
            : (products[i]?.delivery_fee ?? 0);
        const order_amount = merchByIdx[i] + lineDelivery;
        amount += order_amount;
        products[i] = {
            id: products[i]?.id,
            order_name: products[i]?.order_name,
            delivery_fee: lineDelivery,
            order_amount: order_amount,
            order_count: products[i]?.order_count,
            groups: products[i]?.groups,
            seller_id: products[i]?.seller_id ?? 0,
        }
    }
    payData = {
        ...payData,
        amount: amount - (payData?.use_point ?? 0),
        products: products,
    }

    return payData;
}
export const onPayProductsByHand = async (products_, payData_) => { // 수기결제(페이베리)
    if (isDemoHost()) {
        toast.error(번역('데모 미리보기에서는 결제할 수 없습니다.'));
        return false;
    }
    let products = products_;
    let pay_data = payData_;
    let payData = await makePayData(products, pay_data);
    let ord_num = makeOrdNum()
    let return_url = `${window.location.protocol}//${window.location.host}/shop/auth/pay-result`
    payData.yymm = payData?.yymm?.split('/');
    payData = {
        ...payData,
        ord_num: ord_num,
        return_url: return_url,
        success_url: return_url + '?result_cd=0000',
        fail_url: return_url + '?result_cd=9999',
        pay_key: payData?.payment_modules?.pay_key,
        mid: payData?.payment_modules?.mid,
        tid: payData?.payment_modules?.tid,
        card_num: payData?.card_num.replaceAll(' ', ''),
        yymm: payData?.yymm[1] + payData?.yymm[0],
    }
    if (payData?.products?.length > 1 || !payData?.item_name) {
        payData.item_name = payData?.products?.length > 1 ? `${payData?.products[0]?.order_name} 외 ${payData?.products?.length - 1}건` : (payData?.products[0]?.order_name || '상품');
    }
    try {
        let insert_pay_ready = await apiManager('pays/hand', 'create', payData);
        if (insert_pay_ready?.id > 0) {
            return {
                ...payData,
                trans_id: insert_pay_ready?.id
            };
        } else {
            return false;
        }

    } catch (err) {
        console.log(err);
        return false;
    }
}
export const onPayProductsByAuth = async (products_, payData_, type) => { // 인증결제(페이베리 & 위루트)
    if (isDemoHost()) {
        toast.error(번역('데모 미리보기에서는 결제할 수 없습니다.'));
        return false;
    }
    let products = products_;
    let pay_data = payData_;
    let payData = await makePayData(products, pay_data);
    let ord_num = makeOrdNum()
    let return_url = `${window.location.protocol}//${window.location.host}/shop/auth/pay-result`
    /*let user_agent = navigator.userAgent;
    if (user_agent.indexOf('iPhone') > -1 || userIsMobile.indexOf("Android") > -1) {
        user_agent = 'WM'
    } else {
        user_agent = 'WP'
    }*/

    if (type == 'payvery') {
        payData = {
            ...payData,
            ord_num: ord_num,
            return_url: return_url,
            success_url: return_url + '?result_cd=0000',
            fail_url: return_url + '?result_cd=9999',
            pay_key: payData?.payment_modules?.pay_key,
            mid: payData?.payment_modules?.mid,
            tid: payData?.payment_modules?.tid,
        }
    } else if (type == 'weroute') {
        payData = {
            ...payData,
            ord_num: ord_num,
            return_url: return_url,
            success_url: return_url + '?result_cd=0000',
            fail_url: return_url + '?result_cd=9999',
            pay_key: payData?.payment_modules?.pay_key,
            mid: payData?.payment_modules?.mid,
            tid: payData?.payment_modules?.tid,
            is_send_email: 0
        }
    }
    if (payData?.products?.length > 1 || !payData?.item_name) {
        payData.item_name = payData?.products?.length > 1 ? `${payData?.products[0]?.order_name} 외 ${payData?.products?.length - 1}건` : (payData?.products[0]?.order_name || '상품');
    }
    try {

        let insert_pay_ready = await apiManager(`pays/${type == 'payvery' ? 'auth' : 'auth_weroute'}`, 'create', payData)
        payData.temp = insert_pay_ready?.id

        delete payData.products;
        delete payData.payment_modules;

        let query = Object.entries(payData).map(e => e.join('=')).join('&');
        if (type == 'payvery') {
            window.open(`${process.env.NOTI_URL}/v2/pay/auth?${query}`);
        } else if (type == 'weroute') {
            //window.open(`https://api.routeup.kr/v2/pay/auth?${query}`);
            window.open(`https://api.weroutefincorp.com/v2/pay/auth?${query}`);
        }
        //console.log(products_);
        //console.log(payData_)
        //console.log(payData)
        //console.log(query)

    } catch (err) {
        console.log(err);
        return false;
    }
}
export const onPayProductsByVirtualAccount = async (products_, payData_) => { // 무통장입금
    if (isDemoHost()) {
        toast.error(번역('데모 미리보기에서는 결제할 수 없습니다.'));
        return false;
    }
    let products = products_;
    let pay_data = payData_;
    let payData = await makePayData(products, pay_data);
    let ord_num = makeOrdNum()
    payData.yymm = payData?.yymm?.split('/');
    payData = {
        ...payData,
        ord_num: ord_num,
        pay_key: payData?.payment_modules?.pay_key,
        mid: payData?.payment_modules?.mid,
        tid: payData?.payment_modules?.tid,
        card_num: payData?.card_num.replaceAll(' ', ''),
        yymm: payData?.yymm[1] + payData?.yymm[0],
    }
    if (payData?.products?.length > 1 || !payData?.item_name) {
        payData.item_name = payData?.products?.length > 1 ? `${payData?.products[0]?.order_name} 외 ${payData?.products?.length - 1}건` : (payData?.products[0]?.order_name || '상품');
    }
    try {
        const { data: response } = await axios.post(`https://api.cashes.co.kr/api/v1/viss/request`, {
            compUuid: 'HSTUWO',
            custNm: payData.buyer_name,
            custTermDttm: returnMoment().replaceAll('-', '').replaceAll(':', '').replaceAll(' ', ''),
            custBankCode: payData.bank_code,
            custBankAcct: payData.acct_num,
            custBirth: payData.auth_num,
            custPhoneNo: payData.buyer_phone,
            orderId: payData.ord_num,
            orderItemNm: payData.item_name,
            amount: payData.amount,
            realCompId: `BR23117252`,
        })

        let insert_pay_ready = await apiManager('pays/virtual', 'create', {
            ...payData,
            virtual_bank_code: response?.response?.bankCode,
            virtual_acct_num: response?.response?.bankAcctNo,
            virtual_acct_issued_seq: response?.response?.acctIssuedSeq,
            bank_code: payData?.bank_code,
            acct_num: payData?.acct_num,
        });
        if (insert_pay_ready?.id > 0) {
            if (response?.code == '0000') {
                toast.success(번역('성공적으로 발급 되었습니다.'));
                return {
                    ...payData,
                    trans_id: insert_pay_ready?.id,
                    virtual_account_info: {
                        virtual_bank_code: response?.response?.bankCode,
                        virtual_acct_num: response?.response?.bankAcctNo,
                        virtual_acct_issued_seq: response?.response?.acctIssuedSeq,
                    }
                };
            } else {
                toast.error(response?.message);
                return false;
            }
        } else {
            return false;
        }

    } catch (err) {
        console.log(err);
        return false;
    }
}
export const onPayProductsByPayletter = async (products_, payData_) => { // 카드결제(페이레터-테스트)
    if (isDemoHost()) {
        toast.error(번역('데모 미리보기에서는 결제할 수 없습니다.'));
        return false;
    }
    let products = products_;
    let payData = await makePayData(products, payData_);
    let ord_num = makeOrdNum('PL');
    if (payData?.products?.length > 1 || !payData?.item_name) {
        payData.item_name = payData?.products?.length > 1 ? `${payData?.products[0]?.order_name} 외 ${payData?.products?.length - 1}건` : (payData?.products[0]?.order_name || '상품');
    }
    payData = {
        ...payData,
        ord_num,
        front_url: window.location.origin, // 결제완료 후 리다이렉트할 프론트 주소
    };
    delete payData.payment_modules;
    try {
        let res = await apiManager('pays/card_payletter', 'create', payData);
        if (res?.id > 0 && (res?.online_url || res?.mobile_url)) {
            const isMobile = /iPhone|Android|iPad|iPod|Mobile/i.test(navigator.userAgent);
            const payUrl = (isMobile && res?.mobile_url) ? res.mobile_url : (res.online_url || res.mobile_url);
            window.location.href = payUrl; // 페이레터 결제창으로 이동
            return { ...payData, trans_id: res.id };
        }
        return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}
export const onPayProductsByForspay = async (products_, payData_) => { // 인증결제(포스페이)
    if (isDemoHost()) {
        toast.error(번역('데모 미리보기에서는 결제할 수 없습니다.'));
        return false;
    }
    let products = products_;
    let payData = await makePayData(products, payData_);
    // 구매자가 고른 결제수단 키(card/bank/kakaopay/…). 선택 옵션에 실려 옴. 기본은 신용카드.
    const pay_method = payData_?.payment_modules?.pay_method || 'card';
    let ord_num = makeOrdNum('FS');
    if (payData?.products?.length > 1 || !payData?.item_name) {
        payData.item_name = payData?.products?.length > 1 ? `${payData?.products[0]?.order_name} 외 ${payData?.products?.length - 1}건` : (payData?.products[0]?.order_name || '상품');
    }
    const isMobile = /iPhone|Android|iPad|iPod|Mobile/i.test(navigator.userAgent);
    payData = {
        ...payData,
        ord_num,
        pay_method,
        front_url: window.location.origin, // 결제완료 후 리다이렉트할 프론트 주소
        user_agent: isMobile ? 'MW' : 'WP',
    };
    delete payData.payment_modules;
    try {
        let res = await apiManager('pays/auth_forspay', 'create', payData);
        if (res?.id > 0 && res?.launch_page_url) {
            window.location.href = res.launch_page_url; // 포스페이 PG 결제창으로 이동
            return { ...payData, trans_id: res.id };
        }
        return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}



// 바로구매: 단일 상품을 주문서 페이지로 전달(팝업 대신 페이지 이동). sessionStorage로 넘기고 ?buynow=1.
// 판매 가능한 상품인지 확인하고, 아니면 이유를 알려준다.
//
// 쇼핑몰형 프레임(1·2·3)은 상세화면에서 버튼을 disabled 처리하지만
// 블로그형 상세(views/blog/product/id/demo-1~9)에는 상태를 보는 코드가 아예 없었다.
// 그래서 프레임4~11 고객은 품절·판매중단 상품을 장바구니에 담고 주문서까지 진행한 뒤
// 결제 직전 백엔드(pay.controller 의 구매가능 하드블록)에서야 거절당했다.
//
// 버튼마다 고치는 대신 장바구니·바로구매의 공용 진입점에서 막는다 —
// 어느 프레임이든, 어느 화면에서 부르든 같은 규칙이 걸린다.
// 주의: status 가 없으면 막지 않는다(fail-open).
//   getProductStatus 는 모르는 값에 {} 를 돌려주고 isPurchasable 은 그걸 false 로 본다.
//   그래서 status 를 안 실어 보내는 화면이 하나라도 있으면 멀쩡한 상품의
//   장바구니 담기가 통째로 막힌다. 최종 차단은 어차피 백엔드가 하므로
//   여기서는 '상태를 아는 경우에만' 미리 알려주는 역할로 제한한다.
const assertPurchasable = (product) => {
    const status = product?.status;
    if (status === undefined || status === null || status === '') return true;
    if (isPurchasable(status)) return true;
    const label = getProductStatus(status)?.text || '판매하지 않는';
    // 상태 이름(품절·판매중지 등)도 사전을 거친다 — 안 그러면 문장만 번역되고 이름만 한국어로 남는다.
    toast.error(번역('{{status}} 상품입니다.', { status: 번역(label) }));
    return false;
};

// 고른 옵션 묶음이 같은 그룹인지 판정한다.
//
// 상품에는 성격이 다른 두 가지가 붙는다:
//   옵션그룹(product_option_groups) — { id, group_name, options:[{id, option_name, option_price}] }
//   특성(characters)                — { character_name, character_value } — **id 가 없다**
// 예전엔 `_.findIndex(groups, { id: parseInt(group?.id) })` 하나로만 찾았다.
// 특성은 id 가 undefined 라 parseInt 가 NaN 이 되고, 저장된 쪽에는 id 키 자체가 없어
// 매칭이 늘 실패했다 → 같은 특성을 고를 때마다 새 항목이 쌓였다.
// 그 결과 '색상' 하나짜리 상품인데 selectProductGroups.groups 가 2·3개로 불어나
// 주문 옵션이 중복 표기되고, 장바구니 시그니처도 매번 달라져 같은 줄로 합쳐지지 않았다.
const isSameOptionGroup = (saved, group) => {
    const gid = Number(group?.id);
    if (Number.isFinite(gid) && gid > 0) return Number(saved?.id) === gid;
    const name = group?.character_name ?? group?.group_name;
    if (!name) return false;
    return (saved?.character_name ?? saved?.group_name) === name;
};

// 옵션그룹이 있는 상품은 그룹마다 하나 이상 골라야 한다.
//
// 예전엔 이 검사가 없어서 옵션을 하나도 안 고른 채 장바구니에 담거나 바로구매로 넘어갈 수 있었다.
// 그러면 주문서 '옵션' 칸이 비고, 옵션 추가금액도 안 붙고, 가맹점은 무엇을 보내야 할지 모른다.
// (상품상세에 `//옵션 체크 안해도 저장 되는데 이 부분은 수정할 여지가 있어보임` 주석이
//  프레임1 진입부에 남아 있었다 — 그 자리가 여기다)
//
// assertPurchasable 과 같은 방침으로 **모르면 통과**시킨다.
// 상품 카드처럼 groups 를 싣지 않는 경로에서 담기가 통째로 막히면 안 된다.
// 최종 차단은 어차피 서버가 한다.
//
// ⚠ 여기서 요구하는 것은 `product.groups`(옵션그룹)뿐이다. 특성(characters)은 넣지 않는다.
//   프레임1 상세(ProductDetailsSummary)가 특성을 화면에 안 그리기 때문에, 특성까지 필수로 보면
//   고를 방법이 없는 화면에서 담기·바로구매가 영구히 막힌다.
//   반대로 옵션그룹은 **모든 프레임 상세가 그리도록** 맞춰 두었다(프레임2·3 은 이 검사를 넣은 뒤에야
//   옵션그룹 UI 가 없다는 사실이 드러나서 함께 추가했다). 새 프레임을 만들 때도 같은 전제를 지켜야 한다.
// ⚠ 추가상품(group_type=1)은 **필수가 아니다**. 이것이 이번 개편의 핵심이다.
//   예전엔 모든 그룹이 필수였다. 그래서 '한복 +10,000 / 스냅 +300,000' 을 각각
//   선택지 1개짜리 그룹으로 만든 가맹점의 상품은 355,000원을 붙여야만 살 수 있었다.
const assertOptionsSelected = (product, selectProductGroups) => {
    const required = requiredGroups(product);
    // 목록 카드는 옵션을 안 싣고 담기를 부른다(선택 정보도 없다).
    // 그때 required 가 비어 있다고 통과시키면 옵션 없는 주문이 그대로 접수된다 —
    // 그래서 목록 응답에 '골라야 할 옵션이 몇 개인지'(required_option_count)만 실어 두고
    // 여기서 본다. 개수가 있으면 고를 화면으로 보내야 한다.
    if (required.length == 0 && Number(product?.required_option_count) > 0) {
        toast.error(번역('옵션을 선택해 주세요.'));
        return false;
    }
    if (required.length == 0) return true;
    const picked = Array.isArray(selectProductGroups?.groups) ? selectProductGroups.groups : [];
    const allPicked = required.every((g) => picked.some(
        (p) => isSameOptionGroup(p, g) && (p?.options?.length ?? 0) > 0
    ));
    if (!allPicked) {
        toast.error(번역('옵션을 선택해 주세요.'));
        return false;
    }
    // 조합형은 '고른 조합이 실제로 파는 조합인지'까지 봐야 한다.
    // 등록 안 된 조합(예: 분홍/XL 은 안 만듦)을 통과시키면 추가금 0원으로 결제된다.
    if (isComboMode(product) && (product?.combinations?.length ?? 0) > 0) {
        if (!findCombination(product, selectProductGroups)) {
            toast.error(번역('선택하신 조합은 판매하지 않습니다.'));
            return false;
        }
    }
    return true;
};

// 한정판(1인당 구매수 제한)이 걸린 상품은 **회원만** 살 수 있다.
//
// 비회원은 같은 사람인지 확인할 방법이 없어서, 제한을 걸어도 지켜지지 않는다.
// 여기서는 '로그인했는가'만 본다 — 몇 개까지 샀는지는 서버만 알 수 있다(checkPurchaseLimit).
// 담기 단계에서 알려주지 않으면, 담아 놓고 결제 직전에야 못 산다는 걸 알게 된다.
const assertMemberOnly = (product) => {
    if (!(Number(product?.purchase_limit) > 0)) return true; // 한정 상품이 아니다
    const 로그인 = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');
    if (!로그인) {
        toast.error(번역('회원만 구매할 수 있는 한정 상품입니다. 로그인 후 이용해 주세요.'));
        return false;
    }
    return true;
};

// 재고 안에 드는지. 화면이 이미 막고 있지만, 장바구니에 담아 둔 사이 재고가 줄 수 있다.
// 최종 차단은 서버(checkStock)가 하고 여기서는 먼저 알려준다.
const assertStock = (product, selectProductGroups) => {
    const 한도 = maxOrderable(product, selectProductGroups);
    if (한도 === null) return true; // 무제한
    const 수량 = Math.max(1, parseInt(selectProductGroups?.count) || 1);
    if (한도 <= 0) { toast.error(번역('품절된 상품입니다.')); return false; }
    if (수량 > 한도) { toast.error(번역('재고가 {{n}}개 남았습니다.', { n: 한도 })); return false; }
    return true;
};

// 주문 추가 입력항목(행사일·행사장소 등)의 필수 검사.
//
// 옵션 검사와 같은 관문에 둔다 — 담기·바로구매 양쪽이 이미 여기를 지나므로,
// 한 쪽만 검사하는 실수가 생기지 않는다.
// 무엇이 빠졌는지 이름으로 알려줘야 한다. '필수 항목을 입력하세요'만 뜨면
// 항목이 여럿일 때 어디를 채워야 하는지 알 수 없다.
const assertOrderFormFilled = (product) => {
    const fields = getOrderFormFields(product);
    if (!fields.length) return true; // 입력항목이 안 걸린 상품 — 대부분이 여기다
    const missing = findMissingRequired(fields, product?.order_form_values);
    if (missing) {
        toast.error(번역('{{name}} 항목을 입력해 주세요.', { name: missing.label }));
        return false;
    }
    return true;
};

// ⚠ 추가 입력값은 **상품 객체에 실어** 넘긴다(product.order_form_values).
//   인자를 하나 더 두면 담기·바로구매·구매 다이얼로그 등 부르는 자리마다 고쳐야 하고,
//   한 곳만 빠뜨리면 그 경로에서만 값이 조용히 사라진다.
//   상품에 붙여 두면 DialogBuyNow 처럼 product 를 그대로 넘기는 곳도 저절로 따라온다.
export const startBuyNow = (product, selectProductGroups, router) => {
    try {
        if (!assertPurchasable(product)) return false;
        if (!assertMemberOnly(product)) return false;
        if (!assertOptionsSelected(product, selectProductGroups)) return false;
        if (!assertStock(product, selectProductGroups)) return false;
        if (!assertOrderFormFilled(product)) return false;
        const item = {
            ...product,
            groups: selectProductGroups?.groups ?? [],
            order_count: selectProductGroups?.count ?? 1,
            // 값은 이 줄에 붙어 주문서를 거쳐 백엔드까지 그대로 간다.
            order_form_values: product?.order_form_values ?? {},
        };
        sessionStorage.setItem('buyNowItem', JSON.stringify(item));
        router.push('/shop/auth/order?buynow=1');
    } catch (e) {
        console.log(e);
    }
};

export const getCartDataUtil = async (themeCartData) => {//장바구니 페이지에서 상품 불러오기
    let data = themeCartData ?? [];
    return data;
}
// 장바구니 한 줄을 식별하는 시그니처 — 상품 + 셀러 + 고른 옵션 조합.
// 같은 상품이라도 옵션이 다르면 다른 줄이어야 하고, 옵션까지 같으면 같은 줄이다.
// 옵션 순서가 달라도 같은 조합으로 보도록 정렬한다.
export const cartLineSignature = (line) => {
    const groups = Array.isArray(line?.groups) ? line.groups : [];
    const picked = groups
        // 특성(characters)은 id 가 없다 — 이름으로 대체해야 서로 다른 특성이 구분된다.
        .map((g) => `${g?.id ?? g?.character_name ?? g?.group_name ?? ''}:${(g?.options ?? []).map((o) => o?.id ?? o?.value ?? o?.option_name ?? '').sort().join('|')}`)
        .sort()
        .join(';');
    // ⚠ 추가 입력값도 시그니처에 넣는다.
    //   안 넣으면 '같은 한복을 9월 1일과 9월 8일에 각각' 담았을 때 한 줄로 합쳐지고
    //   날짜 하나가 조용히 사라진다(수량만 2가 된다).
    return `${line?.id ?? 0}/${line?.seller_id ?? 0}/${picked}/${orderFormSignature(line?.order_form_values)}`;
};

// 입력값을 순서에 무관하게 문자열 하나로. 값이 없으면 빈 문자열이라 기존 줄과 그대로 맞는다.
const orderFormSignature = (values) => {
    if (!values || typeof values !== 'object') return '';
    return Object.keys(values)
        .filter((k) => {
            const v = values[k];
            return !(v === undefined || v === null || v === false || String(v).trim() === '');
        })
        .sort()
        .map((k) => `${k}=${Array.isArray(values[k]) ? [...values[k]].sort().join('|') : values[k]}`)
        .join('&');
};

export const insertCartDataUtil = (
    product_,
    selectProductGroups_ = {
        count: 1,
        groups: [],
    },
    themeCartData,
    onChangeCartData
) => { //장바구니 버튼 클릭해서 넣기
    try {
        if (!assertPurchasable(product_)) return false;
        if (!assertMemberOnly(product_)) return false;
        if (!assertOptionsSelected(product_, selectProductGroups_)) return false;
        if (!assertStock(product_, selectProductGroups_)) return false;
        // 값은 상품 객체에 실려 온다(startBuyNow 주석 참고).
        const orderFormValues = product_?.order_form_values;
        if (!assertOrderFormFilled(product_)) return false;
        let cart_data = [...themeCartData];
        let product = product_;
        let selectProductGroups = selectProductGroups_;
        const order_count = Math.max(1, parseInt(selectProductGroups?.count) || 1);
        const groups = selectProductGroups?.groups ?? [];

        // 같은 상품을 같은 옵션으로 또 담으면 새 줄을 만들지 않고 수량을 합친다.
        //
        // 예전엔 무조건 push 했다. 그래서
        //   · 장바구니에 똑같은 줄이 여러 개 쌓이고
        //   · 목록 key 가 row.id 라 React key 가 중복되며(수량 변경이 엉뚱한 줄에 먹는다)
        //   · 상품별 배송비를 쓰는 브랜드는 배송비가 줄 수마다 중복 계산됐다.
        const signature = cartLineSignature({ id: product?.id, seller_id: product?.seller_id, groups, order_form_values: orderFormValues });
        const found_idx = cart_data.findIndex((line) => cartLineSignature(line) === signature);
        if (found_idx >= 0) {
            const prev = cart_data[found_idx];
            cart_data[found_idx] = {
                ...prev,
                order_count: Math.max(1, (parseInt(prev?.order_count) || 1) + order_count),
            };
        } else {
            cart_data.push({
                ...product,
                order_count,
                groups,
                order_form_values: orderFormValues ?? {},
            });
        }
        onChangeCartData(cart_data);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
// 주문내역·관리자 주문서에서 옵션 하나를 사람이 읽는 문자열로 바꾼다.
//
// 이미 저장된 주문에는 아래 버그(selectItemOptionUtil 의 옛 분기)로 생긴 형태가 섞여 있다:
//   { value: { id, option_name, ... } }  객체를 통째로 감싼 것
//        → 그대로 렌더하면 React 가 'Objects are not valid as a React child' 로 죽어
//          주문내역 화면이 통째로 백지가 된다.
//   { 0:'블', 1:'랙' }                    문자열을 스프레드해서 글자로 흩어진 것
//        → 옵션명이 공백으로 보여 '무엇을 산 주문인지' 알 수 없다.
// 지난 주문은 되돌릴 수 없으므로 읽는 쪽에서 흡수하고, 가능한 건 원래 값으로 복원한다.
export const getOptionLabel = (option) => {
    if (option === null || option === undefined) return '';
    if (typeof option !== 'object') return String(option);
    if (option.option_name !== null && option.option_name !== undefined) return String(option.option_name);

    const v = option.value;
    if (v !== null && v !== undefined) {
        if (typeof v === 'object') return String(v.option_name ?? v.value ?? '');
        return String(v);
    }
    // {0:'블',1:'랙'} → '블랙' 으로 이어붙여 복원
    const keys = Object.keys(option);
    if (keys.length > 0 && keys.every(k => /^\d+$/.test(k))) {
        return keys.sort((a, b) => Number(a) - Number(b)).map(k => option[k]).join('');
    }
    return '';
};

// 선택한 옵션 하나를 저장 형태로 맞춘다.
//
// 옵션 값은 두 형태로 들어온다:
//   객체   { id, option_name, option_price, ... }  — 옵션그룹(product_option_groups)을 쓰는 상품
//   문자열 '블랙'                                   — 문자열 옵션만 쓰는 상품
//
// 예전에는 세 분기가 제각각이었다:
//   - {...option} : 문자열이면 {0:'블',1:'랙'} 으로 부서져 옵션명이 사라졌다(프레임2·3)
//   - {value: option} : 객체를 통째로 감싸 option_price 를 잃었다
//     → 추가금액이 0원으로 계산돼 실제보다 싸게 결제됐고(가맹점 손실),
//       주문내역 렌더가 객체를 그리려다 예외로 죽었다(프레임1)
// 한 곳에서 정규화해 세 분기의 shape 을 일치시킨다.
const normalizeSelectedOption = (option) =>
    (option !== null && typeof option === 'object') ? { ...option } : { value: option };

// 이미 담긴 옵션인지. 객체는 id 로, 문자열은 값으로 비교한다.
// (예전엔 _.findIndex(..., { id: parseInt(option?.id) }) 하나로만 봐서
//  문자열 옵션은 id 가 undefined → NaN 이라 중복 판정이 늘 실패했다)
const isSameSelectedOption = (saved, option) =>
    (option !== null && typeof option === 'object')
        ? saved?.id === option?.id
        : saved?.value === option;

export const selectItemOptionUtil = (group, option, selectProductGroups, is_option_multiple) => {//아이템 옵션 선택하기
    // 넘겨받은 객체를 변형하지 않고 새 객체를 만들어 돌려준다.
    //
    // 예전엔 인자를 그대로 고쳐서 되돌려줬다. 호출부 11곳이 전부
    // `setSelectProductGroups(결과)` 를 하는데 참조가 같으니 React 가 변화를 못 알아채고
    // 리렌더가 일어나지 않았다 — 옵션을 골라도 선택 표시가 안 바뀌고,
    // 화면이 선택 상태를 반영하지 못했다.
    const groups = [...(selectProductGroups?.groups ?? [])];
    // 특성(characters)은 id 가 없어서 id 매칭이 늘 실패했다 — isSameOptionGroup 참고.
    const find_group_idx = groups.findIndex((saved) => isSameOptionGroup(saved, group));

    // 여러 개 고를 수 있는지는 **그룹 자체가 알고 있다**(추가상품 = group_type 1).
    //
    // 예전엔 이 판단을 호출부가 넘겨주는 인자에만 맡겼다. ProductAddons 는 true 를 넘기는데
    // 화면 쪽 onSelectOption(group, option) 이 세 번째 인자를 받지 않는 프레임이 7개였다 —
    // 그 프레임에서는 추가상품을 **누를 수만 있고 뺄 수가 없었다**. 잘못 고른 추가금을
    // 지우려면 새로고침하는 수밖에 없었고, 손님은 그걸 알 방법이 없다.
    // 화면 11개가 저마다 인자를 옳게 넘기길 기대하는 대신 여기서 그룹을 보고 정한다.
    // (인자를 넘기면 그것도 존중한다 — 선택옵션은 ProductOptions 가 false 로 부른다)
    const 여러개고를수있다 = is_option_multiple || isAddon(group);

    if (find_group_idx >= 0) {
        const current = groups[find_group_idx];
        let options = [...(current?.options ?? [])];
        if (여러개고를수있다) {
            // 추가상품은 다시 누르면 빠진다.
            // 예전엔 넣기만 하고 빼는 길이 없어서, 잘못 고른 추가금을 지우려면
            // 페이지를 새로고침하는 수밖에 없었다.
            const idx = options.findIndex(saved => isSameSelectedOption(saved, option));
            if (idx >= 0) options.splice(idx, 1);
            else options.push(normalizeSelectedOption(option));
        } else {
            options = [normalizeSelectedOption(option)];
        }
        // 다 뺐으면 그룹 자체를 지운다 — 빈 그룹이 남으면 '고른 것'으로 세어져
        // 필수 검사와 장바구니 시그니처가 어긋난다.
        if (!options.length) groups.splice(find_group_idx, 1);
        else groups[find_group_idx] = { ...current, options };
    } else {
        groups.push({
            ...group,
            options: [normalizeSelectedOption(option)]
        });
    }
    return { ...selectProductGroups, groups };
}
export const getWishDataUtil = async () => {//아이템찜 불러오기
    let result = await apiManager('user-wishs/items', 'list');
    return result;
}
export const insertWishDataUtil = async (item, themeWishData, onChangeWishData) => {//아이템 찜 클릭하기
    try {
        let wish_data = [...themeWishData];
        let find_index = _.findIndex(wish_data, { product_id: parseInt(item?.id) });
        let is_add = true;
        if (find_index >= 0) {
            let result = await apiManager('user-wishs', 'delete', {
                id: wish_data[find_index]?.id,
            })
            //console.log(result)
            window.location.reload()
            wish_data.splice(find_index, 1);
            is_add = false;
        } else {
            let result = await apiManager('user-wishs', 'create', {
                product_id: item?.id,
            })
        }
        let wish_result = await apiManager('user-wishs', 'list');
        wish_result = wish_result?.content ?? 0;
        onChangeWishData(wish_result);
        return {
            is_add
        };
    } catch (err) {
        console.log(err);
        return false;
    }
}