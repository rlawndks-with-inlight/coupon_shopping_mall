import { useEffect } from "react";
import { useSettingsContext } from "src/components/settings"
import { getProductsByUser } from "./api-shop";
import { toast } from "react-hot-toast";
import _ from "lodash";
import { axiosIns } from "./axios";
import { post } from "./api-manager";

export const calculatorPrice = (item) => {// 상품별로 가격
    if (!item) {
        return 0;
    }
    let { product_sale_price, product_price, groups, order_count } = item;

    let product_option_price = 0;

    for (var i = 0; i < groups.length; i++) {
        for (var j = 0; j < groups[i]?.options.length; j++) {
            product_option_price += groups[i]?.options[j]?.option_price ?? 0;
        }
    }
    return {
        subtotal: (product_price + product_option_price) * order_count,//할인가적용된가격
        total: (product_sale_price + product_option_price) * order_count,//총액
        discount: (product_price - product_sale_price) * order_count//할인가
    }
}
export const makePayData = async (products_, payData_) => {
    let products = products_;
    let total_amount = 0;
    let payData = { ...payData_ };
    
    for (var i = 0; i < products.length; i++) {
        products[i].order_name = products[i]?.product_name;
        let groups = products[i].groups;
        for (var j = 0; j < groups.length; j++) {
            let options = groups[j]?.options;
            for (var k = 0; k < options.length; k++) {
                products[i].order_name += ' ' + options[k]?.option_name
            }
        }
        products[i].order_amount = await calculatorPrice(products[i])?.total;
        total_amount += products[i].order_amount;
    }
    payData = {
        ...payData,
        total_amount: total_amount,
        products: products,
    }
    return payData;
}
export const onPayProductsByHand = async (products_, payData_) => { // 수기결제
    let payData = makePayData(products_, payData_);

    let ord_num = `${payData?.user_id || payData?.password}${new Date().getTime().toString().substring(0, 11)}`
    payData = {
        ...payData,
        ord_num: ord_num,
    }
    try {
        let response = await axiosIns().post(`/api/v1/shop/pay/hand`, payData);
        return response;
    } catch (err) {
        console.log(err);
        return false;
    }
}
export const onPayProductsByAuth = async (products_, payData_) => { // 인증결제
    let products = products_;
    let pay_data = payData_;
    let payData = await makePayData(products, pay_data);
    let ord_num = `${payData?.user_id || payData?.password}${new Date().getTime().toString().substring(0, 11)}`
    let return_url = `${window.location.protocol}//${window.location.host}/shop/auth/pay-result`
    payData = {
        ...payData,
        ord_num: ord_num,
        success_url:return_url+'?type=0',
        fail_url:return_url+'?type=1',
    }
    try {
        let query = Object.entries(payData).map(e => e.join('=')).join('&');
        window.location.href = `${process.env.BACK_URL}/pay/auth?${query}`;

    } catch (err) {
        console.log(err);
        return false;
    }
}

export const getCartDataUtil = async (themeCartData) => {//장바구니 페이지에서 상품 불러오기
    let data = themeCartData ?? [];
    return data;
}
export const insertCartDataUtil = (product_, selectProductGroups_, themeCartData, onChangeCartData) => { //장바구니 버튼 클릭해서 넣기

    try {
        let cart_data = [...themeCartData];
        let product = product_;
        let selectProductGroups = selectProductGroups_;
        product.order_count = selectProductGroups?.count;
        selectProductGroups = selectProductGroups?.groups;
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
export const getWishDataUtil = async (themeWishData) => {//아이템찜 불러오기
    let wish_list = themeWishData
    return wish_list;
}
export const insertWishDataUtil = (item, themeWishData, onChangeWishData) => {//아이템 찜 클릭하기
    try {
        let wish_data = [...themeWishData];
        let find_index = _.findIndex(wish_data, { id: parseInt(item?.id) });
        if (find_index >= 0) {
            wish_data.splice(find_index, 1);
        } else {
            wish_data.push(item);
        }
        onChangeWishData(wish_data);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}