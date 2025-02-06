import _ from "lodash";
import { axiosIns } from "./axios";
import { apiManager } from "./api";
import axios from "axios";
import toast from "react-hot-toast";
import { returnMoment } from "./function";
import { getLocalStorage } from "./local-storage";

export const calculatorPrice = (item) => {// 상품별로 가격
    if (!item) {
        return 0;
    }
    let { product_sale_price, product_price, groups = [], order_count, delivery_fee } = item;
    let product_option_price = 0;

    for (var i = 0; i < groups.length; i++) {
        for (var j = 0; j < groups[i]?.options.length; j++) {
            product_option_price += groups[i]?.options[j]?.option_price ?? 0;
        }
    }

    return {
        subtotal: (product_price + product_option_price) * order_count + delivery_fee,//할인전가격
        total: (product_sale_price + product_option_price) * order_count + delivery_fee,//결과
        discount: (product_price - product_sale_price) * order_count//할인가
    }
}
export const makePayData = async (products_, payData_) => {
    let products = products_;
    let amount = 0;
    let payData = { ...payData_ };

    for (var i = 0; i < products.length; i++) {
        products[i].order_name = products[i]?.product_name;
        let groups = products[i].groups;
        for (var j = 0; j < groups.length; j++) {
            let options = groups[j]?.options;
            for (var k = 0; k < options.length; k++) {
                products[i].order_name += ' ' + options[k]?.option_name
                products[i].groups[j].options[k] = {
                    id: products[i].groups[j]?.options[k]?.id,
                    option_name: products[i].groups[j]?.options[k]?.option_name,
                    option_price: products[i].groups[j]?.options[k]?.option_price,
                }
            }
            products[i].groups[j] = {
                id: products[i].groups[j]?.id,
                options: products[i].groups[j]?.options,
            }
        }
        products[i].order_amount = await calculatorPrice(products[i])?.total;
        amount += products[i].order_amount;
        products[i] = {
            id: products[i]?.id,
            order_name: products[i]?.order_name,
            delivery_fee: products[i]?.delivery_fee ?? 0,
            order_amount: products[i]?.order_amount,
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
    let products = products_;
    let pay_data = payData_;
    let payData = await makePayData(products, pay_data);
    let ord_num = `${payData?.user_id || payData?.password}${new Date().getTime().toString().substring(0, 11)}`
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
        payData.item_name = `${payData?.products[0]?.order_name} 외 ${payData?.products?.length - 1}`;
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
    let products = products_;
    let pay_data = payData_;
    let payData = await makePayData(products, pay_data);
    let ord_num = `${payData?.user_id || payData?.password}${new Date().getTime().toString().substring(0, 11)}`
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
        payData.item_name = `${payData?.products[0]?.order_name} 외 ${payData?.products?.length - 1}`;
    }
    try {

        let insert_pay_ready = await apiManager('pays/auth', 'create', payData)
        payData.temp = insert_pay_ready?.id

        delete payData.products;
        delete payData.payment_modules;

        let query = Object.entries(payData).map(e => e.join('=')).join('&');
        if (type == 'payvery') {
            window.open(`${process.env.NOTI_URL}/v2/pay/auth?${query}`);
        } else if (type == 'weroute') {
            window.open(`https://api.weroutefincorp.com/v2/pay/auth?${query}`);
        }
        //console.log(products_);
        //console.log(payData_)
        console.log(payData)
        //console.log(query)

    } catch (err) {
        console.log(err);
        return false;
    }
}
export const onPayProductsByHand_Fintree = async (products_, payData_) => { // 핀트리 수기결제
    let products = products_;
    let pay_data = payData_;
    let payData = await makePayData(products, pay_data);
    let ord_num = `${payData?.user_id || payData?.password}${new Date().getTime().toString().substring(0, 11)}`
    let return_url = `${window.location.protocol}//${window.location.host}/shop/auth/pay-result`

    const now = new Date();
    const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, "");
    const hhmmss = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const time = yyyymmdd + hhmmss;

    payData = {
        ...payData,
        payMethod: 'card',
        mid: payData?.payment_modules?.mid,
        trxCd: '0',
        goodsNm: 'item_name',
        ordNo: ord_num,
        goodsAmt: payData?.amount,
        ordNm: payData?.buyer_name,
        ordTel: payData?.buyer_phone,
        return_url: return_url,
        //success_url: return_url + '?result_cd=0000',
        //fail_url: return_url + '?result_cd=9999',
        ediDate: time,

        //pay_key: payData?.payment_modules?.pay_key,
    }
    if (payData?.products?.length > 1 || !payData?.item_name) {
        payData.item_name = `${payData?.products[0]?.order_name} 외 ${payData?.products?.length - 1}`;
    }
    try {

        let insert_pay_ready = await apiManager('pays/auth', 'create', payData)
        payData.temp = insert_pay_ready?.id

        delete payData.products;
        delete payData.payment_modules;
        delete payData.amount;
        delete payData.buyer_phone;


        //let query = Object.entries(payData).map(e => e.join('=')).join('&');
        window.location.href = (`https://api.fintree.kr/payInit_hash.do`);

    } catch (err) {
        console.log(err);
        return false;
    }
}
export const onPayProductsByAuth_Fintree = async (products_, payData_) => { // 핀트리 인증결제
    let products = products_;
    let pay_data = payData_;
    let payData = await makePayData(products, pay_data);
    let ord_num = `${payData?.user_id || payData?.password}${new Date().getTime().toString().substring(0, 11)}`
    let return_url = `${window.location.protocol}//${window.location.host}/shop/auth/pay-result`

    const now = new Date();
    const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, "");
    const hhmmss = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const time = yyyymmdd + hhmmss;

    const handleSubmit = async (data) => {
        try {
            const response = await axios.post(
                "https://api.fintree.kr/payInit_hash.do",
                new URLSearchParams(data), // 데이터 변환
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                    },
                }
            );

            // 결과 처리
            if (response.status === 200) {
                alert("결제가 성공적으로 처리되었습니다!");
                console.log("결제 응답:", response.data);
            } else {
                alert("결제 요청 실패! 상태 코드: " + response.status);
            }
        } catch (error) {
            console.error("결제 요청 중 오류 발생:", error);
            alert("결제 요청 중 오류가 발생했습니다.");
        }
    };

    payData = {
        ...payData,
        payMethod: 'card',
        mid: payData?.payment_modules?.mid,
        trxCd: '0',
        goodsNm: 'item_name',
        ordNo: ord_num,
        goodsAmt: payData?.amount,
        ordNm: payData?.buyer_name,
        ordTel: payData?.buyer_phone,
        return_url: return_url,
        //success_url: return_url + '?result_cd=0000',
        //fail_url: return_url + '?result_cd=9999',
        ediDate: time,

        //pay_key: payData?.payment_modules?.pay_key,
    }
    if (payData?.products?.length > 1 || !payData?.item_name) {
        payData.item_name = `${payData?.products[0]?.order_name} 외 ${payData?.products?.length - 1}`;
    }
    try {

        let insert_pay_ready = await apiManager('pays/auth', 'create', payData)
        payData.temp = insert_pay_ready?.id

        delete payData.products;
        delete payData.payment_modules;
        delete payData.amount;
        delete payData.buyer_phone;

        console.log(payData)

        handleSubmit()
        //let query = Object.entries(payData).map(e => e.join('=')).join('&');
        //window.location.href = (`https://api.fintree.kr/payInit_hash.do`);

    } catch (err) {
        console.log(err);
        return false;
    }
}
export const onPayProductsByVirtualAccount = async (products_, payData_) => { // 무통장입금
    let products = products_;
    let pay_data = payData_;
    let payData = await makePayData(products, pay_data);
    let ord_num = `${payData?.user_id || payData?.password}${new Date().getTime().toString().substring(0, 11)}`
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
        payData.item_name = `${payData?.products[0]?.order_name} 외 ${payData?.products?.length - 1}`;
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
                toast.success('성공적으로 발급 되었습니다.');
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
export const onPayProductsByHand_Hecto = async (products_, payData_) => { // 수기결제(헥토)
    let products = products_;
    let pay_data = payData_;
    let payData = await makePayData(products, pay_data);
    let ord_num = `${payData?.user_id || payData?.password}${new Date().getTime().toString().substring(0, 11)}`
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
        payData.item_name = `${payData?.products[0]?.order_name} 외 ${payData?.products?.length - 1}`;
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
export const onPayProductsByPhone_Hecto = async (products_, payData_) => { // 휴대폰결제(헥토)
    let products = products_;
    let pay_data = payData_;
    let payData = await makePayData(products, pay_data);
    let ord_num = `${payData?.user_id || payData?.password}${new Date().getTime().toString().substring(0, 11)}`
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
        payData.item_name = `${payData?.products[0]?.order_name} 외 ${payData?.products?.length - 1}`;
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



export const getCartDataUtil = async (themeCartData) => {//장바구니 페이지에서 상품 불러오기
    let data = themeCartData ?? [];
    return data;
}
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
        let cart_data = [...themeCartData];
        let product = product_;
        let selectProductGroups = selectProductGroups_;
        product.order_count = selectProductGroups?.count ?? 1;
        selectProductGroups = selectProductGroups?.groups ?? [];
        cart_data.push({
            ...product,
            groups: selectProductGroups,
        })
        onChangeCartData(cart_data);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
export const selectItemOptionUtil = (group, option, selectProductGroups, is_option_multiple) => {//아이템 옵션 선택하기
    let select_product_groups = selectProductGroups;
    let find_group_idx = _.findIndex(select_product_groups?.groups, { id: parseInt(group?.id) });
    if (find_group_idx >= 0) {
        let find_option_idx = _.findIndex(select_product_groups?.groups[find_group_idx]?.options, { id: parseInt(option?.id) });

        if (is_option_multiple) {
            if (find_option_idx >= 0) {
                //
            } else {
                select_product_groups.groups[find_group_idx]?.options.push({
                    ...option
                })
            }
        } else {
            select_product_groups.groups[find_group_idx].options = [{
                ...option
            }]
        }
    } else {
        select_product_groups.groups.push({
            ...group,
            options: [
                {
                    ...option,
                }
            ]
        })
    }
    return select_product_groups;
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